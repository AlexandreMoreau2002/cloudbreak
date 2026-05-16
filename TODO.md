# TODO — Cloudbreak

> Notes de chantier. Mis à jour au fil des sessions.

---

## En cours

- [ ] **PR #13 — feature/profile-page-ui** — à merger sur develop
  - Page profil redesignée (user card, banner pro, préférences apparence/langue)
  - PaywallContext partagé entre tous les onglets
  - Sandbox CloudLayerViz extrait vers `/sandbox`
  - 450 tests ✅, coverage mobile 100% ✅, TypeScript clean ✅, lint clean ✅
  - 201 tests backend ✅, coverage backend 100% ✅, Ruff clean ✅, mypy clean ✅

---

## Backlog stories (ordre de priorité MVP)

- [ ] **Story 4.3** — StoreKit 2 paiement réel — le banner paywall est là, mais le bouton ne fait rien
- [ ] **Story 7.1** — Onboarding narratif (3 slides, premier lancement, flag AsyncStorage) — post-MVP
- [ ] **Story 2.2** — Préférences notifications (toggles sur page profil)
- [ ] **Story 2.4** — Suppression compte RGPD
- [ ] **Story 3.6** — Deep link partage — bloqué par domaine + Apple Universal Links config

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
