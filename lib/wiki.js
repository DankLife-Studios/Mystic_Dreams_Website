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
            `INSERT INTO wiki_pages (slug, title, category, content)
             VALUES (?, ?, ?, ?)`,
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
        `SELECT slug, title, category, updated_at FROM wiki_pages ORDER BY category ASC, title ASC`
    );
}

export async function getWikiPageBySlug(slug) {
    if (!slug) return null;
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    return tursoQueryOne(
        `SELECT slug, title, category, content, created_at, updated_at
         FROM wiki_pages WHERE slug = ? LIMIT 1`,
        [normalized]
    );
}

export async function createWikiPage({ title, slug, category, content }) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug || title);
    if (!normalized || !title || !content) {
        throw new Error("Invalid wiki page data");
    }

    const existing = await getWikiPageBySlug(normalized);
    if (existing) {
        throw new Error("Page already exists");
    }

    await tursoExecute(
        `INSERT INTO wiki_pages (slug, title, category, content)
         VALUES (?, ?, ?, ?)`,
        [normalized, title.trim(), category?.trim() || "Uncategorized", content.trim()]
    );
    return getWikiPageBySlug(normalized);
}

export async function updateWikiPage({ slug, title, category, content }) {
    await openDatabase();
    const normalized = normalizeWikiSlug(slug);
    if (!normalized || !title || !content) {
        throw new Error("Invalid wiki page data");
    }

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
