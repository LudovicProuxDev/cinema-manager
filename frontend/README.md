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
├── api/              Client HTTP (fetch vers /api, erreurs ProblemDetails), endpoints CRUD génériques
│                     (createResourceApi, useList, useItem) et cache TanStack Query
├── components/       Composants partagés : Layout (en-tête, navigation), ListPage, QueryContent, Alert
├── forms/            Briques des formulaires : useForm (valeurs, erreurs, envoi), Form et Field,
│                     Options (listes déroulantes), règles de validation, useCreate/useUpdate, useDelete
├── features/         Une fonctionnalité par ressource de l'API : movies, rooms, seats, screenings,
│                     users, reservations, tickets
├── pages/            Pages hors fonctionnalité (accueil, page introuvable)
├── test/             Outils de test : faux serveur MSW, fausse API (fakeResource), rendu de l'application
├── App.tsx           Les routes
└── main.tsx          Point d'entrée : routeur et cache
```

Chaque fonctionnalité suit le même modèle, par exemple `features/rooms/` :

| Fichier              | Rôle                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| `roomsApi.ts`        | Le type renvoyé par l'API, la requête envoyée, et les endpoints `/rooms`      |
| `roomForm.ts`        | Le formulaire sans React : valeurs vides, validation, conversion en requête   |
| `RoomForm.tsx`       | Le formulaire affiché, partagé par la création et la modification             |
| `RoomsPage.tsx`      | La liste, avec la suppression                                                  |
| `NewRoomPage.tsx`    | `/rooms/new`                                                                   |
| `EditRoomPage.tsx`   | `/rooms/:id/edit`                                                              |
| `*.test.ts(x)`       | Les tests : les règles du formulaire, puis les pages comme un utilisateur     |

- **Routage** : [React Router](https://reactrouter.com).
- **Données** : [TanStack Query](https://tanstack.com/query) met en cache les lectures de l'API et
  gère le chargement, les erreurs et les mutations.
- **Appels à l'API** : toujours via `/api`, que le proxy de Vite (dev) ou nginx (Docker) transmet au backend.
- **Dates** : l'API travaille en UTC ; les écrans affichent et saisissent l'heure locale du navigateur.

## Tests

[Vitest](https://vitest.dev) avec [Testing Library](https://testing-library.com) : les tests
utilisent l'application comme un utilisateur (libellés, rôles, clics) plutôt que ses détails internes.
L'API est simulée par [MSW](https://mswjs.io) : chaque test déclare les réponses dont il a besoin
avec `server.use(...)` ou `fakeResource(...)`, et toute requête non prévue fait échouer le test.
Les tests tournent dans le fuseau Europe/Paris, pour vérifier les conversions entre heure locale et UTC.

En CI, le job de tests publie le rapport JUnit (`frontend-test-results`) et le rapport de couverture
(`frontend-coverage`) ; le job de build publie l'application construite (`frontend-dist`).
