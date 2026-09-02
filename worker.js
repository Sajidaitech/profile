/* ================================================================
   sajidmk-gate — Cloudflare Worker
   ----------------------------------------------------------------
   Backend for the CV/Certificate visitor gate on sajidmk.com.

   Endpoints:
     POST /submit          visitor info from the gate form (public,
                            CORS-restricted to ALLOWED_ORIGIN)
     POST /event            view/download activity event   (same)
     GET  /admin             the admin dashboard page (HTML)
     POST /admin/login       password check -> HttpOnly session cookie
     POST /admin/logout       clears the session cookie
     GET  /admin/api/data    visitor + event data, requires session

   Storage: Cloudflare KV (binding: GATE_KV)
     visitor:<visitorId>  -> JSON { id, name, company, purpose,
                                    submittedAt, ip, userAgent }
     event:<eventId>      -> JSON { id, visitorId, type, certName,
                                    startedAt, endedAt, durationMs,
                                    device, timestamp, visitorName,
                                    visitorCompany,
                                    visitorPurpose }

   Secrets (set with `wrangler secret put <NAME>`):
     ADMIN_PASSWORD        the dashboard login password
     SESSION_SECRET        random long string, signs session cookies
     TELEGRAM_BOT_TOKEN    optional — reuses the @Sajidmkbot bot
     TELEGRAM_CHAT_ID      optional

   Vars (wrangler.toml [vars]):
     ALLOWED_ORIGIN         e.g. https://www.sajidmk.com

   IMPORTANT: the admin password lives ONLY as a Worker secret. It is
   never sent to, stored in, or checked by any frontend JavaScript —
   the dashboard page just POSTs whatever was typed to /admin/login
   and the Worker decides yes/no. Sessions are HttpOnly cookies the
   page's own JS cannot read either.
================================================================= */

const SESSION_COOKIE = 'gate_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const LOGIN_FAIL_LIMIT = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (request.method === 'OPTIONS') {
        return corsPreflight(request, env);
      }

      if (url.pathname === '/submit' && request.method === 'POST') {
        return withCors(await handleSubmit(request, env), request, env);
      }

      if (url.pathname === '/event' && request.method === 'POST') {
        return withCors(await handleEvent(request, env), request, env);
      }

      if (url.pathname === '/admin' && request.method === 'GET') {
        return new Response(ADMIN_HTML, {
          headers: { 'content-type': 'text/html; charset=UTF-8' }
        });
      }

      if (url.pathname === '/admin/login' && request.method === 'POST') {
        return handleAdminLogin(request, env);
      }

      if (url.pathname === '/admin/logout' && request.method === 'POST') {
        return handleAdminLogout();
      }

      if (url.pathname === '/admin/api/data' && request.method === 'GET') {
        return handleAdminData(request, env);
      }

      return json({ ok: false, error: 'Not found' }, 404);
    } catch (err) {
      return json({ ok: false, error: 'Server error' }, 500);
    }
  }
};

/* ---------------------------------------------------------------
   Public ingestion endpoints (gate form + activity tracking)
--------------------------------------------------------------- */

async function handleSubmit(request, env) {
  const body = await safeJson(request);
  if (!body || !body.visitorId || !body.name || !body.purpose) {
    return json({ ok: false, error: 'Missing required fields' }, 400);
  }

  const record = {
    id: body.visitorId,
    name: String(body.name).slice(0, 200),
    company: body.company ? String(body.company).slice(0, 200) : '',
    purpose: String(body.purpose).slice(0, 50),
    submittedAt: new Date().toISOString(),
    ip: request.headers.get('CF-Connecting-IP') || '',
    userAgent: request.headers.get('User-Agent') || ''
  };

  await env.GATE_KV.put('visitor:' + record.id, JSON.stringify(record));

  await notifyTelegram(env,
    `🆕 <b>New gate visitor</b>\n` +
    `👤 ${escapeHtml(record.name)}${record.company ? ' — ' + escapeHtml(record.company) : ''}\n` +
    `🎯 ${escapeHtml(record.purpose)}`
  );

  return json({ ok: true });
}

async function handleEvent(request, env) {
  const body = await safeJson(request);
  if (!body || !body.id || !body.visitorId || !body.type) {
    return json({ ok: false, error: 'Missing required fields' }, 400);
  }

  // Client always sends the full current state of the event; a second
  // call with the same id (e.g. when a view ends) simply overwrites it.
  const record = {
    id: String(body.id).slice(0, 100),
    visitorId: String(body.visitorId).slice(0, 100),
    visitorName: body.visitorName || null,
    visitorCompany: body.visitorCompany || null,
    visitorPurpose: body.visitorPurpose || null,
    type: String(body.type).slice(0, 30),
    certName: body.certName || null,
    startedAt: body.startedAt || null,
    endedAt: body.endedAt || null,
    durationMs: typeof body.durationMs === 'number' ? body.durationMs : null,
    device: body.device || 'Unknown',
    timestamp: body.timestamp || new Date().toISOString()
  };

  await env.GATE_KV.put('event:' + record.id, JSON.stringify(record));

  const isDownload = record.type === 'cv_download' || record.type === 'cert_download';
  const isViewStart = (record.type === 'cv_view' || record.type === 'cert_view') && !record.endedAt;

  if (isDownload) {
    const what = record.type === 'cv_download' ? 'CV' : ('Certificate' + (record.certName ? ' (' + record.certName + ')' : ''));
    await notifyTelegram(env,
      `📥 <b>Download</b>\n` +
      `👤 ${escapeHtml(record.visitorName || 'Unknown')}${record.visitorCompany ? ' — ' + escapeHtml(record.visitorCompany) : ''}\n` +
      `📄 ${escapeHtml(what)}`
    );
  } else if (isViewStart) {
    // Fired once, on the initial "opened the modal" call — not again when
    // the view closes and this same event id is updated with a duration.
    // A live "someone's looking right now" ping is more useful than a
    // duration-only summary after the fact, and avoids a second message
    // per view.
    const what = record.type === 'cv_view' ? 'CV' : ('a certificate' + (record.certName ? ' (' + record.certName + ')' : ''));
    await notifyTelegram(env,
      `👀 <b>Viewing now</b>\n` +
      `👤 ${escapeHtml(record.visitorName || 'Unknown')}${record.visitorCompany ? ' — ' + escapeHtml(record.visitorCompany) : ''}\n` +
      `📄 Opened ${escapeHtml(what)}\n` +
      `💻 ${escapeHtml(record.device)}`
    );
  }

  return json({ ok: true });
}

/* ---------------------------------------------------------------
   Admin auth
--------------------------------------------------------------- */

async function handleAdminLogin(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const lockKey = 'loginlock:' + ip;

  if (await env.GATE_KV.get(lockKey)) {
    return json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' }, 429);
  }

  const body = await safeJson(request);
  const password = (body && body.password) || '';

  if (!env.ADMIN_PASSWORD || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    const failKey = 'loginfail:' + ip;
    const fails = (parseInt(await env.GATE_KV.get(failKey), 10) || 0) + 1;
    if (fails >= LOGIN_FAIL_LIMIT) {
      await env.GATE_KV.put(lockKey, '1', { expirationTtl: LOGIN_LOCK_SECONDS });
      await env.GATE_KV.delete(failKey);
    } else {
      await env.GATE_KV.put(failKey, String(fails), { expirationTtl: LOGIN_LOCK_SECONDS });
    }
    return json({ ok: false, error: 'Invalid password' }, 401);
  }

  await env.GATE_KV.delete('loginfail:' + ip);

  const token = await makeSessionToken(env);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`
  );
  return new Response(JSON.stringify({ ok: true }), { headers });
}

function handleAdminLogout() {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
  return new Response(JSON.stringify({ ok: true }), { headers });
}

async function handleAdminData(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!(await verifySessionToken(token, env))) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const visitors = await listAll(env, 'visitor:');
  const events = await listAll(env, 'event:');

  return json({ ok: true, visitors, events });
}

async function listAll(env, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await env.GATE_KV.list({ prefix, cursor });
    for (const key of page.keys) {
      const val = await env.GATE_KV.get(key.name);
      if (val) {
        try { out.push(JSON.parse(val)); } catch (e) { /* skip corrupt entry */ }
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

/* ---------------------------------------------------------------
   Session tokens: HMAC-signed, not encrypted — payload is just an
   expiry, no user data — so no need to keep it secret, only
   unforgeable. Verified by recomputing the signature.
--------------------------------------------------------------- */

async function makeSessionToken(env) {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmacSign('admin.' + exp, env.SESSION_SECRET);
  return `admin.${exp}.${sig}`;
}

async function verifySessionToken(token, env) {
  if (!token || !env.SESSION_SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const exp = parseInt(parts[1], 10);
  if (!exp || Date.now() > exp) return false;
  const expected = await hmacSign('admin.' + parts[1], env.SESSION_SECRET);
  return timingSafeEqual(parts[2], expected);
}

async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64Url(sig);
}

function toBase64Url(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ---------------------------------------------------------------
   Helpers
--------------------------------------------------------------- */

async function safeJson(request) {
  try { return await request.json(); } catch (e) { return null; }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function notifyTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
    });
    // A failed Telegram send (bad chat id, bad token, malformed HTML, the
    // bot never having received a /start from that chat, etc.) must not
    // break visitor ingestion — but it should never fail *silently* either,
    // or there's no way to tell "not configured" apart from "misconfigured".
    // Log it so `wrangler tail` shows the real reason.
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('Telegram sendMessage failed', res.status, body);
    }
  } catch (e) {
    console.error('Telegram sendMessage threw', e && e.message ? e.message : e);
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = origin === env.ALLOWED_ORIGIN ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function corsPreflight(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);
  for (const k in cors) headers.set(k, cors[k]);
  return new Response(response.body, { status: response.status, headers });
}

/* ---------------------------------------------------------------
   Admin dashboard (single self-contained HTML page)
--------------------------------------------------------------- */

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gate Dashboard</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root {
    --gold: #d4a840;
    --bg: #0a0e1c;
    --card: rgba(255,255,255,.04);
    --border: rgba(255,255,255,.12);
    --text: rgba(255,255,255,.92);
    --muted: rgba(255,255,255,.5);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at 20% 0%, #131a30 0%, var(--bg) 60%);
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    color: var(--text);
  }

  /* ── Login screen: 3D glass panel over floating color blobs ─────── */
  #loginScreen {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow: hidden;
    perspective: 1400px;
  }
  .login-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: .55;
    pointer-events: none;
    animation: orbFloat 16s ease-in-out infinite;
  }
  .login-orb.o1 { width: 420px; height: 420px; top: -140px; left: -100px; background: radial-gradient(circle, #d4a840, transparent 70%); animation-duration: 18s; }
  .login-orb.o2 { width: 380px; height: 380px; bottom: -160px; right: -90px; background: radial-gradient(circle, #3b5bdb, transparent 70%); animation-duration: 22s; animation-delay: -6s; }
  .login-orb.o3 { width: 300px; height: 300px; bottom: 10%; left: 8%; background: radial-gradient(circle, #7a3fd1, transparent 70%); opacity: .35; animation-duration: 20s; animation-delay: -11s; }
  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -24px) scale(1.08); }
  }

  .login-card {
    position: relative;
    width: 100%;
    max-width: 380px;
    border-radius: 26px;
    padding: 40px 32px 32px;
    background: linear-gradient(155deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.05) 40%, rgba(255,255,255,.02) 100%);
    border: 1px solid rgba(255,255,255,.22);
    backdrop-filter: blur(26px) saturate(180%);
    -webkit-backdrop-filter: blur(26px) saturate(180%);
    box-shadow:
      0 30px 70px rgba(0,0,0,.45),
      0 8px 24px rgba(0,0,0,.3),
      inset 0 1.5px 0 rgba(255,255,255,.5),
      inset 0 -1px 0 rgba(0,0,0,.25);
    transform: perspective(1400px) rotateX(0deg) rotateY(0deg);
    transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease;
    will-change: transform;
  }
  /* diagonal specular sheen, like light catching the edge of glass */
  .login-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(120deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,.12) 100%);
    pointer-events: none;
    mix-blend-mode: overlay;
  }
  /* thin bright rim to sell the glass edge */
  .login-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(155deg, rgba(255,255,255,.65), rgba(255,255,255,0) 35%, rgba(255,255,255,0) 65%, rgba(255,255,255,.25));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .login-card > * { position: relative; z-index: 1; }

  .login-card h1 {
    font-size: 21px;
    margin: 0 0 6px;
    text-shadow: 0 1px 12px rgba(0,0,0,.3);
  }
  .login-card p { color: var(--muted); font-size: 13px; margin: 0 0 22px; }
  input[type=password] {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.07);
    backdrop-filter: blur(6px);
    color: var(--text);
    padding: 0 15px;
    font-size: 14px;
    outline: none;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }
  input[type=password]:focus {
    border-color: rgba(212,168,64,.7);
    background: rgba(255,255,255,.1);
    box-shadow: 0 0 0 3px rgba(212,168,64,.15);
  }
  button {
    cursor: pointer;
    border: none;
    font-family: inherit;
  }
  .btn-primary {
    margin-top: 16px;
    width: 100%;
    height: 46px;
    border-radius: 12px;
    background: linear-gradient(135deg, #7a5010, #c48a1a 55%, #d4a840);
    color: #fff;
    font-weight: 700;
    letter-spacing: .04em;
    font-size: 13px;
    text-transform: uppercase;
    box-shadow: 0 8px 22px rgba(196,140,30,.35);
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(196,140,30,.45); }
  .btn-primary:active { transform: translateY(0); }
  #loginError { color: #ff8f89; font-size: 12.5px; min-height: 16px; margin-top: 10px; }

  @media (prefers-reduced-motion: reduce) {
    .login-orb { animation: none; }
    .login-card { transition: none; }
  }


  #dashboard { display: none; padding: 24px 20px 60px; max-width: 1100px; margin: 0 auto; }
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .dash-header h1 { font-size: 22px; margin: 0; }
  .dash-header .sub { color: var(--muted); font-size: 13px; }
  .btn-ghost {
    background: rgba(255,255,255,.06);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12.5px;
  }
  .controls { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  #searchInput {
    flex: 1 1 220px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.05);
    color: var(--text);
    padding: 0 14px;
    font-size: 13.5px;
    outline: none;
  }
  select#purposeFilter {
    height: 42px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.05);
    color: var(--text);
    padding: 0 10px;
    font-size: 13.5px;
  }
  .stats { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .stat {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    min-width: 110px;
  }
  .stat .num { font-size: 20px; font-weight: 700; color: var(--gold); }
  .stat .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }

  .visit-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 12px;
  }
  .visit-card .row1 {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .visit-card .name { font-weight: 700; font-size: 15px; }
  .visit-card .company { color: var(--muted); font-weight: 400; }
  .visit-card .time { color: var(--muted); font-size: 12.5px; white-space: nowrap; }
  .visit-card .line { font-size: 13px; color: rgba(255,255,255,.82); margin: 3px 0; }
  .visit-card .badges { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
  .badge {
    font-size: 11px;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(212,168,64,.14);
    border: 1px solid rgba(212,168,64,.35);
    color: var(--gold);
  }
  .badge.muted { background: rgba(255,255,255,.06); border-color: var(--border); color: var(--muted); }
  #emptyState { color: var(--muted); text-align: center; padding: 40px 0; font-size: 14px; }
</style>
</head>
<body>

<div id="loginScreen">
  <div class="login-orb o1"></div>
  <div class="login-orb o2"></div>
  <div class="login-orb o3"></div>
  <div class="login-card" id="loginCard">
    <h1>Gate Dashboard</h1>
    <p>Sign in to view visitor and activity data.</p>
    <input type="password" id="passwordInput" placeholder="Password" autocomplete="current-password">
    <button class="btn-primary" id="loginBtn">Sign in</button>
    <div id="loginError"></div>
  </div>
</div>

<div id="dashboard">
  <div class="dash-header">
    <div>
      <h1>Visitor Gate</h1>
      <div class="sub">CV &amp; certificate access log</div>
    </div>
    <button class="btn-ghost" id="logoutBtn">Log out</button>
  </div>

  <div class="stats" id="statsRow"></div>

  <div class="controls">
    <input id="searchInput" type="text" placeholder="Search by name or company\u2026">
    <select id="purposeFilter">
      <option value="">All purposes</option>
      <option value="Recruitment">Recruitment</option>
      <option value="Verification">Verification</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <div id="results"></div>
  <div id="emptyState" style="display:none;">No visits match your filters.</div>
</div>

<script>
(function () {
  'use strict';

  var loginScreen = document.getElementById('loginScreen');
  var dashboard = document.getElementById('dashboard');
  var passwordInput = document.getElementById('passwordInput');
  var loginBtn = document.getElementById('loginBtn');
  var loginError = document.getElementById('loginError');
  var logoutBtn = document.getElementById('logoutBtn');
  var searchInput = document.getElementById('searchInput');
  var purposeFilter = document.getElementById('purposeFilter');
  var resultsEl = document.getElementById('results');
  var emptyEl = document.getElementById('emptyState');
  var statsRow = document.getElementById('statsRow');
  var loginCard = document.getElementById('loginCard');

  var visits = []; // aggregated per-visitor records

  // ── 3D glass tilt: card leans gently toward the cursor ───────────
  (function initTilt() {
    if (!loginCard) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    var maxTilt = 9; // degrees

    loginScreen.addEventListener('pointermove', function (e) {
      var rect = loginCard.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      var rotateY = dx * maxTilt;
      var rotateX = -dy * maxTilt;
      loginCard.style.transform =
        'perspective(1400px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
    });

    loginScreen.addEventListener('pointerleave', function () {
      loginCard.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
    });
  })();

  function showDashboard(skipLoad) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    if (!skipLoad) loadData();
  }

  function showLogin(message) {
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
    loginError.textContent = message || '';
  }

  loginBtn.addEventListener('click', doLogin);
  passwordInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });

  function doLogin() {
    var pw = passwordInput.value;
    if (!pw) return;
    loginError.textContent = '';
    fetch('/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    }).then(function (r) { return r.json().then(function (d) { return { status: r.status, body: d }; }); })
      .then(function (res) {
        if (res.body && res.body.ok) {
          passwordInput.value = '';
          showDashboard();
        } else {
          loginError.textContent = (res.body && res.body.error) || 'Login failed';
        }
      })
      .catch(function () { loginError.textContent = 'Network error'; });
  }

  logoutBtn.addEventListener('click', function () {
    fetch('/admin/logout', { method: 'POST', credentials: 'include' }).then(function () { showLogin(); });
  });

  function loadData() {
    resultsEl.innerHTML = '<div id="emptyState">Loading\u2026</div>';
    fetch('/admin/api/data', { credentials: 'include' })
      .then(function (r) {
        if (r.status === 401) { showLogin('Session expired \u2014 please sign in again.'); return null; }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        if (!data.ok) { resultsEl.innerHTML = ''; emptyEl.style.display = 'block'; emptyEl.textContent = 'Could not load data.'; return; }
        visits = aggregate(data.visitors || [], data.events || []);
        render();
      })
      .catch(function () { resultsEl.innerHTML = ''; emptyEl.style.display = 'block'; emptyEl.textContent = 'Network error.'; });
  }

  function aggregate(visitors, events) {
    var byVisitor = {};
    visitors.forEach(function (v) { byVisitor[v.id] = { visitor: v, events: [] }; });
    events.forEach(function (e) {
      if (!byVisitor[e.visitorId]) {
        byVisitor[e.visitorId] = {
          visitor: {
            id: e.visitorId,
            name: e.visitorName || 'Unknown',
            company: e.visitorCompany || '',
            purpose: e.visitorPurpose || '',
            submittedAt: e.timestamp
          },
          events: []
        };
      }
      byVisitor[e.visitorId].events.push(e);
    });

    return Object.keys(byVisitor).map(function (id) {
      var v = byVisitor[id].visitor;
      var evs = byVisitor[id].events;
      var cvViewed = false, cvDownloaded = false, certViewed = false, certDownloaded = false;
      var certNames = {};
      var totalDurationMs = 0;
      var device = null;
      var lastActivityAt = v.submittedAt;

      evs.forEach(function (e) {
        if (e.type === 'cv_view') cvViewed = true;
        if (e.type === 'cv_download') cvDownloaded = true;
        if (e.type === 'cert_view') { certViewed = true; if (e.certName) certNames[e.certName] = true; }
        if (e.type === 'cert_download') { certDownloaded = true; if (e.certName) certNames[e.certName] = true; }
        if (typeof e.durationMs === 'number') totalDurationMs += e.durationMs;
        if (e.device) device = e.device;
        if (e.timestamp && (!lastActivityAt || e.timestamp > lastActivityAt)) lastActivityAt = e.timestamp;
      });

      return {
        id: id,
        name: v.name || 'Unknown',
        company: v.company || '',
        purpose: v.purpose || '',
        submittedAt: v.submittedAt,
        lastActivityAt: lastActivityAt,
        cvViewed: cvViewed, cvDownloaded: cvDownloaded,
        certViewed: certViewed, certDownloaded: certDownloaded,
        certNames: Object.keys(certNames),
        totalDurationMs: totalDurationMs,
        device: device || 'Unknown'
      };
    }).sort(function (a, b) { return (b.lastActivityAt || '').localeCompare(a.lastActivityAt || ''); });
  }

  function fmtDate(iso) {
    if (!iso) return '\u2014';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function fmtDuration(ms) {
    if (!ms || ms <= 0) return '\u2014';
    var mins = Math.round(ms / 60000);
    if (mins < 1) return '<1 min';
    return mins + ' min';
  }

  function render() {
    var q = searchInput.value.trim().toLowerCase();
    var purpose = purposeFilter.value;

    var filtered = visits.filter(function (v) {
      var matchesQ = !q || (v.name + ' ' + v.company).toLowerCase().indexOf(q) !== -1;
      var matchesPurpose = !purpose || v.purpose === purpose;
      return matchesQ && matchesPurpose;
    });

    statsRow.innerHTML =
      stat(visits.length, 'Visitors') +
      stat(visits.filter(function (v) { return v.cvDownloaded; }).length, 'CV Downloads') +
      stat(visits.filter(function (v) { return v.certDownloaded; }).length, 'Cert Downloads');

    if (!filtered.length) {
      resultsEl.innerHTML = '';
      emptyEl.style.display = 'block';
      emptyEl.textContent = visits.length ? 'No visits match your filters.' : 'No visits recorded yet.';
      return;
    }
    emptyEl.style.display = 'none';
    resultsEl.innerHTML = filtered.map(renderCard).join('');
  }

  function stat(num, label) {
    return '<div class="stat"><div class="num">' + num + '</div><div class="label">' + label + '</div></div>';
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCard(v) {
    var viewedParts = [];
    if (v.cvViewed) viewedParts.push('CV');
    if (v.certViewed) viewedParts.push('Certificate' + (v.certNames.length ? ' (' + v.certNames.map(esc).join(', ') + ')' : ''));
    var viewedText = viewedParts.length ? viewedParts.join(' + ') : 'None recorded';

    var badges = [];
    badges.push('<span class="badge' + (v.cvDownloaded ? '' : ' muted') + '">CV ' + (v.cvDownloaded ? 'downloaded' : 'not downloaded') + '</span>');
    badges.push('<span class="badge' + (v.certDownloaded ? '' : ' muted') + '">Certificate ' + (v.certDownloaded ? 'downloaded' : 'not downloaded') + '</span>');
    if (v.purpose) badges.push('<span class="badge muted">' + esc(v.purpose) + '</span>');

    return (
      '<div class="visit-card">' +
        '<div class="row1">' +
          '<div class="name">' + esc(v.name) + (v.company ? '<span class="company"> \u2014 ' + esc(v.company) + '</span>' : '') + '</div>' +
          '<div class="time">\uD83D\uDD50 ' + fmtDate(v.submittedAt) + '</div>' +
        '</div>' +
        '<div class="line">\uD83D\uDCC4 Viewed: ' + esc(viewedText) + '</div>' +
        '<div class="line">\u23F1\uFE0F Time: ' + fmtDuration(v.totalDurationMs) + '</div>' +
        '<div class="line">\uD83D\uDCBB Device: ' + esc(v.device) + '</div>' +
        '<div class="badges">' + badges.join('') + '</div>' +
      '</div>'
    );
  }

  searchInput.addEventListener('input', render);
  purposeFilter.addEventListener('change', render);

  // Probe whether a session already exists.
  fetch('/admin/api/data', { credentials: 'include' }).then(function (r) {
    if (r.status === 401) { showLogin(); return; }
    return r.json().then(function (data) {
      if (data && data.ok) {
        visits = aggregate(data.visitors || [], data.events || []);
        showDashboard(true);
        render();
      } else {
        showLogin();
      }
    });
  }).catch(function () { showLogin(); });
})();
</script>
</body>
</html>`;
