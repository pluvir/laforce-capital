# Fortis — Steps 1–2 Execution Sheet

Run these commands on your own terminal, in order. Stop at any step that errors and fix before continuing. Nothing here changes app functionality — it only cleans the project for a safe first commit.

---

## Audit findings (what's in the folder right now)

**Files:**
| File | Status | Reason |
|---|---|---|
| `index.html` (584 KB, 8,331 lines) | **KEEP — commit** | Your prototype; no real API keys hardcoded (only placeholders in input fields) |
| `docs/architecture.md` | **KEEP — commit** | Approved Fortis v1 architecture |
| `docs/STATUS.md` | **KEEP — commit** | Project status |
| `docs/master-prompt.md` | **KEEP — commit** | Multi-agent role prompt |
| `fortis_deployment_plan.md` | **KEEP — commit** under `docs/` | Phase plan |
| `fortis_local_to_live_runbook.md` | **KEEP — commit** under `docs/` | Execution runbook |
| `fortis_qa_checklist.md` | **KEEP — commit** under `docs/` | QA checklist |
| `laforce_deploy_checklist.md` | **MOVE OUT** | Belongs to LaForce Capital, not Fortis — wrong project |
| `portfolio_extract_2026-04-19T1134.yaml` | **MOVE OUT (do NOT commit)** | Real holdings, market values, and account totals — personal financial data |
| `.DS_Store` (multiple) | **DELETE / IGNORE** | macOS junk |
| `assets:/` folder | **RENAME to `assets/`** | Folder name has a stray colon (sync artifact); it's empty except a `.DS_Store`. `index.html` doesn't reference it, so renaming/deleting is safe |

**Secret scan results (clean):**
- No real `sk-ant-...` Anthropic keys hardcoded — only the placeholder string in an input field
- No AWS, Google, GitHub, or Stripe keys found
- No JWTs, no service-role keys
- ✅ Safe to commit `index.html` as-is

**Current state (verified):**
- `index.html` line 3535: `API_BASE='https://laforce-api.onrender.com'` — Fortis already routes AI and market-data calls through the LaForce backend proxy on Render (`/api/ai/raw`, `/api/market/quote`, `/api/market/batch`).
- The production direction is **server-side AI calls only** — no user-pasted Anthropic keys in browser storage.

**Phase 2 cleanup (NOT now — don't change functionality):**
- Once the backend proxy is confirmed stable, **remove the legacy client-side API key UI/storage paths** still present in `index.html`:
  - The "paste your key" input fields (lines 1068, 1123–1124, 2917)
  - `localStorage` / `sessionStorage` key persistence (`lfc_key`, `inv_engine_key`)
  - The legacy `anthropic-dangerous-direct-browser-access: true` call path
- Goal: a single, server-only AI integration. No dual code paths, no browser key storage.
- Commit clean first. Phase 2 = backend/security cleanup.

---

## Files I created for you in the folder

- ✅ `.gitignore` — already written
- ✅ `.env.example` — already written

You don't need to create those yourself. Verify them with:
```bash
ls -la "Fortis Wealth Builder/" | grep -E '\.gitignore|\.env'
```

---

## Step-by-step terminal commands

Run from inside the project folder. On macOS, open Terminal and `cd` to wherever your "Fortis Wealth Builder" folder lives. The path may include the space — quote it.

### A. Move into the project

```bash
cd "/path/to/Fortis Wealth Builder"
pwd  # confirm you're in the right place
ls -la
```

### B. Quarantine personal data and out-of-project files

Move these OUT of the project folder. Pick a safe spot like `~/private/fortis/`.

```bash
mkdir -p ~/private/fortis
mv portfolio_extract_2026-04-19T1134.yaml ~/private/fortis/
mv laforce_deploy_checklist.md ~/private/fortis/
ls -la  # confirm both are gone
ls -la ~/private/fortis/  # confirm both moved successfully
```

### C. Clean up macOS junk and the bad folder name

```bash
# Delete .DS_Store everywhere in the project
find . -name ".DS_Store" -type f -delete

# Rename the broken "assets:" folder. The colon makes it weird — drop it.
# It's empty (only had a .DS_Store) and index.html doesn't reference it.
# Choose ONE:

# Option 1: rename to a clean "assets/" for future use
mv "assets:" "assets" 2>/dev/null || true
# If the rename above failed because of the colon, try:
mv -- "assets:" assets

# Option 2: delete it entirely (it's empty)
# rmdir "assets:" 2>/dev/null || rm -rf -- "assets:"
```

### D. Reorganize docs

```bash
# Make sure docs/ exists
mkdir -p docs

# Move the deployment docs into docs/ so the repo root is tidy
mv fortis_deployment_plan.md docs/
mv fortis_local_to_live_runbook.md docs/
mv fortis_qa_checklist.md docs/
mv STEPS_1-2_EXECUTION.md docs/  # this file too

ls docs/  # should list 7 files now
```

### E. Verify .gitignore and .env.example are present

```bash
cat .gitignore     # should print the gitignore I created
cat .env.example   # should print the env template
```

If either is missing, copy the contents from the files I generated in your project folder.

### F. Final secret scan before commit

```bash
# Scan for real keys (not placeholders) in the working tree
grep -rEn 'sk-ant-api03-[A-Za-z0-9_-]{50,}|sk_live_|sk_test_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,}|xox[baprs]-' \
  --include="*.html" --include="*.js" --include="*.css" --include="*.md" --include="*.json" --include="*.yaml" --include="*.yml" \
  . 2>/dev/null || echo "✅ No real secrets found in working tree"
```

You should see `✅ No real secrets found in working tree`. If anything matches: **stop**, rotate that key, and remove the file before continuing.

### G. Initialize git and stage the clean tree

```bash
git init -b main
git add .
git status   # READ THIS CAREFULLY
```

Confirm in `git status`:
- ✅ `index.html` is staged
- ✅ `docs/*.md` (architecture, STATUS, master-prompt, deployment plan, runbook, QA checklist, steps 1-2)
- ✅ `.gitignore` is staged
- ✅ `.env.example` is staged
- ❌ `portfolio_extract_*.yaml` is NOT in the list (you moved it out)
- ❌ `laforce_deploy_checklist.md` is NOT in the list
- ❌ `.DS_Store` is NOT in the list
- ❌ `.env` / `.env.local` are NOT in the list (they shouldn't exist yet)

If anything looks wrong, run `git reset` and fix before continuing.

### H. Make the first commit

```bash
git commit -m "Initial commit: Fortis prototype + project docs"
git log --oneline
```

### I. Create the private GitHub repo and push

You need either the **GitHub CLI** (`gh`) or to create the repo in the browser. CLI is faster:

```bash
# Authenticate once if you haven't
gh auth login   # follow prompts, pick HTTPS, browser auth

# Create a PRIVATE repo named fortis-app and push
gh repo create fortis-app --private --source=. --remote=origin --push

# Verify
gh repo view --web    # opens the repo in your browser
```

If you don't want to install `gh`:

```bash
# 1. Go to https://github.com/new
# 2. Repository name: fortis-app
# 3. Visibility: PRIVATE (critical)
# 4. DO NOT initialize with README, .gitignore, or license — you already have them
# 5. Click "Create repository"
# 6. Then run locally:

git remote add origin git@github.com:<your-github-username>/fortis-app.git
git push -u origin main
```

### J. Create the staging branch

```bash
git checkout -b staging
git push -u origin staging
git checkout main
```

### K. Set branch protection on `main`

Open the repo in your browser:
```bash
gh repo view --web
# OR navigate manually to: https://github.com/<you>/fortis-app
```

Then: **Settings → Branches → Add branch protection rule**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals: 0 (you're solo, but PRs still force review)
- ✅ Require status checks to pass before merging (leave checks empty for now; you'll wire CI later)
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings (yes, even for yourself)
- ❌ Do **not** allow force pushes
- ❌ Do **not** allow deletions
- Click **Create**

Repeat the same protection rule for `staging` if you want extra safety.

---

## Final pre-push checklist

Tick every box before running `git push`:

- [ ] `portfolio_extract_2026-04-19T1134.yaml` moved out of project folder
- [ ] `laforce_deploy_checklist.md` moved out of project folder
- [ ] All `.DS_Store` files deleted (`find . -name ".DS_Store" -delete`)
- [ ] `assets:/` folder renamed to `assets/` or deleted
- [ ] `.gitignore` exists and includes `.env`, `portfolio*.yaml`, `.DS_Store`
- [ ] `.env.example` exists with placeholder values only
- [ ] No real `.env` or `.env.local` file exists yet (none needed for Phase 1)
- [ ] Secret scan returned `✅ No real secrets found`
- [ ] `git status` shows only files you intend to commit
- [ ] Repo is **PRIVATE** on GitHub (verify in repo settings)
- [ ] Branch protection rule on `main` is active
- [ ] `staging` branch exists and is pushed

---

## What NOT to commit (recap)

- `.env`, `.env.local`, any file containing real API keys
- `portfolio_extract_*.yaml` or any file with real holdings, share counts, dollar amounts
- Screenshots of your Robinhood account
- `.DS_Store`, `Thumbs.db`, IDE config folders
- `node_modules/` (when you add Next.js later)
- Any `*_private.*` or `private/` folder

---

## After this is done

You've completed Steps 1–2 of the runbook. Next up: **Step 3** (stand up Supabase staging + prod projects). That's a Phase 2 task — don't start it until you've actually decided you're ready to move beyond GH Pages prototype.
