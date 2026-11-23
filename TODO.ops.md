# TODO ops — Cloudbreak

Chantier **Ops console** et fiabilité de l'infra. Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git).
Dernière mise à jour : 2026-11-22.

Documents de référence :
- **Contrats d'entrée-sortie et flux : `docs/ops-console-contrats.md`** (fait foi)
- Besoins et décisions : `docs/ops-dashboard-besoins.md`
- Stories, maquettes, ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`)
- Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB)

## Prochaine action

**Vague 1** (10.2 et 10.3 faites) : lancer 10.4a et 10.1a, en « mode batch efficient » (1 agent par ticket, une validation par repo, une revue ciblée). Rien d'autre ne les bloque.

Prod uniquement, lecture seule. Une story = une branche `feature/` du submodule concerné, PR vers `develop` (squash). Une vague ne démarre que quand la précédente est mergée. Un seul build Dokploy et une seule connexion SSH à la fois.

## Ordre de développement

| Vague | Story | Quoi | Repo | Prérequis d'Alex | Fait |
|---|---|---|---|---|---|
| **1** | 10.4a | Socle de la console : connexion, garde d'accès, cadre, états partagés | ops | Compte admin Supabase **dev** (`app_metadata.role = "admin"`) pour tester | [ ] |
| **1** | 10.3 | Backend admin en lecture seule (auth, audit, `/admin/overview`, heartbeats, relevés serveur) | backend | Poser `ADMIN_USER_IDS` sur Dokploy dev ; test manuel nominal (200/204) à faire sur dev-api | [x] mergée 2026-11-23 (`8a4ef7a`) |
| **1** | 10.2 | `GET /version` backend et ops | backend, ops | Vérifier sur dev que Dokploy injecte `GIT_SHA`/`BUILT_AT`/`GIT_TAG` (sinon `sha: unknown`) | [x] mergée 2026-11-23 (`0b9d24f`, `7b806f1`) |
| **1** | 10.1a | Moniteur ops, script de métriques → Better Stack (alertes seules), log 5xx | VPS, backend | — | [ ] |
| **2** | 10.4b | Routes serveur ops : santé (Better Stack), versions (GitHub, App Store) | ops | **Jeton Better Stack en lecture seule** | [ ] |
| **3** | 10.4c | Page Utilisateurs | ops | — | [ ] |
| **3** | 10.4d | Page Santé | ops | — | [ ] |
| **3** | 10.4e | Page Déploiements | ops | — | [ ] |
| **3** | 10.4g | Pages légales : liens et bouton « Retour à la console » | ops | — | [ ] |
| **4** | 10.4f | Accueil | ops | **URLs des six outils** (Better Stack, Sentry, PostHog, Supabase, OVH, Brevo) | [ ] |
| **5** | Mise en prod | Déploiement `dev-ops` puis prod | ops, backend | **Compte admin Supabase prod** + UUID dans `ADMIN_USER_IDS` | [ ] |
| **5** | 10.1b | Brancher les scripts du VPS sur le backend (`/internal/*`), 10.3 déployée en prod d'abord | VPS | — | [ ] |
| v1 | 10.5 | Recherche par email et offrir Premium, avec audit | backend, ops | Audit par hachage ; valeur de l'origine de l'abonnement offert (`granted` proposé) | [ ] |

Détail : `docs/ops-console-stories.md` §1 et §6. Prompts Codex : `docs/ops-console-contrats.md` §7.

## À faire côté serveur (bloque la vérification de 10.2 et 10.3 sur dev)

- [ ] **Remettre `cloudbreak-backend` et `cloudbreak-ops` (Dokploy dev) sur la branche `develop`** : ils suivent encore `release/1.0.0` (supprimée le 2026-11-21), leur dernier déploiement est en erreur, donc `/version` et `/api/v1/admin/overview` répondent 404 sur dev. Via l'API Dokploy (`application.saveGitProvider` puis `application.deploy`), un déploiement à la fois ; SSH a expiré le 2026-11-23 à 14:15 UTC, à réessayer plus tard.
- [ ] Poser `ADMIN_USER_IDS` (UUID du compte admin dev) et vérifier `INTERNAL_CRON_SECRET` sur l'env Dokploy du backend dev, puis jouer le test nominal de `backend/http/admin.http`.
- [ ] Vérifier que Dokploy injecte `GIT_SHA`/`BUILT_AT`/`GIT_TAG` (sinon `/version` répond `unknown` ; ajouter les build args dans Dokploy).

## Décisions par défaut (modifiables sur demande)

- Pas d'alerte CPU (chaque build Dokploy fait monter le CPU).
- Seule la version publiée de l'app est affichée (pas de ligne « 1.0.1 dans `main`, en attente de l'App Store »).
- KPIs : comptes anonymes et permanents, tendance 14 jours : à confirmer dans la 10.3.
- Barres de disponibilité 30 jours : à vérifier dans l'API Better Stack (10.4b), sinon retirées de la maquette.

---

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur en 2.5/2.6/2.8). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
