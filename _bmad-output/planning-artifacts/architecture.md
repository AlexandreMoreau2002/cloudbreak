---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: complete
completedAt: "2026-03-17"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
project_name: 'cloudbreak'
user_name: 'Alex'
date: '2026-03-17'
---

# Architecture Decision Document — Cloudbreak

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées au fil des décisions architecturales._

---

## Project Context Analysis

### Requirements Overview

**Exigences fonctionnelles — 38 FRs, 9 catégories :**

| Catégorie | FRs | Complexité architecturale |
|-----------|-----|--------------------------|
| Prévision & score | FR1–FR7 | Haute — algorithme serveur, cache météo, provider abstraction |
| Recherche & navigation | FR8–FR11 | Moyenne — DB sommets, deep links |
| Auth & compte | FR12–FR15 | Faible — Supabase délègue |
| Freemium & monétisation | FR16–FR21 | Haute — StoreKit 2, état subscription, quota enforcement |
| Notifications & alertes | FR22–FR25 | Moyenne — push scheduling, geofencing GPS |
| Validation terrain | FR26–FR29 | Moyenne — GPS, photos, aggregation stats |
| Offline-light | FR30–FR32 | Moyenne — cache TTL, état réseau |
| Onboarding | FR33–FR34 | Faible |
| Monitoring & ops | FR35–FR38 | Moyenne — BetterStack + PostHog |

**NFRs critiques pour l'architecture :**

- NFR1 : score < 500ms (95e percentile) → cache météo obligatoire
- NFR5 : disponibilité ≥ 99% → process manager + auto-restart sur VPS
- NFR7 : alertes < 2min → BetterStack free tier
- NFR8 : CI/CD < 5min → GitHub Actions léger
- NFR15 : 1 000 users sans modif, 10 000 sans refonte → VPS single tient MVP
- NFR16 : cache météo 10 min par zone → Redis ou cache in-process
- NFR17 : provider météo abstrait → interface Python
- NFR21 : algo côté serveur uniquement
- NFR24–NFR25 : i18n dès J0

**Contraintes opérationnelles (Alex) :**
- VPS OVH — self-hosted, pas de managed cloud
- Zéro licence Apple Developer pour l'instant (simulateur uniquement)
- Setup pro mais minimaliste — Docker Compose, pas Kubernetes
- Expérience "tout fait à la main" → automatisation de base obligatoire

**Scale & Complexité :**
- Domaine : mobile + backend API
- Complexité : moyenne (pas de real-time WS, pas de multi-tenant)
- Composants : ~6 (mobile, backend, DB, cache, auth, monitoring)

### Technical Constraints & Dependencies

- iOS uniquement MVP — pas d'Android, pas de web
- StoreKit 2 obligatoire — 100% Apple In-App Purchase
- Supabase EU (Frankfurt) — auth + RGPD
- API météo gratuite — Open-Meteo (provider principal, sans clé) + Météo-France (provider secondaire, précision FR)
- VPS OVH — IP fixe, SSH, Ubuntu, pas de managed services
- Pas de licence Apple Developer → simulateur jusqu'à enrôlement (99$/an)

### Cross-Cutting Concerns Identifiés

1. **Auth / identité** — Supabase JWT traverse mobile → backend
2. **Feature flags** (NFR27) — activer/désactiver sans redéploiement
3. **Cache météo** — partagé entre toutes les requêtes de score (anti-quota API)
4. **État subscription** — vérification backend à chaque appel score
5. **Logging & observabilité** — logs structurés FastAPI + BetterStack + PostHog
6. **CI/CD** — pipeline léger solo dev : test → build → déploiement VPS < 5min
7. **Déploiement VPS** — processus reproductible, pas "fait à la main"

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack mobile + API :
- Mobile : Expo SDK 55 + React Native 0.83 (iOS-first)
- Backend : FastAPI 0.135 + PostgreSQL + Redis
- Auth : Supabase (délégué)

### Mobile — `create-expo-app`

**Commande d'initialisation :**

```bash
npx create-expo-app mobile --template default@sdk-55
```

**Scaffold (SDK 55, mars 2026) :**
- React Native 0.83.2 + React 19.2
- New Architecture uniquement (Legacy supprimée)
- Expo Router (navigation file-based)
- iOS 15.1+ minimum

**Adaptations post-init :**
- TypeScript strict (`tsconfig.json`)
- `@expo-google-fonts/josefin-sans`
- `react-native-safe-area-context`, `react-native-reanimated`
- Structure : `src/screens/`, `src/components/`, `src/constants/`, `src/contexts/`
- ThemeContext + design tokens, `i18n-js`

**Qualité code (dev + CI/CD) :**
- Linter : ESLint + `@typescript-eslint` + `eslint-plugin-react-native`
- Formatter : Prettier
- Tests unitaires : Jest + React Native Testing Library
- Build check : `npx expo export` (vérifie que le bundle compile sans erreur)

### Backend — FastAPI

**Structure retenue :**

```
backend/
├── app/
│   ├── api/v1/endpoints/   # score.py, peaks.py, auth.py, subscriptions.py
│   ├── core/               # config.py, security.py
│   ├── models/             # SQLAlchemy
│   ├── schemas/            # Pydantic v2
│   ├── services/           # score.py, weather.py, subscriptions.py
│   └── main.py
├── tests/
├── Dockerfile
└── requirements.txt
```

**Stack :** Python 3.12 · FastAPI 0.135 · Gunicorn + Uvicorn workers · SQLAlchemy + Alembic · Pydantic v2

**Qualité code (dev + CI/CD) :**
- Linter : Ruff (lint + format — remplace flake8 + isort + black en 1 outil)
- Typage : mypy (strict)
- Tests unitaires : pytest + pytest-asyncio + httpx (test client async)
- Build check : `docker build` (vérifie que l'image se construit sans erreur)

### Infra VPS — Docker Compose

```yaml
services:
  api:    # FastAPI — Gunicorn + 4 Uvicorn workers
  db:     # PostgreSQL 16 — volume persistant
  redis:  # Redis 7 — cache météo TTL 10min
  caddy:  # Reverse proxy HTTPS automatique (Let's Encrypt)
```

**Pourquoi Caddy :** HTTPS Let's Encrypt automatique, 1 `Caddyfile` de 5 lignes, zéro maintenance SSL.

### CI/CD — GitHub Actions

**Pipeline mobile (`mobile/`):**

```
push → lint (ESLint) → tests (Jest) → build check (expo export) → ✅
```

**Pipeline backend (`backend/`):**

```
push → lint (Ruff + mypy) → tests (pytest) → build check (docker build) → deploy VPS (SSH + docker compose up -d)
```

**Déploiement :** SSH sur VPS OVH → `docker compose pull && docker compose up -d` — reproductible, < 5min.

**Monitoring :** BetterStack free — heartbeat `/health` toutes les 60s → alerte SMS/email < 2min.

---

## Core Architectural Decisions

### Data Architecture

**Base de données :** PostgreSQL 16

**Schéma MVP :**

| Table | Colonnes clés | Description |
|-------|---------------|-------------|
| `users` | `id` (UUID Supabase) | Auth déléguée, profil minimal |
| `peaks` | `id`, `name`, `slug`, `lat`, `lng`, `altitude` | Sommets indexés (seed initial) |
| `predictions` | `peak_id`, `user_id`, `date`, `hour`, `score`, `cloud_base`, `verdict`, `created_at` | Résultats calcul (cache DB 10min) |
| `subscriptions` | `user_id`, `plan`, `status`, `expires_at` | État abonnement StoreKit 2 |
| `terrain_validations` | `prediction_id`, `user_id`, `result`, `photo_url`, `lat`, `lng`, `validated_at` | Data flywheel |
| `events` | `user_id`, `name`, `properties`, `created_at` | Analytics business |

**Migrations :** Alembic — versionné, rejoué en CI avant les tests.

**Cache météo :** Redis 7 — clé `weather:{lat}:{lng}:{date}`, TTL 10min. Redis persiste entre les restarts Docker (pas de cache in-process).

**Quota freemium :** Redis — clé `quota:{user_id}:{date}`, incrémenté à chaque score. Reset automatique (TTL = fin de journée). Vérifié côté backend uniquement.

**Validation :** Pydantic v2 — schemas séparés Request / Response / DB.

### Authentication & Security

**Auth :** Supabase JWT — le mobile obtient un token Supabase, le backend vérifie via clé publique locale (pas d'appel réseau Supabase à chaque requête).

**Autorisation :** dependency FastAPI `get_current_user` injectée sur chaque route protégée.

**Sécurité transport :** HTTPS via Caddy (TLS automatique Let's Encrypt), HSTS activé.

**Secrets :** variables d'environnement `.env` (jamais committées), injectées dans Docker Compose.

### API & Communication

**Design :** REST JSON, versionnée `/api/v1/`. Pas de GraphQL.

**Endpoints MVP :**

```
GET    /api/v1/score?peak_id=&date=&hour=    → score + verdict + conditions
GET    /api/v1/peaks/search?q=               → autocomplete sommets
GET    /api/v1/peaks/{slug}                  → détail sommet
POST   /api/v1/validations                   → validation terrain
GET    /api/v1/user/subscription             → état abonnement
POST   /api/v1/user/subscription/verify      → receipt StoreKit 2
DELETE /api/v1/user                          → RGPD droit à l'effacement
GET    /health                               → heartbeat BetterStack
```

**Documentation :** OpenAPI auto-générée par FastAPI (`/docs`).

**Erreurs :** codes HTTP standard + body `{detail: string, code: string}`. Jamais de stack trace en production.

**Provider météo abstrait :** interface Python `WeatherProvider` → `get_forecast(lat, lng, date)` → dict normalisé. Implémentations : `OpenMeteoProvider` (provider principal MVP, gratuit sans clé, données altimétriques), `MeteoFranceProvider` (provider secondaire FR, haute précision montagne). Swap sans modifier `score.py`.

### Mobile Architecture

**Navigation — Expo Router (file-based) :**

```
app/
├── (tabs)/
│   ├── index.tsx        # Home — ScoreCard
│   ├── search.tsx       # Recherche sommets
│   ├── favorites.tsx    # Favoris
│   └── profile.tsx      # Compte + abonnement
├── onboarding.tsx       # Premier lancement
├── paywall.tsx          # Conversion Premium
└── _layout.tsx
```

**State management :** React Context léger — `ThemeContext`, `AuthContext`, `SubscriptionContext`. Pas de Redux/Zustand pour le MVP.

**Appels API :** `fetch` natif + wrapper `apiClient.ts` — gestion token Supabase, retry simple, détection offline.

**Cache offline :** `AsyncStorage` — clé `cache:score:{peak_id}:{date}`, TTL 2-3h vérifié au read.

**Feature flags :** objet `flags.ts` hardcodé en MVP, remplaçable par endpoint `/api/v1/config` post-lancement.

### Infrastructure & Déploiement

**VPS :** OVH Ubuntu 24.04 LTS, Docker + Docker Compose, accès SSH par clé.

**Docker Compose production :**

```yaml
services:
  api:    # FastAPI — Gunicorn + 4 Uvicorn workers, restart: unless-stopped
  db:     # postgres:16, volume persistant pgdata
  redis:  # redis:7-alpine, restart: unless-stopped
  caddy:  # caddy:2, ports 80+443, Caddyfile + volume caddy_data
```

**CI/CD GitHub Actions — Backend (`backend/`) :**

```yaml
on: push (main, develop)
jobs:
  quality:  ruff check · ruff format --check · mypy · pytest --cov
  build:    docker build ./backend
  deploy:   # main uniquement — SSH VPS → docker compose pull && up -d
```

**CI/CD GitHub Actions — Mobile (`mobile/`) :**

```yaml
on: push (main, develop)
jobs:
  quality:  eslint · tsc --noEmit · jest --coverage
  build:    npx expo export
```

**Monitoring :**
- BetterStack free : heartbeat `/health` 60s → SMS/email < 2min
- Logs FastAPI structurés JSON → stdout → Docker logs
- PostHog events business : `onboarding_complete`, `score_checked`, `conversion_trial`, `subscription_started`

### Decision Priority Analysis

**Critiques (bloquent l'implémentation) :**
- JWT Supabase validé localement côté backend
- Quota freemium Redis côté backend (pas côté app)
- Cache météo Redis clé `weather:{lat}:{lng}:{date}` TTL 10min
- Interface `WeatherProvider` abstraite dès J1

**Importantes (shape l'architecture) :**
- Expo Router file-based → structure dossiers fixée
- AsyncStorage cache offline TTL vérifié au read
- Alembic migrations rejouées en CI avant tests
- Caddy reverse proxy HTTPS automatique

**Différées post-MVP :**
- Remote feature flags
- Rate limiting avancé
- Dashboard monitoring évolué
- Calibration workers Gunicorn sous charge

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Base de données — snake_case strict :**

```sql
-- ✅ Correct
-- tables: peaks, users, predictions, terrain_validations
-- colonnes: peak_id, cloud_base, created_at, expires_at
-- FK: {table_singulier}_id  →  user_id, peak_id
-- index: idx_{table}_{colonne}  →  idx_predictions_peak_id

-- ❌ Interdit: Peaks, UserID, createdAt, fk_user
```

**API — kebab-case URLs, snake_case JSON :**

```
GET /api/v1/peaks/search?q=mont-blanc        ✅
GET /api/v1/terrain-validations              ✅
body: { "peak_id": "...", "cloud_base": 1200 } ✅

/api/v1/peakSearch, { "peakId": "..." }       ❌
```

**Backend Python — snake_case :**

```python
# ✅ def get_score(...), class WeatherProvider, weather_service
# ❌ def getScore(...), class weatherProvider
```

**Mobile TypeScript — camelCase variables/fonctions, PascalCase composants :**

```typescript
// ✅ const scoreValue, function getScoreColor(), const ScoreCard: React.FC
// ❌ const score_value, function get_score_color, const scorecard
```

**Fichiers :**

```
backend/   → snake_case     : score.py, weather_provider.py, test_score.py
mobile/    → PascalCase     : ScoreCard.tsx, CloudLayerViz.tsx (composants)
           → camelCase      : useTheme.ts, apiClient.ts (hooks/utils)
           → kebab-case     : peak-detail.tsx (routes Expo Router)
```

---

### Structure Patterns

**Backend — tests dans `tests/` (pas inline) :**

```
backend/tests/
├── conftest.py           # fixtures partagées
├── test_score.py         # algo score
├── test_weather.py       # provider météo
├── test_api_score.py     # endpoints HTTP
└── test_subscriptions.py
```

**Mobile — tests co-localisés (`*.test.tsx`) :**

```
src/components/
├── ScoreCard.tsx
├── ScoreCard.test.tsx    # co-localisé
```

**Mobile — structure dossiers :**

```
src/
├── components/   # UI réutilisables
├── contexts/     # ThemeContext, AuthContext, SubscriptionContext
├── hooks/        # useScore, usePeaks, useSubscription
├── services/     # apiClient.ts, cacheService.ts
├── constants/    # colors.ts, typography.ts, spacing.ts, flags.ts
└── utils/        # formatScore.ts, dateUtils.ts
```

---

### Format Patterns

**API — réponses directes (pas de wrapper `{data: ...}`) :**

```json
// ✅ Correct
{ "score": 73, "verdict": "high", "label": "Lève-toi tôt !", "cloud_base": 1200 }

// ❌ Interdit
{ "data": { "score": 73 }, "status": "ok" }
```

**API — erreurs uniformes :**

```json
// ✅ { "detail": "Quota journalier atteint", "code": "QUOTA_EXCEEDED" }
// ❌ { "error": "Not found" }, { "message": "error", "status": 404 }
```

**Dates — ISO 8601 UTC :**

```
"created_at": "2026-03-17T06:40:00Z"   ✅
"date": "2026-03-17"                    ✅ (date seule)
timestamps Unix, "17/03/2026"           ❌
```

**JSON — snake_case API, camelCase mobile (transform dans `apiClient.ts`) :**

```typescript
// API retourne: { "cloud_base": 1200 }  →  mobile reçoit: { cloudBase: 1200 }
```

---

### Process Patterns

**États asynchrones — `AsyncState<T>` systématique :**

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }

// ❌ Interdit: { isLoading: boolean, data: T | null, error: Error | null }
```

**Appels réseau — dans les hooks, jamais dans les composants :**

```typescript
// ✅ Correct — try/catch dans le hook
const useScore = (peakId: string) => {
  const [state, setState] = useState<AsyncState<Score>>({ status: 'idle' })
  const fetch = async () => {
    setState({ status: 'loading' })
    try {
      const data = await apiClient.getScore(peakId)
      setState({ status: 'success', data })
    } catch (e) {
      setState({ status: 'error', error: parseApiError(e) })
    }
  }
  return { ...state, fetch }
}
// ❌ Interdit: try/catch dans un composant React
```

**Cache offline — vérification avant fetch :**

```typescript
// Pattern systématique dans tous les hooks réseau
const cached = await cacheService.get(`score:${peakId}:${date}`)
if (cached && !cacheService.isExpired(cached)) return { ...cached, fromCache: true }
const fresh = await apiClient.getScore(peakId)
await cacheService.set(`score:${peakId}:${date}`, fresh, TTL_2H)
return fresh
```

**Erreurs backend — codes métier centralisés :**

```python
# app/core/errors.py
class ErrorCode:
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    PEAK_NOT_FOUND = "PEAK_NOT_FOUND"
    WEATHER_UNAVAILABLE = "WEATHER_UNAVAILABLE"
    SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED"

# Usage
raise HTTPException(404, detail={"detail": "...", "code": ErrorCode.PEAK_NOT_FOUND})
```

**Logs backend — JSON structuré, niveaux stricts :**

```python
logger.info("score_calculated", extra={"peak_id": peak_id, "score": score})
logger.warning("weather_provider_slow", extra={"duration_ms": 850})
logger.error("weather_provider_failed", extra={"provider": "openweather", "error": str(e)})
# ❌ Interdit: print(), logger.debug() en production
```

**Préfixes clés Redis :**

```
weather:{lat}:{lng}:{date}     # cache météo TTL 10min
quota:{user_id}:{date}         # compteur freemium TTL fin de journée
cache:{resource}:{id}:{date}   # cache générique mobile
```

---

### Enforcement Guidelines

**Tout agent DOIT :**
- snake_case pour toutes colonnes et tables PostgreSQL
- `{detail, code}` pour toutes les erreurs API
- Appels réseau dans les hooks uniquement
- `AsyncState<T>` pour tout état asynchrone mobile
- Vérifier le cache offline avant tout appel réseau
- Logger en JSON structuré côté backend
- Préfixer toutes les clés Redis

**Anti-patterns bannis :**
- `{"status": "ok", "data": result}` en réponse API
- `print()` ou `logger.debug()` en production
- `try/catch` dans les composants React
- Couleurs ou strings UI hardcodées hors tokens/i18n

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
mer-de-nuage/
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       ├── backend.yml          # lint + test + build + deploy (main)
│       └── mobile.yml           # lint + test + build check
│
├── mobile/                      # Expo SDK 55 / React Native
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── jest.config.js
│   ├── app.json
│   ├── app/                     # Expo Router (file-based)
│   │   ├── _layout.tsx          # root layout + providers
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx      # bottom nav config
│   │   │   ├── index.tsx        # Home — ScoreCard
│   │   │   ├── search.tsx       # Recherche sommets
│   │   │   ├── favorites.tsx    # Favoris
│   │   │   └── profile.tsx      # Compte + abonnement
│   │   ├── onboarding.tsx       # Premier lancement
│   │   └── paywall.tsx          # Conversion Premium
│   └── src/
│       ├── components/
│       │   ├── ScoreCard.tsx + ScoreCard.test.tsx
│       │   ├── CloudLayerViz.tsx + CloudLayerViz.test.tsx
│       │   ├── WeekStrip.tsx + WeekStrip.test.tsx
│       │   ├── ConditionBadge.tsx
│       │   ├── AlertCTA.tsx
│       │   ├── PeakFavoriteChip.tsx
│       │   ├── OnboardingSlide.tsx
│       │   ├── PaywallScreen.tsx
│       │   ├── ValidationBottomSheet.tsx
│       │   └── Button.tsx
│       ├── contexts/
│       │   ├── ThemeContext.tsx
│       │   ├── AuthContext.tsx
│       │   └── SubscriptionContext.tsx
│       ├── hooks/
│       │   ├── useScore.ts        # FR1–FR7 — fetch + cache + AsyncState
│       │   ├── usePeaks.ts        # FR8–FR10 — search + favoris
│       │   ├── useSubscription.ts # FR16–FR21 — état abonnement
│       │   ├── useNotifications.ts # FR22–FR25 — push permissions
│       │   ├── useValidation.ts   # FR26–FR28 — terrain validation
│       │   └── useTheme.ts
│       ├── services/
│       │   ├── apiClient.ts       # fetch wrapper + snake→camel transform
│       │   └── cacheService.ts    # AsyncStorage TTL wrapper
│       ├── constants/
│       │   ├── colors.ts          # tokens light/dark
│       │   ├── typography.ts      # scale Josefin Sans
│       │   ├── spacing.ts         # grid 4px
│       │   └── flags.ts           # feature flags MVP
│       └── utils/
│           ├── formatScore.ts     # score → label + couleur
│           ├── dateUtils.ts
│           └── i18n.ts            # config i18n-js + strings FR
│
├── backend/                     # FastAPI / Python 3.12
│   ├── requirements.txt
│   ├── requirements-dev.txt     # pytest, ruff, mypy, httpx
│   ├── pyproject.toml           # ruff + mypy config
│   ├── Dockerfile
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/            # migrations versionnées
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan + middleware
│   │   ├── api/v1/
│   │   │   ├── dependencies.py  # get_current_user, get_db, check_quota
│   │   │   └── endpoints/
│   │   │       ├── score.py         # FR1–FR7
│   │   │       ├── peaks.py         # FR8–FR11
│   │   │       ├── auth.py          # FR12–FR15
│   │   │       ├── subscriptions.py # FR16–FR21
│   │   │       ├── notifications.py # FR22–FR25
│   │   │       ├── validations.py   # FR26–FR29
│   │   │       └── health.py        # /health heartbeat
│   │   ├── core/
│   │   │   ├── config.py        # Settings Pydantic (env vars)
│   │   │   ├── security.py      # JWT Supabase verification locale
│   │   │   └── errors.py        # ErrorCode constants
│   │   ├── models/              # SQLAlchemy ORM
│   │   │   ├── user.py, peak.py, prediction.py
│   │   │   ├── subscription.py, terrain_validation.py, event.py
│   │   ├── schemas/             # Pydantic v2 Request/Response
│   │   │   ├── score.py, peak.py, subscription.py, validation.py
│   │   ├── services/
│   │   │   ├── score.py         # algorithme mer de nuage
│   │   │   ├── weather.py       # cache Redis + dispatch provider
│   │   │   ├── weather_providers/
│   │   │   │   ├── base.py      # interface WeatherProvider
│   │   │   │   ├── open_meteo.py    # provider principal (gratuit, sans clé)
│   │   │   │   └── meteo_france.py  # provider secondaire (France, haute précision)
│   │   │   ├── subscriptions.py # StoreKit 2 receipt verification
│   │   │   └── notifications.py # push scheduling
│   │   └── db/
│   │       ├── session.py       # SQLAlchemy async session
│   │       └── seed.py          # seed sommets initial
│   └── tests/
│       ├── conftest.py
│       ├── test_score.py, test_weather.py
│       ├── test_api_score.py, test_api_auth.py
│       ├── test_subscriptions.py, test_validations.py
│
└── infra/
    ├── docker-compose.yml       # prod : api + db + redis + caddy
    ├── docker-compose.dev.yml   # dev local : db + redis seulement
    ├── Caddyfile                # reverse proxy HTTPS auto
    ├── .env.example
    └── scripts/
        ├── deploy.sh            # pull + up -d (appelé par CI/CD)
        └── db-backup.sh         # backup PostgreSQL cron
```

### Architectural Boundaries

**Mobile → Backend :** HTTPS REST via `apiClient.ts` · header `Authorization: Bearer {jwt}` · transform snake↔camel dans `apiClient.ts`

**Backend → Supabase :** JWT verification locale (clé publique) — zéro appel réseau par requête

**Backend → API Météo :** interface `WeatherProvider` abstraite · cache Redis intercèpte (TTL 10min) · provider swappable sans toucher `score.py` · Open-Meteo en provider principal (gratuit, sans clé API, données altimétriques) · Météo-France en provider secondaire (France, résolution AROME 1.3km)

**Backend → Redis :** accès via services uniquement · préfixes `weather:*` et `quota:*`

**Backend → PostgreSQL :** SQLAlchemy async session uniquement · jamais de SQL raw dans les endpoints

### Requirements to Structure Mapping

| FRs | Responsable |
|-----|-------------|
| FR1–FR7 (score) | `endpoints/score.py` + `services/score.py` + `services/weather.py` |
| FR8–FR11 (recherche) | `endpoints/peaks.py` + `models/peak.py` + `db/seed.py` |
| FR12–FR15 (auth) | `endpoints/auth.py` + `core/security.py` |
| FR16–FR21 (freemium) | `endpoints/subscriptions.py` + Redis quota |
| FR22–FR25 (notifs) | `endpoints/notifications.py` + `services/notifications.py` |
| FR26–FR29 (terrain) | `endpoints/validations.py` + `models/terrain_validation.py` |
| FR30–FR32 (offline) | `mobile/services/cacheService.ts` + `hooks/useScore.ts` |
| FR35–FR38 (monitoring) | `endpoints/health.py` + BetterStack + PostHog |

### Data Flow Principal

```
useScore.ts → cacheService (hit?) → apiClient.ts
  → GET /api/v1/score
    → dependencies.py (JWT + quota Redis)
    → services/weather.py (Redis hit? sinon API météo)
    → services/score.py (algorithme heuristique)
    → models/prediction.py (sauvegarde DB)
  → ScoreResponse JSON
→ apiClient.ts (snake→camel)
→ cacheService.set (TTL 2-3h)
→ ScoreCard.tsx (affichage)
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Compatibilité des décisions :**
- Expo SDK 55 + React Native 0.83 ↔ AsyncStorage, reanimated, react-native-svg → compatibles
- FastAPI 0.135 + Pydantic v2 + SQLAlchemy async → stack cohérente, aucun conflit
- Supabase JWT validation locale → pas de dépendance runtime, latence réduite
- Redis 7 : quota freemium + cache météo, préfixes distincts → pas de collision
- Caddy 2 → HTTPS automatique, compatible Ubuntu VPS OVH

**Cohérence des patterns :**
- `AsyncState<T>` mobile ↔ `{detail, code}` backend → gestion d'erreur symétrique
- snake_case API ↔ camelCase mobile transformé dans `apiClient.ts` → frontière unique
- Interface `WeatherProvider` isole `score.py` de l'API météo → algo indépendant du provider

**Alignement structure :**
- Hooks portent la logique → composants restent purs
- Endpoints minces → services pour la logique métier → boundary testable
- Tests séparés backend (pytest) ↔ co-localisés mobile (Jest) → cohérent avec les outils

### Requirements Coverage Validation ✅

**Couverture fonctionnelle (38 FRs) :**

| Catégorie | Couverture | Solution |
|-----------|-----------|---------|
| Score FR1–FR7 | ✅ | `score.py` + `weather.py` + cache Redis |
| Recherche FR8–FR11 | ✅ | `peaks.py` + seed DB + deep links |
| Auth FR12–FR15 | ✅ | Supabase JWT + DELETE /user RGPD |
| Freemium FR16–FR21 | ✅ | StoreKit 2 + quota Redis backend |
| Notifs FR22–FR25 | ✅ | `notifications.py` + permissions mobiles |
| Terrain FR26–FR29 | ✅ | GPS + table `terrain_validations` |
| Offline FR30–FR32 | ✅ | `cacheService.ts` TTL + bandeau âge |
| Onboarding FR33–FR34 | ✅ | `onboarding.tsx` + géoloc opt-in |
| Monitoring FR35–FR38 | ✅ | `/health` + BetterStack + PostHog |

**NFRs critiques couverts :** NFR1 (cache < 500ms), NFR5 (99% uptime Docker), NFR7 (alertes < 2min), NFR8 (CI < 5min), NFR15 (1k→10k users), NFR16–NFR17 (cache + provider abstrait), NFR21 (algo serveur), NFR24–NFR27 (i18n, dark mode, feature flags).

### Gap Analysis Results

**Gaps critiques : aucun**

**Gaps importants (à traiter en story) :**
1. **Source de données sommets** — `db/seed.py` défini mais la source (GeoJSON, OpenTopoData API ?) à préciser lors de la story recherche sommet
2. **StoreKit 2 receipt verification** — flow exact Apple côté serveur à documenter (sandbox disponible pour tests)
3. **Provider push notifications** — recommandation : **Expo Push Notifications** (gratuit, simplifie APNs, compatible EAS)

**Gaps mineurs (post-MVP) :**
- Schema Alembic (généré au dev), config Caddyfile (5 lignes), fréquence backup DB

### Architecture Completeness Checklist

- [x] Contexte projet analysé, contraintes identifiées
- [x] 38 FRs et 30 NFRs couverts architecturalement
- [x] Stack technique complète avec versions vérifiées (mars 2026)
- [x] Patterns nommage, structure, format, process définis
- [x] Arborescence projet complète fichier par fichier
- [x] Boundaries et data flow documentés
- [x] CI/CD pipelines définis (mobile + backend)
- [x] Monitoring (BetterStack + PostHog) intégré
- [x] Gaps identifiés et priorisés

### Architecture Readiness Assessment

**Statut : PRÊT POUR L'IMPLÉMENTATION**
**Confiance : Élevée**

**Points forts :**
- Stack minimaliste — chaque outil a une responsabilité unique
- Boundaries clairs — implémentation parallèle sans conflits
- VPS OVH + Docker Compose — reproductible dès J1, zéro dette ops

**Évolutions futures sans refonte :**
- Swap provider météo → 1 fichier dans `weather_providers/`
- Android → Expo Router déjà cross-platform
- Remote feature flags → remplace `flags.ts`

### Implementation Handoff

**Ordre de priorité Phase 1 MVP :**
1. Infra VPS : Docker Compose + Caddy + CI/CD GitHub Actions
2. Backend : score endpoint + WeatherProvider + cache Redis
3. Mobile : ScoreCard + CloudLayerViz + WeekStrip
4. Auth : Supabase JWT flow complet
5. Freemium : quota Redis + StoreKit 2

**Commandes d'initialisation :**

```bash
# Backend
cd backend && python -m venv .venv && pip install -r requirements.txt
alembic upgrade head && python app/db/seed.py

# Mobile
npx create-expo-app mobile --template default@sdk-55
```

