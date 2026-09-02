# Deploying sajidmk-gate

## 1. Create the KV namespace
```
wrangler kv namespace create GATE_KV
```
Copy the returned `id` into `wrangler.toml`.

## 2. Set secrets (never go in code or wrangler.toml)
```
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```
- `ADMIN_PASSWORD` — the password you'll type into the dashboard login screen.
- `SESSION_SECRET` — any long random string (e.g. `openssl rand -hex 32`). It signs
  session cookies; it is never sent to the browser.

Optional, to get Telegram notifications on new visitors and downloads (reuses
the same @Sajidmkbot bot as sajidmk-reviews):
```
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

## 3. Deploy
```
wrangler deploy
```

## 4. Point a domain at it (recommended)
Uncomment the `[[routes]]` block in `wrangler.toml` (or add a custom domain in
the Cloudflare dashboard) so the worker lives at something like
`gate.sajidmk.com`. This keeps the admin dashboard same-origin with its own
API, so the session cookie works with `SameSite=Strict` and no CORS is needed
for `/admin/*`.

## 5. Update cv-gate.js
In the updated `cv-gate.js`, set:
```js
var GATE_API_BASE = 'https://gate.sajidmk.com';
```
to wherever you deployed the worker.

## 6. Using the dashboard
Visit `https://gate.sajidmk.com/admin`, enter the `ADMIN_PASSWORD` you set in
step 2. The page is not linked from anywhere on the public site and is not
indexed (`noindex` meta tag) — it's only reachable by URL.

## Notes
- Failed logins lock an IP out for 15 minutes after 5 attempts.
- Sessions last 12 hours (`SESSION_TTL_MS` in worker.js).
- `/submit` and `/event` only accept requests from `ALLOWED_ORIGIN` (CORS) —
  update that var in `wrangler.toml` if the site's domain changes.
- Visitor tracking is only as good as the browser: private browsing, ad
  blockers, or JS-disabled visitors won't be captured. That's a limitation of
  any client-side gate, not something this backend can fix.
