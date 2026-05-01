# LaForce Capital — Production Deploy Checklist

**Architecture**
- Frontend: `laforce-capital` → GitHub Pages (static)
- Backend: `laforce-api` → Render (web service)
- Deploy type: **Update to live app**
- Order: **Backend → Frontend → Verify**

---

## STAGE 0 — Preflight (before pushing anything)

Do these in order. Don't push until every box is checked.

1. **Confirm what changed.** In each repo locally, run `git status` and `git log origin/main..HEAD --oneline`. Write down the commit SHAs — you need them for rollback.
2. **Is the backend change backward-compatible with the currently-live frontend?**
   - If YES → proceed with backend-first.
   - If NO (removed endpoint, changed response shape, renamed field) → pick one: (a) ship a compat shim in the backend that supports both old and new, deploy backend, deploy frontend, then remove the shim in a follow-up; or (b) accept a short window of breakage and have a maintenance banner ready.
3. **Env vars on Render.** Open the Render dashboard → service `laforce-api` → **Environment** tab. Add or update any new keys (DB URLs, third-party API keys, CORS origins) **before** you push code. If code ships expecting a missing env var, the service boots into a crash loop.
4. **CORS allow-list on backend** must include your GitHub Pages origin exactly (scheme + host, no trailing slash). Double-check it.
5. **Frontend API base URL.** In `laforce-capital` check `.env.production` (or equivalent build-time config) — it must point at the live Render URL, not `localhost` or a preview URL.
6. **Database migrations.** If any in this release: confirm they are forward-compatible (can run while the old code is live for a minute). Never ship a migration that drops a column the old code still reads.
7. **Rollback references written down.**
   - Backend: note the SHA of the last known-good deploy on Render → **Deploys** tab.
   - Frontend: note the SHA on the `main` branch (or `gh-pages` branch, depending on how Pages is configured) before you push.
8. **Low-traffic window.** Deploy when users are unlikely to be mid-session.

---

## STAGE 1 — Backend (`laforce-api` → Render)

**What to upload (in the commit, in this logical order):**

1. `requirements.txt` / `package.json` / `pyproject.toml` — dependency manifest first
2. Migration files (if any)
3. Source code
4. Config files: `render.yaml`, `Procfile`, or `Dockerfile`
5. Tests (validated locally; not what Render runs, but prevents bad pushes)

**Push sequence:**

1. **Set env vars in Render first** if any new ones are required. Dashboard → `laforce-api` → Environment → Save. (Saving triggers a restart — that's fine if you haven't pushed code yet.)
2. **Run migrations.** Either:
   - Manual: Render → Shell → run your migration command (`alembic upgrade head`, `npx prisma migrate deploy`, `python manage.py migrate`, etc.), **or**
   - Automatic on boot: confirm your start command runs migrations before the server (`render.yaml` or Procfile).
3. **Push code:**
   ```
   cd laforce-api
   git push origin main
   ```
   Render auto-deploys on push to the branch configured in the service settings.
4. **Watch the build.** Render dashboard → `laforce-api` → **Logs** tab. You're looking for:
   - Build stage completes with no errors
   - Start command runs
   - The line that says your service is listening on the assigned port
   - Status flips to **Live**
5. **If the deploy fails** → Render → **Deploys** tab → click the previous green deploy → **Redeploy**. Do not touch the frontend until backend is green.

**Backend smoke tests (run before moving to Stage 2):**

```
# Replace with your actual Render URL
curl -i https://laforce-api.onrender.com/health
curl -i https://laforce-api.onrender.com/           # or root/version endpoint
```

Expected: `200 OK`, JSON body, no HTML error page. If you don't have a `/health` endpoint, hit the cheapest read-only endpoint you have.

**CORS preflight test** (simulates the frontend):
```
curl -i -X OPTIONS https://laforce-api.onrender.com/your-endpoint \
  -H "Origin: https://<your-gh-pages-origin>" \
  -H "Access-Control-Request-Method: GET"
```
Expected: `204` or `200` with `Access-Control-Allow-Origin` header matching your frontend origin.

Only move to Stage 2 once both smoke tests pass.

---

## STAGE 2 — Frontend (`laforce-capital` → GitHub Pages)

**What to upload (in the commit):**

1. `package.json` / lockfile if deps changed
2. `.env.production` or equivalent (API base URL pointing at Render)
3. `public/CNAME` if you use a custom domain (do **not** remove it by accident — that breaks the custom domain)
4. `public/404.html` if you rely on client-side routing (SPA fallback on Pages)
5. Source files
6. Build output — depends on how Pages is configured for this repo (see below)

**Push sequence:**

1. **Build locally first** — don't let Pages discover a broken build:
   ```
   cd laforce-capital
   npm ci            # clean install from lockfile
   npm run build
   ```
   Fix any build errors before going further.
2. **Confirm the built bundle points at the live API.** Quickest check: grep the `dist/` or `build/` folder for the API URL string.
   ```
   grep -r "onrender.com" build/      # should match; localhost should NOT match
   grep -r "localhost" build/         # should return nothing
   ```
3. **Push.** Which command depends on your Pages setup — use the one that matches this repo:
   - **GitHub Actions workflow** (most common, `.github/workflows/deploy.yml`): `git push origin main` and the Action builds + deploys.
   - **`gh-pages` npm package**: `npm run deploy` (this builds and pushes to the `gh-pages` branch).
   - **Pages serves from `/docs` on main**: commit the built `/docs` folder and `git push origin main`.
4. **Watch the deploy.**
   - Actions route: GitHub → repo → **Actions** tab → watch the latest workflow go green.
   - `gh-pages` route: GitHub → repo → **Settings → Pages** — it shows the last deploy timestamp.
5. **Wait for CDN propagation** — GitHub Pages can take 1–10 minutes to serve the new bundle globally. Don't declare victory immediately.

---

## STAGE 3 — Verify production

Run these in order. Stop and fix if any step fails.

1. **Backend is still live.** `curl -i https://laforce-api.onrender.com/health` → `200`.
2. **Load frontend in incognito / private window.** (Incognito bypasses your cache — critical for a real test.)
3. **Hard refresh** with Cmd/Ctrl+Shift+R on top of that, since GitHub Pages caches aggressively at the edge.
4. **DevTools → Network tab**, then do a real user action:
   - Every XHR/fetch to `laforce-api.onrender.com` returns `2xx`.
   - No CORS errors in red.
   - No `401` / `403` unless expected.
   - Response payload shape matches what the new frontend expects.
5. **DevTools → Console tab** → zero red errors. (Warnings are OK.)
6. **One full critical user flow** end-to-end — whatever the most important path in LaForce Capital is (login, run an analysis, view a result). Click through it like a user.
7. **Mobile check** — open the site on your phone OR toggle DevTools responsive mode → iPhone → reload. Confirm layout + the same critical flow.
8. **Render monitoring** — dashboard → `laforce-api` → **Metrics** tab. For the next 5–10 minutes watch:
   - CPU and memory haven't spiked
   - Response time is in its normal band
   - No sustained `5xx` in the logs
9. **Render logs** — dashboard → `laforce-api` → **Logs**. Tail for 5–10 minutes looking for stack traces or unexpected warnings tied to the new code.

If all nine pass: deploy is verified. Note the time and the two deployed SHAs in your ops log.

---

## STAGE 4 — Rollback (if any verify step fails)

**Backend rollback (Render):**
1. Dashboard → `laforce-api` → **Deploys** tab.
2. Find the most recent deploy with a green checkmark **before** this release.
3. Click the three-dot menu → **Redeploy**. This re-ships that exact build within a minute or two.
4. Re-run the Stage 1 smoke tests to confirm.

**Frontend rollback (GitHub Pages):**
- If you pushed to `main`: `git revert <bad-sha> && git push origin main` — the Action re-deploys the reverted state.
- If you used `gh-pages` package: `git checkout <previous-good-sha> && npm run deploy`.
- If you committed `/docs`: revert the commit that changed `/docs` and push.

**Rollback order:** if both tiers are bad, roll back **frontend first** (so users stop hitting the broken new UI), then backend.

---

## Common gotchas specific to this stack

- **Render free tier cold start.** If you're on a free instance, the first request after inactivity takes ~30–60s. Your first smoke test after deploy may time out; retry once before assuming failure.
- **GitHub Pages cache.** The CDN can serve stale `index.html` for several minutes. Always test in incognito AND hard refresh. If it's still wrong after 10 minutes, check the Actions log — the deploy may not have actually completed.
- **CORS regression.** The single most common post-deploy break: you added a new allowed origin locally but forgot to update the Render env var. If browser shows CORS error but curl works, this is almost always it.
- **Mixed content.** Frontend on `https://` Pages calling `http://` backend will be blocked by browsers. Render URLs are HTTPS by default — don't override.
- **Env vars not re-read.** Some frameworks read env vars only at boot. If you changed a Render env var but didn't see a new deploy trigger, click **Manual Deploy → Clear build cache & deploy** to force a restart.
