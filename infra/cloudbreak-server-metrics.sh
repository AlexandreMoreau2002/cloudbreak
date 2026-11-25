#!/usr/bin/env bash
# Relevé serveur toutes les 15 min (cron ubuntu) -> heartbeat Better Stack.
# OK -> <URL>, seuil franchi -> <URL>/fail. Le silence (script mort, VPS arrêté) alerte aussi.
# Seuils : disque > 85 %, RAM disponible < 10 %, swap utilisé > 75 %. Pas d'alerte CPU.
# Secret : l'URL du heartbeat est lue dans un fichier 600 et passée à curl par stdin (-K -),
# donc jamais en argument (invisible dans `ps`).
# DRY_RUN=1 : n'envoie rien, affiche les valeurs et le verdict.
# Surcharges de test : FREE_CMD, DF_CMD, NPROC_CMD, LOADAVG_FILE (remplacent les sources réelles).
set -u

HEARTBEAT_URL_FILE="${HEARTBEAT_URL_FILE:-$HOME/.cloudbreak-prod/heartbeat-server.url}"
LOG_FILE="${LOG_FILE:-$HOME/cloudbreak-server-metrics.log}"
FREE_CMD="${FREE_CMD:-free -m}"
DF_CMD="${DF_CMD:-df -P /}"
NPROC_CMD="${NPROC_CMD:-nproc}"
LOADAVG_FILE="${LOADAVG_FILE:-/proc/loadavg}"
DRY_RUN="${DRY_RUN:-0}"
API_HEADER_FILE="${API_HEADER_FILE:-$HOME/.cloudbreak-prod/cron.header}"
API_URL="${API_URL:-https://api.cloudbreak-app.com}"

DISK_MAX=85
RAM_AVAILABLE_MIN=10
SWAP_MAX=75

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# Disque : pourcentage utilisé de /
disk_pct=$($DF_CMD | awk 'NR==2 { gsub("%", "", $5); print $5 }')
# RAM : part DISPONIBLE (colonne available), pas used
ram_total=$($FREE_CMD | awk '/^Mem:/ { print $2 }')
ram_avail=$($FREE_CMD | awk '/^Mem:/ { print $7 }')
# Swap : part utilisée
swap_total=$($FREE_CMD | awk '/^Swap:/ { print $2 }')
swap_used=$($FREE_CMD | awk '/^Swap:/ { print $3 }')
load1=$(awk '{ print $1 }' "$LOADAVG_FILE")
cpus=$($NPROC_CMD)

if ! [[ "$disk_pct" =~ ^[0-9]+$ && "$ram_total" =~ ^[0-9]+$ && "$ram_avail" =~ ^[0-9]+$ \
  && "$swap_total" =~ ^[0-9]+$ && "$swap_used" =~ ^[0-9]+$ ]] || [ "${ram_total:-0}" -eq 0 ]; then
  echo "$(now) erreur de lecture des métriques (disk='$disk_pct' ram='$ram_total/$ram_avail' swap='$swap_total/$swap_used')" >>"$LOG_FILE"
  # Pas de ping : le silence déclenche l'alerte « heartbeat manquant ».
  [ "$DRY_RUN" = "1" ] && echo "ERREUR : lecture impossible"
  exit 1
fi

ram_avail_pct=$((ram_avail * 100 / ram_total))
if [ "$swap_total" -gt 0 ]; then swap_pct=$((swap_used * 100 / swap_total)); else swap_pct=0; fi

breaches=()
[ "$disk_pct" -gt "$DISK_MAX" ] && breaches+=("disque ${disk_pct}% > ${DISK_MAX}%")
[ "$ram_avail_pct" -lt "$RAM_AVAILABLE_MIN" ] && breaches+=("RAM disponible ${ram_avail_pct}% < ${RAM_AVAILABLE_MIN}%")
[ "$swap_pct" -gt "$SWAP_MAX" ] && breaches+=("swap ${swap_pct}% > ${SWAP_MAX}%")

values="disk=${disk_pct}% ram_available=${ram_avail_pct}% swap=${swap_pct}% load1=${load1} cpus=${cpus}"
if [ "${#breaches[@]}" -gt 0 ]; then
  verdict="ALERTE : $(IFS=';'; echo "${breaches[*]}")"
  suffix="/fail"
else
  verdict="OK"
  suffix=""
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "$values"
  echo "verdict: $verdict"
  echo "(DRY_RUN : rien n'est envoyé, rien n'est écrit dans le journal)"
  exit 0
fi

# Relevé envoyé au backend (console admin). Un échec ne change ni le verdict ni le heartbeat.
# Secret : en-tête lu dans un fichier 600 (-H @fichier), jamais en argument.
metrics_code="skip"
disk_total_gb=$($DF_CMD | awk 'NR==2 { printf "%.2f", $2 / 1048576 }')
disk_used_gb=$($DF_CMD | awk 'NR==2 { printf "%.2f", $3 / 1048576 }')
if [ -r "$API_HEADER_FILE" ] && [[ "$disk_total_gb" =~ ^[0-9.]+$ && "$disk_used_gb" =~ ^[0-9.]+$ && "$load1" =~ ^[0-9.]+$ && "$cpus" =~ ^[0-9]+$ ]]; then
  body=$(printf '{"sampled_at":"%s","cpu_load_1m":%s,"cpu_count":%s,"mem_total_mb":%s,"mem_available_mb":%s,"swap_total_mb":%s,"swap_used_mb":%s,"disk_total_gb":%s,"disk_used_gb":%s}' \
    "$(now)" "$load1" "$cpus" "$ram_total" "$ram_avail" "$swap_total" "$swap_used" "$disk_total_gb" "$disk_used_gb")
  metrics_code=$(printf '%s' "$body" | curl -sS -m 15 -o /dev/null -w '%{http_code}' -X POST -H @"$API_HEADER_FILE" -H 'Content-Type: application/json' --data-binary @- "$API_URL/internal/server-metrics" 2>/dev/null || echo "000")
fi

http_code="skip"
if [ -r "$HEARTBEAT_URL_FILE" ]; then
  url=$(tr -d '[:space:]' <"$HEARTBEAT_URL_FILE")
  http_code=$(printf 'url = "%s%s"\n' "$url" "$suffix" | curl -sS -m 20 -o /dev/null -w '%{http_code}' -K - 2>/dev/null || echo "000")
else
  http_code="no-secret"
fi

echo "$(now) $values verdict=\"$verdict\" heartbeat=$http_code metrics=$metrics_code" >>"$LOG_FILE"
exit 0
