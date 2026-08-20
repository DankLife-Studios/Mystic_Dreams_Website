import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import { getEnabledBusinesses } from "@/lib/businesses";
import { getCityDirectoryMetadata, upsertCityDirectoryEntry } from "@/lib/city-directory";

async function requireStaff() {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const permissions = await getSitePermissions(discordId);
  if (!permissions.isStaff) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { discordId, permissions };
}

export async function GET() {
  const access = await requireStaff();
  if (access.error) return access.error;

  try {
    const metadata = await getCityDirectoryMetadata();
    return Response.json({ businesses: getEnabledBusinesses(), metadata }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("City admin load error:", error.message);
    return Response.json({ error: "Failed to load directory settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  const access = await requireStaff();
  if (access.error) return access.error;

  const body = await request.json();
  const jobKey = String(body.jobKey || "").trim();
  const known = getEnabledBusinesses().some((business) => business.jobKey === jobKey);
  if (!known) return Response.json({ error: "Unknown business" }, { status: 400 });

  try {
    const entry = await upsertCityDirectoryEntry(jobKey, body, access.discordId);
    return Response.json({ entry }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("City admin update error:", error.message);
    return Response.json({ error: error.message || "Failed to update directory" }, { status: 400 });
  }
}
