# Story 4.3 — Guide de test manuel

## Pré-requis

- Une build iOS native development/preview : Expo Go ne charge pas `react-native-iap`.
- Les produits mensuel et annuel, l'offre gratuite 7 jours et le groupe **Cloudbreak Premium** actifs dans App Store Connect.
- Un Sandbox Tester Apple, un compte Cloudbreak permanent de test et un second compte Cloudbreak permanent pour le test de conflit.
- Le backend dev déployé avec la configuration Apple non secrète correcte, la clé IAP stockée dans Dokploy et l'URL V2 Sandbox configurée.
- Ne jamais coller un JWS, un token Supabase ou une clé privée dans cette page ou dans Git.

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

- [ ] Les validations automatisées sont vertes et consignées dans la checklist Notion.
- [ ] Mensuel et annuel ont été testés sur appareil réel avec Sandbox.
- [ ] L'essai réel est bien 7 jours et sans débit initial.
- [ ] Achat visiteur bloqué jusqu'au compte permanent ; replay vérifié.
- [ ] Annulation, restauration, expiration, remboursement et conflit de compte vérifiés.
- [ ] Notification V2 Sandbox reçue par l'endpoint dev et test notification Apple passée.
- [ ] Aucun JWS, UUID non masqué, JWT ni secret n'a été sauvegardé.

Statut de preuve Apple réelle : **à consigner dans la checklist Notion après configuration App Store Connect et déploiement dev**. Cette documentation ne remplace pas ce test.

