import type { ReactNode } from "react";
import { Bell } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import type { Utilisateur } from "@/api/types";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/Logo";
import type { NavItem } from "./types";
import { UserMenu, type UserMenuProps } from "./UserMenu";

export interface PublicLayoutProps {
  user: Utilisateur | null;
  /** Liens principaux (barre supérieure sur desktop, barre du bas sur mobile). */
  navItems: readonly NavItem[];
  loginPath: string;
  registerPath: string;
  notificationsPath?: string;
  spaceLink?: UserMenuProps["spaceLink"];
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: ReactNode;
}

/**
 * Mise en page de l'espace public et de l'espace client.
 * Desktop : barre supérieure. Mobile : barre supérieure compacte + navigation du bas (maquette Figma).
 */
export function PublicLayout({
  user,
  navItems,
  loginPath,
  registerPath,
  notificationsPath,
  spaceLink,
  onLogout,
  isLoggingOut,
  children,
}: PublicLayoutProps) {
  const { t } = useTranslation();
  const showBottomNav = user !== null && navItems.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-base-100 focus:px-4 focus:py-2 focus:shadow"
      >
        {t("nav.skipToContent")}
      </a>

      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-200/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
          <Logo />

          {user && (
            <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-content"
                        : "text-muted hover:bg-base-100 hover:text-base-content",
                    )
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                {notificationsPath && (
                  <Link
                    to={notificationsPath}
                    aria-label={t("nav.notifications")}
                    className="btn btn-circle size-11 bg-base-100 btn-ghost shadow-sm"
                  >
                    <Bell size={20} aria-hidden="true" />
                  </Link>
                )}
                <UserMenu user={user} spaceLink={spaceLink} onLogout={onLogout} isLoggingOut={isLoggingOut ?? false} />
              </>
            ) : (
              <>
                <Link to={loginPath} className="btn min-h-11 rounded-full btn-ghost px-4 font-semibold">
                  {t("nav.login")}
                </Link>
                <Link to={registerPath} className="btn min-h-11 rounded-full px-5 font-semibold btn-primary">
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="contenu" tabIndex={-1} className={cn("flex-1 outline-none", showBottomNav && "pb-24 md:pb-0")}>
        {children}
      </main>

      <footer className="hidden border-t border-base-300/70 py-8 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm text-muted lg:px-8">
          <span>© {new Date().getFullYear()} Find Me</span>
          <span>{t("app.trust")}</span>
        </div>
      </footer>

      {showBottomNav && (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-base-300 bg-base-100/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          <ul
            className="mx-auto grid max-w-md"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map(({ to, labelKey, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end ?? false}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium",
                      isActive ? "text-primary" : "text-muted",
                    )
                  }
                >
                  <Icon size={22} aria-hidden="true" />
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
