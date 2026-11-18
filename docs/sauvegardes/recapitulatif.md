# Sauvegardes : récapitulatif complet (ce qui a été fait, quoi suivre, où, comment)

Chantier du **2026-11-18**. Ce document est le point d'entrée : il résume tout et renvoie vers `fonctionnement.md` (le « pourquoi »
expliqué simplement) et `guide-test.md` (les procédures de test et de restauration pas à pas).

---

## 1. En bref

- **Avant** : un script ne sauvegardait que 3 bases, dont la base Cloudbreak **dev**. La **prod Cloudbreak n'avait aucune sauvegarde**.
  Les copies restaient sur le même disque que les bases. Les comptes Supabase (emails, mots de passe hachés) n'étaient sauvegardés nulle
  part (plan Free = pas de sauvegarde automatique).
- **Maintenant** : chaque nuit, **toutes** les bases du serveur + Supabase prod sont sauvegardées, vérifiées, puis copiées en
  **chiffré** chez OVH (autre stockage que le VPS). Les restaurations ont été **testées**.

```
03:00 UTC (cron)  ->  backup-databases.sh
   découvre les bases  ->  dump  ->  vérifie  ->  manifeste (SHA-256)
        |  tout OK ?  non -> code d'erreur (et heartbeat /fail si configuré)
        v  oui
   offsite-backup.sh  ->  restic (chiffré)  ->  bucket OVH S3 (Gravelines)
        v
   rotation locale 14 j  +  rotation hors site 14 j / 8 semaines / 6 mois
```

## 2. Ce que j'ai fait, dans l'ordre

1. **Audit (lecture seule)** : lu `TODO.ops.md`, le script du serveur, les conteneurs et le cron. Constat : le script sauvegarde
   `postgres-navigate-virtual-matrix-c3rtpt` (= dev) et ignore `postgres-parse-redundant-feed-hgevt8` (= **prod**, d'après
   `~/.cloudbreak-prod/state.json`).
2. **Filet de sécurité** : dumps manuels de la prod et de `dokploy-postgres`, vérifiés (gzip, nombre de tables).
3. **Test de restauration** de la prod dans un Postgres jetable (sans réseau) : 0 erreur, mêmes comptes de lignes que la prod
   (5 utilisateurs, 23 782 sommets, révision Alembic `b7c8d9e0f1a2`).
4. **Nouveau script** `backup-databases.sh` (voir §4) installé à la place de l'ancien, **même chemin, même cron**. L'ancien (qui
   contenait des mots de passe en clair) est supprimé du serveur.
5. **OVH** : création d'un projet Public Cloud (contrats acceptés sur ton accord, projet activé par toi), d'un bucket S3 privé, d'un
   utilisateur S3 dédié, puis `restic` sur le VPS avec un dépôt chiffré.
6. **Test de restauration depuis OVH** : fichier récupéré depuis le bucket, empreinte SHA-256 identique à l'original.
7. **Supabase prod** : constat « plan Free, aucune sauvegarde ». Mot de passe de la base réinitialisé (avec ton accord), ajout de
   l'export `auth` + `public` au script, restauration testée (14 comptes).
8. **Documentation** : ce dossier, `docs/infra-serveur.md` §7, `TODO.ops.md`, `~/.claude/CLAUDE.md` (commité et poussé), page Notion
   « Serveur OVH ».
9. **Commit** : `34c12a4` sur `main` (poussé).

## 3. Ce qui est sauvegardé

| Base | Projet | Contenu |
|---|---|---|
| `postgres-parse-redundant-feed-hgevt8` | **Cloudbreak prod** | toutes les données de l'app |
| `postgres-navigate-virtual-matrix-c3rtpt` | Cloudbreak dev | idem (dev) |
| `postgres-hack-1080p-hard-drive-f3qow5` | Quest | base `quest` |
| `mysql-copy-cross-platform-array-az4wbt` | Snoroc prod | toutes les bases MySQL |
| `mysql-index-optical-port-z34j1r` | Snoroc dev | `snoroc_dev` (**n'était pas** sauvegardé avant) |
| `dokploy-postgres` | Dokploy | config de toutes les apps (à ne pas perdre) |
| Supabase `cloudbreak-prod` | comptes | schémas `auth` + `public` (emails, hachés, identités) |

Chaque base Postgres a aussi un fichier `*-globals-*` (rôles et droits). Pas sauvegardé : Redis (cache météo + compteurs de quota,
perdables).

## 4. Où est quoi

### Dans le repo cloudbreak
| Fichier | Rôle |
|---|---|
| `infra/backup-databases.sh` | source du script principal |
| `infra/offsite-backup.sh` | source du script hors site |
| `docs/sauvegardes/fonctionnement.md` | explication simple + schémas |
| `docs/sauvegardes/guide-test.md` | tests et restaurations pas à pas |
| `docs/sauvegardes/recapitulatif.md` | ce fichier |
| `docs/infra-serveur.md` §7 | référence serveur |
| `TODO.ops.md` §0 | ce qu'il reste à faire |

> Les scripts du repo sont la **source** ; ceux du VPS sont des copies installées. Si tu modifies l'un, recopie l'autre
> (`scp` puis `sudo install -m 700 -o root -g root`).

### Sur le VPS (`ssh vps-ovh-projets`, utilisateur `ubuntu`, sudo sans mot de passe)
| Chemin | Rôle |
|---|---|
| `/srv/scripts/backup-databases.sh` | script principal (cron `0 3 * * *`, via `sudo`) |
| `/srv/scripts/offsite-backup.sh` | copie hors site |
| `/srv/scripts/backup.env` | `OFFSITE_CMD` et `HEARTBEAT_URL` (heartbeat BetterStack, 600) |
| `/srv/scripts/expected-databases.txt` | noms des bases qui **doivent** exister |
| `/srv/backups/` | copies locales (`*.sql.gz`), `manifest-*.txt`, `LAST_SUCCESS`, `backup.log` |
| `/root/.restic/s3.env` | clés S3 OVH + adresse du dépôt (600) |
| `/root/.restic/password` | **clé de chiffrement restic** (600) |
| `/root/.restic/supabase.env` | mot de passe de la base Supabase prod (600) |

### Chez OVH (console `manager.eu.ovhcloud.com`)
Projet Public Cloud **« Project 2026-11-18 »** → Object Storage → bucket **`vps-db-backups-7f3a9c2e`** (Gravelines, S3, 1-AZ).
Utilisateur S3 : `restic-vps-backups`. Endpoint : `https://s3.gra.io.cloud.ovh.net`.

### Chez Supabase
Organisation `cloudbreak` → projet `cloudbreak-prod` (région eu-west-2, plan Free). Le script s'y connecte par le pooler session
`aws-0-eu-west-2.pooler.supabase.com:5432`.

## 5. Quoi suivre, et comment

### Chaque jour (30 secondes, ou à automatiser avec le heartbeat)
```bash
ssh vps-ovh-projets 'sudo ls -l /srv/backups/LAST_SUCCESS; sudo tail -12 /srv/backups/backup.log'
```
Attendu : `LAST_SUCCESS` daté de la nuit (03:00 UTC), et dans le log « OK » pour chaque base, `[offsite] terminé`, `terminé : N dumps`.
Alerte automatique : **heartbeat BetterStack « Sauvegarde des bases (VPS) »** (attendu chaque jour, marge 2 h, alerte e-mail). Il est vert si la sauvegarde et la copie hors site ont réussi ; un échec envoie `/fail` (alerte immédiate), un silence de plus de 26 h aussi. Page : `https://incidents.betterstack.com/team/t635958/heartbeats/535606`.

### Chaque semaine
- Le dimanche, le script vérifie 10 % des données du dépôt hors site (`restic check`). Une erreur fait échouer la sauvegarde : elle
  apparaît dans `backup.log`.
- Espace disque : `ssh vps-ovh-projets 'df -h /'` (56 % le 2026-11-18). Seuil d'alerte prévu : 85 %.

### Chaque mois (5 minutes)
- Taille du dépôt hors site et liste des snapshots :
  ```bash
  ssh vps-ovh-projets 'sudo sh -c "set -a; . /root/.restic/s3.env; set +a; restic snapshots --compact | tail -8; restic stats --mode raw-data | tail -3"'
  ```
  Attendu : quelques dizaines de Mo (le script échoue au-delà de 2 Go).
- Facture OVH (console → projet → Facturation) : doit rester de l'ordre de quelques centimes.
- **Test de restauration** (scénarios 3, 4 et 4 bis de `guide-test.md`) : un backup jamais restauré ne prouve rien.

### À chaque changement d'infra
- **Nouvelle app avec base (Dokploy)** : sauvegardée automatiquement la nuit suivante. Ajoute son nom d'app (`appName`) à
  `/srv/scripts/expected-databases.txt` pour être alerté si elle disparaît.
- **App recréée (nouveau `appName`)** : mets à jour `expected-databases.txt`, sinon la sauvegarde échoue (« base attendue
  introuvable »). C'est voulu.
- **Mot de passe Supabase réinitialisé** : mets à jour `/root/.restic/supabase.env`.
- **Changement de région / hôte du pooler Supabase** : mets à jour `SUPABASE_POOLER` dans le script.

## 6. Si ça ne va pas

| Symptôme | Cause probable | Quoi faire |
|---|---|---|
| `ERREUR: base attendue introuvable : X` | conteneur arrêté ou app recréée | `sudo docker ps` ; corriger `expected-databases.txt` si l'app a changé de nom |
| `pg_dump <app>/<base>` en erreur | conteneur en cours de redémarrage, disque plein | relancer à la main, vérifier `df -h /` |
| `pg_dump supabase-prod` en erreur | mot de passe changé, projet en pause (plan Free), pooler modifié | réveiller le projet dans le dashboard Supabase ; vérifier `supabase.env` |
| `[offsite]` en erreur | clés S3 invalides, OVH injoignable, dépôt > 2 Go | relancer `sudo /srv/scripts/offsite-backup.sh` ; lire le message |
| `une sauvegarde est déjà en cours` | verrou d'une exécution précédente | attendre ; sinon `ps aux | grep backup-databases` |
| Pas de `LAST_SUCCESS` récent | cron arrêté ou échec | `crontab -l` (utilisateur `ubuntu`) puis lancer le script à la main |

Lancer à la main : `ssh vps-ovh-projets 'sudo /srv/scripts/backup-databases.sh; echo exit=$?'`
Voir ce qui sera trouvé sans rien écrire : `... backup-databases.sh --dry-run`.
Évite de le lancer pendant un build Dokploy (serveur 2 vCPU / 3,7 Go).

## 7. Restaurer en cas de sinistre

| Situation | Que faire |
|---|---|
| Une base corrompue, VPS intact | prendre le dernier `/srv/backups/<app>-<base>-*.sql.gz`, restaurer (scénario 3 de `guide-test.md`) |
| Fichiers locaux perdus, VPS intact | restaurer depuis le dépôt restic (scénario 4) |
| **VPS perdu** | nouveau serveur, réinstaller `restic`, recréer `s3.env` (clés S3 depuis la console OVH → « Voir les credentials ») et `password` (**ta copie du gestionnaire de mots de passe**), puis `restic restore latest`. Dokploy se recrée depuis `dokploy-postgres` (ou on redéploie les apps à la main). |
| Compte Supabase perdu | restaurer `supabase-prod-*.sql.gz` dans un **nouveau projet Supabase**, puis repointer `SUPABASE_URL`, les clés et le JWKS du backend et du mobile |

## 8. Ce qu'il reste à faire

Plus rien d'obligatoire. Décisions d'Alex du 2026-11-18 : on **reste en Supabase Free** (0 utilisateur, pause automatique après une semaine
sans activité à surveiller) et on **ne tourne pas** les mots de passe Postgres/Redis de prod pour l'instant.

Faits le 2026-11-18 : alerte de consommation OVH (5 €/mois, e-mail), heartbeat BetterStack de la sauvegarde (marge 2 h).

À savoir (non bloquant) : la **clé de chiffrement restic** (`/root/.restic/password` sur le VPS) n'existe qu'à cet endroit. Elle ne sert
que si le VPS est perdu ; une copie dans un gestionnaire de mots de passe protège ce cas :
```bash
ssh vps-ovh-projets 'sudo cat /root/.restic/password'
```

## 9. Secrets et points d'attention

- **Affichés dans la conversation** : les clés S3 OVH, le nouveau mot de passe Supabase, et les mots de passe Postgres/Redis de prod
  (affichés par erreur le 2026-11-16). Ils n'ont pas été écrits dans un fichier versionné. Rotation conseillée : clés S3 (OVH →
  utilisateur → régénérer), mot de passe Supabase (dashboard), Postgres/Redis prod (redémarre la prod).
- **Rien de secret n'est dans le repo** : les scripts lisent tout depuis `/root/.restic/` (600) et l'env des conteneurs.
- **Page Notion « Serveur OVH »** : elle contient des mots de passe et tokens en clair (compte Dokploy, token API, mots de passe de
  bases). À nettoyer un jour.
- **Le commit** : une autre session a basculé ton checkout sur `feature/sentry-observability` pendant que je travaillais ; mon commit
  y a atterri avant d'être rejoué sur `main`. Le doublon `8358fec` peut rester sur cette branche, ou être retiré par l'autre session.

## 10. Coûts

- Bucket OVH : 1-AZ, sans versioning ni réplication ni Object Lock. ≈ 7 Mo par nuit, dédupliqués, ~30 snapshots → **quelques
  centimes par mois** (stockage ≈ 0,007 €/Go/mois ; trafic sortant seulement lors des restaurations et de la vérification du dimanche).
- Garde-fou : le script échoue si le dépôt dépasse **2 Go**.
- Aucune instance, aucun volume, aucun réseau créé dans le projet Public Cloud : uniquement le stockage objet.
