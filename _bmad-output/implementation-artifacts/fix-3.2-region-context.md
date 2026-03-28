# Fix 3.2 — Champ `region` : contexte géographique des sommets

**Type :** Correctif data + migration backend + affichage mobile
**Priorité :** Avant la story 3.5 (le champ `region` est affiché dans le header du sommet)
**Origine :** Oubli de conception dans la story 3.2 (seed DB) — le champ aurait dû être généré au moment du scraping OSM

---

## Résultat attendu

Le header de l'écran principal affiche :
```
Moucherotte
1901m · Massif du Vercors
```
```
La Bastille
476m · Grenoble
```
```
Tour Eiffel
324m · Paris
```

Si `region` est null (données manquantes) → afficher seulement `1901m`, sans le séparateur `·`.

---

## Plan d'implémentation

### 1. Backend — Migration Alembic

Ajouter la colonne `region` nullable à la table `peaks` :

```python
# alembic/versions/xxxx_add_region_to_peaks.py
op.add_column('peaks', sa.Column('region', sa.String(), nullable=True))
```

Commande : `make migration` puis `make migrate`

---

### 2. Backend — Enrichissement `generate_peaks.py`

Modifier le script de génération des données OSM pour peupler `region` lors du scraping.

**Logique de priorité (dans l'ordre) :**

1. Tag OSM `mountain_range` → valeur directe (ex: "Vercors", "Belledonne")
2. Tag OSM `region` ou `addr:state` → valeur directe
3. Tag OSM `is_in` → parser la première valeur significative
4. Si aucun tag OSM disponible → **Nominatim reverse geocoding** (lat/lng)
   - Pour viewpoints urbains (`natural=viewpoint`) → extraire `city` ou `town`
   - Pour peaks/saddles → extraire `county` ou `state_district` (ex: "Isère" si pas de massif)
   - Rate limit Nominatim : **1 req/sec max** — batcher avec `asyncio.sleep(1)` entre chaque appel
   - User-Agent obligatoire dans le header Nominatim : `"Cloudbreak/1.0 contact@cloudbreak.app"`

**Fallback final :** laisser `null` si aucune source ne retourne de valeur utilisable.

**Re-seed :** après modification du script, relancer `make seed` — les 21 597 entrées existantes seront mises à jour (upsert sur `slug`).

> ⚠️ Ne pas relancer `generate_peaks.py` (qui appelle Open-Meteo Elevation) — utiliser uniquement les données existantes dans `peaks_data.json` et enrichir le champ `region` via Nominatim.

---

### 3. Backend — Modèle SQLAlchemy

```python
# app/models/peak.py
region = Column(String, nullable=True)
```

---

### 4. Backend — Schéma Pydantic

```python
# app/schemas/peak.py
region: str | None = None
```

Le champ doit apparaître dans toutes les réponses API qui exposent un peak :
- `GET /api/v1/peaks/search`
- `GET /api/v1/peaks/{slug}`
- Réponse du score (`peak_name`, `peak_altitude` → ajouter `peak_region`)

---

### 5. Backend — Endpoint score

Ajouter `peak_region: str | None` dans la réponse de `GET /api/v1/score` (à côté de `peak_name` et `peak_altitude`).

---

### 6. Mobile — Type TypeScript

```typescript
// src/services/mockData/types.ts
// Dans l'interface Peak :
region?: string | null;

// Dans l'interface ScoreResponse :
peak_region?: string | null;
```

---

### 7. Mobile — Affichage dans le header

Fichier : `src/app/(tabs)/index.tsx`, fonction `renderPeakHeader`

```tsx
// Remplacer :
<Text>{peak.altitude} m</Text>

// Par :
<Text>
  {peak.altitude} m{peak.region ? ` · ${peak.region}` : ''}
</Text>
```

---

## Limites et risques

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Nominatim rate limit (1 req/sec) | Élevée si mal géré | `asyncio.sleep(1)` strict entre chaque appel, retry exponentiel |
| Tags OSM absents sur la majorité des peaks | Élevée | Fallback Nominatim — tolérer `null` pour les peaks obscurs |
| Nominatim retourne des valeurs incohérentes (ex: département au lieu de massif) | Moyenne | Prioriser les tags OSM directs ; Nominatim en dernier recours uniquement |
| Re-seed lent (21 597 entries × 1 req/sec Nominatim) | Élevée si 100% Nominatim | Tester d'abord combien de peaks ont déjà un tag OSM — Nominatim seulement pour les manquants |
| `generate_peaks.py` appelle Open-Meteo → rate limit 429 | Élevée si relancé | **Ne PAS relancer `generate_peaks.py`** — enrichir `peaks_data.json` séparément avec un script dédié `enrich_region.py` |
| Données Nominatim en anglais | Moyenne | Ajouter `accept-language: fr` dans le header de la requête Nominatim |

---

## Choses à prendre en compte

- **Script séparé** : créer `backend/scripts/enrich_region.py` plutôt que modifier `generate_peaks.py` — évite de re-déclencher l'enrichissement altitude Open-Meteo
- **Idempotence** : le script doit pouvoir être relancé sans dupliquer les données (upsert sur `slug`)
- **`peaks_data.json`** : enrichir le fichier JSON source + mettre à jour la DB — les deux doivent rester synchronisés
- **Tests** : mettre à jour les fixtures de test backend qui créent des `Peak` sans `region` (nullable, donc pas bloquant mais propre de l'initialiser à `None`)
- **Données de mock mobile** : mettre à jour `src/services/mockData/peaks.ts` avec un `region` sur au moins 2 sommets pour couvrir les cas d'affichage dans les tests

---

## Fichiers touchés

**Backend :**
- `alembic/versions/xxxx_add_region_to_peaks.py` ← nouveau
- `backend/scripts/enrich_region.py` ← nouveau
- `app/models/peak.py`
- `app/schemas/peak.py`
- `app/api/v1/endpoints/score.py` (réponse `peak_region`)
- `app/schemas/score.py` (si existant)
- `tests/` — fixtures Peak

**Mobile :**
- `src/services/mockData/types.ts`
- `src/services/mockData/peaks.ts`
- `src/app/(tabs)/index.tsx` — `renderPeakHeader`
- `src/app/(tabs)/index.test.tsx` — assertions header

---

## Définition de "done"

- [ ] Migration appliquée en dev (`make migrate`)
- [ ] `enrich_region.py` tourne sans erreur sur les 21 597 peaks
- [ ] Au moins 80% des peaks français connus ont un `region` non-null
- [ ] `GET /api/v1/peaks/search?q=moucherotte` retourne `"region": "Massif du Vercors"`
- [ ] `GET /api/v1/score` retourne `"peak_region": "Massif du Vercors"`
- [ ] Header mobile affiche `1901m · Massif du Vercors`
- [ ] Header mobile affiche `476m` seul si `region` est null
- [ ] `make validate` passe (backend)
- [ ] `npm run validate` passe (mobile)
