import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = "http://api.test";
const BASE = `${ROOT}/api/v1`;

const server = setupServer();

const setCookie = (value: string) => {
  document.cookie = `XSRF-TOKEN=${encodeURIComponent(value)}; path=/`;
};
const clearCookie = () => {
  document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

// Le client lit les URL au chargement du module : on fixe l'environnement puis on l'importe.
async function loadClient() {
  vi.resetModules();
  vi.stubEnv("VITE_API_BASE_URL", BASE);
  vi.stubEnv("VITE_API_ROOT_URL", ROOT);
  return import("./client");
}

const LOGIN_OK = {
  message: "Connexion réussie.",
  utilisateur: {
    id_utilisateur: 1,
    telephone: "+243810000001",
    nom: "Test",
    prenom: "Client",
    role: "client",
    statut_compte: "actif",
  },
};
const LOGIN_BODY = { telephone: "+243810000001", mot_de_passe: "SecurePass123!" };

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
beforeEach(() => clearCookie());
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

describe("apiClient", () => {
  it("demande le cookie CSRF puis envoie X-XSRF-TOKEN sur une écriture", async () => {
    const seen: Record<string, string | null> = {};
    server.use(
      http.get(`${ROOT}/sanctum/csrf-cookie`, () => {
        setCookie("jeton=initial");
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE}/auth/login`, ({ request }) => {
        seen.xsrf = request.headers.get("X-XSRF-TOKEN");
        seen.accept = request.headers.get("Accept");
        seen.requestedWith = request.headers.get("X-Requested-With");
        return HttpResponse.json(LOGIN_OK);
      }),
    );
    const { apiClient, unwrap } = await loadClient();

    const data = await unwrap(apiClient.POST("/auth/login", { body: LOGIN_BODY }));

    expect(data.utilisateur.role).toBe("client");
    expect(seen).toEqual({ xsrf: "jeton=initial", accept: "application/json", requestedWith: "XMLHttpRequest" });
  });

  it("sur 419, renouvelle le cookie et rejoue la requête une seule fois", async () => {
    setCookie("ancien");
    let loginCalls = 0;
    let csrfCalls = 0;
    const tokens: (string | null)[] = [];
    server.use(
      http.get(`${ROOT}/sanctum/csrf-cookie`, () => {
        csrfCalls += 1;
        setCookie("nouveau");
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE}/auth/login`, async ({ request }) => {
        loginCalls += 1;
        tokens.push(request.headers.get("X-XSRF-TOKEN"));
        expect(await request.json()).toEqual(LOGIN_BODY); // le corps est bien rejoué
        return loginCalls === 1
          ? HttpResponse.json({ message: "CSRF token mismatch." }, { status: 419 })
          : HttpResponse.json(LOGIN_OK);
      }),
    );
    const { apiClient, unwrap } = await loadClient();

    await unwrap(apiClient.POST("/auth/login", { body: LOGIN_BODY }));

    expect(loginCalls).toBe(2);
    expect(csrfCalls).toBe(1);
    expect(tokens).toEqual(["ancien", "nouveau"]);
  });

  it("ne rejoue pas indéfiniment : un second 419 remonte en erreur csrf", async () => {
    setCookie("ancien");
    let loginCalls = 0;
    server.use(
      http.get(`${ROOT}/sanctum/csrf-cookie`, () => new HttpResponse(null, { status: 204 })),
      http.post(`${BASE}/auth/login`, () => {
        loginCalls += 1;
        return HttpResponse.json({ message: "CSRF token mismatch." }, { status: 419 });
      }),
    );
    const { apiClient, unwrap } = await loadClient();

    await expect(unwrap(apiClient.POST("/auth/login", { body: LOGIN_BODY }))).rejects.toMatchObject({
      kind: "csrf",
      status: 419,
    });
    expect(loginCalls).toBe(2);
  });

  it("signale un 401 à la session, sauf pour la sonde GET /auth/me", async () => {
    const onUnauthenticated = vi.fn();
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({ error: "unauthenticated", message: "Authentification requise." }, { status: 401 }),
      ),
      http.get(`${BASE}/commandes`, () =>
        HttpResponse.json({ error: "unauthenticated", message: "Authentification requise." }, { status: 401 }),
      ),
    );
    const { apiClient, unwrap, setUnauthenticatedHandler } = await loadClient();
    setUnauthenticatedHandler(onUnauthenticated);

    await expect(unwrap(apiClient.GET("/auth/me"))).rejects.toMatchObject({ kind: "unauthenticated" });
    expect(onUnauthenticated).not.toHaveBeenCalled();

    await expect(unwrap(apiClient.GET("/commandes"))).rejects.toMatchObject({ kind: "unauthenticated" });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("transforme une coupure réseau en erreur network", async () => {
    server.use(http.get(`${BASE}/categories`, () => HttpResponse.error()));
    const { apiClient, unwrap } = await loadClient();

    await expect(unwrap(apiClient.GET("/categories"))).rejects.toMatchObject({ kind: "network" });
  });
});
