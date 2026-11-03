# Bilan semaine 7 : les candidatures (EF-32, EF-33, RG-03)

## Choix

On a d'abord fait un plan avec le mode Plan de Copilot, puis on a répondu à ses questions :

- **Nouvelle candidature après un retrait** : autorisée. On crée une nouvelle ligne et l'ancienne reste « Retirée » dans l'historique. Par contre, impossible d'avoir deux candidatures « En cours » sur la même offre, ou de recandidater après « Retenue » ou « Non retenue ».
- **Message** : facultatif, espaces retirés, 1000 caractères maximum. Un message vide est enregistré comme `null`.
- **Liste des candidatures** : toutes les candidatures de l'étudiant, sans filtre par année (EF-72 hors périmètre).

Après lecture du plan, on a aussi changé quelques points :

- Retrait avec `POST /applications/:id/withdraw` au lieu de `DELETE`, parce que la candidature n'est pas supprimée, seulement passée à « Retirée ».
- Offre non publiée ou inexistante : 404, comme pour la visibilité des offres côté étudiant.
- Candidature d'un autre étudiant : 404, pour ne pas révéler qu'elle existe.
- 409 pour une candidature en double (`APPLICATION_ALREADY_EXISTS`) et pour un retrait impossible (`APPLICATION_NOT_WITHDRAWABLE`).
- Ajout du bouton « Candidater » dans la liste des offres, que le plan avait oublié.

On a implémenté en 3 étapes, avec un commit après chacune : candidater, consulter ses candidatures, retirer une candidature.

## Résultat

Ce qui fonctionne :

- un étudiant candidate à une offre publiée, avec ou sans message ;
- il voit ses candidatures et leur statut dans « Mes candidatures » ;
- il peut retirer une candidature « En cours », puis recandidater à la même offre ;
- un admin ou un contact ne peut pas candidater, et une offre non publiée refuse les candidatures.

Difficultés et limites :

- Après une candidature réussie, on ne voyait rien à l'écran. On a demandé à Copilot d'ajouter le message « Candidature envoyée », puis il ne s'affichait toujours pas : c'était Safari qui gardait l'ancien code en cache. Avec l'onglet Réseau, on a vu que le serveur répondait bien 201.
- Après un rechargement de la page des offres, le bouton « Candidater » réapparaît sur une offre où on a déjà candidaté. Le serveur refuse bien la deuxième candidature, mais l'interface ne l'indique pas à l'avance.
- Pas de filtre par année académique sur les candidatures.
- Si la session expire pendant une candidature, l'erreur s'affiche dans le formulaire mais l'utilisateur n'est pas déconnecté comme sur les autres pages.

## Modifications

Backend :

- `models/application.ts`, `mappers/application.mapper.ts` : types et conversion base, domaine et DTO.
- `repositories/applications.repository.ts` : requêtes SQL. La vérification et l'insertion d'une candidature sont faites dans une transaction, et le retrait est une mise à jour conditionnelle (`IN_PROGRESS` vers `WITHDRAWN`).
- `services/applications.service.ts` : règles métier (étudiant uniquement, offre publiée, doublons, retrait).
- `controllers/applications.controller.ts` : lecture et validation de l'identifiant et du message.
- `app.ts` : branchement des nouvelles routes.
- `API.md`, `http/applications.http` : documentation et exemples des 3 routes.
- `tests/applications.test.ts` : tests API.

Frontend :

- `OfferTable.tsx`, `OffersPage.tsx` : bouton « Candidater » avec message facultatif, visible seulement pour un étudiant.
- `ApplicationsPage.tsx`, `ApplicationTable.tsx`, `useApplications.ts` : page « Mes candidatures » et bouton « Retirer ».
- `services/applications.service.ts`, `models/application.ts`, `guards.ts`, `labels.ts` : appels API, modèle, type guard et libellés français des statuts.
- `App.tsx`, `NavBar.tsx` : route et lien « Mes candidatures » pour les étudiants.
- `api.ts` : affiche le message d'erreur renvoyé par le serveur au lieu d'un message générique.
- Tests : `OffersPage.test.tsx`, `ApplicationsPage.test.tsx`, `NavBar.test.tsx`, `helpers/fetchMock.ts`.

Après la relecture, on a demandé à Copilot d'ajouter la documentation de la route de retrait dans `API.md`, qu'il avait oubliée.

## Validation fonctionnelle

Testé dans le navigateur, après `npm run db:reset` :

- Louis Claes candidate sans message puis avec message : accepté, « Candidature envoyée » (201 dans l'onglet Réseau).
- Louis Claes recandidate à la même offre : refusé avec le message du serveur.
- Lucas Dupont candidate à « Application React de gestion de flotte » : refusé, il a déjà une candidature en cours.
- Inès Haddad candidate à « API REST de facturation » : accepté, son ancienne candidature était retirée.
- Message de 1049 caractères : le champ coupe le texte à 1000, donc la candidature est acceptée. Le refus côté serveur est vérifié par un test.
- Admin (Anne Leclercq) et déposant (Marc Lejeune) : pas de bouton « Candidater » ni de lien « Mes candidatures ».
- Mes candidatures : Lucas voit « En cours », Inès « En cours » et « Retirée », Mateusz « Retenue », Léa « Non retenue », Louis une liste vide. Lucas ne voit pas les candidatures d'Inès.
- Après une candidature et un rechargement, elle est toujours dans « Mes candidatures ».
- Lucas retire sa candidature : elle passe à « Retirée » et le reste après rechargement. Il peut ensuite recandidater.
- Pas de bouton « Retirer » sur les candidatures retenues, non retenues ou déjà retirées.

Non testé dans l'interface : retirer une candidature déjà traitée ou celle d'un autre étudiant, parce que le bouton n'apparaît pas. Ces cas sont couverts par les tests backend.

## Qualité

- Le code suit l'architecture existante : controller, service, repository, mapper côté backend, et page, hook, service côté frontend.
- Tous les contrôles sont faits côté serveur, et l'étudiant est toujours celui de la session, jamais un id envoyé par le front.
- Pas de nouvelle dépendance, pas de migration : la table `applications` existait déjà.
- Point repéré : un identifiant d'offre invalide dans l'URL renvoie le code `INVALID_BODY`, alors que ce n'est pas le corps de la requête. Pas corrigé.
- Pas de simplification faite, le code ajouté était déjà assez simple.

## Tests et commandes

`npm run check` lancé après chaque étape, sans erreur de lint, de TypeScript ou de build :

| Étape | Tests backend | Tests frontend |
|---|---|---|
| Départ | 110 | 47 |
| Étape 1 : candidater | 118 | 51 |
| Étape 2 : consulter | 123 | 58 |
| Étape 3 : retirer | 131 | 62 |

Exemple de test : `refuse un message trop long` dans `backend/tests/applications.test.ts` envoie un message de 1001 caractères et vérifie que le serveur répond 400 `INVALID_BODY`. Ce cas ne se teste pas dans le navigateur, puisque le champ coupe le texte à 1000.
