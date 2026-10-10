/**
 * Formats a date as dd/mm/yyyy.
 *
 * `toLocaleDateString()` with no locale follows the browser's locale, so the same
 * timestamp renders as 11/10/2026 in one browser and 10/11/2026 in another.
 * Pinning the order keeps every date in the dashboard unambiguous.
 */
export function formatDate(value?: string | null, fallback = "—") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}