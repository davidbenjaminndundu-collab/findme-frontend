import type { Categorie, Role, Utilisateur } from "@/api/types";

/** Données fictives, typées sur le contrat : si un schéma change, ces fixtures ne compilent plus. */
export const MOCK_USERS: Readonly<Record<Role, Utilisateur>> = {
  client: {
    id_utilisateur: 1,
    telephone: "+243810000001",
    nom: "Manuana",
    prenom: "Arthur",
    postnom: null,
    email: null,
    role: "client",
    image_profil: null,
    statut_compte: "actif",
  },
  prestataire: {
    id_utilisateur: 2,
    telephone: "+243810000002",
    nom: "Kalilwa",
    prenom: "François",
    postnom: null,
    email: "francois@example.test",
    role: "prestataire",
    image_profil: null,
    statut_compte: "actif",
  },
  administrateur: {
    id_utilisateur: 3,
    telephone: "+243810000003",
    nom: "Lukusa",
    prenom: "Eliane",
    postnom: null,
    email: "admin@example.test",
    role: "administrateur",
    image_profil: null,
    statut_compte: "actif",
  },
};

export const MOCK_CATEGORIES: readonly Categorie[] = [
  {
    id_categorie: 1,
    nom: "Design",
    description: "Logos, identité visuelle, supports",
    icone: "palette",
    est_active: true,
  },
  { id_categorie: 2, nom: "Développement", description: "Sites, applications", icone: "code", est_active: true },
  { id_categorie: 3, nom: "Rédaction", description: "Articles, SEO, traduction", icone: "pen", est_active: true },
  { id_categorie: 4, nom: "Vidéo", description: "Montage, motion design", icone: "video", est_active: true },
  {
    id_categorie: 5,
    nom: "Marketing",
    description: "Réseaux sociaux, publicité",
    icone: "megaphone",
    est_active: true,
  },
];
