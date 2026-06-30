---
epic: 7
story: 7-1
title: Parcours Onboarding Narratif
status: ready
sprint: backlog
dependencies: []
FRs: [FR33, FR34]
NFRs: [NFR24, NFR26, NFR28]
---

# Story 7-1 — Parcours Onboarding Narratif

## User Story

As a new user,
I want to experience a compelling onboarding that explains the product's unique value,
So that I understand what sea of clouds forecasting is and why I need it.

---

## Contexte

L'onboarding est le premier contact de l'utilisateur avec Cloudbreak. Il n'est affiché qu'une seule fois — au tout premier lancement de l'app — et s'appuie sur un storytelling narratif en 3 slides :

1. **Le problème** : "Tu t'es déjà levé à 5h pour rien ?" — une douleur réelle que tout randonneur connaît
2. **La solution** : "Cloudbreak te dit si ça vaut le coup" — démo du score en action
3. **Les permissions** : notifications push + géolocalisation, refus possible sans blocage

Le flag `onboarding_completed` en `AsyncStorage` garantit que l'onboarding ne s'affiche plus jamais après la première complétion.

**Route existante** : `app/onboarding.tsx` est déjà dans la structure Expo Router — cette story l'implémente.

**Contexte de navigation** :
- Au premier lancement, le guard dans `_layout.tsx` redirige vers `/onboarding` si le flag est absent
- En fin d'onboarding, la navigation va vers `/(tabs)/` et le flag est posé
- Pas de bouton "Retour" sur l'onboarding — navigation linéaire uniquement

---

## Acceptance Criteria

**AC1 — Premier lancement : onboarding affiché**

**Given** le premier lancement de l'app (flag `onboarding_completed` absent de `AsyncStorage`)
**When** l'app démarre et le layout racine se charge
**Then** `onboarding.tsx` s'affiche automatiquement (pas l'écran home)
**And** le bottom tab bar n'est pas visible pendant l'onboarding

---

**AC2 — 3 slides dans l'ordre**

**Given** l'écran onboarding
**When** l'utilisateur parcourt les slides
**Then** 3 slides s'enchaînent via le composant `OnboardingSlide` :
- Slide 1 : Le problème — "Tu t'es déjà levé à 5h pour rien ?" avec fond sombre (#1A1A1A) et image évocatrice (montagne dans le brouillard)
- Slide 2 : La solution — "Cloudbreak te dit si ça vaut le coup" avec démo score 87% 🟢 en style `ScoreCard` simplifié
- Slide 3 : Les permissions — demande notifications push + géolocalisation, avec boutons "Autoriser" / "Pas maintenant" non-bloquants

**And** la navigation entre slides se fait par swipe horizontal ou bouton "Suivant"
**And** les dots de progression (3 points) indiquent le slide actif
**And** un bouton "Passer" (ghost, top right) permet de skip l'onboarding entier dès le slide 1

---

**AC3 — Slide 3 : permissions non-bloquantes (FR34)**

**Given** le slide 3 (permissions)
**When** l'utilisateur appuie sur "Pas maintenant" pour les notifications
**And** "Pas maintenant" pour la géolocalisation
**Then** il continue vers l'écran principal sans message d'erreur ni friction
**And** aucune feature core (score, recherche, favoris) n'est bloquée

**Given** le slide 3
**When** l'utilisateur appuie sur "Autoriser" les notifications
**Then** le système iOS déclenche la demande de permission native (`expo-notifications`)
**And** qu'il accepte ou refuse, l'onboarding continue normalement

**Given** le slide 3
**When** l'utilisateur appuie sur "Autoriser" la géolocalisation
**Then** le système iOS déclenche la demande de permission native (`expo-location`)
**And** qu'il accepte ou refuse, l'onboarding continue normalement

---

**AC4 — Fin d'onboarding : flag + PostHog + navigation**

**Given** la fin de l'onboarding (slide 3 complété OU bouton "Passer" utilisé)
**When** l'utilisateur appuie sur "Commencer" ou skip
**Then** `AsyncStorage.setItem('onboarding_completed', 'true')` est appelé
**And** l'event `onboarding_complete` est envoyé à PostHog avec les propriétés `{ notifications_granted: boolean, location_granted: boolean, skipped: boolean }`
**And** `router.replace('/(tabs)/')` navigue vers l'écran principal (pas `push` — pas de retour possible)

---

**AC5 — Relancement : onboarding non affiché (FR33)**

**Given** un utilisateur qui rouvre l'app (ou force-quit + relance)
**When** `onboarding_completed === 'true'` est présent en `AsyncStorage`
**Then** l'onboarding ne s'affiche plus jamais
**And** l'utilisateur arrive directement sur l'écran home

---

**AC6 — Responsive 3 breakpoints (NFR28)**

**Given** l'écran onboarding
**When** il s'affiche sur iPhone SE (375pt), iPhone 14 (390pt), iPhone 14 Pro Max (430pt)
**Then** aucun texte ne se tronque ni ne déborde
**And** le bouton "Commencer / Suivant" est toujours visible sans scroll
**And** les images sont correctement cadrées sur les 3 tailles

---

## Fichiers à créer / modifier

### Modifier — `mobile/app/onboarding.tsx`

Route principale de l'onboarding. Responsabilités :
- État local `currentSlide: 0 | 1 | 2` et `notificationsGranted`, `locationGranted`
- Rendu du slide actif via `OnboardingSlide`
- Gestion des appels de permissions (`expo-notifications`, `expo-location`) sur le slide 3
- Fonction `completeOnboarding(skipped: boolean)` :
  1. `await AsyncStorage.setItem('onboarding_completed', 'true')`
  2. PostHog event `onboarding_complete`
  3. `router.replace('/(tabs)/')`
- Pas de ScrollView horizontal custom — utiliser `FlatList` avec `pagingEnabled` ou `useAnimatedScrollHandler` Reanimated

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingSlide } from '@/src/components/OnboardingSlide';
import { usePostHog } from '@/src/hooks/usePostHog';
import { useTheme } from '@/src/contexts/ThemeContext';
import i18n from '@/src/utils/i18n';
```

### Créer — `mobile/src/components/OnboardingSlide.tsx`

Composant générique pour un slide onboarding. Props :

```typescript
export interface OnboardingSlideProps {
  variant: 'problem' | 'solution' | 'permissions';
  onNext?: () => void;
  onSkip?: () => void;
  onRequestNotifications?: () => Promise<void>;
  onRequestLocation?: () => Promise<void>;
  isLastSlide?: boolean;
}
```

**Anatomy commune à tous les slides :**
- `SafeAreaView` pleine hauteur avec fond défini par variant
- Bouton "Passer" ghost en haut à droite (visible sur slides 1 et 2, caché sur slide 3)
- Dots de progression (3 points, le point actif en `#B28C6E`)
- Zone image/visuel (flex 0.5 de la hauteur)
- Titre `Josefin Sans 700 28px` couleur `#F7F5F1`
- Sous-titre `Josefin Sans 300 16px` couleur `#D2BA9C`
- Bouton(s) Primary/Secondary/Ghost pleine largeur en bas

**Variant `problem` (Slide 1) :**
- Fond : `#1A1A1A` (dark)
- Image : illustration montagnes dans le brouillard (asset local `assets/onboarding/mountains-fog.png`)
- Titre : `i18n.t('onboarding.slide1.title')` — "Tu t'es déjà levé à 5h pour rien ?"
- Sous-titre : `i18n.t('onboarding.slide1.subtitle')` — "Brouillard au sommet. Le réveil à 4h45 pour... rien. On connaît."
- Bouton : Primary "Suivant →"

**Variant `solution` (Slide 2) :**
- Fond : `#EFE8DC` (light — contraste intentionnel avec slide 1)
- Visuel : mini `ScoreCard` statique affichant score "87%" verdict "Lève-toi tôt 🟢" sommet "Col de la Croix-Fry" (données mockées, non interactif)
- Titre : `i18n.t('onboarding.slide2.title')` — "Cloudbreak te dit si ça vaut le coup"
- Sous-titre : `i18n.t('onboarding.slide2.subtitle')` — "Algorithme météo spécialisé mer de nuage. Score de probabilité. Décision en 3 secondes."
- Bouton : Primary "Suivant →"

**Variant `permissions` (Slide 3) :**
- Fond : `#1A1A1A` (dark — retour au sombre)
- Icônes : 🔔 notifications + 📍 géolocalisation (grandes, centrées)
- Titre : `i18n.t('onboarding.slide3.title')` — "Pour ne rien manquer"
- Sous-titre : `i18n.t('onboarding.slide3.subtitle')` — "Notifications quand les conditions sont idéales. Géoloc pour valider depuis le terrain."
- Bouton notifications : Primary "Autoriser les notifications" → appel `onRequestNotifications()`
- Bouton géoloc : Secondary "Autoriser la géolocalisation" → appel `onRequestLocation()`
- Lien ghost : "Pas maintenant — commencer quand même" → `onSkip()`
- Bouton final : Primary "Commencer" (visible après les deux demandes, ou après "Pas maintenant")

Test co-localisé : `src/components/OnboardingSlide.test.tsx`

### Modifier — `mobile/app/_layout.tsx`

Ajouter le guard onboarding dans le layout racine :

```typescript
// Dans le useEffect d'initialisation
const checkOnboarding = async () => {
  const completed = await AsyncStorage.getItem('onboarding_completed');
  if (!completed) {
    router.replace('/onboarding');
  }
};
```

Le guard ne doit s'exécuter qu'une fois au montage, après que le layout racine est prêt (après le check d'auth Supabase).

**Ordre de priorité des redirects :**
1. Si pas de session auth → `/login` (existant)
2. Si session auth mais pas d'onboarding → `/onboarding` (nouveau)
3. Sinon → `/(tabs)/` normal

### Modifier — `mobile/src/utils/i18n.ts`

Ajouter les clés onboarding :

```typescript
onboarding: {
  slide1: {
    title: "Tu t'es déjà levé à 5h pour rien ?",
    subtitle: "Brouillard au sommet. Le réveil à 4h45 pour... rien. On connaît.",
  },
  slide2: {
    title: "Cloudbreak te dit si ça vaut le coup",
    subtitle: "Algorithme météo spécialisé mer de nuage. Score de probabilité. Décision en 3 secondes.",
  },
  slide3: {
    title: "Pour ne rien manquer",
    subtitle: "Notifications quand les conditions sont idéales. Géoloc pour valider depuis le terrain.",
    allowNotifications: "Autoriser les notifications",
    allowLocation: "Autoriser la géolocalisation",
    skipPermissions: "Pas maintenant — commencer quand même",
    start: "Commencer",
  },
  skip: "Passer",
  next: "Suivant →",
}
```

### Créer — `mobile/assets/onboarding/mountains-fog.png`

Asset visuel slide 1. Options :
- Photo libre de droits (Unsplash) : montagne dans le brouillard / mer de nuage
- Format : PNG 750×900px (ratio portrait, adapté à toutes les tailles iOS)
- Ne pas utiliser une image trop lourde — compresser à < 300KB

### Modifier — `mobile/src/hooks/usePostHog.ts` *(si inexistant — créer)*

Hook minimal pour l'envoi d'events PostHog depuis les composants :

```typescript
export function usePostHog() {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    // Appel PostHog SDK (déjà configuré dans app/main côté backend)
    // MVP : console.debug('[PostHog]', event, properties) si SDK pas encore branché côté mobile
    if (DEBUG) console.debug('[PostHog]', event, properties);
  }, []);
  return { track };
}
```

---

## Design — DA détaillée

### Animations

- **Transition entre slides** : `FlatList` avec `scrollEventThrottle={16}` — scroll natif fluide, pas d'animation custom Reanimated en MVP
- **Apparition du titre** : `Animated.FadeIn` duration 400ms, delay 200ms après le scroll
- **Dots de progression** : interpolation `backgroundColor` et `width` selon `scrollX` (dot actif `#B28C6E` width 24px, inactifs `#3A3A3A` width 8px)
- **Bouton "Commencer"** : `Animated.FadeInDown` sur le slide 3 après les demandes de permissions

### Couleurs exactes par slide

| Slide | Fond | Titre | Sous-titre | Accent |
|-------|------|-------|------------|--------|
| 1 — Problème | `#1A1A1A` | `#F7F5F1` | `#9E9E9E` | — |
| 2 — Solution | `#EFE8DC` | `#1A1A1A` | `#5E5E5E` | `#B28C6E` (ScoreCard) |
| 3 — Permissions | `#1A1A1A` | `#F7F5F1` | `#9E9E9E` | `#B28C6E` (bouton Primary) |

### Typographie

- Titre : `Josefin Sans 700` 28px line-height 34px
- Sous-titre : `Josefin Sans 300` 16px line-height 24px
- Bouton Primary : `Josefin Sans 600` 16px, fond `#B28C6E`, texte `#FFFFFF`, borderRadius 14, height 52
- Bouton Secondary : `Josefin Sans 600` 16px, fond transparent, bordure `#B28C6E`, texte `#B28C6E`, borderRadius 14, height 52
- Bouton Ghost : `Josefin Sans 400` 14px, texte `#9E9E9E`, pas de fond ni bordure

### Espacement

- Padding horizontal écran : 24px
- Gap titre / sous-titre : 12px
- Gap sous-titre / boutons : 32px
- Gap entre boutons : 12px
- Boutons : toujours pleine largeur (`width: '100%'`)

---

## Tests à écrire

### `src/components/OnboardingSlide.test.tsx` (nouveau)

```
- affiche_le_slide_problem_correctement
- affiche_le_slide_solution_avec_scorecard_mock
- affiche_le_slide_permissions_avec_boutons_autoriser
- bouton_passer_visible_sur_slide1_et_slide2
- bouton_passer_absent_sur_slide3
- onNext_appele_au_tap_bouton_suivant
- onSkip_appele_au_tap_bouton_passer
- onRequestNotifications_appele_au_tap_autoriser_notifications
- onRequestLocation_appele_au_tap_autoriser_geolocalisation
- pas_de_crash_si_permission_refusee
```

### `app/onboarding.test.tsx` (nouveau)

```
- redirige_vers_tabs_apres_completion
- pose_le_flag_onboarding_completed_en_asyncstorage
- envoie_event_posthog_onboarding_complete
- proprietes_posthog_notifications_granted_false_si_refuse
- proprietes_posthog_location_granted_false_si_refuse
- proprietes_posthog_skipped_true_si_bouton_passer
- navigate_au_slide_suivant_au_swipe
- navigate_au_slide_suivant_au_bouton_suivant
- completion_directe_si_bouton_passer_slide1
```

### `app/_layout.test.tsx` (mise à jour)

Conserver les tests existants. Ajouter :

```
- redirige_vers_onboarding_si_flag_absent_et_session_active
- ne_redirige_pas_vers_onboarding_si_flag_present
- redirige_vers_login_avant_onboarding_si_pas_de_session
```

---

## Critères de done

- [ ] `onboarding.tsx` implémenté — 3 slides fonctionnels avec navigation
- [ ] `OnboardingSlide.tsx` créé avec les 3 variants (problem, solution, permissions)
- [ ] Asset `mountains-fog.png` présent dans `assets/onboarding/`
- [ ] Demandes de permissions implémentées sur slide 3 (non-bloquantes)
- [ ] Flag `AsyncStorage.setItem('onboarding_completed', 'true')` posé en fin d'onboarding
- [ ] Guard dans `_layout.tsx` → redirige vers `/onboarding` si flag absent
- [ ] `router.replace('/(tabs)/')` en fin d'onboarding (pas de retour possible)
- [ ] Event PostHog `onboarding_complete` envoyé avec propriétés correctes
- [ ] Strings UI dans `i18n.ts` — aucune string hardcodée dans les composants (NFR24)
- [ ] Design tokens via `useTheme()` — aucune couleur hardcodée (NFR26)
- [ ] Responsive vérifié sur iPhone SE (375pt), iPhone 14 (390pt), iPhone 14 Pro Max (430pt) (NFR28)
- [ ] Bouton "Passer" fonctionnel dès le slide 1
- [ ] Dots de progression animés
- [ ] Tests `OnboardingSlide.test.tsx` créés et verts
- [ ] Tests `onboarding.test.tsx` créés et verts
- [ ] Tests `_layout.test.tsx` mis à jour — tous verts
- [ ] **FR33** : onboarding au premier lancement uniquement
- [ ] **FR34** : permissions demandées avec refus possible sans blocage
- [ ] `npm test` vert — aucune régression
- [ ] `npx tsc --noEmit` sans erreur
- [ ] `npm run lint` sans erreur
- [ ] Doc story créée dans `mobile/docs/story-7-1-parcours-onboarding-narratif.md`
- [ ] `mobile/docs/product-audit.md` mis à jour

---

## Instructions de test manuel

### Test 1 — Premier lancement (onboarding complet)

1. Vider le flag : dans le simulateur, désinstaller l'app (ou `AsyncStorage.clear()` via devtools)
2. Lancer l'app : `npm start`
3. **Attendu** : l'écran onboarding s'affiche, pas le home
4. Swiper jusqu'au slide 2 — **attendu** : fond beige `#EFE8DC`, ScoreCard mock 87%
5. Swiper jusqu'au slide 3 — **attendu** : fond sombre, deux boutons "Autoriser"
6. Taper "Pas maintenant" pour les deux permissions
7. Taper "Commencer" — **attendu** : navigation vers home, bottom tab bar visible
8. Force-quit l'app + relancer — **attendu** : home direct, pas d'onboarding

### Test 2 — Skip depuis slide 1

1. Vider le flag + relancer
2. Sur slide 1, taper "Passer" (ghost, top right)
3. **Attendu** : navigation directe vers home, flag posé

### Test 3 — Permissions acceptées

1. Vider le flag + relancer
2. Sur slide 3, taper "Autoriser les notifications"
3. **Attendu** : popup iOS native de permission notifications
4. Accepter — **attendu** : bouton disparaît ou devient disabled
5. Taper "Autoriser la géolocalisation"
6. **Attendu** : popup iOS native géoloc
7. Taper "Commencer" — **attendu** : navigation home

### Test 4 — Vérification PostHog

Avec `DEBUG: true` dans `devConfig.ts` :
```
[PostHog] onboarding_complete { notifications_granted: false, location_granted: false, skipped: false }
```

### Test 5 — Responsive

Tester sur 3 simulateurs : iPhone SE (375pt), iPhone 14 Pro (393pt), iPhone 14 Pro Max (430pt).
- Aucun titre tronqué
- Boutons toujours visibles sans scroll
- Images correctement cadrées

---

## Notes d'implémentation

**`expo-notifications` au slide 3** : utiliser `requestPermissionsAsync()` de `expo-notifications`. Le résultat (granted/denied) est stocké dans l'état local de `onboarding.tsx` pour les propriétés PostHog. Ne pas bloquer la navigation sur refus.

**`expo-location` au slide 3** : utiliser `requestForegroundPermissionsAsync()` de `expo-location`. Même logique non-bloquante.

**Guard `_layout.tsx` — timing** : le check `AsyncStorage.getItem('onboarding_completed')` doit s'exécuter après l'hydratation du contexte d'auth (`AuthContext`). Sinon, un utilisateur non authentifié sera redirigé vers `/onboarding` avant `/login`. L'ordre de priorité est : auth check d'abord, onboarding check ensuite.

**`router.replace` vs `router.push`** : utiliser `replace` pour que l'utilisateur ne puisse pas revenir à l'onboarding via le bouton retour iOS (gesture swipe from left).

**ScoreCard mock slide 2** : ne pas importer le vrai composant `ScoreCard` (dépendance réseau). Créer un sous-composant statique `OnboardingScorePreview` avec les props hardcodées `{ score: 87, verdict: 'high', peakName: 'Col de la Croix-Fry', altitude: 1467 }`.

**Asset manquant** : si l'asset `mountains-fog.png` n'est pas disponible au moment de l'implémentation, utiliser un `View` avec `backgroundColor: '#2A2A2A'` et une icône ⛰️ centrée comme placeholder. Documenter en todo dans le fichier.
