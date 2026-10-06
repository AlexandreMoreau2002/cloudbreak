# TODO — Cloudbreak (produit / chantier dev)

> Notes de chantier **produit et technique**. Mis à jour au fil des sessions.
> Le suivi **marketing / acquisition** vit dans [`docs/marketing.md`](docs/marketing.md) (plan + canaux + méthodes).
> La vue d'ensemble **environnements** (serveur, Supabase, Apple/EAS, observabilité, ce qui manque) vit dans [`docs/environnements.md`](docs/environnements.md).
> Côté Notion : page 🏠 TODO → sections `Cloudbreak — Produit` et `Cloudbreak — Marketing`.
> Dernière mise à jour : 2026-08-31.

---

## En cours

### Pré-release — fixes rangés par story (mis à jour 2026-10-06)

Fait :
- [x] **PR mobile #33** (outillage dev iOS) — squash-mergée sur `develop` le 2026-10-03.
- [x] **Story 4.3 — PR backend #22 et mobile #32 mergées le 2026-10-03.** Reste la clôture (ci-dessous).

#### Story 4.3 — StoreKit 2 (clôture)
- [x] **Produits visibles en Sandbox** (confirmé par Alex le 2026-10-06, testé contre le backend dev) : `fetchProducts` renvoie les 2 produits, paywall affiche 4,99 € / 44,99 €, plus d'erreur `store_unavailable`.
- [ ] **Côté App Store Connect** : capture « équipe de vérification » sur les deux produits, statut « Prêt à soumettre », Sandbox Tester en France (non vérifié).
- [x] **Prix annuel à trancher** : App Store Connect = 44,99 €, demandé = 49,99 €. Décision, puis changer le prix dans App Store Connect. Mensuel = 4,99 €. — tranché par Alex : **44,99 €** (mensuel 4,99 €), noté partout (docs, tests, CLAUDE.md, mémoire). Le « 49,99 € demandé » était une erreur de la story d'origine.
- [x] **Badge de réduction −33 % → −25 %** (paywall) : 44,99 € face à 12 × 4,99 € (59,88 €) = −25 %. — fait, mobile PR #34 (−25 %).
- [x] **Prix périmés** dans les tests (`index.test.tsx` : `5€`/`45€` ; `PaywallScreen.test.tsx` : `4,99 $` → `€`) et les docs (`prd.md`, `epics.md`, `mobile/docs/storekit.md`, `_bmad-output/…`). — fait, mobile PR #34 + docs de planification alignées (restent volontairement : brainstorming de mars et projections financières du PRD).
- [x] **Incohérence backend** : `/user/subscription` renvoie `premium` même quand `status = none` (mapping `pro` → `premium`), alors que le bypass du quota exige `trial` ou `active`. — fait, backend PR #26 (`app/domain/entitlement.py`, `plan` = premium seulement si actif et non expiré).
- [x] **Seed `pro@` / `test@`** (`backend/app/db/seed_test_users.py`) : écrit `plan = pro` et `status = none`, donc le quota n'est pas levé. Base locale corrigée à la main le 2026-10-04 ; le seed reste à corriger. — fait, backend PR #26 (`plan = premium`, `status = active`, +365 j). À rejouer en local pour que `test@` soit illimité : `make unseed-test && make seed-test`.
- [ ] **Tests Sandbox sur iPhone réel** (`docs/story-4-3-storekit-2-abonnements/guide-test.md`), une fois les produits visibles.
- [ ] **Fermer la story 4.3** : Notion, sprint-status, docs, bump des refs. Seulement après les tests Sandbox.
- Trial : 7 jours partout (code, locales, App Store Connect). Rien à changer.

#### Story 2.6 — Sign in with Apple (revalidation)
- [ ] **Annulation de la feuille Apple fait avancer le parcours** (ajouté 2026-10-04).
  - **Cause** : `AuthContext.signInWithApple` renvoie `null` sur annulation (`ERR_REQUEST_CANCELED`). `src/app/account.tsx` (fonction `apple()`) le lit comme un succès : `router.push('/survey')` en création, ou `complete()` en connexion.
  - **Test existant** : « traite l'annulation Apple comme une sortie sans erreur » (`AuthContext.test.tsx`, ~ligne 1407) attend `null`. Il verrouille le comportement actuel.
  - **Fix** : valeur distincte (`'cancelled'`) sur annulation, rien à faire dans `apple()` dans ce cas, test mis à jour.
  - **Fichiers** : `mobile/src/contexts/AuthContext.tsx`, `mobile/src/app/account.tsx`, `mobile/src/contexts/AuthContext.test.tsx`.
- [ ] **Session invitée supprimée côté Supabase = app bloquée** (ajouté 2026-10-04).
  - **Symptôme** : après suppression d'utilisateurs dans le dashboard Supabase, connexion Apple et code e-mail échouent sans message clair.
  - **Logs Supabase** : Apple `POST /token?grant_type=id_token` → 403 `User from sub claim in JWT does not exist` ; e-mail `PUT /user` → 403, même erreur.
  - **Cause** : l'app garde le JWT d'un compte invité supprimé. Pas de déconnexion visible pour un invité (`profile.tsx`, `!isAnonymous`), et réinstaller ne suffit pas (session dans le Keychain iOS).
  - **Contournement** : bouton DEV « Réinitialiser la session » (`EXPO_PUBLIC_DEV_TOOLS=true`, appelle `signOutToAnonymous`).
  - **Fix** : dans `AuthContext.tsx`, détecter ce 403 et repartir sur une session invitée neuve, sans intervention.

#### Story 4.6 — Build signée, TestFlight, polish pré-release
- [ ] **Build signée, App Store Connect, TestFlight** (draft : `_bmad-output/implementation-artifacts/4-6-build-signee-testflight.md`).
- [ ] **`EXPO_PUBLIC_SUPPORT_EMAIL`** dans l'environnement EAS de production, avant le build (`contact@cloudbreak-app.com`).
- [ ] **Assets App Store** : icône 1024×1024, captures FR/EN.
- [ ] **CGU / Privacy `cloudbreak-ops`** : dates réelles (`messages/fr.json`), identité légale (SIRET/adresse) à décider.
- [ ] **MountainBackground** (login) : rework visuel, insuffisant actuellement.

#### Nouvelle story — Nom utilisateur (numéro à attribuer)
- [ ] **Nom utilisateur** (avatar + nom dans le Profil). Pas de champ DB aujourd'hui : migration + endpoint + UI à concevoir (brainstorming puis plan).

#### PR « fixes » — hors story
- [ ] **Quota dépassé affiché comme une erreur réseau** (ajouté 2026-10-04).
  - **Symptôme** : sur l'accueil après réinitialisation de session, et sur la recherche (« mont blanc »), « Une erreur est survenue / Vérifie ta connexion » alors que le backend répond 429 (quota freemium).
  - **Fix** : (a) 429 → paywall, pas l'erreur réseau ; (b) garder le sommet déjà chargé à l'écran, ou proposer d'y revenir.
  - **Fichiers probables** : `mobile/src/hooks/useWeekData.ts`, `mobile/src/hooks/useSearch*` (à confirmer).
- [ ] **Cache offline ignoré quand le quota est dépassé** : un freemium qui a déjà consulté un sommet voit le paywall au lieu des données en cache (TTL 3 h, `mobile/src/hooks/useWeekData.ts`). Attendu : afficher le cache et proposer le paywall en complément. Régression de la story 7.2.
- [ ] **Libellé création de compte** : retirer « pour cette feature tu as besoin d'un compte ». Candidat : `mobile/src/locales/fr.ts:187` (« Crée un compte pour sauvegarder tes sommets. ») — à confirmer.

#### Infra / prérequis prod (hors story)
- [ ] **Webhook Apple (App Store Server Notifications V2)** : code, tests, doc et migration `e5f4a0000002` (colonne `apple_period_expires_at`, ordre des événements) prêts dans backend [PR #27](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/27) (374 tests OK, à merger après #26). **Fait côté Apple** : URL Sandbox `https://dev-api.cloudbreak-app.com/api/v1/webhooks/apple` enregistrée et relue dans App Store Connect (Production vide). **Non prouvé** : sélection Version 2 (non visible dans l'interface), notification de test acquittée en 204, événement qui modifie réellement `subscriptions`. Reste à faire : envoyer un test Apple depuis App Store Connect (ou l'API App Store Server) puis l'achat Sandbox sur iPhone (`backend/docs/apple-server-notifications/guide-test.md`). La migration s'applique toute seule au deploy de `develop`.
- [ ] **MEP : conteneur backend en mode production** — le dev tourne volontairement en `ENVIRONMENT=development` + `APPLE_ENVIRONMENT=Sandbox` ; la prod exige `Production` + identifiants Apple complets + fichier `.p8` (checklist : `docs/infra-serveur.md` section 8ter).
- [ ] **Sommets saisis à la main** (futur) : le seed remplace nom/GPS/altitude/région sur un `slug` existant. Avant d'ouvrir la saisie manuelle : colonne `source` (`seed`|`manual`) + chargement initial insert-only. Ne jamais automatiser le seed au deploy.
- [ ] **Backups hors VPS + test de restauration** (aujourd'hui `/srv/backups` sur la même machine, rétention 14 j).
- [ ] **Politique de confidentialité** : mentionner que l'email est conservé par le backend (`users.email`) en plus de Supabase, avant la 1.0.0 (`ops/src/content/`).
- [ ] **Cause de la disparition de l'image Docker du backend dev** (2026-10-05) : non établie (prune ? build d'un autre projet ?). Surveiller.
- [ ] **CI backend** : ajouter un job qui joue `alembic upgrade head` sur une base Postgres vide (aurait attrapé le bug `subscriptions`).
- [ ] **Logs réseau mobile** (`mobile/src/services/fetchService.ts` : response/http error/timeout, mode DEBUG) : non commités sur `feature/4-3-storekit-2-abonnements`, à intégrer dans une PR.
- [ ] **Rate-limit Traefik** sur `POST /api/v1/webhooks/apple` avant toute exposition prod.
- [ ] **Action opérateur** : définir `EXPO_PUBLIC_SUPPORT_EMAIL` (voir story 4.6 ci-dessus).

#### Autres
- [ ] **Monitoring Better Stack / PostHog infra** : toujours pas branché (Epic 1).
- [ ] **Message de lancement sur la maturité du score** (point 16 du sprint).

Dev local (rappel) :
- Simulateur : Xcode 27 empêche `i`. Méthode qui marche : `npm start`, puis `xcrun simctl openurl booted "…"` (cf. `mobile/docs/dev-ios-workflow.md`).
- Backend iPhone : `EXPO_PUBLIC_API_URL` dans `mobile/.env` (IP Wi-Fi du Mac avec le backend local, ou `https://dev-api.cloudbreak-app.com`). Après changement : `npm start -- --clear`.

**Sprint "finir le MVP"** — ouvert le 2026-09-27. Compte Apple Developer validé le 2026-09-27.
Bundle id iOS figé définitivement : `com.alexandremoreau.cloudbreak` (décision explicite, zéro
migration). Scope : tout le MVP (epics 1-7 + checklist pre-release), **epic 8 (growth V2) et
story 9.1 (landing) restent hors scope** comme décidé le 2026-08-08 — pas remis en cause.

Exécution via prompts Codex (Alexandre lance lui-même côté Codex CLI, Claude rédige les prompts),
**un point à la fois, pas de planning par jour**. Liste des points restants, dans l'ordre où on
les attaque (dépendances d'abord) :

1. [x] **Setup Apple / EAS** — `eas.json` (3 profils), certificats signing, app créée dans App
   Store Connect (nom FR "Cloudbreak – Mer de nuage"), `app.json` name/slug corrigés. **FAIT
   2026-09-28** — mobile PR [#30](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/30),
   plan écrit (`mobile/docs/superpowers/plans/2026-09-27-setup-eas-apple-storeconnect.md`), doc
   technique `mobile/docs/setup-eas-apple.md`, `product-audit.md`/`versions.md`/`sprint-status.yaml`
   à jour, mergée par Alexandre. Vérifié par Claude le 2026-09-28 — RAS sauf checklist Notion non
   confirmée (à vérifier par Alexandre, Claude n'a pas accès au connecteur Notion dans cette session).
2. [x] **Quota invité étage 1** — rate-limit IP + signal d'installation SecureStore. PR backend
   [#20](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/20) et mobile
   [#31](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/31), **mergées 2026-09-29**.
   Review Claude : 2 problèmes trouvés (`--forwarded-allow-ips=*` contournable, bucket rate-limit
   partagé si IP absente) — corrigés par Codex (`10.0.1.0/24` vérifié en SSH par Claude sur le VPS,
   503 propre) et revérifiés OK. **Incident collatéral découvert pendant la vérif** : `dev-api`
   était en 502 (crash-loop, `BREVO_API_KEY` non déclarée dans `Settings` → `ValidationError` au
   boot) — sans rapport avec cette PR. Root cause retrouvée : `BREVO_API_KEY` a été posée sur le
   service backend Dokploy le 2026-09-06 (`docs/superpowers/plans/2026-09-06-email-delivery-dev.md`,
   chantier "backend envoie ses propres e-mails via Brevo") mais le code correspondant n'a jamais
   été écrit (`docs/email.md` confirme : "future integration; it is not used"). Resté dormant tant
   que le conteneur n'avait pas redémarré. Corrigé par hotfix backend
   [#21](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/21) (`extra: "ignore"` sur
   `Settings`), mergé et redéployé le 2026-09-29 — `dev-api.cloudbreak-app.com/health` revérifié
   200 après chaque redeploy. **`BREVO_API_KEY` retirée du service backend Dokploy le 2026-09-29**
   (via l'API Dokploy `application.saveEnvironment`, les 12 autres variables inchangées, redeploy
   + `/health` revérifié 200 après coup) — chantier "backend envoie ses propres e-mails via Brevo"
   abandonné/jamais repris, cf. `docs/email.md`. **Si ce chantier est repris un jour** : ajouter à
   `_bmad-output/planning-artifacts/prd.md` section V2 avant de recréer la variable. Checklist
   Notion confirmée existante :
   [✅ Tests story 4.1 — Quota invité étage 1](https://app.notion.com/p/3e9964bda18581a5ab8ec99dbb2fdae2).
3. [~] **Story 4.3** — StoreKit 2 : code **mergé** le 2026-10-03 (backend #22, mobile #32). Reste la clôture : produits Sandbox, prix annuel, badge −25 %, tests Sandbox iPhone, fermeture. Détail : section « Pré-release » plus haut.
4. [ ] **Epic 5 — Notifications push** (5.1 infra → 5.2 alertes favoris/régionales → 5.3 validation
   terrain). Dépend du point 1 (fait).
5. [ ] **Story 3.6** — Universal Links iOS (`apple-app-site-association` + `associatedDomains`).
   Dépend du point 1 (fait), domaine déjà prêt.
6. [ ] **Story 2.6** — revalider Sign in with Apple en conditions réelles (déjà codé, jamais testé
   avec un vrai compte Apple Dev). Dépend du point 1 (fait).
7. [ ] **Quota invité étage 2** — App Attest/DeviceCheck. Dépend des points 1 (fait) et 2.
8. [ ] **Environnement Dokploy prod** — Postgres/Redis dédiés, `api.`/`ops.cloudbreak-app.com`, DNS.
9. [ ] **BetterStack** (story 1.5) — uptime + agrégation logs.
10. [ ] **Décision Supabase dev/prod** — un seul projet ou split, puis appliquer.
11. [ ] **Réactivation "Confirm email" Supabase** + test signup→confirm→login bout en bout (jamais
    testé réellement).
12. [ ] **MountainBackground** (login) — rework visuel, insuffisant actuellement.
13. [ ] **Assets App Store** — icône 1024×1024, screenshots FR/EN.
14. [ ] **CGU/Privacy `cloudbreak-ops`** — dates réelles (`messages/fr.json`) + identité légale
    (SIRET/adresse) à décider.
15. [ ] **Badge "essai gratuit 7 jours"** — décision : câbler un vrai essai StoreKit (dépend du
    point 3) ou retirer le badge.
16. [ ] **Message de lancement sur la maturité du score** — avant sortie publique.
17. [x] **PR mobile #28** (i18n boutons DEV Profil) — relue et mergée par Alexandre le 2026-09-28.
18. [ ] **QA manuelle complète** — epics 2/3/4/6 sur iPhone réel + les points non validés en réel
    listés dans `sprint-status.yaml` (persistance sondage 2.8, template reset password 2.7).
19. [ ] **TestFlight** — build soumis et approuvé. Cadré dans
    `_bmad-output/implementation-artifacts/4-6-build-signee-testflight.md` (story 4.6, draft).
20. [ ] **Tests StoreKit 4.3 sur iPhone réel** — Sandbox Tester, build dev-client, backend local
    sur la branche, achats/restauration/annulation (checklist `docs/story-4-3-storekit-2-abonnements/guide-test.md`).
21. [ ] **Corriger les prix périmés** — `5 €` / `45 €` (mocks `index.test.tsx`, docs PRD/epics/storekit.md) → `4,99 €` / `44,99 €` réels. L'app affiche déjà les prix Apple, rien à changer dans le rendu.

Déjà réglé cette semaine :
- [x] **Secure email change** — activé (ON) dans le Dashboard Supabase par Alexandre le 2026-09-27.
  Vérifié côté code (`mobile/src/contexts/AuthContext.tsx`, `beginEmailUpgrade`/`completeEmailUpgrade`)
  que le flux invité → compte est un premier réglage d'e-mail sur session anonyme sans e-mail
  existant, pas un changement d'un e-mail déjà confirmé — la double-confirmation qu'impose ce
  réglage ne s'applique pas à ce parcours. Aucune régression attendue.

Attention dérive Codex : lot 2.5/2.6/2.8 avait dérivé (pas de plan écrit, commits directs sur
`develop`). Chaque prompt Codex de ce sprint doit rappeler explicitement : branche `feature/`,
plan écrit avant code, checklist Notion, pas de merge sans le go d'Alexandre. Voir
`[[project-config-codex-claude]]` en mémoire.

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
- [ ] Migrer le stockage JWT `AsyncStorage` → `expo-secure-store` — sorti du brainstorming auth, traité comme correctif ciblé indépendant (dette sécurité déjà connue, voir Dette technique)

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

- [ ] **Story 4.3** — StoreKit 2 paiement réel — en review : configuration App Store Connect effectuée le 2026-10-03 ; tests Sandbox et soumission Apple restent à faire
- [ ] **Epic 5** — Notifications push — 🟢 débloqué (certificats APNs, compte Apple Dev validé le 2026-09-27)
- [ ] **Story 3.6** — Deep link partage — URL déjà sur `cloudbreak-app.com` ; Universal Links (`associatedDomains` + `apple-app-site-association`) maintenant faisable, compte Apple Dev validé le 2026-09-27

## Dropé (décision explicite utilisateur)

- **Story 6.2** — Photo optionnelle validation terrain + calcul taux de précision par zone — dropée le 2026-08-08, pas de priorité définie pour une reprise future.

## Post-MVP (décidé le 2026-08-08, ne pas commencer avant sortie MVP)

- **Monitoring & tracking utilisateur complet** : PostHog branché pour de vrai (funnels, rétention, session replay, décisions business — déjà scaffoldé en stub story 1.7, déjà noté V2 dans `prd.md`) + **Sentry** (error/crash tracking, nouveau — ajouté à `prd.md` section V2). Pas de Grafana : le VPS partagé (2 vCPU/3.7 Go RAM, déjà eu un incident de charge) ne doit pas porter une stack métriques self-hosted en plus de BetterStack. Voir `_bmad-output/planning-artifacts/prd.md` section V2.

---

## Dette technique

- [ ] **Message de lancement sur la maturité du score** — avant la sortie, afficher une communication claire indiquant que Cloudbreak est une nouvelle application, que les prédictions sont encore en amélioration et que les retours terrain servent à calibrer le score. Ne pas présenter l'app comme une météo fiable ni comme une garantie ; relier le message au parcours de validation terrain et ajouter une mention de prudence pour les décisions de sécurité.

- [x] **CLAUDE.md** — seuils du score et version FastAPI — RÉSOLU 2026-09-26 (seuils déjà corrects dans le fichier ; « FastAPI 0.135 » → `0.115` pour coller au `requirements.txt`).
- [ ] **Supabase "Confirm email"** — désactivé en dev, à réactiver avant release 1.0.0
- [ ] **Deep link partage** — URL corrigée sur `https://cloudbreak-app.com/sommet/{slug}` (2026-08-31). Reste : Universal Links iOS (`.well-known/apple-app-site-association` + `associatedDomains`) — bloqué compte Apple Dev
- [ ] **MountainBackground (login)** — visuellement insuffisant, rework avant release 1.0.0
- [ ] **CGU/Privacy `cloudbreak-ops`** — contenu substantiel déjà rédigé (pas du placeholder générique), mais à valider/compléter avant soumission store :
  - `messages/fr.json` : `cgu.updated` / `privacy.updated` sont littéralement `"à définir avant publication"` → mettre la vraie date
  - Identité légale incomplète : `src/content/cgu.ts` section 1 dit juste "développeur individuel", pas de raison sociale / SIRET / adresse — à ajouter si le statut juridique l'exige (auto-entrepreneur, société...)
  - [x] **E-mail support production** — `contact@cloudbreak-app.com` publié ; routage entrant et envoi Gmail/Brevo (« send-as ») validés manuellement le 2026-09-12. Procédure : [`docs/email-support/fonctionnement.md`](docs/email-support/fonctionnement.md).
  - [ ] **Action opérateur restante** — définir `EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com` dans l’environnement EAS de production avant le premier build de production.
  - Une fois à jour : mettre à jour `mobile/src/constants/legalUrls.ts` avec les URLs définitives (`ops.cloudbreak.fr`) + App Store Connect (voir `ops/docs/story-1-legal-pages.md`)
- [x] **Paywall — badge "Essai gratuit 7 jours"** — mécanisme StoreKit 2 réel implémenté dans les PR Story 4.3 et offres Apple d'une semaine configurées le 2026-10-03. Le badge reste conditionné à l'offre renvoyée par StoreKit ; preuve Sandbox sur appareil réel encore requise avant soumission.
- [ ] **Boutons DEV du Profil non i18n** (`mobile/src/app/(tabs)/profile.tsx`) — `DEV · CloudLayerViz Sandbox` / `DEV · Reset sommet sélectionné` / `DEV · Rejouer l'onboarding` sont des strings hardcodées (`__DEV__`-only, jamais vues en prod, mais violent la règle projet). Un fix existait sur une branche abandonnée à la demande de l'utilisateur — à refaire si on veut le corriger.
- [x] **JWT Supabase stocké en clair dans AsyncStorage** — RÉSOLU 2026-09-06 (Keychain iOS via `expo-secure-store`, migration auto, voir `mobile/docs/security.md`). Ancien constat : (découvert lors de l'audit sécurité story 7.2) — `mobile/src/services/supabaseClient.ts:10` utilise `AsyncStorage` comme backend de session au lieu d'`expo-secure-store`. `docs/security.md` disait à tort que c'était déjà via SecureStore (corrigé). À migrer avant release 1.0.0.
- [x] **P0 Quota invité contournable (étage 1)** — RÉSOLU 2026-09-29, PR backend
  [#20](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/20) et mobile
  [#31](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/31) mergées : quota
  installation SecureStore + rate-limit IP (`10.0.1.0/24` de confiance, vérifié en SSH).
  **Étage 2 à planifier** : App Attest/DeviceCheck pour le device-binding (TODO.md point 7).
- [x] **P0 `Secure email change = OFF` contournable hors UI mobile** — RÉSOLU 2026-09-27 par Codex (durci côté Dashboard Supabase / config).

---

## Mergé sur develop ✅

| Story | PR | Date |
|---|---|---|
| Fix — serveur dev remis en ligne (image Docker perdue, `ENVIRONMENT=production` vs Sandbox, table `subscriptions` jamais créée par Alembic, `peaks` vide) + migrations au démarrage du conteneur | backend [PR #23](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/23) | 2026-10-05 |
| Feat — `users.email` (pont UUID Supabase ↔ compte lisible) | backend [PR #24](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/24) | 2026-10-06 |
| Story 2.2 — Préférences de notifications (3 toggles indépendants) + réalignement du Profil sur la maquette du 15/09 (sections, `SettingsRow` `tone`/`disabled`/`chevron`, footer version) | backend [PR #19](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/19), mobile [PR #27](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/27) | 2026-09-16 |
| Lot auth 2.5+2.6+2.7+2.8 (parcours compte différé, Sign in with Apple, mot de passe oublié, mini-sondage) + durcissement sécurité/robustesse post-merge (JWT issuer/audience, retry provisioning verify/account, timeout HTTP réel, garde env Supabase) | backend [PR #18](https://github.com/AlexandreMoreau2002/cloudbreak-backend/pull/18), mobile [PR #25](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/25) | 2026-09-12 |
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
