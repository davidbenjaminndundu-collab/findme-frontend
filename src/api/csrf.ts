import { env } from "@/shared/config/env";

/**
 * Protection CSRF Laravel Sanctum (mode SPA).
 * - GET /sanctum/csrf-cookie (racine du serveur, pas /api/v1) pose le cookie XSRF-TOKEN.
 * - Chaque écriture renvoie sa valeur décodée dans l'en-tête X-XSRF-TOKEN.
 */
const XSRF_COOKIE = "XSRF-TOKEN";

export function readXsrfToken(cookieString: string = document.cookie): string | null {
  for (const part of cookieString.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === XSRF_COOKIE) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

let pending: Promise<void> | null = null;

/** Demande un nouveau cookie CSRF. Les appels simultanés partagent la même requête. */
export function refreshCsrfCookie(fetchImpl: typeof fetch = fetch): Promise<void> {
  pending ??= fetchImpl(`${env.apiRootUrl}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`csrf-cookie: HTTP ${response.status}`);
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** Garantit la présence du cookie avant une écriture et renvoie le jeton. */
export async function ensureXsrfToken(fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const existing = readXsrfToken();
  if (existing) return existing;
  await refreshCsrfCookie(fetchImpl);
  return readXsrfToken();
}
