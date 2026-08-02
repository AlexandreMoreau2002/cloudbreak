# TODO — Cloudbreak

> Notes de chantier. Mis à jour au fil des sessions.
> Dernière mise à jour : 2026-07-31.

---

## En cours

_Rien en cours._

---

## Cadrage produit — proposition de valeur

- Cloudbreak doit tenir trois promesses :
  - **Décision** : savoir s'il faut se déplacer.
  - **Compréhension** : expliquer pourquoi le score est bon ou mauvais — **promesse encore insuffisamment remplie aujourd'hui** ; les raisons du verdict et les indicateurs déterminants doivent être rendus plus clairs.
  - **Confiance** : montrer l'incertitude et apprendre des observations terrain.

---

## Prochaines stories faisables (pure dev, sans Apple Dev)

| Story | Contenu | Complexité | Status |
|---|---|---|---|
| **6.2** | Photo optionnelle validation terrain + calcul taux de précision par zone | 🟡 Moyen — backend (storage à choisir, probablement Supabase Storage) + mobile | `backlog` |
| **Epic 1** | Infra, CI/CD, monitoring — VPS OVH acquis (2026-07-31), **Dokploy déjà en place avec auto-deploy backend + ops en environnement dev** (voir Notes vrac). Reste : CI/CD complet mobile, monitoring, passage en environnement prod avec vrai domaine | 🟡 Moyen — partiellement fait, voir `CLAUDE.md` section "Infra prod" | `en partie fait` |

## Backlog stories (bloquées)

- [ ] **Story 4.3** — StoreKit 2 paiement réel — 🔴 bloqué par compte Apple Dev (99$/an)
- [ ] **Epic 5** — Notifications push — 🔴 bloqué par compte Apple Dev (certificats APNs)
- [ ] **Story 2.2** — Préférences notifications — 🔴 bloqué par Epic 5
- [ ] **Story 3.6** — Deep link partage — 🔴 bloqué par domaine + Apple Universal Links config (le VPS ne débloque pas le nom de domaine — à vérifier si un domaine a été pris avec le serveur OVH)

---

## Dette technique

- [ ] **Message de lancement sur la maturité du score** — avant la sortie, afficher une communication claire indiquant que Cloudbreak est une nouvelle application, que les prédictions sont encore en amélioration et que les retours terrain servent à calibrer le score. Ne pas présenter l'app comme une météo fiable ni comme une garantie ; relier le message au parcours de validation terrain et ajouter une mention de prudence pour les décisions de sécurité.

- [ ] **CLAUDE.md** — seuils du score incorrects dans la doc
  - `cloud_cover_low` bloquant : `< 45%` dans le code (pas `< 20%` comme écrit)
  - Verdict `"high"` : conditions strictes (score ≥ 70 + inversion + cloud_base ≥ 150m sous sommet + cloud_cover ≥ 55%)
  - Système de caps (`_apply_score_caps`) non documenté
- [ ] **Supabase "Confirm email"** — désactivé en dev, à réactiver avant release 1.0.0
- [ ] **Deep link partage** — route cible `https://merdenua.ge/sommet/{slug}` à remplacer/configurer avec le vrai domaine + Universal Links iOS
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
| Story 6.1 — Validation terrain (confirmation/infirmation) | backend [PR #15](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/15), mobile [PR #22](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/22) | 2026-07-25 |
| Fix — Bugs test manuel iPhone : favoris offline, onboarding, skeleton | mobile commit `34b42d0` (direct sur develop) | 2026-07-24 |
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
| `backend/http/validations.http` | Tests validation terrain (story 6.1) |
| `backend/http/auth.http` | Tests auth |

---

## Notes vrac

- Analytics / PostHog : taxonomie complète (~31 events) définie et câblée en stub DEBUG-only (story 1.7) — toujours pas de compte PostHog ni SDK réel. Voir `docs/analytics-posthog.md`.
- Compte de test Premium : `pro@cloudbreak.app` → token dans `.vscode/settings.json`
- Reset quota Redis : `docker exec cloudbreak-redis redis-cli FLUSHDB`
- Subscription Premium en DB requise pour bypass quota : `make seed-test`
- `cloud_base` calculé via méthode Skew-T — pas un champ direct Open-Meteo
- Simuler un user sans sommet sélectionné : bouton **DEV · Reset sommet sélectionné** sur page Profil

### Infra Dokploy — état au 2026-08-02 (VPS OVH acquis le 2026-07-31)

VPS OVH (`51.178.37.35`, host SSH configuré en local sous `vps-ovh-projets`, **serveur partagé avec d'autres projets perso** — snoroc, quest, etc., pas dédié à Cloudbreak). Dokploy installé et fonctionnel (Traefik intégré, HTTPS via nip.io pour l'instant).

**Deux services Cloudbreak déployés en environnement dev, CI/CD auto-deploy opérationnel de bout en bout (vérifié) :**

| Service | URL dev | Repo → branche suivie | Build | Webhook GitHub |
|---|---|---|---|---|
| `cloudbreak-backend` | https://cloudbreak-dev-api.51.178.37.35.nip.io | `cloudbreak-backend` → `develop` | Dockerfile | ✅ créé et testé (ping 200 OK) |
| `cloudbreak-ops` | https://cloudbreak-dev-ops.51.178.37.35.nip.io | `cloudbreak-ops` → `develop` | Nixpacks | ✅ créé et testé (déploiement réel déclenché et vérifié en ligne) |

**Historique de la session du 2026-08-02 (pour ne pas répéter le contexte à une future session) :**
1. Constat initial : `autoDeploy: true` était bien réglé dans Dokploy pour les deux apps, **mais aucun webhook GitHub n'existait réellement** (`gh api repos/.../hooks` vide) → les déploiements précédents étaient donc en réalité déclenchés manuellement depuis l'UI Dokploy, malgré le flag "auto".
2. `cloudbreak-ops` suivait en plus la mauvaise branche (`chore/deploy-node-engines` au lieu de `develop`) — ce commit contenait un fix nécessaire (`engines.node >=22`, sinon Nixpacks détecte Node 18 et le build de Next.js 16 échoue).
3. Actions faites : merge de `chore/deploy-node-engines` dans `develop` (branche supprimée après) + mise à jour du champ `customGitBranch` en DB Dokploy (Postgres interne, table `application`) vers `develop` + création des deux webhooks GitHub (`repos/{repo}/hooks`, événement `push`, URL `http://51.178.37.35:3000/api/deploy/{refreshToken}` — le refreshToken est propre à chaque app, visible dans la table `application` de la DB Dokploy) + déclenchement manuel d'un premier déploiement pour resynchroniser `ops` sur l'état courant de `develop`.
4. Vérifié en ligne : le footer de navigation CGU/Privacy (ajouté ce même jour) est bien présent sur https://cloudbreak-dev-ops.51.178.37.35.nip.io/fr/privacy.
5. Accès au serveur : `ssh vps-ovh-projets` (config dans `~/.ssh/config` en local), Dokploy accessible sur le port 3000 en interne, Postgres interne de Dokploy accessible via `docker exec` sur le conteneur `dokploy-postgres`. **Le token GitHub utilisé pour accéder au repo `cloudbreak-ops` est stocké en clair dans la config Dokploy (`customGitUrl`)** — normal pour son fonctionnement (accès repo privé), mais à savoir si jamais la DB Dokploy doit être exportée/partagée.

**Reste à faire :**
- [ ] URLs `nip.io` sont temporaires — à remplacer par un vrai domaine (`cloudbreak.fr` ou équivalent) une fois réservé, partout (mobile, docs, config Dokploy).
- [ ] Écrire une doc technique dédiée de la procédure Dokploy (setup fait manuellement hors du workflow de stories habituel, pas de story Epic 1 formellement close) si on veut la reproduire pour un environnement prod séparé.
- [ ] Monitoring (Better Stack / PostHog infra) toujours pas branché — reste dans le scope Epic 1.
