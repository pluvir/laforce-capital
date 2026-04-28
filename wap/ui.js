/**
 * Weekly Action Plan — UI render layer (v1)
 *
 * Pure render. Takes a `view` object and writes HTML into the container.
 * Does NOT call the engine. Does NOT call adapters. Caller assembles view.
 *
 * view shape:
 *   {
 *     result?:      { type: "BUY" | "PARK_CASH" | "REBALANCE", ... },
 *     state?:       "FAIL_CLOSED",          // overrides result.type when present
 *     contribution: number | null,           // dollars to deploy this week
 *     weekOf:       Date,                    // current week
 *     failReason?:  string                   // only for FAIL_CLOSED
 *   }
 */
(function (global) {
  'use strict';

  // ===== Formatters =====
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtWeek(d) {
    return 'Week of ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function fmtMoney(n) { return '$' + Math.round(n); }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ===== Reason → 2–3 short lines =====
  // Splits the deterministic reason string at ", " or ". " (but not periods inside parens).
  function reasonLines(reason) {
    if (!reason) return '';
    var parts = reason.split(/(?:,\s+|\.\s+)/)
      .map(function (p) { return p.trim().replace(/\.$/, ''); })
      .filter(Boolean);
    return parts.map(function (p) {
      return '<div class="wap__why-item">' + escapeHtml(p) + '</div>';
    }).join('');
  }

  // ===== Templates per state =====
  function header(view) {
    var weekLabel    = view.weekOf ? fmtWeek(view.weekOf) : '— —';
    var contribLabel = (view.contribution != null)
      ? fmtMoney(view.contribution) + ' to deploy'
      : '— —';
    return ''
      + '<header class="wap__header">'
      +   '<div class="wap__week">' + escapeHtml(weekLabel) + '</div>'
      +   '<div class="wap__contribution">' + escapeHtml(contribLabel) + '</div>'
      + '</header>';
  }

  function tplBuy(view) {
    var r = view.result;
    return header(view)
      + '<div class="wap__main">'
      +   '<div class="wap__decision wap__decision--accent">Buy ' + escapeHtml(r.ticker) + '</div>'
      +   '<div class="wap__amount">' + fmtMoney(r.amount_usd) + '</div>'
      + '</div>'
      + '<div class="wap__why">' + reasonLines(r.reason) + '</div>'
      + '<div class="wap__actions">'
      +   '<button class="wap__btn wap__btn--primary"   data-action="deployed">Mark as deployed</button>'
      +   '<button class="wap__btn wap__btn--secondary" data-action="skip">Skip this week</button>'
      + '</div>';
  }

  function tplParkCash(view) {
    var r = view.result || { reason: 'No candidate cleared all guardrails this week.' };
    var amount = (view.contribution != null) ? 'Hold ' + fmtMoney(view.contribution) : '';
    return header(view)
      + '<div class="wap__main">'
      +   '<div class="wap__decision">Park cash this week</div>'
      +   '<div class="wap__amount">' + escapeHtml(amount) + '</div>'
      + '</div>'
      + '<div class="wap__why">' + reasonLines(r.reason) + '</div>'
      + '<div class="wap__actions">'
      +   '<button class="wap__btn wap__btn--secondary" data-action="ack">Got it</button>'
      + '</div>';
  }

  function tplRebalance(view) {
    var r = view.result;
    var amount = (view.contribution != null) ? 'Hold ' + fmtMoney(view.contribution) : '';
    return header(view)
      + '<div class="wap__main">'
      +   '<div class="wap__decision wap__decision--alert">Rebalance ' + escapeHtml(r.ticker) + '</div>'
      +   '<div class="wap__amount">' + escapeHtml(amount) + '</div>'
      + '</div>'
      + '<div class="wap__why">' + reasonLines(r.reason) + '</div>'
      + '<div class="wap__actions">'
      +   '<button class="wap__btn wap__btn--secondary" data-action="ack">Got it</button>'
      + '</div>';
  }

  function tplFailClosed(view) {
    var msg = view.failReason || "Run Compare & Rank to generate this week's plan.";
    return header(view)
      + '<div class="wap__main">'
      +   '<div class="wap__decision wap__decision--muted">Plan unavailable</div>'
      +   '<div class="wap__amount">Missing input</div>'
      + '</div>'
      + '<div class="wap__why">'
      +   '<div class="wap__why-item">' + escapeHtml(msg) + '</div>'
      + '</div>';
  }

  // ===== Render =====
  function render(container, view) {
    if (!container) return;
    var state = view.state || (view.result && view.result.type) || 'FAIL_CLOSED';
    var html;
    switch (state) {
      case 'BUY':         html = tplBuy(view);        break;
      case 'PARK_CASH':   html = tplParkCash(view);   break;
      case 'REBALANCE':   html = tplRebalance(view);  break;
      default:            html = tplFailClosed(view); state = 'FAIL_CLOSED';
    }
    container.setAttribute('data-state', state);
    container.innerHTML = html;
    bindActions(container, view);
  }

  // ===== Action binding =====
  // Phase 2: actions show a confirmation only.
  // Phase 3: wire deployed → WAPAdapters.logDeployment(...).
  function bindActions(container, view) {
    var btns = container.querySelectorAll('[data-action]');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var msg = '';
        if (action === 'deployed') {
          // Phase 3 wiring point:
          // var r = view.result;
          // if (r && r.type === 'BUY' && global.WAPAdapters) {
          //   global.WAPAdapters.logDeployment(r.ticker, r.amount_usd, new Date());
          // }
          msg = 'Logged. See you next week.';
        } else if (action === 'skip') {
          msg = 'Skipped. See you next week.';
        } else if (action === 'ack') {
          msg = 'Got it.';
        }
        replaceActions(container, msg);
      });
    });
  }

  function replaceActions(container, msg) {
    var actions = container.querySelector('.wap__actions');
    if (actions) actions.innerHTML = '<div class="wap__confirm">' + escapeHtml(msg) + '</div>';
  }

  // ===== Export =====
  global.WAPUi = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
