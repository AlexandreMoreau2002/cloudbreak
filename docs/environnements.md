# Environnements — Cloudbreak

> Vue d'ensemble **exhaustive** de tout ce qui constitue un "environnement" pour le projet :
> serveur, auth, domaine, build mobile, observabilité, email. Ce que ça couvre en plus des
> autres docs : `docs/infra-serveur.md` détaille le VPS/Dokploy en profondeur (accès, apps,
> CI/CD) ; `docs/versions.md` détaille les versions de dépendances par submodule. Ce fichier
> répond à "qu'est-ce qu'on a comme environnement, et qu'est-ce qu'il manque pour releaser ?".
>
> Dernière mise à jour : 2026-09-04.

## Vue d'ensemble — statut par catégorie

| Catégorie | Dev | Prod | Notes |
|---|---|---|---|
| Serveur (VPS Dokploy) | ✅ en place | ❌ pas créé | même VPS, 2e environnement Dokploy à créer |
| Domaine & DNS | ✅ en place | 🟡 réservé, pas pointé prod | `cloudbreak-app.com` acheté |
| Base de données (Postgres) | ✅ en place | ❌ pas créée | instance Dokploy dédiée dev uniquement |
| Cache (Redis) | ✅ en place | ❌ pas créée | idem |
| Auth (Supabase) | ✅ en place | 🟡 même projet que dev | pas de split dev/prod, à décider |
| Local dev (Docker Compose) | ✅ en place | — | n/a, dev uniquement |
| Build mobile (EAS) | ❌ pas configuré | ❌ pas configuré | aucun `eas.json`, aucun projet EAS |
| Apple Developer Program | ❌ pas souscrit | ❌ pas souscrit | 99 $/an — **bloque tout le reste iOS** |
| App Store Connect | ❌ | ❌ | dépend d'Apple Dev |
| TestFlight | ❌ | ❌ | dépend d'Apple Dev + EAS |
| Analytics (PostHog) | 🟡 stub DEBUG-only | ❌ | taxonomie câblée, SDK jamais branché |
| Error tracking (Sentry) | ❌ | ❌ | post-MVP décidé |
| Uptime (BetterStack) | ❌ | ❌ | compte pas créé |
| Email transactionnel | ❌ | ❌ | ni redirection, ni SMTP applicatif |

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
- Universal Links iOS (`.well-known/apple-app-site-association`) : **pas fait**, bloqué par le
  compte Apple Developer (story 3.6, deferred).

## 4. Auth — Supabase

- Projet Supabase : `https://yggehvcwxiqrkhsoxrxe.supabase.co` (**un seul projet**, sert de dev —
  pas de projet séparé pour une future prod, décision à prendre le moment venu).
- JWT ECC P-256, validé **localement** côté backend via JWKS (`backend/app/core/security.py` +
  `dependencies.py`) — pas d'appel réseau à Supabase à chaque requête.
- **"Confirm email" désactivé en dev** → dette technique, à réactiver avant release 1.0.0.
- **Découverte du brainstorming story 2.5 (2026-09-04)** : aucun modèle `user.py` ni trigger
  `auth.users → public.users` côté backend. Le signup autonome (`supabase.auth.signUp`, câblé
  côté mobile depuis la story 2.1) **n'a jamais été testé bout en bout** — l'utilisateur crée les
  comptes de test à la main dans le dashboard Supabase. Le provisioning utilisateur backend au
  signup est à couvrir dans la spec 2.5/2.6/2.8 en cours.
- Comptes de test actuels (créés à la main) : `freemium@cloudbreak.app`, `pro@cloudbreak.app`,
  `test@cloudbreak.app` — tokens dans `.vscode/settings.json` (non commité) et `backend/TESTING.md`.

## 5. Mobile — build & distribution (Apple)

**État : rien n'est configuré, tout est à faire.** C'est le plus gros angle mort actuel.

- **Identité app** (`mobile/app.json`) :
  - `bundleIdentifier` iOS : `com.alexandremoreau.cloudbreak`
  - `name`/`slug` : `"mobile"` — **placeholder générique, jamais renommé** ("mobile" apparaîtrait
    sous l'icône si buildé tel quel). ⚠️ Écart avec le doc `pre-release-checklist.md` qui donnait
    `com.cloudbreak.app` comme exemple de bundle id — l'exemple n'a jamais été appliqué au code,
    le bundle id réel est `com.alexandremoreau.cloudbreak`. À trancher : on garde celui-ci ou on
    le change avant la 1ère soumission (⚠️ **le bundle id n'est quasiment jamais modifiable après
    la 1ère création dans App Store Connect** — c'est une décision à prendre AVANT ce moment-là).
  - Pas d'icône/splash finalisés vérifiés dans ce fichier (à vérifier séparément).
- **EAS (Expo Application Services)** : **aucun `eas.json`**, aucun `extra.eas.projectId` dans
  `app.json` → le projet n'est pas relié à un compte Expo/EAS. Nécessaire pour builder un IPA
  sans Xcode local à chaque fois et pour soumettre à TestFlight.
- **Compte Apple Developer Program** : **pas souscrit** (99 $/an). Bloque :
  - App Store Connect (création de l'app, bundle id définitif, métadonnées)
  - Certificats de signature + provisioning profiles
  - TestFlight (distribution bêta)
  - Sign in with Apple (story 2.6) — testable en dev sans le compte payant pour le code, mais le
    provider OAuth réel + la vraie distribution en dépendent
  - Push notifications (certificats APNs, Epic 5)
  - StoreKit 2 réel (story 4.3)
  - Universal Links (story 3.6)
- **Rien de tout ça n'a de date cible** — c'est la décision de dépense en attente (voir TODO.md).

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

**Rien n'est en place.** Deux besoins distincts :

1. **Boîte support** — `support@cloudbreak-app.com` doit exister quelque part. Piste notée :
   redirection gratuite vers Gmail (pas de vraie boîte à héberger). Adresse actuelle dans le code
   (`support@cloudbreak.app`) n'est qu'un **placeholder de fallback**, jamais définitive.
2. **Email transactionnel applicatif** (reset password, story 2.7) — nécessite un SMTP_HOST
   (pistes notées : Resend, Brevo) OU l'email générique Supabase Auth. **Bloqué sur toi** : tester
   ton propre serveur mail avant de trancher entre les deux options.

## 8. Secrets — où ils vivent

- **Jamais dans ce repo ni dans la doc.** Sources de vérité :
  - Page Notion "🖥️ Serveur OVH" — tokens Dokploy, mots de passe DB, refreshTokens webhooks
  - `.env` locaux (non commités) — `backend/.env`, `mobile/.env`
  - Variables d'environnement Dokploy (UI/API) pour le serveur
  - `.vscode/settings.json` (non commité) — tokens de test Supabase

---

## Ce qu'il reste à faire — checklist priorisée

### Peut se faire maintenant (aucun blocage externe)
- [ ] Corriger `mobile/app.json` : `name`/`slug` "mobile" → "Cloudbreak" (ou trancher si on
  attend la décision bundle id d'abord)
- [ ] Créer un compte Expo/EAS + `eas.json` minimal (profils `development`/`preview`/`production`)
  — indépendant d'Apple Dev, prépare le terrain
- [ ] Créer le compte BetterStack + brancher les alertes (story 1.5)
- [ ] Décider : split Supabase dev/prod, ou un seul projet pour le MVP (solo dev, probablement OK
  de garder un seul projet au lancement)

### Bloqué sur une décision/action de l'utilisateur
- [ ] **Licence Apple Developer (99 $/an)** — LE blocage central, débloque bundle id définitif,
  App Store Connect, TestFlight, push, StoreKit réel, Universal Links, Sign in with Apple réel
- [ ] **Tester le serveur mail perso** → trancher SMTP custom vs Supabase générique (story 2.7)
- [ ] **Choisir l'adresse support définitive** (`support@cloudbreak-app.com` vraisemblablement)
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
- [`_bmad-output/planning-artifacts/pre-release-checklist.md`](../_bmad-output/planning-artifacts/pre-release-checklist.md) — checklist de sortie complète
