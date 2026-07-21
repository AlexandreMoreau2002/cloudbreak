# Analytics / PostHog — note de contexte

Date : 2026-07-21 (story 1.7)

## Etat actuel

- Story 1.7 (taxonomie & instrumentation events, stub) mergee sur develop backend + mobile.
- La taxonomie complete (~31 events) est definie et cablee : `app/services/analytics.py` (backend) et `src/services/analytics.ts` (mobile).
- `track()` reste un stub qui logge en DEBUG uniquement — **aucun appel reseau, aucun compte PostHog requis pour l'instant**.
- Le vrai branchement SDK (compte PostHog, `POSTHOG_API_KEY`, `posthog-node`/`posthog-react-native`) est planifie story 1.5 (epics.md), pas encore priorisee.
- Dashboard ops unifie (`cloudbreak-ops`) consommant l'API PostHog + BetterStack + Redis INFO + Traefik : story 1.6, explicitement post-MVP.

## Principe d'architecture (story 1.7)

Un seul proprietaire par event :
- Backend = verite metier persistee (`score_calculated`, `quota_bypassed`, `quota_exceeded`, `favorite_added/removed`, `account_deleted`)
- Mobile = UI pure (tout le reste : onboarding, auth, navigation, paywall, profil, session app)

Voir `docs/superpowers/specs/2026-07-21-story-1-7-posthog-taxonomy-design.md` pour la taxonomie complete et `backend/docs/story-1-7-analytics-taxonomy.md` / `mobile/docs/story-1-7-analytics-taxonomy.md` pour le detail par fichier.

## A faire avant le branchement SDK reel (story 1.5)

1. Creer le compte PostHog production
2. Ajouter `POSTHOG_API_KEY` en variable d'environnement (mobile + backend)
3. Installer les SDKs (`posthog-node` backend, `posthog-react-native` mobile)
4. Remplacer le corps de `track()` par le vrai appel SDK — aucun site d'appel a modifier
5. Corriger `mobile/src/hooks/useAuthForm.ts:36` — `error_code` envoie actuellement `error.message` brut de Supabase (texte libre), a mapper vers un enum stable avant d'envoyer a un tiers
6. Declarer les donnees d'usage dans App Store Connect / privacy
