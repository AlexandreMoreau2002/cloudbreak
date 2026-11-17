# PostHog Product Analytics — guide de test dev/TestFlight

## But et garde-fous

Valider que la build native envoie uniquement la taxonomie produit autorisée vers le projet
PostHog **dev/TestFlight**. Ne jamais faire ce test avec une clé, un projet ou du trafic de
production publique.

## Prérequis

- Le projet PostHog dev/TestFlight est ouvert dans le navigateur, section Live Events.
- Dokploy dev contient `POSTHOG_API_KEY` et `POSTHOG_HOST` du projet dev, sans copier les valeurs
  dans les logs ; le backend est redéployé après l'enregistrement.
- L'environnement EAS de la build de test contient `EXPO_PUBLIC_POSTHOG_KEY` et
  `EXPO_PUBLIC_POSTHOG_HOST` du même projet dev.
- Une nouvelle build iOS native est créée et distribuée via TestFlight. Expo Go ne suffit pas pour
  vérifier cette dépendance native.
- Aucune variable PostHog de production n'est posée et aucun projet de production n'est utilisé.

## Scénario de validation

1. Ouvrir Live Events dans le projet PostHog dev/TestFlight et noter l'heure de départ.
2. Installer la build TestFlight, ouvrir l'app et parcourir l'onboarding, une recherche et la
   consultation d'un sommet. Utiliser un compte de test sans donnée personnelle réelle.
3. Réaliser une action métier existante, par exemple calculer un score ou ajouter/supprimer un
   favori ; vérifier les événements mobile puis backend attendus dans Live Events.
4. Pour chaque événement observé, vérifier que son nom appartient à la taxonomie et que ses
   propriétés sont des valeurs prévues (enum, booléen, nombre borné, date ou identifiant
   pseudonyme). Ne relever ni e-mail, ni jeton, ni texte libre, ni coordonnées précises.
5. Vérifier dans les réglages et Live Events qu'il n'y a ni replay, ni événements d'autocapture,
   ni rage click, ni erreur/log PostHog, ni profil de personne créé par ce test.
6. Vérifier séparément que les erreurs contrôlées restent du ressort de Sentry et que l'uptime
   reste du ressort de Better Stack ; aucun des deux ne doit être remplacé par PostHog.

## Cas limites obligatoires

1. Retirer temporairement les variables PostHog de l'environnement de test, redéployer/rebuilder
   la cible concernée, puis répéter une action : l'app/API doit démarrer et aucun événement ne doit
   apparaître dans Live Events.
2. Vérifier qu'une tentative d'événement inconnu ou de propriété libre est ignorée par les tests
   automatisés ; ne pas ajouter de route de debug publique pour cela.
3. Confirmer que `auth_submitted` est absent des événements reçus tant que son `error_code` n'a pas
   été réduit à un enum stable.

## Checklist de sortie

- [ ] Les quatre variables sont présentes uniquement dans Dokploy/EAS de test.
- [ ] La build iOS dev/TestFlight démarre normalement.
- [ ] Les événements attendus sont visibles dans le projet dev/TestFlight.
- [ ] Aucun champ personnel/libre ni produit automatique PostHog n'est observé.
- [ ] La désactivation par variable absente est confirmée.
- [ ] Aucun trafic de production publique n'a été envoyé.
- [ ] La création d'un projet PostHog de production séparé reste planifiée avant activation publique.
