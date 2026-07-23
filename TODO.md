# TODO — Cloudbreak

> Notes de chantier. Mis à jour au fil des sessions.

---

## En cours

_Rien en cours._

---

## Prochaines stories faisables (pure dev, sans Apple Dev ni VPS)

| Story | Contenu | Complexité | Status |
|---|---|---|---|
| **6.1** | Validation terrain — bouton confirmer/infirmer une prédiction depuis l'app | 🟡 Moyen — backend + mobile | `backlog` |

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
- [ ] **CGU/Privacy `cloudbreak-ops`** — contenu substantiel déjà rédigé (pas du placeholder générique), mais à valider/compléter avant soumission store :
  - `messages/fr.json` : `cgu.updated` / `privacy.updated` sont littéralement `"à définir avant publication"` → mettre la vraie date
  - Identité légale incomplète : `src/content/cgu.ts` section 1 dit juste "développeur individuel", pas de raison sociale / SIRET / adresse — à ajouter si le statut juridique l'exige (auto-entrepreneur, société...)
  - **Adresse email support pas encore choisie** — `mobile/src/constants/legalUrls.ts` lit `EXPO_PUBLIC_SUPPORT_EMAIL` (fallback `support@cloudbreak.app`, un placeholder). Une fois la vraie adresse décidée : définir la variable en prod (secrets EAS) + vérifier que c'est une boîte mail active et surveillée avant la review Apple
  - Une fois à jour : mettre à jour `mobile/src/constants/legalUrls.ts` avec les URLs définitives (`ops.cloudbreak.fr`) + App Store Connect (voir `ops/docs/story-1-legal-pages.md`)
- [ ] **Paywall — badge "Essai gratuit 7 jours"** — réintégré dans `PaywallHeader.tsx`/`PaywallCTA.tsx` (story 4.4) sans mécanisme StoreKit 2 réel pour l'honorer → risque de rejet Apple. Avant soumission : soit câbler un vrai essai via StoreKit 2 (story 4.3), soit retirer à nouveau le badge/CTA
- [ ] **Boutons DEV du Profil non i18n** (`mobile/src/app/(tabs)/profile.tsx`) — `DEV · CloudLayerViz Sandbox` / `DEV · Reset sommet sélectionné` / `DEV · Rejouer l'onboarding` sont des strings hardcodées (`__DEV__`-only, jamais vues en prod, mais violent la règle projet). Un fix existait sur une branche abandonnée à la demande de l'utilisateur — à refaire si on veut le corriger.
- [ ] **JWT Supabase stocké en clair dans AsyncStorage** (découvert lors de l'audit sécurité story 7.2) — `mobile/src/services/supabaseClient.ts:10` utilise `AsyncStorage` comme backend de session au lieu d'`expo-secure-store`. `docs/security.md` disait à tort que c'était déjà via SecureStore (corrigé). À migrer avant release 1.0.0.

---

## Mergé sur develop ✅

| Story | PR | Date |
|---|---|---|
| Story 2.3 — Permission géolocalisation opt-in sans blocage | [mobile PR #21](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/21) | 2026-07-22 |
| Story 1.7 — Taxonomie & instrumentation events PostHog (stub) | backend PR #14, [mobile PR #20](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/20) | 2026-07-21 |
| Story 7.1 — Parcours onboarding narratif | backend PR #13, [mobile PR #19](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/19) | 2026-07-21 |
| Story 7.2 — Mode offline-light & cache TTL | [mobile PR #18](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/18) | 2026-07-19 |
| Fix — Prix après essai gratuit dynamique intégré au bouton CTA paywall | mobile commit `6ec9ae5` (direct sur develop) | 2026-07-17 |
| Story 4.4 — Conformité Apple App Store | backend PR #12, mobile PR #17 | 2026-07-13 |
| Story 4.5 — Service web cloudbreak-ops (pages légales) | cloudbreak-ops PR #2 | 2026-07-13 |
| Story 7.3 — Système unifié états UI | mobile PR #15 | 2026-07-01 |
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

- Analytics / PostHog : taxonomie complète (~31 events) définie et câblée en stub DEBUG-only (story 1.7) — toujours pas de compte PostHog ni SDK réel, prévu story 1.5. Voir `docs/analytics-posthog.md`.
- Compte de test Premium : `pro@cloudbreak.app` → token dans `.vscode/settings.json`
- Reset quota Redis : `docker exec cloudbreak-redis redis-cli FLUSHDB`
- Subscription Premium en DB requise pour bypass quota : `make seed-test`
- `cloud_base` calculé via méthode Skew-T — pas un champ direct Open-Meteo
- Simuler un user sans sommet sélectionné : bouton **DEV · Reset sommet sélectionné** sur page Profil
