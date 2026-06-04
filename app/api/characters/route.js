import { auth } from "@/lib/auth";
import { getPlayerProfile } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();

  if (!session?.user?.discordId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = session.user.discordId;
  const limit = rateLimit(`chars:${discordId}`, 30, 60_000);

  if (!limit.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const profile = await getPlayerProfile(discordId);

    if (profile.banned) {
      return Response.json({ error: "Account restricted" }, { status: 403 });
    }

    return Response.json({
      linked: !!profile.user,
      characters: profile.characters,
    });
  } catch (err) {
    console.error("Characters API error:", err.message);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
