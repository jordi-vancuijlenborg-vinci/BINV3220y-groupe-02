# Matrice guides / senseurs et audit des guides par rapport à Web 2

## 1. Classification des mécanismes

Première version produite par Copilot, puis corrigée par nous (voir les conversations). Corrections apportées :

- le modèle de PR a été déplacé de « senseur » vers « guide » ;
- les bilans et les conversations ont été retirés, ce sont des traces et pas des senseurs ;
- on a ajouté les guides et senseurs oubliés ;
- la colonne « exécuté » se base sur ce qu'on a lancé pendant la séance, pas sur les anciens bilans.

| | Guide : feedforward (avant) | Senseur : feedback (après) |
|---|---|---|
| **Inférentiel** (interprété par une IA) | `.github/copilot-instructions.md` ; `docs/architecture.md` ; `backend/API.md` ; `docs/seed.md` ; `README.md` ; `docs/cdc_gesta_developpement.md` ; nos prompts et le mode Plan ; `.github/pull_request_template.md` | **Vide.** Aucune revue IA n'est configurée dans le dépôt. Ce rôle est joué seulement par la revue humaine (relecture des diffs, tests dans le navigateur) |
| **Computationnel** (règles ou calculs exécutables) | `.vscode/settings.json` (permissions et sandbox de l'agent) ; scripts npm (`package.json`) | Oxlint ; TypeScript ; tests Vitest backend et frontend ; build ; contraintes SQLite ; type guards du frontend ; refus du mode démo en production ; contrôle de la version de Node |

Il n'y a pas d'intégration continue : le dépôt n'a pas de `.github/workflows/`. Les senseurs ne tournent donc que si quelqu'un lance `npm run check`.

## 2. Inventaire détaillé

### Guides inférentiels

| Mécanisme | Fichier | Ce qu'il demande | Exemple | Exécuté / vérifié pendant la séance |
|---|---|---|---|---|
| Instructions Copilot | `.github/copilot-instructions.md` | Commandes, architecture en couches, conventions du dépôt | « Controllers parse/validate HTTP input and produce responses; they do not contain database queries or business rules. » | Chargé automatiquement par Copilot ; lu en entier pendant l'audit |
| Architecture | `docs/architecture.md` | Rôle de chaque dossier, parcours de référence | « `middlewares/` \| `authenticate` (401), `authorize` (403) » | Lu en entier. Copilot ne l'utilise que s'il l'ouvre ou si on le cite |
| Contrat d'API | `backend/API.md` | Routes, réponses, format des erreurs | `{ "error": { "code", "message" } }` | Lu |
| Données de démo | `docs/seed.md` | Utilisateurs et cas utiles pour tester | « Lucas Dupont, Inès Haddad : candidatures en cours » | Utilisé pour choisir les données des tests |
| README | `README.md` | Installation, commandes, choix techniques | « Validation par type guards écrits à la main » | Lu en entier pendant l'audit |
| Cahier des charges | `docs/cdc_gesta_developpement.md` | Comportement attendu | RG-03 : candidature seulement sur une offre « Publiée » | Relu par Copilot pour la matrice de traçabilité |
| Prompts et mode Plan | Chat Copilot | La tâche et ses limites | « sans modifier les tests existants ni le code de l'application » | Utilisés pendant toute la séance |
| Modèle de PR | `.github/pull_request_template.md` | Checklist avant fusion | « Les droits sont vérifiés par le backend, pas seulement masqués dans l'interface » | Utilisé pour la PR de cette séance |

### Guides computationnels

| Mécanisme | Fichier | Ce qu'il impose | Exemple | Exécuté / vérifié |
|---|---|---|---|---|
| Permissions de l'agent | `.vscode/settings.json` | Commandes auto-approuvées ou non, sandbox, réseau externe coupé | `npm run check` auto-approuvé ; `git commit` et `npm install` demandent une confirmation | Configuré. Effet constaté en semaine 6 : le réseau externe était bloqué pour le MCP Playwright. Pas vérifié séparément pendant cette séance |
| Scripts npm | `package.json` | Les commandes de vérification attendues | `check` = lint, typecheck, test, build | Utilisés pendant la séance |

### Senseurs computationnels

| Mécanisme | Fichier ou outil | Ce qu'il vérifie | Exemple | Exécuté / vérifié pendant la séance |
|---|---|---|---|---|
| Oxlint | `backend/.oxlintrc.json`, `frontend/.oxlintrc.json` | `eqeqeq`, `no-explicit-any`, variables inutilisées, règles des hooks React | `react/exhaustive-deps` en erreur | Exécuté : 0 avertissement, 0 erreur (backend 63 fichiers, frontend 53) |
| TypeScript | `tsc --noEmit` (backend), `tsc -b` (frontend) | Types en mode `strict` | `noUncheckedIndexedAccess` | Exécuté : aucune erreur |
| Tests backend | Vitest + Supertest, `backend/tests/` | Routes, droits, règles métier | `refuse une candidature d'un administrateur` | Exécuté : 131 tests au début, 141 après nos ajouts |
| Tests frontend | Vitest + Testing Library, `frontend/tests/` | Affichage, libellés, appels API simulés | `n'affiche le bouton que pour les candidatures en cours` | Exécuté : 62 tests |
| Build | `npm run build` | Compilation des deux parties | `vite build` | Exécuté : réussi |
| Contraintes SQLite | `backend/src/db/migrations/001_initial.sql` | `CHECK`, clés étrangères, unicité | Statut de candidature limité à 4 valeurs | Exécutées via `backend/tests/db/constraints.test.ts` (21 tests), par exemple `refuse un statut inconnu` |
| Type guards | `frontend/src/utils/guards.ts` | Forme des réponses de l'API | `isApplication` | Exécutés via `frontend/tests/guards.test.ts` (22 tests) |
| Refus du mode démo en production | `backend/src/config.ts` | `DEMO_AUTH_ENABLED=true` interdit avec `NODE_ENV=production` | Erreur au démarrage | Exécuté via le test `interdit le mode démo en production` (`backend/tests/auth.test.ts`). Copilot ne l'avait pas vu, on l'a ajouté |
| Version de Node | `requireSupportedNode.ts` (chargé par `backend/vitest.config.ts`) | Node 22.14 minimum | Message « Node … est trop ancien » | Exécuté via `nodeVersion.test.ts` (11 tests) |
| MCP Playwright | `.vscode/mcp.json` | Permettrait à l'agent d'utiliser un navigateur | `npx -y @playwright/mcp@latest` | Configuré, testé en semaine 6 (réseau externe bloqué). Pas utilisé comme senseur |

## 3. Audit des guides par rapport à Web 2

Sources Web 2 : slides du cours BINV2150-A, JavaScript avancé (séances 01 à 14, PDF exportés depuis https://e-vinci.github.io/BINV2150A-slides/).

Guides examinés : `.github/copilot-instructions.md`, `docs/architecture.md`, `README.md`.

Première version produite par Copilot à partir des attentes qu'on lui a données, puis corrigée par nous. Corrections apportées :

- **lignes 6 et 7** : passage mal attribué (une phrase sur le frontend citée comme si elle parlait du backend) ;
- **ligne 9** : mauvais fichier cité ;
- **ligne 8** : « Partielle » corrigée en « Non » ;
- **ligne 5** : « Non » corrigée en « Non applicable » ;
- **ligne 4** : `.gitignore` oublié ;
- **ligne 12** : « Partielle » corrigée en « Non » dans cette version ;
- **lignes 12 et 13** : ajoutées par nous.

| # | Attente Web 2 (source) | Guide examiné (fichier et passage) | Correspondance | Écart ou ajout proposé |
|---|---|---|---|---|
| 1 | Codes 200, 201, 400, 401, 403, 404, 409 (« 409 Conflict : conflit avec l'état actuel de la ressource, souvent doublon ») (séance 02) | `architecture.md` : « `authenticate` (401), `authorize` (403) » ; « `throw new HttpError(statut, code, message)` » | Partielle | Seuls 401 et 403 sont expliqués. Ajouter un tableau des codes avec leur usage, dont 201 pour une création et 409 pour un doublon |
| 2 | Documenter chaque route dans `API.md` ; « N'oubliez pas de mettre à jour la documentation et de tester vos routes » ; REST Client (séance 02) | `README.md` : « `backend/API.md` \| Routes de l'API, réponses et erreurs » ; « extension REST Client, pour les fichiers `backend/http/*.http` » | Partielle | Le guide dit où est la doc, mais pas qu'il faut la mettre à jour. En semaine 7, Copilot a oublié de documenter la route de retrait. Ajouter : « mettre à jour `API.md` et les fichiers `.http` à chaque route ajoutée ou modifiée » |
| 3 | Authentification (401) et autorisation (403) ; middleware qui protège les routes ; contrôle côté serveur (séance 03) | `architecture.md` : « `authorize(règle)` refuse la requête avec un 403 si la règle n'est pas respectée » ; `copilot-instructions.md` : « roles and company relationships are reread from the database on every request » | Oui | |
| 4 | « La clé secrète ne doit jamais être écrite dans le code (ni dans Git) » ; `.env` dans `.gitignore` (séance 03) | `copilot-instructions.md` : « Keep environment and generated database files out of version control. Configure local values through `backend/.env` » ; `.gitignore` contient `.env` | Partielle | Le `.env` est bien exclu de Git. Ajouter explicitement : « ne jamais écrire un secret dans le code » |
| 5 | Ne jamais stocker un mot de passe en clair, utiliser bcrypt (séance 04) | `README.md` : mode démo « sans mot de passe » | Non applicable | Gesta n'a pas de mot de passe : la connexion prévue se fait par lien envoyé par e-mail (RG-14) |
| 6 | Valider le body avec un type guard (ex. `isCredentialsDTO`), 400 sinon (séances 01 et 03) | `architecture.md` : « `controllers/` \| Routes, validation des paramètres et du corps, réponses HTTP » | Partielle | Le guide dit où valider, pas comment. Ajouter : type guard dédié, 400 si invalide. Préciser aussi le code d'erreur pour un paramètre d'URL invalide (Copilot a utilisé `INVALID_BODY` en semaine 7) |
| 7 | « La validation du frontend améliore l'expérience, mais ne remplace pas celle du backend » ; formulaires contrôlés avec label (séance 12) | `architecture.md` : « `controllers/` \| … validation des paramètres et du corps » (backend) ; rien sur les formulaires | Partielle | Ajouter la phrase de la séance 12 et la règle « chaque champ a un label » |
| 8 | `key` unique et stable (id des données) ; prévoir l'affichage d'une liste vide (séance 10) | Aucun passage | Non | Ajouter : `key={item.id}`, jamais l'index ; un état vide explicite (le code utilise déjà `EmptyState`) |
| 9 | Règles des hooks ; état immuable ; valeurs dérivées calculées et pas stockées (séances 11 et 13) | `copilot-instructions.md` : « Hooks own loading/error state, abort in-flight fetches on cleanup » ; `README.md` : Oxlint « configuré pour les règles essentielles de React et TypeScript (hooks, dépendances des effets, `any`) » | Partielle | Les règles des hooks sont vérifiées par Oxlint. L'immutabilité et les valeurs dérivées ne sont dites nulle part |
| 10 | `aria-label` pour un bouton sans texte (séance 11) | Aucun passage | Non | Ajouter la règle. Le code utilise déjà `aria-label` et `role="alert"`, mais par habitude et non parce que le guide le demande |
| 11 | Un composant ne modifie jamais ses props ; données qui descendent, callbacks `onXxx` qui remontent (séances 08 et 14) | `architecture.md` : « Le jeton et la fonction de déconnexion sont transmis aux pages par les props » | Partielle | Ajouter la règle des props en lecture seule et la convention `onXxx` |
| 12 | « 403 Forbidden : authentifié mais pas autorisé », « 404 Not Found : ressource inexistante » (séance 02) | Aucun passage n'explique quand répondre 404 pour une ressource qui existe | Non | Notre API répond 404 pour une offre non publiée et pour la candidature d'un autre étudiant, pour ne pas révéler qu'elles existent. C'est un choix défendable, mais il s'écarte de la définition de Web 2 et aucun guide ne l'explique. À documenter dans `API.md` et dans les instructions |
| 13 | « PATCH : modifier partiellement une ressource » (séance 02) | Aucun passage | Non | Le retrait est `POST /applications/:id/withdraw` (action métier) au lieu de `PATCH /applications/:id`. À justifier dans `API.md`, et à cadrer dans les guides : quand une action peut sortir des conventions REST |

### Court rapport

- **Ce qui correspond.** L'architecture en couches, l'authentification et l'autorisation côté serveur, et l'exclusion du `.env`. Copilot a respecté ces points lors des séances précédentes.
- **Ce qui manque surtout côté backend** :
  - l'usage des codes HTTP (lignes 1 et 12) ;
  - l'obligation de mettre à jour la documentation (ligne 2) ;
  - la façon de valider les entrées (ligne 6).

  Ce sont justement les points où Copilot a fait des choix discutables ou des oublis en semaine 7.
- **Ce qui manque côté frontend.** Les conventions React vues en Web 2 (lignes 8 à 11) : `key`, immutabilité, props, accessibilité.
- **Deux écarts réels avec Web 2 ont été décidés sans être documentés** : le 404 au lieu du 403, et le POST au lieu du PATCH.

**Ajouts proposés pour `.github/copilot-instructions.md`.** C'est une recommandation : le guide n'a pas été modifié, l'énoncé demande un audit.

```md
## Working rules

- HTTP status codes: 201 on creation, 400 invalid input, 401 no session, 403 other profile, 404 missing resource or resource owned by another user (do not reveal it), 409 business conflict such as a duplicate.
- Validate every request body and path parameter in the controller with a hand-written type guard; respond 400 when invalid.
- For every new or changed route, update backend/API.md and backend/http/*.http.
- For every new endpoint, add backend tests for the success case and each refusal and limit. A test name must match what its assertions check.
- Never write a secret in the code.
- React: use the data id as key, never mutate state or props, compute derived values during render, give every input a label and every icon button an aria-label.
```
