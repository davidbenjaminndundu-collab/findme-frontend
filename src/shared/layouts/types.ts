import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  /** Clé i18n du libellé. */
  labelKey: string;
  icon: LucideIcon;
  /** Correspondance exacte du chemin (pour les routes index). */
  end?: boolean;
}
