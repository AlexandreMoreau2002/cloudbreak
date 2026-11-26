# TODO ops — Cloudbreak

Chantier **Ops console** (Epic 10). Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git, `sprint-status.yaml` et `docs/versions.md`).
Dernière mise à jour : 2026-11-25 (mise en prod 1.2.0 : utilisateurs / comptes / usage).

Références : `docs/ops-console-contrats.md` (fait foi), `docs/ops-console-stories.md`, `docs/ops-variables-env.md` (variables d'ops, à tenir à jour), maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB).

## État

**Epic 10 en prod depuis le 2026-11-25** (backend et ops `v1.2.0`, `/version` 1.2.0, historique des utilisateurs démarré le jour du déploiement ; test noir-boîte du build prod fait : `/fr/admin` sans cookie → redirection, `/api/admin/*` → 401, routes admin du backend → 403). `AUDIT_HASH_KEY` et `ADMIN_USER_IDS` posées sur le backend prod, bloc console posé sur `cloudbreak-ops-prod`. Les apps Dokploy prod n'ont pas de webhook : après un merge dans `main`, lancer `application.deploy`. `dev-ops` lit encore la prod.

## Reste à faire, dans cet ordre

0. **Urgent, avant la publication de la 1.0.2 mobile : politique de confidentialité.** `src/content/privacy.ts` affirme qu'aucun outil de rapport de plantage ni d'analyse n'est actif (app et serveur). Faux : Sentry et PostHog sont actifs sur le backend prod et embarqués dans la 1.0.2. Corriger le texte, `LEGAL_UPDATED_AT` et les tests (`privacy.test.ts` exige aujourd'hui la phrase fausse), puis MEP ops.

1. **Smoke test connecté** (Alexandre), dont les trois blocs Utilisateurs / Comptes / Usage et leurs trois courbes (desktop et mobile 375 px), sur https://ops.cloudbreak-app.com/fr/admin/login (compte `pricedelu@gmail.com`) : correctifs 1.1.1 en prod (menu fixe, cartes Usage, actifs 30 j), blocs Crons et Serveur remplis ; recherche par email puis offre Premium sur un compte de test, et vérification de la ligne d'audit (hachage, jamais l'email en clair).
2. **Décider du sort de `dev-ops`** : le remettre sur Supabase et l'API de dev, ou le laisser sur la prod (documenter dans `docs/ops-variables-env.md`).
3. **Vérifier Sentry et PostHog côté backend** (clés posées, actifs depuis la 1.1.0) : les événements arrivent-ils ?

## Optionnel

- [ ] Poser `AUDIT_HASH_KEY` sur `dev-api` et créer un compte admin Supabase **dev** avec mot de passe (le compte dev est en Apple) + `ADMIN_USER_IDS` sur dev-api : permet de tester la 10.5 sans toucher la prod (`backend/http/admin.http`).
- [ ] Remplacer `TOOL_URL_SENTRY` (aujourd'hui `sentry.io` générique) par l'URL du projet.

## Écarts connus des pages

- Santé : pas de barres de disponibilité 30 jours (l'API Better Stack ne donne que des chiffres agrégés).
- 10.4a : `Secure: true` sur le cookie de session peut gêner un test local sous Safari ; l'écran « accès refusé » est servi en 200 et non 403 (contrat §2.1).

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
