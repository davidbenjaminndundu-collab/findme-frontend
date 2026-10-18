import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";
import type { BadgeTone, StatusMeta } from "@/shared/lib/statuses";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-base-300/60 text-base-content",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  brand: "bg-secondary text-secondary-content",
};

export interface StatusBadgeProps {
  /** Entrée d'une table de shared/lib/statuses.ts, ex. COMMANDE_STATUS[commande.statut]. */
  status: StatusMeta;
  className?: string;
}

/** Pastille de statut : couleur et texte, jamais la couleur seule (accessibilité). */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLASS[status.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(status.labelKey)}
    </span>
  );
}
