# Business & Legal — Cloudbreak

## Paiements iOS — StoreKit 2

Cloudbreak utilise **StoreKit 2** (iOS In-App Purchase) pour les abonnements Premium. Pas de Stripe.

### Comment ça fonctionne
- L'utilisateur paie directement via son compte Apple (comme acheter une app sur l'App Store)
- Apple encaisse et prend **30%** de commission
- Si revenus < 1M$/an : éligible au **Small Business Program** → commission réduite à **15%**
- Apple vire le solde restant sur ton compte bancaire **tous les mois**

### Ce qu'Apple demande pour activer les paiements
- Un compte bancaire (N26 perso suffit)
- Un numéro fiscal (numéro de sécurité sociale suffit en France pour un particulier)
- Accepter les contrats "Paid Apps" dans **App Store Connect**

---

## Structure juridique

### Situation actuelle — particulier
En dessous de ~1 000€/an de revenus générés par l'app :
- Pas besoin de structure juridique
- Déclarer les revenus comme **revenus divers** dans la déclaration d'impôts annuelle
- Apple retient déjà les taxes à la source dans certains pays

### Si les revenus dépassent 1 000€/an — micro-entrepreneur
L'option la plus simple est la **micro-entreprise** :
- Gratuit et rapide à créer (~2h sur autoentrepreneur.urssaf.fr)
- Donne un SIRET pour facturer légalement
- Charges proportionnelles aux revenus : si tu gagnes 0, tu paies 0
- Taux de cotisation ~22% sur le chiffre d'affaires encaissé

**À faire uniquement si les revenus décollent** — inutile d'anticiper.

---

## Remboursements

### Qui gère quoi
**Apple gère tout** — en tant que développeur tu n'as aucune action à faire et aucun contrôle sur le processus. Tu ne peux pas refuser un remboursement ni rembourser toi-même un achat App Store.

### Droit de rétractation légal (14 jours)
En Europe, la loi impose un droit de rétractation de **14 jours** après l'achat :
- S'applique uniquement à la **souscription initiale**, pas aux renouvellements automatiques
- L'utilisateur fait sa demande via [reportaproblem.apple.com](https://reportaproblem.apple.com)
- Apple rembourse dans les 14 jours suivant la demande, sur le moyen de paiement d'origine
- **Si l'utilisateur a déjà utilisé le service** dans ces 14 jours, Apple peut facturer un montant proportionnel au temps utilisé

### Autres cas de remboursement
Apple accepte aussi les remboursements au cas par cas pour :
- **Erreur d'achat** (mauvaise app, achat accidentel d'un enfant)
- **App non fonctionnelle** ou très différente de sa description
- **Achat non autorisé**

Dans ces cas, Apple décide seul d'accorder ou non le remboursement.

### Impact sur le développeur
- Le montant remboursé est **déduit de tes prochains virements** Apple
- Apple ne te communique pas l'identité de l'utilisateur remboursé, seulement le fait que ça s'est produit
- Apple ne bloque pas les utilisateurs qui abusent des remboursements (connue comme limitation de la plateforme)

### Ce que tu peux faire côté app
- Proposer un **essai gratuit** (ex: 7 jours) pour réduire les demandes de remboursement légitimes
- Côté backend : révoquer l'accès Premium dès qu'un remboursement est détecté via les [StoreKit 2 notifications serveur](https://developer.apple.com/documentation/appstoreservernotifications)

---

## Prérequis pour lancer l'app

| Quoi | Prix | Quand |
|------|------|-------|
| **Apple Developer Program** | 99€/an | Avant de tester sur vrai iPhone + soumettre l'App Store |
| **VPS OVH** | ~5-7€/mois | Avant de dev les features qui appellent l'API backend |
| **Stripe** | ❌ jamais | StoreKit 2 gère les paiements iOS |
| **Micro-entreprise** | Gratuit | Uniquement si revenus > 1 000€/an |
