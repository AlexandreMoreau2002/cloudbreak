# Ops console — liste des stories et maquettes associées

> Date : 2026-11-16. Point d'entrée pour lancer Codex story par story. Les critères d'acceptation complets restent dans `_bmad-output/planning-artifacts/epics.md` (Epic 10). Besoins : `docs/ops-dashboard-besoins.md`. Choix d'interface : `docs/ops-dashboard-ux-decisions.md`.
> Contrats d'entrée-sortie et flux : `docs/ops-console-contrats.md` (fait foi).
> Maquettes : artifact « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB). Chaque frame porte un identifiant (`HOME-01`, `SAN-04`…) affiché dans sa légende. Les données des maquettes sont fictives.

## 1. Vue d'ensemble

Périmètre v0 : **prod uniquement**, lecture seule. La story 10.4 est découpée en sept parties (10.4a à 10.4g) pour que chaque prompt Codex reste court et vérifiable.

Les stories sont rangées en **vagues** : toutes les stories d'une même vague peuvent être développées en parallèle (une branche chacune), et une vague ne démarre que quand les « Dépend de » des précédentes sont mergés. Les formats d'échange étant figés dans `docs/ops-console-contrats.md`, une page ops peut se construire contre des données factices avant que le backend existe.

| Vague | Story | Titre | Repo | Dépend de | Maquettes |
|---|---|---|---|---|---|
| **1** | 10.4a | **Socle de la console** : connexion, garde d'accès, cadre, états partagés, toasts | ops | — (Supabase suffit) | `ACC-01` à `ACC-06`, `NAV-01`, `TST-01`, `TST-02`, `ERR-01`, `ERR-02` |
| **1** | 10.3 | Backend admin en lecture seule : auth, audit, overview, heartbeats, relevés serveur | backend | — | alimente `HOME-*`, `USR-*`, crons et jauges de `SAN-*` |
| **1** | 10.2 | `GET /version` sur backend et ops | backend, ops | — | alimente `DEP-*` |
| **1** | 10.1a | Alertes : moniteur ops, script de métriques → Better Stack seul, log 5xx | VPS, Better Stack, backend | — | aucune (hors écran) |
| **2** | 10.4b | Sources lues par ops : santé (Better Stack) et versions (GitHub, App Store), enveloppe d'erreur et cache | ops | 10.4a ; 10.2 pour les versions (données factices avant) | aucune (alimente `SAN-*`, `DEP-*`, `HOME-*`) |
| **3** | 10.4c | Page Utilisateurs | ops | 10.4a ; 10.3 pour les vraies données | `USR-01` à `USR-05` |
| **3** | 10.4d | Page Santé | ops | 10.4b ; 10.3 pour crons et jauges | `SAN-01` à `SAN-08` |
| **3** | 10.4e | Page Déploiements | ops | 10.4b, 10.2 | `DEP-01` à `DEP-06` |
| **3** | 10.4g | Pages légales : liens et bouton « Retour à la console » | ops | 10.4a | `LEG-01`, `LEG-02` |
| **4** | 10.4f | Accueil | ops | 10.4c, 10.4d, 10.4e | `HOME-01` à `HOME-11` |
| **5** | 10.1b | Brancher les scripts du VPS sur le backend (`/internal/*`) | VPS | 10.3 **déployé en prod** | aucune |
| v1 | 10.5 | Recherche par email et offrir Premium | backend, ops | 10.3, 10.4a | `V1-01` à `V1-05` |

L'accueil (10.4f) passe après les trois pages de détail : il réutilise leurs blocs et leurs sources. La 10.1 est coupée en deux : 10.1a (indépendante, vague 1, « alertes d'abord ») et 10.1b (le branchement, possible seulement quand la 10.3 est en prod).

## 2. Décision d'architecture : qui lit quoi

| Donnée | Lue par | Pourquoi |
|---|---|---|
| Utilisateurs, abonnements, checks, séries, état des crons, **jauges serveur** (relevés envoyés par le script du VPS) | **Backend** (`GET /api/v1/admin/overview`) | Données de la base ; le backend reste le seul à y accéder. |
| Disponibilité des services et incidents | **Serveur ops** (route protégée de l'admin, jeton BetterStack en lecture seule dans l'env d'ops) | Si l'API tombe, la console doit continuer d'afficher l'état des services. Passer par le backend rendrait la console aveugle pendant la panne qu'elle doit montrer. |
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
- **Éviter les collisions entre stories parallèles** : un espace de noms de traductions par page (`admin.users`, `admin.health`, `admin.deployments`, `admin.home`, `admin.legal`) ; les composants partagés (squelette, bloc vide, source indisponible, erreur de bloc, toast) sont livrés **entièrement** par la 10.4a et ne sont pas modifiés ensuite : un besoin spécifique à une page = un composant dans le dossier de cette page.
- Validation : `npm run validate` dans `ops`, `make validate` dans `backend`.

## 4. Détail par story

### 10.1 — Alertes d'abord
- **Périmètre** : moniteurs BetterStack sur l'API et le site ops **de prod**, heartbeats des trois crons, script cron de métriques serveur toutes les 15 min avec seuils (disque 85 %, RAM disponible 10 %, swap 75 %, pas d'alerte CPU), log 5xx structuré côté backend. Le branchement des scripts sur le backend (`/internal/*`) se fait après le déploiement de la 10.3. Voir contrats §6.
- **Sauvegardes (levé le 2026-11-18)** : toutes les bases (prod comprise) + Supabase prod sont sauvegardées, copie hors site chiffrée en place (`docs/sauvegardes/`). Heartbeats des trois crons (sauvegarde, purge prod, favoris prod) et **alerte de consommation OVH** (5 €/mois) posés le même jour.
- **Décision du 2026-11-22** : pas d'agent Better Stack (RAM insuffisante, mesure dans `docs/infra-serveur.md`).
- **À vérifier pour les maquettes** : BetterStack fournit-il la disponibilité jour par jour sur 30 jours (barres de `SAN-01`) ? Sinon, elles sont retirées en 10.4d. Les mini-courbes 24 h des jauges viennent du backend (`overview.server.history_24h`, relevés de 15 min).
- **AC** : `epics.md`, story 10.1.

### 10.2 — `GET /version`
- **Périmètre** : route publique sur backend et ops : `service`, `sha`, `built_at`, `version`, `tag`.
- **AC** : `epics.md`, story 10.2.

### 10.3 — Backend admin en lecture seule
- **Périmètre** : dépendance `require_admin` (claim + allowlist), table `admin_audit_log`, `GET /api/v1/admin/overview` (totaux, variations 7 jours, séries 90 jours, état des crons avec « à l'heure / en retard / échec / jamais passé »), `POST /internal/heartbeats/<job>`, `POST /internal/server-metrics`, et le bloc `server` de l'overview (contrats §3).
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
| Décisions par défaut (modifiables) : pas d'alerte CPU, pas de ligne « en attente de l'App Store » | 10.1, 10.4e |

## 6. Ordre de développement

| Étape | Quoi | En parallèle | Ce qu'Alex doit avoir fourni | Livré quand |
|---|---|---|---|---|
| **Vague 1** | 10.4a, 10.3, 10.2, 10.1a | 4 branches (ops, backend, backend+ops, VPS) | Compte admin Supabase **dev** avec `app_metadata.role = "admin"` pour tester (le compte prod avant la mise en prod) | Un admin se connecte à la console vide ; `/version` répond ; `/admin/overview` répond ; l'uptime ops et les alertes serveur sont actifs |
| **Vague 2** | 10.4b | seule (sur le socle) | Jeton Better Stack en lecture seule | Les trois routes `/api/admin/*` répondent avec leur enveloppe, y compris en cas de source injoignable |
| **Vague 3** | 10.4c, 10.4d, 10.4e, 10.4g | 4 branches ops | — | Les quatre pages sont complètes avec leurs états (chargement, vide, indisponible, erreur) |
| **Vague 4** | 10.4f | seule | URLs des six outils externes | L'accueil agrège les trois pages |
| **Vague 5** | Déploiement `dev-ops` puis prod ; 10.1b | — | Compte admin Supabase **prod** et UUID dans `ADMIN_USER_IDS` | La console est en prod ; les scripts du VPS alimentent crons et jauges |
| v1 | 10.5 | — | — | Hors v0 |

Contraintes : **un seul build Dokploy à la fois** sur le VPS (les PR peuvent être parallèles, pas les déploiements) ; une seule connexion SSH à la fois pour 10.1a et 10.1b.
