/**
 * WAP Adapters — bridges between the engine and the live Fortis frontend.
 *
 * The engine itself is pure (takes state as a parameter). These adapters
 * read existing app state and produce the structured values the engine needs.
 *
 * Adapter inventory (v1):
 *   getRankedList(regime)          — STUB; needs wiring to existing rank logic
 *   getTickerClassification(t)     — hardcoded; manual override only
 *   getAllClassifications()        — full classification map
 *   getLastBuy(ticker)             — reads localStorage
 *   getLastBuys()                  — reads all
 *   logDeployment(t, amount, date) — writes to localStorage
 */
(function (global) {
  'use strict';

  // ===== LOCKED CLASSIFICATION (v1) =====
  // Hardcoded. Manual edits only. Auto-upgrade from LEGACY is forbidden.
  var CLASSIFICATION_V1 = {
    VOO:   'CORE',
    GOOGL: 'CORE',
    AMZN:  'CORE',
    NVDA:  'CORE',
    META:  'WATCHLIST',
    LMT:   'WATCHLIST',
    SCHD:  'LEGACY',
    RCL:   'LEGACY',
    CCL:   'LEGACY',
    NCLH:  'LEGACY'
  };

  function getTickerClassification(ticker) {
    // Default unknown tickers to LEGACY (fail safe).
    return CLASSIFICATION_V1[ticker] || 'LEGACY';
  }

  function getAllClassifications() {
    var copy = {};
    Object.keys(CLASSIFICATION_V1).forEach(function (k) {
      copy[k] = CLASSIFICATION_V1[k];
    });
    return copy;
  }

  // ===== LAST-BUY LOG (localStorage persistence) =====
  var LAST_BUY_KEY = 'fortis_wap_last_buys_v1';

  function getLastBuys() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(LAST_BUY_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      Object.keys(parsed).forEach(function (t) {
        if (parsed[t] && parsed[t].date) {
          parsed[t].date = new Date(parsed[t].date);
        }
      });
      return parsed;
    } catch (e) {
      return {};
    }
  }

  function getLastBuy(ticker) {
    var all = getLastBuys();
    return all[ticker] || null;
  }

  function logDeployment(ticker, amount, date) {
    if (!global.localStorage) return;
    var all = getLastBuys();
    all[ticker] = {
      date: date instanceof Date ? date : new Date(date),
      amount: amount
    };
    var toStore = {};
    Object.keys(all).forEach(function (t) {
      toStore[t] = {
        date: all[t].date.toISOString(),
        amount: all[t].amount
      };
    });
    global.localStorage.setItem(LAST_BUY_KEY, JSON.stringify(toStore));
  }

  // ===== RANKED LIST ADAPTER =====
  // STUB. The existing app computes ranks inline during render in index.html
  // (around computeStockDecision, line ~8479 and _verdicts ~3543). This
  // adapter must be wired to extract the top 5 as structured data.
  //
  // Until wired, callers can inject a temporary implementation by setting
  // global.__wapRankedListImpl(regime) → [{ticker, rank}, ...].
  function getRankedList(regime) {
    if (typeof global.__wapRankedListImpl === 'function') {
      return global.__wapRankedListImpl(regime);
    }
    return [];
  }

  // ===== EXPORT =====
  global.WAPAdapters = {
    getTickerClassification: getTickerClassification,
    getAllClassifications: getAllClassifications,
    getLastBuy: getLastBuy,
    getLastBuys: getLastBuys,
    logDeployment: logDeployment,
    getRankedList: getRankedList
  };
})(typeof window !== 'undefined' ? window : globalThis);
