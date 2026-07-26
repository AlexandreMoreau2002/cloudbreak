# Cloudbreak — Idées produit, acquisition et opérations

> Carnet d'idées non validées. Ce document sert à conserver les pistes issues des réflexions produit, marketing et techniques avant leur transformation éventuelle en story, décision ou plan d'action.
>
> Dernière mise à jour : 2026-07-26

## Règles d'usage

- Une idée ici n'est pas une décision ni un engagement de développement.
- Une idée devient une story seulement après cadrage du problème, de la valeur, des dépendances et de la métrique de succès.
- Le suivi opérationnel court terme reste dans [`TODO.md`](../TODO.md).
- La page Notion [Cloudbreak — mer de nuage](https://app.notion.com/p/325964bda18580358585ff14ef1f76c6) reste une source parallèle à synchroniser manuellement.

## Idées capturées le 2026-07-26

| Idée | Domaine | Tags | Statut initial | Prochaine question |
|---|---|---|---|---|
| Demander le profil ou la pratique de l'utilisateur pendant l'onboarding pour personnaliser l'expérience et éventuellement recommander une formule | Produit / onboarding | `marketing` `conversion` | À explorer — retenir l'idée, pas encore la mécanique | Quelle personnalisation apporte une valeur immédiate sans parler de prix trop tôt ? |
| Publier un post ou sondage dans les groupes montagne pour comprendre comment les gens cherchent une mer de nuage et récupérer des prospects | Marketing / discovery | `marketing` `acquisition` `CRM` | À explorer | Quel formulaire de liste d'attente avec consentement explicite utiliser ? |
| Permettre de soumettre un sommet absent de l'application | Produit / données | `acquisition` `engagement` | À explorer | Formulaire public, modération, dédoublonnage et délai d'intégration ? |
| Vérifier la parallélisation et la tenue en charge du backend si le nombre d'utilisateurs augmente | Technique / fiabilité | — | À cadrer | Quels endpoints mesurer et quel volume cible simuler avant de choisir une optimisation ? |
| Clarifier la création de compte dans l'application | Produit / auth | — | À documenter | Le flux email/mot de passe existe déjà ; il faut surtout clarifier l'expérience et la confirmation email avant release. |
| Préparer une newsletter de pré-lancement | Marketing / CRM | `marketing` `acquisition` `CRM` | À cadrer | Quelle landing page, quel fournisseur, quel consentement et quelle séquence d'emails ? |

## Premières orientations

### Onboarding et profil utilisateur

Conserver la collecte de contexte utilisateur, mais éviter de demander un profil détaillé ou de présenter les prix dès les premières secondes. Une version légère pourrait demander la pratique principale (photo, randonnée, alpinisme, découverte) afin d'adapter les exemples, le contenu et les futures alertes. La recommandation d'abonnement doit venir après que la valeur de Cloudbreak est comprise.

### Acquisition et liste de prospects

Le post ou sondage doit d'abord servir à apprendre : comment les utilisateurs repèrent-ils une mer de nuage, quelles sources consultent-ils, et quelle frustration les fait sortir à 5 h du matin ? La collecte d'email doit être optionnelle, explicitement consentie et séparée des réponses au sondage. Éviter toute collecte ou export de membres sans consentement.

### Sommets manquants

La soumission communautaire peut devenir un petit levier d'acquisition et d'amélioration de la couverture. Elle devra rester modérée : nom, coordonnées ou région, altitude si connue, source éventuelle, puis validation avant insertion dans la base.

### Performance backend

Avant d'optimiser, mesurer : latence du score, appels météo, taux de cache Redis, accès PostgreSQL, consommation mémoire et comportement lors de requêtes simultanées. L'objectif est de vérifier que le calcul d'un score ne bloque pas les autres requêtes et que les appels météo sont correctement mutualisés/cachés.

### Compte utilisateur actuel

Cloudbreak utilise Supabase Auth avec inscription et connexion par email/mot de passe. Le formulaire mobile bascule entre connexion et création de compte. La confirmation email est désactivée en développement et doit être réactivée avant la release ; ce point est déjà suivi dans [`TODO.md`](../TODO.md) et la documentation d'authentification.

### Newsletter pré-lancement

Le besoin minimal est une liste d'attente séparée des comptes Cloudbreak : landing page, formulaire email, consentement explicite, double opt-in, fournisseur d'envoi et lien de désinscription. Ne pas réutiliser automatiquement les emails de comptes utilisateurs pour du marketing sans consentement spécifique.

## À ne pas transformer tout de suite en feature

- Profil onboarding complexe avec segmentation tarifaire.
- Système complet de newsletter avant d'avoir une promesse et une audience testées.
- Optimisations backend sans mesure de charge reproductible.
- Ajout automatique de sommets soumis sans modération.
