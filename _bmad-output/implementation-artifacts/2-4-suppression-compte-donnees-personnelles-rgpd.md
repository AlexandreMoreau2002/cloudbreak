# Story 2.4: Suppression du Compte et Données Personnelles (RGPD)

Status: ready-for-dev

## Story

As an authenticated user,
I want to permanently delete my account and all my personal data,
so that I exercise my right to erasure under GDPR.

## Acceptance Criteria

1. **Given** l'écran Profil → section Compte → bouton "Supprimer mon compte"
   **When** l'utilisateur appuie sur "Supprimer mon compte"
   **Then** une modale de confirmation explicite s'ouvre avec le message "Cette action est irréversible"
   **And** l'utilisateur doit saisir son email pour confirmer avant que le bouton de suppression soit actif

2. **Given** la confirmation validée (email saisi correspond au compte)
   **When** `DELETE /api/v1/user` est appelé avec le JWT valide
   **Then** toutes les données utilisateur sont supprimées : `user_favorites` (liées), `subscriptions` (liées)
   **And** le compte Supabase Auth est supprimé via l'Admin API
   **And** la réponse est `204 No Content`

3. **Given** l'app après suppression (API retourne 204)
   **When** la réponse est reçue
   **Then** l'utilisateur est déconnecté localement via `supabaseClient.auth.signOut()`
   **And** le cache AsyncStorage est entièrement vidé (`AsyncStorage.clear()`)
   **And** l'utilisateur est redirigé vers l'écran de connexion

4. **Given** l'endpoint `DELETE /api/v1/user`
   **When** on l'appelle sans JWT valide ou sans header Authorization
   **Then** il retourne `403 Forbidden` avec `{"detail": "Non authentifié", "code": "UNAUTHORIZED"}`
   *(Note: HTTPBearer retourne 403 quand le header est absent — comportement connu, cf. story 3.3)*

## Tasks / Subtasks

- [ ] **Backend — endpoint DELETE /api/v1/user** (AC: #2, #4)
  - [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement backend (`.env` + `docker-compose.dev.yml`)
  - [ ] Créer fonction `delete_user_data(user_id: str)` dans `app/services/user.py` : supprime `user_favorites` + `subscriptions` via SQLAlchemy
  - [ ] Créer fonction `delete_supabase_user(user_id: str)` dans `app/core/security.py` : appelle `DELETE {SUPABASE_URL}/auth/v1/admin/users/{user_id}` avec header `Authorization: Bearer {service_role_key}`
  - [ ] Ajouter route `DELETE /api/v1/user` dans `app/api/v1/endpoints/user.py` : vérifier JWT → supprimer données → supprimer Supabase user → retourner 204
  - [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `app/core/config.py` (Settings)
  - [ ] Écrire tests `tests/test_api_user.py` : cas 204 OK, cas 403 sans auth, cas erreur Supabase Admin API
  - [ ] Écrire test feature `tests/features/test_feature_delete_account.py` : flux complet HTTP

- [ ] **Mobile — service et context** (AC: #1, #3)
  - [ ] Ajouter `deleteAccount()` dans `src/services/api/user.ts` : `DELETE /api/v1/user` via `apiFetch`
  - [ ] Ajouter `deleteAccount()` dans `src/contexts/AuthContext.tsx` : appelle service → `supabaseClient.auth.signOut()` → `AsyncStorage.clear()`
  - [ ] Écrire test `src/services/api/user.test.ts` : cas succès 204, cas erreur réseau

- [ ] **Mobile — modale de confirmation** (AC: #1, #3)
  - [ ] Créer composant `src/components/profile/DeleteAccountModal.tsx` : modale avec message "irréversible", champ email, bouton destructif rouge activé seulement si email match
  - [ ] Ajouter bouton "Supprimer mon compte" dans `src/app/(tabs)/profile.tsx` (section Compte, couleur rouge destructive)
  - [ ] Intégrer `DeleteAccountModal` dans `profile.tsx` avec `useAuth().deleteAccount()`
  - [ ] Ajouter clés i18n dans `src/locales/fr.ts` et `src/locales/en.ts`
  - [ ] Écrire test `src/components/profile/DeleteAccountModal.test.tsx`

- [ ] **Documentation et mise à jour** (AC: all)
  - [ ] Mettre à jour `sprint-status.yaml` : `2-4-suppression-compte-donnees-personnelles-rgpd: done`
  - [ ] Créer `backend/docs/story-2-4-suppression-compte-rgpd.md`
  - [ ] Créer `mobile/docs/story-2-4-suppression-compte-rgpd.md`
  - [ ] Mettre à jour `backend/docs/product-audit.md`
  - [ ] Mettre à jour `backend/docs/security.md` (nouvelle clé service_role_key, endpoint destructif)

## Dev Notes

### Backend — architecture

**Endpoint :** `DELETE /api/v1/user` dans `app/api/v1/endpoints/user.py`
- Dépend de `get_current_user` (dependency injection depuis `app/core/dependencies.py`) — récupère `user_id: str` depuis le JWT
- Retourne `Response(status_code=204)` (pas de body)
- Pattern existant à suivre : voir `GET /api/v1/user` dans le même fichier

**Tables à supprimer (modèles existants) :**
- `user_favorites` (`app/models/favorite.py`) — colonne `user_id: str` (String, pas FK)
- `subscriptions` (`app/models/subscription.py`) — colonne `user_id: str`
- ⚠️ Les tables `predictions`, `terrain_validations`, `events` ne sont pas encore implémentées — les mentions dans epics.md sont prévisionnelles. Ne pas créer ces modèles dans cette story. Gérer leur absence gracieusement (pas d'erreur si table absente).

**Supabase Admin API :**
```python
import httpx

async def delete_supabase_user(user_id: str, supabase_url: str, service_role_key: str) -> None:
    url = f"{supabase_url}/auth/v1/admin/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
    }
    async with httpx.AsyncClient() as client:
        response = await client.delete(url, headers=headers)
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail="Erreur suppression Supabase")
```
- Utiliser `httpx.AsyncClient` (déjà utilisé dans le projet pour Open-Meteo)
- `SUPABASE_SERVICE_ROLE_KEY` : clé longue disponible dans le dashboard Supabase → Settings → API → `service_role` (jamais exposée au mobile)

**Config :**
```python
# app/core/config.py
SUPABASE_SERVICE_ROLE_KEY: str = ""  # requis en prod, optionnel en dev
```

**Ordre de suppression :** données DB en premier → Supabase user ensuite (évite un état incohérent si Supabase échoue)

**Logging :**
```python
logger.info("user_deleted", extra={"user_id": user_id})
```

### Mobile — architecture

**Service** (`src/services/api/user.ts`) :
```typescript
export async function deleteAccount(): Promise<void> {
  await apiFetch<void>('/api/v1/user', { method: 'DELETE' });
}
```

**AuthContext** (`src/contexts/AuthContext.tsx`) :
```typescript
const deleteAccount = useCallback(async () => {
  await deleteAccountService();
  await supabaseClient.auth.signOut();
  await AsyncStorage.clear();
}, []);
```
- Exposer `deleteAccount` dans le type `AuthContextType`
- `AsyncStorage.clear()` supprime tout (cache score, selectedPeak, etc.)

**DeleteAccountModal** (`src/components/profile/DeleteAccountModal.tsx`) :
- Modal React Native (pas expo-router) — s'ouvre par-dessus le profil
- Champ email contrôlé — bouton "Supprimer définitivement" actif seulement si `emailInput === user.email`
- Bouton destructif : couleur `#C25C4A` (couleur "low"/danger du design system)
- Pattern modale : `Modal` de react-native avec backdrop semi-transparent
- Gestion d'état : `isLoading`, `error` (affiche erreur si l'API échoue)

**I18n** — clés à ajouter :
```typescript
// fr.ts — dans profile:
deleteAccount: 'Supprimer mon compte',
deleteAccountModal: {
  title: 'Supprimer mon compte',
  warning: 'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
  emailLabel: 'Confirmez votre email',
  emailPlaceholder: 'votre@email.com',
  confirm: 'Supprimer définitivement',
  cancel: 'Annuler',
  errorMismatch: 'L\'email ne correspond pas à votre compte',
  errorGeneric: 'Erreur lors de la suppression. Réessayez.',
},
```

**Placement dans profile.tsx :** section Compte (après les préférences) → `SettingsRow` avec icône trash, couleur rouge, `onPress` ouvre la modale

### Comportement après suppression

Le flux post-suppression doit suivre exactement le même chemin que `signOut` dans `AuthContext` :
- `supabaseClient.auth.signOut()` → `onAuthStateChange` se déclenche → `AuthGuard` dans `_layout.tsx` redirige vers `/login`
- `AsyncStorage.clear()` garantit qu'il ne reste aucune donnée locale

### Tests — pattern existant

**Backend** — suivre le pattern de `tests/test_api_score.py` et `tests/features/test_feature_auth_flow.py` :
```python
def test_delete_user_retourne_204(client, auth_headers):
    response = client.delete("/api/v1/user", headers=auth_headers)
    assert response.status_code == 204

def test_delete_user_sans_auth_retourne_403(client):
    response = client.delete("/api/v1/user")
    assert response.status_code == 403
```

**Mobile** — mock `apiFetch` et `AsyncStorage` :
```typescript
jest.mock('@/services/fetchService', () => ({ apiFetch: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Variables d'environnement à ajouter

```env
# .env backend
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # dashboard Supabase > Settings > API > service_role
```

```yaml
# infra/docker-compose.dev.yml — ajouter dans api.environment
- SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

### Project Structure Notes

- Nouveau fichier : `backend/app/services/user.py` — fonctions métier user (delete_user_data)
- Nouveau fichier : `mobile/src/components/profile/DeleteAccountModal.tsx`
- Fichier modifié : `backend/app/api/v1/endpoints/user.py` — ajouter route DELETE
- Fichier modifié : `backend/app/core/security.py` — ajouter delete_supabase_user
- Fichier modifié : `backend/app/core/config.py` — ajouter SUPABASE_SERVICE_ROLE_KEY
- Fichier modifié : `mobile/src/services/api/user.ts` — ajouter deleteAccount
- Fichier modifié : `mobile/src/contexts/AuthContext.tsx` — ajouter deleteAccount
- Fichier modifié : `mobile/src/app/(tabs)/profile.tsx` — bouton + modale
- Fichier modifié : `mobile/src/locales/fr.ts` + `en.ts` — clés i18n

### References

- [Source: epics.md#Story 2.4] — ACs RGPD complets
- [Source: CLAUDE.md#Endpoints API] — pattern endpoints existants
- [Source: CLAUDE.md#Patterns de code] — règles backend/mobile
- [Source: CLAUDE.md#Modèle de données] — tables existantes
- [Source: MEMORY.md#Story 3.3] — HTTPBearer retourne 403 (pas 401) sans header
- [Source: MEMORY.md#Architecture auth] — signOut flow + AuthGuard pattern
- [Source: backend/app/api/v1/endpoints/user.py] — pattern existant GET /me
- [Source: mobile/src/services/api/user.ts] — pattern apiFetch existant
- [Source: mobile/src/contexts/AuthContext.tsx] — pattern signOut existant

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5

### Debug Log References

### Completion Notes List

### File List
