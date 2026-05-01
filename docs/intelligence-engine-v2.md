# Intelligence Engine v2 — Specification

You are building Intelligence Engine v2 for the LaForce Capital Wealth Builder application.
This is NOT a conceptual response. This is a PRODUCTION-GRADE implementation.
Output COMPLETE, WORKING JavaScript — no placeholders, no pseudocode, no missing functions.

## Objective

Replace fragmented portfolio calculations with a centralized intelligence system. The system must:

1. Use a global state: `window.portfolioState`
2. Execute in 3 phases: hydrate → analyze → render
3. NEVER recompute values inside render
4. Reuse existing v1 logic where applicable:
   - `computeHealthScore`
   - `computeRiskFlags`
   - `computeActionPlan`
   - `computeDeployment`

## Global State (required exact structure)

```js
window.portfolioState = {
  totalValue: 0,
  holdings: [],
  market: {
    trend: 'neutral',
    vix: 'normal',
    momentum: 'neutral',
    regime: 'Neutral / Selective',
    confidence: null
  },
  allocation: {
    classes: {},
    concentration: {}
  },
  health: {},
  risk: {
    drivers: []
  },
  actionPlan: [],
  deployment: [],
  stockAnalysis: {}
};
```

## Phase 1 — Hydration

`function hydratePortfolioState()`

- Pull holdings using `getHoldings()`
- Compute `totalValue`
- Pull market context from `_intelCtx`: `trend`, `vix`, `momentum`
- Store everything in `window.portfolioState`

## Phase 2 — Analysis

`function runAnalysis()`

1. Market Intelligence — `computeRegime(market)`, `computeConfidence(market)`
2. Portfolio Health — `computeHealthScore(holdings, market)`
3. Allocation — `ps.allocation.classes = ps.health.actMix`
4. Risk — `computeRiskFlags(allocation, market)`
5. Action Plan — `computeActionPlan(allocation, regime)`
6. Deployment — `computeDeployment(5000, regime, market)`

## Phase 3 — Render

`function renderIntelligenceV2()`

Strict rules:
- DO NOT compute anything
- ONLY read from `portfolioState`
- ONLY update DOM

Render targets: health score, regime, risk drivers list, action plan list, deployment plan list.

## Required additional functions

If not already defined, you MUST implement:
- `function computeRegime(market)` — translate trend + vix + momentum → regime string
- `function computeConfidence(market)` — translate trend + vix + momentum → confidence

(Both already exist in `index.html` at lines 7679 and 7694 — reuse, do not redefine.)

## Integration

Hook (3 lines) goes INSIDE `renderIntelligencePanel()` immediately AFTER `updateStockDecision()`:

```js
hydratePortfolioState();
runAnalysis();
renderIntelligenceV2();
```

Do not run the hook globally.

## Critical rules

- No duplicate calculations
- No hidden side effects
- No undefined references
- No UI logic inside analysis
- No analysis logic inside render
- Everything must run without errors when pasted
