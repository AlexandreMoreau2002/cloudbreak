# Cloudbreak — Avancement des stories

> Source de vérité : `sprint-status.yaml` pour le détail. Ce fichier = vue rapide.
> ✅ mergé sur develop · ⏸ backlog (dépendance) · 🔲 à faire

---

## Epic 1 — Fondation Technique & Infrastructure

- 🔲 1.1 Setup infra VPS + Docker Compose production
- 🔲 1.2 Setup backend FastAPI squelette complet
- 🔲 1.3 Setup mobile Expo squelette + design system
- 🔲 1.4 CI/CD GitHub Actions backend + mobile
- 🔲 1.5 Monitoring BetterStack + PostHog initial

---

## Epic 2 — Authentification & Compte Utilisateur

- ✅ 2.1 Inscription et connexion (Supabase Auth)
- ⏸ 2.2 Préférences notifications *(dépend Epic 5)*
- ⏸ 2.3 Permission géolocalisation opt-in *(dépend Epic 5)*
- 🔲 2.4 Suppression compte + données RGPD ⚠️ *bloquant App Store*

---

## Epic 3 — Score Mer de Nuage & Consultation

- ✅ 3.1 Algorithme score + endpoint API
- ✅ 3.2 Seed base de données sommets (21 597 entrées)
- ✅ 3.3 Recherche sommet + favoris
- ✅ 3.4 Écran principal + ScoreCard + verdict
- ✅ 3.5 Conditions météo + fenêtre temporelle + stabilité
- ⏸ 3.6 Deep link partage *(bloqué : domaine + Apple Universal Links)*

---

## Epic 4 — Freemium & Monétisation

- ✅ 4.1 Quota freemium backend (1 check/jour Redis)
- ✅ 4.2 Paywall mobile (PaywallScreen + PaywallContext)
- 🔲 4.3 Abonnements StoreKit 2 (paiement réel) ⚠️ *bloquant monétisation*

---

## Epic 5 — Notifications & Alertes

- 🔲 5.1 Infrastructure push notifications (Expo Push)
- 🔲 5.2 Alertes push favoris + régionales (Premium)
- 🔲 5.3 Notification GPS + validation terrain

---

## Epic 6 — Validation Terrain & Data Flywheel

- 🔲 6.1 Validation terrain (confirmation/infirmation)
- 🔲 6.2 Photo optionnelle + calcul taux de précision

---

## Epic 7 — Onboarding & Mode Offline

- 🔲 7.1 Parcours onboarding narratif (3 slides)
- 🔲 7.2 Mode offline léger (cache TTL 2-3h + bandeau)

---

## Backlog technique (post-MVP)

- 🔲 Provider Météo-France AROME — champ `ceiling` (base nuageuse directe, résolution 1.3km) pour remplacer/valider l'estimation Skew-T actuelle. Bloquant pour calibration terrain.
- 🔲 Refonte visuelle FavoritesGrid — score du jour visible sur chaque carte, couleur, massif
- 🔲 Persistance `selectedPeak` en AsyncStorage — survie au kill complet de l'app
- 🔲 Sign in with Apple — V2, seulement si on ajoute un autre provider social
- 🔲 Onboarding narratif (Story 7.1) — post-MVP

---

## Hors scope / UI scaffolds (mergés)

- ✅ Page profil redesignée + composants (UserCard, ProBanner, SettingsRow)
- ✅ PaywallContext partagé entre tous les onglets
- ✅ Sandbox CloudLayerViz (route `/sandbox`, accès DEV)
