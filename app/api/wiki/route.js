import { auth } from "@/lib/auth";
import { hasDiscordRole } from "@/lib/discord";
import { createWikiPage, getWikiIndex, getWikiCategories, getWikiHomepage, buildWikiSlug } from "@/lib/wiki";

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
        const allPages = await getWikiIndex();

        // Exclude the homepage page from category listings
        const pages = allPages.filter((p) => !p.is_homepage);

        // Build page-category mapping
        const pageCategoryMap = new Map();
        for (const page of pages) {
            const cat = page.category || "Uncategorized";
            const list = pageCategoryMap.get(cat) || [];
            list.push(page);
            pageCategoryMap.set(cat, list);
        }

        // Load standalone categories from the dedicated table
        const standaloneCategories = await getWikiCategories();

        // Build category lookup from standalone + page-derived
        const allCatNames = new Set(standaloneCategories.map((c) => c.name));
        for (const cat of pageCategoryMap.keys()) allCatNames.add(cat);

        // Build a map of name -> category node
        const catMap = new Map();
        for (const cat of standaloneCategories) {
            catMap.set(cat.name, {
                name: cat.name,
                parentName: cat.parent_name || null,
                description: cat.description || "",
                displayOrder: cat.display_order ?? 0,
                pages: pageCategoryMap.get(cat.name) || [],
                children: [],
            });
        }
        // Add page-derived categories not in standalone
        for (const [name, catPages] of pageCategoryMap) {
            if (!catMap.has(name)) {
                catMap.set(name, {
                    name,
                    parentName: null,
                    description: "",
                    displayOrder: 0,
                    pages: catPages,
                    children: [],
                });
            }
        }

        // Build tree: nest children under parents
        const roots = [];
        for (const node of catMap.values()) {
            if (node.parentName && catMap.has(node.parentName)) {
                catMap.get(node.parentName).children.push(node);
            } else {
                roots.push(node);
            }
        }

        // Sort each level by display_order, then name
        const sortTree = (nodes) => {
            nodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
            for (const node of nodes) sortTree(node.children);
        };
        sortTree(roots);

        // Flatten for the API response (with depth info)
        const flattenTree = (nodes, depth = 0) => {
            const result = [];
            for (const node of nodes) {
                result.push({
                    name: node.name,
                    parentName: node.parentName,
                    description: node.description,
                    displayOrder: node.displayOrder,
                    depth,
                    pages: node.pages,
                    children: flattenTree(node.children, depth + 1),
                });
            }
            return result;
        };
        const categories = flattenTree(roots);

        // Fetch the designated homepage
        const homepagePage = await getWikiHomepage();

        return Response.json({ pages, categories, canCreate, homePage: homepagePage }, { headers });
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
    const isHomepage = Boolean(body.isHomepage);

    if (!title || !content || !slug) {
        return Response.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    try {
        const page = await createWikiPage({ title, slug, category, content, isHomepage });
        return Response.json(page, { status: 201, headers });
    } catch (err) {
        console.error("Wiki create error:", err.message);
        return Response.json({ error: err.message || "Failed to create wiki page" }, { status: 400, headers });
    }
}
