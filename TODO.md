# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-10-13. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.

---

## 1. Features urgentes (dans l'ordre)

1. **Fixes logiciels en cours** (§2 App) — à clore avant de construire la prod, pour ne pas la polluer avec des bugs connus.
2. **Notifications push** : livrée et validée (epic 5). Restent le 1er run du cron et les receipts Expo (§5).
3. **Environnement de production** (bloquant pour 4.6, TestFlight pointe vers la prod) :
   - Dokploy `production` sur le VPS (Postgres + Redis dédiés, `api.cloudbreak-app.com`, `ops.cloudbreak-app.com`)
   - DNS OVH : enregistrements `api` et `ops`
   - Backend : `ENVIRONMENT=production`, `APPLE_ENVIRONMENT=Production`, clés Apple + `.p8`
   - Ops : `NEXT_PUBLIC_APP_STORE_URL` (`APPLE_TEAM_ID` déjà posée)
   - EAS profile `production` : `EXPO_PUBLIC_LEGAL_BASE_URL=ops.cloudbreak-app.com`, `EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`
   - Seed des sommets sur la DB prod (manuel, jamais par deploy)
   - Supabase : un seul projet dev+prod gardé pour le MVP, pas de split à faire
4. **Build signée + TestFlight** (story 4.6, brouillon `_bmad-output/implementation-artifacts/4-6-build-signee-testflight.md`) — dépend du point 3.

## 2. Fixes à faire

**App**
- [ ] **Correctif quota/cache — validation manuelle sur dev** :
  - chargement d'un sommet sans cache : une seule requête `GET /score/week`, jamais 63 requêtes `GET /score` ; vérifier aussi les 7 jours × 9 créneaux et l'envoi d'une validation terrain ;
  - après un chargement, mode avion puis réouverture : le cache mobile de moins de 3 h reste affiché ;
  - compte freemium de test : créer un cache, consommer le quota sur un autre sommet, puis actualiser le sommet en cache ; le paywall apparaît mais les données restent après fermeture ;
  - répéter 13 appels hebdomadaires identiques en moins d'une minute depuis `http/quota-week-batch.http` : `RATE_LIMIT_EXCEEDED`, Réessayer, jamais de paywall.
- [ ] **Refreshs de données trop fréquents** (constat 2026-10-09, lecture du code après le même log Metro : chaque `[data-refresh]` y correspond à un déclencheur identifiable) :
  - Favoris : `useFavorites` charge au montage (`mount-or-session`), puis `useFocusEffect` de `mobile/src/app/(tabs)/index.tsx` (~l.131) relance un `manual` aussitôt → 2 appels `GET /user/favorites` à ~3 ms d'écart. `favorites.tsx` a aussi son `useFocusEffect` + sa propre instance du hook. Le refresh au focus sert à rattraper un ajout depuis l'onglet Favoris, mais `addFavorite`/`removeFavorite` mettent déjà l'état à jour → probablement inutile.
  - Abonnement : `SubscriptionContext.tsx` (~l.188) recharge `GET /user/subscription` à chaque `AppState → active`, sans délai minimal.
  - Pistes : (a) délai minimal (30–60 s) entre deux refreshs d'une même source, ou refresh au focus seulement si les données sont périmées ; (b) supprimer le doublon montage + focus des favoris (voire partager une seule instance via un contexte) ; (c) stabiliser la dépendance `token` de `useWeekData`.

**2.8 Mini-sondage — parcours UI à valider**
- [ ] Tester sur app réelle : skip, catégories, retry réseau et absence du sondage à la reconnexion. La persistance API/PostgreSQL est validée.

**Avant l'environnement de prod**
- [ ] **Rate-limit Traefik sur `POST /api/v1/webhooks/apple`** avant toute exposition prod (endpoint public pour Apple, pas couvert par `RateLimitService` aujourd'hui — règle Traefik dynamique, pas de code backend).
- [ ] **Pages légales ops** (`cloudbreak-ops`) : dates réelles (`messages/fr.json`, `cgu.updated`/`privacy.updated`), identité légale (SIRET / adresse), mentionner que l'email et le nom d'usage sont conservés par le backend (`users.email`, `users.display_name`) en plus de Supabase.

**Infra (non bloquant)**
- [ ] CI backend : job qui joue `alembic upgrade head` sur une base Postgres **vide** (aurait attrapé le bug `subscriptions`).
- [ ] Backups hors VPS + **test de restauration** (aujourd'hui `/srv/backups` sur la même machine, rétention 14 j).
- [ ] Comprendre pourquoi l'image Docker du backend dev avait disparu (prune ? build d'un autre projet ?).
- [ ] Monitoring Better Stack (story 1.5) : uptime + logs, pas branché.

## 3. Notes produit avant la release

- **Promesse « Compréhension » insuffisamment remplie** : rendre plus clairs les raisons du verdict et les indicateurs déterminants (les 3 promesses : décision, compréhension, confiance) — app nouvelle, prédictions en amélioration, retours terrain = calibrage ; pas une météo fiable ni une garantie ; mention de prudence pour les décisions de sécurité.
- **`EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`** dans l'environnement EAS de production, avant le premier build.
- **Assets App Store** : icône 1024×1024, captures FR/EN. **MountainBackground** (login) : rework visuel.
- **Sommets saisis à la main** (futur) : le seed remplace nom/GPS/altitude/région sur un `slug` existant → d'abord une colonne `source` (`seed`|`manual`) et un chargement initial insert-only. Ne jamais lancer le seed par un deploy.
- **Universal Links (story 3.6)** — fini : code fait, scénario principal validé sur iPhone. Reste juste la mise en prod : créer le DNS `ops.cloudbreak-app.com`, poser `NEXT_PUBLIC_APP_STORE_URL` côté Dokploy prod (`APPLE_TEAM_ID` déjà posée) et fournir `EXPO_PUBLIC_LEGAL_BASE_URL` de prod dans l'env EAS.
- **Production backend** : `ENVIRONMENT=production` exige `APPLE_ENVIRONMENT=Production` + identifiants Apple complets + fichier `.p8` ; le dev reste `development` + `Sandbox`.

## 4. Features restantes

| Feature | Statut | Bloqué par / note |
|---|---|---|
| 3.6b Message contextuel hors-saison (FR7) | reporté | prévu au MVP (PRD), repoussé le 2026-10-12 : on est en pleine saison, à faire avant l'été 2027. Message choisi côté backend selon la météo réelle (score < 20 %, été) + affichage mobile |
| 4.6 Build signée / TestFlight | brouillon | `EXPO_PUBLIC_SUPPORT_EMAIL`, assets |
| Quota invité étage 2 (App Attest / DeviceCheck) | à planifier | — |
| Epic 1 — CI/CD mobile, monitoring (1.4, 1.5), env prod | partiel | env Dokploy prod |
| QA manuelle epics 2/3/4/6 sur iPhone réel | à faire | build installée |
| 1.8 PostHog réel + Sentry | post-MVP | après la sortie |
| Epic 8 (growth V2) et 9 (landing) | hors scope MVP | décidé le 2026-08-08 |
| 6.2 Photo de validation terrain | dropée | décision explicite |

## 5. Détail — ce qu'il reste à valider

### Story 4.6 — Build signée et TestFlight
- [ ] Build EAS signée, app dans App Store Connect (créée), build envoyée sur TestFlight et approuvée ; `EXPO_PUBLIC_SUPPORT_EMAIL` posé avant ; assets prêts (§3).

### Epic 5 — Notifications push (livrée, reste)
- [ ] Vérifier le **premier run du cron** (18:00 Paris) : `ssh vps-ovh-projets tail ~/cloudbreak-favorites.log` → `http=200` + résumé (doc `docs/infra-serveur.md` §8quater).
- [ ] Plus tard : lecture des **receipts Expo** (`DeviceNotRegistered`, PR séparée, non démarrée) ; alerte **régionale** (FR23) reportée en V2.
- [ ] Avant la 1.0.0 (cf. `backend/docs/security.md`) : rate limiting sur `POST /push-token`, valider `EXPO_ACCESS_TOKEN` en production.
