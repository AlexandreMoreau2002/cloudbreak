# ASO & Landing Page — Cloudbreak

> Mise à jour : 2026-05-17

---

## App Store Optimization (ASO)

### Titre (30 caractères max)

```
Cloudbreak — Mer de nuage
```

"Mer de nuage" dans le titre = signal de ranking fort sur cette requête. Apple indexe le titre avec le plus fort poids.

### Sous-titre (30 caractères max)

```
Prédiction météo sommet
```

Apple indexe le sous-titre dans la recherche. Variante à A/B tester : "Prévision nuages & altitude".

### Champ Keywords (100 caractères, invisible, virgules sans espaces)

```
mer,nuage,sommet,météo,montagne,rando,inversion,cloud,altitude,prévision,alpinisme,nuages,paysage
```

Règle : ne jamais répéter un mot déjà présent dans le titre ou le sous-titre (Apple ne double pas le poids).

### Description

**Les 3 premières lignes — visibles sans cliquer "Plus" (critiques) :**

```
Sais-tu si ça vaut le coup de te lever à 5h du matin ?

Cloudbreak prédit la probabilité d'une mer de nuage depuis un sommet précis,
à l'heure et au jour que tu choisis. Un verdict clair : Haute / Moyenne / Faible.
Pas des données brutes — une réponse.
```

**Suite (visible après "Plus") :**

```
COMMENT ÇA MARCHE
L'algorithme analyse la base des nuages (Skew-T), l'inversion thermique,
l'humidité, le vent et la pression pour chaque sommet. Il traduit ça en
pourcentage de probabilité et en fenêtre horaire optimale.

POUR QUI
→ Photographes paysage — planifie ton lever de soleil au bon endroit
→ Créateurs drone — trouve le "money shot" avant de monter
→ Randonneurs — arrête de te lever à 5h pour rien
→ Alpinistes — comprends la météo haute altitude

CE QUE L'APP FAIT
• Verdict probabiliste pour n'importe quel sommet en France
• Score de 0 à 100% avec fenêtre temporelle optimale
• Recherche et favoris sur 20 000+ sommets, cols et points de vue
• Alertes push quand les conditions sont idéales sur tes favoris
• Cache offline — fonctionne en zone sans réseau
• Validation terrain : confirme ou infirme la prévision depuis le sommet

FREEMIUM
Gratuit : 1 consultation par jour
Premium (5€/mois ou 45€/an) : consultations illimitées + alertes push
```

### Screenshots (5 obligatoires — format 6.9" iPhone)

L'ordre est critique : 80% des visiteurs ne scrollent pas au-delà du 2e screenshot.

| # | Ce qu'on montre | Texte overlay |
|---|---|---|
| 1 | Score "84% — Haute probabilité 🟢" avec photo de mer de nuage en fond | *"Sais-tu si ça vaut le coup ?"* |
| 2 | Écran de recherche avec résultats + favoris | *"20 000+ sommets, cols et points de vue"* |
| 3 | Détail météo (cloud base, inversion, vent, humidité) | *"L'algorithme qui fait le calcul à ta place"* |
| 4 | Notification push "Conditions idéales 🟢 sur le Colombier ce matin" | *"Sois alerté au bon moment"* |
| 5 | Écran validation terrain avec photo | *"Ta validation améliore la prévision"* |

**Charte screenshot :** fond coloré palette Cloudbreak (`#EFE8DC`), texte en Josefin Sans 700. Pas de fond blanc générique — la DA cohérente dans les screenshots améliore le taux de conversion de 30-40%.

### Catégories App Store

- **Primaire :** Météo
- **Secondaire :** Sport et activité de plein air

### Notes ASO

- Solliciter les reviews App Store dès les 10 premiers utilisateurs satisfaits — le score est un signal de ranking fort
- Tester une variante de sous-titre au bout de 60 jours si le ranking sur "météo sommet" est décevant
- Surveiller les keywords avec AppFollow ou SensorTower (gratuit en tier basique)

---

## Landing Page — cloudbreak.fr

### Pourquoi

1. **SEO Google** — quelqu'un qui tape "prévision mer de nuage application" sur Google ne trouve rien aujourd'hui. Keyword quasi vierge. Une landing page peut ranker en position 1-3 en quelques semaines.
2. **Deep links** — destination des prédictions partagées ("Alex a prédit 87% sur le Colombier" → `cloudbreak.fr/sommet/colombier` → bouton télécharger). Sans landing page, ces liens ne fonctionnent pas hors iOS.
3. **Crédibilité** — avoir un vrai site renforce la confiance des journalistes et des partenaires CAF.

### Domaine à réserver

`cloudbreak.fr` — vérifier dispo sur OVH (~10€/an). Alternatives : `appcloudbreak.fr`, `cloudbreakapp.fr`.

### Stack recommandée

Dokploy est déjà en place sur le VPS OVH → déployer comme service supplémentaire, Traefik gère le HTTPS automatiquement.

- **Option A (recommandée MVP) :** page HTML/CSS statique servie par Traefik. Zéro dépendance, temps de chargement parfait pour le SEO, déployable en 1h.
- **Option B (si blog prévu) :** Next.js statique (`next export`) déployé comme service Dokploy. Plus maintenable pour ajouter des articles SEO plus tard.

### Structure de la page (one-pager au lancement)

```
[HERO]
Titre H1 : "Sais-tu si ça vaut le coup de te lever à 5h du matin ?"
Sous-titre : "Cloudbreak prédit la probabilité d'une mer de nuage
depuis n'importe quel sommet, au jour et à l'heure que tu choisis."
CTA : [Télécharger sur l'App Store]
Visuel : photo de mer de nuage réelle + mockup iPhone avec l'app

[COMMENT ÇA MARCHE — 3 étapes]
1. Cherche ton sommet   2. Consulte le verdict   3. Monte au bon moment
Screenshots de l'app en fond

[POUR QUI — 4 icônes]
📸 Photographes paysage · 🚁 Créateurs drone · 🥾 Randonneurs · 🧗 Alpinistes

[POURQUOI CLOUDBREAK]
"Pas des données brutes — un verdict actionnable"
3 points différenciants : algorithme physique / 20 000+ sommets / validation terrain

[TÉMOIGNAGES]
2-3 citations d'utilisateurs beta (à ajouter dès les premiers retours)

[TÉLÉCHARGER]
Badge App Store + "Gratuit — 1 check/jour offert · Premium 5€/mois"

[FOOTER]
Mentions légales · Politique de confidentialité · Contact
```

### SEO — mots-clés à cibler

| Requête | Concurrence | Priorité |
|---|---|---|
| "prévision mer de nuage" | Quasi nulle | ★★★★★ |
| "mer de nuage application" | Nulle | ★★★★★ |
| "météo mer de nuage sommet" | Nulle | ★★★★★ |
| "inversion thermique montagne app" | Nulle | ★★★★☆ |
| "météo montagne application iPhone" | Faible | ★★★☆☆ |

Faible volume = peu de recherches, mais 100% de l'audience est qualifiée.

**Optimisations techniques SEO :**
- Balise `<title>` : "Cloudbreak — Prévision mer de nuage depuis un sommet"
- Meta description : "Sais-tu si ça vaut le coup de te lever à 5h ? Cloudbreak prédit la probabilité d'une mer de nuage pour n'importe quel sommet en France."
- H1 visible sur la page = titre hero
- Images avec `alt` descriptifs ("mer de nuage depuis le Colombier, Chartreuse")
- Temps de chargement < 2s (critique pour le ranking Google)
- Schema.org `SoftwareApplication` pour que Google affiche le badge App Store dans les résultats

### Blog — V2 (optionnel, fort ROI SEO)

3 articles à écrire pour le trafic organique long terme :

| Article | Requête cible | Trafic potentiel |
|---|---|---|
| "Comment fonctionne une mer de nuage ? Le guide complet" | "mer de nuage comment ça marche" | Moyen, très qualifié |
| "Les 10 meilleurs sommets pour observer une mer de nuage en France" | "meilleur sommet mer de nuage france" | Moyen, très qualifié |
| "Comprendre l'inversion thermique : pourquoi la montagne dépasse les nuages" | "inversion thermique montagne" | Élevé, qualifié |

Chaque article = trafic organique permanent. L'article "10 meilleurs sommets" est particulièrement viral (liste partageable, Pinterest, Facebook groupes rando).

---

## Checklist avant soumission App Store

- [ ] Titre, sous-titre et keywords validés
- [ ] Description rédigée et relue
- [ ] 5 screenshots créés (format 6.9" + 5.5" optionnel)
- [ ] Domaine cloudbreak.fr réservé
- [ ] Landing page en ligne (même minimaliste)
- [ ] Lien App Store mis à jour dans la landing page
- [ ] Privacy policy en ligne (obligatoire Apple) — peut être une page simple sur le site
- [ ] Score App Store > 4.5 avant de postuler à Apple Editorial
