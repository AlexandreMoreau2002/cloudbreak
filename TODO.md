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

**État au 2026-11-08 : le backend prod ET `ops` prod sont en ligne** (`api.cloudbreak-app.com/health` ok, migrations appliquées, Swagger coupé, `/internal` réservé au VPS, crons purge 06:05 et favoris 18:05 actifs ; `ops.cloudbreak-app.com` : CGU et confidentialité publiques au 1er novembre 2026, headers de sécurité, AASA, robots/sitemap vérifiés). DNS, Supabase prod, clé Apple et **seed des sommets (23 782, fait le 2026-11-08)** sont faits. Il reste ce qui suit.

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | Variables EAS `production` | Alex | `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans le dashboard EAS (valeurs publiques dans `~/.cloudbreak-secrets/supabase-prod-public.env`). Sans elles, le build `production` échoue volontairement. | à faire |
| 2 | `NEXT_PUBLIC_APP_STORE_URL` sur ops prod | Alex + Claude | Après publication de l'app ; `NEXT_PUBLIC_*` est figé au build : rebuild d'ops nécessaire. Sans elle la page `/sommet/*` affiche « L'app arrive bientôt ». | après publication |
| 3 | `contact@cloudbreak-app.com` reçoit du courrier | Alex | Routage entrant ImprovMX en place (MX). À tester par un envoi réel. | à vérifier |
| 4 | Accepter le contrat de licence du Developer Program | Alex (titulaire) | Bandeau dans App Store Connect : bloque la mise à jour et la soumission. | à faire |
| 5 | Webhooks GitHub d'auto-déploiement des apps prod | Claude | Optionnel : sans webhook, un push sur la branche ne redéploie pas la prod (déploiement manuel par API). À décider au moment de passer sur `main`. | à décider |

Universal Links (story 3.6) : code fait et validé sur iPhone en dev ; il ne reste que la ligne 1 ci-dessus (variables EAS).

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
