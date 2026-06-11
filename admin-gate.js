// ============================================================
// admin-gate.js  ·  sajidmk.com
// Persistent Supabase Auth gate + audit log
//
// SESSION MODEL
// ─────────────
// One source of truth: Supabase Auth session stored under
// storageKey 'admin-auth-session' in localStorage.
//
// Boot order:
//   1. Create the Supabase client (persistSession:true).
//   2. Call getSession() — if a valid, non-expired JWT is found
//      in localStorage, skip the password screen entirely.
//   3. If no session, show the password overlay.
//   4. On correct password → signInWithPassword() → store session
//      → showDashboard().
//   5. onAuthStateChange keeps the session refreshed while the
//      tab is open; autoRefreshToken handles silent renewal.
//
// The 'admin-auth' localStorage flag is kept as a lightweight
// signal for other pages (script.js admin bypass) — it is set
// on login and cleared on logout, but it is NEVER used as the
// auth decision here. Only the Supabase session is trusted.
// ============================================================

// ── TWO SUPABASE PROJECTS — SPLIT BY CONCERN ─────────────────────────────────
//
//  PROJECT A — "Analytics / Admin" project  (used HERE and in dashboard.js)
//  ─────────────────────────────────────────────────────────────────────────
//  URL:    https://tbdgrhekycgfdeatxjnq.supabase.co
//  Tables: page_views, contact_messages, visitor_profiles, login_audit_log
//  Auth:   Supabase Auth — admin user lives here (signInWithPassword target).
//          The JWT issued after login is reused by dashboard.js for all
//          admin-only RLS policies (contact message management, audit reads).
//  Used by: admin-gate.js  ← this file
//            dashboard.js  (via window._authClient set in showDashboard())
//            script.js     (analytics inserts — anon key, public RLS)
//
//  PROJECT B — "Reviews" project  (used by review-submit.js / reviews-portfolio.js)
//  ──────────────────────────────────────────────────────────────────────────────────
//  URL:    https://ruiqfkzuqxxbyvycvsfo.supabase.co
//  Tables: reviews
//  Auth:   anon key only — no Supabase Auth needed.
//          RLS enforces status='pending', name/review/rating constraints.
//  Reason for split: isolating visitor-submitted reviews into a dedicated
//          project keeps the reviews table completely separate from analytics
//          PII (IP addresses, fingerprints). If the reviews project were ever
//          compromised, no analytics data is exposed, and vice-versa.
//
//  ⚠  Never merge these projects without reviewing RLS policies on both sides.
// ─────────────────────────────────────────────────────────────────────────────

// ── Supabase credentials (PROJECT A — analytics / admin) ──
const _GATE_SUPA_URL = 'https://tbdgrhekycgfdeatxjnq.supabase.co';
const _GATE_SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU';

// Admin Supabase Auth — email only.
// ⚠ Password is NEVER stored client-side. The value the user
// types is sent directly to Supabase signInWithPassword() and
// never compared against any local constant.
const _GATE_ADMIN_EMAIL = 'sajidmkpwr@gmail.com';

// ── Single persistent client — created once, reused everywhere ──
// persistSession:true  → JWT stored in localStorage under storageKey
// autoRefreshToken:true → silently renews the JWT before it expires
let _gateClient = null;

function _getGateClient() {
  if (_gateClient) return _gateClient;
  if (!window.supabase) return null;
  _gateClient = window.supabase.createClient(_GATE_SUPA_URL, _GATE_SUPA_KEY, {
    auth: {
      persistSession:   true,
      storageKey:       'admin-auth-session',  // shared key — same in all places
      autoRefreshToken: true,
    }
  });
  return _gateClient;
}

// ============================================================
// showDashboard — called after session is confirmed
// ============================================================
async function showDashboard() {
  // Set the lightweight cross-page flag (used by script.js admin bypass)
  localStorage.setItem('admin-auth', '1');

  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('dashboard').style.display    = 'block';

  // Expose the authenticated client globally so dashboard.js + initReviews()
  // can attach the JWT to their own Supabase queries.
  window._authClient = _getGateClient();

  initDashboard();
}

// ============================================================
// BOOT — runs immediately; DOM is ready (scripts at bottom of body)
// ============================================================
(async function boot() {

  // ── Step 1: Build the persistent client ──────────────────
  const client = _getGateClient();
  if (!client) {
    // Supabase SDK not loaded yet — wire buttons and wait for user
    console.warn('[AdminGate] Supabase SDK not available at boot');
    _wirePasswordUI();
    return;
  }

  // ── Step 2: Check for an existing valid session ───────────
  // getSession() reads from localStorage (storageKey) — no network call.
  // If the JWT is expired, Supabase will attempt a silent refresh via the
  // refresh token before returning null. autoRefreshToken handles this.
  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  // ── Step 3 (always): Subscribe to auth state changes ────────
  // Registered BEFORE the session check so TOKEN_REFRESHED and
  // SIGNED_OUT fire correctly whether we resume an existing session
  // or the user logs in fresh.
  client.auth.onAuthStateChange((event, session) => {
    console.log('[AdminGate] Auth state:', event);
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      localStorage.setItem('admin-auth', '1');
      window._authClient = client;
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('admin-auth');
      window._authClient = null;
    }
  });

  if (sessionData && sessionData.session) {
    // Valid session exists — go straight to dashboard, no password needed
    console.log('[AdminGate] Existing session found — skipping login');
    writeAuditLog(null, 'approved', 'session_resume');
    await showDashboard();
    return;
  }

  // ── Step 4: No session — show password overlay ───────────
  console.log('[AdminGate] No session — showing login');
  _wirePasswordUI();

})();

// ============================================================
// _wirePasswordUI — attach button/input listeners
// ============================================================
function _wirePasswordUI() {
  const authBtn   = document.getElementById('auth-btn');
  const authInput = document.getElementById('auth-input');
  const gateBtn   = document.getElementById('gate-btn');

  if (authBtn)   authBtn.addEventListener('click', tryAuth);
  if (authInput) authInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryAuth();
  });

  if (gateBtn) {
    gateBtn.addEventListener('click', _handleLogout);
  }
}

// ============================================================
// PASSWORD AUTH
// ============================================================
async function tryAuth() {
  const authInput = document.getElementById('auth-input');
  const authError = document.getElementById('auth-error');
  const authBtn   = document.getElementById('auth-btn');
  const password  = authInput ? authInput.value : '';

  if (!password) {
    authError.textContent   = 'Please enter the password.';
    authError.style.display = 'block';
    if (authInput) authInput.focus();
    return;
  }

  // ── Send password directly to Supabase — no local comparison ──
  // The typed value is never checked against a hardcoded string.
  // Supabase Auth is the sole decision-maker.
  if (authBtn) { authBtn.disabled = true; authBtn.textContent = 'Authenticating…'; }

  const client = _getGateClient();

  if (!client) {
    authError.textContent   = 'Authentication service unavailable. Try again.';
    authError.style.display = 'block';
    if (authBtn) { authBtn.disabled = false; authBtn.textContent = 'Access Dashboard'; }
    return;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email:    _GATE_ADMIN_EMAIL,
    password: password,   // typed value — never stored locally
  });

  if (error) {
    writeAuditLog(null, 'rejected', 'password');
    authError.textContent   = 'Incorrect password. Try again.';
    authError.style.display = 'block';
    authInput.value         = '';
    if (authBtn) { authBtn.disabled = false; authBtn.textContent = 'Access Dashboard'; }
    if (authInput) authInput.focus();
    return;
  }

  console.log('[AdminGate] Supabase sign-in success — session persisted');
  writeAuditLog(null, 'approved', 'password');
  await showDashboard();

  if (authBtn) { authBtn.disabled = false; authBtn.textContent = 'Access Dashboard'; }
}

// ============================================================
// LOGOUT
// ============================================================
async function _handleLogout() {
  try {
    const client = _getGateClient();
    if (client) {
      await client.auth.signOut();
      console.log('[AdminGate] Signed out of Supabase Auth');
    }
  } catch (e) {
    console.warn('[AdminGate] Sign-out error:', e.message);
  }

  // Clear cross-page flag
  localStorage.removeItem('admin-auth');
  window._authClient = null;

  // Show the overlay again
  document.getElementById('dashboard').style.display    = 'none';
  document.getElementById('auth-overlay').style.display = 'flex';
  const authInput = document.getElementById('auth-input');
  const authError = document.getElementById('auth-error');
  if (authInput) authInput.value          = '';
  if (authError) authError.style.display  = 'none';

  // Re-wire the UI (event listeners are still attached, nothing to re-add)
}

// ============================================================
// LOGIN AUDIT LOG (fire-and-forget)
// ============================================================
const AUDIT_LOG_TABLE = 'login_audit_log';

function _detectBrowser(ua) {
  if (/Edg\//.test(ua))                           return 'Edge';
  if (/OPR\/|Opera/.test(ua))                     return 'Opera';
  if (/SamsungBrowser/.test(ua))                  return 'Samsung';
  if (/Firefox\//.test(ua))                       return 'Firefox';
  if (/Chrome\//.test(ua) && /Safari\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua))                        return 'Safari';
  return 'Unknown';
}
function _detectDevice(ua) {
  if (/iPad/.test(ua))                         return 'Tablet';
  if (/iPhone|iPod/.test(ua))                  return 'Mobile';
  if (/Android/.test(ua) && /Mobile/.test(ua)) return 'Mobile';
  if (/Android/.test(ua))                      return 'Tablet';
  return 'Desktop';
}
function _detectPlatform(ua) {
  if (/iPhone|iPad|iPod/.test(ua))            return 'iOS';
  if (/Android/.test(ua))                     return 'Android';
  if (/Win/.test(navigator.platform || ua))   return 'Windows';
  if (/Mac/.test(navigator.platform || ua))   return 'macOS';
  if (/Linux/.test(navigator.platform || ua)) return 'Linux';
  return 'Unknown';
}

async function writeAuditLog(sessionId, result, loginMethod) {
  try {
    // Prefer the gate client (has auth session); fall back to a temporary anon client
    let auditDb = _getGateClient();
    if (!auditDb && window.supabase) {
      auditDb = window.supabase.createClient(_GATE_SUPA_URL, _GATE_SUPA_KEY, {
        auth: { persistSession: false }
      });
    }
    if (!auditDb) return;

    const ua     = navigator.userAgent;
    const ipInfo = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then(r => r.json()).catch(() => ({}));

    await auditDb.from(AUDIT_LOG_TABLE).insert({
      timestamp:    new Date().toISOString(),
      session_id:   sessionId || null,
      browser:      _detectBrowser(ua),
      device:       _detectDevice(ua),
      platform:     _detectPlatform(ua),
      country:      ipInfo.country_name || ipInfo.country || null,
      ip:           ipInfo.ip || null,
      result,
      login_method: loginMethod,
    });
  } catch (e) {
    console.warn('[AuditLog]', e.message);
  }
}
