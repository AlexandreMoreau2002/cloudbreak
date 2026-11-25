# Utilisateurs, comptes, usage : comment ça marche

## L'idée en simple
L'app s'utilise sans compte. La console compte donc trois choses différentes :

- **Utilisateurs** : toutes les personnes qui ont fait au moins un check, avec ou sans compte.
- **Comptes** : les personnes qui ont créé un vrai compte.
- **Usage** : combien de checks sont faits chaque jour.

Problème : au bout de 30 jours sans activité, un utilisateur sans compte est effacé (purge RGPD), et ses checks avec lui. Si la console recalculait tout à chaque fois, le nombre d'utilisateurs baisserait à chaque purge, comme si les gens partaient. Alors on garde chaque jour une petite photo des compteurs (`daily_stats`) : des nombres, jamais de données personnelles.

## Le flux

```
 Check dans l'app ──► table predictions (user_id, date…)
                              │
   Console ouverte ──► GET /api/v1/admin/overview
                              │  compte les user_id distincts  = Utilisateurs
                              │  compte la table users          = Comptes
                              │  compte les checks par jour     = Usage
                              ▼
                     photo du jour dans daily_stats (une ligne par jour)
                              ▲
   Cron de purge (06:05) ─────┘  photo AVANT d'effacer les anonymes inactifs
```

La variation sur 7 jours des utilisateurs = total d'aujourd'hui moins la photo d'il y a 7 jours. Sans photo (les premiers jours), la console affiche « Variation indisponible » au lieu d'un faux zéro. La courbe commence le jour du déploiement.

## Fichiers touchés
- Backend : `app/models/daily_stat.py`, `alembic/versions/e7f8a9b0c1d2_create_daily_stats.py`, `app/services/daily_stats.py`, `app/services/admin_overview.py`, `app/services/anonymous_purge.py`.
- Ops : `src/components/admin/users/` (`parseOverview.ts`, `KpiCards.tsx`, `UsersChart.tsx`, `UsersPage.tsx`), `messages/fr.json`, `messages/en.json`.
- Docs : `docs/ops-console-contrats.md` (§3.4).
