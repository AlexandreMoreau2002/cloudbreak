# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Application mobile **Cloudbreak** — estimation de la probabilité de mer de nuage pour un sommet ou une randonnée donnée, à une date et une heure précises.

Stack retenue :
- **Mobile** : React Native / Expo SDK 55
- **Backend** : FastAPI 0.135 (Python 3.12)
- **Base de données** : PostgreSQL 16
- **Cache** : Redis 7 (cache météo TTL 10min + quota freemium)
- **Auth** : Supabase (JWT validé localement côté backend)
- **Analytics** : PostHog
- **Paiement** : StoreKit 2 (iOS In-App Purchase — pas Stripe)
- **API météo** : OpenWeather / Weatherbit (interface abstraite swappable)
- **Reverse proxy** : Caddy 2 (HTTPS Let's Encrypt automatique)
- **Infra** : VPS OVH Ubuntu 24.04, Docker Compose

---

## Architecture

```
App mobile (Expo SDK 55 / React Native 0.83)
  ↓ HTTPS REST — Authorization: Bearer {jwt}
Backend FastAPI — Gunicorn + Uvicorn workers
  ↓
dependencies.py (JWT Supabase validé localement + quota Redis)
  ↓
services/score.py (algorithme heuristique mer de nuage)
  ↓
services/weather.py → Redis cache (TTL 10min) → WeatherProvider interface
  ↓
PostgreSQL 16 (users, peaks, predictions, subscriptions, terrain_validations, events)
```

L'algorithme de score tourne **côté serveur uniquement** — modifiable sans mise à jour de l'app.

### Score mer de nuage

```python
score = (
    0.4 * cloud_base_condition   # cloud_base < altitude_sommet
  + 0.2 * humidity_score
  + 0.2 * wind_score
  + 0.2 * inversion_score
)
# score → probabilité % → verdict "high" | "medium" | "low"
```

Variables météo : `cloud_base`, `humidity`, `wind_speed`, `temperature_valley`, `temperature_altitude`, `pressure`.

---

## Structure du projet

Le projet utilise des **git submodules** : chaque sous-projet a son propre repo GitHub, le repo racine les référence via `.gitmodules`.

```
cloudbreak/              ← repo racine  (github.com/toi/cloudbreak)
├── .git/
├── .gitmodules          ← références aux submodules
├── .github/workflows/       # optionnel — intégration globale uniquement
├── CLAUDE.md
├── _bmad/                   # config BMAD/BMM (versionné dans racine)
├── _bmad-output/            # artifacts planning (versionné dans racine)
├── mobile/                  ← submodule (github.com/toi/cloudbreak-mobile)
│   ├── .github/workflows/mobile.yml  # lint + test + build check
│   ├── app/                 # Expo Router (file-based)
│   │   ├── (tabs)/index.tsx, search.tsx, favorites.tsx, profile.tsx
│   │   ├── onboarding.tsx, paywall.tsx
│   │   └── _layout.tsx
│   └── src/
│       ├── components/      # ScoreCard, CloudLayerViz, WeekStrip, etc.
│       ├── contexts/        # ThemeContext, AuthContext, SubscriptionContext
│       ├── hooks/           # useScore, usePeaks, useSubscription, etc.
│       ├── services/        # apiClient.ts, cacheService.ts
│       ├── constants/       # colors.ts, typography.ts, spacing.ts, flags.ts
│       └── utils/           # formatScore.ts, dateUtils.ts, i18n.ts
├── backend/                 ← submodule (github.com/toi/cloudbreak-backend)
│   ├── .github/workflows/backend.yml  # lint + test + build + deploy (main)
│   ├── app/
│   │   ├── api/v1/endpoints/  # score.py, peaks.py, auth.py, subscriptions.py, etc.
│   │   ├── core/              # config.py, security.py, errors.py
│   │   ├── models/            # SQLAlchemy ORM
│   │   ├── schemas/           # Pydantic v2
│   │   ├── services/          # score.py, weather.py, weather_providers/
│   │   └── db/                # session.py, seed.py
│   └── tests/
│       ├── test_*.py          # tests unitaires
│       └── features/          # tests de feature (flux complets)
└── infra/                   ← submodule (github.com/toi/cloudbreak-infra)
    ├── docker-compose.yml     # prod : api + db + redis + caddy
    ├── docker-compose.dev.yml # dev local : db + redis
    └── Caddyfile
```

### Git Flow — branches (submodules uniquement)

- `main` → production deployée — merge uniquement pour les releases
- `develop` → branche par défaut GitHub, travail quotidien, toutes les PRs ciblent develop
- `feature/nom-story` → une story = une branche feature
- `release/1.0.0` → préparation lancement App Store
- MVP cible : **v1.0.0**

Le repo racine `cloudbreak` n'utilise que `main`.

### Git — workflow submodules

```bash
# Cloner tout (nouvelle machine)
git clone --recurse-submodules https://github.com/AlexandreMoreau2002/cloudbreak

# Travailler dans un submodule (toujours depuis develop)
cd backend
git checkout develop
git checkout -b feature/ma-story
git add . && git commit -m "feat: algo score"
git push

# Mettre à jour la référence dans le repo racine
cd ..
git add backend
git commit -m "chore: update backend submodule ref"
git push
```

---

## Commandes de développement

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

# Migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Serveur dev
uvicorn app.main:app --reload

# Infra locale (db + redis)
docker compose -f ../infra/docker-compose.dev.yml up -d

# Linter + typage
ruff check .
ruff format .
mypy app/

# Tests
pytest                                          # tous les tests
pytest tests/test_score.py -v                  # un fichier
pytest tests/test_score.py::test_cloud_base -v # un test
pytest tests/features/ -v                      # tests de feature uniquement
pytest --cov=app --cov-report=term-missing      # avec couverture
```

### Mobile (Expo)

```bash
cd mobile
npm install

npx expo start          # dev server
npx expo run:ios        # simulateur iOS

# Qualité
npm run lint            # ESLint
npx tsc --noEmit        # vérification TypeScript
npm test                # Jest (tous les tests)
npm test -- --watch     # mode watch
npm test -- --coverage  # avec couverture
npx expo export         # build check (vérifie que le bundle compile)
```

---

## Workflow de développement (à respecter pour chaque story)

### Process obligatoire par story

```
1. LIRE   — lire la story dans epics.md (ACs, FRs couverts)
2. ÉCRIRE — écrire les tests AVANT le code (TDD léger)
3. IMPLÉM — implémenter jusqu'à ce que les tests passent
4. FIX    — corriger jusqu'à zéro erreur lint + typage + tests
5. DOC    — créer/mettre à jour toute la documentation (voir règles ci-dessous)
6. QA     — vérifier manuellement chaque AC Given/When/Then
7. CI     — vérifier que le pipeline CI passe (lint + test + build)
8. DONE   — mettre la story en "done" dans sprint-status.yaml
```

### Règles de documentation (obligatoires à chaque story, fix, ou modif)

Toute modification du projet — story, bugfix, changement d'infra, ajout de dépendance — doit mettre à jour la documentation concernée **avant le commit final**.

**1. Fichier story `docs/story-{id}-{slug}.md`**
Créé pour chaque nouvelle story, dans le submodule concerné :
```
backend/docs/story-1-2-setup-backend.md
backend/docs/story-3-1-algorithme-score.md
mobile/docs/story-1-3-setup-mobile.md
```
Contenu obligatoire :
- **Ce qui a été fait** — liste des fichiers créés/modifiés avec leur rôle
- **Comment ça fonctionne** — explication du fonctionnement technique
- **Comment tester** — commandes étape par étape pour vérifier que ça marche
- **Acceptance Criteria vérifiés** — checklist des ACs de la story

**2. README du submodule**
Mettre à jour si la story change : installation, commandes, structure, variables d'environnement, ports, ou comportement observable.

**3. `docs/security.md`**
Mettre à jour si la story touche : auth, ports exposés, secrets, données utilisateur, dépendances sensibles, ou config réseau.

**4. `CLAUDE.md` (repo racine)**
Mettre à jour si la story change : stack, structure du projet, conventions de code, workflow, ou git flow.

> Règle simple : **si quelqu'un qui rejoint le projet demain ne comprend pas ce qui a changé en lisant la doc, la doc est incomplète.**

### Règle des tests : un fichier de test par fichier source

**Backend — tests unitaires co-localisés logiquement dans `tests/` :**
```
app/services/score.py         → tests/test_score.py
app/services/weather.py       → tests/test_weather.py
app/api/v1/endpoints/score.py → tests/test_api_score.py
app/core/security.py          → tests/test_security.py
# etc. — chaque module a son test_*.py
```

**Backend — tests de feature dans `tests/features/` (flux HTTP complets) :**
```
tests/features/test_feature_score_flow.py      # quota → cache → algo → réponse
tests/features/test_feature_auth_flow.py       # inscription → token → appel protégé
tests/features/test_feature_subscription.py    # freemium → paywall → upgrade
```

**Mobile — tests unitaires co-localisés avec le fichier source :**
```
src/components/ScoreCard.tsx          → src/components/ScoreCard.test.tsx
src/components/CloudLayerViz.tsx      → src/components/CloudLayerViz.test.tsx
src/hooks/useScore.ts                 → src/hooks/useScore.test.ts
src/services/apiClient.ts             → src/services/apiClient.test.ts
src/utils/formatScore.ts              → src/utils/formatScore.test.ts
# etc. — chaque fichier a son .test.tsx/.test.ts
```

**Mobile — tests de feature dans `src/__tests__/features/` (parcours utilisateur) :**
```
src/__tests__/features/score-consultation.test.tsx  # chercher sommet → voir score
src/__tests__/features/auth-flow.test.tsx            # inscription → écran principal
src/__tests__/features/paywall-conversion.test.tsx  # 2e check → paywall → abonnement
```

### Ce qu'on teste vs ce qu'on ne teste pas

**À tester obligatoirement :**
- Algo score (tous les cas limites : cloud_base, seuils, inversion)
- Quota freemium Redis (1 check/jour, reset, Premium bypass)
- JWT validation (token valide, expiré, invalide)
- Cache offline mobile (hit, miss, TTL expiré)
- Composants UI critiques (ScoreCard, PaywallScreen) — rendu + états
- Hooks réseau (useScore, useSubscription) — états AsyncState

**Peut être léger ou omis en MVP :**
- Composants purement visuels sans logique (ConditionBadge, PeakFavoriteChip)
- Utilitaires trivials (dateUtils formatage basique)
- Seed DB (testé une fois manuellement)

### Patterns de code à respecter

**Ne JAMAIS faire :**
- `print()` ou `logger.debug()` en production (backend)
- `try/catch` dans les composants React — dans les hooks uniquement
- Strings UI hardcodées dans les composants — utiliser i18n.ts
- Réponses API avec wrapper `{"status": "ok", "data": ...}` — réponses directes
- Appels réseau dans les composants — dans les hooks uniquement

**Toujours faire :**
- Imports organisés **en escalier** (du plus court au plus long), librairies externes d'abord puis imports internes — quelle que soit la techno :
  ```ts
  // ✅ Correct — ordre longueur croissante, externe puis interne
  import { Tabs } from 'expo-router';
  import i18n from '@/utils/i18n';
  import { useTheme } from '@/contexts/ThemeContext';

  // ❌ Incorrect — ordre aléatoire ou chemins relatifs ../
  import { useTheme } from '../../contexts/ThemeContext';
  import { Tabs } from 'expo-router';
  import i18n from '@/utils/i18n';
  ```
- `AsyncState<T>` pour tout état asynchrone mobile (idle | loading | success | error)
- Vérifier le cache offline avant tout appel réseau
- Préfixer toutes les clés Redis (`weather:*`, `quota:*`, `cache:*`)
- Logs backend JSON structurés (`logger.info("event", extra={...})`)
- Erreurs API format `{"detail": "...", "code": "ERROR_CODE"}`
- Dates ISO 8601 UTC partout

---

## Modèle de données

| Table | Colonnes clés |
|-------|--------------|
| `users` | `id` (UUID Supabase), `push_token`, `notif_favorites`, `notif_regional`, `notif_terrain` |
| `peaks` | `id`, `name`, `slug`, `lat`, `lng`, `altitude` |
| `predictions` | `peak_id`, `user_id`, `date`, `hour`, `score`, `verdict`, `cloud_base`, `created_at` |
| `subscriptions` | `user_id`, `plan`, `status`, `expires_at` |
| `terrain_validations` | `prediction_id`, `user_id`, `result`, `photo_url`, `lat`, `lng`, `validated_at` |
| `events` | `user_id`, `name`, `properties`, `created_at` |

---

## Variables d'environnement

```
DATABASE_URL
REDIS_URL
WEATHER_API_KEY
SUPABASE_URL
SUPABASE_KEY          # clé publique pour validation JWT locale
POSTHOG_API_KEY
EXPO_ACCESS_TOKEN     # pour Expo Push Notifications
# Pas de STRIPE_SECRET_KEY — paiements via StoreKit 2 uniquement
```

---

## Endpoints API (MVP)

```
GET    /api/v1/score?peak_id=&date=&hour=
GET    /api/v1/peaks/search?q=
GET    /api/v1/peaks/{slug}
POST   /api/v1/validations
GET    /api/v1/user/subscription
POST   /api/v1/user/subscription/verify     # StoreKit 2 receipt
POST   /api/v1/user/push-token
PATCH  /api/v1/user/notifications
POST   /api/v1/user/favorites
DELETE /api/v1/user
GET    /health
```
