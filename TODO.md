# TODO — Cloudbreak

> Ce fichier est le **plan d'action à court terme**, dans l'ordre de traitement. Il ne contient pas l'historique des releases : git, `docs/versions.md` et `_bmad-output/implementation-artifacts/sprint-status.yaml` font foi.
>

## État de départ

- **1.0.0 / build 10** est publique sur l'App Store depuis le 2026-11-13.
- **1.0.1 / build 11** a été soumise à Apple avec le groupe « Cloudbreak Premium » et les abonnements mensuel et annuel : elle est en attente de vérification.
- Le backend et ops de production suivent `main` et l'API prod est saine (Postgres et Redis OK).

## 1. Actions à faire pendant l'attente Apple

1. Configurer `NEXT_PUBLIC_APP_STORE_URL` sur ops prod avec la fiche App Store, puis reconstruire/redéployer ops : les pages `/sommet/*` doivent ouvrir l'app au lieu d'afficher « L'app arrive bientôt ».
2. Écrire une checklist réutilisable de post-MEP : app installée depuis le store, score, création de compte, paywall/achat, logs, crons, `/health` et critères de retour arrière.
3. Documenter le workflow dev → MEP, avec les schémas Mermaid : feature → `develop` → `release/X.Y.Z` → QA TestFlight → `main` → tag/GitHub Release → report vers `develop`, hotfix compris.
4. Vérifier si les webhooks GitHub redéploient bien backend et ops après un push sur `main`; décider de les ajouter s'ils sont absents.

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

## Notes à conserver

- Le premier groupe d'abonnements Apple devait être envoyé avec une nouvelle version : c'est la raison de la 1.0.1. Ne considérer les abonnements comme opérationnels qu'après le test sur l'app App Store.
- Les sujets post-MVP (monitoring Better Stack, PostHog/Sentry, receipts Expo, alerte régionale, message hors-saison, growth) restent hors de ce plan court terme.
