# PostHog — configuration produit vérifiée le 2026-11-27

## Résultat

Connexion officielle PostHog ajoutée à Codex, authentification OAuth réussie et accès limité au
projet **Cloudbreak Production**, **353557**. Les droits accordés couvrent la lecture du projet,
des définitions d'événements/propriétés et des requêtes, ainsi que la lecture/écriture des insights
et dashboards. Aucun droit d'écriture sur la collecte, les profils, le replay ou les réglages projet.

**[Ouvrir Cloudbreak — suivi produit](https://eu.posthog.com/project/353557/dashboard/1157291)**

Le dashboard est enregistré, épinglé et contient **6 analyses et 2 notes de lecture**. Les six
analyses ont été exécutées à nouveau après sauvegarde avec recalcul forcé : toutes ont renvoyé un
résultat et aucune n'a signalé de warning. La disposition sauvegardée a été relue via l'API.
Le contrôle visuel dans Arc a atteint le bon titre mais présentait une zone de contenu blanche ;
le rendu des graphiques n'a donc pas été validé visuellement.

## Projet et provenance : ce qui est confirmé

- Nom actuel **Cloudbreak Production**, ID **353557**, projet créé le 2026-11-16 ; région UE,
  hôte d'ingestion `https://eu.i.posthog.com`, fuseau du projet **UTC**. Aucun réglage modifié.
- Réception mobile confirmée : `$app_version=1.0.2`, `$app_build=12`,
  `$lib=posthog-react-native`, `$is_emulator=false` sur les événements observés.
- Réception d'événements de taxonomie backend confirmée : `$lib=posthog-python`,
  `score_week_calculated` et `quota_bypassed`. Le lot reçu porte `cell_count=63`, `plan=premium`.
- Les variables Dokploy/EAS n'ont pas été relues pendant cette reprise. Le TODO antérieur
  consignait une clé commune backend prod/build production au 2026-11-26 ; la réception observée
  est cohérente avec cette destination, mais n'est pas une nouvelle comparaison de secrets.
- **App Store, TestFlight et tests ne sont pas distingués dans ces événements.** Une build 12 sur
  un appareil physique ne prouve pas une installation App Store. Les événements backend n'ont
  pas de propriété d'environnement permettant de certifier séparément leur serveur d'origine.
  Le dashboard affiche cette limite ; ses résultats ne sont pas labellisés « utilisateurs publics ».

L'indication `installed: false` du catalogue des apps ChatGPT ne permettait pas de conclure sur
l'installation du plugin Codex. Le blocage initial portait sur l'exposition des outils dans le
chat. Il a été levé par la connexion MCP officielle et son authentification, puis par les appels
MCP du client local. Aucune clé de capture n'a servi de jeton de lecture/gestion.

## Existant inventorié avant création

Lecture complète des listes avec pagination contrôlée (`next=null`) : **1 dashboard et 9 insights**.
Le [dashboard de démarrage](https://eu.posthog.com/project/353557/dashboard/1122112) utilise
`$pageview`, `$screen`, `$autocapture`, les referrers et la géolocalisation. Ses neuf requêtes ont
été inspectées : elles ne correspondent pas à l'instrumentation explicite de Cloudbreak reçue ici.
Le funnel générique visite → clic et la rétention générique par pageview ne répondent pas aux besoins
de l'app. Aucun équivalent des nouvelles analyses n'existait. Ces éléments historiques ont été conservés.

Le catalogue de métriques gouvernées et les templates ne sont pas accessibles avec les droits
restreints accordés (`data_catalog:read` et `dashboard_template:read` absents). Cela ne signifie
pas qu'ils sont vides. Les définitions créées sont des analyses spécifiques à ce suivi, sans
certification par le catalogue. Le schéma des événements a été vérifié via les métadonnées SQL et
des agrégats bornés ; `read-data-schema` est masqué car il exige aussi `action:read`.

## Analyses créées et vérifiées

| Analyse | Lien | Définition et résultat de contrôle |
|---|---|---|
| Activité mobile — identifiants actifs | [t61sqRaD](https://eu.posthog.com/project/353557/insights/t61sqRaD) | Uniques quotidiens sur `app_foregrounded`, mobile 1.0.2/build 12 : un identifiant le 26, un le 27 novembre. Pas des comptes ou installations. |
| Activité mobile — passages au premier plan | [pEqfTVRT](https://eu.posthog.com/project/353557/insights/pEqfTVRT) | Captures foreground/background, mêmes filtres : 6 et 3. Pas des checks de score ni une preuve de sessions intentionnelles distinctes. |
| Onboarding — étape 1 vers étape 2 | [ipEPuNLy](https://eu.posthog.com/project/353557/insights/ipEPuNLy) | Funnel natif séquentiel, fenêtre 24 h, mêmes filtres mobiles, `step=1` puis `step=2` : un identifiant traverse les deux étapes. Échantillon insuffisant pour une conclusion produit ; ne couvre pas la fin de l'onboarding. |
| Calculs serveur — lots hebdomadaires | [K17eqrYs](https://eu.posthog.com/project/353557/insights/K17eqrYs) | Nombre quotidien de `score_week_calculated` : une capture. Un lot de 63 cellules n'est ni 63 scores vus ni un check utilisateur confirmé. |
| Droits Premium — requêtes sans quota | [jaWVBcW5](https://eu.posthog.com/project/353557/insights/jaWVBcW5) | Nombre quotidien de `quota_bypassed` : une capture. Trial, droit offert ou Sandbox restent possibles ; pas une conversion payante. |
| Rétention J7 / J30 — cohortes matures | [dUNiyLhp](https://eu.posthog.com/project/353557/insights/dUNiyLhp) | Première activité mobile observée puis retour au jour exact, dates UTC. Les deux horizons renvoient zéro identifiant éligible et **N/A** pour les retours/taux. |

Les graphiques natifs commencent au 2026-11-26 UTC, sans inclure une longue période antérieure à
la première collecte. Les trois analyses UI sont volontairement limitées à 1.0.2/build 12 : revoir
ces filtres lors d'une future version. Les graphiques backend restent séparés et sans filtre de
version mobile. Le filtre des comptes de test n'est pas appliqué : sa cohorte existante n'a pas
été auditée et ne prouve pas une séparation du trafic. La note de périmètre le signale.

La rétention utilise les identités mobiles observées depuis le début de collecte, toutes versions
confondues pour permettre les retours après mise à jour. Une requête native de rétention a d'abord
été vérifiée ; ses données brutes contenaient aussi des zéros sur les jours futurs. L'analyse
sauvegardée utilise donc une requête SQL avec contrôle explicite de maturité et affichage `N/A`.
Ce calcul spécifique de censure n'est pas une approximation du funnel ni une rétention de comptes.
Pour la première cohorte observée le 26 novembre : J7 devient éligible le **3 décembre** et J30
le **26 décembre** (jours calendaires UTC ; journée en cours encore partielle).

## Événements réellement observés

Instantané d'audit sur les 30 derniers jours, contrôlé par les résultats du dashboard après création :

| Événement | Captures | Première réception | Dernière réception |
|---|---:|---|---|
| `app_foregrounded` | 6 | 2026-11-26 15:03:49 UTC | 2026-11-27 10:16:50 UTC |
| `app_backgrounded` | 3 | 2026-11-26 15:04:18 UTC | 2026-11-27 10:17:06 UTC |
| `onboarding_step_viewed` | 2 | 2026-11-26 15:03:52 UTC | 2026-11-26 15:04:27 UTC |
| `quota_bypassed` | 1 | 2026-11-27 10:16:52 UTC | idem |
| `score_week_calculated` | 1 | 2026-11-27 10:16:52 UTC | idem |

Les steps reçus sont 1 et 2. **Ni `onboarding_complete` ni `paywall_opened` n'ont de définition
dans le projet à l'instant de l'audit.** Aucun autre nom d'événement n'a été retourné par la
requête d'inventaire. Cela ne permet pas de conclure à zéro onboarding terminé, favori, achat ou
validation terrain ; la collecte et le recul sont incomplets.

## Fiabilité et confidentialité vérifiées

- Agrégats d'identité : **2 IDs mobiles, 1 ID backend, aucune intersection**. Aucun identifiant
  individuel exporté dans ce rapport. Cela confirme la limite trouvée dans le code : le funnel
  UI → API ne peut pas être calculé avec ces identités telles quelles.
- Toutes les captures observées portent `$process_person_profile=false`, `$geoip_disable=true`
  et `person_mode=propertyless`. Aucune activation de profil ni de collecte automatique effectuée.
  Cela ne constitue pas un inventaire de profils historiques éventuellement créés auparavant.
- Le replay est désactivé dans le réglage projet lu. Certains réglages génériques console/performance
  du projet sont actifs ; ils n'ont pas été modifiés. Le mobile désactive ses captures automatiques
  dans le code. Aucun événement automatique de replay/pageview/autocapture n'a été observé.
- Les SDK ajoutent des métadonnées hors propriétés métier (version/build, appareil, OS, locale,
  session, fuseau…). Leurs clés ont été inventoriées ; aucune valeur de nom d'appareil ni donnée
  personnelle n'est publiée dans ce rapport. La liste blanche métier ne filtre pas à elle seule
  toutes les métadonnées SDK.

## Actions restantes

1. Rejouer un parcours App Store contrôlé, en signalant ses données de test : terminer l'onboarding,
   chercher/sélectionner un sommet, ouvrir le paywall, ajouter/retirer un favori et soumettre une
   validation terrain. Vérifier les événements attendus, sans achat réel pour alimenter un graphe.
2. Résoudre l'identité commune sans profils, définir le score réellement vu et le check intentionnel,
   puis ajouter des confirmations d'inscription et de cycle commercial vérifiées côté serveur.
   Les détails, erreurs et tests de transitions proposés restent dans
   [l'audit de code](audit-production-2026-11-27.md), sections 2 à 6.
3. Une fois les événements reçus, compléter le funnel d'onboarding, recherche → sélection,
   paywall → CTA, favoris et terrain ; réutiliser les analyses de ce dashboard et vérifier les
   dénominateurs. Le funnel complet vers Premium reste non mesurable aujourd'hui.
4. Ajouter une provenance fiable test/prod et Apple Sandbox/Production, puis appliquer les filtres
   appropriés. Ne pas réétiqueter l'historique ambigu comme production publique.
5. Livraison Git mobile 1.0.2, publication des modifications locales et republication de la roadmap
   Claude restent distinctes. Aucun outil de republication d'Artifact Claude disponible ici.

Aucun code applicatif, variable EAS/Dokploy, build ou déploiement changé. Toute instrumentation
nouvelle devra suivre le workflow de développement du projet ; une correction mobile nécessitera
une future build distribuée, sans rattrapage automatique de l'historique absent.

## Validation

- Connexion OAuth réussie, serveur MCP activé et serveur distant PostHog découvert.
- Projet, inventaires, requêtes, créations et sauvegarde relus via les outils MCP authentifiés.
- Six analyses recalculées après sauvegarde : résultats présents, aucun warning ; J7/J30 = N/A.
- Disposition des huit tuiles relue, sans chevauchement ; rendu visuel Arc non validé (page blanche).
- Tests backend de l'adaptateur exécutés pendant l'audit initial : 9 réussis ; le Jest mobile
  initial est resté sans résultat puis a été interrompu. Aucun nouveau résultat mobile revendiqué.
- Vérifications finales : `git diff --check` réussi, JSON de roadmap valide, six URLs/IDs
  concordant avec les résultats MCP, huit tuiles sans chevauchement et dix liens locaux valides.
  Les sous-modules mobile/backend restent propres. Pas de validation complète applicative pour
  ces seules modifications de documentation et cette configuration externe ; aucun commit/push.
