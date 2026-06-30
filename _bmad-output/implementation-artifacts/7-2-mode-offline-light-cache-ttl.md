---
epic: 7
story: 7-2
title: Mode Offline-Light & Cache TTL
status: ready
sprint: backlog
dependencies: [3-4]
FRs: [FR30, FR31, FR32]
NFRs: [NFR3]
---

# Story 7-2 — Mode Offline-Light & Cache TTL

## User Story

As a user,
I want to see my last forecast when I have no network connection,
So that I can still check conditions on the mountain without signal.

---

## Contexte

La story 3-4 (ScoreCard & écran principal) a implémenté `useScore` avec un cache `AsyncStorage` rudimentaire — la clé `cache:score:v2:{peakId}:{date}:{hour}` est déjà utilisée, le TTL de 2h est déjà vérifié.

Cette story consolide et standardise ce comportement offline pour toute l'app :

1. **`cacheService.ts`** — abstraction unifiée de lecture/écriture AsyncStorage, réutilisable par tous les hooks futurs (usePeakSearch, useFavorites, etc.)
2. **`useNetworkStatus.ts`** — détection réseau via `@react-native-community/netinfo` pour exposer un état `isConnected: boolean` consommable partout
3. **`useScore`** — mise à jour pour exposer `fromCache: boolean` dans l'état success et déclencher le bandeau "Données du [heure]"

**Ce qui change par rapport à l'existant :**

| Comportement actuel | Comportement attendu après 7-2 |
|---|---|
| Cache hit → `success` immédiat (toujours) | Cache hit réseau dispo → API call quand même (données fraîches) |
| Cache hit réseau absent → `success` (silencieux) | Cache hit réseau absent → `success` avec `fromCache: true` + bandeau âge |
| Cache expiré réseau absent → `error` générique | Cache expiré réseau absent → `error` avec code `OFFLINE_EXPIRED` |
| Logique cache inline dans `useScore` | Logique cache dans `cacheService.ts` réutilisable |

**Comportement réseau :**
- **Réseau disponible** → appel API systématique (données fraîches)
- **Réseau absent + cache valide (< 2h)** → affichage données avec `fromCache: true` et timestamp `cachedAt`
- **Réseau absent + cache expiré (> 2h) ou absent** → état `error` avec code `OFFLINE_EXPIRED`
- **Réseau revient** → pull-to-refresh force un appel API et efface le bandeau

---

## Acceptance Criteria

**AC1 — Cache hit avec réseau absent**

**Given** l'utilisateur a consulté une prévision avec réseau disponible
**When** `useScore` reçoit les données de l'API
**Then** `cacheService.set('score', peakId, date, hour, data)` persiste les données avec `cachedAt: Date.now()`
**And** la prévision est récupérable hors-ligne pendant 2h

---

**AC2 — Affichage offline avec cache valide (NFR3)**

**Given** l'utilisateur consulte une prévision sans réseau disponible
**When** `useNetworkStatus` retourne `isConnected: false`
**And** le cache contient une entrée valide (< 2h)
**Then** `useScore` retourne `{ status: 'success', data, fromCache: true, cachedAt: number }`
**And** l'affichage se fait en < 100ms (NFR3) — pas d'appel réseau
**And** un bandeau s'affiche : "Données du [HH:mm] — connexion requise pour actualiser" (FR30, FR31)

---

**AC3 — Message clair si cache expiré sans réseau (FR32)**

**Given** le cache est expiré (> 2h) ou absent
**When** `useNetworkStatus` retourne `isConnected: false`
**Then** `useScore` retourne `{ status: 'error', error: 'OFFLINE_EXPIRED' }`
**And** l'UI affiche : "Données non disponibles — connexion requise pour voir une prévision fraîche"
**And** l'app ne crashe pas et n'affiche pas de données obsolètes sans avertissement

---

**AC4 — Retour réseau**

**Given** les données sont affichées depuis le cache (bandeau visible)
**When** l'utilisateur pull-to-refresh
**And** le réseau est revenu
**Then** `useScore` effectue un appel API
**And** les données fraîches remplacent le cache
**And** le bandeau "Données du..." disparaît

---

**AC5 — Comportement inchangé avec réseau disponible**

**Given** le réseau est disponible
**When** `useScore` est appelé
**Then** un appel API est effectué (même si le cache est valide)
**And** les données reçues sont persistées en cache
**And** aucun bandeau n'est affiché

---

## Fichiers à créer / modifier

### Créer — `mobile/src/services/cacheService.ts`

Abstraction AsyncStorage unifiée. Responsabilités :
- `get<T>(namespace, ...keyParts): Promise<{ data: T; cachedAt: number } | null>` — lit et valide le TTL
- `set<T>(namespace, ...keyParts, data, ttlMs): Promise<void>` — écrit avec timestamp
- `invalidate(namespace, ...keyParts): Promise<void>` — supprime une entrée
- Toujours non-fatal (try/catch interne, retourne null si erreur lecture/écriture)
- Clé générée : `cache:{namespace}:{keyParts.join(':')}`
- TTL vérifié au read (pas de TTL Redis côté mobile — vérification à la lecture)

Note : la logique de validation de compatibilité i18n (`isCacheEntryCompatible`) qui était dans `useScore` reste dans `useScore` — `cacheService` est agnostique du contenu.

### Créer — `mobile/src/hooks/useNetworkStatus.ts`

Hook React qui expose `{ isConnected: boolean }`.

Dépendance : `@react-native-community/netinfo` (déjà dans les deps Expo).

```typescript
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus(): { isConnected: boolean } {
  // Écoute `NetInfo.addEventListener` → met à jour l'état
  // Initial state : `true` (optimistic) pour éviter un flash "offline" au démarrage
}
```

Test co-localisé : `src/hooks/useNetworkStatus.test.ts`

### Modifier — `mobile/src/services/mockData/types.ts`

Étendre `AsyncState<T>` pour supporter les métadonnées offline :

```typescript
export interface AsyncState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
  fromCache?: boolean;   // true = données servies depuis AsyncStorage
  cachedAt?: number;     // timestamp ms de la mise en cache
}
```

### Modifier — `mobile/src/hooks/useScore.ts`

Refactoring pour utiliser `cacheService` + `useNetworkStatus` :

1. Remplacer la logique AsyncStorage inline par des appels `cacheService.get/set`
2. Importer `useNetworkStatus` pour décider du comportement réseau
3. Quand réseau absent + cache valide → `setState({ status: 'success', data, fromCache: true, cachedAt })`
4. Quand réseau absent + cache expiré → `setState({ status: 'error', error: 'OFFLINE_EXPIRED' })`
5. Quand réseau disponible → comportement actuel (API call systématique)

Le flag `MOCK_API` continue de bypasser le cache entièrement (comportement inchangé).

### Modifier — composant affichant `ScoreCard` (à identifier à l'implémentation)

Le composant parent qui consomme `useScore` doit :
- Détecter `state.fromCache === true` → afficher le bandeau offline
- Détecter `state.error === 'OFFLINE_EXPIRED'` → afficher le message "Données non disponibles"
- Exposer une action pull-to-refresh qui appelle `load()` du hook

Le bandeau "Données du [HH:mm]" utilise `new Date(state.cachedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })`.

Les strings UI passent par `i18n.ts` — aucune string hardcodée dans les composants.

---

## Tests à écrire

### `src/services/cacheService.test.ts` (nouveau)

```
- retourne_null_si_entree_absente
- retourne_entree_valide_si_dans_ttl
- retourne_null_si_entree_expiree
- ecrit_et_relit_une_entree
- supprime_une_entree_avec_invalidate
- retourne_null_si_lecture_echoue (AsyncStorage.getItem lance une exception)
- ne_leve_pas_si_ecriture_echoue (AsyncStorage.setItem lance une exception)
- construit_la_cle_correctement_depuis_les_keyParts
```

### `src/hooks/useNetworkStatus.test.ts` (nouveau)

```
- retourne_true_au_demarrage
- met_a_jour_isConnected_quand_netinfo_change
- nettoie_le_listener_au_unmount
```

### `src/hooks/useScore.test.ts` (mise à jour)

Conserver tous les tests existants. Ajouter :

```
- retourne_fromCache_true_quand_reseau_absent_et_cache_valide
- retourne_OFFLINE_EXPIRED_quand_reseau_absent_et_cache_expire
- retourne_OFFLINE_EXPIRED_quand_reseau_absent_et_cache_absent
- appelle_api_meme_si_cache_valide_quand_reseau_disponible
- cachedAt_est_expose_dans_letat_success_fromCache
- pull_to_refresh_declenche_appel_api_quand_reseau_revient
```

---

## Critères de done

- [ ] `cacheService.ts` créé avec couverture tests complète
- [ ] `useNetworkStatus.ts` créé avec tests
- [ ] `useScore` refactorisé — tests existants toujours verts + nouveaux tests ajoutés
- [ ] Bandeau "Données du [HH:mm]" visible en mode offline avec cache valide
- [ ] Message "Données non disponibles" visible si cache expiré sans réseau
- [ ] Bandeau disparaît après pull-to-refresh avec réseau
- [ ] **NFR3** : cache chargé en < 100ms (pas d'appel réseau en mode offline)
- [ ] **FR30** : dernière prévision affichée si offline (TTL 2-3h)
- [ ] **FR31** : âge des données indiqué (heure de mise en cache)
- [ ] **FR32** : message d'indisponibilité clair si données expirées
- [ ] Strings UI dans `i18n.ts` (aucune string hardcodée)
- [ ] `npm test` vert — aucune régression
- [ ] `npx tsc --noEmit` sans erreur
- [ ] `npm run lint` sans erreur
- [ ] Doc story créée dans `mobile/docs/story-7-2-mode-offline-light-cache-ttl.md`
- [ ] `mobile/docs/product-audit.md` mis à jour

---

## Instructions de test manuel

### Test 1 — Mode offline avec cache valide

1. Lancer l'app (`npm start`)
2. Consulter un sommet → vérifier que le score s'affiche normalement
3. Dans le simulateur iOS : Features → Network Link Conditioner → 100% Loss (ou désactiver WiFi)
4. Revenir sur l'onglet home → recharger la prévision du même sommet
5. **Attendu** : le score s'affiche avec un bandeau "Données du [HH:mm]"
6. **Attendu** : l'affichage est instantané (< 100ms, pas de spinner réseau)

### Test 2 — Mode offline avec cache expiré

1. Vider le cache manuellement (ou modifier le TTL à 1ms dans devConfig)
2. Désactiver le réseau
3. Consulter un sommet
4. **Attendu** : message "Données non disponibles — connexion requise"
5. **Attendu** : pas de données obsolètes affichées sans avertissement

### Test 3 — Retour réseau

1. En mode offline avec bandeau visible
2. Réactiver le réseau
3. Pull-to-refresh
4. **Attendu** : données fraîches chargées, bandeau disparaît

### Test 4 — Vérification NFR3

Avec `DEBUG: true` dans `devConfig.ts`, vérifier dans la console :
```
[cacheService] cache hit — 12ms
[useScore] fromCache=true, cachedAt=1234567890
```

---

## Notes d'implémentation

**Dépendance `@react-native-community/netinfo`** : vérifier que le package est déjà présent dans `mobile/package.json` avant d'ajouter. Si absent : `npx expo install @react-native-community/netinfo` puis `npx expo run:ios` pour recompiler le build natif.

**Comportement "optimistic online"** : `useNetworkStatus` initialise `isConnected: true` pour éviter un flash "offline" pendant que NetInfo se connecte. Ce comportement est intentionnel — mieux vaut tenter un appel API et tomber en erreur que bloquer l'UI.

**Cache namespace** : `cacheService` utilise le préfixe `cache:` pour toutes les clés, conformément à la convention Redis documentée dans CLAUDE.md. Exemple : `cache:score:v2:peak-1:2026-03-23:6`.

**Pas de pré-téléchargement proactif** : cette story ne pré-charge pas les prévisions en arrière-plan. Les données sont uniquement mises en cache lors d'une consultation active.
