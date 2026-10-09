# Story 4.3 — Guide de test manuel

## Pré-requis

- Une build iOS native development/preview : Expo Go ne charge pas `react-native-iap`.
- Le groupe **Cloudbreak Premium**, ses produits mensuel et annuel et leurs offres gratuites de
  7 jours sont configurés dans App Store Connect. À ce stade, ils sont « Finaliser avant
  soumission », pas publiés : le premier abonnement devra être soumis avec une version de l'app.
- Un Sandbox Tester Apple, un compte Cloudbreak permanent de test et un second compte Cloudbreak permanent pour le test de conflit.
- Le backend dev (`https://dev-api.cloudbreak-app.com`) en `ENVIRONMENT=development` + `APPLE_ENVIRONMENT=Sandbox` avec `APPLE_BUNDLE_ID`. **Aucune clé Apple (`APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `.p8`, `APPLE_APP_ID`) n'est nécessaire en Sandbox** : elles ne sont exigées qu'en production (voir `docs/infra-serveur.md` section 8ter). L'URL Sandbox `https://dev-api.cloudbreak-app.com/api/v1/webhooks/apple` est enregistrée dans App Store Connect ; la sélection de la Version 2 et la livraison réelle d'une notification ne sont **pas prouvées** (voir `backend/docs/apple-server-notifications.md`).
- Ne jamais coller un JWS, un token Supabase ou une clé privée dans cette page ou dans Git.

## Nouvel iPhone : à refaire une fois (setup appareil)

Un changement d'iPhone repart de zéro : rien de ce qui suit n'est transféré. À faire dans cet ordre avant le premier test.

1. **Brancher l'iPhone au Mac** (câble), le déverrouiller, toucher « Faire confiance à cet ordinateur » et saisir le code de l'iPhone.
2. **Activer le Mode développeur** : Réglages → Confidentialité et sécurité → Mode développeur → activer, puis redémarrer l'iPhone et confirmer. L'option n'apparaît qu'après avoir branché l'iPhone à Xcode au moins une fois.
3. **Enregistrer l'appareil dans le compte Apple Developer** : Xcode → Window → Devices and Simulators doit afficher le nouvel iPhone (le Xcode signing automatique ajoute son UDID au profil). Vérifier aussi que l'ancien iPhone n'est plus requis.
4. **Installer la build de développement** : depuis `mobile/`, `npx expo run:ios --device` (choisir le nouvel iPhone). Si la signature échoue : Xcode → cible Cloudbreak → Signing & Capabilities → Team = compte de dev, « Automatically manage signing » coché. Jamais Expo Go.
5. **Faire confiance au certificat développeur** si iOS refuse d'ouvrir l'app : Réglages → Général → VPN et gestion de l'appareil → profil développeur → Faire confiance.
6. **Autoriser le réseau local** à l'ouverture de l'app (Metro) : accepter la demande « Réseaux locaux » ; iPhone et Mac sur le même Wi-Fi. Ensuite `npm start` suffit tant que la build est installée.
7. **Compte Apple Sandbox sur l'iPhone** : Réglages → Développeur → Compte Apple Sandbox → se connecter avec le Sandbox Tester (le menu « Développeur » n'apparaît qu'après les étapes 1 et 2). Ne **jamais** utiliser son vrai Apple ID pour les achats de test.
8. **Se reconnecter dans l'app** avec un compte Cloudbreak permanent (la session de l'ancien iPhone n'existe pas ici) et vérifier que l'app pointe sur `https://dev-api.cloudbreak-app.com` (`mobile/.env`).
9. **Test de fumée** : ouvrir le paywall, les deux prix Apple (4,99 € / 44,99 €) doivent s'afficher. S'ils ne chargent pas : build non signée avec la capability In-App Purchase, ou Sandbox Tester non connecté.

## Mise en route Sandbox (pas à pas)

1. **Créer un Sandbox Tester** : App Store Connect → Utilisateurs et accès → Sandbox → Testeurs → « + ». Une adresse e-mail jamais utilisée comme Apple ID, région **France**.
2. **Mode développeur sur l'iPhone** (Réglages → Confidentialité et sécurité → Mode développeur) : requis pour l'app de développement et pour voir « Compte Apple Sandbox » dans Réglages → Développeur. Au premier achat, la feuille Apple demande aussi de se connecter : utiliser le Sandbox Tester, **pas** ton vrai Apple ID.
3. **Lancer l'app** sur l'iPhone avec `EXPO_PUBLIC_API_URL=https://dev-api.cloudbreak-app.com` (c'est le cas dans `mobile/.env`) : `npm start` (build déjà installée) ou `npx expo run:ios`. Jamais Expo Go.
4. **Compte Cloudbreak** : un compte **permanent** (e-mail ou Apple), pas une session invitée : l'achat est bloqué pour un invité. Les comptes `pro@` / `test@` du seed sont des comptes **locaux** : sur le serveur dev ils n'ont aucun abonnement tant que tu n'en achètes pas un.
5. **Vérifier le résultat côté base** (lecture seule, depuis le VPS) : requête SQL du plan réel dans `backend/docs/story-4-3-storekit-premium.md` (email + plan + statut + expiration + `premium_actif`). Ne jamais écrire en base à la main.

### Le temps est accéléré en Sandbox (d'après la documentation Apple)

| Durée réelle | Durée en Sandbox |
| --- | --- |
| Essai gratuit 7 jours | ≈ 3 minutes |
| Mensuel (1 mois) | ≈ 5 minutes |
| Annuel (1 an) | ≈ 1 heure |

Le renouvellement automatique est limité à quelques cycles (6 environ), puis l'abonnement expire : c'est ce qui permet de tester l'expiration sans attendre. Un test complet du mensuel (essai, renouvellements, expiration) prend donc moins d'une heure.

**Ce qui se met à jour tout seul** : l'achat envoyé par l'app (`/verify`). **Ce qui dépend du webhook Apple** (non prouvé à ce jour) : un renouvellement, une expiration ou un remboursement pendant que l'app est fermée. Si la ligne `subscriptions` ne bouge pas toute seule, ce n'est pas forcément un bug du paywall : note-le dans la checklist, c'est justement la preuve manquante.

## Vérifications automatisées à consigner

| Zone | Commande | Attendu |
| --- | --- | --- |
| Backend | `source .venv/bin/activate && make validate` | Ruff, mypy et pytest verts. |
| Mobile | `npm run validate` | TypeScript, lint, Jest et export iOS verts. |
| API manuel | [`backend/http/subscription.http`](../../backend/http/subscription.http) | Cas nominals et erreurs documentés, sans JWS réel commité. |

## Scénarios Sandbox

1. Ouvrir le paywall en visiteur. Les deux produits chargent avec le prix localisé Apple ; toucher une offre ouvre la création de compte, jamais la feuille de paiement.
2. Créer/convertir le compte. Après succès, vérifier que l'achat demandé une seule fois est repris et que le prix affiché correspond au produit choisi.
3. Acheter le mensuel avec le Sandbox Tester. Vérifier : essai gratuit 7 jours affiché seulement si StoreKit le confirme ; aucune facturation initiale ; réponse API `premium/trial` ; quota levé. Répéter pour l'annuel.
4. Fermer la feuille Apple. Le paywall reste ouvert et aucun état Premium ne doit être accordé.
5. Couper le réseau après la confirmation Apple mais avant la réponse API. L'app doit afficher une erreur récupérable, ne pas fermer le paywall comme si l'achat était accordé, et pouvoir être restaurée/revérifiée une fois le réseau revenu.
6. Réinstaller l'app puis se connecter au **même** compte Cloudbreak et Apple ID. « Restaurer mes achats » restaure le droit actif. Essayer avec le second compte Cloudbreak : attendre le conflit de propriété, sans transfert de l'abonnement.
7. Annuler le renouvellement dans les réglages Sandbox. Le droit doit survivre jusqu'à expiration, puis devenir `expired` et réappliquer le quota.
8. Déclencher un renouvellement, une expiration puis un remboursement Sandbox/Test Notification V2. Vérifier le 204 webhook, l'idempotence d'un même événement et les états `active`, `expired`, puis `revoked` attendus.

## Cas HTTP et résultats attendus

| Requête | Résultat |
| --- | --- |
| `GET /api/v1/user/subscription` sans droit | 200 `{ plan: "free", status: "none" }`. |
| `POST /verify` JWS Apple valide lié au JWT | 200 Premium `trial` ou `active`, expiration UTC. |
| `POST /verify` sans JWT ou session anonyme | Refus d'authentification / `ACCOUNT_REQUIRED`. |
| JWS malformé, bundle, produit ou environnement différents | 400 `APPLE_TRANSACTION_INVALID` ou `APPLE_TRANSACTION_UNSUPPORTED`. |
| Même lignée Apple sur un autre compte | 409 `SUBSCRIPTION_OWNERSHIP_CONFLICT`. |
| Notification V2 invalide | 400, aucune mutation de droit. |
| Notification V2 identique répétée | 204, aucune mutation dupliquée. |

## Checklist avant PR / release

- [x] Setup du nouvel iPhone fait (mode développeur, build installée, Sandbox Tester connecté, prix Apple affichés).
- [x] Les validations automatisées sont vertes et consignées dans la checklist Notion.
- [ ] Mensuel et annuel ont été testés sur appareil réel avec Sandbox.
- [x] L'essai réel est bien 7 jours et sans débit initial (Sandbox : 3 min, feuille Apple annonçant l'absence de prélèvement).
- [ ] Achat visiteur bloqué jusqu'au compte permanent ; replay vérifié.
- [ ] Annulation, restauration, expiration, remboursement et conflit de compte vérifiés.
- [x] Notification V2 Sandbox reçue par l'endpoint dev (204) : `SUBSCRIBED` puis 5 `DID_RENEW`. Le test notification Apple explicite reste à faire.
- [x] Aucun JWS, UUID non masqué, JWT ni secret n'a été sauvegardé.

Statut de preuve Apple réelle (2026-10-08, iPhone iOS 27, backend dev, Sandbox) :

- Achat **mensuel** avec essai : feuille Apple en Sandbox, `verify` 200, ligne `subscriptions` en
  `premium` / `trial`, quota levé.
- `trial` → `active` observé, sans ouvrir l'app pour le dernier cycle ; renouvellements Sandbox
  reçus par le webhook (`DID_RENEW`, 204, une ligne par `notification_uuid`).
- **Non couverts à ce jour** (reportés dans `TODO.md`, QA manuelle) : achat annuel, restauration
  après réinstallation, conflit de compte (409), expiration vers `expired` avec retour du quota,
  remboursement (`revoked`), achat hors ligne, test notification Apple explicite.
