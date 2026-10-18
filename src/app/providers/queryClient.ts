import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/errors";

const MAX_READ_RETRIES = 2;

/**
 * Lectures : nouvelle tentative limitée, uniquement sur coupure réseau ou erreur serveur
 * (jamais sur une erreur 4xx). Écritures : aucune nouvelle tentative automatique
 * (les opérations financières reposent sur une clé d'idempotence explicite).
 */
export function shouldRetryRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_READ_RETRIES) return false;
  return isApiError(error) && (error.kind === "network" || error.kind === "server");
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryRead,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
