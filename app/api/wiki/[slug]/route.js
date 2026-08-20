import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import { deleteWikiPage, getWikiPageBySlug, setWikiPageStatus, updateWikiPage } from "@/lib/wiki";

const headers = { "Cache-Control": "no-cache, no-store, must-revalidate", Vary: "Cookie" };

async function getAccess() {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return { discordId: null, permissions: { canEditWiki: false, canReviewWiki: false } };
  return { discordId, permissions: await getSitePermissions(discordId) };
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const wantsDraft = url.searchParams.get("admin") === "1";
  const access = wantsDraft ? await getAccess() : null;
  const includeUnpublished = Boolean(wantsDraft && access?.permissions.canEditWiki);
  const page = await getWikiPageBySlug(slug, { includeUnpublished });
  if (!page) return Response.json({ error: "Page not found" }, { status: 404, headers });
  return Response.json({ page, permissions: access?.permissions || {} }, { headers });
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  const access = await getAccess();
  if (!access.discordId) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  if (!access.permissions.canEditWiki) return Response.json({ error: "Forbidden" }, { status: 403, headers });

  const body = await request.json();
  try {
    const page = await updateWikiPage({
      slug,
      title: body.title,
      category: body.category,
      content: body.content,
      summary: body.summary,
      tags: body.tags,
      isHomepage: body.hasOwnProperty("isHomepage") ? Boolean(body.isHomepage) : undefined,
    });
    return Response.json(page, { headers });
  } catch (error) {
    console.error("Wiki update error:", error.message);
    return Response.json({ error: error.message || "Failed to update page" }, { status: 400, headers });
  }
}

export async function PATCH(request, { params }) {
  const { slug } = await params;
  const access = await getAccess();
  if (!access.discordId) return Response.json({ error: "Unauthorized" }, { status: 401, headers });

  const body = await request.json();
  const status = String(body.status || "").toLowerCase();
  if (status === "published") {
    if (!access.permissions.canReviewWiki) return Response.json({ error: "Reviewer role required" }, { status: 403, headers });
  } else if (!access.permissions.canEditWiki) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers });
  }

  try {
    const page = await setWikiPageStatus(slug, status, access.discordId);
    return Response.json(page, { headers });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to update status" }, { status: 400, headers });
  }
}

export async function DELETE(request, { params }) {
  const { slug } = await params;
  const access = await getAccess();
  if (!access.discordId) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  if (!access.permissions.canEditWiki) return Response.json({ error: "Forbidden" }, { status: 403, headers });

  try {
    return Response.json(await deleteWikiPage(slug), { headers });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to delete page" }, { status: 400, headers });
  }
}
