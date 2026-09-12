# État des versions — Cloudbreak

> Référence unique et à jour sur les versions déployées/en cours de chaque service.
> Dernière mise à jour : 2026-09-12 (merge lot auth 2.5+2.6+2.7+2.8 — backend PR #16, mobile PR #23).
> Pour l'infra serveur (accès, CI/CD, config Dokploy) : voir `docs/infra-serveur.md`.

## 1. Vue d'ensemble par service

| Service | Submodule | Branche locale | Dernier commit | Déployé en dev ? | Version dépendances clés |
|---|---|---|---|---|---|
| Backend | `backend/` | `develop` | `5f5ce9c` (2026-09-12) | ✅ auto-deploy `develop` → https://dev-api.cloudbreak-app.com | FastAPI `0.115.0`, SQLAlchemy `2.0.36`, Alembic `1.14.0`, Pydantic `2.10.0`, Redis client `5.2.0`, python-jose `3.3.0` |
| Mobile | `mobile/` | `develop` | `8e1affe` (2026-09-12) | ❌ non hébergé serveur — build local/simulateur uniquement | Expo `~55.0.27`, React Native `0.83.6`, React `19.2.0`, TypeScript `~5.9.2` |
| Ops | `ops/` | `develop` | `c60e1a9` (2026-09-07) | ✅ auto-deploy `develop` → https://dev-ops.cloudbreak-app.com | Next.js `16.2.10`, React `19.2.4`, TypeScript `^5` |

> ✅ **Migration domaine (2026-08-09 → 2026-08-31)** : les URLs `nip.io` sont remplacées par `cloudbreak-app.com`.
> DNS + domaines Dokploy configurés, `dev-api`/`dev-ops` vérifiés en ligne (200), code des 3 submodules
> commité le 2026-08-31 — voir `docs/infra-serveur.md` section 4bis et `TODO.md` section "En cours".

> ⚠️ **Écart connu** : `CLAUDE.md` (racine) mentionne "FastAPI 0.135" dans la section Stack — le
> `requirements.txt` réel du backend est actuellement en `0.115.0`. À corriger dans `CLAUDE.md` ou à
> upgrade réellement, l'un des deux est faux.

## 2. Base de données

- PostgreSQL 16 (instance Dokploy dédiée au backend, environnement dev)
- Migrations Alembic : **7 fichiers** dans `backend/alembic/versions/` (init peaks, idx peaks name,
  terrain_validations, user_favorites, region sur peaks — voir le dossier pour le détail complet)
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
