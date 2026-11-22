# Ops console — prompts Codex (vague 1)

> Date : 2026-11-22. Un prompt = **bloc commun (§1)** collé en tête + **prompt de la story (§2 à §5)**. Contrats : `docs/ops-console-contrats.md`. Ordre : `docs/ops-console-stories.md` §6.

## 0. Conseils de lancement

| Story | Modèle / effort conseillé | Pourquoi |
|---|---|---|
| 10.3 backend admin | Le plus puissant disponible, effort **élevé** | Auth, audit, migration, surface sécurité : une erreur ici ouvre l'admin à n'importe qui. |
| 10.4a socle ops | Le plus puissant disponible, effort **élevé** | Session, vérification JWT, garde d'accès, et tout le reste de la console se construit dessus. |
| 10.2 `/version` | Modèle intermédiaire, effort **moyen** | Petit, bien borné, sans risque. |
| 10.1a alertes | Modèle intermédiaire, effort **moyen** | Un script et un log structuré ; le risque est côté VPS, pas côté code. |

- **Une session Codex par story, chacune dans son propre worktree** (`git worktree`), jamais deux sessions dans le même dossier.
- **Le code se fait en parallèle, mais les tests locaux se font un par un** : le backend Docker (`make dev`) et `next dev` utilisent des ports fixes, deux environnements locaux se marcheraient dessus. Chaque story s'arrête à la porte 1 avec son code prêt ; tu testes l'une après l'autre.
- **Ordre de test et de merge conseillé** : 10.2 (la plus simple, elle sert de répétition du circuit), puis 10.1a, puis 10.3, puis 10.4a. Ça limite les conflits sur `backend/app/main.py` (10.2 et 10.3 y ajoutent chacune un router).
- Le repo racine (bump des refs, `docs/versions.md`, `TODO.ops.md`, `sprint-status.yaml`, roadmap) est géré par Claude : les prompts interdisent à Codex d'y toucher.

## 1. Bloc commun (à coller en premier dans chaque prompt)

```text
Tu es l'agent d'exécution du projet Cloudbreak. Réponds en français, style direct.

LECTURES OBLIGATOIRES, dans cet ordre, avant toute action :
1. CLAUDE.md (racine) puis le CLAUDE.md du sous-projet concerné (backend/ ou ops/).
2. docs/ops-console-contrats.md : FAIT FOI pour les formats JSON, routes, flux, variables d'environnement. Ne réinvente aucun champ.
3. La section de ta story dans docs/ops-console-stories.md et ses critères d'acceptation dans _bmad-output/planning-artifacts/epics.md (Epic 10).
4. Maquettes (pour les stories d'interface) : artifact « Cloudbreak Ops », https://claude.ai/artifact/2rjCEjpiqoUfF1RUNC1vHB. Chaque frame a un identifiant (HOME-01, ACC-03…) cité dans la story.

MÉTHODE
- Commence par écrire un plan court : la liste des tâches, leurs fichiers, leurs dépendances. Montre-le, puis enchaîne sans attendre sauf blocage.
- Utilise des sous-agents : UN sous-agent par tâche indépendante (si ton environnement le permet). Chaque sous-agent reçoit : sa tâche, ses fichiers, les contrats concernés, le critère de réussite, la commande de test. Ne donne pas l'architecture entière.
- Un résultat de sous-agent n'est jamais cru sur parole : relance toi-même les tests.
- TDD léger : test rouge, implémentation minimale, refactor. Un fichier de test par fichier source.
- La revue finale est faite par un sous-agent DIFFÉRENT de celui qui a écrit le code, avec un regard neuf (contrats respectés ? AC couverts ? cas limites ? fuite de secret ou de donnée personnelle ?).

RÈGLES NON NÉGOCIABLES
- Imports : ordre en escalier (lignes du plus court au plus long, bibliothèques externes avant internes) ; alias @/ pour tout import qui remonte de dossier.
- Aucune string en dur côté ops (useTranslations + messages/fr.json et en.json, un espace de noms par page). Backend : logger, jamais print() ; erreurs {"detail","code"}.
- Ne modifie JAMAIS : backend/app/domain/score*.py, les migrations Alembic existantes (on en ajoute), backend/app/db/peaks_data.json, mobile/ios/, .env et tout secret.
- Aucun secret dans le code, les logs, les commits, tes messages ou la PR. Si un jeton ou un accès te manque, arrête-toi et dis précisément lequel et où le fournir.
- Ne crée aucun compte (Supabase ou autre) : demande à Alex.
- Git : branche feature/<story> depuis develop DANS LE SOUS-PROJET concerné. Jamais de commit sur develop ni main. Messages en Conventional Commits, impératifs. AUCUN Co-Authored-By, aucune mention de Claude ou de Codex. N'altère pas la config git globale : les commits partent sous l'identité déjà configurée en local dans le repo.
- Ne touche pas au repo racine (refs de submodules, TODO, sprint-status, docs/versions.md, roadmap) : Claude s'en charge.
- Plans et specs superpowers : docs/superpowers/, jamais committés.

ENVIRONNEMENT LOCAL
- Backend : cd backend && source .venv/bin/activate && make dev (Docker : API + Postgres + Redis, hot reload). Jamais uvicorn directement. Données : make seed puis make seed-test si utile.
- Ops : cd ops && npm install && npm run dev (port 3100). Config dans ops/.env.local à partir de ops/.env.example, valeurs du projet Supabase DEV. Ne les affiche jamais.
- Compte admin de test : Supabase DEV, avec app_metadata.role = "admin". S'il n'existe pas, demande-le à Alex.

LE CIRCUIT : 4 PORTES, TU T'ARRÊTES À CHACUNE ET TU ATTENDS UN « GO » EXPLICITE D'ALEX
À chaque porte : (a) lance l'environnement local sur le code actuel et vérifie qu'il démarre, (b) donne la liste exacte des étapes de test manuel (URL, commande ou requête .http, résultat attendu, y compris les cas d'erreur), (c) donne l'état : commandes de validation lancées et leur résultat réel, (d) STOP. Ne passe jamais à l'étape suivante sans « go ».
- PORTE 1 — avant d'ouvrir la PR : code terminé, validation complète verte (make validate côté backend, npm run validate côté ops).
- PORTE 2 — avant de lancer la revue : PR ouverte vers develop (squash prévu, description sans Co-Authored-By), CI verte.
- PORTE 3 — avant de corriger : montre la revue (findings classés par gravité, avec ton avis sur chacun), dis lesquels tu proposes de corriger et lesquels tu écartes, puis attends. Après correction, relance validation et environnement local.
- PORTE 4 — avant le merge : environnement local relancé sur la version finale, CI verte, aucune revue en attente. Après le « go » : merge en SQUASH vers develop, puis git checkout develop && git pull, supprime la branche locale et distante. Ne merge JAMAIS dans main.

RAPPORT FINAL (après le merge) : ce qui est livré, fichiers créés ou modifiés, commandes de validation et résultats, écarts avec les contrats ou les AC (s'il y en a), points à surveiller au déploiement.
```

## 2. Prompt — 10.3 Backend admin en lecture seule

```text
STORY : 10.3 — Backend admin en lecture seule (repo backend/, branche feature/10-3-admin-lecture-seule).
CONTRATS : docs/ops-console-contrats.md §3.2 (heartbeats), §3.3 (relevés serveur), §3.4 (overview). Respecte les noms de champs à la lettre.

TÂCHES (un sous-agent chacune, dans cet ordre de dépendance) :
A. Configuration et auth : ADMIN_USER_IDS dans app/core/config.py (UUID séparés par des virgules, vide = personne) ; dépendance require_admin dans app/core/dependencies.py : JWT Supabase valide + app_metadata.role == "admin" + sub dans l'allowlist ; sinon 403 {"code":"ADMIN_FORBIDDEN"} ; sans Authorization : 403 (comportement HTTPBearer).
B. Modèles et migration : table admin_audit_log (acteur UUID, action, ressource, horodatage UTC, résultat ; ni email ni secret) et table du dernier heartbeat par job (job, last_run_at, last_status, last_ok_at). UNE nouvelle migration Alembic, qui doit passer sur une BASE VIDE (alembic upgrade head) : ne te fie pas à create_all.
C. Routes internes : POST /internal/heartbeats/{job} (job : purge | favorites | backup, sinon 404 HEARTBEAT_UNKNOWN_JOB) et POST /internal/server-metrics, avec require_cron_secret existant. Stockage des relevés dans Redis (clés ops:server_metrics:last TTL 45 min, ops:server_metrics:history plafonnée à 96). Corps validés par Pydantic ; sampled_at à plus de 5 min de l'heure serveur : 422.
D. GET /api/v1/admin/overview : service app/services/admin_overview.py, schéma app/schemas/admin.py, EXACTEMENT la forme du §3.4 (KPIs avec delta_7d, checks_daily 14 jours, series_90d, crons avec les états ok | late | failed | never, bloc server avec ok | stale | never). Un jour sans donnée vaut 0. Aucune donnée personnelle. Chaque appel écrit une ligne d'audit. Lecture seule hors journal d'audit.
E. Fichiers REST Client : backend/http/admin.http (nominal, sans Authorization 403, non-admin 403, payload invalide 422, secret absent ou faux sur /internal/*, heartbeats, relevés).
F. Docs : backend/docs/security.md (surface admin, allowlist, journal d'audit, secret interne) et docs/story-10-3-*.md dans backend/docs/.

TESTS (obligatoires) : tests/test_api_admin.py, tests/test_admin_dependencies.py, tests/test_models_admin_audit_log.py, tests/test_migration_* (base vide), tests/features/test_admin_flow.py ; JWT valide, expiré, invalide ; allowlist vide ; chaque état de cron ; relevé périmé (stale) ; 404 job inconnu ; 503 sans secret.
REVUE : lance l'agent « cloudbreak-security » (ou, à défaut, un sous-agent dédié sécurité) avant la porte 1 : auth, audit, secrets, fuite de données.
VALIDATION : make validate dans backend/.

TEST LOCAL À PROPOSER À LA PORTE 1 : make dev ; make seed-test ; ouvrir backend/http/admin.http ; Alex se connecte au Supabase DEV pour obtenir un JWT admin et le colle dans SA variable locale REST Client (jamais dans le chat) ; scénarios : overview en admin (200, forme du contrat), en non-admin (403), sans token (403), envoi de heartbeats et de relevés puis relecture dans l'overview, relevé vieux de 31 min (état stale).
DONE QUAND : AC de la story 10.3 couverts, make validate vert, migration vérifiée sur base vide, revue sécurité sans point bloquant.
```

## 3. Prompt — 10.4a Socle de la console

```text
STORY : 10.4a — Socle de la console ops (repo ops/, branche feature/10-4a-socle-console).
CONTRATS : docs/ops-console-contrats.md §1 (décisions), §2.1 (connexion et accès), §5 (variables d'environnement ops). MAQUETTES : ACC-01 à ACC-06, NAV-01, TST-01, TST-02, ERR-01, ERR-02, et le cadre (barre latérale desktop, onglets mobile) visible dans HOME-01 et HOME-02. Règles d'interface communes : docs/ops-console-stories.md §3.

CONTEXTE : cette story est la FONDATION. Les pages Utilisateurs, Santé, Déploiements, Accueil et légales seront développées en parallèle par d'autres sessions sur ton socle : ce que tu livres ne sera plus modifié par elles.

TÂCHES (un sous-agent chacune) :
A. Session et garde (serveur uniquement, aucune variable NEXT_PUBLIC_) : connexion Supabase faite par une action serveur ; session en cookie httpOnly, Secure, SameSite=Lax ; vérification du JWT par JWKS (iss, aud, exp) ; refresh côté serveur ; garde « app_metadata.role == "admin" ET sub dans ADMIN_USER_IDS » réutilisable par les pages ET par les routes /api/admin/*. Aucun appel Supabase par requête au-delà du refresh. Le navigateur ne lit jamais le JWT.
B. Protection des routes : /[locale]/admin/** et /api/admin/** (middleware ou proxy Next 16 selon ce que la version supporte) ; noindex ; absentes de sitemap.ts ; exclues de robots ; non connecté : redirection vers la connexion ; connecté non admin : écran « accès refusé » neutre, aucune donnée.
C. Écrans d'accès : connexion (ACC-01), session expirée (ACC-02), accès refusé (ACC-03), connexion en cours (ACC-04), identifiants incorrects (ACC-05), service injoignable (ACC-06), déconnexion.
D. Cadre : barre latérale desktop, onglets mobile, panneau Préférences (thème, langue) (NAV-01). Mobile d'abord (375 pt), cibles tactiles >= 40 px, focus visible, prefers-reduced-motion respecté.
E. Composants d'état partagés, COMPLETS et documentés par leur test : squelette aux dimensions finales, bloc vide, source indisponible (nom de la source, heure de la dernière donnée, bouton Réessayer), erreur de bloc ; toasts (TST-01, TST-02) annoncés aux lecteurs d'écran. Statut jamais par la couleur seule (icône + libellé) ; source injoignable = gris « Inconnu », jamais rouge.
F. Pages d'erreur de la console : erreur inattendue (ERR-01), introuvable (ERR-02).
G. Quatre pages vides derrière la garde : Utilisateurs, Santé, Déploiements, Accueil, chacune avec son espace de traductions (admin.users, admin.health, admin.deployments, admin.home) ; un espace admin.common pour le cadre et les composants partagés. Dictionnaire fr/en d'abord depuis l'artifact.
H. Config : ops/.env.example complété avec toutes les variables du contrat §5, sans valeur réelle.

TESTS : Vitest co-localisés (garde : non connecté, non admin, admin, JWT expiré ou invalide ; allowlist vide ; chaque composant d'état ; parité des clés fr/en ; noindex et absence du sitemap) ; e2e Playwright de non-régression : CGU, confidentialité, /.well-known/apple-app-site-association et /sommet/[slug] répondent EXACTEMENT comme avant, aucun import de code admin depuis les pages légales.
VALIDATION : npm run validate dans ops/.

TEST LOCAL À PROPOSER À LA PORTE 1 : npm run dev (port 3100) ; sans session : /fr/admin redirige vers la connexion ; mauvais mot de passe (message ACC-05) ; compte NON admin du Supabase DEV (accès refusé neutre) ; compte admin (console vide, quatre pages accessibles) ; déconnexion ; mobile 375 pt et thème sombre ; les pages légales identiques à avant ; « afficher le code source » de /fr/admin pour vérifier noindex ; un cookie de session non lisible depuis la console du navigateur (httpOnly).
DONE QUAND : AC de la 10.4 qui concernent le socle couverts, npm run validate vert (e2e inclus), aucune dépendance du site légal vers le code admin.
```

## 4. Prompt — 10.2 `GET /version`

```text
STORY : 10.2 — GET /version sur backend ET ops (branche feature/10-2-version dans backend/, et la même dans ops/ : deux PR distinctes, une par repo).
CONTRAT : docs/ops-console-contrats.md §3.1.

TÂCHES (un sous-agent chacune) :
A. Backend : route publique GET /version (hors /api/v1), schéma Pydantic {service, sha, built_at, version, tag}, valeurs lues depuis les variables GIT_SHA, BUILT_AT, GIT_TAG (build args du Dockerfile transformés en ENV) ; sha = "unknown" et built_at = null sans erreur en build local ; version = version applicative du backend ; aucune variable d'environnement ni secret exposé. Test tests/test_api_version.py (nominal, SHA absent, pas de fuite) + backend/http/version.http.
B. Ops : route handler App Router GET /version au même format avec service "ops", version lue dans package.json ; exclue du middleware d'auth admin, du sitemap, sans effet sur les pages légales ni sur l'AASA ; test Vitest co-localisé ; variables GIT_SHA, BUILT_AT, GIT_TAG dans la config de build et dans .env.example.
C. Dockerfiles / build : ARG GIT_SHA, BUILT_AT, GIT_TAG -> ENV dans le Dockerfile backend et dans la config de build d'ops.
D. Investigation (lecture seule, sans toucher au serveur) : Dokploy fournit-il le SHA du commit au build ? Cherche dans la doc Dokploy et dans docs/infra-serveur.md. Écris la conclusion dans docs/infra-serveur.md du repo concerné SI tu as une réponse sûre ; sinon écris dans ton rapport « à vérifier sur dev », avec le repli : renseigner les build args à la main dans l'app Dokploy à chaque release.

VALIDATION : make validate (backend), npm run validate (ops).
TEST LOCAL À PROPOSER À LA PORTE 1 : make dev puis curl http://localhost:8000/version (sha "unknown" attendu) ; relancer avec GIT_SHA=abc123 ; npm run dev puis curl http://localhost:3100/version ; vérifier que /fr/privacy et l'AASA sont inchangés.
DONE QUAND : les deux routes répondent au contrat, tests verts, validations vertes dans les deux repos.
```

## 5. Prompt — 10.1a Alertes (sans le branchement au backend)

```text
STORY : 10.1a — Alertes : moniteur ops, script de métriques serveur (alertes Better Stack seules), log 5xx (backend/, branche feature/10-1a-alertes ; le script va dans infra/ du repo racine via une demande à Claude, voir plus bas).
CONTRATS : docs/ops-console-contrats.md §1 (décisions : pas d'agent Better Stack, seuils, pas d'alerte CPU), §6 (scripts du VPS). AC : epics.md, story 10.1. État actuel du VPS et des heartbeats : docs/infra-serveur.md. NE FAIS PAS le branchement sur POST /internal/* : c'est la 10.1b, après le déploiement de la 10.3.

TÂCHES (un sous-agent chacune) :
A. Log 5xx structuré (backend) : un JSON {"level":"error","path":"...","status":500,"error":"..."} pour toute erreur 5xx, sans print() ni stack trace brute en prod. Test tests/test_errors.py (ou fichier existant équivalent).
B. Script ~/cloudbreak-server-metrics.sh : lit free -m (colonne available), df /, /proc/loadavg, nproc ; calcule disque > 85 %, RAM disponible < 10 %, swap > 75 % (pas de seuil CPU) ; appelle le heartbeat Better Stack (URL = succès, URL/fail = seuil franchi) ; secret en fichier de permissions 600 et appel curl avec -H @fichier, jamais en argument ; journal ~/cloudbreak-server-metrics.log ; mode DRY_RUN=1 qui n'envoie rien et affiche les valeurs et le verdict ; aucune dépendance à installer ; shellcheck propre. Livre le script dans un fichier du repo racine à transmettre à Claude (ne commit pas toi-même dans le repo racine) avec son test en simulant des valeurs (variables d'environnement qui remplacent les commandes).
C. Procédure VPS (à exécuter seulement après la PORTE 1, avec « go » explicite) : UNE seule connexion SSH à la fois (ssh vps-ovh-projets, utilisateur ubuntu, jamais root, jamais de mot de passe), aucun redéploiement, aucun build, aucune modification des services ni crons existants. Pose le script, le fichier de secret (600) et la ligne de crontab ubuntu */15 * * * *. Better Stack : crée le moniteur HTTP de https://ops.cloudbreak-app.com/fr/privacy (prod uniquement, 2 vérifications consécutives, alerte e-mail) et le heartbeat « serveur » (attendu toutes les 15 min, marge 15 min). Ne touche pas au moniteur existant « Cloudbreak API production ». S'il te manque un accès ou un jeton Better Stack, arrête-toi et dis précisément lequel.
D. Panne simulée sur le dev (pas la prod) pour mesurer le délai de détection, et consigner les résultats (relevé du script, délai) dans docs/infra-serveur.md via Claude.

VALIDATION : make validate (backend) + checklist manuelle (DRY_RUN avec valeurs normales puis avec un seuil franchi, heartbeat reçu côté Better Stack, alerte reçue).
TEST LOCAL À PROPOSER À LA PORTE 1 : make dev, provoquer une erreur 5xx et lire le log JSON ; DRY_RUN=1 du script avec des valeurs normales puis avec disque à 90 %, RAM disponible à 5 % et swap à 80 % : le verdict doit nommer chaque seuil franchi.
DONE QUAND : log 5xx testé, script testé en simulation, moniteur et heartbeat créés, une alerte de test reçue, aucun secret dans le dépôt.
```
