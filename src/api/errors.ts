/**
 * Traduction des réponses d'erreur du contrat en une erreur unique côté front.
 * Format du contrat : { error: string, message: string, details?: ... }.
 * `details` est ambigu (revue A2) : objet { champ: [messages] } ou tableau de messages.
 * Le format natif Laravel { message, errors: { champ: [messages] } } est aussi accepté.
 */
export type ApiErrorKind =
  | "unauthenticated" // 401
  | "forbidden" // 403
  | "not_found" // 404
  | "conflict" // 409
  | "csrf" // 419
  | "validation" // 400, 422
  | "rate_limited" // 429
  | "server" // 5xx
  | "network" // pas de réponse
  | "unknown";

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  /** Code renvoyé par le backend (`error`), ex. "validation_error", "solde_insuffisant". */
  readonly code: string | null;
  readonly fieldErrors: FieldErrors;
  /** Messages non rattachés à un champ. */
  readonly globalMessages: readonly string[];

  constructor(params: {
    kind: ApiErrorKind;
    message: string;
    status?: number | null;
    code?: string | null;
    fieldErrors?: FieldErrors;
    globalMessages?: readonly string[];
  }) {
    super(params.message);
    this.name = "ApiError";
    this.kind = params.kind;
    this.status = params.status ?? null;
    this.code = params.code ?? null;
    this.fieldErrors = params.fieldErrors ?? {};
    this.globalMessages = params.globalMessages ?? [];
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 419) return "csrf";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" ? [v] : [];

function parseDetails(details: unknown): { fieldErrors: FieldErrors; globalMessages: string[] } {
  if (Array.isArray(details)) {
    return { fieldErrors: {}, globalMessages: toStringArray(details) };
  }
  if (isRecord(details)) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(details)) {
      const list = toStringArray(messages);
      if (list.length > 0) fieldErrors[field] = list;
    }
    return { fieldErrors, globalMessages: [] };
  }
  return { fieldErrors: {}, globalMessages: [] };
}

/** Construit une ApiError à partir du statut HTTP et du corps (déjà parsé ou non). */
export function toApiError(status: number, body: unknown): ApiError {
  const kind = kindFromStatus(status);
  const record = isRecord(body) ? body : {};
  const code = typeof record.error === "string" ? record.error : null;
  const message = typeof record.message === "string" ? record.message : "";
  const { fieldErrors, globalMessages } = parseDetails(record.details ?? record.errors);

  return new ApiError({ kind, status, code, message, fieldErrors, globalMessages });
}

export function networkError(cause?: unknown): ApiError {
  const error = new ApiError({ kind: "network", message: "Connexion au serveur impossible." });
  if (cause !== undefined) Object.defineProperty(error, "cause", { value: cause });
  return error;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
