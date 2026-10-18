import { useQuery } from "@tanstack/react-query";
import type { Utilisateur } from "@/api/types";
import { fetchCurrentUser } from "../api/session";

/** Clé de cache unique de la session : invalidée à la connexion, purgée à la déconnexion. */
export const sessionQueryKey = ["auth", "me"] as const;

const FIVE_MINUTES = 5 * 60 * 1000;

export interface SessionState {
  user: Utilisateur | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Source de vérité de la session côté front : le cache TanStack Query de GET /auth/me.
 * Aucun jeton n'est stocké (cookie HttpOnly géré par le navigateur).
 */
export function useSession(): SessionState {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: FIVE_MINUTES,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}
