# Fortis Wealth Management — Deployment Plan

**Owner:** Rod
**Prepared:** 2026-04-23
**Current state:** Static HTML prototype (4 sections: Home / Portfolio / Strategy / Research)
**North star:** Ship something real, on a stack you can actually operate solo, without painting yourself into a corner when you add users and AI.

---

## Recommended stack (by phase)

| Layer | Phase 1 (now) | Phase 2 (real product) | Phase 3 (scale) |
|---|---|---|---|
| Frontend host | **GitHub Pages** | **Vercel** | Vercel (unchanged) |
| Domain + DNS | GH Pages default URL | **Cloudflare Registrar + Cloudflare DNS → Vercel** | same |
| Backend | None (client-only) | **Vercel Serverless Functions** (Node/TS) | Vercel + AWS Lambda for heavy jobs |
| Database | None (JSON in repo) | **Supabase Postgres** (auth + RLS built-in) | Supabase → RDS only if you actually outgrow it |
| Auth | None | **Supabase Auth** (magic link + OAuth) | same |
| File storage | None | **Supabase Storage** with signed URLs | S3 + CloudFront if global latency matters |
| AI API | None in Phase 1 | **Anthropic API via serverless proxy** (never from browser) | same + response caching layer |
| Secrets | N/A (no secrets in static) | Vercel env vars (per-env) + Supabase vault | same + AWS Secrets Manager if on AWS |
| Observability | Browser console | Vercel Analytics + **Sentry** (free tier) | + Datadog/BetterStack if needed |
| Email (domain-based) | N/A | **Cloudflare Email Routing** → your Gmail | same or Postmark if transactional |

**The principle:** Vercel + Supabase gets you 90% of what a typical SaaS needs with 10% of the ops work. Move to AWS only when a specific limit actually bites — not preemptively.

---

## Phased deployment plan

### Phase 1 — GitHub Pages prototype (weeks 0–4)

**Goal:** validate the Fortis v1 architecture (Home / Portfolio / Strategy / Research) with real clickable flows. No users, no data, no AI yet.

**What to upload:**
- Static HTML, CSS, JS
- `CNAME` file only if you wire up a custom domain (optional this phase)
- `public/404.html` if any client-side routing

**Deploy mechanics:**
- Branch: push to `main`, Pages serves from `/` or `/docs` (pick one and stick)
- URL: `https://<you>.github.io/fortis-wealth-builder/` — fine for now
- No staging yet; local dev + main is enough

**Hard rules for Phase 1:**
- **Zero secrets in code.** No API keys, no tokens, no `.env` files checked in. Static pages are world-readable.
- **Zero PII.** Don't hardcode your own portfolio numbers into committed files; use a `portfolio.sample.json` with fake data and read real numbers from a local-only file (`.gitignore` it).
- **No `localStorage` for anything sensitive.** Fine for UI preferences, nothing else.

**Exit criteria for Phase 1:**
- All four Fortis sections render and navigate
- You've personally clicked through every flow end-to-end
- You've decided what Phase 2 needs (auth? AI chat? file upload? just portfolio tracking?)

---

### Phase 2 — Vercel + Supabase (weeks 4–12)

**Goal:** turn the prototype into a real app. Auth, database, AI. Usable by you and a small circle of test users.

**Cutover steps (in order):**

1. **Buy the domain.** Cloudflare Registrar (at cost, no markup). Example: `fortiswealth.app`. Don't point DNS at anything yet.
2. **Stand up Supabase first.**
   - Create two projects: `fortis-staging` and `fortis-prod`. Separate databases, separate keys, separate blast radius.
   - Define schema: `users`, `portfolios`, `holdings`, `transactions`, `strategies`, `research_notes`, `ai_conversations`. Keep it boring and relational.
   - **Enable Row Level Security (RLS) on every table.** Default deny. Users can only see their own rows. This is non-negotiable.
3. **Set up the Next.js app** in the `laforce-capital` style repo (rename if you want; e.g. `fortis-app`). Reuse your HTML/CSS as starting pages or migrate to React components section by section.
4. **Configure Vercel.**
   - Connect the repo. Vercel gives you Production (from `main`) + Preview (every branch/PR) automatically.
   - **Environments:**
     - `Production` → `main` → uses prod Supabase project, prod Anthropic key
     - `Preview` → any branch → uses staging Supabase project, staging Anthropic key with lower rate limit
     - `Development` → local → staging Supabase + your own capped Anthropic key
   - Env vars (set in Vercel dashboard, **not** in code):
     - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (public, safe in browser)
     - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never in browser code)
     - `ANTHROPIC_API_KEY` (server-only)
     - `NEXT_PUBLIC_APP_URL` (public)
5. **Domain wiring.**
   - Staging: `staging.fortiswealth.app` → Vercel preview
   - Production: `fortiswealth.app` + `www` → Vercel production
   - Cloudflare DNS: CNAME records to Vercel's provided target. Turn **off** Cloudflare proxy (orange cloud) for the Vercel records — Vercel handles SSL. Leave proxy on for other records.
6. **Email on your domain.** Cloudflare Email Routing → forwards `rod@fortiswealth.app` to your Gmail. Free.
7. **AI integration.** Build one serverless function: `POST /api/ai/chat`. It:
   - Authenticates the caller via Supabase session
   - Enforces a per-user daily token budget (store usage in Postgres)
   - Calls Anthropic with your server-side key
   - Streams the response back
   - Logs the request (hashed, not raw prompts if sensitive) for cost attribution
8. **File upload.** If Phase 2 includes it:
   - Client requests a signed upload URL from `POST /api/storage/sign`
   - Server validates user + file type + size cap, returns a time-limited Supabase Storage signed URL
   - Client uploads directly to storage
   - Never let the client pick the bucket path; server assigns `userId/{uuid}.{ext}`
   - MIME allow-list, not deny-list
9. **Observability.** Wire up Sentry (free tier) for frontend + serverless errors. Add Vercel Analytics for traffic.
10. **Staging → prod ritual** (every release):
    - PR → Preview deploy (runs on staging Supabase)
    - Click-through smoke test on preview URL
    - Merge to `main` → auto-deploys to production
    - Verify prod within 10 min (same pattern as LaForce checklist)

**Exit criteria for Phase 2:**
- You (and 2–5 invited users) can sign in, track a portfolio, run Strategy/Research flows, and chat with the AI — end to end.
- Staging and prod are fully separated (different DB, different AI key).
- Cost is predictable: you can answer "what did AI cost me last week?" in one query.

---

### Phase 3 — AWS selectively (month 3+, if needed)

**Don't do this until a specific Vercel or Supabase limit actually blocks you.** The triggers that justify migration:

- You need a heavy batch job (>300 sec) that Vercel functions can't run → **AWS Lambda + SQS** or **AWS Step Functions**.
- You need a persistent websocket/background worker → **ECS Fargate** or **Fly.io**.
- Supabase Postgres is saturating CPU/connections and you've already optimized queries → **AWS RDS Postgres** with read replicas.
- Compliance requires a specific region or SOC 2-attested infra Supabase doesn't offer.
- File storage costs at Supabase Storage exceed S3 by enough to justify the migration work → **S3 + CloudFront**.

**Migration pattern when it happens:** move one layer at a time, never all at once. Frontend stays on Vercel. The backend gets decomposed into (a) Vercel for fast request/response, (b) AWS for heavy/async/long-lived. Database is the last thing you move, and only if you must.

---

## Environment variables — the rules

1. **Three environments, three key sets.** Development (your laptop), Preview/Staging (Vercel preview + staging Supabase), Production. Never share a database or an API key across environments.
2. **`.env.example` checked in** with placeholder names only (`ANTHROPIC_API_KEY=sk-ant-...`). Real `.env.local` is gitignored.
3. **Rotate on exposure.** If a key ever appears in a screenshot, a log, a Slack message — rotate immediately.
4. **`NEXT_PUBLIC_*` prefix only for values safe in the browser bundle.** Anything else is server-only.
5. **Service role keys never leave the server.** Ever. Not in client code, not in an npm package you publish, not in a Lambda that logs its environment.

---

## Staging vs production — keep them strictly separate

- **Separate Supabase projects** (different `SUPABASE_URL`). This is cheap and non-negotiable.
- **Separate Anthropic API keys** with different rate limits. Staging gets a small budget so a runaway loop in dev doesn't burn your prod allowance.
- **Separate Stripe keys** (test vs live) if/when you add billing.
- **Preview URLs are not public.** Put them behind Vercel password protection or basic auth until you're ready to invite users.
- **Never run destructive migrations directly on prod.** Always: run on staging → take a prod DB snapshot → run on prod → verify → keep snapshot for 7 days.

---

## Domain setup — specific steps

1. Register domain at Cloudflare Registrar.
2. Cloudflare DNS is automatic.
3. In Vercel → Project → Settings → Domains → add `fortiswealth.app` and `www.fortiswealth.app`. Vercel shows the required CNAME / A record targets.
4. Add those records in Cloudflare DNS. **Set them to DNS-only (gray cloud), not proxied**, so Vercel's TLS works.
5. Add `staging.fortiswealth.app` → CNAME to your Vercel preview alias.
6. Enable Cloudflare Email Routing: forward `rod@fortiswealth.app` to your Gmail.
7. Add SPF/DKIM/DMARC if you'll send email from the domain later. Not urgent in Phase 2.

---

## What to do **now** (this week)

1. **Register `fortiswealth.app`** (or your chosen name) at Cloudflare. Cheapest defensible step.
2. **Freeze the Phase 1 scope** to exactly the four Fortis sections. Don't scope-creep auth or AI yet.
3. **Remove any real portfolio numbers** from the committed HTML. Replace with `portfolio.sample.json`, gitignore a real `portfolio.local.json`.
4. **Create a `README.md`** with the 3-phase plan inline so future-you doesn't forget.
5. **Stand up a `staging` branch** in the `fortis` repo now, even while you're on GH Pages. Get used to the two-branch workflow before it matters.
6. **Spin up an empty Supabase `fortis-staging` project.** Free. Sketch the schema in a `db/schema.sql` file in the repo. No actual migration yet — just design.
7. **Apply for an Anthropic API key with a low monthly cap** (start at $20) so it's ready when Phase 2 kicks off.

Nothing else. Don't buy AWS anything. Don't stand up Terraform. Don't pick a CI tool beyond GitHub Actions. You'll burn time you don't have.

---

## What to avoid

- **Don't call the Anthropic API from the browser.** The key is visible in the bundle within 30 seconds of shipping. Always proxy through a server function.
- **Don't skip Row Level Security.** Supabase RLS is your per-user data isolation. Turning it on later is 10x the pain of turning it on first.
- **Don't commit `.env`, ever.** Use `.env.example` for shape and `.env.local` (gitignored) for values.
- **Don't store portfolio or financial data in `localStorage`.** Use the database. localStorage is not encrypted and survives deleted accounts.
- **Don't roll your own auth.** Supabase Auth (or Clerk, or Auth0) is free and safer than anything you'll write.
- **Don't point your apex domain at GitHub Pages if you plan to migrate to Vercel soon.** DNS cutover with CDN + SSL is mildly annoying; pick your production host (Vercel) and wire the domain there once.
- **Don't mix staging and prod data.** Two Supabase projects, two AI keys. Non-negotiable.
- **Don't deploy without a rollback plan.** Every deploy should have a known-good commit SHA written down (same rule as the LaForce checklist).
- **Don't migrate to AWS on vibes.** Only migrate when a specific, measured limit blocks you. "Someday we'll need AWS" is not a migration trigger.
- **Don't let AI costs run uncapped.** Enforce a per-user daily token budget in your `/api/ai/chat` function on day one.
- **Don't build features outside the Fortis v1 architecture.** You already set that rule — this plan respects it.

---

## Rollback & disaster recovery (Phase 2+)

- **App:** Vercel keeps every deploy; roll back via Dashboard → Deployments → previous → Promote to Production. One click.
- **Database:** Supabase Pro includes Point-in-Time Recovery. On Free tier, schedule a daily `pg_dump` to Supabase Storage or S3. Keep 30 days.
- **Secrets:** if a key leaks, rotate in the Anthropic/Supabase dashboard, update Vercel env var, redeploy. The full cycle should take under 10 minutes.
- **Practice this once** on staging before you need it in a real incident.

---

## Open questions for you to answer before Phase 2

1. Is Fortis for **you only**, **a private circle (<20)**, or **public product**? That changes auth complexity and whether you need Stripe.
2. Does the AI need to see your actual portfolio numbers, or only anonymized context? Affects PII handling.
3. Are you willing to pay $25/mo for Supabase Pro at Phase 2 launch for PITR backups? Strongly recommended once real user data lands.
4. What's your chosen domain name? Register this week either way.
