# Story 4.6 — Build iOS signée, App Store Connect et TestFlight

Status: draft

## Story

En tant que solo dev,
je veux produire une build iOS signée de Cloudbreak, la téléverser dans App Store Connect et la distribuer via TestFlight,
afin de tester StoreKit 2 sur un iPhone réel avec un compte Sandbox, puis de préparer la soumission App Store.

## Contexte

- Story 4.3 (StoreKit 2) est en review (PR backend #22, PR mobile #32). Les produits App Store Connect sont créés mais non soumis.
- Une build de développement (simulateur ou dev-client) ne suffit pas : la TestFlight exige une build **Release** signée avec un profil de distribution.
- Le développement quotidien reste hors scope : il est couvert par `mobile/docs/dev-ios-workflow.md`.
- Prérequis Xcode : la machine a Xcode 27 (beta/récent). Vérifier la version acceptée par App Store Connect au moment de la build ; garder Xcode 26 en secours si le téléversement est refusé.

## Périmètre

Inclus :
- Profil de distribution iOS (EAS `production` ou build locale) avec certificats et profil gérés.
- Fiche app dans App Store Connect : métadonnées minimales, informations de review, confidentialité.
- Téléversement d'un build et distribution TestFlight (testeurs internes, puis externes si utile).
- Vérification que la config native embarquée est correcte : bundle id `com.alexandremoreau.cloudbreak`, `ITSAppUsesNonExemptEncryption`, deployment target iOS 16.0.

Exclu (stories séparées si besoin) :
- Soumission finale à la review App Store.
- Universal Links (`associatedDomains`), bloqués par la configuration du compte.
- Build Android.

## Critères d'acceptation

- AC1 — Une build `.ipa` Release signée est produite sans erreur (EAS ou Xcode Archive).
- AC2 — Le build est visible dans App Store Connect > TestFlight avec un statut « prêt à tester ».
- AC3 — Un testeur interne installe l'app depuis TestFlight sur un iPhone réel et l'ouvre sans erreur de signature.
- AC4 — L'app Release pointe sur l'API de production ou dev-api (variable `EXPO_PUBLIC_API_URL` vérifiée, pas `localhost`).
- AC5 — Les champs obligatoires de la fiche App Store (nom, sous-titre, description, mots-clés, URL support, URL confidentialité, copyright, coordonnées de review) sont renseignés ou marqués « à faire » explicitement.
- AC6 — Les produits d'abonnement (`premium.monthly`, `premium.annual`) sont associés au build pour les tests Sandbox.

## Tâches

1. Vérifier les prérequis Apple : accord payant signé, rôle du compte, identifiant d'app créé, bundle id enregistré.
2. Décider le mode de build : `eas build --profile production` (cloud, recommandé pour la signature) ou build Xcode Archive local.
3. Produire le build, vérifier la signature et les entitlements (`In-App Purchase`, `Sign in with Apple`).
4. Téléverser (`eas submit` ou Transporter/Xcode) et attendre le traitement Apple.
5. Ajouter les testeurs internes et tester l'installation TestFlight sur iPhone réel.
6. Remplir la fiche App Store version 1.0 (métadonnées, captures, confidentialité, review) — les captures dépendent de l'AC5 et du point 13 du TODO.
7. Documenter le flux dans `mobile/docs/` et mettre à jour `docs/versions.md`.

## Risques

- Xcode 27 pourrait être refusé par App Store Connect au moment du téléversement : prévoir Xcode 26 en secours.
- Le développement de la build de production dépend de `EXPO_PUBLIC_*` figés au build : vérifier les valeurs avant.
- Les produits StoreKit doivent être vus par la build pour les tests Sandbox ; un produit non soumis peut être indisponible.

## Dépendances

- Story 4.3 mergée (ou branche de test dédiée).
- Accord payant et informations fiscales/bancaires Apple validés.
- Politique de confidentialité publiée (NFR14) et CGU : voir TODO point 14.
