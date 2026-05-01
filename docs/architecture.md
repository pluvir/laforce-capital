# LaForce Capital / Fortis Wealth Builder — Architecture

This document defines the product architecture and the component build system. It is the single source of truth for what the platform is, how it is structured, and how it is built.

**Core product definition**
- Portfolio-first AI decision system
- First action: Upload portfolio
- Primary output: Three strategy paths (Conservative / Balanced / Aggressive)

---

# PART I — PRODUCT ARCHITECTURE

## Structural principles

1. **One source of truth per concept.** Market regime, portfolio diagnosis, deployment, and single-stock analysis each exist in exactly one place. Every other surface that references them is a read-only summary that links back.
2. **Market regime is ambient, not a destination.** It sets context; it does not compete with the portfolio for attention. Lives as a persistent chip the user can click to adjust — not a top-level panel.
3. **The three strategy paths are the product's climax.** The entire flow funnels the user into the Strategy section. That is the primary output, so it gets the most real estate and the clearest naming.
4. **Beginner Mode is a global setting.** One switch, affects output everywhere.
5. **Research is optional, not required.** Single-stock deep dives live in their own section so first-time users are not distracted during the main decision flow.

---

## The four sections

### 1. HOME
Purpose: Entry point. Shows state, not pitch.

- **Empty state** (no portfolio loaded): brand mark, one-sentence value prop, one primary CTA ("Upload your portfolio"). Nothing else.
- **Loaded state**: portfolio value, health grade, regime-fit indicator, one chart (allocation or performance), top 1–2 recommended next actions, link into Strategy.
- **Ambient elements** (persistent across all sections): market regime chip, AI insights stream, quick-access watchlist.

### 2. PORTFOLIO
Purpose: Upload, diagnose, and view holdings. The input and the diagnosis — nothing else.

Sub-sections, in order:
1. **Upload** — dropzone (multi-screenshot, CSV, broker exports), manual paste textarea, image preview queue, extraction receipt.
2. **Holdings** — loaded positions table with symbol / shares / cost / value / gain-loss / return / class.
3. **Diagnosis** — health score ring, concentration metric, confidence score, classification buckets (Core / Growth / Tactical / Speculative), actual-vs-ideal allocation gap, risk flags.
4. **Action Plan** — sequenced list of specific moves (trim X, add Y, rebalance Z), each with reasoning. This is the bridge into Strategy.

### 3. STRATEGY
Purpose: Turn the diagnosis into a plan. This is where the three paths live. This is the product's climax.

Sub-sections, in order:
1. **Three Paths** — Conservative / Balanced / Aggressive cards, each with thesis, target allocation, projected outcome, pros, cons, recommended-for-you signal. User picks one to proceed.
2. **Deploy Capital** — once a path is selected, size the cash amount, pick style nuance if desired, get specific tickers and weights. Quick scenarios ($1k / $5k / $10k / $25k / $50k) live here.
3. **Monthly Plan** — recurring contribution modeling. Frequency pills, recurring amount, expected-return slider, starting value auto-filled from Portfolio. Bear/Base/Bull projection table.

Each sub-section inherits the selected path, so the user's choice from Three Paths carries through Deploy and Monthly Plan without re-selection.

### 4. RESEARCH
Purpose: Single-name analysis, comparisons, and watchlist. Optional destination — not required to complete the main flow.

Sub-sections, in order:
1. **Stock Analysis** — ticker input, Quick / Full mode toggle, quick-pick tickers, verdict output (Buy / Watch / Avoid). Beginner Mode affects output style.
2. **Compare** — head-to-head A vs B.
3. **Watchlist** — persistent list. Verdicts from Stock Analysis auto-save here. Recent Verdicts merges into this.

---

## Cross-cutting elements (not sections — they live in the chrome)

**Market Regime Chip** (persistent, top-bar or right-sidebar)
- Shows current regime label (e.g., "Neutral / Selective — VIX 18 — Balanced bias")
- Click opens a drawer with trend / VIX / bias / earnings-season selectors and the pulse summary
- Replaces the entire Live Market panel and the Intelligence > Market Context Quick-Set widget
- Consumed by every section downstream — portfolio diagnosis references it, strategy paths reference it, research verdicts reference it

**Right Sidebar** (persistent, secondary)
Three cards maximum, loaded-state only:
- AI Insights (context-aware to whichever section is open)
- Market Pulse gauge (mirrors the chip)
- Opportunity Layer (generated from portfolio gaps)

**Global settings** (top bar or profile menu)
- Beginner Mode toggle
- API key management
- Color theme (if kept at all — recommend removing)

**Footer**
- "How this works" link (destination for the current Decision Sequence 5-step content — it's educational, not operational)
- "Send feedback" link (destination for the orphaned feedback panel)
- Compliance disclaimer, consistent across every page

---

## Complete feature relocation map

| Existing feature | New location |
|---|---|
| Dashboard hero + wsteps i/ii/iii | HOME — empty state, simplified to one CTA |
| "How to use this system" 01/02/03 card | Removed — replaced by the flow itself |
| Decision Sequence 5-step expandable | Moved to footer "How this works" page — not a primary surface |
| Portfolio Lab: dropzone, manual paste, image queue | PORTFOLIO > Upload |
| Loaded holdings table | PORTFOLIO > Holdings |
| "Feasibility Study" output | STRATEGY > Three Paths (rename — "Feasibility Study" is consulting jargon) |
| Strategy Panel (3 cards: Conservative/Balanced/Aggressive) | STRATEGY > Three Paths |
| AI Recommendation banner | STRATEGY > Three Paths (the "recommended for you" signal) |
| Stock Analysis panel | RESEARCH > Stock Analysis |
| Quick/Full mode toggle | Inside RESEARCH > Stock Analysis |
| 12 quick tickers | Inside RESEARCH > Stock Analysis |
| Beginner Mode toggle (currently per-panel) | Promoted to global setting — top bar |
| Capital Deployment panel (cash, style, notes, scenarios) | STRATEGY > Deploy Capital |
| Quick scenarios ($1k / $5k / $10k / $25k / $50k) | STRATEGY > Deploy Capital |
| Intelligence: health ring, confidence, concentration | PORTFOLIO > Diagnosis |
| Intelligence: regime badge | Replaced by ambient Market Regime Chip |
| Intelligence: actual-vs-ideal allocation | PORTFOLIO > Diagnosis |
| Intelligence: risk flags | PORTFOLIO > Diagnosis |
| Intelligence: action plan | PORTFOLIO > Action Plan |
| Intelligence: deployment plan widget | **Killed** — consolidated into STRATEGY > Deploy Capital |
| Intelligence: stock decision engine | **Killed** — consolidated into RESEARCH > Stock Analysis |
| Intelligence: market context quick-set | **Killed** — consolidated into Market Regime Chip |
| Cadence Plan (all of it) | STRATEGY > Monthly Plan |
| Live Market panel (trend, VIX, bias, earnings, pulse) | **Killed as a panel** — content moves into the Market Regime Chip drawer |
| Compare panel | RESEARCH > Compare |
| Watchlist panel | RESEARCH > Watchlist |
| Right sidebar: AI Insights | Kept — right sidebar, ambient |
| Right sidebar: Recent Verdicts | Merged into RESEARCH > Watchlist |
| Right sidebar: Market Pulse gauge | Kept — right sidebar, mirrors chip |
| Right sidebar: Watchlist mini | Kept — right sidebar, ambient |
| Right sidebar: Color Mode (3 themes) | **Killed** — pick one aesthetic |
| Right sidebar: Opportunity Layer | Kept — right sidebar, loaded-state only |
| Feedback panel (hidden) | Footer link — "Send feedback" |
| API Key modal | Onboarding first-run + profile settings |
| Top bar: 5 index pills (demo data) | Kept only if made live; otherwise remove |
| Top bar: Generate Report button | Persistent action on PORTFOLIO and STRATEGY |
| Top bar: AI Online badge | Kept |
| Top bar: Live Data chip | Kept — but must be honest about state |

---

## What gets killed entirely

- Color Mode selector
- "How to use this system" 01/02/03 card (redundant with the flow)
- Either hero "wsteps" OR "How to use" card — keep at most one simplified empty-state
- "Decision Sequence" 5-step block on Dashboard (relegated to footer education)
- Live Market as a top-level panel (content survives in the chip drawer)
- Intelligence as a top-level panel (its contents distributed into Portfolio, Strategy, and the chip)
- Cadence Plan as a top-level panel (content survives as STRATEGY > Monthly Plan)
- Capital Deployment as a top-level panel (content survives as STRATEGY > Deploy Capital)
- Duplicate market-regime entry points (4 → 1)
- Duplicate deployment entry points (2 → 1)
- Duplicate stock analysis entry points (2 → 1)
- "Intelligence" as a label anywhere — it's overloaded (nav header, panel name, brand phrase). Pick one meaning or retire the word

---

## First-time user flow

1. **Arrive on HOME (empty state).** See: brand, one-sentence value prop, one CTA — "Upload your portfolio." Ambient: regime chip, AI insights placeholder.
2. **Click the CTA → PORTFOLIO > Upload.** Drop file, paste holdings, or drop screenshots. Extraction runs.
3. **Auto-advance to PORTFOLIO > Holdings + Diagnosis.** User sees their positions, health grade, concentration, allocation gap, risk flags.
4. **Primary CTA from Diagnosis: "See your three strategies →"** Takes user to STRATEGY > Three Paths.
5. **User picks a path.** Choice is remembered.
6. **Auto-flow into STRATEGY > Deploy Capital** with the chosen path pre-selected. User enters cash amount, gets specific tickers and weights.
7. **Optional next step: STRATEGY > Monthly Plan.** User sets recurring contribution, sees Bear/Base/Bull projection — their strategy compounding over time.
8. **Optional side trip: RESEARCH.** Any ticker mentioned anywhere in the flow is clickable into Stock Analysis. Compare and Watchlist are accessible but never forced.

Exit state from the primary flow: user has a portfolio diagnosis, a chosen strategy, a sized deployment, and a monthly plan. That is the complete decision.

---

## Final navigation

```
HOME
PORTFOLIO     ├── Upload
              ├── Holdings
              ├── Diagnosis
              └── Action Plan
STRATEGY      ├── Three Paths
              ├── Deploy Capital
              └── Monthly Plan
RESEARCH      ├── Stock Analysis
              ├── Compare
              └── Watchlist
```

Four sections. Ten sub-sections. Every existing feature accounted for. Market regime, AI insights, and watchlist preview live in the ambient chrome. Beginner Mode is global.

---

## Optional 5-section variant

If Market is promoted to a discoverable destination rather than purely ambient — for users who explicitly come to "read the market" before looking at their portfolio — insert a fifth section after Research:

```
5. MARKET        ├── Regime (trend / VIX / bias / earnings)
                 ├── Sector Rotation
                 └── Macro Notes
```

Trade-off: an additional door competes with the portfolio-first thesis and re-opens duplication risk. Default recommendation: stay with four sections, keep Market ambient.

---

# PART II — COMPONENT BUILD SYSTEM

## Layering model

Three-tier component hierarchy. Everything composes upward.

1. **Primitives** — atomic UI parts. Styled, stateless, reusable across the entire app.
2. **Molecules** — small combinations of primitives. Stateless or lightly stateful. Still reusable.
3. **Organisms** — feature-level components. Compose molecules + primitives. Often subscribe to the store.

On top of that: **Section Pages** compose organisms into a route, and the **AppShell** wraps the whole thing.

---

## 1. Primitives

| Primitive | Variants | Used in |
|---|---|---|
| Button | primary / secondary / ghost / danger / small | Everywhere |
| Input | text / number / password / textarea | Every form |
| Select | dropdown | Deploy style, Market regime, Monthly Plan frequency |
| Slider | range | Monthly Plan return, confidence displays |
| Badge | gold / sage / clay / violet / neutral | Tags, risk flags, regime labels |
| Chip | static / dismissible / clickable | Quick tickers, filters, regime pill |
| Eyebrow | uppercase letter-spaced label | Every section header |
| Divider | line / ornament | Between form sections |
| Loader | spinner / shimmer / dots | Thinking states, extraction |
| IconWrap | inline SVG container | Nav icons, CTAs |

---

## 2. Molecules

| Molecule | Purpose | Reuse count |
|---|---|---|
| MetricCard | label + big number + sub-label | High — 10+ places |
| StatCell | compact grid stat | High — port hero, intel grid, monthly plan |
| Ring | circular progress | Health score, portfolio grade |
| ProgressBar | linear progress | Confidence, allocation fill |
| Sparkline | mini trend line | Holdings row, portfolio hero |
| Gauge | semicircular (low/mid/high) | Market Pulse |
| AllocationBar | horizontal stacked segments + legend | Diagnosis, Home, Deploy preview |
| InsightItem | colored left-border + label + text | Right sidebar, risk flags, action items |
| VerdictPill | BUY / WATCH / AVOID badge | Stock Analysis, Watchlist, Recent Verdicts |
| TickerChip | clickable symbol → deep-link | Quick-picks, Deploy output, Compare |
| InputGroup | label + input + help text | Every form |
| EmptyState | icon + title + sub + CTA | Home empty, Watchlist empty, Research empty |
| NextStepFooter | sticky contextual CTA | Bottom of every section |
| FlowIndicator | breadcrumb-style stepper | Portfolio and Strategy flows |
| OrnamentalHeading | eyebrow + serif title + sub | Section headers |

---

## 3. Organisms

### Shell & navigation
- **AppShell** — wraps TopBar + SideNav + Main + RightSidebar + Footer
- **TopBar** — logo + index pills + RegimeChip + AI badge + settings
- **SideNav** — four primary sections + current subsection indicator
- **SubTabs** — horizontal tabs inside a section
- **RightSidebar** — stack of ambient cards (InsightsFeed, MarketPulseCard, OpportunityLayer)
- **Footer** — "How this works" link, feedback link, compliance disclaimer

### Ambient
- **RegimeChip** — persistent label in TopBar
- **RegimeDrawer** — opens from chip; houses all regime controls (replaces Live Market panel)
- **InsightsFeed** — right-sidebar card, context-aware
- **MarketPulseCard** — right-sidebar gauge mirror of regime
- **OpportunityLayer** — right-sidebar card, loaded-state only

### Portfolio
- **UploadZone** — dropzone + paste textarea + image preview queue + extraction receipt
- **HoldingsTable** — sortable rows with symbol/shares/cost/value/gain-loss/return/class
- **DiagnosisPanel** — composes Ring + concentration + AllocationBar + risk flags
- **ActionPlanList** — sequenced list of moves with reasoning

### Strategy
- **StrategyCard** — one of the three paths (reused 3×); holds thesis + allocation + projection + pros/cons
- **ThreePathsGrid** — grid of three StrategyCards with recommendation banner
- **DeploymentTable** — ticker rows with weights + $ amounts + rationale
- **ProjectionTable** — Bear/Base/Bull by year with contribution math

### Research
- **StockVerdict** — hero verdict + thesis + numbered reasons + price targets
- **CompareSplit** — two-column A vs B, reuses StockVerdict halves
- **WatchlistTable** — persistent list with verdict, last-analyzed, quick actions

### Shared
- **Modal** — base dialog
- **ApiKeyModal** — specialization of Modal
- **LiveDataModal** — specialization of Modal
- **DebugBar** — error banner
- **StatusBar** — key status notice

---

## 4. Section Pages

Each page composes organisms for one nav destination. Pages accept `(container, params, store)` and return a teardown function.

| Page | Composes |
|---|---|
| HomePage | EmptyState (empty) OR MetricCard + AllocationBar + HoldingsTable (compact) + NextStepFooter (loaded) |
| PortfolioPage > Upload | UploadZone + FlowIndicator |
| PortfolioPage > Holdings | HoldingsTable + FlowIndicator + NextStepFooter |
| PortfolioPage > Diagnosis | DiagnosisPanel + FlowIndicator + NextStepFooter |
| PortfolioPage > ActionPlan | ActionPlanList + NextStepFooter |
| StrategyPage > ThreePaths | ThreePathsGrid + FlowIndicator + NextStepFooter |
| StrategyPage > DeployCapital | DeploymentTable + input card + quick-scenarios + NextStepFooter |
| StrategyPage > MonthlyPlan | ProjectionTable + frequency pills + Slider + MetricCard |
| ResearchPage > StockAnalysis | ticker input + TickerChip row + StockVerdict |
| ResearchPage > Compare | two inputs + CompareSplit |
| ResearchPage > Watchlist | WatchlistTable |

---

## 5. Reuse map

High-reuse components (4+ places):

- **MetricCard** — Home hero, Portfolio hero, Intel metrics, Monthly Plan summary, Deploy summary (5×)
- **Eyebrow** — every section header (11×)
- **AllocationBar** — Home loaded, Portfolio Diagnosis, Deploy preview, Strategy card (4×)
- **InsightItem** — Right sidebar, Diagnosis risk flags, Action Plan entries, Stock verdict reasons (4×)
- **VerdictPill** — Stock Analysis, Watchlist, Recent Verdicts, Compare (4×)
- **TickerChip** — Research quick-picks, Deploy output, Compare inputs, Watchlist, embedded in verdicts (5×)
- **InputGroup** — every form (6×)
- **NextStepFooter** — bottom of nearly every page (8×)
- **EmptyState** — 4+ empty surfaces
- **Ring** — Home grade, Portfolio health (2× — but high visual weight)
- **StrategyCard** — ThreePathsGrid uses it 3× + 1× on Home as "recommended"

Anything under 2× uses stays section-specific (UploadZone, StockVerdict core, CompareSplit, ProjectionTable).

---

## 6. File structure

```
src/
├── index.html
├── main.js                    # bootstrap: mount AppShell, init store, register router
│
├── styles/
│   ├── tokens.css             # all CSS custom properties (single source of truth)
│   ├── base.css               # resets, body, typography
│   ├── primitives.css         # button, input, badge, chip
│   ├── molecules.css          # metric card, ring, allocation bar
│   ├── organisms.css          # shell, nav, tables, strategy card
│   ├── sections.css           # page-specific overrides
│   └── animations.css         # keyframes
│
├── app/
│   ├── store.js               # state management (pubsub)
│   ├── router.js              # section + subsection routing
│   ├── events.js              # cross-component event bus
│   └── bootstrap.js           # first-run: key modal, demo data
│
├── lib/                       # business logic, pure functions
│   ├── api.js                 # Anthropic client wrapper
│   ├── extract.js             # portfolio extraction (CSV, image, paste)
│   ├── classify.js            # core/growth/tactical/speculative buckets
│   ├── diagnose.js            # health, concentration, risk flags
│   ├── strategize.js          # three-path generator
│   ├── deploy.js              # deployment plan generator
│   ├── cadence.js             # projection math (compound + contribution)
│   ├── stock.js               # single-stock analysis engine
│   ├── compare.js             # head-to-head analysis
│   ├── market.js              # regime heuristics
│   ├── format.js              # currency, percent, date helpers
│   └── storage.js             # localStorage wrapper
│
├── components/
│   ├── primitives/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── Textarea.js
│   │   ├── Slider.js
│   │   ├── Badge.js
│   │   ├── Chip.js
│   │   ├── Eyebrow.js
│   │   ├── Divider.js
│   │   └── Loader.js
│   ├── molecules/
│   │   ├── MetricCard.js
│   │   ├── StatCell.js
│   │   ├── Ring.js
│   │   ├── ProgressBar.js
│   │   ├── Sparkline.js
│   │   ├── Gauge.js
│   │   ├── AllocationBar.js
│   │   ├── InsightItem.js
│   │   ├── VerdictPill.js
│   │   ├── TickerChip.js
│   │   ├── InputGroup.js
│   │   ├── EmptyState.js
│   │   ├── NextStepFooter.js
│   │   ├── FlowIndicator.js
│   │   └── OrnamentalHeading.js
│   └── organisms/
│       ├── AppShell.js
│       ├── TopBar.js
│       ├── SideNav.js
│       ├── SubTabs.js
│       ├── RightSidebar.js
│       ├── Footer.js
│       ├── RegimeChip.js
│       ├── RegimeDrawer.js
│       ├── InsightsFeed.js
│       ├── MarketPulseCard.js
│       ├── OpportunityLayer.js
│       ├── UploadZone.js
│       ├── HoldingsTable.js
│       ├── DiagnosisPanel.js
│       ├── ActionPlanList.js
│       ├── StrategyCard.js
│       ├── ThreePathsGrid.js
│       ├── DeploymentTable.js
│       ├── ProjectionTable.js
│       ├── StockVerdict.js
│       ├── CompareSplit.js
│       ├── WatchlistTable.js
│       ├── Modal.js
│       ├── ApiKeyModal.js
│       └── LiveDataModal.js
│
├── sections/
│   ├── home/
│   │   ├── HomePage.js
│   │   ├── HomeEmpty.js
│   │   └── HomeLoaded.js
│   ├── portfolio/
│   │   ├── PortfolioPage.js
│   │   ├── UploadView.js
│   │   ├── HoldingsView.js
│   │   ├── DiagnosisView.js
│   │   └── ActionPlanView.js
│   ├── strategy/
│   │   ├── StrategyPage.js
│   │   ├── ThreePathsView.js
│   │   ├── DeployCapitalView.js
│   │   └── MonthlyPlanView.js
│   └── research/
│       ├── ResearchPage.js
│       ├── StockAnalysisView.js
│       ├── CompareView.js
│       └── WatchlistView.js
│
├── data/
│   ├── classifications.json   # ticker → class seed map
│   ├── presets.json           # deploy scenarios, quick tickers
│   └── content.json           # eyebrow copy, headings, disclaimers
│
├── assets/
│   ├── logo.svg
│   └── icons/
│
└── docs/
    ├── master-prompt.md
    └── architecture.md
```

---

## 7. Component contract

Every component follows the same factory pattern so components compose predictably.

```
createComponent(props) → {
  element,        // DOM node
  update(state),  // patch in response to store changes
  destroy()       // clean up subscriptions, listeners
}
```

- Props are immutable at creation time.
- Organisms subscribe to their own store slice inside the factory; primitives/molecules stay pure.
- No direct DOM mutation across components — everything routes through the store.

---

## 8. State layer

A single store, pub/sub pattern. Slices:

| Slice | Owners (write) | Consumers (read) |
|---|---|---|
| `user` (apiKey, beginnerMode, colorTheme) | ApiKeyModal, Settings | TopBar, all AI-calling lib modules |
| `market` (regime, trend, vix, bias, momentum) | RegimeDrawer | Diagnosis, Strategy, Stock, Home, MarketPulseCard, InsightsFeed |
| `portfolio` (holdings[], metadata, loadedAt) | UploadZone, extract.js | Home, HoldingsTable, DiagnosisPanel, Strategy, Research |
| `diagnosis` (health, concentration, riskFlags[], allocGap) | diagnose.js (derived) | DiagnosisPanel, Home, StrategyPage |
| `strategy` (selectedPath, threePaths) | ThreePathsView | DeployCapitalView, MonthlyPlanView, Home |
| `deployment` (cash, style, plan[]) | DeployCapitalView | Home recommended-action |
| `cadence` (frequency, amount, return, projection) | MonthlyPlanView | Home loaded state |
| `research` (currentTicker, mode, verdictHistory[]) | StockAnalysisView | WatchlistView, InsightsFeed |
| `watchlist` (tickers[]) | WatchlistView, StockAnalysisView | RightSidebar, WatchlistTable |
| `ui` (activeSection, activeSubtab, openModal) | Router | SideNav, SubTabs, TopBar |

**Derived state rules:**
- `diagnosis` is computed from `portfolio` + `market`. Recomputes whenever either changes.
- `strategy.threePaths` is computed from `diagnosis` + `market`.
- `deployment.plan` is computed from `strategy.selectedPath` + `deployment.cash` + `portfolio`.
- `cadence.projection` is computed from `cadence.amount/frequency/return` + `portfolio.totalValue`.

A single regime change at the TopBar chip cleanly ripples through every section because the derived chain handles it.

---

## 9. How sections connect

### Event-driven handoffs

| Event | Trigger | Navigation / Effect |
|---|---|---|
| `portfolio:loaded` | extract.js finishes | Advance UploadView → HoldingsView; unlock DiagnosisView; unlock StrategyPage |
| `diagnosis:complete` | diagnose.js derives | Enable "See your three strategies" CTA on Home and ActionPlan |
| `strategy:selected` | StrategyCard onSelect | Advance ThreePathsView → DeployCapitalView with path pre-filled |
| `deployment:generated` | DeployCapitalView runs | Show NextStepFooter → MonthlyPlan |
| `regime:changed` | RegimeDrawer save | All subscribed views patch silently, no navigation |
| `ticker:clicked` (anywhere) | TickerChip | Deep-link to Research > Stock Analysis with that ticker |
| `verdict:saved` | StockVerdict | Add to watchlist slice, refresh WatchlistTable |

### Deep-link pattern

Every section reachable directly via URL:
- `#/` → Home
- `#/portfolio/upload` / `#/portfolio/holdings` / `#/portfolio/diagnosis` / `#/portfolio/action-plan`
- `#/strategy/paths` / `#/strategy/deploy` / `#/strategy/monthly`
- `#/research/stock?ticker=NVDA` / `#/research/compare?a=NVDA&b=AMD` / `#/research/watchlist`

Every TickerChip, NextStepFooter, and CTA is just a router call — not tightly coupled to any specific page.

### Guard rules (enforce the flow)

- StrategyPage is locked until `portfolio.loadedAt` exists. Attempting to navigate there shows empty state with "Upload portfolio first →" CTA.
- DeployCapitalView requires `strategy.selectedPath`. If missing, redirect to ThreePathsView.
- MonthlyPlanView works without strategy (can model generically) but auto-pulls values if strategy is set.

---

## 10. Cross-cutting concerns

- **Beginner Mode** — global setting in `user` slice. Every output-rendering organism checks it and renders long-form vs technical.
- **Compliance** — single `<ComplianceBadge>` component injected into the footer and into any view that shows buy/trim/add signals. One component, one disclaimer, consistent placement.
- **Loading states** — every organism that fetches data exposes a skeleton/shimmer variant driven by a loading flag in its slice.
- **Error handling** — global error handler dispatches to `ui.errorToast`; DebugBar organism listens.

---

## 11. Build / migration sequence

Recommended order to extract from the current single-file index.html without breaking it:

1. Extract `tokens.css` and `base.css` from the existing `<style>` block.
2. Build primitives first (Button, Input, Select, Badge, Eyebrow). Replace inline styles in the existing HTML one-by-one.
3. Build the store and router. Wrap the existing `showPanel()` behavior in the router.
4. Build molecules (MetricCard, Ring, AllocationBar, InsightItem). Migrate one existing panel at a time.
5. Build the AppShell (TopBar, SideNav, RightSidebar). Replace the existing chrome.
6. Build organisms per section, starting with Portfolio (the entry point).
7. Kill the duplicates last — once the consolidated organisms work, delete the old Intelligence panel, Live Market panel, Cadence Plan panel, Capital Deployment panel.

Each step leaves the app in a working state. No big-bang rewrite.

---

## Net result

- ~10 primitives, ~15 molecules, ~25 organisms, 11 section views, 1 shell
- High-reuse components dominate: MetricCard, Eyebrow, AllocationBar, InsightItem, VerdictPill, TickerChip, NextStepFooter
- One state store with clearly-owned slices and derived chains
- Hash-based routing with deep-links and guards
- Event-driven handoffs between sections — no hard-coded transitions
- Section pages are thin compositions of organisms — swappable, testable, scalable

This system is designed to let new features be added without touching existing code. A new section (say, Taxes) is a folder under `sections/` + new organisms if needed + a new store slice. Everything else remains stable.

---

# APPENDIX — Key changes from the existing draft

- 9 panels → 4 sections
- 4 market-context entry points → 1 (ambient chip)
- 2 deployment engines → 1 (STRATEGY > Deploy Capital)
- 2 stock analyzers → 1 (RESEARCH > Stock Analysis)
- 3 onboarding explainers on Dashboard → 1 empty-state CTA
- 6 sidebar cards → 3
- 3 color themes → 1
- Every existing feature relocated, zero orphaned
- First-time flow reduced to three required clicks (Upload → See strategies → Pick one) to reach the product's primary output
