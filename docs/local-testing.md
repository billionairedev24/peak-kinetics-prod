# Local testing — full stack on your laptop

Run and click through everything before doing the runbook (DNS, R2, CF Access, Pages). 30–45 minutes start to finish.

## What you can test locally

✅ Backend boots, Flyway migrations apply, schema validates against entities
✅ Frontend renders, dark mode, BodyMap, mobile drawer, lazy-loaded sections
✅ Cross-origin frontend ↔ backend with the new CORS config
✅ Contact form submits → Resend (real if you set the key) or fails-loud (placeholder)
✅ Public review submission
✅ Admin pages load, admin APIs work (DevAuthFilter auto-authenticates as `dev@localhost`)
✅ Backend test suite (50) + Playwright (15)
✅ R2 storage if you have a real bucket (or use local-fallback)
✅ Sitemap, robots.txt, per-route metadata

## What you can NOT test locally (need real Cloudflare resources)

❌ Cloudflare Access JWT verification (use `dev.auto-auth.enabled=true` instead — already on)
❌ Turnstile real-token verification (backend bypasses when secret is blank — already configured)
❌ Bulk Redirects from `.net/.shop/.us` → `.com`
❌ Pages-vs-GCE cutover behavior
❌ Real DKIM/SPF email deliverability

---

## Prerequisites (one-time install)

```bash
# JDK 21 (you have GraalVM 21 already; scripts/mvn handles PATH)
java -version

# Node 22 + pnpm
node --version    # v22.x
pnpm --version    # v10.x

# Docker (for Postgres) — Colima, Rancher Desktop, or Docker Desktop all work
docker --version
```

---

## 1. Start Postgres

```bash
docker run -d --name peakkinetics-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=peakkinetics \
  -p 5432:5432 \
  postgres:16
```

If you already have Postgres running natively, skip this — just create a `peakkinetics` DB owned by user `postgres` with password `postgres` (or edit `backend/src/main/resources/application-local.yml`).

Verify:

```bash
docker exec -it peakkinetics-pg psql -U postgres -d peakkinetics -c '\dt'
# expect: "Did not find any relations." — empty schema is fine, Flyway will create
```

---

## 2. Start the backend

```bash
cd /Users/billionairedev/workspace/peak-kinetics-prod
./scripts/mvn -pl backend spring-boot:run -Dspring-boot.run.profiles=local
```

Watch for:
```
Flyway ... Successfully applied 2 migrations to schema "public"
Started BackendApplication in N seconds
Tomcat started on port(s): 8080
```

If you see `relation "<something>" does not exist` later, Flyway baseline + your `V1__baseline.sql` is out of sync — see `docs/week1-manual-steps.md` step 5b.

Verify:
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}

curl http://localhost:8080/api/reviews
# {"data":[],"total":0,...}

curl http://localhost:8080/api/admin/auth/me
# {"id":null,"name":null,"email":"dev@localhost",...}   ← DevAuthFilter is working
```

If `/api/admin/auth/me` returns 401, the DevAuthFilter is not active. Check that `dev.auto-auth.enabled: true` is in `application-local.yml` and that the active profile is `local`.

---

## 3. Start the frontend (separate terminal)

```bash
cd /Users/billionairedev/workspace/peak-kinetics-prod/frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=
```

Leave Turnstile + Analytics tokens blank — both are no-op when blank.

Then:

```bash
pnpm install
pnpm dev
```

Frontend serves at http://localhost:3000.

---

## 4. Click-through checklist

Open http://localhost:3000.

### Public site
- [ ] Homepage loads, no console errors
- [ ] Hero section renders, scheduling CTA opens the PromptEMR iframe modal
- [ ] BodyMap section appears further down — silhouette renders, hotspot click opens detail card
- [ ] Front/Back toggle switches the silhouette
- [ ] Male/Female toggle switches the silhouette
- [ ] Resize browser to ≤1024px wide → BodyMap detail panel becomes a bottom drawer
- [ ] Dark mode toggle in header (sun/moon icon) → theme persists on reload
- [ ] Service pages: visit `/services/orthopedic-therapy`, view source — `<title>` and meta description are service-specific
- [ ] `/sitemap.xml` returns valid XML with all 13 URLs
- [ ] `/robots.txt` returns the rules

### Forms (cross-origin to backend)
- [ ] Contact form: fill it, submit → success toast. Check backend logs for `rid=<uuid>` log line, no plaintext email/phone in logs.
- [ ] `/review` page: submit a review → success toast. `curl http://localhost:8080/api/reviews` should now show it.

### Admin (DevAuthFilter is your friend here)
- [ ] `/admin` redirects to `/admin/dashboard` — note: the `adminAuth.isAuthenticated()` client check might still bounce you to `/admin/login`. The login page exists but the form-submit flow is dead post-Cloudflare-Access. **Workaround for local**: open `/admin/dashboard` directly in the browser. The frontend will fetch `/api/admin/auth/me` which DevAuthFilter answers with the dev user.
- [ ] Dashboard counts load (messages, reviews, blogs, videos)
- [ ] `/admin/messages` — skeleton appears briefly, then list (or empty state)
- [ ] `/admin/blog` — skeleton cards appear briefly, then list
- [ ] `/admin/videos` — skeleton cards
- [ ] `/admin/reviews` — list any reviews you submitted via the public form
- [ ] Mobile sidebar (resize to <1024px): hamburger opens drawer, Escape closes, body scroll is locked while open

---

## 5. Run the test suites

```bash
# Backend
cd /Users/billionairedev/workspace/peak-kinetics-prod
./scripts/mvn -pl backend test
# expect: Tests run: 50, Failures: 0

# Frontend e2e (must have backend NOT running on the same dev port — Playwright spins its own)
cd frontend
pnpm e2e --project=chromium
# expect: 15 passed
```

If you want e2e to run against your already-running dev server:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e --project=chromium
```

---

## 6. Optional — test R2 with a real bucket

If you have R2 credentials and want to test the upload flow end-to-end:

```bash
export R2_ENDPOINT='https://<account-hash>.r2.cloudflarestorage.com'
export R2_ACCESS_KEY_ID='...'
export R2_SECRET_ACCESS_KEY='...'
export R2_BUCKET='peak-kinetics-uploads-dev'
export R2_PUBLIC_BASE_URL=''   # leave blank, falls back to raw S3 URL
./scripts/mvn -pl backend spring-boot:run -Dspring-boot.run.profiles=local
```

Then in the admin UI, upload a video thumbnail or blog image. Check the URL returned — it should point at R2, not `localhost:8080/uploads`.

If you don't set R2 vars, uploads land in `backend/uploads/*` on disk. Both work.

---

## 7. Optional — test real Resend / Twilio

```bash
export RESEND_API_KEY='re_yourrealkey'
export RESEND_FROM_ADDRESS='dev@yourverifieddomain.com'
export TWILIO_ENABLED=true
export TWILIO_ACCOUNT_SID='ACyourreal'
export TWILIO_AUTH_TOKEN='yourrealtoken'
export TWILIO_PHONE_NUMBER='+1XXXXXXXXXX'
./scripts/mvn -pl backend spring-boot:run -Dspring-boot.run.profiles=local
```

Without `TWILIO_ENABLED=true` the SMS service no-ops and you'll see `SMS skipped (Twilio disabled)` in the logs even with real creds set.

Now contact-form submissions and review-request emails actually send. Useful for verifying DKIM is correct on your Resend sender domain *before* the Pages cutover.

---

## 8. Reset state

```bash
# Wipe DB and re-run Flyway from scratch
docker exec -it peakkinetics-pg psql -U postgres -d peakkinetics -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

# Or restart Postgres entirely
docker rm -f peakkinetics-pg
# then re-run the docker run command in step 1

# Wipe local R2 fallback uploads
rm -rf backend/uploads/*

# Wipe Next.js + Playwright caches
cd frontend
rm -rf .next .vercel node_modules/.cache test-results playwright-report
```

---

## Common errors

| Symptom | Cause | Fix |
|---|---|---|
| `Connection refused` on backend startup | Postgres not running | `docker start peakkinetics-pg` |
| Frontend builds, contact form returns 0 / network error | `NEXT_PUBLIC_API_URL` unset or wrong | Set it in `.env.local` and restart `pnpm dev` |
| Contact form returns 403 "Bot verification failed" | Frontend has Turnstile site key set but backend is missing the secret | Either set both or unset both |
| `/api/admin/*` returns 401 | DevAuthFilter not running | Confirm `dev.auto-auth.enabled: true` in `application-local.yml` and `-Dspring-boot.run.profiles=local` |
| CORS error in browser console | Frontend on a port the backend's `cors.allowed-origin-patterns` doesn't match | Add your port to `application-local.yml` patterns |
| Flyway: "Validate failed: Migration checksum mismatch" | You edited an applied migration | `docker exec ... psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"` and restart |
| Frontend: weird hydration warning about `class` on `<html>` | Dark mode + SSR mismatch | Already handled by `suppressHydrationWarning` in `app/layout.tsx`. If you see it, hard-refresh. |

---

## What "local testing done" looks like

You've manually clicked through every page on the click-through list, submitted both forms, watched a request hit the backend with a `rid=` in the logs, and run both test suites green. **At that point you can confidently start the runbook** — you're only debugging Cloudflare-side configuration, not your code.
