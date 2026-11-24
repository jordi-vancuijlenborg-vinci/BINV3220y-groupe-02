# Bilan semaine 10 : MCP et tests end-to-end avec Playwright

Fichiers de la séance :

- `e2e/recherche-offres/scenarios.md` : les deux scénarios ;
- `e2e/recherche-offres/recherche-offres.spec.ts` : les tests Playwright ;
- `playwright.config.ts` : la configuration ;
- `.mcp.json` : la configuration du serveur Playwright MCP ;
- `conversation-1.md` : l'essai avec Playwright MCP ;
- `conversation-2.md` : la génération des tests Playwright.

## Scénarios

Les scénarios sont dans [`e2e/recherche-offres/scenarios.md`](../../e2e/recherche-offres/scenarios.md). On les a écrits avant de solliciter Copilot, à partir des règles de la semaine 9 (EF-30) :

- **Scénario 1, recherche avec résultat.**
  - **État initial** : connecté comme l'étudiant Lucas Dupont, avec les données de démo.
  - **Action** : saisir `  API  ` (majuscules et espaces autour).
  - **Résultat attendu** : « 1 offre », seule « API REST de facturation » est affichée.
- **Scénario 2, recherche sans résultat.**
  - **Action** : en tant que Lucas, saisir `zzz`.
  - **Résultat attendu** : le message « Aucune offre ne correspond à votre recherche. » s'affiche, sans tableau.

**Pourquoi ces deux cas.**

- Le scénario 1 vérifie le cas courant, mais aussi deux règles de la semaine 9 : la casse et les espaces sont ignorés.
- Il vérifie en plus la visibilité selon le profil. Le mot « api » se trouve dans deux titres : « **API** REST de facturation » (publiée) et « Numérisation d'archives p**api**er » (archivée). Un étudiant ne doit voir que la première.
- Le scénario 2 est le cas limite déjà essayé en semaine 9, avec un message précis à contrôler.

**Vérifications manuelles avant les tests.**

- Scénario 2 joué à la main : le message s'affiche.
- Connectées comme l'administratrice Anne Leclercq, une recherche `api` affiche bien les **2** offres. Ça prouve que l'absence de « Numérisation d'archives papier » chez Lucas vient du filtre de visibilité, et pas de la recherche.

## MCP

**Scénario visé : le 1. Résultat : non exécuté.**

1. Le serveur a démarré dans notre terminal (`npx -y @playwright/mcp@latest --isolated --port 8931`) et affichait `Listening on http://localhost:8931`.
2. On a créé `.mcp.json` à la racine et vidé l'ancienne entrée stdio de `.vscode/mcp.json` (`"servers": {}`), pour ne pas avoir de doublon.
3. VS Code affichait **« Error »** sur le serveur `playwright`, et le bouton Start ne changeait rien. On a aussi essayé le format `.vscode/mcp.json` (`servers`), avec le même résultat.
4. L'onglet Output donnait la cause : `Server 'playwright' failed: Cannot start an MCP server before the session runtime has been created. Send a message first.` La configuration n'était donc pas en cause : le serveur ne peut démarrer qu'après un premier message dans le chat.
5. Après l'envoi du prompt du scénario 1, Copilot a répondu qu'il n'avait **pas pu exécuter le scénario**, parce que l'ouverture de `http://localhost:5173` avait été « bloquée par la politique réseau du navigateur (accès à localhost bloqué) ». Il l'a dit honnêtement : « le compteur, l'offre publiée et l'absence de l'offre archivée restent donc non vérifiés ».
6. Notre hypothèse : Copilot a utilisé le navigateur intégré de VS Code et non les outils du serveur Playwright MCP. Ce navigateur est bloqué par le réglage `"chat.agent.networkFilter": true` de `.vscode/settings.json` (« Bloque également les outils Fetch et navigateur intégrés »). On n'a pas pu le confirmer.
7. **Aucun appel d'outil Playwright MCP** (`browser_navigate`, `browser_type`…) n'a pu être observé. On ne peut donc pas en décrire deux avec leur retour, comme le demande l'énoncé.

Après environ 40 minutes, l'enseignant a confirmé que le serveur MCP ne fonctionnait pas dans cette configuration et nous a demandé de passer à la partie 3.

## Playwright Test

**Installation** : `npm init playwright@latest` (TypeScript, dossier `e2e`, sans GitHub Actions, avec les navigateurs).

- L'installation a modifié `package.json`, `package-lock.json` et `.gitignore`. Elle a créé `e2e/example.spec.ts`, qu'on a supprimé parce qu'il testait un site externe.
- **`playwright.config.ts` n'a pas été créé.** On l'a écrit nous-mêmes :
  - `testDir: "./e2e"` ;
  - `baseURL: "http://localhost:5173"` ;
  - `webServer` qui lance `npm run dev`, ou le réutilise s'il tourne déjà ;
  - Chromium seulement, un seul worker.
- On a vérifié que `package-lock.json` contient toujours `@esbuild/win32-x64` et `@rolldown/binding-win32-x64-msvc`, comme le demande le README.

**Génération** : Copilot a écrit `e2e/recherche-offres/recherche-offres.spec.ts` (55 lignes, aucun autre fichier modifié).

- Une fonction commune ouvre l'application, clique sur le bouton « Lucas Dupont », puis sur « Offres » dans la navigation « Navigation principale ». Elle vérifie que le titre « Offres de stage » est visible.
- **`Scénario 1 — recherche avec résultat et vérification de la visibilité`** : saisit `  API  ` dans le champ `searchbox` « Rechercher dans les titres ». Ses assertions :
  - le texte exact « 1 offre » est visible ;
  - le tableau a 2 lignes (l'en-tête et une offre) ;
  - la cellule exacte « API REST de facturation » est visible ;
  - le tableau ne contient pas « Numérisation d'archives papier ».
- **`Scénario 2 — recherche sans résultat`** : saisit `zzz`. Ses assertions :
  - le message exact « Aucune offre ne correspond à votre recherche. » est visible ;
  - aucun tableau n'est affiché.
- Les sélecteurs utilisent les rôles et les noms accessibles, pas de CSS. Chaque test se connecte lui-même dans un navigateur neuf, donc l'ordre d'exécution ne compte pas.
- **Limite** : il n'y a pas de préparation des données. Les tests supposent les données de démo d'origine (`npm run db:reset`). Ils sont quand même répétables, puisqu'ils font seulement des recherches et ne modifient rien.

**Ce que Copilot a dit, et ce qu'on a vérifié.**

- Copilot n'a pas pu lancer les tests : le téléchargement de Chromium était bloqué par la sandbox (`EACCES`). Il l'a correctement attribué à l'environnement, pas aux tests.
- Il a aussi affirmé que « Numérisation d'archives papier » ne contient pas « API », et que l'assertion d'absence ne prouvait donc rien. **C'est faux** : « p**api**er » contient « api », et la recherche ignore la casse. On l'a vérifié avec le compte administrateur (2 résultats).

**Exécutions** (lancées par nous, `npx playwright test`) :

| Exécution | Résultat |
|---|---|
| 1 | 2 passed (14,6 s, démarrage compris) |
| 2 | 2 passed (1,7 s) |

**`npm run check`** : lint sans avertissement, typecheck OK, 155 tests backend, 65 tests frontend, build réussi.

Cette commande **ne lance pas** les tests E2E : les scripts du projet ne les contiennent pas. Il faut lancer `npx playwright test` séparément.

## Vérification par un défaut temporaire

**Défaut introduit** : dans `backend/src/repositories/offers.repository.ts`, on a ajouté `@title IS NOT NULL OR` dans la condition de recherche. La condition devient `@title IS NULL OR @title IS NOT NULL OR LOWER(o.title) LIKE …` : elle est toujours vraie, et la recherche ne filtre plus rien.

- **Premier essai : échec, mais pour une mauvaise raison.**
  - Les deux tests ont dépassé le délai à l'étape de connexion : `waiting for getByRole('button', { name: 'Lucas Dupont' })`.
  - Le backend ne répondait pas pendant son redémarrage, donc la liste des utilisateurs de démo ne s'affichait pas.
  - Cet échec ne prouvait rien : on l'a écarté.
- **Deuxième essai**, après avoir attendu le redémarrage du backend et vérifié dans le navigateur que `zzz` affichait les 4 offres :
  - scénario 1 : `Locator: getByText('1 offre', { exact: true }) … element(s) not found` ;
  - scénario 2 : `Locator: getByText('Aucune offre ne correspond à votre recherche.', { exact: true }) … element(s) not found`.

  Les deux tests échouent donc sur leurs assertions, à cause du défaut.
- **Restauration** : `git restore backend/src/repositories/offers.repository.ts`. Les tests repassent (2 passed) et `git status` est propre. Le défaut n'est pas dans la PR.

## Comparaison

**1. Que permet Playwright MCP dans la conversation avec l'agent ? Quelle action précise avez-vous vu passer par un outil MCP ?**

Playwright MCP donne à l'agent des outils pour piloter un navigateur : ouvrir une page, cliquer, saisir, lire l'état de la page. L'agent peut alors vérifier une fonctionnalité lui-même et adapter ses actions à ce qu'il observe.

Dans notre cas, **aucune action n'est passée par un outil MCP** : le serveur n'a jamais été connecté. La seule tentative d'ouverture de l'application a été bloquée par la politique réseau.

**2. Qu'apportent les scripts Playwright Test que le compte rendu d'un test par MCP n'apporte pas ?**

- Ils sont versionnés dans le dépôt et réexécutables sans agent, à l'identique : on les a lancés deux fois avec le même résultat.
- Leurs assertions sont explicites, donc on sait exactement ce qui est vérifié.
- Ils détectent une régression, ce qu'on a prouvé avec le défaut introduit.
- Ils peuvent tourner en CI.

Un compte rendu MCP est une interprétation de l'agent, qui peut se tromper. Copilot s'est d'ailleurs trompé sur le titre « papier » pendant cette séance.

**3. Dans quel cas préférer une exploration MCP, dans quel cas un test automatisé ?**

- **Exploration avec MCP** : pour découvrir une fonctionnalité en cours de développement, reproduire un bug signalé, ou vérifier rapidement un parcours avant d'écrire les scénarios.
- **Test automatisé** : dès qu'un comportement est stable et doit rester vrai, comme les règles de recherche de la semaine 9. On le relance à chaque modification, sans dépendre de l'agent ni de son contexte.

## Bilan réflexif

**Qu'ai-je appris ?**

- Un test qui échoue ne prouve rien tant qu'on n'a pas lu **pourquoi** il échoue. Notre premier essai avec le défaut échouait sur la connexion, pas sur la recherche.
- MCP ajoute des capacités à l'agent, mais aussi des points de panne : un serveur à lancer, une configuration, l'ordre de démarrage, la politique réseau.
- Choisir des données qui piègent le test (« papier ») rend un scénario beaucoup plus utile que « la recherche marche ».

**Qu'est-ce qui a bien fonctionné ?**

- Écrire les scénarios nous-mêmes avant Copilot. Il a ensuite généré des tests fidèles, avec de bons sélecteurs et des assertions précises.
- Lire l'onglet Output de VS Code a donné la vraie cause de l'erreur MCP, alors qu'on modifiait la configuration au hasard.

**Qu'est-ce qui a moins bien fonctionné ?**

- Playwright MCP n'a jamais fonctionné. Le scénario n'a donc pas été exécuté par l'agent, et on n'a pu observer aucun appel d'outil.
- `npm init playwright` n'a pas créé `playwright.config.ts`. On l'a écrit nous-mêmes.
- Copilot a affirmé une chose fausse sur les données (« papier » ne contiendrait pas « api »). Il a fallu vérifier.
- On avait commité `scenarios.md` vide, parce qu'on n'avait pas enregistré le fichier avant le commit.
