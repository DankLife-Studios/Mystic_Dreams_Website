import { tursoExecute, tursoQuery, tursoQueryOne, ensureWikiSchema } from "./turso";

export const WIKI_STATUSES = ["draft", "review", "published"];

export const DEFAULT_WIKI_CATEGORIES = [
  ["Getting Started", "Everything a new resident needs before their first day in the city.", 10],
  ["Rules", "Community and roleplay rules, expectations, and policies.", 20],
  ["City Life", "Everyday life, services, activities, housing, and useful city information.", 30],
  ["Jobs", "Civilian careers, public employment, and job guides.", 40],
  ["Businesses", "Player-run businesses, ownership, employment, and services.", 50],
  ["Vehicles", "Vehicles, garages, dealerships, mechanics, and vehicle systems.", 60],
  ["Crime", "Criminal systems, risks, and underworld gameplay information.", 70],
  ["Police", "Law enforcement systems, procedures, and player-facing information.", 80],
  ["Medical", "Medical systems, treatment, EMS, and health-related gameplay.", 90],
  ["Systems", "Core server systems and mechanics that do not fit another category.", 100],
  ["Guides", "Step-by-step player guides and practical walkthroughs.", 110],
  ["FAQ", "Frequently asked questions and quick answers.", 120],
];

const DEFAULT_WIKI_CONTENT = `# Welcome to the Mystic Dreams Wiki

This is the player knowledge base for **Mystic Dreams RP**. Use the categories and search to find server rules, systems, jobs, businesses, and practical guides.

> **New to the city?** Start with the Getting Started category before your first session.

## Built for players

The wiki is public so you can check information before connecting. Articles are maintained by approved staff editors and move through a draft and review workflow before publication.

## Looking for something specific?

Use the wiki search to search article titles, summaries, categories, tags, and article content.
`;

const DEFAULT_PAGE = {
  slug: "home",
  title: "Mystic Dreams Wiki",
  category: "Getting Started",
  content: DEFAULT_WIKI_CONTENT,
  summary: "The starting point for the Mystic Dreams RP player knowledge base.",
  tags: ["welcome", "getting started"],
};

let schemaReady = false;

function parseTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((tag) => tag.trim()).filter(Boolean);
  } catch {}
  return String(value).split(",").map((tag) => tag.trim()).filter(Boolean);
}

function serializeTags(value) {
  return JSON.stringify(parseTags(value));
}

function hydratePage(page) {
  if (!page) return null;
  return {
    ...page,
    is_homepage: Boolean(page.is_homepage),
    tags: parseTags(page.tags),
    status: page.status || "published",
  };
}

export function normalizeWikiSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/^-+|-+$/g, "");
}

export function buildWikiSlug(value) {
  return normalizeWikiSlug(value);
}

async function initSchema() {
  if (schemaReady) return;
  await ensureWikiSchema();
  schemaReady = true;
}

async function seedDefaults() {
  for (const [name, description, displayOrder] of DEFAULT_WIKI_CATEGORIES) {
    await tursoExecute(
      `INSERT INTO wiki_categories (name, description, display_order)
       VALUES (?, ?, ?)
       ON CONFLICT(name) DO NOTHING`,
      [name, description, displayOrder]
    );
  }

  const existing = await tursoQueryOne("SELECT slug FROM wiki_pages LIMIT 1");
  if (!existing) {
    await tursoExecute(
      `INSERT INTO wiki_pages
        (slug, title, category, content, is_homepage, status, summary, tags, published_at)
       VALUES (?, ?, ?, ?, 1, 'published', ?, ?, CURRENT_TIMESTAMP)`,
      [
        DEFAULT_PAGE.slug,
        DEFAULT_PAGE.title,
        DEFAULT_PAGE.category,
        DEFAULT_PAGE.content,
        DEFAULT_PAGE.summary,
        serializeTags(DEFAULT_PAGE.tags),
      ]
    );
  }
}

async function openDatabase() {
  await initSchema();
  await seedDefaults();
}

const PAGE_COLUMNS = `slug, title, category, content, is_homepage, status, summary, tags,
  author_discord_id, reviewer_discord_id, published_at, created_at, updated_at`;
const INDEX_COLUMNS = `slug, title, category, is_homepage, status, summary, tags,
  author_discord_id, reviewer_discord_id, published_at, created_at, updated_at`;

export async function getWikiIndex({ includeUnpublished = false } = {}) {
  await openDatabase();
  const where = includeUnpublished ? "" : "WHERE status = 'published'";
  const rows = await tursoQuery(
    `SELECT ${INDEX_COLUMNS} FROM wiki_pages ${where}
     ORDER BY category ASC, title ASC`
  );
  return rows.map(hydratePage);
}

export async function getWikiCategories() {
  await openDatabase();
  return tursoQuery(
    `SELECT name, parent_name, description, display_order, created_at, updated_at
     FROM wiki_categories ORDER BY display_order ASC, name ASC`
  );
}

export async function getWikiHomepage({ includeUnpublished = false } = {}) {
  await openDatabase();
  const filter = includeUnpublished ? "" : "AND status = 'published'";
  let page = await tursoQueryOne(
    `SELECT ${PAGE_COLUMNS} FROM wiki_pages
     WHERE is_homepage = 1 ${filter} LIMIT 1`
  );
  if (!page) page = await getWikiPageBySlug("home", { includeUnpublished });
  return hydratePage(page);
}

export async function getWikiPageBySlug(slug, { includeUnpublished = false } = {}) {
  if (!slug) return null;
  await openDatabase();
  const normalized = normalizeWikiSlug(slug);
  const filter = includeUnpublished ? "" : "AND status = 'published'";
  const row = await tursoQueryOne(
    `SELECT ${PAGE_COLUMNS} FROM wiki_pages WHERE slug = ? ${filter} LIMIT 1`,
    [normalized]
  );
  return hydratePage(row);
}

export async function setWikiHomepage(slug) {
  await openDatabase();
  const normalized = normalizeWikiSlug(slug);
  const page = await getWikiPageBySlug(normalized, { includeUnpublished: true });
  if (!page) throw new Error("Page not found");

  await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1");
  await tursoExecute(
    "UPDATE wiki_pages SET is_homepage = 1, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
    [normalized]
  );
  return getWikiPageBySlug(normalized, { includeUnpublished: true });
}

export async function createWikiCategory({ name, description = "", parentName = null }) {
  await openDatabase();
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Category name is required");

  const existing = await tursoQueryOne("SELECT name FROM wiki_categories WHERE name = ? LIMIT 1", [trimmed]);
  if (existing) throw new Error("Category already exists");

  await tursoExecute(
    `INSERT INTO wiki_categories (name, parent_name, description) VALUES (?, ?, ?)`,
    [trimmed, String(parentName || "").trim() || null, String(description || "").trim()]
  );
  return tursoQueryOne(
    `SELECT name, parent_name, description, display_order, created_at, updated_at
     FROM wiki_categories WHERE name = ? LIMIT 1`,
    [trimmed]
  );
}

export async function updateWikiCategory(name, { description, parentName, newName, displayOrder } = {}) {
  await openDatabase();
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Category name is required");

  const existing = await tursoQueryOne("SELECT name FROM wiki_categories WHERE name = ? LIMIT 1", [trimmed]);
  if (!existing) throw new Error("Category not found");

  const renamed = newName ? String(newName).trim() : null;
  if (renamed && renamed !== trimmed) {
    const conflict = await tursoQueryOne("SELECT name FROM wiki_categories WHERE name = ? LIMIT 1", [renamed]);
    if (conflict) throw new Error("A category with that name already exists");
  }

  const setters = [];
  const params = [];
  if (description !== undefined) {
    setters.push("description = ?");
    params.push(String(description || "").trim());
  }
  if (parentName !== undefined) {
    setters.push("parent_name = ?");
    params.push(String(parentName || "").trim() || null);
  }
  if (displayOrder !== undefined) {
    setters.push("display_order = ?");
    params.push(Number(displayOrder) || 0);
  }
  if (setters.length) {
    setters.push("updated_at = CURRENT_TIMESTAMP");
    params.push(trimmed);
    await tursoExecute(`UPDATE wiki_categories SET ${setters.join(", ")} WHERE name = ?`, params);
  }

  if (renamed && renamed !== trimmed) {
    await tursoExecute("UPDATE wiki_categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?", [renamed, trimmed]);
    await tursoExecute("UPDATE wiki_categories SET parent_name = ?, updated_at = CURRENT_TIMESTAMP WHERE parent_name = ?", [renamed, trimmed]);
    await tursoExecute("UPDATE wiki_pages SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE category = ?", [renamed, trimmed]);
  }

  return tursoQueryOne(
    `SELECT name, parent_name, description, display_order, created_at, updated_at
     FROM wiki_categories WHERE name = ? LIMIT 1`,
    [renamed || trimmed]
  );
}

export async function reorderWikiCategories(orders) {
  await openDatabase();
  for (const order of orders || []) {
    await tursoExecute(
      "UPDATE wiki_categories SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?",
      [Number(order.display_order) || 0, String(order.name || "").trim()]
    );
  }
  return getWikiCategories();
}

export async function deleteWikiCategory(name) {
  await openDatabase();
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Category name is required");
  await tursoExecute("UPDATE wiki_categories SET parent_name = NULL WHERE parent_name = ?", [trimmed]);
  await tursoExecute("DELETE FROM wiki_categories WHERE name = ?", [trimmed]);
  return { deleted: trimmed };
}

export async function createWikiPage({
  title,
  slug,
  category,
  content,
  summary = "",
  tags = [],
  isHomepage = false,
  status = "draft",
  authorDiscordId = null,
}) {
  await openDatabase();
  const normalized = normalizeWikiSlug(slug || title);
  const cleanTitle = String(title || "").trim();
  const cleanContent = String(content || "").trim();
  const cleanStatus = WIKI_STATUSES.includes(status) ? status : "draft";
  if (!normalized || !cleanTitle || !cleanContent) throw new Error("Invalid wiki page data");

  const existing = await getWikiPageBySlug(normalized, { includeUnpublished: true });
  if (existing) throw new Error("Page already exists");

  if (isHomepage) await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1");

  await tursoExecute(
    `INSERT INTO wiki_pages
      (slug, title, category, content, is_homepage, status, summary, tags,
       author_discord_id, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
    [
      normalized,
      cleanTitle,
      String(category || "Uncategorized").trim(),
      cleanContent,
      isHomepage ? 1 : 0,
      cleanStatus,
      String(summary || "").trim(),
      serializeTags(tags),
      authorDiscordId,
      cleanStatus,
    ]
  );
  return getWikiPageBySlug(normalized, { includeUnpublished: true });
}

export async function updateWikiPage({
  slug,
  title,
  category,
  content,
  summary,
  tags,
  isHomepage,
}) {
  await openDatabase();
  const normalized = normalizeWikiSlug(slug);
  const existing = await getWikiPageBySlug(normalized, { includeUnpublished: true });
  if (!existing) throw new Error("Page not found");

  if (isHomepage === true) {
    await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1 AND slug != ?", [normalized]);
  }

  await tursoExecute(
    `UPDATE wiki_pages SET
       title = ?, category = ?, content = ?, summary = ?, tags = ?,
       is_homepage = ?, updated_at = CURRENT_TIMESTAMP
     WHERE slug = ?`,
    [
      String(title ?? existing.title).trim(),
      String(category ?? existing.category).trim(),
      String(content ?? existing.content).trim(),
      String(summary ?? existing.summary ?? "").trim(),
      serializeTags(tags ?? existing.tags),
      isHomepage === undefined ? (existing.is_homepage ? 1 : 0) : isHomepage ? 1 : 0,
      normalized,
    ]
  );
  return getWikiPageBySlug(normalized, { includeUnpublished: true });
}

export async function setWikiPageStatus(slug, status, reviewerDiscordId = null) {
  await openDatabase();
  const normalized = normalizeWikiSlug(slug);
  const cleanStatus = String(status || "").toLowerCase();
  if (!WIKI_STATUSES.includes(cleanStatus)) throw new Error("Invalid wiki status");

  const existing = await getWikiPageBySlug(normalized, { includeUnpublished: true });
  if (!existing) throw new Error("Page not found");

  await tursoExecute(
    `UPDATE wiki_pages SET
       status = ?,
       reviewer_discord_id = CASE WHEN ? = 'published' THEN ? ELSE reviewer_discord_id END,
       published_at = CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE published_at END,
       updated_at = CURRENT_TIMESTAMP
     WHERE slug = ?`,
    [cleanStatus, cleanStatus, reviewerDiscordId, cleanStatus, normalized]
  );
  return getWikiPageBySlug(normalized, { includeUnpublished: true });
}

export async function deleteWikiPage(slug) {
  await openDatabase();
  const normalized = normalizeWikiSlug(slug);
  if (!normalized) throw new Error("Invalid slug");
  const existing = await getWikiPageBySlug(normalized, { includeUnpublished: true });
  if (!existing) throw new Error("Page not found");
  if (normalized === "home") throw new Error("Cannot delete the home page");
  await tursoExecute("DELETE FROM wiki_pages WHERE slug = ?", [normalized]);
  return { deleted: normalized };
}

export async function searchWikiPages(query, { includeUnpublished = false, limit = 20 } = {}) {
  await openDatabase();
  const term = String(query || "").trim();
  if (!term) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50));
  const like = `%${term}%`;
  const statusFilter = includeUnpublished ? "" : "AND status = 'published'";
  const rows = await tursoQuery(
    `SELECT ${INDEX_COLUMNS}, content,
      CASE
        WHEN LOWER(title) = LOWER(?) THEN 100
        WHEN LOWER(title) LIKE LOWER(?) THEN 70
        WHEN LOWER(category) LIKE LOWER(?) THEN 40
        WHEN LOWER(summary) LIKE LOWER(?) THEN 30
        WHEN LOWER(tags) LIKE LOWER(?) THEN 20
        ELSE 10
      END AS relevance
     FROM wiki_pages
     WHERE (title LIKE ? OR category LIKE ? OR summary LIKE ? OR tags LIKE ? OR content LIKE ?)
       ${statusFilter}
     ORDER BY relevance DESC, updated_at DESC
     LIMIT ${safeLimit}`,
    [term, like, like, like, like, like, like, like, like, like]
  );
  return rows.map((row) => {
    const content = String(row.content || "").replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").trim();
    const lower = content.toLowerCase();
    const at = lower.indexOf(term.toLowerCase());
    const start = Math.max(0, at >= 0 ? at - 70 : 0);
    const excerpt = content.slice(start, start + 190).trim();
    const hydrated = hydratePage(row);
    delete hydrated.content;
    return { ...hydrated, excerpt: `${start > 0 ? "…" : ""}${excerpt}${content.length > start + 190 ? "…" : ""}` };
  });
}

export async function getWikiArticleContext(slug) {
  await openDatabase();
  const page = await getWikiPageBySlug(slug);
  if (!page) return null;

  const pages = await getWikiIndex();
  const categoryPages = pages
    .filter((item) => !item.is_homepage && item.category === page.category)
    .sort((a, b) => a.title.localeCompare(b.title));
  const index = categoryPages.findIndex((item) => item.slug === page.slug);

  const terms = [...new Set([...(page.tags || []), page.category])].filter(Boolean);
  const related = pages
    .filter((item) => item.slug !== page.slug && !item.is_homepage)
    .map((item) => {
      const sameCategory = item.category === page.category ? 3 : 0;
      const sharedTags = (item.tags || []).filter((tag) => terms.includes(tag)).length;
      return { ...item, score: sameCategory + sharedTags };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 4);

  return {
    page,
    previous: index > 0 ? categoryPages[index - 1] : null,
    next: index >= 0 && index < categoryPages.length - 1 ? categoryPages[index + 1] : null,
    related,
  };
}

export function getDefaultWikiContent() {
  return DEFAULT_WIKI_CONTENT;
}
