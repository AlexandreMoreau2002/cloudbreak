# Sentry — fonctionnement expliqué simplement

## L’idée

Sentry est le détecteur de panne : lorsqu’une erreur non gérée survient, il garde le type d’erreur et la pile technique afin de pouvoir la corriger. Il n’est ni le monitor d’uptime (Better Stack), ni l’outil d’analytics (PostHog).

Deux projets séparés évitent de mélanger les problèmes de l’API et ceux de l’application :

```text
Application iOS/TestFlight ── erreur JS ou crash natif ──> Sentry / cloudbreak-mobile
Backend FastAPI ──────────── erreur non gérée ──────────> Sentry / cloudbreak-backend
Better Stack ─────────────── contrôle /health ──────────> alerte de disponibilité séparée
PostHog ──────────────────── événements produit ────────> pas encore branché réellement
```

## Quand cela fonctionne

```text
Variable de configuration absente
        │
        └──> SDK désactivé : aucune télémétrie, l’app et l’API démarrent normalement

Variable de configuration présente
        │
        ├──> backend : SENTRY_DSN dans Dokploy
        └──> mobile : EXPO_PUBLIC_SENTRY_DSN dans EAS au moment de la build
                 │
                 └──> erreur non gérée → événement filtré → projet Sentry correspondant
```

Le mobile contient un module natif Sentry. Il faut donc une nouvelle build iOS pour qu’il existe sur un téléphone. Cette build pourra être la même que celle qui intégrera PostHog et sera d’abord distribuée en TestFlight avec l’environnement dev.

## Données et garde-fous

Avant l’envoi, les deux SDK retirent notamment la requête, l’utilisateur, les tags et extras, les breadcrumbs et le texte des exceptions. Le backend retire aussi le contexte de trace reçu ; les deux runtimes empêchent la propagation de trace vers les services HTTP appelés par Cloudbreak.

Les fonctions volontairement absentes sont : logs Sentry, tracing/performance, profiling, replay, sessions, feedback utilisateur, captures d’écran et hiérarchie de vue. Les source maps servent seulement à rendre une pile mobile lisible ; leur téléversement exige le secret EAS `SENTRY_AUTH_TOKEN`.

## Fichiers concernés

| Zone | Rôle |
| --- | --- |
| `backend/app/core/sentry.py` | Initialisation et filtre de données backend. |
| `backend/app/main.py` | Initialise Sentry avant la création de FastAPI. |
| `mobile/src/services/sentry.ts` | Initialisation unique et filtre mobile. |
| `mobile/src/app/_layout.tsx` | Démarre le module avant le rendu de l’application. |
| `mobile/app.config.ts` et `mobile/metro.config.js` | Configuration Expo et source maps Sentry. |

## Ce qui reste à faire

- Configurer les trois variables de déploiement sans les ajouter au dépôt.
- Réaliser une build TestFlight dev et vérifier un événement contrôlé sur les deux projets.
- Quand PostHog aura son compte et ses clés, l’intégrer à cette même version iOS ; il est aujourd’hui un stub sans réseau.
