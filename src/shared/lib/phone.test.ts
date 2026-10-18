import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone, maskPhone, normalizePhone } from "./phone";

describe("isValidPhone", () => {
  it("valide le format du contrat", () => {
    expect(isValidPhone("+243812345678")).toBe(true);
    expect(isValidPhone("+24381234567")).toBe(false);
    expect(isValidPhone("0812345678")).toBe(false);
  });
});

describe("normalizePhone", () => {
  it.each([
    ["812345678", "+243812345678"],
    ["0812345678", "+243812345678"],
    ["243812345678", "+243812345678"],
    ["+243 812 345 678", "+243812345678"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "12345", "+33612345678", "08123456789"])("refuse %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("affichage", () => {
  it("formate par groupes", () => {
    expect(formatPhone("+243812345678")).toBe("+243 812 345 678");
  });

  it("masque le milieu du numéro", () => {
    expect(maskPhone("+243812345678")).toBe("+243 81• ••• 678");
  });
});
