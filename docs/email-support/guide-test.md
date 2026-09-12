# Guide de test manuel — support e-mail de production

> Réception entrante et réponse Gmail via Brevo vérifiées le 2026-09-12. Le scénario de variable
> EAS et de build de production n’a pas été exécuté : il reste une action opérateur. Ce guide ne
> nécessite ni ne révèle aucun secret.

## But

Vérifier séparément que les utilisateurs peuvent écrire à
`contact@cloudbreak-app.com` et que l’opérateur peut leur répondre avec cette même adresse.

## Prérequis

- Accès opérateur à OVH DNS, ImprovMX, Gmail et Brevo.
- Une adresse externe contrôlée pour jouer le rôle d’utilisateur ; elle doit être différente de la
  boîte Gmail de l’opérateur si possible.
- La règle ImprovMX active pour `contact@cloudbreak-app.com` et l’expéditeur Gmail « Cloudbreak
  Support <contact@cloudbreak-app.com> » déjà configuré.
- Ne jamais coller de mot de passe, clé SMTP, jeton ni lien de validation dans les preuves de test.

## Scénario 1 — réception jusqu’à Gmail

1. Depuis l’adresse externe, envoyer un e-mail à `contact@cloudbreak-app.com`.
2. Utiliser un objet unique, par exemple `TEST SUPPORT YYYY-MM-DD HH:MM`, et une phrase courte.
3. Dans Gmail opérateur, rechercher cet objet dans **Tous les messages**.
4. Si le message est absent, vérifier Spam, Corbeille et les filtres Gmail.
5. Si le message est toujours absent, ouvrir ImprovMX et rechercher ce test dans les logs de
   livraison / activité. Vérifier ensuite les MX OVH : priorité 10 `mx1.improvmx.com`, priorité
   20 `mx2.improvmx.com`.

Résultat attendu : le message est visible dans Gmail, et son destinataire est
`contact@cloudbreak-app.com`.

## Scénario 2 — réponse via Gmail et Brevo

1. Répondre au message du scénario 1 depuis Gmail opérateur.
2. Avant l’envoi, contrôler le champ « De » : il doit afficher
   `Cloudbreak Support <contact@cloudbreak-app.com>`.
3. Envoyer une réponse courte contenant l’heure du test.
4. Depuis l’adresse externe, confirmer la réception et vérifier que l’expéditeur affiché est
   `contact@cloudbreak-app.com`.
5. Si elle manque, vérifier d’abord **Messages envoyés** et les éventuelles erreurs Gmail, puis
   les journaux de transaction Brevo pour le destinataire et l’heure concernés. Enfin, vérifier
   Spam/quarantaine côté destinataire.

Résultat attendu : la réponse arrive, affiche l’identité Cloudbreak Support et appartient au même
fil de conversation ou porte l’objet de test attendu.

## Scénario 3 — configuration de build mobile (contrôle opérateur)

1. Ouvrir le dashboard EAS de l’environnement de production.
2. Confirmer que `EXPO_PUBLIC_SUPPORT_EMAIL` vaut exactement
   `contact@cloudbreak-app.com`.
3. Ne pas copier la valeur d’un mot de passe ou d’une clé SMTP : cette variable est une adresse
   publique, les secrets d’envoi restent dans les services concernés.
4. Lancer le build de production selon le processus de release habituel, puis ouvrir le lien de
   support depuis l’app sur un appareil de test.

Résultat attendu : le lien ouvre un nouveau message à destination de
`contact@cloudbreak-app.com`. Le fallback source protège une omission accidentelle, mais ne doit
pas remplacer cette vérification du dashboard.

## Cas limites et diagnostic

| Symptôme | Vérifier dans cet ordre | Ne pas faire |
|---|---|---|
| Réception absente | Adresse → MX OVH → alias/log ImprovMX → spam/filtres Gmail | Modifier Brevo : il est hors du flux entrant |
| Réponse absente | Expéditeur Gmail → Messages envoyés → état/log Brevo → spam destinataire | Modifier les MX : ils ne pilotent pas l’envoi SMTP |
| Gmail envoie depuis une adresse personnelle | Sélecteur « De » et réglage « envoyer en tant que » | Répondre avec l’identité personnelle « juste pour tester » |
| Brevo indique un domaine non authentifié | État Brevo → enregistrements DNS exacts fournis par Brevo → propagation | Créer un second SPF ou supprimer des enregistrements existants |
| Alias ImprovMX inactif ou mauvaise destination | Alias et destination dans ImprovMX → logs ImprovMX | Publier `contact@dev.cloudbreak-app.com` : ce n’est pas une adresse publique |

## Checklist finale

- [ ] Les MX OVH de la racine sont `10 mx1.improvmx.com` et `20 mx2.improvmx.com`.
- [ ] ImprovMX affiche un alias actif pour `contact@cloudbreak-app.com` vers la boîte Gmail opérateur.
- [ ] Un e-mail externe atteint Gmail.
- [ ] La réponse part de `Cloudbreak Support <contact@cloudbreak-app.com>`.
- [ ] La réponse est reçue sur l’adresse externe et n’est pas classée comme spam.
- [ ] Brevo signale le domaine/l’expéditeur comme opérationnel et trace l’envoi de test.
- [ ] EAS production contient `EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com` avant le build.
- [ ] Aucun secret, lien de confirmation ni token n’a été enregistré dans une preuve de test.
