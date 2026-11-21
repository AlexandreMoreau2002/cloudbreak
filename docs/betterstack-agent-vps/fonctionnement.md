# Évaluation de Better Stack sur le VPS Cloudbreak

**Verdict NO-GO.** Le VPS disposait de 1 474 Mio de RAM au moment du relevé. Le Collector Better Stack demande au moins 2 Gio disponibles, même sans traçage eBPF. Pour Vector seul, la documentation consultée ne permet pas de garantir une mémoire résidente (RSS) sous la limite stricte de 100 Mo. L'évaluation s'est limitée à un relevé SSH en lecture seule et à la consultation de la documentation publique. Aucune installation n'a été autorisée et aucune modification n'a été effectuée sur le VPS.

```text
[VPS Cloudbreak] -- relevé SSH en lecture seule --+
                                                 +--> [Comparaison] --> [NO-GO]
[Documentation publique Better Stack] ----------+
```

## Relevé du VPS

Mesure prise le `2026-11-21T22:56:05+00:00`.

| Indicateur | Valeur |
| --- | --- |
| RAM totale | 3 819 Mio |
| RAM disponible (`available`) | 1 474 Mio sur 3 819, soit 38,6 % |
| Swap utilisé | 1 929 Mio sur 4 095, soit 47,1 % |
| Occupation de `/` | 57 % |
| Charge moyenne à 1, 5 et 15 min | 0,35 / 0,30 / 0,25 |

## Options étudiées

- **Collector Better Stack.** Le traçage eBPF est activé par défaut. Better Stack demande alors 4 Gio de RAM et 4 vCPU disponibles, ou 2 Gio et 2 vCPU sans ce traçage. Le minimum de 2 048 Mio dépasse déjà de 574 Mio la RAM disponible au relevé. Le swap est comptabilisé séparément. [Prérequis du Collector](https://betterstack.com/docs/logs/collector/), [Prérequis sur l’hôte](https://betterstack.com/docs/logs/collector/troubleshooting/)
- **Vector seul.** L’installation proposée pour Ubuntu ou Debian installe le paquet officiel, configure l’agent pour une source Better Stack, puis active et redémarre le service. Vector collecte les journaux et les métriques du serveur. Better Stack ne publie pas de plafond RSS permettant de valider la limite de 100 Mo pour cette configuration. [Installation de Vector](https://betterstack.com/docs/logs/vector/)
- **Configuration du Collector.** Les options couvrent notamment les métriques de l’hôte et les journaux Docker. Un exemple de réponse de l’API donne `memory_batch_size_mb` à 10 Mo. Ce champ indique la taille d’un lot en mémoire. La RSS mesure la mémoire résidente totale du processus. Better Stack indique aussi que les tampons disque du Collector totalisent 9 Go par défaut. [Configuration du Collector](https://betterstack.com/docs/logs/api/create-a-collector/), [Tampons disque](https://betterstack.com/docs/logs/collector/troubleshooting/)

## Fichiers livrés

- [Guide de test](guide-test.md) pour reproduire le relevé en lecture seule.
- [Fichier REST Client](../../http/betterstack-agent-vps.http) contenant uniquement des commentaires.

Aucun secret SSH ni jeton Better Stack n’est requis pour consulter ces fichiers.
