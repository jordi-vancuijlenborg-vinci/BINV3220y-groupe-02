# Bilan semaine 8 : harnais agentique

Fichiers de la séance :

- `matrice-guides-senseurs.md` : inventaire des guides et senseurs, et audit des guides par rapport à Web 2 ;
- `matrice-tracabilite-tests.md` : cas de EF-32 et EF-33 reliés aux tests ;
- `conversation-*.md` : toutes les conversations Copilot de la séance, y compris celle qui a bloqué.

## Inventaire

Le détail est dans `matrice-guides-senseurs.md`.

- **Guides inférentiels** : instructions Copilot, `architecture.md`, `API.md`, `seed.md`, README, cahier des charges, nos prompts, modèle de PR.
- **Guides computationnels** : `.vscode/settings.json` et les scripts npm.
- **Senseurs computationnels** : Oxlint, TypeScript, les tests, le build, les contraintes SQLite, les type guards, le refus du mode démo en production.
- **Senseurs inférentiels** : aucun. Seule la revue humaine joue ce rôle, et il n'y a pas de CI.

La première matrice de Copilot était à corriger. Il avait classé le modèle de PR et nos bilans comme des senseurs. Il disait aussi « exécuté » en se basant sur les anciens bilans, et pas sur ce qu'on avait lancé. Après correction, il a recopié « à vérifier par `npm run check` » sur toutes les lignes, y compris sur des documents qu'on ne peut pas exécuter. On a donc rempli cette colonne nous-mêmes à partir de notre `npm run check`.

## Couverture des exigences

Le détail est dans `matrice-tracabilite-tests.md` (32 cas). Avant la séance, il y avait :

- **8 cas absents** : persistance après rechargement et deux candidatures envoyées en même temps restent non couverts par les tests automatisés ; les cas `offerId` invalide et message non textuel sont désormais couverts ;
- **2 cas partiels** : offres non publiées (2 statuts sur 4, sans vérifier la base) et retrait de la candidature d'un autre étudiant (sans vérifier la base).

Copilot a bien trouvé le test au nom trompeur `refuse une candidature active ou traitée`, qui ne teste que « active ». Il avait par contre marqué deux cas « Couvert » alors qu'ils n'étaient que partiels.

## Modifications et vérification

On a ajouté 12 tests dans `backend/tests/applications.test.ts` (bloc `Candidatures : cas complémentaires`) et corrigé le code d'erreur du paramètre `offerId`.

| Test ajouté | Défaut qui le ferait échouer |
|---|---|
| Candidature après `SELECTED` puis `REJECTED` : 409 (2 tests) | Le contrôle des doublons ne regarde que `IN_PROGRESS` |
| `refuse l'offre 999` | L'API plante ou crée une candidature sur une offre inconnue |
| `refuse un identifiant d'offre invalide` | Le paramètre de chemin est classé à tort comme une erreur de corps |
| `refuse un message qui n'est pas une chaîne de caractères` | La validation du type du message est supprimée ou contournée |
| Message d'espaces enregistré comme null | Le message vide n'est pas remplacé par `null` |
| Message de 1000 caractères accepté | Erreur de borne (`>=` au lieu de `>`) |
| Offres soumise et archivée refusées sans création (2 tests) | Le contrôle du statut oublie certains statuts, ou l'insertion se fait avant le contrôle |
| Statuts `IN_PROGRESS` et `WITHDRAWN` pour Inès | La nouvelle candidature écrase l'ancienne au lieu d'en créer une nouvelle |
| Candidature de Lucas inchangée quand Inès tente de la retirer | Mise à jour faite avant la vérification du propriétaire |
| 401 sans session pour candidater et retirer | Route branchée sans le middleware `authenticate` |

**Défaut introduit exprès pour vérifier un test.**

1. Dans `applications.repository.ts`, on a remplacé `status IN ('IN_PROGRESS', 'SELECTED', 'REJECTED')` par `status IN ('IN_PROGRESS')`.
2. Résultat : **2 tests échouent, 24 passent** (26 au total à ce moment-là). Les 2 nouveaux tests échouent, alors que l'ancien test « active ou traitée » passe toujours, ce qui prouve qu'il ne vérifiait pas ce cas.
3. On a remis le code avec `git restore` et relancé les tests : 26 passent. Les tests avaient été commités avant, pour ne rien risquer.

**`npm run check` final :**

| Contrôle | Résultat |
|---|---|
| Lint | 0 avertissement, 0 erreur (backend et frontend) |
| Typecheck | aucune erreur |
| Tests backend | 141 réussis (131 au début de la séance ; `applications.test.ts` : 21 → 31) |
| Tests frontend | 62 réussis |
| Build | réussi |

**Limites.**

- Cas non couverts :
  - persistance après rechargement (pas de test end-to-end, vérifiée à la main en semaine 7) ;
  - deux candidatures envoyées en même temps.
- Le défaut de code `offerId` classé comme `INVALID_BODY` a été corrigé et verrouillé par un test. Le comportement déjà présent pour un message non textuel est désormais verrouillé par un test.
- L'ancien test garde son nom trompeur, et un nom de test ajouté par Copilot contient une coquille (`Lucaslorsqu'Inès`).

## Audit des guides

Le détail est dans `matrice-guides-senseurs.md`, partie 3. Sources : les slides Web 2 (BINV2150-A, séances 01 à 14).

Copilot a fait une première comparaison, mais 5 points étaient faux et on les a corrigés :

- une phrase sur la validation des réponses dans le frontend citée comme si elle parlait de la validation du body dans le backend ;
- un passage du README attribué aux instructions Copilot ;
- les `key` React notées « Partielle » alors que rien n'en parle ;
- le hachage des mots de passe noté « Non » alors que Gesta n'a pas de mot de passe ;
- le `.gitignore` oublié.

On a aussi ajouté deux écarts qu'il n'avait pas vus : le 404 au lieu du 403 (séance 02), et `POST …/withdraw` au lieu de `PATCH` (séance 02).

- **Ce qui correspond** : l'architecture en couches, l'authentification et l'autorisation côté serveur, l'exclusion du `.env`.
- **Ce qui manque** :
  - le rôle de chaque code HTTP ;
  - l'obligation de mettre à jour `API.md` ;
  - la manière de valider les entrées ;
  - les conventions React de Web 2 (`key`, immutabilité, props, `aria-label`).
- **Ajouts proposés** : une section « Working rules » dans `copilot-instructions.md` (texte dans la matrice). Les guides n'ont pas été modifiés.

## Bilan réflexif

**Qu'ai-je appris ?**

- La réussite des tests ne prouve pas qu'ils couvrent les exigences. Un test peut avoir un nom qui promet plus que ses assertions.
- Introduire un défaut exprès est un moyen simple de vérifier qu'un test sert à quelque chose.
- Un guide décrit souvent ce qui existe, mais pas ce qu'il faut faire pour les nouvelles fonctionnalités.

**Qu'est-ce qui a bien fonctionné ?**

- Copilot a été utile pour repérer les fichiers et faire une première version des matrices. Il a trouvé seul le test au nom trompeur.
- Découper la demande de tests en deux petits prompts a très bien marché.

**Qu'est-ce qui a moins bien fonctionné ?**

- Avec une longue demande de 8 tests dans une conversation déjà chargée, Copilot s'est bloqué (« Generating patch (7633 lines) »). On a dû l'arrêter, annuler et repartir dans une nouvelle conversation.
- Ses citations n'étaient pas toujours fiables (mauvais fichier, mauvaise partie du document). Il a fallu tout vérifier dans les fichiers.
- Quand on lui signale une erreur, il corrige parfois trop et applique la correction partout.
