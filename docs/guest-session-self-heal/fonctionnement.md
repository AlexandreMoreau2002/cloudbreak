# Auto-réparation de la session invitée

## Le concept, version enfant

Imagine un club. Quand tu arrives, on te donne un **badge** : tu le gardes dans ta poche (c'est le JWT stocké sur ton téléphone). Le club a aussi un **registre** à l'accueil (c'est Supabase) avec la liste de tous les membres.

Un jour, quelqu'un efface ton nom du registre (l'invité est supprimé côté serveur). Ton badge est toujours dans ta poche, il a l'air normal, mais à la porte on te dit : « Ce membre n'existe pas ». Avant, l'app restait bloquée devant la porte, sans rien dire.

Maintenant, l'app est plus maligne : elle va à l'accueil, demande un **badge neuf** d'invité, remplace le vieux par le neuf (elle n'est **jamais** sans badge, même une seconde), puis retente la même chose. Toi, tu ne vois rien.

## Le flux

```
Utilisateur ajoute un e-mail  ou  crée un compte Apple
        │
        ▼
 Supabase répond 403 « User from sub claim in JWT does not exist »
 (ou code user_not_found) = l'invité n'existe plus
        │
        ▼
 l'app vérifie : étape réparable ? session anonyme ?
        │ oui
        ▼
 l'app demande un badge neuf (signInAnonymously : POST /signup, sans le vieux badge)
        │
        ▼
 le badge neuf REMPLACE le vieux d'un coup (événement SIGNED_IN, pas de SIGNED_OUT)
 → la session n'est jamais « vide », AuthGuard ne bouge pas,
   l'utilisateur reste sur l'écran de compte
        │
        ▼
 l'app rejoue la même demande UNE fois ──► succès : l'utilisateur ne voit rien
                                       └─► échec : l'erreur d'ORIGINE s'affiche
```

Deux actions sont réparées :

| Action | Ce que fait l'app |
|--------|-------------------|
| `apple_identity_link` (création de compte Apple, `linkIdentity`) | si session anonyme : badge neuf + rejeu |
| `email_otp_start` (ajout d'e-mail, `updateUser`) | si session anonyme : badge neuf + la locale suit le nouvel invité (`onRecovered`) + rejeu |

Si la création du nouvel invité échoue (réseau coupé, erreur), l'app renvoie l'erreur d'ORIGINE de l'action, et l'ancien badge (mort) reste en place, comme avant le correctif.

## Pourquoi la connexion Apple n'est pas concernée

Se connecter avec Apple (`signInWithIdToken`, étape `apple_id_token_sign_in`) ne montre pas le vieux badge à la porte : d'après le code installé de `@supabase/auth-js` 2.108.2, seuls `linkIdentity` et `updateUser` envoient le JWT de la session. Un invité supprimé ne peut donc pas provoquer ce 403 sur la connexion : il n'y a rien à réparer.

## Les limites

- **Un seul rejeu** : si ça rate une deuxième fois, l'erreur normale s'affiche. Pas de boucle infinie.
- **Message exact** : seul le message `User from sub claim in JWT does not exist` (ou le code `user_not_found`) déclenche la réparation. Un JWT cassé (`bad_jwt`, « missing sub claim ») n'est PAS confondu avec un invité supprimé. Le démarrage de l'app (`getUser()`) reconnaît le même message.
- **Un compte permanent n'est jamais transformé en invité** : la réparation n'a lieu que si la session est anonyme.
- **Pas les étapes mot de passe / reset** : ce sont des comptes permanents.
- **L'abonnement lié à l'ancien invité n'est pas récupéré** : il appartenait à un badge qui n'existe plus. « Restaurer les achats » le rattache au nouvel invité.
- **Confidentialité** : les logs ne contiennent que `{ stage, outcome }`, jamais de token, d'e-mail ni de message Supabase brut. Un log `auth_error` précède `session_recovered` (attendu).

## Fichiers impactés

- `mobile/src/contexts/AuthContext.tsx` : détection (`isDeletedUserError`), `runAuthOperation`, `replaceWithFreshGuestSession`, `SELF_HEALING_STAGES`, rejeu unique
- `mobile/src/contexts/AuthContext.test.tsx` : tests des deux étapes, des échecs et des étapes exclues
- `mobile/package.json` : `testTimeout` global de 15 s dans la config Jest
- `mobile/docs/security.md` : note de sécurité
- `TODO.md` : entrée « Session invitée supprimée » retirée
