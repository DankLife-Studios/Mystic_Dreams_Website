# Mystic Dreams RP — Website

Community portal for **Mystic Dreams RP**, built with Next.js, Tailwind CSS, Discord/Auth.js, a read-only Qbox MySQL connection, and Turso for website-managed content.

## Main experiences

| Route | Purpose |
|---|---|
| `/` | Centered community portal home |
| `/about` | Community story, roleplay philosophy, and gameplay pillars |
| `/features` | Compatibility redirect to `/about` |
| `/connect` | Whitelist and FiveM setup |
| `/wiki` | Public searchable player wiki |
| `/dashboard` | Discord-authenticated character dashboard |
| `/city` | Discord-authenticated in-universe City Directory |
| `/admin` | Role-protected Wiki, Directory, and character staff tools |

The main sidebar, Mystic Dreams visual theme, and light/dark theme toggle remain part of the global shell. The **Showcase** link opens `https://showcases.mysticdreamsrp.online/` in a new tab from the sidebar, Home, and Footer.

## Data boundaries

- **Qbox/MySQL:** read-only. Used for linked accounts, characters, jobs/gangs, supported metadata, vehicles, and live business ownership.
- **Turso:** writable website content. Used for Wiki content/workflow and City Directory descriptions, logos, services, hours, and hiring state.
- **Discord:** authentication plus guild-role permissions.

The website never writes character or game-state changes back to Qbox/MySQL.

## Wiki workflow

New articles are created as **Draft**. Approved editors can submit them for **Review**; reviewer roles can move them to **Published**. Existing wiki articles are migrated as Published so an upgrade does not unexpectedly hide existing documentation.

Default top-level categories are:

Getting Started, Rules, City Life, Jobs, Businesses, Vehicles, Crime, Police, Medical, Systems, Guides, and FAQ.

Wiki articles support normal Markdown/GFM plus themed callouts (blockquotes), tables, images, gallery code blocks, YouTube code blocks, and button-style Markdown links.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Discord, DATABASE_URL, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, and AUTH_SECRET.
npm run dev
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production configuration and required database permissions.
