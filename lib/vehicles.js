import labels from "./vehicle-labels.json";

/**
 * In-game display name from Qbox vehicles.lua (brand + name).
 * Regenerate: npm run generate:vehicles
 */
export function getVehicleDisplayName(spawnCode) {
  if (!spawnCode) return "Unknown";
  const key = String(spawnCode).toLowerCase();
  if (labels[key]) return labels[key];

  return String(spawnCode)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
