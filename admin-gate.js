// ============================================================
// admin-gate.js  ·  sajidmk.com
// Simple local password gate (Supabase Auth removed)
//
// SESSION MODEL
// ─────────────
// One source of truth: a localStorage flag ('admin-auth' = '1'),
// set after a correct password check and read on every page load
// (here and by script.js's admin bypass).
//
// ⚠ IMPORTANT — READ THIS ⚠
// This is a client-side check. Anyone who opens DevTools and reads
// this file can find PASSWORD_HASH and, with enough effort, brute
// force or precompute a match for it. Hashing it means the password
// isn't sitting in the file as plain text, but that is obscurity,
// not real security — do not use this to gate anything sensitive
// (real user data, payments, etc.). For this dashboard (visit
// counts / contact form messages on your own portfolio) that
// trade-off is reasonable; just know what it is.
//
// HOW TO SET / CHANGE YOUR PASSWORD
// ──────────────────────────────────
// 1. Open this page (admin-dashboard.html) in a browser.
// 2. Open DevTools Console (F12) and run:
//      crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourPasswordHere'))
//        .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
// 3. Copy the printed hex string and paste it as PASSWORD_HASH below.
// 4. Never commit your real plaintext password anywhere — only the hash.
// ============================================================

// This is the SHA-256 hash of the password you chose — set below,
// generated for you (your plaintext password is never stored here).
const PASSWORD_HASH = '0e91dab220e332f6e84d043e71f0908202c969aa959974bb660515c65556be84';

// ── PROJECT A — analytics project (used ONLY for the audit log now;
//    no Supabase Auth involved anymore, anon key only) ──
const _GATE_SUPA_URL = 'https://tbdgrhekycgfdeatxjnq.supabase.co';
const _GATE_SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU';

// ── Anon-only client (no auth session — used just for audit log inserts
//    and exposed as window._authClient so dashboard.js has a client to
//    query with. NOTE: without a real Auth session, any RLS policy that
//    required an authenticated JWT will now block those queries — see
//    the note at the top of this file). ──
let _gateClient = null;
function _getGateClient() {
  if (_gateClient) return _gateClient;
  if (!window.supabase) return null;
  _gateClient = window.supabase.createClient(_GATE_SUPA_URL, _GATE_SUPA_KEY, {
    auth: { persistSession: false }
  });
  return _gateClient;
}

// ── SHA-256 hex hash of a string, using the browser's native WebCrypto ──
async function _sha256Hex(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// showDashboard — called after the password check passes
// ============================================================
async function showDashboard() {
  // Cross-page flag used by script.js's admin bypass
  localStorage.setItem('admin-auth', '1');

  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('dashboard').style.display    = 'block';

  // Expose a client for dashboard.js to query with (anon key — no
  // authenticated session, see note at top of file).
  window._authClient = _getGateClient();

  initDashboard();
}

// ============================================================
// BOOT — runs immediately; DOM is ready (scripts at bottom of body)
// ============================================================
(function boot() {
  // Already unlocked this browser? Skip straight to the dashboard.
  if (localStorage.getItem('admin-auth') === '1') {
    console.log('[AdminGate] Existing local session — skipping login');
    showDashboard();
    return;
  }

  console.log('[AdminGate] No local session — showing login');
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
// PASSWORD CHECK — local only, no network round-trip
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

  if (authBtn) { authBtn.disabled = true; authBtn.textContent = 'Checking…'; }

  const hash = await _sha256Hex(password);

  if (hash !== PASSWORD_HASH) {
    writeAuditLog(null, 'rejected', 'password');
    authError.textContent   = 'Incorrect password. Try again.';
    authError.style.display = 'block';
    authInput.value         = '';
    if (authBtn) { authBtn.disabled = false; authBtn.textContent = 'Access Dashboard'; }
    if (authInput) authInput.focus();
    return;
  }

  console.log('[AdminGate] Password correct — unlocking');
  writeAuditLog(null, 'approved', 'password');
  await showDashboard();

  if (authBtn) { authBtn.disabled = false; authBtn.textContent = 'Access Dashboard'; }
}

// ============================================================
// LOGOUT
// ============================================================
function _handleLogout() {
  localStorage.removeItem('admin-auth');
  window._authClient = null;

  document.getElementById('dashboard').style.display    = 'none';
  document.getElementById('auth-overlay').style.display = 'flex';
  const authInput = document.getElementById('auth-input');
  const authError = document.getElementById('auth-error');
  if (authInput) authInput.value          = '';
  if (authError) authError.style.display  = 'none';
}

// ============================================================
// LOGIN AUDIT LOG (fire-and-forget, unchanged — anon insert only)
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
    const auditDb = _getGateClient();
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
