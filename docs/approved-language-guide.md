# Approved Language Guide — LaForce Capital Wealth Builder

**Purpose:** The single source of truth for how the product speaks. Every line of UI copy, AI output, disclaimer, and report text must conform to the patterns in this document.

**Why it exists:** LaForce Capital is positioned as an *educational and informational tool*, not a licensed financial advisor. The language guards in this guide are what make that positioning legally and ethically defensible.

**Status:** Reference only. Use this doc for find-and-replace passes, copy reviews, and AI prompt design. Do not modify production files yet — this is the rulebook the sweep will follow.

---

## 1. Approved Educational Phrasing

These are the building blocks. Every AI output and UI string should be assembleable from these patterns.

### Core stems (always safe)

- *"An investor on this path might…"*
- *"An investor reviewing this diagnosis might consider…"*
- *"This path would…"*
- *"In exchange,…"*
- *"One framework suggests…"*
- *"The data indicates…"*
- *"Historically, portfolios with this profile have…"*
- *"This pattern is consistent with…"*
- *"From an educational standpoint…"*
- *"A common approach in this regime is…"*
- *"Research and academic literature describe…"*
- *"Consider how this might affect…"*

### Approved verbs

`consider · explore · learn · observe · notice · understand · study · review · evaluate · assess · examine · recognize · illustrate · demonstrate · show · indicate · reflect · reveal`

### Approved modal/conditional verbs

`would · could · might · may · tends to · is consistent with · reflects · suggests (as in "the data suggests")`

### Approved frames for diagnosis

- *"The [Lens] lens reads as [observation]."*
- *"From a [Lens] perspective, this profile shows [pattern]."*
- *"This portfolio's [Lens] reading reflects [reason]."*

### Approved frames for macro context

- *"Today's regime is consistent with [description]."*
- *"The current Macro lens points to [observation]."*
- *"Markets in this regime have historically [pattern]."*

### Approved frames for action plans

- *"An investor on the [Path] path might consider [action] to strengthen [lens]."*
- *"[Action] would shift the portfolio toward [outcome]. In exchange, [tradeoff]."*
- *"One way to address this finding is [action], which would improve [lens]."*

---

## 2. Banned Financial-Advice Phrasing

These are the trip-wires. Any of them in production is a NO-GO for beta.

### Hard bans (regulatory risk — never use)

- *"You should buy / sell / invest"*
- *"We recommend"*
- *"My recommendation is"*
- *"I advise"*
- *"This is a good investment"*
- *"This stock will go up / down"*
- *"Guaranteed returns"*
- *"Risk-free"*
- *"You will make money"*
- *"You'll lose money"*
- *"Best time to buy"*
- *"You need to [trade action]"*
- *"You must [trade action]"*

### Soft bans (sound advisory — avoid)

- *"This is the right move"*
- *"We suggest you [action]"*
- *"Our recommendation"*
- *"Optimal portfolio"*
- *"Beat the market"*
- *"Outperform" (as a promise, not a description)*
- *"Smart money / smart investors do X"*
- *"Sure thing"*
- *"Trust us"*
- *"Don't worry about [risk]"*

### Tone bans (alarmist or hyped)

- *"Crash"* / *"crashing"* (use "drawdown")
- *"Panic"* (use "elevated volatility")
- *"Dangerous"* (use "elevated risk")
- *"Genius move"* / *"big mistake"* (use neutral descriptors)
- *"Always"* / *"never"* (use "often" / "rarely")
- *"Guaranteed"* (delete entirely — never use)

---

## 3. Replacement Examples

Use as a quick reference during the sweep. Left column is what to find. Right column is what to write.

| ❌ Banned | ✅ Approved |
|---|---|
| You should diversify | An investor might consider broader diversification |
| Buy more VOO | Adding to VOO would shift the portfolio toward broader market exposure |
| We recommend rebalancing | This diagnosis points toward a rebalancing opportunity |
| This stock is a strong buy | This stock's Quality lens reads strongly on current data |
| Sell your concentrated positions | An investor reducing concentration risk might trim positions above ~25% |
| You need to add defensive assets | An investor on the Defensive path might raise the defensive sleeve toward ~20% |
| The right allocation is… | One illustrative allocation on this path could be… |
| This is a great time to buy | The Macro lens currently shows [regime description] |
| Don't worry about volatility | Drawdown sensitivity is elevated — the Risk lens reflects this |
| You'll make money long-term | Historical patterns for this profile show [outcome range] |
| Smart investors do X | Investors with similar profiles often explore X |
| Best stocks for 2026 | Stocks with strong Quality lens readings in the current regime |

---

## 4. Disclaimer Language by Placement

Different placements need different disclaimer weights. All copy below is approved verbatim — use as-is unless the layout demands a length adjustment.

### Landing page (above the fold)
> *"LaForce Capital Wealth Builder is an educational and informational tool. It is not licensed financial advice, and nothing here should be interpreted as a recommendation to buy, sell, or hold any security."*

### First-run / pre-diagnosis modal or banner
> *"Before you continue: the diagnosis you're about to see is educational. It reflects patterns and frameworks — not personalized financial advice."*

### Inline beneath every AI insight (compact)
> *"Educational only. Not financial advice."*

### Strategy path cards (compact, optional)
> *"Educational frameworks — not recommendations."*

### Action plan / deployment view
> *"The deployment patterns shown are illustrative frameworks for educational study, not personalized recommendations. Allocations are examples — not targets."*

### Stock drill-down view
> *"Stock-level analysis presented here is informational. It is not a recommendation to take any action on any security."*

### Report export cover page
> *"This report is for educational and informational purposes only. It does not constitute financial advice. Consult a licensed financial advisor before making investment decisions."*

### Sitewide footer (every page)
> *"© LaForce Capital. Educational tool. Not financial advice. Not a registered investment advisor."*

### Beta brief / invite email
> *"LaForce Capital Wealth Builder is a private beta of an educational portfolio intelligence tool. It is not financial advice. Use it to learn about your portfolio — not to make trading decisions in isolation."*

---

## 5. Rules for Action-Plan Wording

Action plans are the most regulatory-sensitive surface in the product. Apply these rules without exception.

1. **Every action begins with a conditional frame.** Either *"An investor on this path might…"* or *"This path would…"*. Never imperative.
2. **Every action references the lens(es) it strengthens.** Ties the action to the educational framework, not to a personal directive.
3. **Every action shows the tradeoff.** *"In exchange, …"* must follow any positive outcome statement.
4. **Allocations are illustrative, never targets.** Use ranges (*"~20%"*, *"5–10%"*) and the word *"illustrative"* explicitly when needed.
5. **Conditional verbs only.** `would · could · might · may`. No `will`, no `should`, no `must`.
6. **No urgency language.** Banned: *"now,"* *"this week is critical,"* *"act before."* Time references must be neutral (*"in the current regime"*).

### Approved templates

- *"An investor on the [Path] path might consider [action] to strengthen the [Lens] reading. This would [outcome]. In exchange, [tradeoff]."*
- *"One illustrative move on this path is [action] — sized at roughly [range]."*
- *"To address the [Lens] finding, an investor might explore [action]."*

---

## 6. Rules for Risk / Deployment / Stock-Check Wording

### Risk wording

- Frame as *"downside exposure"* or *"drawdown sensitivity"* — never *"danger"* or *"loss"*
- Quantify whenever possible (*"67% concentrated in three names"*, not *"very concentrated"*)
- Tie every risk observation to a lens
- Educational tone — describe the pattern, not the threat

**Approved:**
- *"The Risk lens reflects elevated drawdown sensitivity due to [reason]."*
- *"This portfolio's Risk reading is shaped by [observation]."*
- *"From a Risk perspective, single-name exposure is [quantified]."*

**Banned:**
- *"This is dangerous"*
- *"You'll lose money"*
- *"Crash risk"*
- *"Panic-worthy"*

### Deployment wording

- Always framed as illustrative
- Allocations shown as ranges, not exact orders
- Include educational reasoning alongside the numbers
- Reference the path that produced the deployment

**Approved:**
- *"An investor on the [Path] path might allocate this week's contribution roughly as [breakdown] — illustrative, not a directive."*
- *"This deployment pattern reflects the [Path] tilt: heavier weight in [category], lighter in [category]."*
- *"The pattern shown here is one of many ways an investor on this path might think about the next dollar."*

**Banned:**
- *"You should put $X here"*
- *"The right allocation is…"*
- *"Optimal split"*
- *"Best use of this $100"*

### Stock-check (drill-down) wording

- Frame outputs as *"the [Lens] read on [Ticker]"*
- Use data and indicators, not verdicts
- Show multiple lenses where possible — never a single score reduced to a verdict
- Source and indicator transparency required

**Approved:**
- *"The Quality lens on [Ticker] reads as [observation], based on [data inputs]."*
- *"Macro tailwinds for [Ticker]'s sector are reflected in [reasoning]."*
- *"On the Value lens, [Ticker] currently trades at [metric] vs. [reference]."*
- *"The lens readings on [Ticker] are mixed: [Lens A] reads [observation], while [Lens B] reads [observation]."*

**Banned:**
- *"This stock is a buy"*
- *"Good price right now"*
- *"Don't buy this stock"*
- *"Strong buy / sell / hold"* (these are advisory ratings — never use)

---

## 7. Six-Lens Vocabulary Rules

Lens names are the product's intelligence framework. Use them consistently.

### When to use the lens name vs. plain-English translation

- **First mention in any new screen or context:** include the plain-English translation in parentheses or as a hover.
- **Subsequent mentions in the same view:** lens name alone is fine.
- **Beginner mode (toggle on):** always include translations.
- **Experienced mode (toggle off):** lens name only; translation on hover.

### Approved translations (use exactly as written)

| Lens | Plain-English translation |
|---|---|
| Quality | *How strong are these businesses?* |
| Value | *Are you paying a fair price?* |
| Risk | *What's your downside exposure?* |
| Macro | *Does your mix fit today's market?* |
| Behavior | *Are your patterns helping or hurting?* |
| Portfolio Fit | *Do these pieces work together?* |

### Banned lens-related phrases

- *"Top lens"* / *"winning lens"* (lenses are not ranked)
- *"Failing lens"* (use *"flagging lens"* or *"flashing lens"*)
- *"Pass / fail"* on a lens (use *"strong / weak / mixed reading"*)

---

## 8. Quick Find-and-Replace Targets

The most likely offenders in current copy. Run a search for each banned string and replace with the approved equivalent.

| Find (banned) | Replace with (approved) |
|---|---|
| `you should` | `an investor might` |
| `we recommend` | `the diagnosis points toward` |
| `our recommendation` | `the educational reading` |
| `buy ` (as a verb) | `consider adding ` |
| `sell ` (as a verb) | `consider trimming ` |
| `invest in` | `explore exposure to` |
| `your best move` | `one path forward` |
| `the right thing to do` | `an educational approach` |
| `you need to` | `an investor in this position might` |
| `you must` | `an investor on this path would` |
| `smart investors` | `investors with similar profiles` |
| `winners` (as verdict) | `outperformers` (as description) |
| `losers` (as verdict) | `underperformers` (as description) |
| `guaranteed` | *(delete entirely — no replacement)* |
| `risk-free` | *(delete entirely — no replacement)* |
| `always` | `often` |
| `never` (as universal claim) | `rarely` |
| `crash` | `drawdown` |
| `dangerous` | `elevated risk` |
| `panic` | `elevated volatility` |
| `genius move` | `strong reading` |
| `big mistake` | `weak reading` |
| `strong buy` | `the Quality lens reads strongly` |
| `strong sell` | `the [relevant] lens reads weakly` |
| `hold` (as a rating) | `mixed reading` |
| `optimal` | `illustrative` |
| `best portfolio` | `one approach` |
| `right allocation` | `illustrative allocation` |
| `act now` | `(remove urgency entirely)` |
| `don't miss` | `(remove urgency entirely)` |

---

## 9. Pre-Sweep Checklist

Before starting the find-and-replace pass on the codebase:

- [ ] Read this document end-to-end once.
- [ ] Open a single working file or branch for the language sweep — keep it isolated from feature work.
- [ ] Run searches in this order: hard bans → soft bans → tone bans → quick replacement targets.
- [ ] Review every AI prompt template for the banned patterns (prompts produce future copy — fixing the prompt fixes the source).
- [ ] After the sweep, do a manual read-through of every screen and the report export.
- [ ] Have one trusted reader who hasn't seen the product before scan for any phrasing that *feels* like advice — gut check matters more than the regex pass.

---

## 10. Maintenance

- This guide is the source of truth. If a new phrasing pattern emerges in the product, add it here first, then ship it.
- Any new AI feature must include a copy review against this guide before launch.
- Quarterly: re-read the full doc and prune any patterns that have become stale.
- The plain-English lens translations in Section 7 are locked — do not rewrite without a deliberate decision.
