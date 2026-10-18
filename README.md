# Find Me : frontend

Application web React (desktop d'abord, responsive mobile) de la marketplace Find Me, branchée sur l'API Laravel Sanctum décrite dans `openapi/find-me.yaml`.

## Démarrer

Avec Docker (réseau `find_me_network` partagé avec le backend) :

```bash
docker compose up -d
docker compose exec frontend npm run dev
```

Sans Docker :

```bash
npm install
cp .env.example .env.local      # puis ajuster VITE_API_TARGET (ex. http://localhost:8000)
npm run dev                     # http://localhost:5173
```

Sans backend, avec l'API simulée par MSW :

```bash
VITE_ENABLE_MOCKS=true npm run dev
# puis http://localhost:5173/?mockRole=client  (ou prestataire, administrateur, aucun)
```

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (proxy `/api` et `/sanctum` vers Laravel) |
| `npm run build` | Typage puis build de production |
| `npm run typecheck` | Vérification TypeScript (mode strict) |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:run` / `test:coverage` | Vitest (seuil visé : 80 %) |
| `npm run api:lint` | Lint du contrat OpenAPI (Redocly) |
| `npm run api:types` | Régénère `src/api/schema.d.ts` depuis le contrat |
| `npm run api:check` | Échoue si les types générés ne correspondent plus au contrat |

## Règles du projet

- **Le contrat fait foi.** Les types viennent de `src/api/schema.d.ts` (généré, ne pas éditer). Après toute modification de `openapi/find-me.yaml`, lancer `npm run api:types`.
- **Aucun jeton côté front** : session par cookie HttpOnly (Sanctum), CSRF géré par `src/api/client.ts`.
- **Montants** : chaînes décimales, calculs uniquement via `src/shared/lib/money.ts` (jamais `Number`).
- **Statuts** : libellés et couleurs dans `src/shared/lib/statuses.ts` et `src/i18n/fr.json`, jamais en dur dans le JSX.
- **Dépendances** : `app → features → shared` ; une fonctionnalité n'importe jamais une autre.

## Documentation

- [docs/modules-conception.md](docs/modules-conception.md) : découpage de la conception en modules
- [docs/modules.md](docs/modules.md) : journal d'avancement, module par module
- [docs/ecartContratApi.md](docs/ecartContratApi.md) : écarts entre les maquettes Figma et le contrat d'API
