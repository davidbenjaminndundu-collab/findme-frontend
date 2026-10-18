import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/errors";
import { shouldRetryRead } from "./queryClient";

const error = (kind: ApiError["kind"]) => new ApiError({ kind, message: "" });

describe("shouldRetryRead", () => {
  it("réessaie sur coupure réseau ou erreur serveur", () => {
    expect(shouldRetryRead(0, error("network"))).toBe(true);
    expect(shouldRetryRead(1, error("server"))).toBe(true);
  });

  it("s'arrête après deux tentatives", () => {
    expect(shouldRetryRead(2, error("network"))).toBe(false);
  });

  it.each(["validation", "unauthenticated", "forbidden", "not_found", "conflict"] as const)(
    "ne réessaie jamais une erreur %s",
    (kind) => {
      expect(shouldRetryRead(0, error(kind))).toBe(false);
    },
  );

  it("ne réessaie pas une erreur inconnue", () => {
    expect(shouldRetryRead(0, new Error("x"))).toBe(false);
  });
});
