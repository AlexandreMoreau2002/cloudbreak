---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: "2026-03-17"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Cloudbreak - Epic Breakdown

## Overview

Ce document fournit le découpage complet en epics et stories pour **Cloudbreak**, décomposant les exigences du PRD, du Design UX et de l'Architecture en stories implémentables.

---

## Requirements Inventory

### Functional Requirements

FR1 : L'utilisateur peut consulter le verdict probabiliste (🟢 / 🟡 / 🔴) d'un sommet pour une date et heure données
FR2 : L'utilisateur peut voir le score numérique de probabilité associé au verdict (ex: "87%")
FR3 : L'utilisateur peut voir le détail des variables météo qui fondent le score (cloud_base, humidité, vent, inversion thermique)
FR4 : L'utilisateur peut voir la fenêtre temporelle optimale de visibilité pour la journée sélectionnée
FR5 : L'utilisateur peut voir l'heure de lever du soleil croisée avec la fenêtre optimale
FR6 : L'utilisateur peut voir un indicateur de stabilité de la prévision ("Prévision stable depuis 48h ✓" / "À reconfirmer ce soir ⚠")
FR7 : L'utilisateur reçoit un message contextuel utile quand les conditions sont défavorables à la mer de nuage
FR8 : L'utilisateur peut rechercher un sommet ou point de vue par nom
FR9 : L'utilisateur peut accéder à un sommet depuis sa liste de favoris
FR10 : L'utilisateur peut ajouter un sommet à ses favoris
FR11 : L'utilisateur peut partager une prévision via un deep link
FR12 : L'utilisateur peut créer un compte et s'authentifier
FR13 : L'utilisateur peut supprimer ses données personnelles (droit à l'effacement RGPD)
FR14 : L'utilisateur peut gérer ses préférences de notifications
FR15 : L'utilisateur peut accorder ou refuser la géolocalisation sans blocage de l'app
FR16 : L'utilisateur non-payant peut effectuer 1 consultation de score par jour
FR17 : L'utilisateur voit un paywall naturel au 2e check quotidien avec message de conversion
FR18 : L'utilisateur peut s'abonner en Premium mensuel (5€/mois) via StoreKit 2
FR19 : L'utilisateur peut s'abonner en Premium annuel (45€/an) via StoreKit 2
FR20 : L'utilisateur Premium peut effectuer des consultations illimitées
FR21 : L'utilisateur peut démarrer une période d'essai gratuit avant de s'abonner
FR22 : L'utilisateur Premium reçoit des alertes push proactives sur ses sommets favoris quand les conditions sont idéales
FR23 : L'utilisateur Premium reçoit des alertes push régionales quand une mer de nuage est prévue dans sa région
FR24 : L'utilisateur reçoit une notification GPS à l'arrivée à proximité d'un sommet consulté
FR25 : L'utilisateur peut configurer ou désactiver chaque type de notification indépendamment
FR26 : L'utilisateur peut confirmer ou infirmer la prévision depuis le terrain (oui/non)
FR27 : L'utilisateur peut joindre une photo optionnelle à sa validation terrain
FR28 : Le système enregistre les validations terrain avec métadonnées GPS et horodatage
FR29 : Le système calcule le taux de précision de l'algorithme par zone à partir des validations terrain
FR30 : L'application affiche la dernière prévision consultée si la connexion est indisponible (TTL 2-3h)
FR31 : L'application indique l'âge des données affichées quand le réseau est absent
FR32 : L'application affiche un message d'indisponibilité clair si les données sont expirées et le réseau absent
FR33 : L'utilisateur complète le parcours d'onboarding (problème des Dolomites → solution → permissions) au premier lancement
FR34 : L'utilisateur est invité à accorder les permissions pendant l'onboarding, avec refus possible sans blocage
FR35 : L'administrateur reçoit une alerte immédiate (SMS/email/push) si le backend ou l'API météo est indisponible
FR36 : L'administrateur peut consulter les métriques serveur basiques (CPU, RAM, erreurs API, temps de réponse)
FR37 : L'administrateur peut consulter les événements business clés via PostHog (conversions, churns, checks)
FR38 : L'application affiche un message dégradé gracieux aux utilisateurs lors d'une indisponibilité du service

### NonFunctional Requirements

NFR1 : Score de prévision retourné en < 500ms pour 95% des requêtes (mesuré côté backend)
NFR2 : Interface affiche le verdict en < 3 secondes depuis le tap utilisateur (réseau 4G/WiFi standard)
NFR3 : Cache offline chargé en < 100ms — pas d'appel réseau
NFR4 : Consommation mémoire ≤ 50MB en utilisation normale
NFR5 : Disponibilité backend ≥ 99% (~7h de downtime/mois maximum)
NFR6 : Indisponibilité API météo externe → message dégradé gracieux, pas de crash app
NFR7 : Alertes de monitoring déclenchées en < 2 minutes après détection d'indisponibilité
NFR8 : Pipeline CI/CD détecte les régressions en < 5 minutes sur chaque push
NFR9 : Toutes les données en transit chiffrées via HTTPS/TLS
NFR10 : Données utilisateur hébergées en EU (Supabase Frankfurt) — conformité RGPD
NFR11 : Consentement géolocalisation explicite, granulaire et révocable
NFR12 : Paiements traités exclusivement via StoreKit 2 — aucun numéro de carte stocké
NFR13 : Endpoint DELETE user data disponible dès le MVP
NFR14 : Politique de confidentialité publiée sur URL publique avant soumission stores
NFR15 : Architecture supporte 1 000 utilisateurs actifs sans modification (MVP) et 10 000 sans refonte majeure (V2)
NFR16 : Cache météo TTL 10 min par zone protège contre les pics de requêtes et les quotas API
NFR17 : Le composant d'abstraction provider météo permet de switcher de provider sans modifier l'algorithme de score
NFR18 : App compatible iOS 16+ (~95% des devices actifs)
NFR19 : Intégration API météo abstraite — provider remplaçable sans impact sur le score
NFR20 : Deep links compatibles iOS Universal Links
NFR21 : Algorithme de score côté serveur uniquement — modifications sans mise à jour de l'app
NFR22 : Tests de régression couvrent les cas critiques de l'algo (cloud_base, inversion thermique, seuils)
NFR23 : Logs d'erreurs structurés — tout 5xx enregistré avec contexte suffisant pour diagnostiquer
NFR24 : Toutes les chaînes UI externalisées en fichiers de traduction (i18n-js) — aucune string hardcodée dans les composants
NFR25 : Français au MVP, architecture i18n prête pour EN, DE, IT sans refonte (V2)
NFR26 : Système de styles basé sur design tokens (couleurs, typographie, espacements) — support dark mode natif iOS sans refonte
NFR27 : Feature flags pour activer/désactiver une feature sans redéploiement
NFR28 : Devices cibles MVP : iPhone SE 2e gen (375pt) · iPhone 14 (390pt) · iPhone 14 Pro Max (430pt)
NFR29 : Aucun texte UI ne se tronque ou déborde sur les 3 tailles cibles en français
NFR30 : QA teste les textes longs : noms de sommets > 25 caractères, messages d'erreur, labels avec traductions +30% vs FR

### Additional Requirements

**Architecture Technique :**
- Starter template : `npx create-expo-app mobile --template default@sdk-55` — Expo SDK 55, React Native 0.83.2, New Architecture uniquement (Epic 1, Story 1)
- Backend FastAPI 0.135 + Python 3.12 + Pydantic v2 + SQLAlchemy async + Alembic — setup initial (Epic 1)
- Docker Compose stack production : `api` (Gunicorn+Uvicorn) + `db` (PostgreSQL 16) + `redis` (Redis 7) + `caddy` (HTTPS auto Let's Encrypt)
- `docker-compose.dev.yml` pour environnement local (db + redis uniquement)
- CI/CD GitHub Actions : pipeline backend (ruff + mypy + pytest + docker build + deploy SSH VPS) et pipeline mobile (eslint + tsc + jest + expo export) — < 5min
- VPS OVH Ubuntu 24.04 LTS — déploiement via SSH + `docker compose pull && up -d`
- BetterStack free : heartbeat `/health` 60s → alertes SMS/email < 2min
- Interface `WeatherProvider` abstraite dès J1 — `base.py` + `open_meteo.py` (provider principal, gratuit sans clé) + `meteo_france.py` (provider secondaire FR)
- JWT Supabase validé localement côté backend (clé publique) — zéro appel réseau Supabase par requête
- Quota freemium dans Redis (`quota:{user_id}:{date}`, TTL fin de journée) — backend uniquement
- Cache météo Redis (`weather:{lat}:{lng}:{date}`, TTL 10min) — partagé toutes requêtes
- Migrations Alembic rejouées en CI avant les tests
- Seed initial sommets (`db/seed.py`) — source données à préciser lors de la story recherche
- Logs backend JSON structurés stdout → Docker logs
- PostHog events business : `onboarding_complete`, `score_checked`, `conversion_trial`, `subscription_started`
- `AsyncState<T>` pattern mobile systématique (idle | loading | success | error)
- Cache offline `AsyncStorage` clé `cache:score:{peak_id}:{date}`, TTL 2-3h vérifié au read
- Feature flags objet `flags.ts` hardcodé MVP
- Politique de confidentialité URL publique avant soumission App Store
- StoreKit 2 receipt verification flow côté serveur (sandbox pour tests) — à documenter en story
- Push notifications via Expo Push Notifications (gratuit, simplifie APNs, compatible EAS)

**UX / Design System :**
- Custom Design System léger — React Native primitives + tokens TypeScript (colors.ts, typography.ts, spacing.ts, radius.ts) — pas de lib UI externe
- Josefin Sans comme typo principale (`@expo-google-fonts/josefin-sans`)
- Palette : `#EFE8DC` beige (light bg) / `#1A1A1A` dark bg / `#B28C6E` accent / couleurs sémantiques score `#4CAF50` / `#FF9800` / `#F44336`
- ThemeContext + useTheme() hook — support dark mode natif iOS via design tokens
- Bottom tab bar 4 items glassmorphique sur dark, opaque sur light (Home / Recherche / Favoris / Profil)
- Score affiché grand et centré (pattern Revolut) — verdict lisible < 3 secondes
- 8 composants custom spécifiés : ScoreCard, CloudLayerViz, WeekStrip, ConditionBadge, AlertCTA, PeakFavoriteChip, OnboardingSlide, PaywallScreen, ValidationBottomSheet
- Onboarding narratif différenciant — storytelling "problème des Dolomites" → solution → permissions
- Visualisation altitude de la couche nuageuse vs sommet (CloudLayerViz — différenciateur visuel unique)
- Responsive 3 breakpoints : iPhone SE 375pt / iPhone 14 390pt / iPhone 14 Pro Max 430pt
- WCAG AA contraste minimum, `reduceMotion` respecté, labels VoiceOver
- i18n-js strings externalisées — aucune string hardcodée dans les composants
- Écran offline : bandeau âge données ("Données du [heure] — connexion requise pour actualiser")
- Paywall formulé en bénéfice ("Débloquer les prévisions illimitées") — compteur visible dès le début
- Validation terrain : friction minimale — 1 tap confirmation + photo optionnelle

### FR Coverage Map

```
FR1  → Epic 3 — Verdict probabiliste (🟢/🟡/🔴) par sommet/date/heure
FR2  → Epic 3 — Score numérique de probabilité associé
FR3  → Epic 3 — Détail variables météo (cloud_base, humidité, vent, inversion)
FR4  → Epic 3 — Fenêtre temporelle optimale de visibilité
FR5  → Epic 3 — Lever du soleil croisé avec fenêtre optimale
FR6  → Epic 3 — Indicateur de stabilité de la prévision
FR7  → Epic 3 — Message contextuel conditions défavorables / hors-saison
FR8  → Epic 3 — Recherche sommet ou point de vue par nom
FR9  → Epic 3 — Accès sommet depuis liste de favoris
FR10 → Epic 3 — Ajout d'un sommet aux favoris
FR11 → Epic 3 — Partage d'une prévision via deep link
FR12 → Epic 2 — Création de compte et authentification
FR13 → Epic 2 — Suppression données personnelles (RGPD)
FR14 → Epic 2 — Gestion préférences notifications
FR15 → Epic 2 — Géolocalisation accordée/refusée sans blocage
FR16 → Epic 4 — Limite 1 consultation/jour utilisateur gratuit
FR17 → Epic 4 — Paywall naturel au 2e check avec message conversion
FR18 → Epic 4 — Abonnement Premium mensuel 5€/mois (StoreKit 2)
FR19 → Epic 4 — Abonnement Premium annuel 45€/an (StoreKit 2)
FR20 → Epic 4 — Consultations illimitées Premium
FR21 → Epic 4 — Trial gratuit avant abonnement
FR22 → Epic 5 — Alertes push favoris (conditions idéales) — Premium
FR23 → Epic 5 — Alertes push régionales mer de nuage — Premium
FR24 → Epic 5 — Notification GPS à l'arrivée au sommet consulté
FR25 → Epic 5 — Configuration/désactivation notifications par type
FR26 → Epic 6 — Confirmation/infirmation prévision depuis terrain
FR27 → Epic 6 — Photo optionnelle jointe à la validation terrain
FR28 → Epic 6 — Enregistrement validation (GPS + horodatage)
FR29 → Epic 6 — Calcul taux de précision algo par zone
FR30 → Epic 7 — Affichage dernière prévision si offline (TTL 2-3h)
FR31 → Epic 7 — Indication âge des données en mode offline
FR32 → Epic 7 — Message clair si données expirées et réseau absent
FR33 → Epic 7 — Parcours onboarding narratif au premier lancement
FR34 → Epic 7 — Invitation permissions pendant onboarding (refus possible)
FR35 → Epic 1 — Alerte admin si backend ou API météo indisponible
FR36 → Epic 1 — Métriques serveur basiques consultables
FR37 → Epic 1 — Événements business PostHog (conversions, churns, checks)
FR38 → Epic 3 — Message dégradé gracieux lors d'indisponibilité service
```

---

## Epic List

### Epic 1: Fondation Technique & Infrastructure
Les développeurs peuvent coder, tester et déployer en local et en CI/CD sur VPS OVH. L'app mobile vide tourne sur simulateur iOS, le backend répond sur `/health`, les pipelines CI/CD sont opérationnels. L'administrateur reçoit des alertes en cas de downtime.
**FRs couverts :** FR35, FR36, FR37

### Epic 2: Authentification & Compte Utilisateur
Les utilisateurs peuvent créer un compte, s'authentifier, gérer leurs préférences de notifications, accorder ou refuser la géolocalisation et supprimer leurs données. L'identité utilisateur est établie bout en bout (mobile → backend → Supabase JWT).
**FRs couverts :** FR12, FR13, FR14, FR15

### Epic 3: Score Mer de Nuage & Consultation de Prévision
Les utilisateurs peuvent rechercher un sommet, consulter le verdict probabiliste avec score, détail des conditions météo, fenêtre temporelle optimale, indicateur de stabilité et message contextuel hors-saison. L'app affiche un message dégradé gracieux en cas d'indisponibilité.
**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR38

**Note backlog UX/API :** prévoir une prochaine story mobile dédiée à un composant générique d'erreur API réutilisable (`400/500/service indisponible`) pour homogénéiser `score`, `search` et `favorites`.

### Epic 4: Freemium & Monétisation
Les utilisateurs voient la limite gratuite (1 check/jour), rencontrent le paywall au bon moment, peuvent s'abonner en Premium mensuel (5€/mois) ou Pro annuel (45€/an) via StoreKit 2, démarrer un trial gratuit. Les abonnés accèdent aux consultations illimitées.
**FRs couverts :** FR16, FR17, FR18, FR19, FR20, FR21

### Epic 5: Notifications & Alertes
Les utilisateurs Premium/Pro reçoivent des alertes push proactives sur leurs sommets favoris et leur région. Tous les utilisateurs reçoivent la notification GPS terrain à l'arrivée au sommet. Chaque type de notification est configurable et désactivable indépendamment.
**FRs couverts :** FR22, FR23, FR24, FR25

### Epic 6: Validation Terrain & Data Flywheel
Les utilisateurs peuvent confirmer ou infirmer une prévision depuis le terrain avec photo optionnelle. Le système enregistre les validations (GPS + horodatage) et calcule le taux de précision de l'algorithme par zone géographique.
**FRs couverts :** FR26, FR27, FR28, FR29

### Epic 7: Onboarding & Mode Offline
Les nouveaux utilisateurs complètent le parcours d'onboarding narratif (storytelling Dolomites → solution → permissions). L'app gère gracieusement l'absence de réseau avec cache TTL 2-3h, bandeau d'âge des données et message d'indisponibilité clair.
**FRs couverts :** FR30, FR31, FR32, FR33, FR34

---

## Epic 1: Fondation Technique & Infrastructure

Les développeurs peuvent coder, tester et déployer en local et en CI/CD sur VPS OVH. L'app mobile vide tourne sur simulateur iOS, le backend répond sur `/health`, les pipelines CI/CD sont opérationnels. L'administrateur reçoit des alertes en cas de downtime.

**FRs couverts :** FR35, FR36, FR37

---

### Story 1.1: Setup Infra VPS & Docker Compose Production

As a developer (Alex),
I want a reproducible Docker Compose stack deployed on OVH VPS with HTTPS,
So that the application can be deployed and accessible securely from day one.

**Acceptance Criteria:**

**Given** un VPS OVH Ubuntu 24.04 LTS avec Docker installé
**When** on exécute `docker compose up -d` depuis `infra/`
**Then** les 4 services démarrent : `api` (FastAPI), `db` (PostgreSQL 16), `redis` (Redis 7), `caddy` (reverse proxy)
**And** Caddy obtient automatiquement un certificat Let's Encrypt valide
**And** `GET https://{domain}/health` répond 200

**Given** le stack est en production
**When** on redémarre le VPS
**Then** tous les services redémarrent automatiquement (`restart: unless-stopped`)

**Given** `infra/scripts/deploy.sh`
**When** on l'exécute via SSH
**Then** il effectue `docker compose pull && docker compose up -d` et termine sans erreur

**Given** les fichiers de configuration
**When** on inspecte le repo
**Then** `infra/docker-compose.yml`, `infra/docker-compose.dev.yml`, `infra/Caddyfile`, `infra/.env.example` et `infra/scripts/deploy.sh` existent
**And** aucun secret n'est committé (`.env` dans `.gitignore`)

---

### Story 1.2: Setup Backend FastAPI (Squelette Complet)

As a developer (Alex),
I want a fully structured FastAPI backend with all tooling configured,
So that I can immediately start implementing features with correct patterns enforced.

**Acceptance Criteria:**

**Given** le projet `backend/` initialisé
**When** on exécute `uvicorn app.main:app --reload`
**Then** `GET /health` répond `{"status": "ok"}` en < 100ms

**Given** la structure du projet
**When** on inspecte `backend/`
**Then** les dossiers existent : `app/api/v1/endpoints/`, `app/core/`, `app/models/`, `app/schemas/`, `app/services/`, `app/db/`, `tests/`
**And** `app/core/errors.py` contient les `ErrorCode` constants (QUOTA_EXCEEDED, PEAK_NOT_FOUND, WEATHER_UNAVAILABLE, SUBSCRIPTION_REQUIRED)
**And** `app/core/config.py` charge les variables d'environnement via Pydantic Settings

**Given** PostgreSQL et Redis sont accessibles (via `docker-compose.dev.yml`)
**When** on exécute `alembic upgrade head`
**Then** la migration initiale s'applique sans erreur
**And** la connexion SQLAlchemy async est opérationnelle

**Given** les outils de qualité
**When** on exécute `ruff check . && ruff format --check . && mypy app/`
**Then** aucune erreur sur le code squelette
**When** on exécute `pytest`
**Then** les tests passent (au minimum 1 test smoke sur `/health`)

---

### Story 1.3: Setup Mobile Expo (Squelette avec Design System)

As a developer (Alex),
I want an Expo SDK 55 project with the complete design system and navigation structure,
So that I can build screens with consistent tokens, theming, and routing from day one.

**Acceptance Criteria:**

**Given** `npx create-expo-app mobile --template default@sdk-55` exécuté
**When** on lance `npx expo start` et ouvre sur simulateur iOS
**Then** l'app démarre sans crash sur iPhone SE (375pt), iPhone 14 (390pt) et iPhone 14 Pro Max (430pt)
**And** le bottom tab bar à 4 onglets vides est visible (Home, Recherche, Favoris, Profil)

**Given** le design system
**When** on inspecte `mobile/src/constants/`
**Then** `colors.ts` contient les tokens light/dark (`#EFE8DC`, `#1A1A1A`, `#B28C6E`, couleurs sémantiques score)
**And** `typography.ts` configure Josefin Sans avec l'échelle modulaire
**And** `spacing.ts` définit la grille 4px
**And** `flags.ts` contient le feature flags objet vide

**Given** `ThemeContext`
**When** on utilise `useTheme()` dans un composant
**Then** il retourne `{ colors, spacing, typography }` selon le mode système (light/dark)

**Given** `mobile/src/utils/i18n.ts`
**When** l'app démarre
**Then** les strings FR sont chargées depuis un fichier de traduction (aucune string hardcodée dans les composants)

**Given** les outils de qualité
**When** on exécute `npm run lint && tsc --noEmit && npm test`
**Then** aucune erreur sur le code squelette

---

### Story 1.4: CI/CD GitHub Actions (Backend + Mobile)

As a developer (Alex),
I want automated CI/CD pipelines that validate quality and deploy on push,
So that regressions are detected in < 5 minutes and production is always deployable.

**Acceptance Criteria:**

**Given** un push sur `main` ou `develop` dans `backend/`
**When** le workflow `.github/workflows/backend.yml` s'exécute
**Then** les étapes s'enchaînent : `ruff check` → `ruff format --check` → `mypy` → `alembic upgrade head` → `pytest --cov` → `docker build`
**And** l'ensemble termine en < 5 minutes

**Given** un push sur `main` uniquement dans `backend/`
**When** tous les jobs quality + build sont verts
**Then** le job `deploy` se connecte au VPS OVH via SSH et exécute `infra/scripts/deploy.sh`

**Given** un push sur `main` ou `develop` dans `mobile/`
**When** le workflow `.github/workflows/mobile.yml` s'exécute
**Then** les étapes s'enchaînent : `eslint` → `tsc --noEmit` → `jest --coverage` → `npx expo export`
**And** l'ensemble termine en < 5 minutes

**Given** un test ou lint qui échoue
**When** le pipeline s'exécute
**Then** le job échoue immédiatement et aucun déploiement n'est déclenché

**Given** les secrets GitHub Actions
**When** on inspecte la configuration
**Then** `VPS_SSH_KEY`, `VPS_HOST`, `DATABASE_URL`, `WEATHER_API_KEY` sont configurés comme secrets (pas en clair)

---

### Story 1.5: Monitoring BetterStack & PostHog Initial

As an administrator (Alex),
I want uptime monitoring with < 2 min alerts and PostHog ready for business events,
So that I can sleep without worrying and track key product metrics from launch.

**Acceptance Criteria:**

**Given** BetterStack free account configuré
**When** le service `/health` est accessible
**Then** BetterStack envoie un heartbeat toutes les 60 secondes

**Given** le backend est indisponible (service down)
**When** 2 checks consécutifs échouent
**Then** Alex reçoit une alerte SMS et/ou email en < 2 minutes

**Given** PostHog configuré dans le backend
**When** on importe `posthog` dans `app/main.py`
**Then** la connexion est établie avec la clé `POSTHOG_API_KEY` depuis les variables d'environnement
**And** un event `backend_started` est tracké au démarrage

**Given** les logs FastAPI
**When** une erreur 5xx se produit
**Then** elle est loggée en JSON structuré avec `{"level": "error", "path": "...", "status": 500, "error": "..."}`
**And** aucun `print()` ni stack trace brut n'apparaît en production

---

✅ **Epic 1 complète — 5 stories (couverture FR35, FR36, FR37 + fondation technique complète)**

---

## Epic 2: Authentification & Compte Utilisateur

Les utilisateurs peuvent créer un compte, s'authentifier, gérer leurs préférences de notifications, accorder ou refuser la géolocalisation et supprimer leurs données. L'identité utilisateur est établie bout en bout (mobile → backend → Supabase JWT).

**FRs couverts :** FR12, FR13, FR14, FR15

---

### Story 2.1: Inscription et Connexion Utilisateur (Supabase Auth)

As a new user,
I want to create an account and log in with email/password,
So that my preferences and history are saved across sessions.

**Acceptance Criteria:**

**Given** l'écran de connexion/inscription
**When** l'utilisateur saisit un email valide et un mot de passe (min 8 caractères) et appuie sur "Créer un compte"
**Then** Supabase crée le compte et retourne un JWT
**And** l'app stocke le token et navigue vers l'écran principal

**Given** un utilisateur existant
**When** il saisit ses identifiants corrects et appuie sur "Se connecter"
**Then** il est authentifié et navigue vers l'écran principal en < 3 secondes

**Given** des identifiants incorrects
**When** l'utilisateur appuie sur "Se connecter"
**Then** un message d'erreur clair s'affiche ("Email ou mot de passe incorrect")
**And** l'app ne crashe pas

**Given** un JWT Supabase obtenu sur mobile
**When** une requête est envoyée au backend avec `Authorization: Bearer {jwt}`
**Then** `get_current_user` FastAPI valide le token localement (clé publique Supabase, zéro appel réseau)
**And** retourne l'identité utilisateur

**Given** un token expiré
**When** le mobile tente un appel API
**Then** Supabase refresh automatiquement le token via `AuthContext`

---

### Story 2.2: Gestion des Préférences de Notifications

As an authenticated user,
I want to manage my notification preferences independently per type,
So that I only receive alerts that are relevant to me.

**Acceptance Criteria:**

**Given** l'écran Profil → Notifications
**When** l'utilisateur arrive sur l'écran
**Then** il voit 3 toggles indépendants : "Alertes favoris", "Alertes régionales", "Validation terrain GPS"
**And** l'état actuel de chaque toggle est correctement chargé depuis le backend

**Given** l'utilisateur désactive "Alertes favoris"
**When** il appuie sur le toggle
**Then** la préférence est sauvegardée via `PATCH /api/v1/user/notifications`
**And** le toggle reflète immédiatement le nouvel état

**Given** la table `users` en base de données
**When** la migration est appliquée
**Then** elle contient les colonnes `notif_favorites` (bool, default true), `notif_regional` (bool, default true), `notif_terrain` (bool, default true)

---

### Story 2.3: Permission Géolocalisation (Opt-in sans Blocage)

As a user,
I want to grant or deny location permission without being blocked from using the app,
So that I control my privacy while still having access to core features.

**Acceptance Criteria:**

**Given** l'app au premier lancement (ou si permission jamais demandée)
**When** l'utilisateur arrive sur l'écran de demande de géolocalisation
**Then** un message explicite explique l'usage ("Pour confirmer ta présence au sommet")
**And** deux options sont proposées : "Autoriser" et "Pas maintenant"

**Given** l'utilisateur appuie sur "Pas maintenant"
**When** il est redirigé vers l'écran principal
**Then** toutes les fonctionnalités core (score, recherche, favoris) sont accessibles
**And** aucun blocage ni message d'erreur permanent n'est affiché

**Given** l'utilisateur a refusé la géolocalisation
**When** il accède à la section Profil
**Then** il peut activer la géolocalisation depuis les paramètres de l'app (lien vers Settings iOS)

**Given** iOS demande la permission système
**When** l'utilisateur accorde l'accès "En utilisant l'app"
**Then** `expo-location` confirme `foregroundPermission: granted`
**And** l'état est mémorisé dans `AuthContext`

---

### Story 2.4: Suppression du Compte et Données Personnelles (RGPD)

As an authenticated user,
I want to permanently delete my account and all my personal data,
So that I exercise my right to erasure under GDPR.

**Acceptance Criteria:**

**Given** l'écran Profil → Compte → Supprimer mon compte
**When** l'utilisateur appuie sur "Supprimer mon compte"
**Then** une confirmation explicite est demandée ("Cette action est irréversible")
**And** l'utilisateur doit saisir son email pour confirmer

**Given** la confirmation validée
**When** `DELETE /api/v1/user` est appelé avec le JWT valide
**Then** toutes les données utilisateur sont supprimées : `users`, `predictions` (liées), `terrain_validations` (liées), `subscriptions` (liées), `events` (liées)
**And** le compte Supabase est désactivé
**And** la réponse est `204 No Content`

**Given** l'app après suppression
**When** l'API retourne 204
**Then** l'utilisateur est déconnecté localement, le cache AsyncStorage est vidé, et il est redirigé vers l'écran de connexion

**Given** l'endpoint DELETE
**When** on l'appelle sans JWT valide
**Then** il retourne `401 Unauthorized` avec `{"detail": "Non authentifié", "code": "UNAUTHORIZED"}`

---

✅ **Epic 2 spécification complète — 4 stories rédigées (couverture FR12, FR13, FR14, FR15)**
> Implémentation : 2.1 ✅ done · 2.2 ⏸ backlog (dépend Epic 5) · 2.3 ⏸ backlog (dépend Epic 5) · 2.4 ❌ à faire (bloquant App Store)

---

## Epic 3: Score Mer de Nuage & Consultation de Prévision

Les utilisateurs peuvent rechercher un sommet, consulter le verdict probabiliste avec score, détail des conditions météo, fenêtre temporelle optimale, indicateur de stabilité et message contextuel hors-saison. L'app affiche un message dégradé gracieux en cas d'indisponibilité.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR38

---

### Story 3.1: Algorithme Score & Endpoint API Score

As a developer (Alex),
I want the sea of clouds score algorithm implemented server-side with weather provider abstraction,
So that scores can be calculated and iterated without app updates.

**Acceptance Criteria:**

**Given** l'interface `WeatherProvider` dans `app/services/weather_providers/base.py`
**When** on appelle `provider.get_forecast(lat, lng, date)`
**Then** elle retourne un dict normalisé : `{cloud_base, humidity, wind_speed, temperature_valley, temperature_altitude, pressure}`
**And** `OpenMeteoProvider` (provider principal MVP) et `MeteoFranceProvider` (provider secondaire FR) implémentent cette interface

**Given** `app/services/score.py`
**When** on appelle `calculate_score(weather_data, peak_altitude)`
**Then** il retourne `{score: float, verdict: "high"|"medium"|"low", cloud_base: int, conditions: {...}}`
**And** la formule respecte : `0.4 * cloud_base_condition + 0.2 * humidity_score + 0.2 * wind_score + 0.2 * inversion_score`

**Given** `GET /api/v1/score?peak_id=&date=&hour=` avec JWT valide
**When** les données météo sont disponibles
**Then** la réponse contient : `score`, `verdict`, `label` (texte humain), `cloud_base`, `optimal_window_start`, `optimal_window_end`, `sunrise`, `stability_hours`, `conditions`
**And** le temps de réponse est < 500ms pour 95% des requêtes (cache Redis actif)

**Given** le cache Redis `weather:{lat}:{lng}:{date}`
**When** deux requêtes sont faites pour le même sommet/date dans les 10 minutes
**Then** la seconde requête utilise le cache (pas d'appel API météo externe)

**Given** `tests/test_score.py`
**When** on exécute pytest
**Then** les cas critiques sont couverts : cloud_base < altitude → score élevé, vent fort → score réduit, pas d'inversion → score réduit, hors-saison estivale

---

### Story 3.2: Seed Base de Données des Sommets

As a user,
I want to search for real mountain peaks by name,
So that I can get a sea of clouds forecast for my destination.

**Acceptance Criteria:**

**Given** `app/db/seed.py` exécuté
**When** on requête `SELECT COUNT(*) FROM peaks`
**Then** au moins 50 sommets alpins sont disponibles (Alpes françaises, Vosges, Massif Central prioritaires)
**And** chaque sommet a : `id`, `name`, `slug`, `lat`, `lng`, `altitude` (en mètres)

**Given** les sommets de référence MVP
**When** on cherche "Col de la Croix-Fry", "Mont Blanc", "Champ du Feu"
**Then** ils existent en base avec des coordonnées GPS et altitudes correctes

**Given** la table `peaks`
**When** la migration Alembic est appliquée
**Then** un index `idx_peaks_name` existe pour les recherches textuelles rapides

---

### Story 3.3: Recherche de Sommet & Favoris

As a user,
I want to search for a peak by name and save my favorites,
So that I can quickly access the summits I regularly check.

**Acceptance Criteria:**

**Given** l'écran Recherche
**When** l'utilisateur tape au moins 2 caractères
**Then** l'autocomplete appelle `GET /api/v1/peaks/search?q={query}` et affiche les résultats en < 500ms
**And** chaque résultat affiche le nom du sommet et son altitude

**Given** un résultat de recherche
**When** l'utilisateur tape sur un sommet
**Then** il est redirigé vers l'écran de prévision de ce sommet

**Given** l'écran de prévision d'un sommet
**When** l'utilisateur appuie sur l'icône favoris (étoile)
**Then** le sommet est ajouté à sa liste de favoris via `POST /api/v1/user/favorites`
**And** l'icône bascule en état "favori actif"

**Given** l'onglet Favoris
**When** l'utilisateur l'ouvre
**Then** ses sommets favoris sont listés avec leur dernière prévision (si disponible en cache)
**And** un tap sur un favori navigue vers son écran de prévision

**Given** `GET /api/v1/peaks/search?q=` sans JWT
**When** la requête est envoyée
**Then** elle retourne `401 Unauthorized` (la recherche requiert un compte)

---

### Story 3.4: Écran Principal — ScoreCard & Affichage Verdict

As a user,
I want to see the sea of clouds probability verdict clearly on the main screen,
So that I can make a go/no-go decision in under 3 seconds.

**Acceptance Criteria:**

**Given** l'utilisateur a sélectionné un sommet et une date
**When** l'écran principal charge
**Then** le composant `ScoreCard` affiche : le verdict coloré (🟢/🟡/🔴), le score en % grand format, le nom du sommet, la date sélectionnée
**And** le temps d'affichage depuis le tap est < 3 secondes sur réseau 4G

**Given** le score ≥ 70%
**When** `ScoreCard` s'affiche
**Then** la couleur de fond/accent est `#4CAF50` (vert) et le label est "Lève-toi tôt ! 🟢"

**Given** le score entre 40% et 69%
**When** `ScoreCard` s'affiche
**Then** la couleur est `#FF9800` (orange) et le label est "Ça peut le faire 🟡"

**Given** le score < 40%
**When** `ScoreCard` s'affiche
**Then** la couleur est `#F44336` (rouge) et le label est "Pas ce coup-ci 🔴"

**Given** `useScore` hook
**When** la requête est en cours
**Then** l'état `AsyncState` est `loading` — un skeleton loader s'affiche (pas de spinner agressif)

**Given** une erreur API
**When** le backend retourne une erreur
**Then** l'état est `error` — un message clair s'affiche sans crash
**And** FR38 : si l'API météo externe est indisponible, le message "Service momentanément indisponible" s'affiche

---

### Story 3.5: Détail Conditions Météo, Fenêtre Temporelle & Stabilité

As a user,
I want to see the weather conditions, optimal time window, sunrise, and forecast stability,
So that I can understand why the score is what it is and plan my timing precisely.

**Acceptance Criteria:**

**Given** l'écran de prévision avec un score affiché
**When** l'utilisateur appuie sur "Voir les conditions" ou le score lui-même
**Then** un accordéon/expand révèle les `ConditionBadge` : cloud_base (altitude en m), humidité (%), vent (km/h), inversion thermique (✓/✗)

**Given** les données de fenêtre temporelle
**When** l'écran charge
**Then** la fenêtre optimale est affichée : "Fenêtre : 6h40–8h15" avec le lever du soleil "☀️ 7h02"
**And** `CloudLayerViz` affiche le diagramme couche nuageuse vs altitude sommet

**Given** l'indicateur de stabilité (FR6)
**When** la prévision est stable depuis ≥ 36h
**Then** "Prévision stable depuis 48h ✓" s'affiche en vert discret sous le score

**Given** la prévision instable (recalculée récemment)
**When** la stabilité est < 12h
**Then** "À reconfirmer ce soir ⚠" s'affiche en orange

**Given** `WeekStrip` (sélecteur de jours)
**When** l'utilisateur swipe ou tape sur J+1, J+2...
**Then** le score se met à jour pour la date sélectionnée
**And** le jour actif est visuellement mis en valeur

---

### Story 3.6: Message Contextuel Hors-Saison & Deep Link Partage

As a user,
I want a useful contextual message when sea of clouds conditions are absent,
And I want to share a forecast with a deep link,
So that the app remains useful year-round and I can share discoveries.

**Acceptance Criteria:**

**Given** conditions défavorables à la mer de nuage (score < 20%, été)
**When** le verdict s'affiche
**Then** FR7 : un message contextuel utile s'affiche ("Pas de mer de nuage — mais ciel parfaitement dégagé au-dessus de 2400m ☀️")
**And** le message est déterminé côté backend selon les conditions météo réelles

**Given** l'écran de prévision d'un sommet
**When** l'utilisateur appuie sur l'icône partage
**Then** le deep link `https://merdenua.ge/sommet/{slug}` est copié dans le presse-papiers ou partagé via le sheet iOS natif

**Given** un utilisateur qui reçoit un deep link
**When** il l'ouvre sur iOS
**Then** iOS Universal Links ouvre l'app directement sur l'écran de prévision du sommet correspondant
**And** si l'app n'est pas installée, il est redirigé vers l'App Store

---

✅ **Epic 3 complète — 6 stories (couverture FR1–FR11, FR38)**

---

## Epic 4: Freemium & Monétisation

Les utilisateurs voient la limite gratuite, rencontrent le paywall au bon moment, peuvent s'abonner en Premium mensuel (5€/mois) ou Pro annuel (45€/an) via StoreKit 2, démarrer un trial gratuit. Les abonnés accèdent aux consultations illimitées.

**FRs couverts :** FR16, FR17, FR18, FR19, FR20, FR21

---

### Story 4.1: Quota Freemium Backend (1 Check/Jour)

As a developer (Alex),
I want the daily free quota enforced server-side via Redis,
So that the freemium limit cannot be bypassed from the mobile app.

**Acceptance Criteria:**

**Given** un utilisateur sans abonnement actif
**When** il appelle `GET /api/v1/score` pour la 1ère fois de la journée
**Then** le score est retourné normalement
**And** Redis incrémente `quota:{user_id}:{date}` (TTL = fin de journée UTC)

**Given** un utilisateur gratuit qui a déjà utilisé son check quotidien
**When** il appelle `GET /api/v1/score` à nouveau
**Then** le backend retourne `429` avec `{"detail": "Quota journalier atteint", "code": "QUOTA_EXCEEDED"}`

**Given** un utilisateur Premium ou Pro avec abonnement actif
**When** il appelle `GET /api/v1/score` n'importe combien de fois
**Then** le quota Redis est ignoré — accès illimité

**Given** un nouveau jour (minuit UTC)
**When** la clé Redis `quota:{user_id}:{date}` expire
**Then** le compteur repart à zéro automatiquement (TTL géré par Redis)

---

### Story 4.2: Paywall Mobile & Conversion

As a free user,
I want to see a natural paywall when I reach my daily limit,
So that I understand the value of upgrading before being asked to pay.

**Acceptance Criteria:**

**Given** l'utilisateur gratuit qui fait son 2e check quotidien
**When** le backend retourne `429 QUOTA_EXCEEDED`
**Then** `useScore` passe en état `error` avec code `QUOTA_EXCEEDED`
**And** `PaywallScreen` s'affiche en bottom sheet ou plein écran

**Given** `PaywallScreen`
**When** il s'affiche
**Then** le message est formulé en bénéfice : "Débloquer les prévisions illimitées"
**And** deux options sont visibles : "Mensuel — 5€/mois" et "Annuel — 45€/an" (plan unique : Premium)
**And** "Essai gratuit 7 jours" est mis en avant visuellement

---

### Story 4.3: Abonnements StoreKit 2 (Premium mensuel & annuel)

As a user,
I want to subscribe to Premium via Apple In-App Purchase (monthly or annual),
So that I get unlimited forecasts with native, secure payment.

**Acceptance Criteria:**

**Given** `PaywallScreen` affiché
**When** l'utilisateur choisit "Mensuel — 5€/mois" ou "Annuel — 45€/an"
**Then** StoreKit 2 déclenche le sheet de paiement natif iOS
**And** Apple gère la transaction (aucun numéro de carte dans l'app)

**Given** la transaction StoreKit 2 réussie
**When** l'app reçoit le receipt
**Then** elle appelle `POST /api/v1/user/subscription/verify` avec le receipt encodé
**And** le backend vérifie la receipt Apple (sandbox en dev, production en prod) et met à jour `subscriptions` en DB avec `plan: "premium"`
**And** `SubscriptionContext` est mis à jour → quota Redis ignoré pour cet utilisateur

**Given** un utilisateur en trial gratuit (FR21)
**When** il active le trial
**Then** StoreKit 2 démarre le trial de 7 jours sans débit immédiat
**And** le backend enregistre `status: "trial"` avec `expires_at = now + 7 jours`

**Given** un abonnement qui expire ou est annulé
**When** `expires_at` est dépassé
**Then** le quota freemium est réappliqué automatiquement dès la prochaine vérification

---

✅ **Epic 4 complète — 3 stories (couverture FR16–FR21)**

---

## Epic 5: Notifications & Alertes

Les utilisateurs Premium/Pro reçoivent des alertes push proactives sur leurs sommets favoris et leur région. Tous les utilisateurs reçoivent la notification GPS terrain. Chaque type est configurable indépendamment.

**FRs couverts :** FR22, FR23, FR24, FR25

---

### Story 5.1: Infrastructure Push Notifications (Expo Push)

As a developer (Alex),
I want Expo Push Notifications integrated end-to-end (mobile → backend → APNs),
So that the app can send targeted push notifications to users.

**Acceptance Criteria:**

**Given** `expo-notifications` installé
**When** l'app démarre et l'utilisateur a accordé la permission
**Then** un `expoPushToken` est obtenu et envoyé au backend via `POST /api/v1/user/push-token`
**And** le token est stocké dans la table `users.push_token`

**Given** le backend avec `EXPO_ACCESS_TOKEN` configuré
**When** on appelle le service `notifications.py` avec un `push_token` et un message
**Then** la notification est envoyée via l'API Expo Push Notifications
**And** elle arrive sur le device en < 30 secondes

**Given** un token push invalide ou expiré
**When** l'envoi échoue
**Then** l'erreur est loggée en JSON structuré et le token est marqué comme invalide en DB
**And** l'app ne crashe pas

---

### Story 5.2: Alertes Push Favoris & Régionales (Premium/Pro)

As a Premium/Pro user,
I want to receive push alerts when ideal sea of clouds conditions are predicted for my favorites,
So that I never miss an opportunity without having to check the app manually.

**Acceptance Criteria:**

**Given** un job de vérification planifié (cron ou tâche périodique backend)
**When** les conditions d'un sommet favori d'un utilisateur Premium/Pro passent en 🟢 (score ≥ 70%)
**Then** une notification push est envoyée : "Conditions idéales prévues demain 6h sur [sommet] — 87% 🟢"
**And** la notification n'est envoyée qu'une seule fois par sommet/fenêtre temporelle

**Given** une alerte régionale (FR23)
**When** une mer de nuage est prévue dans la région de l'utilisateur
**Then** une notification push est envoyée : "Mer de nuage visible dès 1600m dans ta région ce matin"

**Given** l'utilisateur a désactivé "Alertes favoris" dans ses préférences (FR25)
**When** les conditions sont idéales sur un de ses favoris
**Then** aucune notification n'est envoyée

**Given** un utilisateur gratuit (sans abonnement)
**When** les conditions sont idéales sur un de ses favoris
**Then** aucune alerte proactive n'est envoyée (feature Premium uniquement)

---

### Story 5.3: Notification GPS Validation Terrain

As a user,
I want to receive a notification when I arrive near a peak I checked,
So that I can easily confirm whether the forecast was accurate.

**Acceptance Criteria:**

**Given** l'utilisateur a consulté une prévision pour un sommet et a accordé la géolocalisation
**When** sa position GPS est à moins de 500m du sommet (vérification mobile via geofencing)
**Then** une notification locale s'affiche : "Tu es au [sommet] ! Mer de nuage visible ? 📸"

**Given** l'utilisateur tape sur la notification
**When** l'app s'ouvre
**Then** `ValidationBottomSheet` s'affiche directement avec les boutons "Oui ✅" et "Non ❌"

**Given** l'utilisateur a désactivé "Validation terrain" dans ses préférences (FR25)
**When** il arrive au sommet
**Then** aucune notification n'est déclenchée

**Given** la géolocalisation non accordée
**When** l'utilisateur arrive au sommet
**Then** aucune notification GPS n'est déclenchée (pas de demande de permission intrusive)

---

✅ **Epic 5 complète — 3 stories (couverture FR22–FR25)**

---

## Epic 6: Validation Terrain & Data Flywheel

Les utilisateurs peuvent confirmer ou infirmer une prévision depuis le terrain avec photo optionnelle. Le système enregistre les validations (GPS + horodatage) et calcule le taux de précision de l'algorithme par zone.

**FRs couverts :** FR26, FR27, FR28, FR29

---

### Story 6.1: Validation Terrain (Confirmation/Infirmation)

As a user,
I want to confirm or deny the forecast accuracy when I'm at the summit,
So that I contribute to improving the algorithm and close the feedback loop.

**Acceptance Criteria:**

**Given** `ValidationBottomSheet` affiché (depuis notification GPS ou depuis l'écran de prévision)
**When** l'utilisateur appuie sur "Oui — mer de nuage visible ✅"
**Then** `POST /api/v1/validations` est appelé avec `{prediction_id, result: true, lat, lng, validated_at}`
**And** la réponse est `201 Created`
**And** un message de remerciement s'affiche : "Merci ! Ta validation aide à affiner les prévisions 🙏"

**Given** l'utilisateur appuie sur "Non — pas de mer de nuage ❌"
**When** la requête est envoyée
**Then** `result: false` est enregistré avec le même format

**Given** la table `terrain_validations`
**When** la migration est appliquée
**Then** elle contient : `id`, `prediction_id`, `user_id`, `result` (bool), `photo_url` (nullable), `lat`, `lng`, `validated_at`

**Given** un appel sans JWT valide
**When** `POST /api/v1/validations` est appelé
**Then** le backend retourne `401 Unauthorized`

---

### Story 6.2: Photo Optionnelle & Calcul Taux de Précision

As a user,
I want to attach an optional photo to my terrain validation,
And I want the system to automatically calculate forecast accuracy by zone.

**Acceptance Criteria:**

**Given** `ValidationBottomSheet` avec option photo
**When** l'utilisateur appuie sur "Ajouter une photo 📸" (optionnel)
**Then** le sélecteur natif iOS s'ouvre (galerie photo)
**And** la photo sélectionnée est uploadée (taille max 5MB, compression côté app)
**And** l'URL de la photo est stockée dans `terrain_validations.photo_url`

**Given** l'utilisateur ne souhaite pas ajouter de photo
**When** il valide sans photo
**Then** la validation est enregistrée avec `photo_url: null` sans blocage

**Given** FR29 — calcul taux de précision
**When** `GET /api/v1/stats/accuracy?zone=` est appelé (admin uniquement)
**Then** il retourne le ratio `validations_positives / total_validations` par zone géographique (grille de ~50km)
**And** ce calcul est disponible dans PostHog via un event `accuracy_calculated`

---

✅ **Epic 6 complète — 2 stories (couverture FR26–FR29)**

---

## Epic 7: Onboarding & Mode Offline

Les nouveaux utilisateurs complètent le parcours d'onboarding narratif. L'app gère gracieusement l'absence de réseau avec cache TTL 2-3h, bandeau d'âge des données et message d'indisponibilité clair.

**FRs couverts :** FR30, FR31, FR32, FR33, FR34

---

### Story 7.1: Parcours Onboarding Narratif

As a new user,
I want to experience a compelling onboarding that explains the product's unique value,
So that I understand what sea of clouds forecasting is and why I need it.

**Acceptance Criteria:**

**Given** le premier lancement de l'app (flag `onboarding_completed` absent)
**When** l'app démarre
**Then** `onboarding.tsx` s'affiche automatiquement (pas l'écran principal)

**Given** l'écran onboarding
**When** l'utilisateur le parcourt
**Then** 3 slides s'enchaînent via `OnboardingSlide` :
- Slide 1 : Le problème ("Tu as monté 1h pour ça...") — image Dolomites, fond sombre
- Slide 2 : La solution ("mer de nuage prédit si ça vaut le coup") — demo score 87% 🟢
- Slide 3 : Les permissions — notification push + géolocalisation, refus possible sans blocage

**Given** slide 3 (permissions)
**When** l'utilisateur refuse les deux permissions
**Then** il continue quand même vers l'écran principal sans message d'erreur ni friction

**Given** la fin de l'onboarding
**When** l'utilisateur appuie sur "Commencer"
**Then** le flag `onboarding_completed: true` est sauvegardé en `AsyncStorage`
**And** l'event `onboarding_complete` est envoyé à PostHog
**And** l'utilisateur est redirigé vers l'écran principal

**Given** un utilisateur qui rouvre l'app
**When** `onboarding_completed: true` est en `AsyncStorage`
**Then** l'onboarding ne s'affiche plus jamais

---

### Story 7.2: Mode Offline-Light & Cache TTL

As a user,
I want to see my last forecast when I have no network connection,
So that I can still check conditions on the mountain without signal.

**Acceptance Criteria:**

**Given** l'utilisateur a consulté une prévision avec réseau disponible
**When** `useScore` reçoit les données
**Then** `cacheService.set(`score:${peakId}:${date}`, data, TTL_2H)` est appelé
**And** la prévision est disponible hors-ligne pendant 2-3h

**Given** l'utilisateur consulte la même prévision sans réseau
**When** `useScore` détecte l'absence de réseau
**Then** `cacheService.get()` retourne les données en cache (état `success` avec `fromCache: true`)
**And** un bandeau s'affiche : "Données du [heure] — connexion requise pour actualiser"
**And** l'affichage se fait en < 100ms (FR30, NFR3)

**Given** le cache expiré (> 3h) et absence de réseau
**When** l'utilisateur tente de consulter
**Then** un message clair s'affiche : "Données non disponibles — connexion requise pour voir une prévision fraîche"
**And** l'app ne crashe pas et n'affiche pas de données obsolètes sans avertissement (FR32)

**Given** le réseau revient
**When** l'utilisateur pull-to-refresh
**Then** les données fraîches sont récupérées et le bandeau disparaît

---

✅ **Epic 7 complète — 2 stories (couverture FR30–FR34)**
