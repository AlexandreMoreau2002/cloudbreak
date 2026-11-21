# Ops console — liste des stories et maquettes associées

> Date : 2026-11-16. Point d'entrée pour lancer Codex story par story. Les critères d'acceptation complets restent dans `_bmad-output/planning-artifacts/epics.md` (Epic 10). Besoins : `docs/ops-dashboard-besoins.md`. Choix d'interface : `docs/ops-dashboard-ux-decisions.md`.
> Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB). Chaque frame porte un identifiant (`HOME-01`, `SAN-04`…) affiché dans sa légende. Les données des maquettes sont fictives.

## 1. Vue d'ensemble

Périmètre v0 : **prod uniquement**, lecture seule. La story 10.4 est découpée en sept parties (10.4a à 10.4g) pour que chaque prompt Codex reste court et vérifiable.

| Ordre | Story | Titre | Repo | Dépend de | Maquettes |
|---|---|---|---|---|---|
| 1 | 10.1 | Alertes d'abord : moniteurs, heartbeats, agent serveur | VPS, BetterStack, backend | — | aucune (hors écran) |
| 2 | 10.2 | `GET /version` sur backend et ops | backend, ops | — | alimente `DEP-*` |
| 3 | 10.3 | Backend admin en lecture seule : auth, audit, overview, heartbeats | backend | 10.1 | alimente `HOME-*`, `USR-*`, crons de `SAN-*` |
| 4 | 10.4a | Socle de la console : accès, cadre, retours d'action | ops | 10.3 | `ACC-01` à `ACC-06`, `NAV-01`, `TST-01`, `TST-02`, `ERR-01`, `ERR-02` |
| 5 | 10.4b | Sources lues par ops : santé (BetterStack) et versions (GitHub, App Store) | ops | 10.1, 10.2, 10.4a | aucune (alimente `SAN-*`, `DEP-*`, `HOME-*`) |
| 6 | 10.4c | Page Utilisateurs | ops | 10.3, 10.4a | `USR-01` à `USR-05` |
| 7 | 10.4d | Page Santé | ops | 10.3, 10.4b | `SAN-01` à `SAN-08` |
| 8 | 10.4e | Page Déploiements | ops | 10.4b | `DEP-01` à `DEP-06` |
| 9 | 10.4f | Accueil | ops | 10.4c, 10.4d, 10.4e | `HOME-01` à `HOME-11` |
| 10 | 10.4g | Pages légales : liens et bouton « Retour à la console » | ops | 10.4a | `LEG-01`, `LEG-02` |
| v1 | 10.5 | Recherche par email et offrir Premium | backend, ops | 10.3, 10.4a | `V1-01` à `V1-05` |

L'accueil (10.4f) passe après les trois pages de détail : il réutilise leurs blocs et leurs sources.

## 2. Décision d'architecture : qui lit quoi

| Donnée | Lue par | Pourquoi |
|---|---|---|
| Utilisateurs, abonnements, checks, séries, état des crons | **Backend** (`GET /api/v1/admin/overview`) | Données de la base ; le backend reste le seul à y accéder. |
| Disponibilité des services, incidents, CPU / RAM / disque / swap | **Serveur ops** (route protégée de l'admin, jeton BetterStack en lecture seule dans l'env d'ops) | Si l'API tombe, la console doit continuer d'afficher l'état des services. Passer par le backend rendrait la console aveugle pendant la panne qu'elle doit montrer. |
| Versions : `/version` du backend et d'ops, écart avec `main`, version App Store | **Serveur ops** (API GitHub et iTunes publiques, sans clé) | Même raison ; aucune donnée sensible. |

Conséquences :
- Aucun jeton ne va dans le navigateur : les appels BetterStack, GitHub et App Store partent du serveur Next, jamais du client.
- Cette décision **remplace** la formule « BetterStack lu par le backend » du brief (§3.2, §3.6) et des risques des besoins. Elle ajoute un secret dans l'env d'ops (jeton BetterStack en lecture seule) : **validé par Alex le 2026-11-16**.
- Le serveur ops doit vérifier lui-même la session admin (JWT Supabase validé localement par JWKS, claim `app_metadata.role == "admin"`, allowlist d'UUID) avant de répondre : même règle que le backend, sans appel Supabase par requête.

## 3. Règles communes à toutes les stories d'interface (10.4a à 10.4g)

- **Chaque bloc est indépendant** : il a son propre chargement (squelette aux dimensions finales), son état vide, son état « source indisponible » et son état d'erreur. Un bloc en échec ne casse pas les autres.
- **Source injoignable ≠ en panne** : gris et « Inconnu », jamais rouge.
- **Jamais la couleur seule** : icône et libellé pour chaque statut.
- **Aucune chaîne en dur** : `useTranslations()` et `messages/fr.json` / `en.json`, espace `admin`. Le dictionnaire de la maquette sert de base.
- **Aucune donnée personnelle** affichée en v0.
- **Isolation du site légal** : aucun import de code admin depuis les pages légales, sauf le bouton de retour de 10.4g. Les e2e existants (CGU, confidentialité, AASA, `/sommet/[slug]`) restent verts.
- Mobile d'abord (375 pt), cibles tactiles d'au moins 40 px, focus visible, `prefers-reduced-motion` respecté.
- Validation : `npm run validate` dans `ops`, `make validate` dans `backend`.

## 4. Détail par story

### 10.1 — Alertes d'abord
- **Périmètre** : moniteurs BetterStack sur l'API et le site ops **de prod**, heartbeats des trois crons, agent serveur avec seuils (disque 85 %, RAM disponible 10 %, swap 75 %), log 5xx structuré côté backend.
- **Sauvegardes (levé le 2026-11-18)** : toutes les bases (prod comprise) + Supabase prod sont sauvegardées, copie hors site chiffrée en place (`docs/sauvegardes/`). Heartbeats des trois crons (sauvegarde, purge prod, favoris prod) et **alerte de consommation OVH** (5 €/mois) posés le même jour.
- **À lever avant** : la mesure de la RAM de l'agent.
- **À vérifier pour les maquettes** : BetterStack fournit-il la disponibilité jour par jour sur 30 jours (barres de `SAN-01`) et une série 24 h des métriques serveur (mini-courbes des jauges) ? Sinon, ces deux éléments sont retirés en 10.4d.
- **AC** : `epics.md`, story 10.1.

### 10.2 — `GET /version`
- **Périmètre** : route publique sur backend et ops : `service`, `sha`, `built_at`, `version`, `tag`.
- **AC** : `epics.md`, story 10.2.

### 10.3 — Backend admin en lecture seule
- **Périmètre** : dépendance `require_admin` (claim + allowlist), table `admin_audit_log`, `GET /api/v1/admin/overview` (totaux, variations 7 jours, séries 90 jours, état des crons avec « à l'heure / en retard / échec / jamais passé »), `POST /internal/heartbeats/<job>`.
- **Ajouts issus des maquettes** : variation sur 7 jours pour chaque chiffre (`USR-01`), série des checks sur 14 jours au minimum (déjà couverte par la série 90 jours), statut `failed` distinct de `late` pour un cron (`SAN-04`).
- **AC** : `epics.md`, story 10.3.

### 10.4a — Socle de la console
- **Périmètre** : routes `/[locale]/admin/**` avec garde d'accès, `noindex`, écran de connexion Supabase, session expirée, accès refusé neutre, déconnexion ; cadre (barre latérale desktop, onglets mobile, panneau Préférences) ; thème et langue ; toasts ; page d'erreur et page introuvable de la console ; composants d'état partagés (squelette, vide, source indisponible, erreur de bloc).
- **Maquettes** : `ACC-01` connexion, `ACC-02` session expirée, `ACC-03` accès refusé, `ACC-04` connexion en cours, `ACC-05` identifiants incorrects, `ACC-06` service injoignable, `NAV-01` préférences et déconnexion, `TST-01` / `TST-02` toasts, `ERR-01` erreur inattendue, `ERR-02` page introuvable.
- **Fini quand** : un compte non admin ne reçoit aucune donnée admin ; les quatre pages existent, vides, derrière la garde ; les e2e du site légal passent.

### 10.4b — Sources lues par ops
- **Périmètre** : routes serveur protégées qui renvoient l'état des services et du serveur (BetterStack) et les versions (appel de `/version`, comparaison GitHub à `main`, iTunes Lookup). Mise en cache courte côté serveur. En cas d'échec d'une source : réponse « source indisponible » avec l'heure de la dernière donnée connue, jamais une erreur 500 qui casserait la page.
- **Maquettes** : aucune en propre. Les cas d'échec sont visibles sur `SAN-05`, `DEP-03`, `DEP-06`, `HOME-07`.
- **Fini quand** : chaque source a un test du cas nominal, du cas injoignable et du cas « réponse inattendue ».

### 10.4c — Page Utilisateurs
- **Périmètre** : six cartes de chiffres avec variation 7 jours, mini-courbe 14 jours des checks, grande courbe (Utilisateurs / Usage, 30 / 90 jours), rappel de confidentialité.
- **Maquettes** : `USR-01` nominal, `USR-02` mobile sombre, `USR-03` backend injoignable, `USR-04` chargement, `USR-05` état vide.

### 10.4d — Page Santé
- **Périmètre** : Services (statut, disponibilité 24 h et 30 j, dernier incident, Postgres et Redis), Crons et sauvegardes (quatre états), Serveur (quatre jauges avec seuils).
- **Maquettes** : `SAN-01` nominal, `SAN-02` mobile dégradé, `SAN-03` panne de l'API, `SAN-04` cron en retard et en échec, `SAN-05` BetterStack injoignable, `SAN-06` état vide, `SAN-07` chargement, `SAN-08` chargement partiel.

### 10.4e — Page Déploiements
- **Périmètre** : une carte par service (version, tag, SHA, date de build, écart avec `main`), carte de l'app mobile (version App Store).
- **Maquettes** : `DEP-01` nominal, `DEP-02` mobile en retard, `DEP-03` GitHub injoignable, `DEP-04` panne de l'API, `DEP-05` chargement, `DEP-06` App Store injoignable.
- **À trancher** : la mention « 1.0.1 dans main, en attente de l'App Store » demande de lire la version du mobile sur `main` (hors AC 10.2). Sans décision, on affiche seulement la version publiée.

### 10.4f — Accueil
- **Périmètre** : bannière de statut global, « À surveiller », quatre pastilles, carte Utilisateurs avec courbe, versions en prod, carte Outils (liens vers BetterStack, Sentry, PostHog, Supabase, OVH, Brevo ; URLs en configuration).
- **Maquettes** : `HOME-01` à `HOME-04` nominal, `HOME-05` dégradé, `HOME-06` panne de l'API, `HOME-07` BetterStack injoignable, `HOME-08` chargement, `HOME-09` chargement partiel, `HOME-10` état vide, `HOME-11` hors connexion.
- **Règle du statut global** : Problème si un service est en panne ou un cron manque ; Dégradé si un seuil est dépassé ou une version en retard ; Inconnu si une source est injoignable sans problème confirmé ; sinon Tout fonctionne.

### 10.4g — Pages légales
- **Périmètre** : liens CGU et Confidentialité dans la console et sous la carte de connexion ; sur les pages légales, bouton « Retour à la console » affiché seulement avec une session admin valide.
- **Maquettes** : `LEG-01` connecté, `LEG-02` non connecté.
- **Fini quand** : sans session, le HTML des pages légales est identique à aujourd'hui ; un test prouve qu'un échec du bouton n'empêche pas l'affichage de la page.

### 10.5 (v1) — Recherche par email et offrir Premium
- **Maquettes** : `V1-01` résultat et choix de durée, `V1-02` confirmation, `V1-03` compte introuvable, `V1-04` abonnement Apple actif, `V1-05` recherche en cours.
- **AC** : `epics.md`, story 10.5. Hors de la semaine de livraison de la v0.

## 5. À fournir par Alex avant de lancer

| Élément | Pour |
|---|---|
| Jeton BetterStack en lecture seule | 10.4b |
| Compte admin dans Supabase prod avec `app_metadata.role = "admin"`, et son UUID pour `ADMIN_USER_IDS` | 10.3, 10.4a |
| URLs des tableaux de bord externes (BetterStack, Sentry, PostHog, Supabase, OVH, Brevo) | 10.4f |
| Décisions ouvertes : alerte CPU, « en attente de l'App Store » | 10.1, 10.4e |

## 6. Ordre conseillé sur une semaine

| Jour | Backend | Ops |
|---|---|---|
| 1 | 10.3 | 10.2 (partie ops), puis 10.4a |
| 2 | 10.2 (partie backend), 10.1 (log 5xx) | 10.4a (fin), 10.4b |
| 3 | 10.1 (heartbeats, moniteurs, agent : en partie manuel) | 10.4c, 10.4d |
| 4 | — | 10.4e, 10.4f |
| 5 | — | 10.4g, déploiement sur `dev-ops` d'abord, puis prod |

Backend et ops avancent en parallèle, mais un seul build Dokploy à la fois sur le VPS. La v0 tient dans la semaine si les éléments de la section 5 sont réglés le premier jour ; le point bloquant des sauvegardes est levé (2026-11-18).
