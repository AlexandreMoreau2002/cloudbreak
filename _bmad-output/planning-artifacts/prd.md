---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-03-12-2120.md']
classification:
  projectType: 'mobile_app'
  domain: 'outdoor_decision_making'
  complexity: 'moyenne-haute'
  projectContext: 'greenfield'
  keyInsights:
    - 'Transparence sur incertitude = philosophie core du produit'
    - 'Langage humain prioritaire sur précision technique partout'
    - 'Monitoring algo (prévision vs réalité terrain) = MVP pas V2'
    - 'Gestion émotionnelle de la déception = enjeu UX central'
workflowType: 'prd'
---

# Product Requirements Document — Cloudbreak

**Auteur :** Alex
**Date :** 2026-03-13

---

## Résumé Exécutif

**Cloudbreak** traduit des données météo complexes en verdict actionnable sur la probabilité d'observer une mer de nuage depuis un sommet donné, à une date et heure précises. Cible : randonneurs, photographes paysage, créateurs drone et alpinistes qui planifient des sorties montagne et veulent savoir — sans être météorologues — si ça vaut le coup de se lever à 5h du matin.

**Problème central :** les conditions idéales pour une mer de nuage ressemblent à une mauvaise journée météo (ciel gris, forte humidité, inversion thermique). Les apps existantes donnent des données brutes correctes mais ne font jamais cette traduction. L'utilisateur interprète lui-même — et se trompe. Cloudbreak remplace cette interprétation par un verdict humain clair, honnête sur l'incertitude, et actionnable immédiatement.

**Proposition de valeur :** l'app répond à une seule question — "Est-ce qu'il y aura une mer de nuage à mon spot ?" — avec un verdict en langage humain (🟢 "Lève-toi tôt !" / 🟡 "Ça peut le faire" / 🔴 "Pas ce coup-ci"), une fenêtre temporelle optimale croisée avec le lever de soleil, et un indicateur de stabilité ("Prévision stable depuis 36h ✓" vs "À reconfirmer ce soir ⚠"). La transparence sur l'incertitude est la philosophie core du produit — pas une excuse.

**Différenciateur long terme :** data flywheel intégré — les utilisateurs valident les prévisions sur le terrain via GPS, ces données calibrent l'algorithme progressivement. Plus il y a d'utilisateurs, plus le modèle devient précis. Aucun concurrent n'a ce mécanisme.

---

## Classification du Projet

Ce tableau positionne le projet dans son contexte technique et stratégique — il oriente les décisions d'architecture et de process downstream.

| Critère | Valeur |
|---|---|
| **Type** | Application mobile iOS (Expo/React Native), Android en V2 |
| **Domaine** | Outdoor decision-making sous incertitude météo |
| **Complexité** | Moyenne-haute (chaîne API météo externe + algo évolutif + confiance utilisateur critique) |
| **Contexte** | Greenfield — projet construit de zéro, solo dev |

---

## Critères de Succès

### Succès Utilisateur

- L'utilisateur obtient un verdict lisible en moins de 3 secondes, sans interpréter de données brutes
- L'app devient un réflexe avant chaque sortie montagne — pas un outil ponctuel
- L'utilisateur partage sa validation terrain (photo + oui/non) — signe d'engagement actif et de confiance
- Note App Store ≥ 4.5 étoiles dans les 6 premiers mois
- Taux de rétention abonnement mensuel > 70% à 3 mois
- NPS > 50

### Succès Business

**Contrainte saisonnalité :** les mers de nuage sont rares en été dans les Alpes. Saison active estimée à ~6 mois/an (automne → début printemps). Palliatif MVP : message contextuel utile hors-saison ("Pas de mer de nuage — mais beau temps au-dessus de 1800m 🌤"). Levier anti-churn : pousser l'abonnement annuel 45€ pendant la saison haute pour sécuriser du cash sur la morte saison.

| Horizon | Cible |
|---|---|
| Mois 1 | 30 téléchargements, 5 users en trial Premium |
| Mois 3 | 20-30 users payants actifs, 0 churn involontaire (bugs) |
| Mois 6 | 80-100 users payants, ~350€/mois de MRR |
| Mois 12 | 150-200 users payants (mix mensuel/annuel), ~700€/mois de MRR |

À 150 payants × 5€/mois = ~750€/mois soit ~9 000€/an pour ~10€/mois de charges — rentable et sain pour un side project solo.

**Indicateurs clés :** conversion gratuit → trial > 15% | conversion trial → payant > 40% | MRR croissant en saison active | CAC ≈ 0€ (croissance 100% organique)

### Succès Technique

- Temps de réponse API score < 500ms (95e percentile) — voir NFR1
- Disponibilité backend ≥ 99% — voir NFR5
- Zéro bug critique non détecté en production
- Pipeline CI/CD : détection de régression < 5 min sur chaque push — voir NFR8
- Conformité App Store Apple dès le lancement

### Outcomes Mesurables

- **Fiabilité algo :** taux de validation terrain positive > 65% sur les prévisions 🟢
- **Engagement :** utilisateur moyen ouvre l'app 3+ fois/mois en saison active
- **Data flywheel :** 100+ validations terrain dans les 6 premiers mois
- **ASO :** top 10 sur "mer de nuage" et "sea of clouds forecast" dans les stores

---

## Périmètre & Phases

### MVP — Revenue MVP (Phase 1)

**Philosophie :** valider que le modèle économique fonctionne avant d'investir davantage. L'app génère ses premiers euros dans les 3 premiers mois. Chaque feature justifie son coût de dev par la valeur utilisateur ou business générée.

**Journeys supportés :** Sophie (photographe, succès) · Marc (randonneur, conversion) · Alex (ops, monitoring) · Thomas (hors-saison, rétention)

| Feature MVP | Justification |
|---|---|
| Verdict visuel 3 niveaux 🟢🟡🔴 | Sans ça, l'app n'existe pas |
| Détail variables météo sous le verdict | Transparence = confiance |
| Fenêtre temporelle optimale + lever soleil | Différenciateur core |
| Message contextuel hors-saison | Anti-churn estival |
| Score de stabilité de la prévision | Philosophie produit |
| Cache offline-light (TTL 2-3h) | UX dégradée acceptable sans réseau |
| Alertes push intelligentes (payants) | Rétention = revenus récurrents |
| Validation terrain GPS + notif | Data flywheel — faible coût dev |
| Freemium + StoreKit 2 | Monétisation = raison d'être du MVP |
| Auth Supabase | Identité user = base de tout |
| Analytics PostHog (events business) | Stats conversion + funnel = décisions |
| Alertes ops BetterStack free | Dodo tranquille — non négociable |

**Monitoring MVP :** BetterStack free (alertes downtime → SMS/email Alex) + PostHog (conversions, churns, checks) + logs FastAPI (erreurs 5xx). Dashboard avancé → post-lancement.

**Risque ressources :** si le temps manque, premier cut sur les alertes régionales (garder alertes favoris) et sur la confirmation terrain (garder la notif, supprimer la confirmation). Verdict + freemium + StoreKit sont intouchables.

### V2 — Growth (Phase 2)

- **Anonymisation compte à la suppression** : remplacer le hard delete actuel par un soft delete anonymisé (email → `deleted@deleted.com`, user_id remplacé par hash dans toutes les tables liées) pour conserver les métriques de churn (durée avant suppression, plan au moment du départ, etc.) tout en restant conforme RGPD — à implémenter quand les tables `predictions` et `terrain_validations` seront créées
- Feed social par sommet (photos + conditions)
- Mode découverte par région ("4 sommets au-dessus des nuages ce weekend")
- Timeline visuelle altitude de la couche sur 12-24h
- Résumé météo général enrichi hors-saison
- Amélioration algo par régression logistique sur données terrain
- Android
- Dashboard monitoring évolué + stats business visuelles
- **Contribution utilisateur de spots** : l'user soumet coordonnées GPS + nom depuis l'app → LLM (Claude Haiku) normalise (slug, capitalisation, déduplication probable) → altitude via Open-Meteo Elevation → insertion en DB avec modération légère
- **Cron mensuel de sync OSM** : relancer `generate_peaks.py` automatiquement 1x/mois pour récupérer les nouveaux sommets/viewpoints ajoutés dans OpenStreetMap et mettre à jour `peaks_data.json`
- **Refonte visuelle FavoritesGrid** : la grille de favoris sur l'écran d'accueil (état vide et avec sommet) est fonctionnelle mais minimaliste — remplacer par un design plus riche (score du jour visible sur chaque carte, score coloré, massif affiché, style cohérent avec la ScoreCard) aligné sur la proposition Claude Design

### Vision (Phase 3)

- Modèle prédictif avancé (random forest / gradient boosting) calibré sur dataset terrain
- API publique pour intégrations tierces
- Partenariats créateurs outdoor / clubs alpinisme
- Internationalisation (Pyrénées, Dolomites, Alpes suisses)

---

## Parcours Utilisateurs

### Journey 1 — Sophie, photographe paysage (parcours succès)

Sophie a 34 ans, elle shoote des levers de soleil en montagne. Elle a déjà raté 3 matins cet automne — levée à 4h30, 1h de route, rien. La veille au soir elle ouvre Cloudbreak, cherche le Col de la Croix-Fry. L'app : **"Lève-toi tôt 🟢 — 87% — Prévision stable depuis 48h"**. Fenêtre optimale : 6h40–8h15, lever du soleil à 7h02. Réveil à 5h30.

Au sommet à 6h50, la mer de nuage est là. En redescendant, notif GPS : *"Tu étais au Col de la Croix-Fry — mer de nuage visible ? 📸"*. Elle confirme oui, poste une photo. Elle renouvelle son abonnement annuel sans hésiter.

**Capabilities :** recherche sommet, verdict + score stabilité, fenêtre + lever soleil, cache offline, validation terrain GPS, abonnement annuel.

---

### Journey 2 — Marc, randonneur occasionnel (frustration → conversion)

Marc part en vacances dans les Vosges. Il checke le Champ du Feu — **"Ça peut le faire 🟡 — 61%"**. Il monte. Pas de mer de nuage, mais vue dégagée. L'app lui a dit la vérité : 61% c'est pas une certitude. Le lendemain il veut rechecke. Message : *"Tu as utilisé ton check quotidien — passe en Premium pour des vérifications illimitées"*. Il paye 5€. Il est en vacances, ça vaut le coup.

**Capabilities :** limite gratuit 1 check/jour, paywall naturel au moment de besoin, paiement rapide.

---

### Journey 3 — Alex, administrateur (parcours ops)

3h du matin. L'API Weatherbit tombe. En 2 minutes, alerte BetterStack : *"Service météo indisponible — backend Cloudbreak dégradé"*. Les users voient "Service momentanément indisponible — nos équipes sont sur le coup". Le cache offline protège ceux qui ont leur prévision en cache. Fix poussé, CI/CD valide en 4 minutes. Aucun avis négatif.

**Capabilities :** monitoring temps réel, alertes SMS/push admin, message dégradé gracieux, cache offline, CI/CD rapide.

---

### Journey 4 — Thomas, alpiniste passionné (hors-saison)

Juillet. Thomas checke le Mont Blanc. L'app : **"Pas de mer de nuage prévue — mais ciel parfaitement dégagé au-dessus de 2400m ☀️ — Conditions idéales pour l'ascension"**. Pas ce qu'il cherchait, mais l'info est utile. Il ne désinstalle pas. Il reviendra en octobre.

**Capabilities :** message contextuel hors-saison, rétention estivale, utilité maintenue sans mer de nuage.

---

### Synthèse des Capabilities par Journey

| Capability | J1 | J2 | J3 | J4 |
|---|---|---|---|---|
| Recherche sommet + verdict | ✓ | ✓ | — | ✓ |
| Score stabilité + fenêtre temporelle | ✓ | ✓ | — | — |
| Limite gratuit + paywall | — | ✓ | — | — |
| Cache offline | ✓ | — | ✓ | — |
| Validation terrain GPS | ✓ | — | — | — |
| Alertes push favoris | ✓ | — | — | — |
| Monitoring admin + alertes | — | — | ✓ | — |
| Message contextuel hors-saison | — | — | — | ✓ |
| Paiement StoreKit (mensuel + annuel) | ✓ | ✓ | — | — |

---

## Exigences Domaine & Conformité

### Décisions MVP Structurantes

- **Plateforme MVP : iOS uniquement** — Android reporté en V2. Une seule conformité store à gérer au lancement.
- **API météo MVP : tier gratuit** — OpenWeather free tier ou Weatherbit free. Migration vers provider payant si le volume le justifie.

### Conformité App Store Apple

- Abonnements in-app via **StoreKit 2 obligatoire** — pas de Stripe seul sur iOS. Commission Apple : 30% an 1, 15% ensuite. Sur 5€/mois → 0,75€ à 1,50€ de commission à intégrer dans la marge.
- Guideline 4.2 (Minimum Functionality) : positionner l'app comme outil météo spécialisé avec algo propriétaire, pas un wrapper d'API.
- Labels de confidentialité App Store à remplir avant soumission (localisation, données d'utilisation).

### RGPD & Privacy

- Consentement explicite géolocalisation au premier lancement — refus possible sans blocage de l'app.
- Politique de confidentialité sur URL publique avant soumission stores.
- Droit à l'effacement : endpoint DELETE user data dans l'API dès le MVP.
- Hébergement Supabase région EU (Frankfurt) — pas de transfert hors UE.

### Limitations Connues de la Prédiction

- La variable `cloud_base` est peu précise en zone montagneuse complexe avec les providers gratuits.
- L'algo ne sera jamais à 100% — cible 65% de validation terrain positive réaliste mais ambitieuse.
- Mitigation : score de stabilité de la prévision + philosophie transparence sur l'incertitude.
- Risque : tester 2-3 providers gratuits avant lancement, comparer avec validations terrain manuelles en bêta.

---

## Innovation & Différenciation

### Innovations Identifiées

**Innovation 1 — Data flywheel terrain (différenciateur long terme)**
Aucune app météo outdoor ne collecte de retours utilisateurs géolocalisés pour calibrer son algorithme. Cloudbreak crée une boucle vertueuse : plus d'users → plus de validations terrain → algo plus précis → plus d'users. Avantage concurrentiel difficile à copier sans base d'utilisateurs existante. Bootstrap : seeding manuel par Alex pendant la bêta.

**Innovation 2 — Nouvelle catégorie : outdoor decision app**
Le marché a des apps météo (données brutes) et des apps rando (itinéraires). Cloudbreak crée une troisième catégorie : app de décision spécialisée — "je te dis si ça vaut le coup de te lever à 5h". Validation : reviews stores et NPS. Si les users décrivent Cloudbreak comme "enfin une app qui me dit si ça vaut le coup" → catégorie bien comprise.

**Innovation 3 — Fenêtre temporelle + golden hour**
Croiser l'altitude de la couche nuageuse avec les horaires astronomiques pour calculer la fenêtre optimale. Techniquement simple, inexistant comme feature dédiée sur le marché. Validation : taux d'ouverture des notifications fenêtre vs hors fenêtre.

### Paysage Concurrentiel

- **PeakVisor** : identification sommets AR + météo basique. Pas de prédiction mer de nuage.
- **Windy / Meteoblue** : données météo pro, aucune traduction en verdict mer de nuage.
- **Mountain Forecast** : prévisions par altitude, pas de focus mer de nuage, interface datée.
- **Aucun concurrent direct** sur la niche "probabilité mer de nuage".

---

## Exigences Mobile & Plateforme

### Plateforme & Distribution

- **iOS minimum :** iOS 16+ (~95% des devices actifs)
- **Distribution :** App Store uniquement au lancement, Expo EAS Build
- **Framework :** Expo / React Native — codebase unique pour l'extension Android V2
- **Abonnements :** StoreKit 2 (iOS In-App Purchase)
- **Deep links :** format `cloudbreak.app/sommet/[slug]` pour partage de prévisions (iOS Universal Links)

### Permissions Device

| Permission | Usage | Obligatoire |
|---|---|---|
| Localisation (when in use) | Validation terrain GPS au sommet | Non — refus sans blocage |
| Notifications push | Alertes favoris + validation terrain | Non — refus sans blocage |
| Réseau | Appels API météo + backend | Oui |

Pas d'accès galerie photo — l'utilisateur prend sa photo avec l'appareil natif iOS et la partage ensuite dans l'app.

### Stratégie Offline-Light

- Cache de la dernière prévision consultée par sommet (TTL 2-3h)
- Réseau disponible → appel API systématique pour données fraîches
- Réseau absent + cache valide → affichage avec bandeau "Données du [heure] — connexion requise pour actualiser"
- Réseau absent + cache expiré → "Données non disponibles, connexion requise"
- Pas de pré-téléchargement proactif — données météo recalculées ~toutes les 6h

### Notifications Push

- **Alertes favoris (payants) :** "Conditions idéales prévues demain 6h sur [sommet] — 87% 🟢"
- **Alertes régionales (payants) :** "Mer de nuage visible dès 1600m dans ta région ce matin"
- **Validation terrain :** notif GPS à l'arrivée au sommet checké — "Tu es au [sommet] ! Mer de nuage visible ? 📸"
- Toutes les notifications sont optionnelles et configurables indépendamment

---

## Exigences Fonctionnelles

### Prévision & Score mer de nuage

- FR1 : L'utilisateur peut consulter le verdict probabiliste (🟢 / 🟡 / 🔴) d'un sommet pour une date et heure données
- FR2 : L'utilisateur peut voir le score numérique de probabilité associé au verdict (ex: "87%")
- FR3 : L'utilisateur peut voir le détail des variables météo qui fondent le score (cloud_base, humidité, vent, inversion thermique)
- FR4 : L'utilisateur peut voir la fenêtre temporelle optimale de visibilité pour la journée sélectionnée
- FR5 : L'utilisateur peut voir l'heure de lever du soleil croisée avec la fenêtre optimale
- FR6 : L'utilisateur peut voir un indicateur de stabilité de la prévision ("Prévision stable depuis 48h ✓" / "À reconfirmer ce soir ⚠")
- FR7 : L'utilisateur reçoit un message contextuel utile quand les conditions sont défavorables à la mer de nuage

### Recherche & Navigation

- FR8 : L'utilisateur peut rechercher un sommet ou point de vue par nom
- FR9 : L'utilisateur peut accéder à un sommet depuis sa liste de favoris
- FR10 : L'utilisateur peut ajouter un sommet à ses favoris
- FR11 : L'utilisateur peut partager une prévision via un deep link

### Compte Utilisateur & Authentification

- FR12 : L'utilisateur peut créer un compte et s'authentifier
- FR13 : L'utilisateur peut supprimer ses données personnelles (droit à l'effacement RGPD)
- FR14 : L'utilisateur peut gérer ses préférences de notifications
- FR15 : L'utilisateur peut accorder ou refuser la géolocalisation sans blocage de l'app

### Freemium & Monétisation

- FR16 : L'utilisateur non-payant peut effectuer 1 consultation de score par jour
- FR17 : L'utilisateur voit un paywall naturel au 2e check quotidien avec message de conversion
- FR18 : L'utilisateur peut s'abonner en Premium mensuel (5€/mois) via StoreKit 2
- FR19 : L'utilisateur peut s'abonner en Pro annuel (45€/an) via StoreKit 2
- FR20 : L'utilisateur Premium/Pro peut effectuer des consultations illimitées
- FR21 : L'utilisateur peut démarrer une période d'essai gratuit avant de s'abonner

### Notifications & Alertes

- FR22 : L'utilisateur Premium/Pro reçoit des alertes push proactives sur ses sommets favoris quand les conditions sont idéales
- FR23 : L'utilisateur Premium/Pro reçoit des alertes push régionales quand une mer de nuage est prévue dans sa région
- FR24 : L'utilisateur reçoit une notification GPS à l'arrivée à proximité d'un sommet consulté
- FR25 : L'utilisateur peut configurer ou désactiver chaque type de notification indépendamment

### Validation Terrain & Data Flywheel

- FR26 : L'utilisateur peut confirmer ou infirmer la prévision depuis le terrain (oui/non)
- FR27 : L'utilisateur peut joindre une photo optionnelle à sa validation terrain
- FR28 : Le système enregistre les validations terrain avec métadonnées GPS et horodatage
- FR29 : Le système calcule le taux de précision de l'algorithme par zone à partir des validations terrain

### Mode Offline-Light

- FR30 : L'application affiche la dernière prévision consultée si la connexion est indisponible (TTL 2-3h)
- FR31 : L'application indique l'âge des données affichées quand le réseau est absent
- FR32 : L'application affiche un message d'indisponibilité clair si les données sont expirées et le réseau absent

### Onboarding

- FR33 : L'utilisateur complète le parcours d'onboarding (problème des Dolomites → solution → permissions) au premier lancement
- FR34 : L'utilisateur est invité à accorder les permissions pendant l'onboarding, avec refus possible sans blocage

### Monitoring & Opérations

- FR35 : L'administrateur reçoit une alerte immédiate (SMS/email/push) si le backend ou l'API météo est indisponible
- FR36 : L'administrateur peut consulter les métriques serveur basiques (CPU, RAM, erreurs API, temps de réponse)
- FR37 : L'administrateur peut consulter les événements business clés via PostHog (conversions, churns, checks)
- FR38 : L'application affiche un message dégradé gracieux aux utilisateurs lors d'une indisponibilité du service

---

## Exigences Non-Fonctionnelles

### Performance

- NFR1 : Score de prévision retourné en < 500ms pour 95% des requêtes (mesuré côté backend)
- NFR2 : Interface affiche le verdict en < 3 secondes depuis le tap utilisateur (réseau 4G/WiFi standard)
- NFR3 : Cache offline chargé en < 100ms — pas d'appel réseau
- NFR4 : Consommation mémoire ≤ 50MB en utilisation normale

### Fiabilité & Disponibilité

- NFR5 : Disponibilité backend ≥ 99% (~7h de downtime/mois maximum)
- NFR6 : Indisponibilité API météo externe → message dégradé gracieux, pas de crash app
- NFR7 : Alertes de monitoring déclenchées en < 2 minutes après détection d'indisponibilité
- NFR8 : Pipeline CI/CD détecte les régressions en < 5 minutes sur chaque push

### Sécurité & Conformité

- NFR9 : Toutes les données en transit chiffrées via HTTPS/TLS
- NFR10 : Données utilisateur hébergées en EU (Supabase Frankfurt) — conformité RGPD
- NFR11 : Consentement géolocalisation explicite, granulaire et révocable
- NFR12 : Paiements traités exclusivement via StoreKit 2 — aucun numéro de carte stocké
- NFR13 : Endpoint DELETE user data disponible dès le MVP
- NFR14 : Politique de confidentialité publiée sur URL publique avant soumission stores

### Scalabilité

- NFR15 : Architecture supporte 1 000 utilisateurs actifs sans modification (MVP) et 10 000 sans refonte majeure (V2)
- NFR16 : Cache météo TTL 10 min par zone protège contre les pics de requêtes et les quotas API
- NFR17 : Le composant d'abstraction provider météo permet de switcher de provider sans modifier l'algorithme de score

### Intégration

- NFR18 : App compatible iOS 16+ (~95% des devices actifs)
- NFR19 : Intégration API météo abstraite — provider remplaçable sans impact sur le score
- NFR20 : Deep links compatibles iOS Universal Links

### Maintenabilité

- NFR21 : Algorithme de score côté serveur uniquement — modifications sans mise à jour de l'app
- NFR22 : Tests de régression couvrent les cas critiques de l'algo (cloud_base, inversion thermique, seuils)
- NFR23 : Logs d'erreurs structurés — tout 5xx enregistré avec contexte suffisant pour diagnostiquer

### Internationalisation & Extensibilité

- NFR24 : Toutes les chaînes UI externalisées en fichiers de traduction (`react-i18next` ou équivalent) — aucune string hardcodée dans les composants
- NFR25 : Français au MVP, architecture i18n prête pour EN, DE, IT sans refonte (V2)
- NFR26 : Système de styles basé sur design tokens (couleurs, typographie, espacements) — support dark mode natif iOS sans refonte
- NFR27 : Feature flags pour activer/désactiver une feature sans redéploiement
- NFR28 : Devices cibles MVP : iPhone SE 2e gen (375pt) · iPhone 14 (390pt) · iPhone 14 Pro Max (430pt) — couvre ~90% des iPhones actifs
- NFR29 : Aucun texte UI ne se tronque ou déborde sur les 3 tailles cibles en français
- NFR30 : QA teste les textes longs : noms de sommets > 25 caractères, messages d'erreur, labels avec traductions +30% vs FR
