import type { components } from "./schema";

/**
 * Alias de lecture sur les types générés. Aucun type métier n'est écrit à la main :
 * tout dérive de schema.d.ts (lui-même généré depuis le contrat).
 */
export type Schemas = components["schemas"];

export type Utilisateur = Schemas["Utilisateur"];
export type Role = Utilisateur["role"];
export type StatutCompte = Utilisateur["statut_compte"];

export type Categorie = Schemas["Categorie"];
export type Annonce = Schemas["Annonce"];
export type StatutAnnonce = Annonce["statut"];
export type ProfilPrestataire = Schemas["ProfilPrestataire"];

export type Commande = Schemas["Commande"];
export type StatutCommande = Commande["statut"];
export type TypeActionCommande = Schemas["CommandeAction"]["type_action"];

export type Paiement = Schemas["Paiement"];
export type StatutPaiement = NonNullable<Paiement["statut"]>;
export type Operateur = Schemas["PaiementCreate"]["operateur"];

export type Retrait = Schemas["Retrait"];
export type StatutRetrait = NonNullable<Retrait["statut"]>;

export type Litige = Schemas["Litige"];
export type StatutLitige = NonNullable<Litige["statut"]>;

export type Notification = Schemas["Notification"];
export type PaginationMeta = Schemas["PaginationMeta"];
