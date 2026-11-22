# Maquettes Ops console (copie du code de l'artifact)

Copie du code source de l'artifact privé « Cloudbreak Ops » (https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB, non accessible sans connexion). Les données affichées sont fictives. **Source de vérité visuelle** : à lire par Codex à la place de l'artifact.

## Voir les maquettes

Ouvrir `index.html` dans un navigateur (nécessite Internet : React et les polices sont chargés depuis un CDN). Chaque frame porte son identifiant (`HOME-01`…) dans sa légende ; boutons de langue et de thème en haut de page.

## Lire le code

- `app.js` : tout en un fichier. Les composants d'écran sont `CBOpsHome`, `CBOpsHealth`, `CBOpsDeployments`, `CBOpsUsers` (et les écrans d'accès, toasts, erreurs). Un scénario (`scn`) choisit l'état affiché : nominal, dégradé, panne de l'API, source injoignable, chargement, vide…
- **Dictionnaire fr/en** : tableau de triplets `[clé, fr, en]` (ex. `["gauge.swap", "Swap", "Swap"]`) : base des fichiers `messages/fr.json` et `en.json`, espace `admin`. Ne pas recopier les données fictives (valeurs, dates).
- **Jetons de design** (couleurs, polices, ombres) : variables `--cb-*` dans le `<style>` de `index.html`, thèmes clair et sombre.
- Le tableau de frames (`["HOME-01", légende fr, légende en, …]`, vers la ligne 1070 de `app.js`) donne la correspondance identifiant → écran → scénario.

## Index des frames

| Identifiant | Légende |
|---|---|
| `HOME-01` | Desktop clair |
| `HOME-02` | Mobile clair |
| `HOME-03` | Desktop sombre (usage, 90 j) |
| `HOME-04` | Mobile sombre |
| `HOME-05` | Dégradé · desktop |
| `HOME-06` | Panne de l’API · mobile |
| `HOME-07` | BetterStack injoignable · desktop |
| `HOME-08` | Chargement · mobile |
| `HOME-09` | Chargement partiel · desktop |
| `HOME-10` | État vide · desktop |
| `HOME-11` | Hors connexion · mobile |
| `SAN-01` | Desktop |
| `SAN-02` | Mobile dégradé |
| `SAN-03` | Panne de l’API · desktop |
| `SAN-04` | Cron en retard et en échec · desktop |
| `SAN-05` | BetterStack injoignable · desktop |
| `SAN-06` | État vide (crons jamais passés) · mobile |
| `SAN-07` | Chargement · desktop |
| `SAN-08` | Chargement partiel · mobile |
| `DEP-01` | Desktop |
| `DEP-02` | Mobile en retard |
| `DEP-03` | GitHub injoignable · desktop |
| `DEP-04` | Panne de l’API · mobile |
| `DEP-05` | Chargement · desktop |
| `DEP-06` | App Store injoignable · mobile |
| `USR-01` | Desktop |
| `USR-02` | Mobile sombre |
| `USR-03` | Backend injoignable · mobile |
| `USR-04` | Chargement · desktop |
| `USR-05` | État vide · desktop |
| `NAV-01` | Préférences et déconnexion · mobile |
| `TST-01` | Toasts · desktop |
| `TST-02` | Toasts · mobile |
| `ERR-01` | Erreur inattendue · desktop |
| `ERR-02` | Page introuvable · mobile |
| `ACC-01` | Connexion · desktop |
| `ACC-02` | Session expirée · mobile |
| `ACC-03` | Accès refusé · desktop sombre |
| `ACC-04` | Connexion en cours · mobile |
| `ACC-05` | Identifiants incorrects · desktop |
| `ACC-06` | Service injoignable · mobile |
| `LEG-01` | CGU · connecté · desktop |
| `LEG-02` | Confidentialité · non connecté · mobile |
| `V1-01` | Offrir Premium · desktop |
| `V1-02` | Confirmation · mobile |
| `V1-03` | Compte introuvable · desktop |
| `V1-04` | Abonnement Apple actif · mobile |
| `V1-05` | Recherche en cours · desktop |
