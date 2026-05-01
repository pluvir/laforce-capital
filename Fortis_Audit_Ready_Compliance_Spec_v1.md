# Fortis Wealth Builder — Audit-Ready Compliance & Product Spec

**Version:** 1.0
**Status:** Draft for attorney review
**Owner:** Rod (Founder)
**Last updated:** 2026-04-28
**Posture:** Audit-defensible by default. Built to stand in front of an SEC examiner, state RIA examiner, securities attorney, SOC 2 auditor, or plaintiff's counsel — not just "legal enough to launch."

> **Standing disclaimer:** This document is internal compliance research. It is not legal advice. All decisions, disclaimer language, and risk classifications must be reviewed and signed off by a qualified securities attorney before public launch.

---

## 0. How to read this document

This is a foundational scaffolding document, not compliance theater. It does three things:

1. **Splits work into Tier 1 (build now, blocks core architecture) vs Tier 2 (layer in before launch).**
2. **Maps every Fortis v1 feature to its regulatory exposure, the audit-day question, the design constraint, and the evidence artifact required.**
3. **Defines the four foundational systems that have to exist before the first real user touches Fortis:** Output Design Rules, Acknowledgment Logging, Decision Record System, and Data Handling Basics.

If a feature does not have a row in Section 3, it does not get built.

---

## 1. Tier 1 vs Tier 2 — what blocks build vs what layers in

### Tier 1 (build into the product immediately — affects core architecture)

| # | Item | Why it can't wait | Section |
|---|---|---|---|
| 1 | Output design rules | Every AI/analysis output has to be authored against this filter from day one. Retrofitting after launch = full content rewrite. | §4 |
| 2 | Acknowledgment logging system | First real user generates the first records an auditor would sample. Can't retro-fit consent. | §5 |
| 3 | Decision record system | Decisions made now are what an auditor would ask about in 18 months. Capture them as you make them. | §6 |
| 4 | Feature-level regulatory tagging | Becomes the compliance map. Every spec/PR references it. | §3 |
| 5 | Data handling basics (encryption, retention, deletion) | If you skip this on day one, you cannot retroactively clean it up cleanly. | §7 |

### Tier 2 (layer in before public launch — does not block build)

| # | Item | When | Section |
|---|---|---|---|
| 1 | Full Terms of Service | Pre-launch, attorney-drafted | §10 backlog |
| 2 | Privacy Policy (formalized) | Pre-launch, attorney-drafted | §10 backlog |
| 3 | SOC 2 readiness pathway (Type 1 → Type 2) | 6–12 mo post launch | §10 backlog |
| 4 | State-by-state RIA / IAR analysis | Before paid users in 5+ states | §10 backlog |
| 5 | Marketing Rule (Rule 206(4)-1) deep review | Before any testimonial / track record / advertising | §10 backlog |
| 6 | E&O + Cyber liability insurance | 30–60 days before public users | §10 backlog |
| 7 | Vendor DPAs and subprocessor list | Pre-launch | §10 backlog |

---

## 2. The four foundational filters (apply to every feature, every output)

Every feature, output, label, marketing string, and AI response gets passed through these four filters before it ships. If any one fails, it doesn't ship until rewritten.

1. **Advice filter:** Would a regulator read this as personalized investment advice for compensation? If yes → reframe as analysis/education or kill the feature.
2. **Compensation linkage filter:** Is the output influenced (directly or indirectly) by what we get paid to show? If yes → that's pay-for-placement; kill it or disclose it.
3. **Evidence filter:** If an examiner asked "show me proof this happened correctly," what artifact would I hand them? If the answer is "nothing," build the logging before you build the feature.
4. **Forward-looking filter:** Does this output project, predict, or imply specific future returns? If yes → must include math-based assumptions and a hypothetical-scenario disclaimer adjacent to the output.

---

## 3. Per-feature compliance map (Fortis v1)

The locked v1 architecture is four sections: Home, Portfolio, Strategy, Research. Every current and known sub-feature is tagged below. New features must be added to this map in the same format before they enter the build queue.

### 3.1 Home

| Field | Value |
|---|---|
| What it does | Landing surface; greets user, surfaces portfolio summary tiles, queues onboarding state, hosts the persistent disclaimer footer and disclaimer-acknowledgment status. |
| Risk classification | LOW — display-only of user's own data. Becomes MEDIUM if it surfaces any "suggested action" widget. |
| Regulator question | "Does the home page steer the user toward specific securities or actions?" |
| Design constraint | No "buy now," "rebalance now," or "top picks" tiles. Action prompts must point to the user's own goals/inputs (e.g., "log this week's contribution"), not to securities. |
| Required evidence artifact | Screenshot history of the Home page across versions; copy of disclaimer footer with version ID; user acknowledgment log entry on first visit. |

### 3.2 Portfolio (Portfolio-first flow)

| Field | Value |
|---|---|
| What it does | Ingests holdings (manual, file upload, or aggregator token); displays positions, cost basis, allocation, concentration, sector/factor exposure; supports Core/Review/Legacy/Watchlist classification. |
| Risk classification | HIGH — handles non-public personal financial data. Triggers GLBA Safeguards Rule + state privacy law. |
| Regulator question | "How was this user's brokerage data acquired, stored, accessed, and disposed of, and where is the proof?" |
| Design constraint | Read-only data ingestion. No credential storage. Account numbers stripped/tokenized at intake. Display analysis only — no "what to do next" prescriptions inside Portfolio. |
| Required evidence artifact | Data flow diagram, encryption-at-rest and in-transit attestation, retention policy doc, deletion log per user, vendor list with DPAs (Plaid/SnapTrade/etc.), access log for any internal viewer. |

### 3.3 Portfolio — File Upload sub-feature

| Field | Value |
|---|---|
| What it does | Accepts brokerage statements (PDF/CSV) and parses positions. |
| Risk classification | HIGH — same as Portfolio plus document-handling exposure (account numbers, names, balances in raw form). |
| Regulator question | "What did you do with the raw uploaded file? When was it deleted? Could you reconstruct who uploaded what?" |
| Design constraint | Server-side parse → strip PII (account #, full name, address) → discard original within N hours (target: 24h). User-facing deletion control must purge raw + parsed records. |
| Required evidence artifact | Upload log (user, file hash, timestamp), parsing audit log, deletion log, documented retention window with config-versioned proof. |

### 3.4 Strategy section

| Field | Value |
|---|---|
| What it does | Lets the user define goals, target allocation, contribution cadence; displays user's current state vs. user-defined target. |
| Risk classification | MEDIUM-HIGH — closest surface to "personalized advice." Highest risk in the v1 architecture. |
| Regulator question | "Is Fortis prescribing a strategy to the user, or analyzing the user's own stated strategy?" |
| Design constraint | All targets/goals are user-defined inputs. Fortis displays gaps and math but does NOT prescribe targets, generate "optimal" allocations the user didn't choose, or label outputs as "your recommended strategy." Frame as "Strategy Lab," "Goal Tracker," or "Allocation Lens" — not "Strategy Engine" or "Recommended Strategy." |
| Required evidence artifact | Product spec showing user-input → display logic (no prescriptive branch); output templates version-controlled; user acknowledgment that targets are self-defined. |

### 3.5 Strategy — WAP (Weekly Allocation Plan) v1

| Field | Value |
|---|---|
| What it does | Per locked spec: ranks user's portfolio top-5 by composite score (no AI in decision/explanation), outputs BUY / PARK_CASH / REBALANCE for the week's contribution given MIN_DAYS=7 and REBALANCE_THRESHOLD=4. |
| Risk classification | HIGH — generates a security-specific action label ("BUY"). This is the single feature most likely to be read as advice by a regulator. |
| Regulator question | "Why is your tool telling a user to buy a specific security on a specific date?" |
| Design constraint | Reframe output verbs: "BUY" → "Allocate this week's contribution to [ticker] under your selected strategy." "REBALANCE" → "Allocation drift exceeds threshold — review your targets." "PARK_CASH" → "Hold contribution this week per your rule set." Make the deterministic ruleset explicitly visible to the user (no black box). User must acknowledge that the ruleset is *their* configuration before WAP runs. |
| Required evidence artifact | Versioned ruleset config (the user's chosen weights/thresholds), per-run input snapshot, output log, user acknowledgment of ruleset ownership. **No AI in decision or explanation** — this is already locked and is itself a compliance asset (deterministic = auditable). |

### 3.6 Strategy — Compare & Rank "Softer Reads" (Phase 2.5, deferred)

| Field | Value |
|---|---|
| What it does | (Future) Bottom-3 strip below Top Reads. |
| Risk classification | MEDIUM — ranking outputs read like recommendations. |
| Regulator question | "What's the difference between your 'softer reads' and a sell list?" |
| Design constraint | Do not build until approved. When approved, must use neutral language ("lower-rank in this ruleset"), be explicitly tied to the user's deterministic ruleset, and inherit WAP's "no AI in decision/explanation" rule. |
| Required evidence artifact | TBD on approval. |

### 3.7 Research section / Insight Engine (formerly "Alpha Engine")

| Field | Value |
|---|---|
| What it does | 10-layer stock analysis: surfaces fundamentals, technicals, sentiment, etc. for a ticker the user requests. |
| Risk classification | HIGH — narrative AI output about specific securities is the textbook exposure surface for both Advisers Act and Marketing Rule risk. |
| Regulator question | "Is this output a recommendation? Where is the line between 'analysis' and 'advice'?" |
| Design constraint | (1) Rename "Alpha Engine" — "alpha" implies market-beating returns and creates Marketing Rule exposure. Use **Insight Engine**, **10-Layer Lens**, or **Research Stack**. (2) Output must be data + neutral commentary, never "buy," "sell," "hold," "target price," "should." (3) AI-generated narrative must carry an inline AI-output disclaimer. (4) User must initiate (pull, not push) — no proactive "you should look at NVDA" surfacing. (5) No ranking of "best stocks for you." |
| Required evidence artifact | Versioned prompt templates, output examples reviewed against the four filters, user-pull event log (proves user initiated), inline disclaimer presence test in QA. |

### 3.8 Research — Investment Tracker (DCA logging/projection)

| Field | Value |
|---|---|
| What it does | Logs DCA contributions; projects portfolio value over time. |
| Risk classification | MEDIUM — projections are forward-looking outputs. |
| Regulator question | "Does this projection imply a specific future return the user can rely on?" |
| Design constraint | All projections are scenarios with user-selected return assumptions. Default scenarios offered (e.g., 4% / 7% / 10%) must be labeled as historical-style assumptions, not predictions. Forward-looking disclaimer (Disclaimer C in §8) appears adjacent to every projection chart and number. |
| Required evidence artifact | Version-controlled scenario template, screenshot of disclaimer placement in QA, user-input log of which scenario assumption was selected. |

### 3.9 Cross-cutting — AI/LLM-generated outputs (anywhere in product)

| Field | Value |
|---|---|
| What it does | Any narrative content produced by an LLM (Insight Engine, summaries, explanations). |
| Risk classification | HIGH — regulator scrutiny of AI in financial products is increasing (SEC predictive-data-analytics rule, state AI laws). |
| Regulator question | "Did a licensed professional review this output? Could it be wrong? How do you know?" |
| Design constraint | (1) AI-output disclaimer (Disclaimer D in §8) inline next to every LLM narrative. (2) No prescriptive verbs in output ("buy," "sell," "should"). (3) Prompt templates version-controlled; output samples retained. (4) Hallucination/error-rate testing logged. (5) No claim of human review unless there's actual human review. |
| Required evidence artifact | Prompt template version log, sampled output review log, model version captured per output, user-pull event log. |

### 3.10 Cross-cutting — Marketing site, social, email

| Field | Value |
|---|---|
| What it does | All external-facing copy about Fortis. |
| Risk classification | HIGH — Marketing Rule (Rule 206(4)-1) reaches even unregistered tools through general anti-fraud (Section 17(a) Securities Act, Rule 10b-5). |
| Regulator question | "Did your marketing imply advice, recommend specific securities, claim performance, or use testimonials without compliance?" |
| Design constraint | (1) No performance claims ("beat the market," "10x returns"). (2) No testimonials until Marketing Rule review complete (Tier 2). (3) No before/after portfolio screenshots without consent + disclaimers. (4) "Educational tool," "analysis tool," "research tool" — never "advisor," "advice," "wealth manager." (5) Founder bio cannot use "advisor" or "fiduciary." |
| Required evidence artifact | Copy review log per page/post, version-controlled marketing assets, attorney sign-off record once engaged. |

---

## 4. Tier 1 #1 — Output design rules (the product logic, not copywriting)

Every output Fortis produces is shaped by these rules. They are product-logic constraints enforced in templates and code, not just copy guidance.

**Replace prescriptive language with descriptive language at the template layer:**

| Never output | Always output |
|---|---|
| "Buy $X of NVDA" | "Allocating $X to NVDA matches your weekly contribution rule and current target weights." |
| "We recommend rebalancing" | "Allocation drift exceeds your selected threshold of 4%. Review your target weights." |
| "Top pick for you this week" | "Highest-ranked under your selected ruleset this week." |
| "Sell CCL" | "CCL is classified Legacy under your own classification. New contributions are paused per your rule." |
| "Expected to grow to $1M by 2046" | "Hypothetical scenario: at a 7% annual return assumption, this contribution schedule reaches $X. Actual results will differ." |
| "Best stocks to buy now" | "Stocks meeting your filter criteria, ranked by [criteria]." |

**Enforcement:** Output templates live in version control. Every template references the rule it is enforcing. Pull requests touching templates are reviewed against the four filters in §2.

---

## 5. Tier 1 #2 — Acknowledgment logging system

Every disclaimer, consent, and key user action produces an immutable log entry.

**Schema (minimum):**

```
acknowledgment_log
  id                  uuid (immutable)
  user_id             uuid
  event_type          enum [tos_accept, privacy_accept, onboarding_disclaimer,
                            scenario_disclaimer_view, ai_output_disclaimer_view,
                            file_upload_consent, deletion_request, deletion_confirm]
  artifact_version    string  (e.g., "tos_v1.2", "disclaimer_C_v1.0")
  artifact_hash       string  (sha256 of the exact text shown)
  timestamp           timestamp utc
  ip_address          string  (hashed if required by jurisdiction)
  user_agent          string
  session_id          uuid
  payload             jsonb   (any extra context)
```

**Rules:**

- Append-only. No updates, no deletes (except per legal hold or right-to-be-forgotten purge — and even then, the deletion event itself is logged).
- Exportable by user (GDPR/CCPA right to know).
- Backed up daily. Retention: 7 years minimum (matches typical SEC books-and-records standard).
- Hash of the artifact text shown is captured so even if the disclaimer copy changes, you can prove what *exactly* the user saw.

**First-class events to log on day one:**

- TOS / Privacy Policy acceptance (with version)
- Onboarding educational-tool disclaimer modal acknowledgment (Disclaimer B)
- Every file upload (with consent click)
- Every scenario/projection view (Disclaimer C inline view event)
- Every AI-output narrative view (Disclaimer D inline view event)
- Every deletion request and its completion

---

## 6. Tier 1 #3 — Decision record system (lightweight, traceable)

Notion or a simple DB table works. The format matters more than the tool.

**Decision record template:**

```
ID:            FWB-DR-NNNN
Date:          YYYY-MM-DD
Decision:      [one sentence — the decision made]
Context:      [why this came up, what was at stake]
Alternatives:  [options considered]
Chosen:        [option chosen]
Rationale:     [why — including risk/compliance reasoning]
Owner:         [who decided]
Approved by:   [if separate from owner]
Regulatory tag:[which regulation(s) this touches]
Evidence:      [link to artifact, screenshot, commit, etc.]
Review date:   [when this should be revisited, or "permanent"]
```

**Rules:**

- One record per non-trivial product, compliance, or design decision.
- Append-only. To change a decision, write a new record that supersedes the old (and link them).
- Reviewed monthly for stale items.
- Surface in the running compliance backlog (§10).

**Seed records — capture these now:**

- FWB-DR-0001: Build Fortis as audit-defensible educational/analytical tool, not an RIA. *(rationale: stay outside Advisers Act perimeter while preserving optionality to register later)*
- FWB-DR-0002: Rename "Alpha Engine" to **Insight Engine** (or pending alternative). *(rationale: "alpha" implies market-beating returns → Marketing Rule exposure)*
- FWB-DR-0003: WAP v1 is deterministic (no AI in decision/explanation). *(rationale: deterministic = auditable; rules are user-owned, not Fortis-prescribed)*
- FWB-DR-0004: Output verb policy — prescriptive verbs (buy/sell/hold/should/recommend) banned at template level. *(rationale: keep outputs as analysis, not advice)*
- FWB-DR-0005: File upload retention = raw deleted within 24h, parsed retained per user retention policy. *(rationale: minimize blast radius of any breach)*

---

## 7. Tier 1 #5 — Data handling basics (day-one minimum)

These are not Tier 2. If you skip them now you cannot retroactively clean it up cleanly, and the first user's data is the first record an auditor would sample.

**Encryption:**
- In transit: TLS 1.2+ everywhere (no plaintext HTTP, even on internal endpoints).
- At rest: AES-256 for portfolio data, file uploads, account identifiers.
- Keys: managed via cloud KMS (AWS KMS, GCP KMS, etc.) — never hard-coded, never in source.

**Credential handling:**
- Never store brokerage usernames/passwords. Period.
- Use OAuth aggregators (Plaid, SnapTrade, Yodlee) or file upload only.
- App-level credentials (user → Fortis): hashed (Argon2id or bcrypt with current cost), MFA available, MFA required for admins.

**PII minimization:**
- Strip account numbers and full names from parsed brokerage data at intake. Replace with internal tokens.
- Don't ingest data Fortis doesn't need to do the analysis.

**Retention:**
- Raw uploaded brokerage files: ≤ 24 hours, then purged.
- Parsed holdings data: until user deletion, with a hard cap (e.g., 24 months inactive → auto-purge).
- Acknowledgment logs: 7 years (matches typical books-and-records standard, even though Fortis is not yet an RIA).
- Backup retention: documented, with deletion propagation (i.e., a user-deletion request must purge backups too, or the backup must roll over within a documented window).

**Deletion:**
- User-controlled deletion in-app (not "email support"). Self-serve.
- Deletion event itself is logged.
- Confirmation to user with timestamp.

**Access control:**
- Role-based access. Standing access to user financial data = nobody. Just-in-time elevation with audit log.
- Every internal view of user data → log entry.

**Vendor / subprocessor list:**
- Maintained as a living document.
- Each vendor: what data they touch, DPA status, security questionnaire on file, breach notification SLA.

**Incident response:**
- Written plan exists before launch (even if simple — one page is fine to start).
- Defines: detection triggers, containment steps, notification timeline (default to 30-day external notification per SEC Reg S-P amended baseline), regulator + state AG contact list, post-incident review.
- Tested at least annually.

---

## 8. Disclaimer set (versioned, hashed, logged)

These are drafts. Every one of them goes through attorney review before launch and gets a version ID. Once locked, any change spawns a new version and a re-acknowledgment event for active users.

**Disclaimer A — Persistent footer (every page, email, PDF export):**

> Fortis Wealth Builder is an educational and analytical tool. It is not an investment adviser, broker-dealer, or financial planner, and nothing it provides is investment advice, a recommendation to buy or sell any security, or an offer or solicitation. All output is for informational and educational purposes only. Consult a licensed financial professional before making investment decisions. Past performance does not guarantee future results. Investing involves risk, including loss of principal.

**Disclaimer B — First-time user onboarding modal (must require explicit acknowledgment, logged):**

> Before you continue: Fortis Wealth Builder is not a registered investment adviser and does not provide personalized investment advice. The analysis, scenarios, and educational content you see here are based on the data you provide and on general market information. They are not recommendations to buy, sell, or hold any security. You are solely responsible for your investment decisions. By clicking "I Understand," you acknowledge that Fortis is an analytical/educational tool, that no fiduciary or advisory relationship is created, and that you will consult a qualified, licensed financial professional before acting on any analysis presented here.

**Disclaimer C — Forward-looking outputs (scenarios, projections, WAP outputs):**

> This is a hypothetical scenario based on assumptions you have selected, not a forecast or recommendation. Actual results will differ — often significantly. Markets are unpredictable. This projection does not account for taxes, fees, slippage, behavioral factors, or unforeseen events. Do not rely on this output as a basis for any investment decision.

**Disclaimer D — AI/LLM narrative outputs (Insight Engine, summaries):**

> This analysis is generated by an automated system using publicly available information and may contain errors, omissions, or out-of-date data. Outputs are not reviewed by a licensed financial professional. Verify all information independently before acting. This is not investment advice.

**Disclaimer E — File upload / data ingestion point:**

> By uploading your brokerage statement or portfolio data, you grant Fortis Wealth Builder permission to process this information solely to generate the analysis you request. We do not sell your personal financial data. See our Privacy Policy and Data Security Practices for full details, including how to delete your data and our retention schedule.

**Versioning rule:** every disclaimer carries a version ID (e.g., `disclaimer_C_v1.0`). Any change to wording = new version + re-acknowledgment for active users. The exact text shown is hashed and the hash is stored in the acknowledgment log.

---

## 9. Language ban list (enforced at template + code review level)

| Banned | Why | Replacement pattern |
|---|---|---|
| Recommend / we recommend | Adviser language | "Analysis shows," "data indicates" |
| You should buy / sell / hold | Prescriptive advice | "You may want to research," "consider learning more about" |
| Best stock / top pick | Ranking-as-recommendation | "Highest-ranked under your ruleset" |
| Guaranteed / expected returns | Performance claim | "Hypothetical scenario assuming X%" |
| Outperform the market / beat the market / alpha | Marketing Rule exposure | "Historical comparison vs. [benchmark]" |
| Advisor / advice / advisory | Implies adviser status | "Analyst," "analysis," "educational tool" |
| Personalized strategy | Implies personalized advice | "Scenario based on your inputs" |
| Risk-free / low-risk | Misleading risk framing | "Lower-volatility historically — past performance is not indicative" |
| Wealth management | Implies adviser status | "Wealth analysis," "portfolio analytics" |
| Fiduciary / your fiduciary | Implies legal duty | (Do not use unless registered) |

**Enforcement:** linter / CI check on copy and templates. PRs containing banned terms blocked.

---

## 10. Compliance backlog (running, surface monthly)

Tracks every open Tier 2 and operational item with owner and trigger.

| # | Item | Trigger / cadence | Owner | Status |
|---|---|---|---|---|
| CB-001 | Engage securities attorney for scoping review (1–2 hr) | Before public users | Rod | OPEN |
| CB-002 | Draft and lock Terms of Service | Before public users | Attorney + Rod | OPEN |
| CB-003 | Draft and lock Privacy Policy | Before public users | Attorney + Rod | OPEN |
| CB-004 | Choose entity structure (LLC/corp), liability insulation, TOS arbitration clause | Before public users | Attorney + Rod | OPEN |
| CB-005 | Cyber + E&O insurance quotes and bind | 30–60 days before public users | Rod | OPEN |
| CB-006 | State-by-state user screening / blocked-state list | Before paid users in 5+ states | Attorney + Rod | OPEN |
| CB-007 | Marketing Rule review of all external copy and any planned testimonial use | Before any testimonial / track record / paid ad | Attorney + Rod | OPEN |
| CB-008 | SOC 2 Type 1 readiness scoping | 6 months post launch | Rod | OPEN |
| CB-009 | SOC 2 Type 2 audit | 18–24 months post launch | Rod | OPEN |
| CB-010 | Vendor list with DPAs and security questionnaires | Before public users | Rod | OPEN |
| CB-011 | Incident response plan (1-pager v1) | Before public users | Rod | OPEN |
| CB-012 | "Alpha Engine" rename — confirm with attorney that "Insight Engine" is clean | Pre-launch | Attorney + Rod | OPEN |
| CB-013 | GLBA Safeguards Rule compliance program (written info security program, qualified individual designated) | Before public users | Rod | OPEN |
| CB-014 | Annual disclaimer / TOS review and re-acknowledgment cycle | Annual | Rod | RECURRING |
| CB-015 | Decision record monthly review | Monthly | Rod | RECURRING |
| CB-016 | Acknowledgment log integrity check | Quarterly | Rod | RECURRING |

---

## 11. Questions for the securities attorney (paid hour starter list)

1. Given the v1 architecture (Home / Portfolio / Strategy / Research) and per-feature design constraints in §3, do any features cross from "analysis" into "investment advice" under the Advisers Act? Which are riskiest?
2. Does the Lowe v. SEC publisher's exclusion apply to any Fortis outputs, or does personalization disqualify all of them?
3. Subscription model with no transaction-based comp and no pay-for-placement — defensible as unregistered, or recommend voluntary state RIA registration as a defensive move?
4. Which states should we block or screen against given more aggressive interpretations of "advice"?
5. Can we use real anonymized portfolio examples (including Rod's own) without triggering Marketing Rule (Rule 206(4)-1)?
6. Does GLBA Safeguards Rule apply? What's the minimum compliant security program for a non-bank financial tool?
7. Entity structure recommendation (LLC vs corp), liability insulation, mandatory arbitration clause feasibility, jurisdiction choice.
8. Review TOS, Privacy Policy, Disclaimers A–E, onboarding modal text, marketing site copy.
9. Confirm "Insight Engine" (or alternative) name is clean of Marketing Rule exposure.
10. Cleanest path to a future paid 1:1 coaching tier or actual advisory service — separate entity, RIA registration, partnership with existing RIA?
11. FINRA, CFP Board, NASAA marketing standards worth voluntarily adopting as a credibility signal even unregistered?
12. Per-state breach notification obligations and incident response plan review.
13. SEC's predictive data analytics rule status and applicability to AI-generated analysis outputs.
14. Acknowledgment-log retention period — is 7 years correct, longer, shorter?
15. Confirm the language ban list (§9) and the disclaimer text (§8) is sufficient.

---

## 12. Next actions (sequenced)

| # | Action | Owner | Target |
|---|---|---|---|
| 1 | Stand up the acknowledgment logging system (schema in §5) | Rod | Before any user touches the app |
| 2 | Stand up the decision record system (template in §6) | Rod | This week — capture the seed records |
| 3 | Encode the language ban list (§9) and output design rules (§4) into a CI check on templates/copy | Rod | Before any AI/template output ships |
| 4 | Implement data handling basics (§7) | Rod | Before any real brokerage data is ingested |
| 5 | Apply the per-feature compliance map (§3) to every spec/PR description | Rod | Ongoing from now |
| 6 | Engage securities attorney for the §11 question list | Rod | Before public launch |
| 7 | Lock disclaimer text post-attorney review | Attorney + Rod | After CB-001 |
| 8 | Bind cyber + E&O insurance | Rod | 30–60 days before public users |
| 9 | Monthly review: decision records, compliance backlog, recent outputs against the four filters | Rod | Recurring |

---

**End of v1.** This document supersedes the previous compliance brief. Update with version increments and a changelog as items move from OPEN to DONE.
