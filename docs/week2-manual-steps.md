# Week 2 — manual steps you run yourself

Code + config changes are already in the repo. This document covers what you have to do by hand.

> Pre-req: Week 1 manual steps complete. Backend reachable at `https://api.peakkineticspt.com`. All 4 domains on Cloudflare DNS with `.net/.shop/.us` redirecting to `.com`.

---

## 1. Cloudflare R2 bucket + access keys

1. Cloudflare dashboard → **R2 Object Storage** → **Create bucket**
   - Name: `peak-kinetics-uploads`
   - Region: **Automatic** (R2 is global)
2. Open the bucket → **Settings** → **Public Access**:
   - Either enable the `r2.dev` development URL (fast, but rate-limited; fine to start) **or** attach a custom domain `cdn.peakkineticspt.com` (recommended for prod):
     - Cloudflare DNS → Add `CNAME cdn → public-bucket-name.r2.dev`, **Proxied (orange cloud)**
     - Back in R2 bucket → Custom Domains → Connect `cdn.peakkineticspt.com`
3. Under **Manage R2 API Tokens** → **Create API Token**:
   - Permissions: **Object Read & Write**
   - Bucket: limit to `peak-kinetics-uploads`
   - TTL: no expiry (rotate on a schedule)
4. Save the **Access Key ID**, **Secret Access Key**, and the **S3 Endpoint** (looks like `https://<account-hash>.r2.cloudflarestorage.com`).

Set on Fly:

```bash
flyctl secrets set --app peak-kinetics-api \
  R2_ENDPOINT='https://<account-hash>.r2.cloudflarestorage.com' \
  R2_ACCESS_KEY_ID='...' \
  R2_SECRET_ACCESS_KEY='...' \
  R2_BUCKET='peak-kinetics-uploads' \
  R2_PUBLIC_BASE_URL='https://cdn.peakkineticspt.com'
```

If `R2_PUBLIC_BASE_URL` is omitted, the backend falls back to the raw S3 URL.

- [ ] Bucket created.
- [ ] R2 API token created and stored.
- [ ] `cdn.peakkineticspt.com` (or r2.dev URL) reachable.
- [ ] Fly secrets set.
- [ ] Test: `curl -X POST https://api.peakkineticspt.com/api/upload/presign -H 'Cf-Access-Jwt-Assertion: <jwt>' -H 'Content-Type: application/json' -d '{"filename":"test.png","contentType":"image/png"}'` returns `{ uploadUrl, publicUrl, key }`.

---

## 2. Cloudflare Access for /admin

1. Cloudflare dashboard → **Zero Trust** → first-time setup picks your team domain like `peak-kinetics.cloudflareaccess.com`. Note this domain.
2. **Access → Applications → Add an application** → **Self-hosted**
   - Name: `Peak Kinetics Admin`
   - Session duration: 8 hours
   - Application domain: `api.peakkineticspt.com`, path: `/admin/*`
   - Add another rule for the same app: `api.peakkineticspt.com` path `/api/admin/*`
3. **Identity providers**: enable **One-time PIN** (email OTP) at minimum. Optionally also Google or GitHub.
4. **Access policy**:
   - Action: **Allow**
   - Include: **Emails** → list of admin emails
   - (Optional) Require: **MFA** for stronger access
5. Save. Click **Get the audience tag (AUD)** in the application settings — copy it.

Set on Fly:

```bash
flyctl secrets set --app peak-kinetics-api \
  CLOUDFLARE_ACCESS_TEAM_DOMAIN='https://peak-kinetics.cloudflareaccess.com' \
  CLOUDFLARE_ACCESS_AUDIENCE='<AUD-tag-from-step-5>'
```

- [ ] Access app created and saved.
- [ ] Policy includes correct admin emails.
- [ ] AUD captured.
- [ ] Fly secrets set.
- [ ] Test: in a browser, navigate to `https://api.peakkineticspt.com/admin` — Cloudflare interstitial appears. After authenticating, the request reaches Spring with a valid `Cf-Access-Jwt-Assertion` header.
- [ ] Test from CLI: `curl -i https://api.peakkineticspt.com/admin/whatever` returns `401` JSON (expected — no JWT).

---

## 3. Cloudflare Turnstile

1. Cloudflare dashboard → **Turnstile** → **Add a site**
   - Name: `peak-kinetics-public-forms`
   - Domain: `peakkineticspt.com` (and add `*.pages.dev` if you want preview deploys to work)
   - Widget mode: **Managed** (default)
2. Save. Copy the **Site Key** and **Secret Key**.

Set on Fly (backend secret):

```bash
flyctl secrets set --app peak-kinetics-api \
  CLOUDFLARE_TURNSTILE_SECRET='0x4AAAAAAA...'
```

Set on Cloudflare Pages (frontend env var, public):

In the Pages project → Settings → Environment Variables:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = `0x4AAAAAAA...` (the **site** key, not the secret)

- [ ] Turnstile site created.
- [ ] Backend secret set.
- [ ] Pages env var set (will apply on next deploy).
- [ ] Test: load `peakkineticspt.com` contact form — Turnstile widget renders. Submit → backend accepts.

---

## 4. Cloudflare Pages — create the project

Two ways: connect to Git (auto-deploys on push) or upload manually via wrangler. Git is recommended.

### 4a. Git-connected (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Authorize GitHub; pick the `peak-kinetics-prod` repo.
3. Configuration:
   - Production branch: `main`
   - Framework preset: **Next.js**
   - Build command: `cd frontend && pnpm install --frozen-lockfile && pnpm pages:build`
   - Build output directory: `frontend/.vercel/output/static`
   - Root directory: leave blank (we use the build command to cd in)
   - Environment variables:
     - `NEXT_PUBLIC_API_URL` = `https://api.peakkineticspt.com`
     - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = `<site key from step 3>`
     - `NODE_VERSION` = `22`
4. Save and deploy.

### 4b. Manual via wrangler (if you want to deploy a one-off preview without Git)

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm pages:build
pnpm exec wrangler pages deploy .vercel/output/static --project-name peak-kinetics-frontend
```

- [ ] Pages project created.
- [ ] First deploy succeeds.
- [ ] Preview URL `https://<hash>.peak-kinetics-frontend.pages.dev` loads the homepage.
- [ ] BodyMap renders, hotspots click, mobile drawer opens on phone width.
- [ ] PromptEMR scheduling iframe still opens from the header CTA.

### Custom domain attach

In the Pages project → **Custom domains** → **Set up a custom domain**:
- Add `peakkineticspt.com`
- Add `www.peakkineticspt.com`

Cloudflare creates the DNS records automatically (orange cloud).

- [ ] Both custom domains attached and showing **Active**.

---

## 5. Run Playwright against the live preview

```bash
cd frontend
PLAYWRIGHT_BASE_URL=https://<hash>.peak-kinetics-frontend.pages.dev pnpm e2e --project=chromium
```

- [ ] All 15 tests pass against the preview URL.

---

## 6. Cutover (DNS swap)

This is the moment user traffic moves from GCE to Cloudflare Pages. **Lower TTL first** so rollback is fast.

1. Cloudflare DNS for `peakkineticspt.com`:
   - Find the existing `A`/`CNAME` record at apex pointing to your GCE VM. Set its TTL to **60 seconds**. Save.
   - Wait at least 1 hour (or your old TTL, whichever is shorter) so the lower TTL propagates.

2. **Cutover**:
   - Delete the GCE A record.
   - The Pages custom-domain attachment (step 4 → Custom domains) creates a `CNAME` to `peak-kinetics-frontend.pages.dev` automatically. Verify it's there.
   - If you were on raw IP/A records before, replace with the Pages-managed record.

3. **Watch for 2 hours**:
   - `curl -I https://peakkineticspt.com/` — expect `cf-ray` header and `200 OK` from Pages.
   - Open Cloudflare Web Analytics → no error spike.
   - Open Fly logs → `flyctl logs --app peak-kinetics-api` → API calls coming from the new Pages origin.
   - Check Resend dashboard → emails still being delivered.

4. **48-hour rollback window**: leave the GCE VM running, untouched.

- [ ] TTL lowered to 60s 1h+ before cutover.
- [ ] Cutover executed.
- [ ] 2-hour smoke window clean.
- [ ] After 48h with no incidents: GCE VM destroyed (`gcloud compute instances delete ...`), and old GCP billing alerts cleaned up.

---

## 7. Vendor cancellations (after cutover stable)

- [ ] **GCE VM** — destroy after 48h.
- [ ] **Old SSH-deployment GitHub Actions secrets** — rotate or delete from repo settings:
  - `GCP_VM_SSH_KEY`, `GCP_VM_USER`, `INSTANCE_IP`
- [ ] **UploadThing** — cancel.
- [ ] **Vonage** — cancel.

Keep:
- Resend (primary email)
- Twilio (SMS)
- Aiven (Postgres)
- Cloudflare (everything else)
- PromptEMR (scheduling/EMR)

---

## 8. Post-cutover verification checklist

- [ ] `https://peakkineticspt.com/` loads from Cloudflare (`cf-ray` header present).
- [ ] `https://peakkineticspt.net/` 301-redirects to `.com` preserving path.
- [ ] `https://api.peakkineticspt.com/actuator/health` returns 200.
- [ ] `https://api.peakkineticspt.com/admin` triggers Cloudflare Access.
- [ ] Contact form submits successfully (Turnstile + CORS work).
- [ ] Public review submission works.
- [ ] Admin can sign in via Access, view reviews, view messages.
- [ ] Admin video page loads (R2 if configured, else local).
- [ ] PromptEMR iframe opens from header CTA.
- [ ] `flyctl logs` shows `rid=<uuid>` on every line; no plaintext emails/phones.

---

## What "Week 2 done" looks like

- Frontend served from **Cloudflare Pages**, free tier.
- Backend on Fly.io at `api.peakkineticspt.com`, orange-clouded (CF WAF/DDoS in front).
- BodyMap redesigned: front/back, male/female, 15 anatomical regions, mobile bottom drawer.
- Admin gated by **Cloudflare Access** (no more form login + JSESSIONID).
- Public forms protected by **Turnstile**.
- File uploads land in **R2** via presigned URLs (local fallback still works).
- Playwright smoke suite running in CI on every PR (16 tests).
- GCE decommissioned.