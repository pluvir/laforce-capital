# Beta Readiness Checklist — LaForce Capital Wealth Builder

**Purpose:** Everything that must be true before the first private beta invite goes out to 20 users.
**Scope:** Pre-launch only. No feature work. No new ideas.
**Owner:** Rod (single decision-maker for go/no-go).

---

## 1. Privacy & Data Notice

Plain-English statement, visible at upload and in the footer.

- [ ] One-paragraph privacy notice drafted in plain English (no legalese)
- [ ] Notice explains: what's collected, where it's stored, how long, who sees it
- [ ] Linked from the footer of every page as "How we handle your data"
- [ ] Visible inline at the upload step ("Your screenshot is processed and not shared")
- [ ] Confirms screenshots are not used for model training
- [ ] States data is retained only for the active session unless saved by the user

**Done looks like:** A user reads two sentences before uploading and feels safe to proceed.

---

## 2. Financial Disclaimer & Not-Advice Language

Threaded throughout the product, not buried on a single page.

- [ ] Master disclaimer drafted: *"Educational and informational purposes only. Not licensed financial advice."*
- [ ] Visible on the landing page above the fold
- [ ] Visible at first-run / before first diagnosis loads
- [ ] Footer disclaimer on every page
- [ ] AI output language reviewed — every insight uses educational framing (*"an investor might…"*, *"this path would…"*)
- [ ] No usage of *"you should,"* *"we recommend,"* *"buy,"* *"sell,"* *"invest in"*
- [ ] Report export includes the disclaimer on the cover/header
- [ ] Final language sweep performed across all UI copy

**Done looks like:** A skeptical reader cannot mistake any output for licensed financial advice.

---

## 3. Feedback Form Flow

Lightweight, always-available, low-friction.

- [ ] Persistent "Send feedback" affordance visible on every screen
- [ ] One-click reaction (thumbs up/down or sentiment) on AI outputs
- [ ] Optional free-text field for context
- [ ] Feedback lands in a single tagged inbox/sheet/Notion that Rod monitors daily
- [ ] Each entry captures: user ID, screen, timestamp, sentiment, optional comment
- [ ] Confirmation message to user when feedback submits ("Thanks — we read every one")
- [ ] Bug-report path included ("Something broke") that captures user agent + URL

**Done looks like:** A user can flag a confusing or wrong insight in under 5 seconds, and Rod sees it within 24 hours.

---

## 4. Beta Access Flow

Controlled invite, simple onboarding, clear expectations.

- [ ] Beta access is invite-only — no public signup
- [ ] Invite email template drafted: what the product is, what's expected, how to give feedback
- [ ] One-page beta brief: scope, what's in/out, known limitations, how long the beta runs
- [ ] Simple access gate (passcode, signed link, or allowlist — pick one and stick with it)
- [ ] Onboarding email arrives within minutes of invite confirmation
- [ ] First-run inside the product matches the email's promise (no surprises)
- [ ] Exit/feedback survey link prepped for end-of-beta synthesis

**Done looks like:** From invite to first portfolio upload takes under 5 minutes with zero support questions.

---

## 5. Basic Security Checklist

Minimum viable posture for handling user-uploaded financial data.

- [ ] HTTPS enforced on frontend (laforce-capital) and backend (laforce-api)
- [ ] No secrets, API keys, or credentials in client-side code or git history
- [ ] Environment variables used for all backend keys (Render env config)
- [ ] CORS scoped — backend only accepts requests from approved frontend origins
- [ ] Rate limiting on extraction and AI endpoints (basic — prevents accidental abuse)
- [ ] No PII stored alongside portfolio data unless explicitly required
- [ ] Uploaded screenshots deleted after extraction completes (or have a defined TTL)
- [ ] Error logging does NOT log raw portfolio data or PII
- [ ] Render and GitHub access restricted to Rod's account with 2FA enabled

**Done looks like:** A reasonably skeptical engineer reviewing the setup would not flag a critical issue.

---

## 6. Known Limitations (Communicated to Beta Users)

Set expectations explicitly so no user feels misled.

- [ ] Listed in the beta brief and visible in-product
- [ ] Extraction may misread unusual layouts — users are prompted to review extracted data
- [ ] Diagnosis is educational and heuristic-based, not real-time market data
- [ ] Stock drill-down depth is light in MVP
- [ ] Portfolio history is not saved across sessions yet
- [ ] Mobile-readable but not mobile-optimized
- [ ] Active development — features and language will change

**Done looks like:** No beta user is surprised by a missing capability. Every limitation is named upfront.

---

## 7. Final QA Checklist

Manual pass before any user touches the product.

- [ ] Upload tested with 5+ real-world portfolio screenshots (Robinhood, Fidelity, Schwab, light + dark mode)
- [ ] Extraction handles messy edge cases (low res, partial crop, rotated)
- [ ] Six-lens diagnosis renders with plain-English translations
- [ ] Macro context loads without blocking diagnosis
- [ ] Strategy paths render; selection updates action plan + deployment
- [ ] Capital deployment reflects the chosen path's tilt
- [ ] Report export completes and includes the disclaimer
- [ ] Feedback widget submits and confirms on every screen
- [ ] Disclaimer text visible at every required touchpoint
- [ ] Tested in Chrome, Safari, Firefox at desktop and tablet widths
- [ ] Tested on iOS and Android browsers (read-only acceptable)
- [ ] No console errors on the happy path
- [ ] Page load under 3 seconds on a typical connection
- [ ] Render backend cold-start tested — latency known and acceptable

**Done looks like:** A clean run-through from invite → upload → report with zero blocking errors and no broken disclaimers.

---

## 8. Go / No-Go Criteria

The decision frame before sending invite #1.

### GO requires ALL of the following:

- [ ] Privacy notice live and visible
- [ ] Disclaimer language live and threaded throughout
- [ ] Feedback widget capturing into a monitored inbox
- [ ] Beta access flow tested end-to-end with one trusted user
- [ ] Security checklist completed with no critical gaps
- [ ] Known limitations published in the beta brief
- [ ] QA pass completed with no blocking errors
- [ ] Rod has bandwidth to monitor feedback daily for the 4-week beta

### NO-GO if ANY of the following:

- Disclaimer language is missing or inconsistent on any AI output
- Privacy notice is unwritten or buried
- Feedback widget is not wired to a monitored destination
- Any uploaded screenshot persists longer than the documented retention window
- Page errors on the happy path or extraction fails on a typical screenshot
- Critical security gap (exposed secret, open CORS, unencrypted endpoint)

**Decision rule:** When in doubt, hold the launch by 48 hours and fix. Strangers form their first impression once.

---

## Final pre-launch ritual (day before invite #1)

- [ ] Run the full happy path yourself, end-to-end, on a fresh browser
- [ ] Have one trusted person run it cold (no instructions) — observe silently
- [ ] Confirm a test feedback entry reaches your inbox
- [ ] Confirm Render backend is awake and responsive
- [ ] Send invite to user #1 only — wait 24 hours before sending wave 1
