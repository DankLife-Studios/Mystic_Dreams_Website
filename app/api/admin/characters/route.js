import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import { searchCharacters } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request) {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const permissions = await getSitePermissions(discordId);
  if (!permissions.isStaff) return Response.json({ error: "Forbidden" }, { status: 403 });

  const limit = rateLimit(`admin-chars:${discordId}`, 30, 60_000);
  if (!limit.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  if (query.trim().length < 2) return Response.json({ characters: [] });

  try {
    const characters = await searchCharacters(query, 25);
    return Response.json({ characters }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Staff character search error:", error.message);
    return Response.json({ error: "Character search unavailable" }, { status: 500 });
  }
}
