# Ops console — journal des choix UX

> Journal tenu pendant la refonte des frames ops dans l'artifact « cloud break - mer de nuage » (section « Cloudbreak Ops — console admin »). Chaque choix est rattaché à un besoin ou à un AC (`docs/ops-dashboard-besoins.md`, Epic 10 dans `epics.md`, `docs/ops-dashboard-maquette-brief.md`). Les données affichées dans la maquette sont **fictives**.
> Dernière mise à jour : 2026-11-16.

## 1. Point de départ : ce qui est retiré

Les anciennes frames ops (dashboard, monitoring, utilisateurs, connexion) étaient un modèle de SaaS générique. Elles sont remplacées, car elles contredisent le cadrage :

| Ancien contenu | Pourquoi retiré |
|---|---|
| MRR / ARR, conversion Free → Premium | Pas dans l'Epic 10 ; les ventes passent par Apple (StoreKit), pas par un back-office. |
| Erreurs Sentry, webhook Stripe | Sentry non branché (story 1.8) ; Stripe n'existe pas dans le projet. Le dashboard renvoie vers Sentry, il ne recrée pas ses écrans. |
| Latence P50/P95/P99, hit rate Redis, graphe req/min | Décision « pas de Grafana » + ressources du VPS (story 1.6 remplacée). |
| Top sommets consultés | Hors périmètre v0. |
| Liste d'utilisateurs avec emails, quota, « Révoquer l'abonnement » | v0 = lecture seule, **aucune donnée personnelle**, pas de liste d'utilisateurs (besoins §3 point 4). La recherche par email arrive en v1 (10.5). |
| Mode sombre seul | La DA Cloudbreak est claire par défaut, sombre en option. |
| Menu à 7 entrées (Abonnements, Sommets, Logs, Réglages…) | Trop pour un usage solo, principalement sur iPhone. |

## 2. Décisions

| # | Décision | Besoin / AC qui la motive |
|---|---|---|
| D1 | **Navigation à 4 entrées** : Accueil, Santé, Déploiements, Utilisateurs. Barre latérale à gauche sur desktop, barre d'onglets en bas sur mobile. | Usage solo, surtout sur iPhone ; 4 destinations tiennent sur 375 pt sans menu caché. AC 10.4 (blocs santé, versions, KPIs, crons). |
| D2 | **Accueil = « tout va bien ? » en 5 secondes** : bannière de statut, 4 pastilles, nombre d'utilisateurs + courbe, versions en prod. Chaque pastille renvoie vers sa page. | Demande du 2026-11-16 ; AC 10.4 (statut global) ; AC 10.3 (`/admin/overview`). |
| D3 | **« À surveiller » juste sous la bannière**, uniquement s'il y a quelque chose. | Ce qui demande une action doit être vu avant les chiffres. |
| D4 | **Quatre états, jamais par la couleur seule** : Opérationnel, Dégradé, En panne, Inconnu, chacun avec une icône différente et un libellé. | Règle d'accessibilité du brief ; AC 10.4 : source injoignable ≠ en panne. |
| D5 | **Couleurs de statut = celles des scores**, avec des teintes de texte assombries en clair pour tenir 4,5:1 (`--ops-ok-ink`, etc.). Le gris sert à « inconnu ». | Brief §2 (couleurs reprises des scores) ; contrainte de contraste. |
| D6 | **Switch Prod / Dev dans l'en-tête, Prod par défaut** ; en Dev, bandeau coloré sur toute la largeur. Jamais de mélange dans un bloc. | Besoins §3 point 3 ; brief §1. |
| D7 | **Heure de dernière donnée sur l'accueil + bouton Actualiser** dans l'en-tête ; rafraîchissement auto 60 s annoncé. | Brief §1 ; AC 10.4. |
| D8 | **Courbe d'utilisateurs en deux onglets** (Utilisateurs / Usage = checks par jour), période 30 ou 90 jours, avec une note « les comptes supprimés disparaissent de l'historique ». | Demande du 2026-11-16 ; AC 10.3 (séries 90 jours, limite documentée). |
| D9 | **Les chiffres du mobile viennent du store** : la ligne Mobile affiche la version publiée sur l'App Store et ne se compare pas à `main`. | AC 10.2 (iTunes Lookup, pas de SHA mobile). |
| D10 | **Serveur : jauges avec repère de seuil** (disque 85 %, RAM disponible 10 %, swap 75 %) et mention « serveur partagé dev + prod ». | AC 10.1 (seuils mesurés le 2026-11-15) ; brief §3.6. |
| D11 | **Crons : une ligne par job**, dernier passage, prochain passage attendu, retard en minutes. | AC 10.1 (heartbeats), AC 10.3 (état exposé par l'overview). |
| D12 | **Bloc « Offrir Premium » absent de la v0**, montré sur une frame séparée marquée « v1 ». | Brief §3.7 ; story 10.5. |
| D13 | **Toutes les chaînes via un dictionnaire fr/en** (`ops-dict`), à porter dans `messages/fr.json` et `en.json`, espace `admin`. | Règle i18n ops ; décision du 2026-11-15 (pas d'exception). |
| D14 | **DA héritée de l'artifact** : variables `--cb-*`, Josefin Sans, JetBrains Mono pour les SHA, thème par `data-theme`. | « La DA est déjà posée » (2026-11-16). |
| D15 | **Panne de l'API : la carte Utilisateurs affiche « Impossible de joindre le backend »**, pas des zéros. Les pastilles restent affichées (elles viennent de BetterStack). | Brief §4 règle clé ; AC 10.4. L'API étant en panne, `/admin/overview` l'est aussi : montrer des chiffres serait faux. |
| D16 | **Source BetterStack injoignable → pastilles Services et Serveur « Inconnu »** (gris, icône point d'interrogation), bannière « Statut inconnu », jamais « En panne ». | AC 10.4 ; brief §4. |
| D17 | **Chiffres sans unité monétaire, aucune donnée personnelle** : la page Utilisateurs n'affiche que des agrégats et un rappel de confidentialité. | Besoins §3 point 4 ; RGPD (besoins §risques). |
| D18 | **Aucun libellé « Admin / Ops » sur l'écran « Accès refusé »**, seulement « Ce compte n'a pas accès à cette page ». | Brief §4 : ne pas révéler l'existence du back-office. |
| D19 | **Retard d'un cron en rouge avec la durée**, marge de 30 minutes expliquée en bas de bloc. | Brief §3.5 ; AC 10.1. |
| D20 | **Mobile : le switch Prod/Dev et l'heure de mise à jour sont sous le titre**, thème et langue derrière l'icône Préférences. | 4 onglets en bas, place limitée sur 375 pt. |

## 3. Écarts avec les AC, à confirmer

1. **Ligne Mobile : version dans `main` (1.0.1) contre version publiée (1.0.0)** → affichage « en attente de l'App Store ». Les AC 10.2 ne prévoient que la version publiée (iTunes Lookup) ; lire la version de `mobile/package.json` sur `main` via l'API GitHub est un ajout à valider.
2. **Aucun numéro de build mobile** : iTunes Lookup ne le donne pas (AC 10.2).
3. **Comparaison à `develop` en Dev** : prévue au brief §3.3, mais la frame Dev ne montre que le cas « à jour ».
4. **Rafraîchissement automatique 60 s** : seulement annoncé par « Mis à jour il y a 2 min » ; aucun compte à rebours dessiné.
5. **Nombres de la maquette** (184 utilisateurs, 87 % de disque, etc.) sont fictifs ; la production a ouvert le 2026-11-13.

## 4. Journal d'avancement

- **2026-11-16** — Lecture des anciennes frames et de la DA de l'artifact. Journal créé, décisions D1 à D14 posées.
- **2026-11-16** — Frames ops refaites dans l'artifact « cloud break - mer de nuage » (5 sections, 21 frames) : accueil clair/sombre mobile/desktop, 5 états de l'accueil, Santé, Déploiements, Utilisateurs, aperçu v1, accès. Fichiers : `project/app/cb-ops-shell.jsx` (socle, dictionnaire, données fictives par scénario), `cb-ops-dashboard.jsx` (accueil), `cb-ops-monitoring.jsx` (Santé + Déploiements), `cb-ops-users.jsx` (Utilisateurs + v1), `cb-ops-login.jsx` (connexion, expirée, refusée). Décisions D15 à D20 ajoutées. **Le rendu n'a pas été relu dans le navigateur** : à regarder par Alex, puis retours à intégrer ici.
