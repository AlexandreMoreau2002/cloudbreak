# TODO — Cloudbreak

> Notes de chantier. Mis à jour au fil des sessions.

---

## En cours

_Rien en cours — toutes les stories MVP actives sont mergées._

---

## Prochaines stories faisables (pure dev, sans Apple Dev ni VPS)

| Story | Contenu | Complexité |
|---|---|---|
| **7.1** | Onboarding narratif — 3 slides au premier lancement, flag AsyncStorage | 🟢 Simple — pure UI |
| **2.3** | Géolocalisation opt-in — demande permission `expo-location`, "Pas maintenant" sans blocage | 🟢 Simple — un écran |
| **7.2** | Mode offline — bandeau "données de X min", message si cache expiré | 🟡 Moyen — déjà 80% fait |
| **6.1** | Validation terrain — bouton confirmer/infirmer une prédiction depuis l'app | 🟡 Moyen — backend + mobile |

## Backlog stories (bloquées)

- [ ] **Story 4.3** — StoreKit 2 paiement réel — 🔴 bloqué par compte Apple Dev (99$/an)
- [ ] **Epic 5** — Notifications push — 🔴 bloqué par compte Apple Dev (certificats APNs)
- [ ] **Story 2.2** — Préférences notifications — 🔴 bloqué par Epic 5
- [ ] **Epic 1** — Infra, CI/CD, monitoring — 🔴 bloqué par VPS
- [ ] **Story 3.6** — Deep link partage — 🔴 bloqué par domaine + Apple Universal Links config

---

## Dette technique

- [ ] **CLAUDE.md** — seuils du score incorrects dans la doc
  - `cloud_cover_low` bloquant : `< 45%` dans le code (pas `< 20%` comme écrit)
  - Verdict `"high"` : conditions strictes (score ≥ 70 + inversion + cloud_base ≥ 150m sous sommet + cloud_cover ≥ 55%)
  - Système de caps (`_apply_score_caps`) non documenté
- [ ] **Supabase "Confirm email"** — désactivé en dev, à réactiver avant release 1.0.0
- [ ] **Deep link partage** — URL placeholder `reminder_modify_before_mep@cloudbreak.com/sommet/{slug}` → vrai domaine + config Universal Links iOS
- [ ] **MountainBackground (login)** — visuellement insuffisant, rework avant release 1.0.0

---

## Mergé sur develop ✅

| Story | PR | Date |
|---|---|---|
| Story 2.4 — Suppression compte RGPD | backend PR #11, mobile PR #14 | 2026-05-16 |
| Story 4.1 — Quota freemium backend | backend PR #10 | session précédente |
| Story 4.2 — Paywall mobile | mobile PR #12 | session précédente |
| Story 3.4 — ScoreCard + écran principal | — | session précédente |
| Story 3.3 — Recherche & Favoris | — | session précédente |
| Story 3.2 — Peaks data (21 597 entrées) | — | session précédente |
| Story 2.1 — Auth Supabase | — | session précédente |

---

## Fichiers HTTP de test

| Fichier | Usage |
|---|---|
| `backend/http/score-quota.http` | Tests quota freemium (ACs 1-4) |
| `backend/http/user_token_plan.http` | Récupérer les JWTs Supabase |
| `backend/http/score.http` | Tests score génériques |
| `backend/http/peaks.http` | Tests recherche sommets |
| `backend/http/favorites.http` | Tests favoris |
| `backend/http/auth.http` | Tests auth |

---

## Notes vrac

- Compte de test Premium : `pro@cloudbreak.app` → token dans `.vscode/settings.json`
- Reset quota Redis : `docker exec cloudbreak-redis redis-cli FLUSHDB`
- Subscription Premium en DB requise pour bypass quota : `make seed-test`
- `cloud_base` calculé via méthode Skew-T — pas un champ direct Open-Meteo
- Simuler un user sans sommet sélectionné : bouton **DEV · Reset sommet sélectionné** sur page Profil
