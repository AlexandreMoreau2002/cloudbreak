# Repository Guidelines

## Project Structure & Module Organization

This root repository coordinates three Git submodules and shared planning docs. `mobile/` contains the Expo/React Native app, with screens in `src/app/`, reusable UI in `src/components/`, hooks in `src/hooks/`, and API clients in `src/services/`. `backend/` contains the FastAPI service, with HTTP routes in `app/api/v1/endpoints/`, pure domain logic in `app/domain/`, integrations in `app/services/`, and tests in `tests/`. `infra/` holds local and production Docker Compose files plus `Caddyfile`. Planning and architecture artifacts live in `_bmad-output/`; long-form product and technical docs live in `docs/`, `mobile/docs/`, and `backend/docs/`.

## Build, Test, and Development Commands

Run commands from the relevant submodule.

- `cd mobile && npm install` installs app dependencies.
- `cd mobile && npm start` starts Metro; use `npx expo run:ios` after native dependency changes.
- `cd mobile && npm run validate` runs TypeScript, ESLint, Jest coverage, and an iOS export build check.
- `cd backend && source .venv/bin/activate && make dev` starts API, Postgres, and Redis with Docker.
- `cd backend && source .venv/bin/activate && make validate` runs Ruff, mypy, and pytest coverage.
- `cd backend && source .venv/bin/activate && make migrate` applies Alembic migrations.

## Coding Style & Naming Conventions

Mobile code is TypeScript with Expo ESLint defaults. Prefer PascalCase for React components (`MountainBackground.tsx`), camelCase for hooks and services (`usePeakSearch.ts`, `fetchService.ts`), and colocated `*.test.ts(x)` files. Backend code targets Python 3.12, uses Ruff formatting, 100-character lines, and strict mypy. Keep FastAPI routes thin, place pure business rules in `app/domain/`, and name tests `test_<feature>.py`.

## Testing Guidelines

Mobile tests use Jest with `jest-expo` and `@testing-library/react-native`; keep tests beside the source file. Backend tests use pytest and coverage, with unit tests in `backend/tests/` and broader flow tests in `backend/tests/features/`. Before opening a PR, run `npm run validate` for mobile changes and `make validate` for backend changes.

## Dev Tracking — TODO.md

`TODO.md` at the repository root is the **dev notebook**: pending manual tests, open story status (implemented / to merge / backlog), in-progress agent tasks, and quick notes (tokens, useful commands, decisions). Read it at the start of each session to resume where work left off. Update it after completing a story or closing a chantier.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit prefixes such as `docs:`, `chore:`, and scoped forms like `docs(algo):`. Keep messages imperative and focused, for example `feat: add peak favorites endpoint`. For submodule work, commit inside the submodule first, then update the root submodule reference with a `chore:` commit. PRs should state the affected area (`mobile`, `backend`, `infra`, or root docs), summarize behavior changes, link the related issue or story, and include screenshots for UI changes.
