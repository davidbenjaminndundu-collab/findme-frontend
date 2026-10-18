import { http, HttpResponse } from "msw";
import type { Role } from "@/api/types";
import { MOCK_CATEGORIES, MOCK_USERS } from "./fixtures";

/**
 * Gestionnaires MSW partagés entre le développement sans backend et les tests.
 * Les chemins sont relatifs ("*" couvre l'origine) pour fonctionner derrière le proxy Vite.
 */
const API = "*/api/v1";

/** Rôle simulé en développement : localStorage « findme:mock-role » = client | prestataire | administrateur. */
const MOCK_ROLE_KEY = "findme:mock-role";

function readMockRole(): Role | null {
  try {
    const value = window.localStorage.getItem(MOCK_ROLE_KEY);
    return value === "client" || value === "prestataire" || value === "administrateur" ? value : null;
  } catch {
    return null;
  }
}

function clearMockRole(): void {
  try {
    window.localStorage.removeItem(MOCK_ROLE_KEY);
  } catch {
    // stockage indisponible : rien à purger
  }
}

const unauthenticated = () =>
  HttpResponse.json({ error: "unauthenticated", message: "Authentification requise." }, { status: 401 });

export const handlers = [
  http.get(
    "*/sanctum/csrf-cookie",
    () => new HttpResponse(null, { status: 204, headers: { "Set-Cookie": "XSRF-TOKEN=mock-xsrf-token; Path=/" } }),
  ),

  http.get(`${API}/auth/me`, () => {
    const role = readMockRole();
    return role ? HttpResponse.json(MOCK_USERS[role]) : unauthenticated();
  }),

  http.post(`${API}/auth/logout`, () => {
    clearMockRole();
    return HttpResponse.json({ message: "Déconnexion réussie." });
  }),

  http.get(`${API}/categories`, () => HttpResponse.json([...MOCK_CATEGORIES])),
];
