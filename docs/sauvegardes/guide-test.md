# Sauvegardes — guide de test et de restauration

Toutes les commandes se lancent depuis ton Mac, via `ssh vps-ovh-projets` (utilisateur `ubuntu`, sudo sans mot de passe).

## Prérequis

- Accès SSH au VPS.
- Pour restaurer depuis OVH : le dépôt est lisible avec `/root/.restic/s3.env` (déjà en place sur le VPS).
- Si le VPS est perdu : il faut **la clé restic** (`/root/.restic/password`, copie dans ton gestionnaire de mots de passe), les clés S3
  (console OVH → Public Cloud → Object Storage → utilisateur `restic-vps-backups` → « Voir les credentials ») et le nom du bucket
  `vps-db-backups-7f3a9c2e`, endpoint `https://s3.gra.io.cloud.ovh.net`.

## Scénario 1 — voir ce que le script va sauvegarder (sans rien écrire)

```bash
ssh vps-ovh-projets 'sudo /srv/scripts/backup-databases.sh --dry-run'
```

Attendu : 6 lignes « trouvé postgres/mysql », `dry-run terminé`, code de sortie 0.

## Scénario 2 — lancer une sauvegarde complète à la main

```bash
ssh vps-ovh-projets 'sudo /srv/scripts/backup-databases.sh; echo exit=$?'
```

Attendu : `OK` pour chaque base, `[offsite] terminé`, `exit=0`, un nouveau `manifest-*.txt` dans `/srv/backups`.

## Scénario 3 — restaurer la prod Cloudbreak dans une base jetable (à refaire régulièrement)

```bash
ssh vps-ovh-projets 'bash -s' <<'EOF'
F=$(ls -t /srv/backups/postgres-parse-redundant-feed-hgevt8-cloudbreak-*.sql.gz | head -1)
sudo docker run -d --rm --name restoretest --network none -e POSTGRES_PASSWORD=x -m 256m postgres:16-alpine >/dev/null
for i in $(seq 1 30); do sudo docker exec restoretest pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
sudo docker exec restoretest createdb -U postgres cloudbreak
sudo docker exec restoretest psql -U postgres -c "create role cloudbreak login" >/dev/null
sudo zcat "$F" | sudo docker exec -i restoretest psql -U postgres -d cloudbreak -q 2>&1 | grep -ci error
for t in users peaks predictions subscriptions; do
  echo -n "$t: "; sudo docker exec restoretest psql -U postgres -d cloudbreak -Atc "select count(*) from $t"
done
sudo docker stop restoretest
EOF
```

Attendu : `0` erreur, les comptes de lignes correspondent à la prod (test du 2026-11-18 : 5 utilisateurs, 23 782 sommets).

## Scénario 4 — restaurer depuis la copie hors site OVH

```bash
ssh vps-ovh-projets 'sudo sh -c "set -a; . /root/.restic/s3.env; set +a
restic snapshots --compact
mkdir -m 700 /tmp/rt && restic restore latest --target /tmp/rt --include \"/srv/backups/postgres-parse-redundant-feed-hgevt8-cloudbreak-*\"
ls -l /tmp/rt/srv/backups; rm -rf /tmp/rt"'
```

Attendu : le fichier restauré a la même empreinte SHA-256 que celui de `/srv/backups` (vérifié le 2026-11-18).

## Scénario 4 bis — restaurer l'export Supabase (comptes)

```bash
ssh vps-ovh-projets 'sudo bash -s' <<'EOF'
f=$(ls -t /srv/backups/supabase-prod-*.sql.gz | head -1)
docker run -d --rm --name sbtest --network none -e POSTGRES_PASSWORD=x -m 384m postgres:17-alpine >/dev/null
for i in $(seq 1 30); do docker exec sbtest pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
docker exec sbtest psql -U postgres -qc "create role anon; create role authenticated; create role service_role; create role supabase_auth_admin; create schema extensions; create extension if not exists pgcrypto schema extensions;"
zcat "$f" | docker exec -i sbtest psql -U postgres -q 2>&1 | grep -i error
docker exec sbtest psql -U postgres -Atc "select count(*) from auth.users"
docker stop sbtest
EOF
```

Attendu : une seule erreur bénigne (`schema "public" already exists`) et le même nombre de comptes que dans Supabase (14 le 2026-11-18,
dont 2 avec mot de passe haché : les autres sont des comptes anonymes). Pour un vrai sinistre : restaurer ce dump dans un nouveau projet
Supabase (`psql` sur sa base), puis pointer `SUPABASE_URL`, les clés et le JWKS du backend et du mobile sur ce nouveau projet.

## Scénario 5 — le script détecte un problème

1. Arrêter temporairement un conteneur de base **de dev uniquement** (jamais la prod), ou retirer un nom de `expected-databases.txt`
   n'est pas un bon test : à la place, ajouter une ligne bidon `postgres-bidon` dans `/srv/scripts/expected-databases.txt`.
2. Relancer `sudo /srv/scripts/backup-databases.sh` : attendu `ERREUR: base attendue introuvable : postgres-bidon` et `exit=1`,
   **sans** copie hors site ni rotation.
3. Retirer la ligne bidon.

## Cas limites

- Disque presque plein : le script échoue sur le dump (fichier trop petit) ; surveiller `df -h /` (56 % le 2026-11-18).
- Base qui change de nom (app Dokploy recréée) : le script la trouve toujours, mais `expected-databases.txt` doit être mis à jour,
  sinon échec « base attendue introuvable » (c'est voulu).
- Ne pas lancer pendant un build Dokploy (serveur 2 vCPU / 3,7 Go).

## Checklist finale

- [ ] Scénario 1 : 6 bases trouvées
- [ ] Scénario 2 : `exit=0` et fichiers présents
- [ ] Scénario 3 : restauration prod OK (0 erreur, bons comptes)
- [ ] Scénario 4 : restauration depuis OVH OK, empreinte identique
- [ ] Scénario 5 : échec détecté
- [ ] Mot de passe restic enregistré dans ton gestionnaire de mots de passe
- [x] Alerte de consommation OVH posée (2026-11-18, seuil 5 €/mois)
- [ ] Heartbeat BetterStack branché (`HEARTBEAT_URL`)
