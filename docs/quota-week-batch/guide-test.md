# Guide de test — scores de la semaine, quota et cache

## Prérequis

- API locale démarrée avec `cd backend && source .venv/bin/activate && make dev`.
- Redis et PostgreSQL disponibles via Docker.
- App iOS de développement installée ; Metro lancé avec `cd mobile && npm start`.
- Deux sommets connus et un compte freemium, un compte Premium, et une session invitée de test.
- Les variables REST Client sont renseignées sans committer de JWT.

## Scénarios

### 1. Chargement normal : une seule demande semaine

1. Ouvrir Metro avec `EXPO_PUBLIC_DEBUG=true`.
2. Sélectionner un sommet jamais chargé dans les trois dernières heures.
3. Ouvrir l’accueil.
4. Vérifier un seul log de demande `/api/v1/score/week` et aucune série de 63 demandes `/score`.
5. Vérifier les 7 jours du calendrier, les 9 heures de la carte et une validation terrain sur le score affiché.

Attendu : les données apparaissent normalement ; aucune erreur 429 ou 503 liée à une rafale.

### 2. Cache mobile : ouverture hors ligne

1. Réussir le scénario 1.
2. Activer le mode avion avant que trois heures ne se soient écoulées.
3. Fermer et rouvrir l’app, puis sélectionner le même sommet.

Attendu : la dernière prévision s’affiche avec le bandeau de données en cache ; aucune demande réseau n’est tentée.

### 3. Cache puis quota

1. Avec un cache valide pour un sommet, consommer le quota quotidien sur un autre sommet du même compte freemium.
2. Sur le sommet en cache, tirer pour actualiser.

Attendu : la prévision en cache reste visible. Le paywall apparaît pour `QUOTA_EXCEEDED`; après fermeture, le sommet et ses données restent affichés.

### 4. Rate limit invité

1. Utiliser une session invitée et faire renvoyer `RATE_LIMIT_EXCEEDED` par le backend de test, ou atteindre volontairement la 13e requête semaine dans la même minute avec le scénario REST Client dédié.
2. Revenir à l’accueil avec une prévision en cache.

Attendu : un message « trop de demandes » avec Réessayer apparaît ; le paywall ne s’ouvre jamais et la prévision reste affichée.

### 5. Indisponibilité Open-Meteo

1. Simuler ou provoquer une réponse `WEATHER_UNAVAILABLE` dans l’environnement local.
2. Tester une fois avec un cache valide puis une fois sans cache.

Attendu : avec cache, la prévision reste visible ; sans cache, l’état météo indisponible apparaît avec Réessayer.

### 6. Validation et contrôle d’accès

1. Appeler le endpoint semaine sans `Authorization` dans REST Client.
2. Réessayer avec un JWT valide et un `start_date` malformé.
3. Appeler ensuite avec un sommet inexistant.

Attendu : respectivement 403, 422 et 404 avec les codes d’erreur prévus.

## Cas limites

- Le cache a plus de trois heures : l’app effectue une unique demande semaine ; elle ne montre pas de données expirées comme actuelles.
- Un refresh manuel pendant une erreur réseau conserve les données et l’âge du cache.
- Un 429 `RATE_LIMIT_EXCEEDED` ne doit jamais être appelé « quota » ni ouvrir le paywall.
- Un 429 avec un code inconnu garde l’erreur générique : le statut HTTP seul ne suffit pas à déclencher une offre commerciale.
- Un sommet sélectionné depuis Recherche suit le même comportement que depuis Favoris.
- Une session Premium ne reçoit pas le quota freemium, mais reste protégée par la limite technique de 12 batches par minute.

## Checklist finale

- [ ] 1 appel mobile batch au lieu de 63 appels `/score` au démarrage.
- [ ] 1 appel Open-Meteo au maximum pour une semaine sans cache Redis.
- [ ] Cache mobile affiché avant un refresh et conservé après échec.
- [ ] Paywall uniquement pour `QUOTA_EXCEEDED`.
- [ ] Retry non bloquant pour `RATE_LIMIT_EXCEEDED`.
- [ ] 7 jours × 9 heures présents dans la réponse.
- [ ] Validation terrain réalisable sur un score retourné par le batch.
- [ ] Tests automatisés et validations complètes verts.
