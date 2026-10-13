# Free-trial onboarding patterns + maintaining a dated comparison table

Research date: 2026-10-03. Read-only web research. I did not sign up for any service and changed no site code.

Legend:
- **[1st]**: read on the product's or publisher's own page. This includes pages fetched as HTML. Where a live page was bot-blocked, I read the Wayback Machine raw snapshot, and the snapshot date is given.
- **[2nd]**: from a third-party article, review, teardown, search snippet or forum.
- Logged-in flows (what a picker or modal looks like after signup) were not visible. Those entries rely on help-center docs or third-party write-ups and are labelled [2nd].

Quotes are kept under 15 words, at most one per source. Everything else is paraphrased.

Caveats:
- Several pricing pages are JS-rendered or bot-blocked (Higgsfield, Pollo, Leonardo, Ideogram, NerdWallet, Bankrate, Cybernews, Wirecutter, OpenAI Help).
- Where third-party numbers conflict with each other or with the vendor's own page, both are shown.
- Free allowances in this market change monthly.

---

# PART 1: How free users are steered to a first output, then to paying

## 1.1 Product-by-product

| # | Product | Free allowance and what it unlocks | Default / featured model for a new free user | When the user can't afford a model | "Free" badge or dedicated free model/mode | Free output limits | Post-result upsell / daily regen | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | **seedance2ai.io** (direct peer) | Literal offer: "Try Seedance 2.0 Mini free: 1 video a day, 480p, up to 5s, no card needed." Also a **$3.99 / 200-credit Trial Pack** "for first-time use". 50% off the first annual plan. | The landing page features Seedance 2.0. The free offer is Mini-specific | Not visible logged-out | **Yes: a dedicated free model** (Mini), 1 clip/day | 480p, ≤5 s | **Daily** free clip; low-ticket trial pack as the first purchase | seedance2ai.io/pricing [1st]; homepage [1st] |
| 2 | **seedance.tv** (direct peer) | 4 one-time starter credits, no card. "Every model is open to free accounts too; credits are the only limit." | Homepage features Seedance 2.5 (from 22 credits). Pricing names Seedance 2 Mini (4 credits per 5 s 480p) as the cheapest | Not visible (credits are the only gate) | No dedicated mode, but the copy says starter credits are "enough for a short 480p test clip on the lower-cost models" | Watermark on Seedance/Veo for free accounts | None stated | seedance.tv/pricing, seedance.tv [1st] |
| 3 | **seadance.io** | Not stated on the page | **Seedance 2.5 pre-selected** ("New" badge, 30 credits/s; example estimate 130 credits) | Not visible | No | Not stated | Not stated | seadance.io [1st]. This is the same "premium default" pattern we have today |
| 4 | **seavidgen.com** | "Our free trial gives you enough credits to generate your first few videos" (no number) | Seedance 2.0 featured | Not visible | Title says "Free Seedance 2.0 AI Video Maker" | Not stated | Not stated | seavidgen.com [1st] |
| 5 | **creaa.ai** | No free plan on the pricing page. Paid tiers only | n/a | The page mentions "low credits" users are prompted to upgrade | No | n/a | n/a | creaa.ai/pricing [1st] |
| 6 | **topview.ai** | No free plan on the pricing page. Cheapest is Basic $18/mo (annual) | n/a | n/a | Paid plans include "unlimited" image models (Nano Banana etc.) as a value hook | n/a | n/a | topview.ai/pricing [1st] |
| 7 | **higgsfield.ai** | The pricing comparison table has a "Free" column marked "limited use" (有限使用). Third parties report **10 credits/day, non-accumulating**, about 1 video/day. One notes the Sept 2026 official table showed 0 | Not verifiable logged-out | Premium models (Veo 3 / Sora 2) are off-limits on free [2nd]. The UI treatment is undocumented | Paid plans advertise "unlimited & free generation" models (e.g. Genjutsu); none for free users | Visible watermark; 1 concurrent job [2nd] | **Daily** credits [2nd] | higgsfield.ai/pricing rendered in browser [1st]; zsky.ai/blog/is-higgsfield-free.html (Jun 20, 2026) [2nd] |
| 8 | **pollo.ai** | About 10 signup credits, plus a **7-day daily check-in (25 credits)**, social follows, referrals | n/a | n/a | Free credits work on all tools; only volume differs | Watermark, 1 concurrent task | **Gamified daily check-in** | coverr.co blog; pollo.ai/hub/pollo-ai-free-credits (403 to fetcher; snippet) [2nd] |
| 9 | **hailuoai.video** (MiniMax) | Reports conflict. One says 200 trial credits that expire 72 h after signup. Others say daily bonus credits worth roughly 2–5 videos/day | n/a | n/a | Unlimited "Relax mode" exists only on top paid tiers | 720p/768p, ~6 s, watermark | Daily bonus (per some sources) | costbench.com/…/hailuo-ai/free-plan; atlascloud.ai guide [2nd]. The official subscribe page was not readable |
| 10 | **Kling** (kling.ai) | **66 credits that refresh daily**, no rollover | n/a | n/a | Free credits cover 720p T2V/I2V; 1080p, watermark removal and fast track are paid | 720p, watermark | **Daily refresh** | aireiter.com, atlascloud.ai [2nd]. kling.ai pricing is JS-only |
| 11 | **Dreamina / CapCut** (ByteDance, Seedance's owner) | **Daily credits**. Dreamina's own article (Sep 9, 2026) cites an "August 2026 baseline" of 120/day and says to confirm in-account. Third parties say 225/day | n/a | Not stated | Its own article names **Seedance 2.0 Mini as the lower-cost option** for free users, and says "Free access is not the full product catalog" | Watermark on free (export branding removable on member plans) | **Daily refresh** | dreamina.capcut.com/ai-video/free-ai-video-generator-usable-clips-guide-2026 [1st]; atlascloud.ai [2nd] |
| 12 | **Pika** | The pricing page shows the Free plan buying credits "in packs only", "All models", "No watermark", no commercial license. Third parties say 80 credits/mo at 480p | n/a | n/a | No | 480p (per 2nd) | n/a | pika.art/pricing [1st]; eesel.ai, magichour.ai [2nd]. Conflict noted |
| 13 | **Runway** | **125 one-time credits**. Free plan includes a curated subset: Gen-4 Turbo image-to-video, Gen-4 image, TTS. Credits **cannot be bought on Free** | n/a | Help center: an upgrade prompt appears when the model isn't in Free **or** credits are insufficient. **Hard block + upgrade** | Effectively a **restricted cheap-model set** (Gen-4 Turbo at 5 cr/s) | Watermark | No daily regen | runway.com/pricing [1st]; help.runwayml.com Free plan details (403; snippet) [2nd] |
| 14 | **Krea** | **100 compute units/day**, all image models. "Video concurrency: 0" on Free, so no video | n/a | Docs: an "Insufficient Compute Units" error, with options to wait for the daily reset, buy a pack, or upgrade | No | Commercial licence included even on Free | **Daily reset** | krea.ai/pricing [1st]; krea.ai/docs/…/compute-units [1st] |
| 15 | **Leonardo** | **150 tokens/day** | n/a | "You're out of tokens for today" message [2nd] | Some motion/video models usable | Public generations; no ownership on Free | **Daily reset** | intercom.help/leonardo-ai; costbench [2nd]. Pricing page 403 |
| 16 | **Suno** | **50 credits/day** (about 10 songs) | Free users get **"best free model (v6-mini)"**. v6 / v6-wild are paid | Paid models are gated by plan | **Yes: a dedicated, named free model** | No commercial rights, no downloads per month, no add-on credit purchases | **Daily**; the upsell is the better model plus rights | suno.com/pricing [1st] |
| 17 | **ElevenLabs** | **10k credits/month** | Free limited to Eleven v3 (v4 paid) | n/a | Model tiering by plan | No commercial licence | Monthly reset | elevenlabs.io/pricing [1st] |
| 18 | **Canva** | Free plan; Pro elements marked with a **crown** | Templates first (free and Pro mixed) | Pro elements can be **used and previewed, but carry a watermark**. On download: buy that one element ("Remove watermarks" button, single-design licence) **or** upgrade/start a Pro trial | **Badge on premium items, not on free** | Watermark only on premium elements | Upsell happens at **export**, after the user has invested | canva.com/help/article/watermarks-design [1st]; brendacadman.com [2nd] |
| 19 | **Midjourney** | No standing free tier since 2023 (ended over "trial abuse"). Some 2026 posts claim ~25 trial images on web signup | n/a | n/a | n/a | n/a | n/a | tbsnews/pcworld [2nd]; cometapi [2nd, unverified] |
| 20 | **Ideogram** | **10 slow credits/week** (down from 10/day in Jan 2025) | n/a | Slow queue | Free = slow queue | Public, undeletable images; JPG only | Weekly | eesel.ai, dailyaifixs.com [2nd]. Pricing 403 |
| 21 | **ChatGPT** (pattern reference) | Free users get a capped number of flagship messages, then are **automatically switched to the mini model** until reset, with an upgrade invitation. One Sept 2026 report says OpenAI is removing auto-switching in favour of a cheaper default | Flagship first, then fallback | **Auto-switch to a cheaper model + upgrade CTA** | The mini model is the free fallback | — | Rolling reset | help.openai.com free-tier FAQ (Cloudflare challenge; not bypassed); northflank.com, propakistani.pk [2nd] |

Not captured: logged-in screenshots of exactly how Kling, Hailuo, Higgsfield, Pika or Dreamina render a model the user can't afford (lock badge, greyed out, modal). I found no public teardown that documents this for AI video sites, so I make no claim about it.

## 1.2 Patterns, grouped

1. **A free-eligible model is the path to the first output.** Suno names it ("best free model"). seedance2ai.io makes Mini the free model. Dreamina points free users to Mini. Runway restricts Free to a cheap model set. ChatGPT falls back to mini. Peers that pre-select the premium model (seadance.io, and us) leave the user unable to afford even one generation.
2. **Daily refresh beats a one-time grant in this category.** Kling, Higgsfield, Krea, Leonardo, Suno, Dreamina, Pollo (check-in) and seedance2ai.io all refresh daily. One-time grants: Runway (125), seedance.tv (4), Hailuo (72-hour expiry, per one source), and us. Ideogram moved to weekly to cut cost. Midjourney dropped free entirely because of abuse. Abuse control is the real cost of daily grants.
3. **When the user can't afford a model:** the documented options are a hard block plus upgrade (Runway, Krea's error, Leonardo's "out of tokens"), auto-fallback to a cheaper model (ChatGPT), or "let them use it, gate the export" (Canva watermark plus a single-item purchase). None of these vendors publish a "try with X instead" button. It's a reasonable combination of the ChatGPT and Canva patterns, not a documented industry norm.
4. **What free output gives up:** a watermark (almost universal), 480p/720p, short durations, a slow queue (Ideogram, Hailuo Relax), public outputs (Leonardo, Ideogram), and no commercial licence (Suno, ElevenLabs, Pika). The upsell then sells removal of these limits plus the better model.
5. **Low-ticket first purchase:** seedance2ai.io sells a $3.99 trial pack, and Canva sells single elements. Both lower the first-payment barrier compared with going straight to a subscription.

## 1.3 Published evidence on activation and conversion

- **Activation predicts conversion strongly.** In UX Studio's UXfolio case study, non-activated users converted at 0.5% and activated users at 17%. Users who created their first case study with the AI generator converted at 36%. Designer finding: "Starting a case study is the hardest part." uxstudioteam.com/uxfolio-case-study [1st]
- **Benchmarks.** Lenny's Newsletter (Oct 25, 2022): average activation is 34% and median 25%. For B2C freemium/subscription, "good" is about 55% and "great" about 70%. Activation milestones should predict retention, and showing core value immediately is a top lever. lennysnewsletter.com/p/what-is-a-good-activation-rate [1st]. Our September rate (0 generation tasks from ~290 signups) is roughly 0%.
- **First-day intent.** Canva's growth team raised activation (creating a design) by over 10% with personalised onboarding and in-app messages on day one: "When users want to create a design, they usually create the design on the first day." appcues.com/blog/canva-growth-process [1st]
- **Free-to-paid tactics, 2026.** Growth Unhinged/ChartMogul surveyed 200 B2B products (Jan 2026, published Mar 18, 2026). Median free-to-paid is 8%. Tactics that worked include shorter use-case onboarding, **bonus AI credits for completing steps**, **monthly AI credit limits**, feature-specific trials, and dual CTAs (26% lift reported). Card-required trials convert at about 30%, roughly 5x card-less trials, but get fewer signups. growthunhinged.com/p/how-to-improve-free-to-paid-conversion [1st]
- **Reverse trials.** Elena Verna (Amplitude, 2022, republished 2025) argues that combining trial urgency with freemium persistence beats either alone: "You get the best of free trial and freemium…". The article itself contains **no A/B data**. amplitude.com/blog/reverse-trial [1st]. The figure "reverse trials lift conversion 10–40%" circulates in userpilot/saasmag posts attributed to Verna, but I couldn't trace it to a primary dataset [2nd, weak].
- **What I could not find:** published A/B evidence for AI-generation products comparing (a) a premium default vs a free-eligible default, (b) a one-time vs a daily grant, or (c) auto-switch vs hard block. The recommendations below rest on the general activation evidence above plus convergent competitor behaviour, not on a niche-specific experiment.

## 1.4 Ranked recommendation for seedanceai.dev

Our funnel isn't a pricing problem first. It's a **zero-activation** problem: 389 grants → 0 generation tasks. Fix the path to the first video before tuning the paywall. (Also check instrumentation: 2 credit consumptions with 0 tasks suggests failed or rolled-back attempts or a logging gap.)

1. **Default model by balance (highest impact).** If the balance is below the cheapest Seedance 2.5 clip (30 credits), pre-select **Seedance 2.0 Mini, 480p, 5 s** and label it **"Free"**. In the same picker, show Seedance 2.5 with its price ("30 credits") and a small lock or "needs credits" note. Users with enough credits keep Seedance 2.5 as the default. Precedents: Suno's free model, seedance2ai.io's free Mini, Dreamina pointing free users to Mini, ChatGPT's fallback.
2. **Insufficient-credits UX: no dead ends.** If someone picks 2.5 with 5 credits, don't show a bare error. Show an inline panel that keeps their prompt and image: "Seedance 2.5 needs 30 credits; you have 5." Primary button: **"Generate free with Seedance 2.0 Mini"**. Secondary: **"Get credits"**, opening a small first-purchase pack plus plans. Don't switch models silently. The user asked for 2.5, and our truthful-claims rule favours an explicit choice. One click is the honest version of ChatGPT's auto-fallback.
3. **Result-page upsell (second).** On a finished Mini clip, offer **"Remake this in Seedance 2.5 — 1080p, audio, longer (30 credits)"** with the prompt and seed pre-filled, plus "Remove watermark / HD". Pair it with a **low-ticket starter pack** (seedance2ai.io's $3.99/200 is the direct comparable). Canva and the free tiers above show the upsell works best *after* the user has invested in a result.
4. **Allowance: switch from 5 one-time credits to "1 free Mini clip per day"** (480p, 5 s, watermarked, signed-in only). This is the category norm and matches seedance2ai.io's identical offer. Control abuse (the Midjourney lesson):
   - Gate it on a verified email or Google login.
   - Rate-limit by device or IP.
   - Optionally cap it to the first 14–30 days (a mild reverse-trial element), then keep it weekly.
   - Run a 50/50 test if traffic allows: the metric is "first successful generation within 24 h of signup", then "checkout started".
   - If the daily cost is a concern, keep the 5 one-time credits but apply items 1–3. That alone removes the "can't afford anything" dead end.
5. Optional: grant a bonus Mini clip for completing step one (for example, a prompt from a template). Growth Unhinged lists gamified bonus credits among the tactics that worked.

---

# PART 2: How established publishers maintain dated comparison and deal tables

This part extends `2026-10-03-unlimited-page-strategy-research.md`, which covered our niche's SERP, Google's byline-date guidance and a weekly cadence. Below are publishers outside the niche.

## 2.1 Publisher-by-publisher

| Publisher / page | Active vs expired | Expired items | Per-row date | Page-level date | Changelog | Stated cadence | Automation vs editors | Title date | Source |
|---|---|---|---|---|---|---|---|---|---|
| **NerdWallet**, Best High-Yield Savings | Live list only | Removed from list | **Two-tier stamp**: "APYs shown are current as of September 29, 2026. All other information is current as of September 1, 2026." Partner rows also carry their own "accurate as of 09/24/2026" disclosure | "Last updated on September 29, 2026" + "Fact Checked". JSON-LD datePublished 2019-05-08, dateModified 2026-09-29 | No | Implied by the stamps (rates near-daily, features monthly) | Editors with a published methodology; rates appear feed-driven | **"…of September 2026: Up to 4.21%"** (month + headline figure) | Wayback snapshot 2026-09-29 [1st]; live page Cloudflare-blocked |
| **Bankrate**, Best CD Rates | Live list only | Removed | **Every row: "APY as of 9/30/2026"** (widget) | Editorial note: "APYs shown were updated between Sept. 23 and Sept. 29," validated "regularly" by the editorial team | **Methodology change log** in an accordion: national-average enhancements dated Apr 14, 2025 and Jan 2025, incl. retroactive effects. Also a "Recent news on CD rates" section | "Up to 1,200 banks and credit unions are surveyed weekly" | **Hybrid**: data widget + "Bankrate's editorial team validates this information regularly" + named editor + "Expert verified" reviewer | **"Best CD Rates Of September 2026 – Up to 4.95%"** | Wayback snapshot 2026-09-30 [1st] |
| **Tom's Guide**, Best cheap VPN (evergreen) | Live picks only | Removed or rewritten | No per-row date; prices sit in deal widgets (markup shows Future plc's "hawk" price widget, an automated retailer-price module) | "Last updated 22 September 2026". JSON-LD 2022-10-06 → 2026-09-22 | No | None stated | Named editor + automated price widgets | **Year only**: "The best cheap VPN in 2026" | tomsguide.com/best-picks/cheap-vpn [1st] |
| **Tom's Guide**, single-deal news posts | n/a | **Left live, unmarked**: "Proton VPN's best ever deal ends today" (Dec 8, 2025) still up, dateModified = datePublished | Post date only | Published date | No | — | Editors | Event in title ("ends today") | tomsguide.com/computing/vpns/proton-vpns-best-ever-deal-ends-today… [1st] |
| **The Verge**, deals | Stream of single-deal posts | **Old posts stay unchanged** (Labor Day deal from Aug 31, 2026: modified = published) | Post timestamp | — | No | — | Commerce editors | Event/date in headline | theverge.com/good-deals, /gadgets/986757/… [1st] |
| **Slickdeals** | Live vs "Deal Talk" | Expired deals are **kept but moved** to Deal Talk and labelled expired in search. Users report expiry; the QA team confirms | Post date + community votes | — | Thread history | Continuous | **Crowd report → staff QA confirm** | — | slickdeals.net forum threads, help.slickdeals.net (403) [2nd] |
| **Wirecutter Deals** | Daily deals page | Not verifiable (blocked) | — | — | — | "Updated regularly" | Deals team checks price history (camelcamelcamel/Keepa) to confirm markdowns are real; posted ~1% of 7M Prime Day deals | — | nytimes help center, niemanlab [2nd]; page not fetchable |
| **G2** pricing tab | Vendor-supplied | — | "Pricing information … last updated on [date]", supplied by the vendor or taken from public material | — | No | — | **Vendor-maintained** | — | documentation.g2.com, g2.com snippets [2nd] |
| **CostBench**, SaaS price history | Snapshots over time | **Kept as history** | "Verified on July 16, 2026 from 12 independent sources". Dated snapshot list with old → new | Yes | **Yes: dated change entries** (e.g. top tier $3,750 → $299/mo) | "Re-reads … official pricing page on a rolling oldest-first schedule" | **Automated** snapshots. Refuses to publish trend % because plan renames cause "mostly false positives" | — | costbench.com/software/review-management/g2/price-history [1st] |
| **PricingSaaS** | Current + history | Kept | Quarter timeline | — | History page | "Monitors … pricing page continuously" | Automated | — | pricingsaas.com/companies/g2 [1st] |
| **ComparEdge Price Watch** | — | Kept as log | Each row carries a **human sign-off date** | — | **Public JSON changelog** (636 entries in 30 days to Jul 10, 2026; 120 actual price moves) | Feeds cached 6 h | **Automated detection + human sign-off on every row** | — | mcpservers.org listing (snippet; page 403) [2nd] |
| **Artificial Analysis** | Live models; deprecated workloads noted | Deprecations explained in methodology | Metrics = rolling **P50 over past 72 h** | Dated "Changelog" feed on the homepage ("New language model evaluation · 1 Oct") | **Yes, visible changelog** | **Stated precisely**: 8 times per day for core workloads, daily for parallel, weekly for 100k | Fully automated measurement, editorial methodology | — | artificialanalysis.ai, /methodology/performance-benchmarking [1st] |
| **OpenRouter** model list | Live | Each model record has `deprecation_date` fields | Data-driven | — | — | Real-time | Automated (API-backed) | — | openrouter.ai/models page data [1st] |
| **BudgetPixel AI Generation Price Index** | Live index | — | Competitor comparison rows cite source + **"read 2026-09-10"**: "the rows above are re-read on the date shown" | "Updated Oct 2, 2026". dateModified 2026-10-02T22:50Z | **"Price changes: Recorded automatically … Newest first"** (e.g. "80 → 40 credits Sep 10, 2026") | "Rebuilt from the live billing tables every hour" | Automated (own billing data). Competitor rows re-read manually with dates. JSON/CSV export | Title has no date | budgetpixel.com, budgetpixel.com/data/ai-generation-price-index [1st] |

## 2.2 What the strong pages have in common

1. **Live and expired are separated.** Rate tables (NerdWallet, Bankrate) show only live products and drop the rest. Deal communities (Slickdeals) and price-history sites (CostBench, PricingSaaS, ComparEdge) **keep expired items as labelled history**. Editorial deal posts (Verge, Tom's Guide) leave old posts up, unmarked. That's the weak pattern. None of the strong comparison tables mixes expired rows into the live ranking.
2. **Per-row "as of" dates are standard where the data moves.** Bankrate stamps every row. NerdWallet separates fast-moving fields (rates) from slow ones ("all other information"). BudgetPixel and CostBench date each competitor reading. Evergreen editorial picks (Tom's Guide) have no per-row date.
3. **Page-level date plus a range or named validator.** Bankrate's "updated between Sept 23 and Sept 29" is honest about rolling checks. NerdWallet and Bankrate pair the date with "Fact checked" / "Expert verified" and named editors.
4. **Changelogs** appear on data products (Artificial Analysis, BudgetPixel, CostBench, ComparEdge) and as methodology-change notes (Bankrate), not on editorial "best X" articles.
5. **Stated cadence** appears where the operator is confident in it: Bankrate weekly; Artificial Analysis 8 times per day, daily and weekly; BudgetPixel hourly; CostBench rolling. Editorial deal pages don't state one.
6. **Titles.** Finance rate tables put the **month plus a headline figure** in the title ("…of September 2026: Up to 4.95%") and roll it monthly. Note that on Sept 29–30 they still said September, so they change the month when the month changes, not when a check happens. Evergreen roundups use **year only** ("in 2026"). Data indexes use no date.
7. **Operating model.** Everyone at scale uses **automation for detection plus humans for validation**: the Bankrate widget plus editorial validation, Wirecutter tooling plus a deals team, Slickdeals crowd reports plus staff QA, ComparEdge's sign-off on each row. Fully automated publishing only happens where the data is first-party or measured (BudgetPixel's own billing, Artificial Analysis benchmarks), not where it's read off third-party marketing pages. CostBench's warning that automated diffs of renamed plans give "mostly false positives" applies directly to vendor promo pages.

## 2.3 Evidence on rankings and trust

- **Google, lastmod:** it should reflect "the last significant update to the page". Google uses it only if it is consistently accurate, and main-content, structured-data or link changes count while a copyright-date bump doesn't. developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap [1st]. So a "checked, no change" run should **not** move lastmod or dateModified.
- **Google, AI/automation:** automation is allowed. Generating many pages "without adding value" risks the scaled-content spam policy. Google asks for accuracy checks before publishing and suggests telling readers how automation was used. developers.google.com/search/docs/fundamentals/using-gen-ai-content [1st]. This supports **automation drafts, a human approves, and the methodology says so**.
- **Google, reviews guidance:** cover alternatives, explain what changed versus previous versions, and support claims with evidence and links. A changelog and per-row sources fit this. developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews [1st]
- **Expired items:** Mueller's guidance on permanently expired product pages is to 404 them, or 301 if they have links, and to watch for soft-404s [2nd: SEJ, hobo-web]. That concerns whole URLs. For rows inside a living page, nothing suggests that keeping a labelled "ended" section hurts, and Slickdeals and the price-history sites do exactly that.
- **Date bumping:** an On-Page.ai study (2026, 370 page-one results) found 46% of "recently updated" pages had changed only the date. It also found Google's AI Overviews cited date-bumped pages about as often as genuinely updated ones [2nd, vendor study]. This suggests the benefit of real per-row dates is **user trust**, not a proven ranking signal.
- **No published controlled evidence** that visible changelogs or per-row verification dates improve rankings by themselves. The case for them is trust and E-E-A-T, consistency with Google's date guidance, and what credible publishers do.

## 2.4 Recommendation for /unlimited-seedance-2-5

This confirms the earlier report, with outside evidence and a few additions:

- **Split the tables: yes.** Put "Live now" (buyable today) on top and "Ended offers" collapsed below, kept as labelled history with start and end dates and the reason. This follows the Slickdeals and CostBench pattern. Bankrate and NerdWallet drop ended items entirely, but our searchers specifically want to know whether the Higgsfield, Runway or Artlist deal still exists, so history is content for us.
- **Per-row dates: yes.** Use NerdWallet's two-tier idea: a per-row **"Checked Oct 6"** (the volatile price/window facts), plus a page note such as "Plan features last reviewed Oct 3". Use Bankrate's honest range wording in the header: "Offers re-checked Sep 29 – Oct 6". Each row links to its source, as BudgetPixel and CostBench do.
- **Changelog: yes.** Keep it short, dated and newest-first at the bottom ("Oct 6: Topview Business 7-day added; Higgsfield 33-day moved to Ended"). Only real changes move dateModified, lastmod and the visible "Updated" date. A "no change" week moves only the "Checked" dates.
- **Cadence:** keep the earlier weekly plus event-trigger plan, and **state it on the page** ("We re-check every Monday; launch weeks daily"), as Bankrate and Artificial Analysis do. Add a short methodology box: what counts as "unlimited", sources, who approves, and that a script flags changes.
- **Title:** finance sites roll the month in the title. Do that only if the weekly check is reliable, and change it on the 1st of the month only after a real check. Otherwise use "(2026)".
- **Operating model: a weekly automated check that drafts changes for human approval is reasonable and in line with best practice.** It matches Bankrate (widget plus editorial validation), Slickdeals (reports plus QA) and ComparEdge (detection plus sign-off per row). It's more rigorous than Tom's Guide or Verge deal posts, which never update. Full automation without approval isn't advisable here: the data comes from third-party marketing pages, where CostBench's false-positive warning and Google's accuracy guidance both apply.
- Make the bot's draft a diff per row (old → new, source URL, screenshot or excerpt, detected date). Record the human approval date as the row's "Checked" date. If something can't be verified (login-only, JS-blocked), it stays "unverified this week" rather than auto-expiring.

---

## Sources

Part 1:
- seedance2ai.io/pricing, seedance2ai.io [1st]
- seedance.tv/pricing, seedance.tv [1st]
- seadance.io, seavidgen.com [1st]
- creaa.ai/pricing [1st]
- topview.ai/pricing [1st]
- higgsfield.ai/pricing (browser-rendered) [1st]
- runway.com/pricing [1st]
- pika.art/pricing [1st]
- krea.ai/pricing, krea.ai/docs/user-guide/help-and-support/compute-units [1st]
- suno.com/pricing [1st]
- elevenlabs.io/pricing [1st]
- canva.com/help/article/watermarks-design [1st]
- dreamina.capcut.com/ai-video/free-ai-video-generator-usable-clips-guide-2026 [1st]
- zsky.ai/blog/is-higgsfield-free.html [2nd]
- costbench.com/software/ai-video-generators/hailuo-ai/free-plan [2nd]
- atlascloud.ai/blog/guides/hailuo-ai-free-credits, /kling-ai-free [2nd]
- aireiter.com/blog/kling-ai-free-tier-2026 [2nd]
- coverr.co/blog/free-ai-video-credits-2026-coverr-vs-runway-vs-pollo [2nd]
- pollo.ai/hub/pollo-ai-free-credits (403) [2nd]
- help.runwayml.com/hc/en-us/articles/50404627334547-Free-plan-details (403, snippet) [2nd]
- intercom.help/leonardo-ai/en/articles/9044700 [2nd]
- eesel.ai/blog/pika-ai-pricing, eesel.ai/blog/ideogram-pricing [2nd]
- northflank.com/blog/chatgpt-usage-limits-free-plus-enterprise, propakistani.pk [2nd]
- pcworld.com/article/1677533 [2nd]
- uxstudioteam.com/uxfolio-case-study [1st]
- lennysnewsletter.com/p/what-is-a-good-activation-rate [1st]
- appcues.com/blog/canva-growth-process [1st]
- growthunhinged.com/p/how-to-improve-free-to-paid-conversion [1st]
- amplitude.com/blog/reverse-trial [1st]
- userpilot.com, saasmag.com reverse-trial posts [2nd]

Part 2:
- web.archive.org/web/20260929155416/https://www.nerdwallet.com/banking/best/high-yield-online-savings-accounts [1st via snapshot]
- web.archive.org/web/20260930222134/https://www.bankrate.com/banking/cds/cd-rates/ [1st via snapshot]
- tomsguide.com/best-picks/cheap-vpn; tomsguide.com/computing/vpns/proton-vpns-best-ever-deal-ends-today-this-is-your-last-chance-to-grab-it-for-usd2-49-per-month [1st]
- theverge.com/good-deals; theverge.com/gadgets/986757/the-nex-playground-got-a-60-labor-day-discount [1st]
- slickdeals.net/f/19180369, help.slickdeals.net [2nd]
- nytimes help center (Wirecutter), niemanlab.org [2nd]
- documentation.g2.com/docs/packages-pricing [2nd]
- costbench.com/software/review-management/g2/price-history [1st]
- pricingsaas.com/companies/g2 [1st]
- mcpservers.org/servers/comparedge/price-watch-mcp [2nd]
- artificialanalysis.ai, artificialanalysis.ai/methodology/performance-benchmarking [1st]
- openrouter.ai/models [1st]
- budgetpixel.com, budgetpixel.com/data/ai-generation-price-index [1st]
- developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap [1st]
- developers.google.com/search/docs/fundamentals/using-gen-ai-content [1st]
- developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews [1st]
- searchenginejournal.com, hobo-web.co.uk (Mueller on expired pages) [2nd]
- api.on-page.ai/research/freshness-audit [2nd]
