import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";
import type { TextInputProps } from "./TextInput";

export function PasswordInput({ invalid, className, ref, ...rest }: Omit<TextInputProps, "type">) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = visible ? t("common.hidePassword") : t("common.showPassword");

  return (
    <label
      className={cn(
        "input h-12 w-full rounded-xl border-base-300 bg-base-100 pr-1 focus-within:border-primary",
        invalid && "input-error",
        className,
      )}
    >
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className="grow text-base"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        className="btn btn-circle size-10 btn-ghost text-muted btn-sm"
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </label>
  );
}
