/**
 * Formatters pour affichage compact de nombres financiers.
 *
 * Inspires des conventions Yahoo Finance / Seeking Alpha 2026 :
 * - Capitalisations : $2.62B, $485M, $5.06T
 * - Volumes / Shares : 85.5M, 1.2B
 */

/**
 * Formate une capitalisation boursiere avec suffixe (T/B/M/K) et symbole monetaire.
 *
 * Exemples :
 *   formatMarketCap(2_619_011_840) -> "$2.62B"
 *   formatMarketCap(485_000_000)   -> "$485M"
 *   formatMarketCap(5_062_000_000_000) -> "$5.06T"
 *   formatMarketCap(null) -> "-"
 */
export function formatMarketCap(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";

  const absVal = Math.abs(value);

  if (absVal >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (absVal >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (absVal >= 1e6) {
    return `$${(value / 1e6).toFixed(0)}M`;
  }
  if (absVal >= 1e3) {
    return `$${(value / 1e3).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Formate un nombre d'actions avec suffixe (B/M/K).
 *
 * Exemples :
 *   formatShares(85_560_660) -> "85.6M"
 *   formatShares(14_681_140_000) -> "14.7B"
 *   formatShares(null) -> "-"
 */
export function formatShares(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";

  const absVal = Math.abs(value);

  if (absVal >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (absVal >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (absVal >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
