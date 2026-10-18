import { apiClient, unwrap } from "@/api/client";
import { isApiError } from "@/api/errors";
import type { Utilisateur } from "@/api/types";

/**
 * Utilisateur courant (GET /auth/me).
 * Un 401 n'est pas une erreur ici : il signifie « visiteur non connecté ».
 */
export async function fetchCurrentUser(): Promise<Utilisateur | null> {
  try {
    return await unwrap(apiClient.GET("/auth/me"));
  } catch (error) {
    if (isApiError(error) && error.kind === "unauthenticated") return null;
    throw error;
  }
}

export async function logout(): Promise<void> {
  await unwrap(apiClient.POST("/auth/logout"));
}
