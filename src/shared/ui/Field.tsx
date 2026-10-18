import { useId, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface FieldRenderProps {
  id: string;
  /** À passer à aria-describedby sur le contrôle. */
  describedBy: string | undefined;
  invalid: boolean;
}

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string | undefined;
  optional?: boolean;
  children: (props: FieldRenderProps) => ReactNode;
}

/** Libellé, aide et message d'erreur reliés au contrôle (accessibilité). */
export function Field({ label, hint, error, optional = false, children }: FieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">({t("common.optional")})</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
