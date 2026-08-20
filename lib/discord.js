const DISCORD_API = "https://discord.com/api/v10";

export function discordIdToIdentifier(discordId) {
  return `discord:${discordId}`;
}

export function parseRoleIds(value) {
  return String(value || "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

function hasAnyRole(roles, configured) {
  if (!configured.length) return false;
  const roleSet = new Set(roles || []);
  return configured.some((roleId) => roleSet.has(roleId));
}

export function getSitePermissionsFromRoles(roles = []) {
  const staffRoleIds = parseRoleIds(process.env.DISCORD_STAFF_ROLE_IDS);
  const editorRoleIds = parseRoleIds(
    process.env.DISCORD_WIKI_EDITOR_ROLE_IDS ||
      process.env.DISCORD_WIKI_EDITOR_ROLE_ID
  );
  const configuredReviewerRoles = parseRoleIds(
    process.env.DISCORD_WIKI_REVIEWER_ROLE_IDS
  );
  const reviewerRoleIds = configuredReviewerRoles.length
    ? configuredReviewerRoles
    : editorRoleIds;

  const canEditWiki = hasAnyRole(roles, editorRoleIds) || hasAnyRole(roles, reviewerRoleIds);
  const canReviewWiki = hasAnyRole(roles, reviewerRoleIds);

  // Backward-compatible fallback: if dedicated staff roles are not configured yet,
  // wiki staff can still reach the staff area used to manage the wiki.
  const isStaff = staffRoleIds.length
    ? hasAnyRole(roles, staffRoleIds)
    : canEditWiki || canReviewWiki;

  return {
    isStaff,
    canEditWiki,
    canReviewWiki,
  };
}

export async function fetchGuildMember(discordUserId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !guildId || !discordUserId) {
    return { inGuild: false, roles: [], error: "not_configured" };
  }

  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    }
  );

  if (res.status === 404) {
    return { inGuild: false, roles: [] };
  }

  if (!res.ok) {
    return { inGuild: false, roles: [], error: "api_error" };
  }

  const data = await res.json();
  return {
    inGuild: true,
    roles: data.roles || [],
    nick: data.nick,
  };
}

export async function hasDiscordRole(discordUserId, roleId) {
  if (!roleId) return false;
  const member = await fetchGuildMember(discordUserId);
  return member.inGuild && member.roles.includes(roleId);
}

export async function hasAnyDiscordRole(discordUserId, roleIds = []) {
  const configured = Array.isArray(roleIds) ? roleIds : parseRoleIds(roleIds);
  if (!configured.length) return false;
  const member = await fetchGuildMember(discordUserId);
  return member.inGuild && hasAnyRole(member.roles, configured);
}

export async function getSitePermissions(discordUserId) {
  const member = await fetchGuildMember(discordUserId);
  if (!member.inGuild) {
    return {
      inGuild: false,
      roles: [],
      isStaff: false,
      canEditWiki: false,
      canReviewWiki: false,
    };
  }

  return {
    inGuild: true,
    roles: member.roles,
    ...getSitePermissionsFromRoles(member.roles),
  };
}

export async function checkCitizenRole(discordUserId) {
  const citizenRoleId = process.env.DISCORD_CITIZEN_ROLE_ID;
  const member = await fetchGuildMember(discordUserId);

  if (!member.inGuild) {
    return { inGuild: false, hasCitizenRole: false, roles: [] };
  }

  const hasCitizenRole = citizenRoleId
    ? member.roles.includes(citizenRoleId)
    : false;

  return {
    inGuild: true,
    hasCitizenRole,
    roles: member.roles,
  };
}
