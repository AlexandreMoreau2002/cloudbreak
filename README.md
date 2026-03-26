# Cloudbreak

Repo racine du projet Cloudbreak — application mobile iOS qui prédit la probabilité d'observer une mer de nuage depuis un sommet donné, à une date et heure précises.

Ce repo ne contient pas de code applicatif. Il référence les trois sous-projets via des git submodules et centralise la documentation de planification.

## Sous-projets

| Repo | Description |
|------|-------------|
| [cloudbreak-mobile](https://github.com/AlexandreMoreau2002/cloudbreak-mobile) | App iOS — Expo SDK 55 / React Native |
| [cloudbreak-backend](https://github.com/AlexandreMoreau2002/cloudbreak-backend) | API — FastAPI / Python 3.12 |
| [cloudbreak-infra](https://github.com/AlexandreMoreau2002/cloudbreak-infra) | Infra — Docker Compose / Caddy |

## Installation

```bash
# Cloner le repo racine avec tous les submodules
git clone --recurse-submodules https://github.com/AlexandreMoreau2002/cloudbreak.git

# Si déjà cloné sans --recurse-submodules
git submodule update --init --recursive
```

## Dépannage mobile

### Arrêter complètement le simulateur iOS

Sur macOS, `Cmd+Q` ferme souvent seulement l'interface de `Simulator.app`. Le device iOS simulé peut rester démarré en arrière-plan via `CoreSimulator`.

Pour arrêter complètement le simulateur et ses services :

```bash
killall Simulator
xcrun simctl shutdown all
killall -9 com.apple.CoreSimulator.CoreSimulatorService
```

À utiliser si le simulateur semble "encore ouvert", bloqué, ou si un relaunch Expo/iOS repart sur un état cassé.

## Agents BMAD

Les agents BMAD (workflows IA de planification et développement) sont stockés dans `_bmad/` — non versionné, à installer manuellement sur chaque machine.

### Installation des agents

```bash
npx bmad-method install
```

Dans Claude Code, les agents sont ensuite disponibles via les commandes `/bmad-*`

### Agents disponibles

| Commande | Usage |
|----------|-------|
| `/bmad-bmm-dev-story` | Implémenter une story du sprint |
| `/bmad-bmm-create-story` | Créer le fichier détaillé d'une story |
| `/bmad-bmm-sprint-status` | Voir l'avancement du sprint |
| `/bmad-bmm-code-review` | Review adversariale du code |
| `/bmad-bmm-correct-course` | Gérer un changement en cours de sprint |

Les artifacts de planification (PRD, architecture, epics, sprint status) sont dans `_bmad-output/` — versionné et disponible sans installation.

## Contenu

- `_bmad-output/` — artifacts de planification (PRD, architecture, epics, sprint status)
- `CLAUDE.md` — instructions pour Claude Code (conventions, workflow de dev, structure)
- `mobile/` — submodule cloudbreak-mobile
- `backend/` — submodule cloudbreak-backend
- `infra/` — submodule cloudbreak-infra
