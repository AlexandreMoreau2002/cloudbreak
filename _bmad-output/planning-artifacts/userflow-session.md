# Userflow — Session (invité → compte)

Stories 2.5 / 2.6 / 2.8.

1. Allumage de l'app
2. Onboarding (si jamais fait avant)
3. Écran Home
4. User cherche un sommet → voit un score. **Gratuit, sans compte.**
5. User fait une action qui demande un compte :
   - un 2e sommet le même jour, ou
   - ajouter un favori, ou
   - activer une alerte
6. → Ouverture du panel "Connexion / Créer un compte"
7. User crée un compte (email ou Apple) **ou** se connecte à un compte existant
8. Retour direct à l'action du point 5 (le favori se pose, le score s'affiche)

## Cas particuliers

- **Tout premier allumage de l'app sur le téléphone** : après l'onboarding, on propose l'écran
  "Créer un compte" en plein écran. Pas obligatoire — bouton "Explorer d'abord" vers la Home.
- **Déconnexion** (Profil → Se déconnecter) : retour direct à la Home en invité. Jamais
  d'écran de connexion imposé.
- **Compte existant qui dépasse son quota** : il voit le Paywall, pas ce panel.
