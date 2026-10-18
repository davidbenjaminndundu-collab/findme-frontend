# Répartition de la conception en modules

| Élément | Valeur |
|---|---|
| Cible | Application web **desktop d'abord** ; la version mobile des maquettes Figma sert de référence pour le responsive |
| Références | Contrat `Find_Me_API_Contractuelle_V2.yaml`, dossier technologique frontend, [ecartContratApi.md](ecartContratApi.md) |
| Date | 18 octobre 2026 |

## Principes

- **Desktop d'abord** : chaque écran est conçu pour un écran large (≥ 1280 px), puis décliné en tablette (768 px) et en mobile (390 px), qui reprend la maquette Figma.
- **Navigation** :
  - desktop : barre supérieure pour l'espace public et le client, barre latérale pour le prestataire et l'administrateur ;
  - mobile : navigation du bas (Accueil, Commandes, Notifications, Profil).
- **Contrat d'abord** : chaque module ne consomme que les endpoints listés. Les fonctionnalités hors contrat sont traitées selon [ecartContratApi.md](ecartContratApi.md).
- **Un module est terminé quand** :
  - ses écrans sont implémentés en desktop, tablette et mobile ;
  - les états de chargement, de liste vide et d'erreur sont gérés ;
  - il est branché sur les mocks MSW, puis sur l'API ;
  - il est testé.

## Vue d'ensemble

| Module | Espace | Maquette Figma | Dépend de |
|---|---|---|---|
| M0 | Socle technique et design system | Partielle (couleurs, typo, composants) | — |
| M1 | Authentification et onboarding | Oui | M0 |
| M2 | Catalogue public | Partielle (Accueil, Fiche annonce) | M0 |
| M3 | Commandes côté client | Partielle | M1, M2 |
| M4 | Paiement Mobile Money | Oui (sauf échecs) | M3 |
| M5 | Avis et litiges côté client | Oui (à adapter) | M3 |
| M6 | Compte et notifications | Non | M1 |
| M7 | Espace prestataire | Non | M1, M3 |
| M8 | Back-office administrateur | Non | M1 |
| M9 | PWA et hors-ligne | Non | Tous |

**Ordre de conception** : M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9. On suit ainsi la feuille de route du dossier technologique, et chaque module livré est démontrable.

---

## M0 : Socle technique et design system

**Objectif** : poser tout ce que les autres modules réutilisent.

- **Socle** :
  - TypeScript strict, Tailwind 4 + DaisyUI 5, React Router 7, TanStack Query, Zustand, React Hook Form + Zod, i18next ;
  - génération des types depuis le contrat (version locale corrigée des clés invalides A1) et client `openapi-fetch` avec middleware CSRF (cookie, en-tête `X-XSRF-TOKEN`, rejeu sur 419) ;
  - traduction des erreurs 401, 403, 409, 422 et 429, mocks MSW, utilitaires `money.ts` (decimal.js), `phone.ts` (+243), `statuses.ts`.
- **Design system** (repris du Figma) :
  - thème DaisyUI aux couleurs Find Me (orange principal, fond crème), typographie, rayons, ombres ;
  - composants : bouton, champ, téléphone +243, saisie OTP à 6 cases, mot de passe avec œil, badge de statut, carte d'annonce, modale, toast, stepper, onglets, pagination, squelettes de chargement, états vides et erreurs.
- **Layouts** : `PublicLayout`, `ClientLayout`, `PrestataireLayout`, `AdminLayout`, page 403, page 404, `ErrorBoundary`.
- **Routage** : arbres `/`, `/client`, `/prestataire`, `/admin`, garde `RequireRole`, chargement paresseux par espace.

## M1 : Authentification et onboarding

**Figma** : 01 Bienvenue, 02-03 Rôles, 04 Inscription, 05 OTP, 05B, 05C Succès, 06 Connexion, 07 Mot de passe oublié, 05 OTP-Mot de passe, nouveau mot de passe.

| Écran (desktop) | Endpoints |
|---|---|
| Bienvenue : page d'accueil des visiteurs, deux colonnes (illustration et appels à l'action) | — |
| Choix du rôle (client ou prestataire), étape 1 sur 2 | — |
| Inscription, étape 2 sur 2 | `GET /sanctum/csrf-cookie`, `POST /auth/register` |
| Vérification OTP, puis succès | `POST /auth/verify-phone` |
| Connexion (redirection vers l'OTP si le compte est `a_verifier`) | `POST /auth/login`, `GET /auth/me` |
| Mot de passe oublié → code → nouveau mot de passe | `POST /auth/password/forgot`, `POST /auth/password/reset` |
| Déconnexion | `POST /auth/logout` |

**Écarts liés** : E03 (renvoi d'OTP), E04 (OTP de réinitialisation), E16, E17.
**Après connexion** : redirection selon le rôle (client vers le catalogue, prestataire vers son espace ou la complétion de son profil, administrateur vers le back-office).

## M2 : Catalogue public

**Figma** : 08 Accueil, 09 Fiche annonce.

| Écran (desktop) | Endpoints |
|---|---|
| Accueil : bannière, catégories, grille d'annonces (3 à 4 colonnes) | `GET /categories`, `GET /annonces` |
| Recherche avec filtres latéraux (texte, catégorie, prix, délai, note) | `GET /annonces?q&id_categorie&prix_min&prix_max&delai_max&note_min` |
| Fiche annonce : contenu à gauche, encart de prix collant à droite | `GET /annonces/{id}`, `GET /annonces/{id}/avis` |
| Profil public du prestataire : bio, compétences, annonces, avis | `GET /prestataires/{id}`, `GET /annonces?id_prestataire` |

**Écarts liés** : E01 (favoris), E02 (promo), E05 (infos prestataire), E15 (catégories), E18.

## M3 : Commandes côté client

**Figma** : 10 Demande de service, 10b, 11a, 11a2, 11 Suivi, 11f Livrée.

| Écran (desktop) | Endpoints |
|---|---|
| Demande de service (modale ou panneau depuis la fiche annonce) | `POST /commandes` |
| Mes commandes : liste filtrable par statut | `GET /commandes` |
| Détail de commande : stepper de statut, chronologie, encart montant et actions | `GET /commandes/{id}`, `POST /commandes/{id}/actions` |
| Livraisons reçues et validation | `GET /commandes/{id}/livraisons`, action `valider_livraison` |
| Demande de révision (compteur de révisions) | `GET`/`POST /commandes/{id}/revisions` |
| Annulation | action `annuler` |

**Écarts liés** : E06, E07 (messagerie), E08 (précisions).
**À concevoir** : un affichage par statut de commande (14 statuts), piloté par la table centrale des statuts.

## M4 : Paiement Mobile Money

**Figma** : 11b En attente de paiement, 11c Choix de l'opérateur, 11d Confirmation en cours, 11e Paiement confirmé.

| Écran (desktop) | Endpoints |
|---|---|
| Choix de l'opérateur et du numéro (modale) | `POST /commandes/{id}/paiements` (+ `Idempotency-Key`) |
| Confirmation en cours (polling) | `GET /commandes/{id}/paiements`, `GET /commandes/{id}` |
| Résultat : confirmé, échoué, expiré, toujours en attente | — |
| Historique des tentatives de paiement | `GET /commandes/{id}/paiements` |

**Écarts liés** : E09 (Afrimoney), E10 (suivi).

## M5 : Avis et litiges côté client

**Figma** : 12 Noter la commande, 13 Ouvrir un litige, 13b, 13c, 13d.

| Écran (desktop) | Endpoints |
|---|---|
| Noter une commande terminée (1 à 5 étoiles et commentaire) | `POST /commandes/{id}/avis` |
| Ouvrir un litige (motif, description) | `POST /commandes/{id}/litiges` |
| Fiche litige : statut, décision, répartition des montants | `GET /litiges/{id}` |

**Écarts liés** : E11, E12 (preuves), E13 (échanges), E14 (accès au litige, bloquant pour la fiche).

## M6 : Compte et notifications

**Figma** : aucune maquette.

| Écran (desktop) | Endpoints |
|---|---|
| Mon profil : nom, prénom, postnom, email | `GET`/`PATCH /auth/me` |
| Centre de notifications (menu de la cloche et page complète), marquer comme lu | `GET /notifications`, `PATCH /notifications/{id}/ack` |
| Préférences (langue, thème) | Local |

## M7 : Espace prestataire

**Figma** : aucune maquette. Conception desktop dans le même langage visuel.

| Écran (desktop) | Endpoints |
|---|---|
| Complétion et édition du profil professionnel | `GET`/`PATCH /prestataires/me` |
| Tableau de bord : commandes à traiter, solde, annonces | Agrégat des endpoints ci-dessous |
| Mes annonces : liste par statut, création, édition, soumission, désactivation, suppression | `GET`/`POST /annonces`, `PATCH`/`DELETE /annonces/{id}`, `POST /annonces/{id}/soumettre`, `POST /annonces/{id}/desactiver` |
| Commandes reçues : accepter, refuser, demander des précisions, démarrer | `GET /commandes`, `POST /commandes/{id}/actions` |
| Livrer et suivre les révisions | `POST /commandes/{id}/livraisons`, `GET /commandes/{id}/revisions` |
| Wallet : soldes en attente et disponible, mouvements | `GET /wallet`, `GET /wallet/mouvements` |
| Retraits : demande et historique | `GET`/`POST /retraits`, `GET /retraits/{id}` |
| Litiges liés à mes commandes (consultation) | `GET /litiges/{id}` |

**Points ouverts** : upload des livrables et de l'image de couverture (B1), création du profil (B3), idempotence des retraits (C4).

## M8 : Back-office administrateur

**Figma** : aucune maquette. Interface dense, orientée tableaux.

| Écran (desktop) | Endpoints |
|---|---|
| Utilisateurs : liste filtrable, détail, changement de statut | `GET /users`, `GET`/`PATCH /users/{id}` |
| Catégories : création, édition, désactivation | `GET`/`POST /categories`, `PATCH`/`DELETE /categories/{id}` |
| Modération des annonces (publier ou refuser avec motif) | `GET /annonces?statut=en_attente_validation`, `PATCH /annonces/{id}/moderation` |
| Litiges : liste, détail, décision et répartition | `GET /litiges`, `GET`/`PATCH /litiges/{id}` |
| Retraits : approuver ou refuser | `GET /retraits`, `PATCH /retraits/{id}` |
| Export CSV | `GET /export/csv` |

## M9 : PWA et hors-ligne

- Installation (manifeste, icônes) et invitation à recharger lors d'une mise à jour.
- Indicateur hors ligne et nombre d'actions en attente.
- Synchronisation au retour du réseau (`GET /sync?since=`) et file d'actions sûres (accusé de notification, brouillons).
- Tests sur de vrais appareils iOS et Android (cookies de session en PWA installée).
