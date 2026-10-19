# Cinema Manager — Frontend

React + TypeScript, construit avec [Vite](https://vite.dev). Nécessite Node.js 22 ou plus.

## Scripts

| Commande               | Rôle                                                   |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Serveur de dev sur http://localhost:5173 (proxy `/api`) |
| `npm test`             | Lance les tests une fois                               |
| `npm run test:watch`   | Relance les tests à chaque modification                |
| `npm run coverage`     | Tests + rapport de couverture (`coverage/`)            |
| `npm run lint`         | Analyse du code avec [Oxlint](https://oxc.rs)          |
| `npm run build`        | Vérification TypeScript puis build de production       |

## Organisation

```
src/
├── api/              Client HTTP (fetch vers /api, erreurs ProblemDetails) et cache TanStack Query
├── components/       Composants partagés (Layout : en-tête et navigation)
├── features/movies/  Une fonctionnalité = ses appels API, ses pages, son formulaire et leurs tests
├── pages/            Pages hors fonctionnalité (accueil, page introuvable)
├── test/             Outils de test : faux serveur MSW, rendu de l'application
├── App.tsx           Les routes
└── main.tsx          Point d'entrée : routeur et cache
```

- **Routage** : [React Router](https://reactrouter.com) (`/movies`, `/movies/new`, `/movies/:id/edit`).
- **Données** : [TanStack Query](https://tanstack.com/query) met en cache les lectures de l'API et
  gère le chargement, les erreurs et les mutations.
- **Appels à l'API** : toujours via `/api`, que le proxy de Vite (dev) ou nginx (Docker) transmet au backend.

## Tests

[Vitest](https://vitest.dev) avec [Testing Library](https://testing-library.com) : les tests
utilisent l'application comme un utilisateur (libellés, rôles, clics) plutôt que ses détails internes.
L'API est simulée par [MSW](https://mswjs.io) : chaque test déclare les réponses dont il a besoin
avec `server.use(...)`, et toute requête non prévue fait échouer le test.
