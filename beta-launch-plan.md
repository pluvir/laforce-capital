# LaForce Capital — 20-User Private Beta Launch Plan

**Source of truth:** `beta-readiness-checklist.md`
**Owner:** Rod (single decision-maker for go/no-go)
**Beta size:** 20 users, invite-only
**Beta length:** 4 weeks
**Scope:** Pre-launch rollout process. No new features. No redesign.

---

## 0. The Only Question That Matters

**At the end of this beta, what must be true for me to keep building?**

This is the single decision the entire beta exists to answer. Everything else — invites, waves, triage, surveys — is in service of getting a clean read on this one question.

**Primary success metric (pick ONE — Rod's call before invite #1):**

- **Option A — Comprehension:** ≥ 70% of users, when asked "what do you think this is telling you to do?" after their first session, give an answer that matches the actual diagnosis intent. *(Best metric for a finance-adjacent product where misinterpretation is the real risk.)*
- **Option B — Repeat use:** ≥ 50% of users return for a second session within 7 days, unprompted. *(Best metric if you believe engagement is the moat.)*
- **Option C — "Disappointed" test (Sean Ellis):** ≥ 40% of users say they'd be "very disappointed" if the product disappeared. *(Best classic PMF signal but requires honest survey response.)*

**Recommendation: Option A.** Comprehension is the dominant risk for LaForce Capital. A user who returns but misinterprets the output is a worse outcome than a user who churns honestly.

**Secondary signals (track but don't gate on):**
- Thumbs-up rate per AI output type (lens / path / deployment / report) ≥ 60%
- ≥ 50% of active users complete the full happy path (upload → diagnosis → strategy path → report)
- Zero users describe an AI output as "advice" in free text

**Hard failure signals (any one = stop and rethink):**
- Any user takes a real-money action because they thought the product told them to
- ≥ 2 users in free text describe outputs as advice rather than education
- < 30% comprehension rate on the "what is this telling you to do" question

**Decision rule at end of beta:**
- Hits primary + 2 of 3 secondaries → keep building, expand to next cohort
- Hits primary only → keep building, but the next 2 weeks of work is closing the gaps the secondaries flagged
- Misses primary → stop adding features, fix the comprehension problem, re-run a smaller beta before any further build

---

## 1. Pre-Invite Gate — what must be true before invite #1

Pull straight from the checklist. Every box below must be green or invite #1 does not go out.

**Privacy & disclaimer**
- [ ] Plain-English privacy notice live in footer + inline at upload
- [ ] Master "educational, not advice" disclaimer above the fold on landing
- [ ] Disclaimer threaded through AI outputs, report export header, and footer of every page
- [ ] No "you should / we recommend / buy / sell / invest in" language anywhere in UI

**Feedback wiring**
- [ ] "Send feedback" affordance on every screen
- [ ] Thumbs up/down on AI outputs
- [ ] All entries land in one tagged inbox (Notion or Sheet) with user ID, screen, timestamp, sentiment, comment
- [ ] Confirmation toast on submit
- [ ] "Something broke" path captures user agent + URL
- [ ] Test feedback submission verified end-to-end

**Beta access flow**
- [ ] Invite-only gate live (passcode, signed link, or allowlist — pick one)
- [ ] Invite email template approved
- [ ] One-page beta brief published (scope, limitations, duration, feedback path)
- [ ] Onboarding email fires within minutes of confirmation
- [ ] Exit/feedback survey link prepped (don't send yet)

**Security**
- [ ] HTTPS enforced on `laforce-capital` (frontend) and `laforce-api` (backend)
- [ ] No secrets in client code or git history (rotate any that ever leaked)
- [ ] All backend keys in Render env vars
- [ ] CORS locked to approved frontend origins only
- [ ] Rate limiting on extraction + AI endpoints
- [ ] Uploaded screenshots deleted post-extraction (or documented TTL)
- [ ] Error logs do not contain raw portfolio data or PII
- [ ] 2FA on Render and GitHub

**Final QA pass (manual, by Rod)**
- [ ] 5+ real screenshots tested (Robinhood, Fidelity, Schwab, light + dark)
- [ ] Six-lens diagnosis → strategy paths → deployment → report export all clean
- [ ] Tested in Chrome, Safari, Firefox at desktop + tablet widths; iOS + Android read-only
- [ ] No console errors on happy path
- [ ] Page load < 3s on a typical connection
- [ ] Render cold-start latency measured and accepted

**Day-before ritual**
- [ ] Rod runs full happy path on a fresh browser, fresh session
- [ ] One trusted person runs it cold, no instructions, Rod observes silently
- [ ] Test feedback entry reaches inbox
- [ ] Render backend confirmed awake and responsive

If any item is red, hold the launch 48 hours and fix.

---

## 2. Invite #1 — soft-launch process

User #1 is a single trusted person. They are the canary. No wave 1 until they have run the product and 24 hours have passed.

**Selection criteria for user #1**
- Trusted, will tell you the truth
- Has a real portfolio (not a fake one) so extraction gets exercised
- Reachable on a back-channel (text or DM) for fast triage
- Not technical enough to forgive obvious bugs — you want their honest first impression

**The send**
- Send the invite email at a time Rod can monitor for the next 4 hours (not late at night, not Friday afternoon)
- Email contains: access link/passcode, one-line "what this is," beta brief link, feedback path, expected time commitment (~15 min)
- Immediately after send: confirm the inbox is being watched, confirm Render is warm

**What Rod does for the next 4 hours**
- Watches feedback inbox
- Watches Render logs for 5xx errors
- Does not touch the product or push any changes
- Stays reachable on the back-channel

**Success criteria for user #1**
- Completes upload → diagnosis → at least one strategy path → report export
- Submits at least one feedback entry (good, bad, or neutral)
- Reports no blocking errors
- First-impression sentiment is neutral-or-better

If user #1 hits a blocking error: stop. Fix. Re-test. Restart the 24-hour clock with a new soft-launch user.

---

## 3. 24-Hour Watch Period — checklist

Between user #1 and wave 1. Don't skip this.

**Hour 0–4 (active watch)**
- [ ] Confirm user #1 received and opened the invite
- [ ] Watch Render logs in real time for errors during their session
- [ ] Confirm at least one feedback entry landed in the inbox
- [ ] Capture any verbatim reactions from the back-channel

**Hour 4–24 (passive watch)**
- [ ] Re-run the happy path yourself once at hour ~12
- [ ] Scan Render logs for any background errors, cold-start spikes, rate-limit hits
- [ ] Read every feedback entry within an hour of submission
- [ ] Categorize each entry: bug / confusion / language / praise / feature ask (drop feature asks into a separate file — not for this beta)
- [ ] Confirm no screenshots persisted beyond the documented TTL

**Hour 24 — go/no-go for wave 1**
- [ ] Zero P0/P1 issues open (see §7)
- [ ] User #1 completed the happy path without a blocker
- [ ] Feedback inbox is being read and tagged
- [ ] Render backend is healthy
- [ ] Disclaimer + privacy text confirmed live on every screen user #1 actually saw

If all green: send wave 1. If any red: hold, fix, restart the 24-hour clock.

---

## 4. Full 20-User Invite Process — waves

Don't send all 19 remaining invites at once. Stagger so problems surface before everyone hits them.

**Wave 0 — User #1 (1 invite, day 1)**
Soft launch. 24-hour watch. Covered in §2–§3.

**Wave 1 — Users #2–#5 (4 invites, day 2)**
- Trusted circle: people who will give honest, written feedback
- Send in the morning so Rod can watch during the day
- Watch period: 48 hours before wave 2

**Wave 2 — Users #6–#12 (7 invites, day 4)**
- Mix of trusted contacts and warmer prospects
- Send in two sub-batches if it helps Rod monitor
- Watch period: 72 hours before wave 3

**Wave 3 — Users #13–#20 (8 invites, day 7)**
- Final wave, broader audience within the invite list
- Only send if waves 1 and 2 produced no P0/P1 issues
- Beta clock starts officially at wave 3 send

**Per-wave checklist (every wave, no exceptions)**
- [ ] Render warmed (hit the API once)
- [ ] Feedback inbox cleared / triaged from prior wave
- [ ] No open P0/P1 issues
- [ ] Invite email content unchanged from approved template
- [ ] Wave size matches plan (don't expand on impulse)
- [ ] Send window inside Rod's monitoring hours

**Tracking sheet (one row per invitee)**
Name · invite sent · invite opened · first session · sessions count · feedback submitted (Y/N) · sentiment · open issues

---

## 5. Feedback Collection — what users say, do, and misunderstand

Three layers, in order of signal quality (highest first):
1. **Live observation** — what users do in real time
2. **Behavioral signals** — what users do without being asked
3. **Stated feedback** — what users say (thumbs, free text, surveys)

Stated feedback is the noisiest. Don't lead with it.

### 5a. Live observation (highest signal, free, mandatory)

**Hard requirement: Rod personally observes ≥ 3 users live or recorded during the beta.**
- Schedule a 20-minute session, screen-shared, while they use the product cold
- Rod stays silent except to ask "what are you thinking right now?" at natural pauses
- After they finish: ask "what do you think this is telling you to do?" before any debrief
- Capture verbatim quotes — no paraphrasing in the notes

**Why it's mandatory:** in 2 hours of watching 3 users you will see more silent failure than 4 weeks of analytics on 20 users will surface.

### 5b. Behavioral signals (capture what users do, not what they say)

**Honest scope note:** none of this exists in the product today. Adding any of it is a small build, not zero. Pre-invite #1 decision: which of these are worth instrumenting now vs. accepting as a known blind spot.

**Tier 1 — Cheap, high-value (recommend before invite #1):**
- Page/step views — which steps users reach (drop-off detection)
- Session count per user (return-use signal)
- Time-on-page per step (broad hesitation signal)
- Estimated cost: a few hours with Plausible or PostHog free tier + 4–6 named events

**Tier 2 — Medium effort (consider, not required):**
- "Backed out after seeing output" — back-button or close after diagnosis loads
- Re-upload count per session (extraction confusion signal)
- Strategy path selection rate (do users actually pick one?)

**Tier 3 — Real dev work (defer to post-beta unless cheap to add):**
- Mouse-idle / hesitation detection per step
- Repeated-input tracking on any user-editable field

**Decision before invite #1:** Rod picks which tier to ship. Document the choice in the day-before ritual. Anything not instrumented is an explicit blind spot, not an oversight.

### 5c. In-product stated feedback (always-on, low-friction)

- Thumbs up / thumbs down on each AI output
- Free-text "What's confusing or wrong here?" under the thumb
- Persistent "Send feedback" button: single text field + screenshot attach
- "Something broke" path: auto-captures user agent, URL, last action

### 5d. The comprehension question (post-first-session, mandatory)

After the user's first complete session, prompt once:

> **"In your own words, what do you think this is telling you to do?"**
> *(Free text. No multiple choice. No prompts. No examples.)*

This is the single highest-signal question in the entire beta. It exposes:
- Misinterpretation (user thinks output says X, output says Y)
- Overconfidence (user converts educational framing into a buy/sell action)
- Confusion (user can't articulate any takeaway)

Score every response against the actual diagnosis intent: **match / partial / miss / advice-misread**.
- "advice-misread" is a hard failure signal — feeds directly into go/no-go.

### 5e. End-of-beta survey (week 4, 9 questions, ~5 minutes)

1. **In your own words, what was this product telling you to do?** *(repeat of the comprehension question — measures whether interpretation drifted across multiple sessions)*
2. On a 1–10 scale, how useful was the diagnosis you got?
3. What was the single most useful thing the product told you?
4. What was the single most confusing or wrong thing?
5. Did anything in the language make you feel like the product was giving you advice rather than education? If yes, where exactly?
6. Did the strategy paths and capital deployment match how you actually think about your portfolio? Why or why not?
7. Did extraction get your portfolio right? (Y / mostly / no — and what was wrong)
8. Would you use this again next month? Why or why not?
9. If this product disappeared tomorrow, would you be: very disappointed / somewhat disappointed / not disappointed? *(Sean Ellis test)*

### What Rod tracks weekly

- Comprehension score distribution (match / partial / miss / advice-misread)
- Thumbs up/down ratio per output type
- Drop-off step (from behavioral data if instrumented, from observation otherwise)
- Return-session rate
- Top 3 confusion points (verbatim quotes from observation + free text)
- Top 3 bug categories
- Hard failure signal count (any "advice-misread" responses)

### What Rod does NOT do during beta

- Does not promise features
- Does not redesign in response to a single piece of feedback
- Does not change the disclaimer/privacy language without re-running the QA pass
- Does not rationalize a weak comprehension score by leaning on thumbs-up data

---

## 6. Go / No-Go Rules

**Pre-invite #1 — GO requires ALL:**
- Privacy notice live and visible
- Disclaimer threaded through every AI output and report
- Feedback widget wired to a monitored inbox
- Beta access flow tested end-to-end with one trusted user
- Security checklist complete, no critical gaps
- Known limitations published in the beta brief
- QA pass complete, no blocking errors
- Rod has bandwidth to monitor daily for 4 weeks

**Pre-invite #1 — NO-GO if ANY:**
- Disclaimer missing or inconsistent on any AI output
- Privacy notice unwritten or buried
- Feedback not landing in a monitored inbox
- Screenshots persist past documented TTL
- Page errors on happy path or extraction fails on a typical screenshot
- Critical security gap (exposed secret, open CORS, unencrypted endpoint)

**Between waves — GO requires ALL:**
- Zero open P0 or P1 issues
- Prior wave's feedback has been read and tagged
- Render healthy, no rising error rate
- No regression introduced since last wave (Rod re-runs the happy path before every wave)

**Wave 1 → Wave 2 has an extra gate (tightened — these are non-negotiable):**
- Zero "advice-misread" responses on the comprehension question
- ≥ 1 user has completed a successful full journey: upload → diagnosis → strategy path → comprehensible takeaway
- Rod has personally observed at least 1 user (live or recorded) using the product
- Misinterpretation count across all wave 1 users ≤ 1 (one is signal, two is a problem, three is a fix-now)

**Between waves — NO-GO if ANY:**
- Open P0 issue from any user
- More than one open P1 issue
- Any "advice-misread" response on the comprehension question
- ≥ 2 users describe an output as advice rather than education in any free text
- Extraction failing on a portfolio type already verified working
- Render cold-starts or 5xx rate climbing
- Disclaimer or privacy text broken on any path

**Decision rule:** when in doubt, hold the wave 48 hours and fix. Strangers form a first impression once. A misinterpreted output in a finance product is worse than a bug — it's a credibility loss you can't roll back.

---

## 7. Issue Triage Rules

One inbox. Every entry tagged within the same business day Rod sees it.

**Severity definitions**

- **P0 — Stop the world.** Disclaimer or privacy text missing on a live path; portfolio data leaking, persisting, or mis-routing; security exposure (secret leak, CORS hole, unencrypted endpoint); product unusable for all users (extraction or AI endpoint down).
  *Action:* halt all new invites, hotfix immediately, re-run the affected QA path, notify any user who hit it.

- **P1 — Blocks a real user.** Happy path broken for a known portfolio type, AI output gives advice-style language, report export fails, feedback widget not submitting, login/access gate broken.
  *Action:* fix within 24 hours. No new wave until cleared.

- **P2 — Friction, not a blocker.** Confusing copy, slow load on a non-critical screen, mobile layout issue on a non-critical view, inconsistent tone in one output.
  *Action:* batch and fix mid-beta or post-beta. Document the workaround in the beta brief if user-visible.

- **P3 — Nice to have / future.** Feature requests, design opinions, "I wish it also did X."
  *Action:* drop into a separate `post-beta-backlog.md`. Do not act on during beta. Thank the user.

**Triage workflow (per entry)**
1. Read the entry within the same business day
2. Assign severity (P0–P3)
3. Reproduce if it's a bug — note browser, OS, portfolio type
4. Assign action: fix-now / fix-this-week / batch / backlog
5. Reply to the user with: "Got it. We're [fixing now / batching / tracking for later]. Thanks."
6. Log resolution in the tracking sheet

**Hard rules during beta**
- No new feature work — bug fixes and copy changes only
- No redesign — even if a user asks for one
- Every disclaimer/privacy change re-runs the QA pass before going live
- Every fix that touches the happy path triggers a re-run of the day-before ritual before the next wave
- If two or more users report the same confusion, that's a copy fix, not a feature

---

## Quick reference — the rhythm

| Day | Action |
|---|---|
| Day 0 | Pre-invite gate cleared. Day-before ritual complete. |
| Day 1 | Invite #1 (user #1). 24-hour watch begins. |
| Day 2 | Wave 1 (users #2–#5) if green. |
| Day 4 | Wave 2 (users #6–#12) if green. |
| Day 7 | Wave 3 (users #13–#20) if green. Beta clock starts. |
| Day 7–35 | 4-week beta. Daily feedback triage. Weekly metrics review. |
| Day 35 | End-of-beta survey sent. |
| Day 38 | Synthesis. Decide next phase. |

---

**One-line North Star:** Ship the smallest, safest, most disciplined version that still earns honest feedback. No surprises. No advice. No redesign mid-flight.

---

## Honest tradeoffs (read before launch)

These are the deliberate compromises baked into this plan. Naming them now so they don't surface as surprises mid-beta.

1. **Behavioral instrumentation is partial by design.** Tier 1 (drop-off, session count, time-on-step) is recommended pre-launch. Tier 2 and 3 are deferred. Anything not instrumented is a known blind spot, not an oversight — and live observation of 3 users is the compensating control.

2. **20 users is small.** Don't expect statistical confidence. Expect directional signal and verbatim quotes. The plan is built for qualitative pattern-matching, not quantitative proof.

3. **Comprehension is the bar, not engagement.** A user who returns daily but misreads outputs is a worse outcome than one who churns honestly. The success metric reflects this; the triage rules reflect this; the failure signals reflect this.

4. **The "no new features" rule will get tested.** Users will ask for things that sound small. Most "small" asks are not small once disclaimer/QA re-runs are factored in. The default answer during beta is: "tracked for post-beta backlog, thank you."

5. **One decision-maker is a feature, not a bug.** Rod is the single go/no-go authority. No committees. No second-guessing mid-wave. The cost of one person's bias is lower than the cost of indecision in a 4-week window.
