import { createClient } from "@libsql/client";

let client = null;

export function getTursoClient() {
    if (client) return client;

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        return null;
    }

    client = createClient({ url, authToken });
    return client;
}

export async function tursoQuery(sql, params = []) {
    const c = getTursoClient();
    if (!c) {
        throw new Error("Turso database not configured");
    }
    const result = await c.execute({ sql, args: params });
    return result.rows.map((row) => {
        const obj = {};
        for (const col of result.columns) {
            obj[col] = row[col];
        }
        return obj;
    });
}

export async function tursoQueryOne(sql, params = []) {
    const rows = await tursoQuery(sql, params);
    return rows[0] || null;
}

export async function tursoExecute(sql, params = []) {
    const c = getTursoClient();
    if (!c) {
        throw new Error("Turso database not configured");
    }
    return c.execute({ sql, args: params });
}

/**
 * Ensures the wiki tables exist in the Turso database.
 * Safe to call on every request — uses IF NOT EXISTS.
 */
export async function ensureWikiSchema() {
    const c = getTursoClient();
    if (!c) return;

    await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS wiki_pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wiki_categories (
      name TEXT PRIMARY KEY,
      description TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
