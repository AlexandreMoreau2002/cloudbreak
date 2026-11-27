# PostHog — audit produit après publication de la 1.0.2

Date : 2026-11-27. **Phase initiale : audit de code avant connexion PostHog.**

> **Blocage initial levé pendant la reprise du même jour.** La connexion MCP est authentifiée,
> le projet Cloudbreak Production (353557) a été lu et six analyses ont été créées et vérifiées.
> Voir la [configuration finale](configuration-production-2026-11-27.md). Les statuts « non vérifié »
> et « aucune création » ci-dessous décrivent la phase initiale, pas le résultat de cette reprise.

## 1. Faits, preuves et inconnues

| Sujet | Constat | Niveau de preuve |
|---|---|---|
| Publication mobile | 1.0.2 / build 12 publiée sur l'App Store | Confirmé par Alexandre dans la demande ; déjà inscrit dans les modifications locales préexistantes du TODO et de la roadmap. Pas de nouvelle lecture App Store Connect pendant cet audit. |
| Variables prod | Décision du 2026-11-21 : variables posées dans Dokploy prod et EAS `production` ; TODO du 2026-11-26 : même clé backend/mobile | Historique du dépôt (`observability-testflight-setup.md`, `versions.md`, TODO), pas de relecture distante des variables aujourd'hui. |
| Accès au plugin | Aucun outil PostHog exposé, à deux vérifications pendant l'audit | Le catalogue trouve PostHog (`status: ENABLED`, `installation_policy: AVAILABLE`) mais renvoie **`installed: false`** dans cet environnement. Cela contredit l'installation signalée ; ne prouve pas son absence dans un autre chat ou compte. |
| Projet prod | Nom, région, ID et URL **non vérifiés** | L'ancien nom « Product Analytics » n'est pas une preuve de destination actuelle. |
| Réception | Événements, propriétés SDK, dates et volumes **non vérifiés** | Aucune requête au projet. « Non vérifié » ne signifie ni « absent » ni « zéro ». |
| Existant | Dashboards, insights, funnels et doublons **non inventoriés** | Lecture distante indisponible. |
| Créations | **Aucune création ni modification dans PostHog** | Aucun lien d'analyse à fournir. Les définitions ci-dessous restent des propositions. |
| Confidentialité | Filtres explicites et options de collecte désactivée présents dans le code | Réglages du projet et données effectivement stockées non inspectés. |

Le blocage concerne l'accès de gestion/lecture au projet. La clé de capture embarquée dans
l'app ne donne pas cet accès et ne doit pas être utilisée comme substitut ni copiée dans ce rapport.
Rendre les outils du plugin accessibles dans ce chat (installation/connexion/chargement à vérifier
côté application), puis reprendre la recette de la section 7. Ne pas partager de clé dans le chat.

### Périmètre du code inspecté

- Racine : `1e85595`, avec **TODO et roadmap déjà modifiés avant cet audit**, modifications conservées.
- Mobile : checkout `develop` à `2ee2c0d` ; `git diff 2ee2c0d a1ee0f9 -- src` est vide : le code
  applicatif inspecté correspond aussi à la release 1.0.2 locale. Cela ne vérifie pas les variables
  réellement incorporées dans le binaire EAS distribué.
- Backend : `a8704c8` ; `git diff v1.2.0 HEAD -- app` est vide. Le code applicatif inspecté est
  celui du tag local 1.2.0, sans nouvelle vérification du déploiement distant.
- Le `main` mobile local finit à `05df0fe` (1.0.1), aucun tag local `v1.0.2`.
  Le merge/tag/push distant restent à vérifier ; aucun fetch, commit, merge, tag ou push effectué.
- Le graphe MCP a été consulté en premier ; sa recherche `analytics` ne trouvait aucun nœud.
  L'audit a donc utilisé les sources et leurs appelants directement.

## 2. Ce que les identités permettent réellement

```text
mobile : SDK PostHog -> distinct_id anonyme conservé par le SDK -> événements UI
                                      X pas de pont
backend : JWT Supabase.sub -> distinct_id UUID Supabase -> événements métier
```

`mobile/src/services/analytics.ts` expose seulement `track()`. Aucun appel applicatif à
`identify`, `alias`, `getDistinctId` ni au reset PostHog n'a été trouvé. `AuthContext` gère les
sessions Supabase, les upgrades invité -> permanent, les connexions et les suppressions sans
mettre à jour l'identité PostHog. Le header d'installation utilisé pour le quota anonyme n'est
pas consommé comme identité analytics par le backend. `addTracingHeaders: []` ne fournit pas de pont.

Conséquences : pas de funnel UI -> backend fiable, pas d'addition des uniques des deux sources,
pas de suivi cross-device des événements UI. Sur un appareil, changement de compte et déconnexion
ne changent pas explicitement l'identifiant PostHog : parler d'**identifiants mobiles**, pas de
personnes uniques. Une suppression de compte ne démontre pas une suppression des événements
PostHog déjà stockés ; aucune API d'effacement PostHog n'est appelée dans ce parcours.

Les profils sont volontairement désactivés : mobile `personProfiles: 'never'`, backend
`$process_person_profile: false`. Les agrégats d'événements restent exploitables ; les propriétés
de personne ne constituent pas une segmentation disponible. Dans le SDK local
`@posthog/core/dist/posthog-core.js`, `identify()` passe par `_requirePersonProcessing()` :
ajouter simplement `identify(SupabaseId)` ne résout pas le rapprochement avec le mode `never`.
Il faut tester une stratégie d'identifiant pseudonyme commun compatible avec cette décision,
et les transitions invité/compte/déconnexion, avant toute modification.

Sources officielles consultées : [événements sans profil](https://posthog.com/docs/data/anonymous-vs-identified-events),
[référence React Native](https://posthog.com/docs/libraries/react-native/reference),
[funnels et filtres de personne](https://posthog.com/docs/product-analytics/funnels).

## 3. Inventaire statique : prévu et appelé, réception inconnue

Les propriétés ci-dessous sont les propriétés métier autorisées, pas une liste exhaustive des
métadonnées ajoutées par les SDK. Ces métadonnées doivent être contrôlées dans les données reçues.
Les filtres valident les valeurs présentes mais n'imposent pas toutes les propriétés : une propriété
autorisée absente peut donc manquer sur un événement accepté.

### Mobile : 28 noms autorisés et appelés

| Événements | Propriétés métier autorisées / sens |
|---|---|
| `onboarding_step_viewed` | `step` 1..4, au montage des slides ; remontage possible |
| `onboarding_complete` | aucune ; appel à la fin du flow, avant la sauvegarde locale best-effort |
| `onboarding_permission_result` | `type=location`, `granted` ; attention au cas notifications ci-dessous |
| `app_foregrounded`, `app_backgrounded` | durée bornée `session_duration_ms` sur background ; montage initial inclus dans foreground |
| `search_performed` | longueur de recherche et nombre de résultats, jamais le texte ; requêtes debouncées, pas un événement « première recherche » |
| `peak_selected` | `peak_id`, `source` parmi onboarding/search/favorites/home_favorites |
| `score_date_changed` | `date`, `method=tap/swipe` ; interaction, pas un nouveau check |
| `score_hour_changed` | `hour`, `verdict` ; interaction, pas un nouveau check |
| `score_why_opened` | `peak_id` |
| `forecast_shared` | `peak_id` ; intention d'ouvrir le partage, pas publication prouvée |
| `terrain_validation_opened` | `peak_id`, `source=manual` ; ouverture, pas validation enregistrée |
| `offline_mode_shown` | âge du cache ; effet d'affichage, pas taux global de cache |
| `quota_badge_viewed`, `quota_dismissed` | `peak_id` ; interactions UI |
| `paywall_opened` | `trigger=quota/profile_banner/home_badge/unknown` ; demande d'ouverture dans le contexte, pas preuve de visibilité native |
| `paywall_dismissed` | aucune ; appel de fermeture, pas motif d'abandon |
| `billing_period_selected`, `plan_selected` | `period=monthly/annual` ; `plan_selected` précède `onSelectPlan`, qui peut demander un compte au lieu de lancer StoreKit |
| `restore_purchases_clicked` | aucune ; clic, pas succès de restauration |
| `signed_out`, `delete_account_initiated` | aucune ; intentions, pas confirmations |
| `theme_toggled`, `language_toggled` | `scheme`, `locale` enums |
| `newsletter_consent_toggled` | `opted_in` ; intention UI, pas preuve de persistance du consentement |
| `location_settings_opened`, `notification_settings_opened` | aucune |
| `legal_link_opened` | `link_type=privacy/cgu/support/other` |

**Ambiguïté permission** : `NotificationsSlide` appelle `onboarding_permission_result` avec
`granted` seulement. L'événement est accepté sans `type`. `LocationSlide` ajoute `type=location`.
Ne pas agréger les deux comme des permissions de localisation, ni interpréter un `type` absent
comme une localisation refusée. Ajouter un type explicite `notifications` nécessite une évolution
de la liste blanche et une future version mobile.

`auth_submitted` et `auth_mode_toggled` apparaissent dans la doc historique 1.7, mais ne sont pas
dans la liste blanche actuelle et aucun appel actuel n'a été trouvé pour ces noms. Il n'existe
pas de confirmation analytics d'inscription/connexion. `signed_out` ne remplace pas ces événements.

### Backend : 9 noms autorisés et appelés

| Événement | Propriétés métier | Déclenchement / limite |
|---|---|---|
| `score_calculated` | `peak_id`, `plan`, `score`, `verdict` | `GET /score`, calcul avant la persistance best-effort et la réception/présentation mobile |
| `score_week_calculated` | `peak_id`, `plan`, `cell_count` 0..63 | `GET /score/week`, un événement pour le lot de 7 jours × 9 heures ; émis même si la persistance échoue |
| `quota_exceeded` | `peak_id`, `plan` | refus quota ; plusieurs tentatives possibles ; le rate-limit est distinct |
| `quota_bypassed` | `plan` | droit Premium actif avant le calcul, sans preuve de paiement (trial ou Premium offert possibles) |
| `favorite_added`, `favorite_removed` | `peak_id` | après commit DB ; événements métier, pas état total du stock de favoris |
| `favorite_alert_sent` | `peak_id`, `score` | succès du service d'envoi ; pas preuve de livraison, lecture ou clic push |
| `terrain_validated` | `prediction_id`, `result` booléen | après commit DB ; aucun `peak_id`, verdict de prévision ni région dans cet événement |
| `account_deleted` | aucune | parcours de suppression du compte ; pas effacement PostHog attesté |

Les plans acceptés incluent encore `pro` pour compatibilité ; ce n'est pas une nouvelle offre.
Le mobile charge normalement `/score/week` via `useWeekData`, avec un cache local de **3 h**.
Changer date/heure dans les données déjà chargées, ou revenir au cache, ne calcule pas de nouveau
lot. Ne pas multiplier le nombre de lots par 63 pour obtenir des consultations, ni additionner
les calculs à des interactions UI pour construire les « checks ».

Les adaptateurs n'ajoutent pas de dimension métier `environment`, `release`, `build`,
`is_test`, `is_anonymous`, `origin` ou `apple_environment`. Des métadonnées SDK peuvent exister,
mais leurs noms, leur présence et leur fiabilité n'ont pas été observés. Une version 1.0.2 ne
distingue pas à elle seule App Store/TestFlight ; un backend prod peut accepter Apple Sandbox.

## 4. Matrice des besoins

Toutes les possibilités ci-dessous restent conditionnées à une réception contrôlée et à un
périmètre prod démontré. Aucun résultat numérique produit pendant cet audit.

| Besoin | Mesure possible avec le code actuel | Manque / action concrète |
|---|---|---|
| Installation -> onboarding | progression des steps 1..4 -> complete, côté mobile seulement | pas d'installation/first-open dédié ; aucun rattrapage de l'onboarding terminé avant l'instrumentation |
| Première recherche / premier sommet | recherche puis sélection `source=search` | pas nécessairement la première de la vie utilisateur, ni un clic associé à une recherche précise |
| Premier score et délai | calculs backend seulement, explication UI comme interaction distincte | `score_viewed` mobile, déclenché lorsque le score devient visible (réseau/cache), relié au début mesuré du parcours |
| Deuxième check / checks par actif | lots serveur par identifiant Supabase, indicateur technique distinct | définir un check intentionnel, puis `check_completed` dédupliqué par action/session ; navigation dans 63 cellules et refresh automatiques exclus |
| Funnel onboarding -> score -> compte -> Premium, abandons | pas de funnel complet fiable | identité commune + score vu + confirmation de création de compte + essais/paiements vérifiés ; pas `plan_selected` comme conversion |
| J7/J30 | retours `app_foregrounded` par ID mobile, à partir de sa première activité observée | ce n'est ni rétention de compte ni d'installation ; cohortes arrivées à maturité seulement, J7/J30 calendaires explicites (Europe/Paris), pas retour « n'importe quand après » |
| Favoris | ajouts/retraits et identifiants backend actifs sur ces actions | stock actuel à prendre en DB ; pas de taux sur les actifs mobiles tant que les identités divergent |
| Validations / taux positif | `terrain_validated.result=true` / événements avec résultat booléen | afficher aussi le dénominateur ; sans réponse = non mesuré ; pas une mesure de précision sur toutes les prévisions |
| Prévisions vertes >65% de validations positives, précision par zone (PRD/FR29) | non calculable à partir de ces seules propriétés PostHog | enrichir avec verdict de la prévision, région bornée et corrélation sûre ; dédupliquer les validations selon une règle métier, pas par utilisateur seulement |
| Quota -> paywall -> CTA | paywall -> CTA possible en mobile ; quota refusé séparé en backend | pont d'identité pour quota -> UI ; distinguer ouverture demandée et réellement visible, fermeture et abandon |
| Essai, paiement, renouvellement, expiration, remboursement, churn | données Apple partielles présentes en DB, aucun événement PostHog dédié | émettre côté backend après vérification et commit, de façon idempotente, avec environnement Apple et origine |
| Conversion essai -> paiement >40%, gratuit -> essai >15%, MRR / payants actifs | non mesurables dans PostHog actuel | distinguer offre d'essai gratuite et autre offre introductive ; période, montant/devise vérifiés ; Premium offert et Sandbox exclus des paiements |
| Annulation auto-renouvellement vs fermeture feuille Apple | aucun signal PostHog | traiter la notification de préférence de renouvellement et ses sous-types ; événement client distinct pour annulation de la feuille de paiement |
| Restauration | clic seulement | succès/échec vérifié distinct, sans compter une restauration comme nouvel abonnement |
| Rétention abonnement mensuel >70% à 3 mois, engagement 3+ ouvertures/mois | ouvertures par ID mobile possibles ; rétention d'abonnement non | lifecycle Apple, cohortes mensuelles matures, saisonnalité ; ouvertures ≠ sessions de sortie |
| Alertes favoris -> retour, acquisition/persona/sondage | envoi push backend ; consentement newsletter UI | pas d'event d'ouverture push attribuable ; sondage persistant en DB, pas de propriétés PostHog correspondantes |
| Qualité : crashes, 4xx/5xx, latence, météo, cache, uptime | hors des événements produit actuels | Sentry / Better Stack / logs / console comme sources ; ne pas activer error tracking PostHog pour remplir ces indicateurs |
| Note App Store, ASO, NPS | hors taxonomie actuelle | App Store Connect et enquête dédiée si décidée ; ne pas activer les surveys automatiquement |

### Limites précises du cycle Apple

`backend/app/services/apple_store.py` classe une transaction `trial` lorsque `offer_type == 1` :
une offre introductive n'est pas nécessairement une période gratuite. Le libellé trial ne suffit
pas à prouver l'essai gratuit de 7 jours ni un encaissement. `subscription.py` gère SUBSCRIBED,
DID_RENEW, EXPIRED, REFUND, REVOKE, REFUND_REVERSED et RENEWAL_EXTENDED pour les droits ; le webhook
enregistre aussi les notifications non projetées. DID_CHANGE_RENEWAL_STATUS n'est pas dans cette
projection, et le journal actuel n'expose pas les sous-types/infos de renouvellement nécessaires
à un suivi complet des annulations. Les doublons Apple sont gérés pour la DB, pas encore pour
une livraison analytics fiable après commit.

`quota_bypassed(plan=premium)` prouve un droit actif lors d'une requête, pas un achat ni un revenu.
Le backend peut accepter Sandbox en production et des droits `origin=granted` : les futurs
événements commerciaux doivent permettre de les séparer sans exporter JWS, reçu ou transaction brute.

## 5. Définitions d'analyses à appliquer après inventaire

Dashboard proposé : **Cloudbreak — suivi produit (production vérifiée)**. **Non créé.**
Réutiliser d'abord chaque analyse équivalente, même si elle porte un autre nom. Comparer type,
événements, propriétés, filtre d'environnement, période, fuseau, fenêtre et méthode de comptage.
Conserver IDs et URLs des éléments réutilisés/créés dans ce rapport une fois accessibles.

Réglages proposés : plage 30 derniers jours, pas quotidien, fuseau Europe/Paris. Pour une source
sans séparation prod/test démontrable, ne pas publier un indicateur labellisé production. Ajouter
un texte de couverture (date de première réception validée, builds inclus, sources, limites).

| Analyse | Définition | Interprétation |
|---|---|---|
| Onboarding — progression et abandons | funnel séquentiel step=1 -> 2 -> 3 -> 4 -> `onboarding_complete`, fenêtre 24 h, mêmes IDs mobiles ; conversions globales et entre étapes | progression instrumentée, pas installation -> activation ; doublons de montage non comptés comme personnes supplémentaires |
| Recherche -> sélection de sommet | `search_performed` -> `peak_selected(source=search)`, séquentiel, 1 h, IDs mobiles | progression UI, sans imposer le même peak à l'étape recherche qui n'en contient pas |
| Recherche sans résultat | nombre de `search_performed(results_count=0)` / nombre de recherches avec `results_count` présent ; afficher les deux effectifs | ratio de requêtes, pas pourcentage de personnes en échec |
| Paywall -> clic CTA | `paywall_opened` -> `plan_selected`, séquentiel, 1 h ; breakdown `trigger` de l'ouverture, analyse séparée du `period` au clic | intention d'achat ; les offres mensuelles/annuelles sélectionnées ne sont pas des ventes |
| Paywall et restauration | tendances séparées opened (breakdown trigger), dismissed, restore clicked ; totaux et IDs mobiles uniques | pas `dismissed/opened` présenté comme abandon d'achat |
| Activité mobile | uniques quotidiens de `app_foregrounded`, fréquence mensuelle par ID | appareils/identifiants observés, pas comptes ni installations ; exclure événements cron |
| Rétention mobile J7/J30 | première occurrence observée de `app_foregrounded` -> retour sur cet événement au jour exact 7/30, même ID ; si l'UI ne garantit pas « première occurrence », utiliser une requête d'événements dédiée | cohortes matures seulement ; la collecte récente ne permet pas encore J30 ; ne pas utiliser « any event » qui inclurait les alertes cron |
| Calculs serveur | séries **séparées** `score_calculated` et `score_week_calculated`, nombre et distinct IDs Supabase ; breakdown `plan` | activité de calcul réseau, pas scores vus/checks ; `cell_count` documente le lot |
| Quotas serveur | nombres et uniques séparés de `quota_exceeded` / `quota_bypassed` | tentatives refusées et droits utilisés ; pas taux global de checks refusés faute de dénominateur exhaustif |
| Favoris | nombres et uniques de `favorite_added` / `favorite_removed` ; alertes envoyées sur une série séparée | flux d'actions, pas stock ni livraison push |
| Terrain | total `terrain_validated` avec résultat booléen ; positif = true / (true + false), afficher N, données manquantes séparées | confirmations parmi les réponses seulement ; dénominateur nul -> N/A, pas 0% |
| Fonctionnalités UI | `score_why_opened`, `forecast_shared`, `terrain_validation_opened`, `offline_mode_shown` séparés | interactions explicites ; aucun taux rapporté aux scores vus tant que ce dénominateur manque |

Ne créer ni le funnel complet, ni une tuile « revenus = 0 », ni une rétention J30 vide présentée
comme 0%. Une requête retournant zéro événement sur une période ne prouve pas zéro action métier
si la collecte, l'éligibilité ou l'historique sont incomplets.

## 6. Corrections d'instrumentation proposées, non implémentées

1. Décider et tester un pont d'identité sans profils : identifiant commun pseudonyme, transmis
   explicitement et validé côté serveur, avec séparation analytics/auth et politique de rotation.
   Tester invité -> compte (email/Apple), reconnexion à un compte existant, logout, suppression,
   changement de compte, appareils multiples et absence de configuration. Un identifiant client
   analytics ne doit jamais servir d'autorisation ou permettre une usurpation métier.
2. Ajouter des dimensions bornées de provenance (environnement, version/build et canal si fiable),
   sans collecte automatique. Séparer test/prod avec des projets/clés propres si le projet actuel
   est partagé ; conserver et signaler l'historique mélangé, sans prétendre le nettoyer par magie.
3. Définir `score_viewed` et `check_completed` (noms proposés) avec source réseau/cache, verdict,
   corrélation et déduplication. Instrumenter l'affichage réellement visible et la consultation
   intentionnelle, pas chaque render React ou chacune des 63 cellules calculées.
4. Ajouter des résultats auth à enums bornés et une confirmation de création de compte permanent
   après le succès effectif ; distinguer invité, inscription, upgrade, reconnexion et retry de
   provisioning. Ne pas confondre `POST /user/provision` réessayable avec un nouveau signup.
5. Ajouter des événements backend de cycle d'abonnement (essai gratuit confirmé, premier paiement,
   renouvellement, auto-renouvellement désactivé/réactivé, expiration, remboursement/révocation),
   après signature/ownership/commit et avec déduplication durable ; distinguer origine Apple/offert,
   Sandbox/Production et restauration. Compléter la lecture des offres et renewal info. Ajouter
   séparément les issues UI d'achat/restauration avec codes d'erreur stables, sans texte libre.
6. Compléter permissions notifications, visibilité paywall, ouverture push, provenance des
   validations et procédure de rétention/effacement des données analytics selon les décisions de
   confidentialité. Aucun profil, replay, survey ni autocapture à activer pour contourner un manque.

Ces propositions ne sont pas une modification livrée. Le prochain chantier de code doit suivre
CLAUDE.md/AGENTS.md : brainstorming, plan écrit, sous-agents, branches/worktrees applicables,
TDD, documentation/HTTP si endpoint, validation et revues, portes applicables. Une correction
mobile ne bénéficiera aux utilisateurs qu'après distribution et adoption d'une nouvelle build ;
les données absentes de la 1.0.2 ne seront pas reconstituées rétroactivement.

## 7. Recette de reprise avec accès PostHog

1. Lister organisations/projets autorisés ; noter nom, ID, région, URL et droits réels de lecture
   projets/événements/insights/dashboards et de création d'analyses. Aucun secret dans le compte rendu.
2. Comparer **sans afficher les valeurs** la clé de capture du projet candidat à celles de Dokploy
   prod et du build EAS production réellement distribué. Vérifier les hôtes, la build 12 et la date
   de collecte. Un nom de projet ou des événements backend seuls ne prouvent pas le mobile prod.
3. Interroger des agrégats bornés sur 24 h, 7 j et 30 j : nom d'événement, nombre, uniques distinct_id,
   première/dernière réception et complétude des propriétés. Ne pas exporter IDs individuels ou PII.
   Examiner les dimensions SDK version/build et la provenance ; relever tout mélange dev/TestFlight,
   Apple Sandbox ou activité de test. En l'absence de filtre démontrable, conserver l'étiquette mixte.
4. Inventorier **toutes les pages** d'insights/dashboards (pagination, archivage signalé), filtres et
   définitions des funnels ; réutiliser les équivalents. Noter les liens avant toute création.
5. Avec un parcours App Store contrôlé et identifié comme test, vérifier une chaîne UI et une action
   backend (ex. recherche/sélection puis score ou favori) ; ne pas effectuer d'achat réel juste pour
   générer de la donnée. Inspecter les identités sans les recopier et confirmer leur divergence ou
   un éventuel mécanisme distant absent du dépôt. Marquer les données de recette dans l'interprétation.
6. Vérifier le contenu réellement reçu, les réglages de profils, replay, autocapture et métadonnées ;
   ne pas changer les réglages de confidentialité. Ne pas retirer les variables de production pour
   tester le no-op : ce cas est couvert localement par les tests de l'adaptateur.
7. Réutiliser/créer uniquement les analyses de la section 5 dont les prérequis sont satisfaits.
   Exécuter les requêtes, contrôler les dénominateurs et cohortes, puis ajouter au dashboard.
   Documenter IDs/URLs, filtres et résultat de lecture après création. Si un endpoint de création
   manque, décrire précisément la capacité manquante, sans prétendre à une création.

## 8. Suivi, publication et validations

- TODO et source locale `docs/roadmap/roadmap.json` étaient déjà à jour sur la publication 1.0.2.
  Cet audit conserve ces modifications et précise le blocage analytics. L'historique dev/TestFlight
  reste consultable dans les anciens documents, signalés comme dépassés pour le statut prod.
- Aucun outil de lecture/republication d'Artifact **Claude** disponible ici. La roadmap publiée
  [dans Claude](https://claude.ai/artifact/DwrVEVTUpTRo2E662YEfX3) n'a été ni vérifiée ni republiée ;
  les outils ChatGPT Pages/Artifact Session ne pilotent pas cet artifact Claude.
- Aucun changement de code, de dépendance, de collecte, de variable ou de déploiement. Pas de
  nouvelle story livrée ni d'AC funnel déclaré satisfait. Le statut historique `done` de 1.8
  est conservé, avec une note sur le suivi produit restant à réaliser.
- Backend : `./.venv/bin/python -m pytest tests/test_analytics.py tests/test_services_analytics.py -q --no-cov`
  -> **9 tests réussis**. Tests locaux avec faux client : ils ne prouvent pas la réception PostHog.
- Mobile : `npm test -- --runTestsByPath src/services/analytics.test.ts --runInBand --coverage=false --watch=false`
  a démarré Jest puis est resté sans résultat pendant plusieurs minutes ; interrompu (code 130).
  **Test non validé**, même limite de runner déjà décrite dans la doc mobile 1.8. Aucune validation
  complète applicative lancée pour ces seules docs.
- Contrôles documentaires : `git diff --check` réussi ; JSON de roadmap valide ; 28 noms mobile
  et 9 noms backend vérifiés depuis les listes blanches et présents dans ce rapport ; 6 liens
  relatifs contrôlés dans les pages concernées. Les sous-modules mobile/backend restent propres.
