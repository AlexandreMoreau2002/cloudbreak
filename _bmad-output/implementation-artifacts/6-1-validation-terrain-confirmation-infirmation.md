# Story 6.1: Validation Terrain (Confirmation/Infirmation)

Status: ready-for-dev

## Story

As a user,
I want to confirm or deny the forecast accuracy when I'm at the summit,
so that I contribute to improving the algorithm and close the feedback loop.

## Contexte & Motivation

Cette story est le **cœur du data flywheel** de Cloudbreak — la boucle vertueuse qui différencie le produit sur le long terme.

Chaque validation terrain crée de la valeur à trois niveaux :
1. **Immédiat** : l'utilisateur ferme sa boucle personnelle (j'avais prévu X, j'ai observé Y)
2. **Algo** : les données agrégées permettront d'affiner l'algorithme par zone géographique (Epic 8+ — régression logistique sur dataset terrain)
3. **Gamification V2** : chaque validation débloquera des badges et progressera les niveaux de l'utilisateur (Epic 8, Story 8.3) — le hook backend doit être prévu dès maintenant

La validation peut être déclenchée de deux façons :
- **Automatique** : notification GPS à l'arrivée près d'un sommet consulté (story 5.3 — geofencing à 500m)
- **Manuelle** : bouton "Valider ma prévision" accessible depuis l'historique ou depuis l'écran de prévision

## Dépendances

- **Requises** : Story 3.1 (endpoint score + table `predictions`) — `prediction_id` est la clé de liaison
- **Optionnelles** : Story 5.3 (notification GPS) — le déclencheur automatique, mais la validation manuelle fonctionne indépendamment
- **Futures** : Story 6.2 (photo optionnelle + stats précision) — cette story pose la fondation

## Acceptance Criteria

1. **Given** `ValidationBottomSheet` affiché (depuis notification GPS tap ou depuis bouton manuel sur l'écran de prévision)
   **When** l'utilisateur appuie sur "Oui — mer de nuage visible ✅"
   **Then** `POST /api/v1/validations` est appelé avec `{prediction_id, result: true, lat, lng}`
   **And** la réponse est `201 Created` avec le body `{id, prediction_id, result, validated_at}`
   **And** un message de remerciement s'affiche : "Merci ! Ta validation aide à affiner les prévisions 🙏"
   **And** le bottom sheet se ferme automatiquement après 2 secondes

2. **Given** l'utilisateur appuie sur "Non — pas de mer de nuage ❌"
   **When** la requête est envoyée
   **Then** `result: false` est enregistré avec le même format
   **And** le message de remerciement s'affiche identiquement

3. **Given** la table `terrain_validations`
   **When** la migration Alembic est appliquée
   **Then** elle contient les colonnes : `id` (UUID PK), `prediction_id` (FK → `predictions.id`), `user_id` (String — Supabase UUID), `result` (Boolean NOT NULL), `photo_url` (String nullable — pour story 6.2), `lat` (Float nullable), `lng` (Float nullable), `validated_at` (DateTime UTC NOT NULL, default `now()`)
   **And** un index `idx_terrain_validations_prediction_id` existe
   **And** un index `idx_terrain_validations_user_id` existe

4. **Given** un appel `POST /api/v1/validations` sans JWT valide ou sans header Authorization
   **When** la requête arrive au backend
   **Then** il retourne `403 Forbidden` avec `{"detail": "Non authentifié", "code": "UNAUTHORIZED"}`

5. **Given** un `prediction_id` qui n'existe pas en base
   **When** `POST /api/v1/validations` est appelé
   **Then** le backend retourne `404 Not Found` avec `{"detail": "Prédiction introuvable", "code": "PREDICTION_NOT_FOUND"}`

6. **Given** l'utilisateur a déjà validé cette `prediction_id`
   **When** il soumet une seconde validation pour la même prédiction
   **Then** le backend retourne `409 Conflict` avec `{"detail": "Prédiction déjà validée", "code": "ALREADY_VALIDATED"}`

7. **Given** la géolocalisation non accordée (lat/lng absents)
   **When** l'utilisateur valide depuis le bouton manuel (pas la notif GPS)
   **Then** la validation est enregistrée avec `lat: null`, `lng: null` sans erreur ni message bloquant

8. **Given** le hook gamification V2
   **When** une validation est créée avec succès
   **Then** le backend appelle (en fire-and-forget) `_trigger_badge_check(user_id, validation_id)` — fonction vide en MVP, prête à être remplie en Epic 8

## Tasks / Subtasks

### Backend

- [ ] **Migration Alembic — table terrain_validations** (AC: #3)
  - [ ] Créer `backend/app/models/terrain_validation.py` : model SQLAlchemy avec les colonnes définies en AC #3
  - [ ] Générer et valider la migration : `make migration` → vérifier le fichier généré
  - [ ] Ajouter `TerrainValidation` dans `backend/app/db/base.py` pour que Alembic la détecte

- [ ] **Schemas Pydantic** (AC: #1, #2)
  - [ ] Créer `backend/app/schemas/validation.py` avec :
    - `ValidationCreate` : `prediction_id` (UUID), `result` (bool), `lat` (float | None), `lng` (float | None)
    - `ValidationResponse` : `id` (UUID), `prediction_id` (UUID), `result` (bool), `validated_at` (datetime)

- [ ] **Endpoint POST /api/v1/validations** (AC: #1, #2, #4, #5, #6, #8)
  - [ ] Créer `backend/app/api/v1/endpoints/validations.py`
  - [ ] Implémenter `POST /validations` : auth JWT → vérifier `prediction_id` existe → vérifier pas de doublon → créer `TerrainValidation` → appeler `_trigger_badge_check` (fire-and-forget) → retourner 201
  - [ ] Ajouter la route dans `backend/app/api/v1/router.py`
  - [ ] Ajouter la fonction stub `_trigger_badge_check(user_id: str, validation_id: UUID) -> None` dans `backend/app/services/gamification.py` (corps vide + `logger.debug`)

- [ ] **Tests backend** (AC: all)
  - [ ] Créer `backend/tests/test_api_validations.py` :
    - `test_creer_validation_oui_retourne_201`
    - `test_creer_validation_non_retourne_201`
    - `test_creer_validation_sans_auth_retourne_403`
    - `test_creer_validation_prediction_inexistante_retourne_404`
    - `test_creer_validation_doublon_retourne_409`
    - `test_creer_validation_sans_gps_retourne_201`
  - [ ] Créer `backend/tests/features/test_feature_validation_terrain.py` : flux HTTP complet (auth → POST validation → vérification DB)

### Mobile

- [ ] **Hook useValidation** (AC: #1, #2, #7)
  - [ ] Créer `mobile/src/hooks/useValidation.ts` :
    - `AsyncState<ValidationResponse>` comme état
    - `submitValidation(predictionId, result, lat?, lng?)` → `POST /api/v1/validations`
    - Gestion erreur 409 (déjà validé) avec message spécifique
  - [ ] Écrire `mobile/src/hooks/useValidation.test.ts` : cas succès, cas 409, cas réseau KO

- [ ] **Service API validations** (AC: #1, #2)
  - [ ] Créer `mobile/src/services/api/validations.ts` :
    - `postValidation(params: ValidationCreate): Promise<ValidationResponse>`
  - [ ] Écrire `mobile/src/services/api/validations.test.ts`

- [ ] **Composant ValidationBottomSheet** (AC: #1, #2, #7)
  - [ ] Créer `mobile/src/components/ValidationBottomSheet.tsx` :
    - Props : `predictionId: string`, `peakName: string`, `isVisible: boolean`, `onClose: () => void`
    - 2 boutons : "Oui — mer de nuage visible ✅" (vert `#5C9E6E`) et "Non — pas de mer de nuage ❌" (rouge `#C25C4A`)
    - État `AsyncState` : loading → spinner sur le bouton appuyé, success → message remerciement 2s → fermeture auto
    - Géolocalisation optionnelle : si `expo-location` a la permission, passer `lat/lng` ; sinon `null`
    - Strings i18n externalisées
  - [ ] Écrire `mobile/src/components/ValidationBottomSheet.test.tsx`

- [ ] **Intégration écran de prévision** (AC: #1, #2)
  - [ ] Ajouter bouton "Valider ma prévision" dans `mobile/app/(tabs)/index.tsx` (visible seulement si `predictionId` disponible dans le cache score)
  - [ ] Brancher `ValidationBottomSheet` sur ce bouton avec les bonnes props

- [ ] **i18n** (AC: #1, #2)
  - [ ] Ajouter clés dans `mobile/src/locales/fr.ts` :
    - `validation.title`, `validation.yes`, `validation.no`, `validation.thanks`, `validation.already_validated`, `validation.button_label`

### Documentation

- [ ] Créer `backend/docs/story-6-1-validation-terrain.md` (ce qui a été fait, comment tester, ACs vérifiés)
- [ ] Mettre à jour `backend/docs/product-audit.md` : section "Validation terrain" → fonctionnel
- [ ] Mettre à jour `sprint-status.yaml` : story 6-1 → done

## Dev Notes

### Modèle de données — terrain_validations

```python
# backend/app/models/terrain_validation.py
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base

class TerrainValidation(Base):
    __tablename__ = "terrain_validations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    result = Column(Boolean, nullable=False)
    photo_url = Column(String, nullable=True)   # réservé story 6.2
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    validated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
```

### Endpoint — logique métier

```python
# POST /api/v1/validations
# 1. Vérifier JWT → user_id
# 2. Vérifier prediction_id existe dans `predictions`
# 3. Vérifier pas de doublon (prediction_id + user_id) → 409
# 4. Créer TerrainValidation
# 5. Fire-and-forget : _trigger_badge_check(user_id, validation.id)
# 6. Logger event PostHog : "terrain_validation_submitted" {result, has_gps}
# 7. Retourner 201 + ValidationResponse
```

### Hook gamification (stub MVP)

```python
# backend/app/services/gamification.py
import logging
from uuid import UUID
logger = logging.getLogger(__name__)

async def _trigger_badge_check(user_id: str, validation_id: UUID) -> None:
    """
    Stub MVP — sera implémenté en Epic 8 (Story 8.3).
    Ce hook est appelé après chaque validation terrain réussie.
    En V2 : vérifie les conditions de déblocage des badges (seuils, géographie, saison).
    """
    logger.debug("badge_check_triggered", extra={"user_id": user_id, "validation_id": str(validation_id)})
```

### ValidationBottomSheet — structure

```typescript
// Structure props et état
interface Props {
  predictionId: string
  peakName: string
  isVisible: boolean
  onClose: () => void
}

// États AsyncState
type ValidationState = AsyncState<{ id: string; validated_at: string }>
// idle → loading (bouton appuyé) → success (message 2s → onClose) | error
```

### Géolocalisation dans le bottom sheet

La géoloc est récupérée de façon opportuniste uniquement si la permission est déjà accordée — aucune demande de permission dans ce composant :

```typescript
import * as Location from 'expo-location'

const getOptionalLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  const { status } = await Location.getForegroundPermissionsAsync()
  if (status !== 'granted') return null
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  return { lat: loc.coords.latitude, lng: loc.coords.longitude }
}
```

### Tests manuels

Après implémentation, vérifier manuellement :

**Backend** (avec fichier `.http` ou curl) :
```http
### Validation oui (avec prediction_id valide)
POST http://localhost:8000/api/v1/validations
Authorization: Bearer {jwt}
Content-Type: application/json

{"prediction_id": "{uuid}", "result": true, "lat": 45.921, "lng": 6.869}

### Attendu : 201 + {id, prediction_id, result: true, validated_at}

### Doublon
POST http://localhost:8000/api/v1/validations
Authorization: Bearer {jwt}
Content-Type: application/json

{"prediction_id": "{même_uuid}", "result": false}

### Attendu : 409 + {"detail": "Prédiction déjà validée", "code": "ALREADY_VALIDATED"}
```

**Mobile** (simulateur) :
1. Consulter une prévision pour un sommet → noter le `predictionId` dans les logs debug
2. Appuyer sur "Valider ma prévision" → `ValidationBottomSheet` s'affiche
3. Appuyer "Oui" → spinner → message remerciement → fermeture auto
4. Re-ouvrir le bottom sheet → même prédiction → erreur "déjà validée"

## Story Progress Notes

### Agent Notes

_À remplir par l'agent de développement lors de l'implémentation_

### Change Log

_À remplir lors de l'implémentation_
