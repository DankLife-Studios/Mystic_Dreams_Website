import { auth } from "@/lib/auth";
import { hasDiscordRole } from "@/lib/discord";
import { getWikiPageBySlug, updateWikiPage, deleteWikiPage, setWikiHomepage } from "@/lib/wiki";

const WIKI_EDITOR_ROLE_ID = process.env.DISCORD_WIKI_EDITOR_ROLE_ID;
const CACHE_SECONDS = 30;

const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Vary: "Cookie",
};

export async function GET(request, { params }) {
    const { slug } = await params;
    const page = await getWikiPageBySlug(slug);
    if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404, headers });
    }

    const session = await auth();
    const discordId = session?.user?.discordId;
    const canEdit = Boolean(discordId && (await hasDiscordRole(discordId, WIKI_EDITOR_ROLE_ID)));

    return Response.json({ page, canEdit }, { headers });
}

export async function PUT(request, { params }) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    const category = String(body.category || "General").trim();
    const content = String(body.content || "").trim();
    const isHomepage = body.hasOwnProperty("isHomepage") ? Boolean(body.isHomepage) : undefined;

    if (!title || !content) {
        return Response.json({ error: "Title and content are required" }, { status: 400, headers });
    }

    try {
        const page = await updateWikiPage({ slug, title, category, content, isHomepage });
        return Response.json(page, { headers });
    } catch (err) {
        console.error("Wiki update error:", err.message);
        return Response.json({ error: err.message || "Failed to update page" }, { status: 500, headers });
    }
}

export async function DELETE(request, { params }) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    try {
        const result = await deleteWikiPage(slug);
        return Response.json(result, { headers });
    } catch (err) {
        console.error("Wiki delete error:", err.message);
        return Response.json({ error: err.message || "Failed to delete page" }, { status: 500, headers });
    }
}
