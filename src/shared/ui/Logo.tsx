import { Link } from "react-router";
import { cn } from "@/shared/lib/cn";

export interface LogoProps {
  to?: string;
  className?: string;
  /** Variante claire pour les fonds sombres. */
  inverted?: boolean;
}

/** Logotype « FINDME » (maquette 01 Bienvenue). */
export function Logo({ to = "/", className, inverted = false }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg text-xl font-extrabold tracking-[0.18em]",
        inverted ? "text-base-100" : "text-base-content",
        className,
      )}
      aria-label="Find Me, accueil"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-xl bg-brand text-sm font-black tracking-normal text-white shadow-sm shadow-brand/30"
      >
        F
      </span>
      <span>
        FIND<span className="text-brand">ME</span>
      </span>
    </Link>
  );
}
