const DISCORD_API = "https://discord.com/api/v10";

export function discordIdToIdentifier(discordId) {
  return `discord:${discordId}`;
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

export async function checkCitizenRole(discordUserId) {
  const citizenRoleId = process.env.DISCORD_CITIZEN_ROLE_ID;
  const member = await fetchGuildMember(discordUserId);

  if (!member.inGuild) {
    return { inGuild: false, hasCitizenRole: false };
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
