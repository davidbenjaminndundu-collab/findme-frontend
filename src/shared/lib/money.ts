import Decimal from "decimal.js";

/**
 * Montant tel que transporté par le contrat : chaîne décimale ("20.00").
 * Règle du projet : un montant n'est JAMAIS converti en Number.
 * Tous les calculs passent par ce module (decimal.js).
 */
export type Montant = string;

/** Pattern du contrat : ^\d+(?:\.\d{1,2})?$ */
const MONTANT_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export const DEFAULT_CURRENCY = "USD";

export function isMontant(value: string): value is Montant {
  return MONTANT_PATTERN.test(value);
}

function toDecimal(value: Montant): Decimal {
  if (!isMontant(value)) {
    throw new Error(`Montant invalide : "${value}"`);
  }
  return new Decimal(value);
}

/** Normalise vers deux décimales, format du contrat ("20" → "20.00"). */
function toMontant(value: Decimal): Montant {
  return value.toFixed(2, Decimal.ROUND_HALF_UP);
}

export function addMontants(...values: Montant[]): Montant {
  const total = values.reduce((acc, v) => acc.plus(toDecimal(v)), new Decimal(0));
  return toMontant(total);
}

/** a - b. Lève une erreur si le résultat est négatif (un montant du contrat est toujours ≥ 0). */
export function subtractMontants(a: Montant, b: Montant): Montant {
  const result = toDecimal(a).minus(toDecimal(b));
  if (result.isNegative()) {
    throw new Error(`Résultat négatif : ${a} - ${b}`);
  }
  return toMontant(result);
}

/** -1 si a < b, 0 si égaux, 1 si a > b. */
export function compareMontants(a: Montant, b: Montant): -1 | 0 | 1 {
  const cmp = toDecimal(a).comparedTo(toDecimal(b));
  return cmp < 0 ? -1 : cmp > 0 ? 1 : 0;
}

export function normalizeMontant(value: Montant): Montant {
  return toMontant(toDecimal(value));
}

/**
 * Affichage localisé : "20,00 $" en français.
 * Le passage par Number est limité à l'affichage (Intl), jamais au calcul.
 */
export function formatMontant(value: Montant, options: { currency?: string; locale?: string } = {}): string {
  const { currency = DEFAULT_CURRENCY, locale = "fr-FR" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDecimal(value).toNumber());
}
