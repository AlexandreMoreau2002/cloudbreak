# Cloudbreak Delivery Plan

Date: 2026-03-24

## Story 3.5

Status: done

Goal:
- Explain why the score is what it is.
- Show the optimal time window and sunrise.
- Surface forecast stability.
- Let the user switch day via WeekStrip.

Delivered:
- backend score presentation contract
- mobile score details accordion
- cloud layer visualization
- WeekStrip with tap + swipe
- tests and docs on backend/mobile

Validation:
- `cd mobile && npm run validate`
- `cd backend && source .venv/bin/activate && make validate`

## Story 3.6

Status: next

Goal:
- Show a useful contextual message when sea-of-cloud conditions are absent.
- Let the user share a forecast via `https://merdenua.ge/sommet/{slug}`.
- Prepare in-app routing for deep links / Universal Links.

Primary acceptance criteria:
- Backend determines the contextual message from real weather conditions.
- Mobile displays that message on the forecast screen.
- User can trigger native share or copy a shareable deep link.
- Opening `/sommet/{slug}` hydrates the selected peak and lands on the forecast flow.

Execution slices:
1. Backend contract
- Add `context_message` and `peak_slug` to the score response.
- Compute message rules in backend presentation/domain code.
- Files:
  - `backend/app/schemas/score.py`
  - `backend/app/domain/score.py`
  - `backend/app/api/v1/endpoints/score.py`

2. Backend tests
- Cover message rules and API response contract.
- Files:
  - `backend/tests/test_score.py`
  - `backend/tests/test_api_score.py`

3. Mobile data/model
- Extend score types and normalization for new optional fields.
- Files:
  - `mobile/src/services/mockData/types.ts`
  - `mobile/src/services/mockData/score.ts`
  - `mobile/src/services/api/score.ts`
  - related tests

4. Mobile UI
- Render contextual message and add share action on the forecast screen.
- Files:
  - `mobile/src/components/ScoreCard.tsx`
  - `mobile/src/app/(tabs)/index.tsx`
  - locale files
  - related tests

5. Deep link route
- Create slug-based route that resolves the peak, hydrates context, then enters the forecast flow.
- Files:
  - `mobile/src/app/sommet/[slug].tsx`
  - `mobile/src/services/api/peaks.ts`
  - `mobile/src/contexts/SelectedPeakContext.tsx`
  - route tests

6. App config and docs
- Prepare Expo linking config for future Universal Links rollout.
- Document current app-side scope vs domain-side infra requirements.
- Files:
  - `mobile/app.json`
  - story docs
  - sprint status if story lands

Suggested agent workflow:
- Worker A: backend contract + tests
- Worker B: mobile data/UI for contextual message + share action
- Explorer C: deep link / Expo config readiness and exact route plan
- QA after A/B land: validate tests, docs, and residual risks

## Dashboard polish / Direction B alignment

Status: in progress

Goal:
- Bring the mobile Home closer to the validated Direction B mock.
- Reduce the feeling of detached widgets.
- Keep the graph integrated inside the dark score card and make the sequence read as one flow.
- Clean up the design preview mock so the light theme reads fully light and the dark tokens do not bleed into the white variant.

Execution slices:
1. Home hierarchy
- Sequence: search -> peak header -> dark score card -> week strip -> conditions -> CTA/favorites.
- Keep score and graph as the hero; avoid extra technical blocks.
- Files:
  - `mobile/src/app/(tabs)/index.tsx`
  - `mobile/src/components/ScoreCard.tsx`

2. Supporting copy
- Add CTA copy for the alert row and keep translations aligned.
- Files:
  - `mobile/src/locales/fr.ts`
  - `mobile/src/locales/en.ts`

3. Preview mock cleanup
- Adjust `_bmad-output/planning-artifacts/design-preview-v2.html` so the light preview is visually white and the dark leftovers are intentional only in the dark variant.

4. QA
- Run `mobile` validation and review the mock HTML after the layout changes.
