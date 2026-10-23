# BILAN SEMAINE 1

**Crédits IA**
- Zahra : 0.0/200 → 3.2/200
- Jordi : 0.2/200 → 8.7/200

## Qu’ai-je appris ?

- `/init` crée un fichier d’instructions pour Copilot, mais il faut le relire et tester les commandes.
- Explorer le code avant de coder aide à comprendre le chemin des offres, du front jusqu’à la base.
- Un filtre ne doit pas casser les règles de visibilité : un étudiant ne voit toujours que les offres publiées.

## Qu’est-ce qui a bien fonctionné ?

- Le fichier d’instructions était correct, sans outils inventés.
- Copilot a ajouté le filtre par période dans les bons fichiers, avec des tests, sans nouvelle dépendance.
- On a tout vérifié : `npm run check` passe, et on a testé à la main avec un admin, un étudiant et un déposant.

## Qu’est-ce qui a moins bien fonctionné ?

- Copilot a mis un bloc en double dans `API.md`, on l’a corrigé nous-mêmes.
- Le test du MCP Playwright a été bloqué par le réseau.
- On n’a pas travaillé en même temps, donc il a fallu intégrer les changements à la main.