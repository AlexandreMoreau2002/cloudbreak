# PostHog — analytics produit

Date : 2026-07-21 (story 1.7)

## État actuel

- Story 1.7 (taxonomie & instrumentation events, stub) mergee sur develop backend + mobile.
- La taxonomie complète (~31 événements) est définie et câblée : `app/services/analytics.py` (backend) et `src/services/analytics.ts` (mobile).
- `track()` reste un stub qui logge en DEBUG uniquement — **aucun appel réseau, aucun compte ni clé PostHog configurés**.
- Le vrai branchement SDK (`posthog-node` / `posthog-react-native`) n'est pas encore implémenté. Il doit être livré dans la prochaine version iOS avec Sentry, d'abord en TestFlight avec l'environnement dev.
- Dashboard ops (`cloudbreak-ops`) : story 1.6 remplacee par l'Epic 10 « Ops console » (alertes, versions, KPIs ; renvoie vers PostHog/BetterStack/Sentry sans recreer leurs ecrans).

## Principe d'architecture (story 1.7)

Un seul proprietaire par event :
- Backend = verite metier persistee (`score_calculated`, `quota_bypassed`, `quota_exceeded`, `favorite_added/removed`, `account_deleted`)
- Mobile = UI pure (tout le reste : onboarding, auth, navigation, paywall, profil, session app)

Voir `docs/superpowers/specs/2026-07-21-story-1-7-posthog-taxonomy-design.md` pour la taxonomie complete et `backend/docs/story-1-7-analytics-taxonomy.md` / `mobile/docs/story-1-7-analytics-taxonomy.md` pour le detail par fichier.

## Ce qui reste à faire avant le branchement réel

1. Créer le compte PostHog et définir les projets/environnements dev puis production.
2. Mettre les clés d'ingestion dans les variables de déploiement adaptées, jamais dans Git.
3. Installer les SDKs (`posthog-node` backend, `posthog-react-native` mobile)
4. Remplacer le corps de `track()` par le vrai appel SDK — aucun site d'appel à modifier.
5. Corriger `mobile/src/hooks/useAuthForm.ts:36` : `error_code` envoie actuellement `error.message` brut de Supabase (texte libre), à mapper vers un enum stable avant d'envoyer à un tiers.
6. Déclarer les données d'usage dans App Store Connect / privacy avant toute soumission iOS.

## Limite de périmètre

PostHog ne doit pas être annoncé comme actif tant que son compte, ses clés, les SDKs et les tests TestFlight ne sont pas prêts. Better Stack est déjà actif pour l'uptime et Sentry est prêt côté code, mais PostHog reste volontairement sans trafic réseau.
