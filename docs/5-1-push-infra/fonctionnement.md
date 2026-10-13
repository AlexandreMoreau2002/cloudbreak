# Story 5.1 — Infrastructure push : comment ça marche

## L'idée en une phrase
Pour prévenir quelqu'un sans qu'il ouvre l'app, on ne garde pas de ligne ouverte (pas de websocket) : on poste une lettre au facteur d'Apple, qui la dépose sur le téléphone.

## L'adresse postale = le token
Chaque téléphone reçoit d'iOS une « adresse » unique pour Cloudbreak : le **token Expo Push**. Sans elle, impossible de lui écrire.

```
 TÉLÉPHONE                       NOTRE SERVEUR                 EXPO          APPLE
 ─────────                       ─────────────                 ────          ─────
 1. permission accordée
 2. demande son token ─────────► (Expo le fabrique)
 3. POST /user/push-token ─────► stocke users.push_token
                                       │
          (plus tard, 5.2 : « il y a de la mer de nuage ! »)
                                       │
                                 4. send_push_to_user ───────► API Expo ───► APNs ───► 📱 bannière
```

## Ce que fait chaque pièce
- **Mobile `usePushToken`** : au démarrage, si le compte est permanent et la permission déjà accordée (jamais redemandée ici), récupère le token et l'envoie. Il n'est renvoyé que si l'utilisateur change.
- **Mobile `AuthContext`** : à la déconnexion, retire le token côté serveur (best-effort, 2,5 s max) pour que l'ancien compte ne reçoive plus rien.
- **Backend `POST /api/v1/user/push-token`** : enregistre le token. Si le même téléphone était lié à un autre compte, il lui est retiré.
- **Backend `DELETE /api/v1/user/push-token`** : retire le token.
- **Backend `services/notifications.py`** : envoie le message à Expo. Ne plante jamais. Si Expo répond « DeviceNotRegistered » (appli désinstallée), le token est marqué `push_token_valid=false` et on arrête d'écrire à cette adresse.

## Pourquoi seulement les comptes permanents ?
La table `users` ne contient que des comptes permanents. Un invité n'a pas de ligne où ranger son token : il en aura un dès qu'il crée son compte.

## Fichiers impactés
Backend : `app/models/user.py`, `alembic/versions/a5b1c2d3e4f5_add_user_push_token.py`, `app/schemas/user.py`, `app/services/user.py`, `app/services/notifications.py` (nouveau), `app/api/v1/endpoints/user.py`, `http/user-push-token.http`, `docs/security.md`.
Mobile : `src/services/api/user.ts`, `src/hooks/usePushToken.ts` (nouveau), `src/app/_layout.tsx`, `src/contexts/AuthContext.tsx`.

## Ce que cette story ne fait PAS
Elle n'envoie encore aucune alerte : c'est la 5.2 (alertes favoris Premium) qui utilisera `send_push_to_user`.
