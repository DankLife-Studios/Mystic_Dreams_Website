import { auth } from "@/lib/auth";
import { getSitePermissions } from "@/lib/discord";
import {
  buildWikiSlug,
  createWikiPage,
  getWikiCategories,
  getWikiHomepage,
  getWikiIndex,
  searchWikiPages,
} from "@/lib/wiki";

const headers = { "Cache-Control": "no-cache, no-store, must-revalidate", Vary: "Cookie" };

function buildCategoryTree(pages, standaloneCategories) {
  const pageCategoryMap = new Map();
  for (const page of pages.filter((item) => !item.is_homepage)) {
    const category = page.category || "Uncategorized";
    if (!pageCategoryMap.has(category)) pageCategoryMap.set(category, []);
    pageCategoryMap.get(category).push(page);
  }

  const categoryMap = new Map();
  for (const category of standaloneCategories) {
    categoryMap.set(category.name, {
      name: category.name,
      parentName: category.parent_name || null,
      description: category.description || "",
      displayOrder: category.display_order ?? 0,
      pages: pageCategoryMap.get(category.name) || [],
      children: [],
    });
  }
  for (const [name, categoryPages] of pageCategoryMap) {
    if (!categoryMap.has(name)) {
      categoryMap.set(name, { name, parentName: null, description: "", displayOrder: 999, pages: categoryPages, children: [] });
    }
  }

  const roots = [];
  for (const node of categoryMap.values()) {
    if (node.parentName && categoryMap.has(node.parentName)) categoryMap.get(node.parentName).children.push(node);
    else roots.push(node);
  }
  const sort = (nodes) => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    nodes.forEach((node) => sort(node.children));
  };
  sort(roots);
  return roots;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const wantsAdmin = url.searchParams.get("admin") === "1";
    const search = url.searchParams.get("q")?.trim() || "";

    let permissions = { isStaff: false, canEditWiki: false, canReviewWiki: false };
    const session = await auth();
    if (session?.user?.discordId) {
      permissions = await getSitePermissions(session.user.discordId);
    }
    const includeUnpublished = Boolean(wantsAdmin && permissions.canEditWiki);

    const pages = search
      ? await searchWikiPages(search, { includeUnpublished })
      : await getWikiIndex({ includeUnpublished });
    const categories = await getWikiCategories();
    const homePage = await getWikiHomepage({ includeUnpublished });

    return Response.json(
      {
        pages: pages.filter((page) => !page.is_homepage),
        categories: buildCategoryTree(pages, categories),
        flatCategories: categories,
        homePage,
        permissions,
        canCreate: Boolean(permissions.canEditWiki),
        canReview: Boolean(permissions.canReviewWiki),
        search,
      },
      { headers }
    );
  } catch (error) {
    console.error("Wiki index error:", error.message);
    return Response.json({ error: "Failed to load wiki" }, { status: 500, headers });
  }
}

export async function POST(request) {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) return Response.json({ error: "Unauthorized" }, { status: 401, headers });

  const permissions = await getSitePermissions(discordId);
  if (!permissions.canEditWiki) return Response.json({ error: "Forbidden" }, { status: 403, headers });

  const body = await request.json();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const slug = buildWikiSlug(body.slug || title);
  if (!title || !content || !slug) return Response.json({ error: "Title, slug, and content are required" }, { status: 400, headers });

  try {
    const page = await createWikiPage({
      title,
      slug,
      category: String(body.category || "Getting Started").trim(),
      content,
      summary: String(body.summary || "").trim(),
      tags: body.tags || [],
      isHomepage: Boolean(body.isHomepage),
      status: "draft",
      authorDiscordId: discordId,
    });
    return Response.json(page, { status: 201, headers });
  } catch (error) {
    console.error("Wiki create error:", error.message);
    return Response.json({ error: error.message || "Failed to create wiki page" }, { status: 400, headers });
  }
}
