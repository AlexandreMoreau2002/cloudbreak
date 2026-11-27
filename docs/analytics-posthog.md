# PostHog — analytics produit

## Point actuel — 2026-11-27

La **1.0.2 / build 12 est publiée** (confirmation Alexandre). La connexion officielle MCP PostHog
est authentifiée. Le projet **Cloudbreak Production (353557, UE, UTC)** reçoit les événements
mobile 1.0.2/build 12 et les événements de taxonomie backend.

Le [dashboard Cloudbreak — suivi produit](https://eu.posthog.com/project/353557/dashboard/1157291)
est créé et vérifié : **6 analyses**, dont le funnel onboarding complet (étapes 1 à 4 puis terminé, étendu le 2026-11-27) et une rétention
J7/J30 affichant **N/A** avant maturité. Les 9 insights génériques préexistants ont été inspectés
et conservés ; ils utilisent des événements web qui ne correspondent pas à cette collecte.

Liens, résultats et actions : [configuration vérifiée](posthog-analytics/configuration-production-2026-11-27.md).
L'[audit de code initial](posthog-analytics/audit-production-2026-11-27.md) conserve la matrice des
besoins et les propositions d'instrumentation. Son blocage d'accès initial est levé.

**Limites** : tests/TestFlight/App Store non séparés ; identités UI/backend distinctes ; score
calculé différent d'un score vu ; confirmations auth/achat absentes. Cinq noms d'événements sont
reçus à ce stade. Le funnel complet vers Premium reste non mesurable. Aucun profil, replay ou
collecte automatique activé pendant la configuration.

## Historique — 2026-11-16 (story 1.8)

> Les consignes dev/TestFlight et l'absence de variables/projet prod ci-dessous décrivent la
> décision initiale, remplacée le 2026-11-21 (voir `observability-testflight-setup.md`). Elles ne
> décrivent pas l'état actuel de production. Historique conservé ; ne pas réappliquer cette recette
> ni conclure qu'aucun trafic ne part aujourd'hui.

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
