# CLAUDE.md

Contexte projet pour Claude Code et Codex dans le repo racine Cloudbreak. Les règles génériques (orchestration, reviews, gestion des échecs) viennent du setup global et ne sont pas répétées ici. Les règles fines de chaque sous-projet sont dans `mobile/CLAUDE.md`, `backend/CLAUDE.md` et `ops/CLAUDE.md` (lus automatiquement quand on travaille dans ce dossier). `AGENTS.md` est le résumé Codex : ce fichier fait autorité en cas de divergence.

## Suivi de chantier

- `TODO.md` (racine) : carnet de bord du dev — tests manuels restants, état des stories, agents lancés, notes. **Lire en début de session, mettre à jour après chaque story ou chantier clos.** Il est listé dans `.gitignore` : il reste local à la machine et ne suit pas le projet entre machines.
- `docs/versions.md` : référence des versions déployées (dernier commit par submodule, versions clés, migrations, environnements). À mettre à jour à chaque ref de submodule bumpée sur `develop`, changement de dépendance majeure, nouvelle migration Alembic ou nouvel environnement serveur.
- Idées de features : les ajouter dans `_bmad-output/planning-artifacts/prd.md` (section V2 ou Vision), sans les détailler.

## Project Overview

Application iOS **Cloudbreak** : estime la probabilité d'une mer de nuage visible depuis un sommet donné, à une date et une heure précises. Le score tourne **côté serveur uniquement** (modifiable sans mise à jour de l'app). MVP cible : v1.0.0.

Architecture :

```
App mobile (Expo SDK 55 / React Native 0.83)
  ↓ HTTPS REST — Authorization: Bearer {jwt Supabase}
Backend FastAPI (Gunicorn + Uvicorn workers)
  ↓ app/core/dependencies.py : JWT validé localement + quota Redis
  ↓ app/domain/score*.py : algorithme heuristique (fonctions pures)
  ↓ app/services/weather.py → cache Redis (TTL 10 min) → WeatherProvider
  ↓ PostgreSQL 16
```

## Tech Stack

Vérifié dans les fichiers de dépendances.

| Zone | Technologies |
|------|--------------|
| Mobile (`mobile/`) | Expo SDK ~55.0 · React Native 0.83.6 · React 19.2 · Expo Router ~55 · TypeScript ~5.9 · Jest 29 + jest-expo + @testing-library/react-native · ESLint 9 (eslint-config-expo) · `react-native-iap` (StoreKit) · `@supabase/supabase-js` · `i18n-js` · AsyncStorage + expo-secure-store |
| Backend (`backend/`) | Python 3.12 · FastAPI 0.115.0 · Uvicorn/Gunicorn · SQLAlchemy 2.0 (asyncpg) · Alembic 1.14 · Pydantic 2.10 · redis-py 5.2 · httpx · python-jose · app-store-server-library · pytest 8 + pytest-cov · Ruff 0.8 · mypy 1.13 (strict) |
| Ops (`ops/`) | Next.js 16.2 (App Router) · React 19.2 · next-intl 4 · TypeScript 5 · Vitest 4 + Testing Library · Playwright · ESLint 9 · Prettier 3 |
| Infra | PostgreSQL 16 et Redis 7 (Docker, `backend/docker-compose.dev.yml`) · Dokploy sur VPS OVH (prod/dev, Traefik, webhook GitHub → redeploy) |
| Services externes | Supabase (auth) · Open-Meteo (`OpenMeteoProvider`, sans clé) · Apple StoreKit 2 (pas Stripe) |

Points à ne pas inventer :
- **Météo-France** est prévu comme provider secondaire mais **n'est pas implémenté** : seul `backend/app/services/weather_providers/open_meteo.py` existe.
- **PostHog** : la taxonomie d'events est câblée mais le SDK n'est pas branché (stubs `backend/app/services/analytics.py` et côté mobile).

## Project Structure

Repo racine = coordination des submodules + docs de planification. Le repo racine n'a pas de code applicatif.

| Chemin | Rôle |
|--------|------|
| `mobile/` (submodule) | App Expo. `src/app/` routes Expo Router (`(tabs)/`, `onboarding`, `paywall`) · `src/components/` · `src/hooks/` (plat, sauf `onboarding/`) · `src/contexts/` (Auth, Subscription, Paywall, Onboarding, Theme, Language…) · `src/services/api/` (clients REST par domaine) · `src/services/fetchService.ts` (`apiFetch<T>()`) · `src/services/mockData/` · `src/locales/` (fr/en) · `src/constants/devConfig.ts` (flags DEBUG, MOCK_API) · `src/__tests__/features/` · `ios/` (natif) |
| `backend/` (submodule) | API FastAPI. `app/main.py` (enregistrement des routers) · `app/api/v1/endpoints/` (routes minces) · `app/domain/` (règles pures : `score.py`, `score_components.py`, `score_context.py`, `weather_types.py` — dont le protocole `WeatherProvider`) · `app/services/` (quota, rate_limit, weather + providers, subscription, apple_store, user, analytics) · `app/core/` (config, dependencies, security, errors) · `app/models/` · `app/schemas/` · `app/db/` (session, seeds, `peaks_data.json`) · `alembic/` · `tests/` (+ `tests/features/`) · `http/` (fichiers REST Client) · `docs/` |
| `ops/` (submodule) | Next.js : pages légales CGU/Privacy (conformité App Store). `app/[locale]/` · `src/content/` (contenu légal en objets TS) · `src/components/` · `messages/` (i18n) · `e2e/` (Playwright) |
| `docs/` (racine) | Docs transverses : `infra-serveur.md` (référence serveur, sans secrets), `environnements.md`, `versions.md`, `sources-et-outils.md`, `analytics-posthog.md`, `story-*` |
| `_bmad-output/` | Planning : `planning-artifacts/` (prd.md, epics.md), `implementation-artifacts/sprint-status.yaml` |
| `_bmad/` | Config BMAD, **non versionnée** |

Docs par submodule : `backend/docs/` (story-*, `product-audit.md`, `security.md`) et `mobile/docs/` (story-*, `security.md`). Il n'y a **pas** de `docs/security.md` ni de `docs/product-audit.md` à la racine.

## Commands

Toujours lancer depuis le submodule concerné. Les commandes existent dans les fichiers listés.

**Backend** (`cd backend`, venv activé avec `source .venv/bin/activate`) :

```bash
make help              # liste les commandes
make dev               # API + Postgres + Redis (Docker, hot reload) — ne jamais lancer uvicorn directement
make down / make logs  # arrêt / logs des containers
make install           # pip install requirements + requirements-dev
make validate          # ruff check + ruff format --check + mypy app/ + pytest --cov=app
make lint              # ruff check .
make format            # ruff format .
make typecheck         # mypy app/
make test              # pytest --cov=app
make migrate           # alembic upgrade head (PYTHONPATH=.) — en déploiement, lancé tout seul au démarrage du conteneur
make migration         # alembic revision --autogenerate (demande une description)
make seed              # sommets initiaux (app.db.seed)
make seed-test         # users de test freemium/pro/admin
make unseed-test       # supprime ces users
make clean-subscriptions
make reset-db          # DROP + recreate + seed — destructif, demande confirmation
```

Tests ciblés : `pytest tests/test_score.py` ou `pytest tests/features/test_quota_flow.py`.

**Mobile** (`cd mobile`) :

```bash
npm install
npx expo run:ios       # première fois ou après ajout de module natif (build natif + Metro)
npm start              # Metro seul, build déjà installé sur le simulateur
npm run lint           # expo lint (ESLint)
npx tsc --noEmit       # TypeScript
npm test               # jest --coverage (script déjà en coverage)
npm test -- <motif>    # tests ciblés, ex: npm test -- useScore
npm run build:check    # expo export --platform ios
npm run validate       # tsc + lint + test coverage + build:check — à passer avant commit
```

Ne pas utiliser Expo Go (modules natifs incompatibles).

**Ops** (`cd ops`, Node ≥ 22) :

```bash
npm install
npm run dev            # next dev
npm run lint           # eslint .
npm run typecheck      # tsc --noEmit
npm run format         # prettier --write . (format:check pour vérifier)
npm test               # vitest run
npm run test:coverage  # vitest run --coverage
npm run build          # next build
npm run test:e2e       # playwright test
npm run validate       # format:check + lint + typecheck + coverage + build + e2e — avant commit
```

Tests ciblés : `npx vitest run src/components/ThemeToggle.test.tsx`.

## Development Rules

**Imports** (les trois sous-projets) : ordre en escalier — lignes du plus court au plus long, bibliothèques externes avant internes. Alias `@/` obligatoire pour tout import qui remonte de dossier (jamais de `../../`).

**Backend (Python)**
- `logger.info/debug/error` et jamais `print()`. Logs structurés : `logger.info("event", extra={...})`.
- SQLAlchemy ORM uniquement, pas de SQL brut. Secrets uniquement via `app/core/config.py` (variables d'env).
- Routes minces : la logique métier pure va dans `app/domain/`, les I/O dans `app/services/`.
- Réponses directes (pas de wrapper `{"status": "ok", "data": …}`). Erreurs : `{"detail": "...", "code": "ERROR_CODE"}`.
- Clés Redis préfixées (`weather:*`, `quota:*`, `cache:*`). Dates en ISO 8601 UTC.
- Ruff : ligne max 100, règles E/F/I/UP. mypy strict : convertir explicitement les `Column[str]` SQLAlchemy avec `str()` dans les schémas Pydantic.

**Mobile (TypeScript / React Native)**
- Appels réseau et `try/catch` uniquement dans les hooks, jamais dans les composants.
- Toute donnée asynchrone passe par `AsyncState<T>` (idle | loading | success | error).
- États loading/error/empty : composants unifiés (`AsyncStateView`, `ErrorState`, `EmptyState`, `LoadingSpinner`, skeletons) — jamais de états inline. Détail dans `mobile/CLAUDE.md`.
- Strings UI via `i18n.t('clé')`, clés ajoutées dans `src/locales/fr.ts` **et** `en.ts`.
- Données sensibles dans `expo-secure-store`, jamais dans AsyncStorage. Vérifier le cache offline avant tout appel réseau.
- Hooks `src/hooks/` à plat ; sous-dossier par domaine seulement pour un parcours isolé de 3+ hooks (`onboarding/`).

**Ops**
- Aucune string en dur dans les composants : `useTranslations()` + `messages/fr.json`.
- Contenu légal en objets TS structurés (`src/content/*.ts`), jamais de HTML brut dans un composant.
- Config d'environnement via `.env` + `.env.example`, jamais en dur.

**Debug**
- Backend : `logger.debug` aux points clés (entrée/sortie de `calculate_score()` avec composantes, résultat du hard gate, cache hit/miss Redis, réponse brute Open-Meteo). **Le niveau est figé à `INFO`** par `logging.basicConfig(level=logging.INFO)` dans `backend/app/main.py` : il n'existe pas de variable `LOG_LEVEL`. Pour diagnostiquer, passer temporairement ce niveau à `DEBUG` localement, sans le committer.
- Mobile : `DEBUG` (`src/constants/devConfig.ts`) = `__DEV__` **et** `EXPO_PUBLIC_DEBUG=true`. Mocks : `EXPO_PUBLIC_MOCK_API=true` (forcer les 3 verdicts sans attendre la météo réelle).

**Tests**
- Un fichier de test par fichier source. Backend : `backend/tests/test_<module>.py` (ex. `app/domain/score.py` → `tests/test_score.py`) et flux HTTP complets dans `tests/features/`. Mobile et ops : `Fichier.test.ts(x)` co-localisé ; flux dans `mobile/src/__tests__/features/`, e2e ops dans `ops/e2e/`.
- À tester obligatoirement : algo score (cas limites, seuils, inversion, hard gate), quota freemium Redis, validation JWT (valide/expiré/invalide), cache offline mobile, composants critiques (ScoreCard, PaywallScreen), hooks réseau.
- Objectif de couverture 100 % sur le code métier : c'est une **convention, non imposée** par la config (ni `fail_under` dans `pyproject.toml`, ni `coverageThreshold` dans Jest).
- Nouveau endpoint backend : requêtes ajoutées dans `backend/http/<domaine>.http` (nominal, sans `Authorization` → 403, payload invalide → 422, cas métier).
- Toute migration doit passer sur une **base vide** (`alembic upgrade head`) : en local `create_all` (via `make seed-test`) peut masquer une table jamais créée par Alembic (incident `subscriptions`, 2026-10-05).
- Note : `HTTPBearer` renvoie **403** (pas 401) quand `Authorization` est absent — nommer les tests en conséquence.

## Architecture Constraints

- **Score = serveur uniquement.** Ne pas déplacer la logique d'estimation dans l'app. La formule vit dans `backend/app/domain/`.
- **Météo via l'interface `WeatherProvider`** (`app/domain/weather_types.py`). Les endpoints n'appellent jamais Open-Meteo directement ; un nouveau provider implémente le protocole.
- **Deux caches distincts** : cache Redis serveur (météo TTL 10 min, quota freemium) et cache offline mobile (AsyncStorage, TTL 3 h, `mobile/src/hooks/useWeekData.ts`). Ne pas confondre ni fusionner.
- **Auth** : JWT Supabase validé localement (`app/core/security.py`, `app/core/dependencies.py`). Ne pas ajouter d'appel Supabase par requête.
- **Mobile** : réutiliser les contextes existants (`src/contexts/`) et les composants d'état partagés ; pas de nouvelle lib de state global.
- **Paiement = StoreKit 2** (`react-native-iap` côté app, `app-store-server-library` côté backend). Pas de Stripe, pas de `STRIPE_SECRET_KEY`.
- **Frontières** : le mobile ne parle qu'à l'API REST, jamais à la DB ni à Redis.
- **Freemium** : Free = 1 check/jour ; Premium = illimité (mensuel ou annuel, toujours `plan: "premium"` en DB, pas de plan « Pro »). Pas de publicité.

### Algorithme de score (`backend/app/domain/`)

**`cloud_base`** : calculé par méthode Skew-T à partir de température et point de rosée (pas un champ Open-Meteo direct).

Conditions bloquantes (verdict `"none"`, score 0) :
1. `cloud_base >= peak_altitude` (mer de nuage physiquement impossible)
2. `cloud_cover_low < 45 %` (couche basse trop fragmentée)

Score brut (si aucune condition bloquante) :

```python
score = (
    0.35 * cloud_base_score   # nuages bien sous le sommet
  + 0.20 * inversion_score    # T(850hPa) - T(925hPa)
  + 0.20 * humidity_score
  + 0.15 * wind_score         # vent faible = nuages stables
  + 0.10 * pressure_score     # anticyclone
)
```

Caps (`_apply_score_caps` dans `app/domain/score_components.py`), appliqués après le score brut :

| Condition | Cap absolu | Facteur |
|-----------|------------|---------|
| Pas d'inversion (T850 ≤ T925) | 39 | ×0.55 |
| `cloud_base` > sommet − 150 m | 55 | ×0.78 |
| `cloud_cover_low` < 55 % | 55 | ×0.82 |
| Vent ≥ 20 km/h | 39 | ×0.60 |

Final = `min(cap_absolu, round(score_brut × facteur))` pour chaque cap actif.

Verdict `"high"` : **toutes** ces conditions — `final_score >= 70`, inversion (`T850 > T925`), `cloud_base <= sommet − 150 m`, `cloud_cover_low >= 55 %`. Sinon `final_score >= 70` tombe en `"medium"`. Seuils : `"medium"` 40–69, `"low"` < 40.

Toute modification de la formule ou des seuils = changement métier : demander confirmation avant de coder, et couvrir chaque cas limite dans `tests/test_score*.py`.

## Data model & API

Tables (`backend/app/models/`) : `users` (PK `supabase_user_id`, `email` (copie du claim JWT, jamais exposée ni loggée), `survey_*`, `newsletter_opt_in`, `notif_favorites/regional/terrain`) · `peaks` (name, slug, lat, lng, altitude) · `predictions` (écrite à chaque `GET /api/v1/score`, best-effort) · `subscriptions` (plan, status, expires_at) · `terrain_validations` (`photo_url` toujours null pour l'instant) · `user_favorites` · `apple_subscription_events`. Pas de table `events` ni de colonne `push_token` dans le code actuel.

Endpoints (préfixe `/api/v1`, source : `backend/app/api/v1/endpoints/`) :

```
GET    /api/v1/score?peak_id=&date=&hour=
GET    /api/v1/peaks/search?q=
GET    /api/v1/peaks/{slug}
GET    /api/v1/user/favorites            POST /api/v1/user/favorites
DELETE /api/v1/user/favorites/{peak_id}
POST   /api/v1/validations
GET    /api/v1/user/me                   POST /api/v1/user/provision
PATCH  /api/v1/user/survey               PATCH /api/v1/user/preferences
PATCH  /api/v1/user/notifications        DELETE /api/v1/user
GET    /api/v1/user/subscription         POST /api/v1/user/subscription/verify
POST   /api/v1/webhooks/...              # webhooks Apple (subscription.py)
GET    /health
```

- `POST /api/v1/user/push-token` : **aucune route trouvée dans le code** — prévu, non implémenté.
- Endpoints protégés par JWT ; `/health` est public. `provision`, `survey` et `preferences` exigent un compte permanent (pas anonyme).

## Environment variables

Source de vérité : `backend/app/core/config.py` et `backend/.env.example` (le `.env` réel n'est jamais versionné). Principales : `DATABASE_URL`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWT_JWKS`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTHOG_API_KEY`, `EXPO_ACCESS_TOKEN`, et les `APPLE_*` (bundle, environnement Sandbox/Production, clés App Store).
Côté mobile : `EXPO_PUBLIC_DEBUG`, `EXPO_PUBLIC_MOCK_API`, `EXPO_PUBLIC_DEV_TOOLS`, `EXPO_PUBLIC_SUPPORT_EMAIL`.

## Validation

Matrice selon le type de changement :

| Changement | Validation minimale |
|-----------|---------------------|
| Mobile — composant visuel sans logique | `npx tsc --noEmit && npm run lint` |
| Mobile — hook, service, contexte, logique | `npm test -- <motif>` + `npx tsc --noEmit` |
| Mobile — transversal ou avant commit | `npm run validate` |
| Backend — logique métier (`app/domain/`) | `pytest tests/test_score*.py` + `make typecheck` |
| Backend — endpoint / API | tests `test_api_<x>.py` + `tests/features/` concernés + entrée dans `backend/http/` ; `make validate` avant commit |
| Backend — modèle / DB | `make migration` (relire le fichier généré) → `make migrate` → tests `test_models_*` et `test_migration_*` |
| Ops — page, composant, contenu | `npm run lint && npm run typecheck && npm test` ; `npm run test:e2e` si la navigation change |
| Avant commit / PR | `make validate` (backend), `npm run validate` (mobile et ops) |

Après chaque tâche, lancer les tests sans attendre qu'on le demande, corriger les échecs avant de répondre, et fournir les instructions de test manuel (requêtes `.http`, curl, ou étapes simulateur).

## Codex Guidance

- **Donner à Codex** : le `CLAUDE.md` du submodule concerné, les fichiers cibles, le critère d'acceptation (AC ou comportement attendu) et la commande de validation à lancer. Ne pas lui redonner l'architecture entière.
- **Commandes à lancer après modification** : voir la matrice ci-dessus. Ne jamais considérer une tâche terminée sans que la commande de validation passe.
- **Zones à ne pas modifier sans contexte explicite** :
  - `backend/app/domain/score*.py` (formule validée, changement métier) ;
  - `backend/alembic/versions/` (migrations déjà appliquées : on en ajoute une, on n'édite pas l'ancienne) ;
  - `backend/app/db/peaks_data.json` (données générées ; ne pas régénérer en boucle, rate-limit Open-Meteo) ;
  - `mobile/ios/` (projet natif) ;
  - `.env` et tout secret (gitignored, ne jamais recopier une valeur).
- **Dossiers générés/ignorés** : `mobile/node_modules/`, `mobile/dist/`, `mobile/coverage/`, `ops/coverage/`, `ops/test-results/`, `ops/node_modules/`, `backend/.venv/`, `.code-review-graph/`, `.agents/`, `_bmad/`, `docs/superpowers/`.
- **Tests à privilégier** : le test co-localisé du fichier modifié, puis la suite du domaine (`test_score*.py` pour l'algo, `tests/features/` pour les flux).
- **Git** : ne jamais committer sur `develop` ni `main` ; ne pas ajouter de `Co-Authored-By`.

## Git Workflow

- **Submodules** (`mobile`, `backend`, `ops`) : Git Flow. `main` = production, `develop` = branche par défaut et cible de toutes les PRs, `feature/<nom-story>` = une story par branche (partie de `develop`). `release/1.0.0` pour la préparation App Store.
- **Repo racine** : `main` uniquement, pas de code applicatif.
- Commit **dans le submodule d'abord**, puis bump de la ref dans le repo racine (`chore: update <submodule> ref`).
- Messages en Conventional Commits, impératifs (`feat:`, `fix:`, `chore:`, `docs:`, `style:`).
- **Pas de `Co-Authored-By`** dans les commits, tous repos.
- PRs : **squash merge** vers `develop`, avec `make validate` / `npm run validate` verts.
- Plans et specs superpowers : `docs/superpowers/`, jamais committés.

### Début de story

1. Lire la story dans `_bmad-output/planning-artifacts/epics.md` (ACs, FRs couverts).
2. Créer la sous-page Notion de checklist de test sous « Cloudbreak - mer de nuage » (`page_id: 325964bd-a185-8035-8585-ff14ef1f76c6`), titre `✅ Tests story {num} — {titre court}` : impact front/back, tests auto, un bloc par AC, résumé.
3. Écrire les tests avant le code (TDD léger : test rouge → implémentation minimale → refactor).

### Clôture de story

1. Merge PR en squash sur `develop`.
2. Cocher la checklist Notion ; `sprint-status.yaml` → `done` (ou `review` avec commentaire).
3. `TODO.md` : déplacer l'entrée vers « Mergé sur develop ✅ ».
4. Docs : `docs/story-{epic}-{num}-{slug}.md` dans le submodule ; `backend/docs/product-audit.md` ; `security.md` (backend et/ou mobile) si auth, data, API, secrets ou ports ; README du submodule si installation ou commandes changent ; ce `CLAUDE.md` si stack, structure, conventions ou formule changent.
5. Repo racine : `git add <submodule>` + commit `chore:` + `docs/versions.md`.
6. Remettre le local sur `develop` : `git checkout develop && git pull`, supprimer la branche locale, supprimer la branche distante si elle reste.
7. Réinstaller les dépendances si `package.json` ou `requirements*.txt` ont changé.
8. `git status` propre dans chaque submodule et à la racine.
9. Proposer la story suivante à partir de `epics.md` et `sprint-status.yaml`.

### Reviews après story

- `stairs-import-fixer` (agent projet, `.claude/agents/`) : applique la règle d'escalier des imports.
- `cloudbreak-dev-reviewer` : patterns, ACs, doc.
- `cloudbreak-security` : si la story touche auth, data, API, secrets ou StoreKit.

Ces deux derniers sont cités dans les CLAUDE.md des submodules mais ne figurent pas dans `.claude/agents/` du repo : leur source (setup global ou autre) reste à confirmer.

## Code-review-graph

Un graphe de connaissance du code est configuré (`.mcp.json`, `.codex/config.toml`, hooks `PostToolUse` / `SessionStart`). Avant de lire ou grepper, utiliser `semantic_search_nodes` / `query_graph` ; pour une review, `detect_changes` puis `get_review_context`. `get_impact_radius` pour le rayon d'impact d'une modif. `CRG_RECURSE_SUBMODULES=1` est nécessaire pour inclure les submodules. Rebuild manuel si le graphe est vide : `CRG_RECURSE_SUBMODULES=1 code-review-graph build`.

## Avant release 1.0.0

- **Deep link partage** : l'URL pointe sur `https://cloudbreak-app.com/sommet/{slug}`. Reste à faire : Universal Links iOS (`.well-known/apple-app-site-association` servi par la landing) + `associatedDomains`. Bloqué par le compte Apple Developer.
- **Supabase « Confirm email »** : désactivé en dev, à réactiver.
- **MountainBackground (login)** : rework visuel nécessaire.
- **PostHog** : brancher le SDK (backend + mobile) ; avant ça, mapper `error_code` côté auth vers un enum stable (le hook censé le faire, `useAuthForm.ts`, est **introuvable** dans `mobile/src/` — à vérifier).
- **Nom utilisateur** (avatar + nom dans le Profil) : pas de champ DB, à planifier.
- **`EXPO_PUBLIC_SUPPORT_EMAIL`** : adresse réelle pas encore choisie (fallback placeholder).

## Mode auto-amélioration

Chaque erreur répétée ou piège non évident (configuration, outil, comportement d'une lib) est consignée dans la mémoire projet de Claude pour ne pas se reproduire. Format : `## Erreurs connues` → `- [outil] description → solution`.
