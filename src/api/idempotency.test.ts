import { beforeEach, describe, expect, it } from "vitest";
import { getIdempotencyKey, resetIdempotencyKey } from "./idempotency";

beforeEach(() => {
  resetIdempotencyKey("paiement:42");
  resetIdempotencyKey("paiement:43");
});

describe("clés d'idempotence", () => {
  it("renvoie la même clé pour la même intention (double clic, rejeu réseau)", () => {
    const first = getIdempotencyKey("paiement:42");
    expect(getIdempotencyKey("paiement:42")).toBe(first);
  });

  it("génère des UUID distincts pour des intentions différentes", () => {
    const a = getIdempotencyKey("paiement:42");
    const b = getIdempotencyKey("paiement:43");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("conserve la clé dans sessionStorage (survit au rechargement de l'onglet)", () => {
    const key = getIdempotencyKey("paiement:42");
    expect(window.sessionStorage.getItem("findme:idem:paiement:42")).toBe(key);
  });

  it("crée une nouvelle clé après abandon de l'intention", () => {
    const first = getIdempotencyKey("paiement:42");
    resetIdempotencyKey("paiement:42");
    expect(getIdempotencyKey("paiement:42")).not.toBe(first);
  });
});
