/**
 * WAP Engine — Acceptance Tests (v1)
 *
 * All eight tests must pass before Phase 2 (UI) begins.
 * Open wap/test.html in a browser to run.
 */
(function () {
  'use strict';

  var results = [];

  function test(name, fn) {
    try { fn(); results.push({ name: name, status: 'PASS' }); }
    catch (e) { results.push({ name: name, status: 'FAIL', error: e.message }); }
  }

  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error((msg || '') + ' Expected ' + JSON.stringify(expected) +
        ', got ' + JSON.stringify(actual));
    }
  }

  function assertContains(haystack, needle, msg) {
    if (typeof haystack !== 'string' || haystack.indexOf(needle) === -1) {
      throw new Error((msg || '') + ' Expected "' + haystack +
        '" to contain "' + needle + '"');
    }
  }

  // ===== BASE FIXTURE =====
  // Realistic-shaped portfolio. GOOGL is the obvious winner in the happy path.
  function baseFixture(overrides) {
    var now = new Date('2026-04-26');
    var f = {
      portfolio: [
        { ticker: 'VOO',   currentWeight: 40.0, targetWeight: 40.0 },
        { ticker: 'GOOGL', currentWeight: 18.0, targetWeight: 25.0 },
        { ticker: 'AMZN',  currentWeight: 18.0, targetWeight: 20.0 },
        { ticker: 'NVDA',  currentWeight: 14.0, targetWeight: 15.0 },
        { ticker: 'SCHD',  currentWeight:  2.0, targetWeight:  0.0 },
        { ticker: 'RCL',   currentWeight:  6.0, targetWeight:  0.0 },
        { ticker: 'CCL',   currentWeight:  1.0, targetWeight:  0.0 },
        { ticker: 'NCLH',  currentWeight:  1.0, targetWeight:  0.0 }
      ],
      classification: {
        VOO: 'CORE', GOOGL: 'CORE', AMZN: 'CORE', NVDA: 'CORE',
        META: 'WATCHLIST', LMT: 'WATCHLIST',
        SCHD: 'LEGACY', RCL: 'LEGACY', CCL: 'LEGACY', NCLH: 'LEGACY'
      },
      rankedList: [
        { ticker: 'GOOGL', rank: 1 },
        { ticker: 'AMZN',  rank: 2 },
        { ticker: 'NVDA',  rank: 3 },
        { ticker: 'VOO',   rank: 4 },
        { ticker: 'META',  rank: 5 }
      ],
      verdicts: {
        VOO: 'BUY', GOOGL: 'BUY', AMZN: 'BUY', NVDA: 'BUY',
        META: 'BUY', LMT: 'HOLD',
        SCHD: 'HOLD', RCL: 'HOLD', CCL: 'AVOID', NCLH: 'AVOID'
      },
      lastBuys: {},
      contribution: { amount: 100, weekOf: now },
      currentDate: now
    };
    if (overrides) {
      Object.keys(overrides).forEach(function (k) { f[k] = overrides[k]; });
    }
    return f;
  }

  var run = window.WAP.generateWeeklyActionPlan;

  // ===== TESTS =====

  test('1. Happy path — Core underweight, BUY, Top Read #1 → BUY GOOGL', function () {
    var r = run(baseFixture());
    assertEqual(r.type, 'BUY');
    assertEqual(r.ticker, 'GOOGL', 'GOOGL has biggest gap × highest rank weight.');
    assertEqual(r.amount_usd, 100);
    assertContains(r.reason, 'Top Read #1');
    assertContains(r.reason, 'BUY verdict');
  });

  test('2. All Core at target → PARK_CASH', function () {
    var r = run(baseFixture({
      portfolio: [
        { ticker: 'VOO',   currentWeight: 40.0, targetWeight: 40.0 },
        { ticker: 'GOOGL', currentWeight: 25.0, targetWeight: 25.0 },
        { ticker: 'AMZN',  currentWeight: 20.0, targetWeight: 20.0 },
        { ticker: 'NVDA',  currentWeight: 15.0, targetWeight: 15.0 }
      ]
    }));
    assertEqual(r.type, 'PARK_CASH');
  });

  test('3. Core position 5.5pp over target → REBALANCE', function () {
    var r = run(baseFixture({
      portfolio: [
        { ticker: 'VOO',   currentWeight: 40.0, targetWeight: 40.0 },
        { ticker: 'GOOGL', currentWeight: 30.5, targetWeight: 25.0 }, // +5.5pp
        { ticker: 'AMZN',  currentWeight: 20.0, targetWeight: 20.0 },
        { ticker: 'NVDA',  currentWeight: 15.0, targetWeight: 15.0 }
      ]
    }));
    assertEqual(r.type, 'REBALANCE');
    assertEqual(r.ticker, 'GOOGL');
    assertContains(r.reason, '5.5pp over target');
  });

  test('4. Watchlist (META) wins → BUY new position', function () {
    var f = baseFixture({
      portfolio: [
        { ticker: 'VOO',   currentWeight: 40.0, targetWeight: 40.0 },
        { ticker: 'GOOGL', currentWeight: 25.0, targetWeight: 25.0 },
        { ticker: 'AMZN',  currentWeight: 20.0, targetWeight: 20.0 },
        { ticker: 'NVDA',  currentWeight: 15.0, targetWeight: 15.0 }
      ],
      rankedList: [{ ticker: 'META', rank: 1 }]
    });
    f.portfolio.push({ ticker: 'META', currentWeight: 0, targetWeight: 5.0 });
    var r = run(f);
    assertEqual(r.type, 'BUY');
    assertEqual(r.ticker, 'META');
  });

  test('5. No BUY verdicts → PARK_CASH', function () {
    var r = run(baseFixture({
      verdicts: {
        VOO: 'HOLD', GOOGL: 'HOLD', AMZN: 'HOLD', NVDA: 'HOLD',
        META: 'AVOID', LMT: 'AVOID', SCHD: 'AVOID', RCL: 'AVOID',
        CCL: 'AVOID', NCLH: 'AVOID'
      }
    }));
    assertEqual(r.type, 'PARK_CASH');
  });

  test('6. Empty rankedList → PARK_CASH (drops at conviction)', function () {
    var r = run(baseFixture({ rankedList: [] }));
    assertEqual(r.type, 'PARK_CASH');
  });

  test('7. Tiebreak — equal scores, higher gap wins', function () {
    // AAA: gap 4 × rank-2 weight (0.8) = 3.2
    // BBB: gap 8 × rank-4 weight (0.4) = 3.2
    // Tied → tiebreak by higher gap → BBB
    var r = run({
      portfolio: [
        { ticker: 'AAA', currentWeight: 1.0, targetWeight:  5.0 },
        { ticker: 'BBB', currentWeight: 2.0, targetWeight: 10.0 }
      ],
      classification: { AAA: 'CORE', BBB: 'CORE' },
      rankedList: [
        { ticker: 'AAA', rank: 2 },
        { ticker: 'BBB', rank: 4 }
      ],
      verdicts: { AAA: 'BUY', BBB: 'BUY' },
      lastBuys: {},
      contribution: { amount: 100 },
      currentDate: new Date('2026-04-26')
    });
    assertEqual(r.type, 'BUY');
    assertEqual(r.ticker, 'BBB', 'Higher gap should win the tiebreak.');
  });

  test('8. Recently bought (3 days ago, < MIN_DAYS=7) → drops at scaling gate', function () {
    var r = run(baseFixture({
      lastBuys: {
        GOOGL: { date: new Date('2026-04-23'), amount: 100 }
      }
    }));
    // GOOGL drops at scaling. Next survivor by score: AMZN (gap 2 × 0.8 = 1.6)
    assertEqual(r.type, 'BUY');
    assertEqual(r.ticker, 'AMZN');
  });

  // ===== RENDER =====
  function render() {
    var pass = 0, fail = 0;
    var html = '';
    results.forEach(function (r) {
      if (r.status === 'PASS') {
        pass++;
        html += '<div class="row pass">PASS &nbsp; ' + r.name + '</div>';
      } else {
        fail++;
        html += '<div class="row fail">FAIL &nbsp; ' + r.name +
          '<div class="err">' + r.error + '</div></div>';
      }
    });
    var summary = '<div class="summary ' + (fail ? 'fail' : 'pass') + '">' +
      pass + ' / ' + results.length + ' passed' +
      (fail ? ' &nbsp;—&nbsp; ' + fail + ' FAILED' : '') + '</div>';
    var out = document.getElementById('results');
    if (out) out.innerHTML = summary + html;
  }

  results.forEach(function (r) {
    if (r.status === 'PASS') console.log('PASS —', r.name);
    else console.error('FAIL —', r.name, '\n  ', r.error);
  });

  if (typeof document !== 'undefined') render();
})();
