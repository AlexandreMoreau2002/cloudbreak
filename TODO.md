# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-10-27. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.
> Dev du MVP app (mobile + backend) terminé. Reste : l'environnement de prod, TestFlight, puis la release.

---

## Lot 0 — Figer le code (develop → release/1.0.0)

| Tâche | Contexte / note | Statut |
|---|---|---|
| Valider `EXPO_ACCESS_TOKEN` en prod | Validator de config ou log `CRITICAL` s'il est vide (`backend/docs/security.md` point b). Le rate-limit de `POST /user/push-token` est fait (backend `c3d9708`, #34). | à faire |
| Valider sur dev la suppression d'un compte anonyme + un `dry_run` de la purge | Tests mockés : le champ `is_anonymous` et la suppression Admin d'un utilisateur anonyme côté Supabase réel, et la requête de candidats sur Postgres réel, ne sont pas vérifiés. | à faire |
| Geler `develop`, dernier `make validate` / `npm run validate` | Une fois les deux lignes ci-dessus closes (ou explicitement reportées), créer `release/1.0.0` depuis `develop`. | à faire |

## Lot 1 — Environnement de prod (infra, pas de code)

| Tâche | Contexte / note | Statut |
|---|---|---|
| Dokploy `production` sur le VPS | Postgres + Redis dédiés, séparés du dev. | à faire |
| DNS OVH `api` et `ops` | `api.cloudbreak-app.com`, `ops.cloudbreak-app.com`. | à faire |
| Env backend prod | `ENVIRONMENT=production`, `APPLE_ENVIRONMENT=Production`, clés Apple complètes + fichier `.p8` (le dev reste `development` + `Sandbox`). | à faire |
| Env ops prod | `NEXT_PUBLIC_APP_STORE_URL` (après publication) ; `APPLE_TEAM_ID` déjà posée. | à faire |
| Env EAS profile `production` | `EXPO_PUBLIC_LEGAL_BASE_URL=ops.cloudbreak-app.com`, `EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`. | à faire |
| Cron de purge des comptes anonymes inactifs (30 j) | Backend mergé et déployé sur dev (#35 `e5760c7`, #36 `d19d0a8`). Pages légales finales mergées (ops `905e35b`) : posture assumée (particulier sans SIRET, pas de médiateur ni de relecture juridique), **à ne publier en prod qu'une fois ce cron actif**. **Cron posé sur dev le 2026-10-27** (06:00 Paris, premier `dry_run` OK, 0 candidat). Reste : le poser sur prod à la MEP selon `docs/infra-serveur.md` §8quinquies (secret, script, `dry_run` d'abord, crontab 06:00 Paris). | à faire (dev puis prod) |
| Restriction IP Traefik sur `/internal/*` | Les crons (alertes favoris, purge des anonymes) ne sont protégés que par `INTERNAL_CRON_SECRET` sur un endpoint public. Règle Traefik dynamique « IP du VPS seulement », aucun code. À faire avant la prod (`docs/infra-serveur.md` §8quinquies). | à faire |
| Rate-limit Traefik sur `POST /api/v1/webhooks/apple` | Endpoint public pour Apple, pas couvert par `RateLimitService` aujourd'hui. Règle Traefik dynamique, aucun code backend. À faire avant toute exposition prod. | à faire |
| Seed des sommets sur la DB prod | Manuel uniquement, **jamais lancé par un deploy**. | à faire, après le reste du lot |
| Universal Links (story 3.6) | Code fait, scénario principal déjà validé sur iPhone en dev. Ne reste que le DNS `ops` + l'env EAS ci-dessus — rien de nouveau à coder. | suit le lot |
| Supabase | Un seul projet dev+prod gardé pour le MVP, pas de split à faire. | décidé, rien à faire |

## Lot 2 — TestFlight

| Tâche | Contexte / note | Statut |
|---|---|---|
| Assets App Store | Icône 1024×1024, captures FR/EN. Indépendant des autres lots, peut se faire en parallèle. | à faire |
| Build EAS signée | Dépend du Lot 1 (variables EAS prod posées, notamment `EXPO_PUBLIC_SUPPORT_EMAIL`). | bloqué par Lot 1 |
| App dans App Store Connect | Déjà créée. | fait |
| Envoi + approbation TestFlight | Après la build EAS. | bloqué par la ligne précédente |
| QA manuelle epics 2/3/4/6 sur iPhone réel | Via la build TestFlight installée, pas le simulateur. | bloqué par TestFlight |

## Lot 3 — Release

| Tâche | Contexte / note | Statut |
|---|---|---|
| Soumission App Store (review Apple) | Dernière étape, après QA TestFlight validée. | à faire |

## Hors lot — non bloquant, à caser quand on veut

| Tâche | Contexte / note |
|---|---|
| Vérifier le 1er run du cron notifications | `ssh vps-ovh-projets tail ~/cloudbreak-favorites.log` à 18h Paris → `http=200` (doc `docs/infra-serveur.md` §8quater). Ponctuel, indépendant des lots. |
| CI backend sur base vide | Job `alembic upgrade head` sur Postgres vide (aurait attrapé le bug `subscriptions`). |
| Backups hors VPS + test de restauration | `/srv/backups` aujourd'hui sur la même machine, rétention 14 j. |
| Comprendre l'image Docker backend dev disparue | Prune ? Build d'un autre projet ? Jamais investigué. |
| Monitoring Better Stack (story 1.5) | Uptime + logs, pas branché. |
| Receipts Expo (`DeviceNotRegistered`) | PR séparée, pas démarrée. Post-launch. |
| Alerte régionale (FR23) | Reportée en V2. |
| Message hors-saison (3.6b, FR7) | Reporté, à faire avant l'été 2027 (on est en pleine saison). |

## Features hors scope MVP (backlog, pas dans le chemin de release)

| Feature | Statut | Note |
|---|---|---|
| Quota invité étage 2 (App Attest / DeviceCheck) | à planifier | — |
| Epic 1 — CI/CD mobile complet (1.4) | partiel | post-MVP |
| 1.8 PostHog réel + Sentry | post-MVP | après la sortie |
| Epic 8 (growth V2) et 9 (landing) | hors scope MVP | décidé le 2026-08-08 |
| 6.2 Photo de validation terrain | dropée | décision explicite |
| Sommets saisis à la main | futur | nécessite une colonne `source` (`seed`\|`manual`) avant tout chargement manuel |
