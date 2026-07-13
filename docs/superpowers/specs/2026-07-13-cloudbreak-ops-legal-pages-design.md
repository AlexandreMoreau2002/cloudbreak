# Cloudbreak Ops — pages légales (v1) — design

## Contexte

La story 4.4 (`_bmad-output/implementation-artifacts/4-4-conformite-apple-app-store.md`) exige des pages CGU et Privacy accessibles publiquement pour la soumission App Store. Elles sont actuellement servies en HTML statique par le backend (`backend/app/legal/cgu.html`, `privacy.html`, montées via `StaticFiles` sur `/legal/*`).

Le PRD mentionne par ailleurs un futur "Dashboard Ops Admin web" (Next.js, DA Cloudbreak dark, déployé sur Dokploy) — resté au stade d'idée V2 dans le PRD, jamais transformé en epic/story.

Décision : au lieu de patcher le backend, on crée un nouveau service web dédié — `cloudbreak-ops` — qui portera à terme le dashboard ops, et qui démarre avec le strict nécessaire pour les stores : les pages CGU et Privacy. Le backend garde ses fichiers `app/legal/*.html` en parallèle pour l'instant ; leur retrait/redirection est un chantier séparé, hors scope ici.

## Objectif de ce chantier (scope)

Poser la **base propre** du nouveau repo `cloudbreak-ops` avec uniquement les 2 pages légales (CGU, Privacy), au même niveau de qualité que `backend/` et `mobile/` : stack, archi, i18n-ready, accessibilité, lint, tests unitaires, tests e2e, build, le tout dans une seule commande `npm run validate`, CLAUDE.md, README, docs/, git flow, variables d'env propres.

Hors scope (chantiers futurs, non traités ici) :
- Dashboard ops (métriques, `/admin/metrics`, auth admin)
- Déploiement effectif sur Dokploy / sous-domaine réel
- Retrait des pages légales du backend
- Traduction EN (structure i18n prête, contenu FR uniquement)

## Stack

- **Next.js 15 (App Router)**, TypeScript strict
- **next-intl** pour l'i18n — un seul locale actif (`fr`) au démarrage, mais toutes les strings passent par `t()`, aucun texte hardcodé dans les composants
- **ESLint + Prettier**, **Vitest** (tests unitaires), **Playwright** (e2e)
- Pas de backend propre à ce service pour l'instant : pages statiques/SSG, aucun appel API, aucun secret requis au démarrage

## Structure du repo

```
cloudbreak-ops/
├── .env.example              # toutes les vars, jamais de valeur en dur dans le code
├── .env                       # gitignored
├── CLAUDE.md                  # conventions du repo (calqué sur backend/mobile)
├── README.md                  # présentation du repo, but, install, commandes, structure, déploiement (roadmap)
├── docs/
│   └── story-1-legal-pages.md
├── app/
│   └── [locale]/
│       ├── layout.tsx          # layout partagé (header minimal, footer)
│       ├── cgu/page.tsx
│       └── privacy/page.tsx
├── messages/
│   └── fr.json                 # contenu i18n
├── src/
│   ├── content/                # contenu structuré CGU/Privacy (pas de HTML en dur dans les composants)
│   └── lib/
├── e2e/
│   └── legal-pages.spec.ts     # Playwright : rendu, TOC, lang attribute
├── tests/                      # Vitest : composants, config i18n
├── next.config.ts
├── package.json                # script "validate" = lint && typecheck && test && build && test:e2e
└── .github/workflows/ci.yml    # lint+typecheck+test+build sur PR, même logique que backend/mobile
```

## i18n & accessibilité

- Un seul dossier de messages actif (`messages/fr.json`) mais structure multi-locale prête (`app/[locale]/...`) pour ajouter `en.json` sans refactor
- HTML sémantique (`<main>`, `<nav>`, hiérarchie `<h1>`-`<h2>` correcte pour la table des matières), `lang="fr"` dynamique via le segment `[locale]`, focus visible, contraste vérifié sur la palette dark

## Contenu des pages

CGU et Privacy réécrites from scratch en s'appuyant sur :
- Les AC1/T1 de la story 4.4 (contenu légal minimal attendu par Apple : données collectées, SDK tiers, hébergement UE, droit à l'effacement, contact)
- Le rendu visuel de référence fourni par l'utilisateur (`/Users/alex/Downloads/Cloud Break/cgu.html` + `styles.css`) — tokens CSS DA Cloudbreak (dark), layout sticky header + TOC à deux colonnes + sections numérotées

## Variables d'environnement

`.env.example` tenu à jour à chaque ajout. Au démarrage : `NEXT_PUBLIC_SITE_URL` (liens canoniques/OG). Pas de secret nécessaire pour cette v1. La structure doit permettre d'ajouter proprement des vars futures (ex: token d'API pour le dashboard ops) sans rien coder en dur.

## Qualité / CI

- `npm run lint` (ESLint + Prettier)
- `npm run typecheck` (tsc --noEmit)
- `npm test` (Vitest unitaires)
- `npm run test:e2e` (Playwright — rendu des 2 pages, présence des liens TOC, attribut `lang`)
- `npm run build` (build Next.js)
- **`npm run validate`** enchaîne tout, même logique que `make validate` (backend) / `npm test && tsc --noEmit && npm run lint` (mobile)

## Git — création du repo et flow

1. **Créer le repo GitHub `cloudbreak-ops`** (vide)
2. **Premier commit sur `main`** : uniquement le `README.md` qui présente le but du repo (pages légales pour les stores, futur dashboard ops), sans code
3. Créer la branche `develop` depuis ce premier commit sur `main`
4. Tout le reste du travail (scaffold Next.js, pages, tests, CI, CLAUDE.md, docs/) se fait sur une branche `feature/legal-pages` partant de `develop`, puis merge sur `develop`
5. `main` reste la branche de production déployée (comme `backend`/`mobile`) — pas de merge dessus tant que le service n'est pas prêt à être déployé
6. Ajouter le submodule au repo racine `cloudbreak` : `git submodule add https://github.com/AlexandreMoreau2002/cloudbreak-ops ops`, avec `develop` comme branche de travail (référence root pointera sur `develop` après le premier merge de la feature branch)

## Tests

- **Unitaires (Vitest)** : rendu des composants de page (CGU, Privacy), résolution des messages i18n, absence de strings hardcodées (test de non-régression simple sur les composants clés)
- **e2e (Playwright)** : navigation vers `/fr/cgu` et `/fr/privacy`, vérifie statut 200, présence du titre, présence de la TOC et de ses ancres, attribut `lang="fr"` sur `<html>`
- **Build** : `npm run build` doit passer sans erreur (garantit le SSG des 2 pages)

## Documentation à produire

- `README.md` — but du repo, stack, installation, commandes (`npm run dev`, `npm run validate`), structure, statut du déploiement (à venir, pas encore sur Dokploy)
- `CLAUDE.md` — conventions du repo (imports en escalier, pas de strings hardcodées, i18n obligatoire, git flow, commandes de validation)
- `docs/story-1-legal-pages.md` — ce qui a été fait, comment ça fonctionne, comment tester, ACs vérifiés (repris de la story 4.4 côté pages légales)
