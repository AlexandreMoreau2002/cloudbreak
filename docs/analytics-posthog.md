# PostHog — analytics produit

Date : 2026-11-16 (story 1.8)

## État actuel

- Le projet PostHog **Product Analytics** existant est réservé à la validation **dev/TestFlight**.
  Il ne représente pas la production publique.
- L'adaptateur backend est prêt (commit `26ca893`) et l'adaptateur mobile est prêt (commit
  `4d54c37`). Ils conservent les appels existants et n'envoient que la taxonomie explicite.
- Les clés ne sont pas encore renseignées dans Dokploy ni dans EAS : tant qu'elles restent
  absentes, il n'y a **aucun appel réseau PostHog** et l'application/API continuent de démarrer.
- Aucun projet ni aucune clé de production n'existe. Il est interdit d'activer PostHog pour le
  trafic public avant de créer ce projet séparé et de refaire la validation adaptée.

Le détail opérationnel est dans
[`posthog-analytics/fonctionnement.md`](posthog-analytics/fonctionnement.md) et la recette
manuelle dans [`posthog-analytics/guide-test.md`](posthog-analytics/guide-test.md).

## Principe d'architecture

Un seul propriétaire par événement :

- Backend = vérité métier persistée (`score_calculated`, `quota_bypassed`, `quota_exceeded`,
  `favorite_added`, `favorite_removed`, `account_deleted`).
- Mobile = interactions UI (onboarding, navigation, recherche, paywall, profil et cycle de vie
  explicitement instrumenté).

Les deux adaptateurs filtrent le nom d'événement et chaque propriété avant capture. Les données
libres ou sensibles sont rejetées ; `auth_submitted` est expressément exclu tant que son
`error_code` n'est pas un enum stable. Aucun e-mail, jeton, message d'erreur brut, position
précise, payload HTTP ou profil de personne n'est ajouté.

## Ce qui est volontairement désactivé

PostHog est limité aux événements produit explicites : ni autocapture, ni Session Replay, ni
error tracking, ni logs, ni feature flags, ni person profiles, ni rage clicks. Les erreurs vont à
Sentry et la disponibilité de l'API à Better Stack ; PostHog ne remplace aucun de ces outils.

## Variables de déploiement

Ne jamais mettre une valeur dans Git, cette documentation, un ticket ou les logs.

| Cible | Variables à renseigner | Usage |
|---|---|---|
| Backend dev Dokploy | `POSTHOG_API_KEY`, `POSTHOG_HOST` | capture des événements métier de la validation dev |
| Build EAS dev/TestFlight | `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` | capture des événements UI de la build native |

L'hôte est celui donné par le projet PostHog dev (instance UE actuellement). Une variable vide ou
absente désactive proprement le client concerné.

## Suite avant activation publique

1. Poser uniquement les variables du projet dev dans Dokploy et EAS, puis générer une build
   native dev/TestFlight.
2. Réaliser la recette sans aucun trafic de production publique.
3. Créer un projet PostHog et une clé **de production séparés**, décider les réglages de
   confidentialité et refaire une recette dédiée avant toute activation publique.
