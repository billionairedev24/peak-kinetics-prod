# Peak Kinetics — Documentation

All setup and operations docs live here. Organized by purpose, not chronology.

## Start here

- **[deployment-overview.md](deployment-overview.md)** — **read this first.** The mental model: where the frontend lives, where the backend lives, how they talk, in what order things must be done. No commands — just the picture. Skip ahead and you'll hit the "I deployed but nothing works" trap.
- **[migration-plan.md](migration-plan.md)** — the 3-week plan that took us from GCE to Cloudflare + Fly.io. Architecture, scope, what's in / out, and the Week 3 polish menu.
- **[local-testing.md](local-testing.md)** — spin up the full stack on your laptop (Postgres + backend + frontend) and click through before touching anything in Cloudflare or Fly. Do this first.

## Setup playbooks — run top to bottom for a fresh environment

Sequential playbooks. Each document is self-contained but assumes the previous step is complete.

1. **[cloudflare-domains.md](cloudflare-domains.md)** — transfer all 4 domains from GoDaddy to Cloudflare DNS, set up Bulk Redirects (`.net` / `.shop` / `.us` → `.com`), add `api.peakkineticspt.com` CNAME.
2. **[week1-manual-steps.md](week1-manual-steps.md)** — **Fly.io backend.** Provision the app + volume, set secrets, configure Resend DKIM/SPF, baseline the Flyway migration, deploy, add cert.
3. **[week2-manual-steps.md](week2-manual-steps.md)** — **Cloudflare Pages + R2 + Access + Turnstile.** Provision the R2 bucket, Zero Trust / Access application (gates `/admin/*`), Turnstile site (bot-protects public forms), connect Pages to Git, DNS cutover.
4. **[week3-manual-steps.md](week3-manual-steps.md)** — **Observability.** Cloudflare Web Analytics beacon, UptimeRobot monitors, Aiven backup verification drill, Google / Bing Search Console submission.

## Reference

- **[bodymap-v2.md](bodymap-v2.md)** — how to swap the hand-authored SVG body silhouette for a licensed anatomical illustration (sources, integration steps) when you want a more realistic look.

## Where to find what

| I want to… | Document |
|---|---|
| Understand how UI and backend fit together | `deployment-overview.md` |
| Understand the overall architecture | `migration-plan.md` |
| Run the app on my laptop | `local-testing.md` |
| Move a domain to Cloudflare | `cloudflare-domains.md` |
| Deploy the backend to Fly.io | `week1-manual-steps.md` |
| Configure R2 for file uploads | `week2-manual-steps.md` §1 |
| Gate `/admin` with Cloudflare Access | `week2-manual-steps.md` §2 |
| Add Turnstile bot protection | `week2-manual-steps.md` §3 |
| Deploy the frontend to Pages | `week2-manual-steps.md` §4 |
| Cut DNS from GCE to Cloudflare | `week2-manual-steps.md` §6 |
| Add analytics / uptime monitoring | `week3-manual-steps.md` §1–2 |
| Verify DB backups | `week3-manual-steps.md` §3 |
| Upgrade the BodyMap component | `bodymap-v2.md` |

## Things not documented here

- **CLAUDE.md** and config at repo root — AI assistant configuration, not deployment-facing.
- **backend/HELP.md** — Spring Initializr boilerplate, keep as-is for framework pointers.
- **Secrets values** — never committed. Each `week*-manual-steps.md` lists the env var names; the actual values live in `flyctl secrets`, Cloudflare Pages env vars, and your password manager.
