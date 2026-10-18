import { LogOut } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Utilisateur } from "@/api/types";
import { Avatar } from "@/shared/ui/Avatar";

export interface UserMenuProps {
  user: Utilisateur;
  /** Lien vers l'espace du rôle (omis si l'on y est déjà). */
  spaceLink?: { to: string; label: string } | undefined;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function UserMenu({ user, spaceLink, onLogout, isLoggingOut = false }: UserMenuProps) {
  const { t } = useTranslation();
  const fullName = `${user.prenom} ${user.nom}`;

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        className="btn h-11 gap-2 rounded-full btn-ghost px-1.5 pr-3"
        aria-label={`${t("nav.profile")} : ${fullName}`}
      >
        <Avatar name={fullName} src={user.image_profil ?? null} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium md:inline">{user.prenom}</span>
      </button>
      <ul className="menu dropdown-content z-30 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
        <li className="menu-title px-3 py-2">
          <span className="truncate text-sm font-semibold text-base-content">{fullName}</span>
          <span className="text-xs font-normal text-muted">
            {t(`spaces.${user.role === "administrateur" ? "admin" : user.role}`)}
          </span>
        </li>
        {spaceLink && (
          <li>
            <Link to={spaceLink.to}>{spaceLink.label}</Link>
          </li>
        )}
        <li>
          <button type="button" onClick={onLogout} disabled={isLoggingOut} className="text-error">
            <LogOut size={16} aria-hidden="true" />
            {t("nav.logout")}
          </button>
        </li>
      </ul>
    </div>
  );
}
