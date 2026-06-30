# Story 5.1: Infrastructure Push Notifications (Expo Push)

Status: ready-for-dev

## Story

As a developer (Alex),
I want Expo Push Notifications integrated end-to-end (mobile → backend → APNs),
so that the app can send targeted push notifications to users.

## Context & Scope

Cette story établit le **socle technique des notifications push** pour tout l'Epic 5. Elle ne déclenche aucune notification réelle côté produit — elle met en place le pipeline complet : obtention du token côté mobile, stockage en DB côté backend, et service d'envoi via l'API Expo Push.

**Flux bout en bout :**
```
App mobile (expo-notifications)
  → obtient expoPushToken au login
  → POST /api/v1/user/push-token → users.push_token (DB)

Backend (push_notification.py)
  → construit le payload Expo Push
  → POST https://exp.host/--/api/v2/push/send (avec EXPO_ACCESS_TOKEN)
  → gère DeviceNotRegistered → supprime push_token en DB
```

**Pourquoi Expo Push et pas APNs direct :**
- Gratuit, simplifie la gestion des certificats APNs
- Compatible EAS et builds locaux (simulateur inclus)
- Abstraction multi-plateforme (iOS/Android en V2 sans changer le backend)
- `EXPO_ACCESS_TOKEN` suffit pour authentifier les envois

**Dépendances :**
- Story 2.1 ✅ done — auth JWT Supabase opérationnelle, `get_current_user` disponible
- Story 2.2 ✅ done — `POST /api/v1/user/push-token` (stub) existe déjà dans `app/api/v1/endpoints/user.py`, colonne `users.push_token` en DB
- Story 5.2 (alertes favoris/régionales) et Story 5.3 (notification GPS) dépendent de cette story

**FRs couverts :** FR22 (socle pour), FR23 (socle pour), FR24 (socle pour), FR25 (via préférences déjà en 2.2)

## Acceptance Criteria

1. **Given** `expo-notifications` installé et l'app lancée pour la première fois après login
   **When** l'utilisateur a accordé la permission notifications (ou le demande)
   **Then** un `expoPushToken` de format `ExponentPushToken[xxxxxx]` est obtenu
   **And** il est envoyé au backend via `POST /api/v1/user/push-token`
   **And** il est stocké dans `users.push_token` en DB

2. **Given** l'utilisateur a déjà accordé la permission lors d'un lancement précédent
   **When** l'app se relance et l'utilisateur est authentifié
   **Then** le token est récupéré et renvoyé au backend silencieusement (sans dialog système)
   **And** si le token n'a pas changé, un double envoi est toléré (idempotent)

3. **Given** l'utilisateur refuse la permission notifications
   **When** la demande système est rejetée
   **Then** l'app ne crashe pas et continue normalement
   **And** `push_token` reste `null` en DB
   **And** aucun message d'erreur bloquant n'est affiché

4. **Given** le backend avec `EXPO_ACCESS_TOKEN` configuré en variable d'environnement
   **When** on appelle `push_notification_service.send(push_token, title, body, data)`
   **Then** la requête est envoyée à `https://exp.host/--/api/v2/push/send` avec le header `Authorization: Bearer {EXPO_ACCESS_TOKEN}`
   **And** la notification arrive sur le device en < 30 secondes (réseau nominal)

5. **Given** un `push_token` invalide ou expiré (token de device désinstallé)
   **When** l'envoi échoue avec `DeviceNotRegistered`
   **Then** `users.push_token` est mis à `null` en DB
   **And** l'erreur est loggée en JSON structuré : `logger.warning("push_token_invalid", extra={"user_id": ..., "token": ...})`
   **And** aucune exception non gérée n'est levée

6. **Given** un utilisateur sans `push_token` en DB (permission refusée)
   **When** le service push tente d'envoyer une notification à cet utilisateur
   **Then** l'envoi est silencieusement ignoré (pas d'erreur, juste un log debug)

7. **Given** `POST /api/v1/user/push-token` sans JWT valide
   **When** la requête est envoyée sans header Authorization
   **Then** elle retourne `403 Forbidden` avec `{"detail": "Not authenticated"}`

## Tasks / Subtasks

- [ ] **Mobile — installation et configuration `expo-notifications`** (AC: #1, #2, #3)
  - [ ] `npx expo install expo-notifications expo-device`
  - [ ] Ajouter dans `app.json` les permissions iOS : `UIBackgroundModes: ["remote-notification"]` et `NSUserNotificationUsageDescription`
  - [ ] Créer `src/hooks/usePushNotifications.ts` : demande permission, obtient token, envoie au backend
  - [ ] Écrire `src/hooks/usePushNotifications.test.ts`
  - [ ] Intégrer `usePushNotifications` dans `app/_layout.tsx` après confirmation du login

- [ ] **Backend — compléter `POST /api/v1/user/push-token`** (AC: #1, #7)
  - [ ] Remplacer le stub existant dans `app/api/v1/endpoints/user.py` par une implémentation avec schéma Pydantic typé (`PushTokenUpdate`)
  - [ ] Ajouter `PushTokenUpdate` dans `app/schemas/user.py`
  - [ ] Valider le format Expo (`ExponentPushToken[...]`) avec un validator Pydantic
  - [ ] Logger `push_token_registered` avec `user_id` (DEBUG)

- [ ] **Backend — service `app/services/push_notification.py`** (AC: #4, #5, #6)
  - [ ] Créer `app/services/push_notification.py` avec `ExpoPushService`
  - [ ] Méthode `async send(user_id, title, body, data)` : lit `push_token` depuis DB, appelle l'API Expo, gère `DeviceNotRegistered`
  - [ ] Méthode interne `_invalidate_token(user_id, db)` : met `push_token = null` en DB
  - [ ] Configurer `EXPO_ACCESS_TOKEN` dans `app/core/config.py` (optionnel — warn si absent)

- [ ] **Backend — tests** (AC: all)
  - [ ] Écrire `tests/test_api_push_token.py` : POST valide → 204, POST sans auth → 403, format token invalide → 422
  - [ ] Écrire `tests/test_services_push_notification.py` : mock httpx/requests, cas succès, cas `DeviceNotRegistered` → token invalidé en DB, cas `push_token = null` → ignoré silencieusement

- [ ] **Infrastructure — variable d'environnement** (AC: #4)
  - [ ] Ajouter `EXPO_ACCESS_TOKEN` dans `infra/.env.example`
  - [ ] Documenter dans `infra/README.md` comment obtenir le token depuis expo.dev

- [ ] **Documentation** (AC: all)
  - [ ] Créer `backend/docs/story-5-1-infrastructure-push-notifications.md`
  - [ ] Créer `mobile/docs/story-5-1-infrastructure-push-notifications.md`
  - [ ] Mettre à jour `backend/docs/product-audit.md`
  - [ ] Mettre à jour `sprint-status.yaml` : `5-1-infrastructure-push-notifications: done`

## Dev Notes

### Mobile — hook `usePushNotifications.ts`

```typescript
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { registerPushToken } from '@/services/api/user';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications(): void {
  const { session } = useAuth();
  const token = session?.access_token ?? '';

  useEffect(() => {
    if (!token || !Device.isDevice) return;

    async function registerToken(): Promise<void> {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) console.debug('[usePushNotifications] permission refusée');
        return;
      }

      const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      if (__DEV__) console.debug('[usePushNotifications] token obtenu', expoPushToken);

      await registerPushToken(token, expoPushToken);
    }

    registerToken().catch((err) => {
      if (__DEV__) console.debug('[usePushNotifications] erreur', String(err));
    });
  }, [token]);
}
```

**Intégration dans `app/_layout.tsx`** — appeler le hook après que l'AuthGuard confirme la session :
```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Dans le composant racine, après AuthContext :
usePushNotifications();
```

**Nouvelle fonction dans `src/services/api/user.ts`** :
```typescript
export async function registerPushToken(token: string, pushToken: string): Promise<void> {
  if (MOCK_API) {
    if (DEBUG) console.debug('[api/user] MOCK registerPushToken', pushToken);
    return;
  }
  await apiFetch<void>('/api/v1/user/push-token', token, undefined, {
    method: 'POST',
    body: { push_token: pushToken },
  });
}
```

**Note simulateur iOS :** `expo-notifications` ne peut pas obtenir un vrai push token sur simulateur — `Device.isDevice` sera `false`. Le hook return silencieusement. Tester sur device physique ou via Expo Go avec EAS.

### Backend — schéma Pydantic

```python
# app/schemas/user.py — ajouter :
import re
from pydantic import BaseModel, field_validator


class PushTokenUpdate(BaseModel):
    push_token: str

    @field_validator("push_token")
    @classmethod
    def validate_expo_token(cls, v: str) -> str:
        if not re.match(r"^ExponentPushToken\[.+\]$", v):
            raise ValueError("Format invalide — attendu : ExponentPushToken[...]")
        return v
```

### Backend — endpoint `POST /api/v1/user/push-token` (remplacement du stub)

```python
# app/api/v1/endpoints/user.py — remplacer le stub par :
from app.schemas.user import PushTokenUpdate

@router.post("/push-token", status_code=204)
async def register_push_token(
    body: PushTokenUpdate,
    current_user: dict[str, object] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Enregistre ou met à jour le token push Expo de l'utilisateur."""
    user_id = str(current_user["id"])
    user = await get_or_create_user(user_id, db)
    user.push_token = body.push_token
    await db.commit()
    logger.debug("push_token_registered", extra={"user_id": user_id})
```

### Backend — service `app/services/push_notification.py`

```python
import logging
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class ExpoPushService:
    """Wrapper pour l'API Expo Push Notifications."""

    def __init__(self) -> None:
        self._token = getattr(settings, "expo_access_token", None)
        if not self._token:
            logger.warning("EXPO_ACCESS_TOKEN non configuré — envoi push désactivé")

    async def send(
        self,
        user_id: str,
        title: str,
        body: str,
        db: AsyncSession,
        data: dict | None = None,
    ) -> bool:
        """
        Envoie une notification push à un utilisateur.
        Retourne True si envoyé, False si ignoré (token absent).
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.push_token:
            logger.debug("push_skipped_no_token", extra={"user_id": user_id})
            return False

        if not self._token:
            logger.debug("push_skipped_no_expo_token", extra={"user_id": user_id})
            return False

        payload = {
            "to": user.push_token,
            "title": title,
            "body": body,
            "data": data or {},
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    EXPO_PUSH_URL,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self._token}",
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                response_data = response.json()

            # Vérifier le statut dans la réponse Expo (data[0].status)
            push_result = response_data.get("data", [{}])
            if isinstance(push_result, list) and push_result:
                first = push_result[0]
                if first.get("status") == "error":
                    details = first.get("details", {})
                    if details.get("error") == "DeviceNotRegistered":
                        logger.warning(
                            "push_token_invalid",
                            extra={"user_id": user_id, "token": user.push_token},
                        )
                        await self._invalidate_token(user_id, db)
                        return False

            logger.debug("push_sent", extra={"user_id": user_id, "title": title})
            return True

        except Exception as exc:
            logger.error(
                "push_send_error",
                extra={"user_id": user_id, "error": str(exc)},
            )
            return False

    async def _invalidate_token(self, user_id: str, db: AsyncSession) -> None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.push_token = None
            await db.commit()
            logger.debug("push_token_cleared", extra={"user_id": user_id})


push_service = ExpoPushService()
```

### Configuration `app/core/config.py`

```python
# Ajouter dans Settings :
expo_access_token: str | None = None
```

### Variables d'environnement

**Nouvelle variable requise :**
```
EXPO_ACCESS_TOKEN=   # Obtenu sur expo.dev → Account → Access Tokens
```

**Comment obtenir le token :**
1. Se connecter sur https://expo.dev
2. Aller dans Account Settings → Access Tokens
3. Créer un token avec le scope "Push notifications"
4. L'ajouter dans les variables d'environnement Dokploy (service `api`)

**Note :** sans `EXPO_ACCESS_TOKEN`, le service log un warning au démarrage et ignore silencieusement les envois. L'app fonctionne normalement — les notifications sont simplement désactivées. Cela permet de développer sans configurer le token.

### Tests — exemples

**`tests/test_api_push_token.py`** :
```python
def test_post_push_token_valide(client) -> None:
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-123", "email": "t@t.com"}
    try:
        with TestClient(app) as c:
            response = c.post(
                "/api/v1/user/push-token",
                json={"push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"},
            )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 204


def test_post_push_token_format_invalide(client) -> None:
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-123", "email": "t@t.com"}
    try:
        with TestClient(app) as c:
            response = c.post(
                "/api/v1/user/push-token",
                json={"push_token": "not-a-valid-expo-token"},
            )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 422


def test_post_push_token_sans_auth_retourne_403(client) -> None:
    with TestClient(app) as c:
        response = c.post(
            "/api/v1/user/push-token",
            json={"push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"},
        )
    assert response.status_code == 403
```

**`tests/test_services_push_notification.py`** :
```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.push_notification import ExpoPushService


@pytest.mark.asyncio
async def test_send_succes(db_session) -> None:
    """Token valide → notification envoyée, retourne True."""
    # Créer un user avec push_token en DB
    # Mock httpx.AsyncClient.post → réponse Expo {"data": [{"status": "ok"}]}
    ...


@pytest.mark.asyncio
async def test_send_device_not_registered(db_session) -> None:
    """DeviceNotRegistered → token mis à null en DB, retourne False."""
    # Mock httpx → {"data": [{"status": "error", "details": {"error": "DeviceNotRegistered"}}]}
    # Vérifier que user.push_token == None après l'appel
    ...


@pytest.mark.asyncio
async def test_send_sans_token(db_session) -> None:
    """User sans push_token → ignoré silencieusement, retourne False."""
    # User avec push_token=None en DB
    # Vérifier qu'aucun appel HTTP n'est fait
    ...
```

### Project Structure — fichiers concernés

**Nouveaux fichiers :**
- `backend/app/services/push_notification.py` — service `ExpoPushService` + instance `push_service`
- `backend/tests/test_api_push_token.py` — tests endpoint POST push-token
- `backend/tests/test_services_push_notification.py` — tests service push (mock HTTP)
- `mobile/src/hooks/usePushNotifications.ts` — hook : permission + token + envoi backend
- `mobile/src/hooks/usePushNotifications.test.ts` — tests hook

**Fichiers modifiés :**
- `backend/app/api/v1/endpoints/user.py` — remplacer le stub `push-token` par impl Pydantic typée
- `backend/app/schemas/user.py` — ajouter `PushTokenUpdate` avec validator format Expo
- `backend/app/core/config.py` — ajouter `expo_access_token: str | None = None`
- `mobile/src/services/api/user.ts` — ajouter `registerPushToken(token, pushToken)`
- `mobile/app/_layout.tsx` — intégrer `usePushNotifications()` après auth
- `infra/.env.example` — ajouter `EXPO_ACCESS_TOKEN=`
- `infra/README.md` — documenter la procédure d'obtention du token Expo

**Fichiers non touchés (déjà en place depuis 2.2) :**
- `backend/app/models/user.py` — colonne `push_token` déjà présente
- `backend/alembic/versions/*_create_users_table.py` — migration déjà appliquée
- `backend/app/services/user_preferences.py` — `get_or_create_user` réutilisé

### Critères de done

- [ ] `make validate` (ruff + mypy + pytest --cov) passe à 100% côté backend
- [ ] `npm test && npx tsc --noEmit && npm run lint` passe côté mobile
- [ ] Test manuel sur device physique : permission accordée → token visible dans les logs Docker (`push_token_registered`)
- [ ] Test manuel : envoyer une notification de test via l'outil Expo Push Notifications (https://expo.dev/notifications) avec le token stocké en DB — notification reçue sur le device

### Socle pour

- **Story 5.2** : alertes favoris et régionales — utilisera `push_service.send(user_id, ...)` + lira `notif_favorites` et `notif_regional` depuis `users`
- **Story 5.3** : notification GPS terrain — notification locale (pas push) mais utilisera le même `usePushNotifications` pour la permission accordée

## References

- [Source: epics.md#Story 5.1] — ACs complets
- [Source: epics.md#Additional Requirements] — "Push notifications via Expo Push Notifications (gratuit, simplifie APNs, compatible EAS)"
- [Source: prd.md#FR22–FR25] — alertes push favoris, régionales, GPS, configuration par type
- [Source: CLAUDE.md#Variables d'environnement] — `EXPO_ACCESS_TOKEN`
- [Source: CLAUDE.md#Modèle de données] — `users.push_token`
- [Source: CLAUDE.md#Endpoints API] — `POST /api/v1/user/push-token`
- [Source: 2-2-gestion-preferences-notifications.md#Tasks] — stub `POST /api/v1/user/push-token` déjà créé, `push_token` colonne déjà en migration
- [Source: MEMORY.md#Story 3.3] — HTTPBearer retourne 403 (pas 401) sans header Authorization
- [Source: CLAUDE.md#Patterns de code] — `AsyncState<T>`, logs JSON structurés, `logger.debug/warning/error`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
