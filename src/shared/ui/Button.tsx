import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25",
  secondary: "btn-secondary",
  outline: "btn-outline border-base-300 bg-base-100 hover:border-primary hover:bg-secondary/40 hover:text-primary",
  ghost: "btn-ghost",
  danger: "btn-error",
};

// Zones tactiles d'au moins 44 px (dossier technologique §12.3).
const SIZE_CLASS: Record<Size, string> = {
  sm: "btn-sm min-h-9 px-4",
  md: "min-h-11 px-6",
  lg: "btn-lg min-h-13 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "btn rounded-full font-semibold tracking-wide transition-all active:scale-[0.98]",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <span className="loading loading-sm loading-spinner" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
