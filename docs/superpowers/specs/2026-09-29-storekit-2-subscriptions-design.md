# Story 4.3 — Abonnements StoreKit 2 Premium — Design

## Objectif

Remplacer le paywall mocké par deux abonnements iOS auto-renouvelables réels : Premium mensuel à 5 EUR et Premium annuel à 45 EUR. Les deux donnent le même accès Premium, avec un essai gratuit Apple de sept jours avant le premier prélèvement.

L'application ne traite jamais de carte bancaire. Apple réalise le paiement et le backend ne débloque l'accès qu'après validation cryptographique des données signées par Apple.

## Décisions validées

- StoreKit 2 est intégré directement via `react-native-iap`, sans RevenueCat.
- Les identifiants immuables des produits sont `com.alexandremoreau.cloudbreak.premium.monthly` et `com.alexandremoreau.cloudbreak.premium.annual`.
- Les deux produits appartiennent au groupe unique d'abonnements `Cloudbreak Premium` et ont le même niveau d'accès, car ils offrent exactement les mêmes fonctionnalités.
- Les deux produits ont une offre d'introduction Apple `Free Trial`, durée sept jours. Apple ne l'accorde qu'une fois par client dans ce groupe.
- Le paywall est visible en session anonyme, mais le CTA d'achat impose un compte Supabase permanent avant de présenter la feuille de paiement Apple.
- La colonne `subscriptions.plan` vaut uniquement `premium` pour un abonnement accordant les droits, jamais `monthly`, `annual` ou `pro`. La périodicité reste une information StoreKit.
- Les prix, devise et texte de renouvellement affichés dans l'app viennent des produits StoreKit chargés, et non des chaînes de prix statiques. Cela évite d'afficher un prix différent de celui configuré pour le storefront Apple de l'utilisateur.

## Périmètre et hors périmètre

Le périmètre comprend l'achat, l'essai, la restauration, la vérification serveur, le renouvellement, l'expiration, le remboursement/révocation et le bypass de quota.

Sont hors périmètre : Android, Family Sharing, offres promotionnelles/win-back, écran de gestion d'abonnement personnalisé et remboursement demandé depuis l'app. Les utilisateurs pourront gérer leur abonnement via les mécanismes Apple standard.

## Architecture

```text
Paywall visible
  -> compte permanent requis au clic CTA
  -> react-native-iap / StoreKit 2
      -> appAccountToken = UUID Supabase permanent
      -> feuille Apple + transaction JWS
  -> POST /api/v1/user/subscription/verify (JWT + JWS)
  -> vérificateur Apple officiel côté FastAPI
  -> subscriptions + déduplication transaction
  -> SubscriptionProvider rafraîchi, paywall fermé, quota Premium

Apple App Store Server Notifications V2
  -> POST /api/v1/webhooks/apple (signedPayload JWS)
  -> même vérificateur Apple
  -> renouvellement / expiration / remboursement reflété en base
```

### Mobile

`react-native-iap` fournit la couche native StoreKit 2 avec le plugin Expo. Le provider charge les deux produits, expose le statut de chargement et les produits utilisables par le paywall, et écoute les résultats d'achat. Il utilise le `purchaseToken` iOS (JWS) pour appeler le backend puis termine la transaction seulement après réponse serveur réussie.

Le provider recharge l'état backend à l'authentification et lorsque l'app redevient active. La restauration demande les achats actifs à StoreKit, vérifie chacun côté backend, puis rafraîchit l'état. Un achat annulé est normal : aucune erreur intrusive, le paywall reste ouvert. Les erreurs réseau ou de validation sont présentées par les composants d'état unifiés et la transaction n'est pas considérée comme livrée tant que la vérification serveur n'a pas réussi.

L'app envoie l'UUID du compte permanent comme `appAccountToken`. Apple inscrit ce UUID dans la transaction, ce qui permet au serveur de rattacher les événements futurs au même compte sans faire confiance à une valeur fournie par le client.

### Backend

Un service dédié encapsule `app-store-server-library`, la bibliothèque Python officielle Apple. Il vérifie la chaîne de certificats et décode les JWS de transaction et de notification, en contrôlant l'environnement, le bundle ID et la liste fermée des deux produits autorisés.

Le schéma `subscriptions` est complété par le statut (`trial`, `active`, `expired`, `revoked`), l'identifiant Apple original unique, le dernier identifiant de transaction et l'environnement Apple. Une table de transactions/notificiations Apple idempotentes conserve les identifiants déjà traités. Le même JWS peut donc être rejoué sans effet pour son propriétaire ; présenté par un autre compte, il échoue avec un conflit métier. Cette protection couvre le cas « receipt déjà utilisé ».

`POST /api/v1/user/subscription/verify` exige un JWT et un compte permanent. Il valide le JWS, vérifie que l'`appAccountToken` correspond au sujet du JWT, applique l'état courant et renvoie `plan`, `status` et `expires_at`. `GET /api/v1/user/subscription` retourne l'état courant, ou `free`/`none` si aucun abonnement n'existe.

`POST /api/v1/webhooks/apple` n'a pas de JWT : Apple signe le `signedPayload`. Après validation, le backend applique de manière idempotente les événements `SUBSCRIBED`, `DID_RENEW`, `EXPIRED`, `REFUND` et les états pertinents de tentative de renouvellement. Il n'accorde jamais de droits à partir d'un payload non vérifié.

Le statut `trial` est déduit des informations StoreKit de l'offre d'introduction gratuite active, pas d'une soustraction de dates approximative. Un renouvellement normal devient `active`.

### Quota

Le contrat existant est préservé et resserré : le quota n'est bypassé que si le plan est `premium`, que le statut est `trial` ou `active`, et que `expires_at` est futur. Expiration, révocation ou remboursement rétablissent immédiatement la règle freemium lors du prochain appel score.

## Configuration App Store Connect — action utilisateur obligatoire

Après validation du plan et avant l'implémentation dépendante du store, Alexandre créera lui-même dans App Store Connect :

1. le groupe `Cloudbreak Premium` ;
2. le produit mensuel, durée un mois, ID `com.alexandremoreau.cloudbreak.premium.monthly`, prix France 5 EUR ;
3. le produit annuel, durée un an, ID `com.alexandremoreau.cloudbreak.premium.annual`, prix France 45 EUR ;
4. l'offre d'introduction gratuite de sept jours pour chaque produit et les storefronts retenus ;
5. un Sandbox Tester ;
6. une clé In-App Purchase, son issuer ID et son key ID, ajoutés comme secrets dans le gestionnaire d'environnement de déploiement — jamais dans Git ni dans cette conversation ;
7. les URLs HTTPS Server Notifications V2 : sandbox vers `https://dev-api.cloudbreak-app.com/api/v1/webhooks/apple`, puis production vers `https://api.cloudbreak-app.com/api/v1/webhooks/apple` lorsque cet environnement existe ;
8. le test de notification Apple V2 après déploiement.

Le paywall affichera la durée de l'essai, le prix de renouvellement localisé et le caractère auto-renouvelable. Apple exige ces informations et les liens de confidentialité/CGU ainsi que la restauration sont déjà présents dans le parcours.

## Tests et critères d'acceptation

- Tests unitaires backend pour la validation JWS simulée, le filtrage produit/bundle/environnement, les statuts et l'idempotence.
- Tests HTTP endpoint : succès, sans JWT, JWS invalide, produit non autorisé, token de compte non correspondant, receipt déjà utilisé par un autre compte, plan expiré et webhooks invalides.
- Tests mobile pour chargement des produits, prix dynamique, compte requis, achat réussi, annulation, erreur de vérification, restauration et rafraîchissement au retour au premier plan.
- Test d'intégration quota pour `trial`, `active`, `expired` et `revoked`.
- Tests StoreKit locaux pour l'UX et Sandbox Apple pour l'intégration réellement signée, l'introduction gratuite et les notifications V2.

Les validations finales restent `npm run validate` côté mobile et `make validate` côté backend, puis review `cloudbreak-dev-reviewer` et audit `cloudbreak-security` avant PR.

## Livrables et suivi

Le plan prévoit les branches `feature/4-3-storekit-2-abonnements` dans les sous-modules mobile et backend, une checklist Notion créée dès validation du plan, et les documents de story dans les deux sous-modules. Il produira aussi `docs/story-4-3-storekit-2-abonnements/fonctionnement.md`, `docs/story-4-3-storekit-2-abonnements/guide-test.md`, un fichier HTTP backend couvrant l'API, et les mises à jour de `TODO.md`, `sprint-status.yaml`, `product-audit.md` et `security.md` au moment prévu par le workflow de PR.
