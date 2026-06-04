# Mystic Dreams RP — Website

Modern community website for **Mystic Dreams RP** — built with Next.js 15 (JavaScript), Tailwind CSS v4, Discord OAuth, and Qbox MySQL integration for the player dashboard.

## Stack

- Next.js 15 (App Router, JavaScript only)
- Tailwind CSS v4
- Auth.js v5 + Discord
- mysql2 (read-only Qbox queries)

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Discord + DATABASE_URL + AUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home + feature preview |
| `/features` | Full server feature list |
| `/connect` | Whitelist + FiveM setup (get started) |
| `/whitelist` | Redirects to `/connect#whitelist` |
| `/dashboard` | Discord login + character info |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel and production setup.
