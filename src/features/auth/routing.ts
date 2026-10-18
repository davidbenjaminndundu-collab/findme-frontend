import type { Role } from "@/api/types";

/** Page d'arrivée de chaque rôle après connexion. */
export const HOME_BY_ROLE: Readonly<Record<Role, string>> = {
  client: "/",
  prestataire: "/prestataire",
  administrateur: "/admin",
};

export const LOGIN_PATH = "/connexion";
export const REGISTER_PATH = "/inscription";

/** Lien vers la connexion avec retour à la page d'origine. */
export function loginPathWithRedirect(from: string): string {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(from)}`;
}

/** N'accepte qu'un chemin interne, pour éviter une redirection ouverte vers un site externe. */
export function safeRedirect(target: string | null, fallback: string): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}
