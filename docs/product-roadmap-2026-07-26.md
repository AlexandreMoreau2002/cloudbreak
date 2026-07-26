# Cloudbreak — Roadmap produit au 26 juillet 2026

## Recommandation exécutive

Cloudbreak doit rester une **app de décision pour savoir si le déplacement vaut le coup**, pas devenir une app météo généraliste.

La priorité n’est pas la croissance. C’est de prouver que le verdict est suffisamment fiable pour mériter la confiance d’un utilisateur qui se lève à 5 h du matin.

Ordre recommandé :

1. Fiabiliser et expliquer le verdict.
2. Instrumenter les validations terrain et mesurer réellement la précision.
3. Rendre l’achat, le support et le fonctionnement en production irréprochables.
4. Lancer avec un périmètre réduit.
5. Ajouter les alertes et le partage seulement après les premiers retours réels.

Les features à repousser sont la carte de prédiction, le feed social, les badges complexes et la gamification. La carte de prédiction géographique éloigne Cloudbreak de sa proposition de valeur centrale et l’amène sur le terrain des apps de cartographie montagne.

## État réel au 26 juillet 2026

- `TODO.md` indique que 6.1 est mergée et que 6.2 reste au backlog.
- Le backend possède déjà la validation oui/non, la persistance des prédictions et les coordonnées GPS, mais pas les photos ni le calcul de précision.
- Le mobile possède l’onboarding, le mode offline-light, les états d’erreur et la permission de géolocalisation.
- StoreKit 2, le VPS de production, les notifications push et le monitoring réel restent des bloqueurs.
- PostHog est instrumenté en stub, sans collecte réelle.
- Le score repose encore sur des poids arbitraires, non calibrés sur des observations terrain.
- La page Notion du 24 juillet confirme que la priorité est la fiabilité de l’algorithme et le retour terrain.
- Les audits backend et mobile sont partiellement obsolètes par rapport à l’état de `TODO.md` et de Notion.

## 1. Proposition de valeur actuelle

La proposition est claire et différenciante :

> « Est-ce que je vais voir une mer de nuage depuis ce sommet, à cette heure ? »

Cloudbreak transforme des données météo complexes, une altitude et une fenêtre horaire en verdict immédiatement actionnable.

Le produit repose sur trois promesses :

1. **Décision** : savoir s’il faut se déplacer.
2. **Compréhension** : expliquer pourquoi le score est bon ou mauvais — promesse encore insuffisamment remplie aujourd’hui.
3. **Confiance** : montrer l’incertitude et apprendre des observations terrain.

Cloudbreak ne vend pas de la donnée météo : il vend une décision.

### Risque principal

Le danger n’est pas qu’un score soit parfois faux. Une prévision météo ne peut pas être exacte à 100 %.

Le danger est d’afficher un pourcentage précis sans pouvoir expliquer :

- comment il a été calibré ;
- sur combien de cas il repose ;
- dans quelles régions il fonctionne bien ;
- dans quelles situations il est peu fiable ;
- si le « 75 % » signifie réellement environ 75 % de réussite.

Le score doit donc être présenté comme un verdict probabiliste expliqué, pas comme une vérité scientifique.

## 2. Story 6.2 — valeur et découpage recommandé

La Story 6.2 a une valeur stratégique supérieure à la plupart des features de croissance :

- elle transforme un algorithme hypothétique en système mesurable ;
- elle permet de détecter les erreurs par zone, altitude et type de situation ;
- elle donne une base pour recalibrer les poids ;
- elle crée une preuve de confiance ;
- elle prépare de futures communications fondées sur des données réelles.

La photo n’est pas la partie la plus importante de la story. La donnée critique est : prédiction originale, résultat oui/non, date et heure, position, sommet, score initial et version de l’algorithme.

### 6.2a — à faire en priorité

- calcul de précision interne par zone ;
- nombre d’observations associé à chaque résultat ;
- précision par niveau de score ;
- versionnement de l’algorithme ;
- endpoint ou tableau de bord admin simple ;
- protection contre les doublons et validations incohérentes.

### 6.2b — après les premières validations

- photo optionnelle ;
- compression et stockage ;
- consentement explicite ;
- suppression RGPD ;
- replay « prédiction vs réalité ».

Ne pas afficher publiquement un taux de précision avant un volume minimal, par exemple 30 observations dans une zone. Un taux de 100 % basé sur 3 validations détruirait la confiance au lieu de la renforcer.

## 3. Roadmap priorisée

## Horizon 1 — maintenant / prochain mois

| Feature | Problème résolu | Impact | Complexité | Dépendances | Métrique de succès | Priorité |
|---|---|---|---|---|---|---|
| 6.2a : précision interne sans photo | Cloudbreak ne sait pas encore si ses prédictions sont réellement bonnes | Crée la boucle d’apprentissage | Moyenne | 6.1, prédictions persistées, version d’algo | 50 validations exploitables, par zone et score | P0 |
| Explication renforcée du verdict | L’utilisateur ne comprend pas toujours pourquoi le score est bas ou nul | Augmente confiance et compréhension | Faible à moyenne | Exposer `cloud_base`, raisons et fraîcheur | Moins de retours « pourquoi 0 ? » | P0 |
| Instrumentation réelle | Les events existent mais ne remontent pas | Permet de comprendre le funnel | Faible à moyenne | Compte PostHog, consentement | Funnel onboarding → prévision → validation exploitable | P0 |
| Observabilité production | Une panne pourrait rester invisible | Protège la confiance | Moyenne | VPS, alertes, logs structurés | Alerte en moins de 2 minutes sur panne | P0 |
| Revue de fiabilité de l’algo | Les poids sont arbitraires | Évite de confondre précision technique et réelle | Moyenne | Cas historiques et observations | 50–100 cas labellisés, faux positifs identifiés | P0 |
| Affichage de `cloud_base` et des facteurs déterminants | Le pourcentage seul est difficile à évaluer | Rend le score auditable | Faible | Exposition API déjà calculée | Hausse de compréhension en test utilisateur | P1 |
| Nettoyage de la promesse payante | L’essai gratuit peut être affiché sans StoreKit réel | Évite rejet Apple et perte de confiance | Faible | StoreKit ou retrait du badge | Aucun élément marketing non fonctionnel | P0 |

Le livrable principal du mois doit être un **reliability pack** : validations, cas de test, explications du score, PostHog réel, monitoring et mesure des erreurs.

## Horizon 2 — avant lancement App Store

| Feature | Problème résolu | Impact | Complexité | Dépendances | Métrique de succès | Priorité |
|---|---|---|---|---|---|---|
| StoreKit 2 réel | Le produit ne peut pas vendre proprement son abonnement | Rend le modèle économique réel et conforme | Élevée | Apple Developer, App Store Connect, backend | Achat, restauration et expiration testés sur appareil réel | P0 |
| Production stable | Le produit local n’est pas encore une expérience publique | Condition de base du lancement | Moyenne à élevée | VPS, DNS, TLS, CI/CD, secrets | Disponibilité 99 %, rollback possible | P0 |
| Validation terrain 6.1 + 6.2a | Les premiers utilisateurs doivent confirmer les prévisions | Transforme le lancement en collecte d’apprentissage | Moyenne | Backend et mobile déjà mergés | 25–30 % des utilisateurs actifs valident une sortie observée | P0 |
| Photo optionnelle 6.2b | Une validation oui/non manque parfois de preuve | Prépare la preuve visuelle et le replay | Moyenne | Stockage, compression, permissions, RGPD | Aucun blocage quand la photo est refusée | P1 |
| Sécurité et confidentialité de release | JWT en clair dans AsyncStorage et éléments légaux incomplets | Réduit risques de sécurité et de rejet | Moyenne | SecureStore, support email, identité légale | Aucun problème critique lors de l’audit release | P0 |
| QA terrain et TestFlight | Réseau, localisation et météo réels peuvent révéler des défauts | Réduit les mauvaises premières impressions | Moyenne | Apple Developer, appareils physiques | 30 bêta-testeurs, zéro bug critique | P0 |
| Historique minimal des prédictions et validations | L’utilisateur ne voit pas ce qui a été prédit puis observé | Rend la transparence concrète | Moyenne | Modèle predictions/validations | 30 % des utilisateurs consultent l’historique après validation | P1 |

Avant l’App Store, il faut garantir : paiement réel, absence de promesse fictive, fraîcheur des données, erreurs compréhensibles, support joignable, validations enregistrées et capacité à mesurer les erreurs.

## Horizon 3 — après les premiers utilisateurs

| Feature | Problème résolu | Impact | Complexité | Dépendances | Métrique de succès | Priorité |
|---|---|---|---|---|---|---|
| Alertes sur sommets favoris | L’utilisateur doit ouvrir l’app chaque jour | Forte rétention et justification de l’abonnement | Élevée | StoreKit, push, cron, seuils fiables | Activation, ouverture, faible désactivation | P1 |
| Veille « prochaine bonne fenêtre » | L’utilisateur ne sait pas quand regarder l’app | Transforme Cloudbreak en assistant de planification | Moyenne à élevée | Alertes fiables, forecast multi-jours | Veilles activées et sorties planifiées | P1 |
| Carte de prédiction partageable | L’utilisateur veut montrer sa sortie | Acquisition organique potentielle | Faible à moyenne | Score stable, design, partage natif | Partages et installations issues des liens | P1 |
| Replay prédiction vs réalité | La valeur reste abstraite après la sortie | Preuve sociale et confiance | Moyenne | Photo, historique, validation | Replays créés, partagés et validations répétées | P1 |
| Historique enrichi | L’utilisateur veut savoir si Cloudbreak lui a déjà été utile | Rétention et transparence | Moyenne | Prédictions et validations propres | Consultations mensuelles de l’historique | P1 |
| Alertes régionales | Découvrir une opportunité ailleurs que sur ses favoris | Découverte et usage fréquent | Élevée | Carte de zones, coût de calcul, anti-spam | Clics transformés en consultations de sommets | P2 |
| Notification GPS de validation | L’utilisateur oublie de confirmer sur place | Augmente la collecte de données | Moyenne à élevée | Permissions, geofencing, batterie | Validations déclenchées, faible désactivation | P2 |
| Parrainage | Le produit a besoin d’un canal organique | Acquisition et rétention | Moyenne | Paiement, anti-abus, première validation | Invitations qualifiées et conversions | P2 |
| Badges simples liés aux validations | Les validations sont utiles mais peu gratifiantes | Rétention légère | Faible | Historique et validations fiables | Progression des validations sans baisse de qualité | P3 |
| Webcams comme contrôle interne | Comparer les prédictions à une observation externe | Calibration, pas nécessairement UX | Moyenne et opérationnelle | Sources stables, collecte | 50 cas contrôlés indépendamment | P1 interne |

## 4. Alertes, veille, partage, carte et historique

### Alertes sur favoris

Les alertes sont une attente concurrentielle. Windy propose déjà des favoris et des alertes paramétrables ; Mountain-Forecast propose également des alertes de conditions optimales.

Pour Cloudbreak, elles doivent porter uniquement sur une opportunité de mer de nuage : favoris, une alerte par jour maximum, seuil explicite et désactivation simple.

### Veille

La veille répond directement au besoin :

> « Dis-moi quand cela vaut la peine de regarder ou de partir. »

Elle peut devenir le cœur de la rétention, mais seulement si les faux positifs sont maîtrisés.

### Partage

La carte de prédiction partageable est probablement la meilleure feature de croissance à court terme : faible complexité et cohérence avec les photographes et créateurs.

Elle devrait montrer sommet, date, heure, verdict, score, stabilité et éventuellement la mention « prévision, pas garantie ».

### Carte de prédiction géographique

À repousser fortement. PeakVisor occupe déjà le terrain des cartes 3D, de l’identification des sommets et du partage d’expériences ; Mountain-Forecast propose des cartes topographiques et des prévisions multi-altitudes.

À terme, une carte Cloudbreak ne devrait exister que pour répondre à une question spécialisée :

> « Où sont les meilleures chances de mer de nuage ce week-end ? »

Elle ne doit pas devenir une carte générale de randonnée.

## 5. Features à faire, repousser ou abandonner

### À faire

- 6.2a : précision interne par zone et niveau de score.
- Explication des raisons du verdict.
- Exposition de `cloud_base` et fraîcheur des données.
- StoreKit 2 réel.
- Production, monitoring, sécurité et conformité.
- QA terrain.
- Historique minimal des prédictions et validations.
- Photo optionnelle 6.2b.
- Alertes sur favoris après les premiers retours.
- Carte de partage après les premières prédictions validées.

### À repousser

- Veille régionale.
- Notification GPS.
- Parrainage.
- Badges et niveaux.
- Replay si le stockage photo n’est pas encore mûr.
- Intégration webcam côté utilisateur.
- Contribution de nouveaux spots.
- Feed communautaire.
- Récap annuel.

### À abandonner pour le moment

- Carte météo/prédiction généraliste.
- Feed social par sommet.
- Leaderboard.
- Streaks quotidiens.
- Gamification lourde.
- Android avant validation du modèle iOS.
- Expansion internationale avant d’avoir une précision démontrée sur les Alpes et les Pyrénées.

## Décision finale

### Maintenant

Construire la preuve de fiabilité : validations, précision interne, explications, instrumentation et monitoring.

### Avant App Store

Rendre le produit réellement publiable : StoreKit 2, production, sécurité, conformité, QA et un minimum d’historique.

### Après les premiers utilisateurs

Ajouter les alertes sur favoris, puis le partage et la veille. Utiliser les données réelles pour décider ensuite du parrainage, du replay et de la gamification.

Le passage à la croissance devrait attendre :

- au moins 50 validations exploitables ;
- une précision mesurée par segment ;
- aucun problème critique de paiement ou de données ;
- des utilisateurs qui reviennent spontanément consulter une nouvelle fenêtre ;
- des retours confirmant que la question centrale reste « est-ce que ça vaut le coup d’y aller ? ».

Tant que ces conditions ne sont pas réunies, ajouter des features de croissance risque surtout de distribuer une promesse encore insuffisamment prouvée.

## Sources

- [TODO.md](../TODO.md)
- [PRD](../_bmad-output/planning-artifacts/prd.md)
- [Epics](../_bmad-output/planning-artifacts/epics.md)
- [Go-to-market](../_bmad-output/planning-artifacts/go-to-market.md)
- [Audit produit backend](../backend/docs/product-audit.md)
- [Audit produit mobile](../mobile/docs/product-audit.md)
- [Page Notion Cloudbreak](https://app.notion.com/p/325964bda18580358585ff14ef1f76c6)
- [Windy — fonctionnalités Premium](https://www.windy.com/articles/23730)
- [PeakVisor — manuel](https://peakvisor.com/tutorial_en.html)
- [Mountain-Forecast — fonctionnalités](https://www.mountain-forecast.com/)
