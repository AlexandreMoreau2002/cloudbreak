# TODO — Cloudbreak

> Ce fichier est le **plan d'action à court terme**, dans l'ordre de traitement. Il ne contient pas l'historique des releases : git, `docs/versions.md` et `_bmad-output/implementation-artifacts/sprint-status.yaml` font foi.
>

## État de départ

- **1.0.0 / build 10** est publique sur l'App Store depuis le 2026-11-13.
- **1.0.1 / build 11** (groupe « Cloudbreak Premium », abonnements mensuel et annuel) est **approuvée par Apple**. Les achats fonctionnent (confirmation d'Alexandre le 2026-11-27).
- **1.0.2 / build 12** (`release/1.0.2`, commit `a1ee0f9`) est **publiée sur l’App Store** (2026-11-27, vérifiée sur la fiche publique) ; livrée dans `main` avec le tag `v1.0.2` ; la déclaration « Confidentialité de l'app » est publiée et à jour. Elle embarque Sentry et PostHog, le correctif du clavier OTP et celui de la suppression de compte. Elle ne contient **aucun correctif du paywall**.
- Backend en prod en **1.2.0**, ops en **1.2.1** (`main`).

## 0. Suivi après publication de la 1.0.2

1. Compléter la recette PostHog sur un parcours App Store contrôlé : recherche, paywall, favoris et validation terrain (onboarding complet et choix d'un sommet reçus le 2026-11-27). État et liens : `docs/posthog-analytics/configuration-production-2026-11-27.md`. Séparer test/TestFlight/public avant toute conclusion produit ; revoir les filtres mobiles 1.0.2/build 12 à la prochaine version.
2. Préparer l'instrumentation du funnel complet : identité commune sans profils, score réellement vu/check intentionnel, résultats auth et cycle d'abonnement vérifiés. Détail : audit de code PostHog, sections 2 à 6. Laisser mûrir les cohortes J7/J30 ; N/A ne signifie pas 0%.
3. Vérifier la réception Sentry (backend et mobile).

## 1. Documentation de mise en production (à faire en parallèle)

1. Écrire une checklist réutilisable de post-MEP : app installée depuis le store, score, création de compte, paywall/achat, logs, crons, `/health` et critères de retour arrière.
2. Documenter le workflow dev → MEP, avec les schémas Mermaid : feature → `develop` → `release/X.Y.Z` → QA TestFlight → `main` → tag/GitHub Release → report vers `develop`, hotfix compris.
3. Les apps Dokploy prod backend et ops n'ont **pas de webhook** (déploiement par `application.deploy` après le merge dans `main`) : décider d'en ajouter ou non.

## 2. Préparer la 1.0.3 — fiabiliser le paywall

1. Reproduire avec les logs appareil (`idevicesyslog`) les problèmes d'achat et du bouton « Cloudbreak Pro » : crash/gel intermittent, mensuel qui reste en chargement et absence de feuille Apple.
2. Corriger le cycle d'achat : finir proprement une transaction refusée ou invalide, afficher une erreur actionnable et recharger l'abonnement/fermer le paywall dès que StoreKit confirme l'achat.
3. Corriger les régressions de compte : rejouer l'onboarding après suppression et masquer « Supprimer le compte » pour une session anonyme.
4. Uniformiser le nom **Premium** dans l'app, les traductions et les métadonnées App Store (ne plus afficher « Pro »).

## 3. Prochaines améliorations produit

1. Rendre la recherche de sommets tolérante aux fautes de frappe, accents et variantes proches, sans dégrader la pertinence.
2. Préparer les sommets saisis à la main avec une colonne `source` (`seed` ou `manual`), puis ajouter la tour Eiffel (environ 330 m, Paris).

## 4. Ops console (alertes, versions, KPIs, admin)

Chantier cadré en **Epic 10** (`_bmad-output/planning-artifacts/epics.md`, entrées `10-*` dans `sprint-status.yaml`) ; besoins et décisions dans `docs/ops-dashboard-besoins.md`. Le détail et les prérequis par story sont dans `TODO.ops.md`. Ordre : 10.2 `/version` → 10.1 alertes → 10.3 backend admin lecture seule → 10.4 dashboard v0 → 10.5 (v1) recherche email et offrir Premium.

## Notes à conserver

- Le premier groupe d'abonnements Apple devait être envoyé avec une nouvelle version : c'est la raison de la 1.0.1.
- Licence Open-Meteo mise de côté par Alexandre le 2026-11-27 (l'API gratuite exclut les apps avec abonnement, [conditions](https://open-meteo.com/en/terms) ; crédit CC BY 4.0 dans les CGU seulement).
- Les sujets post-MVP (receipts Expo, alerte régionale, message hors-saison, growth) restent hors de ce plan court terme.
