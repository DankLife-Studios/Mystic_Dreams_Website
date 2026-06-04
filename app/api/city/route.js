import { auth } from "@/lib/auth";
import {
  BUSINESS_CATEGORIES,
  getCategoryLabel,
  getEnabledBusinesses,
} from "@/lib/businesses";
import { fetchBusinessOwners } from "@/lib/qbox";
import { rateLimit } from "@/lib/rate-limit";

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

  const enabled = getEnabledBusinesses();
  const jobKeys = enabled.map((b) => b.jobKey);

  let owners = [];
  if (process.env.DATABASE_URL && jobKeys.length > 0) {
    try {
      owners = await fetchBusinessOwners(jobKeys);
    } catch (err) {
      console.error("City directory DB error:", err.message);
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

  return Response.json(
    { categories, businesses },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
