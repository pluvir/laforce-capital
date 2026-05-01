# Fortis Wealth Management — QA Validation Report

**QA Engineer:** Claude (validation agent)
**Date:** 2026-04-23
**Build under test:** Fortis v1 (Home / Portfolio / Strategy / Research)
**Environments:** Desktop (Chrome/Safari/Firefox) + Mobile (iOS Safari, Android Chrome)
**Test method:** Manual UI walkthrough + DevTools console + network tab + responsive emulator

---

## 1. QA Checklist (execute in order)

### A. Shell & Chrome
- A1. Header renders at top of viewport on first paint (no layout shift > 0.1 CLS)
- A2. Fortis logo loads (no broken image icon, no 404 in network tab)
- A3. Logo is a clickable link back to Home
- A4. Logo `alt` text is present and descriptive
- A5. Primary nav (Home / Portfolio / Strategy / Research) renders and highlights active section
- A6. Header remains fixed/visible on scroll (if sticky) or reappears correctly if auto-hide
- A7. Footer renders with copyright, disclaimer link, and version stamp

### B. Color Mode (Dark / Light)
- B1. Toggle control is visible and keyboard-focusable (tab order correct)
- B2. Clicking toggle flips theme on the same page without reload
- B3. Contrast ratios meet WCAG AA after switch (≥ 4.5:1 body, ≥ 3:1 large text)
- B4. Chart/graph colors re-render legibly in both modes (no white-on-white axes)
- B5. Preference persists across page reload (localStorage/cookie)
- B6. Preference persists across section navigation (Home → Portfolio → back)
- B7. Logo variant swaps (if two versions exist) or remains legible in both modes
- B8. System-preference detection works on first visit (`prefers-color-scheme`)

### C. Market Pulse Card (Home)
- C1. Card renders above the fold on desktop
- C2. Loading skeleton appears before data arrives (no empty box flash)
- C3. All market metrics display values (not "—", "NaN", or "undefined")
- C4. Timestamp/"as of" line is present and within last 15 min during market hours
- C5. Positive/negative color coding (green up / red down) is correct
- C6. Card is responsive — no horizontal overflow at 375 px width

### D. Market Metric Popovers
- D1. Each metric (S&P, NASDAQ, DOW, VIX, 10Y, etc.) shows popover on hover (desktop)
- D2. Popover shows tap-to-open on mobile (no hover lost)
- D3. Popover closes on outside click / ESC key
- D4. Popover content: definition, current value, 1D change, educational note
- D5. Popover does not clip at viewport edges (repositions when near edge)
- D6. Popover z-index is above all other elements (not hidden behind cards)
- D7. Only one popover open at a time (opening a new one closes previous)

### E. Ticker Interactions
- E1. Hover on ticker symbol shows tooltip (name, last, 1D %)
- E2. Click on ticker opens detail view or drawer (not a broken link)
- E3. Ticker detail shows: price, change, chart, news, relevance to Rod's portfolio
- E4. Back/close returns to prior scroll position
- E5. Invalid/delisted tickers (e.g., NCNCF) display graceful fallback, not a crash
- E6. Tickers are keyboard accessible (Enter to activate)

### F. Discovery Layer Tabs (Research section)
- F1. All tabs render and are clickable
- F2. Active tab is visually distinct (underline, bg, or bold)
- F3. Tab switching does not cause full-page reload
- F4. Tab content loads within 1 s (or shows skeleton)
- F5. Arrow-key navigation between tabs works (a11y)
- F6. Deep-link to a specific tab via URL hash works (`#research/news`)
- F7. Empty states show helpful copy (not blank white)

### G. Portfolio Upload Flow — Entry Point
- G1. "Add Portfolio" / "Upload" CTA visible in Portfolio section
- G2. Three options presented: CSV / Screenshot / Manual
- G3. Modal/drawer opens cleanly, can be dismissed without losing app state

### H. CSV Upload
- H1. Accepts `.csv` file via picker
- H2. Accepts drag-and-drop
- H3. Rejects non-CSV with clear error ("Please upload a .csv file")
- H4. Parses Robinhood export format (columns: Symbol, Quantity, Avg Cost, Current Price…)
- H5. Expected rows = rows displayed (no silent drops)
- H6. Decimals parsed correctly (1.08 shares, not 108)
- H7. Fractional shares render to 3 decimals
- H8. Total portfolio value matches sum of positions
- H9. Invalid rows are flagged, not silently dropped
- H10. Success toast + navigation to portfolio view

### I. Screenshot Upload
- I1. Accepts `.png`, `.jpg`, `.jpeg`, `.heic`
- I2. Shows image preview before OCR
- I3. Extraction progress indicator visible
- I4. OCR results shown in editable table for user confirmation
- I5. User can correct misread tickers/quantities before saving
- I6. Low-confidence fields are highlighted
- I7. Handles multi-screenshot uploads (stitched holdings)
- I8. Timeout handling if OCR exceeds 30 s

### J. Manual Entry
- J1. Form has fields: Ticker, Shares, Avg Cost (optional)
- J2. Ticker autocomplete from valid symbol list
- J3. Input validation: shares > 0, numeric, decimals allowed
- J4. "Add another" adds a row without losing prior entries
- J5. Remove row works
- J6. Submit saves all rows; summary shown before commit
- J7. Form values persist on accidental navigation (draft recovery)

### K. Mobile Responsiveness (test at 375 / 390 / 414 px)
- K1. No horizontal scroll on any section
- K2. Touch targets ≥ 44 × 44 px
- K3. Nav collapses to hamburger or bottom tab bar
- K4. Market Pulse metrics stack vertically or scroll-snap horizontally
- K5. Popovers become bottom sheets on mobile
- K6. Upload flow usable one-handed (thumb zone)
- K7. Tables convert to cards or allow horizontal scroll with sticky first col
- K8. Font size ≥ 16 px for body copy (prevents iOS input zoom)

### L. Disclaimers
- L1. "Not financial advice" disclaimer visible on Home
- L2. Disclaimer repeated on Strategy section (where recommendations live)
- L3. Footer disclaimer links to full terms page
- L4. Data source attribution present (e.g., "Quotes delayed 15 min, source: X")
- L5. Disclaimers readable in both themes
- L6. Disclaimers render on mobile (not cut off)

### M. Broken Links
- M1. Every nav link resolves (no 404)
- M2. Every footer link resolves
- M3. Every ticker link resolves or degrades gracefully
- M4. External links open in new tab with `rel="noopener noreferrer"`
- M5. Internal anchor links scroll to correct section
- M6. No `href="#"` or `href="javascript:void(0)"` placeholders in production

### N. Console Errors
- N1. Zero red errors in DevTools console on initial load
- N2. Zero red errors after navigating all 4 sections
- N3. Zero red errors after theme toggle
- N4. Zero red errors after portfolio upload (all 3 methods)
- N5. No CORS errors in network tab
- N6. No 4xx/5xx on required resources
- N7. No "Failed to load resource" for images/fonts
- N8. No React/Vue key warnings or hydration mismatches

---

## 2. Pass / Fail Results Table

Mark each row P (pass), F (fail), B (blocked), or N/A once executed against the live build.

| # | Test ID | Area | Result | Severity if Fail | Evidence / Notes |
|---|---------|------|--------|------------------|------------------|
| 1 | A1–A7 | Header / Logo | ☐ | — | |
| 2 | B1–B8 | Color mode | ☐ | — | |
| 3 | C1–C6 | Market Pulse card | ☐ | — | |
| 4 | D1–D7 | Metric popovers | ☐ | — | |
| 5 | E1–E6 | Ticker hover / click | ☐ | — | |
| 6 | F1–F7 | Discovery tabs | ☐ | — | |
| 7 | G1–G3 | Upload entry | ☐ | — | |
| 8 | H1–H10 | CSV upload | ☐ | — | |
| 9 | I1–I8 | Screenshot upload | ☐ | — | |
| 10 | J1–J7 | Manual entry | ☐ | — | |
| 11 | K1–K8 | Mobile responsive | ☐ | — | |
| 12 | L1–L6 | Disclaimers | ☐ | — | |
| 13 | M1–M6 | Broken links | ☐ | — | |
| 14 | N1–N8 | Console errors | ☐ | — | |

**Summary totals (fill at end of run):**
Pass: __ / 14 · Fail: __ / 14 · Blocked: __ / 14

---

## 3. Priority Bug Classification Framework

Use this to triage any FAIL from the table above.

### P0 — Ship blocker
Fix before release. Stops core investor workflow.
- Portfolio upload crashes the app or corrupts data
- CSV silently drops rows (expected ≠ parsed ≠ rendered)
- Totals do not match sum of holdings (data integrity)
- Console throws errors that halt rendering
- Disclaimers missing from Strategy section (legal exposure)
- Broken link on primary CTA

### P1 — High
Fix within 24–48 h.
- Color mode breaks chart legibility
- Popovers clip at viewport edge on mobile
- Screenshot OCR yields > 20 % error rate
- Delisted ticker (e.g., NCNCF) causes UI degradation instead of graceful state
- Mobile horizontal scroll on any section

### P2 — Medium
Fix before next minor release.
- Tab deep-linking doesn't work
- Theme preference doesn't persist across reload
- Tooltip styling inconsistent between sections
- Minor contrast issues on secondary text

### P3 — Low / polish
Backlog.
- Animation jank on popover open
- Logo swap smoothness between themes
- Copy tweaks, icon alignment, micro-spacing

---

## 4. Priority Bug Log Template

Copy this block per confirmed defect:

```
Bug ID: FORTIS-###
Title:
Severity: P0 | P1 | P2 | P3
Area: (Header / Market Pulse / Upload / etc.)
Environment: Desktop Chrome 130 | iOS Safari 17 | …
Steps to reproduce:
  1.
  2.
  3.
Expected:
Actual:
Evidence: (screenshot path / console log / network tab)
Suspected cause:
Fix owner:
Status: Open | In progress | Fixed | Verified
```

---

## 5. Regression Test List (run after any build)

Short, focused smoke pass — under 15 minutes. Run **every** time a change ships.

### R1. Boot smoke (2 min)
- Load Home, confirm no console errors
- Logo and header render
- Theme toggle works, persists through reload

### R2. Market data smoke (2 min)
- Market Pulse card shows non-null values
- Timestamp within last 15 min (market hours) or shows "closed" state
- Click one metric popover, confirm content

### R3. Portfolio round-trip smoke (5 min)
- Upload known-good CSV of Rod's 8 holdings (VOO, GOOGL, AMZN, RCL, NVDA, SCHD, CCL, NCLH)
- Expected rows = 8
- Parsed rows = 8
- Rendered rows = 8
- Total value within ±$2 of $1,526.49 baseline
- Refresh page — data persists

### R4. Navigation smoke (2 min)
- Click each of Home / Portfolio / Strategy / Research
- Active tab highlights correctly
- Each section renders without error
- Back button works

### R5. Mobile smoke (2 min)
- Open in responsive mode at 390 px
- No horizontal scroll
- Nav usable
- Upload CTA reachable in thumb zone

### R6. Known-edge smoke (2 min)
- NCNCF ticker → graceful fallback, not crash
- Empty portfolio state → helpful empty copy
- Invalid CSV → clear error message
- Disclaimer visible on Strategy section

**Regression pass criterion:** all 6 blocks green before merge to main.

---

## 6. Validation Notes for Rod

- Baseline portfolio total for regression: **$1,526.49** across 8 positions as of 2026-04-17.
- NCNCF is a known edge case — verify it renders as a graceful fallback every build.
- Weekly contribution cadence ($100 → $150 → $200) should not change UI behavior; verify allocation math does not break when contribution amount changes.
- Strategy section is where allocation recommendations appear — disclaimer presence there is P0.

---

## 7. Next Actions

1. Hand this checklist to whoever runs the next manual pass (or I run it if you give me the live URL).
2. Fill the pass/fail table.
3. File any P0/P1 as tickets with the bug template in §4.
4. Keep §5 regression list pinned for every future build.

If you give me the live Fortis URL (or a screenshot set of each section), I'll execute this checklist end-to-end and return the filled-in pass/fail table with evidence.
