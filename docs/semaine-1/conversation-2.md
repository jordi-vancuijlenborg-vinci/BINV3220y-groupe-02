User: Explique l’architecture du projet, puis génère dans ./docs un fichier html qui retrace
le parcours qui permet d’afficher les offres, du composant React jusqu’à la base
de données. Indique les fichiers qui seraient concernés par l’ajout d’un filtre par
période. Ne modifie aucun fichier.

Copilot: Je vais d’abord relever le flux réel des offres et les conventions documentaires, puis vérifier si `./docs` contient déjà un fichier homonyme. Je traiterai « ne modifie aucun fichier » comme « ne modifie aucun fichier existant » ; le HTML demandé sera uniquement créé s’il n’entre pas en conflit.

Find files matching `*`

Find files matching `docs/**/*`

Search for `offer|offers|Offre|offres`

Le dépôt confirme une séparation frontend React / backend Express / SQLite, avec un parcours d’offres explicitement réparti entre page, hook, service HTTP, contrôleur, service métier, repository et mapper. Je vais maintenant lire ces points d’entrée ainsi que le schéma et la documentation d’architecture afin de produire un schéma fidèle et de lister précisément les emplacements d’un futur filtre temporel.

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/docs/architecture.md"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/pages/OffersPage.tsx"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/hooks/useOffers.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/services/offers.service.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/components/OfferTable.tsx"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/controllers/offers.controller.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/services/offers.service.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/repositories/offers.repository.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/mappers/offer.mapper.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/models/offer.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/db/migrations/001_initial.sql"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/src/app.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/models/offer.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/utils/guards.ts"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/backend/API.md"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/App.tsx"
}

Read 
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/frontend/src/main.tsx"
}

Ran terminal command: git status --short
Tool execution failed with exit code 128

Le filtre par période n’existe pas encore : l’API ne reçoit aucun paramètre, tandis que la base possède déjà `periods.start_date` et `periods.end_date`, reliées à chaque offre. Je vais donc documenter l’option cohérente avec l’architecture — filtre transmis à l’API et appliqué en SQL — en distinguant le cas simple `P1/P2/OTHER` du vrai intervalle de dates.

Edit 

Le fichier HTML autonome a été créé dans `docs/` sans toucher aux sources existantes. Je fais une vérification ciblée de sa présence et de ses sections principales ; aucune suite de tests applicatifs n’est nécessaire pour cette documentation statique.

Ran terminal command: test -f docs/parcours-offres.html && grep -c '<section>' docs/parcours-offres.html && grep -n 'Ajout d.*filtre\|offers.repository.ts\|OfferTable' docs/parcours-offres.html

Read , lines 1 to 24
Completed with input: {
  "path": "/Users/jordivcb/dev/github/jordi-vancuijlenborg-vinci/BINV3220y-groupe-02/docs/parcours-offres.html",
  "view_range": [
    1,
    24
  ]
}

## Architecture du projet

Le projet est un monorepo npm composé de deux applications :

- **Frontend** : React + Vite dans `frontend/`
- **Backend** : Express + TypeScript + SQLite dans `backend/`
- **Documentation** : `docs/`

Le flux backend suit l’architecture :

```text
Route HTTP
  → Middlewares
  → Contrôleur
  → Service métier
  → Repository SQL
  → SQLite
```

Les mappers convertissent les données entre :

```text
Ligne SQL (DBO)
  → Objet métier
  → DTO retourné par l’API
```

Le frontend suit le flux :

```text
Page React
  → Hook
  → Service HTTP
  → API Express
```

### Parcours actuel des offres

1. `App.tsx` rend la route `/offres`.
2. `OffersPage.tsx` appelle le hook `useOffers`.
3. `useOffers.ts` gère le chargement, les erreurs et l’annulation de la requête.
4. `offers.service.ts` appelle `GET /api/offers`.
5. `app.ts` applique l’authentification et branche le routeur.
6. `offers.controller.ts` vérifie l’autorisation et appelle le service.
7. `offers.service.ts` applique la visibilité selon le profil :
   - administrateur : toutes les offres ;
   - étudiant : offres publiées ;
   - contact déposant : ses propres offres.
8. `offers.repository.ts` exécute la requête SQL et joint les tables `companies`, `academic_years` et `periods`.
9. `001_initial.sql` définit les tables et les relations SQLite.
10. Les données remontent via `offer.mapper.ts`, puis sont affichées par `OfferTable.tsx`.

## Fichier HTML généré

Le parcours complet, avec diagramme, responsabilités et proposition de filtre par période, se trouve dans :

`docs/parcours-offres.html`

Le fichier est autonome et peut être ouvert directement dans un navigateur.

## Fichiers concernés par un filtre par période

Pour un filtre serveur par code de période (`P1`, `P2`, `OTHER`) :

- `OffersPage.tsx` : contrôle de sélection.
- `useOffers.ts` : prise en compte du filtre et rechargement.
- `offers.service.ts` : ajout du paramètre de query string.
- `offers.controller.ts` : validation du paramètre.
- `offers.service.ts` : combinaison avec le filtre de visibilité.
- `offers.repository.ts` : condition SQL sur `periods.code`.
- `backend/API.md` : documentation du nouveau paramètre.
- `backend/tests/offers.test.ts` : tests backend.
- `frontend/tests/OffersPage.test.tsx` : tests frontend.

Le modèle et le schéma existants contiennent déjà les informations nécessaires pour un filtre par code. Pour un véritable filtre par intervalle de dates, il faudra utiliser `periods.start_date` et `periods.end_date`; une migration ne serait nécessaire que si la notion de période devait évoluer.

Aucun test applicatif n’a été lancé : il s’agit d’une documentation statique. La présence du fichier HTML et de ses sections principales a été vérifiée.