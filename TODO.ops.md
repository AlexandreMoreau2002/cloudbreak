# TODO ops — Cloudbreak

Chantier **Ops console** et fiabilité de l'infra. Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git).
Dernière mise à jour : 2026-11-22.

Documents de référence :
- **Contrats d'entrée-sortie et flux : `docs/ops-console-contrats.md`** (fait foi)
- Besoins et décisions : `docs/ops-dashboard-besoins.md`
- Stories, maquettes, ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`)
- Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB)

## Prochaine action

**10.2 — `GET /version`** : aucune dépendance, on peut coder tout de suite. Ensuite 10.1, puis 10.3 et 10.4.

Prod uniquement, lecture seule. Une story = une branche `feature/` du submodule concerné, PR vers `develop` (squash). Chaque prérequis ci-dessous est rattaché à la story qui en a besoin : rien ne bloque les stories précédentes.

---

## Epic 10 — la console ops, dans l'ordre

### 10.2 — `GET /version` (backend et ops) · v0
Rien à fournir.
- [ ] **Ligne mobile « 1.0.1 dans `main`, en attente de l'App Store »** : hors périmètre (il faudrait lire la version du mobile sur `main`). Par défaut, seule la version publiée est affichée.

### 10.1 — Alertes · v0
Moniteur ops, `/version`, log 5xx et script de métriques serveur. API, heartbeats et sauvegardes sont déjà faits.
- **Pas d'agent Better Stack** (décision du 2026-11-22, voir `docs/infra-serveur.md`) : un script cron sur le VPS (toutes les 15 min), sur le modèle des crons favoris et purge, alerte sur disque > 85 %, RAM disponible < 10 % et swap > 75 %.
- [ ] **Alerte CPU** : par défaut aucune (chaque build Dokploy fait monter le CPU). À changer seulement sur demande.
- [ ] **Barres de disponibilité 30 jours et mini-courbes 24 h** : à vérifier dans l'API Better Stack, sinon on les retire de la maquette.

### 10.3 — Backend admin en lecture seule · v0
Auth, audit, `GET /admin/overview`.
- [ ] **Compte admin Supabase prod** avec `app_metadata.role = "admin"`, et son UUID pour la variable `ADMIN_USER_IDS` (aussi pour la 10.4a).
- [ ] **KPIs** : comptes anonymes contre permanents, et tendance sur 14 jours (ajouts du brief). À confirmer.

### 10.4a à 10.4g — Console `/[locale]/admin` · v0
Socle, sources lues par ops, Utilisateurs, Santé, Déploiements, Accueil, pages légales.
- [ ] **Jeton Better Stack en lecture seule** pour la console ops (10.4b). La décision est prise, il reste à créer le jeton.
- [ ] **URLs des six outils externes** : Better Stack, Sentry, PostHog, Supabase, OVH, Brevo (10.4f).

### 10.5 — Recherche par email et offrir Premium, avec audit · v1
- [ ] Audit par hachage ou identifiant de compte plutôt que l'email en clair.
- [ ] Valeur de l'origine de l'abonnement offert (`granted` proposé), `status` et `expires_at`.

---

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur en 2.5/2.6/2.8). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
