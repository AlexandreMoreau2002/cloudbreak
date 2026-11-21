# Guide de vérification du relevé VPS

## Prérequis

Pour refaire le relevé, utiliser son accès SSH existant au VPS avec l’alias local `vps-ovh-projets` et un compte autorisé à exécuter `sudo docker stats` sans invite interactive. La consultation des livrables ne requiert aucun secret SSH ni jeton Better Stack.

## Refaire le relevé en lecture seule

1. Exécuter cet appel SSH unique depuis le poste local.

   ```sh
   ssh vps-ovh-projets 'set -e
     export LC_ALL=C
     date -u +%Y-%m-%dT%H:%M:%S%:z
     free -m
     df -h /
     uptime
     stats=$(sudo docker stats --no-stream --format "{{.Name}} {{.MemUsage}}")
     printf "%s\n" "$stats" | grep -E "^dokploy([.][0-9]+[.]|[[:space:]]|$)"
   '
   ```

2. Dans la ligne `Mem:` de `free -m`, relever `available` et `total`. Diviser le premier par le second et multiplier par 100. Pour le swap, faire le même calcul avec `used` et `total` sur la ligne `Swap:`.
3. Relever l’occupation de `/` dans la colonne `Use%` de `df` et les trois moyennes de charge à la fin de `uptime`. Pour Dokploy, comparer la valeur avant `/` dans la sortie Docker à la mesure historique de `759.1MiB`. Comparer les autres valeurs au [relevé initial](fonctionnement.md#relevé-du-vps).
4. Appliquer les seuils stricts aux mesures. Une alerte se déclenche si l’occupation de `/` dépasse 85 %, si la RAM disponible passe sous 10 % de la RAM totale ou si le swap utilisé dépasse 75 % du swap total. Une valeur égale à son seuil ne déclenche pas d’alerte.
5. Comparer la RAM disponible au minimum de 2 048 Mio pour le Collector sans traçage eBPF. Pour Vector seul, vérifier que les conditions de la limite de 100 Mo sont documentées. Le relevé initial est inférieur au minimum du Collector et la documentation Vector consultée ne garantit pas ce plafond. [Prérequis du Collector](https://betterstack.com/docs/logs/collector/troubleshooting/), [Installation de Vector](https://betterstack.com/docs/logs/vector/)

## Cas limites

- Si l’alias est absent ou si la connexion SSH échoue, le relevé reste indisponible. Utiliser la cible SSH déjà configurée pour ce VPS lors d’une nouvelle tentative.
- Si Docker renvoie une erreur ou si le filtre ne renvoie aucune ligne Dokploy, noter la mesure de Dokploy comme indisponible.
- Si le total du swap vaut zéro, noter « swap désactivé » et omettre le pourcentage.
- Si la RAM disponible atteint 2 048 Mio, réévaluer les prérequis complets du Collector et la limite de 100 Mo. Un relevé ponctuel décrit uniquement l’état du VPS à l’heure affichée.

## Checklist

- [ ] Horodatage UTC, RAM, swap, occupation de `/`, charge et mémoire de Dokploy relevés lors du même appel SSH.
- [ ] Pourcentages recalculés, seuils stricts vérifiés et résultats comparés au relevé initial.
- [ ] Prérequis du Collector et plafond RSS de Vector examinés dans la documentation publique.
- [ ] Vérification effectuée en lecture seule et sans jeton Better Stack.
