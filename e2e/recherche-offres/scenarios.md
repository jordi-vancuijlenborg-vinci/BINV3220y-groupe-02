# Scénarios E2E : recherche d'offres par titre (EF-30)

Règles de la semaine 9 (voir `docs/semaine-4/bilan.md`) : recherche dans le titre, sans tenir compte de la casse ni des espaces autour ; un étudiant ne voit que les offres publiées ; sans résultat, la page affiche « Aucune offre ne correspond à votre recherche. ».

**État initial commun** : base remise à zéro avec les données de démo (`npm run db:reset`), backend et frontend lancés (`npm run dev`), application ouverte sur http://localhost:5173.

| Numéro | Scénario | État initial | Actions dans l'interface | Résultat attendu |
|---|---|---|---|---|
| 1 | Recherche avec résultat, en tenant compte de la visibilité | Connecté en mode démo comme l'étudiant **Lucas Dupont**. Données de démo : « API REST de facturation » est publiée ; « Numérisation d'archives papier » contient aussi « api » mais est archivée. | Cliquer sur « Offres » dans la barre de navigation. Dans le champ « Rechercher dans les titres », saisir `  API  ` (majuscules et espaces autour). | Le compteur affiche « 1 offre ». La seule ligne du tableau est « API REST de facturation ». « Numérisation d'archives papier » n'apparaît pas (offre archivée, invisible pour un étudiant). |
| 2 | Recherche sans résultat | Connecté comme l'étudiant **Lucas Dupont**. Aucune offre ne contient « zzz » dans son titre. | Cliquer sur « Offres ». Saisir `zzz` dans le champ « Rechercher dans les titres ». | Le message « Aucune offre ne correspond à votre recherche. » est affiché. Aucun tableau d'offres n'est affiché. |

**Pourquoi ces deux cas** : le scénario 1 vérifie le cas courant, et en même temps deux règles de la semaine 9 (casse et espaces ignorés) et la visibilité selon le profil. Le scénario 2 est le cas limite déjà essayé à la main en semaine 9, avec un message spécifique à vérifier.