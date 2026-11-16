# Better Stack — disponibilité de Cloudbreak

## Ce qui est en place

Le monitor `Cloudbreak API production` vérifie `https://api.cloudbreak-app.com/health` toutes les trois minutes. Il envoie les alertes et les messages de rétablissement par e-mail. Le premier contrôle a été reçu comme `Up` le 16 novembre 2026.

Better Stack répond à une question simple : « l’API publique est-elle joignable depuis Internet ? » Il mesure donc l’état, le code de réponse et le temps de réponse de ce contrôle HTTP.

Il ne collecte ni crash mobile, ni événements métier, ni logs applicatifs détaillés. Ces sujets relèvent respectivement de Sentry, PostHog et d’une future agrégation de logs.

## Ce qui ne demande pas de version iOS

Le monitor appelle l’API depuis l’extérieur. Modifier ses réglages ou ajouter un monitor ne nécessite ni build Expo, ni TestFlight, ni revue Apple.

## Suites à faire

- Ajouter les moniteurs HTTP des pages Ops et des environnements dev lorsque leurs URL sont stabilisées.
- Ajouter des heartbeats pour les crons importants (favoris, purge) et vérifier les alertes de rétablissement.
- Ajouter l’agent Better Stack et des seuils CPU, RAM et disque sur le VPS partagé, sans lancer une stack Grafana locale.

Les détails de l’état des environnements restent dans [environnements.md](environnements.md).
