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
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      return fallback;
    }
  }

  return fallback;
}

const CHARACTER_SELECT = `
  citizenid,
  cid,
  charinfo,
  money,
  job,
  gang,
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

export async function fetchCharactersForUser(user) {
  if (!user) return [];

  let rows = [];

  if (user.userId) {
    rows = await query(
      `SELECT ${CHARACTER_SELECT}
       FROM players WHERE userId = ? ORDER BY cid ASC`,
      [user.userId]
    );
  }

  if (rows.length === 0 && (user.license || user.license2)) {
    const licenses = [user.license, user.license2].filter(Boolean);
    if (licenses.length > 0) {
      const placeholders = licenses.map(() => "?").join(", ");
      rows = await query(
        `SELECT ${CHARACTER_SELECT}
         FROM players WHERE license IN (${placeholders}) ORDER BY cid ASC`,
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
  for (const v of vehicles) {
    if (!byCitizen.has(v.citizenid)) byCitizen.set(v.citizenid, []);
    byCitizen.get(v.citizenid).push(v);
  }
  return characters.map((char) => ({
    ...char,
    vehicles: byCitizen.get(char.citizenid) || [],
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

function pickName(...values) {
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s && s !== "null" && s !== "undefined") return s;
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

function formatCharacter(row) {
  const charinfo = safeJsonParse(row.charinfo);
  const money = safeJsonParse(row.money);
  const job = safeJsonParse(row.job);
  const gang = safeJsonParse(row.gang);

  const { firstname, lastname, full: characterName } = getCharinfoName(
    charinfo,
    row
  );
  // Never use players.name — Qbox stores GetPlayerName() (Discord/Steam) there
  const displayName = characterName || "Unnamed Character";

  return {
    citizenid: row.citizenid,
    cid: row.cid,
    name: displayName,
    characterName: displayName,
    firstname,
    lastname,
    phone: charinfo.phone || row.phone_number || null,
    cash: money.cash ?? 0,
    bank: money.bank ?? 0,
    jobLabel: job.label || job.name || "Unemployed",
    jobGrade: job.grade?.name || job.grade?.label || null,
    gangLabel: gang.label || gang.name || null,
    lastLoggedOut: row.last_logged_out
      ? new Date(row.last_logged_out).toISOString()
      : null,
  };
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
    const citizenIds = characters.map((c) => c.citizenid);
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
