# Handoff agent — configuration et recette Observabilité (dev/TestFlight)

## But et état actuel

| Outil | Rôle | État |
|---|---|---|
| Better Stack | Disponibilité externe API | Actif en production : `/health`, toutes les 3 minutes, e-mail d'alerte/rétablissement. |
| Sentry | Erreurs backend/mobile filtrées | Code et projets prêts ; inactif sans variables. |
| PostHog | Analytics produit explicite | Code et projet actuel prêts ; projet réservé à dev/TestFlight. |

Objectif : activer Sentry et PostHog uniquement en dev/TestFlight, produire une build native puis valider les dashboards. Ne pas soumettre à l'App Store public et ne pas envoyer de trafic PostHog production.

## Règles non négociables

- Ne jamais écrire DSN, clé API ou token dans Git, `app.json`, un document, un log ou le chat ; saisir les secrets directement dans Dokploy/EAS.
- Ne pas modifier le monitor Better Stack actif ni son URL de production.
- Le projet PostHog existant est dev/TestFlight : créer un projet et une clé séparés avant toute production publique.
- Ne pas ajouter d'endpoint de debug, bouton de crash permanent ni capture automatique.
- `auth_submitted` reste exclu : son `error_code` est du texte libre.

## Accès requis

- Dokploy : variables de l'application backend dev et redéploiement.
- EAS/Expo : variables de l'environnement dev/TestFlight et build iOS.
- Sentry : projets `cloudbreak-backend` et `cloudbreak-mobile`.
- PostHog EU : projet Product Analytics actuel, section Live events.
- Better Stack : monitor `Cloudbreak API production` (lecture seule).

## 1. Backend dev — Dokploy

Ajouter, sans les afficher :

| Variable | Valeur |
|---|---|
| `SENTRY_DSN` | DSN du projet Sentry `cloudbreak-backend` dev. |
| `POSTHOG_API_KEY` | Clé du projet PostHog dev/TestFlight. |
| `POSTHOG_HOST` | `https://eu.i.posthog.com` |

Redéployer puis vérifier que `/health` reste sain. Une variable absente laisse l'intégration concernée en no-op, sans trafic externe ni panne métier.

## 2. iOS — EAS

Ajouter au profil/environnement dev/TestFlight, sans les afficher :

| Variable | Valeur |
|---|---|
| `EXPO_PUBLIC_SENTRY_DSN` | DSN du projet Sentry `cloudbreak-mobile` dev. |
| `SENTRY_AUTH_TOKEN` | Secret EAS de build Sentry ; jamais dans le bundle ou Git. |
| `EXPO_PUBLIC_POSTHOG_KEY` | Clé PostHog du projet dev/TestFlight. |
| `EXPO_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` |

Créer une nouvelle build native iOS et l'envoyer sur TestFlight. Les SDKs sont natifs : Expo Go ne suffit pas. Une build TestFlight n'est pas une soumission App Store publique.

## 3. Recette TestFlight

Avec un compte de test :

1. Onboarding, permission localisation, changement langue/thème.
2. Recherche, ouverture/sélection d'un sommet.
3. Calcul de score, changement heure/date, ouverture de l'explication.
4. Ajout/suppression favori, validation terrain, quota.
5. Ouverture/fermeture paywall, choix période, restauration achat.
6. Passage hors-ligne puis premier plan/arrière-plan.

### PostHog attendu

Mobile : onboarding, permissions, recherche avec **longueur/résultat seulement**, sélection sommet, score, favoris, quota/paywall, préférences, partage, hors-ligne et réglages.

Backend : score calculé/semaine, favoris ajoutés/supprimés/alertés, quota dépassé/contourné, suppression compte et validation terrain.

Dans Live events, ne doivent apparaître que UUID, enums, booléens ou nombres bornés. Interdits : texte recherché, e-mail, téléphone, GPS précis, token, erreur libre, replay, logs, erreurs PostHog, flags, rage clicks et profils personnes.

### Sentry attendu

Déclencher uniquement une erreur contrôlée via le mécanisme déjà décrit dans [`docs/sentry-observability/guide-test.md`](sentry-observability/guide-test.md), une fois backend dev et une fois mobile TestFlight. Vérifier les deux projets Sentry : aucune PII, corps HTTP, token, breadcrumb sensible ni trace réseau sortante.

### Better Stack attendu

Contrôler que `Cloudbreak API production` reste `Up`. Ne pas le casser volontairement : il ne mesure que la disponibilité externe de l'API prod.

## Go / no-go

**Go TestFlight** : build installée, API dev saine, événements PostHog attendus, erreurs Sentry filtrées, aucune collecte interdite.

**No-go App Store public** tant que la recette TestFlight n'est pas validée, qu'un projet/clé PostHog production séparés n'existent pas, que la recette production n'est pas rejouée, ou que le funnel signup/conversion reste requis sans taxonomie sûre pour `auth_submitted`.

## Rollback et rapport

Pour désactiver : retirer la paire de variables concernée de Dokploy dev ou EAS, puis redéployer/rebuild. Les intégrations deviennent des no-ops ; ne pas supprimer les projets ni Better Stack.

L'agent rend : cibles configurées (sans valeurs), numéro de build, parcours testés, événements observés/exclusions confirmées, deux erreurs Sentry contrôlées, état Better Stack, anomalies et verdict « prêt TestFlight » ou blocage précis. Il ne conclut jamais « prêt App Store public » sans les prérequis production ci-dessus.
