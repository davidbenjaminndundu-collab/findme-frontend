import { cn } from "@/shared/lib/cn";
import { initials } from "@/shared/lib/text";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
};

export interface AvatarProps {
  name: string;
  /** URL de photo ; absente du contrat public pour les prestataires (écart E05) → initiales. */
  src?: string | null;
  size?: Size;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={cn("shrink-0 rounded-full object-cover", SIZE_CLASS[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-content",
        SIZE_CLASS[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
