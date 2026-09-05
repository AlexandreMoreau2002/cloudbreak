# Userflow — Session (invité → compte)

Stories 2.5 / 2.6 / 2.8. Design figé le 2026-09-05 — handoff Claude Design
`/Users/alex/Downloads/design_handoff_parcours_compte/`.

1. Allumage de l'app
2. Onboarding (si jamais fait avant)
3. Écran Home
4. User cherche un sommet → voit un score. **Gratuit, sans compte.**
5. User fait une action qui demande un compte :
   - un 2e sommet le même jour, ou
   - ajouter un favori, ou
   - activer une alerte (post-MVP, non implémenté)
6. → Ouverture de la **page compte** (un seul écran générique, pas de message par
   déclencheur — décision du design : la copy est la même partout)
7. User crée un compte (Apple ou e-mail) **ou** se connecte à un compte existant
   - création par e-mail → **écran de code à 6 chiffres** avant de continuer
   - création par Apple → pas de code (adresse déjà vérifiée par Apple)
   - connexion → jamais de code, jamais de sondage
8. Si création : **mini-sondage** (2 questions, skippable)
9. Retour direct à l'action du point 5 (le favori se pose, le score s'affiche)

## Cas particuliers

- **Tout premier allumage de l'app sur le téléphone** : après l'onboarding, on propose la page
  compte. Pas obligatoire — lien "Explorer d'abord" vers la Home.
- **Déconnexion** (Profil → là où il n'y a plus de bouton déconnexion — voir handoff) : retour
  direct à la Home en invité.
- **Compte existant qui dépasse son quota** : il voit le Paywall, pas la page compte.
- **Connexion à un compte existant** : la session anonyme est abandonnée, pas de fusion.
