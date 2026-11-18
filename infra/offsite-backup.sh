#!/usr/bin/env bash
# Copie hors site chiffrée (restic -> bucket S3 OVH, Gravelines) des sauvegardes de /srv/backups.
# Appelé par backup-databases.sh via OFFSITE_CMD, uniquement si tous les dumps ont réussi.
#
# Config : /root/.restic/s3.env (clés S3, RESTIC_REPOSITORY, RESTIC_PASSWORD_FILE), mode 600.
# Coût : quelques centimes/mois (dumps ≈ 7 Mo/nuit, dédupliqués, ~28 snapshots gardés).
# Aucune option payante : pas de versioning, pas de réplication.

set -euo pipefail
umask 077

BACKUP_DIR="/srv/backups"
set -a
# shellcheck disable=SC1091
. /root/.restic/s3.env
set +a

log() { echo "$(date -u +%FT%TZ) [offsite] $*"; }

log "envoi des sauvegardes"
restic backup "$BACKUP_DIR" \
  --tag nightly --host vps-ovh-projets \
  --exclude "$BACKUP_DIR/.backup.lock" \
  --exclude "$BACKUP_DIR/LAST_SUCCESS" \
  --exclude '*.partial' \
  --exclude "$BACKUP_DIR/backup.log" \
  --quiet

log "rotation : 14 jours, 8 semaines, 6 mois"
restic forget --tag nightly --keep-daily 14 --keep-weekly 8 --keep-monthly 6 --prune --quiet

# Vérification d'intégrité : métadonnées chaque nuit, 10 % des données le dimanche.
if [ "$(date -u +%u)" = "7" ]; then
  restic check --read-data-subset=10% --quiet
else
  restic check --quiet
fi

# Garde-fou de coût : le dépôt fait quelques centaines de Mo. Au-delà de 2 Go, quelque chose cloche
# (dump qui gonfle, boucle de sauvegarde) : on échoue pour déclencher l'alerte au lieu de payer en silence.
SIZE=$(restic stats --mode raw-data --json | python3 -c 'import json,sys;print(json.load(sys.stdin)["total_size"])')
MAX=$((2 * 1024 * 1024 * 1024))
if [ "$SIZE" -gt "$MAX" ]; then
  log "ERREUR: dépôt hors site à $((SIZE / 1048576)) Mo (> 2048 Mo), vérifier avant de continuer" >&2
  exit 1
fi

log "terminé ($((SIZE / 1048576)) Mo,$(restic snapshots --tag nightly --json | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))') snapshots)"
