import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { HOME_BY_ROLE, LOGIN_PATH, REGISTER_PATH } from "@/features/auth/routing";
import { PublicLayout } from "@/shared/layouts/PublicLayout";
import { SpaceLayout } from "@/shared/layouts/SpaceLayout";
import { PageLoader } from "@/shared/ui/Feedback";
import { ADMIN_NAV, CLIENT_NAV, PRESTATAIRE_NAV } from "./navigation";
import { RequireRole } from "./RequireRole";

/** Espace public et espace client : même coquille (barre supérieure / navigation du bas). */
export function PublicShell() {
  const { t } = useTranslation();
  const { user } = useSession();
  const logout = useLogout();

  const isClient = user?.role === "client";
  const spaceLink =
    user && !isClient
      ? { to: HOME_BY_ROLE[user.role], label: t(user.role === "prestataire" ? "spaces.prestataire" : "spaces.admin") }
      : undefined;

  return (
    <PublicLayout
      user={user}
      navItems={isClient ? CLIENT_NAV : []}
      loginPath={LOGIN_PATH}
      registerPath={REGISTER_PATH}
      {...(isClient ? { notificationsPath: "/client/notifications" } : {})}
      spaceLink={spaceLink}
      onLogout={() => logout.mutate()}
      isLoggingOut={logout.isPending}
    >
      <Outlet />
    </PublicLayout>
  );
}

export function ClientGuard() {
  return (
    <RequireRole role="client">
      <Outlet />
    </RequireRole>
  );
}

function WorkspaceShell({ space }: { space: "prestataire" | "admin" }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const logout = useLogout();

  // RequireRole garantit la présence de l'utilisateur ; garde défensive pour le typage.
  if (!user) return <PageLoader />;

  return (
    <SpaceLayout
      title={t(`spaces.${space}`)}
      user={user}
      navItems={space === "prestataire" ? PRESTATAIRE_NAV : ADMIN_NAV}
      onLogout={() => logout.mutate()}
      isLoggingOut={logout.isPending}
    >
      <Outlet />
    </SpaceLayout>
  );
}

export function PrestataireShell() {
  return (
    <RequireRole role="prestataire">
      <WorkspaceShell space="prestataire" />
    </RequireRole>
  );
}

export function AdminShell() {
  return (
    <RequireRole role="administrateur">
      <WorkspaceShell space="admin" />
    </RequireRole>
  );
}
