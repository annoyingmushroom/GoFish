// Trip dates are stored as ISO "yyyy-mm-dd" (sortable, locale-independent).
// These helpers also parse the older "12 Jun 2026" display strings that earlier
// versions stored, so existing trips keep working without a migration.

// Local-date ISO string (avoids the UTC day-shift you get from toISOString()).
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse a stored trip date (ISO or legacy) into a local Date, or null.
export function parseTripDate(stored: string): Date | null {
  if (!stored) return null;
  const iso = stored.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const d = new Date(stored);
  return isNaN(d.getTime()) ? null : d;
}

// Format a stored trip date for display, e.g. "12 Jun 2026".
export function formatTripDate(stored: string): string {
  const d = parseTripDate(stored);
  if (!d) return stored || "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Sort key (epoch ms) for ordering trips newest-first by their actual date.
export function tripDateSortKey(stored: string): number {
  const d = parseTripDate(stored);
  return d ? d.getTime() : 0;
}
