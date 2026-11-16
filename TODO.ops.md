# TODO ops — Cloudbreak

> Tâches du chantier **Ops console** et de la fiabilité de l'infra. Cadrage : `docs/ops-dashboard-besoins.md`, stories : Epic 10 dans `_bmad-output/planning-artifacts/epics.md`, maquette : `docs/ops-dashboard-maquette-brief.md`. Dernière mise à jour : 2026-11-15. Pas d'historique : on retire ce qui est fait.

## 0. Urgent — sauvegardes (à traiter avant les alertes)

1. **Sauvegarde de la base Postgres de PROD.** `/srv/scripts/backup-databases.sh` ne sauvegarde qu'un seul conteneur Postgres Cloudbreak, codé en dur (`postgres-navigate-virtual-matrix-c3rtpt`). Établir si c'est la base dev ou la prod (UI Dokploy : à quelle app appartient ce Postgres ?). Si c'est la dev, **la prod n'a aucune sauvegarde** : ajouter le conteneur prod au script, lancer un dump à la main, vérifier le fichier.
2. **Test de restauration** d'un dump prod sur une base jetable (un dump jamais restauré ne prouve rien).
3. **Sauvegarde côté Supabase prod (`cloudbreak-prod`).** Les comptes (`auth.users` : emails, mots de passe hachés, identités) vivent chez Supabase et ne sont **pas** dans notre `pg_dump` : sans eux, une restauration de notre base laisserait les utilisateurs incapables de se connecter. À faire : vérifier ce que le plan Supabase inclut comme sauvegarde et sa rétention, et planifier un export régulier de `auth.users` (par exemple dump de la base Supabase) stocké hors du VPS.
4. **Copie hors site** des sauvegardes (aujourd'hui `/srv/backups` est sur le même disque que les bases, rétention 14 jours).
5. Rendre le script de sauvegarde **fiable** : sortie non nulle si un conteneur est introuvable (aujourd'hui il sort en succès), un fichier de sauvegarde de plus de 26 h déclenche une alerte.

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
