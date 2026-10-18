import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import {
  ANNONCE_STATUS,
  COMMANDE_STATUS,
  COMPTE_STATUS,
  LITIGE_STATUS,
  PAIEMENT_STATUS,
  RETRAIT_STATUS,
  type StatusMeta,
} from "./statuses";

const tables: Record<string, Readonly<Record<string, StatusMeta>>> = {
  commande: COMMANDE_STATUS,
  annonce: ANNONCE_STATUS,
  paiement: PAIEMENT_STATUS,
  retrait: RETRAIT_STATUS,
  litige: LITIGE_STATUS,
  compte: COMPTE_STATUS,
};

describe("tables de statuts", () => {
  it.each(Object.entries(tables))("chaque statut %s a un libellé français", (_name, table) => {
    for (const meta of Object.values(table)) {
      expect(i18n.exists(meta.labelKey), meta.labelKey).toBe(true);
    }
  });

  it("couvre les 14 statuts de commande du contrat", () => {
    expect(Object.keys(COMMANDE_STATUS)).toHaveLength(14);
  });

  it("marque les statuts finaux de commande", () => {
    const finals = Object.entries(COMMANDE_STATUS)
      .filter(([, meta]) => meta.final)
      .map(([key]) => key)
      .sort();
    expect(finals).toEqual(["annulee", "refusee", "remboursee", "terminee"]);
  });
});
