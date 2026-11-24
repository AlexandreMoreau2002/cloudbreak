# TODO ops — Cloudbreak

Chantier **Ops console** et fiabilité de l'infra. Ce fichier ne garde que ce qui reste à faire : on retire ce qui est fini (l'historique est dans git).
Dernière mise à jour : 2026-11-22.

Documents de référence :
- **Contrats d'entrée-sortie et flux : `docs/ops-console-contrats.md`** (fait foi)
- Besoins et décisions : `docs/ops-dashboard-besoins.md`
- Stories, maquettes, ordre de livraison : `docs/ops-console-stories.md` (Epic 10 dans `_bmad-output/planning-artifacts/epics.md`)
- Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB)

## Prochaine action

**Vague 1** (10.2 et 10.3 mergées et déployées sur dev) : 10.4a mergée (ops #13, `c08ab77`, à tester sur dev-ops après déploiement) ; 10.1a : code mergé (backend #52 `9f8e5fd`, script `infra/cloudbreak-server-metrics.sh` sur main `203d8a0`), reste la pose sur le VPS et Better Stack (tâches C/D, jeton Better Stack requis). Suite : 10.4b.

Prod uniquement, lecture seule. Une story = une branche `feature/` du submodule concerné, PR vers `develop` (squash). Une vague ne démarre que quand la précédente est mergée. Un seul build Dokploy et une seule connexion SSH à la fois.

## Ordre de développement

| Vague | Story | Quoi | Repo | Prérequis d'Alex | Fait |
|---|---|---|---|---|---|
| **1** | 10.4a | Socle de la console : connexion, garde d'accès, cadre, états partagés | ops | Compte admin Supabase **dev** (`app_metadata.role = "admin"`) pour tester | [x] mergée (ops #13) |
| **1** | 10.1a | Moniteur ops, script de métriques → Better Stack (alertes seules), log 5xx | VPS, backend | Jeton Better Stack (pose VPS) | [~] code mergé (#52), VPS + Better Stack à faire |
| **2** | 10.4b | Routes serveur ops : santé (Better Stack), versions (GitHub, App Store) | ops | **Jeton Better Stack en lecture seule** | [ ] |
| **3** | 10.4c | Page Utilisateurs | ops | — | [ ] |
| **3** | 10.4d | Page Santé | ops | — | [ ] |
| **3** | 10.4e | Page Déploiements | ops | — | [ ] |
| **3** | 10.4g | Pages légales : liens et bouton « Retour à la console » | ops | — | [ ] |
| **4** | 10.4f | Accueil | ops | **URLs des six outils** (Better Stack, Sentry, PostHog, Supabase, OVH, Brevo) | [ ] |
| **5** | Mise en prod | Déploiement `dev-ops` puis prod | ops, backend | **Compte admin Supabase prod** + UUID dans `ADMIN_USER_IDS` | [ ] |
| **5** | 10.1b | Brancher les scripts du VPS sur le backend (`/internal/*`), 10.3 déployée en prod d'abord | VPS | — | [ ] |
| v1 | 10.5 | Recherche par email et offrir Premium, avec audit | backend, ops | Audit par hachage ; valeur de l'origine de l'abonnement offert (`granted` proposé) | [ ] |

Détail : `docs/ops-console-stories.md` §1 et §6. Prompts Codex : `docs/ops-console-contrats.md` §7.

## À faire côté serveur

- [x] `cloudbreak-backend` et `cloudbreak-ops` (Dokploy dev) remis sur `develop` et redéployés le 2026-11-23 : `/version` répond 200 sur dev-api et dev-ops, `/api/v1/admin/overview` répond 403 sans JWT. SSH était bloqué depuis le réseau du cowork (cause réseau, pas serveur : pas de fail2ban, UFW ouvert).
- [x] `/version` affiche le vrai sha sur dev-api et dev-ops depuis le 2026-11-23 (backend `445ccd7` #51, ops `5f81469` #14) : un script de build relit le commit dans `.git`, sans build args Dokploy. À refaire sur la prod au premier déploiement après ces merges.
- [ ] Compte avec mot de passe sur Supabase **dev** pour tester la console en local (le compte dev d'Alex est en Apple, rôle `admin` déjà posé dessus), puis `ADMIN_USER_IDS` sur le backend dev et test nominal de `backend/http/admin.http`.
- [x] Rôle `admin` posé le 2026-11-23 sur le compte Supabase **prod** `pricedelu@gmail.com` (UUID `89d0d336-78e9-4dab-be43-af611a0f7e81`, connexion e-mail + mot de passe). À mettre dans `ADMIN_USER_IDS` du backend prod à la mise en prod (vague 5).

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
