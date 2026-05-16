# Pre-Release 1.0.0 Checklist

## Dépendances externes — À régler avant release

### 🌐 Infrastructure & Domaine
- [ ] **VPS OVH réservé** — Ubuntu 24.04, minimum 4GB RAM (FastAPI + PostgreSQL + Redis + Traefik + Dokploy)
- [ ] **Dokploy installé** — `curl -sSL https://dokploy.com/install.sh | sh` — remplace Caddy + Docker Compose manuel
- [ ] **Domaine principale** — ex: `cloudbreak.fr` ou `merdenua.ge`
- [ ] **DNS configuré** — pointage vers VPS
- [ ] **Certificat SSL/TLS** — Let's Encrypt via Traefik (géré automatiquement par Dokploy)
- [ ] **App backend configurée dans Dokploy** — docker-compose.yml importé, env vars saisies dans l'UI, auto-deploy sur push `main`

### 🔒 Apple Developer Program
- [ ] **Compte Apple Developer** — inscription et souscription ($99/an)
- [ ] **Identifiant Bundle** — ex: `com.cloudbreak.app` créé dans App Store Connect
- [ ] **Certificate Signing Request (CSR)** — créé et signé via Xcode
- [ ] **Universal Links configuration** — `.well-known/apple-app-site-association` sur le domaine principal
  - Fichier JSON définissant les deep links gérés par l'app
  - HTTPS signé, accessible sur `https://[domaine]/.well-known/apple-app-site-association`
  - Re-testé après déploiement (Apple cache 1h)

### 📱 Deep Link Partage (Story 3.6)
- [ ] **URL partage finalisée** — remplacer placeholder `reminder_modify_before_mep@cloudbreak.com` par domaine réel
  - Format: `https://[domaine]/sommet/{slug}` ou `https://[domaine]/peak/{slug}`
- [ ] **Mobile deep link handler** — intégré dans `_layout.tsx` pour redirection vers SelectedPeakContext
- [ ] **Fallback web** — landing page pour utilisateurs sans app (ex: App Store link)
- [ ] **iOS App Clip** (optionnel pour MVP) — lighter entry point

### 🔐 Authentification Supabase
- [ ] **Email confirmation réactivée** — actuellement désactivé en dev (story 2-1)
  - Vérifier email list allowlist en prod vs dev
  - Tester flux complet : signup → email confirm → login
- [ ] **Supabase production project** — créé et configuré (URL + clé publique différente de dev)
- [ ] **JWKS endpoint** — accessible et utilisé par backend pour valider tokens

### 🎨 Design & Visuals
- [ ] **MountainBackground composant** — rework visuel (actuellement insuffisant pour login)
  - Options: illustration statique, animation subtle, photo landscape, pattern géométrique
- [ ] **App Icon** — 1024x1024 pour App Store (cf. design-preview-v2.html)
- [ ] **Screenshot App Store** — 3-5 screenshots anglophone + français
- [ ] **Privacy Policy & Terms of Service** — rédigés et hébergés

### 🚀 Release Workflow
- [ ] **Version bumped** — `1.0.0` en package.json (mobile) et pyproject.toml (backend)
- [ ] **Release branch** — créé depuis develop : `release/1.0.0`
- [ ] **Changelog** — résumé des features et fixes (MVP + épics complétées)
- [ ] **TestFlight build** — soumis et approuvé (1-2 jours Apple)
- [ ] **App Store listing** — soumis (1-3 jours révision Apple)

### 📊 Monitoring & Analytics
- [ ] **PostHog production** — projet créé et API key configurée en prod
- [ ] **BetterStack** (monitoring) — alertes configurées (downtime API, Redis, DB)
- [ ] **Log aggregation** — logs structurées JSON remontées en prod (stdout → container logs)

### ✅ Testing & QA
- [ ] **Manual QA checklist** — chaque AC de story 3.1-3.5 testé en physique (iOS Simulator)
- [ ] **API endpoints** — curl/Postman testing chaque endpoint `/v1/*`
- [ ] **Offline mode** — cache AsyncStorage fonctionne (tests 3.4)
- [ ] **Rate limiting** — quota freemium (story 4-1) testé si déployé

### 📝 Documentation
- [ ] **README backend** — étapes setup + variables env. prod
- [ ] **README mobile** — TestFlight invite + instructions install
- [ ] **API documentation** — OpenAPI/Swagger finalisée
- [ ] **Security.md** — mise à jour auth + secret handling prod

---

## Notes

**Story 3.6 Bloquée par :**
1. Domaine réservé (placeholder atm)
2. Apple App Site Association setup
3. MountainBackground rework (optionnel mais fortement recommandé)

**Ne pas pousser en production avant :**
- Supabase email confirmation réactivée
- VPS infrastructure + domaine configurés
- TestFlight approved par Apple
