# Bouton DEV « Rejouer le sondage » — comment ça marche

## L'idée en une phrase
Le sondage, c'est un bulletin de vote qu'on glisse **une seule fois** dans l'urne. Ce bouton de développement vide l'urne pour ton compte, comme ça tu peux revoter pour tester.

## Pourquoi il fallait ça
Le backend verrouille le sondage dès qu'il a une réponse (`survey_completed_at` ou `survey_skipped_at` rempli, voir `update_user_survey`). Rouvrir l'écran `/survey` ne servait donc à rien : la 2e réponse était ignorée et rien de nouveau n'arrivait en base.

## Le flux

```
 Profil (bloc DEV)
   │  tap sur "DEV · Rejouer le sondage"
   ▼
 replaySurvey()                       (AuthContext)
   │  POST /api/v1/user/survey/reset   ← 404 si ENVIRONMENT=production
   ▼
 users.survey_completed_at  = NULL
 users.survey_skipped_at    = NULL
 users.acquisition_source   = NULL
 users.practice             = NULL
 users.newsletter_opt_in    = NULL
   │  succès
   ▼
 router.push('/survey')
   │  tu réponds
   ▼
 PATCH /api/v1/user/survey            ← accepté, comme pour un nouveau compte
   ▼
 users.* rempli à nouveau → tu le vois en base
```

## Garde-fous
- Le bouton n'existe que si `DEV_TOOLS_ENABLED` (build dev + `EXPO_PUBLIC_DEV_TOOLS=true`) et pour un compte **permanent** (pas invité).
- L'endpoint répond **404 en production** : il n'existe pas pour le monde extérieur.
- Il ne touche que le compte de la personne connectée (id du JWT).

## Fichiers impactés
Backend (`backend/`)
- `app/services/user.py` — `reset_user_survey()`
- `app/api/v1/endpoints/user.py` — route `POST /survey/reset`
- `tests/test_services_user.py`, `tests/test_api_user.py`
- `http/user-provisioning.http`

Mobile (`mobile/`)
- `src/services/api/user.ts` — `resetUserSurvey()`
- `src/contexts/AuthContext.tsx` — `replaySurvey()`
- `src/app/(tabs)/profile.tsx` — bouton `dev-replay-survey`
- `src/locales/fr.ts`, `src/locales/en.ts` — `profile.devReplaySurvey`
- tests co-localisés

Repo racine : `http/dev-replay-survey.http`, ces docs.
