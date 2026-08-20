import { query } from "./db";
import { discordIdToIdentifier } from "./discord";
import { getVehicleDisplayName } from "./vehicles";

function safeJsonParse(value, fallback = {}) {
  if (value == null || value === "") return fallback;

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    value = value.toString("utf8");
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      let parsed = JSON.parse(value);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function numeric(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function pickName(...values) {
  for (const value of values) {
    if (value == null) continue;
    const string = String(value).trim();
    if (string && string !== "null" && string !== "undefined") return string;
  }
  return "";
}

function getCharinfoName(charinfo, row = {}) {
  const first = pickName(
    row.char_firstname,
    charinfo.firstname,
    charinfo.Firstname,
    charinfo.firstName
  );
  const last = pickName(
    row.char_lastname,
    charinfo.lastname,
    charinfo.Lastname,
    charinfo.lastName
  );
  return { firstname: first, lastname: last, full: `${first} ${last}`.trim() };
}

function normalizeGender(value) {
  if (value === 0 || value === "0" || String(value).toLowerCase() === "male") {
    return "Male";
  }
  if (value === 1 || value === "1" || String(value).toLowerCase() === "female") {
    return "Female";
  }
  return value == null || value === "" ? null : String(value);
}

function normalizeLicenses(value) {
  const licenses = value && typeof value === "object" ? value : {};
  return Object.entries(licenses)
    .filter(([, enabled]) => enabled === true || enabled === 1 || enabled === "true")
    .map(([key]) => key)
    .sort((a, b) => a.localeCompare(b));
}

const CHARACTER_SELECT = `
  citizenid,
  cid,
  charinfo,
  money,
  job,
  gang,
  metadata,
  phone_number,
  last_logged_out,
  JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.firstname')) AS char_firstname,
  JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.lastname')) AS char_lastname
`;

export async function fetchUserByDiscord(discordId) {
  const discordIdentifier = discordIdToIdentifier(discordId);
  const rows = await query(
    `SELECT userId, username, license, license2, fivem, discord
     FROM users WHERE discord = ? LIMIT 1`,
    [discordIdentifier]
  );
  return rows[0] || null;
}

export async function checkBanByDiscord(discordId) {
  const discordIdentifier = discordIdToIdentifier(discordId);
  const rows = await query(
    `SELECT id, reason, expire FROM bans
     WHERE discord = ?
     AND (expire IS NULL OR expire > UNIX_TIMESTAMP())
     LIMIT 1`,
    [discordIdentifier]
  );
  return rows[0] || null;
}

async function selectCharacters(whereSql, params) {
  try {
    return await query(
      `SELECT ${CHARACTER_SELECT}
       FROM players
       ${whereSql}`,
      params
    );
  } catch (err) {
    // Older/custom player schemas may not expose metadata. Keep the dashboard
    // usable rather than failing all character data if that optional column is absent.
    if (err?.code !== "ER_BAD_FIELD_ERROR") throw err;

    const fallbackSelect = CHARACTER_SELECT.replace("  metadata,\n", "");
    return query(
      `SELECT ${fallbackSelect}
       FROM players
       ${whereSql}`,
      params
    );
  }
}

export async function fetchCharactersForUser(user) {
  if (!user) return [];

  let rows = [];

  if (user.userId) {
    rows = await selectCharacters("WHERE userId = ? ORDER BY cid ASC", [user.userId]);
  }

  if (rows.length === 0 && (user.license || user.license2)) {
    const licenses = [user.license, user.license2].filter(Boolean);
    if (licenses.length > 0) {
      const placeholders = licenses.map(() => "?").join(", ");
      rows = await selectCharacters(
        `WHERE license IN (${placeholders}) ORDER BY cid ASC`,
        licenses
      );
    }
  }

  return rows.map(formatCharacter);
}

export async function fetchVehiclesForCitizenIds(citizenIds) {
  if (!citizenIds?.length) return [];

  const placeholders = citizenIds.map(() => "?").join(", ");
  const rows = await query(
    `SELECT citizenid, vehicle, plate, garage_id, in_garage
     FROM player_vehicles
     WHERE citizenid IN (${placeholders})
     AND COALESCE(job_vehicle, 0) = 0
     AND COALESCE(gang_vehicle, 0) = 0
     ORDER BY vehicle ASC`,
    citizenIds
  );

  return rows.map((row) => ({
    citizenid: row.citizenid,
    model: row.vehicle,
    modelLabel: getVehicleDisplayName(row.vehicle),
    plate: row.plate,
    garage: row.garage_id || "Unknown",
    inGarage: row.in_garage === 1 || row.in_garage === true,
  }));
}

function attachVehiclesToCharacters(characters, vehicles) {
  const byCitizen = new Map();
  for (const vehicle of vehicles) {
    if (!byCitizen.has(vehicle.citizenid)) byCitizen.set(vehicle.citizenid, []);
    byCitizen.get(vehicle.citizenid).push(vehicle);
  }
  return characters.map((character) => ({
    ...character,
    vehicles: byCitizen.get(character.citizenid) || [],
  }));
}

const OWNER_SELECT = `
  citizenid,
  charinfo,
  job,
  JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.firstname')) AS char_firstname,
  JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.lastname')) AS char_lastname
`;

export async function fetchBusinessOwners(jobKeys) {
  if (!jobKeys?.length) return [];

  const placeholders = jobKeys.map(() => "?").join(", ");
  const rows = await query(
    `SELECT ${OWNER_SELECT}
     FROM players
     WHERE JSON_UNQUOTE(JSON_EXTRACT(job, '$.name')) IN (${placeholders})
     AND JSON_EXTRACT(job, '$.isboss') = true`,
    jobKeys
  );

  return rows.map((row) => {
    const charinfo = safeJsonParse(row.charinfo);
    const job = safeJsonParse(row.job);
    const { full: characterName } = getCharinfoName(charinfo, row);

    return {
      jobKey: job.name,
      citizenid: row.citizenid,
      characterName: characterName || "Unnamed Character",
      gradeName: job.grade?.name || job.grade?.label || null,
    };
  });
}

function formatCharacter(row) {
  const charinfo = safeJsonParse(row.charinfo);
  const money = safeJsonParse(row.money);
  const job = safeJsonParse(row.job);
  const gang = safeJsonParse(row.gang);
  const metadata = safeJsonParse(row.metadata);

  const { firstname, lastname, full: characterName } = getCharinfoName(charinfo, row);
  const displayName = characterName || "Unnamed Character";
  const licenses = normalizeLicenses(metadata.licences || metadata.licenses);

  return {
    citizenid: row.citizenid,
    cid: row.cid,
    name: displayName,
    characterName: displayName,
    firstname,
    lastname,
    birthdate: pickName(charinfo.birthdate, charinfo.birthDate) || null,
    nationality: pickName(charinfo.nationality, charinfo.nation) || null,
    gender: normalizeGender(charinfo.gender),
    phone: pickName(charinfo.phone, row.phone_number) || null,
    finances: {
      cash: numeric(money.cash),
      bank: numeric(money.bank),
      crypto: numeric(money.crypto),
    },
    cash: numeric(money.cash),
    bank: numeric(money.bank),
    crypto: numeric(money.crypto),
    employment: {
      name: job.name || null,
      label: job.label || job.name || "Unemployed",
      grade: job.grade?.name || job.grade?.label || null,
      gradeLevel: job.grade?.level ?? null,
      onDuty: Boolean(job.onduty),
      isBoss: Boolean(job.isboss),
    },
    jobLabel: job.label || job.name || "Unemployed",
    jobGrade: job.grade?.name || job.grade?.label || null,
    gang: gang?.name
      ? {
          name: gang.name,
          label: gang.label || gang.name,
          grade: gang.grade?.name || gang.grade?.label || null,
          gradeLevel: gang.grade?.level ?? null,
          isBoss: Boolean(gang.isboss),
        }
      : null,
    gangLabel: gang.label || gang.name || null,
    licenses,
    status: {
      hunger: metadata.hunger == null ? null : numeric(metadata.hunger),
      thirst: metadata.thirst == null ? null : numeric(metadata.thirst),
      stress: metadata.stress == null ? null : numeric(metadata.stress),
      armor: metadata.armor == null ? null : numeric(metadata.armor),
      bloodType: pickName(metadata.bloodtype, metadata.bloodType) || null,
      isDead: Boolean(metadata.isdead),
      inLastStand: Boolean(metadata.inlaststand),
    },
    lastLoggedOut: row.last_logged_out
      ? new Date(row.last_logged_out).toISOString()
      : null,
  };
}

export async function searchCharacters(searchTerm, limit = 25) {
  const term = String(searchTerm || "").trim();
  if (term.length < 2) return [];

  const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 50));
  const like = `%${term}%`;
  const rows = await selectCharacters(
    `WHERE citizenid LIKE ?
       OR COALESCE(phone_number, '') LIKE ?
       OR CONCAT(
         COALESCE(JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.firstname')), ''),
         ' ',
         COALESCE(JSON_UNQUOTE(JSON_EXTRACT(charinfo, '$.lastname')), '')
       ) LIKE ?
     ORDER BY last_logged_out DESC
     LIMIT ${safeLimit}`,
    [like, like, like]
  );

  let characters = rows.map(formatCharacter);
  if (characters.length) {
    const vehicles = await fetchVehiclesForCitizenIds(
      characters.map((character) => character.citizenid)
    );
    characters = attachVehiclesToCharacters(characters, vehicles);
  }
  return characters;
}

export async function getPlayerProfile(discordId) {
  const ban = await checkBanByDiscord(discordId);
  if (ban) {
    return {
      banned: true,
      banReason: ban.reason,
      user: null,
      characters: [],
    };
  }

  const user = await fetchUserByDiscord(discordId);
  let characters = await fetchCharactersForUser(user);

  if (characters.length > 0) {
    const citizenIds = characters.map((character) => character.citizenid);
    const vehicles = await fetchVehiclesForCitizenIds(citizenIds);
    characters = attachVehiclesToCharacters(characters, vehicles);
  }

  return {
    banned: false,
    user: user
      ? {
          userId: user.userId,
          username: user.username,
          license: user.license,
        }
      : null,
    characters,
  };
}
