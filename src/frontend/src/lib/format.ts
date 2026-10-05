/**
 * Convert a Motoko nanosecond timestamp (bigint) into a JavaScript Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Convert a JavaScript Date into a Motoko nanosecond timestamp. */
export function dateToTimestamp(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Short month + day label, e.g. "5 Oct". */
export function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Long, accessible date label, e.g. "Monday, 5 October 2026". */
export function longDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format a backend timestamp as a short date, with a fallback for bad values. */
export function formatTimestamp(timestamp: bigint, fallback = "—"): string {
  const date = timestampToDate(timestamp);
  return date ? shortDate(date) : fallback;
}

/** ISO date key (YYYY-MM-DD) in local time, for date inputs. */
export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a YYYY-MM-DD date-input value into a local Date. */
export function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a whole-kilogram quantity, e.g. "120 kg". */
export function formatKg(quantity: bigint): string {
  return `${formatNumber(quantity)} kg`;
}

/** Format an integer with thousands separators. */
export function formatNumber(value: bigint | number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    typeof value === "bigint" ? Number(value) : value,
  );
}

/**
 * Format a currency amount. Backend amounts are stored in whole currency units
 * (e.g. 240 → "$240").
 */
export function formatCurrency(amount: bigint, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/** Format a signed currency amount, e.g. "+$120" or "−$40". */
export function formatSignedCurrency(amount: bigint, currency = "USD"): string {
  const value = Number(amount);
  const formatted = formatCurrency(
    value < 0 ? BigInt(-value) : amount,
    currency,
  );
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

/** Format a 0–100 percentage value, e.g. "35%". */
export function formatPercent(value: number): string {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return `${clamped}%`;
}

/** Truncate a principal for display, e.g. "abcde…wxyz". */
export function shortenPrincipal(principal: string): string {
  if (principal.length <= 14) return principal;
  return `${principal.slice(0, 7)}…${principal.slice(-5)}`;
}

/** Greeting that matches the time of day. */
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
