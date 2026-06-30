# Story 7.3 : Système unifié états UI — loading, skeletons, erreurs, états vides

Status: ready-for-dev

## Story

En tant qu'utilisateur de Cloudbreak,
je veux que tous les états transitoires de l'app (chargement, erreur, vide) soient cohérents et bien traités visuellement,
afin que l'app paraisse finalisée et professionnelle au lancement sur l'App Store.

---

## Contexte

L'inventaire complet a été fait dans `_bmad-output/planning-artifacts/PLAN-etats.md`.

**Problème actuel :** 15 états d'UI gérés de façon ad-hoc éparpillée sur 5 screens — 3 tailles d'icônes différentes, 2 paddings différents, `ActivityIndicator` nu partout, `EmptyState` créé mais jamais branché, couleur `#fff` hardcodée dans `DeleteAccountModal`.

**Objectif :** zéro état inline non réutilisable. Tous les states passent par des composants centralisés.

---

## Acceptance Criteria

### AC1 — Composant `ErrorState` créé et branché partout
**Given** une erreur réseau ou API sur n'importe quel screen,
**When** `state.status === 'error'`,
**Then** `<ErrorState />` s'affiche avec icône unifiée (taille 40px), titre et message clairs, couleur `colors.textSecondary`.
**And** le même composant est utilisé dans Home (erreur réseau), Search (erreur réseau), Favorites (erreur réseau).
**And** l'icône varie selon le type d'erreur : `cloud-offline-outline` pour réseau, `lock-closed-outline` pour quota.

### AC2 — Composant `LoadingSpinner` créé et branché dans Search et Favorites
**Given** un chargement en cours dans Search ou Favorites,
**When** `state.status === 'loading'`,
**Then** `<LoadingSpinner />` s'affiche — `ActivityIndicator` avec `color={colors.accent}`, centré, même taille partout.
**And** le `ActivityIndicator` nu n'est plus directement instancié dans les screens.

### AC3 — `FavoritesSkeleton` créé et branché dans Favorites
**Given** le premier chargement de la liste des favoris (pas un refresh),
**When** `state.status === 'loading' && state.data === null`,
**Then** `<FavoritesSkeleton />` s'affiche — 3 blocs placeholder animés (pulsation, même style que `ScoreSkeleton`).
**And** le `ActivityIndicator` disparaît de `favorites.tsx`.

### AC4 — `EmptyState` branché dans Favorites et Search
**Given** la liste des favoris est vide (`state.data.length === 0`),
**When** l'utilisateur arrive sur l'onglet Favoris,
**Then** `<EmptyState />` s'affiche avec icône cœur, titre "Pas encore de favoris", hint "Recherche un sommet pour l'ajouter".
**And** le même composant est utilisé dans Search quand aucun résultat (`state.data.length === 0`).
**And** l'implémentation inline existante est supprimée.

### AC5 — Quota dépassé : `ErrorState` variante dans Home
**Given** l'utilisateur free a dépassé son quota,
**When** `weekError === 'QUOTA_EXCEEDED'`,
**Then** `<ErrorState variant="quota" />` affiche icône lock, titre "Quota atteint", CTA "Passer Premium" qui ouvre le paywall.
**And** il n'y a plus de `styles.errorCard` inline dans `index.tsx`.

### AC6 — Login : spinner dans le bouton submit
**Given** l'utilisateur appuie sur "Se connecter" ou "Créer un compte",
**When** la requête Supabase est en cours (`loading === true`),
**Then** le bouton affiche un `ActivityIndicator` blanc à la place du texte (pas juste le texte qui change).
**And** le bouton est `disabled` pendant le chargement.

### AC7 — `DeleteAccountModal` : correction couleur hardcodée
**Given** la modal de suppression de compte est ouverte,
**When** le bouton "Confirmer" est en état loading,
**Then** le spinner utilise `colors.surface` via le thème et non `#fff` hardcodé.

### AC8 — Cohérence visuelle : tailles et paddings unifiés
**Given** n'importe quel état vide ou erreur dans l'app,
**When** l'utilisateur le voit,
**Then** l'icône fait 40px, le padding autour du bloc est `Spacing.lg`, et le style est identique sur tous les screens.

---

## Tasks / Subtasks

- [ ] **T1 — Créer `ErrorState`** (AC1, AC5)
  - [ ] Créer `src/components/error-state/ErrorState.tsx`
  - [ ] Props : `icon?: string` (défaut `cloud-offline-outline`), `title: string`, `message?: string`, `action?: { label: string; onPress: () => void }`
  - [ ] Style : icône 40px `colors.textSecondary`, title 16px `colors.textPrimary`, message 13px `colors.textSecondary`, centré, padding `Spacing.lg`
  - [ ] Variante `variant="quota"` : icône `lock-closed-outline` + CTA optionnel
  - [ ] Créer `src/components/error-state/index.ts`
  - [ ] Créer `src/components/error-state/ErrorState.test.tsx`

- [ ] **T2 — Créer `LoadingSpinner`** (AC2)
  - [ ] Créer `src/components/loading-spinner/LoadingSpinner.tsx`
  - [ ] Props : `size?: 'small' | 'large'` (défaut `large`), `style?: ViewStyle`
  - [ ] Utilise `ActivityIndicator` avec `color={colors.accent}`, centré dans un View flex
  - [ ] Créer `src/components/loading-spinner/index.ts`
  - [ ] Créer `src/components/loading-spinner/LoadingSpinner.test.tsx`

- [ ] **T3 — Créer `FavoritesSkeleton`** (AC3)
  - [ ] Créer `src/components/favorites-skeleton/FavoritesSkeleton.tsx`
  - [ ] 3 items placeholder : row avec cercle (40px) + deux blocs texte, animation pulsation identique à `ScoreSkeleton` (Animated + loop)
  - [ ] Utilise `colors.border` comme couleur placeholder, theme-aware
  - [ ] Créer `src/components/favorites-skeleton/index.ts`
  - [ ] Créer `src/components/favorites-skeleton/FavoritesSkeleton.test.tsx`

- [ ] **T4 — Brancher `EmptyState` dans Favorites et Search** (AC4)
  - [ ] `favorites.tsx` : remplacer JSX inline vide par `<EmptyState icon="heart-outline" title={i18n.t('favorites.empty.title')} subtitle={i18n.t('favorites.empty.hint')} />`
  - [ ] `search.tsx` : remplacer JSX inline "aucun résultat" par `<EmptyState icon="telescope-outline" title={i18n.t('search.noResults.title')} />`
  - [ ] Ajouter les clés i18n manquantes dans `fr.ts` et `en.ts`
  - [ ] Supprimer le JSX inline correspondant

- [ ] **T5 — Brancher `ErrorState` dans Home, Search, Favorites** (AC1, AC5)
  - [ ] `index.tsx` (Home) : remplacer `styles.errorCard` inline erreur réseau par `<ErrorState title=... message=... />`
  - [ ] `index.tsx` (Home) : remplacer `styles.errorCard` inline quota par `<ErrorState variant="quota" action={{ label: i18n.t('home.upgrade'), onPress: showPaywall }} />`
  - [ ] `search.tsx` : remplacer erreur réseau inline par `<ErrorState />`
  - [ ] `favorites.tsx` : remplacer erreur réseau inline par `<ErrorState />`
  - [ ] Supprimer `styles.errorCard` de `index.tsx` (plus utilisé)

- [ ] **T6 — Brancher `LoadingSpinner` et `FavoritesSkeleton`** (AC2, AC3)
  - [ ] `search.tsx` : remplacer `ActivityIndicator` par `<LoadingSpinner />`
  - [ ] `favorites.tsx` : remplacer `ActivityIndicator` par `<FavoritesSkeleton />` (premier load) ou `<LoadingSpinner />` (refresh)

- [ ] **T7 — Login spinner** (AC6)
  - [ ] `login.tsx` : dans le bouton submit, remplacer le texte conditionnel par `{loading ? <ActivityIndicator color={colors.surface} size="small" /> : <Text>...</Text>}`
  - [ ] Vérifier `disabled={loading}` est bien présent

- [ ] **T8 — DeleteAccountModal fix couleur** (AC7)
  - [ ] `DeleteAccountModal.tsx` : remplacer `#fff` hardcodé par `colors.surface` (le composant a déjà accès au thème via `useTheme`)

- [ ] **T9 — i18n** (tous)
  - [ ] Auditer et ajouter toutes les clés manquantes dans `fr.ts` et `en.ts` pour les nouveaux composants et états

- [ ] **T10 — Tests** (tous ACs)
  - [ ] Mettre à jour `favorites.test.tsx` : vérifier `FavoritesSkeleton`, `EmptyState`, `ErrorState`
  - [ ] Mettre à jour `search.test.tsx` : vérifier `LoadingSpinner`, `EmptyState`, `ErrorState`
  - [ ] Vérifier que tous les `testID` existants sont préservés

- [ ] **T11 — Validation**
  - [ ] `npm run validate` doit passer
  - [ ] Vérifier visuellement sur simulateur : Home / Search / Favorites dans chaque état

---

## Dev Notes

### Fichiers source de référence

- **Inventaire complet :** `_bmad-output/planning-artifacts/PLAN-etats.md` — lire avant de commencer
- **`ScoreSkeleton`** (`src/components/score-skeleton/ScoreSkeleton.tsx`) — pattern d'animation pulsation à reproduire pour `FavoritesSkeleton`
- **`EmptyState`** (`src/components/empty-state/EmptyState.tsx`) — déjà créé, zéro usage — juste le brancher

### Structure fichiers

```
src/components/
  error-state/
    ErrorState.tsx           ← À CRÉER
    ErrorState.test.tsx      ← À CRÉER
    index.ts                 ← À CRÉER
  loading-spinner/
    LoadingSpinner.tsx       ← À CRÉER
    LoadingSpinner.test.tsx  ← À CRÉER
    index.ts                 ← À CRÉER
  favorites-skeleton/
    FavoritesSkeleton.tsx    ← À CRÉER
    FavoritesSkeleton.test.tsx ← À CRÉER
    index.ts                 ← À CRÉER
  empty-state/
    EmptyState.tsx           ← EXISTANT — brancher dans favorites + search
  score-skeleton/
    ScoreSkeleton.tsx        ← EXISTANT — garder tel quel, copier le pattern pulsation

src/app/(tabs)/
  index.tsx                  ← retirer errorCard inline × 2, brancher ErrorState
  search.tsx                 ← retirer ActivityIndicator + états inline, brancher composants
  favorites.tsx              ← retirer ActivityIndicator + états inline, brancher composants

src/app/(auth)/
  login.tsx                  ← ajouter spinner bouton submit

src/components/profile/
  DeleteAccountModal.tsx     ← fix #fff → colors.surface
```

### Règles design

- Icône états : **40px**, `colors.textSecondary` — toujours `Ionicons`
- Padding blocs état : `Spacing.lg` horizontal, `Spacing.xl` vertical
- Animations pulsation : copier exactement `ScoreSkeleton.tsx` — `Animated.loop` + `Animated.sequence`
- Couleur placeholder skeleton : `colors.border` (theme-aware, light ET dark)

### Pattern ErrorState props

```tsx
// Usage simple
<ErrorState title="Erreur réseau" message="Vérifie ta connexion" />

// Avec CTA (quota)
<ErrorState
  icon="lock-closed-outline"
  title="Quota atteint"
  message="1 consultation par jour en version gratuite"
  action={{ label: "Passer Premium", onPress: showPaywall }}
/>
```

### Ne pas toucher

- `ScoreSkeleton` — parfait tel quel, ne pas refacto
- `ScoreSkeleton` dans `index.tsx` — déjà bien utilisé, ne pas remplacer
- La logique métier des hooks (`useScore`, `useFavorites`, `usePeakSearch`) — ce sont les styles et JSX inline seulement qui changent
- Les `testID` existants — les garder pour ne pas casser les tests existants

### Imports — règle escalier

```ts
// ✅ Ordre croissant de longueur de ligne
import { View } from 'react-native';
import i18n from '@/utils/i18n';
import { Spacing } from '@/constants/spacing';
import { useTheme } from '@/contexts/ThemeContext';
```

---

## Références

- [Source: `_bmad-output/planning-artifacts/PLAN-etats.md`] — inventaire exhaustif des 15 états
- [Source: `src/components/score-skeleton/ScoreSkeleton.tsx`] — pattern animation à reproduire
- [Source: `src/components/empty-state/EmptyState.tsx`] — composant existant à brancher
- [Source: `src/app/(tabs)/index.tsx:195`] — errorCard quota actuel à remplacer
- [Source: `src/app/(tabs)/search.tsx:85`] — ActivityIndicator à remplacer
- [Source: `src/app/(tabs)/favorites.tsx:75`] — ActivityIndicator à remplacer
- [Source: `src/components/profile/DeleteAccountModal.tsx`] — #fff hardcodé à corriger

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
