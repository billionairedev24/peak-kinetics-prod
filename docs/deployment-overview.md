# Deployment overview — UI vs backend

The biggest source of confusion in this stack is that **the frontend and backend live on different platforms with different URLs and different deploy mechanisms**. This document is the mental model. Read this before any of the week-by-week playbooks.

## The picture

```
                           A visitor types
                       peakkineticspt.com
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Cloudflare DNS      │  (all 4 domains live here)
                    │  + edge proxy        │
                    └─────────┬────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
 .net / .shop / .us    peakkineticspt.com   api.peakkineticspt.com
 (Bulk Redirect →)     www.peakkineticspt.com         │
        │                     │                      │
        └─→ 301 to ──────► CNAME @ , CNAME www       │
                              │                      │
                              ▼                      ▼
                    ┌──────────────────┐   ┌──────────────────┐
                    │ Cloudflare Pages │   │      Fly.io      │
                    │   (FRONTEND)     │   │    (BACKEND)     │
                    │                  │   │                  │
                    │ peak-kinetics-   │   │  peak-kinetics-  │
                    │ frontend.pages   │   │  api.fly.dev     │
                    │ .dev             │   │                  │
                    │                  │   │ Spring Boot 3    │
                    │ Next.js 16       │   │ Java 21          │
                    │ React 19         │   │ Tomcat :8080     │
                    │ static + edge    │   │                  │
                    │ functions        │   │                  │
                    └──────────────────┘   └────────┬─────────┘
                              │                     │
                              │   browser fetches   │
                              └────── via fetch ───►│
                                NEXT_PUBLIC_API_URL │
                              =https://api.peakkineticspt.com
                                                    │
                                                    ▼
                                          ┌───────────────────┐
                                          │  Aiven Postgres   │
                                          │  (external; only  │
                                          │  the backend      │
                                          │  connects here)   │
                                          └───────────────────┘
```

## Two completely separate things

| Concern | Frontend | Backend |
|---|---|---|
| **Code** | `frontend/` (Next.js) | `backend/` (Spring Boot) |
| **Platform** | Cloudflare Pages | Fly.io |
| **Project / app name** | `peak-kinetics-frontend` | `peak-kinetics-api` |
| **Raw platform URL** | `peak-kinetics-frontend.pages.dev` | `peak-kinetics-api.fly.dev` |
| **Production hostname** | `peakkineticspt.com` + `www.peakkineticspt.com` | `api.peakkineticspt.com` |
| **TLS cert** | Issued by Cloudflare automatically when you attach the custom domain | Issued by Let's Encrypt via `flyctl certs add` |
| **Build** | `next build && next-on-pages` (run by Cloudflare on git push) | `mvn package` then Docker, run by Fly's remote builder on `flyctl deploy` |
| **Deploy trigger** | git push to `main` (Pages reads the GitHub repo) | `flyctl deploy` from your laptop, or a GitHub Action |
| **Secrets / env vars** | Cloudflare Pages dashboard → project → Settings → Environment Variables, OR `wrangler.toml` `[vars]` block | `flyctl secrets set --app peak-kinetics-api ...` |
| **Database access** | **Never.** Frontend never touches the DB directly | Yes — connects to Aiven Postgres |
| **File storage** | N/A (static assets bundled at build) | Fly volume `/app/uploads` (Week 1) → Cloudflare R2 (Week 2) |

The frontend has **no Node server you manage** — it's static HTML/CSS/JS plus Cloudflare Workers (edge functions) for the few dynamic Next.js routes. There's nothing to SSH into. Cloudflare runs it.

The backend is a **single Java process** in a Docker container running on a Fly machine. You can `flyctl ssh console` into it to debug.

## How they talk

The browser loads HTML/JS from Cloudflare Pages. JavaScript in that page makes `fetch()` calls to `https://api.peakkineticspt.com` because the build was compiled with `NEXT_PUBLIC_API_URL=https://api.peakkineticspt.com` (set in `frontend/wrangler.toml [vars]`). Those calls hit Cloudflare's edge first, then are proxied to the Fly backend.

For those cross-origin calls to work, the backend's CORS config (`application.yml` `cors.allowed-origins`) has to include the frontend's hostname. It does:
- `https://peakkineticspt.com`
- `https://www.peakkineticspt.com`
- `https://*.peakkineticspt.com`
- `https://*.pages.dev` (so Pages preview deployments work too)

If you ever change the frontend's hostname, you must also update `cors.allowed-origins` in the backend.

## The bootstrap order (do this once, end-to-end)

This is the order that *makes sense* — each step depends on the previous one. Skipping ahead causes the kinds of "I get an empty response" / "cert is stuck pending" / "DNS doesn't resolve" issues you've already hit.

### Phase 1 — Cloudflare DNS (no deploys yet)

1. Move all 4 domains' nameservers to Cloudflare (`docs/cloudflare-domains.md` Steps 1–2). After this, Cloudflare is the source of truth for DNS, but no records point at anything new yet.
2. Set up Bulk Redirects for `.net` / `.shop` / `.us` → `.com` (Step 3). After this, alt-domain visitors land on `.com` even before there's anything serving `.com`.

**At this point, neither frontend nor backend is deployed. `peakkineticspt.com` still goes to your old GCE host (because you kept the old A record) and `api.peakkineticspt.com` doesn't exist.**

### Phase 2 — Backend on Fly.io

3. Bootstrap the Fly app, volume, and secrets (`docs/cloudflare-domains.md` Step 5a). The app exists in Fly but has no code yet.
4. **Deploy** (`flyctl deploy --remote-only --app peak-kinetics-api`). Now `peak-kinetics-api.fly.dev/actuator/health` returns `200` — the backend is up, but only on Fly's raw URL.
5. Add the DNS record `CNAME api → peak-kinetics-api.fly.dev` (proxied) in the `peakkineticspt.com` zone, then `flyctl certs add api.peakkineticspt.com`.
6. Wait for `flyctl certs show` to report `Ready`. Now `https://api.peakkineticspt.com/actuator/health` returns `200`.

**At this point, the backend is fully live at `api.peakkineticspt.com`. The frontend is still not deployed; `peakkineticspt.com` still goes to your old GCE host.**

### Phase 3 — Frontend on Cloudflare Pages

7. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** → pick this repo → set:
   - **Project name**: `peak-kinetics-frontend` (matches `frontend/wrangler.toml`)
   - **Production branch**: `main`
   - **Framework preset**: Next.js
   - **Build command**: `pnpm install && pnpm pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `frontend`
8. In the project's **Settings → Environment Variables**, add `NEXT_PUBLIC_API_URL=https://api.peakkineticspt.com` for **Production** (and for **Preview** if you want previews to hit prod, otherwise point them at a staging API). Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` once you have it.
9. Trigger a build (push to `main` or click **Retry deployment**). After it succeeds, the site is live at `peak-kinetics-frontend.pages.dev`.

**At this point, the frontend is reachable on the `*.pages.dev` URL. `peakkineticspt.com` still goes to GCE.**

### Phase 4 — Cutover (the irreversible step)

10. In the Pages project → **Custom domains** → **Set up a custom domain** → add both `peakkineticspt.com` and `www.peakkineticspt.com`. Cloudflare will say "we'll create the DNS records for you" — let it.
11. The DNS records that get created replace your old GCE A record. Within seconds, `peakkineticspt.com` starts serving from Pages instead of GCE.
12. Verify in a fresh browser tab: `https://peakkineticspt.com` shows the new site, network tab shows `fetch` calls to `api.peakkineticspt.com` returning data.

**Now everything is live on the new stack.** Keep the GCE VM running for a week as a rollback (you can switch DNS back if something goes wrong).

## Going forward — how each piece deploys

Once the bootstrap is done, day-to-day deploys are simple. They are **fully independent** — you can ship a frontend change without touching the backend, and vice versa.

### Backend deploy

Two options — pick one:

**Manual (from your laptop):**
```bash
cd /Users/billionairedev/workspace/peak-kinetics-prod
flyctl deploy --remote-only --app peak-kinetics-api
```

**CI (recommended once you trust it):** a GitHub Action that runs the same command on push to `main` whenever `backend/**`, `fly.toml`, or `Dockerfile` changes. See `docs/cloudflare-domains.md` Step 5b — there's a workflow you can add at `.github/workflows/fly-deploy.yml`.

### Frontend deploy

**Automatic (default, set up in Phase 3):** push to `main` → Cloudflare Pages detects the push → builds and deploys. ~2–3 minutes. You don't run any command. Watch progress at the Pages project's **Deployments** tab.

**Manual override (rare — for one-off testing):**
```bash
cd frontend
pnpm pages:build
npx wrangler pages deploy .vercel/output/static --project-name peak-kinetics-frontend
```

**Preview deploys:** every non-`main` branch and every PR gets its own auto-deployed preview URL like `<commit-sha>.peak-kinetics-frontend.pages.dev`. Useful for review without touching prod.

## Common confusions, explained

**"I deployed but `api.peakkineticspt.com` doesn't work."**
Deploy alone isn't enough — you also need (a) the DNS CNAME in the `peakkineticspt.com` zone, and (b) `flyctl certs add` to issue the cert. The Fly app is reachable at `peak-kinetics-api.fly.dev` immediately; the custom domain takes the extra two steps.

**"I see `peak-kinetics.pages.dev` in the docs — is that production or staging?"**
Production. Cloudflare Pages calls its production hostname `<project>.pages.dev` regardless of environment. Preview/staging deploys live at `<sha>.<project>.pages.dev` — different URL pattern.

**"Where do I set frontend env vars — `wrangler.toml`, `.env.production`, or the Pages dashboard?"**
For Next.js + Cloudflare Pages, **build-time** vars (`NEXT_PUBLIC_*`) need to exist when `pnpm pages:build` runs. Either source works:
- `frontend/wrangler.toml [vars]` — committed to git, fine for non-secrets like `NEXT_PUBLIC_API_URL`.
- Pages dashboard → Settings → Environment Variables — required for secrets, scoped per environment (Production / Preview).

`.env.production` is for `next start` (Node server) and isn't read in the Pages build path. Don't rely on it for production.

**"I changed backend code but the frontend still shows old data."**
Did you deploy the backend? `flyctl deploy` is required — pushing to git only triggers the frontend build. Confirm with `flyctl status` showing your latest commit SHA.

**"I changed frontend code but Pages didn't deploy."**
Check that you pushed to `main`, not a feature branch. Feature branches build to preview URLs only. Also check the Pages **Deployments** tab — failed builds appear there with logs.

**"Can the frontend and backend share secrets?"**
No, and they shouldn't. Backend secrets (DB password, JWT secret, Twilio token) live in `flyctl secrets`. Frontend env vars are public anything prefixed `NEXT_PUBLIC_*` ships in the bundle and is visible in browser devtools — never put a real secret there. The Turnstile **site key** is public; the Turnstile **secret key** is backend-only.

**"How do I see what the backend is doing right now?"**
```bash
flyctl logs --app peak-kinetics-api      # live tail
flyctl status --app peak-kinetics-api    # machine state
flyctl ssh console --app peak-kinetics-api  # shell into the running container
```

**"How do I see what the frontend build did?"**
Cloudflare Pages dashboard → your project → **Deployments** tab → click any deployment → **Build log** and **Deployment log** are in the side panel. Failed builds are red and tell you the error.

## Map back to the playbooks

This document is just the model. The step-by-step playbooks live elsewhere:

- Phase 1 (DNS + redirects): `docs/cloudflare-domains.md` Steps 1–4
- Phase 2 (backend deploy): `docs/cloudflare-domains.md` Steps 5–6, plus checklist in `docs/week1-manual-steps.md`
- Phase 3 (frontend on Pages): `docs/week2-manual-steps.md` §4
- Phase 4 (cutover): `docs/week2-manual-steps.md` §6

If anything in this overview disagrees with a playbook, the playbook is more current — open an issue (or just update this doc).
