# TODO — Cloudbreak

> Ce fichier ne contient **que ce qui reste à faire**. Pas d'historique de PR ni de journal : git, `_bmad-output/implementation-artifacts/sprint-status.yaml` et `docs/versions.md` font foi pour le reste.
> Mis à jour le 2026-11-13. Prix de référence : **4,99 € / mois, 44,99 € / an**, essai 7 jours.

## Où on en est

1. **1.0.0 livrée (2026-11-13).** Build 10 publié sur l'App Store ; `release/1.0.0` mergée dans `main`, tag `v1.0.0` et GitHub Release dans backend, mobile et ops ; `main` reporté dans `develop` ; apps Dokploy prod sur `main`.
2. **Mais les abonnements ne marchent pas en production.** Les deux abonnements sont restés « Finaliser avant soumission » dans App Store Connect : ils n'ont pas été joints à la 1.0.0, donc StoreKit ne renvoie aucune offre et le paywall affiche « Abonnements indisponibles ». Apple impose de soumettre le premier groupe d'abonnements **avec une nouvelle version de l'app**.
3. **En cours : hotfix 1.0.1 (mobile seul)** — voir « Lot 4 ». Backend et ops ne bougent pas.

Légende « Qui » : **Codex** = tâche navigateur (brief dans `docs/superpowers/codex-briefs/`), **Claude** = API Dokploy / SSH / code, **Alex** = secrets et décisions.

---

## Lot 1 — Monter la prod (infra, pas de code)

**État au 2026-11-08 : le backend prod ET `ops` prod sont en ligne** (`api.cloudbreak-app.com/health` ok, migrations appliquées, Swagger coupé, `/internal` réservé au VPS, crons purge 06:05 et favoris 18:05 actifs ; `ops.cloudbreak-app.com` : CGU et confidentialité publiques au 1er novembre 2026, headers de sécurité, AASA, robots/sitemap vérifiés). DNS, Supabase prod, clé Apple et **seed des sommets (23 782, fait le 2026-11-08)** sont faits. Il reste ce qui suit.

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 2 | `NEXT_PUBLIC_APP_STORE_URL` sur ops prod | Alex + Claude | Après publication de l'app ; `NEXT_PUBLIC_*` est figé au build : rebuild d'ops nécessaire. Sans elle la page `/sommet/*` affiche « L'app arrive bientôt ». | après publication |
| 5 | Webhooks GitHub d'auto-déploiement des apps prod | Claude | Optionnel : sans webhook, un push sur la branche ne redéploie pas la prod (déploiement manuel par API). Les apps prod suivent `main` depuis le 2026-11-13 ; vérifier si un webhook existe déjà (`gh api repos/.../hooks`). | à décider |

Universal Links (story 3.6) : code fait, validé sur iPhone en dev et en prod (test de fumée du 2026-11-10).

## Lot 2 — Tester la release (TestFlight)

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | Assets App Store | Alex | Icône 1024×1024 (déjà aplatie sans alpha), captures FR/EN. Indépendant, à faire en parallèle. | à faire |

## Lot 4 — Hotfix 1.0.1 (abonnements en production)

| # | Tâche | Qui | Contexte / note | Statut |
|---|---|---|---|---|
| 1 | Branche `hotfix/1.0.1` depuis `main` du mobile : version 1.0.1 + correctifs paywall | Claude | Correctifs : bouton « Réessayer » qui recharge les offres StoreKit, abonnement mensuel qui plante à l'achat, rechargement après paiement (détail dans « Hors lot »). « Réessayer » fait et validé : [cloudbreak-mobile#69](https://github.com/AlexandreMoreau2002/cloudbreak-mobile/pull/69) (version 1.0.1 incluse). Restent le mensuel et le rechargement après paiement : à reproduire sur iPhone branché (`idevicesyslog`). Puis merge dans `main`, tag `v1.0.1`, report dans `develop`. | en cours |
| 2 | Build EAS `production` depuis le hotfix + envoi à Apple | Alex (Apple ID + code) / Claude | La 1.0.0 étant approuvée, le build 10 ne peut pas être réutilisé. | à faire |
| 3 | Version 1.0.1 dans App Store Connect avec les **deux abonnements joints** | Alex | Section « Achats intégrés et abonnements » de la page de version (ou « Ajouter pour vérification » sur chaque abonnement). Vérifier la capture d'écran de vérification de chaque abonnement et la disponibilité (annuel : 1 pays sur 175 aujourd'hui). | à faire |
| 4 | Soumission et review Apple | Alex | ~24-48 h. Apple testera les achats : le mensuel doit fonctionner. | à faire |

## Hors lot — non bloquant, à caser quand on veut

| Tâche | Contexte / note |
|---|---|
| Onboarding après suppression de compte (1.0.1) | `AsyncStorage.clear()` (`AuthContext.tsx:683`) efface le drapeau d'onboarding mais l'état mémoire reste « fait » : l'onboarding ne se rejoue qu'au prochain démarrage. Conserver le drapeau ou remettre l'état à zéro. |
| Achat refusé : bouton en chargement sans fin (1.0.1) | Si `/subscription/verify` renvoie 400, l'app ne termine pas la transaction et la rejoue à chaque lancement ; afficher une erreur claire. |
| « Supprimer le compte » visible en session anonyme (1.0.1) | Dans l'onglet Profil, la ligne `profile.deleteAccount` (`profile.tsx`) s'affiche aussi sans compte permanent. La masquer pour les anonymes (la purge à 30 j les couvre déjà). |
| Plantage intermittent sur la card « Cloudbreak Pro » du Profil (1.0.1) | Observé en TestFlight (build 10, iPhone iOS 27) : toucher la card ouvre le paywall, l'app plante ou reste figée, et le même geste fonctionne parfois. Même famille que le bouton d'abonnement qui reste en chargement sans feuille Apple. À reproduire avec les logs (`idevicesyslog`) et à corriger avec le bug paywall. |
| Abonnement mensuel : plante à chaque achat (1.0.1) | Observé en TestFlight (build 10) : le bouton mensuel reste en chargement sans feuille Apple, alors que l'annuel passe (avec relance de l'app). À reproduire avec `idevicesyslog` et corriger avec le bug paywall. |
| Rechargement automatique après le paiement (1.0.1) | Après un achat réussi, le paywall reste en chargement et Premium n'apparaît qu'après avoir fermé et rouvert l'app à la main. Rafraîchir l'état de l'abonnement (`refresh()` / `verifyAndFinish`) et fermer le paywall dès que StoreKit confirme l'achat. |
| Vérifier le 1er run du cron notifications | `ssh vps-ovh-projets tail ~/cloudbreak-favorites.log` à 18h Paris → `http=200` (doc `docs/infra-serveur.md` §8quater). Ponctuel, indépendant des lots. |
| Backups hors VPS + test de restauration | `/srv/backups` aujourd'hui sur la même machine, rétention 14 j. |
| Comprendre l'image Docker backend dev disparue | Prune ? Build d'un autre projet ? Jamais investigué. |
| Monitoring Better Stack (story 1.5) | Uptime + logs, pas branché. |
| Receipts Expo (`DeviceNotRegistered`) | PR séparée, pas démarrée. Post-launch. |
| Alerte régionale (FR23) | Reportée en V2. |
| Message hors-saison (3.6b, FR7) | Reporté, à faire avant l'été 2027 (on est en pleine saison). |

## Features hors scope MVP (backlog, pas dans le chemin de release)

| Feature | Statut | Note |
|---|---|---|
| Quota invité étage 2 (App Attest / DeviceCheck) | à planifier | — |
| Epic 1 — CI/CD mobile complet (1.4) | partiel | post-MVP |
| 1.8 PostHog réel + Sentry | post-MVP | après la sortie |
| Epic 8 (growth V2) et 9 (landing) | hors scope MVP | décidé le 2026-08-08 |
| 6.2 Photo de validation terrain | dropée | décision explicite |
| Sommets saisis à la main | futur | nécessite une colonne `source` (`seed`\|`manual`) avant tout chargement manuel |
