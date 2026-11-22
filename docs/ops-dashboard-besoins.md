# Ops console — cadrage des besoins

> Date : 2026-11-15. Statut : cadrage validé avec Alexandre, **aucun code écrit**. Remplace la story 1.6 (« Dashboard Ops Admin », post-MVP) par l'**Epic 10 « Ops console »**. Les AC détaillés par story sont dans `_bmad-output/planning-artifacts/epics.md` (Epic 10). Le brief maquette est dans `docs/ops-dashboard-maquette-brief.md`.

## 1. Pourquoi

- La prod est **publique depuis le 2026-11-13** (backend `api.cloudbreak-app.com`, ops `ops.cloudbreak-app.com`, Supabase `cloudbreak-prod`). Mobile 1.0.0 en ligne, 1.0.1 en review Apple.
- **Le premier contrôle externe est en place** : depuis le 2026-11-16, Better Stack vérifie `https://api.cloudbreak-app.com/health` toutes les 3 minutes et envoie les alertes par e-mail. La couverture reste incomplète : ops, dev, crons, sauvegardes et métriques VPS ne sont pas encore surveillés. Le PRD (FR35/NFR7) vise une alerte en moins de 2 minutes ; le plan gratuit actuel est donc un filet utile, mais ne satisfait pas encore cet objectif.
- Les crons (purge des anonymes 06:05, alertes favoris 18:05, sauvegarde 03:00 UTC) peuvent échouer en silence. Les seuls signaux sont des fichiers de log sur le VPS.
- Alex n'a aucune vue « tout fonctionne » ni « quelle version tourne sur quel serveur » ni « combien d'utilisateurs / d'abonnés » sans SSH ou SQL.

## 2. Principes

1. **Alertes d'abord, dashboard ensuite.** Un dashboard que personne ne regarde ne remplace pas une notification.
2. **L'uptime vient d'un service externe** (BetterStack), jamais du VPS surveillé : si le VPS tombe, il ne peut pas s'alerter lui-même.
3. **Le dashboard agrège et renvoie vers** PostHog, Sentry et BetterStack. Il ne recrée pas leurs écrans.
4. **Le backend reste le seul à écrire en DB.** Les actions admin passent par un endpoint protégé, avec journal d'audit.
5. **v0 = lecture seule.** Les actions d'écriture (offrir Premium, etc.) arrivent en v1.

## 3. Décisions

### Décisions de cadrage (non rouvertes)

| Décision | Détail |
|---|---|
| Pas de BMAD complet ni de repo parallèle | Cadrage à la racine ; la story 1.6 est remplacée par l'Epic 10 (5 stories). |
| Version déployée | `GET /version` (SHA du build) sur backend et ops, comparé au `main` GitHub. **Pas de clé API Dokploy dans ops.** |
| Pas de Grafana | Stack métriques self-hosted trop lourde pour le VPS partagé. |
| Implémentation, review, suivi | Codex, avec des prompts carrés. Les AC de chaque story contiennent : fichiers cibles, comportement attendu, commande de validation (`make validate` / `npm run validate`) et la mention « ne pas toucher » (zones interdites du `CLAUDE.md` racine). |

### Défauts retenus (points 1 à 5)

1. **Utilisateurs** : Alex seul, un rôle admin unique.
2. **Emails** : alertes natives BetterStack / Sentry. Digest hebdo des KPIs plus tard. Aucun email vers les utilisateurs depuis ops.
3. **Environnements** : **prod uniquement** (décision d'Alex du 2026-11-16, qui remplace « dev + prod avec un switch »). Le dev n'est ni surveillé ni affiché : pas de moniteur, pas de switch, pas de bandeau.
4. **Emails utilisateurs** : recherche par email seulement, pas de liste, audit de chaque consultation (v1, story 10.5).
5. **Périmètre v0** : santé, versions, KPIs issus de la DB (utilisateurs, abonnements actifs/essai, checks/jour), crons et sauvegardes via heartbeats, métriques serveur.

### Points tranchés (6 à 9)

| # | Sujet | Décision |
|---|---|---|
| 6 | Hébergement | **Route group `admin` dans l'app ops existante** (`noindex`, middleware). Pas de service séparé : un conteneur Node de plus pèserait sur un VPS déjà juste. |
| 7 | Auth admin | **JWT Supabase + claim de rôle dans `app_metadata`** (non modifiable par l'utilisateur), validé localement par le backend. **Second verrou** : allowlist de l'UUID admin dans l'env du backend. |
| 8 | i18n | **Sous `[locale]`**, avec `messages/fr.json` et `en.json` : l'URL est `/[locale]/admin`. Aucune exception à la règle « aucune string en dur » d'ops. |
| 9 | Métriques serveur (CPU / RAM / disque) | **Incluses dans la v0**, via un **script cron léger** sur le VPS (toutes les 15 min) qui alerte sur seuil par heartbeat Better Stack et envoie son relevé au backend ; la console affiche les jauges. **Décision du 2026-11-22 : pas d'agent Better Stack** (RAM insuffisante). Pas de clé Dokploy. Voir `docs/ops-console-contrats.md`. |

## 4. Besoins fonctionnels

| Besoin | v0 | Story |
|---|---|---|
| Être alerté (SMS/email) quand l'API ou ops **de prod** est injoignable, en moins de 2 min | ✅ | 10.1 |
| Être alerté quand un cron (purge, favoris) ou la sauvegarde ne s'est pas exécuté | ✅ | 10.1 |
| Être alerté quand la copie hors site des sauvegardes échoue, ou quand le coût OVH (stockage hors site) dépasse un seuil mensuel | ✅ | 10.1 |
| Être alerté quand le disque / la RAM / le CPU du VPS dépasse un seuil | ✅ | 10.1 |
| Voir la version (SHA) déployée sur chaque service et chaque environnement, et si elle est en retard sur `main` | ✅ | 10.2 |
| Voir les KPIs : utilisateurs (total, actifs sur 30 jours), abonnements actifs / en essai, checks par jour | ✅ | 10.3, 10.4 |
| Voir l'état des crons et de la sauvegarde (dernier passage, résultat) | ✅ | 10.3, 10.4 |
| Une page d'accueil « tout va bien ? » avec statut global (prod) | ✅ | 10.4 |
| Accéder en un clic aux outils externes : BetterStack, Sentry, PostHog, Supabase, OVH, Brevo | ✅ | 10.4 |
| Passer de la console aux pages CGU / confidentialité, et en revenir par un bouton visible seulement avec une session admin valide | ✅ | 10.4 |
| Chercher un utilisateur par email et lui offrir Premium (avec audit) | ❌ (v1) | 10.5 |

## 5. Hors périmètre

- **Toute écriture en v0** (offrir Premium, suppression, modification d'abonnement) : v1, story 10.5.
- **Grafana ou tout stack métriques self-hosted**, graphes de latence P50/P95/P99 et req/min de l'ancienne 1.6.
- **Clé API Dokploy dans ops** (ni `application.one`, ni redeploy depuis l'UI).
- **Emails vers les utilisateurs** depuis ops (l'envoi applicatif depuis le backend est abandonné ; Brevo SMTP ne sert qu'à Supabase Auth).
- **Liste d'utilisateurs** : jamais de listing, de pagination ni d'export. Uniquement une recherche par email exacte, en v1.
- **Recréer les écrans PostHog / Sentry / BetterStack** : le dashboard affiche un résumé et un lien. Le branchement réel de PostHog et Sentry reste la **story 1.8**, indépendante.
- Multi-admin, rôles fins, gestion d'équipe.
- Rappels / digest hebdo des KPIs (plus tard, via un cron existant, sans email vers les utilisateurs).

## 6. Sources de données

| Information | Source | Mécanisme |
|---|---|---|
| Uptime backend / ops (prod) | BetterStack (externe) | **Actif** : moniteur HTTP prod sur `https://api.cloudbreak-app.com/health`, toutes les 3 min, e-mail. **À faire** : ops et `/version`. Le dashboard lit l'état via l'API BetterStack, jamais depuis le VPS. |
| Crons purge / favoris / sauvegarde | Heartbeats BetterStack | Chaque script du VPS ping une URL de heartbeat en fin d'exécution réussie ; BetterStack alerte s'il manque un ping. |
| Copie hors site des sauvegardes (dernier envoi, taille du dépôt) | Heartbeat de sauvegarde + script hors site | Le heartbeat n'est envoyé qu'après la réussite de la copie hors site (`/srv/scripts/offsite-backup.sh`). Le script échoue si le dépôt dépasse 2 Go. |
| Coût OVH (Public Cloud) | Alerte de consommation OVH | Alerte e-mail OVH sur seuil mensuel (voir story 10.1) ; le dashboard ne lit pas la facture, il renvoie vers la console OVH (carte « Outils »). |
| CPU / RAM / disque du VPS | Script cron du VPS → backend (relevé 15 min) | Seuils d'alerte (par ex. disque > 85 %, RAM > 90 %), à valider après mesure. |
| Version déployée | `GET /version` backend + ops | SHA du build injecté au build ; comparé à `main` sur GitHub (API publique, lecture). |
| Utilisateurs, abonnements, checks/jour | PostgreSQL (backend) | `GET /admin/overview` (agrégats seulement, aucune donnée personnelle). |
| Réception des heartbeats côté app | Backend | Dernier passage de chaque job, exposé dans `/admin/overview`. |
| Événements produit (funnels, rétention) | PostHog | Lien sortant. Branchement réel : story 1.8. |
| Erreurs / crashs | Sentry | Lien sortant. Branchement réel : story 1.8. |

## 7. Risques

| Risque | Gravité | Mitigation |
|---|---|---|
| **Concentration de secrets** : un seul compte admin donne accès à KPIs, audit et (en v1) l'octroi de Premium. Un JWT admin volé est une prise de contrôle. | Haute | Double verrou (claim + allowlist UUID), lecture seule en v0, journal d'audit, tokens courts, aucun secret BetterStack/GitHub côté navigateur (appels faits par le backend). |
| **RGPD et email** : la règle actuelle est « l'email n'est jamais exposé ni loggé ». La recherche par email (v1) y déroge. | Haute | Reportée en v1. Exception écrite à consigner dans `backend/docs/security.md` et la politique de confidentialité si nécessaire ; recherche exacte seulement, jamais de liste, **audit de chaque consultation** (qui, quand, quel utilisateur, jamais l'email en clair dans les logs applicatifs). |
| **Couplage avec le site légal** : `ops/` est public et critique (CGU, confidentialité exigées par Apple, AASA Universal Links, `/sommet/[slug]`). Un déploiement raté de l'admin casserait ça. | Haute | Code `admin` isolé (aucun import depuis le site légal), middleware en liste blanche stricte, e2e Playwright sur les pages légales et l'AASA dans la CI, déploiement dev d'abord. |
| **VPS partagé = point de défaillance unique** : dev et prod, plus Quest / Snoroc / ESTER, sur 2 vCPU / 3,7 Go. | Haute | L'uptime et les alertes sont externes (BetterStack) ; le dashboard lui-même est un service du VPS et peut tomber avec lui, d'où « alertes d'abord ». |
| **Sauvegardes sur la même machine** : `/srv/backups`, rétention 14 jours, même disque que les bases. | Moyenne (traité le 2026-11-18) | **Copie hors site chiffrée en place** (restic vers un bucket OVH S3, Gravelines) ; la console surveille qu'elle s'est faite (heartbeat de sauvegarde, qui n'est envoyé qu'après la copie hors site) et que son **coût** reste sous un seuil (alerte de consommation OVH). Détail : `docs/sauvegardes/`. |
| **RAM de l'agent BetterStack** (risque levé le 2026-11-22 : agent abandonné, script cron à la place) : processus de plus sur un VPS déjà contraint. Mesures du 2026-11-15 : 1,75 Go de RAM disponibles sur 3,8 Go, swap 1,9 Go / 4 Go, load 0,1. | Moyenne | Mesurer l'agent avant activation en prod ; abandonner ou remplacer par un script cron plus léger si > ~100 Mo. Seuils RAM sur `available` (< 10 %) et swap (> 75 %), pas sur `used` : le cache disque fausse le `used`. |
| **Swap** : vérifié le 2026-11-15, il y a bien 4 Go de swap (`/swapfile`), utilisés à 1,9 Go. `docs/infra-serveur.md` (« pas de swap ») était faux, corrigé. Le VPS fonctionne déjà en partie sur le swap. | Moyenne | Alerte sur le swap (> 75 %). Si la RAM manque durablement, envisager un VPS plus gros plutôt qu'un agent de plus. |
| **Sauvegarde Cloudbreak : couverture** : levé le 2026-11-18. L'ancien script ne sauvegardait que la base **dev** (la prod n'avait aucune sauvegarde). Le nouveau script découvre toutes les bases (6 sur le VPS) + l'export Supabase prod, sort en erreur si une base attendue manque, et envoie le heartbeat seulement si tout (dumps et copie hors site) a réussi. | Basse | Reste à brancher le heartbeat (`HEARTBEAT_URL` dans `/srv/scripts/backup.env`) et à surveiller **Supabase** (plan Free : pause après une semaine d'inactivité, aucune sauvegarde automatique). |
| **Coût du stockage hors site** : le projet OVH Public Cloud est facturé à la carte. Une dérive (dépôt qui gonfle, mauvaise manip) ne serait vue qu'à la facture. | Moyenne | Garde-fou dans le script (échec si le dépôt dépasse 2 Go) **et** alerte de consommation OVH par e-mail (seuil mensuel). Le dashboard affiche un lien « Facturation OVH » et l'état de la copie hors site ; aucune clé OVH côté navigateur. |
| **Faux positifs / fatigue d'alertes** (seuils trop bas, builds Dokploy qui font monter le CPU) | Moyenne | Seuils avec durée minimale (par ex. 5 min soutenues), ajustés après une semaine d'observation. |
| **Source injoignable confondue avec service down** : si le dashboard ne peut pas joindre BetterStack, afficher « en panne » serait faux. | Moyenne | États distincts « inconnu / source indisponible » et « en panne » (voir le brief maquette). |

## 8. Epic 10 — Ops console (stories ordonnées)

Dépendances : 10.1 est indépendante et passe en premier. 10.2 et 10.3 sont indépendantes l'une de l'autre. 10.4 dépend de 10.1 à 10.3. 10.5 dépend de 10.3 et 10.4 et est en v1.

| Story | Titre | Résumé |
|---|---|---|
| **10.1** | Alertes d'abord | BetterStack uptime (api et ops, prod uniquement), heartbeats des crons purge / favoris / sauvegarde, script de métriques serveur (CPU/RAM/disque/swap) avec seuils, sans agent. **Absorbe la story 1.5.** |
| **10.2** | `GET /version` | SHA du build exposé par backend et ops, comparaison au `main` GitHub. Pas de clé Dokploy. |
| **10.3** | Backend admin lecture seule | Auth JWT Supabase + claim `app_metadata` + allowlist UUID, table d'audit, `GET /admin/overview` (utilisateurs, abonnements actifs / essai, checks/jour, heartbeats reçus). |
| **10.4** | UI ops `/[locale]/admin` v0 | Écrans du brief (prod uniquement), liens vers les outils externes et les pages légales, toasts, i18n fr/en, `noindex`, middleware, e2e. |
| **10.5** | (v1) Actions admin | Recherche par email + offrir Premium, audit de chaque consultation et action. |

La story **1.6 est remplacée** par cet Epic. La story **1.8** (PostHog réel + Sentry) reste séparée : le dashboard renvoie vers eux, il ne les remplace pas.

## 9. Incohérences de documentation (corrigées le 2026-11-15, sauf mention)

- `sprint-status.yaml` : stories 1.1 à 1.4 encore en `backlog` alors qu'elles sont faites.
- `docs/analytics-posthog.md` place le branchement SDK en « story 1.5 », alors qu'il est en **1.8** ; la dernière mention de la 1.6 doit pointer vers l'Epic 10.
- Weatherbit cité dans le PRD (Journey 3, ligne sur l'API météo) alors que le provider est Open-Meteo.
- « Pro » dans le PRD, `epics.md` et `docs/environnements.md` alors que le plan s'appelle **Premium** (corrigé sauf le compte de test réel `pro@cloudbreak.app`, à renommer côté Supabase).
- Swap : tranché le 2026-11-15, 4 Go présents ; `docs/infra-serveur.md` corrigé.
