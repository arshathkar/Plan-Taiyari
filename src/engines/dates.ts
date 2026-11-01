/**
 * Date helpers (§7.8)
 * All dates are YYYY-MM-DD strings. No time-of-day arithmetic.
 */

/** Returns today's date as YYYY-MM-DD in IST. The only clock-reading function. */
export function todayIst(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 * 60 * 1000)); // UTC+5:30
  return ist.toISOString().slice(0, 10);
}

/** Parse a YYYY-MM-DD string into a Date at midnight UTC */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Integer days between two YYYY-MM-DD dates (to - from) */
export function daysBetween(from: string, to: string): number {
  const f = parseDate(from);
  const t = parseDate(to);
  return Math.round((t.getTime() - f.getTime()) / (86400 * 1000));
}

/** Add days to a YYYY-MM-DD date, return YYYY-MM-DD */
export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Format date as "Sat, 20 Dec 2026" */
export function formatDateDisplay(date: string): string {
  const d = parseDate(date);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Check if a date is today or later, and within 3 years */
export function isValidFutureDate(date: string, today: string): boolean {
  const diff = daysBetween(today, date);
  return diff >= 0 && diff <= 1095; // 3 years
}

/** Days from today to a given date (positive = future, negative = past) */
export function daysFromNow(date: string, today: string): number {
  return daysBetween(today, date);
}

/** Format relative days: "in 12 days", "today", "3 days ago" */
export function formatRelativeDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
