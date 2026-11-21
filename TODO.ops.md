# TODO ops — Cloudbreak

Chantier **Ops console** et fiabilité de l'infra. Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git).
Dernière mise à jour : 2026-11-22.

Documents de référence :
- Besoins et décisions : `docs/ops-dashboard-besoins.md`
- Stories, maquettes, ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`)
- Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB)

## Prochaine action

**Étape 2 — Réunir les éléments à fournir avant de coder** (voir la liste ci-dessous).

Ordre conseillé : 2 → 3 → 4. Les étapes 2 et 3 préparent le développement de l'étape 4.

---

## Étape 2 — À fournir avant de coder

- [ ] **Compte admin Supabase prod** avec `app_metadata.role = "admin"`, et son UUID pour la variable `ADMIN_USER_IDS` (stories 10.3 et 10.4a).
- [ ] **Jeton Better Stack en lecture seule** pour la console ops (10.4b). La décision est prise, il reste à créer le jeton.
- [ ] **URLs des six outils externes** : Better Stack, Sentry, PostHog, Supabase, OVH, Brevo (10.4f).

## Étape 3 — Décisions à prendre avec Alex

À trancher avant de lancer la 10.1 et la 10.3.

- [ ] **Alerte CPU** : aucun seuil dans les critères de la 10.1 (disque, RAM disponible et swap seulement). La maquette affiche « pas d'alerte configurée ». Recommandation : ne pas alerter, car chaque build Dokploy fait monter le CPU.
- [ ] **Ligne mobile « 1.0.1 dans `main`, en attente de l'App Store »** : exige de lire la version du mobile sur `main`, hors périmètre de la 10.2. Sans décision, seule la version publiée est affichée.
- [ ] **KPIs** : comptes anonymes contre permanents, et tendance sur 14 jours (ajouts du brief). À confirmer dans la 10.3.
- [ ] **Barres de disponibilité 30 jours et mini-courbes 24 h** : à vérifier dans l'API Better Stack (10.1), sinon on les retire de la maquette.
- [ ] **v1 (10.5)** : audit par hachage ou identifiant de compte plutôt que l'email en clair ; valeur de l'origine de l'abonnement offert (`granted` proposé), `status` et `expires_at`.

## Étape 4 — Epic 10 : la console ops

Prod uniquement, lecture seule. Une story = une branche `feature/` du submodule concerné, PR vers `develop` (squash).

| Ordre | Story | Contenu | Version |
|---|---|---|---|
| 1 | **10.1** | Alertes : moniteur ops, `/version`, agent serveur, log 5xx (API, heartbeats et sauvegardes sont déjà faits) | v0 |
| 2 | **10.2** | `GET /version` côté backend et ops | v0 |
| 3 | **10.3** | Backend admin en lecture seule : auth, audit, `GET /admin/overview` | v0 |
| 4 | **10.4a à 10.4g** | Console `/[locale]/admin` : socle, sources lues par ops, Utilisateurs, Santé, Déploiements, Accueil, pages légales | v0 |
| 5 | **10.5** | Recherche par email et offrir Premium, avec audit | v1 |

---

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur en 2.5/2.6/2.8). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
