# Fortis — Local → Live Runbook

**Purpose:** the exact, ordered steps to take Fortis from your laptop to a real production URL, with secure file upload baked in from day one.
**Companion to:** `fortis_deployment_plan.md` (the strategy). This doc is the *execution*.

---

## Hosting recommendation (decide first)

**Use Vercel.** One sentence: it deploys from GitHub on every push, gives you a free preview URL per branch, manages SSL, handles serverless functions, and scales without you touching a load balancer.

**Why not AWS yet:** AWS gives you more power and more ways to misconfigure security in your sleep. As a solo builder, your scarce resource is time, not compute. Migrate to AWS only when a specific Vercel limit blocks you (long-running jobs, websockets, region-locked compliance). Until then, Vercel + Supabase covers everything Fortis needs.

**The full stack you're deploying to:**
- Vercel — frontend + serverless API routes
- Supabase — Postgres database + Auth + Storage
- Cloudflare — domain registrar + DNS + email forwarding
- Anthropic — AI API, called server-side only
- Sentry — error monitoring (free tier)

---

## Step-by-step deployment plan

### Step 1 — Local repo hygiene (before you push anything)

1. From the project root, run `git status`. Confirm you actually want every untracked file included.
2. Create `.gitignore` with at minimum:
   ```
   .env
   .env.local
   .env.*.local
   node_modules/
   .next/
   .vercel/
   *.log
   .DS_Store
   portfolio.local.json
   uploads/
   ```
3. Create `.env.example` with **placeholder names only** — no real secrets:
   ```
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Run `git log --all -p | grep -i "sk-\|api[_-]key\|password\|secret"` to scan history for accidentally-committed secrets. If anything shows up, rotate that key now and rewrite history with `git filter-repo` before pushing.
5. Confirm no real portfolio numbers, account IDs, or PII are in committed files. Replace with `portfolio.sample.json`.

### Step 2 — Push to GitHub

1. Create a private repo: `fortis-app` (or your chosen name). **Private**, not public.
2. From local: `git remote add origin git@github.com:<you>/fortis-app.git && git push -u origin main`.
3. Create `staging` branch: `git checkout -b staging && git push -u origin staging`.
4. In GitHub → **Settings → Branches**, add a protection rule on `main`:
   - Require pull request before merging
   - Require status checks (you'll wire CI later)
   - Block force pushes
5. **Settings → Secrets and variables → Actions** — leave empty for now. Real secrets live in Vercel, not GitHub Actions, unless you wire CI to run tests against a database.

### Step 3 — Set up Supabase (database + storage + auth)

1. Sign up at supabase.com. Create **two projects**: `fortis-staging` and `fortis-prod`.
2. For each project, copy from **Project Settings → API**:
   - `Project URL` (the `SUPABASE_URL`)
   - `anon public` key (the `SUPABASE_ANON_KEY`, safe in browser)
   - `service_role` key (the `SUPABASE_SERVICE_ROLE_KEY`, **server-only**)
3. In **Authentication → Providers**, enable Email magic link (and OAuth if you want Google sign-in). Add `https://staging.fortiswealth.app` and `https://fortiswealth.app` to the allowed redirect URLs (you'll set up the domain in Step 6).
4. In **Database → Tables**, create your schema. Minimum starting set:
   - `users` (mirrors `auth.users`, holds profile)
   - `portfolios` (user_id FK)
   - `holdings` (portfolio_id FK)
   - `transactions` (portfolio_id FK)
   - `ai_conversations` (user_id FK)
   - `uploads` (user_id FK, path, mime, size, sha256, scanned_at, status)
5. **Turn on Row Level Security on every table.** Then add policies — at minimum, the canonical "user can only see their own rows":
   ```sql
   alter table portfolios enable row level security;
   create policy "user owns portfolio"
     on portfolios for all
     using (user_id = auth.uid());
   ```
   Repeat for every table. **Default deny — explicit allow.**
6. In **Storage → Buckets**, create two buckets: `user-uploads` (private) and `public-assets` (public, optional). Bucket policies follow in Step 7 below.

### Step 4 — Connect Vercel

1. Sign up at vercel.com → **Import Project** → pick `fortis-app` from GitHub.
2. Vercel auto-detects framework. If it's a Next.js app, accept defaults; if static, set output directory accordingly.
3. **Environment Variables** — set these for each environment, separately:
   - **Production environment** (uses prod Supabase keys, prod Anthropic key)
   - **Preview environment** (uses staging Supabase keys, staging Anthropic key with low cap)
   - **Development** (you'll set these in `.env.local` on your laptop, not in Vercel)
4. Variable names (set in dashboard, never in code):
   ```
   SUPABASE_URL              (per env)
   SUPABASE_ANON_KEY         (per env, safe in browser)
   NEXT_PUBLIC_SUPABASE_URL  (per env, browser-exposed)
   NEXT_PUBLIC_SUPABASE_ANON_KEY (per env, browser-exposed)
   SUPABASE_SERVICE_ROLE_KEY (per env, SERVER ONLY — never NEXT_PUBLIC_)
   ANTHROPIC_API_KEY         (per env, SERVER ONLY)
   NEXT_PUBLIC_APP_URL       (per env)
   ```
5. Click **Deploy**. First deploy takes 1–3 minutes. Vercel gives you a URL like `fortis-app-<hash>.vercel.app`.
6. Open that URL. Verify it loads. If it doesn't, check Vercel → Deployments → click the deploy → Logs.

### Step 5 — Two-environment deploy flow

1. Wire branches to environments in Vercel → Project → Settings → Git:
   - `main` → Production
   - `staging` → Preview (you can name the preview alias `staging.fortiswealth.app` later)
   - Any other branch → ephemeral preview
2. Your daily flow:
   - `git checkout -b feature/<name>` → push → Vercel creates a preview URL
   - PR into `staging` → preview URL updates with merged code
   - Test on staging with staging Supabase data
   - PR `staging` → `main` → production deploys
3. **Never push directly to `main`.** Branch protection enforces this; respect it.

### Step 6 — Domain + SSL

1. Register `fortiswealth.app` (or chosen name) at **Cloudflare Registrar**. At-cost pricing, no markup.
2. In Vercel → Project → Settings → Domains:
   - Add `fortiswealth.app` (apex)
   - Add `www.fortiswealth.app`
   - Add `staging.fortiswealth.app` (assign to the `staging` branch deployment)
3. Vercel shows the required CNAME / A record targets. Copy them.
4. In Cloudflare → DNS:
   - Add the records exactly as Vercel specified
   - **Set proxy status to DNS-only (gray cloud)** for the Vercel records — Vercel handles TLS, Cloudflare proxy interferes
5. Wait 1–10 min. Vercel auto-issues Let's Encrypt SSL. Domain panel turns green.
6. Test: `https://fortiswealth.app` and `https://staging.fortiswealth.app` both load with valid SSL.
7. Optional: Cloudflare Email Routing → forward `rod@fortiswealth.app` to your Gmail. Free, takes 2 min.

### Step 7 — Secure file upload (the part that matters most)

This is the layered defense. Each layer assumes the previous one might fail. Implement all of them.

**Architecture:** client never writes directly to storage. Client asks your server for a signed upload URL, server validates everything, returns a short-lived URL, client uploads, server records the upload and queues a scan.

**Layer 1 — Server-issued signed URLs (never let the client pick the path):**

1. Build a serverless function `POST /api/uploads/sign`. Authenticate the caller (Supabase session). Reject if not signed in.
2. Server validates the request body:
   - `filename` — keep only the extension; discard the user's name
   - `size` — must be ≤ your cap (e.g. 10 MB). Reject if larger.
   - `mime` — must be in your allow-list (see Layer 3)
3. Server generates the storage path itself:
   ```
   user-uploads/{user_id}/{yyyy-mm}/{uuid}.{ext}
   ```
   The user never controls the path. No `../`, no traversal.
4. Server creates a Supabase signed upload URL with **5-minute TTL**:
   ```js
   const { data } = await supabase.storage
     .from('user-uploads')
     .createSignedUploadUrl(generatedPath);
   ```
5. Server inserts a row in `uploads` table with status `pending`, the path, the claimed mime, the user_id, the size, and `expires_at`.
6. Server returns `{ uploadUrl, path }` to the client. Client `PUT`s the file to `uploadUrl`.

**Layer 2 — Storage RLS (defense if signed URL is misused):**

Bucket policies in Supabase Storage:
```sql
-- Read: users can only read files under their own user_id prefix
create policy "users read own files"
  on storage.objects for select
  using (bucket_id = 'user-uploads'
         and (storage.foldername(name))[1] = auth.uid()::text);

-- Insert: only via signed URL (Supabase enforces this when no policy allows direct insert)
-- Update/Delete: deny by default; only server-role key can mutate
```

**Layer 3 — MIME allow-list (validate by magic bytes, not by header):**

The `Content-Type` header sent by the browser is *user-controlled* and lies. Validate the actual file bytes server-side after upload:

1. After the client confirms upload, call `POST /api/uploads/finalize` with the `path`.
2. Server downloads first 4KB of the file from Supabase Storage.
3. Use `file-type` (npm) or equivalent to detect the **real** MIME from magic bytes.
4. If detected MIME is not in your allow-list (e.g. `image/png`, `image/jpeg`, `application/pdf`, `text/csv`), delete the file from storage and mark the row `rejected`.
5. **Never accept** `text/html`, `application/javascript`, or any executable.

**Layer 4 — Virus / malware scan (for any user-uploaded file):**

1. After MIME validation, queue a scan. Options:
   - Cloudmersive Virus Scan API (free tier) — call from a serverless function
   - ClamAV running on a small Render or Fly.io worker
   - For images, run through `sharp` to re-encode (strips EXIF and any embedded payloads)
2. Update the `uploads` row: `status = 'clean'` or `'infected'`. If infected, delete the file and notify yourself (Sentry alert).
3. Files in `pending` or `scanning` status are not served to users.

**Layer 5 — Safe download:**

1. Don't serve user uploads from `fortiswealth.app/<path>`. Serve via a signed download URL from a separate endpoint:
   ```
   GET /api/uploads/:id/download
   ```
2. Server checks the requester owns the file (or has been granted access), then returns a Supabase signed download URL with a short TTL (60 sec).
3. Set `Content-Disposition: attachment; filename="<sanitized>"` so browsers download instead of rendering — kills inline HTML/JS execution risk.

**Layer 6 — Limits and abuse controls:**

- Per-user upload rate limit: e.g. 20 files per hour. Track in `uploads` table.
- Per-user storage quota: e.g. 500 MB total.
- Reject uploads from unauthenticated sessions, period.
- Log every upload with: user_id, ip, user_agent, path, size, mime, sha256, scan_result. This is your audit trail.
- Strip EXIF GPS data from images before storage if you don't need it.

**Layer 7 — Retention:**

- Soft-delete uploads (mark `deleted_at`); hard-delete after 30 days via a cron.
- Auto-delete failed/infected uploads within 1 hour.

### Step 8 — AI API integration (server-only)

1. Build `POST /api/ai/chat` as a Vercel serverless function.
2. Authenticate the caller. Reject anonymous.
3. Read `ANTHROPIC_API_KEY` from `process.env` — server-side only. **Never** prefix with `NEXT_PUBLIC_`.
4. Enforce per-user daily token cap. Track in a `usage` table; if exceeded, return 429.
5. Stream the response. Log token counts but not raw prompts (privacy + log size).
6. Set up a billing alert at Anthropic for $X/month so a runaway loop doesn't burn $500.

### Step 9 — Observability

1. Sign up for Sentry (free tier). Add the SDK. Wrap your serverless functions and client.
2. Vercel Analytics — enable in dashboard. Free for basic traffic.
3. Set up a Cloudflare email alert (or Sentry → Slack) for any 5xx spike.

### Step 10 — Verify live (after first prod deploy)

In order:

1. `curl -i https://fortiswealth.app/` → 200, valid SSL.
2. Open in incognito. Sign in via magic link. Confirm email arrives.
3. Try one full Fortis flow end-to-end (Portfolio → add holding → see it persist after refresh).
4. Upload a file:
   - Try a valid PDF → should succeed, appear in your uploads list
   - Try a `.exe` renamed to `.pdf` → should be rejected by Layer 3 MIME validation
   - Try a 50 MB file when cap is 10 MB → should be rejected at signed URL request
5. Send an AI chat message. Confirm response streams. Check token usage logged.
6. DevTools → Network → confirm no `service_role` key, no Anthropic key visible in any browser-side JS bundle. Run `grep -r "sk-ant" .next/` on your build output to be sure.
7. Sentry → confirm test error event arrives.
8. Watch Vercel logs for 10 min after launch for unexpected 5xx.

### Step 11 — Rollback (have this ready before you launch)

- **App rollback:** Vercel → Deployments → previous green deploy → **Promote to Production**. ~30 seconds.
- **DB rollback:** if a migration broke prod, restore from Supabase backup (PITR on Pro tier; daily `pg_dump` if Free).
- **Secret leaked:** rotate the key in Anthropic / Supabase → update Vercel env var → redeploy. <10 min full cycle.
- **Domain misconfigured:** revert DNS records in Cloudflare to last-known-good values. Keep a screenshot of working DNS state.

---

## Decision summary

- **Hosting:** Vercel + Supabase + Cloudflare. Don't go to AWS until a specific limit forces it.
- **Repo layout:** `main` = production, `staging` = preview, feature branches off `staging`.
- **Secrets:** in Vercel env vars per environment, never in code, never browser-exposed unless prefixed `NEXT_PUBLIC_`.
- **File upload security:** seven layers — signed URL, RLS, magic-byte MIME validation, virus scan, safe download with `Content-Disposition: attachment`, rate/quota limits, retention.
- **Today's first move:** Steps 1 and 2 — clean local repo and push to a private GitHub repo with branch protection. Everything else builds on that.
