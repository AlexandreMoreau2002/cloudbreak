# TODO ops — Cloudbreak

Chantier **Ops console** (Epic 10). Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git, `sprint-status.yaml` et `docs/versions.md`).
Dernière mise à jour : 2026-11-25.

Références : `docs/ops-console-contrats.md` (fait foi), `docs/ops-console-stories.md`, `docs/ops-variables-env.md` (variables d'ops, à tenir à jour), maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB).

## État

**Tout le code de l'Epic 10 est mergé sur `develop`** (10.1a, 10.2, 10.3, 10.4a–g, 10.5) et déployé sur dev-api et dev-ops. Il ne reste que la **mise en prod**, **gelée par décision d'Alexandre (2026-11-24) : aucune release ni MEP avant la fin du développement de toutes les features**. En attendant, `dev-ops` pointe volontairement sur Supabase et l'API de **prod** (le dev n'a pas de métriques) ; les blocs Utilisateurs, Crons, Serveur, version backend et la recherche par email (10.5) restent « source indisponible » ou en erreur tant que le backend prod n'a pas la 10.3 et la 10.5.

## Mise en prod, dans cet ordre (quand Alexandre décide la MEP)

1. **Release du backend** : `develop` → `main` selon le workflow release (merge `--no-ff`, tag). Embarque `/version` (10.2), routes admin (10.3), recherche et octroi Premium (10.5), log 5xx ; migrations `c3d4e5f6a7b8` et `d9e0f1a2b3c4` (auto au démarrage).
2. **Variables sur `cloudbreak-backend-prod`** (Dokploy par l'API, relire l'env après Save) :
   - [ ] `ADMIN_USER_IDS` = `89d0d336-78e9-4dab-be43-af611a0f7e81` (sans lui `/api/v1/admin/overview` répond 403).
   - [ ] `AUDIT_HASH_KEY` : 32+ caractères aléatoires, secret, jamais commité (vide = recherche par email et octroi Premium refusés en 503). Ne pas la changer ensuite : tourner la clé casse la corrélation des anciennes lignes d'audit.
3. **10.1b** (VPS, après 1) : brancher les scripts sur le backend prod : `POST /internal/heartbeats/{purge|favorites|backup}` dans les scripts de cron prod et `POST /internal/server-metrics` dans `cloudbreak-server-metrics.sh` (secret `INTERNAL_CRON_SECRET`, header par fichier, jamais en argument).
4. **Release `ops`** : `develop` → `main`, puis variables sur `cloudbreak-ops-prod` (mêmes que `dev-ops`, valeurs de prod ; détail et rôle de chacune dans `docs/ops-variables-env.md`) :
   - [ ] `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (projet prod), `ADMIN_USER_IDS` (UUID ci-dessus), `API_BASE_URL=https://api.cloudbreak-app.com`
   - [ ] `BETTERSTACK_API_TOKEN`, `BETTERSTACK_MONITOR_API_ID`, `BETTERSTACK_MONITOR_OPS_ID`
   - [ ] `GITHUB_TOKEN`, `GITHUB_REPO_BACKEND`, `GITHUB_REPO_OPS`, `APP_STORE_ID`
   - [ ] `TOOL_URL_BETTERSTACK`, `TOOL_URL_SENTRY`, `TOOL_URL_POSTHOG`, `TOOL_URL_SUPABASE`, `TOOL_URL_OVH`, `TOOL_URL_BREVO`
   - [ ] Test noir-boîte du build prod : `/fr/admin` sans cookie → redirection vers la connexion, `/api/admin/*` → 401.
5. **Remettre `dev-ops` sur les sources de dev** (Supabase dev, `API_BASE_URL` dev) ou le laisser pointer prod selon ce qu'Alexandre veut garder, puis mettre à jour `docs/ops-variables-env.md` (état par environnement).
6. **Smoke test connecté** (Alexandre) : Accueil, Santé, Déploiements, Utilisateurs avec les vraies données, recherche par email et octroi Premium sur un compte de test, vérification de la ligne d'audit (hachage, pas d'email en clair).

## Optionnel

- [ ] Poser `AUDIT_HASH_KEY` sur `dev-api` et créer un compte admin Supabase **dev** avec mot de passe (le compte dev est en Apple) + `ADMIN_USER_IDS` sur dev-api : permet de tester la 10.5 sans toucher la prod (`backend/http/admin.http`).
- [ ] Remplacer `TOOL_URL_SENTRY` (aujourd'hui `sentry.io` générique) par l'URL du projet.

## Écarts connus des pages

- Santé : pas de barres de disponibilité 30 jours (l'API Better Stack ne donne que des chiffres agrégés).
- Utilisateurs : 5 cartes au lieu de 6 (comptes anonymes hors contrat).
- 10.4a : `Secure: true` sur le cookie de session peut gêner un test local sous Safari ; l'écran « accès refusé » est servi en 200 et non 403 (contrat §2.1).

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
