import { ensureCityDirectorySchema, getTursoClient, tursoExecute, tursoQuery, tursoQueryOne } from "./turso";
import { getEnabledBusinesses, getCategoryLabel } from "./businesses";

function parseServices(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
  } catch {}
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function hydrate(entry) {
  if (!entry) return null;
  return {
    ...entry,
    services: parseServices(entry.services),
    is_featured: Boolean(entry.is_featured),
  };
}

export async function getCityDirectoryMetadata() {
  if (!getTursoClient()) return [];
  await ensureCityDirectorySchema();
  const rows = await tursoQuery(
    `SELECT job_key, display_name, description, logo_url, phone, hours, services,
            hiring_status, location_override, category_override, is_featured,
            updated_by_discord_id, created_at, updated_at
     FROM city_directory_entries
     ORDER BY is_featured DESC, COALESCE(display_name, job_key) ASC`
  );
  return rows.map(hydrate);
}

export async function getCityDirectoryEntry(jobKey) {
  if (!getTursoClient()) return null;
  await ensureCityDirectorySchema();
  const row = await tursoQueryOne(
    `SELECT job_key, display_name, description, logo_url, phone, hours, services,
            hiring_status, location_override, category_override, is_featured,
            updated_by_discord_id, created_at, updated_at
     FROM city_directory_entries WHERE job_key = ? LIMIT 1`,
    [String(jobKey || "").trim()]
  );
  return hydrate(row);
}

export async function upsertCityDirectoryEntry(jobKey, input, updatedByDiscordId) {
  if (!getTursoClient()) throw new Error("Turso database not configured");
  await ensureCityDirectorySchema();
  const key = String(jobKey || "").trim();
  if (!key) throw new Error("Business job key is required");

  const services = parseServices(input.services);
  const hiringStatus = ["hiring", "not_hiring", "unknown"].includes(input.hiringStatus)
    ? input.hiringStatus
    : "unknown";

  await tursoExecute(
    `INSERT INTO city_directory_entries (
       job_key, display_name, description, logo_url, phone, hours, services,
       hiring_status, location_override, category_override, is_featured,
       updated_by_discord_id, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(job_key) DO UPDATE SET
       display_name = excluded.display_name,
       description = excluded.description,
       logo_url = excluded.logo_url,
       phone = excluded.phone,
       hours = excluded.hours,
       services = excluded.services,
       hiring_status = excluded.hiring_status,
       location_override = excluded.location_override,
       category_override = excluded.category_override,
       is_featured = excluded.is_featured,
       updated_by_discord_id = excluded.updated_by_discord_id,
       updated_at = CURRENT_TIMESTAMP`,
    [
      key,
      String(input.displayName || "").trim() || null,
      String(input.description || "").trim(),
      String(input.logoUrl || "").trim() || null,
      String(input.phone || "").trim() || null,
      String(input.hours || "").trim() || null,
      JSON.stringify(services),
      hiringStatus,
      String(input.location || "").trim() || null,
      String(input.category || "").trim() || null,
      input.isFeatured ? 1 : 0,
      updatedByDiscordId || null,
    ]
  );
  return getCityDirectoryEntry(key);
}

export async function buildCityDirectory(owners = []) {
  const base = getEnabledBusinesses();
  const metadata = await getCityDirectoryMetadata();
  const metadataByJob = new Map(metadata.map((entry) => [entry.job_key, entry]));
  const ownersByJob = new Map();

  for (const owner of owners) {
    if (!ownersByJob.has(owner.jobKey)) ownersByJob.set(owner.jobKey, []);
    ownersByJob.get(owner.jobKey).push({
      characterName: owner.characterName,
      citizenid: owner.citizenid,
      gradeName: owner.gradeName,
    });
  }

  return base.map((business) => {
    const extra = metadataByJob.get(business.jobKey) || {};
    const category = extra.category_override || business.category;
    return {
      jobKey: business.jobKey,
      name: extra.display_name || business.name,
      description: extra.description || "",
      logoUrl: extra.logo_url || null,
      phone: extra.phone || null,
      hours: extra.hours || null,
      services: extra.services || [],
      hiringStatus: extra.hiring_status || "unknown",
      isFeatured: Boolean(extra.is_featured),
      location: extra.location_override || business.location,
      category,
      categoryLabel: getCategoryLabel(category),
      icon: business.icon || "building",
      owners: ownersByJob.get(business.jobKey) || [],
      updatedAt: extra.updated_at || null,
    };
  });
}
