# Infra serveur — VPS OVH / Dokploy

> Référence unique et à jour sur l'hébergement de Cloudbreak. Dernière mise à jour : 2026-08-09 (migration domaine `cloudbreak-app.com` terminée, environnement Dokploy renommé `dev`, voir section 4bis).
> Historique détaillé des sessions de config (contexte pas-à-pas) : voir `TODO.md` section "Infra Dokploy".
> Secrets (mots de passe, tokens API, refreshToken par app) : **jamais ici** — source de vérité = page Notion "🖥️ Serveur OVH" + Dokploy lui-même.

## 1. Serveur

- Fournisseur : OVHcloud
- Host : `vps-fc364aac.vps.ovh.net`
- IPv4 : `51.178.37.35`
- IPv6 : `2001:41d0:305:2100::1:4175`
- OS : Ubuntu 24.04 LTS
- **Serveur partagé** avec deux autres projets perso (Quest, Snoroc) — pas dédié à Cloudbreak.
  Ressources limitées : **2 vCPU / 3.7 Go RAM, pas de swap**. Un incident (2026-07-31) a fait grimper le
  load average à 100+ en lançant plusieurs builds Dokploy en parallèle sur différents projets.
  → Éviter de déclencher un build/deploy pendant que d'autres projets buildent en même temps.
- Firewall : ports ouverts 22 (SSH), 80/443 (HTTP/HTTPS), 3000 (UI Dokploy)

## 2. Accès

- SSH : `ssh vps-ovh-projets` (config dédiée dans `~/.ssh/config` en local, authentification par clé — pas de mot de passe à connaître)
- Dokploy (UI web, PaaS self-hosted) : `http://51.178.37.35:3000` — installé le 2026-07-30
- Ne pas se connecter en SSH ni modifier quoi que ce soit côté serveur depuis un agent Claude Code sans validation explicite de l'utilisateur.

## 3. Dokploy — ce que ça remplace

Dokploy remplace l'ancien setup manuel Docker Compose + Caddy + `deploy.sh`. Il embarque Traefik
(reverse proxy avec HTTPS Let's Encrypt automatique) et gère le build/déploiement des apps depuis
un repo GitHub (Dockerfile ou Nixpacks selon l'app).

## 4. Projet Dokploy Cloudbreak

- Nom du projet Dokploy : `cloudbreak`
- `projectId` : `aGirRTGRuO8XWB2CBGC4b`
- **Un seul environnement Dokploy pour l'instant**, nommé **`dev`** (renommé le 2026-08-09, était
  mal nommé "production" côté UI Dokploy alors qu'il héberge le dev — même piège identifié et corrigé
  sur **Snoroc**, qui a une vraie séparation Dev/Prod avec deux environnements Dokploy distincts).
  Un vrai environnement `production` sera créé plus tard, quand une vraie prod existera.

### Apps déployées

| App | Submodule | Repo GitHub | Branche | URL | Build | `applicationId` | Webhook GitHub | Dernier déploiement vérifié |
|---|---|---|---|---|---|---|---|---|
| Backend | `backend/` | `cloudbreak-backend` | `develop` | https://dev-api.cloudbreak-app.com | Dockerfile | `5o3f7yJUBmbYWC2uIgiZb` | ✅ actif | 2026-08-09 |
| Ops | `ops/` | `cloudbreak-ops` | `develop` | https://dev-ops.cloudbreak-app.com | Nixpacks (Next.js) | `-qcn37AFIyLY_Sn_5QbW6` | ✅ actif | 2026-08-09 |

- Backend : Postgres dédié + Redis dédié (instances Dokploy séparées ; pas de détails de connexion dans ce fichier — voir Dokploy).
- Ops : pas de DB, sert les pages légales CGU/Privacy.
- Mobile (submodules `mobile/` et `cloudbreak-mobile/`) : **PAS hébergé sur ce VPS** — app mobile, pas de déploiement serveur.
- **Domaine `cloudbreak-app.com` acheté le 2026-08-09** — remplace les anciennes URLs `nip.io`,
  migration terminée (voir section 4bis).

## 4bis. Migration domaine — `cloudbreak-app.com` (terminée le 2026-08-09)

**Contexte** : les URLs `nip.io` (`cloudbreak-dev-api.51.178.37.35.nip.io`,
`cloudbreak-dev-ops.51.178.37.35.nip.io`) étaient temporaires. Le domaine `cloudbreak-app.com` est
acheté et remplace aussi l'ancienne hypothèse `cloudbreak.fr` (jamais achetée) utilisée comme
fallback prod dans le code mobile. Schéma de sous-domaine calqué sur **Snoroc** : `dev-api.<domaine>`
/ `dev-ops.<domaine>` pour le dev, `api.<domaine>` / `ops.<domaine>` réservés à une future prod.

**Fait (repo)** :
- Toutes les URLs `nip.io` remplacées par `dev-api.cloudbreak-app.com` / `dev-ops.cloudbreak-app.com`
  dans `CLAUDE.md`, `docs/infra-serveur.md`, `docs/versions.md`, `ops/README.md`.
- Fallbacks prod codés en dur du mobile basculés (`api.cloudbreak.fr` → `api.cloudbreak-app.com`,
  `ops.cloudbreak.fr` → `ops.cloudbreak-app.com`) dans `mobile/src/services/fetchService.ts`,
  `mobile/src/constants/legalUrls.ts`, `mobile/.env.example`, et tous les tests associés.

**Fait (serveur)** :
1. **DNS** — 2 enregistrements A créés chez OVH le 2026-08-09 (`dev-api`, `dev-ops` → `51.178.37.35`).
2. **Dokploy — domaines** — `dev-api.cloudbreak-app.com` (Backend) et `dev-ops.cloudbreak-app.com`
   (Ops) ajoutés avec HTTPS Let's Encrypt, anciens domaines `nip.io` retirés.
3. **Fix port backend** — le domaine Backend avait été créé avec le port Dokploy par défaut (3000)
   alors que le container FastAPI écoute sur `8000` → 502 Bad Gateway. Corrigé en base (`domain.port`)
   et dans le fichier Traefik généré (`/etc/dokploy/traefik/dynamic/app-reboot-primary-circuit-vmgb6t.yml`,
   `loadBalancer.servers[].url` → port `8000`). **Point de vigilance pour tout futur domaine Dokploy sur
   ce projet** : vérifier le port réel du container (`docker ps`, colonne PORTS) plutôt que de garder
   le défaut Dokploy.
4. **Renommage environnement** — projet `cloudbreak` (`projectId` `aGirRTGRuO8XWB2CBGC4b`),
   `environmentId h_bF0EMDsGZG93SNt9wv_` renommé `production` → `dev` directement en base (l'UI Dokploy
   ne propose pas de renommage d'environnement dans le sélecteur — seulement "Create Environment").
   Même correction appliquée sur **Snoroc** : environnement `development` → `dev`
   (`environmentId hlRujU-REFOUUd1JqLBnN`, projet `snoroc`), pour homogénéiser le nommage entre projets.

**Vérifié en ligne** (2026-08-09) :
```
curl https://dev-api.cloudbreak-app.com/health  → {"status":"ok","services":{"database":"ok","redis":"ok"}}
curl -I https://dev-ops.cloudbreak-app.com/fr/privacy → 200
```

Page Notion "🖥️ Serveur OVH" mise à jour en conséquence (Cloudbreak + Snoroc).

6. **Après bascule confirmée** : mettre à jour ce fichier (retirer la mention "en cours" ci-dessus,
   passer la case correspondante en fait dans la section 9) + vérifier `mobile/.env` local si besoin
   de pointer vers le nouvel env dev. Page Notion "🖥️ Serveur OVH" déjà mise à jour le 2026-08-09
   avec l'état DNS/Dokploy/renommage — la remettre à jour une fois les étapes Dokploy confirmées.

## 5. CI/CD — comment ça déclenche un déploiement

**Piège important** : le flag `autoDeploy: true` dans la config Dokploy d'une app **ne suffit pas**
à garantir un déploiement automatique. Il faut en plus un **vrai webhook GitHub** configuré sur le
repo :

```
Repo GitHub → Settings → Webhooks → événement "push"
  → URL : http://51.178.37.35:3000/api/deploy/{refreshToken}   (refreshToken propre à chaque app)
```

Sans ce webhook réel, un `autoDeploy: true` à lui seul ne déclenche **rien** — les déploiements
précédents étaient alors en réalité manuels (via l'UI Dokploy), malgré l'apparence d'automatisation.

Cas vécus sur ce genre d'infra partagée :
- **Cloudbreak** : problème constaté et corrigé le 2026-08-02 (webhooks absents malgré `autoDeploy: true` réglé sur les deux apps ; `cloudbreak-ops` suivait en plus la mauvaise branche).
- **Snoroc** (autre projet sur le même VPS) : même piège, corrigé le 2026-08-08.

État actuel Cloudbreak : webhooks GitHub créés et testés pour `cloudbreak-backend` et `cloudbreak-ops` — CI/CD auto-deploy opérationnel de bout en bout pour les deux apps.

## 6. Point de vigilance sécurité — token GitHub `cloudbreak-ops` (corrigé le 2026-08-08)

`cloudbreak-ops` est le **seul repo privé** des 3 projets hébergés sur ce VPS (tous les autres —
`cloudbreak-backend`, `quest-web`, `quest-api`, `snoroc`, `snoroc_front`, `snoroc_back` — sont
publics, donc clonés sans authentification). Il était cloné par Dokploy via un **token GitHub
personnel classique** (scope `repo`, donnant accès à tous les repos du compte) au lieu d'un accès
scopé à ce seul repo.

Risques qui existaient :
- Rotation ou révocation du token perso = déploiement `cloudbreak-ops` cassé silencieusement (pas d'alerte proactive).
- Portée du token bien plus large que nécessaire : si le VPS était compromis, ce token perso donnait accès à tous les repos couverts par son scope, pas seulement `cloudbreak-ops`.

**Corrigé le 2026-08-08** : remplacé par une **deploy key SSH dédiée** (ed25519, lecture seule —
"Allow write access" décoché), générée sur le VPS (`/srv/dokploy-deploy-keys/cloudbreak-ops_ed25519`,
privée jamais transmise ailleurs), ajoutée côté GitHub dans `cloudbreak-ops` → Settings → Deploy keys,
et enregistrée côté Dokploy (Settings → SSH Keys → `dokploy-cloudbreak-ops`), avec l'URL du repo
basculée en SSH (`git@github.com:AlexandreMoreau2002/cloudbreak-ops.git`). Testé par un déploiement
complet (clone ✅ + build Nixpacks ✅ + app qui répond en HTTP) — voir historique dans `TODO.md`.
L'ancien token GitHub personnel classique (scope `repo`) a été **révoqué** côté GitHub le
2026-08-08 — plus aucun usage résiduel, aucune app ne dépend plus de ce token.

## 7. Sauvegardes

- Répertoire : `/srv/backups/`
- Fréquence : cron quotidien à 3h
- Script : `/srv/scripts/backup-databases.sh` (mysqldump + pg_dump, gzip, rétention 14 jours)

## 8. Logs de déploiement

- `/etc/dokploy/logs/<appName>/`

## 8quater. Cron des alertes favoris (push, epic 5.2) — posé le 2026-10-13

- **Env Dokploy du backend dev** : `INTERNAL_CRON_SECRET` (64 car., généré par `secrets.token_hex(32)`, relu après `application.saveEnvironment`). Pris en compte au prochain redeploy, à faire après le merge de backend #30.
- **Cron** : crontab de l'utilisateur `ubuntu` sur le VPS, `CRON_TZ=Europe/Paris`, `0 18 * * *` → `/home/ubuntu/cloudbreak-run-favorites.sh` (curl `-m 120` vers `POST https://dev-api.cloudbreak-app.com/internal/notifications/run-favorites`). Log : `/home/ubuntu/cloudbreak-favorites.log` (une ligne par run : date, code HTTP, début de la réponse).
- **Secret côté VPS** : `~/.cloudbreak-cron.env` et `~/.cloudbreak-cron.header` (mode 600) ; le script passe le header par fichier (`-H @fichier`), jamais en argument visible dans `ps`. Le secret n'est écrit nulle part dans git.
- **Avant le deploy de #30** l'endpoint répond 404 : normal. Après : attendre `200` avec le résumé JSON. `503` = secret absent/trop court dans l'env du conteneur (redeploy oublié), `403` = secret différent.
- **Rotation** : régénérer, `application.saveEnvironment`, redeploy, puis réécrire les deux fichiers ci-dessus.

## 8bis. Incident du 2026-10-05 — `dev-api` en 502 (backend dev down)

**Symptôme** : l'app mobile (pointée sur `https://dev-api.cloudbreak-app.com`) n'avait que des erreurs
réseau ; `GET /health` répondait **502** (Traefik sans backend derrière).

**Diagnostic** (dans cet ordre, reproductible) :

1. `ssh vps-ovh-projets "sudo docker service ls"` → le service backend
   (`app-reboot-primary-circuit-vmgb6t`, nom aléatoire Dokploy, il n'apparaît pas sous « cloudbreak »)
   était à **0/1**. Retrouver le nom : `sudo grep -rl 'dev-api.cloudbreak' /etc/dokploy/traefik/dynamic`.
2. `sudo docker service ps <service> --no-trunc` → `Rejected … No such image: <service>:latest`.
   **L'image Docker avait disparu du VPS** (cause non établie : prune d'images ou build d'un autre
   projet sur ce serveur partagé, pas de swap, peu de disque). `docker ps` seul ne montre rien : un
   service Swarm sans tâche vivante n'a pas de conteneur.
3. Redeploy par API (méthode standard, voir section 2) : `application.deploy` avec l'`applicationId`
   du backend → le build repasse, l'image est recréée.
4. Le conteneur plante alors au démarrage : `sudo docker service logs <service> --tail 30` →
   `ValidationError … Production requires APPLE_ENVIRONMENT=Production`.

**Cause du 2e plantage** : `backend/app/core/config.py` refuse de démarrer si `ENVIRONMENT=production`
avec `APPLE_ENVIRONMENT=Sandbox` (garde-fou ajouté avec la story StoreKit 2). Le défaut du code est
`development` ; c'est donc une variable `ENVIRONMENT=production` posée dans l'env Dokploy de
l'application qui déclenche l'erreur (déduit du message, valeur non relue sur le serveur). Le serveur
`dev` doit rester en **Sandbox Apple**, donc `ENVIRONMENT=development`.

**Résolu le 2026-10-05** : `ENVIRONMENT=development` posé via `application.saveEnvironment` puis
`application.deploy` ; `dev-api/health` → 200 (`database: ok`, `redis: ok`), service 1/1.

**Comment corriger / vérifier** : Dokploy, application backend → Environment → `ENVIRONMENT=development` →
Save → Deploy, ou `application.saveEnvironment` puis `application.deploy` par API. Un premier essai
manuel n'avait pas été pris en compte (l'env contenait toujours `ENVIRONMENT=production`) : toujours
**relire** après un Save. L'env est chiffré en base (`enc:v1:`), un `psql` direct ne le montre pas ;
passer par l'API (`application.one`) ou lire la spec du service :
`docker service inspect <service> --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' | grep -E '^(ENVIRONMENT|APPLE_ENVIRONMENT)='`.

**Suites du même incident (2026-10-05)**

- `GET /score` → 500 `relation "subscriptions" does not exist` : aucune migration Alembic ne créait cette
  table (en local elle vient de `create_all` via `make seed-test`), donc `alembic upgrade head` plantait
  sur la base dev, qui n'a jamais eu de migration depuis `c2078c6539a6`. Corrigé par la migration
  `a9c4e7b2d5f1` (backend PR #23) + `alembic upgrade head` désormais lancé au démarrage du conteneur
  (`CMD` du Dockerfile). Sauvegarde faite avant : `/srv/backups/cloudbreak-postgres-2026-10-05_11-30.sql.gz`.
- `GET /score` → 404 `PEAK_NOT_FOUND` : la table `peaks` était vide. Seed rejoué à la main :
  `docker exec -e PYTHONPATH=. <conteneur> python -m app.db.seed` (upsert sur `slug`, 23 782 sommets).
  Le seed n'est **pas** automatique au deploy : à refaire sur toute base neuve.

- Colonne `users.email` (backend PR #24, mergée le 2026-10-06) : migration `c8d1e5f2a7b3` appliquée
  automatiquement au démarrage du conteneur. **Vérifié le 2026-10-06** : service 1/1, `/health` 200,
  `alembic current` = `c8d1e5f2a7b3` (head), `ENVIRONMENT=development`, `APPLE_ENVIRONMENT=Sandbox`.
  Base locale mise au head le même jour (`alembic upgrade head` dans le conteneur `cloudbreak-backend`).
- CI GitHub : un job peut rester sans runner (annulé après 15 min, zéro étape) et faire sauter les jobs
  suivants — ce n'est pas le code ; `gh run rerun <id> --failed`.

**À retenir**

- 502 sur `dev-api` : toujours commencer par `docker service ls` (réplicas) puis `service ps` /
  `service logs`, pas `docker ps`.
- Un redeploy d'un code `develop` récent peut révéler une variable d'env serveur devenue incompatible
  avec un nouveau garde-fou : lire les logs du service juste après le deploy.
- Ne jamais lancer plusieurs builds Dokploy en parallèle (2 vCPU / 3,7 Go).
- Le seul vrai `production` possible côté backend est un futur env prod avec les credentials App Store
  complets (`APPLE_*`) ; ne pas mettre `ENVIRONMENT=production` sur le dev.

## 8ter. Mise en production (MEP) — à prévoir

**Le backend dev tourne volontairement en mode développement** : `ENVIRONMENT=development` et
`APPLE_ENVIRONMENT=Sandbox` (voir 8bis). La prod devra tourner en mode **production**, et ce mode est
verrouillé par un garde-fou dans `backend/app/core/config.py` : avec `ENVIRONMENT=production`, le
conteneur **refuse de démarrer** si l'une de ces conditions manque.

| Variable (env Dokploy de l'app prod) | Valeur attendue en prod |
|--------------------------------------|-------------------------|
| `ENVIRONMENT` | `production` |
| `APPLE_ENVIRONMENT` | `Production` (jamais `Sandbox`) |
| `APPLE_BUNDLE_ID` | bundle id de l'app |
| `APPLE_APP_ID` | entier > 0 (identifiant App Store Connect) |
| `APPLE_KEY_ID`, `APPLE_ISSUER_ID` | clé API App Store Connect |
| `APPLE_PRIVATE_KEY_PATH` | chemin d'un **fichier `.p8` lisible dans le conteneur** (monté via volume/secret Dokploy, jamais dans l'image ni dans git) |

Si l'une manque, l'erreur est au démarrage : `Production requires APPLE_ENVIRONMENT=Production`,
`Production Apple verification requires all App Store credentials` ou `Production requires a readable
private key file` (lire `docker service logs <service>`).

**Checklist avant la MEP**

- [ ] Environnement Dokploy `production` **séparé** du `dev` (apps, domaines `api.` / `ops.cloudbreak-app.com`).
- [ ] Base Postgres et Redis **prod dédiés**, avec leur propre volume. Jamais la base dev.
- [ ] Projet Supabase de prod (URL, clés, JWKS) distinct du dev ; réactiver « Confirm email ».
- [ ] Identifiants Apple complets + fichier `.p8` monté ; `APPLE_ENVIRONMENT=Production`.
- [ ] Chargement initial des sommets (`python -m app.db.seed`) **une seule fois**, à la main : il n'est jamais
  lancé par un deploy. Le seed remplace nom/GPS/altitude/région sur un `slug` existant (upsert) : ne pas
  le rejouer une fois des sommets modifiés ou ajoutés à la main (voir « points GPS manuels » ci-dessous).
- [ ] Migrations : lancées automatiquement au démarrage du conteneur (`CMD` du Dockerfile). Toutes
  rétro-compatibles (ajouter avant de supprimer) ; vérifier `alembic upgrade head` sur une **base vide**.
- [ ] Sauvegardes : celles du VPS (`/srv/backups`, rétention 14 j) sont sur la **même machine** → ajouter une
  copie hors serveur, et **tester une restauration** au moins une fois.
- [ ] Un deploy ne doit jamais toucher aux données : il ne reconstruit que l'image du backend.
- [ ] Secrets : hors de Notion et de git (variables Dokploy / fichiers protégés).
- [ ] Ne **jamais** mettre `ENVIRONMENT=production` sur le dev, ni `Sandbox` sur la prod.

**Points GPS manuels (à anticiper)** : tant qu'il n'existe pas de colonne distinguant les sommets du seed
des sommets saisis à la main (ex. `source = seed|manual`), un re-seed écraserait les corrections. À prévoir
avant d'ouvrir la saisie manuelle.

## 9. Ce qui reste à faire (infra)

- [ ] MEP : suivre la checklist de la section 8ter (conteneur backend en mode production, env prod séparé).

- [x] ~~Appliquer `ENVIRONMENT=development` sur le backend dev et redéployer~~ — fait le 2026-10-05, section 8bis.
- [ ] Comprendre pourquoi l'image du backend dev a disparu du VPS (`docker system df`, prune planifié ?) et
  éviter la récidive.

- [x] ~~Réserver un vrai nom de domaine~~ — fait le 2026-08-09, `cloudbreak-app.com`.
- [x] ~~Migrer les URLs `nip.io` vers `cloudbreak-app.com`~~ — fait le 2026-08-09, voir section 4bis.
- [x] ~~Renommer l'environnement Dokploy mal nommé "production"~~ — fait le 2026-08-09, renommé `dev`.
- [x] ~~Migrer le token GitHub perso de `cloudbreak-ops` vers un fine-grained PAT ou une deploy key scopés au repo~~ — fait le 2026-08-08, voir section 6.
- [ ] Monitoring (Better Stack / PostHog infra) toujours pas branché.
- [ ] Créer un vrai environnement de prod Dokploy séparé, quand une vraie prod existera (domaines
  `api.cloudbreak-app.com` / `ops.cloudbreak-app.com` déjà réservés dans le schéma de nommage, voir section 4bis).
