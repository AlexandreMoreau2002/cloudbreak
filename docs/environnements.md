# Environnements — Cloudbreak

> Vue d'ensemble **exhaustive** de tout ce qui constitue un "environnement" pour le projet :
> serveur, auth, domaine, build mobile, observabilité, email. Ce que ça couvre en plus des
> autres docs : `docs/infra-serveur.md` détaille le VPS/Dokploy en profondeur (accès, apps,
> CI/CD) ; `docs/versions.md` détaille les versions de dépendances par submodule. Ce fichier
> répond à "qu'est-ce qu'on a comme environnement, et qu'est-ce qu'il manque pour releaser ?".
>
> Dernière mise à jour : 2026-10-03.

## Vue d'ensemble — statut par catégorie

| Catégorie | Dev | Prod | Notes |
|---|---|---|---|
| Serveur (VPS Dokploy) | ✅ en place | ❌ pas créé | même VPS, 2e environnement Dokploy à créer |
| Domaine & DNS | ✅ en place | 🟡 réservé, pas pointé prod | `cloudbreak-app.com` acheté |
| Base de données (Postgres) | ✅ en place | ❌ pas créée | instance Dokploy dédiée dev uniquement |
| Cache (Redis) | ✅ en place | ❌ pas créée | idem |
| Auth (Supabase) | ✅ en place | 🟡 même projet que dev | pas de split dev/prod, à décider |
| Local dev (Docker Compose) | ✅ en place | — | n/a, dev uniquement |
| Build mobile (EAS) | ✅ configuré | 🟡 build de soumission à faire | projet EAS et credentials actifs ; build native requise pour StoreKit |
| Apple Developer Program | ✅ validé (2026-09-27) | ✅ idem | 99 $/an — débloque tout le reste iOS |
| App Store Connect | ✅ app + abonnements configurés | 🟡 non soumis | première version et abonnements restent à soumettre après tests |
| TestFlight | ❌ | ❌ | première build à téléverser |
| Analytics (PostHog) | 🟡 stub DEBUG-only | ❌ | taxonomie câblée, SDK jamais branché |
| Error tracking (Sentry) | ❌ | ❌ | post-MVP décidé |
| Uptime (BetterStack) | ❌ | ❌ | compte pas créé |
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

- 1 VPS OVH (`51.178.37.35`), **partagé** avec Quest et Snoroc — 2 vCPU / 3.7 Go RAM, pas de swap.
- Projet Dokploy `cloudbreak` — **un seul environnement pour l'instant, nommé `dev`**.
  - Backend → `dev-api.cloudbreak-app.com` (Dockerfile, webhook GitHub actif, Postgres + Redis Dokploy dédiés)
  - Ops (pages légales) → `dev-ops.cloudbreak-app.com` (Nixpacks/Next.js, webhook GitHub actif)
- **Pas de vrai environnement `production` Dokploy.** Quand il sera créé : domaines
  `api.cloudbreak-app.com` / `ops.cloudbreak-app.com` déjà réservés dans le schéma de nommage
  (calqué sur Snoroc, qui a lui une vraie séparation dev/prod).
- Mobile : **jamais hébergé sur ce VPS** (app native, pas de serveur à déployer pour elle).

## 3. Domaine & DNS

- **`cloudbreak-app.com`** — acheté le 2026-08-09 chez OVH. **C'est LE domaine du projet**,
  confirmé par l'utilisateur (2026-08-31) : tout est dessus (API, pages légales, future landing,
  deep links). Les hypothèses `cloudbreak.fr` et `merdenua.ge` sont abandonnées et nettoyées
  du code/de la doc vivante.
- DNS : 2 enregistrements A créés (`dev-api`, `dev-ops` → `51.178.37.35`). Les enregistrements
  prod (`api`, `ops`, racine pour la landing) ne sont **pas encore créés**.
- Universal Links iOS (story 3.6) : code fait. Le fichier `.well-known/apple-app-site-association`
  est servi par `ops` (route Next.js, `APPLE_TEAM_ID` en variable d'env ops, déjà posée dans Dokploy
  sur `cloudbreak-ops`). Le domaine racine n'est pas utilisé : le lien de partage est
  `<hôte ops de l'env>/sommet/<slug>` (hôte lu dans `EXPO_PUBLIC_LEGAL_BASE_URL` : dev
  `dev-ops.cloudbreak-app.com`, prod `ops.cloudbreak-app.com`). Les Associated Domains sont calculés
  dans `mobile/app.config.ts` (`?mode=developer` automatique en dev). Scénario principal validé sur
  iPhone le 2026-10-12. **Reste à faire pour la prod** : DNS `ops`, `APPLE_TEAM_ID` /
  `NEXT_PUBLIC_APP_STORE_URL` côté Dokploy prod, `EXPO_PUBLIC_LEGAL_BASE_URL` de prod dans EAS.

## 4. Auth — Supabase

- Projet Supabase : `https://yggehvcwxiqrkhsoxrxe.supabase.co` (**un seul projet**, sert de dev —
  pas de projet séparé pour une future prod, décision à prendre le moment venu).
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

**État : l'identité Apple, EAS et les abonnements Story 4.3 sont configurés ; aucune build n'a
encore été soumise à App Store Connect.**

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
  - Universal Links (story 3.6) — code fait, validé sur iPhone en dev (2026-10-12), reste le DNS/déploiement ops prod
- **App Store Connect / StoreKit** : app créée ; groupe `Cloudbreak Premium`, produits mensuel
  (4,99 €) et annuel (44,99 €), essais Apple de 7 jours, France et achats individuels configurés
  le 2026-10-03. Voir
  [`configuration-app-store-connect.md`](story-4-3-storekit-2-abonnements/configuration-app-store-connect.md).
  Les produits sont « Finaliser avant soumission » : Sandbox Tester, test sur appareil réel,
  notification V2 et première soumission restent à faire.

## 6. Observabilité

| Outil | Rôle | État |
|---|---|---|
| **PostHog** | Analytics produit (funnels, rétention) | Taxonomie (~31 events) définie et câblée en **stub DEBUG-only** (story 1.7) des deux côtés (`analytics.py` / `analytics.ts`). Aucune donnée ne part réellement. Compte PostHog pas créé, `POSTHOG_API_KEY` vide partout. Branchement réel = story 1.8, **post-MVP**. |
| **Sentry** | Crash/error tracking | Rien fait. Décidé le 2026-08-08, story 1.8, **post-MVP**. |
| **BetterStack** | Alertes uptime (SMS/email) | Compte pas créé. Story 1.5 (MVP), pas commencée. |
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
  - `.vscode/settings.json` (non commité) — tokens de test Supabase

---

## Ce qu'il reste à faire — checklist priorisée

### Peut se faire maintenant (aucun blocage externe)
- [ ] Créer un Sandbox Tester Apple et effectuer le test StoreKit sur appareil réel avec une build
  native ; ne pas utiliser Expo Go
- [ ] Créer le compte BetterStack + brancher les alertes (story 1.5)
- [ ] Décider : split Supabase dev/prod, ou un seul projet pour le MVP (solo dev, probablement OK
  de garder un seul projet au lancement)

### Bloqué sur une décision/action de l'utilisateur
- [x] **Licence Apple Developer (99 $/an)** — acheté 2026-09-26, **validé par Apple le 2026-09-27** ; débloque bundle id définitif,
  App Store Connect, TestFlight, push, StoreKit réel, Universal Links, Sign in with Apple réel
- [ ] **Tester le serveur mail perso** → trancher SMTP custom vs Supabase générique (story 2.7)
- [x] **Adresse support choisie et vérifiée** : `contact@cloudbreak-app.com` (réception et
  réponse manuelle vérifiées le 2026-09-12)
- [ ] **Créer un vrai environnement Dokploy `production`** — quand une vraie prod est décidée
  (pas de date, dépend du lancement)

### Post-MVP (décidé, pas à commencer)
- [ ] PostHog réel (SDK mobile + backend) — story 1.8
- [ ] Sentry (mobile + backend) — story 1.8

---

## Sources

- [`docs/infra-serveur.md`](infra-serveur.md) — détail VPS/Dokploy (accès, apps, CI/CD, sécurité)
- [`docs/versions.md`](versions.md) — versions déployées par submodule
- [`TODO.md`](../TODO.md) — chantiers en cours, dette technique
- [`TODO.md`](../TODO.md) — features urgentes, fixes et notes produit avant la release
