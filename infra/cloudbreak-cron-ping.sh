#!/bin/sh
# Signale la fin d'un cron au backend (console admin) : POST /internal/heartbeats/{job}.
# Usage : cloudbreak-cron-ping.sh <purge|favorites|backup> <ok|fail> [detail] [duration_s]
# Secret : en-tête lu dans un fichier 600 (-H @fichier), jamais en argument.
# Ne fait JAMAIS échouer l'appelant : toute erreur est ignorée (code de sortie 0).
job="$1"; status="$2"; detail="$3"; duration="$4"
header="${API_HEADER_FILE:-/home/ubuntu/.cloudbreak-prod/cron.header}"
api="${API_URL:-https://api.cloudbreak-app.com}"
[ -r "$header" ] || exit 0
case "$job" in purge|favorites|backup) ;; *) exit 0 ;; esac
case "$status" in ok|fail) ;; *) exit 0 ;; esac
detail=$(printf '%s' "$detail" | tr -d '"\\' | tr '\n' ' ' | cut -c1-200)
body="{\"status\":\"$status\",\"detail\":\"$detail\""
case "$duration" in ''|*[!0-9]*) ;; *) body="$body,\"duration_s\":$duration" ;; esac
body="$body}"
printf '%s' "$body" | curl -s -m 10 -o /dev/null -X POST -H @"$header" -H 'Content-Type: application/json' --data-binary @- "$api/internal/heartbeats/$job" >/dev/null 2>&1
exit 0
