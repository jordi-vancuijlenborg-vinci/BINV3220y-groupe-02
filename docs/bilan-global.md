# Bilan global

## Ce qu'on a appris

- Relire ce que Copilot produit, toujours. Il se trompe avec beaucoup d'assurance : mauvais fichier cité, règle métier inventée, ou test qui « couvre » un cas qu'il ne vérifie pas.
- Faire un plan avant de coder. Le mode Plan nous a obligés à trancher des choix (recandidature après retrait, codes 404 et 409) au lieu de laisser l'agent décider.
- Un test qui passe ne prouve rien tout seul. Casser le code exprès pour voir le test échouer, et lire pourquoi il échoue, ça nous a servi plusieurs fois.
- Petites demandes, petites étapes. Quand on demandait trop d'un coup, Copilot partait dans tous les sens ou se bloquait.
- La différence entre guides (instructions, cahier des charges) et senseurs (tests, lint, typecheck). Si les guides sont flous, l'agent comble les trous à sa façon.
- Les tests E2E avec Playwright, qu'on n'avait jamais faits avant.

## Ce qu'on aurait aimé apprendre

- Faire marcher Playwright MCP. On n'a jamais réussi à connecter le serveur, donc on n'a pas vu l'agent piloter le navigateur.
- Mettre en place une CI, pour que les tests tournent tout seuls à chaque push.
- Écrire nous-mêmes un skill ou des instructions Copilot vraiment adaptés au projet, et mesurer si ça change le résultat.
- Mieux gérer le travail à deux avec l'agent. Comme on n'avançait pas toujours en même temps, on a parfois dû recopier les changements à la main.