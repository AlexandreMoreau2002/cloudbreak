# Sentry — guide de test manuel

## Pré-requis

- Les deux projets Sentry existent : `cloudbreak-backend` et `cloudbreak-mobile`.
- L’environnement Dokploy de test possède `SENTRY_DSN` et le backend a été redéployé.
- L’environnement EAS de développement possède `EXPO_PUBLIC_SENTRY_DSN` et le secret `SENTRY_AUTH_TOKEN`.
- Une build iOS native de développement est disponible dans TestFlight. Expo Go ne suffit pas pour le SDK natif.
- Aucun DSN ou jeton n’est collé dans un ticket, un log, un fichier `.env.example` ou Git.

## Scénario 1 — API de développement

1. Vérifier que `GET /health` répond normalement avant le test.
2. Depuis une copie de travail de développement uniquement, provoquer une exception contrôlée et temporaire, sans ajouter de route de debug et sans déployer ce changement en production.
3. Ouvrir `cloudbreak-backend` dans Sentry et attendre l’événement.
4. Vérifier que l’environnement affiché est celui de développement et que la pile permet d’identifier le code.
5. Inspecter l’événement : aucun e-mail, jeton, header `Authorization`, corps de requête, coordonnée précise, breadcrumb, contenu de `baggage` ni valeur de message d’exception ne doit apparaître.
6. Retirer immédiatement le changement temporaire ; ne pas laisser de mécanisme de test en production.

## Scénario 2 — application TestFlight dev

1. Construire une version iOS de développement avec les variables EAS ci-dessus, avec la future intégration PostHog dans la même version si elle est prête.
2. Installer la build via TestFlight et parcourir un flux normal afin de vérifier que l’app démarre.
3. Dans une variante de développement non soumise, provoquer une erreur contrôlée, puis consulter `cloudbreak-mobile` dans Sentry.
4. Vérifier que la pile est lisible grâce aux source maps et que l’événement ne contient pas d’utilisateur, coordonnées, tags, extras, breadcrumbs, capture d’écran ou hiérarchie de vue.
5. Retirer la variante de test avant de préparer toute soumission App Store.

## Cas limites

- Retirer l’un des DSN, reconstruire/redéployer puis vérifier que l’application concernée démarre sans événement Sentry.
- Envoyer des en-têtes entrants synthétiques `sentry-trace` et `baggage` uniquement en dev ; vérifier qu’ils n’apparaissent pas dans l’événement et ne sont pas propagés vers une dépendance HTTP.
- Si la source map est absente, garder l’erreur comme preuve de transport mais corriger le secret EAS avant de considérer le test validé.

## Checklist finale

- [ ] Événement backend visible et filtré.
- [ ] Événement mobile TestFlight visible et filtré.
- [ ] Pile mobile lisible.
- [ ] Aucun secret ou donnée personnelle observé.
- [ ] Changement de test retiré.
- [ ] Événements de test marqués résolus dans Sentry.
