import { auth } from "@/lib/auth";
import { hasDiscordRole } from "@/lib/discord";
import {
    getWikiCategories,
    createWikiCategory,
    updateWikiCategory,
    deleteWikiCategory,
    reorderWikiCategories,
} from "@/lib/wiki";

const WIKI_EDITOR_ROLE_ID = process.env.DISCORD_WIKI_EDITOR_ROLE_ID;

const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Vary: "Cookie",
};

/** GET — returns all categories (public). */
export async function GET() {
    try {
        const categories = await getWikiCategories();
        return Response.json({ categories }, { headers });
    } catch (err) {
        console.error("Wiki categories error:", err.message);
        return Response.json(
            { error: "Failed to load categories" },
            { status: 500, headers }
        );
    }
}

/** POST — create a category (editor role required). */
export async function POST(request) {
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const parentName = body.parentName ? String(body.parentName).trim() : null;

    if (!name) {
        return Response.json({ error: "Category name is required" }, { status: 400, headers });
    }

    try {
        const category = await createWikiCategory({ name, description, parentName });
        return Response.json({ category }, { status: 201, headers });
    } catch (err) {
        console.error("Wiki category create error:", err.message);
        return Response.json(
            { error: err.message || "Failed to create category" },
            { status: 400, headers }
        );
    }
}

/** PUT — update a category (editor role required). Body: { name, description }. */
export async function PUT(request) {
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
        return Response.json({ error: "Category name is required" }, { status: 400, headers });
    }

    try {
        const category = await updateWikiCategory(name, {
            description: body.description,
            parentName: body.parentName,
            displayOrder: body.displayOrder,
        });
        return Response.json({ category }, { headers });
    } catch (err) {
        console.error("Wiki category update error:", err.message);
        return Response.json(
            { error: err.message || "Failed to update category" },
            { status: 500, headers }
        );
    }
}

/** DELETE — delete a category (editor role required). Query param: ?name=CategoryName */
export async function DELETE(request) {
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
        return Response.json({ error: "Category name is required" }, { status: 400, headers });
    }

    try {
        const result = await deleteWikiCategory(name);
        return Response.json(result, { headers });
    } catch (err) {
        console.error("Wiki category delete error:", err.message);
        return Response.json(
            { error: err.message || "Failed to delete category" },
            { status: 500, headers }
        );
    }
}

/** PATCH — bulk reorder categories (editor role required). Body: { orders: [{ name, display_order }] } */
export async function PATCH(request) {
    const session = await auth();

    if (!session?.user?.discordId) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    if (!(await hasDiscordRole(session.user.discordId, WIKI_EDITOR_ROLE_ID))) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }

    const body = await request.json();
    const orders = body.orders;

    if (!Array.isArray(orders) || orders.length === 0) {
        return Response.json({ error: "orders array is required" }, { status: 400, headers });
    }

    try {
        const categories = await reorderWikiCategories(orders);
        return Response.json({ categories }, { headers });
    } catch (err) {
        console.error("Wiki category reorder error:", err.message);
        return Response.json(
            { error: err.message || "Failed to reorder categories" },
            { status: 500, headers }
        );
    }
}
