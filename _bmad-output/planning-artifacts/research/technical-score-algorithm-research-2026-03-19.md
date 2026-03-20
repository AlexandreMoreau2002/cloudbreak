---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-19-peaks-search.md"
  - "_bmad-output/planning-artifacts/architecture.md"
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Algorithme de score mer de nuage — physique atmosphérique appliquée à une app mobile'
research_goals: 'Définir un algorithme V1 physiquement correct pour prédire la probabilité de mer de nuage depuis un sommet alpin — paramètres Open-Meteo exacts, conversion AGL/MSL, LCL, types de nuages, variables nécessaires et leurs pondérations. ET définir le pipeline complet de bout en bout : données GPS/altitude + données météo + cerveau de calcul + réponse à l'utilisateur — comment ces 4 couches s'articulent dans l'archi Cloudbreak'
user_name: 'Alex'
date: '2026-03-19'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-03-19
**Author:** Alex
**Research Type:** technical

---

## Research Overview

**Sujet :** Algorithme de score mer de nuage — physique atmosphérique appliquée à une app mobile
**Objectifs :** Définir un algorithme V1 physiquement correct + le pipeline complet de bout en bout
**Méthodologie :** Recherche web multi-sources, documentation officielle Open-Meteo, littérature météorologique, analyse d'apps existantes (Viewfindr, Windy, Meteoblue)

---

## Technical Research Scope Confirmation

**Research Topic :** Algorithme de score mer de nuage — physique atmosphérique appliquée à une app mobile
**Research Goals :** Définir un algorithme V1 physiquement correct pour prédire la probabilité de mer de nuage depuis un sommet alpin — paramètres Open-Meteo exacts, conversion AGL/MSL, LCL, types de nuages, variables nécessaires et leurs pondérations. ET définir le pipeline complet de bout en bout : données GPS/altitude + données météo + cerveau de calcul + réponse à l'utilisateur.

**Scope Confirmed :** 2026-03-19

---

## Technology Stack Analysis

### La question AGL vs MSL — Réponse définitive

**Résultat de recherche confirmé :** Open-Meteo utilise **MSL (Mean Sea Level) exclusivement** pour toutes ses altitudes.

> _"Altitudes are in meters above sea level (not above ground)"_ — Documentation officielle Open-Meteo
> _"Geopotential height is given as altitude above mean sea level. Not altitude above ground."_ — Open-Meteo Substack

**Ce que ça signifie pour Cloudbreak :**
- `cloud_cover_low` : nuages jusqu'à 3 000m MSL
- `cloud_cover_mid` : nuages de 3 000m à 8 000m MSL
- Les niveaux de pression (850 hPa ≈ 1 500m MSL, 700 hPa ≈ 3 000m MSL) sont tous en MSL
- **Pas de conversion AGL→MSL nécessaire** — Open-Meteo est déjà en MSL

**Avertissement critique pour la montagne :**
> _"Pour les zones en montagne (comme Zermatt à 1600m), certains niveaux de pression peuvent être situés sous le sol réel. Il est recommandé de discard data from pressure levels if the geopotential height is lower than ground level."_

→ Si le sommet est à 2 981m, les niveaux 1000 hPa (~110m MSL) et 925 hPa (~750m MSL) sont sous le sol — il faut les ignorer dans le calcul.

---

### Paramètres Open-Meteo disponibles et pertinents

#### Variables horaires (surface)

| Variable | Description | Unité | Pertinence Cloudbreak |
|---|---|---|---|
| `cloud_cover` | Couverture nuageuse totale | % | Indicateur général |
| `cloud_cover_low` | Nuages bas (< 3 000m MSL) | % | ⭐⭐⭐ CRITIQUE — c'est la couche mer de nuage |
| `cloud_cover_mid` | Nuages moyens (3 000-8 000m MSL) | % | ⭐ Secondaire |
| `cloud_cover_high` | Nuages hauts (> 8 000m MSL) | % | Peu pertinent |
| `relative_humidity_2m` | Humidité relative à 2m sol | % | ⭐⭐⭐ CRITIQUE |
| `dew_point_2m` | Point de rosée à 2m | °C | ⭐⭐⭐ CRITIQUE — calcul LCL |
| `temperature_2m` | Température à 2m sol | °C | ⭐⭐⭐ CRITIQUE — calcul LCL |
| `wind_speed_10m` | Vitesse du vent à 10m | km/h | ⭐⭐ Important |
| `wind_direction_10m` | Direction du vent | ° | ⭐ Secondaire (orographie) |
| `surface_pressure` | Pression atmosphérique surface | hPa | ⭐⭐ Important |
| `visibility` | Visibilité horizontale | m | ⭐⭐ Indicateur brouillard |
| `precipitation` | Précipitations | mm | ⭐ Signal négatif |

#### Variables de niveaux de pression (profil vertical) — ESSENTIEL

Open-Meteo fournit pour chaque niveau de pression (1000, 925, 850, 800, 700, 600, 500 hPa...) :

| Variable | Description | Unité |
|---|---|---|
| `temperature_{hPa}hPa` | Température au niveau | °C |
| `relative_humidity_{hPa}hPa` | Humidité relative au niveau | % |
| `cloud_cover_{hPa}hPa` | Couverture nuageuse estimée | % |
| `geopotential_height_{hPa}hPa` | **Altitude réelle MSL du niveau** | m |
| `wind_speed_{hPa}hPa` | Vent au niveau | km/h |

**Correspondances altitude approximatives des niveaux :**

| Niveau hPa | Altitude MSL approx. | Pertinence Alpes |
|---|---|---|
| 1000 hPa | ~110 m | Vallées basses |
| 925 hPa | ~750 m | Vallées alpines (Grenoble, Annecy) |
| 850 hPa | ~1 500 m | Altitude moyenne (La Bastille, cols) |
| 800 hPa | ~2 000 m | Altitude inter (Belledonne basse) |
| 700 hPa | ~3 000 m | Sommets intermédiaires |
| 600 hPa | ~4 200 m | Hauts sommets (Mont Blanc zone) |
| 500 hPa | ~5 600 m | Haute atmosphère |

→ **Pour un sommet à 2 500m, les niveaux 925, 850, 800 et 700 hPa sont les plus pertinents.**

---

## Integration Patterns — Physique de la Mer de Nuage

### Mécanisme physique fondamental

La mer de nuage est une **inversion thermique** : normalement la température baisse avec l'altitude (~2°C/300m), mais lors d'une inversion elle augmente à une certaine couche. Cette couche chaude supérieure agit comme un "couvercle" qui emprisonne l'air humide et froid en dessous, créant une couche nuageuse dense (stratus/brouillard).

**L'utilisateur Cloudbreak est au-dessus de la mer de nuage si :**
```
altitude_sommet_MSL > altitude_base_couche_MSL
                    ET
altitude_sommet_MSL < altitude_sommet_couche_MSL (idéalement)
```

Sans le sommet de la couche, on peut conclure "au-dessus de la base" — suffisant pour V1.

---

### Le LCL (Lifting Condensation Level) — formule validée

Le LCL est l'altitude à laquelle une parcelle d'air soulevée devient saturée → c'est une **estimation de la base des nuages convectifs**.

**Formule approximative standard (NWS, NOAA) :**
```python
# Base nuage AGL approximée (pour nuages convectifs)
lcl_agl_meters = 123 * (temperature_2m - dew_point_2m)

# Conversion en MSL
lcl_msl = altitude_terrain_MSL + lcl_agl_meters
```

**Limites du LCL :**
- Valide pour cumulus convectifs
- **Peu fiable pour stratus/brouillard** — qui sont le cœur de la mer de nuage alpine
- En terrain montagneux, le LCL est un indicateur parmi d'autres, pas la vérité absolue

**Pour la mer de nuage alpine (stratus/brouillard de vallée) :** la méthode par niveaux de pression est plus fiable que le LCL seul.

---

### Méthode par profil vertical — approche recommandée V1

Au lieu d'estimer la base via LCL, on **lit directement le profil vertical** depuis Open-Meteo :

```python
def find_cloud_base_msl(pressure_levels_data, peak_altitude_msl):
    """
    Trouve la base de la couche nuageuse en MSL
    en scannant les niveaux de pression du bas vers le haut.
    """
    # Trier les niveaux par altitude croissante
    levels = sorted(pressure_levels_data, key=lambda x: x['geopotential_height'])

    for level in levels:
        # Ignorer les niveaux sous le sol (montagne)
        if level['geopotential_height'] < ground_elevation:
            continue

        # Seuil : humidité > 85% ou cloud_cover > 40% = présence de nuage
        if level['relative_humidity'] > 85 or level['cloud_cover'] > 40:
            return level['geopotential_height']  # base en MSL

    return None  # Ciel clair, pas de couche nuageuse basse
```

**Variables nécessaires par niveau :** `geopotential_height`, `relative_humidity`, `cloud_cover`, `temperature`

---

### Variables de l'inversion thermique

**Détection de l'inversion :**
```python
def detect_inversion(levels_sorted_by_altitude):
    """
    Détecte si une inversion thermique est présente.
    Inversion = température qui AUGMENTE avec l'altitude
    sur au moins deux niveaux consécutifs.
    """
    for i in range(len(levels_sorted_by_altitude) - 1):
        lower = levels_sorted_by_altitude[i]
        upper = levels_sorted_by_altitude[i + 1]
        if upper['temperature'] > lower['temperature']:
            return True, upper['geopotential_height']  # altitude inversion en MSL
    return False, None
```

**Signaux de l'inversion identifiés par la recherche :**
- Température qui augmente entre 850 hPa et 700 hPa → inversion forte
- Humidité > 90% en basse couche + < 50% au-dessus de l'inversion → conditions idéales
- Vent < 15 km/h (4 mph) → mer de nuage stable, pas dispersée
- Pression > 1020 hPa → anticyclone, temps stable

---

## Performance Analysis — Pipeline complet de bout en bout

### Vue d'ensemble : les 4 couches

```
┌─────────────────────────────────────────────────────────┐
│  COUCHE 1 — DONNÉES GPS/ALTITUDE                        │
│  Source : DB peaks (OSM seed + enrichissement organique) │
│  → peak.lat, peak.lng, peak.altitude (MSL, depuis IGN)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  COUCHE 2 — DONNÉES MÉTÉO                               │
│  Source : Redis (grille pré-chargée, cron 3h)           │
│  → variables surface + profil vertical par zone          │
│  → données J à J+4 (couverture weekend rando)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  COUCHE 3 — CERVEAU (services/score.py)                 │
│  → Calcul LCL (estimation initiale)                     │
│  → Profil vertical → base couche MSL réelle             │
│  → Détection inversion thermique                        │
│  → Calcul score pondéré (voir formule V1)               │
│  → Verdict + probabilité + fenêtre temporelle           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  COUCHE 4 — RÉPONSE UTILISATEUR                         │
│  → Verdict 3 niveaux (high/medium/low)                  │
│  → Score % de probabilité                               │
│  → Variables explicatives (base nuage, humidité, vent)  │
│  → Fenêtre temporelle optimale                          │
│  → Indicateur de fiabilité                             │
└─────────────────────────────────────────────────────────┘
```

---

### Couche 2 en détail — Appel Open-Meteo complet

**Requête type pour une zone (grille pré-chargée) :**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=45.18
  &longitude=5.72
  &elevation=476                    ← altitude réelle du point de référence zone
  &hourly=
    temperature_2m,
    dew_point_2m,
    relative_humidity_2m,
    cloud_cover,
    cloud_cover_low,
    cloud_cover_mid,
    wind_speed_10m,
    surface_pressure,
    visibility,
    temperature_850hPa,
    relative_humidity_850hPa,
    cloud_cover_850hPa,
    geopotential_height_850hPa,
    temperature_700hPa,
    relative_humidity_700hPa,
    cloud_cover_700hPa,
    geopotential_height_700hPa,
    temperature_800hPa,
    relative_humidity_800hPa,
    cloud_cover_800hPa,
    geopotential_height_800hPa
  &forecast_days=5
  &timezone=Europe/Paris
```

**Stockage Redis :**
```python
key = f"weather:{zone_id}:{date}:{hour}"
# TTL = 3h (données re-chargées par le cron)
```

---

### Couche 3 en détail — Algorithme de score V1

**Variables d'entrée :**
```python
# Depuis DB peaks
peak_altitude_msl: float      # altitude réelle du sommet en MSL (depuis IGN/OSM)

# Depuis Redis (données météo de la zone)
temperature_2m: float         # température sol vallée °C
dew_point_2m: float           # point de rosée sol °C
relative_humidity_2m: float   # humidité sol %
cloud_cover_low: float        # couverture nuages bas %
wind_speed_10m: float         # vent km/h
surface_pressure: float       # pression hPa
pressure_levels: list[dict]   # profil vertical (geopotential_height, RH, cloud_cover, temp)
```

**Calcul du score V1 :**

```python
def calculate_sea_of_clouds_score(peak: Peak, weather: WeatherData) -> ScoreResult:

    # ── ÉTAPE 1 : Base nuage depuis profil vertical ──────────────────────────
    cloud_base_msl = find_cloud_base_msl(
        weather.pressure_levels,
        ground_elevation=weather.surface_elevation  # altitude terrain zone
    )

    # ── ÉTAPE 2 : LCL comme signal complémentaire ────────────────────────────
    lcl_agl = 123 * (weather.temperature_2m - weather.dew_point_2m)
    lcl_msl = weather.surface_elevation + lcl_agl

    # Base de référence = plus basse des deux estimations (conservateur)
    estimated_base_msl = min(cloud_base_msl or lcl_msl, lcl_msl)

    # ── ÉTAPE 3 : Le sommet est-il au-dessus de la base ? ────────────────────
    delta_altitude = peak.altitude - estimated_base_msl
    # > 0 : sommet au-dessus de la base → favorable
    # < 0 : sommet sous la base → défavorable

    # ── ÉTAPE 4 : Score par composante ───────────────────────────────────────

    # 4a. Score altitude (40%) — variable la plus critique
    if delta_altitude > 200:
        altitude_score = 1.0
    elif delta_altitude > 0:
        altitude_score = 0.5 + (delta_altitude / 400)  # gradient 0.5→1.0
    elif delta_altitude > -200:
        altitude_score = 0.5 + (delta_altitude / 400)  # gradient 0.5→0.0
    else:
        altitude_score = 0.0

    # 4b. Score nuages bas (20%) — couverture de la couche
    # cloud_cover_low > 60% = couche dense = mer de nuage plausible
    low_cloud_score = min(weather.cloud_cover_low / 100, 1.0)

    # 4c. Score vent (20%) — vent faible = mer de nuage stable
    # < 15 km/h : idéal / > 40 km/h : dispersé
    if weather.wind_speed_10m < 15:
        wind_score = 1.0
    elif weather.wind_speed_10m < 40:
        wind_score = 1.0 - ((weather.wind_speed_10m - 15) / 25)
    else:
        wind_score = 0.0

    # 4d. Score inversion (20%) — présence d'inversion thermique
    inversion_detected, inversion_altitude = detect_inversion(weather.pressure_levels)
    if inversion_detected and inversion_altitude:
        # L'inversion est entre le sommet et la base → parfait
        if estimated_base_msl < inversion_altitude < peak.altitude + 500:
            inversion_score = 1.0
        else:
            inversion_score = 0.6
    else:
        inversion_score = 0.2  # pas d'inversion → mer de nuage peu probable

    # ── ÉTAPE 5 : Score final pondéré ────────────────────────────────────────
    score = (
        0.40 * altitude_score      # position relative sommet / base nuage
      + 0.20 * low_cloud_score     # densité de la couche nuageuse basse
      + 0.20 * wind_score          # stabilité (vent faible)
      + 0.20 * inversion_score     # inversion thermique (mécanisme fondamental)
    )

    # ── ÉTAPE 6 : Verdict ────────────────────────────────────────────────────
    if score >= 0.70:
        verdict = "high"
    elif score >= 0.40:
        verdict = "medium"
    else:
        verdict = "low"

    return ScoreResult(
        score=round(score * 100),        # 0-100%
        verdict=verdict,
        cloud_base_msl=estimated_base_msl,
        delta_altitude=delta_altitude,
        inversion_detected=inversion_detected,
        wind_speed=weather.wind_speed_10m,
        cloud_cover_low=weather.cloud_cover_low,
    )
```

---

### Couche 4 en détail — Réponse à l'utilisateur

**JSON de réponse endpoint `GET /api/v1/score` :**
```json
{
  "score": 82,
  "verdict": "high",
  "label": "Lève-toi tôt, ça vaut le coup",
  "cloud_base": 1340,
  "peak_altitude": 2981,
  "delta_altitude": 1641,
  "conditions": {
    "cloud_cover_low": 78,
    "wind_speed": 8,
    "inversion_detected": true,
    "humidity": 91
  },
  "optimal_window": {
    "start": "06:20",
    "end": "09:45"
  },
  "reliability": "stable",
  "computed_at": "2026-03-19T05:00:00Z"
}
```

---

## Architecture Summary — Décisions techniques finales

### Ce qui change par rapport à l'archi actuelle dans `services/score.py`

| Aspect | Avant (insuffisant) | Après (V1 correct) |
|---|---|---|
| Source base nuage | `cloud_base` variable simple | Profil vertical → `geopotential_height` + `cloud_cover` par niveau |
| Repère altimétrique | Non défini (bug potentiel) | MSL explicite partout |
| Inversion thermique | Score approximatif | Détection réelle via profil de température |
| Niveaux de pression | Non utilisés | 850, 800, 700 hPa scannés |
| Niveaux invalides | Non filtrés | Niveaux sous le sol ignorés |

### Variables Open-Meteo à requêter (liste définitive)

**Surface (obligatoires) :**
`temperature_2m`, `dew_point_2m`, `relative_humidity_2m`, `cloud_cover_low`, `cloud_cover_mid`, `wind_speed_10m`, `surface_pressure`, `visibility`

**Niveaux de pression (profil vertical) :**
Pour chaque niveau 925, 850, 800, 700 hPa :
`temperature_{n}hPa`, `relative_humidity_{n}hPa`, `cloud_cover_{n}hPa`, `geopotential_height_{n}hPa`

### Limites V1 documentées (trajectoire V2)

| Limite V1 | Solution V2 |
|---|---|
| Pas de distinction type nuage (stratus vs cumulus) | Classifier via profil vertical + saison |
| Pas de correction orographique (versant au vent) | Intégrer direction vent + relief DEM |
| LCL seul insuffisant pour brouillard | Combiner avec `visibility` et profil RH |
| Zone météo 50km² | Affiner vers grille 10km² (AROME Météo-France) |

---

## Session Summary

### Réponses définitives aux questions de départ

**1. AGL ou MSL dans Open-Meteo ?**
→ **MSL exclusivement.** `geopotential_height` donne l'altitude MSL de chaque niveau. Pas de conversion nécessaire mais filtrer les niveaux sous le sol du sommet.

**2. Quelle variable donne la base de la couche nuageuse ?**
→ **Pas de variable directe `cloud_base`.** Il faut scanner le profil vertical (`geopotential_height` + `relative_humidity` + `cloud_cover` par niveau de pression) et trouver le premier niveau avec humidité > 85% ou cloud_cover > 40%.

**3. Le LCL suffit-il ?**
→ **Non pour le MVP sérieux.** Le LCL est utile pour les cumulus convectifs, mais la mer de nuage alpine est un stratus/brouillard de vallée — son estimation nécessite le profil vertical.

**4. Quelles pondérations pour le score ?**
→ `0.40 * altitude` + `0.20 * cloud_cover_low` + `0.20 * wind` + `0.20 * inversion`
→ L'altitude relative (sommet vs base nuage MSL) est dominante à 40% — c'est la variable physiquement la plus directe.

**5. Le pipeline de bout en bout ?**
→ `peaks DB (lat/lng/altitude MSL)` → `Redis weather data (profil vertical)` → `services/score.py (algorithme)` → `JSON réponse (score + verdict + conditions)` → `ScoreCard.tsx (affichage)`

### Sources

- [Open-Meteo Documentation officielle](https://open-meteo.com/en/docs)
- [Open-Meteo Upper Air Forecasts](https://openmeteo.substack.com/p/upper-air-weather-forecasts-via-api)
- [Understanding LCL — NumberAnalytics](https://www.numberanalytics.com/blog/ultimate-guide-lifting-condensation-level-meteorology)
- [NWS — LCL Height](https://www.weather.gov/btv/profileLCL)
- [How to predict cloud inversions — Outdoors Magic](https://outdoorsmagic.com/article/how-to-witness-a-cloud-inversion/)
- [Undercast prediction — Green Mountain Club](https://www.greenmountainclub.org/temperature-inversion-undercast-obsession/)
- [New algorithm for low cloud-base height — Journal of Applied Meteorology 2022](https://journals.ametsoc.org/view/journals/apme/61/9/JAMC-D-21-0221.1.xml)
- [Viewfindr fog height forecast](https://viewfindr.net/weather/fog-height/)
- [Cloud base AGL vs MSL — AskACFI](https://www.askacfi.com/2386/cloud-heights-agl-or-msl.htm)

