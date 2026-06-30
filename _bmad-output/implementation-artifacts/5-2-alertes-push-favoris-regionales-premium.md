# Story 5.2: Alertes Push Favoris & Régionales (Premium)

Status: ready-for-dev

## Story

As a Premium user,
I want to receive push alerts when ideal sea of clouds conditions are predicted for my favorite peaks or my region,
so that I never miss an opportunity without having to check the app manually.

## Context & Scope

Cette story implémente les **alertes proactives côté backend** pour les utilisateurs Premium. Contrairement à la story 5.3 (notification GPS, déclenchée par le mobile), les alertes favoris et régionales sont entièrement générées par un **cron job backend** qui tourne en continu et déclenche des notifications sur la base des prévisions calculées.

**Ce que cette story fait :**
- Cron job hourly backend qui calcule les scores de tous les sommets favoris des users Premium avec `notif_favorites=true`
- Envoi d'une alerte push si score ≥ 70 ("Haute probabilité") et que la dernière alerte sur ce sommet date de > 12h (cooldown anti-spam)
- Alertes régionales : même logique pour les users Premium avec `notif_regional=true`, agrégée par région géographique
- Table `notification_log` pour tracer les envois et gérer le cooldown
- Service `alert_scheduler.py` orchestrant la logique complète

**Ce que cette story ne fait PAS :**
- Modifications côté mobile (pas de nouveau composant UI) — les notifications arrivent via le pipeline Expo Push déjà établi en 5.1
- Gestion des préférences (déjà implémentée en 2.2 — colonnes `notif_favorites`, `notif_regional` en DB)
- Notification GPS terrain (story 5.3)

**Flux bout en bout :**
```
APScheduler (toutes les heures, entre 4h et 9h UTC)
  → alert_scheduler.py : charge les users Premium actifs avec notif activée
  → pour chaque sommet favori : calcule le score (réutilise services/score.py)
  → vérifie cooldown dans notification_log (> 12h depuis dernier envoi)
  → si score ≥ 70 et cooldown OK : push_notification_service.send(user_id, ...)
  → insère une ligne dans notification_log
```

**Dépendances :**
- Story 5.1 ✅ ready-for-dev — `ExpoPushService` + `push_service.send()` disponibles dans `app/services/push_notification.py`
- Story 2.2 ✅ done — colonnes `notif_favorites`, `notif_regional`, `notif_terrain` dans `users`
- Story 4.3 — abonnements Premium en DB dans table `subscriptions` (`plan: "premium"`, `status: "active"|"trial"`)
- Story 3.1 ✅ done — `calculate_score()` réutilisable depuis `app/services/score.py`
- Story 3.3 ✅ done — table `user_favorites` disponible (colonnes `user_id`, `peak_id`)

**FRs couverts :** FR22 (alertes favoris Premium), FR23 (alertes régionales Premium), FR25 (respect des préférences de notifications)

## Acceptance Criteria

1. **Given** un utilisateur Premium avec `notif_favorites=true` et au moins un sommet favori
   **When** le cron job tourne et que le score du sommet favori est ≥ 70
   **Then** une notification push est envoyée : `"Conditions idéales prévues sur [Nom Sommet] — 87% 🟢"`
   **And** une ligne est insérée dans `notification_log` avec `user_id`, `peak_id`, `type: "favorite"`, `sent_at`

2. **Given** une notification "favoris" déjà envoyée sur ce sommet pour cet utilisateur
   **When** le cron job retourne un score ≥ 70 dans les 12h suivantes
   **Then** aucune nouvelle notification n'est envoyée (cooldown anti-spam)
   **And** aucune ligne n'est insérée dans `notification_log`

3. **Given** un utilisateur Premium avec `notif_regional=true`
   **When** le cron job détecte qu'au moins 2 sommets dans la région de l'utilisateur ont un score ≥ 70
   **Then** une notification régionale est envoyée : `"Mer de nuage visible dès 1600m dans les [Alpes / Vosges / Massif Central] ce matin 🌊"`
   **And** le cooldown régional est de 12h (une seule alerte par région et par fenêtre temporelle)

4. **Given** un utilisateur gratuit (Free) avec un sommet favori
   **When** le score de ce sommet est ≥ 70
   **Then** aucune alerte n'est envoyée (feature Premium uniquement)
   **And** `notification_log` ne contient aucune entrée pour cet utilisateur

5. **Given** un utilisateur Premium avec `notif_favorites=false`
   **When** le score d'un de ses sommets favoris est ≥ 70
   **Then** aucune notification "favoris" n'est envoyée
   **And** si `notif_regional=true`, les alertes régionales continuent de fonctionner normalement

6. **Given** un utilisateur sans `push_token` en DB (permission refusée)
   **When** le cron tente d'envoyer une alerte
   **Then** `push_service.send()` ignore silencieusement (comportement hérité de 5.1 — log debug)
   **And** aucune ligne n'est insérée dans `notification_log`

7. **Given** le cron job qui tourne
   **When** l'API Open-Meteo est indisponible pour un sommet
   **Then** le sommet est ignoré pour cette itération (pas de crash du cron)
   **And** l'erreur est loggée : `logger.warning("alert_weather_unavailable", extra={"peak_id": ...})`
   **And** le cron reprend normalement pour les sommets suivants

8. **Given** le cron job configuré avec APScheduler
   **When** le backend démarre
   **Then** le scheduler est enregistré et tourne automatiquement toutes les heures entre 4h et 9h UTC
   **And** un log structuré confirme le démarrage : `logger.info("alert_scheduler_started")`

## Tasks / Subtasks

- [ ] **Migration Alembic — table `notification_log`** (AC: #1, #2, #3)
  - [ ] Créer migration `alembic revision --autogenerate -m "add notification_log"`
  - [ ] Modèle SQLAlchemy `app/models/notification_log.py` : `id` (UUID PK), `user_id` (String, FK → users), `peak_id` (UUID nullable, FK → peaks), `region` (String nullable), `type` (String : "favorite" | "regional"), `sent_at` (DateTime UTC)
  - [ ] Index composé sur `(user_id, peak_id, type, sent_at)` pour les lookups de cooldown rapides
  - [ ] Ajouter `NotificationLog` dans `app/db/base.py` (imports Alembic autogenerate)

- [ ] **Service `app/services/alert_scheduler.py`** (AC: #1–#8)
  - [ ] Classe `AlertScheduler` avec méthode `async run_favorites_check(db: AsyncSession)`
  - [ ] Requête SQL : users Premium actifs (`subscriptions.plan = "premium"`, `status IN ("active", "trial")`) avec `notif_favorites=true` et `push_token IS NOT NULL`
  - [ ] Pour chaque user : charger ses favoris depuis `user_favorites`, calculer le score via `calculate_score()` (réutiliser `weather_service.get_forecast()` + `score_service.calculate_score()`)
  - [ ] Vérifier cooldown : `SELECT MAX(sent_at) FROM notification_log WHERE user_id=X AND peak_id=Y AND type="favorite"` → skip si < 12h
  - [ ] Appeler `push_service.send(user_id, title, body, db)` si conditions OK
  - [ ] Insérer dans `notification_log` si envoi réussi (retour `True` de `push_service.send`)
  - [ ] Méthode `async run_regional_check(db: AsyncSession)` — même logique avec `notif_regional=true`, agrégation par région
  - [ ] Gestion d'exception par sommet : `try/except` → log warning + continue (le cron ne crashe pas)
  - [ ] Logger les métriques d'exécution : `logger.info("alert_run_complete", extra={"checked": N, "sent": M, "skipped_cooldown": K, "skipped_no_token": J})`

- [ ] **Régions géographiques — `app/core/regions.py`** (AC: #3)
  - [ ] Dict `REGIONS` : mapping nom région → bounding box `(lat_min, lat_max, lng_min, lng_max)`
  - [ ] Régions MVP : Alpes (Alpes-du-Nord + Alpes-du-Sud), Vosges, Massif Central, Pyrénées, Jura, Bretagne-Atlantique
  - [ ] Fonction `get_region(lat: float, lng: float) -> str | None` : retourne le nom de la région ou `None`
  - [ ] Fonction `get_peaks_in_region(region: str, db: AsyncSession) -> list[Peak]` : requête sur `peaks` dans la bounding box
  - [ ] Cooldown régional vérifié dans `notification_log` via `type="regional"` + `region=X` + `peak_id IS NULL`

- [ ] **Intégration APScheduler dans FastAPI** (AC: #8)
  - [ ] Ajouter `apscheduler` dans `requirements.txt` (version 3.x — `AsyncIOScheduler`)
  - [ ] Créer `app/core/scheduler.py` : instancie `AsyncIOScheduler`, configure le job `run_alert_check` avec `CronTrigger(hour="4-9", minute=0)`
  - [ ] Enregistrer `startup` / `shutdown` dans `app/main.py` via lifespan FastAPI :
    ```python
    scheduler.start()  # au startup
    scheduler.shutdown()  # au shutdown
    ```
  - [ ] Le job appelle `AlertScheduler().run_favorites_check(db)` puis `AlertScheduler().run_regional_check(db)` dans la même session DB
  - [ ] Ajouter `APSCHEDULER_TIMEZONE=UTC` dans `app/core/config.py`

- [ ] **Endpoint admin manuel (optionnel, debug)** (AC: #8)
  - [ ] `POST /api/v1/admin/alerts/trigger` protégé par `X-Admin-Token` header (token depuis settings)
  - [ ] Déclenche manuellement `run_favorites_check` + `run_regional_check` — utile pour tester sans attendre le cron
  - [ ] Retourne `{"checked": N, "sent": M}` — résumé de l'exécution

- [ ] **Tests** (AC: #1–#7)
  - [ ] Écrire `tests/test_alert_scheduler.py` :
    - `test_alerte_envoyee_si_score_suffisant` — user Premium, favori, score ≥ 70 → notification envoyée, log inséré
    - `test_cooldown_respecte` — même setup, log récent (< 12h) → aucun envoi
    - `test_user_gratuit_pas_de_notification` — user Free → aucun envoi
    - `test_notif_favorites_false_pas_de_notification` — Premium mais `notif_favorites=False` → aucun envoi
    - `test_sans_push_token_ignore_silencieusement` — `push_token=None` → aucun envoi, pas d'erreur
    - `test_weather_indisponible_cron_continue` — exception levée par `get_forecast` sur un sommet → log warning + continue sur les suivants
    - `test_alerte_regionale_envoyee` — 2+ sommets région ≥ 70 → notification régionale envoyée
    - `test_cooldown_regional_respecte` — alerte régionale envoyée < 12h → pas de nouvelle alerte
  - [ ] Écrire `tests/test_models_notification_log.py` : CRUD basique + contraintes

- [ ] **Documentation** (AC: all)
  - [ ] Créer `backend/docs/story-5-2-alertes-push-favoris-regionales-premium.md`
  - [ ] Mettre à jour `backend/docs/product-audit.md`
  - [ ] Mettre à jour `sprint-status.yaml` : `5-2-alertes-push-favoris-regionales-premium: done`

## Dev Notes

### Modèle `app/models/notification_log.py`

```python
import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class NotificationLog(Base):
    __tablename__ = "notification_log"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    peak_id: Mapped[str | None] = mapped_column(String, ForeignKey("peaks.id", ondelete="SET NULL"), nullable=True)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=False)   # "favorite" | "regional"
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_notification_log_cooldown", "user_id", "peak_id", "type", "sent_at"),
        Index("ix_notification_log_regional", "user_id", "region", "type", "sent_at"),
    )
```

### Régions `app/core/regions.py`

```python
from dataclasses import dataclass


@dataclass
class BoundingBox:
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float


REGIONS: dict[str, BoundingBox] = {
    "Alpes": BoundingBox(lat_min=43.5, lat_max=46.5, lng_min=5.5, lng_max=7.8),
    "Vosges": BoundingBox(lat_min=47.7, lat_max=48.9, lng_min=6.7, lng_max=7.6),
    "Massif Central": BoundingBox(lat_min=44.0, lat_max=46.5, lng_min=2.0, lng_max=4.5),
    "Pyrénées": BoundingBox(lat_min=42.3, lat_max=43.5, lng_min=-2.0, lng_max=3.5),
    "Jura": BoundingBox(lat_min=45.8, lat_max=47.5, lng_min=5.5, lng_max=6.8),
}


def get_region(lat: float, lng: float) -> str | None:
    for name, bbox in REGIONS.items():
        if bbox.lat_min <= lat <= bbox.lat_max and bbox.lng_min <= lng <= bbox.lng_max:
            return name
    return None
```

### Service `app/services/alert_scheduler.py`

```python
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.regions import get_region, get_peaks_in_region, REGIONS
from app.models.notification_log import NotificationLog
from app.models.peak import Peak
from app.models.user import User
from app.services.push_notification import push_service
from app.services.score import calculate_score
from app.services.weather import weather_service

logger = logging.getLogger(__name__)

COOLDOWN_HOURS = 12
SCORE_THRESHOLD = 70
REGIONAL_MIN_PEAKS = 2   # nombre de sommets ≥ seuil pour déclencher alerte régionale


class AlertScheduler:

    async def run_favorites_check(self, db: AsyncSession) -> dict:
        """Vérifie les favoris des users Premium et envoie les alertes si conditions réunies."""
        checked = sent = skipped_cooldown = skipped_no_score = 0

        users = await self._get_premium_users_with_notif_favorites(db)
        for user in users:
            favorites = await self._get_user_favorites(user.id, db)
            for peak in favorites:
                checked += 1
                try:
                    score_data = await self._compute_score(peak)
                    if score_data["score"] < SCORE_THRESHOLD:
                        skipped_no_score += 1
                        continue

                    if await self._is_in_cooldown(user.id, peak.id, "favorite", db):
                        skipped_cooldown += 1
                        continue

                    title = "Mer de nuage 🟢"
                    body = f"Conditions idéales prévues sur {peak.name} — {score_data['score']}% 🟢"
                    sent_ok = await push_service.send(user.id, title, body, db)

                    if sent_ok:
                        await self._log_notification(user.id, peak_id=peak.id, region=None, notif_type="favorite", db=db)
                        sent += 1

                except Exception as exc:
                    logger.warning(
                        "alert_weather_unavailable",
                        extra={"peak_id": str(peak.id), "error": str(exc)},
                    )

        logger.info(
            "alert_favorites_run_complete",
            extra={"checked": checked, "sent": sent, "skipped_cooldown": skipped_cooldown, "skipped_no_score": skipped_no_score},
        )
        return {"checked": checked, "sent": sent}

    async def run_regional_check(self, db: AsyncSession) -> dict:
        """Vérifie les alertes régionales pour les users Premium avec notif_regional=true."""
        sent = 0

        users = await self._get_premium_users_with_notif_regional(db)
        for user in users:
            for region_name in REGIONS:
                try:
                    peaks = await get_peaks_in_region(region_name, db)
                    high_score_peaks = []
                    for peak in peaks:
                        score_data = await self._compute_score(peak)
                        if score_data["score"] >= SCORE_THRESHOLD:
                            high_score_peaks.append(peak)

                    if len(high_score_peaks) < REGIONAL_MIN_PEAKS:
                        continue

                    if await self._is_in_cooldown(user.id, peak_id=None, notif_type="regional", db=db, region=region_name):
                        continue

                    title = f"Mer de nuage dans les {region_name} 🌊"
                    body = f"Conditions idéales sur {len(high_score_peaks)} sommets des {region_name} ce matin"
                    sent_ok = await push_service.send(user.id, title, body, db)

                    if sent_ok:
                        await self._log_notification(user.id, peak_id=None, region=region_name, notif_type="regional", db=db)
                        sent += 1

                except Exception as exc:
                    logger.warning(
                        "alert_regional_error",
                        extra={"region": region_name, "user_id": user.id, "error": str(exc)},
                    )

        logger.info("alert_regional_run_complete", extra={"sent": sent})
        return {"sent": sent}

    async def _compute_score(self, peak: Peak) -> dict:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        weather = await weather_service.get_forecast(peak.lat, peak.lng, date_str)
        return calculate_score(weather, peak.altitude)

    async def _is_in_cooldown(
        self,
        user_id: str,
        peak_id: str | None,
        notif_type: str,
        db: AsyncSession,
        region: str | None = None,
    ) -> bool:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=COOLDOWN_HOURS)
        stmt = (
            select(NotificationLog)
            .where(
                NotificationLog.user_id == user_id,
                NotificationLog.type == notif_type,
                NotificationLog.sent_at >= cutoff,
            )
        )
        if peak_id is not None:
            stmt = stmt.where(NotificationLog.peak_id == peak_id)
        if region is not None:
            stmt = stmt.where(NotificationLog.region == region)

        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def _log_notification(
        self,
        user_id: str,
        peak_id: str | None,
        region: str | None,
        notif_type: str,
        db: AsyncSession,
    ) -> None:
        log = NotificationLog(
            user_id=user_id,
            peak_id=peak_id,
            region=region,
            type=notif_type,
            sent_at=datetime.now(timezone.utc),
        )
        db.add(log)
        await db.commit()

    async def _get_premium_users_with_notif_favorites(self, db: AsyncSession) -> list[User]:
        from app.models.subscription import Subscription
        stmt = (
            select(User)
            .join(Subscription, Subscription.user_id == User.id)
            .where(
                Subscription.plan == "premium",
                Subscription.status.in_(["active", "trial"]),
                User.notif_favorites.is_(True),
                User.push_token.is_not(None),
            )
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def _get_premium_users_with_notif_regional(self, db: AsyncSession) -> list[User]:
        from app.models.subscription import Subscription
        stmt = (
            select(User)
            .join(Subscription, Subscription.user_id == User.id)
            .where(
                Subscription.plan == "premium",
                Subscription.status.in_(["active", "trial"]),
                User.notif_regional.is_(True),
                User.push_token.is_not(None),
            )
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def _get_user_favorites(self, user_id: str, db: AsyncSession) -> list[Peak]:
        from app.models.user_favorite import UserFavorite
        stmt = (
            select(Peak)
            .join(UserFavorite, UserFavorite.peak_id == Peak.id)
            .where(UserFavorite.user_id == user_id)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


alert_scheduler = AlertScheduler()
```

### Intégration APScheduler `app/core/scheduler.py`

```python
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


def setup_scheduler() -> None:
    from app.db.session import AsyncSessionLocal
    from app.services.alert_scheduler import alert_scheduler

    async def run_alert_job() -> None:
        logger.info("alert_scheduler_job_started")
        async with AsyncSessionLocal() as db:
            await alert_scheduler.run_favorites_check(db)
            await alert_scheduler.run_regional_check(db)
        logger.info("alert_scheduler_job_done")

    scheduler.add_job(
        run_alert_job,
        trigger=CronTrigger(hour="4-9", minute=0, timezone="UTC"),
        id="alert_check",
        replace_existing=True,
    )
    logger.info("alert_scheduler_started")
```

### Intégration dans `app/main.py`

```python
from contextlib import asynccontextmanager
from app.core.scheduler import scheduler, setup_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_scheduler()
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan, ...)
```

### Endpoint admin de déclenchement manuel

```python
# app/api/v1/endpoints/admin.py
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db
from app.services.alert_scheduler import alert_scheduler

router = APIRouter()


@router.post("/admin/alerts/trigger")
async def trigger_alert_check(
    x_admin_token: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=403, detail="Token admin invalide")
    favorites_result = await alert_scheduler.run_favorites_check(db)
    regional_result = await alert_scheduler.run_regional_check(db)
    return {
        "favorites": favorites_result,
        "regional": regional_result,
    }
```

Ajouter `admin_token: str = ""` dans `app/core/config.py` et `ADMIN_TOKEN=` dans `.env.example`.

### Tests — structure `tests/test_alert_scheduler.py`

```python
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
from app.services.alert_scheduler import AlertScheduler, COOLDOWN_HOURS, SCORE_THRESHOLD


@pytest.mark.asyncio
async def test_alerte_envoyee_si_score_suffisant(db_session) -> None:
    """User Premium, favori, score ≥ 70 → notification envoyée, log inséré."""
    # Setup: créer user Premium avec push_token, subscription active, favori
    # Mock calculate_score → score=85
    # Mock push_service.send → True
    # Appeler run_favorites_check
    # Vérifier: push_service.send appelé 1x, notification_log contient 1 ligne
    ...


@pytest.mark.asyncio
async def test_cooldown_respecte(db_session) -> None:
    """Log récent (< 12h) → aucun envoi."""
    # Setup: idem + insérer une ligne notification_log à now() - 6h
    # Appeler run_favorites_check
    # Vérifier: push_service.send non appelé
    ...


@pytest.mark.asyncio
async def test_user_gratuit_pas_de_notification(db_session) -> None:
    """User sans abonnement → aucun envoi."""
    # Setup: user sans subscription, avec favori et push_token
    # Appeler run_favorites_check
    # Vérifier: liste users Premium vide → aucun envoi
    ...


@pytest.mark.asyncio
async def test_notif_favorites_false_pas_de_notification(db_session) -> None:
    """Premium mais notif_favorites=False → aucun envoi favori."""
    # Setup: user Premium, notif_favorites=False
    # Vérifier: non inclus dans la liste → aucun envoi
    ...


@pytest.mark.asyncio
async def test_sans_push_token_ignore_silencieusement(db_session) -> None:
    """push_token=None → ignoré (retour False de push_service.send)."""
    # push_service.send retourne False (comportement 5.1)
    # Vérifier: notification_log vide (pas de log si envoi non confirmé)
    ...


@pytest.mark.asyncio
async def test_weather_indisponible_cron_continue(db_session) -> None:
    """Exception météo sur un sommet → log warning + traitement des suivants."""
    # Mock calculate_score → lève Exception pour le 1er sommet
    # Vérifier: pas de crash, 2e sommet traité normalement
    ...


@pytest.mark.asyncio
async def test_alerte_regionale_envoyee(db_session) -> None:
    """≥ 2 sommets région ≥ 70 → alerte régionale envoyée."""
    # Setup: user Premium, notif_regional=True, 3 sommets Alpes avec score ≥ 70
    # Vérifier: 1 notification régionale envoyée
    ...


@pytest.mark.asyncio
async def test_cooldown_regional_respecte(db_session) -> None:
    """Alerte régionale envoyée < 12h → pas de nouvelle alerte."""
    # Setup: log régional à now() - 6h pour les Alpes
    # Vérifier: aucun nouvel envoi régional pour les Alpes
    ...
```

### Variables d'environnement

**Nouvelles variables :**
```
ADMIN_TOKEN=           # Token pour déclencher les alertes manuellement via /admin/alerts/trigger
APSCHEDULER_TIMEZONE=UTC   # Timezone du scheduler (défaut UTC)
```

Ajouter dans `infra/.env.example`.

### Project Structure — fichiers concernés

**Nouveaux fichiers :**
- `backend/app/models/notification_log.py` — modèle SQLAlchemy `NotificationLog`
- `backend/app/core/regions.py` — `REGIONS` dict + `get_region()` + `get_peaks_in_region()`
- `backend/app/core/scheduler.py` — `AsyncIOScheduler` + `setup_scheduler()`
- `backend/app/services/alert_scheduler.py` — `AlertScheduler` + instance `alert_scheduler`
- `backend/app/api/v1/endpoints/admin.py` — endpoint `POST /admin/alerts/trigger`
- `backend/tests/test_alert_scheduler.py` — tests du scheduler (8 cas)
- `backend/tests/test_models_notification_log.py` — tests CRUD modèle

**Fichiers modifiés :**
- `backend/app/main.py` — intégrer `lifespan` avec `scheduler.start()` / `shutdown()`
- `backend/app/api/v1/router.py` — inclure `admin.router`
- `backend/app/core/config.py` — ajouter `admin_token: str = ""`, `apscheduler_timezone: str = "UTC"`
- `backend/app/db/base.py` — importer `NotificationLog` pour Alembic autogenerate
- `backend/requirements.txt` — ajouter `apscheduler>=3.10.0`
- `infra/.env.example` — ajouter `ADMIN_TOKEN=`, `APSCHEDULER_TIMEZONE=UTC`
- `backend/alembic/versions/` — nouvelle migration `add_notification_log`

**Fichiers non touchés :**
- `backend/app/services/push_notification.py` — réutilisé tel quel depuis 5.1
- `backend/app/services/score.py` — réutilisé tel quel depuis 3.1
- `backend/app/models/user.py` — colonnes `notif_favorites`, `notif_regional` déjà présentes (2.2)
- `backend/app/models/subscription.py` — réutilisé tel quel depuis 4.3
- Mobile — aucun fichier modifié (les notifications arrivent via le pipeline Expo Push déjà établi)

### Critères de done

- [ ] `make validate` (ruff + mypy + pytest --cov) passe à 100% côté backend
- [ ] Migration Alembic appliquée sans erreur (`make migrate`)
- [ ] Test manuel : déclencher `POST /admin/alerts/trigger` avec le bon token → logs confirmant l'exécution
- [ ] Test manuel : créer un user Premium test avec favori → vérifier notification reçue sur device physique
- [ ] Vérifier dans `notification_log` que le cooldown est inséré après envoi
- [ ] Tester le cooldown : relancer le trigger < 12h après → aucune nouvelle notification pour le même sommet

### Notes de conception

**Pourquoi APScheduler et pas une tâche cron Docker ?**
APScheduler s'intègre nativement dans le processus FastAPI via le lifespan — pas de service Docker supplémentaire à gérer, pas de coordination entre le cron et l'API pour partager la session DB. En cas de restart Dokploy, le scheduler redémarre automatiquement avec l'API. Pour le volume MVP (< 200 users Premium), APScheduler AsyncIOScheduler est largement suffisant.

**Pourquoi une fenêtre 4h-9h UTC ?**
Les mers de nuage se forment typiquement au lever du soleil (6h-9h locale en France = 4h-7h UTC en été, 5h-8h UTC en hiver). Envoyer des alertes hors de cette fenêtre n'a pas de sens opérationnel et dégraderait l'expérience utilisateur. La fenêtre 4h-9h UTC couvre l'ensemble des horaires de lever de soleil sur l'arc alpin français en toutes saisons.

**Cooldown 12h vs 24h :**
12h est choisi pour couvrir à la fois le créneau matin et un éventuel second créneau en fin d'après-midi (rarer mais possible). Un cooldown 24h risquerait de manquer une fenêtre de l'après-midi si une alerte a déjà été envoyée le matin. En pratique, une alerte par fenêtre de 12h reste non-spam pour l'utilisateur.

**Seuil 2 sommets pour les alertes régionales :**
Une alerte régionale ne vaut la peine d'être envoyée que si plusieurs sommets de la région présentent des conditions favorables — signe d'une inversion thermique étendue, pas d'un événement local ponctuel. 2 sommets est le minimum cohérent météorologiquement.

## References

- [Source: epics.md#Story 5.2] — ACs complets (FR22, FR23, FR25)
- [Source: epics.md#Epic 5] — "Users Premium reçoivent alertes proactives favoris et région"
- [Source: prd.md#FR22] — "Alertes favoris : conditions idéales prévues demain 6h sur [sommet] — 87% 🟢"
- [Source: prd.md#FR23] — "Alertes régionales : mer de nuage visible dès 1600m dans ta région ce matin"
- [Source: prd.md#Risque ressources] — "Premier cut sur alertes régionales si temps manque — garder alertes favoris"
- [Source: CLAUDE.md#Modèle de données] — `users.notif_favorites`, `users.notif_regional`, `subscriptions.plan/status`
- [Source: CLAUDE.md#Endpoints API] — `POST /api/v1/user/push-token`, `PATCH /api/v1/user/notifications`
- [Source: CLAUDE.md#Patterns de code] — logs JSON structurés, `logger.debug/warning/info/error`
- [Source: 5-1-infrastructure-push-notifications-expo-push.md] — `ExpoPushService`, `push_service.send(user_id, title, body, db)`
- [Source: 2-2-gestion-preferences-notifications.md] — colonnes `notif_favorites`, `notif_regional`, `notif_terrain`
- [Source: MEMORY.md#Story 3.3] — HTTPBearer retourne 403 (pas 401) sans header Authorization
- [Source: MEMORY.md#code-review-graph] — graph disponible pour impact analysis

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
