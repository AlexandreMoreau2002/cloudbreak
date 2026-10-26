# État des versions — Cloudbreak

> Référence unique et à jour sur les versions déployées/en cours de chaque service.
> Dernière mise à jour : 2026-10-26 (sheet « Pourquoi ce score ? » mergée : mobile `3c277e6` #51 ; avant : outil de dev « rejouer le sondage » mergé : backend `5c84953` #33 (`POST /user/survey/reset`, 404 en production, vérifié 403 sans auth sur dev-api), mobile `7018e81` #50 ; avant : fraîcheur des données favoris/abonnement mergée — mobile `c8f1c94` ; story 2.8 clôturée — persistance du mini-sondage validée, docs seulement : backend `94041da`, mobile `8fa6e1c` ; avant : correctif quota/cache : backend `a92406f`, mobile `f30628d` ; avant : epic 5 push mergé : backend `0046d58`, mobile `4cc9d01`).
> Pour l'infra serveur (accès, CI/CD, config Dokploy) : voir `docs/infra-serveur.md`.

## 1. Vue d'ensemble par service

| Service | Submodule | Branche locale | Dernier commit | Déployé en dev ? | Version dépendances clés |
|---|---|---|---|---|---|
| Backend | `backend/` | `develop` | `5c84953` (2026-10-16) | ✅ auto-deploy `develop` → https://dev-api.cloudbreak-app.com (vérifié 2026-10-13 : service 1/1, `/health` 200, Postgres + Redis OK, migrations au head `b7c8d9e0f1a2`, `ENVIRONMENT=development`, `APPLE_ENVIRONMENT=Sandbox`) — #31 batch `GET /score/week`, distinction quota/rate-limit et cache météo Redis 30 min ; avant : #22–#30 StoreKit, données compte et push | FastAPI `0.115.0`, SQLAlchemy `2.0.36`, Alembic `1.14.0`, Pydantic `2.10.0`, Redis client `5.2.0`, python-jose `3.3.0` |
| Mobile | `mobile/` | `develop` | `3c277e6` (2026-10-26) | ❌ non hébergé serveur — builds EAS iOS internes / App Store désormais configurés | Expo `~57.0.27`, React Native `0.86.3`, React `19.2.3`, TypeScript `~6.0.3`, `react-native-iap` `16.7.3` — #51 sheet « Pourquoi ce score ? » (4 facteurs, seuils d'affichage dans `scoreFactors.ts`, `BottomSheet` partagé) ; avant : #49 favoris partagés (`FavoritesProvider`) + fraîcheur 60 s favoris/abonnement, expiration locale du Premium ; avant : #47 consomme une requête hebdomadaire, garde le cache lors d'un 429/échec et distingue quota vs rate-limit ; avant : push #40–#42, #45/#46, profil et session invitée |
| Ops | `ops/` | `develop` | `4ed4a91` (2026-10-12) | ✅ auto-deploy `develop` → https://dev-ops.cloudbreak-app.com | Next.js `16.2.10`, React `19.2.4`, TypeScript `^5` |

> ✅ **Migration domaine (2026-08-09 → 2026-08-31)** : les URLs `nip.io` sont remplacées par `cloudbreak-app.com`.
> DNS + domaines Dokploy configurés, `dev-api`/`dev-ops` vérifiés en ligne (200), code des 3 submodules
> commité le 2026-08-31 — voir `docs/infra-serveur.md` section 4bis et `TODO.md` section "En cours".

> ✅ **Écart résolu (2026-09-26)** : `CLAUDE.md` (racine) indiquait « FastAPI 0.135 » alors que le
> `requirements.txt` est en `0.115.0` — doc alignée sur le code (pas d'upgrade FastAPI prévu).

> **Story 3.6 (Universal Links, mergée le 2026-10-12)** : ops `4ed4a91` (route AASA + page de repli `/sommet/[slug]`),
> mobile `2e2ecf4` (#39). Variables d'env ops (Dokploy, app `cloudbreak-ops`) : `APPLE_TEAM_ID` (posée, sert à générer
> l'AASA) et `NEXT_PUBLIC_APP_STORE_URL` (vide tant que l'app n'est pas publiée). Le lien de partage utilise l'hôte ops
> de l'environnement (`EXPO_PUBLIC_LEGAL_BASE_URL`), pas le domaine racine.

## 2. Base de données

- PostgreSQL 16 (instance Dokploy dédiée au backend, environnement dev)
- Migrations Alembic : **16 fichiers** dans `backend/alembic/versions/` (init peaks, idx peaks name,
  predictions, terrain_validations, user_favorites, region sur peaks, users, fusion des deux têtes,
  préférences de notifications, **`a9c4e7b2d5f1` création de `subscriptions` si absente** (la table
  n'était créée par aucune migration, seulement par `create_all` en local), cycle de vie Apple
  (`d4e3f0000001`), **`c8d1e5f2a7b3` colonne `users.email`**, **`e5f4a0000002` colonne `subscriptions.apple_period_expires_at`** : fin de la période payée Apple, sert à ordonner les notifications), **`fb27705a94f7` colonne `users.display_name`** (nom d'usage, `VARCHAR(24)` nullable). **`a5b1c2d3e4f5` `users.push_token` + `push_token_valid`**, **`b7c8d9e0f1a2` `users.locale`** (fr|en nullable). Head actuel : `b7c8d9e0f1a2` ; un test (`tests/test_migration_single_head.py`) échoue s'il y a plus d'une tête.
- **Les migrations sont appliquées automatiquement au démarrage du conteneur** (`CMD` du Dockerfile
  backend : `alembic upgrade head` avant `uvicorn`). Si une migration échoue, le conteneur ne démarre pas.
- **Le seed des sommets n'est jamais automatique** : `python -m app.db.seed` à lancer à la main sur une base
  neuve (upsert sur `slug`, 23 782 sommets). Le dev a été seedé le 2026-10-05.
- Redis 7 (cache météo TTL 30 min / 1 800 secondes + quota freemium) — instance Dokploy dédiée au backend

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
