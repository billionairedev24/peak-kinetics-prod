# Cloudflare — 4-domain setup

You own four domains:

| Domain | Role |
|---|---|
| `peakkineticspt.com` | **Canonical.** Serves all content. |
| `peakkineticspt.net` | Redirect → `.com` |
| `peakkineticspt.shop` | Redirect → `.com` |
| `peakkineticspt.us` | Redirect → `.com` |

All four sit on Cloudflare DNS (free, unlimited zones). Registrar stays at GoDaddy — only **nameservers** move. Redirects are handled by Cloudflare **Bulk Redirects** (free, edge-executed; no Workers consumed).

---

## Step 1 — Move nameservers from GoDaddy to Cloudflare (do this for each of the 4 domains)

For **each** domain (`.com`, `.net`, `.shop`, `.us`):

1. In **Cloudflare** dashboard → **Add a Site** → type the domain → select **Free** plan.
2. Cloudflare scans GoDaddy's existing DNS records. Let it finish.
3. Review the imported records:
   - For `.com`: keep A/CNAME records that still point somewhere valid; **delete any stale record pointing at your old GCE IP or `peakkineticspt.com`'s old VM**.
   - For `.net`, `.shop`, `.us`: delete *all* A / CNAME / AAAA records for the apex and `www` — they'll be replaced with redirect-only records (step 3 below).
   - Keep **MX records** if you receive email at any of these domains.
   - Keep **TXT records** for SPF, DKIM, domain verification, etc.
4. Cloudflare shows you two assigned nameservers like `xyz.ns.cloudflare.com` and `abc.ns.cloudflare.com`. Copy both.
5. In **GoDaddy** → My Products → the domain → **DNS / Nameservers** → **Change Nameservers** → enter the Cloudflare pair.
6. Save. Propagation is usually minutes, sometimes up to 24h.
7. Back in Cloudflare, wait for the domain status to flip to **Active** (green).

Repeat for all 4 domains. **Do not skip deleting stale GCE records for `.com`** — otherwise traffic may flow to the old VM after the switch.

---

## Step 2 — SSL / TLS baseline (each domain)

For **each** active domain, in Cloudflare:

1. **SSL/TLS → Overview** → set mode to **Full (strict)**.
2. **SSL/TLS → Edge Certificates**:
   - Enable **Always Use HTTPS**.
   - Enable **Automatic HTTPS Rewrites**.
   - **HSTS**: defer until after cutover (6 months into production). Enabling too early + misconfiguration = hard to unbreak.
3. **Speed → Optimization**:
   - Enable **Brotli**.
   - Leave Polish / Mirage alone for now.
4. **Caching → Configuration**: standard settings are fine.

---

## Step 3 — Make `.net`, `.shop`, `.us` 301 → `.com`

This is the part that confuses people. Cloudflare doesn't have a one-click "forward this domain" button (their old "Page Rules → Forwarding URL" feature is being deprecated in favour of Bulk Redirects). It's a **3-piece setup** that you do once:

1. **3a** — In each alt-domain's DNS tab, add a dummy record so Cloudflare's edge actually answers requests for that domain.
2. **3b** — At the *account* level (not zone level), create a **list** of "from → to" URL pairs.
3. **3c** — At the account level, create a **rule** that says "use this list."

You only do 3a inside each domain. 3b and 3c are done **once**, at the account level, and they cover all three alt-domains together. Do them in this exact order — the rule in 3c won't save unless the list in 3b exists, and the redirects won't fire unless the DNS record in 3a is proxied.

### 3a. Add a proxied dummy DNS record on each alt-domain

You need to do this for **all three** alt-domains: `.net`, `.shop`, `.us`. Repeat the steps below three times, once per domain.

1. Log in to Cloudflare → click **Websites** in the left sidebar → click `peakkineticspt.net` (or `.shop` / `.us`) in the list. You're now "inside the zone" for that domain.
2. In the left sidebar (inside the zone), click **DNS** → **Records**.
3. **First, delete any leftover A / AAAA / CNAME records** for `@` (apex) and `www` that point to old hosts (GoDaddy parking, your old GCE VM, etc). Click the three-dot menu on the right of each row → **Delete**. Leave MX, TXT, SPF, and DKIM records alone.
4. Click the blue **Add record** button (top right).
5. Fill the form for the apex record:
   - **Type**: change the dropdown from `A` to **`AAAA`**.
   - **Name**: type `@` (or just leave it blank — Cloudflare auto-fills `@` meaning the bare domain).
   - **IPv6 address**: type `100::` (literally those four characters — colon, colon, one, zero, zero — actually `100` then two colons). This is the RFC 6666 "discard" address. It's a real, standardised dummy IP that exists *specifically* so Cloudflare's edge has something to attach to without sending traffic to a real server.
   - **Proxy status**: must be **Proxied** (orange cloud icon, not grey). If it shows grey "DNS only", click the toggle so it turns orange. **This is the most-skipped step. If it's grey, the redirect will not work.**
   - **TTL**: leave as Auto.
   - Click **Save**.
6. Click **Add record** again for the `www` row:
   - **Type**: `AAAA`
   - **Name**: `www`
   - **IPv6 address**: `100::`
   - **Proxy status**: **Proxied** (orange cloud).
   - Click **Save**.

You should now have two new rows in the DNS table for that zone: `@   AAAA   100::   Proxied` and `www   AAAA   100::   Proxied`.

7. Repeat steps 1–6 for the other two alt-domains.

When you're done you'll have six new records total (2 per domain × 3 domains).

### 3b. Build the Bulk Redirects list (account-level, done once)

The list is just six "from URL → to URL" rows. It lives at the **account** level, not inside any one zone — that's why people miss it.

1. Click the Cloudflare logo (top-left) to leave the zone view. You should land on the account home that lists all your sites.
2. In the left sidebar, click **Bulk Redirects** (it's under the **Account Home** section, *not* under any individual website). If you don't see it, look under **Manage Account → Configurations → Bulk Redirects**, depending on your dashboard layout.
3. Under the **Bulk Redirect Lists** tab, click **Create a new list**.
4. Fill the form:
   - **Name**: `peak-kinetics-brand-redirects`
   - **Description**: `Forward .net / .shop / .us to canonical .com` (optional but helps Future You)
   - **Type of list**: **Redirect**
   - Click **Create**.
5. The list opens empty. Click **Add URL Redirects**. You'll see a small form to add one row at a time. Add these **six rows**, one by one. After each row, click **Add** (or **Save**) and the form clears for the next row.

   For **every row**, set the parameter checkboxes the same way:
   - **Status code**: `301` (Permanent Redirect)
   - **Preserve query string**: ☑ **on**
   - **Include subdomains**: ☐ off
   - **Subpath matching**: ☑ **on** *(this is the one that makes `/services/pain-management` survive the redirect — without it everyone lands on the homepage)*
   - **Preserve path suffix**: ☑ **on**

   The six rows:

   | # | Source URL | Target URL |
   |---|---|---|
   | 1 | `https://peakkineticspt.net/` | `https://peakkineticspt.com/` |
   | 2 | `https://www.peakkineticspt.net/` | `https://peakkineticspt.com/` |
   | 3 | `https://peakkineticspt.shop/` | `https://peakkineticspt.com/` |
   | 4 | `https://www.peakkineticspt.shop/` | `https://peakkineticspt.com/` |
   | 5 | `https://peakkineticspt.us/` | `https://peakkineticspt.com/` |
   | 6 | `https://www.peakkineticspt.us/` | `https://peakkineticspt.com/` |

   The trailing `/` on the source matters — it's what tells Cloudflare to match the apex/root and (because subpath matching is on) everything beneath it.

6. After all 6 rows are added, click **Save** at the bottom. The list now has 6 entries.

The list is just data at this point — it doesn't do anything until you wire it into a rule (3c).

### 3c. Create the Bulk Redirects rule that activates the list

1. Still on the **Bulk Redirects** page, click the **Bulk Redirect Rules** tab (next to the **Lists** tab you've been on).
2. Click **Create rule**.
3. Fill the form:
   - **Rule name**: `Route alt-domains to .com`
   - **Description**: `Apply peak-kinetics-brand-redirects list at the edge` (optional)
   - **Expression**: leave at the default — Cloudflare auto-fills it to match the URLs in the list you'll select.
   - **Then... select the list to use**: pick `peak-kinetics-brand-redirects` from the dropdown.
4. Click **Save and Deploy**. (Just **Save** stages it; **Deploy** is what makes it live. The button is usually combined.)

The rule's status should show **Enabled / Active**. Within ~30 seconds the redirect is live globally on Cloudflare's edge.

### 3d. Verify it works

From your laptop terminal:

```bash
curl -sIL https://peakkineticspt.net/services/pain-management | head -8
curl -sIL https://peakkineticspt.shop/blog                     | head -8
curl -sIL https://peakkineticspt.us/contact?utm_source=foo     | head -8
curl -sIL https://www.peakkineticspt.net/                      | head -8
```

A successful response looks like:

```
HTTP/2 301
location: https://peakkineticspt.com/services/pain-management
...
HTTP/2 200
content-type: text/html; ...
```

The `301` line is Cloudflare's edge bouncing the request; the `200` line is the final hit on `.com`. The `location:` header proves path + query string survived.

Open in a browser too: typing `peakkineticspt.shop/blog` in the address bar should land you on `peakkineticspt.com/blog` and the URL bar should update to show `.com`.

**If you see a Cloudflare error page instead of a redirect:**

| Error | What's wrong | Fix |
|---|---|---|
| `1001 DNS resolution error` | The `AAAA 100::` record in 3a is missing or its proxy toggle is grey, not orange | Re-open the zone's DNS tab; verify the row exists and the cloud icon is **orange** |
| `522` / `526` | Same as above — proxied record missing | Same fix |
| Page loads on `.net` directly (no redirect) | The Bulk Redirect rule in 3c is not deployed, or you saved the list (3b) but never built the rule (3c) | Go to **Bulk Redirects → Rules** tab and confirm the rule is **Enabled** |
| Redirect happens but always lands on `.com/` (loses the path) | "Subpath matching" was off when you added the rows in 3b | Edit each row in the list, tick **Subpath matching**, save |

---

## Step 4 — Point `.com` at Cloudflare Pages (Week 2, not today)

This happens on **Week 2 Day 5 cutover**, not during the DNS transfer. Until then, keep whatever A/CNAME record currently points `.com` at your GCE VM so existing traffic keeps working.

When you're ready (Week 2), inside the `peakkineticspt.com` zone:

1. **DNS → Records**: delete the GCE A record for `@`.
2. Cloudflare Pages will show a `CNAME` target like `peak-kinetics.pages.dev`.
3. Add:
   - Type: `CNAME`, Name: `@`, Target: `peak-kinetics.pages.dev`, Proxied.
   - Type: `CNAME`, Name: `www`, Target: `peak-kinetics.pages.dev`, Proxied.

---

## Step 5 — Deploy the backend to Fly.io (exact commands)

Do this **before** Step 6. Step 6 (`flyctl certs add`, DNS for `api.peakkineticspt.com`) only makes sense once a working app is already serving traffic at `peak-kinetics-api.fly.dev` — otherwise the cert provisioning has nothing to validate against and you'll get a stuck-pending cert.

The full one-time bootstrap (account, app, volume, secrets) lives in `docs/week1-manual-steps.md`; the version below is condensed. All commands are run from the **repo root** (`/Users/billionairedev/workspace/peak-kinetics-prod`), because `fly.toml` lives there and references `backend/Dockerfile`.

### 5a. One-time machine setup (skip if already done)

```bash
brew install flyctl                                                           # install CLI
flyctl auth login                                                             # opens browser
flyctl apps create peak-kinetics-api --org personal                           # creates the app
flyctl volumes create peak_uploads --app peak-kinetics-api --region iad --size 10
```

Set secrets in three layers. Values come from your password manager, not the repo. Each `flyctl secrets set` call triggers an automatic restart, so set them as one batch per layer (not one var at a time).

**Layer 1 — Required for the app to start.** Missing any of these and Spring fails on boot:

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

**Layer 2 — Security (set on Day 1 unless you want fail-open behaviour).** Each of these has an empty default and the corresponding feature silently no-ops when blank — meaning your contact form has no bot protection and your `/admin/*` routes have no edge auth:

```bash
flyctl secrets set --app peak-kinetics-api \
  CLOUDFLARE_TURNSTILE_SECRET='0xAAAAxxxxxxxxxxxx' \
  CLOUDFLARE_ACCESS_TEAM_DOMAIN='peakkineticspt.cloudflareaccess.com' \
  CLOUDFLARE_ACCESS_AUDIENCE='<aud-tag-from-cloudflare-access-app>'
```

- `CLOUDFLARE_TURNSTILE_SECRET` — server-side Turnstile verification on `/api/messages` and review submission. Without it, `TurnstileService.verify()` returns `true` for everyone (per `TurnstileService.java`), so bots can spam.
- `CLOUDFLARE_ACCESS_TEAM_DOMAIN` + `CLOUDFLARE_ACCESS_AUDIENCE` — `CloudflareAccessFilter` validates the `Cf-Access-Jwt-Assertion` header on admin routes. When team-domain is blank the filter is disabled (per `CloudflareAccessFilter.java`), so JWT is the only gate.

If you haven't set up Turnstile or Cloudflare Access yet, skip this layer for now and come back when you do — the app starts fine without them, just without the protections.

#### Where each Layer 2 value comes from in the Cloudflare dashboard

**`CLOUDFLARE_TURNSTILE_SECRET` — from Cloudflare Turnstile**

1. Cloudflare dashboard → click the Cloudflare logo (top-left) so you're at the **account home**, not inside any individual website.
2. Left sidebar → **Turnstile**. (If you don't see it, look under **Account Home** or expand the sidebar — Turnstile is its own product, not under any zone.)
3. Click **Add widget** (or **Add site** on older dashboard versions).
4. Fill the form:
   - **Widget name**: `peak-kinetics-prod` (free text, just for your reference).
   - **Hostname management**: add `peakkineticspt.com` and `www.peakkineticspt.com`. (For local/dev testing add `localhost` too — Turnstile accepts it as a special case.)
   - **Widget mode**: **Managed** is the right default — Cloudflare decides whether to challenge based on risk score. Pick **Invisible** only if you're sure you never want a visible challenge box.
   - **Pre-clearance for this site**: leave **No** unless you also use Cloudflare Bot Management (paid tier).
5. Click **Create**.
6. The next screen shows two values:
   - **Site Key** (begins with `0x4AAAAA…`) — public, goes in the **frontend** as a `NEXT_PUBLIC_TURNSTILE_SITE_KEY` env var. Safe to commit / expose.
   - **Secret Key** (begins with `0x4AAAAA…` too, but a different value) — **this is `CLOUDFLARE_TURNSTILE_SECRET`**. Treat as a password; never commit.
7. Click the eye/copy icon next to the Secret Key, paste it into your password manager, then run the `flyctl secrets set` for that one variable.

You can rotate the secret later from this same screen (gear icon → **Rotate secret**) — it invalidates the old one immediately, so set the new value in Fly first, redeploy, then rotate.

**`CLOUDFLARE_ACCESS_TEAM_DOMAIN` and `CLOUDFLARE_ACCESS_AUDIENCE` — from Cloudflare Zero Trust → Access**

These two come from a different product (Zero Trust, formerly "Cloudflare for Teams") which has its own dashboard. Free for up to 50 users.

*Step A — Activate Zero Trust + find your team domain*

1. Cloudflare dashboard → click the Cloudflare logo to reach account home.
2. Left sidebar → **Zero Trust**. First time clicking this, you'll be asked to:
   - Pick a **team name** (e.g. `peakkineticspt`). This becomes part of your team domain. **Choose carefully — it's hard to change.**
   - Pick the **Free** plan (the only one you need; paid plans add seats and advanced features you don't need yet).
   - Add a payment method (required even on Free, but won't be charged).
3. After setup, you land in the Zero Trust dashboard at `https://one.dash.cloudflare.com/`.
4. Left sidebar → **Settings** → **Custom Pages** (or just **Settings** → scroll to **Team Domain**). The team domain is shown there in the form `<team-name>.cloudflareaccess.com`.
   - Example: if you picked team name `peakkineticspt`, your team domain is `peakkineticspt.cloudflareaccess.com`.
   - **This is `CLOUDFLARE_ACCESS_TEAM_DOMAIN`** — copy the full hostname (no `https://`, no trailing slash).

*Step B — Create an Access Application for the admin routes*

1. Still in Zero Trust → left sidebar → **Access** → **Applications**.
2. Click **Add an application**.
3. Pick **Self-hosted**.
4. Fill the form:
   - **Application name**: `Peak Kinetics Admin`
   - **Session duration**: `24 hours` (or your preference — sets how often admins re-auth).
   - **Application domain**: 
     - **Subdomain**: `api`
     - **Domain**: `peakkineticspt.com`
     - **Path**: `admin` *(restricts the gate to `api.peakkineticspt.com/admin/*`; leave blank to gate the whole API host instead)*
   - Leave the rest at defaults for now.
5. Click **Next**.
6. **Add policies** — at minimum one allow rule:
   - **Policy name**: `Allow staff`
   - **Action**: **Allow**
   - **Configure rules** → **Include** → **Emails** → list each admin email address (e.g. `so.oluwfemi@gmail.com`). Or use **Emails ending in** with your domain.
   - Click **Next**.
7. **Setup tab** — leave the defaults (HTTP-only cookie, browser rendering on, etc).
8. Click **Add application**.
9. After save, you land back on the Applications list. **Click the application you just created** to open its detail view.
10. On the detail view, scroll to the **Overview** section. There's a field labelled **Application Audience (AUD) Tag** — a 64-character hex string (e.g. `f1a23b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a`).
    - Copy it with the clipboard icon next to the field.
    - **This is `CLOUDFLARE_ACCESS_AUDIENCE`.**

*Step C — Verify the gate works*

> **Prerequisite:** Steps 5 (deploy) and 6 (DNS CNAME + Fly cert) must be complete first. Until `api.peakkineticspt.com` resolves and the Fly app is responding, the curl below will fail with `Could not resolve host` (silenced by `-s`, which is why a bare `curl -sI` looks like "no response"). You can confirm DNS isn't there yet with `dig +short api.peakkineticspt.com` — empty output = no record.

While you're waiting, you can sanity-check the Access policy itself **without** a deployed backend by opening your Application Launcher in a browser:

```
https://<your-team-name>.cloudflareaccess.com
```

You should see the `Peak Kinetics Admin` tile. Clicking it triggers the email-PIN flow — you won't reach a real page (no backend yet), but it proves the team domain + policy are correct.

Once Steps 5 + 6 are both done:

```bash
# Direct hit without an Access cookie should be 403:
curl -sI https://api.peakkineticspt.com/admin/anything | head -3

# Browse to https://api.peakkineticspt.com/admin/login in a normal browser tab.
# Cloudflare should intercept first, prompt for your email, send a one-time PIN,
# then forward you to the actual admin page after auth.
```

If the curl returns the actual admin response (no 403), the filter isn't seeing the secrets — re-check `flyctl secrets list` for both variables and that the app restarted after the set.

**Layer 3 — Feature flags (set when you turn the feature on, not before).**

*Twilio (SMS):* disabled by default (`twilio.enabled=false`); the no-op SMS bean takes its place and Twilio classes are never loaded. When you're ready to send real SMS:

```bash
flyctl secrets set --app peak-kinetics-api \
  TWILIO_ENABLED=true \
  TWILIO_ACCOUNT_SID='ACxxxxxx' \
  TWILIO_AUTH_TOKEN='xxxxxx' \
  TWILIO_PHONE_NUMBER='+1XXXXXXXXXX'
```

*Google Business Profile (review sync):* disabled by default (`google.business.enabled=false`); the no-op `IGoogleBusinessProfileService` bean takes its place, the scheduled `ReviewSyncTask` runs but imports zero reviews, and the `google-api-client` classes are never loaded. The OAuth flow + Business Profile API access is non-trivial to set up (refresh-token issuance, account/location ID lookup), so leave this off until the integration is fully validated. When ready:

```bash
flyctl secrets set --app peak-kinetics-api \
  GOOGLE_BUSINESS_ENABLED=true \
  GOOGLE_OAUTH_CLIENT_ID='xxxxxx.apps.googleusercontent.com' \
  GOOGLE_OAUTH_CLIENT_SECRET='xxxxxx' \
  GOOGLE_OAUTH_REFRESH_TOKEN='1//xxxxxx' \
  GOOGLE_BUSINESS_ACCOUNT='accounts/1234567890' \
  GOOGLE_BUSINESS_LOCATION='locations/9876543210'
```

*Cloudflare R2 (uploads):* not needed in Week 1 — uploads go to the `peak_uploads` Fly volume mounted at `/app/uploads`. Set these in Week 2 when swapping to R2:

```bash
flyctl secrets set --app peak-kinetics-api \
  R2_ENDPOINT='https://<account-id>.r2.cloudflarestorage.com' \
  R2_ACCESS_KEY_ID='xxxxxx' \
  R2_SECRET_ACCESS_KEY='xxxxxx' \
  R2_BUCKET='peak-kinetics-uploads' \
  R2_PUBLIC_BASE_URL='https://uploads.peakkineticspt.com'
```

`R2StorageService.isConfigured()` checks whether all five are non-blank; if any is empty, `FileUploadController` falls back to `LocalStorageService` (the Fly volume).

`GOOGLE_PLACES_*` is intentionally absent — the Places API can only return ≤5 reviews per place; the Business Profile flow above (OAuth + Business Profile API) is the only way to get the full feed.

Verify with `flyctl secrets list --app peak-kinetics-api`. After Layer 1 you should see **7 secrets**; +3 after Layer 2; +4 (Twilio), +6 (Google Business), and/or +5 (R2) as you turn on each Layer 3 feature.

### 5b. The deploy command (run this every time you ship)

```bash
cd /Users/billionairedev/workspace/peak-kinetics-prod
flyctl deploy --app peak-kinetics-api --remote-only
```

What each flag does:
- `--app peak-kinetics-api` — explicit app name. Required only if you have multiple `fly.toml` files; harmless to always include.
- `--remote-only` — builds the Docker image on Fly's builder VM, not on your laptop. Faster and avoids needing local Docker; also means the build environment is identical every time.

This single command:
1. Reads `fly.toml` from the current directory.
2. Builds `backend/Dockerfile` (multi-stage Maven → Temurin 21 JRE Alpine) on Fly's remote builder.
3. Pushes the image to Fly's registry.
4. Starts a new machine in `iad`, drains traffic from the old one (rolling strategy), waits for the `/actuator/health` check to pass, then kills the old machine.

Deploy time is ~3–5 minutes for a clean build, ~90 seconds when Maven and Docker layers are cached.

### 5c. Watch the deploy and verify

In a second terminal, stream logs while the deploy runs:

```bash
flyctl logs --app peak-kinetics-api
```

You're looking for, in this order:
- `Flyway Community Edition ... by Redgate`
- `Successfully validated N migrations`
- `Tomcat started on port(s): 8080`
- `Started PeakKineticsApplication in <n> seconds`

After the deploy returns "deployment successful":

```bash
flyctl status --app peak-kinetics-api                          # one machine, state=started, health=passing
curl -sSI https://peak-kinetics-api.fly.dev/actuator/health    # HTTP/2 200 — raw Fly host (this is all you can test now)
```

`api.peakkineticspt.com` won't work yet — that's Step 6.

### 5d. Common deploy commands cheat sheet

```bash
# Tail live logs
flyctl logs --app peak-kinetics-api

# See machine state, image SHA, region
flyctl status --app peak-kinetics-api

# SSH into the running machine for debugging
flyctl ssh console --app peak-kinetics-api

# Rotate / change a single secret (triggers automatic restart)
flyctl secrets set --app peak-kinetics-api JWT_SECRET="$(openssl rand -base64 48)"

# Roll back to the previous release if a deploy went sideways
flyctl releases --app peak-kinetics-api                    # find the previous version number
flyctl releases rollback <version> --app peak-kinetics-api

# Scale memory/CPU (rare; defined in fly.toml under [[vm]])
flyctl scale vm shared-cpu-2x --memory 2048 --app peak-kinetics-api

# Force a fresh deploy with no Docker layer cache (use sparingly — slower)
flyctl deploy --app peak-kinetics-api --remote-only --no-cache

# Restart all machines without rebuilding (e.g. after a secret rotation didn't auto-restart)
flyctl machine restart --app peak-kinetics-api
```

### 5e. If the deploy fails

| Symptom | First thing to check |
|---|---|
| Build fails on `mvn package` | Run locally first: `./scripts/mvn -f backend/pom.xml package`. The wrapper pins JDK 21; `mvn` directly may use the shell's default JDK 17 and fail. |
| Build succeeds, machine never goes healthy | `flyctl logs` — usually a missing secret (Spring fails at startup) or DB unreachable (check `DATABASE_URL` host/port + Aiven IP allowlist for Fly egress IPs). |
| Health check times out | `/actuator/health` is reachable on `localhost:8080` inside the machine but Cloudflare gets `522`. Check that `internal_port = 8080` in `fly.toml` matches the port Spring binds to. |

---

## Step 6 — Attach `api.peakkineticspt.com` to the Fly app (Week 1 Day 5)

**Prerequisite: Step 5 must be done.** `peak-kinetics-api.fly.dev/actuator/health` must return `200` before you start this. If it doesn't, the cert in 6b will sit `Awaiting validation` forever.

Orange cloud (proxied) is fine for `api.*` — your app doesn't store PHI (PromptEMR handles that), so you get Cloudflare's WAF / rate limiting / DDoS protection in front of Fly with no compliance trade-off.

### 6a. Add the DNS CNAME in Cloudflare

In the `peakkineticspt.com` zone → **DNS → Records** → **Add record**:
- Type: `CNAME`
- Name: `api`
- Target: `peak-kinetics-api.fly.dev` (your Fly app's `*.fly.dev` hostname — confirm with `flyctl status`)
- Proxy status: **Proxied (orange cloud)**
- TTL: Auto.

### 6b. Tell Fly to issue a cert for the custom domain

```bash
flyctl certs add api.peakkineticspt.com --app peak-kinetics-api
flyctl certs show api.peakkineticspt.com --app peak-kinetics-api
```

The first command kicks off Let's Encrypt cert issuance via DNS-01. The second prints the validation records you may need to add.

If `flyctl certs show` lists extra `_acme-challenge` `CNAME` or `TXT` records, add them in the `peakkineticspt.com` zone (orange cloud is fine).

### 6c. Verify

```bash
flyctl certs show api.peakkineticspt.com --app peak-kinetics-api    # status: Ready
curl -sSI https://api.peakkineticspt.com/actuator/health            # HTTP/2 200
```

If the cert stays `Awaiting configuration` for more than ~5 minutes: re-run `flyctl certs show`, copy the validation records it prints, add them in Cloudflare DNS.

Only create the subdomain on `.com`. Alt-domain users hit the Bulk Redirect to `.com` first and arrive at the canonical host.

---

## Ongoing housekeeping

- **Do not delete MX records** when cleaning out DNS — losing email is hard to recover.
- If you use Google Workspace / Microsoft 365, keep their TXT verification records on all four zones.
- **Email DKIM/SPF**: Resend (email provider) requires DNS records on whichever domain you send from (the default in `application.yml` is `peakkineticspt.net`). Publish Resend's DKIM + SPF TXT + the return-path CNAME in that zone. The other redirect domains don't need them since mail won't originate there.
- **Domain expiry**: all 4 domains must be renewed at GoDaddy. Set auto-renew on. A lapsed alt-domain redirect isn't a disaster, but a lapsed `.com` is.
- **Review Cloudflare zones quarterly**: prune stale records, rotate API tokens, check audit log.

---

## Quick troubleshooting cheat sheet

| Symptom | Likely cause |
|---|---|
| `.net` visitors land on `.net` instead of redirecting | Bulk Redirect not deployed, or DNS record not proxied |
| `.net` redirect strips the path (lands on `.com/` root) | Subpath matching = OFF in the redirect list; turn it ON |
| `api.*` certificate stuck pending | Validation records missing in `.com` zone; check `flyctl certs show` |
| Cutover: `.com` still hits old GCE VM | Old A record not deleted in Cloudflare DNS |
| Alt domain shows CF error `1001` | Dummy AAAA `100::` record missing or not proxied |
| Resend emails rejected by Gmail | DKIM/SPF records missing in the sending domain's Cloudflare zone |
