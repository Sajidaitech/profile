// ============================================================
// SAJID MEHMOOD PORTFOLIO · Visitor Analytics Engine
// analytics.js — Production v1.0
// ============================================================
// ⚙️  CONFIGURATION — fill in your real values below
// ============================================================

const ANALYTICS_CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  supabaseUrl:  'https://tbdgrhekycgfdeatxjnq.supabase.co',          // e.g. https://xxxx.supabase.co
  supabaseKey:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU',     // publishable anon key

  // ── Telegram alerts (optional) ────────────────────────────
  telegramEnabled:  false,                    // set true to enable
  telegramBotToken: 'YOUR_BOT_TOKEN',         // from @BotFather
  telegramChatId:   'YOUR_CHAT_ID',           // your chat / group ID

  // ── GCC recruiter detection ───────────────────────────────
  gccCountries: ['Qatar', 'UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman'],

  // ── Heartbeat interval (ms) ───────────────────────────────
  heartbeatInterval: 30_000,  // 30 s — keeps online count fresh

  // ── Session duration flush interval (ms) ─────────────────
  durationFlushInterval: 60_000, // 1 min
};

// ============================================================
// BOOTSTRAP
// ============================================================

(function () {
  'use strict';

  // Load Supabase from CDN, call cb(client) when ready
  function loadSupabase(cb) {
    if (window.__supabaseClient) { cb(window.__supabaseClient); return; }
    if (window.__supabaseLoading) {
      // Already loading — queue the callback
      window.__supabaseCbs = window.__supabaseCbs || [];
      window.__supabaseCbs.push(cb);
      return;
    }
    window.__supabaseLoading = true;
    window.__supabaseCbs = [cb];
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = function () {
      window.__supabaseClient = window.supabase.createClient(
        ANALYTICS_CONFIG.supabaseUrl,
        ANALYTICS_CONFIG.supabaseKey,
        { realtime: { params: { eventsPerSecond: 10 } }, auth: { persistSession: false } }
      );
      window.__supabaseLoading = false;
      (window.__supabaseCbs || []).forEach(function(fn) { fn(window.__supabaseClient); });
    };
    s.onerror = function () { console.warn('[Analytics] Supabase CDN load failed'); };
    document.head.appendChild(s);
  }

  // Step 1: Fetch & display counts IMMEDIATELY (even before gate interaction)
  function quickCountFetch() {
    loadSupabase(async function(db) {
      try {
        const [{ data: total }, { data: online }] = await Promise.all([
          db.rpc('get_visitor_count'),
          db.rpc('get_online_count'),
        ]);
        const t = total  || 0;
        const o = online || 0;
        // Update all counter elements right away
        ['gate-total-count','footer-total-count','smk-total-count'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) el.textContent = t.toLocaleString();
        });
        ['gate-online-count','footer-online-count','smk-online-count'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) el.textContent = o.toLocaleString();
        });
        // Pulse dots
        ['gate-online-dot'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) el.className = 'gvs-dot' + (o > 0 ? ' gvs-dot--live' : '');
        });
        ['footer-online-dot'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) el.className = 'fvb-dot' + (o > 0 ? ' fvb-dot--live' : '');
        });
      } catch(e) {
        console.warn('[Analytics] Quick count failed:', e.message);
      }
    });
  }

  // Step 2: Full analytics (tracking, realtime, heartbeat) after DOM ready
  function boot() {
    quickCountFetch();            // show numbers immediately
    loadSupabase(startAnalytics); // full tracking in parallel
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


// ============================================================
// SESSION HELPERS
// ============================================================

/**
 * Returns a stable session ID for this browser tab.
 * Uses sessionStorage so a refresh counts as the SAME session
 * but a new tab / new browser starts fresh.
 */
function getSessionId() {
  const KEY = 'smk_sid';
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

/**
 * Returns true if this visitor has been here before (across sessions).
 * Uses localStorage — persists across tabs/restarts.
 */
function isReturningVisitor() {
  const KEY = 'smk_visited';
  const seen = !!localStorage.getItem(KEY);
  if (!seen) localStorage.setItem(KEY, '1');
  return seen;
}

/**
 * Returns true if we already tracked this session in Supabase.
 * Prevents double-inserts on HMR / React StrictMode / fast refresh.
 */
function alreadyTracked() {
  const KEY = 'smk_tracked_' + getSessionId();
  if (sessionStorage.getItem(KEY)) return true;
  sessionStorage.setItem(KEY, '1');
  return false;
}


// ============================================================
// VISITOR DETECTION
// ============================================================

/** Detect OS from userAgent */
function detectOS(ua) {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT/.test(ua))    return 'Windows';
  if (/Mac OS X/.test(ua))      return 'macOS';
  if (/Android/.test(ua))       return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Linux/.test(ua))         return 'Linux';
  if (/CrOS/.test(ua))          return 'ChromeOS';
  return 'Unknown OS';
}

/** Detect browser from userAgent */
function detectBrowser(ua) {
  if (/Edg\//.test(ua))     return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Samsung/.test(ua))   return 'Samsung Browser';
  if (/Chrome/.test(ua))    return 'Chrome';
  if (/Firefox/.test(ua))   return 'Firefox';
  if (/Safari/.test(ua))    return 'Safari';
  if (/MSIE|Trident/.test(ua)) return 'IE';
  return 'Unknown Browser';
}

/** Detect device type */
function detectDevice(ua) {
  if (/iPad/.test(ua))    return 'Tablet';
  if (/tablet/i.test(ua)) return 'Tablet';
  if (/mobile/i.test(ua) || /iPhone|Android.*Mobile/.test(ua)) return 'Mobile';
  return 'Desktop';
}

/** Classify referral source with rich labels */
function detectSource(referrer) {
  if (!referrer) return 'Direct';
  try {
    const host = new URL(referrer).hostname.replace('www.', '');
    if (host.includes('linkedin'))    return 'LinkedIn';
    if (host.includes('whatsapp'))    return 'WhatsApp';
    if (host.includes('instagram'))   return 'Instagram';
    if (host.includes('facebook'))    return 'Facebook';
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X';
    if (host.includes('google'))      return 'Google';
    if (host.includes('github'))      return 'GitHub';
    if (host.includes('telegram'))    return 'Telegram';
    if (host.includes('indeed'))      return 'Indeed';
    if (host.includes('naukrigulf') || host.includes('bayt') || host.includes('gulftalent')) return 'Gulf Job Board';
    return host;  // fallback: the domain itself
  } catch { return 'Direct'; }
}

/** Fetch geo info via ipapi.co (free, no key needed up to 1k/day) */
async function fetchGeoData() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('geo fail');
    return await res.json();
  } catch {
    // Silent fallback — we still track without geo
    return { country_name: 'Unknown', city: 'Unknown' };
  }
}


// ============================================================
// MAIN ANALYTICS ENGINE
// ============================================================

let _db      = null;   // Supabase client
let _session = null;   // Current session record
let _startTs = Date.now();

async function startAnalytics(db) {
  _db = db;

  // ── Build session object ──────────────────────────────────
  const ua       = navigator.userAgent;
  const sessionId = getSessionId();
  const returning = isReturningVisitor();

  const [geo] = await Promise.all([fetchGeoData()]);

  _session = {
    session_id:   sessionId,
    country:      geo.country_name || 'Unknown',
    city:         geo.city         || 'Unknown',
    device:       detectDevice(ua),
    browser:      detectBrowser(ua),
    os:           detectOS(ua),
    source:       detectSource(document.referrer),
    is_returning: returning,
    is_online:    true,
    page_views:   1,
  };

  // ── Insert visitor row (once per session) ─────────────────
  if (!alreadyTracked()) {
    await insertVisitor(_session);
    await sendTelegramAlert(_session);
  }

  // ── Register online presence ──────────────────────────────
  await heartbeat(db, sessionId, _session.country, _session.device);

  // ── Start live counter UI ─────────────────────────────────
  await refreshCounters(db);
  startRealtimeSubscription(db);

  // ── Periodic heartbeat ────────────────────────────────────
  setInterval(() => heartbeat(db, sessionId, _session.country, _session.device),
              ANALYTICS_CONFIG.heartbeatInterval);

  // ── Flush session duration periodically ──────────────────
  setInterval(() => flushDuration(db, sessionId), ANALYTICS_CONFIG.durationFlushInterval);

  // ── Cleanup on page unload ────────────────────────────────
  window.addEventListener('pagehide', () => {
    flushDuration(db, sessionId);
    navigator.sendBeacon(
      `${ANALYTICS_CONFIG.supabaseUrl}/rest/v1/rpc/remove_online_session`,
      JSON.stringify({ p_session_id: sessionId })
    );
  });
}

/** Insert a new visitor row into Supabase */
async function insertVisitor(session) {
  const { error } = await _db.from('visitors').insert([session]);
  if (error) console.warn('[Analytics] Insert error:', error.message);
}

/** Upsert heartbeat via RPC */
async function heartbeat(db, sessionId, country, device) {
  await db.rpc('upsert_online_session', {
    p_session_id: sessionId,
    p_country:    country,
    p_device:     device,
    p_page:       window.location.pathname,
  }).catch(() => {});
}

/** Flush accumulated session duration to Supabase */
async function flushDuration(db, sessionId) {
  const duration = Math.floor((Date.now() - _startTs) / 1000);
  await db.from('visitors')
    .update({ duration, is_online: true })
    .eq('session_id', sessionId)
    .catch(() => {});
}

/** Fetch total & online counts and update ALL counter elements on the page */
async function refreshCounters(db) {
  try {
    const [{ data: total }, { data: online }] = await Promise.all([
      db.rpc('get_visitor_count'),
      db.rpc('get_online_count'),
    ]);

    const t = total  || 0;
    const o = online || 0;

    // Floating widget
    animateCount('smk-total-count',  t);
    animateCount('smk-online-count', o);
    updatePulse(o);

    // Gate overlay strip
    animateCount('gate-total-count',  t);
    animateCount('gate-online-count', o);
    const gateDot = document.getElementById('gate-online-dot');
    if (gateDot) gateDot.className = 'gvs-dot' + (o > 0 ? ' gvs-dot--live' : '');

    // Footer badge
    animateCount('footer-total-count',  t);
    animateCount('footer-online-count', o);
    const footerDot = document.getElementById('footer-online-dot');
    if (footerDot) footerDot.className = 'fvb-dot' + (o > 0 ? ' fvb-dot--live' : '');

  } catch (e) {
    console.warn('[Analytics] Counter refresh failed:', e.message);
  }
}

/** Subscribe to realtime changes for live updates */
function startRealtimeSubscription(db) {
  db.channel('analytics-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, () => {
      refreshCounters(db);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'online_visitors' }, () => {
      refreshCounters(db);
    })
    .subscribe();
}


// ============================================================
// TELEGRAM ALERTS
// ============================================================

async function sendTelegramAlert(session) {
  if (!ANALYTICS_CONFIG.telegramEnabled) return;

  const isGCC = ANALYTICS_CONFIG.gccCountries.includes(session.country);
  const flag  = isGCC ? '🚨 GCC RECRUITER ALERT!\n\n' : '';

  const msg = `${flag}📊 *New Portfolio Visitor*\n\n` +
    `🌍 *Location:* ${session.city}, ${session.country}\n` +
    `📱 *Device:* ${session.device} · ${session.browser} on ${session.os}\n` +
    `🔗 *Source:* ${session.source}\n` +
    `↩️ *Returning:* ${session.is_returning ? 'Yes' : 'No'}\n` +
    `🕒 *Time:* ${new Date().toUTCString()}\n` +
    `🌐 *Site:* https://sajidmk.com`;

  try {
    await fetch(
      `https://api.telegram.org/bot${ANALYTICS_CONFIG.telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    ANALYTICS_CONFIG.telegramChatId,
          text:       msg,
          parse_mode: 'Markdown',
        }),
      }
    );
  } catch { /* Telegram is optional — silent fail */ }
}


// ============================================================
// ANIMATED NUMBER COUNTER
// ============================================================

const _currentValues = {};

function animateCount(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const current = _currentValues[elementId] || 0;
  if (current === target) return;
  _currentValues[elementId] = target;

  const duration = 1200;
  const start    = performance.now();
  const from     = parseFloat(el.textContent) || 0;

  function tick(now) {
    const p   = Math.min((now - start) / duration, 1);
    const val = Math.round(from + (target - from) * easeOutCubic(p));
    el.textContent = val.toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function updatePulse(online) {
  const dot = document.getElementById('smk-online-dot');
  if (!dot) return;
  dot.className = 'smk-pulse-dot' + (online > 0 ? ' smk-pulse-dot--live' : '');
}


// ============================================================
// GLASSMORPHISM WIDGET — injected into the page
// ============================================================

function injectWidget() {
  // ── Styles ────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id    = 'smk-analytics-styles';
  style.textContent = `
/* ── Analytics Widget ─────────────────────────────────── */
#smk-analytics-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.smk-card {
  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.62);
  -webkit-backdrop-filter: blur(28px) saturate(220%) brightness(1.08);
  backdrop-filter: blur(28px) saturate(220%) brightness(1.08);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  padding: 16px 20px;
  min-width: 210px;
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,.92),
    inset 1px 0 0 rgba(255,255,255,.55),
    0 8px 32px rgba(0,0,40,.12),
    0 2px 8px rgba(0,0,40,.06);
  cursor: default;
  user-select: none;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1),
              box-shadow .3s ease,
              opacity .4s ease;
  transform-origin: bottom right;
}

.smk-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,.95),
    inset 1px 0 0 rgba(255,255,255,.6),
    0 16px 48px rgba(0,0,40,.16),
    0 4px 16px rgba(0,0,40,.09);
}

/* Dark-mode override */
@media (prefers-color-scheme: dark) {
  .smk-card {
    background: rgba(18, 22, 36, 0.72);
    border-color: rgba(255,255,255,.14);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.14),
      0 8px 32px rgba(0,0,0,.45),
      0 2px 8px rgba(0,0,0,.25);
  }
}

/* Header row */
.smk-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.smk-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0066FF 0%, #00C2FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,102,255,.35);
}

.smk-logo svg {
  width: 14px;
  height: 14px;
  fill: #fff;
}

.smk-title {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: #374151;
  line-height: 1;
}

@media (prefers-color-scheme: dark) {
  .smk-title { color: rgba(255,255,255,.7); }
}

/* Stat rows */
.smk-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.smk-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.smk-stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .smk-stat-label { color: rgba(255,255,255,.5); }
}

.smk-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  min-width: 42px;
  text-align: right;
}

@media (prefers-color-scheme: dark) {
  .smk-stat-value { color: rgba(255,255,255,.92); }
}

/* Pulse dot */
.smk-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9CA3AF;
  flex-shrink: 0;
  transition: background .4s;
}

.smk-pulse-dot--live {
  background: #10B981;
  box-shadow: 0 0 0 0 rgba(16,185,129,.5);
  animation: smk-pulse 2s infinite;
}

@keyframes smk-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  70%  { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

/* Divider */
.smk-divider {
  height: 1px;
  background: rgba(0,0,0,.06);
  margin: 12px 0;
}
@media (prefers-color-scheme: dark) {
  .smk-divider { background: rgba(255,255,255,.08); }
}

/* Badge row */
.smk-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0,102,255,.10);
  border: 1px solid rgba(0,102,255,.18);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 10.5px;
  font-weight: 600;
  color: #0066FF;
  letter-spacing: .03em;
}

/* Loading skeleton */
.smk-skeleton {
  display: inline-block;
  width: 36px;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.06) 75%);
  background-size: 200% 100%;
  animation: smk-shimmer 1.4s infinite;
  vertical-align: middle;
}

@keyframes smk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Entrance animation */
@keyframes smk-slide-in {
  from { opacity: 0; transform: translateY(16px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.smk-card { animation: smk-slide-in .5s .3s both cubic-bezier(.34,1.56,.64,1); }

/* Mobile responsive */
@media (max-width: 480px) {
  #smk-analytics-widget {
    bottom: 84px; /* above mobile sticky CTA bar */
    right: 12px;
  }
  .smk-card {
    min-width: 180px;
    padding: 13px 16px;
    border-radius: 16px;
  }
  .smk-stat-value { font-size: 16px; }
}
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id    = 'smk-analytics-widget';
  widget.setAttribute('aria-label', 'Visitor statistics');
  widget.innerHTML = `
    <div class="smk-card">
      <div class="smk-header">
        <div class="smk-logo">
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12zm0-10a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        </div>
        <span class="smk-title">Visitor Analytics</span>
      </div>

      <div class="smk-stats">
        <div class="smk-stat">
          <span class="smk-stat-label">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="#9CA3AF">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a6 6 0 0112 0H3zm14 0a6 6 0 00-6-6 6 6 0 016 6h0z"/>
            </svg>
            Total Visits
          </span>
          <span class="smk-stat-value" id="smk-total-count">
            <span class="smk-skeleton"></span>
          </span>
        </div>

        <div class="smk-stat">
          <span class="smk-stat-label">
            <span class="smk-pulse-dot" id="smk-online-dot"></span>
            Online Now
          </span>
          <span class="smk-stat-value" id="smk-online-count">
            <span class="smk-skeleton"></span>
          </span>
        </div>
      </div>

      <div class="smk-divider"></div>

      <div style="display:flex;justify-content:center;">
        <span class="smk-badge">
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 010-2h2a1 1 0 011 1zm-1 4a1 1 0 00-1-1H9a1 1 0 000 2h1a1 1 0 001-1zm3-8H6a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2z" clip-rule="evenodd"/>
          </svg>
          Live · sajidmk.com
        </span>
      </div>
    </div>
  `;

  document.body.appendChild(widget);
}
