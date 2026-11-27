# PostHog Product Analytics — fonctionnement

> **État final du 2026-11-27** : accès PostHog authentifié, projet et réception vérifiés,
> dashboard de six analyses créé. Voir la [configuration actuelle](configuration-production-2026-11-27.md).


> **Historique dev/TestFlight (2026-11-16), statut d'activation dépassé.** Les variables de
> production ont ensuite été posées (décision du 2026-11-21) et la 1.0.2 est publiée. Nom du projet
> et réception restent à vérifier : voir l'[audit du 2026-11-27](audit-production-2026-11-27.md).
> Le code actuel envoie le UUID Supabase côté backend et un ID PostHog indépendant côté mobile ;
> cette page ne prouve pas leur rapprochement. Les règles de confidentialité restent applicables.

## L'idée, simplement

PostHog répond aux questions produit : quels parcours sont utilisés, où un parcours s'arrête et
quelles fonctionnalités apportent de la valeur. Il ne surveille ni les pannes ni les crashes.

```text
écran mobile / action métier backend
              |
              v
     track(nom, propriétés autorisées)
              |
              +-- clé absente --> rien ne part, tout continue normalement
              |
              +-- clé présente --> filtre strict --> PostHog dev/TestFlight
```

Les appels existants restent derrière les deux adaptateurs `track()`. Le backend est propriétaire
des faits métier persistés ; le mobile est propriétaire des interactions d'interface. Ainsi une
action ne devient pas artificiellement deux événements identiques.

## Projet et environnements

Le projet PostHog actuel sert **uniquement** aux builds dev/TestFlight. Il n'y a pas encore de
projet ni de clé pour la production publique. Cette séparation évite de mélanger les essais et les
vrais usages.

| Cible | Variables | Comportement sans variables |
|---|---|---|
| Backend dev Dokploy | `POSTHOG_API_KEY`, `POSTHOG_HOST` | pas de client, pas de trafic réseau |
| Build EAS dev/TestFlight | `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` | pas de client, pas de trafic réseau |

Les valeurs sont renseignées dans Dokploy/EAS, jamais dans Git, dans cette doc, dans les journaux
ou dans un fichier HTTP. `EXPO_PUBLIC_POSTHOG_KEY` est nécessaire à la configuration de l'app,
mais doit tout de même être gérée dans EAS et non copiée dans le dépôt.

## Données qui peuvent partir

Seuls les événements de la taxonomie existante et leurs propriétés primitives prévues peuvent être
capturés. L'identifiant fourni par l'appelant sert uniquement de `distinct_id` pseudonyme. Le
filtre rejette un événement inconnu ou une propriété qui ne respecte pas la taxonomie, sans lever
d'erreur pour l'écran ou la route métier.

Sont exclus : e-mail, téléphone, jeton, mot de passe, message d'erreur libre, texte de recherche
libre, requête/réponse HTTP, coordonnées GPS précises et toute propriété arbitraire. En particulier
`auth_submitted` ne part pas encore, car son `error_code` était un texte libre à catégoriser.

## Ce qui est désactivé

- autocapture et rage clicks ;
- Session Replay ;
- suivi automatique des erreurs et logs ;
- feature flags et enquêtes ;
- profils de personnes.

L'option SDK `disableRemoteConfig` a été retirée, car elle était un no-op déprécié. La
configuration distante n'est pas consommée par l'intégration ; seuls les produits effectivement
utilisables ici (flags, enquêtes et autres collectes automatiques) sont désactivés.

Sentry reçoit les erreurs volontairement filtrées. Better Stack vérifie que l'API est disponible.
PostHog reçoit seulement les événements produit explicitement choisis : les trois outils ont donc
un rôle distinct.

## Passage futur en production

La production reste bloquée tant qu'un projet PostHog dédié, sa clé propre et une validation de
confidentialité n'ont pas été créés. Il faut alors renseigner des variables propres à la production
et rejouer une recette séparée ; il ne faut jamais réutiliser le projet dev/TestFlight pour du
trafic public.
