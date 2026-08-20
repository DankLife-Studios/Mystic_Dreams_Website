import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import { createWikiCategory, deleteWikiCategory, getWikiCategories, reorderWikiCategories, updateWikiCategory } from "@/lib/wiki";

const headers = { "Cache-Control": "no-cache, no-store, must-revalidate", Vary: "Cookie" };

async function requireEditor() {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return { error: Response.json({ error: "Unauthorized" }, { status: 401, headers }) };
  const permissions = await getSitePermissions(discordId);
  if (!permissions.canEditWiki) return { error: Response.json({ error: "Forbidden" }, { status: 403, headers }) };
  return { discordId, permissions };
}

export async function GET() {
  try {
    return Response.json({ categories: await getWikiCategories() }, { headers });
  } catch (error) {
    return Response.json({ error: "Failed to load categories" }, { status: 500, headers });
  }
}

export async function POST(request) {
  const access = await requireEditor();
  if (access.error) return access.error;
  const body = await request.json();
  try {
    const category = await createWikiCategory({ name: body.name, description: body.description, parentName: body.parentName });
    return Response.json({ category }, { status: 201, headers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400, headers });
  }
}

export async function PUT(request) {
  const access = await requireEditor();
  if (access.error) return access.error;
  const body = await request.json();
  try {
    const category = await updateWikiCategory(body.name, {
      newName: body.newName,
      description: body.description,
      parentName: body.parentName,
      displayOrder: body.displayOrder,
    });
    return Response.json({ category }, { headers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400, headers });
  }
}

export async function PATCH(request) {
  const access = await requireEditor();
  if (access.error) return access.error;
  const body = await request.json();
  if (!Array.isArray(body.orders)) return Response.json({ error: "orders array is required" }, { status: 400, headers });
  try {
    return Response.json({ categories: await reorderWikiCategories(body.orders) }, { headers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400, headers });
  }
}

export async function DELETE(request) {
  const access = await requireEditor();
  if (access.error) return access.error;
  const name = new URL(request.url).searchParams.get("name");
  if (!name) return Response.json({ error: "Category name is required" }, { status: 400, headers });
  try {
    return Response.json(await deleteWikiCategory(name), { headers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400, headers });
  }
}
