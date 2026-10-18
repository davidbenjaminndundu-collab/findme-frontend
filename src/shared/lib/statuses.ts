import type {
  StatutAnnonce,
  StatutCommande,
  StatutCompte,
  StatutLitige,
  StatutPaiement,
  StatutRetrait,
} from "@/api/types";

/**
 * Les statuts sont des données (dossier technologique §5.1) : libellé, couleur et étape
 * vivent ici, jamais dans le JSX. Chaque table est un Record exhaustif : si le contrat
 * ajoute un statut, la compilation échoue tant qu'il n'est pas décrit.
 */
export type BadgeTone = "neutral" | "info" | "warning" | "success" | "error" | "brand";

export interface StatusMeta {
  /** Clé i18n du libellé. */
  labelKey: string;
  tone: BadgeTone;
}

export interface CommandeStatusMeta extends StatusMeta {
  /** Étape du stepper de suivi (1 à 5), null pour les statuts hors parcours nominal. */
  step: 1 | 2 | 3 | 4 | 5 | null;
  /** Statut final : plus aucune action possible. */
  final: boolean;
}

/** Étapes du parcours nominal d'une commande, affichées par le stepper. */
export const COMMANDE_STEPS = ["demande", "paiement", "realisation", "livraison", "terminee"] as const;

const cmd = (
  key: StatutCommande,
  tone: BadgeTone,
  step: CommandeStatusMeta["step"],
  final = false,
): CommandeStatusMeta => ({ labelKey: `statuts.commande.${key}`, tone, step, final });

export const COMMANDE_STATUS: Readonly<Record<StatutCommande, CommandeStatusMeta>> = {
  en_attente_reponse: cmd("en_attente_reponse", "info", 1),
  informations_demandees: cmd("informations_demandees", "warning", 1),
  refusee: cmd("refusee", "error", null, true),
  en_attente_paiement: cmd("en_attente_paiement", "warning", 2),
  paiement_en_cours: cmd("paiement_en_cours", "info", 2),
  payee: cmd("payee", "success", 3),
  en_cours_realisation: cmd("en_cours_realisation", "brand", 3),
  livree: cmd("livree", "info", 4),
  revision_demandee: cmd("revision_demandee", "warning", 4),
  en_revision: cmd("en_revision", "brand", 4),
  en_litige: cmd("en_litige", "error", null),
  terminee: cmd("terminee", "success", 5, true),
  annulee: cmd("annulee", "neutral", null, true),
  remboursee: cmd("remboursee", "neutral", null, true),
};

const meta = <K extends string>(group: string, tones: Record<K, BadgeTone>): Readonly<Record<K, StatusMeta>> =>
  Object.fromEntries(
    Object.entries<BadgeTone>(tones).map(([key, tone]) => [key, { labelKey: `statuts.${group}.${key}`, tone }]),
  ) as Record<K, StatusMeta>;

export const ANNONCE_STATUS = meta<StatutAnnonce>("annonce", {
  brouillon: "neutral",
  en_attente_validation: "warning",
  publiee: "success",
  refusee: "error",
  desactivee: "neutral",
  supprimee: "neutral",
});

export const PAIEMENT_STATUS = meta<StatutPaiement>("paiement", {
  cree: "neutral",
  en_attente: "info",
  confirme: "success",
  echoue: "error",
  expire: "warning",
  rembourse: "neutral",
});

export const RETRAIT_STATUS = meta<StatutRetrait>("retrait", {
  demande: "info",
  en_verification: "warning",
  approuve: "info",
  en_cours_execution: "brand",
  execute: "success",
  echoue: "error",
  refuse: "error",
});

export const LITIGE_STATUS = meta<StatutLitige>("litige", {
  ouvert: "warning",
  en_analyse: "info",
  informations_demandees: "warning",
  resolu: "success",
  ferme: "neutral",
});

export const COMPTE_STATUS = meta<StatutCompte>("compte", {
  a_verifier: "warning",
  actif: "success",
  suspendu: "warning",
  bloque: "error",
  ferme: "neutral",
});

/** Statuts de paiement définitifs : le polling s'arrête. */
export const PAIEMENT_FINAL: ReadonlySet<StatutPaiement> = new Set(["confirme", "echoue", "expire", "rembourse"]);
