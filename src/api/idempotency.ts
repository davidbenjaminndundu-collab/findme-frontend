/**
 * Clés d'idempotence (en-tête Idempotency-Key) pour les opérations financières.
 * Règle (dossier technologique §8.2) : une clé par INTENTION, pas par clic.
 * La même clé est renvoyée en cas de double clic ou de rejeu réseau ; une nouvelle clé
 * n'est créée que pour une nouvelle intention (autre opérateur, nouvelle tentative après échec).
 * Stockage : sessionStorage (survit au rechargement de l'onglet, jamais au-delà de la session).
 */
const PREFIX = "findme:idem:";

const safeStorage = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const memory = new Map<string, string>();

/** Renvoie la clé de l'intention `scope` (ex. "paiement:42"), en la créant si besoin. */
export function getIdempotencyKey(scope: string): string {
  const storageKey = PREFIX + scope;
  const stored = memory.get(storageKey) ?? safeStorage()?.getItem(storageKey) ?? null;
  if (stored) return stored;

  const key = crypto.randomUUID();
  memory.set(storageKey, key);
  try {
    safeStorage()?.setItem(storageKey, key);
  } catch {
    // Stockage indisponible (navigation privée) : la clé reste en mémoire.
  }
  return key;
}

/** Abandonne l'intention : la prochaine tentative utilisera une nouvelle clé. */
export function resetIdempotencyKey(scope: string): void {
  const storageKey = PREFIX + scope;
  memory.delete(storageKey);
  try {
    safeStorage()?.removeItem(storageKey);
  } catch {
    // ignoré
  }
}
