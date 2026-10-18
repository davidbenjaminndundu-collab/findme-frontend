# Journal des modules

Suivi de l'avancement de la conception, module par module. Le plan détaillé se trouve dans [modules-conception.md](modules-conception.md) et les écarts avec le contrat dans [ecartContratApi.md](ecartContratApi.md).

**À chaque fin de module**, on ajoute une entrée avec :
- **Réalisé** : ce qui a été fait (écrans, composants, branchements API, tests) ;
- **Reste à faire** : ce qui manque pour compléter le module, et la raison (décision en attente, dépendance backend, écart du contrat, etc.).

## Tableau de bord

| Module | Intitulé | Statut | Dernière mise à jour |
|---|---|---|---|
| M0 | Socle technique et design system | Terminé avec réserves | 18/10/2026 |
| M1 | Authentification et onboarding | À faire | — |
| M2 | Catalogue public | À faire | — |
| M3 | Commandes côté client | À faire | — |
| M4 | Paiement Mobile Money | À faire | — |
| M5 | Avis et litiges côté client | À faire | — |
| M6 | Compte et notifications | À faire | — |
| M7 | Espace prestataire | À faire | — |
| M8 | Back-office administrateur | À faire | — |
| M9 | PWA et hors-ligne | À faire | — |

Statuts possibles : À faire · En cours · Terminé · Terminé avec réserves.

---

<!-- Les entrées de fin de module sont ajoutées ci-dessous, la plus récente en haut. -->

## M0 : Socle technique et design system (18/10/2026)

**Statut : terminé avec réserves.** Le socle est en place et vérifié : typage strict, lint sans erreur, 114 tests, build de production. Les réserves concernent l'outillage (CI, hooks Git, E2E) et des décisions à valider.

### Réalisé

**Socle et outillage**
- Dépendances installées : React 19, React Router 8, TanStack Query 5, openapi-fetch, Zustand 5, React Hook Form + Zod 4, decimal.js, i18next, lucide-react, sonner, date-fns ; Tailwind 4 + DaisyUI 5, Vitest 5, Testing Library, MSW 3, Prettier, Redocly.
- TypeScript en mode strict (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`) et alias `@/` vers `src/`.
- Scripts npm : `typecheck`, `test`, `test:coverage`, `format`, `api:lint`, `api:types`, `api:check`.
- Fichier `.env.example` documenté, README réécrit, configuration Prettier (avec tri des classes Tailwind).

**Contrat d'API**
- Copie versionnée dans `openapi/find-me.yaml`, corrigée pour être valide (corrections C-01 à C-06, détaillées dans [ecartContratApi.md](ecartContratApi.md)) ; le lint Redocly passe.
- Types générés dans `src/api/schema.d.ts` (2 885 lignes) et alias métier dans `src/api/types.ts`. Aucun type métier n'est écrit à la main.

**Couche API (`src/api/`)**
- `client.ts` : client typé openapi-fetch avec middleware Sanctum. Il ajoute `Accept`, `X-Requested-With` et `X-XSRF-TOKEN`, demande le cookie CSRF si besoin, rejoue **une seule fois** une requête rejetée en 419, et signale les 401 à la session (sauf la sonde `GET /auth/me`).
- `errors.ts` : traduction des erreurs (401, 403, 404, 409, 419, 422, 429, 5xx, réseau). Les deux formats de `details` sont acceptés (ambiguïté A2), ainsi que le format natif Laravel.
- `csrf.ts` (cookie XSRF-TOKEN) et `idempotency.ts` (une clé par intention, conservée en `sessionStorage`).

**Utilitaires (`src/shared/lib/`)**
- `money.ts` : calculs exacts via decimal.js, affichage « 20,00 $ ».
- `phone.ts` : normalisation, formatage et masquage au format +243.
- `statuses.ts` : tables exhaustives des statuts (commande, annonce, paiement, retrait, litige, compte) avec libellé, couleur et étape du stepper.
- `pagination.ts`, `text.ts`, `cn.ts`.

**Internationalisation**
- `src/i18n/fr.json` : navigation, erreurs, pages système, libellés de tous les statuts du contrat et des opérateurs. La structure est prête pour l'anglais et le lingala.

**Design system**
- Thème DaisyUI « findme » construit sur les couleurs relevées dans le Figma : orange de marque #E06B3D, teinte claire #FCE5D8, fond crème #FAF9F6, bordures #E8E4DC.
- Police Poppins auto-hébergée, sous-ensemble latin uniquement.
- Composants (`src/shared/ui/`) : Button, Field, TextInput, PasswordInput, PhoneInput (+243), OtpInput (6 cases, collage, retour arrière), StatusBadge, Avatar (initiales), Logo, Modal (feuille du bas sur mobile), Pagination, PageLoader, Skeleton, EmptyState, ErrorState.

**Mises en page et routage**
- `PublicLayout` (espace public et client) : barre supérieure sur desktop, navigation du bas sur mobile (Accueil, Commandes, Notifications, Profil ; Favoris retirés, écart E01).
- `SpaceLayout` (prestataire et administration) : barre latérale sur desktop, tiroir sur mobile. Lien d'évitement et focus visibles.
- Arbre de routes par espace (`/`, `/client`, `/prestataire`, `/admin`) avec la garde `RequireRole` : un visiteur va vers la connexion avec retour à la page d'origine, un mauvais rôle vers la page 403.
- Chaque écran des modules suivants est déjà routé vers un écran provisoire qui indique le module concerné (M1 à M8). Pages 404, 403 et erreur de rendu (ErrorBoundary par espace).
- Session : `useSession` (cache de `GET /auth/me`) et `useLogout` (purge complète du cache).

**Mocks et tests**
- MSW partagé entre les tests et le développement sans backend (`VITE_ENABLE_MOCKS=true`). Le rôle simulé se règle avec `?mockRole=client|prestataire|administrateur|aucun`.
- 114 tests (unitaires, composants, intégration du routeur). Couverture : 92 % des instructions, 87 % des branches, 91 % des fonctions, 95 % des lignes.

**Vérifications**
- `tsc` sans erreur, ESLint sans erreur, Prettier conforme, 114 tests verts.
- Build de production : 146,7 Ko de JavaScript compressé (budget du dossier : 200 Ko).
- Rendu contrôlé dans Chrome : visiteur, client et prestataire en desktop 1440 px, et client en mobile 390 px.

### Décisions prises, à valider par l'équipe

1. **Versions plus récentes que celles du dossier** : TypeScript 6, Vite 8, React Router 8, Vitest 5, MSW 3 et ESLint 10 (le dossier visait TS 5 et React Router 7). Les API utilisées sont identiques. openapi-typescript ne déclare pas encore TypeScript 6 : une `override` npm explicite l'autorise.
2. **Couleur des boutons #C4542A au lieu de #E06B3D** : le blanc sur #E06B3D n'atteint que 3,3:1 de contraste (WCAG AA exige 4,5:1). #E06B3D reste la couleur de marque (logo, bannières, icônes, états actifs).
3. **Session dans le cache TanStack Query uniquement** : Zustand est installé mais pas encore utilisé. Il servira aux préférences et à la file hors ligne (M9).
4. **Redocly au lieu de Spectral** pour le lint du contrat (le dossier autorise les deux).
5. **Mises en page purement visuelles** dans `shared/layouts`, branchées sur la session dans `app/router/shells.tsx`, pour respecter le sens `app → features → shared`.

### Reste à faire pour compléter le module

- **Accessibilité automatisée** : `eslint-plugin-jsx-a11y` n'est pas compatible avec ESLint 10. Il faudra la remplacer par des contrôles axe dans les tests E2E, ou l'installer dès qu'une version compatible sortira.
- **1 avertissement ESLint** : la directive `eslint-disable` du fichier généré `public/mockServiceWorker.js`. Il faut ajouter ce fichier, ainsi que `coverage` et `src/api/schema.d.ts`, aux `globalIgnores` d'`eslint.config.js`. Le hook « config-protection » de l'environnement bloque cette modification.
- **Intégration continue et hooks Git** : GitHub Actions (lint, typage, tests, `api:check`, build) et Husky + lint-staged ne sont pas encore en place. Le dépôt n'a pas encore de remote.
- **Tests E2E** : Playwright n'est pas installé ; prévu avec M1 (parcours inscription, OTP et connexion).
- **Découpage par espace** (`route.lazy`) : à activer quand les espaces auront de vrais écrans (aujourd'hui, un seul bundle de 147 Ko).
- **Composants prévus mais non encore réalisés**, à créer dans les modules qui les utilisent : stepper de commande (M3), carte d'annonce et pastilles de catégories (M2), onglets.
- **Police** : Poppins a été identifiée d'après la capture de l'Accueil, à confirmer dans Figma.
- **Corrections du contrat C-01 à C-06** à transmettre au backend.
- **Rien n'est encore commité** : tous les changements sont dans l'arbre de travail de `findme-frontend`.
