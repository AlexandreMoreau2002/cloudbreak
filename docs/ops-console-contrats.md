# Ops console — contrats d'entrée-sortie et flux

> Date : 2026-11-22. **Fait foi pour toutes les formes de données, routes, secrets et flux de l'Epic 10.** À donner à Codex avec le `CLAUDE.md` du submodule et la story visée. En cas de divergence avec `epics.md` ou `ops-console-stories.md`, ce document gagne ; les écarts sont à corriger à la source.
> Liens : stories `docs/ops-console-stories.md` · AC `_bmad-output/planning-artifacts/epics.md` (Epic 10) · besoins `docs/ops-dashboard-besoins.md` · choix d'interface `docs/ops-dashboard-ux-decisions.md` · maquettes : artifact « Cloudbreak Ops » https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB (privé ; copie lisible du code dans `docs/ops-console-maquettes/`, 48 frames, identifiants `HOME-01` à `V1-05`).

## 1. Décisions figées (2026-11-22)

| Sujet | Décision |
|---|---|
| Métriques serveur | **Pas d'agent Better Stack** (le VPS n'a pas la marge de RAM). Un script cron léger sur le VPS envoie un relevé au backend **toutes les 15 min** (CPU, RAM, swap, disque). Le backend garde le dernier relevé et 24 h d'historique ; la console les affiche. |
| Alertes serveur | Le même script envoie un heartbeat Better Stack : succès si aucun seuil n'est franchi, `/fail` sinon. Un heartbeat manquant (script mort, VPS arrêté) alerte aussi. Seuils : disque > 85 %, RAM **disponible** < 10 %, swap > 75 %. **Pas d'alerte CPU.** Délai de détection ≤ 30 min (le NFR7 de 2 min vaut pour les moniteurs d'uptime, pas pour le serveur). |
| Session de la console | Connexion Supabase **faite côté serveur ops** ; session en **cookie httpOnly, Secure, SameSite=Lax**. Le navigateur ne lit jamais le JWT. Le serveur ops le vérifie (JWKS) et le **transmet au backend** en `Authorization: Bearer`. Aucun CORS à ajouter au backend. |
| Qui lit quoi | Inchangé (`ops-console-stories.md` §2) sauf : **les jauges Serveur viennent du backend** (`overview.server`), pas de Better Stack. Si l'API est en panne, les jauges passent en gris « Inconnu » (le moniteur d'uptime signale déjà la panne). |

## 2. Flux

### 2.1 Connexion et accès
```
Navigateur ──(email+mot de passe)──▶ Serveur ops : action serveur de connexion
Serveur ops ──▶ Supabase prod (signInWithPassword) ──▶ session
Serveur ops ──▶ cookie httpOnly posé ; redirection vers /[locale]/admin
Chaque requête /admin/** et /api/admin/** :
  cookie → JWT → vérif JWKS (iss, aud, exp) → app_metadata.role == "admin"
         → sub ∈ ADMIN_USER_IDS → sinon : page « accès refusé » neutre (403), aucune donnée
Session expirée : refresh côté serveur ; s'il échoue → écran « session expirée » (ACC-02)
```

### 2.2 Lecture des données
```
Page admin (navigateur) ──▶ GET /api/admin/{overview|health|versions}   (serveur ops, cookie)
  overview ──▶ Backend GET /api/v1/admin/overview    (Bearer = JWT de l'admin)
  health   ──▶ Better Stack Uptime API (jeton lecture seule) + Backend GET /health (Postgres, Redis)
  versions ──▶ Backend GET /version, Ops (soi-même), GitHub compare, iTunes Lookup
Le navigateur ne parle jamais à Better Stack, GitHub, App Store ni au backend.
```

### 2.3 Signaux du VPS vers le backend
```
cron VPS ──▶ POST /internal/heartbeats/{job}    (fin de chaque cron)   ──▶ table du dernier heartbeat
cron VPS ──▶ POST /internal/server-metrics      (toutes les 15 min)    ──▶ Redis (dernier + 24 h)
cron VPS ──▶ Better Stack heartbeat  (OK ou /fail)                      ──▶ alertes e-mail
Backend  ──▶ GET /api/v1/admin/overview lit ces deux sources.
```
Ordre de livraison : les routes `/internal/*` (10.3) doivent être **déployées en prod avant** de brancher les scripts du VPS. La partie « Better Stack seul » du script (10.1) peut partir plus tôt.

## 3. Contrats backend

Erreurs : `{"detail":"…","code":"ERROR_CODE"}`. Dates en ISO 8601 UTC. Aucune donnée personnelle.

### 3.1 `GET /version` (backend) et `GET /version` (ops) — publics
```json
{ "service": "backend", "sha": "9f3c2ab…", "built_at": "2026-11-22T10:15:00Z", "version": "1.0.0", "tag": "v1.0.0" }
```
- `service` ∈ `backend` | `ops` ; `tag` = tag `vX.Y.Z` si le SHA déployé est exactement ce tag, sinon `null` ; `sha` = `"unknown"` et `built_at` = `null` en build local.
- Aucune variable d'environnement ni secret dans la réponse.
- **Injection du SHA** : `ARG GIT_SHA`, `ARG BUILT_AT`, `ARG GIT_TAG` (vide si pas un tag) → `ENV` dans le Dockerfile. **À vérifier au premier essai sur dev** : si Dokploy ne fournit pas ces valeurs automatiquement, repli = les renseigner dans les « build args » de l'app Dokploy à chaque release, et le noter dans `docs/infra-serveur.md`.

### 3.2 `POST /internal/heartbeats/{job}`
- `job` ∈ `purge` | `favorites` | `backup` ; autre valeur → `404` `{"code":"HEARTBEAT_UNKNOWN_JOB"}`.
- Header `X-Cron-Secret` (`require_cron_secret` existant : `503` si désactivé, `403` si faux).
- Corps : `{ "status": "ok" | "fail", "duration_s": 12, "detail": "…" }` — `duration_s` et `detail` optionnels ; `detail` ≤ 200 caractères, sans secret ni donnée personnelle.
- Réponse `204`. Écrit : `job`, `last_run_at` (heure serveur), `last_status`, `last_ok_at`.
- Appelé **en plus** du heartbeat Better Stack, par chacun des trois scripts existants, à la fin du run.

### 3.3 `POST /internal/server-metrics`
- Même authentification. Corps (tous les champs requis, nombres ≥ 0) :
```json
{ "sampled_at": "2026-11-22T22:45:00Z", "cpu_load_1m": 0.35, "cpu_count": 2,
  "mem_total_mb": 3819, "mem_available_mb": 1474,
  "swap_total_mb": 4095, "swap_used_mb": 1929,
  "disk_total_gb": 78.0, "disk_used_gb": 44.5 }
```
- Réponse `204`. Stockage Redis, clés préfixées `ops:` : `ops:server_metrics:last` (TTL 45 min) et `ops:server_metrics:history` (liste plafonnée à 96 relevés = 24 h). Perte au redémarrage de Redis acceptée.
- `sampled_at` éloigné de plus de 5 min de l'heure serveur → `422`.

### 3.4 `GET /api/v1/admin/overview` (JWT admin)
`403` `ADMIN_FORBIDDEN` si non admin, sans `Authorization` ou allowlist vide. Chaque appel écrit une ligne dans `admin_audit_log`.
```json
{
  "generated_at": "2026-11-22T22:50:00Z",
  "kpis": {
    "users_total":          { "value": 412, "delta_7d": 31 },
    "users_permanent":      { "value": 188, "delta_7d": 12 },
    "users_anonymous":      { "value": 224, "delta_7d": 19 },
    "users_active_30d":     { "value": 140, "delta_7d": 9 },
    "subscriptions_active": { "value": 14,  "delta_7d": 2 },
    "subscriptions_trial":  { "value": 5,   "delta_7d": 1 }
  },
  "checks_daily": [ { "date": "2026-11-21", "count": 87 } ],
  "series_90d":   [ { "date": "2026-11-21", "users_total": 412, "users_permanent": 188, "users_anonymous": 224, "checks": 87 } ],
  "crons": [
    { "job": "purge", "state": "ok", "last_run_at": "2026-11-22T05:05:02Z", "last_status": "ok", "expected_every_s": 90000, "overdue_s": null }
  ],
  "server": {
    "state": "ok",
    "sampled_at": "2026-11-22T22:45:00Z",
    "cpu_load_1m": 0.35, "cpu_count": 2,
    "mem_available_mb": 1474, "mem_total_mb": 3819,
    "swap_used_mb": 1929, "swap_total_mb": 4095,
    "disk_used_pct": 57,
    "history_24h": [ { "sampled_at": "…", "cpu_load_1m": 0.3, "mem_available_pct": 38.6, "swap_used_pct": 47.1, "disk_used_pct": 57 } ]
  }
}
```
- `checks_daily` : 14 jours minimum ; `series_90d` : 90 jours ; un jour sans donnée vaut `0` (jamais absent).
- `crons[].state` ∈ `ok` | `late` | `failed` | `never`. `late` si `now − last_run_at > expected_every_s` ; `failed` si `last_status == "fail"` (prioritaire sur `late`) ; `never` si aucun heartbeat reçu. Attendus : purge 90 000 s (25 h), favoris 90 000 s, sauvegarde 93 600 s (26 h).
- `server.state` ∈ `ok` | `stale` (dernier relevé > 30 min) | `never`. En `stale` et `never`, les valeurs sont `null` côté jauges (affichées « Inconnu »).
- `delta_7d` = valeur d'aujourd'hui − valeur il y a 7 jours (peut être négatif).

## 4. Contrats serveur ops

Toutes les routes exigent la session admin (§2.1). Sans session : `401` ; non admin : `403` ; jamais de donnée dans ces cas. Une source en échec **ne renvoie jamais 500** : enveloppe commune, HTTP `200` :
```json
{ "status": "ok" | "unavailable", "fetched_at": "2026-11-22T22:50:00Z", "data": { }, "last_known": { "fetched_at": "…", "data": { } } }
```
- `unavailable` → `data: null` ; `last_known` = dernière réponse réussie en mémoire du processus (`null` au démarrage). Réponse inattendue (forme invalide) = `unavailable`, détail dans les logs, pas dans la réponse.
- Cache serveur : `overview` 30 s, `health` 60 s, `versions` 5 min. Le bouton « Réessayer » contourne le cache (`?refresh=1`).

### 4.1 `GET /api/admin/overview`
`data` = la réponse §3.4 telle quelle (le serveur ops fait passer le JWT de l'admin).

### 4.2 `GET /api/admin/health`
```json
{ "services": [
    { "id": "api", "status": "up", "uptime_24h_pct": 100, "uptime_30d_pct": 99.97,
      "last_incident": { "started_at": "2026-11-18T08:02:00Z", "duration_s": 420 } },
    { "id": "ops", "status": "up", "uptime_24h_pct": 100, "uptime_30d_pct": 100, "last_incident": null } ],
  "database": "ok" | "error" | "unknown",
  "redis":    "ok" | "error" | "unknown" }
```
- `status` ∈ `up` | `down` | `degraded` | `unknown`. `database` et `redis` viennent du `/health` public du backend ; injoignable → `unknown`, jamais `error`.
- Source : Better Stack Uptime API v2 (monitors, incidents, disponibilité), jeton lecture seule en `Authorization: Bearer`. **À confirmer en 10.4b** : l'API donne-t-elle la disponibilité 30 jours jour par jour (barres de `SAN-01`) ? Sinon, retirer les barres de la maquette.
- Les jauges Serveur ne passent **pas** par cette route (elles sont dans `overview.server`).

### 4.3 `GET /api/admin/versions`
```json
{ "services": [
    { "id": "backend", "version": "1.0.0", "tag": "v1.0.0", "sha": "9f3c2ab", "built_at": "2026-11-22T10:15:00Z",
      "behind_main_by": 0, "status": "up_to_date" | "behind" | "unknown" },
    { "id": "ops", "…": "…" } ],
  "mobile": { "store_version": "1.0.0", "checked_at": "2026-11-22T22:50:00Z" } }
```
- `behind_main_by` : GitHub `GET /repos/{owner}/{repo}/compare/{sha}...main` → `ahead_by`. `null` si SHA `unknown` ou GitHub injoignable ; `status` = `unknown` dans ce cas, jamais `behind`.
- App Store : `GET https://itunes.apple.com/lookup?id={APP_STORE_ID}&country=fr` → `results[0].version`. Pas de numéro de build.
- Pas de ligne « 1.0.1 dans `main` » en v0 (décision par défaut : seule la version publiée est affichée).

## 5. Variables d'environnement

**Backend** : `ADMIN_USER_IDS` (UUID séparés par des virgules ; vide = personne), `INTERNAL_CRON_SECRET` (existant, ≥ 32 car.), `GIT_SHA`, `BUILT_AT`, `GIT_TAG` (build args).

**Ops** (serveur uniquement, aucune `NEXT_PUBLIC_`) : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_USER_IDS`, `API_BASE_URL` (ex. `https://api.cloudbreak-app.com`), `BETTERSTACK_API_TOKEN` (lecture seule), `BETTERSTACK_MONITOR_API_ID`, `BETTERSTACK_MONITOR_OPS_ID`, `GITHUB_REPO_BACKEND` et `GITHUB_REPO_OPS` (`owner/nom`), `GITHUB_TOKEN` (optionnel, lecture seule), `APP_STORE_ID` (`6816759640`), `TOOL_URL_BETTERSTACK`, `TOOL_URL_SENTRY`, `TOOL_URL_POSTHOG` (vide = « bientôt »), `TOOL_URL_SUPABASE`, `TOOL_URL_OVH`, `TOOL_URL_BREVO`, `GIT_SHA`, `BUILT_AT`, `GIT_TAG`. Tout est documenté dans `ops/.env.example`, sans valeur réelle.

## 6. Scripts du VPS (story 10.1 puis branchement après 10.3)

- **`~/cloudbreak-server-metrics.sh`** (nouveau), cron `*/15 * * * *` : lit `free -m` (colonne `available`), `df /`, `/proc/loadavg`, `nproc` ; calcule les trois seuils ; envoie le relevé (`POST /internal/server-metrics`, après 10.3) puis le heartbeat Better Stack (`<URL>` si OK, `<URL>/fail` si un seuil est franchi). Secret en fichier de permissions 600 et `-H @fichier` (jamais en argument), log dans `~/cloudbreak-server-metrics.log`, aucune dépendance installée. Heartbeat Better Stack : attendu toutes les 15 min, marge 15 min.
- **Scripts existants** (`~/cloudbreak-*-prod.sh`, `/srv/scripts/backup-databases.sh`) : ajouter `POST /internal/heartbeats/{purge|favorites|backup}` à la fin, avec `status` selon le code de sortie. Un échec de ce ping ne doit jamais faire échouer le job.
- Une seule connexion SSH à la fois ; aucun secret dans git, chat ou log.

## 7. Découpage Codex (un prompt = une ligne, dans l'ordre de développement)

| Vague | Prompt | Repo | Contrats | Validation |
|---|---|---|---|---|
| 1 | 10.4a socle | ops | §2.1, §5 | `npm run validate` |
| 1 | 10.3 admin lecture seule | backend | §3.2, §3.3, §3.4 | `make validate` + revue `cloudbreak-security` |
| 1 | 10.2 `/version` | backend, ops | §3.1 | `make validate`, `npm run validate` |
| 1 | 10.1a alertes | VPS, backend | §6, log 5xx | checklist manuelle + `make validate` |
| 2 | 10.4b sources | ops | §2.2, §4 | `npm run validate` |
| 3 | 10.4c Utilisateurs | ops | §4.1 | `npm run validate` |
| 3 | 10.4d Santé | ops | §4.1, §4.2 | `npm run validate` |
| 3 | 10.4e Déploiements | ops | §4.3 | `npm run validate` |
| 3 | 10.4g Pages légales | ops | §2.1 | `npm run validate` (dont e2e du site légal) |
| 4 | 10.4f Accueil | ops | §4 | `npm run validate` |
| 5 | 10.1b branchement VPS | VPS | §3.2, §3.3, §6 | checklist manuelle |

Maquettes de chaque prompt : `docs/ops-console-stories.md` §1. Règles communes (collisions de traductions, composants partagés) : §3 du même fichier.
