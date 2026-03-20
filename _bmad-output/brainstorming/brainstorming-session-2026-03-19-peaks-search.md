---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-12-2120.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-17-naming.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/epics.md"
session_topic: 'Gestion des données GPS des sommets — recherche, suggestions, sources de données, stratégie'
session_goals: 'Définir comment alimenter la base de données des sommets (source), comment gérer la recherche (UX + backend), les suggestions, et la stratégie de données pour le MVP et au-delà'
selected_approach: 'ai-recommended'
techniques_used: ['constraint-mapping', 'cross-pollination', 'solution-matrix']
ideas_generated: 11
session_active: false
workflow_completed: true
---

# Brainstorming Session — Peaks Search & GPS Data

**Facilitateur :** Alex
**Date :** 2026-03-19

---

## Session Overview

**Topic :** Gestion des données GPS des sommets — onglet recherche Cloudbreak
**Goals :** Définir comment alimenter la base de données des sommets (source), comment gérer la recherche (UX + backend), les suggestions, et la stratégie de données pour le MVP et au-delà

### Contexte chargé depuis les sessions précédentes

**Depuis la session features (2026-03-12) :**
- Mode découverte par région identifié comme V2 — nécessite DB sommets + algo tri multi-critères
- Mode "J'ai un spot précis" (MVP) + Mode "Je cherche un spot" (V2)
- Feed social par sommet (V2) — besoin masse critique d'users

**Depuis l'architecture (2026-03-17) :**
- Table `peaks` : `id`, `name`, `slug`, `lat`, `lng`, `altitude` + region, country
- Endpoint `GET /api/v1/peaks/search?q=` — autocomplete sommets
- Endpoint `GET /api/v1/peaks/{slug}` — détail sommet
- `db/seed.py` défini mais **source de données (GeoJSON, OpenTopoData API ?) à préciser** — gap identifié
- `usePeaks.ts` hook mobile — search + favoris (FR8–FR10)

**Depuis les epics :**
- FR8 : recherche sommet ou point de vue par nom
- FR9 : accès depuis favoris
- FR10 : ajouter aux favoris
- Story dédiée à implémenter dans Epic 3 (Recherche & Navigation)

### Session Setup

_Nouvelle session dédiée à la stratégie données GPS + UX recherche — contexte projet complet chargé._

---

## Technique Selection

**Approche :** AI-Recommended
**Contexte d'analyse :** Problème technique + produit à 3 couches (données, backend, UX), contraintes solo dev / budget minimal / MVP Alpes FR → V2 mondial

**Techniques recommandées :**

- **Constraint Mapping** : Cartographier toutes les contraintes réelles avant de générer des solutions — éviter les fausses pistes
- **Cross-Pollination** : Piller ce qui marche chez Komoot, AllTrails, PeakVisor, Windy — ne pas réinventer
- **Solution Matrix** : Croiser les 3 dimensions (source données × calcul score × UX recherche) pour décider la combinaison optimale MVP

---

## Technique Execution Results

### Phase 1 — Constraint Mapping

#### Contrainte fondamentale : définir ce qu'est un "sommet" pour Cloudbreak

**Décision prise :** Pas de filtre d'altitude minimum. Un point d'observation valide est tout point depuis lequel la mer de nuage peut être visible — y compris La Bastille à Grenoble (476m). Le brouillard de vallée crée des mers de nuage à 400-600m. L'utilisateur grenoblois qui monte à la Bastille par temps brumeux est un cas d'usage réel et valide.

**Scope MVP :** Tous les sommets notables des Alpes françaises.
**Scope V2 :** Extension à tous les points de vue notables (cols, plateaux, belvédères, crêtes) + couverture internationale.

#### Contrainte technique : AGL vs MSL

**Problème identifié :** La hauteur de nuage fournie par les API météo peut être exprimée en AGL (au-dessus du sol local) ou MSL (au-dessus du niveau de la mer). En montagne, cette différence est critique — un plafond à 1200m AGL dans une vallée à 400m = base à 1600m MSL. Si le sommet est à 1500m MSL, il est au-dessus de la base. Sans cette conversion, le score est systématiquement faux.

**Décision :** L'algorithme de score doit impérativement travailler en MSL, avec conversion AGL→MSL explicite. Ce sujet nécessite un `bmad-bmm-technical-research` dédié avant implémentation.

#### Contrainte de charge : 500 users actifs au lancement

**Impact :** À 500 users faisant 3 checks/jour = 1500 appels API météo/jour en modèle à la demande. Inacceptable pour un VPS OVH à budget minimal.
**Décision :** Grille météo pré-chargée obligatoire dès le MVP.

#### Contrainte de précision : relief alpin violent

**Réalité terrain :** 2km de distance horizontale peuvent représenter 1500m de dénivelé dans les Alpes. Une grille météo large (20km+) est inutilisable.
**Solution :** Passer l'altitude réelle du sommet (depuis IGN ou OSM) au paramètre `elevation` d'Open-Meteo — il corrige ses données météo pour l'altitude demandée via gradient thermique standard.

---

### Phase 2 — Cross-Pollination

**[Source #1] : Recherche fuzzy tolérante aux fautes** *(Komoot)*
*Concept* : Accepter "belledone" → retourner "Belledonne". Sur mobile avec clavier, indispensable — les noms alpins sont longs et complexes.
*Nouveauté* : `pg_trgm` PostgreSQL intégré — recherche fuzzy native sans dépendance externe, <10ms sur 8000 sommets avec index GiST.

**[Source #2] : Résultats géo-contextualisés** *(Komoot)*
*Concept* : Retourner d'abord les sommets proches de la position GPS actuelle de l'user. Un grenoblois qui cherche "Croix" veut la Croix de Chamrousse, pas la Croix du Vieux Chaillol.
*Nouveauté* : `ORDER BY ST_Distance(peak.coords, user_coords)` — aucun calcul supplémentaire, juste un tri SQL.

**[Source #3] : Suggestions récents + favoris à l'état vide** *(AllTrails)*
*Concept* : Afficher les spots récents avant même que l'user commence à taper. L'user recheck souvent les mêmes sommets.
*Nouveauté* : Stocké en AsyncStorage mobile — zéro appel backend pour l'état vide de la recherche.

**[Source #4] : OSM comme source de vérité des sommets** *(PeakVisor)*
*Concept* : OpenStreetMap contient ~8000 peaks taggés `natural=peak` sur les Alpes françaises avec `name`, `ele`, `lat`, `lng` — téléchargeable en un seul dump Overpass, gratuit, libre de droits.
*Nouveauté* : Seed initial de la DB `peaks` complet dès le lancement, altitude incluse via tag `ele` — pas d'API d'élévation nécessaire pour ces points.

**[Source #5] : Autocomplete progressif dès 2 caractères** *(Google Maps)*
*Concept* : Suggestions en temps réel sans validation par Entrée.
*Nouveauté* : Combiné à `pg_trgm`, requête <10ms — expérience native sans infrastructure externe.

**[Source #6] : Résultats enrichis visuellement** *(Google Maps)*
*Concept* : Afficher `nom + altitude + distance depuis user` dans chaque résultat — l'user scanne sans lire.
*Nouveauté* : Différenciateur UX direct vs apps météo génériques qui n'affichent que le nom.

**[Source #7] : Fallback "zéro écran vide"** *(Google Maps)*
*Concept* : Si 0 résultats en DB → fallback automatique Nominatim en temps réel.
*Nouveauté* : Le nouveau point est résolu (coordonnées + altitude IGN) et sauvegardé en DB automatiquement — enrichissement organique invisible pour l'user.

**[Source #8] : Correction altitude via paramètre `elevation`** *(gap Windy)*
*Concept* : Windy retourne des données météo à l'altitude de son modèle numérique interne — souvent 200-500m sous le vrai sommet en terrain alpin.
*Nouveauté* : Open-Meteo accepte `?elevation=2981` — corrige automatiquement température, humidité, pression pour l'altitude réelle. C'est ce que Windy ne fait pas.

**[Source #9] : Carte interactive** *(Meteoblue)*
*Concept* : Pointer n'importe quel endroit sur une carte → score calculé sur ce point.
*Nouveauté* : V2 — résolution automatique altitude + calcul score sur tap. Zéro saisie texte.

**[Source #10] : Cache mobile agressif** *(Flowx)*
*Concept* : Données des spots récents disponibles offline plusieurs heures après le dernier chargement.
*Nouveauté* : Spots habituels visibles sans connexion avec horodatage — différenciateur fort en zone montagne sans signal.

**[Source #11] : Recherche vocale** *(gap mobile)*
*Concept* : Noms de sommets difficiles à taper ("Aiguille du Dru", "Dent de Crolles") — la recherche vocale native iOS résout ça.
*Nouveauté* : `SearchBar` Expo avec voice input — V2 facile, différenciateur UX réel.

---

### Phase 3 — Solution Matrix

#### Dimension 1 — Source de données sommets

| Option | Couverture initiale | Maintenance | Coût | Verdict |
|---|---|---|---|---|
| OSM seed (~8000 peaks Alpes FR) | ✅ Excellente | Zéro | Gratuit | ✅ MVP |
| Enrichissement organique (Nominatim + IGN) | ✅ Infinie | Automatique | Gratuit | ✅ MVP |
| Base IGN BD TOPO | ✅ Exhaustive FR | Manuel | Gratuit mais complexe | ⏳ V2 |
| Saisie manuelle | ❌ Limitée | Lourde | Temps | ❌ |

**Décision :**
```
Seed OSM au lancement (~8000 peaks Alpes FR, ele inclus via tag OSM)
+ enrichissement automatique runtime pour tout point hors OSM :
  → Nominatim (geocoding, gratuit, sans clé)
  → IGN RGE Alti (altitude précision 1m, gratuit avec clé gratuite)
  → sauvegardé en DB peaks automatiquement (disponible pour tous les users suivants)
```

**Requête Overpass pour le seed :**
```
[out:json];
node["natural"="peak"]["name"](44.0,5.0,46.5,7.5);
out body;
```

#### Dimension 2 — Calcul du score

| Option | Appels API météo/jour (500 users) | Latence | Complexité | Verdict |
|---|---|---|---|---|
| À la demande pur | ~1500/jour | 200-800ms | Simple | ❌ Trop gourmand |
| Grille pré-chargée | ~30/jour | <50ms | Moyenne | ✅ MVP |
| Hybride | ~50/jour | <50ms + fallback | Plus complexe | ⏳ V2 |

**Décision — Grille pré-chargée :**
```
Cron toutes les 3h (6h, 9h, 12h, 15h, 18h, 21h)
→ ~10 zones Alpes FR (50km × 50km)
→ 1 appel Open-Meteo batch par zone
  → paramètre ?elevation={altitude_réelle} par sommet
  → données J, J+1, J+2, J+3 (couvre le cas "weekend rando dans 4 jours")
→ Stocké Redis : weather:{zone_id}:{date}:{hour} TTL 3h
→ Score calculé <50ms sur données déjà en cache
→ Fallback à la demande si zone non encore chargée (démarrage à froid uniquement)
```

**Impact :** 80 appels Open-Meteo/jour total, indépendant du nombre d'users. Tient jusqu'à 5000+ users sans modification.

#### Dimension 3 — UX recherche mobile

| Option | Expérience user | Complexité backend | Verdict |
|---|---|---|---|
| Autocomplete DB seul (pg_trgm) | Bonne | Simple | ✅ MVP base |
| + fallback Nominatim si 0 résultats | Excellent, zéro écran vide | Simple | ✅ MVP |
| + géolocalisation pour trier résultats | Excellent, contextuel | Simple | ✅ MVP |
| + suggestions récents/favoris état vide | Excellent, fluide | Zéro (AsyncStorage) | ✅ MVP |
| Recherche vocale | Différenciateur | Trivial iOS | ⏳ V2 |
| Carte interactive | Puissant | Complexe | ⏳ V2 |

**Décision :**
```
Autocomplete pg_trgm dès 2 caractères (fuzzy, tolérant aux fautes)
+ tri par distance GPS user (résultats contextuels)
+ résultats enrichis : nom + altitude + distance
+ fallback Nominatim + IGN si 0 résultats en DB
+ état vide : récents + favoris depuis AsyncStorage (zéro appel backend)
```

---

## Idea Organization and Prioritization

### Thème 1 — Données (la fondation)

- **OSM seed + enrichissement organique** : 8000 peaks dès le lancement, croissance automatique par l'usage — aucune maintenance manuelle
- **Altitude réelle via tag OSM / IGN RGE Alti** : Variable critique pour la précision du score — une seule résolution par point, stockée définitivement
- **Correction Open-Meteo via paramètre `elevation`** : Données météo corrigées à l'altitude réelle du sommet — comble le principal gap de Windy et Meteoblue

### Thème 2 — Backend (la mécanique)

- **Grille pré-chargée 10 zones, cron 3h** : 80 appels/jour vs 1500 — économie de 95% des ressources API
- **Redis weather:{zone}:{date}:{hour}** : Réponse <50ms, structure cohérente avec l'archi Redis existante
- **Données J+4** : Couvre le cas "je pars ce weekend" — différenciateur vs apps qui ne font que J+1

### Thème 3 — UX recherche (l'expérience)

- **pg_trgm fuzzy** : Tolérance aux fautes de frappe — indispensable mobile
- **Géolocalisation + tri distance** : Résultats contextuels sans configuration
- **Zéro écran vide** : Fallback Nominatim transparent — l'user ne sait pas qu'il a cherché hors DB
- **État vide intelligent** : Récents + favoris sans appel réseau

### Breakthrough concept : DB auto-enrichie par l'usage

La première fois qu'un user cherche un point non répertorié dans OSM, le système le résout et le sauvegarde automatiquement. La deuxième fois, il est déjà en cache. La DB grandit organiquement avec les recherches réelles des utilisateurs — sans intervention manuelle, sans coût supplémentaire.

---

## Architecture Finale — Flux complet

```
┌──────────────────────────────────────────────────────┐
│                    SEED INITIAL                       │
│  OSM Overpass → ~8000 peaks Alpes FR                │
│  (name, lat, lng, ele) → DB peaks                   │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│               CRON MÉTÉO (toutes les 3h)             │
│  10 zones Alpes FR → Open-Meteo batch               │
│  Données J à J+4 → Redis weather:{zone}:{date}:{h}  │
│  TTL 3h — 80 appels/jour indépendant du trafic      │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│               RECHERCHE MOBILE (runtime)             │
│  Frappe → pg_trgm autocomplete + tri distance GPS   │
│  Si 0 résultats → Nominatim + IGN → nouveau peak    │
│  sauvegardé en DB (enrichissement organique)        │
│  État vide → récents + favoris (AsyncStorage)       │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│               CALCUL SCORE (instantané)              │
│  Peak sélectionné → zone identifiée                 │
│  → données Redis déjà là → score <50ms              │
│  → altitude réelle passée à Open-Meteo (?elevation) │
│  → conversion AGL→MSL obligatoire (voir note algo)  │
└──────────────────────────────────────────────────────┘
```

---

## Session Summary and Insights

### Décisions clés prises

| Décision | Choix retenu | Raison |
|---|---|---|
| Source sommets MVP | OSM Overpass seed + enrichissement organique | Gratuit, 8000 peaks dès J1, extensible |
| Résolution altitude | Tag `ele` OSM / IGN RGE Alti pour les nouveaux | Précision 1m sur territoire FR |
| Correction météo | Paramètre `elevation` Open-Meteo | Données corrigées à l'altitude réelle |
| Modèle de calcul | Grille pré-chargée 10 zones, cron 3h | 80 appels/jour vs 1500 — scalable à 5000+ users |
| Couverture temporelle | J à J+4 | Couvre "ce weekend" — cas d'usage réel |
| Recherche UX | pg_trgm fuzzy + géoloc + fallback Nominatim | Zéro écran vide, résultats contextuels |

### Note critique — Algorithme de score

**L'algorithme actuel dans `services/score.py` est insuffisant pour la montagne.**

Le problème central : `cloud_base` d'Open-Meteo est exprimé en AGL ou MSL ? Sans cette réponse, la comparaison avec `altitude_sommet` est potentiellement fausse sur tous les sommets. En terrain alpin, une erreur de repère altimétrique génère des prédictions systématiquement incorrectes.

**Action requise avant implémentation :**
Lancer `bmad-bmm-technical-research` sur l'algorithme de score — paramètres Open-Meteo exacts, formules LCL, conversion AGL↔MSL, types de nuages (stratus vs orographique), et définir l'algo V1 avec des bases physiquement correctes.

### Prochaines étapes recommandées

1. **Story Epic 3 — Recherche & Navigation** : Implémenter avec l'architecture décidée
   - Script seed OSM (`db/seed.py`) — import Overpass → DB peaks
   - Endpoint `GET /api/v1/peaks/search?q=&lat=&lng=` avec pg_trgm + tri distance
   - Enrichissement organique : Nominatim + IGN RGE Alti pour les points hors OSM
   - Hook mobile `usePeaks.ts` — autocomplete + état vide AsyncStorage

2. **Technical Research — Algorithme de score** : Avant tout développement de `services/score.py`
   - Paramètres exacts Open-Meteo pour la mer de nuage
   - Formules AGL↔MSL en terrain alpin
   - Définition algo V1 physiquement correct

3. **Cron météo (Epic Score)** : Service de pré-chargement grille 10 zones
   - Définition des 10 zones Alpes FR
   - Scheduler cron toutes les 3h
   - Structure Redis `weather:{zone}:{date}:{hour}` TTL 3h

