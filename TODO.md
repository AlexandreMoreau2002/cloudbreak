# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-10-06. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.

---

## 1. Features urgentes (dans l'ordre)

1. **Clôturer la story 4.3 (StoreKit 2)** — détail en §5.
2. **Build signée + TestFlight** (story 4.6, brouillon `_bmad-output/implementation-artifacts/4-6-build-signee-testflight.md`).
3. **Notifications push** (epic 5 : 5.1 infra → 5.2 alertes → 5.3 validation terrain) — débloqué (compte Apple Dev validé).
4. **Universal Links iOS** (story 3.6) — `apple-app-site-association` + `associatedDomains`, domaine prêt.
5. **Environnement Dokploy de production** — checklist `docs/infra-serveur.md` §8ter.

## 2. Fixes à faire

**App**
- [ ] **Annulation de la feuille Apple fait avancer le parcours** (story 2.6) : `AuthContext.signInWithApple` renvoie `null` sur `ERR_REQUEST_CANCELED`, que `src/app/account.tsx` (`apple()`) lit comme un succès. Fix : valeur distincte (`'cancelled'`), ne rien faire dans `apple()`, adapter le test « traite l'annulation Apple… » (`AuthContext.test.tsx`).
- [ ] **Session invitée supprimée côté Supabase = app bloquée** : le JWT d'un invité supprimé donne 403 `User from sub claim in JWT does not exist` (Apple `POST /token`, e-mail `PUT /user`) sans message. Fix : détecter ce 403 dans `AuthContext.tsx` et repartir sur une session invitée neuve. Contournement dev : bouton « Réinitialiser la session ».
- [ ] **Quota dépassé (429) affiché comme une erreur réseau** (accueil après reset de session, recherche) : 429 → paywall, garder le sommet déjà chargé. Fichiers : `mobile/src/hooks/useWeekData.ts`, hooks de recherche.
- [ ] **Cache offline ignoré quand le quota est dépassé** (régression 7.2) : un freemium voit le paywall au lieu du cache (TTL 3 h). Attendu : afficher le cache puis proposer le paywall.
- [ ] **Libellé de création de compte** : retirer « pour cette feature tu as besoin d'un compte » (candidat : `mobile/src/locales/fr.ts` ~ligne 187).

**Docs / dépôt**
- [ ] `mobile/docs/storekit.md` (~ligne 168) dit « Pas de webhook Apple » : faux (`POST /api/v1/webhooks/apple`).
- [ ] `docs/story-4-3-storekit-2-abonnements/guide-test.md` est versionné alors que la règle dit « guides de test jamais commités » : `git rm --cached` ou assumer.
- [ ] Branches à arbitrer : `ops/feature/ops-cloudbreak-favicon` (2 commits, sans PR) ; racine : `feature/cloudbreak-reveal`, `feature/parcours-compte-2-5-2-6-2-8`, `origin/feature/setup-eas-apple-storeconnect`, et `feature/4-3-storekit-2-abonnements` (commits docs locaux non poussés). Le repo racine est « main uniquement » : décider comment les atterrir.

**Infra**
- [ ] CI backend : job qui joue `alembic upgrade head` sur une base Postgres **vide** (aurait attrapé le bug `subscriptions`).
- [ ] Rate-limit Traefik sur `POST /api/v1/webhooks/apple` avant toute exposition prod.
- [ ] Backups hors VPS + **test de restauration** (aujourd'hui `/srv/backups` sur la même machine, rétention 14 j).
- [ ] Comprendre pourquoi l'image Docker du backend dev avait disparu (prune ? build d'un autre projet ?).
- [ ] Monitoring Better Stack (story 1.5) : uptime + logs, pas branché.

## 3. Notes produit avant la release

- **Promesse « Compréhension » insuffisamment remplie** : rendre plus clairs les raisons du verdict et les indicateurs déterminants (les 3 promesses : décision, compréhension, confiance).
- **Message de lancement sur la maturité du score** : app nouvelle, prédictions en amélioration, retours terrain = calibrage ; pas une météo fiable ni une garantie ; mention de prudence pour les décisions de sécurité.
- **Politique de confidentialité / CGU** (`cloudbreak-ops`) : dates réelles (`messages/fr.json`, `cgu.updated`/`privacy.updated`), identité légale (SIRET / adresse), et **mentionner que l'email et le nom d’usage sont conservés par le backend** (`users.email`, `users.display_name`) en plus de Supabase.
- **`EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`** dans l'environnement EAS de production, avant le premier build.
- **Supabase** : réactiver « Confirm email » (désactivé en dev) et tester signup → confirmation → login ; décider un projet unique ou dev/prod séparés.
- **Assets App Store** : icône 1024×1024, captures FR/EN. **MountainBackground** (login) : rework visuel.
- **Nom utilisateur** (avatar + nom dans le Profil) : pas de champ en base, à concevoir (nouvelle story).
- **Badge « essai gratuit 7 jours »** : n'apparaît que si StoreKit renvoie l'offre ; preuve Sandbox sur appareil réel requise avant soumission.
- **Sommets saisis à la main** (futur) : le seed remplace nom/GPS/altitude/région sur un `slug` existant → d'abord une colonne `source` (`seed`|`manual`) et un chargement initial insert-only. Ne jamais lancer le seed par un deploy.
- **Production backend** : `ENVIRONMENT=production` exige `APPLE_ENVIRONMENT=Production` + identifiants Apple complets + fichier `.p8` ; le dev reste `development` + `Sandbox`.

## 4. Features restantes

| Feature | Statut | Bloqué par / note |
|---|---|---|
| 4.3 StoreKit 2 (abonnements) | en clôture | tests Sandbox iPhone + webhook à prouver (§5) |
| 4.6 Build signée / TestFlight | brouillon | `EXPO_PUBLIC_SUPPORT_EMAIL`, assets, 4.3 |
| Epic 5 — push (5.1, 5.2, 5.3) | backlog | rien, débloqué |
| 3.6 Universal Links | backlog | rien, domaine prêt |
| Quota invité étage 2 (App Attest / DeviceCheck) | à planifier | — |
| Epic 1 — CI/CD mobile, monitoring (1.4, 1.5), env prod | partiel | env Dokploy prod |
| Nom utilisateur | à concevoir | brainstorming puis plan |
| QA manuelle epics 2/3/4/6 sur iPhone réel | à faire | build installée |
| 1.8 PostHog réel + Sentry | post-MVP | après la sortie |
| Epic 8 (growth V2) et 9 (landing) | hors scope MVP | décidé le 2026-08-08 |
| 6.2 Photo de validation terrain | dropée | décision explicite |

## 5. Détail — ce qu'il reste à valider

### Story 4.3 — StoreKit 2 (clôture)

**Acquis (ne plus y revenir)** : code mergé (backend + mobile), produits visibles et prix 4,99 € / 44,99 € dans le paywall (testé sur iPhone contre `dev-api`), badge −25 %, règle d'entitlement (`backend/app/domain/entitlement.py`), code du webhook mergé et appliqué sur le dev, URL Sandbox du webhook enregistrée dans App Store Connect (Production laissée vide).

**A. App Store Connect — à vérifier dans la console**
- [ ] Les deux produits (`com.alexandremoreau.cloudbreak.premium.monthly` et `.annual`) : capture « équipe de vérification » ajoutée, statut **Prêt à soumettre**.
- [ ] Un **Sandbox Tester** existe (France, e-mail jamais utilisé comme Apple ID) et est connecté sur l'iPhone (Réglages → Développeur → Compte Apple Sandbox ; mode développeur actif).
- [ ] App Store Server Notifications : **version 2** bien sélectionnée pour l'URL Sandbox `https://dev-api.cloudbreak-app.com/api/v1/webhooks/apple`.

**B. Webhook Apple — à prouver (rien n'est prouvé aujourd'hui)**
- [ ] Une notification de test d'Apple arrive sur l'endpoint dev et est acquittée en **204** (logs : `ssh vps-ovh-projets "sudo docker service logs app-reboot-primary-circuit-vmgb6t --since 10m 2>&1 | grep -v 'GET /health'"`).
- [ ] Un événement qui change l'abonnement (renouvellement, expiration) met réellement à jour `subscriptions` sans ouvrir l'app.
- [ ] Un même événement rejoué est acquitté sans second effet (idempotence).

**C. Tests Sandbox sur iPhone réel** (guide pas à pas : `docs/story-4-3-storekit-2-abonnements/guide-test.md`)
Prérequis : compte Cloudbreak **permanent** (pas anonyme), app en `EXPO_PUBLIC_API_URL=https://dev-api.cloudbreak-app.com` + `EXPO_PUBLIC_DEBUG=true`. Temps accéléré en Sandbox (essai 7 j ≈ 3 min, mensuel ≈ 5 min, annuel ≈ 1 h, 6 renouvellements max, valeurs Apple à reconfirmer).
- [ ] **Achat mensuel avec essai** : feuille Apple « Sandbox », essai affiché seulement si StoreKit le confirme, aucune facturation initiale. Attendu : paywall fermé, `isPremium`, quota levé ; logs `[subscription]` et `verify … 200` ; ligne `subscriptions` en `premium` / `trial`.
- [ ] **Achat annuel** : mêmes vérifications.
- [ ] **Transitions** : `trial → active → expired` observées ; après expiration l'API renvoie `plan = free` et le quota freemium revient.
- [ ] **Restauration** (« Restaurer un achat », puis réinstallation) : l'abonnement est retrouvé.
- [ ] **Conflit** : le même abonnement Apple sur un second compte Cloudbreak → `409 SUBSCRIPTION_OWNERSHIP_CONFLICT`.
- [ ] **Transaction d'un autre compte** (`app_account_token` ≠ UUID du compte) → `400 APPLE_TRANSACTION_INVALID`.
- [ ] **Compte anonyme** : l'achat est bloqué et renvoie vers la création de compte.
- [ ] **Hors ligne** : un achat sans réseau ne débloque rien à tort.
- [ ] **Remboursement / révocation** : non jouable par l'utilisateur en Sandbox ; couvert par les tests automatiques et par une notification Apple rejouée. Vérifier l'état `revoked`.
- Entre deux tests : App Store Connect → Sandbox → Testeurs → « Effacer l'historique d'achat ».
- Vérifier la ligne en base : `SELECT u.email, s.plan, s.status, s.expires_at, (s.plan IN ('premium','pro') AND s.status IN ('trial','active') AND s.expires_at > now()) AS premium_actif FROM subscriptions s LEFT JOIN users u ON u.supabase_user_id = s.user_id;`
- Comptes de test locaux : après le merge de l'entitlement, `make unseed-test && make seed-test` rend `pro@` et `test@` réellement illimités.

**D. Fermeture** (seulement quand A, B, C sont verts)
- [ ] Cocher la checklist Notion de la story ; `sprint-status.yaml` : 4-3 `review` → `done`.
- [ ] Docs : `docs/story-4-3-…`, `backend/docs/security.md` (retirer « à revoir après test Sandbox »), `docs/versions.md`.
- [ ] Bump des refs de submodules dans le repo racine ; remettre les submodules sur `develop`, supprimer les branches mergées.

### Story 2.6 / 2.7 / 2.8 — à valider en conditions réelles
- [ ] **2.6 Sign in with Apple** : jamais testé avec un vrai compte Apple Dev sur build native (prérequis EAS/Apple prêts).
- [ ] **2.7 Mot de passe oublié** : template d'e-mail du Dashboard Supabase à valider en réel.
- [ ] **2.8 Mini-sondage** : persistance réelle non validée manuellement.

### Story 4.6 — Build signée et TestFlight
- [ ] Build EAS signée, app dans App Store Connect (créée), build envoyée sur TestFlight et approuvée ; `EXPO_PUBLIC_SUPPORT_EMAIL` posé avant ; assets prêts (§3).

### Story 3.6 — Universal Links
- [ ] `.well-known/apple-app-site-association` servi par le site (`cloudbreak-app.com`) + `associatedDomains` dans `app.json` ; l'URL de partage `https://cloudbreak-app.com/sommet/{slug}` ouvre l'app.

### Epic 5 — Notifications push
- [ ] 5.1 infra Expo Push (route `POST /api/v1/user/push-token` **inexistante**, colonne `push_token` absente) → 5.2 alertes favoris / régionales (Premium) → 5.3 notification GPS de validation terrain.
