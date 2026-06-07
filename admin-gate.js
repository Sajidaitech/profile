// ============================================================
// admin-gate.js  ·  sajidmk.com
// Password-only auth gate + audit log
// ============================================================

const ADMIN_PASSWORD = 'Sajid@2026';

// ============================================================
// showDashboard
// ============================================================
function showDashboard() {
  sessionStorage.setItem('admin-auth', '1');
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('dashboard').style.display    = 'block';
  initDashboard();
}

// ============================================================
// PASSWORD AUTH
// ============================================================
function tryAuth() {
  const authInput = document.getElementById('auth-input');
  const authError = document.getElementById('auth-error');
  const password  = authInput.value;

  if (!password) {
    authError.textContent   = 'Please enter the password.';
    authError.style.display = 'block';
    authInput.focus();
    return;
  }
  if (password === ADMIN_PASSWORD) {
    writeAuditLog(null, 'approved', 'password');
    showDashboard();
  } else {
    writeAuditLog(null, 'rejected', 'password');
    authError.textContent   = 'Incorrect password. Try again.';
    authError.style.display = 'block';
    authInput.value         = '';
    authInput.focus();
  }
}

// ============================================================
// BOOT — scripts are at bottom of <body> so DOM is already ready
// ============================================================
(function boot() {

  // Auto-unlock if already authenticated this session
  if (sessionStorage.getItem('admin-auth') === '1') {
    showDashboard();
    return;
  }

  const authBtn   = document.getElementById('auth-btn');
  const authInput = document.getElementById('auth-input');
  const gateBtn   = document.getElementById('gate-btn');

  if (authBtn)   authBtn.addEventListener('click', tryAuth);
  if (authInput) authInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryAuth();
  });

  if (gateBtn) {
    gateBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin-auth');
      document.getElementById('dashboard').style.display    = 'none';
      document.getElementById('auth-overlay').style.display = 'flex';
      document.getElementById('auth-input').value           = '';
      document.getElementById('auth-error').style.display   = 'none';
    });
  }
})();

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
    if (typeof db === 'undefined' || !db) return;
    const ua     = navigator.userAgent;
    const ipInfo = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then(r => r.json()).catch(() => ({}));
    await db.from(AUDIT_LOG_TABLE).insert({
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
  } catch(e) {
    console.warn('[AuditLog]', e.message);
  }
}
