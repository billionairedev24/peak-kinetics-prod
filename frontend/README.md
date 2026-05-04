# Peak Kinetics — Frontend

Next.js 16 app running on Cloudflare Pages. Talks to a Spring Boot backend on Fly.io.

## Quick start

```bash
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL etc.
pnpm install
pnpm dev                             # http://localhost:3000
```

See **[../docs/local-testing.md](../docs/local-testing.md)** for the full local stack (Postgres + backend + frontend) setup.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm pages:build` | Cloudflare Pages build via `@cloudflare/next-on-pages` |
| `pnpm e2e` | Playwright smoke tests |
| `pnpm e2e:install` | One-time Playwright browser install |

## Docs

All deployment and ops docs live in **[../docs/](../docs/)**.
