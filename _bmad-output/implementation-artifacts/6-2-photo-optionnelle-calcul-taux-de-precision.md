# Story 6.2: Photo Optionnelle & Calcul Taux de Précision

Status: ready-for-dev

## Story

As a user,
I want to attach an optional photo to my terrain validation,
And I want the system to automatically calculate forecast accuracy per peak.

## Contexte & Motivation

Cette story est l'**extension directe de 6.1** — elle ajoute deux dimensions complémentaires au data flywheel :

1. **Engagement utilisateur** : la photo transforme une validation binaire (oui/non) en preuve visuelle partageable — le contenu généré par l'utilisateur est la base de la fonctionnalité Replay de prédiction (story 8.4) et du futur Feed social (Epic 9+).
2. **Métriques algo** : le taux de précision agrégé par sommet est le premier KPI objectif de l'algorithme — il permet de détecter les zones géographiques où l'algo performe mal et de prioriser les ajustements.

### Contrainte UX importante — Appareil photo uniquement

Le PRD indique explicitement : **"Pas d'accès galerie photo"**. L'utilisateur prend sa photo depuis l'appareil photo natif iOS directement dans l'app. Pas de sélection depuis la photothèque existante.

Conséquence : `expo-image-picker` avec `source = Camera` uniquement, permission `CAMERA` (pas `MEDIA_LIBRARY`).

### Lien V2 — Story 8.4 (Replay prédiction)

`photo_url` dans `terrain_validations` est la dépendance directe de story 8.4 :
> "si l'utilisateur a joint une photo terrain, l'app génère une image 'prédiction vs réalité' (score d'avant + photo terrain + 'Confirmé ✅') — très partageable sur les réseaux sociaux"

La colonne `photo_url` est déjà créée par story 6.1 (nullable, réservée). Cette story l'alimente.

## Dépendances

- **Requises** : Story 6.1 (table `terrain_validations` avec colonne `photo_url`, endpoint `POST /api/v1/validations`, composant `ValidationBottomSheet`) — tout le socle est en place
- **Requises** : Story 3.2 (`peaks` table) + Story 3.1 (`predictions` table) — pour le calcul du taux par sommet
- **Futures** : Story 8.4 (Replay prédiction) — consommera `photo_url`
- **Infra** : Supabase Storage — bucket `validations` à créer (public en lecture, protégé en écriture)

## Acceptance Criteria

1. **Given** `ValidationBottomSheet` affiché (depuis story 6.1)
   **When** l'utilisateur appuie sur "Ajouter une photo 📸" (bouton optionnel, sous les boutons Oui/Non)
   **Then** l'appareil photo natif iOS s'ouvre via `expo-image-picker` (source = Camera uniquement — pas la galerie)
   **And** la permission caméra est demandée si pas encore accordée, avec message explicatif dans l'alerte système iOS
   **And** si la permission est refusée, un message non-bloquant s'affiche : "Permission caméra requise pour joindre une photo"
   **And** la validation reste possible sans photo

2. **Given** l'utilisateur a pris une photo
   **When** il confirme la sélection
   **Then** la photo est compressée côté app (qualité 0.7, taille max 1200px de large) avant upload
   **And** la photo est uploadée dans le bucket Supabase Storage `validations` sous le chemin `{user_id}/{validation_id}.jpg`
   **And** l'URL publique Supabase est stockée dans `terrain_validations.photo_url`
   **And** un indicateur de progression s'affiche pendant l'upload (spinner ou barre de progression)
   **And** si l'upload échoue (réseau KO), la validation est quand même enregistrée avec `photo_url: null` + message "Photo non envoyée — validation enregistrée sans photo"

3. **Given** l'utilisateur ne souhaite pas ajouter de photo
   **When** il valide en appuyant directement sur "Oui" ou "Non"
   **Then** la validation est enregistrée avec `photo_url: null` sans blocage ni message d'erreur

4. **Given** une photo uploadée dans le bucket `validations`
   **When** l'upload est terminé
   **Then** la photo est accessible via son URL publique Supabase
   **And** le bucket est configuré : accès lecture public (pour story 8.4), écriture protégée par JWT Supabase

5. **Given** FR29 — calcul taux de précision par sommet
   **When** `GET /api/v1/peaks/{slug}` est appelé (authentifié ou non)
   **Then** la réponse inclut un champ `accuracy_rate` (float 0.0–1.0 | null)
   **And** `accuracy_rate` est calculé comme : `nb_validations_positives (result=true) / nb_total_validations` pour ce sommet
   **And** `accuracy_rate` vaut `null` si le sommet a moins de 5 validations (seuil de confiance statistique)
   **And** `accuracy_rate` est calculé en temps réel depuis la table `terrain_validations` (via join `predictions`)

6. **Given** un sommet avec moins de 5 validations terrain
   **When** `GET /api/v1/peaks/{slug}` est appelé
   **Then** `accuracy_rate` vaut `null`
   **And** le mobile n'affiche pas de taux (champ absent ou caché)

7. **Given** un sommet avec 5 validations ou plus
   **When** `GET /api/v1/peaks/{slug}` est appelé
   **Then** `accuracy_rate` est présent et affiché dans l'écran de détail du sommet (ex: "Précision terrain : 78%")

8. **Given** FR29 — stats agrégées admin
   **When** `GET /api/v1/stats/accuracy` est appelé sans JWT admin
   **Then** le backend retourne `403 Forbidden`

   **When** `GET /api/v1/stats/accuracy` est appelé avec JWT admin valide
   **Then** il retourne le taux de précision global + par sommet (tous les sommets avec ≥ 1 validation)
   **And** un event PostHog `accuracy_stats_queried` est loggé

9. **Given** une validation terrain créée avec `photo_url` non null
   **When** la validation est enregistrée
   **Then** l'event PostHog `terrain_validation_submitted` inclut `has_photo: true` (vs `has_photo: false` sans photo)

## Tasks / Subtasks

### Backend

- [ ] **Mise à jour schema Pydantic — PeakResponse** (AC: #5, #6, #7)
  - [ ] Modifier `backend/app/schemas/peak.py` : ajouter `accuracy_rate: float | None` dans `PeakResponse`
  - [ ] Modifier `backend/app/api/v1/endpoints/peaks.py` — endpoint `GET /peaks/{slug}` :
    - Calculer `accuracy_rate` via requête SQL : `COUNT(result=true) / COUNT(*) FROM terrain_validations JOIN predictions ON prediction_id = predictions.id WHERE predictions.peak_id = peak.id`
    - Retourner `null` si `COUNT(*) < 5`

- [ ] **Endpoint GET /api/v1/stats/accuracy** (AC: #8)
  - [ ] Créer `backend/app/api/v1/endpoints/stats.py` :
    - Vérification admin : `current_user.is_admin` (ou `user_id in ADMIN_USER_IDS` depuis settings)
    - Requête : taux global + liste `[{peak_id, peak_name, accuracy_rate, validation_count}]` pour tous les sommets avec ≥ 1 validation
    - Logger event PostHog `accuracy_stats_queried`
  - [ ] Ajouter la route dans `backend/app/api/v1/router.py`
  - [ ] Ajouter `is_admin: bool = False` dans le modèle `User` ou utiliser une liste blanche dans `settings.py`

- [ ] **Mise à jour endpoint POST /api/v1/validations** (AC: #9)
  - [ ] Modifier `backend/app/api/v1/endpoints/validations.py` :
    - Accepter `photo_url: str | None` dans `ValidationCreate`
    - Sauvegarder `photo_url` dans `TerrainValidation` si fourni
    - Mettre à jour l'event PostHog : ajouter `has_photo: bool`

- [ ] **Mise à jour schema ValidationCreate** (AC: #2, #9)
  - [ ] Modifier `backend/app/schemas/validation.py` :
    - `ValidationCreate` : ajouter `photo_url: str | None = None`
    - `ValidationResponse` : ajouter `photo_url: str | None`

- [ ] **Tests backend** (AC: all)
  - [ ] Mettre à jour `backend/tests/test_api_validations.py` :
    - `test_creer_validation_avec_photo_url_retourne_201`
    - `test_creer_validation_sans_photo_url_retourne_201`
  - [ ] Mettre à jour `backend/tests/test_api_peaks.py` (ou créer si inexistant) :
    - `test_get_peak_accuracy_rate_null_si_moins_de_5_validations`
    - `test_get_peak_accuracy_rate_calcule_si_5_validations_ou_plus`
    - `test_get_peak_accuracy_rate_calcul_correct` (ex: 3 true + 2 false = 0.6)
    - `test_get_peak_accuracy_rate_0_validations_retourne_null`
  - [ ] Créer `backend/tests/test_api_stats.py` :
    - `test_stats_accuracy_sans_auth_retourne_403`
    - `test_stats_accuracy_sans_admin_retourne_403`
    - `test_stats_accuracy_admin_retourne_200`

### Mobile

- [ ] **Permission caméra** (AC: #1)
  - [ ] Ajouter dans `mobile/app.json` la permission caméra iOS : `NSCameraUsageDescription`
  - [ ] Vérifier que `expo-image-picker` est dans les dépendances (sinon `npx expo install expo-image-picker`)

- [ ] **Hook useValidation — extension photo** (AC: #1, #2, #3)
  - [ ] Modifier `mobile/src/hooks/useValidation.ts` :
    - Ajouter `pickAndUploadPhoto(): Promise<string | null>` — ouvre caméra, compresse, upload vers Supabase Storage, retourne l'URL publique ou `null` si échec/annulé
    - Modifier `submitValidation(predictionId, result, lat?, lng?, photoUrl?)` pour accepter le `photoUrl` optionnel
    - Gestion erreur upload : validation enregistrée sans photo + message toast non-bloquant
  - [ ] Mettre à jour `mobile/src/hooks/useValidation.test.ts` :
    - `test_pickAndUploadPhoto_retourne_url_si_succes`
    - `test_pickAndUploadPhoto_retourne_null_si_permission_refusee`
    - `test_pickAndUploadPhoto_retourne_null_si_upload_echoue`
    - `test_submitValidation_avec_photo_url`
    - `test_submitValidation_sans_photo_url`

- [ ] **Service upload Supabase Storage** (AC: #2, #4)
  - [ ] Créer `mobile/src/services/storage.ts` :
    - `uploadValidationPhoto(userId: string, validationId: string, imageUri: string): Promise<string>` — upload vers bucket `validations/{userId}/{validationId}.jpg`, retourne URL publique
    - Compression via `ImageManipulator` : qualité 0.7, largeur max 1200px
    - Utilise le client Supabase existant (`supabaseClient.ts`)
  - [ ] Écrire `mobile/src/services/storage.test.ts` :
    - `test_uploadValidationPhoto_retourne_url_publique`
    - `test_uploadValidationPhoto_leve_erreur_si_upload_echoue`

- [ ] **Service API validations — extension** (AC: #2, #9)
  - [ ] Modifier `mobile/src/services/api/validations.ts` :
    - `postValidation` accepte `photo_url?: string` dans `ValidationCreate`
  - [ ] Mettre à jour `mobile/src/services/api/validations.test.ts`

- [ ] **Composant ValidationBottomSheet — extension photo** (AC: #1, #2, #3)
  - [ ] Modifier `mobile/src/components/ValidationBottomSheet.tsx` :
    - Ajouter un bouton "Ajouter une photo 📸" (optionnel) sous les boutons Oui/Non, avant la soumission
    - Afficher thumbnail de la photo prise si une photo a été sélectionnée
    - Afficher indicateur de progression pendant l'upload (spinner sur le bouton photo)
    - Afficher message non-bloquant si upload échoue
    - Strings i18n externalisées
  - [ ] Mettre à jour `mobile/src/components/ValidationBottomSheet.test.tsx` :
    - `test_affiche_bouton_photo`
    - `test_photo_optionnelle_validation_sans_photo_fonctionne`
    - `test_thumbnail_affiche_apres_selection`

- [ ] **Affichage accuracy_rate — écran sommet** (AC: #5, #6, #7)
  - [ ] Modifier `mobile/src/services/api/peaks.ts` : ajouter `accuracy_rate: number | null` dans le type `Peak`
  - [ ] Modifier l'écran ou composant de détail sommet (selon implémentation story 3.2/3.3) : afficher "Précision terrain : {n}%" uniquement si `accuracy_rate !== null`

- [ ] **i18n** (AC: #1, #2, #7)
  - [ ] Ajouter clés dans `mobile/src/locales/fr.ts` :
    - `validation.add_photo` → "Ajouter une photo 📸"
    - `validation.photo_permission_denied` → "Permission caméra requise pour joindre une photo"
    - `validation.photo_upload_failed` → "Photo non envoyée — validation enregistrée sans photo"
    - `validation.photo_uploading` → "Envoi de la photo..."
    - `peaks.accuracy_rate` → "Précision terrain : {rate}%"

### Infra / Configuration

- [ ] **Supabase Storage — bucket `validations`** (AC: #4)
  - [ ] Créer le bucket `validations` dans le dashboard Supabase :
    - Accès lecture : **public** (URL accessible sans token)
    - Écriture : protégée par JWT Supabase (RLS policy)
  - [ ] Configurer la RLS policy : `INSERT` autorisé uniquement si `auth.uid() = user_id` du chemin
  - [ ] Documenter dans `infra/README.md` : procédure de création du bucket

### Documentation

- [ ] Créer `backend/docs/story-6-2-photo-optionnelle-taux-precision.md` (ce qui a été fait, comment tester, ACs vérifiés)
- [ ] Mettre à jour `backend/docs/product-audit.md` : section "Validation terrain" → photo + taux de précision fonctionnels
- [ ] Mettre à jour `sprint-status.yaml` : story 6-2 → done

## Dev Notes

### Compression photo côté mobile

```typescript
// mobile/src/services/storage.ts
import * as ImageManipulator from 'expo-image-manipulator'
import { supabase } from '@/services/supabaseClient'

const MAX_WIDTH = 1200
const QUALITY = 0.7

export async function uploadValidationPhoto(
  userId: string,
  validationId: string,
  imageUri: string
): Promise<string> {
  // Compression
  const compressed = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  )

  // Lecture du fichier comme ArrayBuffer
  const response = await fetch(compressed.uri)
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  const path = `${userId}/${validationId}.jpg`

  const { error } = await supabase.storage
    .from('validations')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from('validations').getPublicUrl(path)
  return data.publicUrl
}
```

### Ouverture caméra iOS

```typescript
// Dans useValidation.ts
import * as ImagePicker from 'expo-image-picker'

const pickAndUploadPhoto = async (
  userId: string,
  validationId: string
): Promise<string | null> => {
  // Vérification permission
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') return null

  // Ouverture caméra uniquement (pas galerie)
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1, // compression faite côté uploadValidationPhoto
  })

  if (result.canceled || !result.assets[0]) return null

  try {
    return await uploadValidationPhoto(userId, validationId, result.assets[0].uri)
  } catch {
    return null // Échec upload → retourner null, pas bloquer la validation
  }
}
```

### Calcul accuracy_rate — requête SQL backend

```python
# backend/app/api/v1/endpoints/peaks.py
from sqlalchemy import func, select
from app.models.terrain_validation import TerrainValidation
from app.models.prediction import Prediction

async def get_peak_accuracy_rate(db: AsyncSession, peak_id: UUID) -> float | None:
    """
    Retourne le taux de précision (0.0-1.0) pour un sommet donné.
    Retourne None si moins de 5 validations.
    """
    result = await db.execute(
        select(
            func.count(TerrainValidation.id).label("total"),
            func.sum(
                func.cast(TerrainValidation.result, Integer)
            ).label("positive"),
        )
        .join(Prediction, TerrainValidation.prediction_id == Prediction.id)
        .where(Prediction.peak_id == peak_id)
    )
    row = result.one()
    total = row.total or 0

    if total < 5:
        return None

    return round((row.positive or 0) / total, 2)
```

### Schema PeakResponse mis à jour

```python
# backend/app/schemas/peak.py
class PeakResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    lat: float
    lng: float
    altitude: int
    accuracy_rate: float | None = None  # null si < 5 validations
```

### Endpoint stats/accuracy — admin uniquement

```python
# backend/app/api/v1/endpoints/stats.py
# Logique admin : vérifier user_id dans ADMIN_USER_IDS (settings)
# Retourne :
# {
#   "total_validations": 142,
#   "global_accuracy": 0.73,
#   "peaks": [
#     {"peak_id": "...", "peak_name": "Mont Blanc", "accuracy_rate": 0.85, "validation_count": 27},
#     ...
#   ]
# }
```

### ValidationCreate — extension

```python
# backend/app/schemas/validation.py
class ValidationCreate(BaseModel):
    prediction_id: UUID
    result: bool
    lat: float | None = None
    lng: float | None = None
    photo_url: str | None = None    # URL Supabase Storage (uploadée par le mobile)

class ValidationResponse(BaseModel):
    id: UUID
    prediction_id: UUID
    result: bool
    photo_url: str | None
    validated_at: datetime
```

### Gestion des erreurs — dégradation gracieuse

Le flux de validation avec photo comporte deux étapes potentiellement défaillantes :
1. Ouverture caméra / prise de photo → si échec, proposer de continuer sans photo
2. Upload Supabase Storage → si échec, enregistrer la validation sans photo

**Règle** : la photo est optionnelle à toutes les étapes. Jamais bloquer une validation pour une photo.

### Tests manuels

**Mobile (simulateur) :**
1. Ouvrir `ValidationBottomSheet` pour un sommet avec une prédiction valide
2. Appuyer "Ajouter une photo 📸" → autoriser la caméra → prendre une photo
3. Vérifier thumbnail visible dans le bottom sheet
4. Appuyer "Oui" → spinner upload → spinner validation → message remerciement → fermeture auto
5. Vérifier dans Supabase Storage dashboard : fichier présent dans bucket `validations/{user_id}/{validation_id}.jpg`
6. Vérifier dans table `terrain_validations` : `photo_url` non null

**Backend :**
```http
### Peak detail avec accuracy_rate (peu de validations)
GET http://localhost:8000/api/v1/peaks/mont-blanc
### Attendu : {"slug": "mont-blanc", ..., "accuracy_rate": null}

### Peak detail avec accuracy_rate (≥ 5 validations)
GET http://localhost:8000/api/v1/peaks/mont-blanc
### Attendu : {"slug": "mont-blanc", ..., "accuracy_rate": 0.72}

### Stats admin
GET http://localhost:8000/api/v1/stats/accuracy
Authorization: Bearer {jwt_admin}
### Attendu : {"total_validations": N, "global_accuracy": 0.X, "peaks": [...]}

### Stats admin — non admin
GET http://localhost:8000/api/v1/stats/accuracy
Authorization: Bearer {jwt_user_normal}
### Attendu : 403 Forbidden
```

**Edge cases à tester :**
- 0 validation → `accuracy_rate: null`
- 1-4 validations → `accuracy_rate: null`
- 5 validations, 5 true → `accuracy_rate: 1.0`
- 5 validations, 0 true → `accuracy_rate: 0.0`
- 10 validations, 7 true → `accuracy_rate: 0.7`

## Story Progress Notes

### Agent Notes

_À remplir par l'agent de développement lors de l'implémentation_

### Change Log

_À remplir lors de l'implémentation_
