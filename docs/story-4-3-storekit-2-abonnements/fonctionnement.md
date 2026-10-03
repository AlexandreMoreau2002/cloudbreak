# Story 4.3 — Abonnements Premium StoreKit 2

## L'idée, simplement

Cloudbreak vend deux abonnements iOS dans le même groupe Apple **Cloudbreak Premium** :

- mensuel : `com.alexandremoreau.cloudbreak.premium.monthly` ;
- annuel : `com.alexandremoreau.cloudbreak.premium.annual`.

Les deux donnent le même droit Premium. La base Cloudbreak enregistre donc toujours
`plan = "premium"`, jamais « mensuel », « annuel » ou `pro`. La durée et le prix restent des
informations Apple/StoreKit. Un ancien enregistrement `pro` reste lu comme Premium pour ne pas
casser le quota historique.

L'essai de sept jours n'est pas un chronomètre fabriqué par l'application : c'est l'offre
introductive gratuite Apple. L'interface ne montre son badge et son texte « 7 jours gratuits » que
si le produit StoreKit chargé annonce précisément cette offre. Sans cette réponse Apple, elle ne
promet pas d'essai gratuit et elle ne peut pas acheter.

## Le trajet d'un achat

```text
Visiteur anonyme
       |
       | choisit une offre
       v
Mur « créer un compte » ----------- abandon --> retour à l'app, aucun achat Apple
       |
       | compte Supabase permanent
       v
StoreKit 2 (prix localisé + appAccountToken = UUID Cloudbreak)
       |
       | JWS de transaction signé par Apple
       v
POST /api/v1/user/subscription/verify
       |
       | signature + bundle + environnement + produit + UUID vérifiés
       v
subscriptions (premium, trial/active, expiration, lignée Apple)
       |
       +--> check_quota : Premium tant que trial/active et non expiré
       |
       v
finishTransaction StoreKit uniquement après la réponse backend
```

Le compte Apple et le compte Cloudbreak sont deux choses différentes. Apple facture et renouvelle
l'abonnement ; Cloudbreak associe sa lignée Apple à un UUID Supabase permanent grâce à
`appAccountToken`. Une transaction déjà associée à un autre compte n'est jamais transférée :
l'API renvoie un conflit déterministe.

## Renouvellement, annulation et remboursement

Apple appelle `POST /api/v1/webhooks/apple` avec une App Store Server Notification V2 signée.
Le backend vérifie d'abord la signature, puis applique l'événement une seule fois grâce à son
`notificationUUID`. Les états utiles sont :

- `trial` : essai Apple encore valide ;
- `active` : abonnement payant encore valide ;
- `expired` : fin de droit ;
- `revoked` : remboursement/révocation.

Une annulation désactive le prochain renouvellement chez Apple, mais laisse le droit actif jusqu'à
son expiration. Un remboursement/révocation coupe le droit selon l'événement Apple. L'app peut
être hors ligne : le backend applique ces changements au webhook, donc le quota ne dépend pas de
l'ouverture de l'app.

## Restaurer un achat

« Restaurer mes achats » demande à StoreKit les droits actifs du même Apple ID, vérifie chaque JWS
au backend puis termine seulement les transactions acceptées. Il faut un compte Cloudbreak
permanent ; restaurer sur un autre compte Cloudbreak est volontairement refusé plutôt que de
déplacer un abonnement.

## Configuration opérateur (sans secrets)

La configuration App Store Connect réellement enregistrée le 2026-10-03 est décrite dans
[`configuration-app-store-connect.md`](configuration-app-store-connect.md). Les tarifs Apple
France effectivement sélectionnés sont **4,99 € / mois** et **44,99 € / an** : ce sont les paliers
Apple les plus proches, pas les objectifs marketing arrondis de 5 € et 45 €. Les deux produits
portent une offre d'introduction Apple **d'une semaine gratuite**.

Il reste à créer le Sandbox Tester, déployer/configurer l'environnement backend Apple concerné et
configurer la notification V2 vers son URL publique. Les produits sont encore à l'état
« Finaliser avant soumission » : ils ne sont ni publiés ni soumis à Apple.

Le backend reçoit, via les secrets Dokploy, `APPLE_BUNDLE_ID`, `APPLE_ENVIRONMENT`,
`APPLE_APP_ID`, `APPLE_KEY_ID`, `APPLE_ISSUER_ID` et le chemin du fichier de clé privée
`APPLE_PRIVATE_KEY_PATH`. La clé privée ne va ni dans Git, ni dans Notion, ni dans les logs. En
production, l'absence de ces identifiants bloque le démarrage au lieu de valider trop largement.

## Fichiers importants

| Zone | Fichiers | Rôle |
| --- | --- | --- |
| Mobile | `mobile/src/contexts/SubscriptionContext.tsx`, `mobile/src/hooks/useSubscriptionPurchase.ts` | StoreKit, état, restauration et mur compte. |
| Paywall | `mobile/src/components/paywall/*`, `mobile/src/locales/*` | Prix Apple localisé, essai conditionnel, états de chargement/erreur. |
| API | `backend/app/api/v1/endpoints/subscription.py`, `backend/http/subscription.http` | Lecture/validation protégées et webhook public signé. |
| Vérification | `backend/app/services/apple_store.py`, `backend/app/resources/apple/` | Bibliothèque Apple officielle et ancres de confiance publiques. |
| Entitlement | `backend/app/services/subscription.py`, `backend/app/models/subscription.py`, migration Alembic | Propriété, idempotence, état courant et lignée Apple. |
| Quota | `backend/app/core/dependencies.py` | Bypass uniquement pour `premium`/ancien `pro`, `trial`/`active`, non expiré. |
