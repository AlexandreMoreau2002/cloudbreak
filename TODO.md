# TODO — Cloudbreak (produit / chantier dev)

> Notes de chantier **produit et technique**. Mis à jour au fil des sessions.
> Le suivi **marketing / acquisition** vit dans [`docs/marketing.md`](docs/marketing.md) (plan + canaux + méthodes).
> La vue d'ensemble **environnements** (serveur, Supabase, Apple/EAS, observabilité, ce qui manque) vit dans [`docs/environnements.md`](docs/environnements.md).
> Côté Notion : page 🏠 TODO → sections `Cloudbreak — Produit` et `Cloudbreak — Marketing`.
> Dernière mise à jour : 2026-09-07.

---

## En cours

**Retour quota → compte — 2026-09-08 :** boucle reproduite dans l'effet Home :
`quotaExceeded` reste vrai et les changements de callbacks lors de la navigation relancent
`requireAccount`. Correctif appliqué : consommation unique par épisode, protection du focus
et retour vers l'onglet existant avec `dismissTo`. 897 tests / 108 suites passent, lint vert.
Simulateur : sortie du mur quota puis réouverture explicite et deuxième retour Home vérifiés.
Review fonctionnelle/sécurité sans défaut restant sur ce delta ; imports corrigés après review.
Les retours Profil/Favoris sont couverts automatiquement ; à retester manuellement.
TypeScript reste bloqué par 6 erreurs de routes préexistantes (`account`, `survey`, pushes
`AccountGateContext`) : les déclarations Expo générées ne contiennent pas les routes applicatives.
Le bandeau DEBUG `Network request failed` reste observé et à diagnostiquer séparément.
Plan : `docs/superpowers/plans/2026-09-08-quota-account-loop.md` ; aucun changement du cache ou quota serveur.

**Lot auth 2.5/2.6/2.7/2.8 — mergé sur develop le 2026-09-12** (backend PR #16, mobile
PR #23, squash). Reset mot de passe (story 2.7) livré dans la foulée. Audit FR/EN des
messages d'erreur auth/e-mail livré en doc : `mobile/docs/audit-erreurs-auth-email-fr-en.md`.
Réception support (Cloudflare Email Routing) abandonnée au profit d'ImprovMX — Alexandre
gère `contact.cloudbreak@gmail.com` en relais de `contact@cloudbreak-app.com` de son côté,
zéro code impliqué.

**Durcissement sécurité/robustesse post-merge auth — mergé sur develop le 2026-09-12**
(backend PR #17, mobile PR #24, squash). Couvre : JWT issuer/audience, retry provisioning
distinct sur verify.tsx/account.tsx (login+Apple), timeout HTTP réel (AbortController),
garde env Supabase. Reviews `cloudbreak-dev-reviewer`+`cloudbreak-security` passées des
deux côtés (SECURE). Détail : `backend/docs/fix-durcissement-jwt-issuer-audience.md`,
`mobile/docs/story-hardening-securite-post-merge.md`.

**Reste ouvert — chantier séparé, plus lourd :**
- [ ] **P0 — quota invité contournable** (`backend/app/services/quota.py:59`, clé Redis
  `quota:{user_id}:{date}`) : recréer une session anonyme = nouvel UUID = quota reset.
  Anti-abus backend/edge (rate-limit + signal d'installation d'abord, App Attest/DeviceCheck
  en V1.1 si besoin, après compte Apple Dev).
- [ ] **Secure email change = OFF contournable hors UI mobile** : à vérifier côté config
  Supabase Dashboard — Alexandre s'en charge si un réglage doit changer.

**Lot auth 2.5/2.6/2.8 — Claude a repris la finition (2026-09-06)** (Codex inutilisable, limite
atteinte en 3 min). Branche `feature/parcours-compte-2-5-2-6-2-8` (backend PR #16, mobile PR #23).
Fait cette session :
- WIP Codex adopté et commité (recherche invitée sans token, onboarding étape sommet ErrorState+Réessayer).
- Bug « Se déconnecter » : `signOutToAnonymous` clôt d'abord la session courante (plus de blocage sur l'ancien compte).
- Écrans `/account` `/verify` `/survey` : padding/gouttières handoff (SafeAreaView → View + insets), champs e-mail/mdp identiques, JSX décompressé. `AccountForm` décompressé.
- **RGPD** : nouveau `PATCH /api/v1/user/preferences` (backend, non terminal) + `GET /me` expose `newsletter_opt_in` + toggle Profil → Compte → Newsletter (`useNewsletterConsent`).
- **Parcours création e-mail réactivé** (2026-09-06) : `beginEmailUpgrade`/`completeEmailUpgrade`/`resendEmailUpgrade` rebranchés sur Supabase (`updateUser({email})` → `verifyOtp({type:'email_change'})` → `updateUser({password})` → provisioning). Seule inconnue : si l'instance refuse `email_change`, basculer sur `signup` (1 ligne). Guide de test réécrit : `mobile/docs/story-2-5-manual-test-guide.md`.
- **JWT → Keychain** : `secureSessionStorage` (expo-secure-store, fragmenté, migration auto depuis AsyncStorage) — dette story 2-1 close. Plugin `expo-secure-store` dans `app.config.ts` → **rebuild natif requis**.
- Validate vert : backend 248 tests / 100 % cov, mobile 843 tests + tsc + lint + build:check. PR #16 et #23 mises à jour.
- Restant utilisateur : préflight Supabase (Confirm email OTP `{{ .Token }}`, provider Apple, Anonymous ON — Anonymous déjà activé), rebuild natif + test E2E manuel, page Notion checklist, puis clôture (merge squash + refs submodules + `docs/versions.md`).

**Dépannage lancement iOS — 2026-09-05 :** le lot auth est présent sur la branche mobile
`feature/parcours-compte-2-5-2-6-2-8`. Le simulateur utilisait un ancien binaire sans
`ExpoCrypto` / `ExpoAppleAuthentication` : pods réinstallés, prébuild iOS sans nettoyage
pour synchroniser la capability Apple, reconstruction native. L'onboarding s'affiche à
nouveau sans écran rouge ; 48 tests AuthContext passent. Les erreurs d'exports des routes
et de LanguageProvider provenaient de l'import natif qui échouait, sans correctif métier
nécessaire. Procédure ajoutée au README mobile et à la doc story 2.6. Le parcours complet
invité → compte et le login Apple réel restent à valider ; aucune story clôturée ici.

**Migration domaine `cloudbreak-app.com` — terminée le 2026-08-09 :**

Domaine acheté par l'utilisateur, remplace les URLs `nip.io` temporaires (et l'ancienne hypothèse
`cloudbreak.fr` jamais achetée). Schéma de sous-domaine calqué sur **Snoroc** : `dev-api.<domaine>` /
`dev-ops.<domaine>` pour le dev, `api.<domaine>` / `ops.<domaine>` réservés à une future prod.
Détail complet : `docs/infra-serveur.md` section 4bis.

| | Prod (futur) | Dev (actuel) |
|---|---|---|
| Backend | `api.cloudbreak-app.com` | `dev-api.cloudbreak-app.com` |
| Ops | `ops.cloudbreak-app.com` | `dev-ops.cloudbreak-app.com` |

- [x] Repo mis à jour ET **commité le 2026-08-31** :
  - mobile `develop` `719d649` — fallbacks `fetchService.ts` / `legalUrls.ts` / `.env.example` + tests (736 verts, tsc + lint OK)
  - ops `develop` `39d2caf` — `README.md`
  - backend `develop` `b62d6cd` — commit infra Dokploy (poussé)
  - racine — `CLAUDE.md`, `AGENTS.md`, `docs/infra-serveur.md`, `docs/versions.md`, planning docs, refs submodules
- [x] **DNS** — 2 enregistrements A créés chez OVH (`dev-api`, `dev-ops` → `51.178.37.35`), fait par l'utilisateur
- [x] **Dokploy — domaines** — `dev-api`/`dev-ops.cloudbreak-app.com` ajoutés (HTTPS Let's Encrypt),
  anciens domaines `nip.io` retirés, fait par l'utilisateur
- [x] **Fix port backend** — domaine Backend créé avec le port par défaut Dokploy (3000) au lieu du
  port réel du container FastAPI (8000) → 502 corrigé en base + fichier Traefik généré (via SSH,
  demande explicite de l'utilisateur). Point de vigilance noté dans `docs/infra-serveur.md` pour tout
  futur domaine sur ce projet.
- [x] **Renommer l'environnement Dokploy** `production` → `dev` sur le projet `cloudbreak` — l'UI
  Dokploy ne propose pas de renommage (juste "Create Environment"), fait directement en base via SSH
  (demande explicite de l'utilisateur)
- [x] **Snoroc — même correction** : environnement `development` → `dev` (demande explicite de
  l'utilisateur, pour homogénéiser le nommage entre projets)
- [x] **Notion** — page "🖥️ Serveur OVH" mise à jour (Cloudbreak : domaine + env renommé ; Snoroc :
  env renommé)
- [x] Vérifié en ligne : `dev-api.cloudbreak-app.com/health` → 200, `dev-ops.cloudbreak-app.com/fr/privacy` → 200
- [x] **Domaine confirmé par l'utilisateur (2026-08-31) : `cloudbreak-app.com` est LE domaine, tout
  est dessus** (`api.`, `ops.`, `dev-*`, landing, deep links). Docs alignées : `aso-landing-page.md`,
  `pre-release-checklist.md`, `prd.md`, `epics.md` (story 3.6), `INDEX.md`, `CLAUDE.md`,
  `ops/docs/story-1-legal-pages.md`, `mobile/docs/story-4-4-*.md`. Les artifacts de stories déjà
  mergées (`implementation-artifacts/4-3-*`, `4-4-*`) gardent leurs anciennes URLs comme trace
  historique — on n'y touche pas. Bundle id iOS `com.cloudbreak.app` conservé (identifiant valide,
  pas une URL, pas besoin de matcher le domaine).

→ **Migration domaine : CLOSE.** Code + infra + docs alignés. Seule config restante = Universal
  Links iOS (story 3.6), bloquée compte Apple Dev.

**Chantier auth — décisions prises le 2026-08-08, recadré le 2026-09-04, brainstorming `superpowers:brainstorming` en cours (design pas encore validé) :**

Suivi détaillé dans `epics.md` Epic 2 (stories 2.5, 2.6, 2.7, 2.8) et `sprint-status.yaml`. Ne pas redemander l'arbitrage produit à une future session — déjà tranché avec l'utilisateur :

- [ ] **Stories 2.5 + 2.6 + 2.8 — un seul écran, une seule spec, 3 stories d'implémentation.** L'utilisateur a demandé (2026-09-04) de concevoir "Connexion & Création de compte" comme un tout : le mur différé (2.5) ne peut pas être designé sans savoir comment Apple (2.6) et le mini-sondage (2.8) s'y insèrent.
  - [ ] **Story 2.5 — Mur différé** : onboarding → recherche/score gratuit consultable sans compte → compte demandé seulement pour sauver un favori / dépasser le 1er check / activer une alerte. Remplace le mur actuel (compte obligatoire juste après l'onboarding). Impact : `AuthGuard` (`mobile/src/app/_layout.tsx`), logique quota freemium (actuellement liée à un `user_id` authentifié — à vérifier comment un check anonyme s'articule avec le quota Redis 1/jour). Piste technique qui se dégage : Supabase Anonymous Auth (session anonyme dès le 1er lancement, upgradée en compte réel au signup, même `user_id` conservé) plutôt qu'un device-id maison — moins de code, funnel PostHog gratuit (même identifiant avant/après conversion)
  - [ ] **Story 2.6 — Sign in with Apple**, décidé pour avant sortie MVP (pas une obligation Apple ici — pas de login social tiers existant — mais choix produit pour réduire la friction). `expo-apple-authentication` + Supabase provider Apple OAuth. Guard `Platform.OS === 'ios'` dès le départ (Android prévu V2)
  - [ ] **Story 2.8 — Mini-sondage post-création de compte** (nouvelle idée soulevée le 2026-09-04) : 2-3 questions optionnelles/skippables, affichées uniquement à la création d'un compte (email ou Apple), jamais à une reconnexion. Contenu des questions encore à définir avec l'utilisateur. Dépend de la résolution du provisioning utilisateur backend (voir point ci-dessous)
- [ ] **Découverte pendant le brainstorming 2.5** : le backend n'a **aucun modèle `user.py`** ni trigger `auth.users → public.users` identifié — le signup autonome (`supabase.auth.signUp`, câblé côté mobile depuis la story 2.1) n'a jamais été testé bout en bout par l'utilisateur, qui crée les comptes à la main dans Supabase. À couvrir dans la spec 2.5/2.6/2.8 : provisioning de l'utilisateur côté backend au signup.
- [ ] **Story 2.7 — Mot de passe oublié** (actuellement inexistant, vrai trou pas un post-MVP) — Supabase reset password email. **Hors périmètre du design 2.5/2.6/2.8** : juste réserver un lien "mot de passe oublié" dans le layout, sans concevoir le flow derrière. **Avant d'arbitrer SMTP custom vs email Supabase générique : l'utilisateur doit tester son propre serveur mail** (capacité d'envoi à valider de son côté)
- [x] Migrer le stockage JWT `AsyncStorage` → `expo-secure-store` — fait le 2026-09-06 dans le lot auth (`secureSessionStorage`, fragmenté + migration auto). Rebuild natif requis.

Après la spec écrite et approuvée (`docs/superpowers/specs/`) → `superpowers:writing-plans` puis `superpowers:subagent-driven-development`, avec `cloudbreak-security` en review vu que ça touche JWT/Supabase/data.

**Monitoring post-MVP** (Epic 1, story 1.8) : PostHog réel + Sentry, pas de Grafana — voir section "Post-MVP" plus bas.

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
| **Epic 1** | Infra, CI/CD, monitoring — VPS OVH acquis (2026-07-31), **Dokploy déjà en place avec auto-deploy backend + ops en environnement dev** (voir Notes vrac). Reste : CI/CD complet mobile, passage en environnement prod avec vrai domaine. Monitoring avancé (PostHog réel, Sentry) volontairement **exclu du MVP** — voir section "Post-MVP" ci-dessous | 🟡 Moyen — partiellement fait, voir `CLAUDE.md` section "Infra prod" | `en partie fait` |

## Backlog stories (bloquées)

- [ ] **Story 4.3** — StoreKit 2 paiement réel — 🔴 bloqué par compte Apple Dev (99$/an)
- [ ] **Epic 5** — Notifications push — 🔴 bloqué par compte Apple Dev (certificats APNs)
- [ ] **Story 2.2** — Préférences notifications — 🔴 bloqué par Epic 5
- [ ] **Story 3.6** — Deep link partage — URL déjà sur `cloudbreak-app.com` ; reste 🔴 bloqué par la config Apple Universal Links (`associatedDomains` + `apple-app-site-association`), donc compte Apple Dev

## Dropé (décision explicite utilisateur)

- **Story 6.2** — Photo optionnelle validation terrain + calcul taux de précision par zone — dropée le 2026-08-08, pas de priorité définie pour une reprise future.

## Post-MVP (décidé le 2026-08-08, ne pas commencer avant sortie MVP)

- **Monitoring & tracking utilisateur complet** : PostHog branché pour de vrai (funnels, rétention, session replay, décisions business — déjà scaffoldé en stub story 1.7, déjà noté V2 dans `prd.md`) + **Sentry** (error/crash tracking, nouveau — ajouté à `prd.md` section V2). Pas de Grafana : le VPS partagé (2 vCPU/3.7 Go RAM, déjà eu un incident de charge) ne doit pas porter une stack métriques self-hosted en plus de BetterStack. Voir `_bmad-output/planning-artifacts/prd.md` section V2.

---

## Dette technique

- [ ] **Message de lancement sur la maturité du score** — avant la sortie, afficher une communication claire indiquant que Cloudbreak est une nouvelle application, que les prédictions sont encore en amélioration et que les retours terrain servent à calibrer le score. Ne pas présenter l'app comme une météo fiable ni comme une garantie ; relier le message au parcours de validation terrain et ajouter une mention de prudence pour les décisions de sécurité.

- [ ] **CLAUDE.md** — seuils du score incorrects dans la doc
  - `cloud_cover_low` bloquant : `< 45%` dans le code (pas `< 20%` comme écrit)
  - Verdict `"high"` : conditions strictes (score ≥ 70 + inversion + cloud_base ≥ 150m sous sommet + cloud_cover ≥ 55%)
  - Système de caps (`_apply_score_caps`) non documenté
- [ ] **Supabase "Confirm email"** — actif dans le projet hébergé de développement ; avant la
  release 1.0.0, maintenir et revérifier ce réglage ainsi que la configuration SMTP Brevo et les
  templates Auth personnalisés. La configuration de production reste à créer séparément ;
  ajouter les secrets backend dans Dokploy seulement quand les e-mails émis par le backend
  existent, puis redéployer ce backend. Aucun Supabase local n'existe encore (CLI installé,
  sans config ni conteneurs).
- [ ] **Deep link partage** — URL corrigée sur `https://cloudbreak-app.com/sommet/{slug}` (2026-08-31). Reste : Universal Links iOS (`.well-known/apple-app-site-association` + `associatedDomains`) — bloqué compte Apple Dev
- [ ] **MountainBackground (login)** — visuellement insuffisant, rework avant release 1.0.0
- [ ] **CGU/Privacy `cloudbreak-ops`** — contenu substantiel déjà rédigé (pas du placeholder générique), mais à valider/compléter avant soumission store :
  - `messages/fr.json` : `cgu.updated` / `privacy.updated` sont littéralement `"à définir avant publication"` → mettre la vraie date
  - Identité légale incomplète : `src/content/cgu.ts` section 1 dit juste "développeur individuel", pas de raison sociale / SIRET / adresse — à ajouter si le statut juridique l'exige (auto-entrepreneur, société...)
  - **Adresse email support pas encore choisie** — `mobile/src/constants/legalUrls.ts` lit `EXPO_PUBLIC_SUPPORT_EMAIL` (fallback `support@cloudbreak.app`, un placeholder). Une fois la vraie adresse décidée : définir la variable en prod (secrets EAS) + vérifier que c'est une boîte mail active et surveillée avant la review Apple
  - [ ] Avant de publier l'adresse de support : configurer Cloudflare DNS/Email Routing, une boîte de destination vérifiée, `contact@cloudbreak-app.com` et un domaine d'envoi de production.
  - Une fois à jour : mettre à jour `mobile/src/constants/legalUrls.ts` avec les URLs définitives (`ops.cloudbreak.fr`) + App Store Connect (voir `ops/docs/story-1-legal-pages.md`)
- [ ] **Paywall — badge "Essai gratuit 7 jours"** — réintégré dans `PaywallHeader.tsx`/`PaywallCTA.tsx` (story 4.4) sans mécanisme StoreKit 2 réel pour l'honorer → risque de rejet Apple. Avant soumission : soit câbler un vrai essai via StoreKit 2 (story 4.3), soit retirer à nouveau le badge/CTA
- [ ] **Boutons DEV du Profil non i18n** (`mobile/src/app/(tabs)/profile.tsx`) — `DEV · CloudLayerViz Sandbox` / `DEV · Reset sommet sélectionné` / `DEV · Rejouer l'onboarding` sont des strings hardcodées (`__DEV__`-only, jamais vues en prod, mais violent la règle projet). Un fix existait sur une branche abandonnée à la demande de l'utilisateur — à refaire si on veut le corriger.
- [x] ~~JWT Supabase stocké en clair dans AsyncStorage~~ — **résolu 2026-09-06** (lot auth) : `supabaseClient.ts` utilise `secureSessionStorage` (expo-secure-store / Keychain iOS, fragmenté, migration transparente depuis AsyncStorage + purge du token en clair).

---

## Mergé sur develop ✅

| Story | PR | Date |
|---|---|---|
| Durcissement sécurité/robustesse post-merge auth — JWT iss/aud, retry provisioning, timeout HTTP, garde env | backend [PR #17](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/17), mobile [PR #24](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/24) | 2026-09-12 |
| Stories 2.5+2.6+2.7+2.8 — parcours compte différé, Apple, mot de passe oublié, sondage | backend [PR #16](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/16), mobile [PR #23](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/23) | 2026-09-12 |
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

> **Référence à jour de l'infra serveur : `docs/infra-serveur.md`** (accès, apps déployées, CI/CD, points de vigilance). Cette section est le journal détaillé des sessions de config — utile pour le contexte historique, mais pas la source à consulter en premier.

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
- [x] URLs `nip.io` remplacées par `cloudbreak-app.com` (DNS + Dokploy + code des 3 submodules, commité le 2026-08-31 — voir section "En cours").
- [x] Écrire une doc technique dédiée de la procédure Dokploy — fait le 2026-08-08, voir `docs/infra-serveur.md`.
- [ ] Monitoring (Better Stack / PostHog infra) toujours pas branché — reste dans le scope Epic 1.
- [x] Favicon de dev-ops.cloudbreak-app.com — véritable icône de marque Cloudbreak (`mobile/assets/images/icon.png`)
  convertie en ICO multi-tailles, commit `ops` `c60e1a9` sur `develop` (2026-09-07) ; auto-déploiement Dokploy déclenché par push.
