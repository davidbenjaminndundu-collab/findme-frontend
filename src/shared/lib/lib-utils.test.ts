import { describe, expect, it } from "vitest";
import { cn } from "./cn";
import { pageInfo } from "./pagination";
import { initials } from "./text";

describe("pageInfo", () => {
  it("calcule la page courante et le nombre de pages", () => {
    expect(pageInfo({ limit: 20, offset: 0, total: 45 })).toEqual({ current: 1, pages: 3 });
    expect(pageInfo({ limit: 20, offset: 40, total: 45 })).toEqual({ current: 3, pages: 3 });
  });

  it("renvoie une page même pour une liste vide", () => {
    expect(pageInfo({ limit: 20, offset: 0, total: 0 })).toEqual({ current: 1, pages: 1 });
  });
});

describe("initials", () => {
  it.each([
    ["Arthur Manuana", "AM"],
    ["Jean-François Kalilwa Musi", "JM"],
    ["eliane", "E"],
    ["   ", "?"],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe("cn", () => {
  it("ignore les valeurs falsy", () => {
    expect(cn("btn", false, null, undefined, "btn-primary")).toBe("btn btn-primary");
  });
});
