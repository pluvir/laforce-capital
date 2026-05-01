/* ============================================================
 * Fortis Wealth Management — Strategy Path Module
 * ------------------------------------------------------------
 * Translates portfolio diagnosis into 3 structured paths.
 * Educational framing only — never advice language.
 *
 * Public API (attached to window.FortisStrategyPaths):
 *   computeStrategyPaths(portfolioState?)  -> [path, path, path]
 *   renderStrategyPaths(container, paths, { onSelect, intro }?)
 *
 * Drop-in. Does NOT modify portfolioState. Does NOT replace
 * any existing render. Inject into a container of your choice.
 * ============================================================ */
(function () {
  'use strict';

  // ---------- LANGUAGE GUARDS ----------
  // All output flows through these patterns. Keeps every path
  // on the education side of the line. No "you should" anywhere.
  const LANG = {
    intro:    'An investor on this path might',
    outcome:  'This path would',
    tradeoff: 'In exchange,'
  };

  // ---------- PATH BLUEPRINTS ----------
  const BLUEPRINTS = {
    defensive: {
      id: 'defensive',
      name: 'Defensive',
      tagline: 'Lower volatility, higher resilience',
      lensFocus: ['Risk', 'Quality', 'Portfolio Fit']
    },
    balanced: {
      id: 'balanced',
      name: 'Balanced',
      tagline: 'Diversified growth with measured risk',
      lensFocus: ['Portfolio Fit', 'Quality', 'Macro']
    },
    aggressive: {
      id: 'aggressive',
      name: 'Aggressive',
      tagline: 'Concentrated, conviction-led growth',
      lensFocus: ['Quality', 'Macro', 'Behavior']
    }
  };

  // Heuristic ticker buckets — extend as the data layer matures.
  const CYCLICAL_TICKERS  = ['CCL','NCLH','RCL','AAL','UAL','DAL','MGM','LVS'];
  const DEFENSIVE_TICKERS = ['SCHD','VYM','VIG','JNJ','PG','KO','WMT','XLU','XLV','XLP'];
  const CORE_BROAD        = ['VOO','VTI','SPY','VT','IVV'];

  // ---------- COMPUTE ----------
  function computeStrategyPaths(portfolioState) {
    const state = portfolioState ||
      (typeof window !== 'undefined' ? window.portfolioState : null);

    if (!state || !Array.isArray(state.holdings) || state.holdings.length === 0) {
      // Graceful empty state — same shape, neutral copy.
      return Object.values(BLUEPRINTS).map(bp => ({
        ...bp,
        structuralChanges: ['Awaiting portfolio data.'],
        outcome:  'Outcome details require an active portfolio.',
        tradeoff: 'Tradeoffs require an active portfolio.',
        deploymentHint: null
      }));
    }

    const holdings = state.holdings;
    const total = state.totalValue ||
      holdings.reduce((s, h) => s + (Number(h.value) || 0), 0);

    // Diagnostic context
    const sorted  = [...holdings].sort((a, b) => (b.value || 0) - (a.value || 0));
    const topName = sorted[0] || {};
    const topPct  = total > 0 ? Math.round(((topName.value || 0) / total) * 100) : 0;

    const cyclicalValue  = sumByTickers(holdings, CYCLICAL_TICKERS);
    const defensiveValue = sumByTickers(holdings, DEFENSIVE_TICKERS);
    const coreValue      = sumByTickers(holdings, CORE_BROAD);

    const ctx = {
      total,
      topName,
      topPct,
      cyclicalPct:  pct(cyclicalValue, total),
      defensivePct: pct(defensiveValue, total),
      corePct:      pct(coreValue, total)
    };

    return [
      buildDefensivePath(BLUEPRINTS.defensive, ctx),
      buildBalancedPath(BLUEPRINTS.balanced, ctx),
      buildAggressivePath(BLUEPRINTS.aggressive, ctx)
    ];
  }

  function sumByTickers(holdings, tickerList) {
    return holdings
      .filter(h => tickerList.includes(String(h.ticker || '').toUpperCase()))
      .reduce((s, h) => s + (Number(h.value) || 0), 0);
  }

  function pct(part, whole) {
    return whole > 0 ? Math.round((part / whole) * 100) : 0;
  }

  // ---------- PATH BUILDERS ----------
  function buildDefensivePath(bp, ctx) {
    const changes = [];
    if (ctx.defensivePct < 15) {
      changes.push(`raise the defensive sleeve (e.g., SCHD, VIG) toward ~20% of the portfolio`);
    }
    if (ctx.cyclicalPct > 10) {
      changes.push(`trim cyclical exposure currently near ${ctx.cyclicalPct}% to soften drawdown sensitivity`);
    }
    if (ctx.topPct > 30 && ctx.topName.ticker) {
      changes.push(`reduce single-name concentration in ${ctx.topName.ticker} (${ctx.topPct}%) below ~25%`);
    }
    if (changes.length === 0) {
      changes.push('hold the current defensive base and add to dividend-growth ETFs on weakness');
    }

    return {
      ...bp,
      structuralChanges: changes,
      outcome:  `${LANG.outcome} smooth volatility, reduce maximum drawdown exposure, and strengthen the Risk and Portfolio Fit lens readings.`,
      tradeoff: `${LANG.tradeoff} the long-term return ceiling is lower, and this path may underperform in strong bull markets.`,
      deploymentHint: { tilt: 'defensive', defensiveShare: 0.5, growthShare: 0.4, coreShare: 0.1 }
    };
  }

  function buildBalancedPath(bp, ctx) {
    const changes = [];
    if (ctx.corePct < 30) {
      changes.push('build a broad-market core (e.g., VOO) toward ~35% as the foundation');
    } else {
      changes.push('keep the broad-market core (e.g., VOO) as the portfolio foundation');
    }
    if (ctx.topPct > 30 && ctx.topName.ticker) {
      changes.push(`gradually rebalance ${ctx.topName.ticker} (${ctx.topPct}%) toward 20–25% of the portfolio`);
    }
    if (ctx.defensivePct < 10) {
      changes.push('add a measured defensive sleeve (5–10%) for ballast');
    }
    if (ctx.cyclicalPct > 15) {
      changes.push(`right-size cyclical positions (currently ${ctx.cyclicalPct}%) toward 5–10%`);
    }

    return {
      ...bp,
      structuralChanges: changes,
      outcome:  `${LANG.outcome} preserve long-term growth exposure while improving diversification and reducing single-name fragility — sharpening the Portfolio Fit lens.`,
      tradeoff: `${LANG.tradeoff} this path captures neither the full upside of an aggressive tilt nor the full cushion of a defensive one.`,
      deploymentHint: { tilt: 'balanced', defensiveShare: 0.2, growthShare: 0.5, coreShare: 0.3 }
    };
  }

  function buildAggressivePath(bp, ctx) {
    const changes = [];
    changes.push('route incremental capital to highest-conviction quality-growth names');
    if (ctx.corePct < 25) {
      changes.push('keep a baseline broad-market core (e.g., VOO) so the portfolio still tracks the index');
    } else {
      changes.push('hold the core but skew new dollars toward growth leaders');
    }
    if (ctx.cyclicalPct > 15) {
      changes.push(`reassess cyclical exposure at ${ctx.cyclicalPct}% — consolidate into the single strongest name rather than diffusing across several`);
    }
    if (ctx.defensivePct > 5) {
      changes.push('reduce the defensive sleeve to free capital for growth conviction');
    }

    return {
      ...bp,
      structuralChanges: changes,
      outcome:  `${LANG.outcome} maximize long-horizon compounding potential and lean into the Quality and Macro lenses where secular growth themes are strongest.`,
      tradeoff: `${LANG.tradeoff} drawdowns are deeper, single-name risk is higher, and the Behavior lens carries more weight — discipline during selloffs becomes essential.`,
      deploymentHint: { tilt: 'aggressive', defensiveShare: 0.05, growthShare: 0.7, coreShare: 0.25 }
    };
  }

  // ---------- RENDER ----------
  function renderStrategyPaths(container, paths, options = {}) {
    if (!container) return;
    injectStylesOnce();

    const onSelect = options.onSelect || function () {};
    const intro = options.intro ||
      'Three structured paths the diagnosis points toward. Each is an educational framework, not a recommendation.';

    container.innerHTML = `
      <section class="fwm-strategy-paths" aria-label="Strategy Paths">
        <header class="fwm-sp-header">
          <h2>Strategy Paths</h2>
          <p class="fwm-sp-intro">${intro}</p>
        </header>
        <div class="fwm-sp-grid">
          ${paths.map(renderPathCard).join('')}
        </div>
      </section>
    `;

    container.querySelectorAll('[data-path-id]').forEach(card => {
      const handler = function () {
        const id = card.getAttribute('data-path-id');
        const path = paths.find(p => p.id === id);
        if (!path) return;
        container.querySelectorAll('[data-path-id]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onSelect(path);
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    });
  }

  function renderPathCard(path) {
    return `
      <article class="fwm-sp-card" data-path-id="${path.id}" tabindex="0" role="button" aria-label="${path.name} path">
        <header class="fwm-sp-card-header">
          <h3>${escapeHtml(path.name)}</h3>
          <p class="fwm-sp-tagline">${escapeHtml(path.tagline)}</p>
        </header>
        <section class="fwm-sp-section">
          <h4>An investor might…</h4>
          <ul>${path.structuralChanges.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
        </section>
        <section class="fwm-sp-section">
          <h4>Outcome</h4>
          <p>${escapeHtml(path.outcome)}</p>
        </section>
        <section class="fwm-sp-section">
          <h4>Tradeoff</h4>
          <p>${escapeHtml(path.tradeoff)}</p>
        </section>
        <footer class="fwm-sp-footer">
          <span class="fwm-sp-lenses">Strengthens: ${path.lensFocus.map(escapeHtml).join(' · ')}</span>
        </footer>
      </article>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---------- STYLES ----------
  function injectStylesOnce() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('fwm-sp-styles')) return;
    const style = document.createElement('style');
    style.id = 'fwm-sp-styles';
    style.textContent = `
      .fwm-strategy-paths { font-family: inherit; color: var(--fwm-text, #e8eaed); }
      .fwm-sp-header h2 { margin: 0 0 0.25rem; font-size: 1.25rem; letter-spacing: 0.01em; }
      .fwm-sp-intro { margin: 0 0 1rem; color: var(--fwm-text-muted, #9aa0a6); font-size: 0.9rem; }
      .fwm-sp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
      .fwm-sp-card {
        border: 1px solid var(--fwm-border, rgba(255,255,255,0.08));
        background: var(--fwm-surface, rgba(255,255,255,0.03));
        border-radius: 12px; padding: 1rem;
        cursor: pointer;
        transition: border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
      }
      .fwm-sp-card:hover, .fwm-sp-card:focus {
        border-color: var(--fwm-accent, #4cc9f0);
        outline: none; transform: translateY(-1px);
      }
      .fwm-sp-card.selected {
        border-color: var(--fwm-accent, #4cc9f0);
        box-shadow: 0 0 0 1px var(--fwm-accent, #4cc9f0) inset;
      }
      .fwm-sp-card-header h3 { margin: 0; font-size: 1.05rem; }
      .fwm-sp-tagline { margin: 0.15rem 0 0.75rem; color: var(--fwm-text-muted, #9aa0a6); font-size: 0.85rem; }
      .fwm-sp-section { margin-top: 0.75rem; }
      .fwm-sp-section h4 {
        margin: 0 0 0.35rem; font-size: 0.78rem;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--fwm-text-muted, #9aa0a6);
      }
      .fwm-sp-section ul { margin: 0; padding-left: 1.1rem; font-size: 0.9rem; line-height: 1.4; }
      .fwm-sp-section p  { margin: 0; font-size: 0.9rem; line-height: 1.4; }
      .fwm-sp-footer {
        margin-top: 0.85rem; padding-top: 0.6rem;
        border-top: 1px dashed var(--fwm-border, rgba(255,255,255,0.08));
      }
      .fwm-sp-lenses { font-size: 0.78rem; color: var(--fwm-text-muted, #9aa0a6); }
    `;
    document.head.appendChild(style);
  }

  // ---------- PUBLIC API ----------
  const api = { computeStrategyPaths, renderStrategyPaths };
  if (typeof window !== 'undefined') window.FortisStrategyPaths = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
