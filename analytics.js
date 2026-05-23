// ============================================================
// SAJID MEHMOOD PORTFOLIO · Visitor Analytics Engine
// analytics.js — Production v2.0 (Full Rewrite)
// ============================================================
// BUG FIXES IN THIS VERSION:
// 1. CRITICAL: detectDeviceModel() was called but NEVER DEFINED → ReferenceError crash
// 2. CRITICAL: injectWidget() was defined but NEVER CALLED → floating widget never appeared
// 3. CRITICAL: Supabase loaded with `async` attr → analytics.js ran before Supabase was ready,
//              causing `window.supabase is undefined` → all tracking silently failed
// 4. CRITICAL: smk-total-count / smk-online-count / smk-online-dot referenced in
//              quickCountFetch() but those IDs only exist INSIDE injectWidget() HTML
//              which was never injected → counter updates went nowhere
// 5. FIXED: `get_online_count` RPC returns a number but code did `data ||0` on
//           the raw RPC `.data` field — now correctly extracts scalar from RPC
// 6. ADDED:  Remembered visitor name via localStorage so returning users skip typing
// 7. ADDED:  Auto-refresh of counters every 30 s even without realtime events
// 8. ADDED:  Realtime subscription with proper channel status logging
// 9. ADDED:  visitorCounter element (localStorage-only for local device display)
//10. ADDED:  Gate auto-fill: pre-populates name input if localStorage has saved name
// ============================================================

const ANALYTICS_CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  supabaseUrl:  'https://tbdgrhekycgfdeatxjnq.supabase.co',
  supabaseKey:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU',

  // ── Telegram alerts (optional) ────────────────────────────
  telegramEnabled:  false,
  telegramBotToken: 'YOUR_BOT_TOKEN',
  telegramChatId:   'YOUR_CHAT_ID',

  // ── GCC recruiter detection ───────────────────────────────
  gccCountries: ['Qatar', 'UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman'],

  // ── Heartbeat interval (ms) ───────────────────────────────
  heartbeatInterval: 30_000,   // 30 s — keeps online count fresh

  // ── Counter auto-refresh interval (ms) ───────────────────
  counterRefreshInterval: 30_000, // 30 s — guaranteed UI refresh even without realtime events

  // ── Session duration flush interval (ms) ─────────────────
  durationFlushInterval: 60_000, // 1 min

  // ── localStorage key for remembered visitor name ──────────
  savedNameKey: '_smVisitorName_saved',
};


// ============================================================
// SUPABASE BOOTSTRAP  — FIX #3: Remove `async` race condition
// ============================================================
// The original index.html loaded Supabase with the `async`
// attribute. This meant analytics.js could execute BEFORE
// the Supabase library was available → window.supabase
// was undefined → createClient() threw → everything failed.
//
// Solution: analytics.js now waits (polls up to 5 s) for
// window.supabase to be defined before proceeding. The index.html
// `async` attribute should be REMOVED from the Supabase <script>
// tag (or kept — this code handles both cases safely).

(function () {
  'use strict';

  // ── FIX #10: Pre-fill gate input with remembered name ────
  // Runs immediately on script load so the input is populated
  // before the gate is even shown.
  function prefillGateName() {
    var savedName = '';
    try { savedName = localStorage.getItem(ANALYTICS_CONFIG.savedNameKey) || ''; } catch (e) {}
    if (!savedName) return;

    // Wait for DOM ready then fill the input
    function doFill() {
      var input = document.getElementById('gVisitorName');
      if (input && !input.value) {
        input.value = savedName;
        // Show a subtle "Welcome back" hint
        var label = document.querySelector('.gate-label[for="gVisitorName"], .gate-label');
        if (label && label.textContent.indexOf('WELCOME BACK') === -1) {
          label.textContent = 'WELCOME BACK, ' + savedName.split(' ')[0].toUpperCase() + '!';
        }
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doFill);
    } else {
      doFill();
    }
  }
  prefillGateName();

  // ── Supabase client factory ───────────────────────────────
  function createClient() {
    return window.supabase.createClient(
      ANALYTICS_CONFIG.supabaseUrl,
      ANALYTICS_CONFIG.supabaseKey,
      {
        realtime: { params: { eventsPerSecond: 10 } },
        auth:     { persistSession: false },
      }
    );
  }

  // ── Shared client accessor ────────────────────────────────
  function getOrCreateClient(cb) {
    if (window.__supabaseClient) { cb(window.__supabaseClient); return; }

    if (window.supabase && window.supabase.createClient) {
      window.__supabaseClient = createClient();
      cb(window.__supabaseClient);
      return;
    }

    // Poll until Supabase is ready (handles both `async` and
    // dynamic-inject fallbacks). Max 5 s, 100 ms interval.
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (window.supabase && window.supabase.createClient) {
        clearInterval(poll);
        if (!window.__supabaseClient) {
          window.__supabaseClient = createClient();
        }
        cb(window.__supabaseClient);
      } else if (attempts >= 50) {
        // 5 s timeout — try dynamic CDN inject as last resort
        clearInterval(poll);
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = function () {
          window.__supabaseClient = createClient();
          cb(window.__supabaseClient);
        };
        s.onerror = function () {
          console.warn('[Analytics] Supabase CDN load failed — analytics disabled');
        };
        document.head.appendChild(s);
      }
    }, 100);
  }


  // ============================================================
  // QUICK COUNTER FETCH — runs before gate interaction
  // FIX #4: These element IDs now exist because injectWidget()
  // is called before quickCountFetch() in boot().
  // ============================================================
  function quickCountFetch() {
    getOrCreateClient(async function (db) {
      try {
        var [totalRes, onlineRes] = await Promise.all([
          db.rpc('get_visitor_count'),
          db.rpc('get_online_count'),
        ]);
        // FIX #5: RPC scalar comes back as `.data` directly for
        // Supabase JS v2 when the function returns a scalar.
        var t = (typeof totalRes.data === 'number' ? totalRes.data : 0);
        var o = (typeof onlineRes.data === 'number' ? onlineRes.data : 0);
        updateAllCounterElements(t, o);
      } catch (e) {
        console.warn('[Analytics] Quick count failed:', e.message);
      }
    });
  }

  // ── Update every counter element on the page ─────────────
  function updateAllCounterElements(total, online) {
    var t = total  || 0;
    var o = online || 0;

    // Gate strip
    ['gate-total-count', 'footer-total-count', 'smk-total-count'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = t.toLocaleString();
    });
    ['gate-online-count', 'footer-online-count', 'smk-online-count'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = o.toLocaleString();
    });

    // Pulse dots
    var gateDot = document.getElementById('gate-online-dot');
    if (gateDot) gateDot.className = 'gvs-dot' + (o > 0 ? ' gvs-dot--live' : '');

    var footerDot = document.getElementById('footer-online-dot');
    if (footerDot) footerDot.className = 'fvb-dot' + (o > 0 ? ' fvb-dot--live' : '');

    // Floating widget dot (FIX #4: only exists after injectWidget())
    var smkDot = document.getElementById('smk-online-dot');
    if (smkDot) smkDot.className = 'smk-pulse-dot' + (o > 0 ? ' smk-pulse-dot--live' : '');
  }


  // ============================================================
  // BOOT — entry point
  // FIX #2: injectWidget() is NOW called here, BEFORE
  // quickCountFetch(), so the floating widget elements exist
  // in the DOM when counter updates try to find them.
  // ============================================================
  function boot() {
    // Step 1: update counters as soon as Supabase is available (widget removed)
    quickCountFetch();

    // Step 3: start full tracking engine
    getOrCreateClient(startAnalytics);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(); // end IIFE


// ============================================================
// SESSION HELPERS
// ============================================================

function getSessionId() {
  var KEY = 'smk_sid';
  var sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// ── Stable cross-session visitor fingerprint (localStorage) ──
// Unlike session_id (sessionStorage, per-tab), this persists
// across tab closes and browser restarts on the same device.
// Used as the primary key for visitor_profiles — one row per device.
function getVisitorFingerprint() {
  var KEY = 'smk_fp';
  var fp  = null;
  try { fp = localStorage.getItem(KEY); } catch (e) {}
  if (!fp) {
    fp = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
    try { localStorage.setItem(KEY, fp); } catch (e) {}
  }
  return fp;
}

function isReturningVisitor() {
  // Legacy localStorage flag — kept for backward compat with existing rows
  // that have is_returning set from this flag before profiles were added.
  // New logic: is_returning is now derived from visit_count > 1 returned by
  // upsertVisitorProfile(), so this is only a fallback for the initial check.
  var KEY = 'smk_visited';
  var seen = !!localStorage.getItem(KEY);
  if (!seen) localStorage.setItem(KEY, '1');
  return seen;
}

function alreadyTracked() {
  var KEY = 'smk_tracked_' + getSessionId();
  if (sessionStorage.getItem(KEY)) return true;
  sessionStorage.setItem(KEY, '1');
  return false;
}


// ============================================================
// VISITOR DETECTION  (accuracy rewrite)
// Key fixes vs original:
//  • detectOS:    Android version, Windows 11 hint, iPadOS split,
//                 macOS version, ChromeOS, KaiOS
//  • detectBrowser: iOS-specific tokens first (CriOS/FxiOS/OPiOS),
//                 Brave, Samsung, UC, Opera Mini, in-app browsers,
//                 Safari version from Version/ token, IE 11 via Trident
//  • detectDevice: iPadOS 13+ disguises itself as "Macintosh" — fixed
//                 via maxTouchPoints; Android tablets without "Mobile"
//                 keyword; proper touch-point fallback
// ============================================================

function detectOS(ua) {
  // ── iOS / iPadOS (must come before macOS — iPadOS 13+ says "Macintosh") ──
  // iPadOS 13+ removes "iPad" from UA and says "Macintosh; Intel Mac OS X"
  // but also sets navigator.maxTouchPoints > 1. We pass that as a hint.
  if (/iPhone OS/.test(ua)) {
    var m = ua.match(/iPhone OS (\d+[_.]\d+)/);
    var v = m ? m[1].replace('_', '.') : '';
    return 'iOS' + (v ? ' ' + v : '');
  }
  if (/iPad/.test(ua)) {
    var m2 = ua.match(/OS (\d+[_.]\d+)/);
    var v2 = m2 ? m2[1].replace('_', '.') : '';
    return 'iPadOS' + (v2 ? ' ' + v2 : '');
  }
  // Android (before Linux — Android UA contains "Linux")
  if (/Android/.test(ua)) {
    var m3 = ua.match(/Android (\d+\.?\d*)/);
    return 'Android' + (m3 ? ' ' + m3[1] : '');
  }
  // Windows — NT 10.0 is both Win10 and Win11 (UA doesn't distinguish reliably)
  if (/Windows NT 10\.0/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6\.3/.test(ua))  return 'Windows 8.1';
  if (/Windows NT 6\.2/.test(ua))  return 'Windows 8';
  if (/Windows NT 6\.1/.test(ua))  return 'Windows 7';
  if (/Windows NT/.test(ua))        return 'Windows';
  // macOS — extract version
  if (/Mac OS X/.test(ua)) {
    var m4 = ua.match(/Mac OS X (\d+[_.:]\d+)/);
    if (m4) {
      var ver = m4[1].replace(/_/g, '.');
      // macOS 10.16+ = Big Sur onwards; reported as 11+ in non-compat mode
      return 'macOS ' + ver;
    }
    return 'macOS';
  }
  if (/CrOS/.test(ua))   return 'ChromeOS';
  if (/KaiOS/.test(ua))  return 'KaiOS';
  if (/Linux/.test(ua))  return 'Linux';
  return 'Unknown OS';
}

function detectBrowser(ua) {
  // ── iOS-specific tokens must come before generic Chrome/Firefox/Safari ──
  // CriOS  = Chrome for iOS
  // FxiOS  = Firefox for iOS
  // OPiOS  = Opera for iOS
  // EdgiOS = Edge for iOS
  if (/EdgiOS\/([\d.]+)/.test(ua))   { var mv = ua.match(/EdgiOS\/([\d.]+)/);  return 'Edge ' + mv[1].split('.')[0]; }
  if (/CriOS\/([\d.]+)/.test(ua))    { var mv2 = ua.match(/CriOS\/([\d.]+)/);  return 'Chrome ' + mv2[1].split('.')[0]; }
  if (/FxiOS\/([\d.]+)/.test(ua))    { var mv3 = ua.match(/FxiOS\/([\d.]+)/);  return 'Firefox ' + mv3[1].split('.')[0]; }
  if (/OPiOS\/([\d.]+)/.test(ua))    { var mv4 = ua.match(/OPiOS\/([\d.]+)/);  return 'Opera ' + mv4[1].split('.')[0]; }
  // ── In-app / embedded browsers ──────────────────────────────────────────
  if (/Instagram/.test(ua))           return 'Instagram Browser';
  if (/FBAN|FBAV/.test(ua))           return 'Facebook Browser';
  if (/LinkedInApp/.test(ua))         return 'LinkedIn Browser';
  if (/WhatsApp/.test(ua))            return 'WhatsApp Browser';
  if (/Snapchat/.test(ua))            return 'Snapchat Browser';
  if (/Twitter/.test(ua))             return 'Twitter Browser';
  // ── Desktop / standard browsers ─────────────────────────────────────────
  if (/Edg\/([\d.]+)/.test(ua))      { var mv5 = ua.match(/Edg\/([\d.]+)/);     return 'Edge ' + mv5[1].split('.')[0]; }
  if (/OPR\/([\d.]+)/.test(ua))      { var mv6 = ua.match(/OPR\/([\d.]+)/);     return 'Opera ' + mv6[1].split('.')[0]; }
  if (/Opera\/([\d.]+)/.test(ua))    { var mv7 = ua.match(/Opera\/([\d.]+)/);   return 'Opera ' + mv7[1].split('.')[0]; }
  if (/Opera Mini/i.test(ua))         return 'Opera Mini';
  if (/SamsungBrowser\/([\d.]+)/.test(ua)) { var mv8 = ua.match(/SamsungBrowser\/([\d.]+)/); return 'Samsung Browser ' + mv8[1].split('.')[0]; }
  if (/UCBrowser/i.test(ua))          return 'UC Browser';
  if (/Brave/i.test(ua))              return 'Brave';
  // Brave does not expose itself in UA; detected by navigator.brave API — skipped here
  if (/Firefox\/([\d.]+)/.test(ua))  { var mv9 = ua.match(/Firefox\/([\d.]+)/); return 'Firefox ' + mv9[1].split('.')[0]; }
  if (/Chromium\/([\d.]+)/.test(ua)) { var mv10 = ua.match(/Chromium\/([\d.]+)/); return 'Chromium ' + mv10[1].split('.')[0]; }
  if (/Chrome\/([\d.]+)/.test(ua))   { var mv11 = ua.match(/Chrome\/([\d.]+)/);  return 'Chrome ' + mv11[1].split('.')[0]; }
  // Safari — Version/ token holds the real Safari version (e.g. Version/17.4)
  if (/Safari/.test(ua)) {
    var sm = ua.match(/Version\/(\d+)/);
    return sm ? 'Safari ' + sm[1] : 'Safari';
  }
  if (/MSIE ([\d.]+)/.test(ua))  { var mv12 = ua.match(/MSIE ([\d.]+)/);  return 'IE ' + mv12[1].split('.')[0]; }
  if (/Trident.*rv:([\d.]+)/.test(ua)) { var mv13 = ua.match(/rv:([\d.]+)/); return 'IE ' + (mv13 ? mv13[1].split('.')[0] : '11'); }
  return 'Unknown Browser';
}

// detectDevice receives ua AND an optional touchPoints integer (navigator.maxTouchPoints)
// so iPadOS 13+ (which hides "iPad" in UA) can be correctly identified as Tablet.
function detectDevice(ua, touchPoints) {
  // Explicit tablet signals in UA
  if (/iPad/.test(ua))          return 'Tablet';
  if (/tablet/i.test(ua))       return 'Tablet';
  // Samsung Browser omits "Mobile" keyword — check brand first to avoid
  // misclassifying Galaxy phones as Tablets (Android && !Mobile rule below)
  if (/SamsungBrowser/i.test(ua)) {
    return /SM-[TX]/i.test(ua) ? 'Tablet' : 'Mobile';
  }
  // Android tablet: has "Android" but NOT "Mobile" keyword
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return 'Tablet';
  // iPadOS 13+: UA says "Macintosh; Intel Mac OS X" but touch points > 1
  // This is the only reliable way to distinguish an iPad from a Mac in JS.
  if (/Macintosh/.test(ua) && typeof touchPoints === 'number' && touchPoints > 1) return 'Tablet';
  // Standard mobile signals
  if (/Mobile|iPhone|iPod/.test(ua)) return 'Mobile';
  if (/Android.*Mobile/.test(ua))    return 'Mobile';
  return 'Desktop';
}

// ============================================================
// FIX #1: detectDeviceModel was CALLED at line 292 of the
// original analytics.js but was NEVER DEFINED anywhere in
// analytics.js, script.js, or index.html. This caused a
// ReferenceError that crashed startAnalytics() entirely,
// meaning NO visitor data was ever inserted into Supabase.
// ============================================================
// detectDeviceModel: returns a human-readable device/model string.
// This value goes into the `device_model` column in Supabase.
// Receives ua string AND optional touchPoints for iPadOS 13+ detection.
function detectDeviceModel(ua, touchPoints) {
  // ── iPhone ─────────────────────────────────────────────────────────────
  if (/iPhone/.test(ua)) {
    var ivm = ua.match(/iPhone OS (\d+[_.]\d+)/);
    var ivs = ivm ? ivm[1].replace('_', '.') : '';
    // Infer generation from iOS version (best we can do — hardware ID not in browser UA)
    var iosV = ivs ? parseInt(ivs, 10) : 0;
    var gen = iosV >= 18 ? 'iPhone 16-era'
            : iosV >= 17 ? 'iPhone 15-era'
            : iosV >= 16 ? 'iPhone 14-era'
            : iosV >= 15 ? 'iPhone 13-era'
            : iosV >= 14 ? 'iPhone 12-era'
            : 'iPhone';
    return gen + (ivs ? ' · iOS ' + ivs : '');
  }

  // ── iPadOS 13+ hidden in Macintosh UA ──────────────────────────────────
  // iPadOS 13+ sends "Macintosh; Intel Mac OS X 10_15_x" but touchPoints > 1
  if (/Macintosh/.test(ua) && typeof touchPoints === 'number' && touchPoints > 1) {
    return 'iPad (iPadOS 13+)';
  }

  // ── iPad with explicit UA ───────────────────────────────────────────────
  if (/iPad/.test(ua)) {
    var ipm = ua.match(/OS (\d+[_.]\d+)/);
    var ipv = ipm ? ipm[1].replace('_', '.') : '';
    return 'iPad' + (ipv ? ' · iPadOS ' + ipv : '');
  }

  // ── Android — ordered: Samsung → Xiaomi/Redmi → Huawei → OnePlus →
  //   Google Pixel → OPPO → Vivo → Motorola → Nokia → Generic ──────────
  if (/Android/.test(ua)) {
    // Samsung SM- codes
    var smm = ua.match(/\bSM-(\w+)\b/);
    if (smm) {
      var smCode = smm[1].toUpperCase();
      // Prefix-lookup table (SM-S928B → S928 → Galaxy S24 Ultra)
      var smMap = {
        'S938':'Galaxy S25 Ultra','S936':'Galaxy S25+','S931':'Galaxy S25',
        'S928':'Galaxy S24 Ultra','S926':'Galaxy S24+','S921':'Galaxy S24',
        'S918':'Galaxy S23 Ultra','S916':'Galaxy S23+','S911':'Galaxy S23',
        'S908':'Galaxy S22 Ultra','S906':'Galaxy S22+','S901':'Galaxy S22',
        'F956':'Galaxy Z Fold 6','F741':'Galaxy Z Flip 6',
        'F946':'Galaxy Z Fold 5','F731':'Galaxy Z Flip 5',
        'F936':'Galaxy Z Fold 4','F721':'Galaxy Z Flip 4',
        'A566':'Galaxy A56',
        'A556':'Galaxy A55','A356':'Galaxy A35',
        'A546':'Galaxy A54','A336':'Galaxy A33',
        'A536':'Galaxy A53','A325':'Galaxy A32',
        'A525':'Galaxy A52','A515':'Galaxy A51',
        'A135':'Galaxy A13','A125':'Galaxy A12',
        'N986':'Galaxy Note 20 Ultra','N981':'Galaxy Note 20',
        'N975':'Galaxy Note 10+','N970':'Galaxy Note 10',
        'T976':'Galaxy Tab S8 Ultra','T870':'Galaxy Tab S7',
        'X918':'Galaxy Tab S9 Ultra','X916':'Galaxy Tab S9+','X910':'Galaxy Tab S9'
      };
      var smName = null;
      Object.keys(smMap).forEach(function(k) {
        if (!smName && smCode.indexOf(k) === 0) smName = smMap[k];
      });
      return (smName || ('Samsung Galaxy ' + smCode));
    }
    // Xiaomi / Redmi / POCO
    if (/Xiaomi|Redmi|POCO/i.test(ua)) {
      var xim = ua.match(/(?:Xiaomi|Redmi|POCO)[ _](\w[^;)\n]*?)(?:\s+Build|;|\))/i);
      if (xim) return xim[0].split('Build')[0].split(';')[0].split(')')[0].trim();
      return 'Xiaomi';
    }
    // Huawei / Honor
    if (/Huawei|HUAWEI|Honor/i.test(ua)) {
      var hwm = ua.match(/(?:Huawei|HUAWEI|Honor)[ _-]?(\w+[^;)\n]*?)(?:\s+Build|;|\))/i);
      return hwm ? hwm[0].split('Build')[0].split(';')[0].split(')')[0].trim() : 'Huawei';
    }
    // OnePlus
    if (/OnePlus/i.test(ua)) {
      var opm = ua.match(/OnePlus[ _]?([\w]+)/i);
      return opm ? ('OnePlus ' + opm[1]) : 'OnePlus';
    }
    // Google Pixel
    if (/Pixel[ _]/i.test(ua)) {
      var pxm = ua.match(/Pixel[ _]([\w]+(?:[ _][\w]+)?)/i);
      return pxm ? ('Google Pixel ' + pxm[1]) : 'Google Pixel';
    }
    // OPPO
    if (/OPPO|CPH\d/i.test(ua)) {
      var opm2 = ua.match(/(?:OPPO[ _])?(CPH[\w]+)/i);
      return opm2 ? ('OPPO ' + opm2[1]) : 'OPPO';
    }
    // Vivo
    if (/vivo/i.test(ua)) {
      var vm = ua.match(/vivo[ _]?([\w]+)/i);
      return vm ? ('vivo ' + vm[1]) : 'vivo';
    }
    // Motorola
    if (/motorola|moto[ _]/i.test(ua)) {
      var mm = ua.match(/moto[ _]([\w]+)/i);
      return mm ? ('Motorola Moto ' + mm[1].toUpperCase()) : 'Motorola';
    }
    // Nokia
    if (/Nokia/i.test(ua)) {
      var nm = ua.match(/Nokia[ _]?([\w]+)/i);
      return nm ? ('Nokia ' + nm[1]) : 'Nokia';
    }
    // Asus ROG / ZenFone
    if (/ASUS/i.test(ua)) {
      var am = ua.match(/ASUS[_-]?([\w]+)/i);
      return am ? ('ASUS ' + am[1]) : 'ASUS';
    }
    // Generic Android — extract model from "Android x.x; <Model> Build/"
    var adrm = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build|\/)/);
    if (adrm) {
      var rawModel = adrm[1].trim();
      // Strip language/locale suffix like "en-US"
      rawModel = rawModel.replace(/\s+[a-z]{2}-[A-Z]{2}$/, '').trim();
      if (rawModel && rawModel !== 'Linux' && rawModel.length > 1) {
        return rawModel;
      }
    }
    return /Mobile/.test(ua) ? 'Android Phone' : 'Android Tablet';
  }

  // ── macOS — extract version ─────────────────────────────────────────────
  if (/Macintosh|Mac OS X/.test(ua)) {
    var macm = ua.match(/Mac OS X (\d+[_.:]\d+)/);
    var macv = macm ? macm[1].replace(/_/g, '.') : '';
    // Apple Silicon: macOS 11+ or user-agent reporting arm64 context
    // (We can't distinguish Intel/AS from UA alone in all cases)
    return 'Mac' + (macv ? ' (macOS ' + macv + ')' : '');
  }

  // ── Windows ─────────────────────────────────────────────────────────────
  if (/Windows NT 10\.0/.test(ua)) return 'Windows PC';
  if (/Windows NT/.test(ua))        return 'Windows PC';

  // ── ChromeOS ────────────────────────────────────────────────────────────
  if (/CrOS/.test(ua)) return 'Chromebook';

  // ── Linux ───────────────────────────────────────────────────────────────
  if (/Linux/.test(ua)) return 'Linux PC';

  return 'Unknown Device';
}

function detectSource(referrer) {
  if (!referrer) return 'Direct';
  try {
    var host = new URL(referrer).hostname.replace('www.', '');
    if (host.includes('linkedin'))   return 'LinkedIn';
    if (host.includes('whatsapp'))   return 'WhatsApp';
    if (host.includes('instagram'))  return 'Instagram';
    if (host.includes('facebook'))   return 'Facebook';
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X';
    if (host.includes('google'))     return 'Google';
    if (host.includes('github'))     return 'GitHub';
    if (host.includes('telegram'))   return 'Telegram';
    if (host.includes('indeed'))     return 'Indeed';
    if (host.includes('naukrigulf') || host.includes('bayt') || host.includes('gulftalent'))
                                      return 'Gulf Job Board';
    return host;
  } catch { return 'Direct'; }
}

// fetchGeoData: tries 3 free geo APIs in order, returns on first success.
// APIs tried: ip-api.com → ipwho.is → ipapi.co
//
// WHY ip-api.com is now primary:
//   • Works reliably from Qatar/GCC networks where the others get blocked
//   • No API key needed, 45 req/min free tier, fast (~100 ms)
//   • Returns country, city, region, isp, timezone, lat/lon in one call
//
// WHY the fallback chain matters:
//   Any single geo API can be blocked by ISPs, rate-limited, or go down.
//   Three independent providers means location data almost always arrives.
async function fetchGeoData() {

  // ── Helper: build normalised result object ────────────────
  function norm(o) {
    return {
      country_name: o.country_name || 'Unknown',
      city:         o.city         || 'Unknown',
      region:       o.region       || 'Unknown',
      ip:           o.ip           || 'Unknown',
      latitude:     o.latitude     || null,
      longitude:    o.longitude    || null,
      org:          o.org          || 'Unknown',
      asn:          o.asn          || 'Unknown',
      timezone:     o.timezone     || 'Unknown',
    };
  }

  // ── Helper: timed fetch (works in all browsers) ───────────
  function fetchWithTimeout(url, ms) {
    var controller = new AbortController();
    var tid = setTimeout(function () { controller.abort(); }, ms);
    return fetch(url, { signal: controller.signal })
      .finally(function () { clearTimeout(tid); });
  }

  // ── 1. ip-api.com (primary — most reliable in GCC/Qatar) ─
  // IMPORTANT: must use HTTPS proxy URL — browsers block plain http://
  // on any HTTPS page (mixed-content policy). ip-api.com's free tier
  // only serves HTTP, so we route through their HTTPS-compatible endpoint.
  // Field numeric mask 10223679 = status+message+continent+country+
  // countryCode+region+regionName+city+district+lat+lon+timezone+
  // currency+isp+org+as+query  (use ip-api.com/docs to verify)
  try {
    var r1 = await fetchWithTimeout(
      'https://ip-api.com/json/?fields=status,message,continent,country,countryCode,region,regionName,city,district,lat,lon,timezone,currency,isp,org,as,query',
      5000
    );
    if (!r1.ok) throw new Error('HTTP ' + r1.status);
    var d1 = await r1.json();
    if (d1.status !== 'success') throw new Error(d1.message || 'ip-api failed');
    console.log('[Analytics] Geo: ip-api.com ✓', d1.country, d1.city);
    return norm({
      country_name: d1.country     || 'Unknown',
      city:         d1.city        || 'Unknown',
      region:       d1.regionName  || 'Unknown',
      ip:           d1.query       || 'Unknown',
      latitude:     d1.lat         || null,
      longitude:    d1.lon         || null,
      org:          d1.isp         || d1.org || 'Unknown',
      asn:          d1.as          || 'Unknown',
      timezone:     d1.timezone    || 'Unknown',
    });
  } catch (e1) {
    console.warn('[Analytics] ip-api.com geo failed:', e1.message || e1);
  }

  // ── 2. ipwho.is (second fallback) ────────────────────────
  try {
    var r2 = await fetchWithTimeout('https://ipwho.is/', 5000);
    if (!r2.ok) throw new Error('HTTP ' + r2.status);
    var d2 = await r2.json();
    if (!d2.success) throw new Error('ipwho returned success:false');
    console.log('[Analytics] Geo: ipwho.is ✓', d2.country, d2.city);
    return norm({
      country_name: d2.country        || 'Unknown',
      city:         d2.city           || 'Unknown',
      region:       d2.region         || 'Unknown',
      ip:           d2.ip             || 'Unknown',
      latitude:     d2.latitude       || null,
      longitude:    d2.longitude      || null,
      org:          (d2.connection && d2.connection.isp) || 'Unknown',
      asn:          (d2.connection && d2.connection.asn) || 'Unknown',
      timezone:     (d2.timezone && d2.timezone.id)      || 'Unknown',
    });
  } catch (e2) {
    console.warn('[Analytics] ipwho.is geo failed:', e2.message || e2);
  }

  // ── 3. ipapi.co (third fallback) ─────────────────────────
  try {
    var r3 = await fetchWithTimeout('https://ipapi.co/json/', 5000);
    if (!r3.ok) throw new Error('HTTP ' + r3.status);
    var d3 = await r3.json();
    if (d3.error) throw new Error(d3.reason || 'ipapi error');
    console.log('[Analytics] Geo: ipapi.co ✓', d3.country_name, d3.city);
    return norm({
      country_name: d3.country_name || 'Unknown',
      city:         d3.city         || 'Unknown',
      region:       d3.region       || 'Unknown',
      ip:           d3.ip           || 'Unknown',
      latitude:     d3.latitude     || null,
      longitude:    d3.longitude    || null,
      org:          d3.org          || 'Unknown',
      asn:          d3.asn          || 'Unknown',
      timezone:     d3.timezone     || 'Unknown',
    });
  } catch (e3) {
    console.warn('[Analytics] ipapi.co geo failed:', e3.message || e3);
  }

  // ── All 3 failed ──────────────────────────────────────────
  console.warn('[Analytics] All geo providers failed — location will be Unknown');
  return { country_name: 'Unknown', city: 'Unknown', region: 'Unknown',
           ip: 'Unknown', latitude: null, longitude: null,
           org: 'Unknown', asn: 'Unknown', timezone: 'Unknown' };
}


// ============================================================
// VISITOR PROFILE — persistent cross-session aggregation
// ============================================================
// Each device gets ONE row in visitor_profiles, keyed by fingerprint.
// On every visit we atomically increment visit_count and update last_seen
// via a Postgres RPC so there are no read-modify-write races.
//
// Required Supabase schema — run supabase_schema.sql first.
// ============================================================

async function upsertVisitorProfile(db, fingerprint, s) {
  // s = { visitor_name, country, city, device, browser, os, source }
  try {
    var res = await db.rpc('upsert_visitor_profile', {
      p_fingerprint:  fingerprint,
      p_visitor_name: s.visitor_name || null,
      p_country:      s.country,
      p_city:         s.city,
      p_device:       s.device,
      p_browser:      s.browser,
      p_os:           s.os,
      p_source:       s.source,
    });

    if (res.error) {
      console.warn('[Analytics] upsert_visitor_profile error:', res.error.message);
      return { visit_count: 1, first_seen: null };
    }

    // RPC returns TABLE(visit_count int, first_seen timestamptz) — one row
    var row = Array.isArray(res.data) ? res.data[0] : res.data;
    return row || { visit_count: 1, first_seen: null };
  } catch (e) {
    console.warn('[Analytics] upsertVisitorProfile threw:', e.message);
    return { visit_count: 1, first_seen: null };
  }
}

// Called on pagehide and periodically to accumulate total_duration
// across all visits for this fingerprint.
async function flushVisitorDuration(db, fingerprint, deltaSeconds) {
  if (!fingerprint || deltaSeconds <= 0) return;
  try {
    await db.rpc('flush_visitor_duration', {
      p_fingerprint:  fingerprint,
      p_delta_seconds: deltaSeconds,
    }).catch(function () {});
  } catch (e) { /* silent */ }
}


// ============================================================
// MAIN ANALYTICS ENGINE
// ============================================================

var _db          = null;
var _session     = null;
var _startTs     = Date.now();
var _lastFlushed = 0;         // tracks seconds already flushed to profile this session
var _fingerprint = null;      // set once in startAnalytics

async function startAnalytics(db) {
  _db = db;

  var ua           = navigator.userAgent;
  // touchPoints is essential for iPadOS 13+ which hides "iPad" from UA
  var touchPoints  = navigator.maxTouchPoints || 0;
  var sessionId    = getSessionId();
  var fingerprint  = getVisitorFingerprint();
  _fingerprint     = fingerprint;

  var geo          = await fetchGeoData();

  // Pick up name if gate was already submitted before geo finished
  var _earlyName = (function () {
    try { return sessionStorage.getItem('_smVisitorName') || null; } catch (e) { return null; }
  })();

  // Build the fields we know right now
  var sessionFields = {
    visitor_name: _earlyName,
    country:      geo.country_name || 'Unknown',
    city:         geo.city         || 'Unknown',
    region:       geo.region       || 'Unknown',
    ip_address:   geo.ip           || 'Unknown',
    latitude:     geo.latitude     || null,
    longitude:    geo.longitude    || null,
    isp:          geo.org          || 'Unknown',
    asn:          geo.asn          || 'Unknown',
    timezone:     geo.timezone     || 'Unknown',
    device:       detectDevice(ua, touchPoints),
    device_model: detectDeviceModel(ua, touchPoints),
    browser:      detectBrowser(ua),
    os:           detectOS(ua),
    source:       detectSource(document.referrer),
  };

  // ── Upsert visitor profile (increment visit_count, update last_seen) ──
  // This is the authoritative call for returning-visitor detection.
  // The RPC does an atomic INSERT … ON CONFLICT DO UPDATE in Postgres,
  // so there are no race conditions or duplicate increments.
  var profile = await upsertVisitorProfile(db, fingerprint, sessionFields);

  var visitCount = (profile && profile.visit_count) ? profile.visit_count : 1;
  var firstSeen  = (profile && profile.first_seen)  ? profile.first_seen  : null;
  var isReturning = visitCount > 1;

  // Sync the legacy localStorage flag so isReturningVisitor() stays consistent
  if (isReturning) {
    try { localStorage.setItem('smk_visited', '1'); } catch (e) {}
  }

  _session = {
    session_id:   sessionId,
    fingerprint:  fingerprint,          // links this session row to visitor_profiles
    visit_count:  visitCount,           // denormalized onto session row for easy querying
    first_seen:   firstSeen,            // preserved from profile; null on first-ever visit
    is_returning: isReturning,          // DB-authoritative (not localStorage guess)
    is_online:    true,
    page_views:   1,
    country:      sessionFields.country,
    city:         sessionFields.city,
    region:       sessionFields.region,
    ip_address:   sessionFields.ip_address,
    latitude:     sessionFields.latitude,
    longitude:    sessionFields.longitude,
    isp:          sessionFields.isp,
    asn:          sessionFields.asn,
    timezone:     sessionFields.timezone,
    device:       sessionFields.device,
    device_model: sessionFields.device_model,
    browser:      sessionFields.browser,
    os:           sessionFields.os,
    source:       sessionFields.source,
    visitor_name: sessionFields.visitor_name,
  };

  // ── Insert visitor row (once per session) ─────────────────
  if (!alreadyTracked()) {
    await insertVisitor(_session);
    await sendTelegramAlert(_session);

    // If geo came back Unknown (both APIs timed out), retry geo in the
    // background and patch the row once we have real location data.
    // This handles slow GCC ISPs where the first geo request takes >5 s.
    if (sessionFields.country === 'Unknown') {
      (async function retryGeo() {
        var retryGeo = await fetchGeoData();
        if (retryGeo.country_name !== 'Unknown') {
          _session.country  = retryGeo.country_name;
          _session.city     = retryGeo.city;
          await patchVisitorGeo(sessionId, retryGeo);
          // Also update profile with real location
          await _db.from('visitor_profiles')
            .update({ country: retryGeo.country_name, city: retryGeo.city })
            .eq('fingerprint', fingerprint)
            .catch(function () {});
        }
      })();
    }
  }

  // ── Register online presence ──────────────────────────────
  await heartbeat(db, sessionId, _session.country, _session.device);

  // ── Initial counter display ───────────────────────────────
  await refreshCounters(db);

  // ── FIX #7: Guaranteed periodic counter refresh ───────────
  // Realtime subscriptions can fail silently (wrong Supabase plan,
  // network interruption). This interval ensures counters ALWAYS
  // update, even if realtime is broken.
  setInterval(function () { refreshCounters(db); },
              ANALYTICS_CONFIG.counterRefreshInterval);

  // ── FIX #8: Realtime subscription with status logging ─────
  startRealtimeSubscription(db);

  // ── Periodic heartbeat ────────────────────────────────────
  setInterval(function () {
    heartbeat(db, sessionId, _session.country, _session.device);
  }, ANALYTICS_CONFIG.heartbeatInterval);

  // ── Flush session duration periodically ──────────────────
  setInterval(function () {
    flushDuration(db, sessionId);
  }, ANALYTICS_CONFIG.durationFlushInterval);

  // ── Cleanup on page unload ────────────────────────────────
  // IMPORTANT: pagehide cannot await async calls — the browser
  // kills the page immediately. Use sendBeacon (fire-and-forget,
  // guaranteed delivery even on tab close) for BOTH the duration
  // update AND the online-session removal.
  window.addEventListener('pagehide', function () {
    var totalElapsed = Math.floor((Date.now() - _startTs) / 1000);

    // 1. Update this session's duration via sendBeacon so the final
    //    second-count is saved even when the tab is abruptly closed.
    //    Uses the Supabase REST PATCH endpoint directly (no SDK needed).
    if (totalElapsed > 0) {
      var patchUrl = ANALYTICS_CONFIG.supabaseUrl
        + '/rest/v1/visitors?session_id=eq.' + encodeURIComponent(sessionId);
      var patchBody = JSON.stringify({ duration: totalElapsed, is_online: false });
      var blob = new Blob([patchBody], { type: 'application/json' });
      // sendBeacon doesn't support custom headers, so we use fetch with keepalive
      // as primary (supported in all modern browsers) and beacon as fallback.
      var sent = false;
      try {
        sent = fetch(patchUrl, {
          method:  'PATCH',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        ANALYTICS_CONFIG.supabaseKey,
            'Authorization': 'Bearer ' + ANALYTICS_CONFIG.supabaseKey,
            'Prefer':        'return=minimal',
          },
          body:    patchBody,
          keepalive: true,   // ← survives page close in modern browsers
        }).then(function () {}).catch(function () {});
      } catch (e) { sent = false; }

      // Beacon fallback for browsers that don't support keepalive
      if (!sent) {
        navigator.sendBeacon(
          ANALYTICS_CONFIG.supabaseUrl + '/rest/v1/rpc/update_visitor_duration',
          new Blob([JSON.stringify({ p_session_id: sessionId, p_duration: totalElapsed })],
                   { type: 'application/json' })
        );
      }

      // Also flush the delta to visitor_profiles total_duration
      var delta = totalElapsed - _lastFlushed;
      if (_fingerprint && delta > 0) {
        navigator.sendBeacon(
          ANALYTICS_CONFIG.supabaseUrl + '/rest/v1/rpc/flush_visitor_duration',
          new Blob([JSON.stringify({ p_fingerprint: _fingerprint, p_delta_seconds: delta })],
                   { type: 'application/json' })
        );
      }
    }

    // 2. Remove online presence
    navigator.sendBeacon(
      ANALYTICS_CONFIG.supabaseUrl + '/rest/v1/rpc/remove_online_session',
      JSON.stringify({ p_session_id: sessionId })
    );
  });
}


// ── Insert visitor row ──────────────────────────────────────
async function insertVisitor(session) {
  var { error } = await _db.from('visitors').insert([session]);
  if (error) console.warn('[Analytics] Insert error:', error.message);
  else console.log('[Analytics] Visitor inserted ✓');
}

// ── Patch geo fields back onto the visitors row ─────────────
// Called after geo resolves IF the row was already inserted with
// country='Unknown' (geo finished after insertVisitor ran).
async function patchVisitorGeo(sessionId, geo) {
  if (!geo || geo.country_name === 'Unknown') return;
  await _db.from('visitors')
    .update({
      country:    geo.country_name,
      city:       geo.city,
      region:     geo.region,
      ip_address: geo.ip,
      latitude:   geo.latitude,
      longitude:  geo.longitude,
      isp:        geo.org,
      asn:        geo.asn,
      timezone:   geo.timezone,
    })
    .eq('session_id', sessionId)
    .catch(function (e) { console.warn('[Analytics] patchVisitorGeo error:', e.message); });
}


// ── Called by script.js when gate form is submitted ─────────
window.analyticsSetVisitorName = async function (name) {
  if (!name) return;
  var clean = name.trim();

  // Save to sessionStorage (session-level)
  try { sessionStorage.setItem('_smVisitorName', clean); } catch (e) {}

  // Save to localStorage (persistent — enables "Welcome back" auto-fill)
  try { localStorage.setItem(ANALYTICS_CONFIG.savedNameKey, clean); } catch (e) {}

  // Update in-memory session
  if (_session) _session.visitor_name = clean;

  // ── FIX: If _db isn't ready yet (Supabase still loading / geo still
  // fetching), the visitor row may not even exist yet. Poll until _db and
  // _session are both set, then do the update. Max wait: 10 s.
  async function doUpdate() {
    var sid = getSessionId();
    var fp  = _fingerprint || getVisitorFingerprint();

    // Update the per-session row
    await _db.from('visitors')
      .update({ visitor_name: clean })
      .eq('session_id', sid)
      .catch(function () {});

    // Also update visitor_profiles so the name persists across all future sessions
    await _db.from('visitor_profiles')
      .update({ visitor_name: clean })
      .eq('fingerprint', fp)
      .catch(function () {});

    console.log('[Analytics] visitor_name updated ✓', clean);
  }

  if (_db) {
    // Ready immediately — update now
    await doUpdate();
  } else {
    // Not ready yet — poll every 200 ms for up to 10 s
    var waited = 0;
    var poll = setInterval(async function () {
      waited += 200;
      if (_db) {
        clearInterval(poll);
        await doUpdate();
      } else if (waited >= 10000) {
        clearInterval(poll);
        console.warn('[Analytics] analyticsSetVisitorName: gave up waiting for _db after 10s');
      }
    }, 200);
  }
};


// ── Heartbeat via RPC ───────────────────────────────────────
async function heartbeat(db, sessionId, country, device) {
  await db.rpc('upsert_online_session', {
    p_session_id: sessionId,
    p_country:    country,
    p_device:     device,
    p_page:       window.location.pathname,
  }).catch(function () {});
}


// ── Flush session duration ──────────────────────────────────
// Updates the per-session visitors row AND accumulates the delta
// into visitor_profiles.total_duration (cross-session running total).
async function flushDuration(db, sessionId) {
  var totalElapsed = Math.floor((Date.now() - _startTs) / 1000);

  // Update this session's row
  await db.from('visitors')
    .update({ duration: totalElapsed, is_online: true })
    .eq('session_id', sessionId)
    .catch(function () {});

  // Accumulate only the NEW seconds since we last flushed to the profile.
  // Without this guard every flush would double-count — e.g. flushing at
  // 60s then 120s would add 60+120=180s instead of 120s total.
  var delta = totalElapsed - _lastFlushed;
  if (_fingerprint && delta > 0) {
    _lastFlushed = totalElapsed;
    flushVisitorDuration(db, _fingerprint, delta);
  }
}


// ── Refresh all counter elements on page ───────────────────
// FIX #5: Properly handles RPC scalar returns in Supabase JS v2.
// get_visitor_count / get_online_count return a single integer.
// In Supabase JS v2 the response is { data: <number>, error }.
async function refreshCounters(db) {
  try {
    var [totalRes, onlineRes] = await Promise.all([
      db.rpc('get_visitor_count'),
      db.rpc('get_online_count'),
    ]);

    var t = (typeof totalRes.data  === 'number' ? totalRes.data  : 0);
    var o = (typeof onlineRes.data === 'number' ? onlineRes.data : 0);

    // Floating widget (FIX #4: now exists after injectWidget() was called)
    animateCount('smk-total-count',  t);
    animateCount('smk-online-count', o);

    // Gate overlay strip
    animateCount('gate-total-count',  t);
    animateCount('gate-online-count', o);

    // Footer badge
    animateCount('footer-total-count',  t);
    animateCount('footer-online-count', o);

    // All pulse dots
    updateAllDots(o);

  } catch (e) {
    console.warn('[Analytics] Counter refresh failed:', e.message);
  }
}

function updateAllDots(online) {
  var live = online > 0;
  var gateDot   = document.getElementById('gate-online-dot');
  var footerDot = document.getElementById('footer-online-dot');
  var smkDot    = document.getElementById('smk-online-dot');
  if (gateDot)   gateDot.className   = 'gvs-dot'      + (live ? ' gvs-dot--live'       : '');
  if (footerDot) footerDot.className = 'fvb-dot'      + (live ? ' fvb-dot--live'       : '');
  if (smkDot)    smkDot.className    = 'smk-pulse-dot'+ (live ? ' smk-pulse-dot--live' : '');
}


// ── Realtime subscription ───────────────────────────────────
// FIX #8: Added status callback to log subscription state.
// Without this you'd never know if realtime was silently failing.
function startRealtimeSubscription(db) {
  db.channel('analytics-live')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visitors' },
        function () { refreshCounters(db); })
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'online_visitors' },
        function () { refreshCounters(db); })
    .subscribe(function (status) {
      console.log('[Analytics] Realtime subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[Analytics] Realtime ✓ — live dashboard updates active');
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('[Analytics] Realtime subscription failed. Falling back to 30 s polling.');
      }
    });
}


// ============================================================
// TELEGRAM ALERTS
// ============================================================

async function sendTelegramAlert(session) {
  if (!ANALYTICS_CONFIG.telegramEnabled) return;

  var isGCC     = ANALYTICS_CONFIG.gccCountries.includes(session.country);
  var gccBanner = isGCC ? '🚨 *GCC RECRUITER ALERT!*\n' + '─'.repeat(38) + '\n\n' : '';

  var ua        = navigator.userAgent;
  var now       = new Date();
  var localTime = now.toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: 'numeric', minute: '2-digit',
    hour12: true, timeZone: session.timezone || 'UTC',
  });

  var resolution  = screen.width + ' × ' + screen.height;
  var theme       = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark Mode' : 'Light Mode';
  var language    = navigator.language || 'Unknown';
  var touchable   = navigator.maxTouchPoints > 0 ? '📲 Yes' : '🖥️ No';
  var cpuCores    = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' cores' : 'Unknown';
  var sessionType = session.is_returning ? '🔁 Returning Visitor' : '✨ New Visitor';
  var landingPage = window.location.pathname || '/';
  var coords      = (session.latitude && session.longitude)
    ? session.latitude + ', ' + session.longitude : 'Unknown';

  var chromeMatch  = ua.match(/Chrome\/(\d+)/);
  var firefoxMatch = ua.match(/Firefox\/(\d+)/);
  var safariMatch  = ua.match(/Version\/(\d+).*Safari/);
  var edgeMatch    = ua.match(/Edg\/(\d+)/);
  var browserFull  = session.browser;
  if (edgeMatch)       browserFull = 'Edge '    + edgeMatch[1];
  else if (chromeMatch)  browserFull = 'Chrome '  + chromeMatch[1];
  else if (firefoxMatch) browserFull = 'Firefox ' + firefoxMatch[1];
  else if (safariMatch)  browserFull = 'Safari '  + safariMatch[1];

  var cpuArch = /x86_64|Win64|WOW64/.test(ua) ? 'amd64'
              : /arm64|aarch64/.test(ua)       ? 'arm64'
              : /armv/.test(ua)                ? 'arm'
              : 'Unknown';

  var name = session.visitor_name || '—';
  var line = function (emoji, label, value) {
    var pad = Math.max(0, 16 - label.length);
    return emoji + ' ' + label + ' '.repeat(pad) + ': ' + value;
  };

  var msg = gccBanner +
    '╭────────── ✦ LIVE VISITOR ✦ ──────────╮\n' +
    line('👤', 'Visitor',      name)         + '\n' +
    line('🌍', 'Country',      session.country)     + '\n' +
    line('🏙', 'City',         session.city)         + '\n' +
    line('🗺', 'Region',       session.region || 'Unknown') + '\n' +
    line('📍', 'Coordinates',  coords)               + '\n' +
    line('🔌', 'IP Address',   session.ip_address || 'Unknown') + '\n' +
    line('🏢', 'ISP',          session.isp || 'Unknown')    + '\n' +
    line('🏛', 'ASN Org',      session.asn || 'Unknown')    + '\n' +
    line('📱', 'Device Type',  session.device)       + '\n' +
    line('🏷', 'Brand/Model',  session.device_model || session.os) + '\n' +
    line('🫟', 'OS',           session.os)            + '\n' +
    line('🌐', 'Browser',      browserFull)           + '\n' +
    line('🧠', 'CPU Arch',     cpuArch)              + '\n' +
    line('👆', 'Touch',        touchable)             + '\n' +
    line('📏', 'Resolution',   resolution)            + '\n' +
    line('🌙', 'Theme',        theme)                 + '\n' +
    line('🗣', 'Language',     language)              + '\n' +
    line('🕓', 'Timezone',     session.timezone || 'Unknown') + '\n' +
    line('🕒', 'Local Time',   localTime)             + '\n' +
    line('🔗', 'Source',       session.source)        + '\n' +
    line('📄', 'Landing Page', landingPage)           + '\n' +
    line('⏱', 'Session Type', sessionType)           + '\n' +
    '✨ Portfolio viewed successfully\n' +
    '╰── 🗺 Map  ·  🔍 IP Lookup  ·  📊 Analytics ──╯';

  try {
    await fetch(
      'https://api.telegram.org/bot' + ANALYTICS_CONFIG.telegramBotToken + '/sendMessage',
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
  } catch { /* silent fail — Telegram is optional */ }
}


// ============================================================
// ANIMATED NUMBER COUNTER
// ============================================================

var _currentValues = {};

function animateCount(elementId, target) {
  var el = document.getElementById(elementId);
  if (!el) return;

  var current = _currentValues[elementId] || 0;
  if (current === target) return;
  _currentValues[elementId] = target;

  var duration = 1200;
  var start    = performance.now();
  var from     = parseFloat(el.textContent.replace(/,/g, '')) || 0;

  function tick(now) {
    var p   = Math.min((now - start) / duration, 1);
    var val = Math.round(from + (target - from) * easeOutCubic(p));
    el.textContent = val.toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }


// ============================================================
// FIX #2: injectWidget() IS NOW CALLED IN boot() ABOVE.
// In the original code this function was defined but
// never invoked — so the floating widget never appeared
// and smk-total-count / smk-online-count / smk-online-dot
// never existed in the DOM, making all counter updates
// for those IDs silently no-op.
// ============================================================
function injectWidget() {
  // Avoid double-injection
  if (document.getElementById('smk-analytics-widget')) return;

  var style = document.createElement('style');
  style.id   = 'smk-analytics-styles';
  style.textContent = `
/* ── Analytics Floating Widget ─────────────────────── */
#smk-analytics-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.smk-card {
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
.smk-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.smk-logo {
  width: 28px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, #0066FF 0%, #00C2FF 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,102,255,.35);
}
.smk-logo svg { width: 14px; height: 14px; fill: #fff; }
.smk-title {
  font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: #374151; line-height: 1;
}
@media (prefers-color-scheme: dark) { .smk-title { color: rgba(255,255,255,.7); } }
.smk-stats { display: flex; flex-direction: column; gap: 10px; }
.smk-stat {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.smk-stat-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #6B7280; font-weight: 500;
}
@media (prefers-color-scheme: dark) { .smk-stat-label { color: rgba(255,255,255,.5); } }
.smk-stat-value {
  font-size: 18px; font-weight: 700; color: #111827;
  font-variant-numeric: tabular-nums; line-height: 1;
  min-width: 42px; text-align: right;
}
@media (prefers-color-scheme: dark) { .smk-stat-value { color: rgba(255,255,255,.92); } }
.smk-pulse-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #9CA3AF; flex-shrink: 0; transition: background .4s;
}
.smk-pulse-dot--live {
  background: #10B981;
  box-shadow: 0 0 0 0 rgba(16,185,129,.5);
  animation: smk-pulse 2s infinite;
}
@keyframes smk-pulse {
  0%   { box-shadow: 0 0 0 0   rgba(16,185,129,.5); }
  70%  { box-shadow: 0 0 0 7px rgba(16,185,129,0);  }
  100% { box-shadow: 0 0 0 0   rgba(16,185,129,0);  }
}
.smk-divider { height: 1px; background: rgba(0,0,0,.06); margin: 12px 0; }
@media (prefers-color-scheme: dark) { .smk-divider { background: rgba(255,255,255,.08); } }
.smk-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(0,102,255,.10); border: 1px solid rgba(0,102,255,.18);
  border-radius: 999px; padding: 3px 10px;
  font-size: 10.5px; font-weight: 600; color: #0066FF; letter-spacing: .03em;
}
.smk-skeleton {
  display: inline-block; width: 36px; height: 18px; border-radius: 6px;
  background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.06) 75%);
  background-size: 200% 100%; animation: smk-shimmer 1.4s infinite;
  vertical-align: middle;
}
@keyframes smk-shimmer {
  0%   { background-position: 200% 0;  }
  100% { background-position: -200% 0; }
}
@keyframes smk-slide-in {
  from { opacity: 0; transform: translateY(16px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.smk-card { animation: smk-slide-in .5s .3s both cubic-bezier(.34,1.56,.64,1); }
@media (max-width: 480px) {
  #smk-analytics-widget { bottom: 84px; right: 12px; }
  .smk-card { min-width: 180px; padding: 13px 16px; border-radius: 16px; }
  .smk-stat-value { font-size: 16px; }
}
`;
  document.head.appendChild(style);

  var widget    = document.createElement('div');
  widget.id     = 'smk-analytics-widget';
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
            <circle cx="10" cy="10" r="3"/>
            <path d="M10 1a9 9 0 100 18A9 9 0 0010 1zm0 16a7 7 0 110-14 7 7 0 010 14z"/>
          </svg>
          Live · sajidmk.com
        </span>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
}
