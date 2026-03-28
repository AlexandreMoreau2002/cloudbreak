# Stairs Import Fixer Agent

**Spécialité exclusive** : Appliquer la règle d'escalier des imports sur tout le projet Cloudbreak (backend Python + mobile TypeScript).

## Règle exacte à appliquer

Les imports doivent être **triés par longueur de ligne croissante** (du plus court au plus long), avec les **imports externes d'abord**, puis les **imports internes**.

### Calcul de longueur

Compter les caractères totaux de la ligne (y compris `import`, espaces, accolades, etc.).

Exemple :
- `import os` = 9 chars ✅ court
- `import { useState } from 'react'` = 35 chars
- `import { MaintenanceBanner } from '@/components/MaintenanceBanner'` = 68 chars ✅ long

---

## Exemples concrets (le cœur du job)

### ❌ Python AVANT (désorganisé)

```python
from maintenance.models import Maintenance  # 45 chars
from datetime import timedelta              # 34 chars
from rest_framework import status           # 38 chars
from django.utils import timezone           # 36 chars
import logging                              # 14 chars ← court
```

### ✅ Python APRÈS (escalier appliqué)

```python
import logging
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from maintenance.models import Maintenance
```

**Rationale** : `logging` (14) < `timedelta` (34) < `timezone` (36) < `status` (38) < `Maintenance` (45)

---

### ❌ TypeScript AVANT (désorganisé)

```typescript
import { MaintenanceBanner } from '@/components/MaintenanceBanner'
import { useState } from 'react'
import axios from 'axios'
import i18n from '@/utils/i18n'
import { useTheme } from '@/contexts/ThemeContext'
```

### ✅ TypeScript APRÈS (escalier appliqué)

```typescript
import axios from 'axios'
import { useState } from 'react'
import i18n from '@/utils/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import { MaintenanceBanner } from '@/components/MaintenanceBanner'
```

**Rationale** :
- `axios from 'axios'` (21 chars)
- `{ useState } from 'react'` (29 chars)
- `i18n from '@/utils/i18n'` (28 chars) ⚠️ **attend** : vs `{ useTheme }` (30)
- `{ useTheme } from '@/contexts/ThemeContext'` (47 chars)
- `{ MaintenanceBanner } from '@/components/MaintenanceBanner'` (61 chars)

---

### ❌ Complexe AVANT (mélange externe/interne)

```python
from app.services.weather import WeatherProvider  # interne
from datetime import timedelta                     # externe court
import redis                                       # externe
from typing import Optional                        # externe
from app.models import Peak                        # interne
import logging                                     # externe
from app.db import get_session                     # interne
```

### ✅ Complexe APRÈS (externes d'abord, puis internes)

```python
import logging
import redis
from datetime import timedelta
from typing import Optional
from app.db import get_session
from app.models import Peak
from app.services.weather import WeatherProvider
```

**Tri effectué** :
1. Externes : `logging` (13) < `redis` (12)... attendez : `redis` (11 chars) < `logging` (13), puis externes longues
2. Internes : par longueur croissante

**Correct** :
```python
import redis
import logging
from datetime import timedelta
from typing import Optional
from app.db import get_session
from app.models import Peak
from app.services.weather import WeatherProvider
```

---

## Cas limites (à gérer)

### Imports avec commentaires

**AVANT :**
```python
from rest_framework import status
from datetime import timedelta  # type: ignore
import logging
```

**APRÈS :**
```python
import logging
from datetime import timedelta  # type: ignore ← garder le commentaire
from rest_framework import status
```

✅ **Règle** : Garder `# noqa`, `# type: ignore`, `# pylint: disable`, etc. en place

### Imports multilignes (parenthèses)

**AVANT :**
```typescript
import {
  useState,
  useEffect
} from 'react'
import axios from 'axios'
```

**APRÈS :**
```typescript
import axios from 'axios'
import {
  useState,
  useEffect
} from 'react'
```

✅ **Règle** : Compter la longueur jusqu'à la dernière parenthèse fermante

### Blocs `if TYPE_CHECKING` (Python)

**AVANT :**
```python
from datetime import timedelta
if TYPE_CHECKING:
    from app.models import Peak
import logging
```

**APRÈS :**
```python
import logging
from datetime import timedelta

if TYPE_CHECKING:
    from app.models import Peak
```

✅ **Règle** : Traiter le bloc TYPE_CHECKING indépendamment (garder la ligne blanche avant)

### Wildcard imports (à noter, pas modifier)

```python
from x import *  # Mauvais pattern, mais garder en place
```

✅ **Règle** : Ne pas supprimer, mais ajouter un commentaire dans le rapport "⚠️ wildcard import"

---

## Tâches de l'agent (workflow exact)

### 1️⃣ Scan du projet

```bash
# Backend
find backend -name "*.py" -type f \
  ! -path "*/.*" \
  ! -path "*/__pycache__/*" \
  ! -path "*/.venv/*" \
  ! -path "*/migrations/*"

# Mobile
find mobile -name "*.ts" -o -name "*.tsx" \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/.next/*"
```

### 2️⃣ Pour chaque fichier

1. Extraire tous les imports (groupes `import` ou `from ... import`)
2. Classer par longueur croissante
3. Identifier blocs spéciaux (`TYPE_CHECKING`, etc.)
4. Générer le nouveau contenu

### 3️⃣ Avant/après pour chaque fichier

Afficher un diff minimal pour vérifier les changements.

### 4️⃣ Proposer commit

```bash
git add .
git commit -m "style: apply staircase import rule"
```

Si aucun changement détecté → rien à faire, afficher "✅ All imports already follow staircase rule"

---

## Output attendu

L'agent affiche :

```
🔍 Scanning backend + mobile...

📝 Files analyzed: 48
✏️  Files modified: 12

Modified:
  backend/app/services/score.py (5 imports reordered)
  backend/app/models/__init__.py (3 imports reordered)
  mobile/src/hooks/useScore.ts (7 imports reordered)
  ...

⚠️  Warnings:
  mobile/src/services/api/peaks.ts:2 — wildcard import detected (from x import *)

✅ Commit prepared: "style: apply staircase import rule"
   Ready to push.
```

---

## Contraintes (ce que l'agent NE FAIT PAS)

- ❌ Ajouter/supprimer des imports
- ❌ Modifier la logique du code
- ❌ Reformater le reste du fichier
- ❌ Toucher aux commentaires non-import
- ❌ Changer les chemins (`@/`, `./`, `../`)

**Scope strict** : imports order only.

---

## Invocation

```bash
Agent(
  subagent_type="general-purpose",
  name="stairs-import-fixer",
  prompt="""
  Apply staircase import rule to cloudbreak project.

  Read this spec: .claude/agents/stairs-import-fixer.md

  Backend: app/**/*.py (exclude migrations, .venv)
  Mobile: src/**/*.ts, src/**/*.tsx (exclude node_modules)

  Task:
  1. Find all files
  2. For each file: extract imports, sort by line length (ascending)
  3. Rewrite imports only (keep rest of code unchanged)
  4. Show before/after for modified files
  5. Commit: "style: apply staircase import rule"

  If no changes needed, say "✅ All imports already follow staircase rule"
  """
)
```

---

## Integration dans le workflow

**Étape 5. STAIRS** (après FIX, avant TEST)

L'agent s'exécute automatiquement après chaque story :
```
1. LIRE → 2. ÉCRIRE → 3. IMPLÉM → 4. FIX → 5. STAIRS (agent) → 6. TEST → 7. DOC → ...
```

Une fois l'agent terminé → commit appliqué, tests doivent passer (étape 6).
