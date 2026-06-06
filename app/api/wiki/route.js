import { auth } from "@/lib/auth";
import { hasDiscordRole } from "@/lib/discord";
import { createWikiPage, getWikiIndex, getWikiCategories, buildWikiSlug } from "@/lib/wiki";

const WIKI_EDITOR_ROLE_ID = process.env.DISCORD_WIKI_EDITOR_ROLE_ID;

const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Vary: "Cookie",
};

export async function GET() {
    const session = await auth();
    const discordId = session?.user?.discordId;
    const canCreate = Boolean(discordId && (await hasDiscordRole(discordId, WIKI_EDITOR_ROLE_ID)));

    try {
        const pages = await getWikiIndex();

        // Build categories from page data (backwards compatible)
        const pageCategoryMap = pages.reduce((map, page) => {
            const category = page.category || "Uncategorized";
            const list = map.get(category) || [];
            list.push(page);
            map.set(category, list);
            return map;
        }, new Map());

        // Load standalone categories from the dedicated table
        const standaloneCategories = await getWikiCategories();

        // Merge: standalone categories that don't yet have pages still appear (empty)
        const mergedCategories = [];
        const seen = new Set();

        for (const cat of standaloneCategories) {
            seen.add(cat.name);
            mergedCategories.push({
                name: cat.name,
                description: cat.description || "",
                pages: pageCategoryMap.get(cat.name) || [],
            });
        }

        // Add any page-derived categories not already in the standalone list
        for (const [name, catPages] of pageCategoryMap) {
            if (!seen.has(name)) {
                mergedCategories.push({ name, description: "", pages: catPages });
            }
        }

        // Sort: categories with display_order from standalone first, then alphabetical
        mergedCategories.sort((a, b) => a.name.localeCompare(b.name));

        return Response.json({ pages, categories: mergedCategories, canCreate }, { headers });
    } catch (err) {
        console.error("Wiki index error:", err.message);
        return Response.json({ error: "Failed to load wiki index" }, { status: 500, headers });
    }
}

export async function POST(request) {
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    const category = String(body.category || "General").trim();
    const content = String(body.content || "").trim();
    const slug = buildWikiSlug(body.slug || title);

    if (!title || !content || !slug) {
        return Response.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    try {
        const page = await createWikiPage({ title, slug, category, content });
        return Response.json(page, { status: 201, headers });
    } catch (err) {
        console.error("Wiki create error:", err.message);
        return Response.json({ error: err.message || "Failed to create wiki page" }, { status: 400, headers });
    }
}
