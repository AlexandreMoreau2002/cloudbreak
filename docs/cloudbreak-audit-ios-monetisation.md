# Cloudbreak — Audit lancement iOS et monétisation

> Note de travail révisable — 26 juillet 2026

## Décision centrale

Ne pas chercher à sortir toute la roadmap. La 1.0 doit vendre une promesse étroite — un verdict météo utile et fiable — avec un abonnement réellement opérationnel.

Les push, Universal Links, partage viral et fonctions de croissance peuvent suivre en 1.1.

## Diagnostic

Cloudbreak est proche d’une bêta fonctionnelle : authentification Supabase, données de sommets, recherche, favoris, ScoreCard, quota freemium, paywall, suppression de compte, onboarding, mode offline-light et validation terrain sont déjà présents ou largement préparés.

Le risque principal n’est plus le cœur du produit météo. Il est commercial et opérationnel : le paywall existe avant le paiement réel, le badge « essai gratuit 7 jours » peut être trompeur, et la chaîne production / domaine / conformité / analytics n’est pas fermée.

### Risques critiques

- StoreKit 2 réel non implémenté.
- Badge « essai gratuit 7 jours » affiché sans mécanisme garanti.
- VPS, domaine et production à finaliser.
- PostHog réel non connecté.
- JWT Supabase encore stocké dans AsyncStorage.
- Identité légale, date des documents et email support incomplets.
- Push, deep links et Universal Links dépendants d’Apple Developer et du domaine.

## 1. Chemin minimal réaliste vers une 1.0 publiable

1. Backend de production stable : API, PostgreSQL, Redis, HTTPS, sauvegardes et monitoring.
2. Projet Supabase production séparé du développement.
3. StoreKit 2 fonctionnel : produits mensuel et annuel, achat, restauration, expiration et état Premium fiable.
4. Trial de 7 jours réellement configuré, ou retrait complet de toute mention de trial.
5. Pages légales publiques cohérentes avec les données réellement collectées.
6. Migration des tokens de session vers SecureStore.
7. QA sur appareil physique et TestFlight, avec parcours quota, paywall, achat et restauration.
8. Fiche App Store complète : prix, abonnements, privacy labels, screenshots, support et notes de review.

La 1.0 peut sortir sans push, Universal Links, partage avancé et fonctions de croissance si ces éléments mettent en danger le calendrier. Il faut alors retirer ces promesses de la fiche App Store et des screenshots.

## 2. À faire absolument avant TestFlight

### Bloquants techniques

- Compte Apple Developer actif, Bundle ID, certificats, provisioning et build EAS signé.
- Backend de production accessible depuis l’app avec secrets séparés du développement.
- Supabase production, HTTPS et variables d’environnement vérifiés.
- Parcours login, score, quota, paywall et restauration testés.
- Gestion des erreurs réseau, backend indisponible et cache expiré.

### Conditions d’une bêta utile

- 10 à 30 testeurs ciblés, avec scénarios de test écrits.
- Email de feedback actif.
- Mesure de l’installation, de l’onboarding, du premier score, du quota et du paywall.
- Aucun crash ou blocage sur les parcours fondamentaux.

Pour les testeurs externes, Apple demande des informations de bêta et soumet le premier build à TestFlight App Review.

## 3. À faire absolument avant la review Apple

- StoreKit 2 réel, ou retrait complet de la monétisation visible.
- Produits d’abonnement créés et configurés dans App Store Connect.
- Achat, restauration, expiration, annulation et interruption de paiement testés en Sandbox/TestFlight.
- Trial 7 jours réellement configuré et affiché aux utilisateurs éligibles uniquement.
- Prix, durée et conditions de renouvellement affichés clairement avant achat.
- Privacy Policy et CGU accessibles dans l’app et via des URLs publiques.
- Suppression de compte directement accessible dans l’app.
- App Privacy labels cohérents avec Supabase, analytics, localisation et données terrain.
- Email support réel, identité légale vérifiée et liens sans placeholder.
- Screenshots et description limités aux fonctions effectivement disponibles.
- Notes de review détaillées avec compte de test et parcours Premium.

Apple exige notamment que les abonnements décrivent clairement leur valeur et que les informations affichées ne soient pas trompeuses. Apple impose également la suppression de compte dans l’app lorsqu’un compte peut être créé, ainsi qu’un lien vers la politique de confidentialité dans l’app et les métadonnées.

## 4. Modèle freemium/premium initial

### Gratuit

- 1 check par jour.
- Recherche et favoris.
- Cache offline.
- Validation terrain.
- Pas de publicité.

### Premium

- Checks illimités.
- Favoris sans limite.
- Détails météo avancés.
- Historique utile.
- Alertes push lorsqu’elles sont disponibles.

La validation terrain devrait rester largement accessible : elle améliore le data flywheel et la confiance dans l’algorithme. Elle ne doit pas être artificiellement verrouillée derrière l’abonnement.

## 5. Faut-il conserver un check par jour ?

Oui, pour le premier test commercial, mais comme hypothèse mesurable.

Conditions :

- Une réouverture d’un résultat déjà présent dans le cache ne doit pas consommer de check.
- Le quota doit être expliqué avant le paywall.
- Le bénéfice Premium doit être formulé comme la possibilité de comparer plusieurs sommets et horaires.
- Le compteur doit être visible.

À mesurer après 4 à 6 semaines : plaintes, taux d’abandon, conversion après quota et nombre de sommets comparés.

Si le quota crée surtout de la frustration sans conversion, tester 2 checks par jour.

## 6. Prix et essai gratuit

| Élément | Recommandation |
|---|---|
| Mensuel | 4,99 €/mois |
| Annuel | 44,99 €/an ou 45 €/an |
| Trial | 7 jours uniquement lorsqu’il est réellement configuré via StoreKit |
| Bêta | Codes promotionnels ou accès de test plutôt qu’un système parallèle |

Le ratio annuel équivaut à environ neuf mois de mensuel. Il est attractif sans dévaloriser le produit.

Pour une app saisonnière, 7 jours est une durée suffisante pour tester plusieurs sorties potentielles, mais il ne faut pas l’afficher avant que le mécanisme soit réel.

## 7. Métriques à suivre dès les premiers utilisateurs

### Activation

- Installation → onboarding terminé.
- Premier sommet recherché.
- Premier score consulté.
- Délai jusqu’au premier score.

### Valeur produit

- Checks par utilisateur actif.
- Retour à 7 et 30 jours.
- Favoris ajoutés.
- Validations terrain.
- Taux de validation positive.

### Monétisation

- Paywall affiché.
- Quota atteint.
- Clic CTA.
- Début trial.
- Conversion payante.
- Renouvellement.
- Annulation.
- Remboursement.

### Qualité

- Crash-free users.
- Erreurs 4xx/5xx.
- Latence P50/P95.
- Disponibilité API.
- Erreurs du provider météo.
- Taux de données servies depuis le cache.

Les cinq indicateurs de décision au lancement sont : premier score, deuxième check, conversion Premium, rétention à 30 jours et validation terrain positive.

## 8. Dépendances et travail parallélisable

| Dépendance | Bloque principalement |
|---|---|
| Apple Developer | StoreKit réel, Sandbox/TestFlight, signature, App Store, push APNs |
| VPS | Backend production, PostgreSQL/Redis production, monitoring, CI/CD et tests réalistes |
| Domaine | Pages légales, landing page, liens de partage, Universal Links, AASA et URLs Supabase |
| Aucun blocage externe | QA, SecureStore, retrait du faux trial, rédaction légale, métriques, analytics, algorithme, screenshots et validation terrain |

## Checklist ordonnée

### Phase 1 — Décision produit

- [ ] Confirmer le périmètre 1.0 réduit.
- [ ] Confirmer 4,99 €/mois et 44,99 €/an.
- [ ] Décider trial réel ou aucun trial.
- [ ] Conserver provisoirement 1 check/jour et définir les métriques.
- [ ] Retirer toute promesse de fonction non disponible.

### Phase 2 — Sécurité et conformité

- [ ] Migrer les tokens vers SecureStore.
- [ ] Finaliser identité légale, CGU, Privacy Policy et email support.
- [ ] Réactiver la confirmation email en production.
- [ ] Vérifier suppression de compte et effacement.
- [ ] Déclarer correctement Supabase, PostHog, localisation et usage.

### Phase 3 — Infrastructure

- [ ] Réserver le VPS et le domaine.
- [ ] Déployer API, PostgreSQL, Redis et HTTPS.
- [ ] Configurer backups et monitoring.
- [ ] Créer Supabase production.
- [ ] Tester migrations, secrets et disponibilité.

### Phase 4 — Monétisation

- [ ] Activer Apple Developer.
- [ ] Créer le groupe d’abonnement mensuel/annuel.
- [ ] Configurer le trial uniquement s’il est réel.
- [ ] Implémenter achat, restauration, expiration et entitlement.
- [ ] Tester Sandbox et TestFlight.

### Phase 5 — Bêta et soumission

- [ ] Build signé et QA sur deux iPhone réels.
- [ ] TestFlight interne puis externe.
- [ ] Corriger uniquement les problèmes bloquants.
- [ ] Préparer screenshots, privacy labels et notes de review.
- [ ] Soumettre une version dont les fonctions annoncées existent réellement.

## Scénario réaliste pour un solo dev

| Période | Objectif |
|---|---|
| Semaine 1 | Décision produit, retrait du faux trial, SecureStore, textes légaux, préparation StoreKit |
| Semaines 2–3 | Apple Developer, VPS, domaine, Supabase production, HTTPS, backend et monitoring |
| Semaines 3–4 | StoreKit 2, Sandbox, achat/restauration, premiers builds signés, TestFlight interne |
| Semaines 5–6 | TestFlight externe avec une trentaine de testeurs ciblés, corrections bloquantes |
| Semaines 7–8 | App Store Connect, screenshots, privacy labels, review notes et soumission |

### Scénario de sortie

Une 1.0 centrée sur score + freemium + Premium réel + qualité opérationnelle. Push, Universal Links, partage viral et croissance organique en 1.1.

## Sources et documents de référence

Documents internes consultés :

- `TODO.md`
- `docs/business-legal.md`
- `_bmad-output/planning-artifacts/pre-release-checklist.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/go-to-market.md`
- `_bmad-output/planning-artifacts/aso-landing-page.md`
- `docs/analytics-posthog.md`
- Page Notion « Cloudbreak - mer de nuage »

Sources Apple :

- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
- [Testing subscriptions and IAP in TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testing-subscriptions-and-in-app-purchases-in-testflight/)
- [Introductory offers](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions)
