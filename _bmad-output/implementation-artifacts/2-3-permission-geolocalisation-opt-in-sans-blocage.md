# Story 2.3: Permission Géolocalisation (Opt-in sans Blocage)

Status: ready-for-dev

## Story

As a user,
I want to grant or deny location permission without being blocked from using the app,
so that I control my privacy while still having access to core features.

## Contexte

Cette story implémente la gestion de la permission de géolocalisation sur mobile (iOS) via `expo-location`. La géolocalisation est **entièrement optionnelle** — l'app doit fonctionner normalement sans elle.

**Usages futurs de la géoloc (pas implémentés dans cette story) :**
- Epic 5 (Story 5.3) : notification GPS terrain — déclenchée quand l'utilisateur est à < 500m d'un sommet consulté
- Feature V2 : "sommets proches de ma position"

**Ce que cette story livre :**
- Hook `useLocation` qui encapsule `expo-location` et expose le statut de la permission
- Intégration dans `AuthContext` — le statut géoloc est mémorisé et accessible globalement
- Entrée dans l'écran Profil pour ouvrir les réglages iOS si permission refusée
- Demande de permission proposée lors de l'onboarding (Slide 3 — refus sans blocage)
- Aucun impact sur les fonctionnalités core (score, recherche, favoris)

**Dépendances :**
- `expo-location` : déjà disponible dans Expo SDK 55 — pas d'installation supplémentaire
- Cette story peut être implémentée indépendamment de la Story 5.3 (GPS terrain)
- La Story 7.1 (Onboarding) peut intégrer la demande de permission depuis cette story, ou le faire directement

**NFRs couverts :** NFR11 (consentement géolocalisation explicite, granulaire et révocable)
**FRs couverts :** FR15, FR34 (partie géoloc)

## Acceptance Criteria

1. **Given** l'app au premier lancement (ou si permission `LOCATION_FOREGROUND` jamais demandée)
   **When** l'utilisateur arrive sur l'écran de demande de géolocalisation (ex: slide onboarding ou section profil)
   **Then** un message explicite explique l'usage : "Pour confirmer ta présence au sommet et te notifier à l'arrivée"
   **And** deux options sont proposées : "Autoriser" et "Pas maintenant"

2. **Given** l'utilisateur appuie sur "Pas maintenant"
   **When** il est redirigé vers l'écran principal (ou reste sur l'écran profil)
   **Then** toutes les fonctionnalités core (score, recherche, favoris) sont accessibles sans restriction
   **And** aucun message d'erreur permanent ni bandeau de blocage n'est affiché

3. **Given** l'utilisateur a refusé la géolocalisation (ou l'app n'a pas encore demandé la permission)
   **When** il accède à la section Profil → Paramètres
   **Then** une entrée "Géolocalisation" est visible avec le statut actuel ("Activée" ou "Désactivée")
   **And** un tap sur cette entrée ouvre les réglages iOS (`Linking.openSettings()`) pour modifier la permission

4. **Given** iOS affiche la demande de permission système
   **When** l'utilisateur accorde l'accès "En utilisant l'app" (foreground)
   **Then** `expo-location` confirme `status: 'granted'`
   **And** l'état `locationGranted: true` est disponible via `useAuth()` ou `useLocation()`

5. **Given** l'utilisateur a accordé la géolocalisation précédemment
   **When** l'app redémarre
   **Then** `useLocation` détecte automatiquement `status: 'granted'` au démarrage (sans redemander)
   **And** aucune popup de permission ne réapparaît

6. **Given** la géolocalisation refusée ou non accordée
   **When** une feature future (ex: Story 5.3) tente d'utiliser la géoloc
   **Then** elle vérifie `locationGranted` avant tout appel à `expo-location`
   **And** aucune demande de permission intrusive n'est déclenchée automatiquement

## Tasks / Subtasks

- [ ] **Hook `useLocation`** (AC: #4, #5, #6)
  - [ ] Créer `src/hooks/useLocation.ts`
  - [ ] Au mount : appeler `Location.getForegroundPermissionsAsync()` pour lire le statut actuel sans déclencher de popup
  - [ ] Exposer `permissionStatus: 'granted' | 'denied' | 'undetermined'`, `locationGranted: boolean`, `requestPermission(): Promise<boolean>`
  - [ ] `requestPermission()` : appelle `Location.requestForegroundPermissionsAsync()` et met à jour le state local
  - [ ] Pattern `AsyncState<T>` pour le chargement initial du statut
  - [ ] Logs debug : `if (DEBUG) console.debug('[useLocation] status', permissionStatus)`
  - [ ] Écrire `src/hooks/useLocation.test.ts` : cas `granted`, `denied`, `undetermined`, redemande refusée

- [ ] **Intégration dans `AuthContext`** (AC: #4, #5)
  - [ ] Ajouter `locationGranted: boolean` à l'interface `AuthContextValue`
  - [ ] Lire le statut `expo-location` au démarrage dans `AuthProvider` (via `Location.getForegroundPermissionsAsync()`)
  - [ ] Exposer `locationGranted` dans le context pour que les features futures puissent le consommer
  - [ ] Mettre à jour `src/contexts/AuthContext.test.tsx` : tester que `locationGranted` est bien exposé

- [ ] **Écran Profil — entrée Géolocalisation** (AC: #3)
  - [ ] Ajouter `SettingsRow` "Géolocalisation" dans la section Préférences de `src/app/(tabs)/profile.tsx`
  - [ ] Afficher le statut : "Activée" / "Désactivée" selon `locationGranted`
  - [ ] `onPress` : si `undetermined` → appeler `requestPermission()` ; sinon → `Linking.openSettings()` pour ouvrir les réglages iOS
  - [ ] Ajouter les clés i18n dans `src/locales/fr.ts` et `src/locales/en.ts`
  - [ ] Mettre à jour `src/app/(tabs)/profile.test.tsx` : tester l'affichage du statut et le comportement du tap

- [ ] **Demande de permission (point d'entrée Onboarding — Story 7.1)** (AC: #1, #2)
  - [ ] Créer `src/components/LocationPermissionPrompt.tsx` : composant réutilisable affichant le message d'usage + boutons "Autoriser" / "Pas maintenant"
  - [ ] Ce composant sera utilisé dans la Slide 3 de l'onboarding (Story 7.1) et potentiellement dans le profil
  - [ ] `onAllow` : appelle `requestPermission()` depuis `useLocation`
  - [ ] `onSkip` : ferme le prompt sans action — aucun blocage
  - [ ] Écrire `src/components/LocationPermissionPrompt.test.tsx`

- [ ] **Clés i18n** (AC: #1, #3)
  - [ ] `profile.locationRow` : "Géolocalisation"
  - [ ] `profile.locationEnabled` : "Activée"
  - [ ] `profile.locationDisabled` : "Désactivée"
  - [ ] `location.permissionTitle` : "Géolocalisation"
  - [ ] `location.permissionMessage` : "Pour confirmer ta présence au sommet et te notifier à l'arrivée"
  - [ ] `location.allow` : "Autoriser"
  - [ ] `location.skip` : "Pas maintenant"
  - [ ] `location.openSettings` : "Ouvrir les réglages"

- [ ] **Documentation et mise à jour** (AC: all)
  - [ ] Mettre à jour `sprint-status.yaml` : `2-3-permission-geolocalisation-opt-in-sans-blocage: done`
  - [ ] Créer `mobile/docs/story-2-3-permission-geolocalisation.md`
  - [ ] Mettre à jour `mobile/docs/product-audit.md` (section "Ce qui est fonctionnel")

## Dev Notes

### Architecture — hook `useLocation`

```typescript
// src/hooks/useLocation.ts
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { DEBUG } from '@/constants/flags';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UseLocationReturn {
  permissionStatus: LocationPermissionStatus;
  locationGranted: boolean;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;
}

export function useLocation(): UseLocationReturn {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (DEBUG) console.debug('[useLocation] initial status', status);
      setPermissionStatus(status as LocationPermissionStatus);
    }).finally(() => setLoading(false));
  }, []);

  async function requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (DEBUG) console.debug('[useLocation] requested, result', status);
    setPermissionStatus(status as LocationPermissionStatus);
    return status === 'granted';
  }

  function openSettings(): void {
    Linking.openSettings();
  }

  return {
    permissionStatus,
    locationGranted: permissionStatus === 'granted',
    loading,
    requestPermission,
    openSettings,
  };
}
```

### Intégration dans `AuthContext`

```typescript
// Dans AuthProvider, au useEffect initial :
Location.getForegroundPermissionsAsync()
  .then(({ status }) => setLocationGranted(status === 'granted'))
  .catch(() => setLocationGranted(false));
```

L'état `locationGranted` est lu **une seule fois au démarrage** — il sera mis à jour si l'utilisateur revient des réglages iOS (via `AppState` ou le hook `useLocation` dans les composants qui en ont besoin).

### Comportement iOS — règles de permission `expo-location`

| Situation | Comportement attendu |
|-----------|---------------------|
| Première fois (undetermined) | `requestForegroundPermissionsAsync()` déclenche la popup système iOS |
| Refus initial | `status: 'denied'` — iOS ne re-affiche jamais la popup. Seul `Linking.openSettings()` permet de modifier |
| Accordée précédemment | `getForegroundPermissionsAsync()` retourne `status: 'granted'` sans popup |
| Permission révoquée dans les réglages iOS | Détectée au prochain `getForegroundPermissionsAsync()` (ex: au retour de l'app) |

**Note iOS important :** iOS ne permet qu'une seule popup système par permission. Après un refus, tout nouvel appel à `requestForegroundPermissionsAsync()` retourne `denied` sans afficher de popup. Le seul chemin est `Linking.openSettings()`.

### Ce que cette story ne fait PAS

- Pas de geofencing ni de tracking GPS en temps réel → Story 5.3
- Pas de "sommets proches" ni de suggestions par localisation → V2
- Pas de permission `LOCATION_BACKGROUND` — uniquement `foreground` (when in use)
- Pas de modification de `app.json` / `Info.plist` si `NSLocationWhenInUseUsageDescription` est déjà configuré (vérifier)

### Vérifier dans `app.json` / `app.config.ts`

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Pour confirmer ta présence au sommet et te notifier à l'arrivée lors de la validation terrain."
    }
  }
}
```

Si cette clé est absente, l'app sera rejetée lors de la soumission App Store dès qu'`expo-location` est importé (même sans appel actif).

### Pattern d'import à respecter (règle escalier)

```typescript
// ✅ Correct
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { DEBUG } from '@/constants/flags';
```

## Tests à écrire

### `src/hooks/useLocation.test.ts`

```typescript
// Mock expo-location
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

describe('useLocation', () => {
  it('retourne locationGranted=true quand status=granted au démarrage', ...)
  it('retourne locationGranted=false quand status=denied', ...)
  it('retourne locationGranted=false quand status=undetermined', ...)
  it('requestPermission retourne true quand accordée', ...)
  it('requestPermission retourne false quand refusée', ...)
  it('loading=false après la résolution initiale', ...)
});
```

### `src/components/LocationPermissionPrompt.test.tsx`

```typescript
describe('LocationPermissionPrompt', () => {
  it('affiche le message d\'usage', ...)
  it('appelle onAllow quand "Autoriser" pressé', ...)
  it('appelle onSkip quand "Pas maintenant" pressé', ...)
  it('ne bloque pas l\'app si onSkip est appelé', ...)
});
```

### `src/app/(tabs)/profile.test.tsx` (mise à jour)

```typescript
describe('ProfileScreen — géolocalisation', () => {
  it('affiche "Activée" quand locationGranted=true', ...)
  it('affiche "Désactivée" quand locationGranted=false', ...)
  it('appelle openSettings si permission déjà denied', ...)
  it('appelle requestPermission si status=undetermined', ...)
});
```

## Instructions de test manuel

### Scénario 1 — Première demande (simulateur iOS)
1. Réinitialiser les permissions du simulateur : `Device → Privacy → Location Services → reset`
2. Lancer l'app sur le simulateur
3. Naviguer vers Profil → taper sur "Géolocalisation"
4. **Attendu :** popup système iOS s'affiche avec le message de l'`Info.plist`
5. Appuyer "En utilisant l'app"
6. **Attendu :** entrée Profil affiche "Activée"

### Scénario 2 — Refus sans blocage
1. Taper "Pas maintenant" sur `LocationPermissionPrompt` (ou refuser la popup iOS)
2. **Attendu :** retour à l'écran principal, aucun bandeau d'erreur
3. Vérifier que Score, Recherche et Favoris fonctionnent normalement

### Scénario 3 — Lien vers réglages iOS
1. Après un refus, naviguer vers Profil
2. **Attendu :** statut "Désactivée" visible
3. Taper sur l'entrée
4. **Attendu :** les réglages iOS s'ouvrent sur la page de l'app

### Scénario 4 — Persistance au redémarrage
1. Accorder la permission
2. Quitter et relancer l'app
3. **Attendu :** aucune popup, `locationGranted=true` sans interaction utilisateur

## Critères de Done

- [ ] `src/hooks/useLocation.ts` créé et tous les tests passent
- [ ] `src/contexts/AuthContext.tsx` expose `locationGranted: boolean`
- [ ] `src/components/LocationPermissionPrompt.tsx` créé et testé
- [ ] `src/app/(tabs)/profile.tsx` affiche le statut géoloc + lien vers réglages
- [ ] `NSLocationWhenInUseUsageDescription` présente dans `app.json` / `app.config.ts`
- [ ] Clés i18n ajoutées dans `fr.ts` et `en.ts`
- [ ] `npm test && npx tsc --noEmit && npm run lint` : zéro erreur
- [ ] Scénarios de test manuel 1–4 validés sur simulateur iOS
- [ ] `sprint-status.yaml` mis à jour
- [ ] `mobile/docs/story-2-3-permission-geolocalisation.md` créé
