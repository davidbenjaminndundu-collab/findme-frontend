import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PaginationMeta } from "@/api/types";
import { pageInfo } from "@/shared/lib/pagination";

export interface PaginationProps {
  /** Bloc `meta` renvoyé par toutes les listes du contrat (limit, offset, total). */
  meta: PaginationMeta;
  onOffsetChange: (offset: number) => void;
}

export function Pagination({ meta, onOffsetChange }: PaginationProps) {
  const { t } = useTranslation();
  const { current, pages } = pageInfo(meta);
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      <button
        type="button"
        className="btn btn-circle border-base-300 btn-outline btn-sm"
        disabled={current <= 1}
        onClick={() => onOffsetChange(Math.max(0, meta.offset - meta.limit))}
        aria-label={t("common.previous")}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <span className="text-sm text-muted" aria-live="polite">
        {t("common.page", { current, total: pages })}
      </span>
      <button
        type="button"
        className="btn btn-circle border-base-300 btn-outline btn-sm"
        disabled={current >= pages}
        onClick={() => onOffsetChange(meta.offset + meta.limit)}
        aria-label={t("common.next")}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
