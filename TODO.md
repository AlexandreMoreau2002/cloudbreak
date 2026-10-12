# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-10-09. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.

---

## 1. Features urgentes (dans l'ordre)

1. **Build signée + TestFlight** (story 4.6, brouillon `_bmad-output/implementation-artifacts/4-6-build-signee-testflight.md`).
2. **Notifications push** (epic 5 : 5.1 infra → 5.2 alertes → 5.3 validation terrain) — débloqué (compte Apple Dev validé).
3. **Environnement Dokploy de production** — checklist `docs/infra-serveur.md` §8ter.

## 2. Fixes à faire

**App**
- [ ] **Session invitée supprimée côté Supabase = app bloquée** : le JWT d'un invité supprimé donne 403 `User from sub claim in JWT does not exist` (Apple `POST /token`, e-mail `PUT /user`) sans message. Fix : détecter ce 403 dans `AuthContext.tsx` et repartir sur une session invitée neuve. Contournement dev : bouton « Réinitialiser la session ».
- [ ] **Quota dépassé (429) affiché comme une erreur réseau** (accueil après reset de session, recherche) : 429 → paywall, garder le sommet déjà chargé. Fichiers : `mobile/src/hooks/useWeekData.ts`, hooks de recherche.
- [ ] **Cache offline ignoré quand le quota est dépassé** (régression 7.2) : un freemium voit le paywall au lieu du cache (TTL 3 h). Attendu : afficher le cache puis proposer le paywall.
- [ ] **Rafale de fetchs à l'ouverture de l'app** (constat 2026-10-09, log Metro) : 63 `GET /score` d'un coup (7 jours × 9 heures, `useWeekData.ts`, ~3,6 s au total, 2 × 503 `WEATHER_UNAVAILABLE`), `GET /user/favorites` appelé 2 fois (`mount-or-session` puis `manual`), `useTerrainAutoDetect` distance `NaN`. Ce n'est pas Expo/Metro : requêtes émises par le code de l'app. À investiguer : (1) un endpoint batch (une requête semaine) ou chargement paresseux des heures ; (2) les 503 = rafale vers Open-Meteo / cache Redis non partagé entre requêtes concurrentes ; (3) chaque `GET /score` écrit une ligne `predictions` et peut consommer le quota freemium → vérifier ; (4) dédoublonner `useFavorites` ; (5) corriger le `NaN`.
- [ ] **Libellé de création de compte** : retirer « pour cette feature tu as besoin d'un compte » (candidat : `mobile/src/locales/fr.ts` ~ligne 187).

**Docs / dépôt**
- [ ] `mobile/docs/storekit.md` (~ligne 168) dit « Pas de webhook Apple » : faux (`POST /api/v1/webhooks/apple`).
- [ ] `docs/story-4-3-storekit-2-abonnements/guide-test.md` est versionné alors que la règle dit « guides de test jamais commités » : `git rm --cached` ou assumer.
- [ ] Branches à arbitrer : `ops/feature/ops-cloudbreak-favicon` (2 commits, sans PR) ; racine : `feature/cloudbreak-reveal`, `feature/parcours-compte-2-5-2-6-2-8`, `origin/feature/setup-eas-apple-storeconnect`. Le repo racine est « main uniquement » : décider comment les atterrir.

**Infra**
- [ ] CI backend : job qui joue `alembic upgrade head` sur une base Postgres **vide** (aurait attrapé le bug `subscriptions`).
- [ ] Rate-limit Traefik sur `POST /api/v1/webhooks/apple` avant toute exposition prod.
- [ ] Backups hors VPS + **test de restauration** (aujourd'hui `/srv/backups` sur la même machine, rétention 14 j).
- [ ] Comprendre pourquoi l'image Docker du backend dev avait disparu (prune ? build d'un autre projet ?).
- [ ] Monitoring Better Stack (story 1.5) : uptime + logs, pas branché.

## 3. Notes produit avant la release

- **Promesse « Compréhension » insuffisamment remplie** : rendre plus clairs les raisons du verdict et les indicateurs déterminants (les 3 promesses : décision, compréhension, confiance).
- **Message de lancement sur la maturité du score** : app nouvelle, prédictions en amélioration, retours terrain = calibrage ; pas une météo fiable ni une garantie ; mention de prudence pour les décisions de sécurité.
- **Politique de confidentialité / CGU** (`cloudbreak-ops`) : dates réelles (`messages/fr.json`, `cgu.updated`/`privacy.updated`), identité légale (SIRET / adresse), et **mentionner que l'email et le nom d’usage sont conservés par le backend** (`users.email`, `users.display_name`) en plus de Supabase.
- **`EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`** dans l'environnement EAS de production, avant le premier build.
- **Supabase** : réactiver « Confirm email » (désactivé en dev) et tester signup → confirmation → login ; décider un projet unique ou dev/prod séparés.
- **Assets App Store** : icône 1024×1024, captures FR/EN. **MountainBackground** (login) : rework visuel.
- **Sommets saisis à la main** (futur) : le seed remplace nom/GPS/altitude/région sur un `slug` existant → d'abord une colonne `source` (`seed`|`manual`) et un chargement initial insert-only. Ne jamais lancer le seed par un deploy.
- **Universal Links (story 3.6)** : tester sur iPhone les scénarios restants (sommet inconnu, onboarding non terminé, app désinstallée) ; à la mise en prod, créer le DNS `ops.cloudbreak-app.com`, poser `APPLE_TEAM_ID` / `NEXT_PUBLIC_APP_STORE_URL` côté Dokploy prod et fournir `EXPO_PUBLIC_LEGAL_BASE_URL` de prod dans l'env EAS.
- **Production backend** : `ENVIRONMENT=production` exige `APPLE_ENVIRONMENT=Production` + identifiants Apple complets + fichier `.p8` ; le dev reste `development` + `Sandbox`.

## 4. Features restantes

| Feature | Statut | Bloqué par / note |
|---|---|---|
| 4.6 Build signée / TestFlight | brouillon | `EXPO_PUBLIC_SUPPORT_EMAIL`, assets |
| Epic 5 — push (5.1, 5.2, 5.3) | backlog | rien, débloqué |
| 3.6b Message contextuel hors-saison (FR7) | backlog | volet non fait de la story 3.6 : message backend selon la météo réelle (score < 20 %, été) + affichage mobile |
| Quota invité étage 2 (App Attest / DeviceCheck) | à planifier | — |
| Epic 1 — CI/CD mobile, monitoring (1.4, 1.5), env prod | partiel | env Dokploy prod |
| QA manuelle epics 2/3/4/6 sur iPhone réel | à faire | build installée (scénarios 4.3 restants : voir fin de `docs/story-4-3-storekit-2-abonnements/guide-test.md`) |
| 1.8 PostHog réel + Sentry | post-MVP | après la sortie |
| Epic 8 (growth V2) et 9 (landing) | hors scope MVP | décidé le 2026-08-08 |
| 6.2 Photo de validation terrain | dropée | décision explicite |

## 5. Détail — ce qu'il reste à valider

### Story 2.6 / 2.7 / 2.8 — à valider en conditions réelles
- [ ] **2.6 Sign in with Apple** : jamais testé avec un vrai compte Apple Dev sur build native (prérequis EAS/Apple prêts).
- [ ] **2.7 Mot de passe oublié** : template d'e-mail du Dashboard Supabase à valider en réel.
- [ ] **2.8 Mini-sondage** : persistance réelle non validée manuellement.

### Story 4.6 — Build signée et TestFlight
- [ ] Build EAS signée, app dans App Store Connect (créée), build envoyée sur TestFlight et approuvée ; `EXPO_PUBLIC_SUPPORT_EMAIL` posé avant ; assets prêts (§3).

### Epic 5 — Notifications push
- [ ] 5.1 infra Expo Push (route `POST /api/v1/user/push-token` **inexistante**, colonne `push_token` absente) → 5.2 alertes favoris / régionales (Premium) → 5.3 notification GPS de validation terrain.
