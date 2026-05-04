# Peak Kinetics — Cloudflare + Fly.io Migration

3-week sequential plan. Check off as you go.

## Scope & data classification

- **PHI lives in PromptEMR.** It's embedded as an iframe (`frontend/components/scheduling-iframe-modal.tsx:37`). Our app is a marketing site, admin CMS, message inbox, and review manager. It does **not** store clinical data.
- **What we do store (standard PII):** admin accounts, blog posts, videos, reviews, contact-form messages, Google Business Profile review sync.
- **Consequences:** no BAAs required for our stack. Cloudflare free tier, Fly.io base paid plan, regular Aiven, Resend — all fine. Standard GDPR/CCPA hygiene for PII only.
- **Exception found during Week 1 code audit:** the `PatientJourney` entity in the backend stores per-patient clinical data (phase, progress %, milestones, user FK). The frontend surfaces it as a marketing showcase with hardcoded demo data, so the backend entity appears to be unused-by-default. **Decision: remove backend entity + repo + service + controller; keep frontend component with its hardcoded demo phases.** Tracked as Week 1 Day 2 task below.

## Target architecture

```
                  GoDaddy → Cloudflare DNS (all 4 domains, free)
                                    │
                    ┌───────────────┴────────────────┐
                    ▼                                ▼
           peakkineticspt.com              api.peakkineticspt.com
              (orange cloud)                   (orange cloud)
                    │                                │
                    ▼                                ▼
            Cloudflare Pages                 Fly.io (Spring Boot)
            (Next.js, free)                          │
                                    ┌────────────────┼───────────────┐
                                    ▼                ▼               ▼
                              Aiven Postgres    Cloudflare R2    Resend (email)
                                                (blog, videos)   Twilio (SMS)
                                                                 PromptEMR iframe
```

## Prerequisites

- [x] Fly.io account created — upgrade to Hobby/Launch plan when ready to deploy ($5–$29/mo)
- [ ] Aiven Postgres backup: `pg_dump --schema-only` and `--data-only` saved encrypted in password manager
- [ ] Cloudflare account (free plan)
- [ ] `flyctl` CLI: `brew install flyctl && flyctl auth login`
- [ ] `wrangler` CLI (needed Week 2): `npm i -g wrangler && wrangler login`
- [ ] PromptEMR embed still works post-cutover (quick verification before and after)

## GoDaddy → Cloudflare DNS transfer (4 domains)

Full walkthrough: **`docs/cloudflare-domains.md`**.

- [ ] All 4 zones on Cloudflare (`.com`, `.net`, `.shop`, `.us`)
- [ ] GoDaddy nameservers repointed
- [ ] Bulk Redirects: `.net`, `.shop`, `.us` → `.com` with path + query preserved (301)
- [ ] Registration stays at GoDaddy — nameservers only

---

## Week 1 — Fly.io backend + Cloudflare DNS

Goal: Spring Boot running on Fly.io at `api.peakkineticspt.com`. Frontend still on GCE.

### Day 1 — DNS transfer + Fly.io provisioning

- [ ] Transfer all 4 domains' nameservers to Cloudflare (see docs)
- [ ] Configure Bulk Redirects for the 3 alt domains
- [ ] `flyctl apps create peak-kinetics-api --org <org>`; region `iad` (near Aiven)
- [ ] `flyctl volumes create peak_uploads --size 10 --region iad`

### Day 2 — Backend cleanup & migrations

- [x] Add Flyway, switch `ddl-auto` → `validate`
- [x] Remove Vonage → Twilio SMS
- [x] Remove UploadThing → LocalStorageService (Week 2 swaps in R2)
- [x] Logback PII masking (emails, phones, SSN, JWT, Bearer)
- [x] RequestIdFilter for correlated tracing
- [x] Audit log entity + AOP (kept for operational forensics even though not compliance-mandated)
- [x] Baseline Flyway migration V1 (reconcile with `pg_dump --schema-only` before first deploy)
- [x] V2 audit_log migration
- [ ] **Remove `PatientJourney` backend (entity, repo, service, controller, DTO).** Keep frontend marketing component with hardcoded demo data.
- [ ] Reconcile `V1__baseline.sql` with prod `pg_dump` (remove `patient_journeys` table after entity deletion is merged, or add a V3 `DROP TABLE patient_journeys` so prod schema converges)

### Day 3 — Deploy prep

- [x] Backend-only Dockerfile (`backend/Dockerfile`)
- [x] `fly.toml` pinned to `iad`, 2GB, min_machines_running=1 (optional; set to 0 if cost matters more than cold-start latency)
- [ ] Verify local build: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw -DskipTests clean package`

### Day 4 — Fly deploy + secrets

- [ ] Set secrets (no `VONAGE_*`, `SENDGRID_*`, `UPLOADTHING_TOKEN`):
  ```bash
  flyctl secrets set --app peak-kinetics-api \
    DATABASE_URL=... DATABASE_USERNAME=... DATABASE_PASSWORD=... \
    JWT_SECRET=... \
    RESEND_API_KEY=... RESEND_FROM_ADDRESS=... RESEND_REPLY_TO=...
  ```
  Twilio (`TWILIO_ENABLED`) and Google Business sync (`GOOGLE_BUSINESS_ENABLED`) are both gated and default `false`; add their secrets only when those integrations are validated. See `docs/cloudflare-domains.md` Step 5a for the full layered secrets list.
- [ ] `flyctl deploy --app peak-kinetics-api --remote-only`
- [ ] `flyctl certs add api.peakkineticspt.com`
- [ ] In Cloudflare DNS: add `CNAME api → peak-kinetics-api.fly.dev`, **orange cloud**

### Day 5 — Smoke test

- [ ] `curl https://api.peakkineticspt.com/actuator/health` → 200
- [ ] Verify Resend DKIM/SPF records published in the sending-domain zone
- [ ] Log spot-check: no plaintext emails/phones in Fly logs
- [ ] Document rollback: old GCE VM stays hot; DNS for `api` is new — no rollback needed for existing traffic

**End of Week 1:** Backend on Fly, API reachable at `api.peakkineticspt.com`, frontend unchanged.

---

## Week 2 — Cloudflare Pages + BodyMap redesign + cutover

Goal: `peakkineticspt.com` served by Cloudflare Pages. New BodyMap live. GCE decommissioned.

### Day 1 — Next.js on Pages

- [ ] Remove `output: 'export'` from `frontend/next.config.mjs`
- [ ] Remove `images.unoptimized`, `ignoreDuringBuilds`, `ignoreBuildErrors` — fix the errors they hid
- [ ] Remove `prebuild`/`postbuild` API-hiding hack from `frontend/package.json`
- [ ] `pnpm add -D @cloudflare/next-on-pages`
- [ ] Set `NEXT_PUBLIC_API_URL=https://api.peakkineticspt.com`

### Day 2 — Playwright smoke tests

- [ ] `pnpm add -D @playwright/test`
- [ ] Tests: homepage, contact form, admin login, video list, BodyMap interaction, Google review sync, PromptEMR iframe opens
- [ ] CI step runs smoke tests on every PR

### Day 3 — BodyMap Tier 1 redesign

- [ ] Replace stick-figure `<path>` in `frontend/components/BodyMap.tsx:103` with anatomically-proportioned silhouette
- [ ] Front/back toggle
- [ ] 15 regions: cervical, thoracic, lumbar, SI joint, shoulder L/R, elbow L/R, wrist/hand L/R, hip L/R, knee L/R, ankle/foot L/R
- [ ] Male/female silhouette toggle
- [ ] Dial back motion: pulse only on active hotspot
- [ ] Mobile: right panel → bottom drawer (`vaul` already installed)

### Day 4 — R2 for uploads + admin hardening

- [ ] Create R2 bucket `peak-kinetics-uploads`
- [ ] Swap `LocalStorageService` for R2 presigned-URL flow in backend
- [ ] Migrate existing uploads: script copies local `/app/uploads/*` → R2
- [ ] Put `/admin/*` behind **Cloudflare Access** (free ≤50 users; email OTP + MFA)
- [ ] Remove `/admin/login` form-auth path; Access JWT replaces it
- [ ] Add **Turnstile** to contact form + review-request form; verify server-side

### Day 5 — Cutover

- [ ] Deploy Pages preview; run full Playwright suite
- [ ] Cloudflare DNS: `peakkineticspt.com` → Pages (orange); `www` CNAME same
- [ ] TTL 60s on all records during cutover; watch error/latency for 2h
- [ ] GCE runs 48h as rollback; then delete
- [ ] Cancel UploadThing, Vonage, Resend (wait — keep Resend), GCE bills

**End of Week 2:** Fully on Cloudflare + Fly. New BodyMap live. GCE gone.

---

## Week 3 — Polish & performance menu (PII-only scope)

Week 3 previously housed patient PWA + HEP + pain journal. Those are dropped (Option A — PromptEMR owns clinical data). Week 3 is now a choose-your-own menu of quality, performance, and marketing wins. Pick 4–5:

### UX / UI polish
- [ ] Dark-mode toggle wired (`next-themes` is already installed)
- [ ] Admin portal mobile nav + bottom-sheet patterns for lists
- [ ] Skeleton loaders + optimistic UI on video/blog/message admin screens
- [ ] Motion-budget pass: reduce Framer Motion animations by ~70% across marketing pages

### Performance
- [ ] Bundle audit: remove unused Radix imports, lazy-load BodyMap + PatientJourneyDashboard
- [ ] Image pipeline: Cloudflare Pages auto-converts to AVIF/WebP once static-export is gone
- [ ] Lighthouse targets: 95+ Performance, 100 Accessibility on the homepage

### SEO & marketing
- [ ] Structured data (schema.org `PhysicalTherapy` / `MedicalBusiness`) on service pages
- [ ] Sitemap + robots.txt
- [ ] OpenGraph images for blog posts and service pages
- [ ] Open Graph + Twitter card coverage

### Observability & reliability
- [ ] Frontend error tracking: Cloudflare Web Analytics (free) or Sentry free tier
- [ ] Backend Logpush → your choice of sink (S3, Datadog, Grafana Cloud free tier)
- [ ] Uptime monitor → external (UptimeRobot free) hitting `/actuator/health`
- [ ] Weekly DB backup automation (Aiven has this built-in — just verify settings)

### Content tooling
- [ ] Rich-text editor for blog admin (TipTap is a good fit — MIT licensed)
- [ ] Scheduled publish for blog posts (background worker pattern)
- [ ] Blog tag index pages

### BodyMap Tier 2 (if Tier 1 lands well)
- [ ] Muscle-level SVG — separate `<path>` per major muscle group
- [ ] Hover-reveals for common injuries per muscle
- [ ] Would require a licensed SVG from Figma Community or hand-authored over ~3 days

### Admin quality-of-life
- [ ] Keyboard shortcuts (`j`/`k` to navigate message list, `e` to edit blog)
- [ ] Bulk actions on reviews (publish/unpublish/delete in batches)
- [ ] Message-to-review conversion workflow (mark a message as "review candidate", trigger review-request SMS/email)

---

## Rollback plan

- **Week 1:** `api.peakkineticspt.com` is new. No existing users affected. Roll back by deleting the DNS record; Fly app can sit idle.
- **Week 2 Day 5:** DNS TTL 60s. Flip `peakkineticspt.com` back to GCE origin if smoke tests fail. GCE runs 48h post-cutover.
- **Week 3:** Each menu item is independent. Feature-flag anything user-facing.

## Known risks

- Fly.io single machine: monitor CPU/memory; scale out if needed. Cold starts on scale-to-zero are 3–8s — for a marketing site, acceptable; for admin, keep `min_machines_running=1` (~$5/mo extra).
- Aiven regional latency: Fly `iad` ↔ Aiven `us-east-1` is fine (<5ms). Other regions add 40–80ms.
- Session cookies: `httpOnly + secure + SameSite=strict` is good; if admins report login loops in Safari, consider `SameSite=lax` instead.
- Resend deliverability: without DKIM/SPF correctly published, Gmail and Outlook silently spam-fold review-request emails. Verify in the sending domain's zone.
- GCE cleanup: do not delete the VM until the 48h post-cutover window is clear.

## Out of scope (backlog)

- EMR migration off PromptEMR (their scheduling iframe works; the day you have an API-capable EMR, new features become possible).
- Patient-facing PWA features (HEP, pain journal) — revisit when EMR has APIs.
- Outcome measures (Oswestry, DASH, LEFS, KOOS) — same.
- BodyMap Tier 3 (3D anatomy) — marketing theater, heavy on mobile; not worth it yet.
- SOC 2 Type II — only if you pursue enterprise clinic contracts.
