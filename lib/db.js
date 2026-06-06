import mysql from "mysql2/promise";

let pool = null;

function parseDatabaseUrl(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return {
            host: parsed.hostname,
            port: parsed.port ? Number(parsed.port) : 3306,
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            database: parsed.pathname.replace(/^\//, ""),
        };
    } catch {
        return null;
    }
}

export function getPool() {
    if (pool) return pool;

    const config = parseDatabaseUrl(process.env.DATABASE_URL);
    if (!config) {
        return null;
    }

    pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // Vercel serverless: close connections after idle to avoid connection leaks
        idleTimeout: 10000,
    });

    return pool;
}

export async function query(sql, params = []) {
    const p = getPool();
    if (!p) {
        throw new Error("Database not configured");
    }
    const [rows] = await p.execute(sql, params);
    return rows;
}

/**
 * Check if the Qbox (game server) MySQL database is available.
 */
export function isDatabaseConfigured() {
    return Boolean(process.env.DATABASE_URL);
}
