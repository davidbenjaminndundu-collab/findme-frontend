import type { ReactNode } from "react";
import { AlertTriangle, Inbox, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isApiError } from "@/api/errors";
import { cn } from "@/shared/lib/cn";
import { Button } from "./Button";

/** Chargement d'une page entière ou d'une zone. */
export function PageLoader({ label, className }: { label?: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3", className)}>
      <span className="loading loading-lg loading-spinner text-primary" aria-hidden="true" />
      <span className="text-sm text-muted">{label ?? t("common.loading")}</span>
    </div>
  );
}

/** Bloc squelette pour les chargements de listes et de cartes. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-box bg-base-300/50", className)} />;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        {icon ?? <Inbox size={26} aria-hidden="true" />}
      </span>
      <p className="font-semibold">{title ?? t("common.empty")}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/** Message d'erreur compréhensible, dérivé du type d'ApiError (dossier technologique §5.6). */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const kind = isApiError(error) ? error.kind : "unknown";
  const Icon = kind === "network" ? WifiOff : AlertTriangle;

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-box bg-base-100 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-error/10 text-error">
        <Icon size={26} aria-hidden="true" />
      </span>
      <p className="max-w-md font-medium">{t(`errors.${kind}`)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
