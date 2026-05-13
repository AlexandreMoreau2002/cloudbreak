# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Suivi de chantier — TODO.md

Le fichier `TODO.md` à la racine du repo est le **carnet de bord du dev** :
- Ce qui reste à tester / valider manuellement
- Les stories ouvertes et leur état (implémenté, à merger, backlog)
- Les agents lancés en cours de session et leur résultat
- Les notes vrac (tokens, commandes utiles, décisions rapides)

**Consulter `TODO.md` en début de session** pour reprendre là où on s'est arrêté.
**Mettre à jour `TODO.md`** après chaque story complétée ou chantier clos.

---

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
- **API météo** : Open-Meteo (provider principal, gratuit sans clé) / Météo-France (provider secondaire FR, résolution AROME 1.3km) — interface abstraite swappable
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

**Conditions bloquantes (éliminatoires — verdict `"none"`, score 0) :**
1. `cloud_base >= peak_altitude` → nuages au-dessus ou au niveau du sommet → mer de nuage physiquement impossible
2. `cloud_cover_low < 20%` → ciel trop dégagé → pas assez de nuages bas

**Score conditionnel (seulement si aucune condition bloquante) :**

```python
score = (
    0.35 * cloud_base_score    # nuages bien sous le sommet
  + 0.20 * inversion_score     # T(850hPa) - T(925hPa) > 0 → inversion thermique
  + 0.20 * humidity_score      # humidité relative au sol
  + 0.15 * wind_score          # vent faible = nuages stables
  + 0.10 * pressure_score      # anticyclone = conditions stables
)
# Pas de coefficient saisonnier — la présence/absence de nuages bas détermine le verdict.
# score → probabilité % → verdict "none" | "high" (≥70) | "medium" (40-69) | "low" (<40)
```

---

## Structure du projet

Le projet utilise des **git submodules** : chaque sous-projet a son propre repo GitHub, le repo racine les référence via `.gitmodules`.

```
cloudbreak/              ← repo racine  (github.com/toi/cloudbreak)
├── .git/
├── .gitmodules
├── CLAUDE.md
├── _bmad/                   # config BMAD/BMM
├── _bmad-output/            # artifacts planning
├── mobile/                  ← submodule (github.com/toi/cloudbreak-mobile)
│   ├── app/                 # Expo Router (file-based)
│   │   ├── (tabs)/index.tsx, search.tsx, favorites.tsx, profile.tsx
│   │   ├── onboarding.tsx, paywall.tsx
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── fetchService.ts      # API_BASE + apiFetch<T>() + re-exports types
│   │   │   ├── mockData/            # types.ts, user.ts, peaks.ts, score.ts
│   │   │   └── api/                 # score.ts, peaks.ts, user.ts, validations.ts
│   │   ├── constants/
│   │   └── utils/
│   └── docs/                # documentation technique par story
├── backend/                 ← submodule (github.com/toi/cloudbreak-backend)
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── db/
│   ├── tests/
│   └── docs/                # documentation technique par story
└── infra/                   ← submodule (github.com/toi/cloudbreak-infra)
    ├── docker-compose.yml       # prod : api + db + redis + caddy
    ├── docker-compose.dev.yml   # dev local : api + db + redis (hot reload)
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
source .venv/bin/activate   # toujours activer le venv avant make

make help        # affiche toutes les commandes disponibles
make dev         # lance api + db + redis (Docker, hot reload)
make down        # arrête les containers
make logs        # suit les logs en temps réel
make migrate     # applique les migrations Alembic
make migration   # génère une nouvelle migration (autogenerate)
make seed        # insère les données initiales (sommets)
make validate    # ruff + mypy + pytest --cov (obligatoire avant commit)
make lint        # ruff check uniquement
make format      # ruff format (corrige les fichiers)
make typecheck   # mypy uniquement
make test        # pytest avec coverage
make install     # pip install requirements
```

> **Important** : Le serveur FastAPI tourne dans Docker (`make dev`). Ne jamais lancer `uvicorn` directement.
> Les commandes `make` utilisent `.venv/bin/` — activer le venv avant pour `make migration` et `make seed`.

### Mobile (Expo)

```bash
cd mobile
npm install

# Première fois ou après ajout module natif
npx expo run:ios        # compile le build natif + lance Metro

# Fois suivantes (build déjà installé sur le simulateur)
npm start               # Metro uniquement

npm run lint            # ESLint
npx tsc --noEmit        # vérification TypeScript
npm test                # Jest (tous les tests)
npm test -- --watch     # mode watch
npm test -- --coverage  # avec couverture
npm run build:check     # expo export (vérifie que le bundle compile)
```

> **Important** : Ne pas utiliser Expo Go — l'app a des modules natifs incompatibles.

---

## Workflow de développement

### Process obligatoire par story

```
1. LIRE    — lire la story dans epics.md (ACs, FRs couverts)
2. ÉCRIRE  — écrire les tests AVANT le code (TDD léger)
3. IMPLÉM  — implémenter jusqu'à ce que les tests passent
4. FIX     — corriger jusqu'à zéro erreur lint + typage + tests
5. STAIRS  — lancer stairs-import-fixer pour appliquer la règle d'escalier des imports
6. TEST    — lancer make validate (backend) ou npm test (mobile) automatiquement
7. DOC     — mettre à jour la documentation technique (voir règles ci-dessous)
8. QA      — vérifier manuellement chaque AC Given/When/Then + fournir instructions de test
9. CI      — vérifier que le pipeline CI passe
10. DONE   — mettre la story en "done" dans sprint-status.yaml
```

### Règle des tests : un fichier de test par fichier source

**Backend — tests unitaires dans `tests/` :**
```
app/services/score.py         → tests/test_score.py
app/services/weather.py       → tests/test_weather.py
app/api/v1/endpoints/score.py → tests/test_api_score.py
app/core/security.py          → tests/test_security.py
```

**Backend — tests de feature dans `tests/features/` (flux HTTP complets) :**
```
tests/features/test_feature_score_flow.py
tests/features/test_feature_auth_flow.py
tests/features/test_feature_subscription.py
```

**Mobile — tests co-localisés avec le fichier source :**
```
src/components/ScoreCard.tsx          → src/components/ScoreCard.test.tsx
src/hooks/useScore.ts                 → src/hooks/useScore.test.ts
src/services/fetchService.ts          → src/services/fetchService.test.ts
src/services/api/score.ts             → src/services/api/score.test.ts
src/services/api/peaks.ts             → src/services/api/peaks.test.ts
src/services/api/user.ts              → src/services/api/user.test.ts
src/services/api/validations.ts       → src/services/api/validations.test.ts
```

**Mobile — tests de feature dans `src/__tests__/features/` :**
```
src/__tests__/features/score-consultation.test.tsx
src/__tests__/features/auth-flow.test.tsx
src/__tests__/features/paywall-conversion.test.tsx
```

### Ce qu'on teste vs ce qu'on ne teste pas

**À tester obligatoirement :**
- Algo score (tous les cas limites : cloud_base, seuils, inversion, hard gate)
- Quota freemium Redis (1 check/jour, reset, Premium bypass)
- JWT validation (token valide, expiré, invalide)
- Cache offline mobile (hit, miss, TTL expiré)
- Composants UI critiques (ScoreCard, PaywallScreen)
- Hooks réseau (useScore, useSubscription)

**Peut être léger ou omis en MVP :**
- Composants purement visuels sans logique
- Utilitaires triviaux (formatage basique)
- Seed DB (testé une fois manuellement)

---

## Règles d'orchestration — agents et contexte

### Principe : Claude reste orchestrateur

Pour toute tâche non triviale, utiliser des **sous-agents spécialisés** plutôt que tout faire dans le contexte principal :

| Agent | Rôle | Quand l'utiliser |
|-------|------|-----------------|
| `Explore` | Lecture seule — explore la codebase, cherche des fichiers | Recherche > 3 fichiers à lire |
| `Plan` | Lecture seule — conçoit une implémentation | Avant de coder une story complexe |
| `general-purpose` | Accès complet — implémente du code | Implémentation d'un module isolé |
| `qa-reviewer` | Accès complet — review générique | Vérification de qualité générale |
| `stairs-import-fixer` | **Spécialisé Cloudbreak** — applique règle escalier imports | **Après chaque story (étape 5. STAIRS du workflow)** |
| `cloudbreak-dev-reviewer` | **Spécialisé Cloudbreak** — vérifie les patterns, ACs, doc | **Après chaque story implémentée** |
| `cloudbreak-security` | **Spécialisé Cloudbreak** — audit sécurité, met à jour `security.md` | **Après toute story touchant auth, data, API, secrets** |

**Règle obligatoire après chaque story :**
1. Lancer `stairs-import-fixer` — applique la règle d'escalier des imports (étape 5. STAIRS)
2. Lancer `cloudbreak-dev-reviewer` — vérifie patterns + ACs + doc
3. Si la story touche auth / data / API / secrets → lancer `cloudbreak-security` en parallèle

**Quand garder dans le contexte principal :**
- Décisions d'architecture
- Corrections courtes (< 20 lignes)
- Réponses à des questions directes

---

## Auto-amélioration — journal des erreurs

### Principe

Chaque erreur rencontrée — qu'elle vienne du code, des outils, de la configuration ou du workflow — est loggée dans le fichier mémoire projet pour ne plus se reproduire.

**Fichier** : `/Users/alex/.claude/projects/-Users-alex-Desktop-dev-cloudbreak/memory/MEMORY.md`

**Ce qui doit être loggé :**
- Erreur de configuration (ex: `script.py.mako` manquant dans alembic)
- Commande qui ne marche pas sans contexte (ex: `alembic` sans `PYTHONPATH=.`)
- Comportement inattendu d'une lib ou d'un outil
- Erreur répétée plus d'une fois

**Format d'entrée :**
```
## Erreurs connues
- [outil] description courte → solution appliquée
```

---

## Tests automatiques — règle systématique

### Après chaque tâche

1. **Claude lance les tests automatiquement** — sans attendre que l'utilisateur le demande
2. **Si les tests échouent** — corriger immédiatement avant de répondre
3. **Fournir toujours les instructions de test manuel** — fichier `.http`, commande curl, ou étapes simulateur

### Backend — validation automatique après chaque modification

```bash
make validate   # ruff + mypy + pytest --cov — doit passer à 100%
```

### Mobile — validation automatique après chaque modification

```bash
npm test && npx tsc --noEmit && npm run lint
```

### Instructions de test manuel — toujours fournies

À chaque fin de story ou modification notable, fournir :
- La ou les requêtes HTTP à envoyer (fichier `.http` ou instructions)
- Le résultat attendu (status code + body)
- Les cas d'erreur à vérifier

---

## Mode debug — auto-feedback et OODA loop

### Principe

Des points de log sont placés **en permanence** dans le code aux endroits clés. Ils sont silencieux en production et activables à la demande pour diagnostiquer un problème.

### Backend Python — logger conditionnel

```python
import logging
logger = logging.getLogger(__name__)

# Log clé — toujours présent, niveau DEBUG (silencieux en prod)
logger.debug("score_detail", extra={"cloud_base": cloud_base, "peak_alt": peak_altitude, "score": score})
```

Activer le mode debug dans Docker :
```bash
# Dans docker-compose.dev.yml, ajouter :
environment:
  - LOG_LEVEL=DEBUG
```

Ou ponctuellement :
```bash
docker exec cloudbreak-backend env LOG_LEVEL=DEBUG
```

### Mobile TypeScript — console.debug conditionnel

```typescript
// flags.ts
export const DEBUG = __DEV__ && true;  // false en prod automatiquement

// Dans les hooks et services — toujours présent
if (DEBUG) console.debug('[useScore] fetching', { peakId, date });
if (DEBUG) console.debug('[apiFetch] response', { status, data });
```

### Où placer les logs debug obligatoirement

**Backend :**
- Entrée et sortie de `calculate_score()` avec toutes les composantes
- Résultat du hard gate (cloud_base vs peak_altitude)
- Cache hit/miss Redis avec la clé
- Réponse brute Open-Meteo avant parsing

**Mobile :**
- Chaque transition d'état `AsyncState` (idle → loading → success/error)
- Résultat du cache offline (hit/miss/expired)
- Chaque appel `apiFetch` (url, params, status)

### OODA loop — principe d'auto-correction

Quand un comportement est inattendu :
1. **Observer** — activer debug, lire les logs
2. **Orienter** — identifier le fichier et la ligne source du problème
3. **Décider** — corriger le code ou la config
4. **Agir** — appliquer le fix, relancer les tests, désactiver le debug

---

## Idées et suggestions de nouvelles features

Toute idée ou suggestion de nouvelle feature — qu'elle vienne de l'utilisateur ou émerge pendant le développement — doit être ajoutée dans `_bmad-output/planning-artifacts/prd.md`, dans la section V2 ou Vision selon la maturité. Juste l'idée, sans détailler.

---

## Documentation technique — règles obligatoires

### À chaque story, fix, ou modification notable

**1. Fichier story `docs/story-{epic}-{num}-{slug}.md`** dans le submodule concerné

```
backend/docs/story-3-1-algorithme-score.md
mobile/docs/story-3-4-scorecard-ecran-principal.md
```

Contenu obligatoire :
- **Ce qui a été fait** — liste des fichiers créés/modifiés avec leur rôle
- **Comment ça fonctionne** — explication technique du fonctionnement
- **Comment tester** — commandes et étapes pour vérifier
- **Acceptance Criteria vérifiés** — checklist des ACs

**2. `docs/product-audit.md`** dans le submodule backend

Mettre à jour la section "Ce qui est fonctionnel" après chaque story complétée.

**3. README du submodule**

Mettre à jour si la story change : installation, commandes, structure, variables d'environnement, ports, comportement observable.

**4. `docs/security.md`**

Mettre à jour si la story touche : auth, ports, secrets, données utilisateur, dépendances sensibles, config réseau.

**5. `CLAUDE.md` (repo racine)**

Mettre à jour si la story change : stack, structure, conventions de code, workflow, git flow, ou formule de score.

> Règle simple : **si quelqu'un qui rejoint le projet demain ne comprend pas ce qui a changé en lisant la doc, la doc est incomplète.**

---

## Patterns de code à respecter

**Ne JAMAIS faire :**
- `print()` en production backend — utiliser `logger.info/debug/error`
- `try/catch` dans les composants React — dans les hooks uniquement
- Strings UI hardcodées dans les composants — utiliser i18n.ts
- Réponses API avec wrapper `{"status": "ok", "data": ...}` — réponses directes
- Appels réseau dans les composants — dans les hooks uniquement
- `uvicorn` directement — passer par `make dev`

**Toujours faire :**
- Imports organisés **en escalier** (du plus court au plus long), externes puis internes :
  ```ts
  // ✅ Correct
  import { Tabs } from 'expo-router';
  import i18n from '@/utils/i18n';
  import { useTheme } from '@/contexts/ThemeContext';
  ```
- `AsyncState<T>` pour tout état asynchrone mobile (idle | loading | success | error)
- Vérifier le cache offline avant tout appel réseau
- Préfixer toutes les clés Redis (`weather:*`, `quota:*`, `cache:*`)
- Logs backend JSON structurés (`logger.info("event", extra={...})`)
- Erreurs API format `{"detail": "...", "code": "ERROR_CODE"}`
- Dates ISO 8601 UTC partout
- Logs debug aux points clés (voir section Mode debug)

---

## Escalier des imports — agent `stairs-import-fixer`

### Pourquoi cette règle

La cohérence visuelle des imports est cruciale pour :
- **Lisibilité** — un coup d'œil rapide pour identifier source externe vs interne
- **Maintenabilité** — ajouter/retirer un import sans casser l'ordre
- **Collaboration** — pas de diffs inutiles dûs à un ordre aléatoire

### Règle (du plus court au plus long)

Imports **triés par longueur de ligne** (du plus court au plus long) :

**Python :**
```python
# ❌ Pas bon
from maintenance.models import Maintenance
from datetime import timedelta
from rest_framework import status
from django.utils import timezone

# ✅ Bon (escalier)
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from maintenance.models import Maintenance
```

**TypeScript/React :**
```typescript
// ❌ Pas bon
import { MaintenanceBanner } from '@/components/MaintenanceBanner'
import axios from 'axios'
import { useState } from 'react'
import i18n from '@/utils/i18n'

// ✅ Bon (escalier)
import axios from 'axios'
import { useState } from 'react'
import i18n from '@/utils/i18n'
import { MaintenanceBanner } from '@/components/MaintenanceBanner'
```

### Invoquer l'agent

**Intégré dans le workflow** (étape 5. STAIRS automatiquement) — pas besoin d'intervenir

**À la main** (ex: si tu modifies les imports manuellement) :
```bash
Agent(
  subagent_type="general-purpose",
  name="stairs-import-fixer",
  prompt="Apply staircase import rule to cloudbreak project (backend + mobile). Read .claude/agents/stairs-import-fixer.md for full spec."
)
```

### Après l'agent

- L'agent propose un commit `style: apply staircase import rule`
- Vérifie que c'est correct avec `git diff`
- Les tests (étape 6. TEST) doivent tous passer — l'agent ne change pas la logique, juste l'ordre

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
SUPABASE_URL
SUPABASE_KEY          # clé publique pour validation JWT locale
POSTHOG_API_KEY
EXPO_ACCESS_TOKEN     # pour Expo Push Notifications
# Pas de STRIPE_SECRET_KEY — paiements via StoreKit 2 uniquement
# Pas de WEATHER_API_KEY — Open-Meteo est gratuit sans clé
```

---

## ⚠️ Avant Release 1.0.0

- **Deep link partage (story 3.6)** : l'URL de share est actuellement un placeholder `reminder_modify_before_mep@cloudbreak.com/sommet/{slug}` → à remplacer par le vrai domaine + config Universal Links iOS (`.well-known/apple-app-site-association`) quand le domaine sera réservé
- **Supabase "Confirm email"** : actuellement désactivé en dev → à réactiver avant release
- **MountainBackground (login)** : visuellement insuffisant → rework visuel avant release

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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
