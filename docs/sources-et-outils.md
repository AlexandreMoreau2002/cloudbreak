# Sources de données & outils externes — Cloudbreak

Répertorie les services tiers, sources de données, et outils externes utilisés dans le projet — pas les frameworks/libs (FastAPI, React Native, etc.) mais les **dépendances de données et services externes**.

---

## Sources de données géographiques

### OpenStreetMap (OSM)
- **Site** : https://www.openstreetmap.org
- **Ce que c'est** : base géographique collaborative mondiale, open data (licence ODbL). Équivalent open source de Google Maps.
- **Usage dans Cloudbreak** : source de vérité pour les sommets (`natural=peak`), cols (`natural=saddle`), et points de vue (`tourism=viewpoint`)
- **Comment on l'interroge** : via Overpass API (voir ci-dessous) — jamais directement à runtime, uniquement via `scripts/generate_peaks.py`

### Overpass API
- **Site** : https://overpass-api.de
- **Doc** : https://wiki.openstreetmap.org/wiki/Overpass_API
- **Ce que c'est** : interface de requête en lecture sur les données OSM. Projet open source, maintenu par Roland Olbricht. Pas une société — infrastructure communautaire.
- **Usage** : interrogé par `scripts/generate_peaks.py` pour générer `app/db/peaks_data.json`
- **Limites** : rate-limit ~10 000 req/jour par IP, timeout 60s par requête, France entière = timeout (besoin de découper par région)
- **Fréquence d'appel** : ponctuel (régénération manuelle ou cron mensuel prévu en V2) — **jamais à runtime**

---

## Sources de données météo & altitude

### Open-Meteo
- **Site** : https://open-meteo.com
- **Doc météo** : https://open-meteo.com/en/docs
- **Doc élévation** : https://open-meteo.com/en/docs/elevation-api
- **Ce que c'est** : startup allemande/suisse (fondée 2022), API météo open-data. Données issues de Copernicus (EU), DWD (Allemagne), NOAA (USA), ECMWF. Modèle freemium.
- **Usage météo** : provider principal pour l'algorithme de score mer de nuage — cloud_base, cloud_cover, température, vent, pression, humidité
- **Usage élévation** : enrichissement de l'altitude des `tourism=viewpoint` OSM qui n'ont pas de tag `ele` (batch 100 coords/appel)
- **Clé API** : non requise pour l'usage gratuit (≤ 10 000 appels/jour)
- **Résolution** : modèles horaires, données altimétriques SRTM 90m

### Météo-France (AROME)
- **Site** : https://portail-api.meteofrance.fr
- **Ce que c'est** : provider secondaire FR, modèle AROME à résolution 1.3km — meilleur que Open-Meteo sur le territoire français
- **Usage** : provider swappable via l'interface abstraite `WeatherProvider` — non activé en MVP, prévu en V2
- **Clé API** : requise (portail professionnel)

---

## Auth & utilisateurs

### Supabase
- **Site** : https://supabase.com
- **Ce que c'est** : plateforme BaaS (Backend as a Service) — auth, storage, realtime. Alternative open source à Firebase.
- **Usage** : authentification utilisateurs (email/password + JWT ECC P-256). Le JWT est validé **localement** côté backend via JWKS — pas d'appel Supabase à chaque requête.
- **Instance projet** : `https://yggehvcwxiqrkhsoxrxe.supabase.co`

---

## Paiement

### StoreKit 2 (Apple)
- **Doc** : https://developer.apple.com/storekit/
- **Ce que c'est** : framework natif Apple pour les achats In-App sur iOS/macOS
- **Usage** : abonnements freemium (mensuel/annuel). Pas de Stripe — tout passe par l'App Store.

---

## Analytics

### PostHog
- **Site** : https://posthog.com
- **Ce que c'est** : plateforme analytics open source (self-hostable). Alternative à Mixpanel/Amplitude.
- **Usage** : tracking des événements utilisateurs (score consulté, conversion paywall, validation terrain…)

---

## Push Notifications

### Expo Push Notifications
- **Doc** : https://docs.expo.dev/push-notifications/overview/
- **Ce que c'est** : service de notifications push d'Expo, unifié iOS/Android — passe par APNs (Apple) en prod
- **Usage** : notifications "mer de nuage probable demain sur tes favoris"
- **Clé** : `EXPO_ACCESS_TOKEN`

---

## Infra & déploiement

### OVH VPS
- **Site** : https://www.ovhcloud.com
- **Usage** : hébergement prod — Ubuntu 24.04, Docker Compose

### Caddy 2
- **Site** : https://caddyserver.com
- **Ce que c'est** : reverse proxy avec HTTPS Let's Encrypt automatique
- **Usage** : terminaison TLS, routing vers le backend FastAPI
