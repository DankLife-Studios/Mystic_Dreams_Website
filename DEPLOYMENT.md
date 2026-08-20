# Mystic Dreams Website — Deployment Checklist

## 1. Discord application

1. Configure Discord OAuth redirects for local development and the production domain.
2. Set `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `AUTH_SECRET`, and `AUTH_URL`.
3. Configure the bot token and guild ID used for membership/role checks.
4. Set `DISCORD_CITIZEN_ROLE_ID` for whitelist status.
5. Set website staff permissions with comma-separated role IDs:
   - `DISCORD_STAFF_ROLE_IDS` — Website Administration, City Directory management, staff character search.
   - `DISCORD_WIKI_EDITOR_ROLE_IDS` — create/edit wiki drafts and submit them for review.
   - `DISCORD_WIKI_REVIEWER_ROLE_IDS` — approve/publish reviewed wiki articles.

`DISCORD_WIKI_EDITOR_ROLE_ID` remains supported as a legacy single-role fallback.

## 2. MySQL — read-only game data

Use a dedicated read-only account. The current website reads these Qbox tables:

```sql
GRANT SELECT ON mystic_dreams.users TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.players TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.player_groups TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.bans TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.player_vehicles TO 'mystic_web_readonly'@'%';
FLUSH PRIVILEGES;
```

Set `DATABASE_URL=mysql://mystic_web_readonly:PASSWORD@HOST/mystic_dreams`.

**Do not grant INSERT, UPDATE, DELETE, or schema permissions to the website account.** Staff character search remains read-only.

> Housing/property information is intentionally not queried until the exact housing resource/table is documented and explicitly added to the read-only grant.

## 3. Turso — website-managed content

Set:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

The app auto-creates/migrates:

- Wiki pages/categories and Draft → Review → Published workflow fields.
- City Directory website metadata (description, logo, phone, hours, services, hiring status, featured state).

Existing wiki rows are preserved and migrate as Published.

## 4. Vercel

1. Import the production repository/branch.
2. Framework: Next.js.
3. Add all variables from `.env.example`.
4. Set production `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`.
5. Generate a secure `AUTH_SECRET`.
6. Ensure the database host accepts Vercel egress traffic using the network approach appropriate to the deployment plan.

## 5. Post-deploy FiveM links

Update any FiveM resources that point players to the main website so they use the production Mystic Dreams website URL.

## 6. Verify

- [ ] Home is centered on desktop and mobile.
- [ ] Light/dark theme persists.
- [ ] Sidebar is present and Showcase opens in a new tab.
- [ ] `/features` redirects to `/about`.
- [ ] Wiki reads work without signing in.
- [ ] Wiki search finds title/category/summary/tags/content matches.
- [ ] New wiki pages start as Draft and can move through Review to Published.
- [ ] Discord login works.
- [ ] Character dashboard shows only the signed-in player's linked characters.
- [ ] Expanded character identity/job/gang/finance/license/status/vehicle information renders when available.
- [ ] City Directory remains login-only and combines Qbox ownership with Turso website metadata.
- [ ] `/admin` is denied to non-staff/non-editor accounts.
- [ ] Staff character search works without any write permission to the game database.
