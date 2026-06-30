# Story 4.4 : Conformité Apple App Store — Legal, Paywall & Restauration achats

Status: ready-for-dev

## Story

En tant que solo dev qui soumet l'app sur l'App Store,
je veux que toutes les exigences légales et de conformité Apple soient implémentées avant la soumission,
afin que l'app soit acceptée dès la première review et ne soit jamais bannie pour non-conformité.

---

## Contexte métier

Apple rejette ou banne pour ces raisons dans l'ordre de priorité :

1. **Paywall non conforme** — pas de bouton fermeture visible, prix flou, pas de Restore Purchases, pas de liens CGU/Privacy
2. **Politique de confidentialité absente ou inaccessible** — obligatoire dès la première soumission
3. **Achats non restaurables** — Apple exige un bouton "Restore Purchases" sur tout écran d'achat
4. **Données non déclarées** — App Privacy dans App Store Connect doit lister chaque SDK

Source : page Notion [🛡️ Apple App Store — Risques de bannissement & conformité]

---

## Acceptance Criteria

### AC1 — Backend : pages légales servies
**Given** le backend est démarré,
**When** `GET /legal/privacy` est appelé,
**Then** une page HTML valide avec le texte de la Privacy Policy est retournée (Content-Type: text/html).
**And** `GET /legal/cgu` retourne de même les Conditions d'Utilisation.

### AC2 — Profil : section Légal avec tous les liens
**Given** l'utilisateur est sur l'écran Profil,
**When** il scrolle jusqu'à la section "Légal",
**Then** il voit trois entrées : "Politique de confidentialité", "Conditions d'utilisation", "Support".
**And** chaque entrée ouvre le lien correspondant dans le navigateur système via `Linking.openURL()`.
**And** le lien support ouvre un mail `mailto:support@cloudbreak.app`.

### AC3 — Paywall : liens légaux visibles avant souscription
**Given** le paywall est affiché,
**When** l'utilisateur le consulte,
**Then** un texte compact sous le bouton CTA mentionne "Politique de confidentialité" et "CGU" comme liens cliquables.
**And** chaque lien ouvre la page correspondante dans le navigateur système.

### AC4 — Paywall : bouton "Restaurer les achats" présent
**Given** le paywall est affiché,
**When** l'utilisateur a déjà souscrit Premium sur ce compte Apple,
**Then** un bouton "Restaurer les achats" est visible.
**And** le bouton appelle `restorePurchases()` — stub en attente de la story 4.3 (StoreKit 2 réel) qui loggue l'appel en DEBUG et affiche un message "Achats restaurés" en feedback utilisateur.
**Note dev :** Apple exige ce bouton même si StoreKit n'est pas encore câblé — le stub est acceptable pour la review.

### AC5 — Paywall : prix et durée lisibles
**Given** le paywall est affiché,
**When** l'utilisateur voit le toggle mensuel/annuel,
**Then** le prix (5€/mois ou 45€/an) et la durée d'engagement sont visibles clairement sans ambiguïté.
**And** si un essai gratuit est mentionné, la durée et le prix après essai sont explicitement affichés.
**Note audit :** Vérifier visuellement le `PaywallBillingToggle` et `PaywallCTA` — ajuster le wording si nécessaire.

### AC6 — Documentation : checklist App Store Connect documentée
**Given** la story est complétée,
**When** le dev (Alex) prépare la soumission,
**Then** `backend/docs/security.md` est mis à jour avec la checklist "App Privacy — données déclarées" listant chaque SDK et les données qu'il collecte.
**And** `mobile/docs/story-4-4-conformite-apple.md` documente les URLs légales à mettre à jour avant release.

---

## Tasks / Subtasks

- [ ] **T1 — Backend : endpoints légaux** (AC1)
  - [ ] Créer `backend/app/legal/privacy.html` — Privacy Policy Cloudbreak (contenu minimal légal)
  - [ ] Créer `backend/app/legal/cgu.html` — Conditions Générales d'Utilisation (contenu minimal légal)
  - [ ] Dans `backend/app/main.py` : monter `StaticFiles(directory="app/legal", html=True)` sur `/legal`
  - [ ] Vérifier `GET /legal/privacy` et `GET /legal/cgu` retournent 200 + Content-Type text/html
  - [ ] Ajouter les URLs dans `backend/.env.example` : `LEGAL_BASE_URL=https://api.cloudbreak.fr`
  - [ ] Écrire test `tests/test_legal_endpoints.py`

- [ ] **T2 — Mobile : constantes URLs légales** (AC2, AC3)
  - [ ] Créer `mobile/src/constants/legalUrls.ts` :
    ```ts
    // URLs à mettre à jour avant release 1.0.0 — remplacer par vrai domaine
    export const LEGAL_URLS = {
      privacy: 'https://api.cloudbreak.fr/legal/privacy',
      cgu: 'https://api.cloudbreak.fr/legal/cgu',
      support: 'mailto:support@cloudbreak.app',
    } as const;
    ```
  - [ ] Ajouter clés i18n dans `fr.ts` et `en.ts` : `legal.privacy`, `legal.cgu`, `legal.support`, `legal.sectionTitle`

- [ ] **T3 — Profil : section Légal** (AC2)
  - [ ] Dans `profile.tsx` : ajouter section "Légal" après la section "Compte"
  - [ ] Utiliser le composant `SettingsRow` existant avec `Ionicons` appropriés
  - [ ] Chaque row appelle `Linking.openURL(LEGAL_URLS.xxx)` dans un `try/catch` (fallback Alert si lien invalide)
  - [ ] Ajouter test `profile.test.tsx` : vérifier que les 3 SettingsRow légaux sont rendus

- [ ] **T4 — Paywall : liens légaux sous le CTA** (AC3)
  - [ ] Dans `PaywallFooter.tsx` : ajouter au-dessus du bouton dismiss un `Text` compact avec `TouchableOpacity` inline pour Privacy + CGU
  - [ ] Style : `fontSize: 11`, `color: colors.textSecondary`, centré, séparé par " · "
  - [ ] Chaque lien → `Linking.openURL(LEGAL_URLS.xxx)`
  - [ ] Ajouter `testID="paywall-privacy-link"` et `testID="paywall-cgu-link"`
  - [ ] Mettre à jour `PaywallScreen.test.tsx` : vérifier présence des liens

- [ ] **T5 — Paywall : bouton Restore Purchases** (AC4)
  - [ ] Dans `PaywallFooter.tsx` : ajouter bouton "Restaurer les achats" entre les liens légaux et le bouton dismiss
  - [ ] La prop `onRestorePurchases` est passée depuis `PaywallScreen` → stub : `() => { if (DEBUG) console.debug('[Paywall] restorePurchases stub'); Alert.alert(i18n.t('paywall.restoreSuccess')); }`
  - [ ] Ajouter clés i18n : `paywall.restore`, `paywall.restoreSuccess`
  - [ ] Ajouter `testID="paywall-restore-button"` au bouton
  - [ ] Mettre à jour les types : `PaywallFooterProps` + `PaywallScreenProps`
  - [ ] Mettre à jour `PaywallScreen.test.tsx`

- [ ] **T6 — Audit visuel paywall prix** (AC5)
  - [ ] Lancer l'app sur simulateur, ouvrir le paywall, vérifier que prix + durée sont lisibles
  - [ ] Si wording ambigu → ajuster `fr.ts`/`en.ts` (ex: "puis 5€/mois" si essai gratuit)

- [ ] **T7 — Documentation** (AC6)
  - [ ] Mettre à jour `backend/docs/security.md` — section "App Privacy Apple" avec tableau SDK / données collectées
  - [ ] Créer `mobile/docs/story-4-4-conformite-apple.md`
  - [ ] Checklist pré-release dans `TODO.md` : mettre à jour les URLs légales et App Privacy dans App Store Connect

- [ ] **T8 — Validation automatique**
  - [ ] Backend : `make validate` doit passer
  - [ ] Mobile : `npm run validate` doit passer

---

## Dev Notes

### Contraintes critiques

**⚠️ Ne jamais mettre de lien vers un paiement externe dans l'app** (règle Apple 9) — Cloudbreak respecte déjà ça (StoreKit only).

**⚠️ Restore Purchases est obligatoire** même si StoreKit 2 n'est pas câblé. Le stub est acceptable mais le bouton DOIT être présent et visible.

**⚠️ URLs légales** : en attendant le vrai domaine `cloudbreak.fr`, utiliser `api.cloudbreak.fr` qui sera disponible avec le VPS (Epic 1). Documenter explicitement dans `legalUrls.ts` et `TODO.md` que ces URLs sont à mettre à jour avant release.

**⚠️ Pas d'essai gratuit dans le MVP v1.0** si on ne peut pas le prouver avec StoreKit 2 réel — ne pas le mentionner dans la UI avant que story 4.3 soit live.

### Structure fichiers touchés

```
backend/
  app/
    main.py                     ← mount StaticFiles /legal
    legal/
      privacy.html              ← À CRÉER
      cgu.html                  ← À CRÉER
  tests/
    test_legal_endpoints.py     ← À CRÉER
  docs/
    security.md                 ← mettre à jour App Privacy section

mobile/
  src/
    constants/
      legalUrls.ts              ← À CRÉER
    locales/
      fr.ts                     ← ajouter clés legal.* + paywall.restore*
      en.ts                     ← idem
    components/paywall/
      PaywallFooter.tsx         ← ajouter liens légaux + Restore button
      PaywallScreen.tsx         ← passer onRestorePurchases prop
      PaywallScreen.test.tsx    ← mettre à jour tests
      types.ts                  ← PaywallFooterProps + PaywallScreenProps update
    app/(tabs)/
      profile.tsx               ← ajouter section Légal
      profile.test.tsx          ← tester section Légal
  docs/
    story-4-4-conformite-apple.md  ← À CRÉER
```

### Patterns à respecter

- `Linking.openURL()` de `react-native` pour ouvrir les URLs — wrap dans try/catch
- `SettingsRow` existant pour la section Légal du profil — ne pas réinventer
- `i18n.t()` pour tous les strings — jamais de strings hardcodés
- `DEBUG && console.debug(...)` pour les logs stub
- Imports en escalier (longueur croissante)

### Backend : StaticFiles

```python
# Dans main.py, après la création de l'app FastAPI
from fastapi.staticfiles import StaticFiles
import os

legal_dir = os.path.join(os.path.dirname(__file__), "legal")
if os.path.isdir(legal_dir):
    app.mount("/legal", StaticFiles(directory=legal_dir, html=True), name="legal")
```

### Contenu minimal Privacy Policy

La Privacy Policy doit mentionner au minimum (Apple exige) :
- Données collectées : email (auth), données de localisation (optionnel), logs d'usage (PostHog)
- SDK tiers : Supabase (auth + DB), PostHog (analytics), Expo (infrastructure)
- Hébergement : EU (Supabase Frankfurt, OVH Paris)
- Droit à l'effacement : endpoint DELETE /api/v1/user disponible
- Contact : support@cloudbreak.app

### Checklist App Privacy Apple (à remplir dans App Store Connect)

| Donnée | SDK | Usage | Lié à l'identité ? |
|--------|-----|-------|-------------------|
| Email | Supabase | Auth | Oui |
| Identifiant utilisateur | Supabase | Fonctionnalité app | Oui |
| Données d'utilisation | PostHog | Analytics | Non (anonymisé) |
| Localisation précise | expo-location | Fonctionnalité opt-in | Non |
| Crashs | Expo | Debugging | Non |

> ⚠️ Déclarer honnêtement — une fausse déclaration est une cause de bannissement.

---

## Points de vigilance spécifiques Cloudbreak

1. **PostHog** — déclarer "données d'utilisation" dans App Privacy, préciser que c'est pour "analytics" et non pour ciblage publicitaire
2. **Supabase** — déclarer "email" et "identifiant utilisateur" liés à l'identité
3. **expo-location** — déclarer "localisation précise" avec usage "fonctionnalité app" et opt-in explicite
4. **Pas de pub, pas de tracking tiers** — Cloudbreak n'a pas de SDK pub → section "Tracking" = vide ✅

---

## Dépendances

- **Bloquée par** : rien — cette story est 100% faisable sans Apple Dev account ni VPS
- **Bloque** : soumission App Store (release v1.0.0)
- **Relation** : story 4.3 (StoreKit 2) viendra compléter le stub `restorePurchases()` avec le vrai appel IAP

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
