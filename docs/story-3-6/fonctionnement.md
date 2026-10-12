# Story 3.6 — Universal Links : comment ça marche

## Le problème

Quand quelqu'un partage `<hôte ops de l'env>/sommet/mont-blanc`, on veut que :
- si l'app est installée : elle s'ouvre directement sur le Mont Blanc ;
- sinon : une page web propose de télécharger l'app.

## Le principe (version enfant)

Imagine un videur à l'entrée d'une boîte de nuit. Quand tu cliques sur un lien, iOS est le videur.
- L'app dit à iOS : « je gère les liens de l'hôte `ops` de mon environnement » (`associatedDomains`,
  calculés dans `mobile/app.config.ts` via `mobile/plugins/associatedDomains.js`, plus dans `app.json`).
- Pour vérifier que c'est vrai, iOS va lire un papier officiel sur le site : le fichier
  `apple-app-site-association` (AASA). Il dit : « l'app `TeamID.com.alexandremoreau.cloudbreak`
  a le droit d'ouvrir les liens `/sommet/*` ».
- Si les deux papiers concordent, iOS ouvre l'app. Sinon, il ouvre Safari.

## Le lien selon l'environnement

Le domaine racine `cloudbreak-app.com` n'héberge rien : tout passe par `ops` (web), `api` (backend)
ou le mobile. L'hôte du lien de partage vient de `EXPO_PUBLIC_LEGAL_BASE_URL` (même variable que
les liens légaux) :

| Env | Hôte du lien | Associated Domain iOS |
|-----|--------------|-----------------------|
| local | `http://localhost:3100` | aucun (Apple exige du https réel) |
| dev | `https://dev-ops.cloudbreak-app.com` | `applinks:dev-ops.cloudbreak-app.com?mode=developer` |
| prod (défaut si variable absente) | `https://ops.cloudbreak-app.com` | `applinks:ops.cloudbreak-app.com` |

`?mode=developer` est ajouté automatiquement selon l'hôte : rien à retirer à la main avant la prod.
`APPLE_TEAM_ID` est posée dans Dokploy (app `cloudbreak-ops`) ; `NEXT_PUBLIC_APP_STORE_URL` reste
vide tant que l'app n'est pas publiée (la page de repli affiche « L'app arrive bientôt »).

## Schéma du flux

```
 Lien <hôte ops de l'env>/sommet/mont-blanc
                    |
                    v
                   iOS
        (a lu l'AASA à l'installation)
          |                       |
  app installée ?            app absente
          |                       |
          v                       v
   Cloudbreak s'ouvre         Safari ouvre la page ops
   route /sommet/[slug]       /fr/sommet/mont-blanc
          |                       |
          v                       v
   slug mémorisé            bouton "Télécharger sur
   (AsyncStorage)           l'App Store"
          |
          v
   redirection vers les onglets
          |
          v
   usePendingPeakLink (monté dans _layout)
   attend : session + onboarding terminé
          |
          v
   fetchPeakBySlug -> setSelectedPeak -> le sommet s'affiche
```

## Cas non connecté / premier lancement

L'app a été installée mais l'utilisateur n'a pas fini l'onboarding (ou n'a pas encore de session).
1. La route `/sommet/[slug]` valide le slug (`^[a-z0-9-]{1,100}$`) et le range dans AsyncStorage
   (clé `pendingPeakSlug`), puis redirige vers `/(tabs)`.
2. Le garde d'auth envoie l'utilisateur vers l'onboarding / connexion comme d'habitude.
3. Dès que la session existe et que l'onboarding est terminé (et qu'on n'est plus sur
   `onboarding` ni `sommet`), `usePendingPeakLink` lit le slug, l'efface, appelle `fetchPeakBySlug`
   et sélectionne le sommet.
4. Slug inconnu (404) : alerte « Sommet introuvable ». Autre erreur : alerte « Lien impossible à
   ouvrir ». Slug malformé : ignoré, on arrive simplement sur l'accueil.

## Fichiers impactés

**ops/** (Next.js)
- `app/.well-known/apple-app-site-association/route.ts` + `route.test.ts` : sert l'AASA (JSON, 500 si `APPLE_TEAM_ID` absent)
- `app/[locale]/sommet/[slug]/page.tsx` + `page.test.tsx` : page de repli vers l'App Store (fr uniquement)
- `messages/fr.json` : clés `sommet.*`
- `.env.example` : `APPLE_TEAM_ID`, `NEXT_PUBLIC_APP_STORE_URL`
- `e2e/universal-links.spec.ts` (+ `playwright.config.ts` pour `APPLE_TEAM_ID`) : pas de redirection sur le `.well-known`

**mobile/**
- `src/utils/pendingPeakLink.ts` + test : validation et stockage du slug en attente
- `src/hooks/usePendingPeakLink.ts` + test : consommation du slug
- `src/app/sommet/[slug].tsx` + `src/__tests__/app/sommet-slug.test.tsx` : route du deep link
- `src/app/_layout.tsx` + `src/__tests__/app/root-layout.test.tsx` : monte le hook
- `src/locales/fr.ts`, `en.ts` : clés `deepLink.*`
- `app.config.ts` + `plugins/associatedDomains.js` : `associatedDomains` calculés selon l'environnement

**Racine** : `docs/story-3-6/`, `http/story-3-6.http`, `docs/environnements.md`, `docs/versions.md`, `TODO.md`, `CLAUDE.md`.
