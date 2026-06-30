# Story 2.2: Gestion des Préférences de Notifications

Status: ready-for-dev

## Story

As an authenticated user,
I want to manage my notification preferences independently per type,
so that I only receive alerts that are relevant to me.

## Context & Scope

Cette story couvre **uniquement le stockage et l'exposition des préférences** en base de données et via l'API. Les notifications push elles-mêmes (envoi effectif, scheduling, geofencing GPS) sont implémentées en Epic 5. Ici on stocke `notif_favorites`, `notif_regional`, `notif_terrain` en DB et on expose un `PATCH /api/v1/user/notifications` + l'UI de gestion côté mobile.

**FRs couverts :** FR14 (gérer préférences notifications), FR25 (configurer/désactiver chaque type indépendamment)

**Dépendances :**
- Story 2.1 ✅ done — auth JWT Supabase opérationnelle, `get_current_user` disponible
- Story 5.1 — infrastructure push (Epic 5) utilisera `push_token` et lira ces préférences

## Acceptance Criteria

1. **Given** l'écran Profil → section Notifications
   **When** l'utilisateur arrive sur l'écran
   **Then** il voit 3 toggles indépendants : "Alertes favoris", "Alertes régionales", "Validation terrain GPS"
   **And** l'état actuel de chaque toggle est correctement chargé depuis le backend (`GET /api/v1/user/notifications`)

2. **Given** l'utilisateur désactive "Alertes favoris" (toggle actuellement ON)
   **When** il appuie sur le toggle
   **Then** la préférence est sauvegardée via `PATCH /api/v1/user/notifications` avec body `{"notif_favorites": false}`
   **And** le toggle reflète immédiatement le nouvel état (optimistic update)
   **And** la réponse backend est `200 OK` avec les préférences mises à jour

3. **Given** la table `users` en base de données
   **When** la migration Alembic est appliquée
   **Then** elle contient les colonnes `notif_favorites` (bool, NOT NULL, default true), `notif_regional` (bool, NOT NULL, default true), `notif_terrain` (bool, NOT NULL, default true)
   **And** `push_token` (String, nullable) est également présent pour la story 5.1

4. **Given** `PATCH /api/v1/user/notifications` avec JWT valide
   **When** le body contient un sous-ensemble des préférences (ex: `{"notif_regional": false}`)
   **Then** seule la préférence fournie est mise à jour
   **And** les autres restent inchangées

5. **Given** `GET /api/v1/user/notifications` sans JWT
   **When** la requête est envoyée sans header Authorization
   **Then** elle retourne `403 Forbidden` avec `{"detail": "Not authenticated"}`
   *(Note: HTTPBearer retourne 403 quand le header est absent — comportement connu, cf. story 3.3)*

6. **Given** `PATCH /api/v1/user/notifications` avec un utilisateur dont la ligne `users` n'existe pas encore
   **When** la requête est envoyée
   **Then** une ligne est créée (upsert) avec les valeurs fournies et les defaults pour les champs absents

## Tasks / Subtasks

- [ ] **Backend — migration Alembic : table `users`** (AC: #3)
  - [ ] Créer migration `alembic revision --autogenerate -m "create_users_table"` (ou manuellement)
  - [ ] Table `users` : `id` (String PK — UUID Supabase), `push_token` (String nullable), `notif_favorites` (Boolean, default True, NOT NULL), `notif_regional` (Boolean, default True, NOT NULL), `notif_terrain` (Boolean, default True, NOT NULL), `created_at`, `updated_at`
  - [ ] Créer `app/models/user.py` avec le modèle SQLAlchemy `User`
  - [ ] Mettre à jour `app/models/__init__.py` pour exposer `User`

- [ ] **Backend — schémas Pydantic** (AC: #2, #4)
  - [ ] Créer `app/schemas/user.py` : `NotificationPreferencesResponse`, `NotificationPreferencesUpdate` (tous les champs `Optional[bool]`)

- [ ] **Backend — endpoints GET + PATCH /api/v1/user/notifications** (AC: #1, #2, #4, #5, #6)
  - [ ] Ajouter `GET /api/v1/user/notifications` dans `app/api/v1/endpoints/user.py` : lit ou crée la ligne `users` (upsert), retourne `NotificationPreferencesResponse`
  - [ ] Ajouter `PATCH /api/v1/user/notifications` dans `app/api/v1/endpoints/user.py` : upsert avec les champs fournis, retourne `NotificationPreferencesResponse`
  - [ ] Ajouter `POST /api/v1/user/push-token` (stub pour story 5.1) : reçoit `{"push_token": "..."}`, upsert dans `users.push_token`, retourne `204`
  - [ ] Créer `app/services/user_preferences.py` : logique `get_or_create_user`, `update_notification_preferences`

- [ ] **Backend — tests** (AC: all)
  - [ ] Écrire tests dans `tests/test_api_user.py` : GET notifications (utilisateur existant, utilisateur nouveau → defaults), PATCH partiel, PATCH complet, cas 403 sans auth
  - [ ] Écrire tests dans `tests/test_services_user_preferences.py` : `get_or_create_user` (création + lecture), `update_notification_preferences` (partiel)

- [ ] **Mobile — hook `useNotificationPreferences`** (AC: #1, #2)
  - [ ] Créer `src/hooks/useNotificationPreferences.ts` : charge les préférences au mount, expose `prefs: AsyncState<NotificationPreferences>`, `updatePref(key, value)` (optimistic update + PATCH API)
  - [ ] Écrire `src/hooks/useNotificationPreferences.test.ts`

- [ ] **Mobile — écran Notifications dans Profil** (AC: #1, #2)
  - [ ] Créer `src/components/profile/NotificationSettings.tsx` : 3 `SettingsRow` avec switch/toggle pour chaque préférence, labels i18n
  - [ ] Intégrer `NotificationSettings` dans `src/app/(tabs)/profile.tsx` dans la section Préférences (après Apparence/Langue)
  - [ ] Ajouter clés i18n dans `src/locales/fr.ts` et `src/locales/en.ts`
  - [ ] Écrire `src/components/profile/NotificationSettings.test.tsx`

- [ ] **Mobile — correction `updateNotificationPreferences` dans `user.ts`** (AC: #2)
  - [ ] Corriger `src/services/api/user.ts` : `updateNotificationPreferences` doit passer `prefs` en body (`method: 'PATCH', body: prefs`) — actuellement le body est absent

- [ ] **Documentation et mise à jour** (AC: all)
  - [ ] Mettre à jour `sprint-status.yaml` : `2-2-gestion-preferences-notifications: done`
  - [ ] Créer `backend/docs/story-2-2-gestion-preferences-notifications.md`
  - [ ] Créer `mobile/docs/story-2-2-gestion-preferences-notifications.md`
  - [ ] Mettre à jour `backend/docs/product-audit.md`
  - [ ] Mettre à jour `CLAUDE.md` si la structure ou les endpoints changent

## Dev Notes

### Backend — architecture

**Nouveau modèle** `app/models/user.py` :
```python
from app.db.session import Base
from datetime import UTC, datetime
from sqlalchemy import Boolean, Column, DateTime, String


class User(Base):
    """Profil utilisateur — préférences et push token."""

    __tablename__ = "users"

    id = Column(String(255), primary_key=True)          # UUID Supabase
    push_token = Column(String(500), nullable=True)      # Expo push token
    notif_favorites = Column(Boolean, default=True, nullable=False)
    notif_regional = Column(Boolean, default=True, nullable=False)
    notif_terrain = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
```

**Schémas Pydantic** `app/schemas/user.py` :
```python
from pydantic import BaseModel


class NotificationPreferencesResponse(BaseModel):
    notif_favorites: bool
    notif_regional: bool
    notif_terrain: bool


class NotificationPreferencesUpdate(BaseModel):
    notif_favorites: bool | None = None
    notif_regional: bool | None = None
    notif_terrain: bool | None = None
```

**Service** `app/services/user_preferences.py` :
```python
import logging
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)


async def get_or_create_user(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(id=user_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.debug("user_created", extra={"user_id": user_id})
    return user


async def update_notification_preferences(
    user_id: str,
    prefs: dict[str, bool],
    db: AsyncSession,
) -> User:
    user = await get_or_create_user(user_id, db)
    for key, value in prefs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    logger.debug("notif_prefs_updated", extra={"user_id": user_id, "prefs": prefs})
    return user
```

**Endpoints** dans `app/api/v1/endpoints/user.py` :
```python
@router.get("/notifications", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: dict[str, object] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationPreferencesResponse:
    user_id = str(current_user["id"])
    user = await get_or_create_user(user_id, db)
    return NotificationPreferencesResponse(
        notif_favorites=bool(user.notif_favorites),
        notif_regional=bool(user.notif_regional),
        notif_terrain=bool(user.notif_terrain),
    )


@router.patch("/notifications", response_model=NotificationPreferencesResponse)
async def patch_notification_preferences(
    body: NotificationPreferencesUpdate,
    current_user: dict[str, object] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationPreferencesResponse:
    user_id = str(current_user["id"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    user = await update_notification_preferences(user_id, updates, db)
    return NotificationPreferencesResponse(
        notif_favorites=bool(user.notif_favorites),
        notif_regional=bool(user.notif_regional),
        notif_terrain=bool(user.notif_terrain),
    )


@router.post("/push-token", status_code=204)
async def update_push_token(
    body: dict[str, str],
    current_user: dict[str, object] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Enregistre le token push Expo (stub pour story 5.1)."""
    user_id = str(current_user["id"])
    push_token = body.get("push_token", "")
    user = await get_or_create_user(user_id, db)
    user.push_token = push_token
    await db.commit()
    logger.debug("push_token_updated", extra={"user_id": user_id})
```

**Pattern de suppression à mettre à jour** : quand story 2.4 est active (déjà mergée), `delete_user_data` dans `app/services/user.py` devra également supprimer la ligne `users`. À vérifier que `app/services/user.py` inclut `DELETE FROM users WHERE id = user_id`.

**Note sur `update_notification_preferences` dans `user.ts` côté mobile** : le fichier existant appelle `apiFetch<void>('/api/v1/user/notifications', token)` sans passer le body ni la méthode. Corriger comme suit :
```typescript
await apiFetch<void>('/api/v1/user/notifications', token, undefined, {
  method: 'PATCH',
  body: prefs,
});
```

### Mobile — architecture

**Hook** `src/hooks/useNotificationPreferences.ts` :
```typescript
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationPreferences, updateNotificationPreferences } from '@/services/api/user';
import type { AsyncState, NotificationPreferences } from '@/services/mockData/types';

export function useNotificationPreferences() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';
  const [state, setState] = useState<AsyncState<NotificationPreferences>>({ status: 'idle' });

  useEffect(() => {
    if (!token) return;
    setState({ status: 'loading' });
    fetchNotificationPreferences(token)
      .then((data) => setState({ status: 'success', data }))
      .catch((err) => setState({ status: 'error', error: String(err) }));
  }, [token]);

  const updatePref = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (state.status !== 'success' || !state.data) return;
      // Optimistic update
      setState({ status: 'success', data: { ...state.data, [key]: value } });
      try {
        await updateNotificationPreferences(token, { [key]: value });
      } catch {
        // Rollback
        setState({ status: 'success', data: state.data });
      }
    },
    [token, state],
  );

  return { state, updatePref };
}
```

**Nouveau service** à ajouter dans `src/services/api/user.ts` :
```typescript
export async function fetchNotificationPreferences(token: string): Promise<NotificationPreferences> {
  if (MOCK_API) {
    if (DEBUG) console.debug('[api/user] MOCK fetchNotificationPreferences');
    await _delay(100);
    return { notif_favorites: true, notif_regional: true, notif_terrain: true };
  }
  return apiFetch<NotificationPreferences>('/api/v1/user/notifications', token);
}
```

**Composant** `src/components/profile/NotificationSettings.tsx` — pattern `SettingsRow` existant avec un `Switch` React Native :
```typescript
import { Switch } from 'react-native';
import i18n from '@/utils/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { SettingsRow } from '@/components/profile';
```

**I18n** — clés à ajouter dans `fr.ts` (section `profile`) :
```typescript
sectionNotifications: 'NOTIFICATIONS',
notifFavorites: 'Alertes favoris',
notifFavoritesDesc: 'Conditions idéales sur vos sommets favoris',
notifRegional: 'Alertes régionales',
notifRegionalDesc: 'Mer de nuage prévue dans votre région',
notifTerrain: 'Validation terrain GPS',
notifTerrainDesc: 'Notification à l\'arrivée au sommet',
```

Et les mêmes clés en `en.ts` :
```typescript
sectionNotifications: 'NOTIFICATIONS',
notifFavorites: 'Favorite alerts',
notifFavoritesDesc: 'Ideal conditions on your favorite peaks',
notifRegional: 'Regional alerts',
notifRegionalDesc: 'Sea of clouds forecast in your region',
notifTerrain: 'Terrain GPS validation',
notifTerrainDesc: 'Notification when arriving at the summit',
```

**Intégration dans `profile.tsx`** : ajouter une nouvelle section entre "PRÉFÉRENCES" (apparence/langue) et "COMPTE" (déconnexion/suppression) :
```tsx
<Text style={[styles.sectionLabel, { ... }]}>
  {i18n.t('profile.sectionNotifications')}
</Text>
<View style={[styles.group, { ... }]}>
  <NotificationSettings />
</View>
```

### Tests — exemples

**Backend `tests/test_api_user.py`** — ajouter :
```python
def test_get_notifications_retourne_defaults(client) -> None:
    app.dependency_overrides[get_current_user] = lambda: {"id": "new-user", "email": "t@t.com"}
    try:
        with TestClient(app) as c:
            response = c.get("/api/v1/user/notifications")
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["notif_favorites"] is True
    assert data["notif_regional"] is True
    assert data["notif_terrain"] is True


def test_patch_notifications_mise_a_jour_partielle(client) -> None:
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-123", "email": "t@t.com"}
    try:
        with TestClient(app) as c:
            response = c.patch("/api/v1/user/notifications", json={"notif_favorites": False})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["notif_favorites"] is False
    assert response.json()["notif_regional"] is True  # inchangé


def test_get_notifications_sans_auth_retourne_403(client) -> None:
    with TestClient(app) as c:
        response = c.get("/api/v1/user/notifications")
    assert response.status_code == 403
```

**Mobile `src/hooks/useNotificationPreferences.test.ts`** — mock `apiFetch`, tester : chargement initial → state success, updatePref → PATCH appelé + optimistic update, rollback si erreur réseau.

### Variables d'environnement

Aucune nouvelle variable requise — cette story n'utilise que ce qui est déjà en place (DATABASE_URL, JWT Supabase).

### Project Structure — fichiers concernés

**Nouveaux fichiers :**
- `backend/app/models/user.py` — modèle SQLAlchemy `User`
- `backend/app/schemas/user.py` — schémas Pydantic notifications
- `backend/app/services/user_preferences.py` — logique `get_or_create_user`, `update_notification_preferences`
- `backend/alembic/versions/{hash}_create_users_table.py` — migration
- `backend/tests/test_services_user_preferences.py` — tests unitaires service
- `mobile/src/hooks/useNotificationPreferences.ts` — hook préférences
- `mobile/src/hooks/useNotificationPreferences.test.ts` — tests hook
- `mobile/src/components/profile/NotificationSettings.tsx` — composant 3 toggles
- `mobile/src/components/profile/NotificationSettings.test.tsx` — tests composant

**Fichiers modifiés :**
- `backend/app/models/__init__.py` — ajouter import `User`
- `backend/app/api/v1/endpoints/user.py` — ajouter GET + PATCH `/notifications`, POST `/push-token`
- `backend/tests/test_api_user.py` — ajouter tests notifications
- `backend/app/services/user.py` — ajouter suppression `users` dans `delete_user_data` (story 2.4 alignment)
- `mobile/src/services/api/user.ts` — ajouter `fetchNotificationPreferences`, corriger `updateNotificationPreferences` (body manquant)
- `mobile/src/components/profile/index.ts` (ou barrel) — exporter `NotificationSettings`
- `mobile/src/app/(tabs)/profile.tsx` — intégrer section Notifications
- `mobile/src/locales/fr.ts` — clés `sectionNotifications`, `notifFavorites`, etc.
- `mobile/src/locales/en.ts` — mêmes clés en EN

### Critères de done

- [ ] `make validate` (ruff + mypy + pytest --cov) passe à 100% côté backend
- [ ] `npm test && npx tsc --noEmit && npm run lint` passe côté mobile
- [ ] Migration Alembic rejouée proprement (`alembic upgrade head`)
- [ ] Test manuel : toggle "Alertes favoris" OFF → rechargement de l'écran → toggle reste OFF

## References

- [Source: epics.md#Story 2.2] — ACs complets
- [Source: prd.md#FR14, FR25] — exigences notifications
- [Source: CLAUDE.md#Endpoints API] — `POST /api/v1/user/push-token`, `PATCH /api/v1/user/notifications`
- [Source: CLAUDE.md#Modèle de données] — colonnes `push_token`, `notif_favorites`, `notif_regional`, `notif_terrain` table `users`
- [Source: CLAUDE.md#Patterns de code] — règles backend/mobile, AsyncState<T>
- [Source: MEMORY.md#Story 3.3] — HTTPBearer retourne 403 (pas 401) sans header
- [Source: mobile/src/services/mockData/types.ts] — `NotificationPreferences`, `MockUser` déjà définis
- [Source: mobile/src/services/api/user.ts] — `updateNotificationPreferences` existant (body manquant à corriger)
- [Source: mobile/src/app/(tabs)/profile.tsx] — pattern `SettingsRow` + structure sections
- [Source: backend/app/models/subscription.py] — pattern modèle SQLAlchemy à suivre

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
