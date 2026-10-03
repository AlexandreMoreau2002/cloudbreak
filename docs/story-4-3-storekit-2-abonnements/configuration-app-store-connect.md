# Configuration App Store Connect — Story 4.3

> Configuration relevée le 2026-10-03. Ce document ne contient aucun secret Apple.

## Ce qui est configuré

- App : **Cloudbreak – Mer de nuage** ; bundle id définitif
  `com.alexandremoreau.cloudbreak`.
- Groupe d'abonnements à renouvellement automatique : **Cloudbreak Premium**.
- Les deux produits sont au même niveau du groupe : ils donnent exactement le même droit
  Cloudbreak `premium`. Passer du mensuel à l'annuel, ou inversement, prend donc effet au
  prochain renouvellement selon les règles de crossgrade Apple.
- Vente limitée à la France au lancement.
- Partage familial désactivé et achats multi-postes désactivés : un achat est individuel, dans
  l'App Store uniquement. Cela évite de promettre un droit Cloudbreak à des personnes qui n'ont
  pas de compte Cloudbreak associé.

| Offre | Identifiant StoreKit | Durée | Prix France Apple | Texte client | Offre d'introduction |
| --- | --- | --- | --- | --- | --- |
| Premium mensuel | `com.alexandremoreau.cloudbreak.premium.monthly` | 1 mois | 4,99 € | « Cloudbreak Premium Mensuel » — accès Premium pendant 1 mois | 1 semaine gratuite |
| Premium annuel | `com.alexandremoreau.cloudbreak.premium.annual` | 1 an, payé d'avance | 44,99 € | « Cloudbreak Premium Annuel » — accès Premium pendant 1 an | 1 semaine gratuite |

Les prix visés étaient 5 € et 45 €. Apple ne propose pas ces montants exacts dans le palier
France choisi ; la décision prise est le palier immédiatement inférieur. L'annuel reste environ
25 % moins cher que douze mensualités au tarif 4,99 €.

Les essais sont illimités dans le temps pour la France, à compter du 2026-10-03. Apple ne permet
à un même client de profiter que d'une seule offre d'introduction par groupe d'abonnements : le
badge de l'app ne peut donc jamais être une garantie d'éligibilité indépendante de StoreKit.

## Pourquoi cette structure

Apple facture avec l'Apple ID ; Cloudbreak sait quel compte applicatif reçoit le droit grâce à
`appAccountToken`, un UUID Cloudbreak transmis à StoreKit. Le backend vérifie le JWS Apple et
écrit ensuite le même contrat applicatif pour les deux durées : `subscriptions.plan = "premium"`.
Un achat déjà relié à un autre compte Cloudbreak est refusé ; il n'est pas « attaché à un appareil ».

La durée et le prix sont des données StoreKit. L'app affiche le prix localisé renvoyé par Apple au
lieu de réécrire ces valeurs en dur.

## Icône et image promotionnelle

L'icône 1024 × 1024 de l'app existe dans
[`mobile/assets/images/icon.png`](../../mobile/assets/images/icon.png) et est référencée par
[`mobile/app.json`](../../mobile/app.json). App Store Connect recevra cette icône à travers une
build iOS signée téléversée ; elle ne s'ajoute pas manuellement depuis la page d'un abonnement.

Le champ « Image (facultatif) » de chaque abonnement est une image promotionnelle pour les offres
de reconquête, codes d'offre ou la promotion App Store. Il est volontairement laissé vide :
l'icône de l'app n'est pas une création marketing spécifique à ces emplacements.

## État et prochaines actions contrôlées

Les deux produits sont **« Finaliser avant soumission »**. Aucune soumission à la vérification
Apple n'a été effectuée. Le premier abonnement doit être soumis avec une nouvelle version de
l'application, après accord explicite d'Alexandre.

Avant le test réel :

1. Créer un Sandbox Tester Apple (une adresse e-mail de test doit être choisie par Alexandre).
2. Installer une build native development/preview sur un iPhone : Expo Go ne charge pas le module
   StoreKit natif.
3. Déployer les paramètres Apple backend du bon environnement et vérifier l'endpoint public de
   notification V2 avant de le saisir dans App Store Connect.
4. Exécuter les scénarios de [`guide-test.md`](guide-test.md), notamment achat, restauration,
   annulation, expiration, remboursement et conflit de compte.
5. Ajouter les captures demandées pour la review et décider explicitement de la soumission avec
   la première version de l'app.

La checklist Notion associée est créée sous la page
[Cloudbreak – mer de nuage](https://app.notion.com/p/alexgrimpeur/Cloudbreak-mer-de-nuage-325964bda18580358585ff14ef1f76c6),
avec le titre « ✅ Tests story 4.3 — StoreKit 2 Premium ». Le connecteur n'a pas fourni son URL
individuelle ; le lien parent est donc la référence vérifiable actuellement.
