# Mystic Dreams Website — Deployment Checklist

## 1. Discord Application

1. Create an application at [Discord Developer Portal](https://discord.com/developers/applications).
2. **OAuth2** → Redirects:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://YOUR_DOMAIN/api/auth/callback/discord`
3. Copy **Client ID** and **Client Secret** to Vercel env.
4. **Bot** → Enable **Server Members Intent** → invite bot to your guild with `guilds.members.read`.
5. Copy **Bot Token** to `DISCORD_BOT_TOKEN` (never commit).

## 2. MySQL (read-only user)

On your database host:

```sql
CREATE USER 'mystic_web_readonly'@'%' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT SELECT ON mystic_dreams.users TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.players TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.player_groups TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.bans TO 'mystic_web_readonly'@'%';
GRANT SELECT ON mystic_dreams.player_vehicles TO 'mystic_web_readonly'@'%';
FLUSH PRIVILEGES;
```

Set `DATABASE_URL=mysql://mystic_web_readonly:PASSWORD@HOST/mystic_dreams`

**Firewall:** Vercel serverless uses dynamic IPs. Use [Vercel Static IPs](https://vercel.com/docs/connectivity/static-ips) (Pro) or allow the required egress range for your host.

## 3. Vercel

1. Import `DankLife-Studios/Mystic_Dreams_Website`, branch `Live`.
2. Framework: **Next.js**.
3. Add all variables from `.env.example`.
4. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production URL.
5. Generate `AUTH_SECRET`: `openssl rand -base64 32`

## 4. Post-deploy (FiveM)

- Update pause menu website URL in `qbx_core/config/client.lua`.
- Uncomment Mystic_Queue website button with your Vercel URL.
- Fix `qbx:discordLink` in `server.cfg` to `discord.gg/wtJNvB3bSK`.

## 5. Vehicle display names (optional)

Dashboard vehicle titles use Qbox `vehicles.lua` labels. After adding custom cars on the server, regenerate and commit:

```bash
npm run generate:vehicles
# or: node scripts/generate-vehicle-labels.mjs "F:/path/to/qbx_core/shared/vehicles.lua"
```

## 6. Verify

- [ ] Public pages load (Home, Features, Whitelist, Connect)
- [ ] Light/dark theme persists
- [ ] Discord login works
- [ ] Guild + Citizen role badges show correctly
- [ ] Characters appear after linking via first FiveM connect
