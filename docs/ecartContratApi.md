# Écarts entre les maquettes Figma et le contrat d'API

| Élément | Valeur |
|---|---|
| Maquettes | Figma « FindME » (Page 1, version mobile 390 px) |
| Contrat | `Find_Me_API_Contractuelle_V2.yaml` (OpenAPI 3.0.3, v1.1.0-sanctum) |
| Revue associée | `Find_Me_Revue_API_Contractuelle.pdf` (constats A1 à D5) |
| Date | 18 octobre 2026 |
| Statut | Version 1, à compléter à chaque nouvel écran |

## Règle adoptée

**Le contrat d'API fait foi.** Quand une maquette montre une fonctionnalité que le contrat ne permet pas, **c'est l'interface qui s'adapte au contrat**, pas l'inverse :

1. La fonctionnalité est retirée ou remplacée par un équivalent réalisable avec les endpoints existants.
2. Si elle a une vraie valeur produit, une **demande d'évolution** est transmise à l'équipe backend (colonne « Demande backend »).
3. Quand le backend livre l'évolution et que le contrat est mis à jour, la fonctionnalité est réintroduite et l'écart est marqué « Clos ».

Le frontend ne code jamais contre un endpoint absent du contrat.

## Synthèse

| N° | Écran(s) Figma | Écart | Adaptation de l'interface | Demande backend | Statut |
|---|---|---|---|---|---|
| E01 | 08 Accueil, navigation du bas | Favoris (♡ et onglet) | Retirés | Oui (v2) | Ouvert |
| E02 | 08 Accueil | Bannière promo -50 % et compte à rebours | Remplacée par une bannière éditoriale sans prix | Non | Ouvert |
| E03 | 05B, 05C | « Renvoyer le code » OTP | Inscription : bouton retiré, message d'aide. Mot de passe : renvoi via `/auth/password/forgot` | Oui (B2) | Ouvert |
| E04 | 07, 05 OTP-Mot de passe, 04 (nouveau mot de passe) | Aucun endpoint pour vérifier l'OTP seul lors de la réinitialisation | L'écran OTP collecte le code sans appel API ; la validation se fait à l'envoi du nouveau mot de passe | Non | Ouvert |
| E05 | 08 Accueil, 09 Fiche annonce | Nom, photo et note du prestataire absents de `Annonce` | Données chargées via `GET /prestataires/{id}` (cache) ; avatar à initiales | Oui | Ouvert |
| E06 | 10 Demande de service | « Ajouter une référence (optionnel) » | Champ retiré ; l'utilisateur peut coller un lien dans la description | Non (dépend de B1) | Ouvert |
| E07 | 11 Suivi de commande | Messagerie client ↔ prestataire | Remplacée par une chronologie (statut, livraisons, révisions) | Oui (à arbitrer) | Ouvert |
| E08 | 11a2 Précisions demandées | Le client ne peut ni lire la question ni répondre | Statut affiché avec renvoi vers la notification ; actions possibles : attendre ou annuler | Oui (B4) | Ouvert |
| E09 | 11c Choix de l'opérateur (2e version) | Afrimoney (Africell) | Retiré : seuls M-Pesa, Orange Money et Airtel Money sont proposés | Non | Ouvert |
| E10 | 11d Confirmation en cours | `POST /paiements` ne renvoie pas le paiement créé | Suivi par polling de `GET /commandes/{id}/paiements` et `GET /commandes/{id}` | Oui (A3) | Ouvert |
| E11 | 12 Noter la commande | Note proposée alors que la commande est seulement « livrée » | Avis proposé uniquement après « Valider la livraison » (statut `terminee`) | Non | Ouvert |
| E12 | 13 Ouvrir un litige, 13c | Ajout de preuves (captures, documents) | Champ masqué tant qu'il n'existe pas de flux d'upload | Oui (B1) | Ouvert |
| E13 | 13b, 13c Suivi du litige | Fil d'échanges avec l'administration et bouton « Répondre » | Remplacés par une fiche litige (motif, description, statut, décision) | Oui (B4) | Ouvert |
| E14 | 13b Suivi du litige | Le client n'a aucun moyen de retrouver son litige | Accès depuis la commande `en_litige` impossible sans identifiant | Oui (bloquant) | Ouvert |
| E15 | 08 Accueil | Catégories codées en dur avec icônes | Liste dynamique `GET /categories` ; icône par correspondance avec repli générique | Non | Ouvert |
| E16 | 07 Mot de passe oublié | « Pour plus d'aide, cliquez ici » | Lien statique vers un contact support | Non | Ouvert |
| E17 | 04 Inscription | Email optionnel prévu par le contrat, absent de la maquette | Champ « Email (optionnel) » ajouté | Non | Ouvert |
| E18 | 09 Fiche annonce | `elements_requis_client` et `conditions_particulieres` non affichés | Sections ajoutées à la fiche | Non | Ouvert |

## Détail des écarts

### E01 : Favoris
- **Maquette** : bouton ♡ sur chaque carte d'annonce et onglet « Favoris » dans la navigation du bas.
- **Contrat** : aucun endpoint de favoris.
- **Adaptation** : bouton ♡ et onglet retirés. Navigation : Accueil, Commandes, Notifications, Profil.
- **Demande backend** : `GET/POST/DELETE /favoris` en évolution v2, si le métier le juge utile.

### E02 : Bannière promotionnelle
- **Maquette** : « Tous service design donne une réduction de 50 % », compte à rebours `05H : 15M : 02S`.
- **Contrat** : aucune notion de promotion ou de réduction ; seul `prix_base` existe.
- **Adaptation** : bannière éditoriale (proposition de valeur, appel à l'action) sans prix ni réduction. Afficher une remise non appliquée par l'API serait trompeur pour l'utilisateur.

### E03 : Renvoi du code OTP (constat B2)
- **Maquette** : « Tu n'as rien reçu ? Renvoyer le code dans 0:58 ».
- **Contrat** : pas d'endpoint de renvoi. Si le SMS n'arrive pas, le compte reste `a_verifier` : la connexion renvoie 403 et une nouvelle inscription renvoie 409. L'utilisateur est bloqué.
- **Adaptation** :
  - Réinitialisation du mot de passe : « Renvoyer le code » rappelle `POST /auth/password/forgot`, avec le compte à rebours et la gestion du 429.
  - Inscription : bouton retiré et remplacé par un message d'aide avec contact support.
- **Demande backend** : `POST /auth/resend-otp`, avec limitation de débit et délai minimal entre deux envois.

### E04 : Vérification de l'OTP lors de la réinitialisation
- **Maquette** : trois écrans (téléphone → OTP « Vérifier » → nouveau mot de passe).
- **Contrat** : un seul appel `POST /auth/password/reset` avec `telephone`, `code_otp` et `nouveau_mot_de_passe` ensemble. Il n'existe pas d'appel pour vérifier l'OTP seul.
- **Adaptation** : l'écran OTP conserve le code en mémoire sans appel API. L'envoi se fait sur l'écran du nouveau mot de passe. Si le code est invalide (422), l'utilisateur revient à l'écran OTP avec le message d'erreur. Le champ « Confirmer le mot de passe » reste une vérification côté interface.

### E05 : Informations du prestataire sur les annonces
- **Maquette** : chaque carte et la fiche annonce affichent la photo, le nom, la note et le nombre d'avis du prestataire (« 4.8 · 32 avis »).
- **Contrat** : `Annonce` ne contient que `id_prestataire`. Le nom (`nom_professionnel`), la note et le nombre d'avis sont dans `ProfilPrestataire`. La photo (`image_profil`) est sur `Utilisateur` et n'est exposée par aucun endpoint public.
- **Adaptation** :
  - Le nom et la note sont chargés par `GET /prestataires/{id}` pour chaque prestataire distinct, avec mise en cache.
  - La photo est remplacée par un avatar à initiales.
  - Le libellé précise que la note concerne le prestataire, pas l'annonce.
- **Demande backend** : inclure un résumé `prestataire { nom_professionnel, note_moyenne, nombre_avis, image_profil }` dans `Annonce`, pour éviter un appel par carte.

### E06 : Référence jointe à la demande de service
- **Maquette** : « Ajouter une référence (optionnel) ».
- **Contrat** : `CommandeCreate` ne contient que `id_annonce` et `description_commande`.
- **Adaptation** : champ retiré. Le texte d'aide invite à coller un lien de référence dans la description.

### E07 : Messagerie dans le suivi de commande
- **Maquette** : conversation client ↔ prestataire, avec échange d'un numéro WhatsApp.
- **Contrat** : aucun endpoint de messagerie.
- **Adaptation** : la conversation est remplacée par une **chronologie** de la commande : statut actuel, livraisons (`/livraisons`), révisions (`/revisions`) et dates clés.
- **Remarque produit** : l'échange de numéros dans la maquette favorise les transactions hors plateforme, ce qui contourne le paiement sécurisé et la commission. Une messagerie future devrait filtrer les coordonnées.
- **Demande backend** : à arbitrer avec le métier (messagerie par commande).

### E08 : Précisions demandées par le prestataire (constat B4)
- **Maquette** : le client lit la question du prestataire et répond dans un champ « Ta réponse ».
- **Contrat** : le prestataire envoie l'action `demander_precisions` avec un `motif`, mais `Commande` ne renvoie pas ce motif et aucun endpoint ne permet au client de répondre.
- **Adaptation** : l'écran affiche le statut « Le prestataire demande des précisions » et renvoie vers la notification associée (si elle contient le message). Le client peut seulement attendre ou annuler la commande.
- **Demande backend** : exposer le dernier `motif` sur la commande et ajouter une action de réponse du client qui ramène la commande à `en_attente_reponse`.

### E09 : Opérateur Afrimoney
- **Maquette** : la 2e version de « 11c Choix de l'opérateur » propose Afrimoney (Africell).
- **Contrat** : `PaiementCreate.operateur` ∈ `mpesa`, `airtel_money`, `orange_money`.
- **Adaptation** : on retient la version à trois opérateurs.

### E10 : Suivi du paiement (constat A3)
- **Maquette** : « Confirmation en cours… », puis « Paiement confirmé ».
- **Contrat** : la réponse 202 de `POST /commandes/{id}/paiements` n'a pas de schéma, donc pas d'identifiant de paiement à suivre.
- **Adaptation** : polling toutes les 3 à 5 secondes de `GET /commandes/{id}/paiements` (dernier paiement) et `GET /commandes/{id}`, avec arrêt sur un statut final (`confirme`, `echoue`, `expire`) ou après un délai maximal. On affiche alors « Paiement toujours en attente, vérifie plus tard ».
- **Demande backend** : renvoyer `Paiement` dans la réponse 202.

### E11 : Moment de la notation
- **Maquette** : la note s'affiche alors que la commande est « Livrée, en attente de validation ».
- **Contrat** : `POST /commandes/{id}/avis` renvoie 409 si la commande n'est pas terminée.
- **Adaptation** : enchaînement « Valider la livraison » (`valider_livraison`) → commande `terminee` → invitation à noter.

### E12 : Preuves de litige (constat B1)
- **Maquette** : « Preuves (optionnel) : ajouter des captures ou documents ».
- **Contrat** : `preuves` est un objet libre et il n'existe aucun endpoint d'upload.
- **Adaptation** : champ masqué. Le litige s'ouvre avec `motif` et `description`.
- **Demande backend** : flux d'upload (B1). Il débloque aussi les livraisons, `image_profil` et `image_couverture`.

### E13 : Fil d'échanges du litige (constat B4)
- **Maquette** : conversation avec l'administration et bouton « Répondre à l'administration » ; une annotation Figma précise « visible uniquement si statut = informations_demandees ».
- **Contrat** : `Litige` ne contient aucun message, et aucun endpoint ne permet de répondre.
- **Adaptation** : fiche litige en lecture (motif, description, statut, puis décision et répartition des montants une fois résolu). Au statut `informations_demandees`, un message invite à surveiller les notifications.
- **Demande backend** : messages de litige (lecture et ajout), avec preuves.

### E14 : Accès du client à son litige
- **Maquette** : le client consulte le suivi de son litige.
- **Contrat** : `GET /litiges` est réservé à l'administrateur, `Commande` ne contient pas d'`id_litige`, et la réponse 201 de création n'a pas de schéma. Le client ne connaît donc jamais l'identifiant nécessaire à `GET /litiges/{id}`.
- **Adaptation provisoire** : afficher le statut `en_litige` sur la commande, sans lien vers le détail.
- **Demande backend (bloquante)** : renvoyer `Litige` à la création, et ajouter `id_litige` sur `Commande` ou un endpoint `GET /commandes/{id}/litige`.

### E15 : Catégories
- **Maquette** : cinq catégories fixes (Design, Développement, Rédaction, Vidéo, Marketing) avec des icônes dédiées.
- **Contrat** : `GET /categories` renvoie une liste dynamique ; `icone` est une chaîne facultative.
- **Adaptation** : liste dynamique. L'icône est déduite du champ `icone` via une table de correspondance, avec une icône générique par défaut.

### E16 : Lien d'aide
- **Maquette** : « Pour plus d'aide, cliquez ici ».
- **Adaptation** : lien vers un contact support statique (adresse à fournir par le métier).

### E17 : Email à l'inscription
- **Maquette** : pas de champ email.
- **Contrat** : `UserRegister.email` est optionnel.
- **Adaptation** : ajout d'un champ « Email (optionnel) ».

### E18 : Informations de l'annonce non affichées
- **Maquette** : la fiche montre la description, les révisions, les livrables et le délai.
- **Contrat** : `Annonce` contient aussi `elements_requis_client` (ce que le client doit fournir) et `conditions_particulieres`.
- **Adaptation** : ajout des sections « Ce dont le prestataire a besoin » et « Conditions particulières ».

## États prévus par le contrat mais absents des maquettes

Ce ne sont pas des écarts, mais des écrans ou des états à concevoir :

- **Commande** : `refusee`, `annulee`, `paiement_en_cours`, `revision_demandee`, `en_revision`, `en_litige`, `terminee`, `remboursee`.
- **Paiement** : échec (`echoue`), expiration (`expire`), délai de confirmation dépassé.
- **Révision** : formulaire de demande (`description` obligatoire), compteur `nombre_revisions_utilisees / nombre_revisions_incluses`, bouton désactivé une fois les révisions épuisées.
- **Connexion** : compte `a_verifier` (403 → écran OTP), compte suspendu, bloqué ou fermé, trop de tentatives (429).
- **Listes** : liste « Mes commandes », recherche avec filtres (`q`, `id_categorie`, `prix_min`, `prix_max`, `delai_max`, `note_min`), notifications, profil.
- **Prestataire inscrit** : après « Compte créé », un prestataire doit compléter son profil professionnel (`PATCH /prestataires/me`, constat B3) au lieu d'arriver sur le catalogue.
- **Espaces prestataire et administrateur** : entièrement à concevoir.

## Incohérences internes aux maquettes

À corriger dans Figma pour éviter les erreurs d'intégration :

- **Écrans en double** : « 04 Inscription », « 08 Accueil », « 11a En attente de réponse », « 11c Choix de l'opérateur », « 12 Noter la commande ». Il faut désigner la version de référence.
- **« 04 Inscription » (2e version)** : c'est en réalité l'écran « Nouveau mot de passe ». Le libellé « Confirmer le Message » doit devenir « Confirmer le mot de passe ».
- **« 11a » (1re version)** : elle affiche le contenu « En attente de paiement ».
- **« 11c », « 11d » et « 11e »** : elles affichent toujours « En attente de paiement » comme statut actuel, même une fois le paiement confirmé (le statut attendu est alors `payee`).
- **« 13d Litige résolu »** : le titre reste « Litige en cours ».

## Corrections apportées à la copie locale du contrat

Le frontend travaille sur une copie versionnée du contrat : `openapi/find-me.yaml`. Conformément au dossier technologique (§6.2, « Contournement en attendant »), elle a été corrigée pour permettre la génération des types. **Chaque correction doit être reportée dans le contrat officiel par l'équipe backend** ; sans cela, les deux versions divergeront.

| N° | Emplacement | Problème | Correction locale | Constat revue |
|---|---|---|---|---|
| C-01 | `POST /auth/password/forgot` (200) | Clé YAML parasite `un OTP est envoyé (réponse uniforme): null` (non listée dans la revue) | Fusionnée dans `description` | A1 |
| C-02 | `POST /commandes/{id}/actions` (202) | Clé parasite `statut mis à jour: null` | Fusionnée dans `description` | A1 |
| C-03 | `POST /commandes/{id}/paiements` (202) | Clé parasite `transmis à l'opérateur: null` | Fusionnée dans `description` | A1 |
| C-04 | `POST /webhooks/paiements` (200) | Clés parasites `rejeté: null`, `ignoré ou dupliqué: null` | Fusionnées dans `description` | A1 |
| C-05 | `GET /wallet`, `GET /litiges`, `GET /litiges/{id}`, `GET /notifications` (200) | Champ `description` obligatoire absent (OpenAPI invalide, non listé dans la revue) | Description ajoutée | — |
| C-06 | `components/responses/ValidationError` | Exemple `details` en tableau, alors que le schéma attend un objet | Exemple remplacé par `{ telephone: [...] }` | A2 |

Résultat : `npm run api:lint` (Redocly) valide le contrat, avec 8 avertissements mineurs restants (4 réponses 4xx manquantes, 3 schémas inutilisés et l'absence de licence, déjà relevés en C3 et D3).

## Suivi

| Date | Modification |
|---|---|
| 18/10/2026 | Création : écarts E01 à E18, états manquants, incohérences internes |
| 18/10/2026 | Ajout des corrections locales du contrat C-01 à C-06 (module M0) |
