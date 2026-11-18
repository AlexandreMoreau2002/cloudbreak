# Sauvegardes des bases de données — comment ça marche

Mis en place le 2026-11-18. Objectif : **si le serveur ou une base disparaît, on peut tout remettre en route**,
sans dépendre d'une seule machine.

## L'idée en une image (explain-like-a-child)

Imagine que tes bases de données sont des **cahiers** où tu écris tout.

1. Chaque nuit, un robot **photocopie tous les cahiers** (c'est le *dump*).
2. Il vérifie que chaque photocopie est lisible et pas vide.
3. Il met une copie dans **un tiroir du même bureau** (le disque du serveur) : pratique, mais si le bureau brûle, tout part.
4. Il envoie aussi une copie **dans un coffre-fort chez OVH, dans une autre ville** (le bucket S3), **verrouillée par un code**
   que seul le serveur connaît. Même OVH ne peut pas la lire.
5. Il garde les copies récentes et jette les très vieilles, pour ne pas remplir le coffre (donc ne pas payer pour rien).

```
   03:00 UTC, cron                  /srv/scripts/backup-databases.sh
        │
        ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ 1. Découvre TOUS les conteneurs de bases (Postgres/MySQL)    │
 │ 2. pg_dump / mysqldump  ->  fichier .sql.gz par base         │
 │ 3. Vérifie : gzip valide, taille non vide, base attendue     │
 │ 4. Écrit un manifeste (empreinte SHA-256 de chaque fichier)  │
 └──────────────┬───────────────────────────────────────────────┘
                │ tout est OK ?
        non ────┴──── oui
        │              │
   exit 1 + alerte     ▼
                 /srv/scripts/offsite-backup.sh  (restic, chiffré)
                       │
                       ▼
        Bucket OVH S3 « vps-db-backups-7f3a9c2e » (Gravelines)
                       │
                       ▼
        Rotation : 14 jours, 8 semaines, 6 mois  +  vérif d'intégrité
```

## Ce qui est sauvegardé

Le script **découvre lui-même** les bases (il regarde les conteneurs Docker qui ont `PG_MAJOR` ou `MYSQL_MAJOR` dans leur
environnement). Un nouveau projet déployé par Dokploy est donc sauvegardé la nuit suivante, sans rien toucher.

| Base | Projet |
|---|---|
| `postgres-parse-redundant-feed-hgevt8` | **Cloudbreak prod** |
| `postgres-navigate-virtual-matrix-c3rtpt` | Cloudbreak dev |
| `postgres-hack-1080p-hard-drive-f3qow5` | Quest |
| `mysql-copy-cross-platform-array-az4wbt` | Snoroc |
| `mysql-index-optical-port-z34j1r` | Snoroc dev (n'était **pas** sauvegardé avant) |
| `dokploy-postgres` | Dokploy lui-même (config de toutes les apps) |

| Supabase prod (`cloudbreak-prod`, schémas `auth` + `public`) | **Comptes** : emails, identités, mots de passe hachés |

Le projet Supabase est sur le plan **Free, qui n'a aucune sauvegarde automatique** : cet export nocturne est donc la seule copie des
comptes. Le script se connecte par le pooler session IPv4 (`aws-0-eu-west-2.pooler.supabase.com`, port 5432) avec un mot de passe de
base dédié (`/root/.restic/supabase.env`, 600), puis fait un `pg_dump` (client Postgres 17 via Docker). Le backend n'utilise pas ce
mot de passe : il valide les JWT localement.

Pas sauvegardé : Redis (cache météo et compteurs de quota, perdables).

## Les garde-fous (ce qui rend la chose « propre »)

- **Plus aucun mot de passe en dur** : le script lit les identifiants dans l'environnement des conteneurs.
- **Échec bruyant** : si une base attendue (`/srv/scripts/expected-databases.txt`) n'est pas trouvée, ou si un dump échoue, le
  script sort avec un code d'erreur. L'ancien script disait « OK » même quand il ne sauvegardait rien.
- **Écriture atomique** : un fichier est d'abord écrit en `.partial`, vérifié, puis renommé. Pas de dump à moitié écrit.
- **Rotation seulement après succès** : on ne supprime jamais les anciennes copies si la nuit a échoué.
- **Fichiers en `600`**, dossier en `700`, propriétaire root.
- **Garde-fou de coût** : si le dépôt hors site dépasse 2 Go, le script échoue au lieu de payer en silence.
- **Verrou** : deux sauvegardes ne peuvent pas tourner en même temps.

## La copie hors site

- Outil : **restic** (chiffrement + déduplication). Dépôt : bucket OVH Object Storage, région **Gravelines (GRA)**, classe 1-AZ.
- Aucune option payante : pas de versioning, pas de réplication, pas d'Object Lock.
- **Coût attendu : quelques centimes par mois** (≈ 7 Mo par nuit, dédupliqués, ~30 snapshots gardés).
- Accès : un utilisateur S3 dédié (`restic-vps-backups`). Clés dans `/root/.restic/s3.env` (600).
- **Clé de chiffrement : `/root/.restic/password`.** Sans elle la copie est illisible. **Elle doit aussi être dans ton gestionnaire de
  mots de passe** : si le serveur disparaît, c'est la seule façon d'ouvrir le coffre.

## Fichiers impactés

| Où | Fichier | Rôle |
|---|---|---|
| Repo | `infra/backup-databases.sh` | source du script principal |
| Repo | `infra/offsite-backup.sh` | source du script hors site |
| VPS | `/srv/scripts/backup-databases.sh` | script installé (cron `0 3 * * *`, via `sudo`) |
| VPS | `/srv/scripts/offsite-backup.sh` | copie hors site |
| VPS | `/srv/scripts/backup.env` | `OFFSITE_CMD`, (plus tard) URL de heartbeat |
| VPS | `/srv/scripts/expected-databases.txt` | bases qui doivent exister |
| VPS | `/root/.restic/s3.env`, `/root/.restic/password` | accès S3 et clé de chiffrement |
| VPS | `/srv/backups/` | copies locales + `manifest-*.txt` + `LAST_SUCCESS` |

## Ce qui reste à faire

- **Supabase** : si la région ou l'hôte du pooler change, mettre à jour `SUPABASE_POOLER` dans le script ; si le mot de passe de la base
  est réinitialisé, mettre à jour `/root/.restic/supabase.env`. Le projet Free se met en pause après une semaine sans activité.
- **Alerte de consommation OVH : posée le 2026-11-18** (projet « Project 2026-11-18 », seuil mensuel 5 €, e-mail du compte OVH, un rappel maximum par jour ; id `cfccf6e5-68f7-4ad5-9266-b367068c7a9d`). Visible/modifiable par l'API OVH `/cloud/project/{id}/alerting`, pas dans la console.
- **Alerte de fraîcheur** : heartbeat BetterStack (story 10.1) pour être prévenu si le cron ne tourne pas. Le script sait déjà
  l'appeler : il suffit de renseigner `HEARTBEAT_URL` dans `backup.env`.
- Mettre le mot de passe restic dans ton gestionnaire de mots de passe.
