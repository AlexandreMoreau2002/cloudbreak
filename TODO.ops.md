# TODO ops — Cloudbreak

> Tâches du chantier **Ops console** et de la fiabilité de l'infra. Cadrage : `docs/ops-dashboard-besoins.md`. Stories, maquettes et ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`). Dernière mise à jour : 2026-11-21. Pas d'historique : on retire ce qui est fait.

## 0. Sauvegardes

Fait le 2026-11-18 (heartbeats sauvegarde, purge et favoris, alerte de coût OVH et copie hors site chiffrée compris) : toutes les bases du VPS, prod Cloudbreak et Dokploy comprises, sont sauvegardées, restauration testée. Détail : `docs/sauvegardes/`. Reste :

1. **Supabase prod** : export nocturne de `auth` + `public` en place (plan Free, sans sauvegarde automatique), restauration testée. On reste en Free (décision d'Alex) ; à surveiller : pause automatique des projets Free après une semaine d'inactivité.

## 1. Mesures à faire sur le VPS (une seule connexion SSH à la fois)

1. Mesurer la RAM et le CPU de l'agent BetterStack avant activation en prod (référence 2026-11-15 : 1,75 Go de RAM disponibles, swap 1,9 / 4 Go, disque 56 %, Dokploy ≈ 780 Mo). Abandonner l'agent s'il dépasse ~100 Mo.
2. Valider les seuils d'alerte : disque > 85 %, RAM disponible < 10 %, swap > 75 %.

## 2. Epic 10 — Ops console

Prod uniquement, lecture seule. Ordre et dépendances : `docs/ops-console-stories.md`. Une story = une branche `feature/` du submodule concerné, PR vers `develop`.

| Story | Contenu | Version |
|---|---|---|
| **10.1** | Alertes : moniteur ops, `/version`, agent serveur, log 5xx (API, heartbeats et sauvegardes déjà faits) | v0 |
| **10.2** | `GET /version` backend + ops | v0 |
| **10.3** | Backend admin en lecture seule : auth, audit, `GET /admin/overview` | v0 |
| **10.4a à 10.4g** | Console `/[locale]/admin` : socle, sources lues par ops, Utilisateurs, Santé, Déploiements, Accueil, pages légales | v0 |
| **10.5** | Recherche par email + offrir Premium, avec audit | v1 |

Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB), frames identifiées (`HOME-01`, `SAN-04`…).

## 3. À fournir avant de lancer

1. Compte admin dans Supabase prod avec `app_metadata.role = "admin"`, et son UUID pour `ADMIN_USER_IDS` (10.3, 10.4a).
2. Jeton BetterStack en lecture seule pour ops (10.4b) : décision prise, jeton à créer.
3. URLs des six outils externes : BetterStack, Sentry, PostHog, Supabase, OVH, Brevo (10.4f).

## 4. Décisions à prendre

1. Alerte CPU : aucun seuil dans l'AC 10.1 (disque, RAM disponible et swap seulement). La maquette affiche « pas d'alerte configurée ». Recommandation : ne pas alerter, chaque build Dokploy fait monter le CPU.
2. Ligne mobile « 1.0.1 dans `main`, en attente de l'App Store » : exige de lire la version du mobile sur `main` (hors AC 10.2). Sans décision, seule la version publiée est affichée.
3. KPIs : comptes anonymes contre permanents et tendance 14 jours (ajouts du brief) : à confirmer dans la 10.3.
4. Barres de disponibilité 30 jours et mini-courbes 24 h : à vérifier dans l'API BetterStack (10.1), sinon retirées de la maquette.
5. v1 (10.5) : audit par hachage ou identifiant de compte plutôt que l'email en clair ; valeur de l'origine de l'abonnement offert (`granted` proposé), `status` et `expires_at`.

## 5. Nettoyage de docs et de dépôts

1. Compte de test `pro@cloudbreak.app` : à renommer côté Supabase dev (le plan s'appelle Premium).
2. `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
3. `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
4. `backend/.coverage 2` est **suivi par git** dans le backend (copie iCloud d'un fichier de couverture, commitée par erreur en 2.5/2.6/2.8) : à retirer par une PR backend, avec le `.coverage` suivi à côté.
5. Digest hebdo des KPIs par email (plus tard, hors Epic 10).
