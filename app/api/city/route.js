import { auth } from "@/lib/auth";
import {
  BUSINESS_CATEGORIES,
  getCategoryLabel,
  getEnabledBusinesses,
} from "@/lib/businesses";
import { fetchBusinessOwners } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

const CITY_CACHE_TTL = Number(process.env.CITY_CACHE_TTL_SECONDS || 30) * 1000;
let cachedCityData = null;
let cachedCityAt = 0;

function isCityCacheFresh() {
  return cachedCityData && Date.now() - cachedCityAt < CITY_CACHE_TTL;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.discordId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = session.user.discordId;
  const limit = rateLimit(`city:${discordId}`, 20, 60_000);

  if (!limit.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  if (isCityCacheFresh()) {
    return Response.json(cachedCityData, {
      headers: {
        "Cache-Control": `private, max-age=${Math.floor(CITY_CACHE_TTL / 1000)}, stale-while-revalidate=30`,
      },
    });
  }

  const enabled = getEnabledBusinesses();
  const jobKeys = enabled.map((b) => b.jobKey);

  let owners = [];
  if (process.env.DATABASE_URL && jobKeys.length > 0) {
    try {
      owners = await fetchBusinessOwners(jobKeys);
    } catch (err) {
      console.error("City directory DB error:", err.message);
      if (cachedCityData) {
        return Response.json(cachedCityData, {
          headers: {
            "Cache-Control": `private, max-age=${Math.floor(CITY_CACHE_TTL / 1000)}, stale-while-revalidate=30`,
          },
        });
      }
      return Response.json(
        { error: "Database unavailable", dbError: true },
        { status: 503 }
      );
    }
  }

  const ownersByJob = new Map();
  for (const owner of owners) {
    if (!ownersByJob.has(owner.jobKey)) ownersByJob.set(owner.jobKey, []);
    ownersByJob.get(owner.jobKey).push({
      characterName: owner.characterName,
      citizenid: owner.citizenid,
      gradeName: owner.gradeName,
    });
  }

  const businesses = enabled.map((biz) => ({
    jobKey: biz.jobKey,
    name: biz.name,
    location: biz.location,
    category: biz.category,
    categoryLabel: getCategoryLabel(biz.category),
    icon: biz.icon || "building",
    owners: ownersByJob.get(biz.jobKey) || [],
  }));

  const categories = BUSINESS_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    businesses: businesses.filter((b) => b.category === cat.id),
  })).filter((cat) => cat.businesses.length > 0);

  const responseData = { categories, businesses };
  cachedCityData = responseData;
  cachedCityAt = Date.now();

  return Response.json(responseData, {
    headers: {
      "Cache-Control": `private, max-age=${Math.floor(CITY_CACHE_TTL / 1000)}, stale-while-revalidate=30`,
    },
  });
}
