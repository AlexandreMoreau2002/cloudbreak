# Ops : variables d'environnement

> Source de vérité du code : `ops/.env.example` (noms) et ce document (rôle, origine, état par environnement). **À tenir à jour à chaque évolution d'ops** : toute variable ajoutée, renommée ou retirée est reportée ici dans la même session (règle dans `CLAUDE.md`, « Suivi de chantier »). Aucune valeur secrète dans ce fichier : jamais.

Dernière mise à jour : 2026-11-25.

## Règles

- Toutes les variables de la console sont **côté serveur uniquement** (jamais préfixées `NEXT_PUBLIC_`), sauf les deux variables publiques listées plus bas.
- Une variable absente ne fait jamais planter la console : le bloc concerné passe en « source indisponible », l'outil s'affiche sans lien, ou la connexion affiche « Connexion impossible » (cas de `SUPABASE_*`).
- En local : `ops/.env.local` (copie de `ops/.env.example`, valeurs du projet Supabase **dev**, jamais commité).
- Sur le serveur : Dokploy, application `cloudbreak-ops` (env `dev`) et `cloudbreak-ops-prod` (env `prod`). Voir « Poser une variable » en bas.

## Site public et pages légales

| Variable | Rôle | Secret | Si absente |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (liens canoniques, balises OG) | non | liens relatifs au local |
| `NODE_ENV` | `development` ou `production` | non | défaut Next |
| `APPLE_TEAM_ID` | Team ID Apple Developer, fichier `apple-app-site-association` (Universal Links) | non | Universal Links inactifs |
| `NEXT_PUBLIC_APP_STORE_URL` | Lien de la fiche App Store (bouton de `/sommet/[slug]`), `https://apps.apple.com/app/id6816759640` | non | la page affiche « L'app arrive bientôt » |
| `GIT_SHA`, `BUILT_AT`, `GIT_TAG` | Métadonnées de build pour `GET /version`. **Facultatives sur Dokploy** : un script de build relit le commit dans `.git` | non | `sha: unknown` si ni build args ni `.git` |

## Console admin : connexion et accès

| Variable | Rôle | Secret | Où la trouver | Si absente |
|---|---|---|---|---|
| `SUPABASE_URL` | Projet Supabase qui authentifie l'admin (`signInWithPassword` côté serveur, JWKS pour vérifier le jeton) | non | Supabase → Settings → API ; ou l'env du backend du même environnement | connexion impossible |
| `SUPABASE_PUBLISHABLE_KEY` | Clé publique (publishable) du même projet | non (publique, mais pas dans le code) | idem | connexion impossible |
| `ADMIN_USER_IDS` | UUID Supabase des admins autorisés, séparés par des virgules. Il faut **aussi** `app_metadata.role = "admin"` sur le compte | non | Supabase → Authentication → Users → UUID | vide = personne n'entre |

Le projet Supabase doit être **le même** que celui du backend que la console interroge (même `ADMIN_USER_IDS` côté backend, sinon les routes admin du backend répondent 403).

## Console admin : sources de données

| Variable | Rôle | Secret | Où la trouver | Si absente |
|---|---|---|---|---|
| `API_BASE_URL` | URL du backend lu par la console (`/api/v1/admin/overview`, `/version`) | non | `https://api.cloudbreak-app.com` (prod), `https://dev-api.cloudbreak-app.com` (dev) | blocs Utilisateurs, Crons, Serveur, version backend indisponibles |
| `BETTERSTACK_API_TOKEN` | Jeton Better Stack Uptime API, **lecture seule** | **oui** | Better Stack → Settings → API tokens | bloc Services indisponible |
| `BETTERSTACK_MONITOR_API_ID` | Identifiant du moniteur de l'API de prod | non | Better Stack → moniteur → URL ou API | ligne API indisponible |
| `BETTERSTACK_MONITOR_OPS_ID` | Identifiant du moniteur du site ops de prod | non | idem | ligne Site ops indisponible |
| `GITHUB_REPO_BACKEND` | `AlexandreMoreau2002/cloudbreak-backend` | non | — | comparaison à `main` indisponible |
| `GITHUB_REPO_OPS` | `AlexandreMoreau2002/cloudbreak-ops` | non | — | idem |
| `GITHUB_TOKEN` | Jeton GitHub **fine-grained, lecture seule**, limité aux deux dépôts (le dépôt ops est privé) | **oui** | GitHub → Settings → Developer settings → Fine-grained tokens | comparaison à `main` indisponible |
| `APP_STORE_ID` | Identifiant de l'app (`6816759640`), pour lire la version publiée sur l'App Store (API publique) | non | App Store Connect | version mobile indisponible |

## Console admin : carte Outils (Accueil)

Une URL absente, vide ou non http(s) donne un outil affiché **sans lien**.

| Variable | Outil |
|---|---|
| `TOOL_URL_BETTERSTACK` | tableau de bord Better Stack |
| `TOOL_URL_SENTRY` | projet Sentry |
| `TOOL_URL_POSTHOG` | projet PostHog |
| `TOOL_URL_SUPABASE` | dashboard du projet Supabase de prod (`supabase.com/dashboard/project/<ref>`) |
| `TOOL_URL_OVH` | OVH Manager |
| `TOOL_URL_BREVO` | Brevo |

## État par environnement (2026-11-24)

| Groupe | Local | `dev-ops` (Dokploy) | `ops` prod |
|---|---|---|---|
| Site public (`NEXT_PUBLIC_*`, `APPLE_TEAM_ID`, `NODE_ENV`) | `.env.local` | posé | posé |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_USER_IDS`, `API_BASE_URL` | Supabase dev | **posées sur les sources de prod** (le dev n'a pas de métriques) | **à poser à la mise en prod** |
| `BETTERSTACK_*` | facultatif | posées (lecture seule, moniteurs de prod) | **à poser à la mise en prod** |
| `GITHUB_*`, `APP_STORE_ID` | facultatif | posées | **à poser à la mise en prod** |
| `TOOL_URL_*` | facultatif | posées (pages d'accueil des outils, Supabase = projet prod ; Sentry en `sentry.io` générique, à remplacer par l'URL du projet si souhaité) | **à poser à la mise en prod** |

À la mise en prod : poser tout le bloc console sur `cloudbreak-ops-prod`, `API_BASE_URL` = backend prod, `ADMIN_USER_IDS` = UUID prod ; poser `ADMIN_USER_IDS` aussi sur `cloudbreak-backend-prod` ; puis remettre `dev-ops` sur le Supabase et l'API de dev. Test noir-boîte du build prod : `/fr/admin` sans cookie redirige vers la connexion, `/api/admin/*` répond 401.

## Poser une variable sur Dokploy

- Par l'API Dokploy depuis le VPS (jamais par l'interface web) : lire l'application (`application.one`), ajouter ou remplacer les lignes de `env`, puis `application.saveEnvironment` avec `applicationId`, `env`, `buildArgs`, `buildSecrets` et `createEnvFile` (les quatre sont obligatoires). Relire l'env après la sauvegarde, puis `application.deploy`. Les valeurs ne s'affichent jamais dans un terminal, un log ou un commit.
- Un seul build Dokploy à la fois (VPS partagé de 3,7 Go).
- Rotation : `GITHUB_TOKEN` et `BETTERSTACK_API_TOKEN` se régénèrent chez leur fournisseur, puis on remplace la valeur et on redéploie.
