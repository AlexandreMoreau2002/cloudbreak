# Story 5.2 — Alertes favoris : comment ça marche

## L'idée en une phrase
Chaque soir, un « facteur » (le cron) passe voir les sommets favoris des abonnés Premium. Si la mer de nuage s'annonce bonne pour demain matin, il leur envoie un message. Une seule fois par sommet et par jour.

## Le trajet

```
 CRON (18:00 Paris, 1 fois / soir)
   │  POST /internal/notifications/run-favorites   + en-tête X-Cron-Secret
   ▼
 ┌─ backend ───────────────────────────────────────────────────────────┐
 │ 0. verrou « lock:favorite-alerts » : un seul passage à la fois       │
 │ 1. SQL : utilisateurs Premium actifs                                 │
 │          + « Alertes favoris » activées + token push valide          │
 │          × leurs sommets favoris                                     │
 │ 2. pour chaque sommet DIFFÉRENT : score de demain 6h (Open-Meteo,    │
 │    5 appels en parallèle max) → verdict « high » ?                   │
 │ 3. pour chaque (utilisateur, sommet) en « high » :                   │
 │      clé Redis notif:fav:<user>:<sommet>:<date> posée ? sinon on     │
 │      saute (déjà prévenu)                                            │
 │ 4. push via Expo (langue = users.locale, repli français)             │
 │      échec → on relâche la clé pour réessayer au prochain passage    │
 └──────────────────────────────────────────────────────────────────────┘
   ▼
 Expo Push → Apple (APNs) → 📱  « Conditions idéales prévues demain 6h sur
                                  Mont Aiguille — 87% 🟢 »
   ▼  tap
 L'app ouvre le sommet (route /sommet/<slug>)
```

## Qui reçoit quoi
- Premium actif (essai ou abonnement non expiré) : oui.
- Gratuit, expiré, révoqué : non.
- « Alertes favoris » désactivées dans le Profil : non.
- Pas de token push valide (permission refusée, app désinstallée) : non.
- Alerte régionale : **pas dans cette story** (reportée en V2).

## La langue
L'app envoie sa langue (`fr` ou `en`) avec le token ; le serveur la range dans `users.locale` et écrit l'alerte dans cette langue (français si inconnue). Changer de langue dans l'app renvoie le token avec la nouvelle langue.

## Au premier plan
App ouverte, iOS n'affiche rien par défaut : l'app demande explicitement la bannière pour les alertes favoris uniquement (pas pour « Tu es au sommet », qui ouvre déjà le sheet tout seul).

## Fichiers impactés
Backend : `app/domain/favorite_alerts.py`, `app/services/favorite_alerts.py`, `app/api/v1/endpoints/internal_notifications.py`, `app/core/dependencies.py` (`require_cron_secret`), `app/core/config.py`, `app/core/errors.py`, `app/models/user.py` + migration `users.locale`, `app/schemas/user.py`, `app/services/user.py`, `.env.example`.
Mobile : `src/hooks/useNotificationTap.ts`, `src/services/notificationHandler.ts`, `src/app/_layout.tsx` ; PR séparée : `usePushToken` + `updatePushToken` (langue).

## Limites connues
- Le cron doit tourner **avant minuit (Paris)** : « demain » = jour Paris + 1.
- Pas de pagination au-delà de 2000 couples (utilisateur, favori) : un avertissement est loggé.
- Les tokens d'appareils désinstallés ne sont invalidés qu'après la lecture des « receipts » Expo (PR séparée à venir).
