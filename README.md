# LaForce Capital

> Private wealth intelligence — single-file HTML prototype.

An AI-powered wealth intelligence system that reads market regime, diagnoses your portfolio, and generates clear action paths — conservative, balanced, or aggressive — so you always know the next move.

## Product surface

- **Dashboard** — 5-step decision sequence, regime pulse, onboarding
- **Portfolio Lab** — CSV / screenshot / manual holdings upload with AI extraction
- **Stock Analysis** — quick / full / beginner modes with Signal · Conviction · Timing · Sizing framework
- **Capital Deployment** — three-lens allocation engine (conservative · balanced · aggressive) with per-stock drill-down
- **Intelligence** — portfolio health scoring, allocation diagnosis, action plan generation
- **Cadence Plan** — interactive DCA projections with per-year compounding breakdown
- **Watchlist** — local-first with AI verdict persistence
- **Live Market** — regime-first context setting (trend / VIX / bias)

## Running locally

Open `index.html` in any modern browser. That's it — no build step, no install.

## Configuration

The prototype runs fully client-side. To unlock AI features, open the app and click **Set API Key** in the top bar, then paste an [Anthropic API key](https://console.anthropic.com/settings/keys). For live market data, click the **Demo data** chip and connect a free [Finnhub](https://finnhub.io/register) key.

> ⚠️ **Prototype security note:** API keys currently ship to the browser. This is acceptable for a private prototype but must not be exposed to real users. The architecture note at the bottom of the Feedback panel details the server-side proxy plan.

## Architecture

Single-file HTML with inline CSS and inline JavaScript. Chart.js loaded from CDN. State persists in `sessionStorage` / `localStorage`. No framework. No build pipeline. No backend yet.

Roadmap to SaaS is documented in the in-product architecture note (visible at the bottom of the Feedback panel).

## License

Proprietary. All rights reserved.
