# Sentry — erreurs et crashs Cloudbreak

## État actuel

Les projets Sentry `cloudbreak-backend` (FastAPI) et `cloudbreak-mobile` (Expo / React Native) existent dans l’organisation `self-oaq`.

Le code est prêt dans les deux runtimes, mais aucun événement réel ne part tant que les variables de déploiement ne sont pas renseignées :

- Dokploy backend : `SENTRY_DSN` ;
- EAS / build iOS : `EXPO_PUBLIC_SENTRY_DSN` ;
- EAS uniquement, pour téléverser les source maps : `SENTRY_AUTH_TOKEN`.

Le jeton EAS est un secret. Le DSN mobile est une adresse d’ingestion publique, mais il reste dans la configuration EAS et jamais dans Git.

## Ce que Sentry reçoit

Sentry est volontairement configuré en mode **erreurs seulement** : exceptions serveur, erreurs JavaScript et crashs natifs une fois une build native installée. Une variable absente désactive le SDK sans empêcher le démarrage.

Le projet ne collecte pas les corps de requête, utilisateurs, e-mails, jetons, coordonnées précises, breadcrumbs, logs, replay, profiling, sessions ni tracing. La propagation des en-têtes de trace vers des services tiers est également désactivée.

## Déploiement prévu

1. Poser le DSN backend dans l’environnement Dokploy ciblé et redéployer le backend.
2. Poser le DSN mobile et le jeton de source maps dans l’environnement EAS de développement.
3. Produire une build iOS de développement/TestFlight avec Sentry **et PostHog** dans la même prochaine version ; aucune soumission App Store n’est nécessaire pour ce test.
4. Vérifier un événement contrôlé dans les deux projets Sentry, sans le faire sur la production publique.

Le déroulé complet et la checklist sont dans [sentry-observability/fonctionnement.md](sentry-observability/fonctionnement.md) et [sentry-observability/guide-test.md](sentry-observability/guide-test.md).
