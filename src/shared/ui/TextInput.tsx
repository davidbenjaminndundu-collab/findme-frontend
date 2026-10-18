import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/shared/lib/cn";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

const inputClass = (invalid: boolean | undefined, className?: string) =>
  cn(
    "input h-12 w-full rounded-xl border-base-300 bg-base-100 text-base transition-colors",
    "placeholder:text-muted/70 focus-within:border-primary focus:border-primary",
    invalid && "input-error",
    className,
  );

export function TextInput({ invalid, className, ref, ...rest }: TextInputProps) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={inputClass(invalid, className)} {...rest} />;
}
