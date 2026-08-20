import { auth } from "@/lib/auth";
import { BUSINESS_CATEGORIES, getEnabledBusinesses } from "@/lib/businesses";
import { buildCityDirectory } from "@/lib/city-directory";
import { fetchBusinessOwners } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

const CITY_CACHE_TTL = Number(process.env.CITY_CACHE_TTL_SECONDS || 30) * 1000;
let cachedCityData = null;
let cachedCityAt = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user?.discordId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const discordId = session.user.discordId;
  const limit = rateLimit(`city:${discordId}`, 20, 60_000);
  if (!limit.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  if (cachedCityData && Date.now() - cachedCityAt < CITY_CACHE_TTL) {
    return Response.json(cachedCityData, { headers: { "Cache-Control": "private, no-store" } });
  }

  const enabled = getEnabledBusinesses();
  let owners = [];
  if (process.env.DATABASE_URL && enabled.length) {
    try {
      owners = await fetchBusinessOwners(enabled.map((business) => business.jobKey));
    } catch (error) {
      console.error("City directory DB error:", error.message);
      if (cachedCityData) return Response.json(cachedCityData, { headers: { "Cache-Control": "private, no-store" } });
      return Response.json({ error: "Database unavailable", dbError: true }, { status: 503 });
    }
  }

  try {
    const businesses = await buildCityDirectory(owners);
    const categories = BUSINESS_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      businesses: businesses.filter((business) => business.category === category.id),
    })).filter((category) => category.businesses.length);

    const responseData = { categories, businesses };
    cachedCityData = responseData;
    cachedCityAt = Date.now();
    return Response.json(responseData, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("City directory metadata error:", error.message);
    return Response.json({ error: "City directory unavailable" }, { status: 503 });
  }
}
