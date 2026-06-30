# Story 5.3: Notification GPS Validation Terrain

Status: ready-for-dev

## Story

As a user,
I want to receive a notification when I arrive near a peak I recently checked,
so that I can easily confirm whether the forecast was accurate, without having to remember to do it manually.

## Contexte & Motivation

Cette story ferme la boucle du **data flywheel** de Cloudbreak au niveau le plus frictionless possible : au lieu d'espérer que l'utilisateur pense à valider une prévision, l'app lui rappelle au moment exact où il est au sommet.

Le flux complet :
```
Utilisateur consulte un score pour un sommet (Epic 3)
  → peakId + timestamp sauvegardé localement (AsyncStorage)

App surveille la position GPS en avant-plan (expo-location)
  → Si distance(position_actuelle, sommet_consulté) ≤ 500m
    AND prévision consultée dans les dernières 24h
    AND préférence notif_terrain = true
  → Notification locale : "Tu es au [sommet] ! Mer de nuage visible ? 📸"

Utilisateur tape la notification
  → ValidationBottomSheet s'ouvre directement (story 6.1)
```

### Choix d'implémentation : avant-plan uniquement (pas de background location)

**iOS background location est exclu du MVP pour ces raisons :**
1. **Exigence App Store** : `NSLocationAlwaysAndWhenInUseUsageDescription` + justification explicite "Always On" → revue Apple plus longue, risque de rejet si la justification n'est pas convaincante
2. **UX** : la montagne est une activité consciente — l'utilisateur ouvre l'app naturellement avant / pendant une sortie. La vérification au premier plan lors de l'ouverture de l'app suffit pour le MVP
3. **Consommation batterie** : le background location draine la batterie, problème critique en montagne
4. **Permission** : `foregroundPermission` (story 2.3) est déjà accordée — pas de re-demande

**Stratégie foreground uniquement :**
- À chaque mise en avant-plan de l'app (`AppState change → active`), vérification ponctuelle de la position
- Si la condition de proximité est remplie → notification locale immédiate (pas besoin de push)
- L'utilisateur voit la notification même s'il est déjà dans l'app (banner)

**V2 — background geofencing (post-MVP) :**
- `expo-location` + `expo-task-manager` → `startGeofencingAsync` pour iOS background
- Requiert permission "Always" + justification détaillée App Store
- Envisageable quand la base utilisateurs est établie et la revue App Store maitrisée

**FRs couverts :** FR24 (notification GPS à l'arrivée), FR25 (via préférence `notif_terrain`)

## Dépendances

- **Story 5.1 ✅** — `expo-notifications` installé, permission notifications acquise
- **Story 2.3 ✅** — permission géolocalisation (`foregroundPermission`) acquise, état dans `AuthContext`
- **Story 2.2 ✅** — colonne `users.notif_terrain` en DB, préférence chargée dans `UserContext`
- **Story 3.4 ✅** — `useScore` sauvegarde le score en cache `AsyncStorage` (clé `cache:score:{peakId}:{date}`)
- **Story 6.1** — `ValidationBottomSheet` doit être implémentée pour le déclenchement depuis la notification. Si 6.1 n'est pas encore mergée : afficher un bottom sheet simplifié ("Mer de nuage visible au [sommet] ?") comme fallback

## Acceptance Criteria

1. **Given** l'utilisateur a consulté une prévision pour un sommet dans les dernières 24h
   **And** la permission géolocalisation est accordée (`foreground`)
   **And** la préférence `notif_terrain` est activée
   **When** l'utilisateur remet l'app en avant-plan (depuis l'arrière-plan ou le fond)
   **And** sa position GPS est à ≤ 500m du sommet consulté
   **Then** une notification locale s'affiche : "Tu es au [Nom du Sommet] ! Mer de nuage visible ? 📸"
   **And** la notification est déclenchée au maximum une fois par sommet par période de 6h (anti-spam)

2. **Given** l'utilisateur tape sur la notification
   **When** l'app s'ouvre ou passe au premier plan
   **Then** `ValidationBottomSheet` s'affiche directement avec le `predictionId` correspondant
   **And** les boutons "Oui ✅" et "Non ❌" sont visibles sans autre interaction

3. **Given** l'utilisateur a désactivé "Validation terrain" dans ses préférences (FR25)
   **When** il arrive à ≤ 500m d'un sommet consulté
   **Then** aucune notification n'est déclenchée

4. **Given** la géolocalisation non accordée (permission `denied` ou `undetermined`)
   **When** la vérification de proximité est tentée
   **Then** aucune notification GPS n'est déclenchée
   **And** aucune demande de permission intrusive n'est affichée
   **And** l'app ne crashe pas

5. **Given** l'utilisateur a consulté plusieurs sommets dans les dernières 24h
   **When** sa position est à ≤ 500m d'un de ces sommets
   **Then** la notification utilise le nom du sommet le plus proche

6. **Given** l'utilisateur est déjà à ≤ 500m du sommet mais n'a pas consulté de prévision dans les dernières 24h
   **When** l'app passe en avant-plan
   **Then** aucune notification n'est déclenchée (condition 24h non remplie)

7. **Given** la notification déclenchée
   **When** l'utilisateur la rejette (swipe) sans l'ouvrir
   **Then** la notification ne se répète pas avant 6h pour ce sommet

## Tasks / Subtasks

### Mobile — service géofencing foreground

- [ ] **Créer `mobile/src/services/geofencing.ts`** (AC: #1, #3, #4, #5, #6, #7)
  - [ ] `checkProximityAndNotify(currentPosition: {lat, lng}): Promise<void>`
    - Lire les prévisions consultées récemment depuis AsyncStorage (clé `consulted:peaks` — à créer)
    - Filtrer : uniquement les sommets consultés dans les dernières 24h
    - Pour chaque sommet éligible : calculer la distance GPS (formule Haversine)
    - Si distance ≤ 500m ET cooldown 6h non atteint → déclencher notification locale
    - Marquer le timestamp de déclenchement (`notif:gps:{peakId}` en AsyncStorage)
  - [ ] `haversineDistance(lat1, lng1, lat2, lng2): number` — retourne la distance en mètres
  - [ ] Écrire `mobile/src/services/geofencing.test.ts`

- [ ] **Créer `mobile/src/hooks/useGeofencing.ts`** (AC: #1, #3, #4)
  - [ ] S'abonner aux changements `AppState` (`AppState.addEventListener('change', handler)`)
  - [ ] Quand `nextAppState === 'active'` : vérifier permission géoloc + `notif_terrain` actif
  - [ ] Si les deux conditions sont remplies : appeler `Location.getCurrentPositionAsync` + `checkProximityAndNotify`
  - [ ] Hook sans valeur de retour (side-effect uniquement)
  - [ ] Écrire `mobile/src/hooks/useGeofencing.test.ts`

- [ ] **Mettre à jour `mobile/src/services/api/score.ts` ou `useScore`** (AC: #1, #6)
  - [ ] Après chaque appel API score réussi : sauvegarder dans AsyncStorage la clé `consulted:peaks`
  - [ ] Format : `{ peakId: string, peakName: string, peakLat: number, peakLng: number, predictionId: string, consultedAt: ISO8601 }[]`
  - [ ] Garder uniquement les 20 dernières entrées (ring buffer) pour éviter de saturer AsyncStorage
  - [ ] Les entrées > 24h sont ignorées lors de la vérification (pas supprimées immédiatement — TTL lazy)

- [ ] **Notification locale — configuration** (AC: #1, #2)
  - [ ] Créer `mobile/src/services/localNotifications.ts` :
    - `scheduleProximityNotification(peakName: string, predictionId: string): Promise<string>` — retourne l'identifiant de notification
    - Configurer le `data` payload : `{ type: 'terrain_validation', predictionId, peakName }`
    - Utiliser `expo-notifications` (déjà installé depuis story 5.1)
  - [ ] Configurer le listener `Notifications.addNotificationResponseReceivedListener` dans `app/_layout.tsx` :
    - Lire `data.type === 'terrain_validation'`
    - Extraire `predictionId` et `peakName` du payload
    - Afficher `ValidationBottomSheet` avec les bonnes props

- [ ] **Intégration dans `app/_layout.tsx`** (AC: #1, #2, #3, #4)
  - [ ] Appeler `useGeofencing()` après confirmation de la session (comme `usePushNotifications`)
  - [ ] Ajouter le listener de réponse aux notifications locales (tap → ouvrir ValidationBottomSheet)
  - [ ] État local dans le layout : `validationBottomSheetProps: { predictionId, peakName } | null`

- [ ] **i18n** (AC: #1)
  - [ ] Ajouter dans `mobile/src/locales/fr.ts` :
    - `geofencing.notification_title`: `"Tu es au {{peakName}} !"`
    - `geofencing.notification_body`: `"Mer de nuage visible ? 📸"`

### Backend — aucun changement requis

La notification GPS est 100% locale (côté mobile). Aucun endpoint backend n'est nécessaire pour cette story. La validation elle-même est gérée par `POST /api/v1/validations` (story 6.1).

### Documentation

- [ ] Créer `mobile/docs/story-5-3-notification-gps-validation-terrain.md` (ce qui a été fait, comment tester, ACs vérifiés)
- [ ] Mettre à jour `mobile/docs/product-audit.md` : section "Notifications" → validation terrain GPS fonctionnel
- [ ] Mettre à jour `CLAUDE.md` si le pattern `consulted:peaks` en AsyncStorage doit être documenté dans la structure de cache
- [ ] Mettre à jour `sprint-status.yaml` : story 5-3 → done

## Dev Notes

### Formule Haversine — distance GPS

```typescript
// mobile/src/services/geofencing.ts
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### Structure `consulted:peaks` en AsyncStorage

```typescript
// Type à définir dans mobile/src/services/mockData/types.ts ou geofencing.ts
export interface ConsultedPeak {
  peakId: string;
  peakName: string;
  peakLat: number;
  peakLng: number;
  predictionId: string;
  consultedAt: string; // ISO 8601 UTC
}

const CONSULTED_PEAKS_KEY = 'consulted:peaks';
const MAX_CONSULTED_PEAKS = 20;
const PROXIMITY_RADIUS_METERS = 500;
const NOTIFICATION_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6h
const CONSULTATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
```

### Hook `useGeofencing.ts` — structure

```typescript
import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { checkProximityAndNotify } from '@/services/geofencing';

export function useGeofencing(): void {
  const { locationPermission } = useAuth(); // 'granted' | 'denied' | 'undetermined'
  const { notifTerrain } = useUserPreferences();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const comingToForeground =
        appState.current.match(/inactive|background/) && nextAppState === 'active';

      appState.current = nextAppState;

      if (!comingToForeground) return;
      if (!notifTerrain) return;
      if (locationPermission !== 'granted') return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await checkProximityAndNotify({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (err) {
        if (__DEV__) console.debug('[useGeofencing] erreur position', String(err));
      }
    });

    return () => subscription.remove();
  }, [locationPermission, notifTerrain]);
}
```

### Service `geofencing.ts` — logique complète

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { haversineDistance, ConsultedPeak } from '@/services/geofencing';

const CONSULTED_PEAKS_KEY = 'consulted:peaks';
const NOTIF_COOLDOWN_PREFIX = 'notif:gps:';
const PROXIMITY_RADIUS_METERS = 500;
const NOTIFICATION_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const CONSULTATION_TTL_MS = 24 * 60 * 60 * 1000;

export async function checkProximityAndNotify(
  currentPosition: { lat: number; lng: number }
): Promise<void> {
  const raw = await AsyncStorage.getItem(CONSULTED_PEAKS_KEY);
  if (!raw) return;

  const peaks: ConsultedPeak[] = JSON.parse(raw);
  const now = Date.now();

  // Filtrer les peaks consultés dans les 24h
  const recentPeaks = peaks.filter(
    (p) => now - new Date(p.consultedAt).getTime() <= CONSULTATION_TTL_MS
  );

  if (recentPeaks.length === 0) return;

  // Trouver le plus proche
  let closestPeak: ConsultedPeak | null = null;
  let closestDistance = Infinity;

  for (const peak of recentPeaks) {
    const distance = haversineDistance(
      currentPosition.lat,
      currentPosition.lng,
      peak.peakLat,
      peak.peakLng
    );
    if (distance <= PROXIMITY_RADIUS_METERS && distance < closestDistance) {
      closestDistance = distance;
      closestPeak = peak;
    }
  }

  if (!closestPeak) return;

  // Vérifier cooldown
  const cooldownKey = `${NOTIF_COOLDOWN_PREFIX}${closestPeak.peakId}`;
  const lastNotifRaw = await AsyncStorage.getItem(cooldownKey);
  if (lastNotifRaw) {
    const lastNotif = parseInt(lastNotifRaw, 10);
    if (now - lastNotif < NOTIFICATION_COOLDOWN_MS) {
      if (__DEV__) console.debug('[geofencing] cooldown actif', closestPeak.peakName);
      return;
    }
  }

  // Déclencher la notification locale
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Tu es au ${closestPeak.peakName} !`,
      body: 'Mer de nuage visible ? 📸',
      data: {
        type: 'terrain_validation',
        predictionId: closestPeak.predictionId,
        peakName: closestPeak.peakName,
      },
    },
    trigger: null, // immédiat
  });

  // Enregistrer le timestamp du déclenchement (cooldown)
  await AsyncStorage.setItem(cooldownKey, String(now));

  if (__DEV__) console.debug('[geofencing] notification envoyée', closestPeak.peakName);
}
```

### Listener notification dans `app/_layout.tsx`

```typescript
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { ValidationBottomSheet } from '@/components/ValidationBottomSheet';
import { useGeofencing } from '@/hooks/useGeofencing';

// Dans le composant racine :
useGeofencing();

const [validationSheet, setValidationSheet] = useState<{
  predictionId: string;
  peakName: string;
} | null>(null);

useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'terrain_validation') {
      setValidationSheet({
        predictionId: data.predictionId as string,
        peakName: data.peakName as string,
      });
    }
  });
  return () => sub.remove();
}, []);

// Dans le JSX :
{validationSheet && (
  <ValidationBottomSheet
    predictionId={validationSheet.predictionId}
    peakName={validationSheet.peakName}
    isVisible={true}
    onClose={() => setValidationSheet(null)}
  />
)}
```

### Sauvegarde `consulted:peaks` dans `useScore`

Après chaque appel API score réussi (état `success`), ajouter dans `useScore.ts` :

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsultedPeak } from '@/services/geofencing';

// Dans useScore, après setState({ status: 'success', data }) :
async function saveConsultedPeak(peak: { id: string; name: string; lat: number; lng: number }, predictionId: string): Promise<void> {
  const key = 'consulted:peaks';
  const raw = await AsyncStorage.getItem(key);
  const existing: ConsultedPeak[] = raw ? JSON.parse(raw) : [];

  // Dédupliquer par peakId (garder le plus récent)
  const filtered = existing.filter((p) => p.peakId !== peak.id);

  const entry: ConsultedPeak = {
    peakId: peak.id,
    peakName: peak.name,
    peakLat: peak.lat,
    peakLng: peak.lng,
    predictionId,
    consultedAt: new Date().toISOString(),
  };

  // Ring buffer — max 20 entrées
  const updated = [entry, ...filtered].slice(0, 20);
  await AsyncStorage.setItem(key, JSON.stringify(updated));
}
```

**Note :** le `predictionId` est retourné par `GET /api/v1/score` — vérifier qu'il est bien inclus dans la réponse (story 3.1). Si absent, ajouter ce champ à la réponse backend avant d'implémenter cette story.

### Contrainte simulateur iOS

`Location.getCurrentPositionAsync` retourne une position simulée sur simulateur iOS (par défaut Apple Park, Cupertino). Pour tester la logique de proximité :
- Utiliser la feature "Location Simulation" dans Xcode → Device → Location → Custom Location
- Ou mocker `Location.getCurrentPositionAsync` dans les tests

### Tests — structure

**`mobile/src/services/geofencing.test.ts`** :
```typescript
import { haversineDistance, checkProximityAndNotify } from './geofencing';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('haversineDistance', () => {
  it('retourne 0 pour des coordonnées identiques', () => {
    expect(haversineDistance(45.9, 6.9, 45.9, 6.9)).toBe(0);
  });

  it('retourne ~484m entre deux points proches', () => {
    // Col de la Croix-Fry ≈ 45.921, 6.463
    // Point à ~400m au nord
    const dist = haversineDistance(45.921, 6.463, 45.925, 6.463);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(600);
  });

  it('retourne >500m pour un point hors rayon', () => {
    const dist = haversineDistance(45.921, 6.463, 45.930, 6.470);
    expect(dist).toBeGreaterThan(500);
  });
});

describe('checkProximityAndNotify', () => {
  beforeEach(() => AsyncStorage.clear());

  it('déclenche une notification quand dans le rayon', async () => {
    // Mock AsyncStorage avec un peak récent à 300m
    // Mock expo-notifications scheduleNotificationAsync
    // Vérifier que scheduleNotificationAsync a été appelé
  });

  it('ne déclenche pas si hors rayon (>500m)', async () => {
    // Peak à 600m → scheduleNotificationAsync NOT called
  });

  it('ne déclenche pas si consultedAt > 24h', async () => {
    // consultedAt = now - 25h → filtré
  });

  it('respecte le cooldown de 6h', async () => {
    // Premier appel → notif déclenchée
    // Second appel immédiat → cooldown → pas de notif
  });

  it('choisit le sommet le plus proche si plusieurs dans le rayon', async () => {
    // 2 peaks à 300m et 200m → notif pour le 200m
  });
});
```

**`mobile/src/hooks/useGeofencing.test.ts`** :
```typescript
import { renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useGeofencing } from './useGeofencing';

it('vérifie la position quand l\'app revient au premier plan', () => {
  // Mock AppState.addEventListener
  // Mock locationPermission = 'granted', notifTerrain = true
  // Simuler un changement 'active' → vérifier getCurrentPositionAsync appelé
});

it('ne vérifie pas si locationPermission !== granted', () => {
  // locationPermission = 'denied' → getCurrentPositionAsync NOT called
});

it('ne vérifie pas si notifTerrain = false', () => {
  // notifTerrain = false → getCurrentPositionAsync NOT called
});
```

### Project Structure — fichiers concernés

**Nouveaux fichiers :**
- `mobile/src/services/geofencing.ts` — logique Haversine, vérification proximité, déclenchement notif
- `mobile/src/services/geofencing.test.ts` — tests unitaires
- `mobile/src/hooks/useGeofencing.ts` — listener AppState + orchestration
- `mobile/src/hooks/useGeofencing.test.ts` — tests hook

**Fichiers modifiés :**
- `mobile/src/hooks/useScore.ts` — ajouter `saveConsultedPeak` après succès API
- `mobile/app/_layout.tsx` — intégrer `useGeofencing()` + listener notification response + ValidationBottomSheet conditionnel
- `mobile/src/locales/fr.ts` — ajouter clés `geofencing.*`

**Fichiers non touchés :**
- Backend : aucun changement (notification 100% locale)
- `expo-notifications` : déjà installé depuis story 5.1
- `expo-location` : déjà installé depuis story 2.3

### Critères de done

- [ ] `npm test && npx tsc --noEmit && npm run lint` passe côté mobile
- [ ] Test manuel simulateur — simuler une position proche d'un sommet consulté :
  1. Consulter un score pour "Col de la Croix-Fry" (peakLat: 45.9215, peakLng: 6.463)
  2. Mettre l'app en arrière-plan
  3. Dans Xcode → Device → Location → définir 45.9215, 6.4635 (à ~30m)
  4. Remettre l'app au premier plan → notification locale s'affiche
  5. Taper la notification → `ValidationBottomSheet` s'ouvre
- [ ] Test cooldown : répéter les étapes 2-4 → pas de 2e notification avant 6h
- [ ] Test désactivation : désactiver "Validation terrain" dans Profil → pas de notification
- [ ] Test permission refusée : révoquer géoloc → pas de notification, pas de crash

### Note sur la V2 — background geofencing

Si la demande utilisateur le justifie, la V2 pourrait implémenter le geofencing background via `expo-task-manager` + `Location.startGeofencingAsync`. Cela permettrait de déclencher la notification même quand l'app est fermée. Points d'attention V2 :
- Justification App Store obligatoire pour `NSLocationAlwaysAndWhenInUseUsageDescription`
- L'utilisateur doit accorder la permission "Toujours" (pas juste "En utilisant l'app")
- Expo Go ne supporte pas le background geofencing — nécessite un build natif EAS

## References

- [Source: epics.md#Story 5.3] — ACs complets
- [Source: epics.md#FR24] — "L'utilisateur reçoit une notification GPS à l'arrivée à proximité d'un sommet consulté"
- [Source: epics.md#FR25] — "L'utilisateur peut configurer ou désactiver chaque type de notification indépendamment"
- [Source: prd.md#FR24] — notification GPS validation terrain
- [Source: prd.md#Story Sophie] — "notif GPS : Tu étais au Col de la Croix-Fry — mer de nuage visible ? 📸"
- [Source: prd.md — Permissions] — "Localisation (when in use) | Validation terrain GPS au sommet | Non — refus sans blocage"
- [Source: 5-1-infrastructure-push-notifications-expo-push.md] — socle expo-notifications, note simulateur iOS
- [Source: 6-1-validation-terrain-confirmation-infirmation.md] — ValidationBottomSheet props, déclencheurs (GPS + manuel)
- [Source: CLAUDE.md#Modèle de données] — `users.notif_terrain`
- [Source: CLAUDE.md#Patterns de code] — `AsyncState<T>`, cache `AsyncStorage` préfixé
- [Source: MEMORY.md#Story 3.4] — cache offline `cache:score:{peak_id}:{date}`, `useScore`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
