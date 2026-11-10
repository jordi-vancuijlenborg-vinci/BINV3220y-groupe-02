# Matrice de traçabilité : EF-32 et EF-33

Exigences (`docs/cdc_gesta_developpement.md`) :

- **EF-32** : l'étudiant candidate à une offre publiée, avec un message facultatif. Il peut retirer sa candidature tant qu'elle n'a pas été traitée.
- **EF-33** : l'étudiant voit ses candidatures et leur statut (« En cours », « Retenue », « Non retenue », « Retirée »).
- **RG-03** : on ne peut candidater qu'à une offre « Publiée ».

**Méthode.**

1. Copilot a découpé les exigences en cas et relié chaque cas aux tests.
2. On a vérifié ses lignes dans les fichiers et corrigé deux couvertures trop généreuses (cas 6 et 23).
3. On a ajouté les cas qu'il avait oubliés (5, 11, 15, 16 et 35).

Un cas est « Couvert » seulement si une assertion porte sur le résultat attendu.

Fichiers :

- `backend/tests/applications.test.ts` (noté `B:ligne`) ;
- `frontend/tests/OffersPage.test.tsx` (`O:ligne`) ;
- `frontend/tests/ApplicationsPage.test.tsx` (`A:ligne`).

**[ajouté]** = test ajouté pendant cette séance, dans le bloc `describe("Candidatures : cas complémentaires")` (B:226).

## EF-32 : candidater

| # | Cas et résultat attendu | Test | Assertions | Avant | Après |
|---|---|---|---|---|---|
| 1 | Offre publiée avec message : 201, message sans espaces autour, `IN_PROGRESS` | B:27 `crée une candidature étudiante sur une offre publiée` | 201 ; `offerId`, `message: "Intéressé."`, `status` | Couvert | Couvert |
| 2 | Sans message : 201, `message` null | B:38 `accepte une candidature sans message` | 201 ; `message` null | Couvert | Couvert |
| 3 | Message fait uniquement d'espaces : 201, `message` null | **[ajouté]** B:259 `accepte un message composé uniquement d'espaces avec un message null` | 201 ; `message` null | Absent | Couvert |
| 4 | Plus de 1000 caractères : 400 | B:77 `refuse un message trop long` | 400 ; `INVALID_BODY` | Couvert | Couvert |
| 5 | 1000 caractères exactement : 201 (limite) | **[ajouté]** B:267 `accepte un message de 1000 caractères exactement` | 201 | Absent | Couvert |
| 6 | Offre non publiée : 404, rien de créé (RG-03) | B:53 `refuse une offre non publiée (%s) comme inexistante` (attribuée, en attente) ; **[ajouté]** B:274 (soumise, archivée) | 404 ; `NOT_FOUND` ; **[ajouté]** aucune ligne en base | Partiel : 2 statuts sur 4, pas de vérification en base | Couvert |
| 7 | Offre inexistante : 404 | **[ajouté]** B:251 `refuse l'offre 999` | 404 | Absent (le titre du test B:53 dit « comme inexistante », mais il n'utilise que des offres existantes) | Couvert |
| 8 | Deuxième candidature alors qu'une est en cours : 409 | B:63 `refuse une candidature active ou traitée` | 409 ; `APPLICATION_ALREADY_EXISTS` | Couvert | Couvert |
| 9 | Nouvelle candidature après une candidature Retenue ou Non retenue : 409, rien de créé | B:63 ; **[ajouté]** B:228 (`SELECTED`, `REJECTED`) | 409 ; une seule ligne en base | **Absent.** B:63 promet « ou traitée » mais n'utilise qu'une candidature en cours. Prouvé : avec le défaut introduit (voir plus bas), B:63 passe toujours | Couvert |
| 10 | Nouvelle candidature après un retrait : 201, nouvelle ligne | B:45 `autorise une nouvelle candidature après retrait` | 201 ; nouvel id | Couvert | Couvert |
| 11 | L'ancienne candidature retirée reste dans l'historique | **[ajouté]** B:290 `retourne les statuts IN_PROGRESS et WITHDRAWN pour Inès sur Billing API` | `GET /applications` : statuts `IN_PROGRESS` et `WITHDRAWN` pour l'offre | Absent | Couvert |
| 12 | Un contact candidate : 403 | B:70 `refuse un contact` | 403 ; `FORBIDDEN` | Couvert | Couvert |
| 13 | Un administrateur candidate : 403 | B:150 `refuse une candidature d'un administrateur` | 403 ; `FORBIDDEN` | Couvert | Couvert |
| 14 | Sans session : 401 | **[ajouté]** B:322 `refuse sans session la création et le retrait d'une candidature` | 401 | Absent | Couvert |
| 15 | Identifiant d'offre invalide (`abc`) : 400 | aucun | | Absent | Absent |
| 16 | Message qui n'est pas du texte (`42`) : 400 | aucun | | Absent | Absent |
| 17 | Interface : formulaire seulement pour un étudiant | O:69 `affiche le formulaire de candidature uniquement à l'étudiant` ; `n'affiche pas d'action de candidature aux contacts` | boutons « Candidater » présents ou absents | Couvert | Couvert |
| 18 | Interface : confirmation après succès, erreur du serveur affichée | O:78 `affiche la confirmation et masque le formulaire après une candidature réussie` ; `affiche le message d'erreur renvoyé lors d'une candidature` | « Candidature envoyée » ; `alert` avec le message du 409 | Couvert | Couvert |

## EF-32 : retirer

| # | Cas et résultat attendu | Test | Assertions | Avant | Après |
|---|---|---|---|---|---|
| 19 | Retrait d'une candidature en cours : 200, `WITHDRAWN` | B:159 `retire une candidature en cours et renvoie le DTO mis à jour` | 200 ; DTO `WITHDRAWN` ; statut en base | Couvert | Couvert |
| 20 | Retrait d'une candidature retenue, non retenue ou retirée : 409 | B:176 `refuse le retrait d'une candidature %s` | 409 ; `APPLICATION_NOT_WITHDRAWABLE` | Couvert | Couvert |
| 21 | Retrait d'un identifiant inexistant : 404 | B:204 `refuse un identifiant inexistant` | 404 ; `NOT_FOUND` | Couvert | Couvert |
| 22 | Retrait par un administrateur ou un contact : 403 | B:213 `refuse le retrait par un %s` | 403 ; `FORBIDDEN` | Couvert | Couvert |
| 23 | Retrait de la candidature d'un autre étudiant : 404, candidature inchangée | B:195 `refuse la candidature d'un autre étudiant` ; **[ajouté]** B:307 `conserve IN_PROGRESS la candidature de Lucaslorsqu'Inès tente de la retirer` | 404 ; **[ajouté]** statut `IN_PROGRESS` en base | Partiel : pas de vérification en base | Couvert |
| 24 | Retrait sans session : 401 | **[ajouté]** B:322 | 401 | Absent | Couvert |
| 25 | Interface : bouton « Retirer » seulement pour « En cours », désactivé pendant l'appel, statut mis à jour, erreur affichée | `ApplicationsPage.test.tsx` : `n'affiche le bouton que pour les candidatures en cours`, `désactive le bouton pendant le retrait`, `retire une candidature en cours sans recharger la page`, `affiche le message d'erreur du serveur lors d'un retrait refusé` | 1 seul bouton ; bouton désactivé ; « Retirée » ; message du 409 | Couvert | Couvert |

## EF-33 : consulter

| # | Cas et résultat attendu | Test | Assertions | Avant | Après |
|---|---|---|---|---|---|
| 26 | Voir ses candidatures dans les 4 statuts | B:91 `retourne les candidatures de l'étudiant avec les quatre statuts` | liste exacte `IN_PROGRESS`, `WITHDRAWN`, `REJECTED`, `SELECTED` | Couvert | Couvert |
| 27 | Ne voir que ses propres candidatures | B:118 `ne retourne pas les candidatures d'un autre étudiant` | ids reçus = `[LUCAS_FLEET_APP]` ; pas de `studentId` dans le DTO | Couvert | Couvert |
| 28 | Administrateur ou contact : 403 | B:132 `refuse les administrateurs et les contacts` | 403 (le code d'erreur n'est pas vérifié) | Couvert | Couvert |
| 29 | Sans session : 401 | B:144 `refuse une requête sans session` | 401 | Couvert | Couvert |
| 30 | Libellés français des statuts | A:46 `affiche les candidatures, la date française et les statuts traduits` | « En cours », « Retenue », « Non retenue », « Retirée » | Couvert | Couvert |
| 31 | Liste vide affichée | A:61 `affiche une liste vide` | « Aucune candidature à afficher. » | Couvert | Couvert |
| 32 | Les candidatures sont toujours là après rechargement de la page | aucun test automatique (le front simule l'API) | | Absent | Absent : vérifié à la main en semaine 7 |

## Comportements testés qui ne relèvent pas de EF-32 ou EF-33

Repérés par Copilot et vérifiés par nous :

- filtre des offres par période (`OffersPage.test.tsx`) : séance 6, lié à EF-30 ;
- date au format français, erreur de chargement 500, déconnexion sur un 401, bouton désactivé pendant le retrait (`ApplicationsPage.test.tsx`) : comportements d'interface ;
- liens de navigation selon le profil (`NavBar.test.tsx`) et forme des réponses de l'API (`guards.test.ts`) ;
- tri des candidatures par date (B:91) : choix d'implémentation ;
- 404 pour une offre non publiée (B:53) : vient de RG-03 et de la visibilité des offres (RG-02), pas de EF-32 lui-même.

## Manques restants

- **Cas 15 et 16** : pas ajoutés pour garder des demandes ciblées.
- **Cas 32** : demanderait un test end-to-end, non demandé.
- **Deux candidatures envoyées en même temps** : non testé. La transaction SQLite a été vue dans le code, pas vérifiée par un test.
- **Le test B:63 garde son nom trompeur** « active ou traitée ». Le cas « traitée » est maintenant couvert par B:228, mais le renommage reste à faire.
- **Coquille dans le nom du test B:307** : `Lucaslorsqu'Inès`, il manque une espace.
