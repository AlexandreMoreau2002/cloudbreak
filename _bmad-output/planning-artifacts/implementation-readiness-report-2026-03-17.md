---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
completedAt: "2026-03-17"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-17
**Project:** mer de nuage

## Document Inventory

| Document | Fichier | Statut |
|----------|---------|--------|
| PRD | `prd.md` | ✅ Complet (11 étapes) |
| Architecture | `architecture.md` | ✅ Complet (8 étapes) |
| Epics & Stories | `epics.md` | ✅ Complet (4 étapes, 7 epics, 25 stories) |
| UX Design | `ux-design-specification.md` | ✅ Complet (14 étapes) |

Aucun doublon. Aucun document manquant.

## PRD Analysis

### Functional Requirements (38 FRs)

**Prévision & Score (FR1–FR7)**
FR1 : Verdict probabiliste (🟢/🟡/🔴) par sommet, date et heure
FR2 : Score numérique de probabilité (ex: "87%")
FR3 : Détail des variables météo (cloud_base, humidité, vent, inversion thermique)
FR4 : Fenêtre temporelle optimale de visibilité
FR5 : Lever du soleil croisé avec fenêtre optimale
FR6 : Indicateur de stabilité ("Stable depuis 48h ✓" / "À reconfirmer ⚠")
FR7 : Message contextuel utile si conditions défavorables / hors-saison

**Recherche & Navigation (FR8–FR11)**
FR8 : Recherche sommet ou point de vue par nom
FR9 : Accès sommet depuis liste de favoris
FR10 : Ajout sommet aux favoris
FR11 : Partage prévision via deep link

**Compte & Auth (FR12–FR15)**
FR12 : Création de compte et authentification
FR13 : Suppression données personnelles (RGPD)
FR14 : Gestion préférences de notifications
FR15 : Géolocalisation accordée/refusée sans blocage

**Freemium & Monétisation (FR16–FR21)**
FR16 : Limite 1 consultation/jour utilisateur gratuit
FR17 : Paywall naturel au 2e check quotidien
FR18 : Abonnement Premium mensuel 5€/mois (StoreKit 2)
FR19 : Abonnement Pro annuel 45€/an (StoreKit 2)
FR20 : Consultations illimitées Premium/Pro
FR21 : Trial gratuit avant abonnement

**Notifications & Alertes (FR22–FR25)**
FR22 : Alertes push favoris (conditions idéales) — Premium/Pro
FR23 : Alertes push régionales mer de nuage — Premium/Pro
FR24 : Notification GPS à l'arrivée au sommet consulté
FR25 : Configuration/désactivation notifications par type

**Validation Terrain (FR26–FR29)**
FR26 : Confirmation/infirmation prévision depuis terrain
FR27 : Photo optionnelle jointe à la validation
FR28 : Enregistrement validation (GPS + horodatage)
FR29 : Calcul taux de précision algo par zone

**Offline-Light (FR30–FR32)**
FR30 : Affichage dernière prévision si offline (TTL 2-3h)
FR31 : Indication âge des données en mode offline
FR32 : Message clair si données expirées et réseau absent

**Onboarding (FR33–FR34)**
FR33 : Parcours onboarding narratif au premier lancement
FR34 : Invitation permissions pendant onboarding (refus possible)

**Monitoring & Ops (FR35–FR38)**
FR35 : Alerte admin si backend ou API météo indisponible
FR36 : Métriques serveur basiques consultables
FR37 : Événements business clés via PostHog
FR38 : Message dégradé gracieux lors d'indisponibilité service

**Total FRs : 38**

### Non-Functional Requirements (30 NFRs)

**Performance :** NFR1 (score < 500ms p95), NFR2 (verdict < 3s), NFR3 (cache < 100ms), NFR4 (mémoire ≤ 50MB)
**Fiabilité :** NFR5 (uptime ≥ 99%), NFR6 (dégradé gracieux API météo), NFR7 (alertes < 2min), NFR8 (CI/CD < 5min)
**Sécurité :** NFR9 (HTTPS/TLS), NFR10 (EU RGPD), NFR11 (géoloc consentement), NFR12 (StoreKit 2), NFR13 (DELETE user), NFR14 (privacy policy URL)
**Scalabilité :** NFR15 (1k→10k users), NFR16 (cache météo TTL 10min), NFR17 (provider abstrait swappable)
**Intégration :** NFR18 (iOS 16+), NFR19 (provider météo abstrait), NFR20 (Universal Links)
**Maintenabilité :** NFR21 (algo serveur uniquement), NFR22 (tests régression algo), NFR23 (logs structurés)
**i18n & Extensibilité :** NFR24 (strings externalisées), NFR25 (FR MVP, EN/DE/IT V2), NFR26 (design tokens + dark mode), NFR27 (feature flags), NFR28 (3 tailles iPhone), NFR29 (pas de troncature), NFR30 (QA textes longs)

**Total NFRs : 30**

### PRD Completeness Assessment

Le PRD est complet et bien structuré. 38 FRs couvrant 9 catégories fonctionnelles, 30 NFRs couvrant 7 dimensions qualité. Classification du projet claire (greenfield, iOS-first, mobile_app). Journeys utilisateurs définis (Sophie, Marc, Alex, Thomas). Périmètre MVP vs V2 explicitement délimité. Conformité App Store et RGPD documentées.

## Epic Coverage Validation

### Coverage Matrix

| FR | Requirement (résumé) | Couverture Epic/Story | Statut |
|----|---------------------|----------------------|--------|
| FR1 | Verdict probabiliste 🟢/🟡/🔴 | Epic 3 — Story 3.4 | ✅ Couvert |
| FR2 | Score numérique % | Epic 3 — Story 3.4 | ✅ Couvert |
| FR3 | Détail variables météo | Epic 3 — Story 3.5 | ✅ Couvert |
| FR4 | Fenêtre temporelle optimale | Epic 3 — Story 3.5 | ✅ Couvert |
| FR5 | Lever du soleil croisé | Epic 3 — Story 3.5 | ✅ Couvert |
| FR6 | Indicateur de stabilité | Epic 3 — Story 3.5 | ✅ Couvert |
| FR7 | Message contextuel hors-saison | Epic 3 — Story 3.6 | ✅ Couvert |
| FR8 | Recherche sommet par nom | Epic 3 — Story 3.3 | ✅ Couvert |
| FR9 | Accès depuis favoris | Epic 3 — Story 3.3 | ✅ Couvert |
| FR10 | Ajout aux favoris | Epic 3 — Story 3.3 | ✅ Couvert |
| FR11 | Partage deep link | Epic 3 — Story 3.6 | ✅ Couvert |
| FR12 | Création compte / auth | Epic 2 — Story 2.1 | ✅ Couvert |
| FR13 | Suppression données RGPD | Epic 2 — Story 2.4 | ✅ Couvert |
| FR14 | Préférences notifications | Epic 2 — Story 2.2 | ✅ Couvert |
| FR15 | Géoloc opt-in sans blocage | Epic 2 — Story 2.3 | ✅ Couvert |
| FR16 | Limite 1 check/jour gratuit | Epic 4 — Story 4.1 | ✅ Couvert |
| FR17 | Paywall au 2e check | Epic 4 — Story 4.2 | ✅ Couvert |
| FR18 | Abonnement mensuel 5€ StoreKit 2 | Epic 4 — Story 4.3 | ✅ Couvert |
| FR19 | Abonnement annuel 45€ StoreKit 2 | Epic 4 — Story 4.3 | ✅ Couvert |
| FR20 | Checks illimités Premium/Pro | Epic 4 — Stories 4.1, 4.3 | ✅ Couvert |
| FR21 | Trial gratuit | Epic 4 — Story 4.3 | ✅ Couvert |
| FR22 | Alertes push favoris Premium/Pro | Epic 5 — Story 5.2 | ✅ Couvert |
| FR23 | Alertes push régionales Premium/Pro | Epic 5 — Story 5.2 | ✅ Couvert |
| FR24 | Notification GPS terrain | Epic 5 — Story 5.3 | ✅ Couvert |
| FR25 | Config/désactivation notifs par type | Epic 5 — Stories 5.2, 5.3 | ✅ Couvert |
| FR26 | Confirmation/infirmation terrain | Epic 6 — Story 6.1 | ✅ Couvert |
| FR27 | Photo optionnelle validation | Epic 6 — Story 6.2 | ✅ Couvert |
| FR28 | Enregistrement GPS + horodatage | Epic 6 — Story 6.1 | ✅ Couvert |
| FR29 | Calcul taux précision algo par zone | Epic 6 — Story 6.2 | ✅ Couvert |
| FR30 | Cache offline TTL 2-3h | Epic 7 — Story 7.2 | ✅ Couvert |
| FR31 | Indication âge données offline | Epic 7 — Story 7.2 | ✅ Couvert |
| FR32 | Message données expirées/réseau absent | Epic 7 — Story 7.2 | ✅ Couvert |
| FR33 | Onboarding narratif premier lancement | Epic 7 — Story 7.1 | ✅ Couvert |
| FR34 | Permissions pendant onboarding | Epic 7 — Story 7.1 | ✅ Couvert |
| FR35 | Alerte admin downtime | Epic 1 — Story 1.5 | ✅ Couvert |
| FR36 | Métriques serveur basiques | Epic 1 — Story 1.5 | ✅ Couvert |
| FR37 | Events business PostHog | Epic 1 — Story 1.5 | ✅ Couvert |
| FR38 | Message dégradé gracieux | Epic 3 — Story 3.4 | ✅ Couvert |

### Missing Requirements

**Aucun FR manquant.** ✅

### Coverage Statistics

- Total PRD FRs : **38**
- FRs couverts dans les epics : **38**
- Couverture : **100%** ✅

## UX Alignment Assessment

### UX Document Status

✅ **Trouvé** — `ux-design-specification.md` (14 étapes complétées)

### Alignement UX ↔ PRD

| Élément UX | Présent dans PRD | Statut |
|-----------|-----------------|--------|
| Verdict 🟢/🟡/🔴 (oracle, pas dashboard) | FR1, FR2 | ✅ Aligné |
| Score affiché grand format (pattern Revolut) | FR2 | ✅ Aligné |
| Détail conditions en accordéon | FR3 | ✅ Aligné |
| Fenêtre temporelle + lever soleil | FR4, FR5 | ✅ Aligné |
| Indicateur stabilité | FR6 | ✅ Aligné |
| Message contextuel hors-saison | FR7 | ✅ Aligné |
| Recherche autocomplete + favoris | FR8–FR10 | ✅ Aligné |
| Deep link partage | FR11 | ✅ Aligné |
| Paywall formulé en bénéfice | FR17 | ✅ Aligné |
| ValidationBottomSheet (terrain) | FR26–FR27 | ✅ Aligné |
| Onboarding narratif 3 slides (Dolomites) | FR33–FR34 | ✅ Aligné |
| Mode offline bandeau âge données | FR30–FR32 | ✅ Aligné |
| Bottom tab bar 4 onglets glassmorphique | Architecture mobile nav | ✅ Aligné |
| CloudLayerViz (diagramme couche vs sommet) | Architecture composants | ✅ Aligné |
| Design tokens Josefin Sans / palette beige | Architecture `colors.ts` | ✅ Aligné |
| ThemeContext + dark mode natif | Architecture `ThemeContext` | ✅ Aligné |
| i18n-js strings externalisées | NFR24–NFR25 | ✅ Aligné |
| Responsive 3 breakpoints iPhone | NFR28–NFR30 | ✅ Aligné |
| WCAG AA + VoiceOver + reduceMotion | NFR (accessibilité) | ✅ Aligné |

### Alignement UX ↔ Architecture

| Composant UX | Support Architecture | Statut |
|-------------|---------------------|--------|
| 8 composants custom (ScoreCard, CloudLayerViz, WeekStrip, ConditionBadge, AlertCTA, PeakFavoriteChip, OnboardingSlide, PaywallScreen, ValidationBottomSheet) | `mobile/src/components/` listés dans arborescence | ✅ Supporté |
| `AsyncState<T>` pattern | Pattern défini dans architecture | ✅ Supporté |
| Cache offline `AsyncStorage` TTL | `cacheService.ts` défini | ✅ Supporté |
| Expo Router file-based navigation | Architecture mobile nav définie | ✅ Supporté |
| Performance < 3s affichage verdict | NFR1 + cache Redis + cacheService | ✅ Supporté |

### Warnings

Aucun avertissement — UX, PRD et Architecture sont entièrement alignés. ✅

## Epic Quality Review

### A. Validation de la valeur utilisateur par epic

| Epic | Titre | Valeur Utilisateur | Statut |
|------|-------|-------------------|--------|
| 1 | Fondation Technique & Infrastructure | ⚠️ Technique — exception justifiée : greenfield, nécessaire avant tout | ✅ Acceptable |
| 2 | Authentification & Compte Utilisateur | Les utilisateurs peuvent créer un compte, s'auth, gérer privacy | ✅ Valeur claire |
| 3 | Score Mer de Nuage & Consultation | Cœur du produit — verdict actionnable en < 3s | ✅ Valeur forte |
| 4 | Freemium & Monétisation | Utilisateurs peuvent accéder illimité via abonnement | ✅ Valeur claire |
| 5 | Notifications & Alertes | Utilisateurs ne ratent plus les opportunités | ✅ Valeur claire |
| 6 | Validation Terrain & Data Flywheel | Utilisateurs contribuent et améliorent l'algo | ✅ Valeur claire |
| 7 | Onboarding & Mode Offline | Onboarding + usage terrain sans réseau | ✅ Valeur claire |

**Note Epic 1 :** Epic technique accepté car projet greenfield — la fondation ne peut pas être découpée autrement. Epic 1 produit néanmoins un `/health` endpoint et un monitoring opérationnel (valeur admin FR35–FR37).

### B. Indépendance des Epics

| Test | Résultat |
|------|---------|
| Epic 2 peut fonctionner sans Epic 3 | ✅ Auth standalone |
| Epic 3 utilise Epic 1+2, standalone ensuite | ✅ |
| Epic 4 utilise Epic 1+2+3, standalone ensuite | ✅ |
| Epic 5 utilise Epic 1+2 (push tokens), standalone | ✅ |
| Epic 6 utilise Epic 3 (predictions existantes), standalone | ✅ |
| Epic 7 utilise Epic 1 (squelette mobile), standalone | ✅ |
| Aucune dépendance circulaire | ✅ |

### C. Qualité des Stories

#### Sizing et Valeur

| Story | Valeur utilisateur claire | Taille appropriée | Statut |
|-------|--------------------------|-------------------|--------|
| 1.1 Setup VPS Docker | Infra déployable reproductiblement | ✅ Single dev session | ✅ |
| 1.2 Backend FastAPI squelette | `/health` fonctionnel, linter, tests | ✅ | ✅ |
| 1.3 Mobile Expo squelette | App démarre, design tokens, nav | ✅ | ✅ |
| 1.4 CI/CD GitHub Actions | Pipelines < 5min | ✅ | ✅ |
| 1.5 Monitoring BetterStack | Alertes < 2min, PostHog ready | ✅ | ✅ |
| 2.1 Auth Supabase | Login/signup bout en bout | ✅ | ✅ |
| 2.2 Préférences notifs | Toggles sauvegardés | ✅ | ✅ |
| 2.3 Géoloc opt-in | Permission sans blocage | ✅ | ✅ |
| 2.4 Suppression RGPD | DELETE complet | ✅ | ✅ |
| 3.1 Algo score + endpoint | Algorithme + API testés | ✅ | ✅ |
| 3.2 Seed sommets | 50+ sommets en DB | ✅ | ✅ |
| 3.3 Recherche + favoris | Autocomplete + favoris | ✅ | ✅ |
| 3.4 ScoreCard verdict | Écran principal opérationnel | ✅ | ✅ |
| 3.5 Détail météo + fenêtre | Accordéon conditions + WeekStrip | ✅ | ✅ |
| 3.6 Message contextuel + deep link | Hors-saison + partage | ✅ | ✅ |
| 4.1 Quota freemium Redis | 1 check/jour enforced backend | ✅ | ✅ |
| 4.2 Paywall mobile | PaywallScreen au bon moment | ✅ | ✅ |
| 4.3 StoreKit 2 abonnements | Trial + mensuel + annuel | ✅ | ✅ |
| 5.1 Push infra | Token → APNs bout en bout | ✅ | ✅ |
| 5.2 Alertes favoris/régionales | Cron + envoi conditionnel | ✅ | ✅ |
| 5.3 Notif GPS terrain | Geofencing → ValidationBottomSheet | ✅ | ✅ |
| 6.1 Validation terrain | Oui/Non + enregistrement GPS | ✅ | ✅ |
| 6.2 Photo + taux précision | Upload + calcul accuracy | ✅ | ✅ |
| 7.1 Onboarding narratif | 3 slides Dolomites + permissions | ✅ | ✅ |
| 7.2 Mode offline | Cache TTL + bandeau âge | ✅ | ✅ |

#### Dépendances Forward

Analyse story par story — aucune story ne référence une story future dans ses AC. ✅

#### Création Tables DB à la demande

| Table | Créée dans | Justification |
|-------|-----------|---------------|
| `users` | Story 2.1 | Première story qui en a besoin |
| `peaks` | Story 3.2 | Première story qui en a besoin |
| `predictions` | Story 3.1 | Endpoint score en a besoin |
| `subscriptions` | Story 4.3 | StoreKit 2 receipt en a besoin |
| `terrain_validations` | Story 6.1 | Première story qui en a besoin |
| `events` (PostHog, pas DB) | Story 1.5 | Tracking analytics |

✅ Aucune table créée en avance — principe respecté.

### D. Starter Template

Architecture spécifie : `npx create-expo-app mobile --template default@sdk-55` + FastAPI setup.
Story 1.2 et 1.3 couvrent exactement ce setup. ✅

### E. Violations par Sévérité

#### 🔴 Violations Critiques
Aucune. ✅

#### 🟠 Issues Majeures
Aucune. ✅

#### 🟡 Préoccupations Mineures

1. **Story 3.1 (Algo + Endpoint)** — légèrement dense : algo + WeatherProvider + endpoint + cache Redis + tests. Reste implémentable en une session mais exige concentration. Recommandation : si besoin, découper en 3.1a (WeatherProvider) et 3.1b (endpoint + cache) lors du sprint planning.

2. **Story 4.3 (StoreKit 2)** — flow receipt verification Apple côté serveur est complexe (sandbox vs production). Gap noté dans l'architecture → bien documenté comme point à préciser en story. ✅ Géré.

3. **Story 5.2 (Cron alertes)** — le mécanisme de scheduling côté backend (cron ou tâche périodique) n'est pas précisé dans l'architecture. À clarifier lors de l'implémentation (option simple : APScheduler ou Celery beat).

### F. Checklist Conformité Best Practices

- [x] Tous les epics délivrent de la valeur utilisateur (Epic 1 exception justifiée)
- [x] Tous les epics sont indépendants
- [x] Toutes les stories sont correctement dimensionnées
- [x] Aucune dépendance forward
- [x] Tables DB créées uniquement quand nécessaires
- [x] Critères d'acceptance Given/When/Then complets
- [x] Traçabilité FR maintenue (38/38)

---

## Summary and Recommendations

### Overall Readiness Status

# ✅ READY FOR IMPLEMENTATION

### Issues Critiques Nécessitant une Action Immédiate

**Aucun.** Aucune violation critique détectée.

### Points d'Attention (Mineurs — Non Bloquants)

1. **Story 3.1 (Algo + Endpoint)** — dense. Option : découper en 3.1a (WeatherProvider abstraction) et 3.1b (endpoint score + cache Redis) lors du sprint planning si nécessaire.

2. **Story 4.3 (StoreKit 2)** — le flow exact de receipt verification Apple côté serveur est à documenter pendant l'implémentation. Utiliser le sandbox Apple dès J1 pour éviter les surprises.

3. **Story 5.2 (Cron alertes)** — mécanisme de scheduling à préciser : APScheduler (simple, intégré FastAPI) recommandé pour le MVP avant Celery.

### Prochaines Étapes Recommandées

1. **Lancer `/bmad-bmm-sprint-planning`** — générer le plan de sprint à partir des epics validés
2. **Enrôlement Apple Developer** — nécessaire avant la soumission App Store (99$/an, délai possible)
3. **Créer le compte BetterStack free** — monitoring à configurer dès l'Epic 1
4. **Créer les comptes Supabase (EU Frankfurt) et PostHog** — requis avant Epic 2
5. **Choisir et tester le provider météo gratuit** — OpenWeather ou Weatherbit, tester `cloud_base` sur 2-3 sommets alpins avant l'implémentation de l'algo (Story 3.1)

### Note Finale

Cette évaluation a identifié **0 issue critique**, **0 issue majeure** et **3 préoccupations mineures** sur 5 dimensions d'analyse (documents, FRs, UX alignment, qualité epics, architecture). Le projet **mer de nuage** dispose d'une base de planification solide, cohérente et implémentable.

**Métriques de couverture :**
- FRs couverts : **38/38 (100%)**
- NFRs adressés : **30/30 (100%)**
- Epics alignés PRD ↔ UX ↔ Architecture : **7/7 (100%)**
- Stories sans dépendance forward : **25/25 (100%)**
- Tables DB créées à la demande (pas en avance) : **✅**

**Assesseur :** Claude (PM/Scrum Master BMAD)
**Date :** 2026-03-17
