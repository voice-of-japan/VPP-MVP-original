# VPP — Cloudflare deploy

Architecture: **Pages (frontend) + Worker (API) + Durable Object (live state) + KV (post-rally archive) + Cron Trigger (purge)** — all in one Cloudflare account.

## One-time setup (in Otoya's Cloudflare account)

1. **Create the KV namespace**
   ```sh
   npx wrangler kv namespace create VPP_ARCHIVE --config worker/wrangler.toml
   ```
   Copy the returned `id` into `worker/wrangler.toml` under the `[[kv_namespaces]]` block (replace `REPLACE_WITH_KV_NAMESPACE_ID`).

2. **Deploy the Worker** (creates the `RallyRoom` Durable Object too)
   ```sh
   npm run worker:deploy
   ```
   This publishes `vpp-worker` and registers the DO migration. After this you'll have a public URL like `vpp-worker.<account>.workers.dev`.

3. **Build + deploy the Pages project** (frontend, direct upload — no GitHub repo)
   ```sh
   npm run build
   npx wrangler pages project create vpp --production-branch main   # first time only
   npx wrangler pages deploy dist --project-name vpp
   ```
   Output directory is `dist` (includes `public/_redirects` for the SPA fallback).

4. **Bind the domain** (`will-of-america.net`)
   - In **Pages → vpp → Custom domains**: add `will-of-america.net`. Cloudflare attaches it automatically (apex via CNAME flattening) — no A record / IP needed.
   - The Worker route `will-of-america.net/api/*` → `vpp-worker` is set in `worker/wrangler.toml` (`[[routes]]`) and registered on `npm run worker:deploy`. If you also serve `www`, add a second route `www.will-of-america.net/api/*`.

   Once both are bound on the same domain, the frontend at `/` and the API at `/api/*` share an origin — WebSockets and fetches Just Work, no CORS. The app only works fully on `will-of-america.net`, not the `*.pages.dev` URL (no `/api/*` route there).

## Local development

Two terminals:
```sh
# terminal 1 — worker (port 8787, local DO + local KV)
npm run worker:dev

# terminal 2 — frontend (port 5173, proxies /api → 8787)
npm run dev
```

Open `http://localhost:5173`. Multiple browser tabs simulate multiple participants.

## Daily ops

- **Purge** runs automatically at **8:00 PM ET** (rally end) — all participants are wiped (oblivion). The Cron fires at both `00:00` and `01:00 UTC` and the worker purges only at 20:00 ET, so it stays correct across DST. Aggregates land in KV under `rally:YYYY-MM-DD`.
- **`/api/purge` is blocked publicly** (`worker/src/index.ts` returns 404 for it) so nobody can wipe the live rally. The Cron triggers purge internally via `scheduled()` → the DO's `/purge`, which bypasses the public handler.
- To wipe manually for testing, trigger the scheduled handler locally (`wrangler dev` → invoke the cron) rather than hitting a public URL.

## What to tell Otoya

> "It's a static frontend on Cloudflare Pages + a Worker + Durable Object for the live rally state — no traditional server with an IP. To attach `will-of-america.net`, just add the domain inside the Pages project; Cloudflare wires it up automatically. The API uses the same domain via a Worker route on `/api/*`, so we don't need any A/CNAME record beyond the Pages binding."
