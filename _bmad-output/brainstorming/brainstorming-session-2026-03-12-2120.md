---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Application mobile mer de nuage — features, modèle économique, go-to-market'
session_goals: 'Définir les features MVP, le modèle de monétisation et la stratégie de lancement pour aboutir à un PRD et un MVP solide et évolutif'
selected_approach: 'ai-recommended'
techniques_used: ['first-principles-thinking', 'scamper', 'resource-constraints']
ideas_generated: 9
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session — mer de nuage

**Facilitateur :** Alex
**Date :** 2026-03-13
**Durée estimée :** ~60 min

---

## Session Overview

**Topic :** Application mobile mer de nuage — features, modèle économique, go-to-market
**Goals :** Définir les features MVP, le modèle de monétisation et la stratégie de lancement pour aboutir à un PRD et un MVP solide et évolutif

**Contexte de départ :**
Alex pratique la montagne et a vécu la frustration de rater des mers de nuage aux Dolomites — parti sous un ciel gris en pensant que ça irait mieux, sans savoir que ce gris était précisément le signe que la mer de nuage était là, au-dessus. Aucune application n'a fait la traduction. C'est le problème exact que mer de nuage résout.

**Contraintes identifiées :**
- Budget minimal : serveur ~5-10€/mois + licences stores (Apple ~99€/an, Google ~25€ once)
- Solo dev
- Pas d'audience établie au lancement (croissance organique via stores)
- Objectif : revenus récurrents sans friction pour l'utilisateur

**Techniques utilisées :**
1. First Principles Thinking — déconstruire la vraie proposition de valeur
2. SCAMPER — générer les features par 7 angles systématiques
3. Resource Constraints — prioriser le MVP sous contrainte budget/temps

---

## Session Setup

### Profil utilisateur cible identifié

**Payeurs principaux — passionnés et pros :**
- Photographes paysage et créateurs drone qui ne peuvent pas se permettre un jour raté (perte de temps, d'opportunité, parfois de revenus)
- Randonneurs et alpinistes réguliers qui sortent en montagne 10-20+ fois par an
- Ces profils utilisent l'app fréquemment et voient la valeur immédiatement

**Utilisateurs gratuits — volume et croissance :**
- Randonneurs occasionnels (2-5 sorties/an)
- Vacanciers en montagne (comme Alex aux Dolomites)
- Ce segment représente le plus gros du trafic, alimente le SEO/ASO et convertit ponctuellement

---

## Technique Selection

**Approach :** AI-Recommended Techniques
**Analysis Context :** App mobile niche outdoor, solo dev, budget serré, objectif PRD + MVP

**Recommended Techniques :**

- **First Principles Thinking :** Déconstruire le vrai problème avant de lister des features — éviter de copier les apps météo existantes
- **SCAMPER :** Passer les 7 leviers (Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse) pour générer features et modèle éco de façon systématique
- **Resource Constraints :** Filtrer le MVP réel sous contrainte budget zéro et solo dev

---

## Technique Execution Results

### Phase 1 — First Principles Thinking

**Insight fondamental découvert :**

Le problème n'est pas le manque de données météo — c'est le manque de traduction. Les conditions idéales pour une mer de nuage ressemblent à une mauvaise journée météo (ciel gris, humidité élevée, inversion thermique). L'utilisateur interprète le gris comme "mauvais temps" et reste au chalet, alors que c'est précisément le signal qu'une mer de nuage se forme.

Les apps météo existantes (Windy, Meteoblue, Mountain Forecast) donnent des données brutes correctes mais ne font jamais cette traduction. L'utilisateur doit être météorologue pour comprendre.

**Proposition de valeur core (formulée en session) :**

> mer de nuage ne vend pas de la météo. Elle vend de la certitude émotionnelle : "lève-toi à 5h, ça vaut le coup" ou "reste au chalet aujourd'hui".

**Modèle mental retenu :**
- Waze et Citymapper ne donnent pas les données trafic brutes — ils donnent la conclusion + les données pour les curieux
- mer de nuage fait pareil : verdict d'abord, données en dessous pour rassurer

---

### Phase 2 — SCAMPER

#### S — Substitute (Remplacer)

Remplacer l'écran de données brutes (humidité 78%, vent 12km/h, nébulosité 60%) par un verdict visuel immédiat en 3 niveaux + détail accessible.

**Feature générée :** Verdict visuel 3 niveaux

#### C — Combine (Combiner)

Combiner la prédiction mer de nuage avec les horaires de lever/coucher de soleil — le combo mer de nuage + golden hour est le Saint Graal du photographe outdoor. L'app calcule la fenêtre temporelle exacte où les deux coïncident.

Combiner également avec un feed social de photos par sommet pour créer un growth loop organique.

**Features générées :** Fenêtre temporelle optimale + Feed social

#### A — Adapt (Adapter)

Recherche effectuée sur les avis réels des apps concurrentes (PeakVisor, Mountain Forecast, Windy, Meteoblue). Douleur principale identifiée : pas d'offline, les apps deviennent inutiles en montagne sans connexion.

**Feature générée :** Cache offline

Également identifié : les users veulent savoir si la prévision est stable ou instable — "est-ce que ça va changer d'ici demain ?"

**Feature générée :** Score de fiabilité de la prévision

#### M — Modify (Modifier)

Modifier l'affichage statique en timeline animée montrant l'altitude de la couche nuageuse sur 12-24h. Visuellement on voit quand la couche passe sous ou au-dessus du sommet.

**Feature générée :** Timeline visuelle altitude couche *(Backlog V2 — complexe à designer)*

#### P — Put to other use (Autres usages)

Guides de montagne (forment leur œil en formation, hésiteraient à faire confiance à une app inconnue) — pas prioritaire.
Offices de tourisme — éliminé (B2B trop complexe pour commencer).
Photographes pros — clients comme les autres, Stripe gère la facturation TVA nativement.

**Décision :** Rester 100% B2C, pas de B2B au lancement.

#### E — Eliminate (Éliminer)

Éliminer tout ce qui n'est pas lié à la question centrale : "Est-ce qu'il y aura une mer de nuage à mon spot ?"

Pas de radar pluie, pas d'UV, pas de carte météo interactive, pas de température ressentie en façade. Ces données restent accessibles dans le détail de prédiction pour les curieux, mais ne structurent pas l'expérience utilisateur.

**Décision de design :** L'app répond à une seule question. Les données météo sont la justification, pas le produit.

#### R — Reverse (Inverser)

Inverser le parcours utilisateur : au lieu que l'user cherche un sommet pour savoir s'il y a une mer de nuage, l'app lui dit proactivement où aller pour en voir une aujourd'hui ou demain dans sa région.

**Feature générée :** Mode découverte par région

---

### Phase 3 — Resource Constraints

**Contrainte appliquée :** Budget ~10€/mois, solo dev, objectif stores rapidement

**Insight clé :** Le MVP n'est pas "le moins de features possible" — c'est "les bonnes features, bien testées, déployées proprement". La priorité technique est une base solide avec tests automatisés pour détecter toute régression sur l'algo de score en 5 minutes.

**Rationale :** Une régression non détectée sur l'algo = des prédictions fausses envoyées à tous les users = perte de confiance irréparable au lancement.

---

## Idea Organization and Prioritization

### Thème 1 — Core Experience (le produit lui-même)

Ces features définissent ce qu'est mer de nuage. Sans elles, l'app n'existe pas.

**Feature #1 — Verdict visuel 3 niveaux**
- **Description complète :** Interface principale centrée sur un verdict immédiat en 3 niveaux : Peu probable / Probable / Très probable. Accompagné d'un pourcentage de probabilité (ex: 82%) et d'un indicateur visuel clair (couleur, icône, jauge). En dessous du verdict, le détail des variables météo qui ont conduit au résultat : altitude de la couche nuageuse, humidité, vitesse du vent, présence d'inversion thermique, pression. Chaque variable est présentée de façon lisible (icône + valeur + indicateur ✓/⚠/✗).
- **Pourquoi c'est MVP :** C'est la proposition de valeur core. Sans ça, l'app n'est pas différente d'une app météo classique.
- **Différenciateur :** Aucune app existante ne traduit les données météo en verdict actionnable spécifique à la mer de nuage.
- **Priorité :** MVP — indispensable

**Feature #2 — Fenêtre temporelle optimale + lever de soleil**
- **Description complète :** Au-delà du score à un instant T, l'app calcule et affiche la fenêtre de temps où les conditions sont optimales pour le sommet demandé. Cette fenêtre est croisée avec l'heure de lever et coucher de soleil pour identifier les moments où mer de nuage + golden hour coïncident. Exemple d'affichage : "Fenêtre idéale : 6h20 – 8h15 / Lever du soleil : 6h47". Pour un photographe ou un randonneur qui veut planifier son réveil, c'est l'information décisive.
- **Pourquoi c'est MVP :** C'est ce que l'utilisateur veut vraiment — pas juste "oui ou non" mais "à quelle heure exactement".
- **Différenciateur :** Le combo mer de nuage + golden hour n'existe nulle part. C'est le Saint Graal du photographe outdoor.
- **Priorité :** MVP — indispensable

**Feature #6 — Score de fiabilité de la prévision**
- **Description complète :** Indicateur de stabilité du modèle météo pour la prévision affichée. L'app indique si la prévision est stable depuis 24-48h (haute fiabilité) ou si le modèle météo est instable et a beaucoup changé récemment (faible fiabilité). Exemple : "Prévision stable depuis 36h ✓" vs "Modèle instable — revérifier demain ⚠". Cela répond à une douleur identifiée chez les users des apps concurrentes qui ne savent jamais si la prévision va changer.
- **Pourquoi c'est MVP :** Crée la confiance. Un user qui comprend l'incertitude est un user qui revient checker plutôt que de désinstaller après une prévision ratée.
- **Différenciateur :** Aucun concurrent ne communique l'incertitude du modèle de façon simple et honnête.
- **Priorité :** MVP — important

---

### Thème 2 — Engagement & Rétention (ce qui fait revenir)

Ces features transforment un outil ponctuel en app utilisée régulièrement.

**Feature #7 — Alertes intelligentes**
- **Description complète :** Notifications push proactives pour les utilisateurs payants, déclenchées par l'algorithme sans action de l'user. Deux types d'alertes :
  1. **Alerte régionale :** "Ce matin, mer de nuage visible dès 1600m dans ta région (Alpes du Nord)" — envoyée aux users ayant activé la localisation ou défini une région.
  2. **Alerte favoris :** "Ton spot Col de la Vanoise : conditions idéales prévues demain 6h-9h, probabilité 87%" — envoyée pour chaque sommet mis en favori par l'user.
  Les alertes sont configurables (fréquence, seuil de probabilité minimum pour être notifié, plages horaires).
- **Pourquoi c'est MVP :** C'est le vrai déclencheur d'usage régulier. L'app vient chercher l'user plutôt que l'user doit penser à ouvrir l'app. Différence entre un outil et une app indispensable.
- **Différenciateur :** Proactif et spécifique à la mer de nuage — les autres apps envoient des alertes météo génériques.
- **Priorité :** MVP — fort levier de rétention payante

**Feature #5 — Cache offline**
- **Description complète :** Avant de quitter une zone avec connexion (en voiture sur la route vers le départ de randonnée), l'app pré-télécharge automatiquement la prévision complète pour les sommets favoris de l'user et pour la zone géographique configurée. Ces données restent accessibles sans connexion pendant la durée de validité (ex: 6h). En montagne, la perte de signal est fréquente et prévisible — c'est précisément là qu'on a besoin de l'info.
- **Pourquoi c'est MVP :** Douleur réelle identifiée dans les avis users des apps concurrentes. Une app qui devient muette au moment où on en a le plus besoin est une app qu'on désinstalle.
- **Différenciateur :** Aucun concurrent ne gère l'offline correctement pour les apps météo montagne.
- **Priorité :** MVP — différenciateur fort

---

### Thème 3 — Data Flywheel (ce qui améliore le produit dans le temps)

Ces features créent une boucle vertueuse : plus d'users → plus de données → meilleur algorithme → plus d'users.

**Feature #4 — Validation terrain par GPS**
- **Description complète :** Quand l'app détecte (via GPS) que l'user arrive à proximité d'un sommet qu'il avait checké, elle envoie une notification : "Tu es à [sommet] ! La mer de nuage est visible ? 📸 [Oui] [Non] [Partager une photo]". La réponse de l'user est enregistrée comme donnée de validation réelle, comparée à la prévision faite. Ces données alimentent progressivement l'amélioration de l'algorithme (calibration par zone géographique, par altitude, par saison). La photo optionnelle alimente le feed social.
- **Pourquoi c'est MVP :** C'est un avantage concurrentiel à long terme. Au bout de 6 mois avec 500 users actifs, on a des milliers de points de validation réels qui permettent de calibrer le modèle au-delà de ce que les API météo seules peuvent fournir.
- **Différenciateur :** Aucun concurrent n'a ce data flywheel. C'est un fossé qui se creuse dans le temps.
- **Priorité :** MVP — investissement long terme, faible complexité d'implémentation initiale

---

### Thème 4 — Growth & Acquisition (ce qui ramène de nouveaux users)

Ces features génèrent de la croissance organique sans budget ads.

**Feature #3 — Feed social par sommet**
- **Description complète :** Chaque sommet dans l'app dispose d'un fil de photos publiques postées par les users au moment où ils étaient sur place, avec les conditions météo du moment affichées (score, altitude couche, heure). Un user qui cherche un sommet voit les dernières photos avec les conditions réelles — preuve sociale immédiate de la valeur de l'app. Les photos peuvent être partagées sur les réseaux sociaux depuis l'app, avec un watermark mer de nuage discret.
- **Pourquoi V2 :** Nécessite une modération, une infrastructure de stockage photos, et une masse critique d'users pour être intéressant. Trop tôt pour le MVP.
- **Growth loop :** User prend une photo magique → la poste dans l'app → d'autres voient → veulent la même chose → téléchargent → paient. Acquisition gratuite intégrée au produit.
- **Priorité :** V2 — fort potentiel de croissance organique

**Feature #9 — Mode découverte par région**
- **Description complète :** Second mode d'entrée dans l'app, complémentaire au mode "J'ai un spot précis". L'user sélectionne une région et une date (ou "ce weekend"), l'app retourne une liste des sommets au-dessus de la couche nuageuse, triés par probabilité et accessibilité (temps de marche, dénivelé, distance depuis sa position). Exemple : "Ce weekend dans les Alpes du Nord : 4 sommets au-dessus des nuages — Crêt de la Neige 1720m 91%, Colombier 1531m 78%..."
- **Pourquoi V2 :** Nécessite une base de données de sommets avec données d'accessibilité, et un algorithme de tri multi-critères. Complexité supplémentaire non prioritaire pour le MVP.
- **Deux modes d'usage :** Mode "J'ai un spot" (réponse à une intention précise) + Mode "Je cherche un spot" (planification flexible, voyages). Les deux coexistent.
- **Priorité :** V2 — fort potentiel viral (partage de spots découverts via l'app)

**Feature #8 — Timeline visuelle altitude couche nuageuse**
- **Description complète :** Visualisation animée ou interactive montrant l'évolution de l'altitude de la couche nuageuse sur 12-24h pour un sommet donné. Un curseur temporel permet de voir à quelle heure la couche passe sous ou au-dessus du sommet. Permet de comprendre visuellement la dynamique — pas juste un snapshot à un instant T mais le film de la journée.
- **Pourquoi V2 :** Design complexe à concevoir pour qu'il soit vraiment lisible sur mobile. Nécessite des maquettes et tests UX sérieux. Valeur certaine mais pas prioritaire au lancement.
- **Priorité :** V2 — nice-to-have différenciant

---

## Modèle Économique

### Structure Freemium

**Inspiré de PeakVisor** — l'user voit la valeur avant de payer, la frustration arrive naturellement au moment où il en a le plus besoin (planification active d'une sortie).

#### Gratuit — Découverte et acquisition

- **1 check par jour** par sommet (réinitialisation à minuit)
- **Score basique** : verdict 3 niveaux + pourcentage de probabilité
- **Détail météo** : variables visibles (altitude couche, humidité, vent, inversion)
- **1 sommet actif** à la fois (pas de favoris multiples)
- **Pas d'alertes** push
- **Pas d'offline**

**Objectif du gratuit :** Montrer la valeur, créer l'habitude, déclencher la frustration naturelle au moment de la planification (re-checker après avoir changé de sommet ou d'heure = payant).

#### Premium — 5€/mois

- **Checks illimités** par jour
- **Fenêtre temporelle optimale** + lever de soleil
- **Score de fiabilité** de la prévision
- **Favoris illimités** avec accès rapide
- **Alertes intelligentes** (régionales + par sommet favori, configurables)
- **Cache offline** (pré-téléchargement automatique avant départ)
- **Validation terrain GPS** (contribution au data flywheel)
- **Facturation Stripe** avec reçu TVA (pour les pros)

#### Pro Annuel — 45€/an (= 3,75€/mois)

- Toutes les features Premium
- Économie de 25% vs mensuel (psychologiquement attractif pour les passionnés)
- Idéal pour les photographes et randonneurs réguliers qui font le calcul

**Pourquoi ces tarifs :**
- 5€/mois = seuil psychologique acceptable pour un service niche et utile
- 45€/an = le passionné fait le calcul (3,75€/mois), voit l'économie, et paye en une fois → bon pour la trésorerie lors de campagnes
- L'écart 25% est le sweet spot classique pour orienter vers l'annuel sans forcer

### Codes Promo & Campagnes

Stripe gère nativement les codes promo et les périodes d'essai. Possibilité de :
- Codes promo pour campagnes ads ponctuelles (ex: -30% le weekend outdoor)
- Période d'essai 7 jours Premium sans CB (réduction friction)
- Codes partenaires (clubs de randonnée, associations photo outdoor)

### Projection réaliste

| Scénario | Users payants | Revenu mensuel | Revenu annuel |
|---|---|---|---|
| Conservateur | 100 | 400€ | 4 800€ |
| Réaliste | 500 | 2 000€ | 24 000€ |
| Optimiste | 1 000 | 4 000€ | 48 000€ |

Mix hypothétique : 70% mensuel, 30% annuel (annuel compte pour 9 mois de revenu mensuel équivalent).

---

## Stack Technique & Architecture

### Stack retenue

| Composant | Technologie | Raison |
|---|---|---|
| Mobile | React Native / Expo | Cross-platform iOS + Android, un seul codebase |
| Backend | FastAPI (Python) | Léger, rapide, idéal pour API de score météo |
| Base de données | PostgreSQL | Robuste, bien supporté, Supabase compatible |
| Auth | Supabase | Auth + DB managée, réduit la complexité |
| Paiement | Stripe | Standard du marché, gère abonnements + codes promo + TVA |
| Analytics | PostHog | Open source, self-hostable, RGPD-friendly |
| Cache météo | Redis (optionnel) | Cache 10 min par zone pour limiter les appels API météo |
| API météo | Weatherbit / Meteomatics / OpenWeather | À évaluer selon coût et précision altitude |
| CI/CD | GitHub Actions | Gratuit pour repos publics, intégration Expo native |

### Architecture

```
App mobile (Expo)
  ↓ HTTPS
Backend FastAPI
  ↓
Algorithme score mer de nuage
  ↓
Cache Redis (10 min par zone géo)
  ↓
API météo externe
  ↓
PostgreSQL (users, predictions, events, subscriptions)
```

**Pourquoi l'algo côté serveur :**
- Amélioration instantanée du modèle sans mise à jour de l'app
- Un seul modèle pour tous les users
- Possibilité d'itérations rapides
- Possibilité d'ajouter alertes et pré-calculs côté serveur

### Algorithme de score (heuristique V1)

```python
score = (
    0.4 * cloud_base_condition    # base_nuage < altitude_sommet → condition principale
  + 0.2 * humidity_score          # humidité > seuil favorable
  + 0.2 * wind_score              # vent faible = mer de nuage stable
  + 0.2 * inversion_score         # inversion thermique = condition clé
)
# score → probabilité % via fonction de conversion
```

Variables météo nécessaires par appel API :
- `cloud_base` — altitude de la base nuageuse (variable principale)
- `humidity` — humidité relative
- `wind_speed` — vitesse du vent
- `temperature_valley` — température en vallée
- `temperature_altitude` — température à l'altitude du sommet
- `pressure` — pression atmosphérique

**Évolution possible de l'algo :**
V1 : Heuristique pondérée (ci-dessus)
V2 : Régression logistique calibrée sur les données de validation terrain
V3 : Random forest / gradient boosting avec dataset suffisant

### Modèle de données clé

```
users
  - id, supabase_uid, email, created_at
  - subscription_status, subscription_tier

predictions
  - id, user_id, summit_id, requested_at
  - score, probability, cloud_base_altitude
  - optimal_window_start, optimal_window_end
  - reliability_score, weather_data_snapshot

summits
  - id, name, latitude, longitude, altitude
  - region, country

favorites
  - user_id, summit_id, alert_enabled, alert_threshold

terrain_validations
  - id, prediction_id, user_id, summit_id
  - validated_at, sea_of_clouds_present (bool)
  - photo_url (optional)

events (analytics)
  - id, user_id, event_name, timestamp, metadata

subscriptions
  - id, user_id, stripe_subscription_id
  - tier (monthly/annual), status, current_period_end
```

### Infrastructure serveur

Configuration minimale suffisante pour le MVP :
- 1 vCPU / 1-2 GB RAM / 20 GB SSD
- Coût : ~5-10€/mois (Hetzner, OVH, ou équivalent)
- Capacité : 5 000 – 20 000 users actifs avec caching correct
- Calcul du score : < 5ms CPU → charge très faible

---

## Stratégie QA & Foundation Technique

### Philosophie

> Une régression non détectée sur l'algo de score = des prédictions fausses envoyées à tous les users = perte de confiance irréparable. Les tests ne sont pas optionnels.

### Tests automatisés prioritaires

**Backend (pytest) :**
- Tests unitaires sur chaque composant du score (cloud_base_condition, humidity_score, wind_score, inversion_score)
- Tests d'intégration sur l'endpoint de prédiction complet
- Tests de régression : fixtures de conditions météo connues → résultat attendu fixe
- Tests de performance : temps de réponse < 200ms pour 95% des requêtes
- Tests de cache : validation que le cache météo fonctionne et expire correctement

**Mobile (Jest + Detox) :**
- Tests unitaires sur les composants de parsing et d'affichage
- Tests E2E sur les parcours critiques : check d'un sommet, souscription, alerte

**CI/CD (GitHub Actions) :**
- Sur chaque push : linter (ruff) + tests unitaires (< 2 min)
- Sur chaque PR : suite complète (< 5 min)
- Sur merge main : déploiement automatique
- Objectif : savoir en 5 minutes si une régression est introduite

### Outils

| Outil | Usage |
|---|---|
| pytest | Tests backend Python |
| ruff | Linter + formatter Python |
| Jest | Tests unitaires mobile |
| Detox | Tests E2E mobile |
| GitHub Actions | CI/CD pipeline |
| Alembic | Migrations DB |

---

## Stratégie Go-to-Market

### Phase 1 — Lancement organique (mois 1-3)

**ASO (App Store Optimization) :**
- Mots-clés ciblés : "mer de nuage", "cloud inversion forecast", "sea of clouds app", "météo montagne altitude", "prévision brume randonnée"
- Screenshots montrant des mers de nuage spectaculaires (haute émotion = fort CTR)
- Description centrée sur le bénéfice ("soyez sûr que ça vaut le lever à 5h") pas sur les features

**Métriques à tracker dès le lancement (PostHog) :**
- `app_opened`, `summit_searched`, `prediction_viewed`
- `trial_started`, `subscription_started`, `subscription_cancelled`
- `terrain_validation_submitted` (data flywheel)
- `alert_triggered`, `alert_opened`
- Funnel : install → premier check → trial → souscription

**Croissance organique prévue :**
- Reviews App Store (inciter les users satisfaits à noter)
- Partage de photos via Feature #3 (V2) avec watermark discret
- SEO via landing page dédiée par massif montagneux (Alpes, Pyrénées, Dolomites...)

### Phase 2 — Campagnes ponctuelles (mois 4+)

Si les métriques d'engagement sont positives :
- Codes promo sur communautés Reddit outdoor, forums randonnée, groupes Facebook photo montagne
- Partenariats avec créateurs YouTube/Instagram montagne (codes d'affiliation)
- Campagnes Meta Ads géociblées sur les zones montagneuses en période de saison

---

## Prioritization Results

### MVP — Ce qui sort dans les stores

| # | Feature | Complexité | Impact |
|---|---|---|---|
| 1 | Verdict visuel 3 niveaux + détail météo | Faible | Critique |
| 2 | Fenêtre temporelle optimale + lever soleil | Faible | Critique |
| 5 | Cache offline | Moyenne | Fort |
| 6 | Score de fiabilité de la prévision | Faible | Fort |
| 7 | Alertes intelligentes (favoris + région) | Moyenne | Fort (rétention) |
| 4 | Validation terrain GPS + photo | Faible | Moyen (long terme) |

### V2 — Après premiers retours users

| # | Feature | Raison du report |
|---|---|---|
| 3 | Feed social par sommet | Masse critique d'users nécessaire + modération |
| 9 | Mode découverte par région | DB sommets + algo tri multi-critères |
| 8 | Timeline visuelle altitude | Design complexe, nécessite maquettes UX |

---

## Session Summary and Insights

### Key Achievements

- **Proposition de valeur core cristallisée :** mer de nuage ne vend pas de la météo — elle traduit des conditions incompréhensibles en certitude émotionnelle actionnable
- **Modèle économique complet défini :** Freemium / 5€ mois / 45€ an avec codes promo Stripe
- **9 features générées** dont 6 MVP et 3 V2, toutes avec rationale clair
- **Différenciateurs identifiés :** validation terrain GPS (data flywheel), score fiabilité, offline, fenêtre golden hour
- **Stack technique arrêtée** avec justification pour chaque choix
- **Stratégie QA définie** : tests automatisés, CI/CD, détection régression < 5 min

### Session Reflections

**Ce qui a émergé de façon inattendue :**
- La validation terrain GPS est un avantage concurrentiel massif à long terme — le produit s'améliore tout seul avec l'usage
- Le mode offline est une douleur réelle identifiée dans les reviews concurrents, pas initialement dans le brief
- La frustration aux Dolomites (temps gris = rester au chalet alors que la mer de nuage était là) est le pitch parfait pour les campagnes marketing — une histoire vraie, émotionnelle, universelle

**Décisions clés prises :**
- 100% B2C, pas de B2B au lancement
- Tarification simple : gratuit / 5€/mois / 45€/an
- L'algo reste côté serveur pour itérations rapides
- Tests automatisés non négociables — qualité before speed

### Prochaine étape recommandée

Créer le PRD (Product Requirements Document) à partir de cette session en utilisant le skill `bmad-bmm-create-prd`.
