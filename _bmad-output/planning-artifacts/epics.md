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

> Mise à jour 2026-10-13 : les mentions d'un TTL météo de 10 minutes ci-dessous reflètent le plan
> initial. L'implémentation actuelle utilise 30 minutes (1 800 secondes).

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
FR18 : L'utilisateur peut s'abonner en Premium mensuel (4,99 €/mois) via StoreKit 2
FR19 : L'utilisateur peut s'abonner en Premium annuel (44,99 €/an) via StoreKit 2
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
- **Infra prod : Dokploy** (self-hosted PaaS sur VPS OVH) — remplace Docker Compose manuel + Caddy + deploy.sh
  - Traefik intégré (reverse proxy + Let's Encrypt auto)
  - UI web pour gérer services, env vars, déploiements
  - Webhook GitHub → redeploy automatique sur push `main`
  - Services managés : `api` (Gunicorn+Uvicorn), `db` (PostgreSQL 16), `redis` (Redis 7)
- `docker-compose.dev.yml` pour environnement local (db + redis uniquement) — inchangé
- CI/CD GitHub Actions : pipeline backend (ruff + mypy + pytest + docker build) et pipeline mobile (eslint + tsc + jest + expo export) — < 5min (le deploy est géré par Dokploy via webhook, pas par GitHub Actions)
- VPS OVH Ubuntu 24.04 LTS
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
FR18 → Epic 4 — Abonnement Premium mensuel 4,99 €/mois (StoreKit 2)
FR19 → Epic 4 — Abonnement Premium annuel 44,99 €/an (StoreKit 2)
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
Les utilisateurs voient la limite gratuite (1 check/jour), rencontrent le paywall au bon moment, peuvent s'abonner en Premium mensuel (4,99 €/mois) ou Premium annuel (44,99 €/an) via StoreKit 2, démarrer un trial gratuit. Les abonnés accèdent aux consultations illimitées.
**FRs couverts :** FR16, FR17, FR18, FR19, FR20, FR21

### Epic 5: Notifications & Alertes
Les utilisateurs Premium reçoivent des alertes push proactives sur leurs sommets favoris et leur région. Tous les utilisateurs reçoivent la notification GPS terrain à l'arrivée au sommet. Chaque type de notification est configurable et désactivable indépendamment.
**FRs couverts :** FR22, FR23, FR24, FR25

### Epic 6: Validation Terrain & Data Flywheel
Les utilisateurs peuvent confirmer ou infirmer une prévision depuis le terrain avec photo optionnelle. Le système enregistre les validations (GPS + horodatage) et calcule le taux de précision de l'algorithme par zone géographique.
**FRs couverts :** FR26, FR27, FR28, FR29

### Epic 7: Onboarding & Mode Offline
Les nouveaux utilisateurs complètent le parcours d'onboarding narratif (storytelling Dolomites → solution → permissions). L'app gère gracieusement l'absence de réseau avec cache TTL 2-3h, bandeau d'âge des données et message d'indisponibilité clair.
**FRs couverts :** FR30, FR31, FR32, FR33, FR34

### Epic 10: Ops console
L'administrateur (Alex) est alerté en moins de 2 minutes quand un service, un cron ou le serveur tombe, voit en un écran la version déployée et les KPIs clés (utilisateurs, abonnements, checks/jour) sur dev et prod, puis (v1) peut offrir Premium par email avec journal d'audit. Remplace la story 1.6 et absorbe la 1.5.
**FRs couverts :** FR35, FR36, FR37 (NFR7)

---

## Epic 1: Fondation Technique & Infrastructure

Les développeurs peuvent coder, tester et déployer en local et en CI/CD sur VPS OVH. L'app mobile vide tourne sur simulateur iOS, le backend répond sur `/health`, les pipelines CI/CD sont opérationnels. L'administrateur reçoit des alertes en cas de downtime.

**FRs couverts :** FR35, FR36, FR37

---

### Story 1.1: Setup Infra VPS & Dokploy Production

As a developer (Alex),
I want Dokploy installed on an OVH VPS to manage deployments via a web UI with HTTPS auto,
So that I can deploy, redeploy, and monitor services without manual SSH + Docker Compose commands.

> **Infra retenue : Dokploy** (self-hosted PaaS) — remplace le setup manuel Docker Compose + Caddy + deploy.sh.
> Dokploy intègre Traefik (reverse proxy + Let's Encrypt auto), une UI web pour gérer les apps/envs/déploiements,
> et supporte les déploiements Git-based (webhook push → redeploy automatique).

**Acceptance Criteria:**

**Given** un VPS OVH Ubuntu 24.04 LTS
**When** on exécute le script d'installation Dokploy (`curl -sSL https://dokploy.com/install.sh | sh`)
**Then** Dokploy est accessible sur `https://{domain}:3000` avec interface web
**And** Traefik est opérationnel comme reverse proxy avec certificat Let's Encrypt valide

**Given** Dokploy installé et configuré
**When** on crée un projet "cloudbreak" avec les services `api`, `db`, `redis`
**Then** chaque service est configuré avec ses variables d'environnement (depuis `.env.example`)
**And** `GET https://{domain}/health` répond 200

**Given** un push sur la branche `main` de `cloudbreak-backend`
**When** le webhook GitHub est configuré dans Dokploy
**Then** Dokploy redéploie automatiquement le service `api` en < 3 minutes

**Given** le VPS redémarre
**When** Docker redémarre
**Then** Dokploy et tous les services redémarrent automatiquement

**Given** les fichiers de configuration locaux (dev)
**When** on inspecte le repo `infra/`
**Then** `infra/docker-compose.dev.yml` (db + redis uniquement) et `infra/.env.example` existent
**And** aucun secret n'est committé (`.env` dans `.gitignore`)
**And** `infra/README.md` documente la procédure d'installation Dokploy + configuration initiale

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
**Then** GitHub Actions notifie Dokploy via webhook → Dokploy redéploie le service `api` automatiquement
**And** aucun secret SSH VPS n'est nécessaire dans GitHub Actions (Dokploy gère le deploy)

**Given** un push sur `main` ou `develop` dans `mobile/`
**When** le workflow `.github/workflows/mobile.yml` s'exécute
**Then** les étapes s'enchaînent : `eslint` → `tsc --noEmit` → `jest --coverage` → `npx expo export`
**And** l'ensemble termine en < 5 minutes

**Given** un test ou lint qui échoue
**When** le pipeline s'exécute
**Then** le job échoue immédiatement et Dokploy n'est pas notifié (pas de redeploy)

**Given** les secrets GitHub Actions
**When** on inspecte la configuration
**Then** `DOKPLOY_WEBHOOK_URL`, `DATABASE_URL` sont configurés comme secrets (pas en clair)
**And** aucun `VPS_SSH_KEY` n'est requis — le deploy passe par le webhook Dokploy

---

### Story 1.5: Monitoring BetterStack (Uptime) & Logs Structurés

> **Absorbée par la story 10.1 (Epic 10)** — décidé le 2026-11-15. Texte conservé pour l'historique.

As an administrator (Alex),
I want uptime monitoring with < 2 min alerts and structured error logs,
So that I can sleep without worrying about the backend going down silently.

> **Rescopée le 2026-08-08** — le branchement PostHog réel (SDK + `POSTHOG_API_KEY`) sort de cette story et part en post-MVP avec Sentry, voir Story 1.8. Cette story ne couvre plus que BetterStack + logs FastAPI.

**Acceptance Criteria:**

**Given** BetterStack free account configuré
**When** le service `/health` est accessible
**Then** BetterStack envoie un heartbeat toutes les 60 secondes

**Given** le backend est indisponible (service down)
**When** 2 checks consécutifs échouent
**Then** Alex reçoit une alerte SMS et/ou email en < 2 minutes

**Given** les logs FastAPI
**When** une erreur 5xx se produit
**Then** elle est loggée en JSON structuré avec `{"level": "error", "path": "...", "status": 500, "error": "..."}`
**And** aucun `print()` ni stack trace brut n'apparaît en production

---

### Story 1.8: Monitoring avancé — PostHog réel & Sentry ✅ (clos le 2026-11-21 : code sur develop, variables de production posées, actif à la prochaine release)

> **Scope post-MVP** — décidé le 2026-08-08. Au lancement, BetterStack (uptime) + PostHog en stub DEBUG-only (story 1.7) + logs FastAPI suffisent. Cette story devient prioritaire juste après la sortie MVP, pour comprendre l'usage réel (funnels, rétention) et capter les crashs en prod.

As an administrator (Alex),
I want real PostHog analytics (funnels, retention, session replay) and Sentry error/crash tracking,
So that I can make product decisions from real usage data and catch bugs before users report them.

**Stack :** PostHog SDK réel (mobile + backend, derrière les stubs `analytics.ts`/`analytics.py` déjà câblés en story 1.7) + Sentry (mobile React Native + backend FastAPI). Pas de Grafana — éviter une stack métriques self-hosted supplémentaire sur le VPS partagé (2 vCPU/3.7 Go RAM, déjà eu un incident de charge, voir `docs/infra-serveur.md`).

**Acceptance Criteria (à affiner au moment de la story) :**

**Given** le SDK PostHog réel installé mobile + backend
**When** un event déjà défini dans la taxonomie (story 1.7) se produit
**Then** il part réellement vers PostHog (plus de stub DEBUG-only)

**Given** Sentry configuré mobile + backend
**When** une exception non gérée se produit
**Then** elle est reportée à Sentry avec contexte (user_id anonymisé, stack trace, breadcrumbs)

**Given** le dashboard PostHog
**When** Alex consulte les funnels
**Then** il voit le parcours onboarding → premier score → signup → conversion Premium avec taux de drop-off par étape

---

### Story 1.6: Dashboard Ops Admin — Interface Monitoring Unifiée — remplacée par l'Epic 10

> **Remplacée par l'Epic 10 « Ops console »** (décidé le 2026-11-15). Le dashboard unifié qui recréait les écrans de BetterStack, PostHog et Dokploy (latence P50/P95/P99, req/min, Traefik, `/admin/metrics`) est abandonné : le dashboard agrège l'état et renvoie vers ces outils. Voir `docs/ops-dashboard-besoins.md`.

---

### Story 1.7: Taxonomie & Instrumentation Events PostHog (Stub)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

## Epic 2: Authentification & Compte Utilisateur

Les utilisateurs peuvent créer un compte, s'authentifier, gérer leurs préférences de notifications, accorder ou refuser la géolocalisation et supprimer leurs données. L'identité utilisateur est établie bout en bout (mobile → backend → Supabase JWT).

**FRs couverts :** FR12, FR13, FR14, FR15

---

### Story 2.1: Inscription et Connexion Utilisateur (Supabase Auth)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.2: Gestion des Préférences de Notifications

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.3: Permission Géolocalisation (Opt-in sans Blocage)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.4: Suppression du Compte et Données Personnelles (RGPD)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.5: Mur de signup différé (accès invité au premier score)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.6: Sign in with Apple

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.7: Mot de passe oublié

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.8: Mini-sondage post-création de compte

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 2.9: Nom d’usage dans le Profil

En tant qu’utilisateur avec un compte permanent,
je veux choisir, modifier ou effacer mon nom d’usage,
afin que mon Profil m’identifie avec le nom que je souhaite sans exposer mon adresse e-mail comme identité principale.

**FRs couverts :** FR12, FR13

**Acceptance Criteria:**

**Given** un compte e-mail ou Apple permanent sans nom d’usage
**When** l’utilisateur ouvre le Profil
**Then** le Profil affiche un état explicite invitant à renseigner un nom d’usage
**And** aucun nom n’est inventé depuis son adresse e-mail.

**Given** un compte Apple dont le nom a été partagé lors de la création
**When** le compte est provisionné pour la première fois
**Then** le nom partagé peut préremplir le nom d’usage
**And** l’utilisateur peut le modifier ou l’effacer avant et après enregistrement.

**Given** l’écran d’édition du nom d’usage
**When** l’utilisateur saisit de 1 à 24 caractères (après `trim`) et enregistre
**Then** la valeur est validée côté API, persistée et affichée dans le Profil
**And** une saisie de 25 caractères ou plus, ou un champ inconnu, est rejetée avec une erreur exploitable (422)
**And** une saisie vide après `trim` est acceptée et efface le nom d’usage.

**Given** une modification en cours
**When** l’utilisateur annule
**Then** la valeur persistée reste inchangée.

**Given** un utilisateur qui efface son nom d’usage puis enregistre
**When** il revient au Profil ou se reconnecte
**Then** le nom d’usage est absent et l’état d’invitation est de nouveau affiché.

**Given** `display_name` est une donnée personnelle
**When** l’API traite le nom, retourne le Profil ou supprime le compte
**Then** elle ne le journalise jamais
**And** la suppression de compte efface la donnée avec la ligne utilisateur.

**Given** le Profil en mode sombre sur un iPhone de 375, 390 ou 430 pt
**When** un nom d’usage de 24 caractères est affiché ou édité
**Then** l’interface reste lisible et aucun texte ne déborde.

---

## Epic 3: Score Mer de Nuage & Consultation de Prévision

Les utilisateurs peuvent rechercher un sommet, consulter le verdict probabiliste avec score, détail des conditions météo, fenêtre temporelle optimale, indicateur de stabilité et message contextuel hors-saison. L'app affiche un message dégradé gracieux en cas d'indisponibilité.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR38

---

### Story 3.1: Algorithme Score & Endpoint API Score

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 3.2: Seed Base de Données des Sommets

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 3.3: Recherche de Sommet & Favoris

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 3.4: Écran Principal — ScoreCard & Affichage Verdict

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 3.5: Détail Conditions Météo, Fenêtre Temporelle & Stabilité

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

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
**Then** le deep link `https://<hôte ops de l'environnement>/sommet/{slug}` (prod : `ops.cloudbreak-app.com`) est copié dans le presse-papiers ou partagé via le sheet iOS natif

**Given** un utilisateur qui reçoit un deep link
**When** il l'ouvre sur iOS
**Then** iOS Universal Links ouvre l'app directement sur l'écran de prévision du sommet correspondant
**And** si l'app n'est pas installée, il est redirigé vers l'App Store

---

✅ **Epic 3 complète — 6 stories (couverture FR1–FR11, FR38)**

---

## Epic 4: Freemium & Monétisation

Les utilisateurs voient la limite gratuite, rencontrent le paywall au bon moment, peuvent s'abonner en Premium mensuel (4,99 €/mois) ou Premium annuel (44,99 €/an) via StoreKit 2, démarrer un trial gratuit. Les abonnés accèdent aux consultations illimitées.

**FRs couverts :** FR16, FR17, FR18, FR19, FR20, FR21

---

### Story 4.1: Quota Freemium Backend (1 Check/Jour)

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 4.2: Paywall Mobile & Conversion

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 4.3: Abonnements StoreKit 2 (Premium mensuel & annuel)

As a user,
I want to subscribe to Premium via Apple In-App Purchase (monthly or annual),
So that I get unlimited forecasts with native, secure payment.

**Acceptance Criteria:**

**Given** `PaywallScreen` affiché
**When** l'utilisateur choisit "Mensuel — 4,99 €/mois" ou "Annuel — 44,99 €/an"
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

### Story 4.4: Conformité Apple App Store — Legal, Paywall & Restauration achats

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 4.5: Service web Cloudbreak Ops — Pages légales

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

## Epic 5: Notifications & Alertes

Les utilisateurs Premium reçoivent des alertes push proactives sur leurs sommets favoris et leur région. Tous les utilisateurs reçoivent la notification GPS terrain. Chaque type est configurable indépendamment.

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

### Story 5.2: Alertes Push Favoris & Régionales (Premium)

As a Premium user,
I want to receive push alerts when ideal sea of clouds conditions are predicted for my favorites,
So that I never miss an opportunity without having to check the app manually.

**Acceptance Criteria:**

**Given** un job de vérification planifié (cron ou tâche périodique backend)
**When** les conditions d'un sommet favori d'un utilisateur Premium passent en 🟢 (score ≥ 70%)
**Then** une notification push est envoyée : "Conditions idéales prévues demain 6h sur [sommet] — 87% 🟢"
**And** la notification n'est envoyée qu'une seule fois par sommet/fenêtre temporelle

**Given** une alerte régionale (FR23) — *reportée en V2 (décision du 2026-10-12), non livrée avec la 5.2*
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

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 6.2: Photo Optionnelle & Calcul Taux de Précision

⏸ **Dropée le 2026-08-08** (décision explicite) — pas de priorité de reprise.

---

## Epic 7: Onboarding & Mode Offline

Les nouveaux utilisateurs complètent le parcours d'onboarding narratif. L'app gère gracieusement l'absence de réseau avec cache TTL 2-3h, bandeau d'âge des données et message d'indisponibilité clair.

**FRs couverts :** FR30, FR31, FR32, FR33, FR34

---

### Story 7.1: Parcours Onboarding Narratif

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 7.2: Mode Offline-Light & Cache TTL

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

### Story 7.3: Système unifié états UI — loading, skeletons, erreurs, états vides

✅ **Fait** — mergée sur `develop`. Statut : `sprint-status.yaml` ; détail technique : `backend/docs/story-*.md` / `mobile/docs/story-*.md`.

---

## Epic 8: Growth & Mécaniques Virales (V2)

**Objectif :** Activer la croissance organique via le parrainage, la gamification et le partage natif. Toutes ces features sont post-MVP — elles s'appuient sur la boucle de validation terrain déjà en place (Epic 6).

**FRs couverts :** nouveaux — voir go-to-market.md et prd.md section V2

---

### Story 8.1: Carte de Prédiction Partageable

As a user,
I want to share a beautiful prediction card before my hike,
So that my followers discover Cloudbreak naturally through my content.

**Acceptance Criteria:**

**Given** l'utilisateur consulte un score sur l'écran principal
**When** il appuie sur le bouton "Partager"
**Then** une image est générée automatiquement (iOS `UIGraphicsImageRenderer`) avec : nom du sommet, altitude, score %, verdict coloré, date/heure, logo Cloudbreak discret
**And** la feuille de partage native iOS s'ouvre avec l'image prête

**Given** l'image générée
**When** elle est partagée sur Instagram ou TikTok
**Then** elle respecte la palette Cloudbreak (`#EFE8DC`, Josefin Sans 700) et est lisible sur fond sombre comme clair

**Given** le partage complété
**When** quelqu'un clique le lien éventuel
**Then** il est redirigé vers la page de repli ops `<hôte ops>/sommet/{slug}`

---

### Story 8.2: Système de Parrainage

As a Premium user,
I want to invite friends and earn a free month,
So that I'm rewarded for growing the community.

**Acceptance Criteria:**

**Given** l'utilisateur est Premium et accède à l'onglet Profil
**When** il appuie sur "Inviter un ami"
**Then** un code unique de parrainage lui est affiché + bouton partage natif iOS

**Given** un nouvel utilisateur entre un code de parrainage à l'inscription
**When** il complète sa première validation terrain
**Then** les deux comptes reçoivent 1 mois Premium gratuit

**Given** le parrain a déjà 5 filleuls convertis
**When** un 6e essaie d'utiliser son code
**Then** le code est refusé avec message explicatif (anti-abus)

**Given** le parrain n'est plus Premium au moment où le filleul valide
**When** l'activation se déclenche
**Then** seul le filleul reçoit le mois gratuit — le parrain est notifié qu'il doit être Premium pour en bénéficier

---

### Story 8.3: Badges & Niveaux de Progression

As a user,
I want to earn badges for my real outdoor achievements,
So that the app reflects my mountain experiences, not just my app usage.

**Acceptance Criteria:**

**Given** l'utilisateur ouvre l'onglet Profil
**When** il fait défiler vers le bas
**Then** il voit sa section "Mes hauts faits" avec son niveau actuel et ses badges débloqués

**Given** les niveaux : 0=Curieux / 1=Explorateur (1 val.) / 2=Chasseur de nuages (5) / 3=Guetteur des cimes (15) / 4=Maître des sommets (30) / 5=Architecte des nuages (50+)
**When** l'utilisateur atteint un seuil
**Then** une animation in-app se déclenche + notification locale "Nouveau niveau débloqué 🎉"

**Given** les badges terrain : ☁️ Premier nuage / 📍 Chasseur local (3 sommets) / ✅ Bonne prédiction / 🌅 Lève-tôt (avant 7h) / 🌄 Crépuscule (après 19h) / 🎯 Précision (5 correctes consécutives) / 📸 Photographe (3 photos jointes)
**When** la condition est remplie à la validation terrain
**Then** le badge se débloque immédiatement avec animation

**Given** les badges géographie : 🏔️ Alpin (>2000m) / 🌋 Volcanique / ⛰️ Pyrénéen / Vosgien / Cévenol / Jurassien / 🗺️ Grand explorateur (3 massifs)
**When** le backend détecte la région/altitude du sommet validé
**Then** le badge correspondant se débloque

**Given** les badges saison : ❄️ Mer d'hiver (jan-fév) / 🌸 Réveil printanier (mars) / 🍂 Automne doré (oct-nov)
**When** la validation est effectuée dans la période correspondante
**Then** le badge se débloque

**Given** les badges communauté : 🤝 Parrain (1er filleul converti) / 🌟 Ambassadeur (3 filleuls)
**When** la conversion est confirmée côté backend
**Then** le badge se débloque sur le compte du parrain

**Note :** badges non visibles par les autres utilisateurs dans cette version (pas de profil public).

---

### Story 8.4: Replay de Prédiction

As a user,
I want to share a "prediction vs reality" card after my hike,
So that I can show my followers how accurate the forecast was.

**Acceptance Criteria:**

**Given** l'utilisateur a validé une prédiction terrain avec photo jointe
**When** il accède à l'historique de cette validation
**Then** un bouton "Créer mon replay" est disponible

**Given** l'utilisateur génère un replay
**When** l'image est créée
**Then** elle contient : score prédit + photo terrain + verdict "Confirmé ✅" ou "Infirmé ❌" + nom du sommet + date

**Given** le replay partagé sur les réseaux
**When** un non-utilisateur le voit
**Then** il comprend immédiatement le concept de l'app (preuve sociale authentique)

---

### Story 8.5: Récap Annuel "Tes nuages [année]"

As a user,
I want a yearly summary of my sea of clouds experiences,
So that I can share my mountain year and feel connected to the Cloudbreak community.

**Acceptance Criteria:**

**Given** le 1er janvier à 9h
**When** l'utilisateur a effectué au moins 1 validation dans l'année écoulée
**Then** il reçoit une notification push "Ton année Cloudbreak est prête ☁️"

**Given** l'utilisateur ouvre le récap
**When** il fait défiler l'écran
**Then** il voit : nombre de validations, massifs visités, meilleure prédiction (score + sommet), niveau atteint, comparaison communauté (top X%)

**Given** l'écran récap affiché
**When** l'utilisateur appuie sur "Partager mon récap"
**Then** la capture d'écran iOS native s'ouvre prête à partager

---

## Epic 9: Landing Page & Présence Web (V2 — pré-lancement)

**Objectif :** Créer une présence web qui génère du trafic organique Google, sert de destination aux deep links partagés, et renforce la crédibilité auprès de la presse et des partenaires.

**Dépendances :** domaine réservé (fait le 2026-08-09, `cloudbreak-app.com`), Dokploy configuré (déjà en place) — reste à créer l'environnement Dokploy prod dédié

---

### Story 9.1: Landing Page cloudbreak-app.com

As a potential user who discovers Cloudbreak via a shared link or Google,
I want a clear and compelling landing page,
So that I understand the app immediately and download it.

**Acceptance Criteria:**

**Given** un visiteur arrive sur cloudbreak-app.com
**When** la page se charge
**Then** le temps de chargement est < 2s et la page est indexable par Google (pas de JS-only rendering)

**Given** la page chargée
**When** le visiteur lit le hero
**Then** il voit : H1 "Sais-tu si ça vaut le coup de te lever à 5h du matin ?" + sous-titre + CTA App Store + visuel mer de nuage + mockup iPhone

**Given** le visiteur scroll
**When** il parcourt la page
**Then** il voit dans l'ordre : comment ça marche (3 étapes) → pour qui (4 profils) → pourquoi Cloudbreak → télécharger

**Given** une prédiction partagée via deep link (ex: ops.cloudbreak-app.com/sommet/colombier)
**When** un non-utilisateur iOS clique le lien
**Then** il voit la page du sommet avec le score prédit + CTA "Télécharger pour voir ta prévision"

**Given** la page en ligne
**When** Google l'indexe
**Then** les balises SEO sont correctes : `<title>`, meta description, H1, schema.org `SoftwareApplication`, images avec `alt` descriptifs

**Stack :** HTML/CSS statique déployé comme service Dokploy, Traefik HTTPS automatique sur cloudbreak-app.com

---

### Story 9.2: Optimisation ASO App Store

As the app developer,
I want an optimized App Store listing,
So that Cloudbreak ranks in the top 10 for "mer de nuage" and related searches.

**Acceptance Criteria:**

**Given** la soumission App Store
**When** le listing est en ligne
**Then** le titre est "Cloudbreak — Mer de nuage" (≤30 chars), le sous-titre est "Prédiction météo sommet" (≤30 chars)

**Given** le champ keywords (100 chars)
**When** rempli
**Then** il contient : `mer,nuage,sommet,météo,montagne,rando,inversion,cloud,altitude,prévision,alpinisme,nuages,paysage` sans répétition des mots du titre/sous-titre

**Given** la description App Store
**When** les 3 premières lignes s'affichent (avant "Plus")
**Then** elles commencent par "Sais-tu si ça vaut le coup de te lever à 5h du matin ?" et expliquent le verdict en 3 phrases maximum

**Given** les 5 screenshots obligatoires (format 6.9")
**When** un visiteur les parcourt
**Then** screenshot 1 : score "84% — Haute probabilité 🟢" avec photo de mer de nuage + texte "Sais-tu si ça vaut le coup ?" — screenshot 2 : recherche/favoris — screenshot 3 : détail météo — screenshot 4 : notification push — screenshot 5 : validation terrain
**And** le fond respecte la palette `#EFE8DC`, texte Josefin Sans 700

**Given** les catégories
**When** soumises
**Then** primaire = Météo, secondaire = Sport et activité de plein air

---

✅ **Epic 7 complète — 2 stories (couverture FR30–FR34)**


---

## Epic 10: Ops console

L'administrateur (Alex) est alerté en moins de 2 minutes quand un service, un cron ou le serveur tombe, voit en un écran la version déployée et les KPIs clés de la prod, puis (v1) peut offrir Premium par email avec audit. Remplace la story 1.6 et absorbe la 1.5. Besoins et décisions : `docs/ops-dashboard-besoins.md`.

**FRs couverts :** FR35, FR36, FR37 · **NFR :** NFR7

**Principes (décidés le 2026-11-15) :** alertes d'abord, dashboard ensuite (l'uptime vient d'un service externe, jamais du VPS surveillé) ; le dashboard agrège et renvoie vers BetterStack / PostHog / Sentry, il ne recrée pas leurs écrans ; le backend reste le seul à écrire en DB ; v0 en lecture seule, écritures en v1 ; admin hébergé dans `ops/` sous `/[locale]/admin` ; auth = JWT Supabase + claim `app_metadata` + allowlist UUID ; i18n fr/en obligatoire ; pas de clé API Dokploy dans ops ; pas de Grafana.

**Contraintes communes à toutes les stories :** livrées via Codex avec un prompt carré (fichiers cibles, comportement, commande de validation). **Ne pas toucher :** `backend/app/domain/score*.py`, `backend/alembic/versions/` existantes (on en ajoute), `backend/app/db/peaks_data.json`, `mobile/ios/`, `.env` et tout secret. Branche `feature/<story>` depuis `develop`, PR squash vers `develop` (aucun merge sur `main` sans accord d'Alexandre).

---

### Story 10.1: Alertes d'abord — uptime, heartbeats et agent serveur

As an administrator (Alex),
I want to be alerted within 2 minutes when a service, a cron, a backup or the server goes wrong,
So that I learn about an outage before users do, with monitoring that does not depend on the VPS it watches.

**Dépendances :** aucune (première story de l'epic). Absorbe la story 1.5.

**Acceptance Criteria:**

**Given** BetterStack configuré avec des moniteurs HTTP sur `https://api.cloudbreak-app.com/health`, `https://ops.cloudbreak-app.com/fr/privacy` (prod uniquement : le dev n'est pas surveillé, décision du 2026-11-16)
**When** un service répond autrement qu'en 2xx (ou `/health` sans `database: ok` et `redis: ok`) pendant 2 vérifications consécutives
**Then** Alex reçoit une alerte email (et SMS/push si activé) en moins de 2 minutes (NFR7)
**And** l'alerte nomme le service et l'environnement

**Given** les crons de purge anonymes (06:05 prod), alertes favoris (18:05 prod) et la sauvegarde des bases (03:00 UTC)
**When** un script se termine
**Then** il appelle l'URL de heartbeat BetterStack correspondante (secret dans un fichier 600, jamais en argument) — **fait le 2026-11-18 pour les trois jobs** (sauvegarde, purge prod, favoris prod ; marge 2 h, alerte e-mail)
**And** un run manquant ou en échec (code HTTP ≠ 200) déclenche une alerte dans le délai de grâce configuré

**Given** l'agent serveur BetterStack installé sur le VPS
**When** le disque dépasse 85 %, **ou** la RAM *disponible* passe sous 10 % (colonne `available` de `free -m`, pas `used`), **ou** le swap utilisé dépasse 75 %
**Then** Alex est alerté
**And** la consommation RAM/CPU de l'agent a été mesurée avant activation en prod (référence relevée le 2026-11-15 : 3,8 Go de RAM, 1,75 Go disponibles ; swap 4 Go utilisé à 1,9 Go ; disque 56 % soit 17 Go libres ; load average 0,1 ; Dokploy seul ≈ 780 Mo ; 2 vCPU) et notée dans `docs/infra-serveur.md` ; si l'agent dépasse ~100 Mo, il n'est pas activé et un script cron plus léger le remplace (décision consignée)

**Given** le script `/srv/scripts/backup-databases.sh` (cron 03:00 UTC)
**When** il se termine
**Then** le heartbeat n'est envoyé **que si toutes les bases ont été sauvegardées et la copie hors site réussie** (le script refondu le 2026-11-18 sort déjà en code non nul à la moindre erreur ; il reste à renseigner `HEARTBEAT_URL` dans `/srv/scripts/backup.env`, le script appelle l'URL en cas de succès et `<URL>/fail` en cas d'échec)
**And** la base de chaque environnement Cloudbreak, **prod comprise**, est couverte (fait le 2026-11-18 : découverte automatique des 6 bases du VPS + export Supabase prod ; détail dans `docs/sauvegardes/`)
**And** un fichier de sauvegarde datant de plus de 26 h déclenche l'alerte (garde-fou en plus du heartbeat : alerte BetterStack « pas de signal sous 26 h »)

**Given** le projet OVH Public Cloud qui héberge la copie hors site chiffrée des sauvegardes (bucket S3 `vps-db-backups-7f3a9c2e`)
**When** la consommation mensuelle dépasse le seuil fixé (5 € par défaut, quelques centimes attendus) **ou** que le dépôt dépasse 2 Go (garde-fou du script)
**Then** Alex reçoit une alerte e-mail (alerte de consommation OVH, ou échec de la sauvegarde)
**And** aucune clé OVH n'est stockée dans l'application ou dans le navigateur (la carte « Outils » du dashboard renvoie seulement vers la console de facturation OVH)

**Given** une panne simulée (arrêt d'un service sur dev)
**When** le délai de détection est mesuré
**Then** il est < 2 minutes et le résultat est consigné dans `docs/infra-serveur.md`

**Given** une erreur 5xx dans le backend
**When** elle est loggée
**Then** le log est un JSON structuré `{"level":"error","path":"...","status":500,"error":"..."}` sans `print()` ni stack trace brute en prod (reprise de l'AC de 1.5)

**Point bloquant : levé le 2026-11-18.** La série `cloudbreak-postgres-*` historique venait de la base **dev** ; la prod n'était pas sauvegardée. Le script a été refondu (découverte automatique de toutes les bases, échec bruyant, export Supabase prod, copie hors site chiffrée vers OVH S3), la restauration testée (prod, Supabase, depuis OVH). Voir `docs/sauvegardes/recapitulatif.md`.

**Fichiers cibles :** scripts VPS `~/cloudbreak-*.sh` et `/srv/scripts/backup-databases.sh` (ajout du ping heartbeat et de l'`exit` non nul, hors repo), `backend/app/main.py` / `backend/app/core/errors.py` (log 5xx structuré si absent), `docs/infra-serveur.md` (moniteurs, heartbeats, agent, mesure RAM). Aucun secret dans git.
**Tests à écrire :** test backend du log 5xx structuré (`backend/tests/test_errors.py` ou fichier existant équivalent) ; la partie BetterStack/VPS se valide par une panne simulée et une checklist manuelle.
**Validation :** `make validate` (backend) + checklist manuelle (panne simulée, heartbeat manquant). Une connexion `ssh vps-ovh-projets` à la fois, pas de build Dokploy en parallèle.

---

### Story 10.2: Version déployée — `GET /version` et comparaison à `main`

As an administrator (Alex),
I want to see which Git commit is actually deployed on each service and environment,
So that I can verify a release without opening Dokploy and without storing a Dokploy API key in ops.

**Dépendances :** aucune technique ; consommée par 10.4.

**Acceptance Criteria:**

**Given** le backend construit par le Dockerfile
**When** `GET /version` est appelé
**Then** il répond `200` avec `{"service":"backend","sha":"<sha du build>","built_at":"<ISO 8601 UTC>"}` sans authentification
**And** il n'expose ni variable d'environnement ni secret

**Given** ops construit par Nixpacks / Next.js
**When** `GET /version` (route handler ops) est appelé
**Then** il répond au même format avec `"service":"ops"`
**And** la route est exclue du middleware d'auth admin et du sitemap, et n'affecte pas les pages légales ni l'AASA

**Given** les services en production
**When** `GET /version` est appelé sur le backend et sur ops
**Then** la réponse contient aussi `"version"` (version du `package.json` pour ops, version applicative du backend) et `"tag"` (tag Git `vX.Y.Z` si le SHA déployé est exactement un tag, sinon `null`)
**And** pour le mobile, qui n'a pas de serveur, le dashboard affiche la version publiée sur l'App Store (API publique iTunes Lookup de l'app `id6816759640`, sans clé) ; le numéro de build n'est pas disponible par cette API et n'est pas affiché

**Given** le SHA n'est pas injecté (build local)
**When** `/version` est appelé
**Then** `sha` vaut `"unknown"` sans erreur

**Given** le SHA déployé en prod et le `main` GitHub du repo
**When** le dashboard compare les deux
**Then** il affiche « à jour » ou « en retard de N commits » via l'API GitHub publique (sans token, ou token lecture seule en variable d'environnement ops)
**And** aucune clé Dokploy n'est utilisée

**Fichiers cibles :** `backend/Dockerfile` (ARG/ENV du SHA), `backend/app/api/v1/endpoints/` ou `backend/app/main.py` (route `/version`), `backend/tests/test_api_version.py`, `ops/app/version/route.ts` (ou équivalent App Router) + test Vitest co-localisé, config de build ops (variable de SHA), `backend/http/version.http`.
**Tests à écrire :** nominal, SHA absent (`unknown`), absence de fuite de secret, route ops sans effet sur les pages légales.
**Validation :** `make validate` (backend) et `npm run validate` (ops).

---

### Story 10.3: Backend admin en lecture seule — auth, audit, KPIs, heartbeats

As an administrator (Alex),
I want a protected read-only admin API with an audit trail,
So that the ops dashboard can show KPIs and cron/backup status without ever writing to the database from the web app.

**Dépendances :** 10.1 (URLs de heartbeat et format des signaux) ; 10.4 la consomme.

**Acceptance Criteria:**

**Given** un JWT Supabase valide dont `app_metadata.role == "admin"` ET dont le `sub` figure dans l'allowlist `ADMIN_USER_IDS` (variable d'env backend)
**When** il appelle `GET /api/v1/admin/overview`
**Then** il reçoit `200` avec : utilisateurs total, utilisateurs actifs sur 30 jours, abonnements actifs, abonnements en essai, checks par jour (7 derniers jours)
**And** aucun email ni donnée personnelle n'est renvoyé

**Given** le même admin authentifié
**When** il appelle `GET /api/v1/admin/overview`
**Then** la réponse contient aussi une série quotidienne sur 90 jours : nombre cumulé d'utilisateurs (calculé depuis `users.created_at`, avec la répartition anonymes / permanents) et nombre de checks par jour (depuis `predictions.created_at`)
**And** la limite est documentée : un compte supprimé ou purgé disparaît de l'historique cumulé ; si ce biais devient gênant, une table de snapshots quotidiens (nouvelle migration) remplacera le calcul

**Given** un JWT valide mais sans claim admin, ou claim admin mais UUID hors allowlist, ou allowlist vide
**When** l'endpoint admin est appelé
**Then** la réponse est `403` avec `{"detail":"...","code":"ADMIN_FORBIDDEN"}`
**And** un appel sans `Authorization` renvoie `403` (comportement `HTTPBearer`)

**Given** n'importe quel appel à un endpoint admin
**When** il est traité
**Then** une ligne est écrite dans la table `admin_audit_log` (acteur UUID, action, ressource, horodatage UTC, résultat) créée par une **nouvelle** migration Alembic qui passe sur base vide
**And** le journal ne contient ni email ni secret

**Given** les scripts cron/sauvegarde du VPS
**When** ils signalent leur fin (`POST /internal/heartbeats/<job>` avec `X-Cron-Secret`)
**Then** le backend enregistre la dernière exécution (date, statut) et `GET /api/v1/admin/overview` expose l'état de chaque job (purge, favoris, sauvegarde) avec un indicateur « en retard » si dépassement du délai attendu
**And** la route `/internal/*` reste restreinte par la règle Traefik existante

**Given** le pattern « le backend est le seul à écrire en DB »
**When** l'admin consulte l'overview
**Then** l'endpoint est strictement en lecture (hors journal d'audit) ; aucune action d'écriture métier n'existe en v0

**Fichiers cibles :** `backend/app/api/v1/endpoints/admin.py`, `backend/app/core/dependencies.py` (dépendance `require_admin`), `backend/app/core/config.py` (`ADMIN_USER_IDS`), `backend/app/models/admin_audit_log.py` + modèle du dernier heartbeat, `backend/app/schemas/admin.py`, `backend/app/services/admin_overview.py`, nouvelle migration `backend/alembic/versions/`, `backend/app/main.py` (router), `backend/http/admin.http` (nominal, sans `Authorization` → 403, non-admin → 403, payload invalide → 422), `backend/docs/security.md` (surface admin).
**Tests à écrire :** `tests/test_api_admin.py`, `tests/test_admin_dependencies.py`, `tests/test_models_admin_audit_log.py`, `tests/test_migration_*` (base vide), flux dans `tests/features/test_admin_flow.py`, JWT valide/expiré/invalide.
**Validation :** `make validate` (backend). Revue `cloudbreak-security` obligatoire (auth, data, API).

---

### Story 10.4: Dashboard ops v0 — `/[locale]/admin`

As an administrator (Alex),
I want one screen showing global status, deployed versions, KPIs, crons/backups and server health for production,
So that I can check that everything works in a few seconds and jump to BetterStack / PostHog / Sentry for details.

**Dépendances :** 10.1, 10.2, 10.3.

**Découpage pour la livraison (2026-11-16) :** cette story se livre en sept parties, 10.4a à 10.4g (socle, sources lues par ops, Utilisateurs, Santé, Déploiements, Accueil, pages légales). Le périmètre de chaque partie et les maquettes associées (identifiants `HOME-*`, `SAN-*`, `DEP-*`, `USR-*`, `ACC-*`, `NAV-*`, `TST-*`, `ERR-*`, `LEG-*`) sont dans `docs/ops-console-stories.md`. Les critères ci-dessous valent pour l'ensemble.

**Sources (décision du 2026-11-16) :** les chiffres et l'état des crons viennent du backend (`/admin/overview`). L'état des services, les métriques serveur (BetterStack) et les versions (`/version`, GitHub, App Store) sont lus par le **serveur ops**, jamais par le navigateur, pour que la console reste lisible quand l'API est en panne. Le serveur ops valide lui-même la session admin (JWKS, claim, allowlist) avant de répondre.

**Acceptance Criteria:**

**Given** un visiteur non connecté ou non admin
**When** il ouvre `/fr/admin`
**Then** il est redirigé vers la connexion ou reçoit un refus, sans qu'aucune donnée admin ne soit chargée
**And** la page porte `noindex`, n'apparaît pas dans `sitemap.ts` et est exclue de `robots`

**Given** Alex connecté (JWT Supabase avec claim admin)
**When** le dashboard se charge
**Then** il voit, pour la **prod uniquement** (pas de switch d'environnement) : statut global (vert/orange/rouge), versions déployées backend et ops avec écart à la branche GitHub, KPIs (utilisateurs, abonnements actifs/essai, checks/jour), état des crons et sauvegardes (dernier run, en retard ou non), état serveur (CPU/RAM/disque) avec lien vers BetterStack
**And** chaque bloc renvoie vers l'outil source (BetterStack, PostHog, Sentry) au lieu de recréer ses écrans

**Given** un bloc dont la source échoue, est lente ou ne renvoie rien
**When** l'écran s'affiche
**Then** ce bloc montre son propre état loading / erreur / vide (composants unifiés), sans casser les autres blocs
**And** le chargement est un squelette aux dimensions finales du bloc (aucun saut de mise en page, aucun spinner plein écran), annoncé aux lecteurs d'écran, sans animation si `prefers-reduced-motion` est actif
**And** une source injoignable affiche « Source indisponible », le nom de la source, l'heure de la dernière donnée connue et « Réessayer » ; ce n'est jamais un état « en panne »
**And** la connexion gère « en cours », « identifiants incorrects » et « service injoignable » ; la console a une page d'erreur inattendue, une page introuvable et un bandeau « hors connexion »

**Given** Alex connecté
**When** il consulte l'accueil
**Then** une carte « Outils » propose un lien (nouvel onglet, `rel="noopener"`) vers BetterStack, Sentry, PostHog, Supabase, OVH et Brevo ; les URLs viennent de la configuration (`.env`), aucune clé n'est exposée ; un outil non encore branché (PostHog) est affiché « bientôt », inactif
**And** la console propose une déconnexion et des liens vers les pages CGU et confidentialité

**Given** une page CGU ou confidentialité
**When** le visiteur a une session admin valide dans son navigateur
**Then** un bouton « Retour à la console » apparaît dans l'en-tête ; sans session valide, rien n'est affiché et la page est strictement identique à aujourd'hui
**And** ce bouton est un petit composant client isolé, chargé après le rendu : s'il échoue, la page légale s'affiche quand même (c'est la seule exception à la règle d'isolation ci-dessous)

**Given** une action de l'administrateur (connexion, actualisation, nouvel essai sur une source, déconnexion)
**When** elle aboutit ou échoue
**Then** un toast l'annonce (succès, erreur ou info), avec icône et texte, annoncé aux lecteurs d'écran, sans masquer la navigation

**Given** les textes de l'écran
**When** la locale est `fr` ou `en`
**Then** toutes les chaînes viennent de `useTranslations()` et de `messages/fr.json` / `messages/en.json` (aucune string en dur)

**Given** un déploiement ops contenant l'admin
**When** les e2e Playwright tournent
**Then** les pages CGU, confidentialité, `/.well-known/apple-app-site-association` et `/sommet/[slug]` répondent comme avant
**And** aucun code admin n'est importé depuis les pages légales (isolation vérifiée par test) et un échec de l'admin ne fait pas échouer ces routes

**Fichiers cibles :** `ops/app/[locale]/admin/**` (page, layout), `ops/middleware.ts` (ou proxy Next 16 équivalent : protection `/admin`), `ops/src/components/admin/**`, `ops/src/lib/admin/**` (client API, jamais d'accès direct DB/Redis), `ops/messages/fr.json` et `en.json`, tests Vitest co-localisés, `ops/e2e/admin.spec.ts` et non-régression légale, `ops/.env.example` (URL API, hôte BetterStack).
**Tests à écrire :** garde d'accès (non connecté / non admin / admin), états loading/erreur/vide par bloc, toasts, liens externes, bouton de retour sur les pages légales (présent avec session admin, absent sinon), `noindex`, parité des clés fr/en, e2e d'isolation du site légal.
**Validation :** `npm run validate` (ops : format:check + lint + typecheck + coverage + build + e2e).

---

### Story 10.5 (v1): Recherche par email et offrir Premium

As an administrator (Alex),
I want to look up a user by email and grant them Premium access,
So that I can support users and offer free access without touching the database directly.

**Dépendances :** 10.3 (auth admin et journal d'audit), 10.4 (UI). **Hors v0.**

**Acceptance Criteria:**

**Given** un admin authentifié
**When** il saisit un email exact dans la recherche
**Then** le backend renvoie le compte correspondant (id, plan, statut, `expires_at`) ou `404`
**And** il n'existe aucune liste d'utilisateurs ni recherche partielle

**Given** une consultation par email
**When** elle est traitée
**Then** une ligne d'audit est écrite (acteur, action `user.lookup`, horodatage) sans stocker l'email en clair (hachage ou identifiant de compte)
**And** l'email n'est jamais écrit dans les logs applicatifs

**Given** un compte trouvé
**When** l'admin demande « offrir Premium » avec une durée
**Then** le backend crée ou prolonge l'abonnement via un endpoint protégé (`plan: "premium"`, `status` et `expires_at` définis pour un accès offert, distincts d'un achat Apple, par exemple une origine `granted`)
**And** une ligne d'audit `subscription.grant` est écrite ; Premium actif reste défini par `status ∈ {trial, active}` ET `expires_at` futur (`app/domain/entitlement.py`)
**And** un abonnement Apple réel n'est jamais écrasé par un octroi

**Given** la règle « email jamais exposé ni loggé »
**When** cette story est livrée
**Then** l'exception (recherche admin seulement, audit, aucune liste) est documentée dans `backend/docs/security.md`, `CLAUDE.md` et la politique de confidentialité si nécessaire

**Fichiers cibles :** `backend/app/api/v1/endpoints/admin.py` (lookup, grant), `backend/app/services/admin_users.py`, `backend/app/schemas/admin.py`, migration Alembic nouvelle si une colonne d'origine d'abonnement est ajoutée, `backend/http/admin.http`, `ops/src/components/admin/UserLookup*`, `ops/messages/*.json`, `backend/docs/security.md`.
**Tests à écrire :** lookup (trouvé, 404, non-admin 403, email invalide 422), grant (création, prolongation, refus si abonnement Apple actif), audit à chaque appel, absence d'email dans les logs, e2e ops du parcours.
**Validation :** `make validate` (backend) et `npm run validate` (ops). Revue `cloudbreak-security` obligatoire.

---

✅ **Epic 10 — 5 stories (10.1 à 10.4 en v0 lecture seule, 10.5 en v1)**
