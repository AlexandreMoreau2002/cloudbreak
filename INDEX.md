# INDEX — Cloudbreak Documentation

> Carte de toute la documentation du projet. Mise à jour à chaque fin de session ou bloc de travail majeur.
> Dernière mise à jour : 2026-05-17

---

## Racine du projet

| Fichier | Contenu |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | **Source de vérité principale** — stack, architecture, formule de score complète (avec caps), structure git, commandes dev, workflow obligatoire par story, patterns de code, règles d'import escalier, modèle de données, variables d'env |
| [`TODO.md`](TODO.md) | Carnet de bord de session — stories en cours, prochaines faisables, backlog bloqué, dette technique, PRs mergées |
| [`PROGRESS.md`](PROGRESS.md) | Historique d'avancement global du projet |
| [`AGENTS.md`](AGENTS.md) | Référence des agents BMAD disponibles et leurs rôles |
| [`README.md`](README.md) | Présentation publique du projet |

---

## `/docs` — Documentation transverse

| Fichier | Contenu |
|---|---|
| [`docs/business-legal.md`](docs/business-legal.md) | StoreKit 2 (flux paiement, commission Apple 15/30%), structure juridique (particulier → micro-entreprise), gestion des remboursements Apple, prérequis pour lancer l'app |
| [`docs/lexique-technique.md`](docs/lexique-technique.md) | Glossaire des termes météo et techniques utilisés dans le projet (inversion, cloud base, Skew-T, etc.) |
| [`docs/sources-et-outils.md`](docs/sources-et-outils.md) | Sources de données météo (Open-Meteo, Météo-France AROME), outils et APIs utilisés |

---

## `/backend/docs` — Documentation technique backend

### Algorithme & Score

| Fichier | Contenu |
|---|---|
| [`backend/docs/algo-score.md`](backend/docs/algo-score.md) | Vue d'ensemble de l'algorithme de score mer de nuage |
| [`backend/docs/score-algorithm.md`](backend/docs/score-algorithm.md) | Détail complet de l'algorithme : composantes (cloud_base_score, inversion_score, humidity_score, wind_score, pressure_score), pondérations, système de caps (`_apply_score_caps`), conditions bloquantes, verdict high/medium/low |
| [`backend/docs/decision-cloud-cover-low-threshold.md`](backend/docs/decision-cloud-cover-low-threshold.md) | ADR — pourquoi le seuil bloquant `cloud_cover_low` est à 45% (pas 20%) |
| [`backend/docs/story-3-1-algorithme-score.md`](backend/docs/story-3-1-algorithme-score.md) | Story 3.1 — implémentation initiale de l'algorithme |
| [`backend/docs/story-3-1-pipeline-score.md`](backend/docs/story-3-1-pipeline-score.md) | Pipeline complet du calcul de score (de la requête météo au verdict) |
| [`backend/docs/story-3-5-contrat-score-presentation.md`](backend/docs/story-3-5-contrat-score-presentation.md) | Contrat API score (format de réponse, champs, fenêtre temporelle, stabilité) |
| [`backend/docs/story-refacto-i18n-score.md`](backend/docs/story-refacto-i18n-score.md) | Refacto i18n du score — messages contextuels multilingues |
| [`backend/docs/story-refactor-domain-layer.md`](backend/docs/story-refactor-domain-layer.md) | Refacto couche domaine backend |
| [`backend/docs/research/technical-score-algorithm-research-2026-03-19.md`](backend/docs/research/technical-score-algorithm-research-2026-03-19.md) | Recherche technique initiale sur l'algorithme (Skew-T, point de rosée, validation par météorologues) |

### Infrastructure & Services

| Fichier | Contenu |
|---|---|
| [`backend/docs/weather-cache-architecture.md`](backend/docs/weather-cache-architecture.md) | Architecture du cache météo Redis (TTL 10min, clés `weather:*`, stratégie hit/miss, provider abstrait Open-Meteo / Météo-France) |
| [`backend/docs/redis.md`](backend/docs/redis.md) | Configuration Redis, clés utilisées (`weather:*`, `quota:*`, `cache:*`), TTL, commandes utiles |
| [`backend/docs/supabase.md`](backend/docs/supabase.md) | Intégration Supabase — JWT ECC P-256 validé localement via JWKS, configuration auth |
| [`backend/docs/security.md`](backend/docs/security.md) | Audit sécurité backend — JWT, ports, secrets, données utilisateur, dépendances sensibles |
| [`backend/docs/peaks-data-management.md`](backend/docs/peaks-data-management.md) | Gestion des données sommets en production (21 597 entrées OSM) |
| [`backend/docs/peaks-generation.md`](backend/docs/peaks-generation.md) | Script `generate_peaks.py` — requêtes Overpass (peaks, saddles, viewpoints, volcans), enrichissement altitude Open-Meteo, retry exponentiel |
| [`backend/docs/product-audit.md`](backend/docs/product-audit.md) | État fonctionnel du backend — ce qui marche, ce qui est en cours |

### Stories backend (done)

| Fichier | Story |
|---|---|
| [`backend/docs/story-1-2-setup-backend.md`](backend/docs/story-1-2-setup-backend.md) | Setup FastAPI, Docker, structure initiale |
| [`backend/docs/story-2-1-auth-supabase.md`](backend/docs/story-2-1-auth-supabase.md) | Auth Supabase JWT côté backend |
| [`backend/docs/story-2-4-suppression-compte-rgpd.md`](backend/docs/story-2-4-suppression-compte-rgpd.md) | RGPD — endpoint DELETE user + anonymisation |
| [`backend/docs/story-3-2-seed-sommets.md`](backend/docs/story-3-2-seed-sommets.md) | Seed DB 21 597 sommets — procédure et notes |
| [`backend/docs/story-3-3-recherche-sommet-favoris.md`](backend/docs/story-3-3-recherche-sommet-favoris.md) | Endpoints recherche + favoris |
| [`backend/docs/story-4-1-quota-freemium.md`](backend/docs/story-4-1-quota-freemium.md) | Quota freemium Redis (1 check/jour, reset, bypass Premium) |
| [`backend/docs/retro-seed-sommets-et-spots.md`](backend/docs/retro-seed-sommets-et-spots.md) | Retro sur le seed des sommets — erreurs rencontrées, solutions |

---

## `/mobile/docs` — Documentation technique mobile

| Fichier | Contenu |
|---|---|
| [`mobile/docs/storekit.md`](mobile/docs/storekit.md) | StoreKit 2 — intégration iOS In-App Purchase, product IDs, flux achat/restauration |
| [`mobile/docs/security.md`](mobile/docs/security.md) | Audit sécurité mobile |
| [`mobile/docs/product-audit.md`](mobile/docs/product-audit.md) | État fonctionnel du mobile — écrans implémentés, hooks, services |
| [`mobile/docs/hors-sprint-ui-foundations.md`](mobile/docs/hors-sprint-ui-foundations.md) | Fondations UI — design system, composants de base, palette, typographie |

### Stories mobile (done)

| Fichier | Story |
|---|---|
| [`mobile/docs/story-1-3-setup-mobile.md`](mobile/docs/story-1-3-setup-mobile.md) | Setup Expo SDK 55, structure initiale |
| [`mobile/docs/story-2-1-auth-supabase.md`](mobile/docs/story-2-1-auth-supabase.md) | Auth Supabase côté mobile, AuthContext, AuthGuard |
| [`mobile/docs/story-2-4-suppression-compte-rgpd.md`](mobile/docs/story-2-4-suppression-compte-rgpd.md) | RGPD — suppression compte depuis l'app |
| [`mobile/docs/story-3-3-recherche-sommet-favoris.md`](mobile/docs/story-3-3-recherche-sommet-favoris.md) | Recherche + favoris — hooks usePeakSearch, useFavorites |
| [`mobile/docs/story-3-4-scorecard-ecran-principal.md`](mobile/docs/story-3-4-scorecard-ecran-principal.md) | ScoreCard, useScore, SelectedPeakContext, cache AsyncStorage TTL 2h |
| [`mobile/docs/story-3-5-detail-conditions-fenetre-stabilite.md`](mobile/docs/story-3-5-detail-conditions-fenetre-stabilite.md) | Détail conditions météo, fenêtre temporelle, indicateur de stabilité |
| [`mobile/docs/story-4-2-paywall-mobile.md`](mobile/docs/story-4-2-paywall-mobile.md) | Paywall freemium — écran de conversion, message au 2e check |
| [`mobile/docs/story-refacto-i18n-score.md`](mobile/docs/story-refacto-i18n-score.md) | Refacto i18n côté mobile |

---

## `/infra/docs` — Documentation infra

| Fichier | Contenu |
|---|---|
| [`infra/docs/security.md`](infra/docs/security.md) | Sécurité infra — Dokploy, Traefik, ports exposés, secrets |
| [`infra/readme.md`](infra/readme.md) | Procédure Dokploy — installation VPS OVH, configuration Traefik, déploiement |

---

## `/_bmad-output/planning-artifacts` — Planification produit

| Fichier | Contenu |
|---|---|
| [`prd.md`](_bmad-output/planning-artifacts/prd.md) | **PRD complet** — vision, KPIs, public cible, MVP vs V2 vs Vision, parcours utilisateurs, FRs/NFRs exhaustifs, modèle économique |
| [`architecture.md`](_bmad-output/planning-artifacts/architecture.md) | Architecture technique — stack, schéma de flux, décisions d'architecture, modèle de données détaillé |
| [`epics.md`](_bmad-output/planning-artifacts/epics.md) | **Epics 1-9 avec toutes les stories** et leurs ACs Given/When/Then. Epics 1-7 = MVP, Epics 8-9 = V2 (growth + landing page) |
| [`ux-design-specification.md`](_bmad-output/planning-artifacts/ux-design-specification.md) | Spec UX complète — écrans, flows, composants, DA (palette, typographie Josefin Sans) |
| [`go-to-market.md`](_bmad-output/planning-artifacts/go-to-market.md) | Stratégie marketing — positionnement, canaux d'acquisition (ASO, Camptocamp, TikTok, CAF, presse), plan de lancement 3 phases, spec gamification complète (badges + niveaux), modèle économique, Apple Editorial Team |
| [`aso-landing-page.md`](_bmad-output/planning-artifacts/aso-landing-page.md) | Copy App Store prêt à coller (titre, sous-titre, keywords, description complète), brief 5 screenshots, spec landing page cloudbreak.fr, SEO Google |
| [`pre-release-checklist.md`](_bmad-output/planning-artifacts/pre-release-checklist.md) | Checklist avant release 1.0.0 — App Store, Supabase, domaine, Universal Links |
| [`prd-validation-report.md`](_bmad-output/planning-artifacts/prd-validation-report.md) | Rapport de validation du PRD |
| [`implementation-readiness-report-2026-03-17.md`](_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-17.md) | Rapport de readiness à l'implémentation (mars 2026) |
| [`research/technical-score-algorithm-research-2026-03-19.md`](_bmad-output/planning-artifacts/research/technical-score-algorithm-research-2026-03-19.md) | Recherche technique approfondie sur l'algorithme Skew-T et l'inversion thermique |

---

## `/_bmad-output/implementation-artifacts` — Stories & sprint

| Fichier | Contenu |
|---|---|
| [`sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml) | **Kanban du sprint** — état de chaque story (backlog / in-progress / done) pour les 9 epics |
| [`2-2-gestion-preferences-notifications.md`](_bmad-output/implementation-artifacts/2-2-gestion-preferences-notifications.md) | Story : PATCH/GET préférences notif (notif_favorites, notif_regional, notif_terrain) |
| [`2-3-permission-geolocalisation-opt-in-sans-blocage.md`](_bmad-output/implementation-artifacts/2-3-permission-geolocalisation-opt-in-sans-blocage.md) | Story : expo-location opt-in, refus non-bloquant, hook useLocation |
| [`2-4-suppression-compte-donnees-personnelles-rgpd.md`](_bmad-output/implementation-artifacts/2-4-suppression-compte-donnees-personnelles-rgpd.md) | Story : RGPD DELETE user — done |
| [`4-3-abonnements-storekit-2-premium.md`](_bmad-output/implementation-artifacts/4-3-abonnements-storekit-2-premium.md) | Story : StoreKit 2, flux achat/restauration, webhooks Apple, SubscriptionContext |
| [`5-1-infrastructure-push-notifications-expo-push.md`](_bmad-output/implementation-artifacts/5-1-infrastructure-push-notifications-expo-push.md) | Story : Expo Push token, ExpoPushService, gestion DeviceNotRegistered |
| [`5-2-alertes-push-favoris-regionales-premium.md`](_bmad-output/implementation-artifacts/5-2-alertes-push-favoris-regionales-premium.md) | Story : cron alertes favoris (score ≥ 70) + alertes régionales, cooldown 12h, Premium only |
| [`5-3-notification-gps-validation-terrain.md`](_bmad-output/implementation-artifacts/5-3-notification-gps-validation-terrain.md) | Story : géofencing foreground (Haversine 500m), notif locale, ouvre ValidationBottomSheet |
| [`6-1-validation-terrain-confirmation-infirmation.md`](_bmad-output/implementation-artifacts/6-1-validation-terrain-confirmation-infirmation.md) | Story : POST /api/v1/validations, ValidationBottomSheet, data flywheel, stub gamification |
| [`6-2-photo-optionnelle-calcul-taux-de-precision.md`](_bmad-output/implementation-artifacts/6-2-photo-optionnelle-calcul-taux-de-precision.md) | Story : expo-image-picker (caméra uniquement), Supabase Storage, accuracy_rate ≥ 5 validations |
| [`7-1-parcours-onboarding-narratif.md`](_bmad-output/implementation-artifacts/7-1-parcours-onboarding-narratif.md) | Story : 3 slides (problème → solution → permissions), flag AsyncStorage, DA Cloudbreak |
| [`7-2-mode-offline-light-cache-ttl.md`](_bmad-output/implementation-artifacts/7-2-mode-offline-light-cache-ttl.md) | Story : cacheService.ts unifié, useNetworkStatus, bandeau "données de [heure]" |
| [`fix-3.2-region-context.md`](_bmad-output/implementation-artifacts/fix-3.2-region-context.md) | Fix story 3.2 — contexte région pour la seed des sommets |

---

## `/_bmad-output/brainstorming` — Sessions de brainstorming

| Fichier | Contenu |
|---|---|
| [`brainstorming-session-2026-03-12-2120.md`](_bmad-output/brainstorming/brainstorming-session-2026-03-12-2120.md) | Session initiale — concept, positionnement, nom |
| [`brainstorming-session-2026-03-17-naming.md`](_bmad-output/brainstorming/brainstorming-session-2026-03-17-naming.md) | Session naming — choix du nom "Cloudbreak" |
| [`brainstorming-session-2026-03-19-peaks-search.md`](_bmad-output/brainstorming/brainstorming-session-2026-03-19-peaks-search.md) | Session recherche de sommets — stratégie OSM, Overpass, viewpoints |

---

## CLAUDE.md par submodule

| Fichier | Contenu |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Racine — règles globales, architecture, workflow, algo de score |
| [`backend/CLAUDE.md`](backend/CLAUDE.md) | Règles spécifiques backend FastAPI |
| [`mobile/CLAUDE.md`](mobile/CLAUDE.md) | Règles spécifiques mobile Expo |
| [`infra/CLAUDE.md`](infra/CLAUDE.md) | Règles spécifiques infra Dokploy |

---

_Pour mettre à jour cet index : modifier directement ce fichier ou demander à Claude de le mettre à jour en fin de session._
