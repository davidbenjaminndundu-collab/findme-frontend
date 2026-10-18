import type { ChangeEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { PHONE_PREFIX } from "@/shared/lib/phone";
import type { TextInputProps } from "./TextInput";

export interface PhoneInputProps extends Omit<TextInputProps, "type" | "value" | "onChange" | "defaultValue"> {
  /** Valeur au format du contrat (+243XXXXXXXXX) ou partielle pendant la saisie. */
  value: string;
  onChange: (value: string) => void;
}

const NATIONAL_LENGTH = 9;

/** Préfixe +243 fixe ; l'utilisateur saisit les 9 chiffres nationaux (maquette Figma). */
export function PhoneInput({ value, onChange, invalid, className, ref, ...rest }: PhoneInputProps) {
  const national = value.startsWith(PHONE_PREFIX) ? value.slice(PHONE_PREFIX.length) : value;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Tolère la saisie d'un 0 initial ("0812...") ou d'un numéro complet collé.
    let digits = event.target.value.replace(/\D/g, "");
    if (digits.startsWith("243") && digits.length > NATIONAL_LENGTH) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    onChange(`${PHONE_PREFIX}${digits.slice(0, NATIONAL_LENGTH)}`);
  };

  return (
    <label
      className={cn(
        "input h-12 w-full rounded-xl border-base-300 bg-base-100 focus-within:border-primary",
        invalid && "input-error",
        className,
      )}
    >
      <span className="border-r border-base-300 pr-3 font-medium text-muted">{PHONE_PREFIX}</span>
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="812345678"
        maxLength={NATIONAL_LENGTH + 3}
        value={national}
        onChange={handleChange}
        aria-invalid={invalid || undefined}
        className="grow text-base tracking-wide"
        {...rest}
      />
    </label>
  );
}
