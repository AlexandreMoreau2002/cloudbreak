# Cloudbreak — Plan marketing et acquisition

> Document maître pour obtenir les premiers utilisateurs, apprendre avec eux et construire les premières preuves produit.
>
> Dernière mise à jour : 2026-07-26
>
> Ce document est opérationnel. Les décisions stratégiques détaillées restent dans les documents sources référencés en fin de page.

## 1. Objectif

Obtenir les premiers utilisateurs réellement concernés par la mer de nuage, les amener à utiliser Cloudbreak avant une sortie, puis recueillir des validations terrain exploitables.

La priorité n’est pas de maximiser les téléchargements. La priorité est de construire la boucle suivante :

> prédiction → sortie réelle → validation → preuve → nouvel utilisateur.

## 2. Positionnement de départ

### Promesse

> Avant de partir à 5 h, sache si le spectacle t’attend.

Cloudbreak transforme des données météo complexes en une réponse claire sur la probabilité d’observer une mer de nuage depuis un sommet précis, à une date et une heure données.

### Cible prioritaire

1. Photographes paysage.
2. Créateurs drone et vidéo outdoor.
3. Randonneurs expérimentés.
4. Alpinistes et passionnés de météo montagne.

Le photographe paysage est le premier segment à servir : douleur forte, planification en avance, capacité à produire des images et propension à payer. Les créateurs drone sont un relais de visibilité, mais Cloudbreak ne promet pas la sécurité ou la légalité d’un vol.

### Ce que Cloudbreak n’est pas

- une app météo généraliste ;
- une app d’itinéraire ou de cartographie ;
- une garantie de voir une mer de nuage ;
- une preuve de précision statistique tant que les validations sont insuffisantes.

### Bio courte

> Prévois les mers de nuage depuis ton sommet. Score, fenêtre optimale, décision claire. App iOS pour photographes et aventuriers.

## 3. Règle de communication

Toujours présenter le score comme une probabilité et expliquer l’incertitude.

À utiliser :

- « forte probabilité » ;
- « ça peut le faire » ;
- « conditions défavorables » ;
- « prévision à confirmer » ;
- « observation terrain » ;
- « résultats observés sur X cas ».

À éviter avant d’avoir une vraie preuve :

- « fiable » ;
- « précis à X % » sans volume et méthode ;
- « première » ou « seule app » ;
- « ne rate plus jamais une mer de nuage » ;
- screenshots ou témoignages fabriqués ;
- promesse de fonctionnalités non disponibles.

## 4. Conditions de lancement

Le lancement public doit attendre que les points suivants soient traités :

- compte Apple Developer et distribution réelle ;
- StoreKit 2 opérationnel ou suppression des promesses d’essai ;
- production stable et support joignable ;
- pages légales et confidentialité finalisées ;
- analytics réels, pas seulement le stub PostHog ;
- validation terrain utilisable ;
- premiers résultats documentés ;
- aucun bug critique sur recherche, score, offline et onboarding ;
- screenshots App Store correspondant aux fonctionnalités réellement disponibles.

Seuil recommandé avant lancement contrôlé : 20 à 30 utilisateurs ayant consulté une prédiction, 10 à 15 observations terrain documentées et plusieurs niveaux de score représentés.

## 5. Plan en trois phases

### Phase 1 — Préparer la preuve et recruter

Objectif : 15 à 25 testeurs actifs.

Actions :

- sélectionner 5 à 10 sommets représentatifs ;
- recruter des photographes dans le réseau personnel, Instagram et Camptocamp ;
- créer un tableau de suivi des prédictions ;
- obtenir des validations à différents niveaux de score ;
- publier deux contenus par semaine ;
- tester les formulations « météo », « prédiction » et « décision » ;
- préparer une landing page et une liste d’attente distincte des comptes utilisateurs.

Livrables : protocole de validation, premiers cas documentés, premiers retours qualitatifs et landing page minimale.

### Phase 2 — Construire la crédibilité

Objectif : 30 à 50 validations documentées, ou assez de cas pour repérer les biais évidents.

Actions :

- publier un premier bilan incluant les échecs ;
- publier un retour technique sur Camptocamp ;
- lancer un test avec une section CAF ;
- contacter 5 à 10 micro-créateurs photo ou drone ;
- créer les formats récurrents « prévision / réalité » ;
- préparer les screenshots et la description App Store ;
- activer les analytics et mesurer le funnel réel.

### Phase 3 — Lancement contrôlé

Objectif : obtenir des utilisateurs qualifiés et comprendre leur parcours.

Actions :

- inviter d’abord les bêta-testeurs ;
- coordonner Camptocamp, quelques créateurs et Instagram ;
- mesurer installation → première consultation → deuxième consultation → validation ;
- demander les avis après une expérience utile ;
- publier un bilan terrain mensuel ;
- contacter la presse seulement avec des données et des cas concrets.

## 6. Canaux et actions

### TikTok

Rôle : découverte et démonstration visuelle.

Formats :

- prédiction de la veille puis résultat du matin ;
- comparaison de deux sommets ;
- « pourquoi un ciel gris peut être une bonne nouvelle » ;
- coulisses de l’algorithme expliquées simplement ;
- prédiction ratée et ce qui sera amélioré.

Cadence initiale : deux vidéos par semaine, réutilisables en Reels.

### Instagram

Rôle : portfolio, confiance et relation avec les photographes.

Formats :

- photos de mers de nuage ;
- Reels issus de TikTok ;
- carrousels « prévision / réalité » ;
- stories terrain ;
- retours de bêta-testeurs.

Le compte doit ressembler à une galerie de phénomènes montagneux utilisant Cloudbreak, pas à une suite de publicités produit.

### Camptocamp

Rôle : recrutement de testeurs sérieux et crédibilité technique.

Méthode :

1. participer à des discussions existantes sur les conditions et inversions ;
2. expliquer que Cloudbreak est développé en solo ;
3. proposer un test limité sur quelques sommets ;
4. revenir publier les résultats, y compris les erreurs.

Éviter les posts promotionnels répétés.

### CAF

Rôle : accès local à des pratiquants réguliers.

Commencer avec 3 à 5 sections proches des zones de test. Proposer un test collectif, un accès bêta et un compte-rendu utile pour leur newsletter.

### Presse outdoor

Rôle : validation externe, après les premières preuves.

Préparer : cinq lignes de présentation, trois screenshots, un accès de test, deux ou trois cas terrain et une méthode de mesure.

Angle recommandé :

> Peut-on prévoir une mer de nuage depuis un sommet précis ?

### SEO et landing page

La landing page doit expliquer en quelques secondes :

1. le problème : partir tôt sans savoir ;
2. la solution : sommet, date, heure, verdict ;
3. la preuve : observations terrain, dès qu’elles existent ;
4. l’action : télécharger ou rejoindre la liste d’attente.

Requêtes prioritaires : « prévision mer de nuage », « application mer de nuage », « météo mer de nuage sommet », « inversion thermique montagne ».

### App Store

Rôle : conversion et crédibilité.

Priorité des screenshots :

1. verdict et décision ;
2. sommet, date et fenêtre optimale ;
3. explication des facteurs ;
4. mode offline et onboarding ;
5. validations terrain réelles.

## 7. Contenus à produire

### Formats récurrents

- **Prévision / réalité** : score, lieu, heure, photo et résultat.
- **Journal de sortie** : pourquoi partir, ce qui a été observé, ce qui était faux.
- **Comprendre le phénomène** : inversion, humidité, base des nuages, vent.
- **Choisir son sommet** : comparaison de plusieurs spots proches.
- **Construire Cloudbreak** : développement solo, tests et décisions produit.

### Preuve terrain

Chaque observation doit idéalement conserver :

- sommet et coordonnées ;
- date et heure de la prédiction ;
- délai avant observation ;
- score et verdict ;
- fenêtre optimale ;
- observation oui/non/indéterminée ;
- photo si disponible ;
- version de l’algorithme.

Publier des lots, pas uniquement des réussites :

> 23 prédictions observées : 14 confirmées, 6 infirmées, 3 indéterminées.

## 8. Idées à explorer

Ces idées ne sont pas encore des engagements de développement :

- demander la pratique principale pendant l’onboarding ;
- adapter les exemples selon photo, randonnée ou alpinisme ;
- publier un sondage dans les groupes montagne ;
- créer une liste d’attente avec consentement explicite ;
- permettre de signaler un sommet absent ;
- créer une carte de prédiction partageable ;
- créer un replay « prédiction vs réalité » avec photo ;
- proposer une newsletter de pré-lancement ;
- contacter des micro-créateurs avec accès Premium ;
- organiser une campagne de tests par massif ;
- créer un récapitulatif mensuel des validations.

À repousser : publicité payante, gros influenceurs, feed social, gamification lourde, expansion internationale et Product Hunt avant preuve produit.

## 9. Scripts de contact

### Photographe ou créateur

> Bonjour [prénom], je développe Cloudbreak, une app iOS qui estime la probabilité d’observer une mer de nuage depuis un sommet précis. Je cherche quelques photographes pour tester des prévisions réelles avant le lancement. L’idée est de comparer le score avec ce qui est observé sur le terrain, y compris quand la prévision se trompe. Est-ce que cela pourrait t’intéresser sur un ou deux spots que tu connais ?

### Camptocamp ou groupe montagne

> Bonjour, je suis développeur solo de Cloudbreak, une app qui transforme les données météo en verdict probabiliste pour observer une mer de nuage depuis un sommet. Je cherche à documenter les premiers tests terrain de manière transparente, réussites et échecs compris. Je peux partager les résultats sur quelques sommets et recueillir les retours de pratiquants intéressés.

### Section CAF

> Bonjour, je développe Cloudbreak, une app iOS qui aide à décider si les conditions valent une sortie pour observer une mer de nuage depuis un sommet. Je cherche quelques membres pour tester les prévisions sur le terrain et me donner un retour honnête. En échange, je peux fournir un accès bêta et un compte-rendu des résultats pour votre section. Avez-vous un canal adapté pour proposer ce test ?

## 10. Métriques

### Métrique principale

Nombre de sessions de prédiction qui aboutissent à une observation terrain documentée.

### Acquisition

- vues qualifiées ;
- visites de profil ;
- clics landing page ;
- clics App Store ;
- téléchargements par canal ;
- inscriptions liste d’attente ;
- réponses aux prises de contact.

### Activation

- installation → première consultation ;
- première consultation → sommet favori ;
- première consultation → deuxième consultation ;
- utilisateurs qui comprennent le verdict ;
- délai avant première validation.

### Preuve produit

- prédictions observées ;
- validations par semaine ;
- confirmation par niveau de score ;
- faux positifs sur scores élevés ;
- résultats par massif et saison ;
- proportion de résultats indéterminés ;
- validations avec photo.

### Business, lorsque disponible

- conversion gratuit → Premium ;
- conversion essai → payant ;
- revenu mensuel ;
- rétention ;
- désabonnements ;
- valeur d’un utilisateur payant.

## 11. Suivi hebdomadaire

À compléter chaque semaine :

```text
Semaine du :

Objectif principal :

Actions réalisées :
- [ ]
- [ ]
- [ ]

Nouveaux contacts :
Testeurs actifs :
Prédictions observées :
Validations reçues :
Contenus publiés :
Visites / téléchargements / activations :

Ce qui a fonctionné :

Ce qui n’a pas fonctionné :

Décision pour la semaine suivante :
```

## 12. Sources et documents liés

- [`_bmad-output/planning-artifacts/go-to-market.md`](../_bmad-output/planning-artifacts/go-to-market.md) — stratégie marketing initiale.
- [`_bmad-output/planning-artifacts/aso-landing-page.md`](../_bmad-output/planning-artifacts/aso-landing-page.md) — ASO, landing page et SEO.
- [`docs/marketing-positioning-2026-07-26.md`](marketing-positioning-2026-07-26.md) — analyse détaillée du positionnement et du plan 90 jours.
- [`docs/product-ideas.md`](product-ideas.md) — idées produit, acquisition et newsletter.
- [`docs/product-roadmap-2026-07-26.md`](product-roadmap-2026-07-26.md) — priorités produit conditionnant le lancement.
- [`TODO.md`](../TODO.md) — blocages et état réel d’exécution.
- [Page Notion Cloudbreak](https://app.notion.com/p/325964bda18580358585ff14ef1f76c6) — source parallèle produit/projet.
