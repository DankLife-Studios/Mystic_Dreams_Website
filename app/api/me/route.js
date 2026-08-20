import { auth } from "@/lib/auth";
import { fetchGuildMember, getSitePermissionsFromRoles } from "@/lib/discord";
import { getPlayerProfile } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.discordId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = session.user.discordId;
  const limit = rateLimit(`me:${discordId}`, 30, 60_000);
  if (!limit.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const member = await fetchGuildMember(discordId);
  const roles = member.roles || [];
  const permissions = getSitePermissionsFromRoles(roles);
  const citizenRoleId = process.env.DISCORD_CITIZEN_ROLE_ID;

  let game = { linked: false, banned: false, banReason: null, characters: [] };
  if (process.env.DATABASE_URL) {
    try {
      const profile = await getPlayerProfile(discordId);
      game = {
        linked: !!profile.user,
        banned: profile.banned,
        banReason: profile.banReason || null,
        characters: profile.banned ? [] : profile.characters,
      };
    } catch (error) {
      console.error("Database error:", error.message);
      game.dbError = true;
    }
  }

  return Response.json(
    {
      user: {
        discordId,
        username: session.user.username,
        globalName: session.user.globalName,
        name: session.user.name,
        image: session.user.image,
      },
      discord: {
        inGuild: member.inGuild,
        hasCitizenRole: Boolean(member.inGuild && citizenRoleId && roles.includes(citizenRoleId)),
      },
      permissions,
      game,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
