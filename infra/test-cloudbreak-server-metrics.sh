#!/usr/bin/env bash
# Test du script de métriques par simulation (aucun réseau, aucun secret réel).
# Usage : infra/test-cloudbreak-server-metrics.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/cloudbreak-server-metrics.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0

check() { # nom, condition (0 = ok)
  if [ "$2" -eq 0 ]; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi
}

# sim <disque%> <ram_dispo_Mo> <swap_utilise_Mo> : RAM totale 3700 Mo, swap total 4000 Mo
sim() {
  cat >"$TMP/free.txt" <<EOT
               total        used        free      shared  buff/cache   available
Mem:            3700        1000         500          10        2200        $2
Swap:           4000        $3        4000
EOT
  printf 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/sda1 100 50 50 %s%% /\n' "$1" >"$TMP/df.txt"
  echo "0.50 0.40 0.30 1/200 123" >"$TMP/loadavg"
  export FREE_CMD="cat $TMP/free.txt" DF_CMD="cat $TMP/df.txt" NPROC_CMD="echo 2" LOADAVG_FILE="$TMP/loadavg"
}

# 1. valeurs normales
sim 40 1500 500
out=$(DRY_RUN=1 "$SCRIPT"); echo "$out" | grep -q "verdict: OK"; check "valeurs normales -> OK" $?

# 2. chaque seuil seul
sim 90 1500 500
out=$(DRY_RUN=1 "$SCRIPT"); echo "$out" | grep -q "disque 90%"; check "disque 90% nommé" $?
sim 40 185 500
out=$(DRY_RUN=1 "$SCRIPT"); echo "$out" | grep -q "RAM disponible 5%"; check "RAM dispo 5% nommée" $?
sim 40 1500 3200
out=$(DRY_RUN=1 "$SCRIPT"); echo "$out" | grep -q "swap 80%"; check "swap 80% nommé" $?

# 3. les trois à la fois
sim 90 185 3200
out=$(DRY_RUN=1 "$SCRIPT")
echo "$out" | grep -q "disque 90%" && echo "$out" | grep -q "RAM disponible 5%" && echo "$out" | grep -q "swap 80%"
check "trois seuils nommés ensemble" $?

# 4. limites : 85 % pile, 10 % pile, 75 % pile ne déclenchent pas
sim 85 370 3000
out=$(DRY_RUN=1 "$SCRIPT"); echo "$out" | grep -q "verdict: OK"; check "valeurs limites exactes -> OK" $?

# 5. DRY_RUN n'appelle pas curl ni n'écrit le journal
mkdir -p "$TMP/bin"
cat >"$TMP/bin/curl" <<'EOT'
#!/usr/bin/env bash
echo "ARGS: $*" >>"$CURL_LOG"
cat >>"$CURL_LOG"
printf '200'
EOT
chmod +x "$TMP/bin/curl"
export CURL_LOG="$TMP/curl.log" LOG_FILE="$TMP/metrics.log" HEARTBEAT_URL_FILE="$TMP/hb.url"
echo "https://uptime.example/api/v1/heartbeat/SECRETTOKEN" >"$TMP/hb.url"; chmod 600 "$TMP/hb.url"
sim 40 1500 500
PATH="$TMP/bin:$PATH" DRY_RUN=1 "$SCRIPT" >/dev/null
[ ! -e "$CURL_LOG" ] && [ ! -e "$LOG_FILE" ]; check "DRY_RUN : aucun envoi, aucun journal" $?

# 6. envoi réel simulé : OK -> URL nue, jamais en argument
PATH="$TMP/bin:$PATH" "$SCRIPT"
grep -q 'url = "https://uptime.example/api/v1/heartbeat/SECRETTOKEN"' "$CURL_LOG"; check "OK -> URL sans /fail" $?
! grep '^ARGS:' "$CURL_LOG" | grep -q SECRETTOKEN; check "secret jamais en argument de curl" $?
! grep -q SECRETTOKEN "$LOG_FILE"; check "secret absent du journal" $?
grep -q 'heartbeat=200' "$LOG_FILE"; check "journal : code HTTP" $?

# 7. seuil franchi -> /fail
rm -f "$CURL_LOG"; sim 90 1500 500
PATH="$TMP/bin:$PATH" "$SCRIPT"
grep -q 'SECRETTOKEN/fail"' "$CURL_LOG"; check "seuil franchi -> /fail" $?

# 8. lecture impossible : pas de ping (le silence alerte)
rm -f "$CURL_LOG"; echo "garbage" >"$TMP/df.txt"
PATH="$TMP/bin:$PATH" "$SCRIPT"; rc=$?
[ "$rc" -ne 0 ] && [ ! -e "$CURL_LOG" ]; check "métriques illisibles -> pas de ping, code non nul" $?

exit $fail
