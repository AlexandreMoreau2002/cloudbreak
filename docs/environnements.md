# Environnements — Cloudbreak

> Vue d'ensemble **exhaustive** de tout ce qui constitue un "environnement" pour le projet :
> serveur, auth, domaine, build mobile, observabilité, email. Ce que ça couvre en plus des
> autres docs : `docs/infra-serveur.md` détaille le VPS/Dokploy en profondeur (accès, apps,
> CI/CD) ; `docs/versions.md` détaille les versions de dépendances par submodule. Ce fichier
> répond à "qu'est-ce qu'on a comme environnement, et qu'est-ce qu'il manque pour releaser ?".
>
> Dernière mise à jour : 2026-11-21. La **prod est en ligne depuis le 2026-11-13** (1.0.0) ; la console Ops ne surveille que la prod (décision du 2026-11-16, voir `docs/ops-console-stories.md`).

## Vue d'ensemble — statut par catégorie

| Catégorie | Dev | Prod | Notes |
|---|---|---|---|
| Serveur (VPS Dokploy) | ✅ en place | ✅ en ligne (2026-11-13) | même VPS, environnement Dokploy `prod` ; backend et ops suivent `main` |
| Domaine & DNS | ✅ `dev-api`, `dev-ops` | ✅ `api`, `ops` | `cloudbreak-app.com` (OVH) |
| Base de données (Postgres) | ✅ en place | ✅ `cloudbreak-postgres-prod` | instance dédiée par environnement |
| Cache (Redis) | ✅ en place | ✅ `cloudbreak-redis-prod` | idem |
| Auth (Supabase) | ✅ projet dev | ✅ projet séparé `cloudbreak-prod` | prod vierge : aucun compte de test |
| Sauvegardes | ✅ | ✅ | script nocturne de toutes les bases du VPS + export Supabase prod, copie hors site chiffrée (OVH S3), restauration testée (2026-11-18) ; détail `docs/sauvegardes/` |
| Local dev (Docker Compose) | ✅ en place | — | n/a, dev uniquement |
| Build mobile (EAS) | ✅ profil `staging` (vise dev) | ✅ profil `production` | Sentry et le futur PostHog seront testés ensemble sur une build native dev/TestFlight |
| Apple Developer Program | ✅ validé (2026-09-27) | ✅ idem | 99 $/an — débloque tout le reste iOS |
| App Store Connect | ✅ app + abonnements configurés | ✅ 1.0.0 publiée | 1.0.1 en revue Apple au 2026-11-15 (à confirmer) |
| TestFlight | ✅ QA avec le profil `staging` | — | la prod reste vierge : un seul test de fumée avant soumission |
| Analytics (PostHog) | 🟡 code prêt, activation à tester | ❌ projet dédié absent | projet Product Analytics actuel réservé au dev/TestFlight ; variables Dokploy/EAS encore vides |
| Error tracking (Sentry) | 🟡 code prêt | 🟡 variables à poser | projets backend/mobile créés ; DSN Dokploy/EAS et build TestFlight dev encore requis |
| Uptime et heartbeats (BetterStack) | ❌ (non surveillé, voulu) | ✅ API + 3 heartbeats | Compte créé le 2026-11-16 ; monitor `Cloudbreak API production` (`/health`, toutes les 3 min, e-mail) ; heartbeats sauvegarde, purge prod et favoris prod posés le 2026-11-18. Reste : moniteur ops, `/version`, agent serveur (Epic 10, story 10.1). |
| Alerte de coût OVH | — | ✅ 5 €/mois | stockage hors site des sauvegardes (projet Public Cloud) ; alerte e-mail OVH |
| Console Ops (Epic 10) | ❌ non surveillé, pas de switch | 🟡 cadrée, non codée | maquettes dans l'artifact « Cloudbreak Ops » ; stories : `docs/ops-console-stories.md` |
| Support par e-mail | — | ✅ opérationnel | `contact@cloudbreak-app.com` : réception ImprovMX → Gmail, réponses Gmail → Brevo |
| Email transactionnel applicatif | 🟡 Supabase Auth + Brevo | ❌ séparé du support | reset/password et autres e-mails applicatifs : décision d’intégration distincte |

---

## 1. Local (machine de dev)

- **Backend** : `docker compose -f backend/docker-compose.dev.yml up -d` → 3 containers :
  - `cloudbreak-backend` (FastAPI, port `8000`, hot reload via volume)
  - `cloudbreak-db` (Postgres 16, port `5432`, user/password `postgres`/`postgres`, db `cloudbreak`)
  - `cloudbreak-redis` (Redis 7, port `6379`)
  - Jamais de `uvicorn` en direct — toujours par `make dev` / Docker Compose.
- **Mobile** : `npx expo run:ios` (1ère fois / après module natif) puis `npm start` (Metro seul).
  Pas d'Expo Go — modules natifs incompatibles (AsyncStorage, expo-linear-gradient).
- **Variables d'env locales** : `backend/.env` et `mobile/.env` — jamais commités, voir
  `.env.example` de chaque submodule pour le template.

## 2. Serveur — VPS OVH / Dokploy

**Détail complet, accès, apps, CI/CD : voir [`docs/infra-serveur.md`](infra-serveur.md).** Résumé :

- 1 VPS OVH (`51.178.37.35`), **partagé** avec Quest, Snoroc, ESTER et Portfolio — 2 vCPU / 3.7 Go RAM, 4 Go de swap (déjà entamé : surveiller).
- Projet Dokploy `cloudbreak`, **deux environnements** :
  - `dev` : backend → `dev-api.cloudbreak-app.com` (Dockerfile, webhook GitHub actif, Postgres + Redis dédiés), ops → `dev-ops.cloudbreak-app.com` (Nixpacks/Next.js). Pendant une release, le dev suit `release/X.Y.Z` et sert d'environnement de test.
  - `prod` (le nom `production` est refusé par Dokploy) : backend → `api.cloudbreak-app.com`, ops → `ops.cloudbreak-app.com`, Postgres et Redis dédiés. Les deux apps suivent **`main`** depuis le 2026-11-13 : tout push sur `main` du backend ou d'ops redéploie la prod.
- Détail de la prod (variables, règles Traefik, crons, piège JWKS) : `docs/infra-serveur.md` §8sexies. Sauvegardes : `docs/sauvegardes/`.
- Mobile : **jamais hébergé sur ce VPS** (app native, pas de serveur à déployer pour elle).

## 3. Domaine & DNS

- **`cloudbreak-app.com`** — acheté le 2026-08-09 chez OVH. **C'est LE domaine du projet**,
  confirmé par l'utilisateur (2026-08-31) : tout est dessus (API, pages légales, future landing,
  deep links). Les hypothèses `cloudbreak.fr` et `merdenua.ge` sont abandonnées et nettoyées
  du code/de la doc vivante.
- DNS : enregistrements A `dev-api`, `dev-ops`, `api` et `ops` → `51.178.37.35`. La racine
  (future landing) n'héberge rien.
- Universal Links iOS (story 3.6) : code fait. Le fichier `.well-known/apple-app-site-association`
  est servi par `ops` (route Next.js, `APPLE_TEAM_ID` en variable d'env ops, déjà posée dans Dokploy
  sur `cloudbreak-ops`). Le domaine racine n'est pas utilisé : le lien de partage est
  `<hôte ops de l'env>/sommet/<slug>` (hôte lu dans `EXPO_PUBLIC_LEGAL_BASE_URL` : dev
  `dev-ops.cloudbreak-app.com`, prod `ops.cloudbreak-app.com`). Les Associated Domains sont calculés
  dans `mobile/app.config.ts` (`?mode=developer` automatique en dev). Scénario principal validé sur
  iPhone le 2026-10-12. `NEXT_PUBLIC_APP_STORE_URL`
  (`https://apps.apple.com/app/id6816759640`) posée sur dev et prod le 2026-11-15 : `/sommet/*` pointe vers la fiche App Store.

## 4. Auth — Supabase

- **Dev** : projet `https://yggehvcwxiqrkhsoxrxe.supabase.co`, avec les comptes de test.
- **Prod** : projet **séparé** `cloudbreak-prod` (décidé pour la release 1.0.0). Plan Free, donc
  sans sauvegarde automatique : un export nocturne de `auth` + `public` est en place et sa
  restauration a été testée (`docs/sauvegardes/`). À surveiller : pause automatique des projets
  Free après une semaine d'inactivité. Aucun compte de test n'existe sur la prod.
- JWT ECC P-256, validé **localement** côté backend via JWKS (`backend/app/core/security.py` +
  `dependencies.py`) — pas d'appel réseau à Supabase à chaque requête.
- **"Confirm email" désactivé en dev** → dette technique, à réactiver avant release 1.0.0.
- **"Secure email change"** : passé **ON** le 2026-09-27 (était OFF, contournable hors UI mobile —
  dette P0 close). Vérifié sans impact sur la conversion invité → compte, voir
  `mobile/docs/security.md` entrée du 2026-09-27.
- **Découverte du brainstorming story 2.5 (2026-09-04)** : aucun modèle `user.py` ni trigger
  `auth.users → public.users` côté backend. Le signup autonome (`supabase.auth.signUp`, câblé
  côté mobile depuis la story 2.1) **n'a jamais été testé bout en bout** — l'utilisateur crée les
  comptes de test à la main dans le dashboard Supabase. Le provisioning utilisateur backend au
  signup est à couvrir dans la spec 2.5/2.6/2.8 en cours.
- Comptes de test actuels (créés à la main) : `freemium@cloudbreak.app`, `pro@cloudbreak.app`,
  `test@cloudbreak.app` — tokens dans `.vscode/settings.json` (non commité) et `backend/TESTING.md`.

## 5. Mobile — build & distribution (Apple)

**État (2026-11-21) : l'app 1.0.0 est publiée sur l'App Store ; la 1.0.1 était en revue Apple
au 2026-11-15. Les builds de QA TestFlight utilisent le profil EAS `staging` (vise dev), les
builds de production le profil `production` (vise la prod).**

- **Identité app** (`mobile/app.json`) :
  - `bundleIdentifier` iOS : `com.alexandremoreau.cloudbreak` — **confirmé définitif le 2026-09-27**
    (décision explicite d'Alexandre, aucune migration nécessaire, c'est déjà celui du code).
  - `name`/`slug` : `"Cloudbreak – Mer de nuage"` / `"cloudbreak"`.
  - Icône : `mobile/assets/images/icon.png` (1024 × 1024), référencée dans `app.json`. Elle sera
    livrée avec la première build iOS téléversée à App Store Connect.
- **EAS (Expo Application Services)** : projet relié dans `app.json` (`extra.eas.projectId`) et
  credentials actifs. Une build native development/preview est requise pour StoreKit : Expo Go ne
  peut pas charger `react-native-iap`.
- **Compte Apple Developer Program** : **validé par Apple le 2026-09-27** (acheté le 2026-09-26, 99 $/an). Débloque :
  - App Store Connect (création de l'app, bundle id définitif, métadonnées)
  - Certificats de signature + provisioning profiles
  - TestFlight (distribution bêta)
  - Sign in with Apple (story 2.6) — testable en dev sans le compte payant pour le code, mais le
    provider OAuth réel + la vraie distribution en dépendent
  - Push notifications (certificats APNs, Epic 5)
  - StoreKit 2 réel (story 4.3)
  - Universal Links (story 3.6) — code fait, validé sur iPhone en dev (2026-10-12) ; ops prod déployé le 2026-11-13
- **App Store Connect / StoreKit** : app créée ; groupe `Cloudbreak Premium`, produits mensuel
  (4,99 €) et annuel (44,99 €), essais Apple de 7 jours, France et achats individuels configurés
  le 2026-10-03. Voir
  [`configuration-app-store-connect.md`](story-4-3-storekit-2-abonnements/configuration-app-store-connect.md).
  Les produits sont « Finaliser avant soumission » : Sandbox Tester, test sur appareil réel,
  notification V2 et première soumission restent à faire.

## 6. Observabilité

| Outil | Rôle | État |
|---|---|---|
| **PostHog** | Analytics produit (funnels, rétention) | Projet Product Analytics existant réservé au **dev/TestFlight** ; adaptateurs backend (`26ca893`) et mobile (`4d54c37`) prêts, filtrage explicite uniquement. `POSTHOG_API_KEY`/`POSTHOG_HOST` (Dokploy) et `EXPO_PUBLIC_POSTHOG_KEY`/`EXPO_PUBLIC_POSTHOG_HOST` (EAS) restent à poser, donc aucun trafic à ce stade. Autocapture, replay, erreurs, logs, flags, profils et rage clicks sont désactivés. Un projet/une clé de production séparés sont obligatoires avant activation publique. Voir `docs/posthog-analytics/`. |
| **Sentry** | Crash/error tracking | Projets `cloudbreak-backend` et `cloudbreak-mobile` créés le 2026-11-16 ; code backend/mobile prêt en mode erreurs seulement. Reste à poser `SENTRY_DSN` dans Dokploy, `EXPO_PUBLIC_SENTRY_DSN` et le secret EAS `SENTRY_AUTH_TOKEN`, puis tester sur une build iOS dev/TestFlight. |
| **BetterStack** | Alertes uptime | Compte créé le 2026-11-16. Le monitor `Cloudbreak API production` vérifie `https://api.cloudbreak-app.com/health` toutes les 3 min et alerte par e-mail. Heartbeats posés le 2026-11-18 (sauvegarde, purge prod, favoris prod ; marge 2 h pour la sauvegarde). Le dev n'est volontairement pas surveillé. Restent : moniteur ops, `/version`, agent serveur, SMS (story 10.1). |
| **Logs FastAPI** | Erreurs 5xx en JSON structuré | Logger conditionnel en place dans le code (`logger.debug/info/error`), mais pas d'agrégation/alerting externe branché dessus. |

Décision actée : **pas de Grafana** — le VPS partagé (2 vCPU/3.7 Go, déjà eu un incident de
charge) ne doit pas porter une stack métriques self-hosted en plus.

## 7. Email

### Support en production

L’adresse publique de support est **`contact@cloudbreak-app.com`**. La réception et l’envoi sont
deux flux indépendants, configurés et testés manuellement le **2026-09-12** :

```text
Réception : personne → DNS OVH / MX → ImprovMX → boîte Gmail de l’opérateur
Réponse   : Gmail « Cloudbreak Support <contact@cloudbreak-app.com> » → SMTP Brevo → personne
```

- **OVH** héberge uniquement la zone DNS. Les MX de la racine sont `10 mx1.improvmx.com` et
  `20 mx2.improvmx.com`.
- **ImprovMX** reçoit et transfère uniquement `contact@cloudbreak-app.com` vers la boîte Gmail
  de l’opérateur. Il n’envoie pas les réponses.
- **Gmail** est la boîte de travail et l’interface de réponse de l’opérateur.
- **Brevo** a authentifié `cloudbreak-app.com` et transporte les réponses SMTP envoyées depuis
  Gmail sous l’identité Cloudbreak Support.

`contact@dev.cloudbreak-app.com` n’est **pas** une adresse publique et ne doit jamais être
communiquée comme contact. Le runbook opérateur et sa procédure de diagnostic sont dans
[`docs/email-support/fonctionnement.md`](email-support/fonctionnement.md).

### Configuration du build mobile de production

Avant tout build EAS de production, l’opérateur doit configurer
`EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com` dans l’environnement EAS de production.
Le fallback sûr dans le code source garde cette même adresse si la variable est oubliée ; cela ne
remplace pas la configuration du dashboard EAS. Cette action est volontairement hors dépôt.

### E-mail transactionnel applicatif

Le support ci-dessus n’est pas un serveur d’e-mails transactionnels applicatifs. Les e-mails
Supabase Auth (confirmation, récupération de mot de passe) suivent leur configuration SMTP dédiée ;
toute intégration backend future devra être décidée, documentée et configurée séparément, sans
réutiliser les secrets du flux de support.

## 8. Secrets — où ils vivent

- **Jamais dans ce repo ni dans la doc.** Sources de vérité :
  - Page Notion "🖥️ Serveur OVH" — tokens Dokploy, mots de passe DB, refreshTokens webhooks
  - `.env` locaux (non commités) — `backend/.env`, `mobile/.env`
  - Variables d'environnement Dokploy (UI/API) pour le serveur
  - Variables EAS de l'environnement de build pour l'app mobile, y compris les variables
    `EXPO_PUBLIC_*` de PostHog ; elles ne doivent pas être copiées dans `app.json` ou dans Git
  - `.vscode/settings.json` (non commité) — tokens de test Supabase

---

## Ce qu'il reste à faire — checklist priorisée

### Peut se faire maintenant (aucun blocage externe)
- [ ] Créer un Sandbox Tester Apple et effectuer le test StoreKit sur appareil réel avec une build
  native ; ne pas utiliser Expo Go
- [x] ~~Créer le compte BetterStack + brancher les alertes (story 1.5)~~ — fait le 2026-11-16 pour l'API de production (`/health`, e-mail, toutes les 3 min). Couverture complémentaire à planifier dans l'Epic 10.
- [x] ~~Décider : split Supabase dev/prod~~ — fait : projet `cloudbreak-prod` séparé.

### Bloqué sur une décision/action de l'utilisateur
- [x] **Licence Apple Developer (99 $/an)** — acheté 2026-09-26, **validé par Apple le 2026-09-27** ; débloque bundle id définitif,
  App Store Connect, TestFlight, push, StoreKit réel, Universal Links, Sign in with Apple réel
- [ ] **Tester le serveur mail perso** → trancher SMTP custom vs Supabase générique (story 2.7)
- [x] **Adresse support choisie et vérifiée** : `contact@cloudbreak-app.com` (réception et
  réponse manuelle vérifiées le 2026-09-12)
- [x] ~~Créer un vrai environnement Dokploy de prod~~ — fait : environnement `prod`, en ligne le 2026-11-13.

### Observabilité — prochain lot iOS/TestFlight
- [ ] **Sentry** : poser les variables Dokploy/EAS, générer une build native dev/TestFlight et contrôler un événement filtré sur les deux projets.
- [ ] **PostHog dev/TestFlight** : poser les variables `POSTHOG_API_KEY`/`POSTHOG_HOST` dans Dokploy dev et `EXPO_PUBLIC_POSTHOG_KEY`/`EXPO_PUBLIC_POSTHOG_HOST` dans EAS, puis valider les événements filtrés dans la même build native que Sentry. Le compte, le projet dev/TestFlight et les SDKs sont déjà prêts.
- [ ] **PostHog — dette de taxonomie** : conserver `auth_submitted` exclu jusqu'à ce que son `error_code` soit remplacé par un enum stable ; ne jamais envoyer son texte libre actuel.

---

## Sources

- [`docs/infra-serveur.md`](infra-serveur.md) — détail VPS/Dokploy (accès, apps, CI/CD, sécurité)
- [`docs/versions.md`](versions.md) — versions déployées par submodule
- [`TODO.md`](../TODO.md) — features urgentes, fixes et notes produit avant la release
- [`TODO.ops.md`](../TODO.ops.md) et [`docs/ops-console-stories.md`](ops-console-stories.md) — chantier Ops console
- [`docs/sauvegardes/`](sauvegardes/) — sauvegardes, copie hors site, restauration
