import createClient, { type Middleware } from "openapi-fetch";
import { env } from "@/shared/config/env";
import { ensureXsrfToken, readXsrfToken, refreshCsrfCookie } from "./csrf";
import { networkError, toApiError } from "./errors";
import type { paths } from "./schema";

/**
 * Client HTTP typé, généré depuis le contrat OpenAPI.
 * Seule couche du projet qui parle au réseau (dossier technologique §5.3).
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Copie des écritures, conservée pour un éventuel rejeu après un 419. */
const replayableRequests = new WeakMap<Request, Request>();

type UnauthenticatedHandler = () => void;
let unauthenticatedHandler: UnauthenticatedHandler | null = null;

/** Enregistré par la session : purge locale et redirection vers la connexion. */
export function setUnauthenticatedHandler(handler: UnauthenticatedHandler | null): void {
  unauthenticatedHandler = handler;
}

/** GET /auth/me au démarrage : un 401 signifie simplement « non connecté ». */
const isSessionProbe = (request: Request): boolean =>
  request.method === "GET" && new URL(request.url).pathname.endsWith("/auth/me");

export const sanctumMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set("Accept", "application/json");
    request.headers.set("X-Requested-With", "XMLHttpRequest");

    if (MUTATING_METHODS.has(request.method)) {
      const token = await ensureXsrfToken();
      if (token) request.headers.set("X-XSRF-TOKEN", token);
      replayableRequests.set(request, request.clone());
    }
    return request;
  },

  async onResponse({ request, response }) {
    // 419 : jeton CSRF expiré → nouveau cookie puis UN seul rejeu (le rejeu ne repasse pas ici).
    if (response.status === 419) {
      const copy = replayableRequests.get(request);
      if (copy) {
        replayableRequests.delete(request);
        await refreshCsrfCookie();
        const retry = new Request(copy);
        const token = readXsrfToken();
        if (token) retry.headers.set("X-XSRF-TOKEN", token);
        return fetch(retry);
      }
    }

    if (response.status === 401 && !isSessionProbe(request)) {
      unauthenticatedHandler?.();
    }
    return response;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: env.apiBaseUrl,
  credentials: "include",
});

apiClient.use(sanctumMiddleware);

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Transforme le résultat d'openapi-fetch en données typées, ou lève une ApiError.
 * Usage : const annonce = await unwrap(apiClient.GET("/annonces/{id}", { params }));
 */
export async function unwrap<T>(call: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>;
  try {
    result = await call;
  } catch (cause) {
    throw networkError(cause);
  }

  if (!result.response.ok) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as T;
}
