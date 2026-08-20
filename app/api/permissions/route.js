import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";

export async function GET() {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const permissions = await getSitePermissions(discordId);
  return Response.json({ permissions }, { headers: { "Cache-Control": "private, no-store" } });
}
