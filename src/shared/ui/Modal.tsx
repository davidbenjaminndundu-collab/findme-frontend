import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" } as const;

/**
 * Modale basée sur <dialog> : piège du focus, touche Échap et retour du focus natifs.
 * Sur mobile, elle s'affiche en feuille depuis le bas (modal-bottom), comme les maquettes.
 */
export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} className="modal modal-bottom sm:modal-middle">
      <div className={cn("modal-box rounded-t-[1.75rem] p-6 sm:rounded-box", SIZE_CLASS[size])}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="btn -mt-1 -mr-2 btn-circle btn-ghost btn-sm"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && <div className="modal-action mt-6">{footer}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" tabIndex={-1} aria-hidden="true">
          {t("common.close")}
        </button>
      </form>
    </dialog>
  );
}
