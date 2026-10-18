import { describe, expect, it } from "vitest";
import { kindFromStatus, toApiError } from "./errors";

describe("kindFromStatus", () => {
  it.each([
    [400, "validation"],
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [419, "csrf"],
    [422, "validation"],
    [429, "rate_limited"],
    [503, "server"],
    [418, "unknown"],
  ] as const)("%i → %s", (status, kind) => {
    expect(kindFromStatus(status)).toBe(kind);
  });
});

describe("toApiError", () => {
  it("lit le format du contrat avec details en objet (champ → messages)", () => {
    const error = toApiError(422, {
      error: "validation_error",
      message: "Les données fournies sont invalides.",
      details: { telephone: ["Format invalide."], mot_de_passe: ["Trop court."] },
    });

    expect(error.kind).toBe("validation");
    expect(error.code).toBe("validation_error");
    expect(error.fieldErrors).toEqual({ telephone: ["Format invalide."], mot_de_passe: ["Trop court."] });
    expect(error.globalMessages).toEqual([]);
  });

  it("accepte details en tableau (exemple ambigu du contrat, revue A2)", () => {
    const error = toApiError(422, { error: "validation_error", message: "x", details: ["Champ invalide."] });
    expect(error.fieldErrors).toEqual({});
    expect(error.globalMessages).toEqual(["Champ invalide."]);
  });

  it("accepte le format natif Laravel (errors)", () => {
    const error = toApiError(422, { message: "x", errors: { email: ["Déjà utilisé."] } });
    expect(error.fieldErrors).toEqual({ email: ["Déjà utilisé."] });
  });

  it("résiste à un corps vide ou non JSON", () => {
    const error = toApiError(500, undefined);
    expect(error.kind).toBe("server");
    expect(error.code).toBeNull();
    expect(error.message).toBe("");
  });
});
