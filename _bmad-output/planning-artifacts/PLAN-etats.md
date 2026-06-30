# PLAN — Système unifié de loading, skeletons & états vides/erreur

> **Objectif** : Remplacer les implémentations ad-hoc éparpillées par un système cohérent et réutilisable de composants d'états transitoires.
> **Fichier de référence** : `_bmad-output/planning-artifacts/PLAN-etats.md`

---

## 1. Inventaire exhaustif de l'existant (legacy à refacto)

### 1.1 Composants dédiés (réutilisables)

| Composant | Fichier | État | Notes |
|-----------|---------|------|-------|
| `ScoreSkeleton` | `src/components/score-skeleton/ScoreSkeleton.tsx` | ✅ Bien fait | Blocs animés pulsation, theme-aware, `testID="score-skeleton"` |
| `EmptyState` | `src/components/empty-state/EmptyState.tsx` | ✅ Existe mais **non utilisé** | Composant générique (icon + title + subtitle + CTA optionnel) — **zéro usage dans les screens** |

### 1.2 États inline dans les screens (à remplacer)

#### `src/app/(tabs)/index.tsx` — Home

| État | Ligne | Implémentation actuelle | Problème |
|------|-------|------------------------|---------|
| Loading score | ~154 | `<ScoreSkeleton />` | ✅ OK |
| Skeleton filet de sécurité | ~242 | `<ScoreSkeleton />` | ✅ OK |
| Score refresh | ~165 | `opacity: 0.7` sur le container | Comportement subtil, pas de composant |
| Empty — aucun sommet | ~120 | JSX inline (icône + texte + CTA + FavoritesGrid) | Inline, pas réutilisable |
| Erreur quota dépassé | ~195 | `styles.errorCard` inline (icône lock + texte + CTA) | Inline, style dupliqué |
| Erreur réseau/générique | ~227 | `styles.errorCard` inline (icône cloud-offline + texte) | Inline, style dupliqué |

#### `src/app/(tabs)/search.tsx` — Recherche

| État | Ligne | Implémentation actuelle | Problème |
|------|-------|------------------------|---------|
| Hint < 2 chars | ~74 | JSX inline centré (icône search + texte) | Inline |
| Loading | ~85 | `<ActivityIndicator color={colors.accent} />` centré | Spinner nu, pas branded |
| Erreur réseau | ~93 | Icône + texte inline (icône cloud-offline) | Inline, pas réutilisable |
| Aucun résultat | ~104 | Icône télescope + texte inline | Inline |

#### `src/app/(tabs)/favorites.tsx` — Favoris

| État | Ligne | Implémentation actuelle | Problème |
|------|-------|------------------------|---------|
| Loading / idle | ~75 | `<ActivityIndicator color={colors.accent} />` centré | Spinner nu, pas branded |
| Erreur réseau | ~83 | Icône cloud-offline + texte inline | Inline, style légèrement différent de search |
| Vide | ~94 | Icône cœur + titre + hint inline | Inline — **`EmptyState` existe mais non utilisé ici** |

#### `src/app/(auth)/login.tsx` — Login

| État | Implémentation actuelle | Problème |
|------|------------------------|---------|
| Submit loading | Texte du bouton change (`auth.loading`) + `disabled={loading}` | Pas de spinner, juste texte |

#### `src/components/profile/DeleteAccountModal.tsx` — Modal suppression

| État | Implémentation actuelle | Problème |
|------|------------------------|---------|
| Confirm loading | `<ActivityIndicator color="#fff" />` inline dans le bouton | Couleur hardcodée `#fff` |

---

## 2. Problèmes identifiés

### Incohérences visuelles
- **3 tailles d'icônes différentes** pour les états vides/erreur : 32px (search), 40px (home errorCard), 48px (favorites vide)
- **2 tailles de padding** pour les cards d'erreur : `spacing.sm` (home) vs `spacing.md` (favorites)
- **`EmptyState` existe mais n'est pas utilisé** dans favorites ni search — les screens ont recréé leur propre version inline
- **Spinner `ActivityIndicator`** utilisé brut dans search et favorites — pas animé de la même façon que `ScoreSkeleton`
- **Couleur hardcodée `#fff`** dans `DeleteAccountModal` au lieu de `colors.surface`

### Architecture
- Zéro `ErrorState` composant — chaque screen gère sa propre carte d'erreur avec son propre style
- Zéro `LoadingSpinner` composant centralisé — `ActivityIndicator` instancié directement partout
- `errorCard` style défini uniquement dans `index.tsx` styles, pas partagé

---

## 3. Composants à créer (cibles design)

| Composant | Usage | Remplace |
|-----------|-------|---------|
| `ErrorState` | Erreur réseau, service indisponible | Les 3 `errorCard` inline dans home, search, favorites |
| `LoadingSpinner` | Chargement générique (spinner branded) | Les `ActivityIndicator` nus dans search, favorites |
| `FavoritesSkeleton` | Chargement initial de la liste favoris | `ActivityIndicator` dans favorites |
| `SearchSkeleton` | Chargement des résultats de recherche | `ActivityIndicator` dans search |
| *(déjà fait)* `ScoreSkeleton` | Score home | ✅ OK |
| *(déjà fait)* `EmptyState` | États vides génériques | ✅ À brancher dans favorites + search |

---

## 4. Fichiers à modifier lors de la refacto

```
src/components/
  score-skeleton/ScoreSkeleton.tsx     ← garder tel quel
  empty-state/EmptyState.tsx           ← garder, brancher dans les screens
  error-state/ErrorState.tsx           ← À CRÉER
  loading-spinner/LoadingSpinner.tsx   ← À CRÉER
  favorites-skeleton/FavoritesSkeleton.tsx  ← À CRÉER
  search-skeleton/SearchSkeleton.tsx   ← À CRÉER (optionnel — peut être LoadingSpinner)

src/app/(tabs)/
  index.tsx        ← remplacer errorCard inline × 2 par <ErrorState>
  search.tsx       ← remplacer ActivityIndicator + états inline par composants
  favorites.tsx    ← remplacer ActivityIndicator + états inline par composants + <EmptyState>
  
src/app/(auth)/
  login.tsx        ← ajouter spinner dans le bouton submit

src/components/profile/
  DeleteAccountModal.tsx  ← colors.surface au lieu de #fff hardcodé
```

---

## 5. États screenshottés (référence design)

| # | État | Écran | Déclenchement |
|---|------|-------|---------------|
| 1 | ScoreSkeleton | Home | `isLoading = true` |
| 2 | Empty — aucun sommet | Home | Aucun sommet sélectionné |
| 3 | Erreur réseau | Home | `weekError` non-quota |
| 4 | Quota dépassé | Home | `weekError === 'QUOTA_EXCEEDED'` |
| 5 | Score refresh (opacité) | Home | `isRefreshing = true` |
| 6 | Search hint initial | Search | `query.length < 2` |
| 7 | Search loading | Search | `state.status === 'loading'` |
| 8 | Search erreur réseau | Search | `state.status === 'error'` |
| 9 | Search aucun résultat | Search | `state.status === 'success' && data.length === 0` |
| 10 | Favoris loading | Favorites | `state.status === 'loading'` |
| 11 | Favoris erreur réseau | Favorites | `state.status === 'error'` |
| 12 | Favoris vide | Favorites | `state.data.length === 0` |
| 13 | Login screen | Auth | Non connecté |
| 14 | Paywall | Modal | `showPaywall()` |
| 15 | Profil | Profile | État normal |
