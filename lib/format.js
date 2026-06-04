/**
 * Format in-game phone as (xxx)xxx-xxxx (10-digit US-style).
 */
export function formatPhone(raw) {
  if (raw == null || raw === "") return null;

  const digits = String(raw).replace(/\D/g, "");
  const normalized =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)})${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  return String(raw).trim();
}
