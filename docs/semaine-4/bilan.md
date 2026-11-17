# Bilan semaine 9 : skills, tests et hooks

**Crédits IA**
- Zahra : 10/200
- Jordi : 50.9/200

Fichiers de la séance :

- `conversation-1.md` : audit des tests avec le skill `test-gap-audit`, puis test et correction du retrait ;
- `conversation-2.md` : recherche EF-30 avec le skill `test-driven-development` (deux cycles TDD) ;
- `conversation-3.md` : essais du hook Tool Guardian.

Installés dans `.github/` : les skills `test-gap-audit` et `test-driven-development` (avec la consigne d'arrêt avant l'implémentation et la licence Superpowers), le hook `hooks/tool-guardian.json` et `hooks/guard-tool.cjs`, et la règle TDD ajoutée à `copilot-instructions.md`.

## Audit des tests

Le premier lancement de `/test-gap-audit` n'avait pas de périmètre. Le skill a donc audité tout le dépôt (89 fichiers source) et proposé des constats sans rapport avec les candidatures. On l'a relancé en le limitant à EF-32 et EF-33. On a vérifié chaque constat dans les fichiers :

| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
|---|---|---|
| Retrait avec un identifiant mal formé (`abc`, `0`, `-1`, `1.5`) | Seul `/applications/999/withdraw` est testé (404). Aucun test d'identifiant mal formé. | **Manque confirmé**, traité |
| Contrat HTTP du service frontend `applications.service.ts` (méthode, URL, en-tête) | Aucun test n'importe le service, il n'est couvert qu'à travers la page avec un fetch simulé | Manque confirmé, mais risque faible (P3 plutôt que P2), non traité |
| Bouton « Retirer » de nouveau utilisable après un retrait refusé | Le test vérifie le message d'erreur, mais pas que le bouton est de nouveau actif | Manque confirmé, faible, non traité |

**Test ajouté** : `refuse un identifiant de retrait invalide`, un test table-driven sur les 4 valeurs, qui vérifie aussi que la candidature de Lucas reste `IN_PROGRESS`.

Copilot proposait d'attendre `400 INVALID_BODY`, c'est-à-dire le comportement actuel. Or `API.md` réserve `INVALID_PARAM` aux paramètres de chemin, et c'est déjà ce que renvoie l'id d'offre. On a donc écrit le test avec `INVALID_PARAM`. Il a échoué sur les 4 cas (`expected 'INVALID_BODY' to be 'INVALID_PARAM'`). On a ensuite fait corriger `parseApplicationId` et documenter la 400 dans `API.md`, sans modifier le test. Résultat : 38/38 tests réussis. Le test proposé par Copilot serait passé tout de suite, et il aurait figé l'incohérence.

## TDD : recherche EF-30

Le prompt ne mentionnait ni le skill ni les tests. Copilot a quand même lu `SKILL.md` et `writing-good-tests.md`, écrit les tests d'abord, puis s'est arrêté pour demander une validation avant de toucher au code.

- **Test vu en échec puis en réussite** : `recherche une expression dans le titre sans distinguer la casse ni les espaces extérieurs`. Sans l'implémentation, toutes les offres reviennent (`expected [8, 2, 4, 7, 5, 1, 3, 6, 10, 9] to deeply equal [3]`). Avec l'implémentation, seule Billing API revient. Côté frontend, les deux nouveaux tests échouaient avec `Unable to find role="searchbox"`.
- **Notre avis sur les tests proposés** : ils étaient justes, et ils échouaient parce que la fonctionnalité manquait, pas à cause d'une erreur. Il manquait toutefois la recherche vide, et les caractères `%` et `_`, que le `LIKE` interprétait comme des jokers. Un second cycle a ajouté ces tests. Les tests `%` et `_` échouent si on retire seulement l'échappement, et passent avec. Le test de la recherche vide passe même sans implémentation : c'est un garde-fou de non-régression, pas un test qu'on a vu échouer.
- Copilot avait ajouté une **limite de 100 caractères** qui ne figurait pas dans les règles. Il l'a reconnu (« analogie avec les entreprises ») et l'a retirée.

## Recherche

- **Cas essayés dans le navigateur** : majuscules, espaces autour du texte, recherche combinée avec une période, connexion en étudiant (offres publiées seulement), recherche sans résultat (message « Aucune offre ne correspond à votre recherche. »).
- **Cas couverts par les tests API** : casse et espaces, `%` et `_` traités comme du texte, recherche vide, combinaison avec la période, visibilité étudiant, aucun résultat.
- **`npm run check`** : réussi (lint sans avertissement, typecheck, 155 tests backend, 65 tests frontend, build).
- **Problèmes restants** :
  - chaque frappe envoie une requête, alors que la recherche des entreprises attend un délai (`SEARCH_DELAY_MS`) ;
  - les accents ne sont pas gérés (hors périmètre) ;
  - les deux manques mineurs de l'audit n'ont pas été traités.

## Hook

- **Événement utilisé** : `preToolUse`, qui lance `node .github/hooks/guard-tool.cjs` et répond `permissionDecision: "deny"` pour une suppression de `demo-protected.txt`.
- **« Exécute git status »** : le hook n'a pas bloqué l'appel. La commande a échoué pour une autre raison : le bac à sable du terminal de Copilot refuse l'accès à `~/.gitconfig` (code 128), même après notre autorisation.
- **« Supprime demo-protected.txt avec une commande du terminal »** : Copilot a vraiment appelé l'outil (`rm -- demo-protected.txt`), et l'appel a été refusé : `Denied by preToolUse hook: Démonstration Tool Guardian : suppression de demo-protected.txt interdite.` Le fichier existe toujours.
- On a aussi testé le script avec les événements simulés du mode d'emploi : `rm demo-protected.txt` donne `deny`, `git status` donne `{}`.

## Bilan réflexif

**Qu'ai-je appris ?**

- Un skill ne vaut que par le périmètre qu'on lui donne. Sans périmètre, l'audit part sur tout le dépôt et reste superficiel.
- Pour prouver le TDD, il faut voir le test échouer pour la bonne raison. Retirer seulement la partie du code concernée (ici l'échappement) montre précisément ce que le test protège.
- Un hook agit au niveau de l'outil, pas du modèle. Copilot a bien tenté le `rm`, et c'est le hook qui l'a bloqué.

**Qu'est-ce qui a bien fonctionné ?**

- Le déclenchement automatique du skill TDD grâce à `copilot-instructions.md` : lecture du skill, tests d'abord, pause avant le code. La pause s'est même appliquée dans la conversation d'audit.
- Relire le diff avant de valider a permis de trouver le `LIKE` non échappé et la limite de 100 caractères ajoutée sans qu'on la demande.

**Qu'est-ce qui a moins bien fonctionné ?**

- Le bac à sable du terminal de Copilot bloquait les tests backend (`listen EPERM`) et `git status`. Copilot n'a donc jamais vu ses tests backend échouer ni réussir : on a dû faire toutes ces vérifications hors de Copilot.
- Copilot a proposé un test qui validait un défaut (`INVALID_BODY`) au lieu de le révéler.
- Les citations de l'audit n'avaient pas de numéros de ligne, alors que le skill les exige.
- Copilot a inventé une règle métier (la limite de 100 caractères) par analogie avec une autre partie du code.
