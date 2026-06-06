import { tursoQuery, tursoQueryOne, tursoExecute, ensureWikiSchema } from "./turso";

const DEFAULT_WIKI_CONTENT = `# Mystic Dreams Wiki

Welcome to the Mystic Dreams public wiki.
This page is visible to everyone. Signed-in editors with the correct Discord role can add pages, categories, and keep knowledge up to date.

## What to add

- City rules and roleplay expectations
- Business owner notes and storefront locations
- Community resources, events, and updates
- Helpful links for new players and staff

## Editing

If you have the editor role, use the editor to build the wiki with pages and categories.
`;
const DEFAULT_PAGE = {
    slug: "home",
    title: "Main Page",
    category: "General",
    content: DEFAULT_WIKI_CONTENT,
};

let schemaReady = false;

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

async function seedDefaultPage() {
    const existing = await tursoQueryOne("SELECT slug FROM wiki_pages LIMIT 1");
    if (!existing) {
        await tursoExecute(
            `INSERT INTO wiki_pages (slug, title, category, content, is_homepage)
             VALUES (?, ?, ?, ?, 1)`,
            [DEFAULT_PAGE.slug, DEFAULT_PAGE.title, DEFAULT_PAGE.category, DEFAULT_PAGE.content]
        );
    }
}

async function openDatabase() {
    await initSchema();
    await seedDefaultPage();
}

export async function getWikiIndex() {
    await openDatabase();
    return tursoQuery(
        `SELECT slug, title, category, is_homepage, updated_at FROM wiki_pages ORDER BY category ASC, title ASC`
    );
}

/** Returns all categories with their parent hierarchy, ordered by display_order then name. */
export async function getWikiCategories() {
    await openDatabase();
    return tursoQuery(
        `SELECT name, parent_name, description, display_order, created_at, updated_at
         FROM wiki_categories ORDER BY display_order ASC, name ASC`
    );
}

/** Returns the page currently designated as homepage, or the "home" slug page as fallback. */
export async function getWikiHomepage() {
    await openDatabase();
    let page = await tursoQueryOne(
        `SELECT slug, title, category, content, is_homepage, created_at, updated_at
         FROM wiki_pages WHERE is_homepage = 1 LIMIT 1`
    );
    if (!page) {
        page = await getWikiPageBySlug("home");
    }
    return page;
}

/** Sets the given page as the homepage (unsets all others first). */
export async function setWikiHomepage(slug) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    if (!normalized) throw new Error("Invalid slug");

    const page = await getWikiPageBySlug(normalized);
    if (!page) throw new Error("Page not found");

    // Unset all
    await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1");
    // Set the one
    await tursoExecute("UPDATE wiki_pages SET is_homepage = 1 WHERE slug = ?", [normalized]);
    return getWikiPageBySlug(normalized);
}

/** Creates a new standalone category, optionally nested under a parent. */
export async function createWikiCategory({ name, description = "", parentName = null }) {
    await openDatabase();
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("Category name is required");

    const existing = await tursoQueryOne(
        "SELECT name FROM wiki_categories WHERE name = ? LIMIT 1",
        [trimmed]
    );
    if (existing) throw new Error("Category already exists");

    const parent = (parentName || "").trim() || null;

    await tursoExecute(
        `INSERT INTO wiki_categories (name, parent_name, description)
         VALUES (?, ?, ?)`,
        [trimmed, parent, (description || "").trim()]
    );
    return tursoQueryOne(
        "SELECT name, parent_name, description, display_order, created_at, updated_at FROM wiki_categories WHERE name = ? LIMIT 1",
        [trimmed]
    );
}

/** Updates a category's description, parent, and display order. */
export async function updateWikiCategory(name, { description, parentName, displayOrder } = {}) {
    await openDatabase();
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("Category name is required");

    const existing = await tursoQueryOne(
        "SELECT name FROM wiki_categories WHERE name = ? LIMIT 1",
        [trimmed]
    );
    if (!existing) throw new Error("Category not found");

    const parent = parentName !== undefined ? ((parentName || "").trim() || null) : undefined;
    const order = displayOrder !== undefined ? Number(displayOrder) : undefined;

    const setClauses = [];
    const params = [];

    if (description !== undefined) {
        setClauses.push("description = ?");
        params.push((description || "").trim());
    }
    if (parent !== undefined) {
        setClauses.push("parent_name = ?");
        params.push(parent);
    }
    if (order !== undefined) {
        setClauses.push("display_order = ?");
        params.push(order);
    }

    if (setClauses.length > 0) {
        setClauses.push("updated_at = CURRENT_TIMESTAMP");
        params.push(trimmed);
        await tursoExecute(
            `UPDATE wiki_categories SET ${setClauses.join(", ")} WHERE name = ?`,
            params
        );
    }

    return tursoQueryOne(
        "SELECT name, parent_name, description, display_order, created_at, updated_at FROM wiki_categories WHERE name = ? LIMIT 1",
        [trimmed]
    );
}

/** Bulk updates display_order for multiple categories. */
export async function reorderWikiCategories(orders) {
    await openDatabase();
    for (const { name, display_order } of orders) {
        await tursoExecute(
            "UPDATE wiki_categories SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?",
            [Number(display_order), String(name).trim()]
        );
    }
    return getWikiCategories();
}

/** Deletes a category (does NOT delete pages in that category — they remain with the category name as text). */
export async function deleteWikiCategory(name) {
    await openDatabase();
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("Category name is required");

    const existing = await tursoQueryOne(
        "SELECT name FROM wiki_categories WHERE name = ? LIMIT 1",
        [trimmed]
    );
    if (!existing) throw new Error("Category not found");

    await tursoExecute("DELETE FROM wiki_categories WHERE name = ?", [trimmed]);
    return { deleted: trimmed };
}

export async function getWikiPageBySlug(slug) {
    if (!slug) return null;
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    return tursoQueryOne(
        `SELECT slug, title, category, content, is_homepage, created_at, updated_at
         FROM wiki_pages WHERE slug = ? LIMIT 1`,
        [normalized]
    );
}

export async function createWikiPage({ title, slug, category, content, isHomepage = false }) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug || title);
    if (!normalized || !title || !content) {
        throw new Error("Invalid wiki page data");
    }

    const existing = await getWikiPageBySlug(normalized);
    if (existing) {
        throw new Error("Page already exists");
    }

    // If setting as homepage, unset any existing homepage first
    if (isHomepage) {
        await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1");
    }

    await tursoExecute(
        `INSERT INTO wiki_pages (slug, title, category, content, is_homepage)
         VALUES (?, ?, ?, ?, ?)`,
        [normalized, title.trim(), category?.trim() || "Uncategorized", content.trim(), isHomepage ? 1 : 0]
    );
    return getWikiPageBySlug(normalized);
}

export async function updateWikiPage({ slug, title, category, content, isHomepage }) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    if (!normalized || !title || !content) {
        throw new Error("Invalid wiki page data");
    }

    // If setting as homepage, unset any existing homepage first
    if (isHomepage) {
        await tursoExecute("UPDATE wiki_pages SET is_homepage = 0 WHERE is_homepage = 1 AND slug != ?", [normalized]);
    }

    const isHomepageVal = isHomepage === true ? 1 : (isHomepage === false ? 0 : undefined);

    if (isHomepageVal !== undefined) {
        await tursoExecute(
            `INSERT INTO wiki_pages (slug, title, category, content, is_homepage)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(slug) DO UPDATE SET
               title = excluded.title,
               category = excluded.category,
               content = excluded.content,
               is_homepage = excluded.is_homepage,
               updated_at = CURRENT_TIMESTAMP`,
            [normalized, title.trim(), category?.trim() || "Uncategorized", content.trim(), isHomepageVal]
        );
    } else {
        await tursoExecute(
            `INSERT INTO wiki_pages (slug, title, category, content)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(slug) DO UPDATE SET
               title = excluded.title,
               category = excluded.category,
               content = excluded.content,
               updated_at = CURRENT_TIMESTAMP`,
            [normalized, title.trim(), category?.trim() || "Uncategorized", content.trim()]
        );
    }
    return getWikiPageBySlug(normalized);
}

export async function deleteWikiPage(slug) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    if (!normalized) {
        throw new Error("Invalid slug");
    }

    const existing = await getWikiPageBySlug(normalized);
    if (!existing) {
        throw new Error("Page not found");
    }

    if (normalized === "home") {
        throw new Error("Cannot delete the home page");
    }

    await tursoExecute(`DELETE FROM wiki_pages WHERE slug = ?`, [normalized]);
    return { deleted: normalized };
}

export function getDefaultWikiContent() {
    return DEFAULT_WIKI_CONTENT;
}
