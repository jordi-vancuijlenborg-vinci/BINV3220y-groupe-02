User: Lis en entier .github/copilot-instructions.md, docs/architecture.md et README.md. Ne modifie aucun fichier.
Pour chaque attente de Web 2 ci-dessous, dis si les guides la couvrent (Oui / Partielle / Non / Contradiction), cite le passage exact du guide avec le fichier, et propose un ajout si c'est partiel ou absent.

1. Séance 02 : codes HTTP 400, 401, 403, 404, 409 (409 = conflit, souvent doublon), 201 pour une création.
2. Séance 02 : documenter chaque route dans API.md (paramètres, body, réponses et codes) ; "N'oubliez pas de mettre à jour la documentation et de tester vos routes" ; tests d'API avec REST Client (.http).
3. Séance 03 : distinguer authentification (401) et autorisation (403) ; protéger les routes par un middleware ; vérifier les droits côté serveur.
4. Séance 03 : la clé secrète ne doit jamais être écrite dans le code ni dans Git ; fichiers .env dans .gitignore.
5. Séance 04 : ne jamais stocker de mot de passe en clair.
6. Séance 01 et 03 : valider le body reçu avec un type guard (ex. isCredentialsDTO) et répondre 400 sinon.
7. Séance 12 : "La validation du frontend améliore l'expérience, mais ne remplace pas celle du backend" ; formulaires contrôlés avec label.
8. Séance 10 : key unique et stable (id des données) dans les listes ; prévoir l'affichage d'une liste vide.
9. Séance 11 et 13 : règles des hooks ; état immuable ; valeurs dérivées calculées, jamais stockées dans un état.
10. Séance 11 : aria-label pour un bouton sans texte (accessibilité).
11. Séance 08 et 14 : un composant ne modifie jamais ses props ; données descendantes, callbacks onXxx remontants.

Termine par un court rapport : ce qui correspond, ce qui manque, ce qui serait utile d'ajouter aux guides.

Copilot: Je vais lire intégralement les trois guides demandés, puis comparer chaque attente aux passages exacts sans modifier le dépôt.

Read []()
Completed with input: {
  "path": "C:\\Users\\hajji\\Documents\\VINCI\\BINV3220-1 Intelligence Artificielle pour développeurs\\BINV3220y-groupe-02\\.github\\copilot-instructions.md",
  "forceReadLargeFiles": true
}

Read []()
Completed with input: {
  "path": "C:\\Users\\hajji\\Documents\\VINCI\\BINV3220-1 Intelligence Artificielle pour développeurs\\BINV3220y-groupe-02\\docs\\architecture.md",
  "forceReadLargeFiles": true
}

Read []()
Completed with input: {
  "path": "C:\\Users\\hajji\\Documents\\VINCI\\BINV3220-1 Intelligence Artificielle pour développeurs\\BINV3220y-groupe-02\\README.md",
  "forceReadLargeFiles": true
}

Aucun fichier n’a été modifié. Les trois guides ont été lus intégralement.

| # | Évaluation | Passage exact | Ajout proposé |
|---|---|---|---|
| 1 | **Partielle** | [docs/architecture.md]() : « `middlewares/` \| `authenticate` (401), `authorize` (403), gestion centralisée des erreurs » et « Une erreur se signale par `throw new HttpError(statut, code, message)` ». | Documenter explicitement 400, 401, 403, 404, 409 (conflit/doublon) et 201 pour une création, avec leur usage attendu. |
| 2 | **Partielle** | [README.md]() : « Recommandé : Visual Studio Code avec l’extension REST Client, pour les fichiers `backend/http/*.http` » ; « `backend/API.md` \| Routes de l’API, réponses et erreurs ». | Ajouter l’obligation de documenter chaque route dans `API.md` : paramètres, body, réponses, codes HTTP. Ajouter : « mettre à jour la documentation et tester chaque route », notamment avec les fichiers `.http`. |
| 3 | **Oui** | [docs/architecture.md]() : « `authenticate` (401), `authorize` (403) » ; « `authenticate` vérifie le jeton » ; « `authorize(règle)` refuse la requête avec un 403 si la règle n’est pas respectée » ; « Le service filtre les données selon l’utilisateur ». | — |
| 4 | **Partielle** | [README.md]() : « `npm run setup` crée `backend/.env` (avec une clé de signature aléatoire) » ; « Le fichier `.env` » est utilisé pour `DEMO_AUTH_ENABLED`. [copilot-instructions.md]() : « Keep environment and generated database files out of version control. » | Écrire explicitement que les secrets ne doivent jamais être codés en dur ni commités, que les valeurs vont dans `.env`, et que `.env` doit figurer dans `.gitignore`. |
| 5 | **Non** | Aucun passage n’interdit explicitement le stockage de mots de passe en clair. Le README indique seulement : « le mode démo [...] sans mot de passe ». | Ajouter l’obligation de ne jamais stocker de mot de passe en clair et d’utiliser un hash adapté avec vérification sécurisée. |
| 6 | **Partielle** | [docs/architecture.md]() : « `controllers/` \| Routes, validation des paramètres et du corps, réponses HTTP » ; « `services/` [...] valident le JSON avec un type guard ». | Préciser que le body entrant doit être validé côté backend par un type guard dédié, par exemple `isCredentialsDTO`, et qu’un body invalide retourne 400. |
| 7 | **Partielle** | [docs/architecture.md]() : « `controllers/` [...] validation des paramètres et du corps » ; « `services/` [...] valident le JSON avec un type guard ». | Ajouter explicitement que la validation frontend améliore l’expérience mais ne remplace jamais celle du backend. Documenter aussi les formulaires contrôlés et l’association systématique des champs à un `label`. |
| 8 | **Partielle** | [copilot-instructions.md]() : « Use stable identifiers from `backend/src/db/seed/seedIds.ts` in backend tests. » [docs/architecture.md]() mentionne plusieurs « Liste » côté frontend. | Préciser que les listes React utilisent une `key` stable correspondant à l’identifiant métier, jamais l’index, et qu’un état vide doit avoir un affichage explicite. |
| 9 | **Partielle** | [copilot-instructions.md]() : « Hooks own loading/error state, abort in-flight fetches on cleanup » ; « Oxlint [...] rules essentielles de React et TypeScript (hooks, dépendances des effets, `any`) ». | Ajouter les règles des hooks, l’interdiction de muter l’état, et la règle selon laquelle les valeurs dérivées doivent être calculées pendant le rendu plutôt que stockées dans un état. |
| 10 | **Non** | Aucun passage ne mentionne `aria-label` ou les boutons sans texte. | Ajouter la règle : tout bouton sans texte visible doit posséder un `aria-label` descriptif. |
| 11 | **Partielle** | [docs/architecture.md]() : « Le jeton et la fonction de déconnexion sont transmis aux pages par les props. » ; « `components/` \| Composants réutilisables, sans connaissance des routes ». | Ajouter explicitement qu’un composant ne modifie jamais ses props, que les données descendent via les props et que les événements remontent via des callbacks nommés `onXxx`. |

### Court rapport

**Correspondent clairement :** distinction authentification/autorisation, middleware de protection, vérification serveur des droits, architecture en couches et usage général de la validation.

**Partiellement couvert :** codes HTTP complets, documentation et tests des routes, gestion des secrets, type guards backend avec réponse 400, validation frontend/backend, clés de listes, règles des hooks et flux des props.

**Manquent principalement :** stockage sécurisé des mots de passe, accessibilité avec `aria-label`, affichage des listes vides, immutabilité de l’état et calcul des valeurs dérivées.

Les ajouts les plus utiles seraient des sections de conventions frontend/backend explicites dans [copilot-instructions.md]() et un tableau des codes HTTP ainsi qu’un modèle de documentation de route dans [docs/architecture.md]().

User: Corrige ton audit :
- Lignes 6 et 7 : le passage "services/ … valident le JSON avec un type guard" est dans la partie Frontend de architecture.md (validation des réponses de l'API), pas du body backend. Pour le backend, cite seulement "controllers/ | Routes, validation des paramètres et du corps".
- Ligne 9 : le passage sur Oxlint vient du README.md, pas de copilot-instructions.md.
- Ligne 8 : c'est Non. seedIds.ts concerne les tests backend, rien ne parle des key React ni des listes vides.
- Ligne 5 : Non applicable, Gesta n'a pas de mot de passe (RG-14, connexion par lien).
- Ligne 4 : .gitignore contient bien .env ; seul manque "ne jamais écrire de secret dans le code".
Ajoute deux lignes :
- Séance 02 (404 = ressource inexistante, 403 = authentifié mais pas autorisé) : notre API répond 404 pour une offre non publiée et pour la candidature d'un autre étudiant. Aucun guide n'explique ce choix. Évalue la correspondance et propose un ajout.
- Séance 02 (PATCH pour modifier partiellement une ressource) : le retrait est POST /applications/:id/withdraw. Aucun guide ne dit quand une action peut sortir des conventions REST.
Redonne le tableau final et le court rapport. Ne modifie aucun fichier.

Copilot: Aucun fichier n’a été modifié. Voici l’audit corrigé.

| # | Évaluation | Passage exact du guide | Ajout proposé |
|---|---|---|---|
| 1 | **Partielle** | [docs/architecture.md]() : « `middlewares/` \| `authenticate` (401), `authorize` (403), gestion centralisée des erreurs » ; « `throw new HttpError(statut, code, message)` ». | Ajouter un tableau précisant 400, 401, 403, 404, 409 (conflit/doublon) et 201 (création). |
| 2 | **Partielle** | [README.md]() : « Visual Studio Code avec l’extension REST Client, pour les fichiers `backend/http/*.http` » ; « `backend/API.md` \| Routes de l’API, réponses et erreurs ». | Exiger la documentation de chaque route : paramètres, body, réponses et codes. Ajouter l’obligation de mettre à jour la documentation et de tester les routes avec REST Client. |
| 3 | **Oui** | [docs/architecture.md]() : « `authenticate` (401), `authorize` (403) » ; « `authorize(règle)` refuse la requête avec un 403 si la règle n’est pas respectée » ; « Le service filtre les données selon l’utilisateur ». | — |
| 4 | **Partielle** | [copilot-instructions.md]() : « Keep environment and generated database files out of version control. Configure local values through `backend/.env` ». Le `.gitignore` contient bien `.env`. | Ajouter explicitement : « Ne jamais écrire une clé secrète ou un autre secret directement dans le code ; utiliser `backend/.env`, exclu de Git. » |
| 5 | **Non applicable** | [README.md]() : « la connexion réelle [...] n’est pas implémentée » ; « mode démo [...] **sans mot de passe** ». | Ne pas ajouter une règle de stockage de mots de passe à Gesta. Documenter plutôt la connexion par lien conformément à la RG-14 si nécessaire. |
| 6 | **Partielle** | [docs/architecture.md]() : « `controllers/` \| Routes, validation des paramètres et du corps, réponses HTTP ». | Préciser que cette validation utilise un type guard dédié, par exemple `isCredentialsDTO`, et qu’un body invalide provoque une réponse 400. |
| 7 | **Partielle** | [docs/architecture.md]() : « `controllers/` \| Routes, validation des paramètres et du corps, réponses HTTP ». Le guide frontend indique aussi : « `services/` \| Appels HTTP ; vérifient le statut et valident le JSON avec un type guard ». | Ajouter que la validation frontend améliore l’expérience mais ne remplace jamais celle du backend. Documenter les formulaires contrôlés et l’association des champs à un `label`. |
| 8 | **Non** | Aucun passage des trois guides ne parle des `key` React stables ni de l’affichage d’une liste vide. La mention de `seedIds.ts` concerne uniquement les tests backend : « `seedIds.ts` donne un nom stable à chaque identifiant, utilisable dans les tests ». | Ajouter : utiliser l’identifiant métier comme `key` stable, jamais l’index, et prévoir un rendu explicite pour une liste vide. |
| 9 | **Partielle** | [copilot-instructions.md]() : « Hooks own loading/error state, abort in-flight fetches on cleanup ». [README.md]() : « Oxlint [...] configuré pour les règles essentielles de React et TypeScript (hooks, dépendances des effets, `any`) ». | Ajouter les règles complètes : respecter les règles des hooks, ne jamais muter l’état, et calculer les valeurs dérivées au rendu plutôt que les stocker dans un état. |
| 10 | **Non** | Aucun passage ne mentionne `aria-label` ni les boutons sans texte. | Ajouter : tout bouton sans texte visible doit avoir un `aria-label` descriptif. |
| 11 | **Partielle** | [docs/architecture.md](C:/Users/hajji/Documents/VINCI/BINV3220-1%20Intelligence%20Artificielle pour développeurs/BINV3220y-groupe-02/docs/architecture.md) : « Le jeton et la fonction de déconnexion sont transmis aux pages par les props. » | Ajouter qu’un composant ne modifie jamais ses props, que les données descendent par les props et que les événements remontent par des callbacks `onXxx`. |
| 12 | **Partielle** | [docs/architecture.md](C:/Users/hajji/Documents/VINCI/BINV3220-1%20Intelligence%20Artificielle pour développeurs/BINV3220y-groupe-02/docs/architecture.md) : « `authenticate` (401), `authorize` (403) » ; « `authorize(règle)` refuse la requête avec un 403 si la règle n’est pas respectée ». | Ajouter la convention métier : 404 signifie ressource inexistante ou volontairement non révélée — notamment offre non publiée et candidature d’un autre étudiant — tandis que 403 signifie authentifié mais non autorisé lorsque l’existence de la ressource peut être révélée. |
| 13 | **Non** | Aucun guide ne mentionne `PATCH` ni les règles permettant de remplacer une modification partielle par une action dédiée comme `POST /applications/:id/withdraw`. | Documenter les conventions REST : utiliser `PATCH` pour une modification partielle ; réserver `POST` à une action métier explicite lorsque celle-ci représente une transition ou une commande, comme le retrait d’une candidature, et expliquer ce choix dans `API.md`. |

### Court rapport

**Correspondent :** la séparation authentification/autorisation, les middlewares, le contrôle des droits côté serveur et l’architecture générale en couches.

**Partiellement couvert :** les codes HTTP, la documentation des routes, la gestion des secrets, la validation des bodies, la validation frontend/backend, les règles des hooks, l’immutabilité, le flux des props et la distinction 403/404.

**Non couvert :** les `key` React et listes vides, `aria-label`, ainsi que les conventions `PATCH`/actions métier.

**Non applicable :** le stockage des mots de passe en clair, puisque Gesta n’utilise pas de mot de passe et prévoit une connexion par lien selon la RG-14.

Les ajouts prioritaires concernent les conventions frontend d’accessibilité et de rendu, le tableau des codes HTTP, les règles de validation des bodies et la justification des choix REST spécifiques.