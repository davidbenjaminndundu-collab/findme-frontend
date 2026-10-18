import type { PaginationMeta } from "@/api/types";

/** Page courante et nombre de pages à partir du bloc `meta` (limit, offset, total) du contrat. */
export function pageInfo({ limit, offset, total }: PaginationMeta): { current: number; pages: number } {
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(pages, Math.floor(offset / limit) + 1);
  return { current, pages };
}
