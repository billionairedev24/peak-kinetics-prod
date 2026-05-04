# Week 3 — manual steps

Code changes are in the repo. This document covers what you do by hand.

> Pre-req: Week 2 cutover complete. Site live on Cloudflare Pages, backend on Fly, admin behind Cloudflare Access, Turnstile gating public forms.

---

## 1. Cloudflare Web Analytics

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site**
2. Hostname: `peakkineticspt.com`. Save.
3. Cloudflare returns a **token** (in the JS snippet, `data-cf-beacon='{"token":"..."}'`). Copy just the token string.
4. Pages project → **Settings → Environment Variables**:
   - `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` = the token (apply to **Production** and **Preview**)
5. Trigger a redeploy (or wait for next push to `main`).
6. After ~10 min, verify in Web Analytics dashboard that page views are flowing.

- [ ] Site added in CF Web Analytics.
- [ ] Token set as Pages env var.
- [ ] Redeploy triggered.
- [ ] Page views visible in dashboard.

---

## 2. Uptime monitoring (UptimeRobot, free tier)

1. Sign up at https://uptimerobot.com (free tier: 50 monitors at 5-min interval).
2. Create monitors:
   - **Backend health** — HTTPS, `https://api.peakkineticspt.com/actuator/health`, expect 200, every 5 min
   - **Frontend** — HTTPS, `https://peakkineticspt.com/`, expect 200, every 5 min
   - (Optional) `https://peakkineticspt.net/` — should return 301; UptimeRobot accepts 301 as "up" by default
3. Add an alert contact (email at minimum; SMS or Slack better).
4. Configure escalation: notify after **2 consecutive failures** to avoid noise.

- [ ] Both monitors green.
- [ ] Alert email/SMS test passed.

---

## 3. Grafana Cloud — backend observability (metrics, traces, logs)

The backend already ships metrics (Micrometer), traces (Spring Boot tracing + OpenTelemetry), and logs (Logback OTLP appender) via OTLP. By default the exporters point at `localhost:4318`, which doesn't exist on the Fly machine, so they fail with `Connection refused` until you point them at a real collector. **Grafana Cloud's free tier** is more than enough for this app's volume:

- 10,000 active series for metrics (Mimir)
- 50 GB of logs / month (Loki)
- 50 GB of traces / month (Tempo)
- 14-day retention on all three
- No credit card required

### 3a. Get the OTLP endpoint + auth token from Grafana Cloud

1. Sign in to **https://grafana.com/auth/sign-in/** and open your stack from **My Account → My Stacks** (or click the orange **Launch** button next to your stack name).
2. Inside the stack, look at the left sidebar — find **Connections** (plug icon). Click it.
3. **Connections → Add new connection** (top-right).
4. In the search bar type `OpenTelemetry` and click the tile labelled **OpenTelemetry (OTLP)**.
5. The next page has tabs across the top — click **OpenTelemetry Protocol (OTLP)**.
6. Scroll down to the section **"Configure your application"**. You'll see two pieces of information:

   - **OTLP Endpoint URL** — looks like `https://otlp-gateway-prod-us-east-0.grafana.net/otlp`. The region in the middle (`us-east-0`, `eu-west-2`, etc.) depends on where your stack is hosted. Copy the full URL exactly as shown — including the trailing `/otlp`, no trailing slash beyond that.
   - **Authorization header** — pre-formatted as `Authorization: Basic <long-base64-string>`. The base64 part encodes `instance-id:access-token`.

7. If the auth header isn't pre-shown:
   - Look for **"Generate now"** or **"Create token"** button on the same page. Click it.
   - Grafana asks for a token name — call it `peak-kinetics-fly` and pick scope **"Send metrics, logs, traces"** (or check all three: `metrics:write`, `logs:write`, `traces:write`).
   - Click **Create**. Grafana returns a one-time token + an **"Encoded credentials"** string. Copy the **Encoded credentials** value — that's the base64 you need.
   - The full header value is then `Basic <encoded-credentials>`.

8. **Save both values to your password manager immediately.** The token is shown only once. If you lose it, you have to revoke and regenerate (Grafana Cloud → Security → Access Policies → your token → Delete + create new).

### 3b. Set Fly secrets

Replace `<region>` and `<base64-token>` with your real values:

```bash
flyctl secrets set --app peak-kinetics-api \
  GRAFANA_OTLP_ENABLED=true \
  GRAFANA_OTLP_ENDPOINT='https://otlp-gateway-prod-<region>.grafana.net/otlp' \
  GRAFANA_OTLP_AUTH='Basic <base64-token>' \
  OTEL_EXPORTER_OTLP_ENDPOINT='https://otlp-gateway-prod-<region>.grafana.net/otlp' \
  OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  OTEL_EXPORTER_OTLP_HEADERS='Authorization=Basic <base64-token>' \
  OTEL_RESOURCE_ATTRIBUTES='service.name=peak-kinetics,service.namespace=peakkineticspt,deployment.environment=prod'
```

Why two sets of variables:

| Variable group | Read by | Used for |
|---|---|---|
| `GRAFANA_OTLP_*` | `application-prod.yml` `management.otlp.*` properties | Spring Boot's metrics + tracing exporters (Micrometer + Spring Boot tracing) |
| `OTEL_EXPORTER_OTLP_*` | The OpenTelemetry SDK directly (env-var convention) | The Logback OTLP appender that ships `log.info(...)` lines as logs |

`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` is **critical**. Grafana Cloud's OTLP gateway speaks HTTP/protobuf, not gRPC. Without this var the SDK defaults to gRPC and every push fails with HTTP 415.

`OTEL_RESOURCE_ATTRIBUTES` tags every signal with service identity so you can filter the data in Grafana Explore. Add `instance.id=$FLY_MACHINE_ID` later if you scale to multiple machines and want per-instance breakdowns.

`flyctl secrets set` triggers an automatic restart, so the new config is live within ~30 seconds. If the matching YAML config in `application-prod.yml` (the `management.otlp.*` block) wasn't already deployed, redeploy:

```bash
cd /Users/billionairedev/workspace/peak-kinetics-prod
flyctl deploy --app peak-kinetics-api --remote-only
```

### 3c. Verify the connection

The success signal is the absence of `Connection refused` against `localhost:4318`. Tail logs:

```bash
flyctl logs --app peak-kinetics-api | /usr/bin/grep -iE 'otlp|opentelemetry|grafana'
```

Expected: silence on the OTLP front (no errors), or one-line "publishing metrics" info messages.

Common failure modes:

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` from Grafana hostname | Wrong / expired token | Regenerate in Grafana Cloud, re-set `GRAFANA_OTLP_AUTH` and `OTEL_EXPORTER_OTLP_HEADERS` |
| `415 Unsupported Media Type` | Protocol mismatch | Set `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` (most likely) or `grpc` |
| `Connection refused` against `localhost:4318` (still) | `GRAFANA_OTLP_ENABLED` not `true`, or the YAML block didn't ship | `flyctl secrets list --app peak-kinetics-api` to confirm; redeploy |
| `404 Not Found` against Grafana | URL has trailing slash, or missing `/otlp` suffix | Re-copy the URL from the Grafana onboarding page exactly |

### 3d. See your data in Grafana

Generate some traffic so there's something to see:

```bash
for i in {1..30}; do curl -s https://api.peakkineticspt.com/actuator/health > /dev/null; sleep 1; done
```

Open Grafana stack → left sidebar → **Explore** (compass icon). Top-left dropdown — switch the data source between three:

| Data source | Sample query | What you'll see |
|---|---|---|
| `grafanacloud-<stack>-prom` (Mimir / metrics) | `{service_name="peak-kinetics"}` | All Micrometer metrics — JVM heap, HTTP request latency histograms, JDBC pool stats |
| `grafanacloud-<stack>-traces` (Tempo) | service.name = `peak-kinetics` | Per-request spans showing controller → service → DB call timing |
| `grafanacloud-<stack>-logs` (Loki) | `{service_name="peak-kinetics"}` | Application logs (`log.info`, `log.warn`, etc.) ingested via the Logback appender |

If nothing shows up after 1–2 minutes:
- **Metrics**: confirm Micrometer is publishing (`http_server_requests_seconds` should appear after any HTTP hit).
- **Logs**: confirm `OTEL_EXPORTER_OTLP_ENDPOINT` is set (the Logback appender doesn't read `GRAFANA_OTLP_*`).
- **Traces**: confirm `management.tracing.sampling.probability` in `application-prod.yml` is > 0 (currently `0.1` = 10%).

### 3e. Pre-built dashboards

Grafana ships free dashboards that auto-populate from Spring Boot / JVM metrics:

1. Stack → **Dashboards** → **New** → **Import**.
2. Paste a dashboard ID, click **Load**:
   - **`12900`** — JVM (Micrometer): heap, GC, threads
   - **`11378`** — Spring Boot 2.x Statistics: HTTP request rates, latency percentiles
   - **`6756`** — JDBC connection pool (HikariCP)
3. On the import screen, pick `grafanacloud-<stack>-prom` as the Prometheus data source.
4. Click **Import**. Dashboard is live.

Pin the JVM dashboard to your Grafana home (star icon top-right) so you see it on login.

### 3f. Alerting (optional, for later)

Once you've watched normal traffic patterns for a week, set basic alerts in Grafana → **Alerts → Alert rules → New alert rule**:

| Rule | Query (rough) | Condition |
|---|---|---|
| Backend down | `up{service_name="peak-kinetics"}` | `< 1 for 2m` |
| High 5xx rate | `sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))` | `> 0.1 for 5m` |
| Heap > 90% | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}` | `> 0.9 for 10m` |
| DB pool saturated | `hikaricp_connections_pending` | `> 5 for 5m` |

Route to the same email contact you set up in UptimeRobot to consolidate notifications.

- [ ] OTLP credentials retrieved from Grafana Cloud and saved in password manager.
- [ ] Fly secrets set (both `GRAFANA_OTLP_*` and `OTEL_EXPORTER_OTLP_*`).
- [ ] No `Connection refused` lines in `flyctl logs`.
- [ ] Test traffic shows up in Grafana Explore (metrics + traces + logs).
- [ ] At least one Spring Boot / JVM dashboard imported.

---

## 4. Aiven backup verification

Aiven Postgres has automatic backups by default. Worth confirming the policy is what you want.

1. Aiven console → your service → **Backups** tab.
2. Confirm:
   - Retention period (default usually 7 days; bump to 14 or 30 if you have headroom).
   - Daily backup window is set to a low-traffic hour.
3. **Restore drill** (do this once, then quarterly):
   - Pick the latest backup → **Fork service** → restores to a *new* Aiven instance.
   - Connect to the fork: `psql "postgres://..."` and verify a few tables have the expected row counts.
   - Destroy the fork.

- [ ] Backup retention confirmed.
- [ ] One successful restore drill completed; date noted in `docs/runbook.md`.

---

## 5. Dark mode quick check

After redeploy:
1. Open `peakkineticspt.com` on desktop.
2. Click the sun/moon icon in the header (next to the Admin button).
3. Toggle through **Light → Dark → System**.
4. Refresh — selection persists, no white-flash on dark mode.
5. On mobile: same toggle is reachable from the header at all viewport sizes.

If anything reads broken (low contrast, invisible icons), the offending component is hardcoding light-mode color tokens — fix by using semantic Tailwind tokens (`bg-background`, `text-foreground`) instead of `bg-white`, `text-gray-900`.

- [ ] Toggle works.
- [ ] No dark-mode visual regressions on critical pages.

---

## 6. SEO submission

1. **Google Search Console** (https://search.google.com/search-console):
   - Add property `https://peakkineticspt.com`
   - Verify ownership via the meta tag in the head — replace `your-google-verification-code` in `app/layout.tsx:45` with the code Google gives you, redeploy, then click Verify.
   - Submit sitemap: `https://peakkineticspt.com/sitemap.xml`
2. **Bing Webmaster Tools** (https://www.bing.com/webmasters):
   - Same drill, submit the same sitemap.
3. Verify:
   ```bash
   curl -sS https://peakkineticspt.com/sitemap.xml | head -20
   curl -sS https://peakkineticspt.com/robots.txt
   ```

- [ ] Google verification code added in `layout.tsx` and redeployed.
- [ ] Sitemap submitted to Google Search Console.
- [ ] Sitemap submitted to Bing.
- [ ] First crawl recorded (within 24–48h).

---

## 7. Verify the URL fix

The legacy code referenced `peakkinetics.com` (no `pt`). Week 3 corrected this everywhere. Spot-check:

```bash
grep -rn "peakkinetics\.com" frontend/app frontend/components 2>/dev/null \
  | grep -v "peakkineticspt\.com" \
  | grep -v node_modules
```

Should produce no output. If it does, fix and redeploy.

- [ ] Audit clean.

---

## 8. Lighthouse pass (optional but worth it)

```bash
npx lighthouse https://peakkineticspt.com/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --view
```

Targets:
- Performance: 90+ on desktop, 75+ on mobile
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

Common low-hanging fruit if scores are below target:
- Add explicit `width`/`height` on `<Image />` to prevent CLS
- Compress hero images (TinyPNG / Squoosh)
- Set `font-display: swap` (already done via Next font loader)

- [ ] Lighthouse run captured; scores recorded in `docs/runbook.md`.

---

## What "Week 3 done" looks like

- Dark mode toggle in header, system-preference aware, no flash.
- All `peakkinetics.com` references corrected to `peakkineticspt.com`.
- Per-route OpenGraph metadata for all 6 service pages.
- `app/sitemap.ts` and `app/robots.ts` generated dynamically; legacy `public/*.xml` files removed.
- Homepage below-the-fold sections + BodyMap + WhatsApp chat lazy-loaded.
- Admin sidebar gets Escape-to-close, body-scroll-lock, ARIA wiring; logout points to Cloudflare Access.
- Skeleton loaders on `/admin/messages`, `/admin/blog`, `/admin/videos` (replaced spinners).
- Cloudflare Web Analytics beacon wired (no-op until token set).
- Sitemap submitted to Google + Bing.
- UptimeRobot monitoring backend + frontend.
