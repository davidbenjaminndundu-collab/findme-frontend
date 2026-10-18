/**
 * Téléphones au format du contrat : ^\+243[0-9]{9}$ (RDC).
 */
export const PHONE_PREFIX = "+243";
const PHONE_PATTERN = /^\+243[0-9]{9}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value);
}

/**
 * Convertit une saisie libre vers le format du contrat.
 * Accepte "812345678", "0812345678", "243812345678", "+243 812 345 678".
 * Retourne null si la saisie ne peut pas devenir un numéro valide.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national: string;

  if (digits.length === 12 && digits.startsWith("243")) {
    national = digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  } else {
    return null;
  }

  const phone = `${PHONE_PREFIX}${national}`;
  return isValidPhone(phone) ? phone : null;
}

/** "+243812345678" → "+243 812 345 678" (affichage). */
export function formatPhone(phone: string): string {
  if (!isValidPhone(phone)) return phone;
  const n = phone.slice(PHONE_PREFIX.length);
  return `${PHONE_PREFIX} ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

/** "+243812345678" → "+243 81• ••• 678" : ne jamais afficher un numéro complet hors de son propriétaire. */
export function maskPhone(phone: string): string {
  if (!isValidPhone(phone)) return phone;
  const n = phone.slice(PHONE_PREFIX.length);
  return `${PHONE_PREFIX} ${n.slice(0, 2)}• ••• ${n.slice(6)}`;
}
