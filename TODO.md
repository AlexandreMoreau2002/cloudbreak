# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-11-06. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.

## Où on en est

1. **Le code est figé.** `release/1.0.0` existe dans backend, mobile et ops (créée le 2026-11-01). On n'y met que des correctifs, toujours reportés dans `develop`. Deux sont déjà passés : achats Sandbox acceptés en prod, profils de build `staging` / `production`.
2. **Maintenant : Lot 1 = monter la prod** (serveur, comptes, domaines). Rien à coder. Codex fait ce qui demande un navigateur (DNS OVH, Supabase) ; Claude fait Dokploy et Traefik ; Alex saisit les secrets lui-même.
3. **Ensuite : Lot 2 = tester la release** sur l'environnement de test (le dev), avec une build TestFlight `staging`. La prod reste vierge.
4. **Enfin : Lot 3 = livrer** (merge dans `main`, tag `v1.0.0`, soumission Apple).

Légende « Qui » : **Codex** = tâche navigateur (brief dans `docs/superpowers/codex-briefs/`), **Claude** = API Dokploy / SSH / code, **Alex** = secrets et décisions.

---

## Lot 1 — Monter la prod (infra, pas de code)

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | DNS OVH `api` et `ops` | Codex | `api.cloudbreak-app.com` et `ops.cloudbreak-app.com` → A `51.178.37.35`. Vérifier aussi que `contact@cloudbreak-app.com` reçoit du courrier. | fait (vérifié par `dig` le 2026-11-06) ; reste à confirmer que `contact@` reçoit du courrier |
| 2 | Projet Supabase `cloudbreak-prod` (séparé du dev) | Codex + Claude | **Fait le 2026-11-07** : projet `mjtohynpmzfxhfhtegiv` (Londres), auth identique au dev, SMTP Brevo (`no-reply@cloudbreak-app.com`, DKIM + DMARC) **validé par un vrai email reçu avec code à 6 chiffres**, JWT ECC P-256, Data API désactivée, base vide. Valeurs publiques dans `~/.cloudbreak-secrets/supabase-prod-public.env` (600). Non relus : gabarits Invite / Magic link / Reauthentication (supposés par défaut comme au dev). | fait |
| 3 | Environnement Dokploy `prod` | Claude | **Fait le 2026-11-06 (non déployé)** : Postgres + Redis prod en marche, apps backend et ops créées avec domaines (voir `docs/infra-serveur.md` §8sexies). Règles Traefik posées le 2026-11-07 (`/internal` réservé au VPS, rate-limit webhook Apple, `docs/traefik/cloudbreak-prod-security.yml`). Reste le déploiement, après les lignes 4 et 7. L'app prod **suit `release/1.0.0`** pendant la QA puis `main` à la livraison. VPS : ~1,6 Go de RAM dispo, swap 1,8/4 Go : à surveiller. | fait (à déployer plus tard) |
| 4 | Variables backend prod | Claude (fait) + Alex (secrets) | **Posées par Claude le 2026-11-07** : `ENVIRONMENT`, `APPLE_ENVIRONMENT`, `APPLE_BUNDLE_ID`, `DATABASE_URL`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWT_JWKS`, `INTERNAL_CRON_SECRET` (64 car. générés, dans `~/.cloudbreak-prod/state.json` sur le VPS). **Reste à Alex** (Claude ne manipule pas ces secrets) : `SUPABASE_SERVICE_ROLE_KEY`, `EXPO_ACCESS_TOKEN`, `APPLE_APP_ID`, `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `APPLE_PRIVATE_KEY_PATH` + fichier `.p8` déposé sur le VPS (Claude configure ensuite le montage). Sans eux le backend refuse de démarrer, volontairement. | à faire (Alex) |
| 5 | Variables ops prod | Claude + Alex | `APPLE_TEAM_ID`, `NEXT_PUBLIC_SITE_URL=https://ops.cloudbreak-app.com`. `NEXT_PUBLIC_APP_STORE_URL` après publication (rebuild). | bloqué par 3 |
| 6 | Variables EAS `production` | Alex (ou Codex) | `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` du Supabase prod, dans le dashboard EAS. Sans elles, le build `production` échoue volontairement. | à faire (valeurs publiques prêtes dans le fichier ci-dessus) |
| 7 | Cron de purge des anonymes sur la prod | Claude | Dev déjà en place. Prod : secret, script, `dry_run` d'abord, crontab 06:00 Paris (§8quinquies). **Les pages légales ne se publient en prod qu'une fois ce cron actif.** | bloqué par 4 (secrets) |
| 8 | Seed des sommets sur la DB prod | Claude | Manuel uniquement, jamais lancé par un deploy. | après 3 et 4 |

Universal Links (story 3.6) : code fait et validé sur iPhone en dev ; ne reste que les lignes 1, 5 et 6 ci-dessus.

## Lot 2 — Tester la release (TestFlight)

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | Assets App Store | Alex | Icône 1024×1024 (déjà aplatie sans alpha), captures FR/EN. Indépendant, à faire en parallèle. | à faire |
| 2 | `dev-api` suit `release/1.0.0` | Claude | Pendant la QA, le dev devient l'environnement de test (Supabase dev, Apple Sandbox). | à faire |
| 3 | Build EAS `staging` depuis `release/1.0.0` + envoi TestFlight | Alex (+ Claude) | `eas build --profile staging --platform ios` puis `eas submit`. À contrôler dans l'IPA : `aps-environment`, icône, splash, pas de `NSLocalNetworkUsageDescription`. | bloqué par 2 |
| 4 | QA manuelle epics 2/3/4/6 sur iPhone réel | Alex | Via TestFlight, pas le simulateur. Inclut un vrai achat Sandbox (valide le correctif Apple, jamais testé avec un vrai achat). | bloqué par 3 |
| 5 | Test de fumée final sur la prod | Alex | Build `production`, un compte réel, supprimé ensuite. Les liens de partage se testent ici (pas en staging). | bloqué par Lot 1 |

## Lot 3 — Livrer

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | Merge `release/1.0.0` → `main` (`--no-ff`), tag `v1.0.0`, GitHub Release, retour dans `develop` | Claude, sur ordre d'Alex | Dans chaque submodule, puis refs racine + `docs/versions.md`. L'app Dokploy prod bascule sur `main`. | après Lot 2 |
| 2 | Fiche App Store Connect (page produit, captures, confidentialité, abonnements, accords fiscaux/bancaires) | Codex en brouillon (brief C), Alex valide | Prérequis : ops prod en ligne (URL de politique de confidentialité), captures prises sur une build. Codex ne soumet jamais. | après le Lot 2 |
| 3 | Soumission App Store (review Apple) | Alex | Dernière étape produit. Review Apple ~24-48 h, puis publication manuelle ou automatique. | après 1 et 2 |

## Hors lot — non bloquant, à caser quand on veut

| Tâche | Contexte / note |
|---|---|
| Vérifier le 1er run du cron notifications | `ssh vps-ovh-projets tail ~/cloudbreak-favorites.log` à 18h Paris → `http=200` (doc `docs/infra-serveur.md` §8quater). Ponctuel, indépendant des lots. |
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
