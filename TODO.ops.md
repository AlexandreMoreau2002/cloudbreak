# TODO ops — Cloudbreak

> Tâches du chantier **Ops console** et de la fiabilité de l'infra. Cadrage : `docs/ops-dashboard-besoins.md`, stories : Epic 10 dans `_bmad-output/planning-artifacts/epics.md`, maquette : `docs/ops-dashboard-maquette-brief.md`. Dernière mise à jour : 2026-11-15. Pas d'historique : on retire ce qui est fait.

## 0. Urgent — sauvegardes (à traiter avant les alertes)

Fait le 2026-11-18 (heartbeats BetterStack sauvegarde + purge + favoris, et alerte de coût OVH, compris) : toutes les bases du VPS (dont la prod Cloudbreak et Dokploy) sont sauvegardées par un script qui les découvre seul, restauration testée (locale et depuis OVH), copie hors site chiffrée (restic → OVH S3). Détail : `docs/sauvegardes/`. Reste :

1. **Supabase prod** : export nocturne de `auth` + `public` en place (plan Free, sans sauvegarde automatique), restauration testée. On reste en Free (décision d'Alex) ; à surveiller : pause automatique des projets Free après une semaine d'inactivité.

## 1. Mesures à faire sur le VPS (une seule connexion SSH à la fois)

1. Mesurer la RAM et le CPU de l'agent BetterStack avant activation en prod (référence 2026-11-15 : 1,75 Go de RAM disponibles, swap 1,9 / 4 Go, disque 56 %, Dokploy ≈ 780 Mo). Abandonner l'agent s'il dépasse ~100 Mo.
2. Valider les seuils d'alerte : disque > 85 %, RAM disponible < 10 %, swap > 75 %.

## 2. Epic 10 — Ops console (ordre de traitement)

| Story | Contenu | Version |
|---|---|---|
| **10.1** | Alertes : uptime BetterStack, heartbeats des crons, agent serveur | v0 |
| **10.2** | `GET /version` backend + ops, comparaison au `main` GitHub | v0 |
| **10.3** | Backend admin en lecture seule : auth, audit, `GET /admin/overview` | v0 |
| **10.4** | Dashboard `/[locale]/admin` | v0 |
| **10.5** | Recherche par email + offrir Premium, avec audit | v1 |

Détail des AC : `epics.md`. Une story = une branche `feature/` du submodule concerné, PR vers `develop`.

## 3. Décisions à prendre

1. Sauvegarde : où stocker la copie hors site (stockage objet, autre serveur) ?
2. Table d'audit (10.5) : hachage ou identifiant de compte plutôt que l'email en clair ?
3. Abonnement offert (10.5) : valeur de l'origine (`granted` proposé), `status` et `expires_at`.
4. Comptes anonymes contre permanents et tendance 14 jours dans les KPIs (ajouts du brief) : à confirmer dans la 10.3.

## 4. Nettoyage de docs restant

1. Compte de test `pro@cloudbreak.app` : à renommer côté Supabase (le plan s'appelle Premium).
2. `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
3. Digest hebdo des KPIs par email (plus tard, hors Epic 10).
