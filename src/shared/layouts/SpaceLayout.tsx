import { useId, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import type { Utilisateur } from "@/api/types";
import { cn } from "@/shared/lib/cn";
import { formatPhone } from "@/shared/lib/phone";
import { Avatar } from "@/shared/ui/Avatar";
import { Logo } from "@/shared/ui/Logo";
import type { NavItem } from "./types";

export interface SpaceLayoutProps {
  /** Libellé de l'espace, ex. « Espace prestataire ». */
  title: string;
  user: Utilisateur;
  navItems: readonly NavItem[];
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: ReactNode;
}

/**
 * Mise en page des espaces de travail (prestataire, administration).
 * Desktop : barre latérale fixe. Mobile et tablette : barre supérieure + tiroir.
 */
export function SpaceLayout({ title, user, navItems, onLogout, isLoggingOut = false, children }: SpaceLayoutProps) {
  const { t } = useTranslation();
  const drawerId = useId();
  const fullName = `${user.prenom} ${user.nom}`;

  const closeDrawer = () => {
    const toggle = document.getElementById(drawerId);
    if (toggle instanceof HTMLInputElement) toggle.checked = false;
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id={drawerId} type="checkbox" className="drawer-toggle" aria-label="Menu" />

      <div className="drawer-content flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-base-300/70 bg-base-200/85 px-4 backdrop-blur-md lg:hidden">
          <label htmlFor={drawerId} className="btn btn-circle size-11 btn-ghost" aria-label="Ouvrir le menu">
            <Menu size={22} aria-hidden="true" />
          </label>
          <Logo />
        </header>
        <main id="contenu" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      <div className="drawer-side z-30">
        <label htmlFor={drawerId} aria-label={t("common.close")} className="drawer-overlay" />
        <aside className="flex min-h-full w-72 flex-col border-r border-base-300/70 bg-base-100 px-4 py-6">
          <div className="px-2">
            <Logo />
            <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-muted uppercase">{title}</p>
          </div>

          <nav aria-label={title} className="mt-3 flex-1">
            <ul className="flex flex-col gap-1">
              {navItems.map(({ to, labelKey, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end ?? false}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      cn(
                        "relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-secondary text-secondary-content before:absolute before:inset-y-2 before:-left-4 before:w-1 before:rounded-r-full before:bg-primary"
                          : "text-muted hover:bg-base-200 hover:text-base-content",
                      )
                    }
                  >
                    <Icon size={19} aria-hidden="true" />
                    {t(labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 flex items-center gap-3 rounded-box bg-base-200 p-3">
            <Avatar name={fullName} src={user.image_profil ?? null} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted">{formatPhone(user.telephone)}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label={t("nav.logout")}
              title={t("nav.logout")}
              className="btn btn-circle size-10 btn-ghost text-muted hover:text-error"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
