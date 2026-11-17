# TODO — Cloudbreak

> Ce fichier est le **plan d'action à court terme**, dans l'ordre de traitement. Il ne contient pas l'historique des releases : git, `docs/versions.md` et `_bmad-output/implementation-artifacts/sprint-status.yaml` font foi.
>

## État de départ

- **1.0.0 / build 10** est publique sur l'App Store depuis le 2026-11-13.
- **1.0.1 / build 11** a été soumise à Apple avec le groupe « Cloudbreak Premium » et les abonnements mensuel et annuel : elle est en attente de vérification.
- Le backend et ops de production suivent `main` et l'API prod est saine (Postgres et Redis OK).

## 1. Actions à faire pendant l'attente Apple

1. Écrire une checklist réutilisable de post-MEP : app installée depuis le store, score, création de compte, paywall/achat, logs, crons, `/health` et critères de retour arrière.
2. Documenter le workflow dev → MEP, avec les schémas Mermaid : feature → `develop` → `release/X.Y.Z` → QA TestFlight → `main` → tag/GitHub Release → report vers `develop`, hotfix compris.
3. Vérifier si les webhooks GitHub redéploient bien backend et ops après un push sur `main`; décider de les ajouter s'ils sont absents.

## 2. Valider la 1.0.1 et les abonnements

1. Attendre la décision d'Apple sur la 1.0.1 et les deux abonnements soumis ensemble.
2. Après l'approbation, laisser le temps aux offres d'apparaître, puis tester sur un iPhone avec l'app téléchargée depuis l'App Store :
   - le paywall affiche les prix mensuel et annuel ;
   - un achat annuel et un achat mensuel ouvrent bien la feuille Apple et aboutissent ;
   - une annulation ou un refus laisse un bouton utilisable, sans chargement infini ;
   - Premium est appliqué sans redémarrage de l'app.
3. Pendant ce test de fumée, vérifier `/health`, les logs backend prod et les premiers crons (purge à 06:05, favoris à 18:05 Paris).

## 3. Préparer la 1.0.2 — fiabiliser le paywall

1. Reproduire avec les logs appareil (`idevicesyslog`) les problèmes d'achat et du bouton « Cloudbreak Pro » : crash/gel intermittent, mensuel qui reste en chargement et absence de feuille Apple.
2. Corriger le cycle d'achat : finir proprement une transaction refusée ou invalide, afficher une erreur actionnable et recharger l'abonnement/fermer le paywall dès que StoreKit confirme l'achat.
3. Corriger les régressions de compte : rejouer l'onboarding après suppression et masquer « Supprimer le compte » pour une session anonyme.
4. Uniformiser le nom **Premium** dans l'app, les traductions et les métadonnées App Store (ne plus afficher « Pro »).

## 4. Prochaines améliorations produit

1. Rendre la recherche de sommets tolérante aux fautes de frappe, accents et variantes proches, sans dégrader la pertinence.
2. Préparer les sommets saisis à la main avec une colonne `source` (`seed` ou `manual`), puis ajouter la tour Eiffel (environ 330 m, Paris).

## 5. Ops console (alertes, versions, KPIs, admin)

Chantier cadré en **Epic 10** (`_bmad-output/planning-artifacts/epics.md`, entrées `10-*` dans `sprint-status.yaml`) ; besoins et décisions dans `docs/ops-dashboard-besoins.md`. Ordre : 10.1 alertes → 10.2 `/version` → 10.3 backend admin lecture seule → 10.4 dashboard v0 → 10.5 (v1) recherche email et offrir Premium. Branchement PostHog/Sentry : story 1.8.

- [x] **Better Stack — premier monitor prod actif** (2026-11-16) : `Cloudbreak API production` surveille `https://api.cloudbreak-app.com/health` toutes les 3 minutes et alerte par e-mail. Premier check : `Up`.
- [ ] Étendre Better Stack : ops prod, environnements dev, heartbeats des crons et métriques VPS (agent/seuils). Le monitor API seul ne couvre pas ces pannes.
- [x] **Sentry — code et projets prêts** (2026-11-16) : `cloudbreak-backend` et `cloudbreak-mobile` existent ; les SDKs sont en mode erreurs seulement, sans PII, tracing, logs ni replay. Les revues sécurité ont validé le filtrage et le blocage de la propagation de trace.
- [ ] **Sentry — branchement dev/TestFlight** : poser `SENTRY_DSN` dans Dokploy et `EXPO_PUBLIC_SENTRY_DSN` + secret `SENTRY_AUTH_TOKEN` dans EAS, puis tester une build iOS dev/TestFlight. Ne pas créer de route de debug ni envoyer d’événement de test sur la production publique.
- [x] **PostHog — code et projet dev/TestFlight prêts** (2026-11-16) : projet Product Analytics
  réservé au dev/TestFlight ; adaptateurs backend (`26ca893`) et mobile (`4d54c37`) actifs seulement
  si leurs variables sont présentes. Taxonomie explicite, sans autocapture, replay, erreurs, logs,
  flags, profils ni rage clicks ; `auth_submitted` reste exclu car son `error_code` est libre.
- [ ] **PostHog — branchement dev/TestFlight** : poser `POSTHOG_API_KEY`/`POSTHOG_HOST` dans Dokploy
  dev et `EXPO_PUBLIC_POSTHOG_KEY`/`EXPO_PUBLIC_POSTHOG_HOST` dans EAS dev, puis tester dans la même
  build native que Sentry. Aucun trafic de production publique.
- [ ] **PostHog — prérequis production** : créer un projet et une clé de production séparés, décider
  la confidentialité et rejouer la recette avant toute activation publique.

## Notes à conserver

- Le premier groupe d'abonnements Apple devait être envoyé avec une nouvelle version : c'est la raison de la 1.0.1. Ne considérer les abonnements comme opérationnels qu'après le test sur l'app App Store.
- Les sujets post-MVP (receipts Expo, alerte régionale, message hors-saison, growth) restent hors de ce plan court terme. Better Stack est maintenant utilisé pour le premier contrôle externe de l'API prod ; la couverture complète de la section 5 reste à faire. Sentry est prêt côté code mais n’est pas encore actif tant que les variables de déploiement et la build TestFlight dev ne sont pas en place.
