/* =====================================================================
   INTELLIGENCE ENGINE v2 — LaForce Capital Wealth Builder
   Phases: hydrate -> analyze -> render
   Single source of truth: window.portfolioState
   Reuses v1 logic: computeHealthScore, computeRiskFlags,
                    computeActionPlan, computeDeployment,
                    computeRegime, computeConfidence
   No duplicate calculations. No analysis inside render.
   ===================================================================== */
(function(){
  'use strict';

  // ---- State initializer (idempotent, non-destructive) ---------------
  function _initState(){
    if(!window.portfolioState || typeof window.portfolioState !== 'object'){
      window.portfolioState = {};
    }
    var ps = window.portfolioState;
    if(typeof ps.totalValue !== 'number') ps.totalValue = 0;
    if(!Array.isArray(ps.holdings)) ps.holdings = [];
    if(!ps.market || typeof ps.market !== 'object'){
      ps.market = { trend:'neutral', vix:'normal', momentum:'neutral',
                    regime:'Neutral / Selective', confidence:null };
    } else {
      if(!ps.market.trend)    ps.market.trend    = 'neutral';
      if(!ps.market.vix)      ps.market.vix      = 'normal';
      if(!ps.market.momentum) ps.market.momentum = 'neutral';
      if(!ps.market.regime)   ps.market.regime   = 'Neutral / Selective';
      if(typeof ps.market.confidence === 'undefined') ps.market.confidence = null;
    }
    if(!ps.allocation || typeof ps.allocation !== 'object'){
      ps.allocation = { classes:{}, concentration:{} };
    } else {
      if(!ps.allocation.classes || typeof ps.allocation.classes !== 'object') ps.allocation.classes = {};
      if(!ps.allocation.concentration || typeof ps.allocation.concentration !== 'object') ps.allocation.concentration = {};
    }
    if(!ps.health || typeof ps.health !== 'object') ps.health = {};
    if(!ps.risk || typeof ps.risk !== 'object') ps.risk = { drivers: [] };
    else if(!Array.isArray(ps.risk.drivers)) ps.risk.drivers = [];
    if(!Array.isArray(ps.actionPlan)) ps.actionPlan = [];
    if(!Array.isArray(ps.deployment)) ps.deployment = [];
    if(!ps.stockAnalysis || typeof ps.stockAnalysis !== 'object') ps.stockAnalysis = {};
    return ps;
  }

  function _logErr(e, where){
    try { if(typeof addPortfolioError === 'function') addPortfolioError(e && e.message || e, where); }
    catch(_){}
  }

  // =================================================================
  // PHASE 1 — HYDRATION
  // Pull raw inputs into state. No analysis here.
  // =================================================================
  window.hydratePortfolioState = function hydratePortfolioState(){
    var ps = _initState();

    // Holdings
    var holdings = [];
    try {
      if(typeof getHoldings === 'function') holdings = getHoldings() || [];
    } catch(e){ _logErr(e, 'hydratePortfolioState:getHoldings'); holdings = []; }
    if(!Array.isArray(holdings)) holdings = [];
    ps.holdings = holdings;

    // Total value (sum of holding.value)
    var total = 0;
    for(var i=0; i<holdings.length; i++){
      var v = holdings[i] && Number(holdings[i].value);
      if(isFinite(v)) total += v;
    }
    ps.totalValue = total;

    // Market context from _intelCtx
    var ctx = (typeof _intelCtx !== 'undefined' && _intelCtx) ? _intelCtx : {};
    ps.market.trend    = ctx.trend    || ps.market.trend    || 'neutral';
    ps.market.vix      = ctx.vix      || ps.market.vix      || 'normal';
    ps.market.momentum = ctx.momentum || ps.market.momentum || 'neutral';

    return ps;
  };

  // =================================================================
  // PHASE 2 — ANALYSIS
  // Compute every derived field. Read from state, write to state.
  // =================================================================
  window.runAnalysis = function runAnalysis(){
    var ps = _initState();
    var market = ps.market;

    // 1. Market intelligence
    try {
      if(typeof computeRegime === 'function')
        market.regime = computeRegime(market) || market.regime;
    } catch(e){ _logErr(e, 'runAnalysis:computeRegime'); }
    try {
      if(typeof computeConfidence === 'function')
        market.confidence = computeConfidence(market);
    } catch(e){ _logErr(e, 'runAnalysis:computeConfidence'); }

    // 2. Portfolio health
    try {
      if(typeof computeHealthScore === 'function'){
        ps.health = computeHealthScore(ps.holdings, market) || {};
      }
    } catch(e){ _logErr(e, 'runAnalysis:computeHealthScore'); }

    // 3. Allocation classes (read from health.actMix)
    ps.allocation.classes = (ps.health && ps.health.actMix)
      ? ps.health.actMix
      : (ps.allocation.classes || {});

    // 4. Risk drivers
    try {
      if(typeof computeRiskFlags === 'function')
        ps.risk.drivers = computeRiskFlags(ps.allocation.classes || {}, market) || [];
    } catch(e){ _logErr(e, 'runAnalysis:computeRiskFlags'); }

    // 5. Action plan
    try {
      if(typeof computeActionPlan === 'function')
        ps.actionPlan = computeActionPlan(ps.allocation.classes || {}, market.regime) || [];
    } catch(e){ _logErr(e, 'runAnalysis:computeActionPlan'); }

    // 6. Deployment strategy ($5,000 default budget)
    try {
      if(typeof computeDeployment === 'function')
        ps.deployment = computeDeployment(5000, market.regime, market) || [];
    } catch(e){ _logErr(e, 'runAnalysis:computeDeployment'); }

    return ps;
  };

  // =================================================================
  // PHASE 3 — RENDER
  // READ-ONLY against portfolioState. Updates DOM only.
  // =================================================================
  function _esc(s){
    if(typeof esc === 'function') return esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function _money(n){
    if(typeof fmt$ === 'function') return fmt$(n);
    var v = Number(n) || 0;
    return '$' + v.toFixed(0);
  }

  window.renderIntelligenceV2 = function renderIntelligenceV2(){
    var ps = (window.portfolioState && typeof window.portfolioState === 'object')
      ? window.portfolioState
      : _initState();

    var market = ps.market || {};
    var health = ps.health || {};
    var risk   = (ps.risk && Array.isArray(ps.risk.drivers)) ? ps.risk.drivers : [];
    var plan   = Array.isArray(ps.actionPlan) ? ps.actionPlan : [];
    var deploy = Array.isArray(ps.deployment) ? ps.deployment : [];

    // Health score
    var elScore = document.getElementById('healthNum');
    if(elScore) elScore.textContent = (health.score != null ? health.score : '-');
    var elGrade = document.getElementById('healthGrade');
    if(elGrade) elGrade.textContent = 'Grade ' + (health.grade || '-');
    var elNote = document.getElementById('healthNote');
    if(elNote) elNote.textContent = health.note || '';

    // Regime badge
    var elRegime = document.getElementById('regimeBadge');
    if(elRegime){
      var r = market.regime || '-';
      elRegime.textContent = r;
      var cls = 'regime-badge ';
      if(r === 'Risk-Off') cls += 'rb-off';
      else if(String(r).indexOf('On') > -1) cls += 'rb-on';
      else cls += 'rb-neu';
      elRegime.className = cls;
    }

    // Risk drivers list
    var elRisk = document.getElementById('riskFlagsEl');
    if(elRisk){
      elRisk.innerHTML = risk.map(function(f){
        var t    = (f && f.type === 'warn') ? 'fi-warn' : 'fi-ok';
        var icon = (f && f.type === 'warn') ? '&#9888;' : '&#10003;';
        return '<div class="flag-item ' + t + '">' +
               '<span class="fi-icon">' + icon + '</span>' +
               _esc(f && f.txt || '') +
               '</div>';
      }).join('');
    }

    // Action plan list
    var elPlan = document.getElementById('actionPlanEl');
    if(elPlan){
      elPlan.innerHTML = plan.map(function(a){
        return '<div class="flag-item fi-ok">' +
               '<span class="fi-icon">-&gt;</span>' +
               _esc(a) +
               '</div>';
      }).join('');
    }

    // Deployment plan list
    var elDeploy = document.getElementById('deployPlanEl');
    if(elDeploy){
      elDeploy.innerHTML = deploy.map(function(d){
        return '<div class="dp-row">' +
                 '<div>' +
                   '<div class="dp-sym">' + _esc(d && d.ticker || '') + '</div>' +
                   '<div class="dp-reason">' + _esc(d && d.reason || '') + '</div>' +
                 '</div>' +
                 '<div class="dp-amt">' + _money(d && d.amount || 0) + '</div>' +
               '</div>';
      }).join('');
    }

    return ps;
  };

})();
