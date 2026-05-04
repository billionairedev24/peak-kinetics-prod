# Week 1 — manual steps you run yourself

Code + config changes are already in the repo. This document covers what you have to do by hand.

**Data scope reminder:** PHI lives in PromptEMR (iframe). This app handles standard PII only — no BAAs required. Standard GDPR/CCPA hygiene applies.

---

## 1. Cloudflare account + 4-domain DNS transfer

Full walkthrough: **`docs/cloudflare-domains.md`**.

Minimum for Day 1:

- [ ] Cloudflare account created (free plan).
- [ ] All 4 domains added; GoDaddy nameservers swapped to Cloudflare's.
- [ ] All 4 zones show **Active** (green dot).
- [ ] `.net`, `.shop`, `.us` Bulk Redirects deployed and verified.
- [ ] `.com` still points A/CNAME at GCE for now — do **not** change until Week 2 cutover.

---

## 2. Fly.io — app bootstrap

Your account is created. For regular production, the Hobby plan ($5/mo) is fine; if you want dedicated VMs or support, use the Launch plan ($29/mo).

```bash
flyctl auth login
flyctl apps create peak-kinetics-api --org <your-org>
flyctl volumes create peak_uploads --app peak-kinetics-api --size 10 --region iad
```

- [ ] App created.
- [ ] Volume `peak_uploads` created in `iad`.

---

## 3. Secrets

```bash
flyctl secrets set --app peak-kinetics-api \
  DATABASE_URL='jdbc:postgresql://<aiven-host>:<port>/<db>?sslmode=require' \
  DATABASE_USERNAME='<aiven-user>' \
  DATABASE_PASSWORD='<aiven-pass>' \
  JWT_SECRET="$(openssl rand -base64 48)" \
  RESEND_API_KEY='re_xxxxxx' \
  RESEND_FROM_ADDRESS='PEAK KINETICS PT <noReply@peakkineticspt.net>' \
  RESEND_REPLY_TO='info@peakkineticspt.com'
```

Do **not** set `VONAGE_*`, `SENDGRID_*`, or `UPLOADTHING_TOKEN` — removed from this stack.

**Twilio (SMS) — disabled by default.** `twilio.enabled` defaults to `false`, so the app starts without any Twilio secrets; SMS sends are no-ops. When ready to send real SMS:

```bash
flyctl secrets set --app peak-kinetics-api \
  TWILIO_ENABLED=true \
  TWILIO_ACCOUNT_SID='ACxxxxxx' \
  TWILIO_AUTH_TOKEN='xxxxxx' \
  TWILIO_PHONE_NUMBER='+1XXXXXXXXXX'
```

**Google Business Profile (review sync) — disabled by default.** `google.business.enabled` defaults to `false`; the no-op service returns zero reviews and the `google-api-client` classes are never loaded. Turn on only after the OAuth + Business Profile API setup is fully validated:

```bash
flyctl secrets set --app peak-kinetics-api \
  GOOGLE_BUSINESS_ENABLED=true \
  GOOGLE_OAUTH_CLIENT_ID='xxxxxx.apps.googleusercontent.com' \
  GOOGLE_OAUTH_CLIENT_SECRET='xxxxxx' \
  GOOGLE_OAUTH_REFRESH_TOKEN='1//xxxxxx' \
  GOOGLE_BUSINESS_ACCOUNT='accounts/1234567890' \
  GOOGLE_BUSINESS_LOCATION='locations/9876543210'
```

**Google Places API — removed.** The Places API can only return ≤5 reviews per place; the Business Profile flow above is the only way to get the full feed. `GOOGLE_PLACES_*` is not used.

- [ ] `flyctl secrets list --app peak-kinetics-api` shows ~7 secrets after Layer 1; more as you add Layer 3 features.

---

## 4. Resend DKIM/SPF

In Resend dashboard → Domains → add `peakkineticspt.net` (or `.com`, whichever matches `RESEND_FROM_ADDRESS`). Resend gives you 3–4 DNS records. Publish them in the **sending domain's** Cloudflare zone.

Without this, Gmail/Outlook silently spam-fold your review-request and password-reset emails.

- [ ] Sending domain verified in Resend (green dot).
- [ ] Test: send yourself a password-reset from the running app; arrives in inbox, not spam.

---

## 5. Database — backup + Flyway reconcile

### 5a. Back up prod

```bash
pg_dump --schema-only --no-owner --no-privileges \
  "postgres://<user>:<pass>@<aiven-host>:<port>/<db>?sslmode=require" \
  > prod-schema-$(date +%Y%m%d).sql

pg_dump --data-only --no-owner --no-privileges \
  "postgres://<user>:<pass>@<aiven-host>:<port>/<db>?sslmode=require" \
  > prod-data-$(date +%Y%m%d).sql
```

Store encrypted in password manager. Do not commit.

### 5b. Reconcile V1 baseline

`backend/src/main/resources/db/migration/V1__baseline.sql` is hand-authored from JPA entities. Before first deploy:

- [ ] Diff against the fresh `prod-schema.sql` and reconcile any differences.
- [ ] Prod uses `baseline-on-migrate=true` + `baseline-version=1` → V1 is stamped without executing. Only V2+ runs.

### 5c. Local smoke test

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Watch for `Flyway ... Successfully validated` and `Tomcat started on port(s): 8080`.

---

## 6. Remove PatientJourney (one-time cleanup)

Frontend surfaces only demo data, but the backend wires real per-patient clinical data through an entity + repo + service + controller. Since PromptEMR owns clinical data, this is dead code we should delete before deployment.

- [ ] Create a follow-up PR that deletes:
  - `backend/src/main/java/com/peakkineticspt/entity/PatientJourney.java`
  - `backend/src/main/java/com/peakkineticspt/repository/PatientJourneyRepository.java`
  - `backend/src/main/java/com/peakkineticspt/service/PatientJourneyService.java`
  - `backend/src/main/java/com/peakkineticspt/service/impl/PatientJourneyServiceImpl.java`
  - `backend/src/main/java/com/peakkineticspt/controller/PatientJourneyController.java`
  - `backend/src/main/java/com/peakkineticspt/dto/PatientJourneyDTOs.java`
- [ ] Add `V3__drop_patient_journeys.sql`:
  ```sql
  DROP TABLE IF EXISTS patient_journeys;
  ```
- [ ] Also remove `patient_journeys` from `V1__baseline.sql` so fresh envs don't recreate it.
- [ ] Frontend `components/patient-journey-dashboard.tsx` — keep; no changes needed (it uses hardcoded demo data).
- [ ] Remove any admin UI that writes to `/api/patient-journey` if present.

---

## 7. First Fly deploy

```bash
flyctl deploy --app peak-kinetics-api --remote-only
```

- [ ] Build succeeds.
- [ ] `flyctl status` — one machine `started` and healthy in `iad`.
- [ ] `flyctl logs` shows `Flyway ... Successfully validated N migrations` and `Tomcat started on port(s): 8080`.

---

## 8. TLS cert + DNS record

```bash
flyctl certs add api.peakkineticspt.com --app peak-kinetics-api
flyctl certs show api.peakkineticspt.com --app peak-kinetics-api
```

- [ ] In Cloudflare, `peakkineticspt.com` zone → add `CNAME api → peak-kinetics-api.fly.dev`, **orange cloud (Proxied)**.
- [ ] Add any validation records Fly requests (usually also orange cloud is fine; follow Fly's instructions).
- [ ] Re-run `flyctl certs show` until status = `Ready`.
- [ ] `curl -sSI https://api.peakkineticspt.com/actuator/health` → `HTTP/2 200`.

---

## 9. Smoke tests

```bash
curl -sSI https://api.peakkineticspt.com/actuator/health          # 200
curl -sS  https://api.peakkineticspt.com/api/reviews | head -c 200 # JSON
curl -sSI https://api.peakkineticspt.com/admin/login              # 200
```

Log check:

```bash
flyctl logs --app peak-kinetics-api | head -50
```

- [ ] `rid=<uuid>` appears on every line (RequestIdFilter).
- [ ] No raw email addresses or phone numbers in plaintext (PiiMaskingLayout).
- [ ] No `ResendException` stack traces.

---

## 10. Vendor tidy-up

- [ ] UploadThing — cancel.
- [ ] Vonage — cancel.
- [ ] SendGrid — not created; skip.
- [ ] Resend — keep; primary email provider.
- [ ] GCE VM — **keep running** through Week 2 as rollback. Don't cancel yet.

---

## Rollback

Nothing user-facing changes in Week 1 — `api.peakkineticspt.com` is a new subdomain. If Fly has issues:

1. Delete the Cloudflare DNS record for `api` — users can't reach Fly but were never using it yet.
2. Fix the problem, redeploy, re-add DNS.
3. If the Fly deploy somehow corrupted Aiven data, restore from the pg_dump in step 5a.

Existing traffic continues on GCE through `.com` until Week 2 cutover.

---

## What "Week 1 done" looks like

- All 4 domains on Cloudflare DNS; `.net/.shop/.us` 301 to `.com`.
- Spring Boot runs on Fly.io at `https://api.peakkineticspt.com`.
- Flyway owns schema migrations; `ddl-auto=validate` in prod.
- Dead `PatientJourney` backend removed; only marketing frontend component remains.
- Logs are PII-masked; request IDs flow through; audit log table exists.
- Twilio replaces Vonage. Resend stays. UploadThing gone (local storage until Week 2's R2 swap).
- GCE still serves live `.com` traffic. Week 2 cuts over.
