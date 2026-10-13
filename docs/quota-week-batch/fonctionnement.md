# Scores de la semaine — fonctionnement

## L'idée, très simplement

Avant, l’app demandait 63 petites prévisions en même temps : 9 heures pour chacun des 7 jours. C’était comme appeler 63 fois le même magasin pour savoir s’il pleuvra cette semaine.

Maintenant, l’app demande toute la semaine en une fois. Le serveur appelle Open-Meteo une seule fois, prépare les 63 réponses, puis les renvoie à l’app dans un seul colis.

```text
Ancien trajet

App ── 63 demandes ──> API ── 63 demandes ──> Open-Meteo

Nouveau trajet

App ── 1 demande semaine ──> API ── 1 demande ──> Open-Meteo
 │                              │
 │                              └── cache Redis : 10 min
 └── cache du téléphone : 3 h
```

## Ce qui se passe quand on ouvre un sommet

1. L’app regarde d’abord dans sa mémoire locale si elle possède une prévision de moins de 3 heures.
2. Si elle en a une, elle l’affiche immédiatement. Pas besoin d’attendre Internet.
3. Sinon, elle demande les 7 jours et les 9 créneaux utiles au serveur avec `GET /api/v1/score/week`.
4. Le serveur vérifie une fois le droit de consulter ce sommet, consulte son cache Redis, puis appelle Open-Meteo seulement si nécessaire.
5. L’app affiche le calendrier et la carte score avec les mêmes données qu’avant.

```text
Tu ouvres un sommet
        │
        ▼
Cache téléphone récent ? ── oui ──> Afficher tout de suite
        │                                  │
       non                                 └──> Actualisation manuelle : essayer en arrière-plan
        │
        ▼
Demander une semaine à l'API
        │
        ▼
Cache Redis récent ? ── oui ──> Répondre vite
        │
       non
        │
        ▼
Une seule demande Open-Meteo, puis 63 scores calculés
```

## Les erreurs ne racontent plus toutes la même histoire

Un `429` veut seulement dire « stop, trop de demandes ». Il faut regarder l’étiquette jointe par le serveur pour savoir pourquoi.

| Étiquette | Ce que cela veut dire | Ce que voit la personne |
|---|---|---|
| `QUOTA_EXCEEDED` | le forfait gratuit a déjà ouvert un autre sommet aujourd’hui | le paywall ; la prévision déjà visible reste dessous |
| `RATE_LIMIT_EXCEEDED` | la même identité a demandé plus de 12 semaines en une minute | un message pour réessayer un peu plus tard, jamais le paywall |
| `WEATHER_UNAVAILABLE` | le fournisseur météo ne répond pas | le cache si disponible, sinon une erreur météo claire |
| erreur réseau | la connexion n’a pas permis de joindre le serveur | le bouton Réessayer habituel |

Le quota compte les sommets, pas les heures. Consulter 9 heures d’un même sommet ne consomme donc qu’un sommet. Le batch évite malgré tout de déclencher le coupe-circuit de 60 demandes par minute des sessions invitées.

## Ce qui reste identique

- La formule de mer de nuage ne change pas.
- Free reste limité à un sommet différent par jour ; Premium n'a pas ce quota. Tous restent protégés par la limite technique de 12 semaines par minute.
- Les 7 jours et les 9 créneaux restent les mêmes.
- Chaque score conserve son identifiant de prédiction : la validation terrain continue de fonctionner.

## Fichiers principaux

| Zone | Rôle |
|---|---|
| `backend/app/api/v1/endpoints/score.py` | ajoute la route semaine et réutilise la construction d’un score |
| `backend/app/services/weather.py` | garde une semaine météo entière en cache Redis 10 minutes |
| `backend/app/services/weather_providers/open_meteo.py` | demande 7 jours à Open-Meteo en un appel |
| `mobile/src/hooks/useWeekData.ts` | lit le cache mobile puis lance une seule demande batch |
| `mobile/src/services/api/score.ts` | appelle et normalise la réponse semaine |
| `mobile/src/app/(tabs)/index.tsx` | affiche les états quota et rate-limit sans masquer un score déjà chargé |
