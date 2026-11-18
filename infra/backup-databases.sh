#!/usr/bin/env bash
# Sauvegarde de TOUTES les bases du serveur (Postgres, MySQL, MariaDB).
#
# - Découverte automatique des conteneurs de bases (pas de liste ni de mot de passe en dur).
# - Un fichier par base : <appName>-<base>-<horodatage UTC>.sql.gz (+ globals Postgres).
# - Écriture atomique (.partial puis mv), vérification gzip, refus des fichiers vides.
# - Code de sortie non nul au moindre échec ; heartbeat optionnel (BetterStack).
# - Rotation uniquement si tout s'est bien passé.
#
# Usage : backup-databases.sh [--dry-run]   (à lancer en root)
# Config optionnelle : /srv/scripts/backup.env (BACKUP_DIR, RETENTION_DAYS, HEARTBEAT_URL, OFFSITE_CMD)
# Bases attendues     : /srv/scripts/expected-databases.txt (un appName par ligne) — échec si absente.

set -uo pipefail
umask 077

BACKUP_DIR="/srv/backups"
RETENTION_DAYS=14
EXPECTED_FILE="/srv/scripts/expected-databases.txt"
HEARTBEAT_URL=""
OFFSITE_CMD=""
# shellcheck disable=SC1091
[ -f /srv/scripts/backup.env ] && . /srv/scripts/backup.env

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

TS=$(date -u +%Y-%m-%d_%H-%M)
FAILED=0
DUMPED=0
DISCOVERED=()

log() { echo "$(date -u +%FT%TZ) $*"; }
fail() { log "ERREUR: $*" >&2; FAILED=$((FAILED + 1)); }

heartbeat() {
  [ -n "$HEARTBEAT_URL" ] || return 0
  curl -fsS -m 10 --retry 3 -o /dev/null "$HEARTBEAT_URL$1" || log "heartbeat injoignable" >&2
}

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
exec 9>"$BACKUP_DIR/.backup.lock"
flock -n 9 || { log "une sauvegarde est déjà en cours" >&2; exit 1; }

# Écrit stdin dans un fichier .gz validé. $1 = chemin final.
store() {
  local final="$1" tmp="$1.partial"
  if ! gzip > "$tmp"; then rm -f "$tmp"; return 1; fi
  if ! gzip -t "$tmp" 2>/dev/null || [ "$(stat -c %s "$tmp")" -lt 100 ]; then rm -f "$tmp"; return 1; fi
  mv "$tmp" "$final"
}

backup_postgres() {
  local cid="$1" app="$2" dbs db out
  dbs=$(docker exec "$cid" sh -c \
    'psql -U "$POSTGRES_USER" -d postgres -Atc "select datname from pg_database where not datistemplate and datname <> '"'"'postgres'"'"'"') \
    || { fail "$app : liste des bases impossible"; return; }
  [ -n "$dbs" ] || dbs=$(docker exec "$cid" sh -c 'echo "${POSTGRES_DB:-$POSTGRES_USER}"')
  while IFS= read -r db; do
    [ -n "$db" ] || continue
    out="$BACKUP_DIR/$app-$db-$TS.sql.gz"
    if docker exec "$cid" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$1"' _ "$db" | store "$out" \
       && [ "${PIPESTATUS[0]}" -eq 0 ]; then
      log "OK postgres $app/$db ($(stat -c %s "$out") octets)"; DUMPED=$((DUMPED + 1))
      echo "$app $db postgres $(sha256sum "$out" | cut -d' ' -f1) $(basename "$out")" >> "$MANIFEST"
    else
      rm -f "$out"; fail "pg_dump $app/$db"
    fi
  done <<< "$dbs"
  # Rôles et droits (hors des dumps par base).
  out="$BACKUP_DIR/$app-globals-$TS.sql.gz"
  if docker exec "$cid" sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' | store "$out" \
     && [ "${PIPESTATUS[0]}" -eq 0 ]; then
    DUMPED=$((DUMPED + 1))
  else
    rm -f "$out"; fail "pg_dumpall globals $app"
  fi
}

backup_mysql() {
  local cid="$1" app="$2" out
  out="$BACKUP_DIR/$app-mysql-all-$TS.sql.gz"
  if docker exec "$cid" sh -c \
    'export MYSQL_PWD="${MYSQL_ROOT_PASSWORD:-$MARIADB_ROOT_PASSWORD}"; d=$(command -v mysqldump || command -v mariadb-dump); "$d" -uroot --single-transaction --routines --events --all-databases' \
    | store "$out" && [ "${PIPESTATUS[0]}" -eq 0 ]; then
    log "OK mysql $app ($(stat -c %s "$out") octets)"; DUMPED=$((DUMPED + 1))
    echo "$app all mysql $(sha256sum "$out" | cut -d' ' -f1) $(basename "$out")" >> "$MANIFEST"
  else
    rm -f "$out"; fail "mysqldump $app"
  fi
}

MANIFEST="$BACKUP_DIR/manifest-$TS.txt"
[ "$DRY_RUN" -eq 1 ] && MANIFEST=/dev/null
log "démarrage (dry_run=$DRY_RUN)"

while read -r cid name; do
  app="${name%%.*}"
  envs=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$cid" 2>/dev/null)
  if grep -q '^PG_MAJOR=' <<< "$envs"; then kind=postgres
  elif grep -qE '^(MYSQL_MAJOR|MARIADB_MAJOR)=' <<< "$envs"; then kind=mysql
  else continue; fi
  DISCOVERED+=("$app")
  log "trouvé $kind : $app"
  [ "$DRY_RUN" -eq 1 ] && continue
  "backup_$kind" "$cid" "$app"
done < <(docker ps --format '{{.ID}} {{.Names}}')

# Supabase prod (plan Free, sans sauvegarde automatique) : schémas auth (comptes, mots de passe hachés)
# et public, via le pooler session IPv4. Identifiants dans /root/.restic/supabase.env (600).
SUPABASE_ENV="/root/.restic/supabase.env"
SUPABASE_POOLER="aws-0-eu-west-2.pooler.supabase.com"
backup_supabase() {
  local out="$BACKUP_DIR/supabase-prod-auth-public-$TS.sql.gz"
  # shellcheck disable=SC1090
  . "$SUPABASE_ENV"
  if docker run --rm -e PGPASSWORD="$SUPABASE_PROD_DB_PASSWORD" -e PGCONNECT_TIMEOUT=15 postgres:17-alpine \
       pg_dump "host=$SUPABASE_POOLER port=5432 user=postgres.$SUPABASE_PROD_REF dbname=postgres sslmode=require" \
       --schema=auth --schema=public --no-owner --no-privileges | store "$out" \
     && [ "${PIPESTATUS[0]}" -eq 0 ]; then
    log "OK supabase-prod auth+public ($(stat -c %s "$out") octets)"; DUMPED=$((DUMPED + 1))
    echo "supabase-prod auth+public postgres $(sha256sum "$out" | cut -d' ' -f1) $(basename "$out")" >> "$MANIFEST"
  else
    rm -f "$out"; fail "pg_dump supabase-prod"
  fi
}
if [ -f "$SUPABASE_ENV" ]; then
  DISCOVERED+=("supabase-prod")
  log "trouvé supabase-prod"
  [ "$DRY_RUN" -eq 1 ] || backup_supabase
fi

# Une base attendue qui a disparu = échec (sinon on sauvegarde du vide en silence).
if [ -f "$EXPECTED_FILE" ]; then
  while IFS= read -r exp; do
    [ -z "$exp" ] || [[ "$exp" == \#* ]] && continue
    printf '%s\n' "${DISCOVERED[@]}" | grep -qx "$exp" || fail "base attendue introuvable : $exp"
  done < "$EXPECTED_FILE"
else
  fail "fichier des bases attendues absent : $EXPECTED_FILE"
fi
[ "${#DISCOVERED[@]}" -gt 0 ] || fail "aucune base découverte"

if [ "$DRY_RUN" -eq 0 ] && [ "$FAILED" -eq 0 ]; then
  [ -n "$OFFSITE_CMD" ] && { eval "$OFFSITE_CMD" || fail "copie hors site"; }
fi

if [ "$DRY_RUN" -eq 0 ] && [ "$FAILED" -eq 0 ]; then
  find "$BACKUP_DIR" -maxdepth 1 \( -name '*.sql.gz' -o -name 'manifest-*.txt' \) -mtime +"$RETENTION_DAYS" -delete
  touch "$BACKUP_DIR/LAST_SUCCESS"
  log "terminé : $DUMPED dumps, rotation ${RETENTION_DAYS} j"
  heartbeat ""
  exit 0
fi

if [ "$DRY_RUN" -eq 1 ] && [ "$FAILED" -eq 0 ]; then log "dry-run terminé"; exit 0; fi
log "terminé avec $FAILED erreur(s)" >&2
[ "$DRY_RUN" -eq 0 ] && heartbeat "/fail"
exit 1
