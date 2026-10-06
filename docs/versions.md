# État des versions — Cloudbreak

> Référence unique et à jour sur les versions déployées/en cours de chaque service.
> Dernière mise à jour : 2026-10-06 (serveur dev remis en ligne : migrations au démarrage, `users.email`, StoreKit mergé).
> Pour l'infra serveur (accès, CI/CD, config Dokploy) : voir `docs/infra-serveur.md`.

## 1. Vue d'ensemble par service

| Service | Submodule | Branche locale | Dernier commit | Déployé en dev ? | Version dépendances clés |
|---|---|---|---|---|---|
| Backend | `backend/` | `develop` | `9b5d3b9` (2026-10-06) | ✅ auto-deploy `develop` → https://dev-api.cloudbreak-app.com (vérifié 2026-10-06 : service 1/1, `/health` 200, base au head `c8d1e5f2a7b3`, `ENVIRONMENT=development`, `APPLE_ENVIRONMENT=Sandbox`) — PR #22 StoreKit, #23 table `subscriptions`, #24 `users.email` | FastAPI `0.115.0`, SQLAlchemy `2.0.36`, Alembic `1.14.0`, Pydantic `2.10.0`, Redis client `5.2.0`, python-jose `3.3.0` |
| Mobile | `mobile/` | `develop` | `dae48dc` (2026-10-04) | ❌ non hébergé serveur — builds EAS iOS internes / App Store désormais configurés | Expo `~55.0.27`, React Native `0.83.6`, React `19.2.0`, TypeScript `~5.9.2` (+ `expo-apple-authentication`, `expo-crypto`, `expo-secure-store` — Sign in with Apple + Keychain, installation ID quota ; `expo-linear-gradient` déjà présent, réutilisé pour le dégradé ProBanner) |
| Ops | `ops/` | `develop` | `2bbf128` (2026-09-13) | ✅ auto-deploy `develop` → https://dev-ops.cloudbreak-app.com | Next.js `16.2.10`, React `19.2.4`, TypeScript `^5` |

> ✅ **Migration domaine (2026-08-09 → 2026-08-31)** : les URLs `nip.io` sont remplacées par `cloudbreak-app.com`.
> DNS + domaines Dokploy configurés, `dev-api`/`dev-ops` vérifiés en ligne (200), code des 3 submodules
> commité le 2026-08-31 — voir `docs/infra-serveur.md` section 4bis et `TODO.md` section "En cours".

> ✅ **Écart résolu (2026-09-26)** : `CLAUDE.md` (racine) indiquait « FastAPI 0.135 » alors que le
> `requirements.txt` est en `0.115.0` — doc alignée sur le code (pas d'upgrade FastAPI prévu).

## 2. Base de données

- PostgreSQL 16 (instance Dokploy dédiée au backend, environnement dev)
- Migrations Alembic : **12 fichiers** dans `backend/alembic/versions/` (init peaks, idx peaks name,
  predictions, terrain_validations, user_favorites, region sur peaks, users, fusion des deux têtes,
  préférences de notifications, **`a9c4e7b2d5f1` création de `subscriptions` si absente** (la table
  n'était créée par aucune migration, seulement par `create_all` en local), cycle de vie Apple
  (`d4e3f0000001`), **`c8d1e5f2a7b3` colonne `users.email`**). Head actuel : `c8d1e5f2a7b3`.
- **Les migrations sont appliquées automatiquement au démarrage du conteneur** (`CMD` du Dockerfile
  backend : `alembic upgrade head` avant `uvicorn`). Si une migration échoue, le conteneur ne démarre pas.
- **Le seed des sommets n'est jamais automatique** : `python -m app.db.seed` à lancer à la main sur une base
  neuve (upsert sur `slug`, 23 782 sommets). Le dev a été seedé le 2026-10-05.
- Redis 7 (cache météo TTL 10min + quota freemium) — instance Dokploy dédiée au backend

## 3. Environnements

- **Un seul environnement serveur actuellement : "dev"** (nommé à tort "production" dans l'UI Dokploy
  — voir `docs/infra-serveur.md` section 4). Pas de vraie prod séparée pour l'instant.
- Mobile : pas d'environnement serveur, tourne en local (simulateur iOS) via `npx expo run:ios` / `npm start`.

## 4. Comment mettre à jour ce fichier

À chaque fois que l'un de ces éléments change, mettre à jour la ligne concernée :
- Un submodule est mis à jour sur `develop` (nouvelle story mergée) → mettre à jour commit + date
- Une dépendance majeure change de version (FastAPI, Expo SDK, Next.js, React Native...) → mettre à jour la colonne "Version dépendances clés"
- Une nouvelle migration Alembic est ajoutée → mettre à jour le compteur section 2
- Un nouvel environnement est créé (vraie prod, staging...) → ajouter une ligne/section

**Commande rapide pour resynchroniser les infos de base :**
```bash
for d in backend mobile ops; do echo "== $d =="; (cd $d && git log -1 --format='%h %ci %s' && git branch --show-current); done
```
