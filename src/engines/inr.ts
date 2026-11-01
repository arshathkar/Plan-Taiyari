/**
 * Indian Rupee parser and formatter (§7.8)
 * Parses Indian shorthand like "1 lakh", "80k", "₹1,00,000" into integer rupees.
 */

const UNIT_MAP: Record<string, number> = {
  k: 1_000, thousand: 1_000,
  l: 100_000, lakh: 100_000, lakhs: 100_000, lac: 100_000, lacs: 100_000,
  cr: 10_000_000, crore: 10_000_000, crores: 10_000_000,
};

const MAX_AMOUNT = 100_00_00_000; // ₹100 crore

/**
 * Parse an Indian-style amount string into integer rupees.
 * Returns null if the input is invalid.
 */
export function parseInr(input: string): number | null {
  if (!input || typeof input !== 'string') return null;

  // Clean: trim, lowercase, remove ₹/Rs/INR prefix, trailing /- or "only"
  let s = input.trim().toLowerCase();
  s = s.replace(/^[₹]?\s*/, '');
  s = s.replace(/^rs\.?\s*/i, '');
  s = s.replace(/^inr\s*/i, '');
  s = s.replace(/\s+only\s*$/i, '');
  s = s.replace(/\/-\s*$/, '');
  s = s.replace(/\s+only\s*$/i, '');
  s = s.trim();

  if (!s) return null;

  // Extract number and optional unit
  // Match: optional commas in number, optional decimal, optional unit
  const match = s.match(
    /^([0-9][0-9,]*\.?\d*)\s*(k|thousand|l|lakh|lakhs|lac|lacs|cr|crore|crores)?\s*$/
  );

  if (!match) return null;

  // Parse the numeric part (remove commas)
  const numStr = match[1].replace(/,/g, '');
  const num = parseFloat(numStr);

  if (isNaN(num) || num < 0) return null;

  // Apply unit multiplier
  const unit = match[2];
  const multiplier = unit ? UNIT_MAP[unit] : 1;
  if (!multiplier) return null;

  const result = Math.round(num * multiplier);

  // Validate range
  if (result <= 0 || result > MAX_AMOUNT) return null;

  return result;
}

/** Format integer rupees in en-IN style: ₹1,00,000 */
export function formatInr(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN').format(amount);
}

/** Format as compact: ₹1L, ₹80K, ₹2Cr */
export function formatInrCompact(amount: number): string {
  if (amount >= 10_000_000) {
    const cr = amount / 10_000_000;
    return '₹' + (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)) + 'Cr';
  }
  if (amount >= 100_000) {
    const l = amount / 100_000;
    return '₹' + (l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)) + 'L';
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return '₹' + (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K';
  }
  return formatInr(amount);
}

/** Format a percentage with at most one decimal */
export function formatPct(value: number): string {
  return value % 1 === 0 ? `${value}%` : `${value.toFixed(1)}%`;
}
