/**
 * Format a yyyy-mm-dd or ISO date string for display as dd-mm-yyyy.
 * Returns "—" if empty/invalid.
 */
export function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  // yyyy-mm-dd
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return value;
}

/**
 * Format a JS Date or ISO string as dd-mm-yyyy hh:mm (AEST).
 */
export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-AU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Australia/Sydney",
    });
  } catch {
    return "—";
  }
}
