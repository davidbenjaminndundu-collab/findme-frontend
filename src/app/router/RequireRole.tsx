import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import type { Role } from "@/api/types";
import { useSession } from "@/features/auth/hooks/useSession";
import { loginPathWithRedirect } from "@/features/auth/routing";
import { ErrorState, PageLoader } from "@/shared/ui/Feedback";

export interface RequireRoleProps {
  role: Role;
  children: ReactNode;
}

/**
 * Garde d'accès par rôle (x-roles du contrat).
 * Confort d'interface uniquement : l'autorité reste le backend (403 / 404).
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, isLoading, isError, error, refetch } = useSession();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!user) return <Navigate to={loginPathWithRedirect(location.pathname + location.search)} replace />;
  if (user.role !== role) return <Navigate to="/403" replace />;

  return children;
}
