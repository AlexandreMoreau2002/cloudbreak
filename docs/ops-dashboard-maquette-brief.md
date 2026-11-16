# Ops console — brief maquette

> Date : 2026-11-15. Pour la maquette de la story 10.4 (UI `/[locale]/admin`). Contexte et décisions : `docs/ops-dashboard-besoins.md`. **v0 = lecture seule**, usage par une seule personne (Alex).

## 1. Cadre général

- **URL** : `/[locale]/admin` dans l'app ops (`/fr/admin`, `/en/admin`). Route `noindex` (meta + `robots`), protégée par un middleware ; aucun lien depuis le site légal.
- **i18n** : fr et en, toutes les chaînes via `useTranslations()` et `messages/fr.json` / `en.json`. Dates et nombres localisés.
- **Accès** : si pas de session admin valide → écran de connexion Supabase (pas de contenu admin dans le HTML). Si connecté sans droit admin → page « Accès refusé » neutre.
- **Switch d'environnement** : **Prod** (par défaut) / **Dev**, dans l'en-tête. Le choix est mémorisé localement (par navigateur), une bannière colorée distincte rappelle qu'on est en Dev. Les données Prod et Dev ne sont jamais mélangées dans un même bloc.
- **Rafraîchissement** : bouton « Actualiser » et rafraîchissement automatique toutes les 60 s ; chaque bloc affiche l'heure de sa dernière donnée (« mis à jour il y a 2 min »).
- **Mobile et desktop** : consultation principalement sur iPhone. Mobile (375 pt minimum) : une colonne, blocs empilés, statut global en premier. Desktop : grille 2 colonnes (3 au-delà de 1280 px). Aucun tableau à défilement horizontal : les lignes se transforment en cartes sur mobile.
- **Aucune donnée personnelle** : aucun email, nom ni identifiant utilisateur dans aucun écran de la v0 (agrégats uniquement).

## 2. Direction artistique

Référence : `_bmad-output/planning-artifacts/design-preview-v2.html`. Police **Josefin Sans** (300 / 400 / 600 / 700).

| Rôle | Clair (principal) | Sombre |
|---|---|---|
| Fond | `#EFE8DC` | `#1A1A1A` |
| Surface (cartes) | `#F7F5F1` | `#2A2A2A` |
| Bordure | `#E9E4DA` | `#3A3A3A` |
| Accent | `#B28C6E` / `#D2BA9C` | identique |
| Texte | `#1A1A1A` / `#5E5E5E` / `#9E9E9E` | à décliner |

Couleurs de statut (reprises des scores) : **OK** `#5C9E6E` · **Attention** `#D4904A` · **Problème** `#C25C4A`. Le gris `#9E9E9E` sert à « inconnu / source indisponible ». Ne jamais porter l'état par la couleur seule : toujours une icône **et** un libellé (« Opérationnel », « Dégradé », « En panne », « Inconnu »). Thème clair et sombre via le `ThemeToggle` existant.

## 3. Écrans / blocs (ordre sur la page)

### 3.1 Statut global

- **Contenu** : une bannière unique : « Tout fonctionne » / « Dégradé » / « Problème détecté » / « Statut inconnu », avec l'environnement affiché et l'heure. Sous la bannière, la liste des éléments qui expliquent le statut (au plus 3 lignes, puis « voir le détail »).
- **Règle** : Problème si au moins un service est en panne ou un cron manque ; Dégradé si un seuil serveur est dépassé ou si une version est en retard ; Inconnu si une source est injoignable et qu'aucun problème n'est confirmé ; sinon OK.
- **Source** : synthèse calculée côté client à partir des blocs ci-dessous (moniteurs BetterStack, heartbeats, serveur, versions).
- **Liens** : « Ouvrir BetterStack ».

### 3.2 Services (uptime)

- **Contenu** : une ligne par service de l'environnement choisi : API (`/health` avec Postgres et Redis) et Ops (site). Pour chacun : statut, disponibilité sur 24 h et 30 j, dernier incident (date et durée).
- **Source** : BetterStack (API de statut), lue par le backend, jamais par le navigateur. Le détail `database: ok / redis: ok` vient de `/health`.
- **Lien** : vers le moniteur BetterStack concerné.

### 3.0 Accueil (page d'ouverture, ajouté le 2026-11-16)

L'accueil répond à « tout va bien ? » en quelques secondes, mobile comme desktop :
1. **Check rapide** : bannière de statut global (Tout fonctionne / Dégradé / Problème / Inconnu) suivie de quatre pastilles (Services, Crons et sauvegardes, Serveur, Versions) avec un statut chacune, chacune renvoyant vers sa page de détail.
2. **Nombre d'utilisateurs** : chiffre total en grand (avec anonymes / permanents et variation sur 7 jours).
3. **Graphique de progression** : courbe du nombre cumulé d'utilisateurs sur 90 jours, avec un second onglet « Usage » (checks par jour). Sélecteur de période 30 / 90 jours. État vide : « Pas encore assez de données ».
4. **Versions en prod** : une ligne par service avec sa version (voir 3.3).
5. Liste « À surveiller » seulement s'il y a quelque chose.
Sources : `GET /admin/overview` (séries et totaux), blocs 3.2 / 3.3 / 3.5 / 3.6 pour les statuts.

### 3.3 Versions déployées

- **Contenu** : tableau **Backend / Ops / Mobile** pour l'environnement choisi : version (numéro `package.json` ou version applicative), tag Git (`v1.0.0`) s'il existe, SHA court déployé, SHA de `main` (ou de `develop` en Dev), écart (« à jour », « en retard de N commits », « en avance »), date du build.
- **Source** : `GET /version` du backend et d'ops (story 10.2), comparé à l'API GitHub publique (branche `main` en Prod, `develop` en Dev). Aucune clé Dokploy.
- **Mobile** : pas de serveur, donc pas de SHA ni de comparaison à `main` ; on affiche la version publiée sur l'App Store (API iTunes Lookup) et, en Dev, rien (« non applicable »). Le build n'est pas disponible.
- **Cas particulier** : une version Prod différente de `main` n'est pas forcément une erreur (release en cours) ; afficher un état Attention, jamais Problème.

### 3.4 KPIs

- **Contenu** : cartes de chiffres : utilisateurs totaux, utilisateurs actifs sur 30 jours, comptes anonymes vs permanents, abonnements actifs, abonnements en essai, checks aujourd'hui et moyenne 7 jours (petit graphique de tendance sur 14 jours). Chaque carte donne la valeur et la variation sur 7 jours.
- **Source** : `GET /admin/overview` (story 10.3), agrégats SQL, aucune donnée personnelle.
- **Liens** : « Ouvrir PostHog » pour les funnels et la rétention (le dashboard ne les recrée pas) ; « Ouvrir Sentry » pour les erreurs. Tant que le SDK n'est pas branché (story 1.8), ces liens sont désactivés avec la mention « bientôt ».

### 3.5 Crons et sauvegardes

- **Contenu** : une ligne par job : purge des anonymes (06:05 Paris), alertes favoris (18:05 Paris), sauvegarde des bases (03:00 UTC). Chaque ligne : dernier passage, résultat (OK / échec), prochain passage attendu, et en cas de retard la durée de retard.
- **Source** : heartbeats (reçus par BetterStack, et par le backend pour le dernier passage exposé dans `/admin/overview`). Aucun contenu de log ni résumé JSON du job dans le navigateur.
- **Règle** : un job est « en retard » s'il n'a pas pingué dans sa fenêtre attendue plus une marge (par ex. 30 min).

### 3.6 Serveur (CPU / RAM / disque)

- **Contenu** : trois jauges (CPU, RAM, disque) avec valeur actuelle, seuil d'alerte et petite tendance sur 24 h. Une mention du swap utilisé si l'agent le remonte.
- **Source** : agent BetterStack sur le VPS (story 10.1), lu par le backend. Le VPS est **partagé entre dev et prod** : ce bloc est identique dans les deux environnements, avec la mention « Serveur partagé dev + prod ».
- **Lien** : « Ouvrir BetterStack ».

### 3.7 Plus tard (v1) : Actions admin — offrir Premium

Hors maquette v0, à prévoir seulement comme emplacement réservé (story 10.5) : un bloc « Offrir Premium » avec un champ email, un bouton de recherche, une carte de résultat (statut d'abonnement actuel), puis une confirmation explicite avant l'action (« Offrir Premium jusqu'au … à … ? »). Un journal des actions récentes (qui, quand, quoi) est visible dans la même page. Aucun listing d'utilisateurs, aucune action sans confirmation. En v0, ce bloc n'existe pas à l'écran.

## 4. États (à maquetter pour chaque bloc)

| État | Comportement |
|---|---|
| **Chargement** | Squelettes aux dimensions finales du bloc (pas de spinner plein écran). Le statut global reste « Chargement… » tant qu'un bloc n'a pas répondu. |
| **Succès** | Données, heure de dernière mise à jour. |
| **Vide** | Message explicatif propre à chaque bloc (par ex. « Aucun incident sur 30 jours », « Pas encore de passage enregistré » pour un cron neuf), jamais un bloc blanc. |
| **Erreur de source (« injoignable »)** | Le **bloc** affiche « Source indisponible » avec le nom de la source, l'heure de la dernière donnée connue (grisée) et un bouton « Réessayer ». C'est un état **Inconnu** (gris), **pas** « en panne ». |
| **Service réellement en panne** | État Problème (rouge), avec l'heure de début de l'incident. Distinct de l'état précédent par sa couleur, son icône et son libellé. |
| **Dégradé** | Orange : seuil dépassé ou retard, avec la valeur et le seuil. |
| **Session expirée** | Retour à l'écran de connexion, sans perdre l'environnement choisi. |
| **Pas d'accès admin** | Page « Accès refusé » neutre, sans révéler l'existence du back-office. |

**Règle clé** : le dashboard ne dit jamais « en panne » parce qu'il n'a pas pu interroger BetterStack ou le backend. Si le backend admin lui-même est injoignable, la page affiche « Impossible de joindre le backend » et renvoie vers BetterStack, qui reste la source d'alerte.

## 5. Contenu fr / en

Prévoir les libellés dans `messages/fr.json` et `en.json` (espace de noms `admin`) : titres de blocs, noms de statuts (Opérationnel / Dégradé / En panne / Inconnu), messages d'états vides et d'erreur, formats relatifs (« il y a 2 min »), libellés des liens sortants. Aucune chaîne dans les composants.

## 6. Livrable demandé au designer

- Les 6 blocs de la v0 et l'emplacement réservé de la v1, en clair et en sombre.
- Mobile (375 pt) et desktop (≥ 1280 px).
- Pour chaque bloc : chargement, succès, vide, source injoignable, panne, dégradé.
- Écrans annexes : connexion, accès refusé, switch Prod / Dev (bannière Dev).
- Spécification des composants réutilisables (carte de statut, jauge, ligne de service, ligne de cron, carte KPI).

## 7. Catalogue des features (vue d'ensemble pour la maquette)

| # | Feature | Écran / bloc | Story | Version | Source de données |
|---|---|---|---|---|---|
| 1 | Connexion admin (Supabase) | Écran de connexion | 10.3 / 10.4 | v0 | Supabase Auth, claim de rôle |
| 2 | Accès refusé | Page neutre | 10.4 | v0 | Claim + allowlist UUID |
| 3 | Switch Prod / Dev + bannière Dev | En-tête | 10.4 | v0 | Choix local |
| 4 | Statut global | 3.1 | 10.4 | v0 | Synthèse des blocs |
| 5 | Services (uptime 24 h / 30 j, dernier incident) | 3.2 | 10.1, 10.4 | v0 | BetterStack + `/health` |
| 6 | Versions déployées par service (version, tag Git, SHA) vs `main` / `develop`, mobile via App Store | 3.3 | 10.2, 10.4 | v0 | `GET /version` + API GitHub + iTunes Lookup |
| 7a | Accueil : check rapide + nombre d'utilisateurs + courbe de progression (utilisateurs / usage) | 3.0 | 10.3, 10.4 | v0 | `GET /admin/overview` (séries 90 j) |
| 7 | KPIs : utilisateurs, actifs 30 j, anonymes/permanents, abonnés, essais, checks/jour | 3.4 | 10.3, 10.4 | v0 | `GET /admin/overview` (SQL) |
| 8 | Crons et sauvegardes (dernier passage, retard) | 3.5 | 10.1, 10.3, 10.4 | v0 | Heartbeats |
| 9 | Serveur : CPU / RAM / disque / swap | 3.6 | 10.1, 10.4 | v0 | Agent BetterStack |
| 10 | Rafraîchissement auto 60 s + « Actualiser » | Global | 10.4 | v0 | — |
| 11 | Liens sortants BetterStack / PostHog / Sentry | Dans les blocs | 10.4 | v0 (PostHog/Sentry « bientôt ») | — |
| 12 | Thème clair/sombre, fr/en | Global | 10.4 | v0 | `ThemeToggle`, `messages/*.json` |
| 13 | Alertes email/SMS (hors écran) | — | 10.1 | v0 | BetterStack |
| 14 | Recherche utilisateur par email | Bloc « Offrir Premium » | 10.5 | v1 | Endpoint admin protégé |
| 15 | Offrir Premium (avec confirmation) | Bloc « Offrir Premium » | 10.5 | v1 | Endpoint admin protégé |
| 16 | Journal d'audit des actions | Bloc « Offrir Premium » | 10.5 | v1 | Table d'audit |
| 17 | Funnels et rétention PostHog, erreurs Sentry | Liens | 1.8 | Après branchement | PostHog / Sentry |
| 18 | Digest hebdo des KPIs | — | — | Plus tard | À cadrer |
