# Support e-mail de production

> Runbook opérateur, sans secrets. Dernière vérification manuelle : 2026-09-12.

## L’idée, simplement

`contact@cloudbreak-app.com` est l’adresse affichée aux utilisateurs. Elle n’est pas une boîte
mail hébergée chez OVH : plusieurs services se passent le relais pour que l’opérateur lise les
messages dans Gmail et y réponde avec l’adresse Cloudbreak.

```text
1. Un utilisateur écrit à contact@cloudbreak-app.com
2. OVH indique où remettre le courrier
3. ImprovMX le transfère vers Gmail
4. L’opérateur le lit et répond dans Gmail
5. Gmail confie l’envoi à Brevo
6. Brevo remet la réponse au destinataire
```

## Les deux flux indépendants

### Réception d’un message

```text
Expéditeur
    ↓ e-mail vers contact@cloudbreak-app.com
DNS OVH — MX de cloudbreak-app.com
    ├─ priorité 10 : mx1.improvmx.com
    └─ priorité 20 : mx2.improvmx.com
    ↓
ImprovMX — règle de transfert de contact@cloudbreak-app.com uniquement
    ↓
Boîte Gmail de l’opérateur
```

### Réponse envoyée par l’opérateur

```text
Gmail — interface opérateur
    ↓ expéditeur sélectionné : Cloudbreak Support <contact@cloudbreak-app.com>
Brevo SMTP — authentifie et transmet l’e-mail sortant
    ↓
Destinataire
```

Un problème de réception ne prouve rien sur l’envoi, et inversement : les diagnostiquer séparément.

## Qui fait quoi

| Service | Responsabilité | Ne fait pas |
|---|---|---|
| OVH | Héberge la zone DNS, dont les MX et les enregistrements d’authentification fournis par les services | Ne lit, ne transfère et n’envoie aucun e-mail de support |
| ImprovMX | Reçoit le courrier dirigé par les MX et transfère l’alias `contact@cloudbreak-app.com` vers Gmail | N’est pas une boîte de travail et n’envoie pas les réponses |
| Gmail | Boîte de lecture de l’opérateur et interface pour rédiger/répondre | N’héberge pas les MX du domaine et ne remplace pas Brevo pour cet expéditeur |
| Brevo | Authentifie `cloudbreak-app.com` et transporte les réponses SMTP de Gmail | Ne reçoit pas les messages entrants de support |

Seule `contact@cloudbreak-app.com` est publique. **`contact@dev.cloudbreak-app.com` n’est pas une
adresse publique** et ne doit figurer ni dans l’app, ni dans les pages légales, ni dans une réponse
aux utilisateurs.

## DNS et authentification : frontières à respecter

- Les MX de la racine `cloudbreak-app.com` sont exactement `10 mx1.improvmx.com` et
  `20 mx2.improvmx.com`. Une modification de MX coupe potentiellement toute la réception.
- ImprovMX peut demander un TXT de contrôle de son côté ; son tableau de bord est la référence
  pour ce TXT et pour la règle de transfert.
- Brevo fournit les enregistrements d’authentification sortante (SPF/DKIM et, si configuré,
  DMARC). Brevo est la référence pour leurs valeurs ; OVH ne fait que les publier dans le DNS.
- Il ne doit exister qu’un seul enregistrement SPF pour un même nom DNS. S’il faut ajouter un
  expéditeur autorisé, fusionner sa valeur à l’enregistrement existant, jamais en créer un second.
- Ne pas supprimer ni réécrire un enregistrement d’authentification « pour essayer ». Relever
  l’état existant, appliquer la consigne exacte du fournisseur concerné, puis attendre la
  propagation DNS avant de revérifier.

## Diagnostic d’incident : ordre sûr

Commencer par déterminer si l’échec concerne **la réception** ou **la réponse**. Envoyer ensuite
un seul message de test, depuis une adresse contrôlée, avec une heure et un objet uniques. Cela
évite de confondre plusieurs tentatives ou des spams retardés.

### Le message entrant n’arrive pas dans Gmail

1. Vérifier l’adresse destinataire : elle doit être exactement `contact@cloudbreak-app.com`.
2. Vérifier dans OVH les deux MX racine et leurs priorités : `10 mx1.improvmx.com`,
   `20 mx2.improvmx.com`.
3. Dans ImprovMX, vérifier que le domaine est actif, que l’alias `contact@cloudbreak-app.com`
   existe et que sa destination est la boîte Gmail opérateur attendue. Consulter les logs de
   livraison / d’activité ImprovMX pour le message de test.
4. Dans Gmail, rechercher l’objet et l’expéditeur dans **Tous les messages**, puis contrôler
   Spam, Corbeille, les filtres et les règles de transfert éventuelles.
5. Si ImprovMX indique un rejet ou un transfert échoué, corriger uniquement la cause indiquée
   dans ImprovMX ; ne pas modifier Brevo, qui ne participe pas à la réception.

### La réponse Gmail n’arrive pas chez le destinataire

1. Dans le brouillon ou le message envoyé, confirmer l’expéditeur choisi :
   `Cloudbreak Support <contact@cloudbreak-app.com>`, pas une adresse personnelle.
2. Vérifier dans Gmail le dossier **Messages envoyés** et toute erreur d’envoi visible. Vérifier
   aussi que le destinataire et son domaine sont corrects.
3. Dans Gmail, vérifier que l’option « envoyer en tant que » Cloudbreak utilise toujours le SMTP
   Brevo configuré ; ne pas remplacer les paramètres SMTP ni ressaisir de secret.
4. Dans Brevo, contrôler l’état du domaine et de l’expéditeur, puis les journaux de transaction
   pour ce destinataire et cette heure : envoyé, différé, rejeté ou rebondi.
5. Si Brevo a accepté le message, demander au destinataire de contrôler spam/quarantaine. Si
   Brevo refuse le message, suivre l’état ou la raison affichée par Brevo avant toute modification
   DNS.

### Un changement DNS semble nécessaire

1. Identifier le propriétaire du problème : MX/routage entrant → ImprovMX ; authentification ou
   envoi sortant → Brevo.
2. Photographier ou noter les enregistrements OVH actuels et l’état affiché par le fournisseur.
3. Changer un seul enregistrement explicitement demandé par le fournisseur, sans toucher aux MX
   lorsqu’on traite uniquement l’envoi.
4. Attendre la propagation, revérifier le statut fournisseur, puis refaire les deux tests manuels.

## Opérations sûres et limites

- Les mots de passe, clés SMTP, liens de confirmation Google/Brevo, jetons et URL privées ne sont
  jamais copiés dans le dépôt, dans un ticket, ni dans ce runbook.
- Le dashboard de déploiement EAS est une action opérateur : la valeur de production à y saisir
  est `EXPO_PUBLIC_SUPPORT_EMAIL=contact@cloudbreak-app.com`. Le code possède un fallback sûr,
  mais la configuration explicite reste requise avant le build.
- Une réponse depuis Gmail doit toujours utiliser l’identité Cloudbreak Support ; vérifier le
  champ « De » avant l’envoi, surtout après une modification de compte ou de navigateur.
- Le support e-mail est distinct des e-mails Supabase Auth et de toute future messagerie
  transactionnelle backend. Ne pas déduire leurs états l’un de l’autre.

## Preuve actuelle

Le transfert entrant vers Gmail et une réponse sortante via Brevo ont été vérifiés manuellement le
2026-09-12. Cette preuve ne dispense pas des contrôles ci-dessus après un changement de DNS, de
règle ImprovMX, de compte Gmail ou de configuration Brevo.
