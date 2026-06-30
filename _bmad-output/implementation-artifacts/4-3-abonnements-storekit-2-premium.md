---
story: "4-3"
title: "Abonnements StoreKit 2 (Premium mensuel & annuel)"
epic: "Epic 4 — Freemium & Monétisation"
status: "ready"
frs: [FR18, FR19, FR20, FR21]
nfrs: [NFR12]
depends_on: ["4-1", "4-2"]
---

# Story 4.3 — Abonnements StoreKit 2 (Premium mensuel & annuel)

## Description

En tant qu'utilisateur ayant atteint le paywall,
je veux pouvoir m'abonner en Premium via Apple In-App Purchase (mensuel 5€/mois ou annuel 45€/an),
afin d'obtenir des consultations illimitées avec un paiement natif et sécurisé.

---

## Contexte critique — règles non négociables

### StoreKit 2 uniquement — pas de Stripe

Cloudbreak est **iOS only**. Tous les paiements passent par Apple In-App Purchase. Pas de Stripe, pas de clé de paiement côté backend. La commission Apple est de 30% an 1 (réduite à 15% via Small Business Program si revenus < 1M$/an).

### Identifiants produits App Store Connect

| Product ID | Période | Prix affiché |
|---|---|---|
| `cloudbreak_premium_monthly` | Mensuel auto-renouvelable | 5 €/mois |
| `cloudbreak_premium_yearly` | Annuel auto-renouvelable | 45 €/an |

> **Important** : le nom du fichier storekit.md (maintenu dans `mobile/docs/storekit.md`) utilise `app.cloudbreak.pro.monthly` comme exemple mais les **vrais Product IDs pour App Store Connect sont `cloudbreak_premium_monthly` et `cloudbreak_premium_yearly`**. À créer et configurer dans App Store Connect avant les tests Sandbox.

### Plan en DB : toujours `"premium"`

Le toggle Mensuel/Annuel dans `PaywallScreen` est **UI only**. En base de données, il n'y a qu'un seul plan : `"premium"`. La différence entre mensuel et annuel se reflète uniquement dans `expires_at`. La colonne `plan` dans `subscriptions` ne doit jamais valoir `"monthly"` ou `"yearly"`.

### Trial gratuit 7 jours (FR21)

StoreKit 2 gère nativement les trials via App Store Connect (configurer `Introductory Offer: Free Trial 7 days`). L'app n'a pas à implémenter de logique de trial — Apple le déclenche automatiquement pour les nouveaux abonnés. Le backend enregistre `status: "trial"` si `expirationDate - transactionDate <= 7 jours` à la première vérification.

---

## Flux complet

```
PaywallScreen (story 4.2 déjà implémentée)
      │
      ▼ onSelectPlan(billingPeriod)
useSubscription.purchase(productId)
      │
      ▼
useSubscription.loadProducts()  →  StoreKit 2 → App Store Connect
      │
      ▼
product.purchase()
      │
      ▼
Apple affiche la sheet de confirmation native
      │
 ┌────┴────┐
success   cancelled/failed
   │           │
   ▼           ▼
Vérifie :     setState error
- revocationDate == nil
- expirationDate > now
   │
   ▼
POST /api/v1/user/subscription/verify
{ "receipt": transaction.jwsRepresentation }
   │
   ▼
Backend :
  1. Valide signature JWS (certificats Apple Root CA)
  2. Extrait productId, expirationDate, transactionId
  3. UPSERT subscriptions SET plan='premium', status='active', expires_at=...
  4. Retourne { plan: "premium", status: "active", expires_at: "..." }
   │
   ▼
transaction.finish()  ← OBLIGATOIRE (sinon l'achat se re-présente à chaque lancement)
   │
   ▼
SubscriptionContext.refresh()  → quota Redis ignoré désormais
   │
   ▼
PaywallScreen se ferme → accès illimité
```

### Flux restauration (obligatoire Apple — rejet garanti sans ce bouton)

```
Bouton "Restaurer un achat" dans PaywallScreen
      │
      ▼
AppStore.sync()
      │
      ▼
Transaction.currentEntitlements (toutes les transactions actives)
      │
      ▼
Pour chaque transaction :
  - POST /api/v1/user/subscription/verify
  - transaction.finish()
      │
      ▼
SubscriptionContext.refresh()
```

### Notifications serveur Apple (webhooks App Store Server Notifications V2)

Apple envoie des notifications serveur pour les événements de cycle de vie :

| Notification type | Sous-type | Action backend |
|---|---|---|
| `DID_RENEW` | — | Mettre à jour `expires_at` |
| `EXPIRED` | `VOLUNTARY` / `BILLING_RETRY` | Passer `status: "expired"` |
| `REFUND` | — | Passer `status: "revoked"` → quota freemium réappliqué |
| `DID_FAIL_TO_RENEW` | — | Logger, pas d'action immédiate |
| `SUBSCRIBED` | `INITIAL_BUY` | Créer/mettre à jour le record (identique à verify) |

Endpoint webhook : `POST /api/v1/webhooks/apple` (non authentifié JWT — vérifié par signature Apple JWS).

---

## Fichiers à créer / modifier

### Mobile

#### Créer : `src/hooks/useSubscription.ts`

```typescript
// Gère : chargement produits, achat, restauration, statut abonnement
type SubscriptionState = {
  plan: 'free' | 'premium';
  status: 'none' | 'trial' | 'active' | 'expired';
  expiresAt: string | null;
};

// Fonctions exposées :
// - loadProducts() : charge les produits StoreKit depuis App Store Connect
// - purchase(productId: string) : déclenche l'achat StoreKit 2
// - restore() : AppStore.sync() + vérification currentEntitlements
// - checkEntitlements() : vérifie les achats actifs au démarrage de l'app
```

**Dépendances** :
- `expo-in-app-purchases` ou `react-native-purchases` (RevenueCat) — voir note ci-dessous
- `src/services/api/subscription.ts` (appel POST verify)
- `SubscriptionContext` pour broadcaster le changement de plan

> **Note implémentation** : StoreKit 2 n'a pas de binding natif direct dans Expo SDK 55. Options :
> 1. **`expo-in-app-purchases`** : module Expo, API callback-based, supporte StoreKit 1 et 2
> 2. **RevenueCat** (`react-native-purchases`) : SDK tiers gratuit jusqu'à un seuil, gère le cycle de vie complet (trial, renouvellement, REFUND detection). Simplifie l'implémentation significativement.
>
> Recommandation MVP : utiliser RevenueCat pour éviter de gérer manuellement la validation JWS, les webhooks Apple, et le cycle de vie des abonnements. RevenueCat free tier couvre largement les besoins jusqu'à ~150 payants.
>
> Si RevenueCat est choisi : le backend `POST /api/v1/user/subscription/verify` est remplacé par un webhook RevenueCat → backend, et `GET /api/v1/user/subscription` interroge l'état RevenueCat plutôt que la DB directement.

#### Créer : `src/services/api/subscription.ts`

```typescript
// Appels API abonnement
export async function verifySubscriptionReceipt(token: string, receipt: string): Promise<SubscriptionResponse>
export async function fetchSubscriptionStatus(token: string): Promise<SubscriptionResponse>
```

Type `SubscriptionResponse` :
```typescript
type SubscriptionResponse = {
  plan: 'free' | 'premium';
  status: 'none' | 'trial' | 'active' | 'expired';
  expires_at: string | null;
};
```

#### Modifier : `src/contexts/PaywallContext.tsx`

Étendre `PaywallContext` pour inclure le statut d'abonnement (ou créer un `SubscriptionContext` séparé — recommandé) :

```typescript
// SubscriptionContext (nouveau fichier src/contexts/SubscriptionContext.tsx)
type SubscriptionContextValue = {
  plan: 'free' | 'premium';
  status: 'none' | 'trial' | 'active' | 'expired';
  expiresAt: string | null;
  isPremium: boolean;  // raccourci : status in ['trial', 'active'] && expires_at > now
  refresh: () => Promise<void>;
};
```

#### Modifier : `src/components/paywall/PaywallCTA.tsx`

Le bouton CTA existant appelle `onSelectPlan(billingPeriod)`. Il faut connecter cet appel à `useSubscription.purchase(productId)` :

```typescript
// Mapping billingPeriod → productId
const PRODUCT_IDS = {
  monthly: 'cloudbreak_premium_monthly',
  yearly: 'cloudbreak_premium_yearly',
};
```

#### Modifier : `src/app/(tabs)/index.tsx`

Ajouter l'écoute de `SubscriptionContext.isPremium` pour bypasser le check quota côté UI (le backend bypass déjà).

#### Modifier : `src/app/_layout.tsx`

Ajouter `<SubscriptionProvider>` dans la hiérarchie des providers. Appeler `checkEntitlements()` au démarrage pour détecter un renouvellement survenu hors ligne.

### Backend

#### Créer : `app/api/v1/endpoints/subscription.py`

```python
# Endpoints :
# POST /api/v1/user/subscription/verify  — vérifie le receipt Apple, met à jour subscriptions
# GET  /api/v1/user/subscription         — retourne le statut abonnement actuel
# POST /api/v1/webhooks/apple            — webhook App Store Server Notifications V2
```

**POST /api/v1/user/subscription/verify**
- Auth : JWT Bearer obligatoire
- Body : `{ "receipt": "eyJ..." }` (JWS Apple)
- Délègue à `SubscriptionService.verify_receipt()`
- Retourne `{ plan, status, expires_at }`

**GET /api/v1/user/subscription**
- Auth : JWT Bearer obligatoire
- Lit `subscriptions` en DB pour l'utilisateur courant
- Retourne `{ plan, status, expires_at }` — si absent en DB → `{ plan: "free", status: "none", expires_at: null }`

**POST /api/v1/webhooks/apple**
- Pas d'auth JWT (appelé par Apple directement)
- Vérifie la signature JWS Apple
- Délègue à `SubscriptionService.handle_webhook(notification_type, payload)`

#### Créer : `app/services/subscription.py`

```python
class SubscriptionService:
    async def verify_receipt(self, user_id: str, receipt_jws: str, db: AsyncSession) -> SubscriptionRecord:
        """
        1. Valide la signature JWS avec les certificats Apple (sans appel réseau Apple — validation locale)
        2. Extrait product_id, transaction_id, expires_at, revocation_date
        3. Vérifie revocation_date == None
        4. Détermine status : "trial" si expires_at - original_purchase_date <= 7j, sinon "active"
        5. UPSERT subscriptions : plan="premium", status, expires_at
        6. Retourne le record mis à jour
        """

    async def handle_webhook(self, notification_type: str, payload: dict, db: AsyncSession) -> None:
        """
        Traite les notifications Apple :
        - DID_RENEW       → mettre à jour expires_at
        - EXPIRED         → status = "expired"
        - REFUND          → status = "revoked", expires_at = now
        - SUBSCRIBED      → equivalent à verify_receipt
        """
```

**Validation JWS Apple** : utiliser la bibliothèque `python-jose` ou `cryptography` pour valider la chaîne de certificats Apple Root CA. La clé publique Apple est disponible à `https://appleid.apple.com/auth/keys` mais la validation JWS des receipts StoreKit 2 utilise les certificats X.509 inclus dans le JWS header (`x5c`).

Dépendances à ajouter : `python-jose[cryptography]` ou `jwcrypto`.

#### Modifier : `app/models/subscription.py`

Ajouter la colonne `status` manquante :

```python
# Ajouter :
status = Column(String(50), default="none")  # none | trial | active | expired | revoked
```

Générer une migration Alembic : `make migration` puis vérifier le fichier généré.

#### Modifier : `app/core/dependencies.py`

La fonction `check_quota` vérifie déjà `plan in ("premium", "pro")`. S'assurer qu'elle vérifie aussi `status in ("trial", "active")` pour le trial :

```python
# Ligne actuelle (à vérifier) :
if subscription and subscription.plan in ("premium", "pro") and subscription.expires_at > datetime.now(UTC):
    return user  # bypass quota

# Doit devenir :
if (
    subscription
    and subscription.plan == "premium"
    and subscription.status in ("trial", "active")
    and subscription.expires_at is not None
    and subscription.expires_at > datetime.now(UTC)
):
    return user  # bypass quota
```

#### Modifier : `app/main.py`

Enregistrer le router `subscription` :

```python
from app.api.v1.endpoints.subscription import router as subscription_router
app.include_router(subscription_router)
```

#### Modifier : `app/core/config.py`

Ajouter les variables d'environnement StoreKit :

```python
apple_bundle_id: str = "com.cloudbreak.app"  # identifier App Store Connect
# Pas de clé privée Apple nécessaire si validation JWS locale uniquement
```

---

## Tests à écrire

### Backend — `tests/test_subscription.py`

```python
# Unitaires SubscriptionService
def test_verify_receipt_active_subscription()
def test_verify_receipt_trial_subscription()  # expires_at - purchase_date <= 7j
def test_verify_receipt_revoked_transaction()  # revocation_date != None → erreur
def test_verify_receipt_invalid_jws_signature()  # signature corrompue → erreur

# API endpoint
def test_post_verify_returns_premium_status()
def test_post_verify_without_jwt_returns_401()
def test_get_subscription_no_record_returns_free()
def test_get_subscription_active_returns_premium()

# Webhook
def test_webhook_did_renew_updates_expires_at()
def test_webhook_expired_sets_status_expired()
def test_webhook_refund_revokes_access()
def test_webhook_invalid_signature_returns_400()

# Intégration quota
def test_premium_user_bypasses_quota()
def test_expired_premium_user_hits_quota()
def test_trial_user_bypasses_quota()
```

### Mobile — `src/hooks/useSubscription.test.ts`

```typescript
// useSubscription
test('loadProducts retourne les deux produits StoreKit')
test('purchase déclenche POST verify et met à jour le context')
test('purchase annulé ne met pas à jour le context')
test('restore appelle AppStore.sync et vérifie currentEntitlements')
test('checkEntitlements au démarrage détecte un abonnement actif')

// src/services/api/subscription.test.ts
test('verifySubscriptionReceipt appelle POST /api/v1/user/subscription/verify')
test('fetchSubscriptionStatus appelle GET /api/v1/user/subscription')

// SubscriptionContext
test('isPremium est true si status=active et expires_at > now')
test('isPremium est true si status=trial')
test('isPremium est false si status=expired')
```

### Mobile — `src/__tests__/features/subscription-flow.test.tsx`

```typescript
test('flux complet : paywall → achat → accès illimité')
test('flux restauration : bouton → entitlements → accès rétabli')
test('achat annulé → paywall reste ouvert, pas d erreur critique')
```

---

## Acceptance Criteria

### AC1 — Achat depuis le paywall

**Given** `PaywallScreen` affiché (après QUOTA_EXCEEDED)
**When** l'utilisateur choisit "Mensuel — 5€/mois" et appuie sur le CTA
**Then** StoreKit 2 déclenche la sheet de paiement native Apple
**And** aucun numéro de carte n'est géré par l'app (NFR12)

### AC2 — Validation receipt et accès Premium

**Given** la transaction StoreKit 2 réussie
**When** l'app reçoit le receipt
**Then** `POST /api/v1/user/subscription/verify` est appelé avec le JWS
**And** le backend répond `{ plan: "premium", status: "active", expires_at: "..." }`
**And** `SubscriptionContext.isPremium` passe à `true`
**And** `transaction.finish()` est appelé (sinon l'achat se re-présente)
**And** le paywall se ferme et l'utilisateur accède aux consultations illimitées

### AC3 — Plan en DB toujours "premium"

**Given** un achat mensuel ou annuel complété
**When** on inspecte la table `subscriptions`
**Then** `plan = "premium"` (jamais "monthly" ou "yearly")
**And** la différence entre mensuel et annuel n'est reflétée que dans `expires_at`

### AC4 — Trial gratuit 7 jours (FR21)

**Given** un nouvel utilisateur sans historique d'achat
**When** il initie un abonnement Premium (mensuel ou annuel)
**Then** Apple démarre un trial de 7 jours sans débit immédiat
**And** le backend enregistre `status: "trial"` avec `expires_at = now + 7 jours`
**And** le quota freemium est bypassé pendant le trial

### AC5 — Quota bypassé pour Premium et trial

**Given** un utilisateur avec `plan: "premium"` et `status: "active"` (ou `"trial"`) et `expires_at > now`
**When** il appelle `GET /api/v1/score` plusieurs fois dans la même journée
**Then** le backend retourne les scores sans 429
**And** Redis `quota:{user_id}:{date}` n'est pas incrémenté

### AC6 — Restauration des achats (obligatoire Apple)

**Given** l'utilisateur appuie sur "Restaurer un achat" dans `PaywallScreen`
**When** `AppStore.sync()` s'exécute et `currentEntitlements` liste les abonnements actifs
**Then** `POST /api/v1/user/subscription/verify` est appelé pour chaque transaction trouvée
**And** `SubscriptionContext` est mis à jour si un abonnement actif est trouvé

### AC7 — Expiration abonnement

**Given** un abonnement dont `expires_at` est dépassé (non renouvelé)
**When** l'utilisateur relance l'app et que `checkEntitlements()` s'exécute
**Then** `currentEntitlements` ne retourne pas de transaction active
**And** `SubscriptionContext.isPremium` repasse à `false`
**And** le quota freemium est réappliqué dès la prochaine consultation

### AC8 — Webhook REFUND

**Given** Apple envoie une notification `REFUND` à `POST /api/v1/webhooks/apple`
**When** le backend traite la notification
**Then** `subscriptions.status = "revoked"` et `expires_at = now`
**And** le prochain appel `GET /api/v1/score` de cet utilisateur retourne 429 si quota dépassé

### AC9 — Achat annulé ou échoué

**Given** l'utilisateur ferme la sheet de paiement Apple sans payer
**When** StoreKit retourne `cancelled`
**Then** `PaywallScreen` reste ouvert avec les options disponibles
**And** aucun message d'erreur critique n'est affiché (comportement normal)

### AC10 — Tests Sandbox simulateur

**Given** un compte Sandbox Tester configuré dans App Store Connect
**When** on teste sur simulateur iOS avec le fichier `.storekit` (Xcode StoreKit Testing)
**Then** les deux abonnements (`cloudbreak_premium_monthly`, `cloudbreak_premium_yearly`) sont achetables sans débit réel
**And** le flux complet (achat → verify backend → accès illimité) fonctionne en Sandbox

---

## Configuration App Store Connect (pré-requis)

Avant d'implémenter, créer dans App Store Connect :

1. **In-App Purchases → Subscriptions** : créer un groupe d'abonnements "Cloudbreak Premium"
2. Créer les deux produits :
   - `cloudbreak_premium_monthly` — Auto-Renewable Subscription — 5,99€ (prix le plus proche de 5€ dans la grille Apple)
   - `cloudbreak_premium_yearly` — Auto-Renewable Subscription — 49,99€ (prix le plus proche de 45€)
3. Configurer **Introductory Offer** sur les deux produits : Free Trial 7 days
4. Créer un **Sandbox Tester** dans Users and Access → Sandbox → Testers
5. Dans Xcode, créer `mobile/Cloudbreak.storekit` pour les tests locaux (sans App Store Connect)

> **Note tarification** : Apple impose une grille de prix. 5€ et 45€ exacts ne sont pas disponibles. Les prix les plus proches sont respectivement 5,99€ et 49,99€ (ou 4,99€ et 44,99€ selon la grille). À valider dans App Store Connect avant l'implémentation.

---

## Variables d'environnement à ajouter

```bash
# .env (backend)
APPLE_BUNDLE_ID=com.cloudbreak.app
# Pas de APPLE_SHARED_SECRET ni de clé privée nécessaire pour validation JWS locale
```

```typescript
// mobile/src/constants/devConfig.ts — ajouter
STOREKIT_MONTHLY_ID: 'cloudbreak_premium_monthly',
STOREKIT_YEARLY_ID: 'cloudbreak_premium_yearly',
```

---

## Commandes de validation

### Backend

```bash
cd backend
source .venv/bin/activate
make validate   # ruff + mypy + pytest --cov — doit passer à 100%

# Migration status
PYTHONPATH=. alembic current
PYTHONPATH=. alembic upgrade head

# Test endpoint manuellement (besoin d'un JWS de test)
curl -X POST http://localhost:8000/api/v1/user/subscription/verify \
  -H "Authorization: Bearer {jwt}" \
  -H "Content-Type: application/json" \
  -d '{"receipt": "eyJ..."}'

curl http://localhost:8000/api/v1/user/subscription \
  -H "Authorization: Bearer {jwt}"
```

### Mobile

```bash
cd mobile
npm test && npx tsc --noEmit && npm run lint

# Tester le flux StoreKit en Sandbox
npx expo run:ios  # compile avec le build natif
# Puis dans Xcode : Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration
```

---

## Instructions de test manuel

### Flux achat Sandbox (simulateur)

1. Ouvrir Xcode, éditer le scheme : Run → Options → StoreKit Configuration → sélectionner `Cloudbreak.storekit`
2. Lancer `npx expo run:ios` avec un compte ayant épuisé son quota journalier
3. Le paywall apparaît → choisir "Mensuel" ou "Annuel" → appuyer sur le CTA
4. La sheet native Apple apparaît (Sandbox)
5. Confirmer l'achat
6. Vérifier :
   - Logs backend : `subscription_verified` avec `plan=premium status=active`
   - DB `subscriptions` : `plan=premium`, `status=active`, `expires_at` dans le futur
   - App : paywall fermé, accès illimité (re-tester le score sans 429)

### Flux restauration

1. Désinstaller et réinstaller l'app (ou vider AsyncStorage)
2. Se reconnecter avec le même compte
3. Ouvrir le paywall → appuyer "Restaurer un achat"
4. Vérifier : `SubscriptionContext.isPremium = true`, accès illimité rétabli

### Cas REFUND (simulateur)

Dans Xcode : Debug → StoreKit → Manage Transactions → sélectionner la transaction → Refund
Vérifier que le webhook est déclenché et que `status = "revoked"` en DB.

---

## Critères de done (Definition of Done)

- [ ] Les deux abonnements achetables sur simulateur en Sandbox (StoreKit Testing)
- [ ] Trial 7 jours fonctionnel (pas de débit immédiat Sandbox)
- [ ] `POST /api/v1/user/subscription/verify` valide un JWS et met à jour la DB
- [ ] `GET /api/v1/user/subscription` retourne le statut correct
- [ ] `POST /api/v1/webhooks/apple` traite REFUND, EXPIRED, DID_RENEW
- [ ] `transaction.finish()` toujours appelé après vérification réussie
- [ ] Bouton "Restaurer un achat" fonctionnel (obligatoire App Store Review)
- [ ] Quota freemium bypassé pour status=active et status=trial
- [ ] Quota freemium réappliqué dès expiration/révocation
- [ ] `make validate` backend : ruff + mypy + pytest 100% ✅
- [ ] `npm test && npx tsc --noEmit && npm run lint` mobile ✅
- [ ] Migration Alembic générée et rejouable en CI
- [ ] Doc `mobile/docs/story-4-3-storekit-premium.md` rédigée
- [ ] `backend/docs/story-4-3-storekit-premium.md` rédigé
- [ ] `backend/docs/product-audit.md` mis à jour
- [ ] `backend/docs/security.md` mis à jour (endpoint webhook non authentifié JWT — justification documentée)
- [ ] CLAUDE.md mis à jour si la section Endpoints API change
