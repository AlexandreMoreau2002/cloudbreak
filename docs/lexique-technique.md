# Lexique technique — Cloudbreak

Tous les termes techniques utilisés dans le projet, expliqués simplement.

---

## Données géographiques

**OSM — OpenStreetMap**
Base de données géographique collaborative mondiale, open source. Tout le monde peut contribuer. C'est ce qu'utilisent Komoot, AllTrails, Maps.me. On s'en sert pour récupérer les sommets.

**Overpass API**
L'interface qui permet d'interroger OSM en lecture. On lui envoie une requête ("donne-moi tous les sommets nommés avec une altitude dans cette zone"), elle répond en JSON.

**Bounding box (bbox)**
Rectangle de coordonnées GPS qui délimite une zone géographique. Format Overpass : `(sud, ouest, nord, est)`. On découpe la France en 9 bounding boxes car une requête sur toute la France timeout.

**`ele`**
Tag OSM pour l'altitude ("elevation"). Un nœud OSM avec `ele=4807` est à 4807m. Beaucoup de viewpoints n'ont pas ce tag — c'est pour ça qu'on enrichit leur altitude via Open-Meteo.

**`natural=peak`**
Tag OSM qui identifie un sommet géographique (point culminant d'une montagne ou d'une crête).

**`natural=saddle`**
Tag OSM pour un col (passage entre deux versants). Différent d'un sommet.

**`mountain_pass`**
Autre tag OSM pour les cols routiers/historiques — Col du Galibier, Col de la Croix-Fry. Ces cols ne sont pas taggés `natural=peak` donc absents de notre requête principale → ajout manuel.

**`tourism=viewpoint`**
Tag OSM pour un point de vue aménagé (table d'orientation, belvédère…). Souvent sans tag `ele` dans OSM.

**Slug**
Version URL-safe d'un nom. `"Mont Blanc"` → `"mont-blanc"`. Sert d'identifiant texte stable et de clé de déduplication.

**UUID5**
Type d'UUID généré de façon déterministe à partir d'un texte. `uuid5("cloudbreak:peak:mont-blanc")` produit toujours le même UUID. Ça garantit que le même sommet a toujours le même ID, même si on régénère les données.

---

## Météo & algorithme

**hPa — hectopascal**
Unité de pression atmosphérique. Aussi utilisé pour désigner des altitudes approximatives : 925 hPa ≈ 800m, 850 hPa ≈ 1500m, 700 hPa ≈ 3000m.

**Cloud base (base des nuages)**
Altitude à laquelle commence la couche nuageuse. Si la cloud base est à 1200m et le sommet à 1800m, le sommet dépasse les nuages → mer de nuage possible.

**Cloud cover**
Pourcentage de couverture nuageuse (0% = ciel dégagé, 100% = couvert total). On s'intéresse au `cloud_cover_low` — les nuages bas dans les vallées.

**Inversion thermique**
Phénomène météo où l'air froid (lourd) reste coincé en bas et l'air chaud est au-dessus — l'inverse de la normale. C'est la condition physique principale d'une mer de nuage : les nuages sont piégés dans les vallées.

**Hard gate**
Condition bloquante dans l'algorithme. Si la cloud base est au-dessus du sommet → score = 0, sans calcul. Porte qui bloque tout le reste.

**Verdict**
Résultat qualitatif du score : `high` (≥ 70%), `medium` (40-69%), `low` (< 40%), `none` (hard gate déclenché).

**Open-Meteo**
API météo gratuite, sans clé, basée sur des données open-data européennes (Copernicus). On l'utilise pour deux choses : les données météo de l'algo de score, et l'API Elevation pour récupérer l'altitude des viewpoints OSM sans tag `ele`.

---

## Backend & base de données

**FastAPI**
Framework Python pour créer des APIs web. Rapide, typage strict, génère automatiquement une doc Swagger.

**SQLAlchemy**
ORM Python — permet d'écrire des requêtes base de données en Python plutôt qu'en SQL brut.

**Alembic**
Outil de migrations de base de données pour SQLAlchemy. Versionne les changements de schéma (ajout de table, d'index, de colonne…).

**Migration**
Script qui modifie le schéma de la base de données (créer une table, ajouter un index…). Versionnée et rejouable.

**Seed**
Script qui insère les données initiales en base au premier déploiement. `seed.py` lit `peaks_data.json` et insère les 22 397 sommets. Idempotent — peut être relancé sans créer de doublons.

**Idempotent**
Une opération qui peut être exécutée plusieurs fois sans changer le résultat. Notre seed vérifie si la table est déjà peuplée avant d'insérer.

**Index (base de données)**
Structure qui accélère les recherches. `idx_peaks_name` sur la colonne `name` permet de faire `WHERE name ILIKE '%Mont%'` rapidement sans scanner toute la table.

**ORM**
Object-Relational Mapping. Couche d'abstraction qui traduit les objets Python en lignes SQL et vice-versa.

**Redis**
Base de données clé-valeur ultra-rapide, en mémoire. On s'en sert pour deux choses : cache météo (TTL 10min) et quota freemium (1 check/jour par utilisateur).

**TTL — Time To Live**
Durée de vie d'une entrée en cache. Après le TTL, l'entrée est supprimée automatiquement. Notre cache météo Redis a un TTL de 10 minutes.

**JWT — JSON Web Token**
Token d'authentification signé. L'app mobile l'envoie à chaque requête dans le header `Authorization: Bearer {token}`. Le backend le vérifie localement sans appeler Supabase.

**JWKS — JSON Web Key Set**
Ensemble de clés publiques utilisées pour vérifier la signature des JWT. On récupère les clés de Supabase une fois et on les stocke en local pour valider les tokens sans appel réseau.

**Pydantic**
Bibliothèque Python de validation de données. Définit les schémas de requêtes et réponses de l'API.

**Gunicorn / Uvicorn**
Serveurs web Python. Uvicorn gère les connexions async, Gunicorn gère plusieurs workers en parallèle. Utilisés en prod dans Docker.

---

## Infrastructure & outils

**Docker / Docker Compose**
Docker isole une application dans un container (environnement reproductible). Docker Compose orchestre plusieurs containers ensemble — ici : api + db + redis.

**Supabase**
Plateforme d'authentification et de base de données (BaaS). On utilise uniquement la partie auth (gestion des utilisateurs, JWT).

**StoreKit 2**
Framework Apple natif pour les achats In-App sur iOS. Gère les abonnements, les reçus, les restaurations d'achat. On n'utilise pas Stripe.

**PostHog**
Outil d'analytics open source. Enregistre les événements utilisateurs (score consulté, conversion paywall…).

**Caddy**
Reverse proxy avec gestion automatique des certificats HTTPS (Let's Encrypt). Devant le backend FastAPI en production.

**VPS — Virtual Private Server**
Serveur dédié virtuel. On est chez OVH, Ubuntu 24.04. Tout tourne en Docker Compose.

**CI/CD — Continuous Integration / Continuous Deployment**
Pipeline automatique qui lance les tests à chaque push (CI) et peut déployer automatiquement (CD). On utilise GitHub Actions.

**Ruff**
Linter et formateur Python ultra-rapide. Vérifie la qualité et le style du code. Équivalent de ESLint pour Python.

**Mypy**
Vérificateur de types Python. S'assure que le code est cohérent au niveau des types (pas de `str` là où on attend un `int`, etc.).

**Coverage**
Pourcentage du code couvert par les tests. On vise 100% — chaque ligne de code source est exécutée par au moins un test.

---

## Mobile

**Expo / Expo Router**
Framework au-dessus de React Native qui simplifie le développement iOS/Android. Expo Router gère la navigation par système de fichiers (comme Next.js).

**AsyncState**
Pattern utilisé dans l'app pour gérer les états asynchrones : `idle` → `loading` → `success | error`.

**Metro**
Bundler JavaScript pour React Native. Compile et sert le code JS à l'app en développement.

**APNs — Apple Push Notification service**
Service Apple pour envoyer des notifications push sur iOS. Expo Push Notifications passe par APNs en production.
