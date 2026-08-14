// ============================================================
// ADMIN DASHBOARD — logic
// Talks to Supabase ONLY through the RPC functions defined in
// admin_auth_and_rpc.sql. Never touches tables directly, never
// uses a service_role key.
// ============================================================

// ── Fill in your NEW Supabase project's URL + anon key here ──
// (Same anon key already used by the public site's analytics.js —
// it's meant to be public; access is controlled by RLS + the RPC
// token check, not by hiding this key.)
const SUPABASE_URL = 'https://pcyaishwlnznaqrepbyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeWFpc2h3bG56bmFxcmVwYnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDU3OTYsImV4cCI6MjEwMjIyMTc5Nn0.FX2i881Z4mIDS0c0Gb5jZwmVU_VkaGjHVaXTrmHt20Y';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const SESSION_KEY = 'admin_dashboard_token';
const REFRESH_MS = 30000; // full data refresh interval (live visitors, etc.)

let dashboardData = null;
let refreshTimer = null;

// ============================================================
// SECTIONS
// ============================================================
const SECTIONS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'live',        label: 'Live Visitors' },
  { id: 'analytics',   label: 'Visitor Analytics' },
  { id: 'sessions',    label: 'Sessions' },
  { id: 'pageviews',   label: 'Page Views' },
  { id: 'events',      label: 'Events' },
  { id: 'devices',     label: 'Devices' },
  { id: 'browsers',    label: 'Browsers' },
  { id: 'referrers',   label: 'Referrers' },
  { id: 'names',       label: 'Visitor Names' },
  { id: 'reviews',     label: 'Reviews' },
  { id: 'system',      label: 'Security / System' },
];

// ============================================================
// AUTH
// ============================================================
function getToken() {
  return sessionStorage.getItem(SESSION_KEY);
}

function setToken(token) {
  sessionStorage.setItem(SESSION_KEY, token);
}

function clearToken() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function login(password) {
  const { data, error } = await db.rpc('rpc_admin_login', {
    p_password: password,
    p_hint: navigator.userAgent.slice(0, 60)
  });
  if (error) throw error;
  setToken(data.token);
}

async function logout() {
  const token = getToken();
  if (token) {
    try { await db.rpc('rpc_admin_logout', { p_token: token }); } catch (e) {}
  }
  clearToken();
  if (refreshTimer) clearInterval(refreshTimer);
  showLogin();
}

// ============================================================
// DATA FETCH
// ============================================================
async function fetchDashboardData() {
  const token = getToken();
  if (!token) throw new Error('No session');
  const { data, error } = await db.rpc('rpc_admin_dashboard_data', { p_token: token });
  if (error) throw error;
  dashboardData = data;
  return data;
}

async function refreshAndRender() {
  try {
    await fetchDashboardData();
    renderActiveSection();
    document.getElementById('lastUpdated').textContent =
      'Updated ' + new Date(dashboardData.system.generated_at).toLocaleTimeString();
  } catch (e) {
    console.error('[Dashboard] refresh failed:', e.message);
    if (e.message === 'Unauthorized' || (e.message || '').includes('JWT')) {
      logout();
    }
  }
}

// ============================================================
// UI: LOGIN / APP SWITCH
// ============================================================
function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').classList.remove('visible');
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
}

// ============================================================
// NAV
// ============================================================
let activeSection = 'overview';

function buildNav() {
  const nav = document.getElementById('navList');
  nav.innerHTML = SECTIONS.map(s =>
    `<div class="nav-item${s.id === activeSection ? ' active' : ''}" data-section="${s.id}">
       <span class="nav-dot"></span>${s.label}
     </div>`
  ).join('');

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      activeSection = el.dataset.section;
      buildNav();
      renderActiveSection();
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function renderActiveSection() {
  const section = SECTIONS.find(s => s.id === activeSection);
  document.getElementById('sectionTitle').textContent = section.label;
  const content = document.getElementById('content');
  if (!dashboardData) { content.innerHTML = '<p style="color:var(--txt-3)">Loading…</p>'; return; }

  const renderers = {
    overview: renderOverview,
    live: renderLive,
    analytics: renderAnalytics,
    sessions: renderSessions,
    pageviews: renderPageViews,
    events: renderEvents,
    devices: renderDevices,
    browsers: renderBrowsers,
    referrers: renderReferrers,
    names: renderNames,
    reviews: renderReviews,
    system: renderSystem,
  };
  content.innerHTML = renderers[activeSection](dashboardData);

  if (activeSection === 'reviews') wireReviewActions();
}

// ============================================================
// HELPERS
// ============================================================
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—'; }
function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function emptyRow(colspan, label) {
  return `<tr class="empty-row"><td colspan="${colspan}">${label}</td></tr>`;
}
function barList(rows, keyField, countField, total) {
  if (!rows.length) return '<p style="color:var(--txt-3);font-size:13px;padding:16px;">No data yet.</p>';
  return rows.map(r => {
    const pct = total ? Math.round((r[countField] / total) * 100) : 0;
    return `<div class="bar-row">
      <div class="name">${esc(r[keyField])}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="bar-count">${r[countField]}</div>
    </div>`;
  }).join('');
}

// ============================================================
// SECTION RENDERERS
// ============================================================
function renderOverview(d) {
  const o = d.overview;
  const dur = fmtDuration(o.avg_session_duration_seconds);
  const stats = [
    ['Total Visitors', o.total_visitors],
    ['Unique Visitors (30d)', o.unique_visitors_30d],
    ['Sessions', o.total_sessions],
    ['Page Views', o.total_page_views],
    ['Avg Session Duration', dur !== null ? dur : 'Not enough data yet'],
    ['Pending Reviews', o.pending_reviews],
  ];
  const cards = stats.map(([label, val]) =>
    `<div class="glass stat-card"><div class="label">${label}</div><div class="value${typeof val === 'string' && val.length > 8 ? ' small' : ''}">${val}</div></div>`
  ).join('');

  const totalDeviceCount = d.devices.reduce((a, b) => a + Number(b.count), 0);
  const topPagesTotal = d.top_pages.reduce((a, b) => a + Number(b.views), 0);

  return `
    <div class="stat-grid">${cards}</div>
    <div class="two-col">
      <div class="glass">
        <div class="card-title">Top Pages</div>
        <div class="card-sub">By total page views</div>
        <div style="padding:0 4px 12px;">${barList(d.top_pages.slice(0,8), 'page_path', 'views', topPagesTotal)}</div>
      </div>
      <div class="glass">
        <div class="card-title">Devices</div>
        <div class="card-sub">Sessions by device type</div>
        <div style="padding:0 4px 12px;">${barList(d.devices, 'device_type', 'count', totalDeviceCount)}</div>
      </div>
    </div>
  `;
}

function renderLive(d) {
  const rows = d.live_visitors;
  return `
    <div class="refresh-note"><span class="dot-pulse"></span> Active in the last 5 minutes · auto-refreshes every 30s</div>
    <div class="glass table-wrap">
      <table>
        <thead><tr><th>Visitor</th><th>Entry Page</th><th>Device</th><th>Browser</th><th>Country</th><th>Started</th><th>Last Activity</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td><span class="badge live">live</span> ${esc(r.visitor_name || 'Anonymous')}</td>
              <td>${esc(r.entry_page)}</td>
              <td>${esc(r.device_type || '—')}</td>
              <td>${esc(r.browser || '—')}</td>
              <td>${esc(r.country || '—')}</td>
              <td>${fmtDate(r.started_at)}</td>
              <td>${fmtDate(r.last_activity_at)}</td>
            </tr>`).join('') : emptyRow(7, 'No visitors active right now.')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAnalytics(d) {
  const o = d.overview;
  const dur = fmtDuration(o.avg_session_duration_seconds);
  return `
    <div class="stat-grid">
      <div class="glass stat-card"><div class="label">Total Visitors</div><div class="value">${o.total_visitors}</div></div>
      <div class="glass stat-card"><div class="label">Unique Visitors (30d)</div><div class="value">${o.unique_visitors_30d}</div></div>
      <div class="glass stat-card"><div class="label">Sessions</div><div class="value">${o.total_sessions}</div></div>
      <div class="glass stat-card"><div class="label">Page Views</div><div class="value">${o.total_page_views}</div></div>
      <div class="glass stat-card"><div class="label">Avg Session Duration</div><div class="value${dur && dur.length>8?' small':''}">${dur !== null ? dur : 'Not enough data yet'}</div></div>
    </div>
    <div class="two-col">
      <div class="glass">
        <div class="card-title">Referrers</div>
        <div class="card-sub">Where visitors came from</div>
        <div style="padding:0 4px 12px;">${barList(d.referrers.slice(0,8), 'referrer', 'count', d.referrers.reduce((a,b)=>a+Number(b.count),0))}</div>
      </div>
      <div class="glass">
        <div class="card-title">Browsers</div>
        <div class="card-sub">Sessions by browser</div>
        <div style="padding:0 4px 12px;">${barList(d.browsers.slice(0,8), 'browser', 'count', d.browsers.reduce((a,b)=>a+Number(b.count),0))}</div>
      </div>
    </div>
  `;
}

function renderSessions(d) {
  const rows = d.recent_sessions;
  return `
    <div class="glass table-wrap">
      <table>
        <thead><tr><th>Visitor</th><th>Device</th><th>Browser</th><th>OS</th><th>Referrer</th><th>Entry Page</th><th>Started</th><th>Ended</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td>${esc(r.visitor_name || 'Anonymous')}</td>
              <td>${esc(r.device_type || '—')}</td>
              <td>${esc(r.browser || '—')}</td>
              <td>${esc(r.os || '—')}</td>
              <td>${esc(r.referrer || 'direct')}</td>
              <td>${esc(r.entry_page || '—')}</td>
              <td>${fmtDate(r.started_at)}</td>
              <td>${r.ended_at ? fmtDate(r.ended_at) : '<span class="badge live">live</span>'}</td>
            </tr>`).join('') : emptyRow(8, 'No sessions yet.')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPageViews(d) {
  const rows = d.recent_page_views;
  return `
    <div class="glass table-wrap">
      <table>
        <thead><tr><th>Page</th><th>Session</th><th>Viewed At</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td>${esc(r.page_path)}</td>
              <td style="font-family:var(--ff-mono);font-size:12px;">${esc(r.session_id.slice(0,8))}…</td>
              <td>${fmtDate(r.viewed_at)}</td>
            </tr>`).join('') : emptyRow(3, 'No page views yet.')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEvents(d) {
  const rows = d.recent_events;
  return `
    <div class="glass table-wrap">
      <table>
        <thead><tr><th>Event</th><th>Session</th><th>Data</th><th>When</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td>${esc(r.event_type)}</td>
              <td style="font-family:var(--ff-mono);font-size:12px;">${esc(r.session_id.slice(0,8))}…</td>
              <td class="wrap" style="font-family:var(--ff-mono);font-size:11.5px;max-width:280px;">${r.event_data ? esc(JSON.stringify(r.event_data)) : '—'}</td>
              <td>${fmtDate(r.created_at)}</td>
            </tr>`).join('') : emptyRow(4, 'No events recorded yet.')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDevices(d) {
  const total = d.devices.reduce((a,b)=>a+Number(b.count),0);
  return `<div class="glass"><div class="card-title">Devices</div><div class="card-sub">${total} sessions total</div>
    <div style="padding:0 4px 16px;">${barList(d.devices, 'device_type', 'count', total)}</div></div>`;
}

function renderBrowsers(d) {
  const total = d.browsers.reduce((a,b)=>a+Number(b.count),0);
  return `<div class="glass"><div class="card-title">Browsers</div><div class="card-sub">${total} sessions total</div>
    <div style="padding:0 4px 16px;">${barList(d.browsers, 'browser', 'count', total)}</div></div>`;
}

function renderReferrers(d) {
  const total = d.referrers.reduce((a,b)=>a+Number(b.count),0);
  return `<div class="glass"><div class="card-title">Referrers</div><div class="card-sub">${total} sessions total</div>
    <div style="padding:0 4px 16px;">${barList(d.referrers, 'referrer', 'count', total)}</div></div>`;
}

function renderNames(d) {
  const rows = d.visitor_names;
  return `
    <div class="glass table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Sessions</th><th>Last Seen</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td>${esc(r.visitor_name)}</td>
              <td>${r.session_count}</td>
              <td>${fmtDate(r.last_seen_at)}</td>
            </tr>`).join('') : emptyRow(3, 'No visitors have shared their name yet.')}
        </tbody>
      </table>
    </div>
  `;
}

function renderReviews(d) {
  const rows = d.reviews;
  if (!rows.length) return '<p style="color:var(--txt-3);padding:20px;">No reviews yet.</p>';
  return rows.map(r => `
    <div class="glass rev-card" data-id="${r.id}">
      <div class="rev-top">
        <div>
          <div class="rev-name">${esc(r.name)}</div>
          <div class="rev-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        </div>
        <span class="badge ${r.status}">${r.status}</span>
      </div>
      <div class="rev-text">${esc(r.review_text)}</div>
      <div style="font-size:11px;color:var(--txt-3);margin-bottom:10px;">${fmtDate(r.created_at)}</div>
      ${r.status === 'pending' ? `
        <div class="rev-actions">
          <button class="approve" data-action="approve" data-id="${r.id}">Approve</button>
          <button class="reject" data-action="reject" data-id="${r.id}">Reject</button>
        </div>` : ''}
    </div>
  `).join('');
}

function renderSystem(d) {
  const s = d.system;
  const failedRecent = s.recent_failed_logins_15m;
  return `
    <div class="status-grid">
      <div class="glass status-item">
        <div class="status-dot ok"></div>
        <div><div style="font-size:13px;font-weight:600;">Connection</div><div style="font-size:12px;color:var(--txt-3);">Live — data as of ${fmtDate(s.generated_at)}</div></div>
      </div>
      <div class="glass status-item">
        <div class="status-dot ${failedRecent >= 3 ? 'warn' : 'ok'}"></div>
        <div><div style="font-size:13px;font-weight:600;">Failed Logins (15m)</div><div style="font-size:12px;color:var(--txt-3);">${failedRecent} attempt${failedRecent===1?'':'s'}</div></div>
      </div>
      <div class="glass status-item">
        <div class="status-dot ok"></div>
        <div><div style="font-size:13px;font-weight:600;">Last Successful Login</div><div style="font-size:12px;color:var(--txt-3);">${fmtDate(s.last_successful_login)}</div></div>
      </div>
    </div>
    <div class="glass" style="margin-top:18px;padding:16px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px;">Access Model</div>
      <div style="font-size:12.5px;color:var(--txt-3);line-height:1.6;">
        This dashboard uses a password-gated session token (12h expiry) checked server-side via RPC.
        The anon key has no direct read access to any analytics table — every read here passes through
        a token-checked function. No service_role key is present in this page or in any client file.
      </div>
    </div>
  `;
}

// ============================================================
// REVIEW ACTIONS
// ============================================================
function wireReviewActions() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      btn.disabled = true;
      try {
        const token = getToken();
        const { error } = await db.rpc('rpc_admin_review_action', {
          p_token: token, p_review_id: id, p_action: action
        });
        if (error) throw error;
        await refreshAndRender();
      } catch (e) {
        alert('Failed to update review: ' + e.message);
        btn.disabled = false;
      }
    });
  });
}

// ============================================================
// BOOT
// ============================================================
async function boot() {
  buildNav();

  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  const existing = getToken();
  if (existing) {
    try {
      await fetchDashboardData();
      showApp();
      renderActiveSection();
      startPolling();
      return;
    } catch (e) {
      clearToken();
    }
  }
  showLogin();
}

async function doLogin() {
  const pwEl = document.getElementById('loginPassword');
  const errEl = document.getElementById('loginErr');
  const btn = document.getElementById('loginBtn');
  errEl.textContent = '';
  if (!pwEl.value) return;
  btn.disabled = true;
  try {
    await login(pwEl.value);
    pwEl.value = '';
    await fetchDashboardData();
    showApp();
    renderActiveSection();
    startPolling();
  } catch (e) {
    errEl.textContent = e.message || 'Login failed.';
  } finally {
    btn.disabled = false;
  }
}

function startPolling() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshAndRender, REFRESH_MS);
}

document.addEventListener('DOMContentLoaded', boot);
