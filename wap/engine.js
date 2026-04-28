/**
 * Weekly Action Plan v1 — Pure Decision Engine
 *
 * Same inputs always produce the same output. No AI in decision logic.
 * No AI in explanations. No randomness.
 *
 * Active guardrails (v1):
 *   1. Conviction (BUY verdict + Top Read rank)
 *   2. Balance (currentWeight < targetWeight)
 *   3. Scaling cadence (MIN_DAYS since last buy)
 *
 * Pre-gate: Legacy positions are excluded entirely.
 *
 * Output contract (one of three):
 *   { type: "BUY",       ticker, amount_usd, reason }
 *   { type: "PARK_CASH", reason }
 *   { type: "REBALANCE", ticker, reason }
 */
(function (global) {
  'use strict';

  // ===== LOCKED CONSTANTS =====
  var MIN_DAYS = 7;
  var REBALANCE_THRESHOLD = 4; // percentage points over target
  var RANK_WEIGHTS = { 1: 1.00, 2: 0.80, 3: 0.60, 4: 0.40, 5: 0.20 };
  // Rank 6+ → weight 0 → not a Top Read → ineligible

  // ===== HELPERS =====
  function rankWeight(rank) {
    if (rank == null || rank < 1 || rank > 5) return 0;
    return RANK_WEIGHTS[rank];
  }

  function daysBetween(later, earlier) {
    var ms = later.getTime() - earlier.getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  function findRank(rankedList, ticker) {
    for (var i = 0; i < rankedList.length; i++) {
      if (rankedList[i].ticker === ticker) return rankedList[i].rank;
    }
    return null;
  }

  // ===== REASON TEMPLATES (deterministic — no LLM) =====
  function buyReason(c) {
    return 'Underweight vs target (' +
      c.currentWeight.toFixed(1) + '% / ' +
      c.targetWeight.toFixed(1) + '%), ' +
      'Top Read #' + c.rank + ', BUY verdict.';
  }
  function rebalanceReason(p) {
    return p.ticker + ' is ' + p.gapOver.toFixed(1) +
      'pp over target (' +
      p.currentWeight.toFixed(1) + '% / ' +
      p.targetWeight.toFixed(1) + '%). ' +
      'Recommend trimming before next contribution.';
  }
  function parkCashReason() {
    return 'No candidate cleared all guardrails this week.';
  }

  // ===== MAIN ENGINE =====
  /**
   * @param {Object} state - all inputs pre-fetched by caller
   *   portfolio:      [{ticker, currentWeight, targetWeight}]
   *   classification: { ticker: "CORE" | "WATCHLIST" | "LEGACY" }
   *   rankedList:     [{ticker, rank}]   (Top 5 only)
   *   verdicts:       { ticker: "BUY" | "HOLD" | "AVOID" }
   *   lastBuys:       { ticker: { date: Date, amount: number } | null }
   *   contribution:   { amount: number, weekOf: Date }
   *   currentDate:    Date
   * @returns {Object} one of the three output shapes
   */
  function generateWeeklyActionPlan(state) {
    var portfolio      = state.portfolio || [];
    var classification = state.classification || {};
    var rankedList     = state.rankedList || [];
    var verdicts       = state.verdicts || {};
    var lastBuys       = state.lastBuys || {};
    var contribution   = state.contribution || { amount: 0 };
    var currentDate    = state.currentDate || new Date();

    // Build a quick portfolio lookup
    var portMap = {};
    portfolio.forEach(function (p) { portMap[p.ticker] = p; });

    // ===== STEP 0 — Pre-gate eligibility (Legacy excluded) =====
    var candidates = [];
    Object.keys(classification).forEach(function (ticker) {
      var cls = classification[ticker];
      if (cls === 'CORE' || cls === 'WATCHLIST') {
        var pos = portMap[ticker] || { currentWeight: 0, targetWeight: 0 };
        candidates.push({
          ticker: ticker,
          currentWeight: pos.currentWeight || 0,
          targetWeight: pos.targetWeight != null ? pos.targetWeight : 0,
          classification: cls,
          rank: findRank(rankedList, ticker),
          verdict: verdicts[ticker] || 'AVOID',
          lastBuyDate: lastBuys[ticker] ? lastBuys[ticker].date : null
        });
      }
    });

    // ===== GATE 1 — Conviction =====
    candidates = candidates.filter(function (c) {
      if (c.verdict !== 'BUY') return false;
      if (c.rank == null || c.rank > 5) return false;
      return true;
    });

    // ===== GATE 2 — Balance =====
    candidates = candidates.filter(function (c) {
      c.gap = c.targetWeight - c.currentWeight;
      return c.gap > 0;
    });

    // ===== GATE 3 — Scaling cadence =====
    candidates = candidates.filter(function (c) {
      if (!c.lastBuyDate) return true; // never bought → pass
      return daysBetween(currentDate, c.lastBuyDate) >= MIN_DAYS;
    });

    // ===== No survivors → REBALANCE or PARK_CASH =====
    if (candidates.length === 0) {
      // Look for a Core position materially over target
      var rebalanceCandidates = portfolio
        .filter(function (p) { return classification[p.ticker] === 'CORE'; })
        .map(function (p) {
          return {
            ticker: p.ticker,
            currentWeight: p.currentWeight,
            targetWeight: p.targetWeight,
            gapOver: p.currentWeight - p.targetWeight
          };
        })
        .filter(function (p) { return p.gapOver > REBALANCE_THRESHOLD; })
        .sort(function (a, b) { return b.gapOver - a.gapOver; });

      if (rebalanceCandidates.length > 0) {
        var top = rebalanceCandidates[0];
        return {
          type: 'REBALANCE',
          ticker: top.ticker,
          reason: rebalanceReason(top)
        };
      }

      return { type: 'PARK_CASH', reason: parkCashReason() };
    }

    // ===== Score and pick =====
    candidates.forEach(function (c) {
      c.score = c.gap * rankWeight(c.rank);
    });

    candidates.sort(function (a, b) {
      // Primary: higher score
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak 1: higher gap
      if (b.gap !== a.gap) return b.gap - a.gap;
      // Tiebreak 2: better rank (lower number)
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Tiebreak 3: alphabetical
      return a.ticker.localeCompare(b.ticker);
    });

    var pick = candidates[0];
    return {
      type: 'BUY',
      ticker: pick.ticker,
      amount_usd: contribution.amount,
      reason: buyReason(pick)
    };
  }

  // ===== EXPORT =====
  global.WAP = {
    generateWeeklyActionPlan: generateWeeklyActionPlan,
    MIN_DAYS: MIN_DAYS,
    REBALANCE_THRESHOLD: REBALANCE_THRESHOLD,
    RANK_WEIGHTS: RANK_WEIGHTS
  };
})(typeof window !== 'undefined' ? window : globalThis);
