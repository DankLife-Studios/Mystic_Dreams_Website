import { createClient } from "@libsql/client";

let client = null;
let wikiSchemaReady = false;
let citySchemaReady = false;

export function getTursoClient() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;

  client = createClient({ url, authToken });
  return client;
}

export async function tursoQuery(sql, params = []) {
  const c = getTursoClient();
  if (!c) throw new Error("Turso database not configured");

  const result = await c.execute({ sql, args: params });
  return result.rows.map((row) => {
    const object = {};
    for (const column of result.columns) object[column] = row[column];
    return object;
  });
}

export async function tursoQueryOne(sql, params = []) {
  const rows = await tursoQuery(sql, params);
  return rows[0] || null;
}

export async function tursoExecute(sql, params = []) {
  const c = getTursoClient();
  if (!c) throw new Error("Turso database not configured");
  return c.execute({ sql, args: params });
}

async function runMigrations(migrations, label) {
  for (const sql of migrations) {
    try {
      await tursoExecute(sql);
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (!message.includes("duplicate column") && !message.includes("already exists")) {
        console.warn(`${label} schema migration warning:`, error.message);
      }
    }
  }
}

export async function ensureWikiSchema() {
  if (wikiSchemaReady) return;
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

  await runMigrations(
    [
      `ALTER TABLE wiki_pages ADD COLUMN is_homepage INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE wiki_pages ADD COLUMN status TEXT NOT NULL DEFAULT 'published'`,
      `ALTER TABLE wiki_pages ADD COLUMN summary TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE wiki_pages ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE wiki_pages ADD COLUMN author_discord_id TEXT`,
      `ALTER TABLE wiki_pages ADD COLUMN reviewer_discord_id TEXT`,
      `ALTER TABLE wiki_pages ADD COLUMN published_at DATETIME`,
      `ALTER TABLE wiki_categories ADD COLUMN parent_name TEXT`,
    ],
    "Wiki"
  );

  await c.executeMultiple(`
    CREATE INDEX IF NOT EXISTS idx_wiki_pages_status ON wiki_pages(status);
    CREATE INDEX IF NOT EXISTS idx_wiki_pages_category ON wiki_pages(category);
    CREATE INDEX IF NOT EXISTS idx_wiki_pages_updated_at ON wiki_pages(updated_at);
  `);

  // Preserve existing content as published when upgrading from the old schema.
  await tursoExecute(
    `UPDATE wiki_pages
     SET status = COALESCE(NULLIF(status, ''), 'published'),
         published_at = CASE
           WHEN COALESCE(NULLIF(status, ''), 'published') = 'published'
             THEN COALESCE(published_at, updated_at, created_at, CURRENT_TIMESTAMP)
           ELSE published_at
         END`
  );

  wikiSchemaReady = true;
}

export async function ensureCityDirectorySchema() {
  if (citySchemaReady) return;
  const c = getTursoClient();
  if (!c) return;

  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS city_directory_entries (
      job_key TEXT PRIMARY KEY,
      display_name TEXT,
      description TEXT NOT NULL DEFAULT '',
      logo_url TEXT,
      phone TEXT,
      hours TEXT,
      services TEXT NOT NULL DEFAULT '[]',
      hiring_status TEXT NOT NULL DEFAULT 'unknown',
      location_override TEXT,
      category_override TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      updated_by_discord_id TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_city_directory_featured
      ON city_directory_entries(is_featured, updated_at);
  `);

  citySchemaReady = true;
}
