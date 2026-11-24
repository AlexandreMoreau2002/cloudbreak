# TODO ops — Cloudbreak

Chantier **Ops console** et fiabilité de l'infra. Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git).
Dernière mise à jour : 2026-11-22.

Documents de référence :
- **Contrats d'entrée-sortie et flux : `docs/ops-console-contrats.md`** (fait foi)
- Besoins et décisions : `docs/ops-dashboard-besoins.md`
- Stories, maquettes, ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`)
- Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB)

## Prochaine action

**Vague 1** (10.2 et 10.3 mergées et déployées sur dev) : 10.4a mergée (ops #13, `c08ab77`, à tester sur dev-ops après déploiement) ; 10.1a : code mergé (backend #52 `9f8e5fd`, script `infra/cloudbreak-server-metrics.sh` sur main `203d8a0`), posé sur le VPS le 2026-11-24 (cron actif, moniteur ops prod + heartbeat serveur créés, panne simulée détectée en < 10 s ; e-mail d'alerte reçu, confirmé par Alexandre). 10.4b mergée (ops #15, `1cd994d`). Vague 3 mergée et déployée sur dev-ops le 2026-11-24 : 10.4g #16 `f3a4bf7`, 10.4d #18 `d1a651b`, 10.4c #19 `9a9b2fb`, 10.4e #17 `ac69a05` (smoke test connecté à faire). dev-ops pointe sur Supabase/API de prod, jetons Better Stack et GitHub en lecture seule posés le 2026-11-24 (reste à confirmer : révocation de l'ancien jeton GitHub ; `TOOL_URL_*` non posées). Suite : 10.4f en cours ; checklist des variables et réglages ci-dessous.

Prod uniquement, lecture seule. Une story = une branche `feature/` du submodule concerné, PR vers `develop` (squash). Une vague ne démarre que quand la précédente est mergée. Un seul build Dokploy et une seule connexion SSH à la fois.

## Ordre de développement

| Vague | Story | Quoi | Repo | Prérequis d'Alex | Fait |
|---|---|---|---|---|---|
| **1** | 10.4a | Socle de la console : connexion, garde d'accès, cadre, états partagés | ops | Compte admin Supabase **dev** (`app_metadata.role = "admin"`) pour tester | [x] mergée (ops #13) |
| **1** | 10.1a | Moniteur ops, script de métriques → Better Stack (alertes seules), log 5xx | VPS, backend | — | [x] posé et testé le 2026-11-24, e-mail d'alerte reçu |
| **2** | 10.4b | Routes serveur ops : santé (Better Stack), versions (GitHub, App Store) | ops | **Jeton Better Stack en lecture seule** | [x] mergée (ops #15, `1cd994d`) ; jeton Better Stack non testé en réel |
| **3** | 10.4c | Page Utilisateurs | ops | — | [x] mergée (ops #19) |
| **3** | 10.4d | Page Santé | ops | — | [x] mergée (ops #18) |
| **3** | 10.4e | Page Déploiements | ops | — | [x] mergée (ops #17) |
| **3** | 10.4g | Pages légales : liens et bouton « Retour à la console » | ops | — | [x] mergée (ops #16) |
| **4** | 10.4f | Accueil | ops | **URLs des six outils** (Better Stack, Sentry, PostHog, Supabase, OVH, Brevo) | [ ] |
| **5** | Mise en prod | Déploiement `dev-ops` puis prod | ops, backend | **Compte admin Supabase prod** + UUID dans `ADMIN_USER_IDS` | [ ] |
| **5** | 10.1b | Brancher les scripts du VPS sur le backend (`/internal/*`), 10.3 déployée en prod d'abord | VPS | — | [ ] |
| v1 | 10.5 | Recherche par email et offrir Premium, avec audit | backend, ops | Audit par hachage ; valeur de l'origine de l'abonnement offert (`granted` proposé) | [ ] |

Détail : `docs/ops-console-stories.md` §1 et §6. Prompts Codex : `docs/ops-console-contrats.md` §7.

## Checklist des variables et réglages (état au 2026-11-24)

Rappel : `dev-ops` pointe volontairement sur les sources de **prod** (Supabase prod, `api.cloudbreak-app.com`, Better Stack prod, GitHub) parce que le dev n'a pas de métriques. À remettre sur le dev (ou à retirer) quand l'app ops de prod sera déployée.

### Déjà fait

- [x] `dev-ops` (Dokploy) : `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` (projet prod), `ADMIN_USER_IDS` (UUID prod `89d0d336-78e9-4dab-be43-af611a0f7e81`), `API_BASE_URL` (prod), `BETTERSTACK_API_TOKEN` + `BETTERSTACK_MONITOR_API_ID` + `BETTERSTACK_MONITOR_OPS_ID` (lecture seule), `GITHUB_TOKEN` (fine-grained, lecture seule, deux dépôts) + `GITHUB_REPO_BACKEND` + `GITHUB_REPO_OPS`, `APP_STORE_ID`. Relu après sauvegarde, redéployé le 2026-11-24.
- [x] Rôle `admin` sur le compte Supabase **prod** `pricedelu@gmail.com` (e-mail + mot de passe) ; Better Stack : moniteurs API et site ops, heartbeats serveur/sauvegarde/purge/favoris ; script de métriques et cron `*/15` sur le VPS (10.1a).
- [x] `/version` sur dev-api et dev-ops (vrai sha). `dev-api` et `dev-ops` suivent `develop`.

### À faire, dans cet ordre

1. **Release du backend en prod** (Alexandre décide du moment) : `develop` → `main` selon le workflow release. Embarque 10.2 `/version`, 10.3 routes admin, migration `c3d4e5f6a7b8` (auto au démarrage), log 5xx. C'est ce qui débloque les blocs Utilisateurs, Crons, Serveur et la version backend dans Déploiements (aujourd'hui « source indisponible »).
2. **`ADMIN_USER_IDS` sur le backend prod** (`cloudbreak-backend-prod`) : UUID `89d0d336-78e9-4dab-be43-af611a0f7e81`. Sans lui `/api/v1/admin/overview` répond 403 même pour l'admin. Relire l'env après Save.
3. **10.1b** (après 1) : brancher les scripts du VPS sur le backend prod : `POST /internal/heartbeats/{purge|favorites|backup}` dans les scripts de cron prod, et `POST /internal/server-metrics` dans `cloudbreak-server-metrics.sh` (secret `INTERNAL_CRON_SECRET`, header par fichier, jamais en argument).
4. **Variables `TOOL_URL_*`** sur `dev-ops` (carte Outils de l'Accueil 10.4f ; une URL absente = outil sans lien) : `TOOL_URL_BETTERSTACK`, `TOOL_URL_SENTRY`, `TOOL_URL_POSTHOG`, `TOOL_URL_SUPABASE` (dashboard du projet prod `mjtohynpmzfxhfhtegiv`), `TOOL_URL_OVH`, `TOOL_URL_BREVO`.
5. **Mise en prod de la console** : release `ops` `develop` → `main`, puis sur `cloudbreak-ops-prod` poser les mêmes variables que `dev-ops` (sans les écarts de l'encadré ci-dessus), `API_BASE_URL` prod, `ADMIN_USER_IDS` prod ; test noir-boîte sur le build prod (route `/fr/admin` sans cookie → redirection, `/api/admin/*` → 401). Puis remettre `dev-ops` sur Supabase/API dev.
6. **Compte admin Supabase dev avec mot de passe** (optionnel, seulement si on veut une console de dev autonome) : le compte dev est en Apple ; `ADMIN_USER_IDS` sur dev-api ; test nominal de `backend/http/admin.http`.

### Sécurité et ménage des secrets

- [ ] Confirmer que l'**ancien jeton GitHub** est bien révoqué (GitHub a affiché une erreur à la suppression le 2026-11-24).
- [ ] `GITHUB_TOKEN` posé **sans expiration** : mettre une date d'expiration et noter la rotation.
- [ ] Page Notion « Serveur OVH » : contient des mots de passe et un jeton Dokploy en clair (Dokploy, Snoroc, bases de données) : à déplacer dans le gestionnaire de mots de passe, puis régénérer le jeton Dokploy.
- [ ] Jeton Better Stack en lecture seule : noter où il a été créé et qui peut le régénérer.
- [ ] **Mise à jour de sécurité Next.js** (avertissement à chaque build, fait échouer un build sur deux en local) : PR dédiée `next upgrade --agent=security`, à valider par la CI.

### Écarts connus des pages (à reprendre si besoin)

- Santé : pas de barres de disponibilité 30 jours ni de mini-courbes 24 h des jauges (relevés disponibles côté backend, `history_24h`).
- Utilisateurs : 5 cartes au lieu de 6 (anonymes hors contrat) ; pas d'étiquette « Backend » sur la courbe.
- 10.4a : `Secure: true` sur le cookie de session peut gêner un test local sous Safari ; l'écran « accès refusé » est servi en 200 et non 403 (contrat §2.1).
- Test manuel connecté de chaque page avec les vraies données : à refaire après la release backend.

## Décisions par défaut (modifiables sur demande)

- Pas d'alerte CPU (chaque build Dokploy fait monter le CPU).
- Seule la version publiée de l'app est affichée (pas de ligne « 1.0.1 dans `main`, en attente de l'App Store »).
- KPIs : comptes permanents, actifs 30 j, abonnements actifs et essais ; `delta_7d` = créations sur 7 jours. Les comptes anonymes ne sont pas comptés (ils n'existent que dans Supabase Auth ; décision du 2026-11-23).
- Barres de disponibilité 30 jours : à vérifier dans l'API Better Stack (10.4b), sinon retirées de la maquette.

---

## Nettoyage (à tout moment, sans ordre)

- [ ] Renommer le compte de test `pro@cloudbreak.app` côté Supabase dev (le plan s'appelle Premium).
- [ ] `_bmad-output/planning-artifacts/architecture.md` ligne ~507 : exemple de log avec `"provider": "openweather"`.
- [ ] `docs/infra-serveur.md` §8sexies : le titre dit « non déployé » alors que la prod est en ligne depuis le 2026-11-13.
- [ ] Backend : `backend/.coverage 2` est suivi par git (copie iCloud commitée par erreur en 2.5/2.6/2.8). À retirer par une PR backend, avec le `.coverage` suivi à côté.

## Plus tard (hors Epic 10)

- Digest hebdomadaire des KPIs par email.
