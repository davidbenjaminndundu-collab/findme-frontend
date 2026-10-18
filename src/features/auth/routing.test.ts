import { describe, expect, it } from "vitest";
import { loginPathWithRedirect, safeRedirect } from "./routing";

describe("safeRedirect", () => {
  it("accepte un chemin interne", () => {
    expect(safeRedirect("/client/commandes?x=1", "/")).toBe("/client/commandes?x=1");
  });

  it.each([null, "", "https://malveillant.example", "//malveillant.example", "javascript:alert(1)"])(
    "refuse %s (redirection ouverte)",
    (target) => {
      expect(safeRedirect(target, "/")).toBe("/");
    },
  );
});

describe("loginPathWithRedirect", () => {
  it("encode la page d'origine", () => {
    expect(loginPathWithRedirect("/admin?onglet=2")).toBe("/connexion?redirect=%2Fadmin%3Fonglet%3D2");
  });
});
