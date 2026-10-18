import { describe, expect, it } from "vitest";
import { addMontants, compareMontants, formatMontant, isMontant, normalizeMontant, subtractMontants } from "./money";

describe("isMontant", () => {
  it.each(["0", "20", "20.5", "20.00", "1500.99"])("accepte %s", (v) => {
    expect(isMontant(v)).toBe(true);
  });

  it.each(["", "-1", "20.", "20.123", "1e3", "20,00", " 20"])("refuse %s", (v) => {
    expect(isMontant(v)).toBe(false);
  });
});

describe("calculs exacts", () => {
  it("additionne sans erreur de virgule flottante", () => {
    expect(addMontants("0.10", "0.20")).toBe("0.30");
  });

  it("répartit un litige sans perte (12.00 + 8.00 = 20.00)", () => {
    expect(addMontants("12.00", "8.00")).toBe("20.00");
    expect(subtractMontants("20.00", "12.00")).toBe("8.00");
  });

  it("refuse un résultat négatif", () => {
    expect(() => subtractMontants("5.00", "10.00")).toThrow();
  });

  it("compare deux montants", () => {
    expect(compareMontants("10.00", "9.99")).toBe(1);
    expect(compareMontants("10", "10.00")).toBe(0);
    expect(compareMontants("0.01", "1")).toBe(-1);
  });

  it("normalise au format du contrat", () => {
    expect(normalizeMontant("20")).toBe("20.00");
    expect(normalizeMontant("20.5")).toBe("20.50");
  });

  it("lève une erreur sur un montant invalide", () => {
    expect(() => addMontants("abc")).toThrow(/Montant invalide/);
  });
});

describe("formatMontant", () => {
  it("affiche en français avec le symbole $", () => {
    // Intl insère des espaces insécables : on les normalise pour la comparaison.
    expect(formatMontant("20.00").replace(/\s/g, " ")).toBe("20,00 $");
    expect(formatMontant("1500").replace(/\s/g, " ")).toBe("1 500,00 $");
  });
});
