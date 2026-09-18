// #############################################################################
// #  MASTER SCRIPT — script.js
// #  Merged from: script.js (original) + cv-gate.js
// #  ---------------------------------------------------------------------------
// #  TABLE OF CONTENTS (search for these exact tags to jump to a section):
// #    [SECTION: MAIN SITE SCRIPT]      -> everything from the original script.js
// #    [SECTION: CV / CERTIFICATE GATE] -> everything from cv-gate.js
// #
// #  NOTE: analytics.js is referenced by index.html but was never uploaded,
// #  so it isn't included here — it's still its own <script> tag in index.html.
// #############################################################################


// =============================================================================
// [SECTION: MAIN SITE SCRIPT]
// Source file: script.js (original, untouched below this line)
// =============================================================================

// ============================================================
// SAJID MEHMOOD · IT SYSTEMS ENGINEER
// script.js — Full Rewrite v2.2
// ============================================================


// ============================================================
// SECTION 0 · SMOOTH SCROLL
// ============================================================

(function () {
  var navH = function () {
    var nav = document.getElementById('topNav');
    return nav ? nav.offsetHeight : 68;
  };

  function scrollTo(href) {
    if (!href || href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var target = document.querySelector(href);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH() - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('.nav-anchor');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    scrollTo(href);
  }, true);
})();


// ============================================================
// SECTION 0A · TRACKPAD-STYLE HAPTIC FEEDBACK (Android only —
// iOS Safari blocks the Vibration API; CSS :active press still fires there)
// ============================================================

(function () {
  if (!('vibrate' in navigator)) return;

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return; // real trackpad/mouse: no buzz needed
    var el = e.target.closest('button, .nav-anchor, [role="tab"], .exp-tab, .edu-tab, .fab-main, .gate-btn');
    if (!el) return;

    var strong = el.id === 'reviewSubmitBtn' || el.classList.contains('gate-btn');
    try { navigator.vibrate(strong ? 18 : 10); } catch (err) {}
  }, { passive: true });
})();


// ============================================================
// SECTION 0B · SCROLL PROGRESS BAR
// ============================================================

(function () {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  var _raf = false;
  window.addEventListener('scroll', function () {
    if (_raf) return;
    _raf = true;
    requestAnimationFrame(function () {
      _raf = false;
      var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    });
  }, { passive: true });
})();


// ============================================================
// SECTION 0C · INTERACTIVE HERO BACKGROUND — Advanced Canvas
// ============================================================

(function () {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, mouse = { x: -999, y: -999 }, time = 0;
  var isMobile = window.innerWidth < 768;
  var COUNT = isMobile ? 55 : 120;
  var particles = [], waves = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', function () { resize(); isMobile = window.innerWidth < 768; }, { passive: true });
  // Cursor-reactivity removed — the ambient background must stay fully
  // independent of pointer position. `mouse` stays at its off-screen
  // default so any remaining distance checks below never trigger.

  function Particle() { this.reset(true); }
  Particle.prototype.reset = function (randomY) {
    this.x  = Math.random() * (W || 1200);
    this.y  = randomY ? Math.random() * (H || 800) : H + 20;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.5 + 0.1);
    this.r  = Math.random() * 2 + 0.5;
    this.life = Math.random() * 0.5 + 0.2;
    this.maxLife = this.life;
    // Unified blue palette — no purple/violet noise
    this.hue = [210, 212, 215][Math.floor(Math.random() * 3)];
    this.sat = Math.floor(Math.random() * 15) + 30;  // 30–45% subtle
    this.lit = Math.floor(Math.random() * 10) + 55;  // 55–65% mid
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = Math.random() * 0.04 + 0.01;
    this.type = Math.random() > 0.85 ? 'diamond' : 'circle';
  };
  Particle.prototype.update = function () {
    this.twinkle += this.twinkleSpeed;
    var dx = this.x - mouse.x, dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 160 && dist > 0) {
      var f = (160 - dist) / 160 * 0.7;
      this.vx += (dx / dist) * f * 0.08;
      this.vy += (dy / dist) * f * 0.08;
    }
    this.vx *= 0.97; this.vy *= 0.97;
    this.x += this.vx; this.y += this.vy;
    this.life -= 0.001;
    if (this.life <= 0 || this.x < -30 || this.x > W + 30 || this.y < -30) this.reset(false);
  };
  Particle.prototype.draw = function () {
    var twinkleAlpha = (Math.sin(this.twinkle) * 0.2 + 0.6) * (this.life / this.maxLife);
    ctx.save();
    if (this.type === 'diamond') {
      var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
      grd.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.25) + ')');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2); ctx.fill();
      ctx.translate(this.x, this.y); ctx.rotate(Math.PI / 4 + this.twinkle * 0.1);
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.65) + ')';
      ctx.fillRect(-this.r * 1.2, -this.r * 1.2, this.r * 2.4, this.r * 2.4);
    } else {
      var grd2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      grd2.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.15) + ')');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.7) + ')';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  function Wave(y, amp, speed, color, opacity) {
    this.y = y; this.amp = amp; this.speed = speed;
    this.color = color; this.opacity = opacity; this.offset = Math.random() * Math.PI * 2;
  }
  Wave.prototype.draw = function (t) {
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    for (var x = 0; x <= W; x += 4) {
      var mouseInfluence = 0;
      if (Math.abs(mouse.y - this.y) < 120) {
        var mdx = x - mouse.x;
        mouseInfluence = Math.exp(-mdx * mdx / 20000) * (120 - Math.abs(mouse.y - this.y)) * 0.3;
      }
      ctx.lineTo(x, this.y + Math.sin(x * 0.008 + t * this.speed + this.offset) * this.amp
                    + Math.sin(x * 0.015 + t * this.speed * 0.7 + this.offset) * this.amp * 0.4
                    + mouseInfluence);
    }
    ctx.strokeStyle = this.color.replace('OPACITY', this.opacity);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  function DataStream() {
    this.x = Math.random() * (W || 1200);
    this.y = Math.random() * (H || 800);
    this.speed = Math.random() * 1.5 + 0.5;
    this.chars = '01'.split('');
    this.length = Math.floor(Math.random() * 10) + 5;
    this.opacity = Math.random() * 0.04 + 0.01; // halved — barely visible texture
    this.hue = 210; // single unified blue, no teal/purple split
    this.fontSize = Math.floor(Math.random() * 5) + 8;
  }
  DataStream.prototype.update = function () {
    this.y += this.speed;
    if (this.y > H + this.length * this.fontSize) {
      this.y = -this.length * this.fontSize;
      this.x = Math.random() * W;
    }
  };
  DataStream.prototype.draw = function () {
    ctx.font = this.fontSize + 'px "DM Mono", monospace';
    for (var i = 0; i < this.length; i++) {
      var alpha = this.opacity * (1 - i / this.length) * (i === 0 ? 3 : 1);
      ctx.fillStyle = 'hsla(' + this.hue + ',70%,70%,' + Math.min(alpha, 0.25) + ')';
      ctx.fillText(this.chars[Math.floor(Math.random() * this.chars.length)], this.x, this.y - i * this.fontSize);
    }
  };

  for (var i = 0; i < COUNT; i++) particles.push(new Particle());
  var LINK_DIST = isMobile ? 80 : 120;

  var waveColors = [
    'hsla(210, 20%, 80%, OPACITY)', // Soft Grey-Blue
    'hsla(0, 0%, 90%, OPACITY)',    // Soft White
    'hsla(210, 30%, 85%, OPACITY)'  // Muted Silver
  ];
  waves.push(new Wave(0, 22, 0.25, waveColors[0], 0.035));
  waves.push(new Wave(0, 16, -0.18, waveColors[1], 0.028));
  waves.push(new Wave(0, 12, 0.32, waveColors[2], 0.022));

  function updateWavePositions() {
    waves[0].y = H * 0.55;
    waves[1].y = H * 0.65;
    waves[2].y = H * 0.72;
  }
  updateWavePositions();
  window.addEventListener('resize', updateWavePositions, { passive: true });

  var streams = [];
  if (!isMobile) {
    for (var s = 0; s < 18; s++) streams.push(new DataStream());
  }

  function drawConnections() {
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          var op = (1 - d / LINK_DIST) * 0.10;
          var life = Math.min(particles[a].life / particles[a].maxLife, particles[b].life / particles[b].maxLife);
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'hsla(212, 40%, 65%,' + (op * life) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawAurora(t) {
    var aurora1 = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
    aurora1.addColorStop(0,   'hsla(210,40%,70%,0)');
    aurora1.addColorStop(0.3, 'hsla(212,35%,72%,' + (0.018 + 0.008 * Math.sin(t * 0.003)) + ')');
    aurora1.addColorStop(0.6, 'hsla(215,30%,75%,' + (0.012 + 0.006 * Math.cos(t * 0.004)) + ')');
    aurora1.addColorStop(1,   'hsla(210,25%,78%,0)');
    ctx.fillStyle = aurora1;
    ctx.fillRect(0, 0, W, H);
    if (mouse.x > 0) {
      var grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
      grd.addColorStop(0, 'hsla(212,40%,68%,0.03)');
      grd.addColorStop(0.5, 'hsla(210,30%,72%,0.015)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawHexGrid(t) {
    if (isMobile) return;
    var size = 45, cols = Math.ceil(W / (size * 1.75)) + 1, rows = Math.ceil(H / (size * 1.5)) + 1;
    ctx.lineWidth = 0.4;
    for (var row = -1; row < rows; row++) {
      for (var col = -1; col < cols; col++) {
        var cx = col * size * 1.73 + (row % 2 === 0 ? 0 : size * 0.865);
        var cy = row * size * 1.5;
        var dx = cx - mouse.x, dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var pulse = Math.sin(t * 0.008 + cx * 0.008 + cy * 0.006) * 0.5 + 0.5;
        var alpha = 0.015 + pulse * 0.012;
        if (dist < 220) alpha += (1 - dist / 220) * 0.025;
        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
          var angle = (Math.PI / 3) * k;
          var hx = cx + size * Math.cos(angle), hy = cy + size * Math.sin(angle);
          k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(212,35%,68%,' + alpha + ')';
        ctx.stroke();
      }
    }
  }

  function frame() {
    time++;
    ctx.clearRect(0, 0, W, H);
    drawAurora(time);
    drawHexGrid(time);
    if (!isMobile) { streams.forEach(function (s) { s.update(); s.draw(); }); }
    waves.forEach(function (w) { w.draw(time); });
    drawConnections();
    particles.forEach(function (p) { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ============================================================
// GATE OVERLAY — chat-style name-entry (new design)
// ============================================================

/* ================================================================
   GATE OVERLAY — simple card name-entry (from mixed_index)
================================================================ */

// ── Singleton analytics Supabase client (shared across this page) ──
// Created once; reused by _writeVisitorName and any other gate code.
// Prevents a new connection being spawned on every name submission.
let _gateAnalyticsDb = null;
function _getGateAnalyticsDb() {
  if (_gateAnalyticsDb) return _gateAnalyticsDb;
  if (!window.supabase) return null;
  _gateAnalyticsDb = window.supabase.createClient(
    'https://tbdgrhekycgfdeatxjnq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU',
    { auth: { persistSession: false } }
  );
  return _gateAnalyticsDb;
}

// ── How long we "remember" a visitor before asking their name again ──
// Change to 24*60*60*1000 for daily, or leave at 7 days for weekly.
// NOTE: analytics.js has a matching constant — keep both in sync.
const GATE_REMEMBER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

(function () {
  const overlay      = document.getElementById('gate-overlay');
  const closeBtn     = document.getElementById('gateClose');
  const backdrop     = document.getElementById('gateBackdrop');
  const nameInput    = document.getElementById('visitorName');
  const continueBtn  = document.getElementById('gateContinueBtn');
  const doneBtn      = document.getElementById('gateDoneBtn');
  const gateAsk      = document.getElementById('gateAsk');
  const gateWelcome  = document.getElementById('gateWelcome');
  const welcomeName  = document.getElementById('welcomeName');

  if (!overlay) return;

  let triggered = false;
  let dismissed = false;

  // ── Admin bypass ──
  if (localStorage.getItem('admin-auth') === '1') {
    dismissed = true;
    triggered = true;
    if (!localStorage.getItem('sajid_visitor_name')) {
      localStorage.setItem('sajid_visitor_name', 'Sajid (Admin)');
    }
    sessionStorage.setItem('_smVisitorName', localStorage.getItem('sajid_visitor_name'));
    sessionStorage.setItem('sajid_visitor_name', localStorage.getItem('sajid_visitor_name'));
  }

  // ── Already completed gate THIS SESSION — skip showing it again ──
  if (!dismissed && sessionStorage.getItem('_gateCompleted') === '1') {
    dismissed = true;
    triggered = true;
    const _ssName = sessionStorage.getItem('sajid_visitor_name') || localStorage.getItem('sajid_visitor_name') || '';
    if (_ssName) {
      sessionStorage.setItem('_smVisitorName', _ssName);
      sessionStorage.setItem('sajid_visitor_name', _ssName);
    }
  }

  // ── Remembered visitor — gave their name recently, skip the gate ──────
  // If they submitted a name within the last GATE_REMEMBER_MS window, don't
  // ask again. Their page view is tracked regardless by analytics.js (which
  // runs independently of the gate); here we just silently reattach their
  // name to this new session's row/profile with no UI shown.
  if (!dismissed) {
    const _remName   = localStorage.getItem('sajid_visitor_name');
    const _remSeenAt = parseInt(localStorage.getItem('sajid_visitor_seen_at') || '0', 10);
    const _isFresh   = !!_remName && !!_remSeenAt && (Date.now() - _remSeenAt < GATE_REMEMBER_MS);
    if (_isFresh) {
      dismissed = true;
      triggered = true;
      sessionStorage.setItem('_smVisitorName', _remName);
      sessionStorage.setItem('sajid_visitor_name', _remName);
      sessionStorage.setItem('_gateCompleted', '1');
      // Fire after the gate module below defines _writeVisitorName.
      setTimeout(() => { if (window._smReattachName) window._smReattachName(_remName); }, 0);
    }
  }

  // ── Pre-fill name input from last visit ──
  if (!dismissed && nameInput) {
    const _prev = localStorage.getItem('sajid_visitor_name');
    if (_prev) nameInput.value = _prev;
  }

  function showGate() {
    if (dismissed) return;
    overlay.classList.add('visible');
    document.body.classList.add('gate-active');
    var _scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    window._savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = _scrollbarW + 'px';
    /* position:fixed removed — causes CLS on body */
    // Force correct background div visibility via JS (belt-and-suspenders on top of CSS)
    const bgDesktop = document.getElementById('gate-bg-desktop');
    const bgMobile  = document.getElementById('gate-bg-mobile');
    if (window.innerWidth <= 767) {
      if (bgDesktop) bgDesktop.style.display = 'none';
      if (bgMobile)  bgMobile.style.display  = 'block';
    } else {
      if (bgDesktop) bgDesktop.style.display = 'block';
      if (bgMobile)  bgMobile.style.display  = 'none';
    }
    setTimeout(() => nameInput && nameInput.focus(), 550);
  }

  function hideGate() {
    dismissed = true;
    overlay.classList.remove('visible');
    document.body.classList.remove('gate-active');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    /* No scroll restoration needed — position was never changed */
  }

  // ── Write visitor name back to Supabase so the dashboard updates ──────
  // Shared by the explicit submitName() flow AND the silent "remembered
  // visitor" flow (no UI shown). Strategy, in order:
  //   1. fingerprint → visitor_profiles upsert. This is the ONLY step that
  //      never depends on the visitors row already existing, so it's the
  //      most reliable and runs first. dashboard.js already falls back to
  //      visitor_profiles for any visitors row missing a name.
  //   2. session_id  — updates THIS session's own visitors row directly,
  //      when it exists.
  //   3. recent-row fallback — covers the case where analytics.js's insert
  //      genuinely hasn't landed yet (slow Supabase SDK load). We check the
  //      actual returned rows (via .select()) rather than trusting "no
  //      error", since Supabase does not error on a zero-row update — that
  //      false positive was silently dropping names before.
  // All Supabase errors are logged (not swallowed) so RLS/permission issues
  // show up in the console instead of failing invisibly.
  async function _writeVisitorName(name) {
    try {
      const db = _getGateAnalyticsDb();
      if (!db) return;

      let confirmed = false;

      // ── 1. fingerprint → visitor_profiles upsert (race-free) ──────────
      const fp = sessionStorage.getItem('_smFingerprint')
              || localStorage.getItem('_smFingerprint')
              || null;
      if (fp) {
        const { error: profErr } = await db.from('visitor_profiles').upsert(
          { fingerprint: fp, visitor_name: name },
          { onConflict: 'fingerprint' }
        );
        if (profErr) console.warn('[Gate] visitor_profiles upsert failed:', profErr.message);
        else confirmed = true;

        const { data: fpRows, error: fpErr } = await db.from('visitors')
          .update({ visitor_name: name })
          .eq('fingerprint', fp)
          .is('visitor_name', null)
          .select('id');
        if (fpErr) console.warn('[Gate] visitors update (fingerprint) failed:', fpErr.message);
      }

      // ── 2. session_id match — this session's own row ───────────────────
      const sid = sessionStorage.getItem('_smSessionId')
               || sessionStorage.getItem('sajid_session_id')
               || null;
      if (sid) {
        const { data: sidRows, error: sidErr } = await db.from('visitors')
          .update({ visitor_name: name })
          .eq('session_id', sid)
          .select('id');
        if (sidErr) console.warn('[Gate] visitors update (session_id) failed:', sidErr.message);
        if (sidRows && sidRows.length) confirmed = true;
      }

      // ── 3. Recent-row fallback — only if nothing above actually matched
      //      a row (guards the analytics.js insert race). ────────────────
      if (!confirmed) {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: rows } = await db.from('visitors')
          .select('id')
          .is('visitor_name', null)
          .gte('created_at', fiveMinAgo)
          .order('created_at', { ascending: false })
          .limit(1);
        if (rows && rows.length) {
          const { error: fbErr } = await db.from('visitors')
            .update({ visitor_name: name })
            .eq('id', rows[0].id);
          if (fbErr) console.warn('[Gate] visitors update (fallback) failed:', fbErr.message);
        }
      }
    } catch (e) {
      console.warn('[Gate] _writeVisitorName error:', e.message);
    }
  }

  // Retry shortly after: covers analytics.js's insert landing a beat late
  // on a slow connection (it can wait up to 8s for the Supabase SDK).
  function _writeVisitorNameWithRetry(name) {
    _writeVisitorName(name);
    setTimeout(() => _writeVisitorName(name), 2500);
  }

  // Exposed so the silent "remembered visitor" boot path (above) can call
  // it once this IIFE has finished defining it.
  window._smReattachName = _writeVisitorNameWithRetry;

  // ── Telegram notification: SUPERSEDED, kept as a documented no-op ───
  // SECURITY / DUPLICATE-CODE FIX (audit): this module's own
  // window.requireGateThen (defined below) is unconditionally
  // overwritten by the CV/Certificate Gate module later in this file
  // (see "[SECTION: CV / CERTIFICATE GATE]"), which runs after this
  // IIFE and always wins. That means showGate()/submitName() in this
  // closure — and this function — are never reachable from a real
  // user click; the site's actual gate today is the name+company
  // +purpose modal further down, which has its own Telegram delivery
  // via the shared CVGateTelegram helper.
  //
  // This function used to hold a second, independent hard-coded
  // Telegram bot token + chat ID that duplicated the one already in
  // CVGateTelegram — i.e. the exact same secret was embedded twice in
  // this file for a code path that can never run. That's needless
  // exposure with zero functional benefit, so the credential has been
  // removed here rather than left sitting in dead code. If this
  // module is ever reinstated as the active gate, wire it back up to
  // CVGateTelegram.send(...) (see the shared helper below) instead of
  // re-adding a standalone token.
  function _notifyOwnerByTelegram(/* name, context */) {
    // No-op: unreachable in the current gate configuration. See note above.
  }

  // ── Gate-on-demand ──────────────────────────────────────────────
  // Other parts of the page (resume button, certificate links) call
  // window.requireGateThen(action, context) instead of running their
  // action directly. If the visitor's name is already known this
  // session, the action runs immediately with no popup. Otherwise the
  // gate opens, and the action fires only after they submit a name.
  var _gatePendingAction = null;

  window.requireGateThen = function (action, context) {
    if (dismissed) {
      if (typeof action === 'function') action();
      return;
    }
    _gatePendingAction = { action: action, context: context || '' };
    triggered = true;
    showGate();
  };

  function submitName() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderColor = '#e24b4a';
      nameInput.focus();
      setTimeout(() => nameInput.style.borderColor = '', 1200);
      return;
    }
    // Haptic feedback — short "tap" pulse on devices/browsers that
    // support the Vibration API (mainly Android Chrome/Firefox; iOS
    // Safari and desktop browsers silently ignore this, no error).
    try {
      if (navigator.vibrate) navigator.vibrate(35);
    } catch (e) { /* ignore */ }

    // Persist name + "seen at" timestamp — the timestamp powers the
    // remember-me window above (skip the gate for GATE_REMEMBER_MS).
    try {
      localStorage.setItem('sajid_visitor_name', name);
      localStorage.setItem('sajid_visitor_seen_at', String(Date.now()));
      sessionStorage.setItem('sajid_visitor_name', name);
      sessionStorage.setItem('_smVisitorName', name);
      sessionStorage.setItem('_gateCompleted', '1'); // prevents re-showing this session
    } catch (e) { /* private browsing — ignore */ }
    if (welcomeName) welcomeName.textContent = name;

    _writeVisitorNameWithRetry(name);

    var _pending = _gatePendingAction;
    _gatePendingAction = null;

    _notifyOwnerByTelegram(name, _pending ? _pending.context : '');

    hideGate();

    // Let the overlay finish closing before running the action that
    // was waiting on it (e.g. opening the resume PDF or a certificate).
    if (_pending && typeof _pending.action === 'function') {
      setTimeout(_pending.action, 350);
    }
  }

  continueBtn.addEventListener('click', submitName);
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });
  doneBtn.addEventListener('click', submitName);
  // X button is hidden via CSS — gate cannot be closed without entering a name.

  // NOTE: the gate no longer opens automatically on scroll. It now opens
  // only when a visitor clicks to view the resume or a certificate — see
  // window.requireGateThen(), used near the bottom of this file.

})();



// ============================================================
// SECTION 2 · PORTFOLIO INIT (DOMContentLoaded)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // AOS disabled — was causing flicker on sections below hero
  // if (typeof AOS !== 'undefined') { AOS.init(...) }
  initNav();
  initFAB();
  initCounters();
  initRings();
  initFolderTabs();
  initTouchPressStates();
  initSectionFadeIn();
  // showProjectSkeleton() / loadProjects() / loadExperience() / loadArsenal() /
  // loadLanguages() / initSkillBars() / initDynamicStaggerObserver() have been
  // removed entirely (audit cleanup): each targeted a container id
  // (#projectsGrid, #expTimeline, #arsenalBento, #langGrid) that no longer
  // exists in index.html. Projects, experience, and the arsenal are all
  // rendered statically in HTML now with full case-study/story content, so
  // these functions were silently no-op-ing on every page load. Their data
  // arrays (projectsData, experienceData, arsenalData, languages) were
  // removed with them since nothing else referenced them.
  loadCertifications(); // still live: #certHero / #certsGrid exist and are JS-rendered
  enhanceLiquidButtons(); // NEW — 3D liquid-water-glass treatment (see SECTION 24A below)
  initTroubleshootingLab(); // NEW — populates #tslPanel and wires scenario buttons (see SECTION 25 below)
  initScrollReveal();
  initMagneticButtons();
  initSoftParallax();
  setTimeout(initStaggerFadeIn, 50);
  printSignature();
});


// ============================================================
// SECTION 3 · NAVIGATION
// ============================================================

function initNav() {
  var nav      = document.getElementById('topNav');
  var navLinks = document.querySelectorAll('.nav-link');

  // ── Mobile nav toggle (hamburger) ──
  var navToggle  = document.getElementById('navToggle');
  var navDrawer  = document.getElementById('navMobDrawer');

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navDrawer.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // Only lock body scroll when gate isn't active
      if (!document.body.classList.contains('gate-active')) {
        document.body.style.overflow = isOpen ? 'hidden' : '';
      }
    });

    // Close drawer when a nav link is clicked
    navDrawer.querySelectorAll('.nav-mob-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (navDrawer.classList.contains('open') &&
          !navDrawer.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
        navToggle.focus();
      }
    });
  }

  var _scrollRafPending = false;
  window.addEventListener('scroll', function () {
    if (_scrollRafPending) return;
    _scrollRafPending = true;
    requestAnimationFrame(function () {
      _scrollRafPending = false;
      if (!nav) return;
      nav.classList.toggle('scrolled', window.scrollY > 60);
      var current = '';
      /* Use getBoundingClientRect + pageYOffset instead of offsetTop to avoid forced reflow */
      document.querySelectorAll('section[id]').forEach(function (sec) {
        var secTop = sec.getBoundingClientRect().top + window.pageYOffset;
        if (window.scrollY >= secTop - 120) current = sec.id;
      });
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
      // Auto-scroll active nav link into view on mobile
      var activeLink = document.querySelector('.nav-link.active');
      if (activeLink) {
        var navLinksCenter = document.querySelector('.nav-links-center');
        if (navLinksCenter) {
          var linkLeft = activeLink.offsetLeft;
          var linkWidth = activeLink.offsetWidth;
          var containerWidth = navLinksCenter.offsetWidth;
          navLinksCenter.scrollTo({ left: linkLeft - (containerWidth / 2) + (linkWidth / 2), behavior: 'smooth' });
        }
      }
    });
  }, { passive: true });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left - 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - 2) + 'px';
      this.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });
}


// ============================================================
// SECTION 4 · (custom cursor now handled by the cinematic effects
// engine further down this file — see initCursor() under
// "STEP 7 — ADVANCED CINEMATIC EFFECTS ENGINE")
// ============================================================


// ============================================================
// SECTION 5 · FLOATING ACTION BUTTON
// ============================================================

function initFAB() {
  var container = document.getElementById('fabContainer');
  var mainBtn   = document.getElementById('fabMain');
  if (!mainBtn || !container) return;

  function closeFAB() {
    container.classList.remove('open');
    mainBtn.classList.remove('open');
  }

  mainBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    container.classList.toggle('open');
    mainBtn.classList.toggle('open');
  });

  var contactOpt = document.querySelector('.fab-option-contact');
  if (contactOpt) contactOpt.addEventListener('click', closeFAB);

  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) closeFAB();
  });

  container.style.cssText = 'opacity:0;pointer-events:none;transition:opacity 0.3s ease;';

  window.addEventListener('scroll', function () {
    var visible = window.scrollY > 200;
    container.style.opacity       = visible ? '1' : '0';
    container.style.pointerEvents = visible ? 'auto' : 'none';
  }, { passive: true });
}


// ============================================================
// SECTION 6 · TOUCH PRESS STATES (iOS feedback)
// ============================================================

function initTouchPressStates() {
  var sel = '.btn,.fab-option,.fab-main,.mob-link,.contact-item,.social-btn,.exp-btn,.nav-resume-btn,.slider-btn,.slider-dot,.ftab,.pc-link,.contact-item-whatsapp,.social-btn-whatsapp';
  document.querySelectorAll(sel).forEach(function (el) {
    el.addEventListener('touchstart',  function () { el.classList.add('pressed'); },    { passive: true });
    el.addEventListener('touchend',    function () { setTimeout(function () { el.classList.remove('pressed'); }, 150); }, { passive: true });
    el.addEventListener('touchcancel', function () { el.classList.remove('pressed'); }, { passive: true });
  });
}


// ============================================================
// SECTION 7 · COUNTER ANIMATION
// ============================================================

function initCounters() {
  // Don't animate while gate is visible — re-triggered after gate closes
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, +entry.target.getAttribute('data-count'));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    el.textContent = '0';
    observer.observe(el);
  });
}

function animateCount(el, target) {
  var duration = 1600, start = performance.now();
  function step(now) {
    var progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.ceil((1 - Math.pow(2, -10 * progress)) * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}


// ============================================================
// SECTION 8 · SVG RING ANIMATION
// ============================================================

function initRings() {
  document.querySelectorAll('.ring-fg').forEach(function (r) {
    r.style.strokeDashoffset = (2 * Math.PI * 50).toString();
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var ring = entry.target;
      var pct  = parseInt(ring.getAttribute('data-percent'));
      setTimeout(function () {
        ring.style.strokeDashoffset = (2 * Math.PI * 50) * (1 - pct / 100);
      }, 350);
      observer.unobserve(ring);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.ring-fg').forEach(function (r) { observer.observe(r); });
}


// ============================================================
// SECTION 9 · EDUCATION FOLDER TABS
// ============================================================

function initFolderTabs() {
  var eduTabs   = document.querySelectorAll('.edu-tab');
  var eduPanels = document.querySelectorAll('.edu-panel');
  if (!eduTabs.length) return;

  eduTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-edu');
      eduTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      eduPanels.forEach(function (p) {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = target ? document.getElementById(target) : null;
      if (panel) {
        panel.classList.add('active');
        panel.removeAttribute('hidden');
      }
    });
  });
}



// ============================================================
// SECTION 11 · SECTION FADE-IN ON SCROLL
// ============================================================

function initSectionFadeIn() {
  // Disabled — was hiding sections after render causing full-page flicker
}


// ============================================================
// SECTION 12 · SCROLL REVEAL (cards)
// ============================================================

function initScrollReveal() {
  // Disabled — was setting opacity:0 on rendered cards causing flicker
}


// ============================================================
// SECTION 13 · STAGGERED FADE-IN
// ============================================================

function initStaggerFadeIn() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('stagger-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // cert-card is excluded: loadCertifications() renders cards after AOS has already
  // initialised, so stagger-observer would leave them invisible.  Each cert card
  // instead gets its own inline certReveal animation with a staggered delay.
  document.querySelectorAll('.stagger-child, .bento-item, .ach-item, .lang-item')
    .forEach(function (el) { observer.observe(el); });
}


// ============================================================
// SECTION 15 · MAGNETIC BUTTONS — removed (cursor-follow effect).
// Buttons no longer respond to mouse position; fixed hover/active
// states are handled entirely in CSS.
// ============================================================

function initMagneticButtons() {
  // no-op — retained as a stable call site since it's invoked elsewhere
}


// ============================================================
// SECTION 16 · SOFT PARALLAX (desktop)
// ============================================================

function initSoftParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.orb-1, .hero-grid-bg').forEach(function (el) { el.classList.add('parallax-slow'); });
  document.querySelectorAll('.orb-2').forEach(function (el) { el.classList.add('parallax-mid'); });
  document.querySelectorAll('.orb-3').forEach(function (el) { el.classList.add('parallax-fast'); });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    requestAnimationFrame(function () {
      var sy = window.scrollY;
      document.querySelectorAll('.parallax-slow').forEach(function (el) { el.style.setProperty('--py-slow', sy * 0.04 + 'px'); });
      document.querySelectorAll('.parallax-mid').forEach(function  (el) { el.style.setProperty('--py-mid',  sy * 0.07 + 'px'); });
      document.querySelectorAll('.parallax-fast').forEach(function (el) { el.style.setProperty('--py-fast', sy * 0.11 + 'px'); });
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}




// ============================================================
// SECTION 24A · LIQUID WATER GLASS BUTTONS (enhancement pass)
// ----------------------------------------------------------------
// Upgrades existing buttons/links in-place with the shared
// `.liquid-water-btn` treatment (see styles.css) — transparent glass
// body, moving water, bubbles, diagonal shine, hover lift, press-down.
// This is additive only: it does NOT touch anything already using the
// site's existing `.lqb` (Download CV / View Certificate) or `.rvb-*`
// (Recruiter Fast Pass) water-button markup, since those already meet
// the same visual spec and re-wrapping them would risk breaking their
// hand-tuned layout. It also skips plain text nav links so the navbar
// and mobile drawer aren't affected — only real action buttons/CTAs
// get the water treatment, per the "don't apply to nav text links"
// design note.
//
// Safe to call more than once (e.g. after loadCertifications() adds
// new verify-cert buttons to the DOM): already-enhanced elements are
// skipped via the `data-lwb` flag, so nothing is double-initialized
// or gets duplicate water/wave/shine markup.
// ============================================================

var LWB_SELECTOR = [
  '.btn-primary', '.btn-ghost',
  '.gate-btn', '.gate-cancel-btn', '.gate-close',
  '.fab-main', '.fab-option',
  '.cta-action-btn',
  '.msc-btn',
  '.footer-glass-btn', '.fa-btn',
  '.nav-resume-btn',
  '.pdf-modal-btn', '.hie-modal-btn',
  '.rcb-btn',
  '.cisco-verify-btn', '.ccna-verify-link',
  '.linkedin-profile-btn', '.hero-linkedin-btn', '.ref-linkedin-btn',
  '.rpc-download-btn',
  '#reviewSubmitBtn',
  '.footer-admin-btn',
  '.chc-view-cert-btn',
  // --- added: document/letter buttons (Experience Letter, Starlink
  // Experience Letter, Airport Project Letter use plain .btn-sm-gold;
  // ones that also carry .lqb are skipped below, same as always) ---
  '.btn-sm-gold',
  // --- added: "View Letter" recommendation-letter links ---
  '.rec-letter-btn',
  // --- added: "WhatsApp Me" / "LinkedIn" primary contact CTAs ---
  '.engage-cta-btn',
  // --- added: "Email" / "Chat" / "Follow" / "Call" small CTA pills
  // at the end of each contact row (the row itself stays a plain
  // link; only the little pill gets the water treatment) ---
  '.er-cta',
  // --- added: certificate hero card "verify" action (external link
  // variant; ".chc-view-cert-btn" above already covers the in-page
  // viewer variant) — ".chc-verify-btn--progress" is a static status
  // label, not a real link, so it's excluded via :not() ---
  '.chc-verify-btn:not(.chc-verify-btn--progress)',
  // --- added: recruiter panel's own close control ---
  '.recruiter-panel-close'
].join(',');

// Round/circular controls get a shallower water band (see .lwb-round
// in CSS) so the icon doesn't get swallowed on small targets.
var LWB_ROUND_SELECTOR = '.fab-main, .fab-option, .footer-admin-btn, .ref-linkedin-btn, .hero-linkedin-btn, .er-cta, .recruiter-panel-close';

// Full 9-layer stack, bottom to top:
//   1. Glass outer shell   → the host button's own background/border
//   2. Glass depth         → .liquid-water-btn::after (inset rim, CSS)
//   3. Water volume        → .liquid-water (this span)
//   4. Primary wave        → .liquid-wave-1
//   5. Secondary wave      → .liquid-wave-2 (different speed + phase)
//   6. Bubbles             → .liquid-bubble × 2 (staggered, seeded)
//   7. Water-surface reflection → .liquid-reflection (new)
//   8. Glass highlight     → .liquid-shine + ::before (pointer-tracked)
//   9. Button content      → .liquid-content (wraps the real label/icon)
function _lwbBuildWaterMarkup(seedOffset) {
  var d1 = 'M0,20 C50,6 100,34 150,20 C200,6 250,34 300,20 C350,6 400,34 400,20 L400,40 L0,40 Z';
  var d2 = 'M0,22 C50,10 100,34 150,22 C200,10 250,34 300,22 C350,10 400,34 400,22 L400,40 L0,40 Z';
  var b1 = (18 + seedOffset) % 70 + 15;
  var b2 = (46 + seedOffset) % 70 + 15;
  var b3 = (63 + seedOffset * 3) % 70 + 15;
  var delay1 = (seedOffset % 5) * 0.3;
  var delay2 = ((seedOffset + 2) % 5) * 0.35;
  var delay3 = ((seedOffset + 4) % 6) * 0.4;
  var reflDelay = (seedOffset % 4) * 0.45;
  // Bubbles vary in size/speed/drift per instance (seeded, not random
  // per-frame) so a row of buttons doesn't animate in lockstep — kept
  // subtle: 3 small bubbles max, rising slowly with a slight sideways
  // drift, each on its own duration/delay so they never sync up.
  var bubbles =
      '<span class="liquid-bubble" style="left:' + b1 + '%;--lwb-bsize:2.6px;--lwb-bdur:' + (4.4 + delay1).toFixed(2) + 's;--lwb-bdelay:' + delay1.toFixed(2) + 's;--lwb-bdrift:3px"></span>' +
      '<span class="liquid-bubble" style="left:' + b2 + '%;--lwb-bsize:1.8px;--lwb-bdur:' + (5.6 + delay2).toFixed(2) + 's;--lwb-bdelay:' + delay2.toFixed(2) + 's;--lwb-bdrift:-4px"></span>' +
      '<span class="liquid-bubble" style="left:' + b3 + '%;--lwb-bsize:1.3px;--lwb-bdur:' + (6.8 + delay3).toFixed(2) + 's;--lwb-bdelay:' + delay3.toFixed(2) + 's;--lwb-bdrift:2px"></span>';
  return (
    '<span class="liquid-water" aria-hidden="true">' +
      '<svg class="liquid-wave liquid-wave-1" viewBox="0 0 400 40" preserveAspectRatio="none"><path d="' + d1 + '"/></svg>' +
      '<svg class="liquid-wave liquid-wave-2" viewBox="0 0 400 40" preserveAspectRatio="none"><path d="' + d2 + '"/></svg>' +
      bubbles +
      '<span class="liquid-reflection" style="animation-delay:' + reflDelay + 's" aria-hidden="true"></span>' +
    '</span>' +
    '<span class="liquid-shine" aria-hidden="true"></span>'
  );
}

function enhanceLiquidButtons() {
  var candidates = document.querySelectorAll(LWB_SELECTOR);
  var seed = 0;

  candidates.forEach(function (el) {
    // Skip anything already enhanced, or already using the site's
    // existing water-button systems (.lqb / .rvb-water child).
    if (el.hasAttribute('data-lwb')) return;
    if (el.classList.contains('lqb')) return;
    if (el.querySelector('.rvb-water')) return;

    seed++;
    el.setAttribute('data-lwb', '1');
    el.classList.add('liquid-water-btn');
    if (el.matches(LWB_ROUND_SELECTOR)) el.classList.add('lwb-round');

    // Wrap the button's existing content so it always renders above
    // the water/shine layers, then inject the water/shine markup.
    var wrapper = document.createElement('span');
    wrapper.className = 'liquid-content';
    while (el.firstChild) wrapper.appendChild(el.firstChild);
    el.appendChild(wrapper);
    el.insertAdjacentHTML('afterbegin', _lwbBuildWaterMarkup(seed));
  });

  _lwbInitPointerHighlight();
  _lwbWireTouchPress();
}

// Cursor-tracked glass highlight removed — buttons must not respond to
// mouse position. The `--lwb-x`/`--lwb-y` custom properties are now set
// once to a fixed center in CSS instead of being updated from pointer
// events.
var _lwbHighlightWired = false;
function _lwbInitPointerHighlight() {
  return; // no-op, kept as stable call site
}

// Touch: reuse the same `.pressed` mechanism the rest of the site
// already uses (see initTouchPressStates / extendTouchPressStates)
// instead of a second parallel touch handler, so there's exactly one
// source of truth for the pressed state and no stuck :hover.
// Elements matching this list already get identical touchstart/
// touchend/touchcancel "pressed" wiring from initTouchPressStates()
// and extendTouchPressStates() elsewhere in this file. Skip them here
// so each button gets exactly one set of touch listeners instead of
// two (previously: .fab-main, .fab-option, .nav-resume-btn,
// .cta-action-btn, .linkedin-profile-btn and .cisco-verify-btn were
// all being wired twice).
var LWB_TOUCH_ALREADY_WIRED_SELECTOR =
  '.btn,.fab-option,.fab-main,.mob-link,.contact-item,.social-btn,' +
  '.exp-btn,.nav-resume-btn,.slider-btn,.slider-dot,.ftab,.pc-link,' +
  '.contact-item-whatsapp,.social-btn-whatsapp,' +
  '.cta-action-btn,.linkedin-profile-btn,.cisco-verify-btn,' +
  '.float-whatsapp,.sticky-mobile-cta a,.rec-screenshot-card,' +
  '.why-item,.stat-card';

function _lwbWireTouchPress() {
  document.querySelectorAll('.liquid-water-btn:not([data-lwb-touch])').forEach(function (el) {
    if (el.matches(LWB_TOUCH_ALREADY_WIRED_SELECTOR)) {
      el.setAttribute('data-lwb-touch', '1');
      return;
    }
    el.setAttribute('data-lwb-touch', '1');
    el.addEventListener('touchstart', function () { el.classList.add('pressed'); }, { passive: true });
    el.addEventListener('touchend', function () {
      setTimeout(function () { el.classList.remove('pressed'); }, 150);
    }, { passive: true });
    el.addEventListener('touchcancel', function () { el.classList.remove('pressed'); }, { passive: true });
  });
}


// ============================================================
// SECTION 23 · DATA — CERTIFICATIONS
// ============================================================

var certData = [
  {
    icon: 'fa-network-wired',
    logo: 'corvit-logo.png',
    badge: '✅ SUCCESSFULLY COMPLETED',
    badgeClass: 'cc-badge--verified',
    title: 'CCNA Enterprise',
    issuer: 'Corvit Systems Peshawar',
    date: '06 August 2025 – 10 November 2025',
    category: 'Networking',
    desc: 'Successfully completed the CCNA Enterprise program at Corvit Systems Peshawar, gaining strong practical knowledge in enterprise networking, routing and switching, IPv4 & IPv6 addressing, VLANs, STP, OSPF, ACLs, NAT, DHCP, network security, troubleshooting, and Cisco IOS configuration. The course emphasized hands-on labs and real-world enterprise networking scenarios, strengthening my ability to design, configure, secure, and troubleshoot modern network infrastructures.',
    status: 'Successfully Completed',
    verified: true,
    // Google Drive file for the certificate image (publicly viewable link supplied by Sajid).
    // thumbImg  = direct-viewable image render of the Drive file (used in the lightbox / on the card)
    // driveView = the original "view" link (used as an external fallback / verify link)
    // driveDownload = forces a download of the same file
    certImg: 'https://drive.google.com/thumbnail?id=1jAvy9K836PHVtbM7t62TPv0kXfJ5r7kD&sz=w2000',
    driveView: 'https://drive.google.com/file/d/1jAvy9K836PHVtbM7t62TPv0kXfJ5r7kD/view?usp=sharing',
    driveDownload: 'https://drive.google.com/uc?export=download&id=1jAvy9K836PHVtbM7t62TPv0kXfJ5r7kD',
    mentor: {
      name: 'Mr. Waseem',
      note: 'I would like to express my sincere gratitude to Mr. Waseem for his exceptional guidance, mentorship, and unwavering support throughout my CCNA Enterprise journey. His practical teaching methodology, deep technical knowledge, and commitment to student success made complex networking concepts easy to understand and apply in real-world environments. His encouragement and dedication have played a significant role in strengthening my networking skills and professional growth. I am truly thankful for his valuable mentorship and inspiration.',
      quote: 'A great mentor doesn\u2019t just teach technology\u2014they inspire confidence, build character, and empower future professionals.'
    },
    url: 'https://drive.google.com/file/d/1jAvy9K836PHVtbM7t62TPv0kXfJ5r7kD/view?usp=sharing'
  },
  {
    icon: 'fa-certificate',
    badge: '✅ CERTIFIED',
    badgeClass: 'cc-badge--verified',
    title: 'Professional Certificate',
    issuer: 'Certified Authority',
    date: '2024',
    category: 'Professional',
    desc: 'Professional certification demonstrating validated competency and applied expertise in a specialist domain.',
    url: 'https://drive.google.com/file/d/12sPuwNrd2uWZfszUXMKbOVUFOGgzD0Uo/view?usp=drive_link'
  },
  {
    icon: 'fa-cubes',
    logo: 'odoo-logo.svg',
    badge: '✅ CERTIFIED',
    badgeClass: 'cc-badge--verified',
    title: 'Odoo ERP Training',
    issuer: 'Odoo Official',
    date: '2024',
    category: 'ERP',
    desc: 'Enterprise resource planning — business processes, product management, vendor & customer modules within live ERP environments.',
    url: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=drive_link'
  },
  {
    icon: 'fa-shield-halved',
    badge: '🏆 AWARD',
    badgeClass: 'cc-badge--award',
    title: 'Safety Excellence Award',
    issuer: 'Hamad International Airport',
    date: '2023–2024',
    category: 'Recognition',
    desc: 'Formally recognised for exceptional dedication, safety compliance, and technical performance during the HIA Expansion Project.',
    url: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=drive_link'
  },
  {
    icon: 'fa-graduation-cap',
    badge: '🎓 DISTINCTION',
    badgeClass: 'cc-badge--gold',
    title: 'Advanced Diploma — ACCP',
    issuer: 'Aptech Qatar',
    date: 'Nov 2020 – Nov 2023',
    category: 'Software Engineering',
    desc: 'Overall Distinction across all three years (81%, 87%, 86%) of the Advanced Computer Career Programme in Software Engineering.',
    url: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
  },
  {
    icon: 'fa-hands-helping',
    badge: '🤝 VOLUNTEER',
    badgeClass: 'cc-badge--volunteer',
    title: 'MDX Career Fair Certificate',
    issuer: 'Middlesex University Dubai',
    date: '2025',
    category: 'Community',
    desc: 'Certificate of appreciation for volunteering at the Middlesex University Dubai Annual Career Fair — supporting student-employer engagement.',
    url: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=drive_link'
  },
  {
    icon: 'fa-circle-half-stroke',
    badge: '🔄 IN PROGRESS',
    badgeClass: 'cc-badge--progress',
    title: 'ITIL 4 Foundation',
    issuer: 'Axelos / PeopleCert',
    date: 'Targeted 2025',
    category: 'ITSM',
    desc: 'Formalising hands-on ITSM experience across incident management, change control, and service lifecycle management — fast-track path in progress.',
    url: ''
  },
  {
    icon: 'fa-cloud',
    logo: 'azure-logo.svg',
    badge: '🔄 IN PROGRESS',
    badgeClass: 'cc-badge--progress',
    title: 'Microsoft Azure Fundamentals',
    issuer: 'Corvit Systems Peshawar · Ali Tower Branch',
    date: 'In Progress · 2026',
    category: 'Cloud',
    desc: 'Building cloud computing foundations — Azure core services, identity, governance, and cloud infrastructure management — currently in progress at Corvit Systems Peshawar, Ali Tower branch.',
    url: ''
  },
  {
    icon: 'fa-university',
    badge: '🏅 HONOURS',
    badgeClass: 'cc-badge--gold',
    title: 'BSc Information Technology',
    issuer: 'Middlesex University Dubai',
    date: 'Sep 2024 – Jun 2025',
    category: 'Degree',
    desc: 'Merit — Upper Second Class Honours (2:1). Specialised in enterprise systems, networking, cybersecurity, and IT operations.',
    url: 'https://drive.google.com/file/d/17IYNcUbLLQfEJS0_4VtscE6xejH7p4XB/view?usp=sharing'
  }
];

function loadCertifications() {
  var heroWrap = document.getElementById('certHero');
  var grid     = document.getElementById('certsGrid');
  if (!grid) return;

  // Accent palette — one unique colour per card slot
  var accentPalette = [
    '#0a84ff', // blue   — Professional Certificate
    '#8e44ad', // violet — Odoo ERP
    '#e67e22', // amber  — Safety Award
    '#27ae60', // green  — Advanced Diploma
    '#c0392b', // crimson— MDX Career Fair
    '#2980b9', // steel  — ITIL
    '#d4a017'  // gold   — BSc IT
  ];

  // ── 1. HERO CARD — CCNA (index 0) ──────────────────────────────────
  var hero = certData[0];
  if (heroWrap && hero) {
    heroWrap.innerHTML =
      '<div class="cert-hero-card" style="animation:certReveal .7s cubic-bezier(.22,1,.36,1) 0ms both;">' +
        '<div class="chc-shimmer" aria-hidden="true"></div>' +
        (hero.verified
          ? '<div class="chc-verified-badge" title="Verified Certificate"><i class="fas fa-check-circle"></i> Verified Certificate</div>'
          : '') +
        '<div class="chc-left">' +
          '<div class="chc-icon-ring" style="' + (hero.logo ? 'background:#ffffff;' : '') + '">' +
            (hero.logo
              ? '<img src="' + hero.logo + '" alt="' + hero.issuer + ' logo" loading="lazy" style="width:100%;height:100%;object-fit:contain;">'
              : '<i class="fas ' + hero.icon + '"></i>'
            ) +
          '</div>' +
        '</div>' +
        '<div class="chc-body">' +
          '<span class="chc-eyebrow">⭐ Featured Certification</span>' +
          '<h3 class="chc-title">' + hero.title + ' 🌐</h3>' +
          '<p class="chc-subtitle">Cisco Certified Network Associate — Corvit Systems Peshawar</p>' +
          '<div class="chc-meta-row">' +
            '<span class="chc-meta-pill"><i class="fas fa-building"></i>' + hero.issuer + '</span>' +
            '<span class="chc-meta-pill"><i class="fas fa-calendar-alt"></i>' + hero.date + '</span>' +
            (hero.status
              ? '<span class="chc-meta-pill chc-status-pill"><i class="fas fa-circle-check"></i>' + hero.status + '</span>'
              : ''
            ) +
            (hero.credentialId
              ? '<span class="chc-meta-pill chc-cred"><i class="fas fa-fingerprint"></i>Credential ID: ' + hero.credentialId + '</span>'
              : ''
            ) +
          '</div>' +
          '<div class="chc-net-icons" aria-hidden="true">' +
            '<span class="chc-net-icon" title="Routing &amp; Switching"><i class="fas fa-network-wired"></i></span>' +
            '<span class="chc-net-icon" title="VLANs &amp; STP"><i class="fas fa-diagram-project"></i></span>' +
            '<span class="chc-net-icon" title="Security"><i class="fas fa-shield-halved"></i></span>' +
            '<span class="chc-net-icon" title="Cisco IOS"><i class="fas fa-server"></i></span>' +
          '</div>' +
          '<p class="chc-desc">' + hero.desc + '</p>' +
          '<div class="chc-actions">' +
            (hero.url
              ? '<a href="' + hero.url + '" target="_blank" rel="noopener noreferrer" class="chc-verify-btn">' +
                  '<i class="fas fa-eye"></i> View Certificate' +
                '</a>'
              : (hero.certImg
                  ? '<button type="button" class="chc-verify-btn chc-view-cert-btn" data-cert-img="' + hero.certImg + '" data-cert-title="' + hero.title + '">' +
                      '<i class="fas fa-eye"></i> View Certificate' +
                    '</button>'
                  : '<span class="chc-verify-btn chc-verify-btn--progress"><i class="fas fa-clock"></i> Certification In Progress</span>'
                )
            )
          + '</div>' +
        '</div>' +
        '<div class="chc-seal" aria-hidden="true">🏆</div>' +
      '</div>' +
      (hero.mentor
        ? '<div class="chc-thanks-card" data-aos="fade-up">' +
            '<div class="chc-thanks-icon"><i class="fas fa-hands-helping"></i></div>' +
            '<h4 class="chc-thanks-title">A Special Note of Thanks</h4>' +
            '<p class="chc-thanks-body">' + hero.mentor.note + '</p>' +
            '<blockquote class="chc-thanks-quote">\u201C' + hero.mentor.quote + '\u201D</blockquote>' +
            '<span class="chc-thanks-signature">— With gratitude, to ' + hero.mentor.name + '</span>' +
          '</div>'
        : '');
  }

  // ── 2. GRID CARDS — certData[1..] (no CCNA repeat) ─────────────────
  var certObserver = (typeof IntersectionObserver !== 'undefined')
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('stagger-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.08 })
    : null;

  certData.slice(1).forEach(function (cert, i) {
    var accent = accentPalette[i % accentPalette.length];
    var frame  = document.createElement('div');
    frame.className = 'cert-card';
    frame.style.cssText =
      'opacity:1 !important;visibility:visible !important;' +
      '--cert-accent:' + accent + ';' +
      'animation:certReveal .55s cubic-bezier(.22,1,.36,1) ' + (i * 80 + 120) + 'ms both;';

    frame.innerHTML =
      '<div class="cert-card-inner">' +
        '<div class="cc-top-row">' +
          '<div class="cc-icon-wrap" style="background:' + (cert.logo ? '#ffffff' : accent + '22') + ';color:' + accent + ';">' +
            (cert.logo
              ? '<img src="' + cert.logo + '" alt="' + cert.issuer + ' logo" style="width:100%;height:100%;object-fit:contain;">'
              : '<i class="fas ' + cert.icon + '"></i>'
            ) +
          '</div>' +
          '<span class="cc-badge ' + cert.badgeClass + '">' + cert.badge + '</span>' +
        '</div>' +
        '<div class="cc-category" style="color:' + accent + ';">' + cert.category + '</div>' +
        '<div class="cc-title">' + cert.title + '</div>' +
        '<div class="cc-issuer"><i class="fas fa-building"></i> ' + cert.issuer + '</div>' +
        '<div class="cc-date"><i class="fas fa-calendar-alt"></i> ' + cert.date + '</div>' +
        '<div class="cc-desc">' + cert.desc + '</div>' +
        (cert.url
          ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" ' +
            'class="cc-cert-btn" style="--ba:' + accent + ';border-color:' + accent + '44;color:' + accent + ';">' +
            '<i class="fas fa-eye"></i> View Certificate</a>'
          : '<span class="cc-in-progress"><i class="fas fa-clock"></i> In Progress</span>'
        ) +
      '</div>';

    grid.appendChild(frame);
    if (certObserver) certObserver.observe(frame);
  });
}



// ============================================================
// SECTION 24 · CONSOLE SIGNATURE
// ============================================================

function printSignature() {
  console.log(
    '%c\u2628  SAJID MEHMOOD \u00B7 IT SYSTEMS ENGINEER',
    'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
  );
  console.log('%cCCNA Certified \u00B7 Enterprise Infrastructure \u00B7 WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
}


// ============================================================
// NEUBRUTALISM · CARTOON BOUNCE OBSERVER
// ============================================================

(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.style.animationDelay = (i * 0.08) + 's';
        el.classList.add('neu-bounce-in');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.proj-card, .exp-item, .kpi-block, .ach-item').forEach(function (el) {
    observer.observe(el);
  });
})();

// ============================================================
// NEUBRUTALISM · CARD TILT ON HOVER — removed.
// Cards no longer tilt or translate toward the cursor; their fixed
// hover lift/shadow is handled entirely in CSS.
// ============================================================


// ============================================================
// WEATHER BAR — Clock + Live Weather, auto-detected per visitor
// ============================================================

(function () {
  'use strict';

  var elTime    = document.getElementById('wbTime');
  var elDate    = document.getElementById('wbDate');
  var elWeather = document.getElementById('wbWeather');

  if (!elTime && !elDate && !elWeather) return;

  // ── 1. CLOCK — always the visitor's own device timezone ──────
  // Intl reads this straight from the OS, no permission prompt needed,
  // so a visitor in Pakistan sees Pakistan time, not Qatar time.
  var LOCAL_TZ = (function () {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Qatar';
    } catch (e) {
      return 'Asia/Qatar'; // ancient browsers with no Intl support
    }
  })();

  function tickClock() {
    var now = new Date();

    var t = now.toLocaleTimeString('en-US', {
      timeZone: LOCAL_TZ,
      hour:     'numeric',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   true
    });

    var d = now.toLocaleDateString('en-GB', {
      timeZone: LOCAL_TZ,
      weekday:  'short',
      day:      '2-digit',
      month:    'short',
      year:     'numeric'
    });

    if (elTime) elTime.textContent = t;
    if (elDate) elDate.textContent = d;
  }

  tickClock();
  setInterval(tickClock, 1000);

  // ── 2. LOCATION — IP-based geolocation, no permission prompt ─
  // (navigator.geolocation would be more precise but pops a browser
  // permission dialog most visitors will just dismiss — IP lookup is
  // "good enough" for a weather widget and works silently for everyone.)
  var DOHA_LAT = 25.2854, DOHA_LON = 51.5310; // last-resort fallback if every provider fails
  var geo = { lat: DOHA_LAT, lon: DOHA_LON, label: 'Doha, QA' };

  // Several free, no-API-key IP-geolocation providers, tried in order.
  // A single provider (ipapi.co) has a low free-tier rate limit and
  // starts silently failing under normal traffic — that was causing
  // every visitor to see the Doha fallback instead of their own city.
  // Chaining providers means we only fall back to Doha if ALL of them
  // are down at once.
  var GEO_PROVIDERS = [
    {
      url: 'https://ipapi.co/json/',
      parse: function (d) {
        if (!d || !d.latitude || !d.longitude) return null;
        var city = d.city || '';
        var cc   = d.country_code || d.country_name || '';
        return { lat: d.latitude, lon: d.longitude, label: (city ? city + ', ' : '') + cc };
      }
    },
    {
      url: 'https://ipwho.is/',
      parse: function (d) {
        if (!d || d.success === false || !d.latitude || !d.longitude) return null;
        var city = d.city || '';
        var cc   = (d.country_code || d.country || '');
        return { lat: d.latitude, lon: d.longitude, label: (city ? city + ', ' : '') + cc };
      }
    },
    {
      url: 'https://get.geojs.io/v1/ip/geo.json',
      parse: function (d) {
        if (!d || !d.latitude || !d.longitude) return null;
        var city = d.city || '';
        var cc   = d.country_code || d.country || '';
        return { lat: parseFloat(d.latitude), lon: parseFloat(d.longitude), label: (city ? city + ', ' : '') + cc };
      }
    }
  ];

  function tryProvider(i) {
    if (i >= GEO_PROVIDERS.length) {
      console.warn('[WeatherBar] all location providers failed, defaulting to Doha');
      return Promise.resolve();
    }
    var provider = GEO_PROVIDERS[i];
    return fetch(provider.url, { signal: AbortSignal.timeout(5000) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var result = provider.parse(d);
        if (!result) throw new Error('empty/invalid response');
        geo.lat = result.lat;
        geo.lon = result.lon;
        geo.label = result.label;
      })
      .catch(function (e) {
        console.warn('[WeatherBar] provider failed (' + provider.url + '):', e.message);
        return tryProvider(i + 1);
      });
  }

  function detectLocation() {
    return tryProvider(0);
  }

  // ── 3. WEATHER (Open-Meteo — free, no API key needed) ────────
  var WMO_CODES = {
    0:  { label: 'Clear',          icon: 'fa-sun' },
    1:  { label: 'Mostly Clear',   icon: 'fa-sun' },
    2:  { label: 'Partly Cloudy',  icon: 'fa-cloud-sun' },
    3:  { label: 'Overcast',       icon: 'fa-cloud' },
    45: { label: 'Fog',            icon: 'fa-smog' },
    48: { label: 'Icy Fog',        icon: 'fa-smog' },
    51: { label: 'Light Drizzle',  icon: 'fa-cloud-drizzle' },
    53: { label: 'Drizzle',        icon: 'fa-cloud-drizzle' },
    55: { label: 'Heavy Drizzle',  icon: 'fa-cloud-drizzle' },
    61: { label: 'Light Rain',     icon: 'fa-cloud-rain' },
    63: { label: 'Rain',           icon: 'fa-cloud-rain' },
    65: { label: 'Heavy Rain',     icon: 'fa-cloud-showers-heavy' },
    71: { label: 'Light Snow',     icon: 'fa-snowflake' },
    73: { label: 'Snow',           icon: 'fa-snowflake' },
    75: { label: 'Heavy Snow',     icon: 'fa-snowflake' },
    80: { label: 'Showers',        icon: 'fa-cloud-sun-rain' },
    81: { label: 'Showers',        icon: 'fa-cloud-rain' },
    82: { label: 'Heavy Showers',  icon: 'fa-cloud-showers-heavy' },
    95: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' },
    96: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' },
    99: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' }
  };

  function setWeather(html) {
    if (elWeather) elWeather.innerHTML = html;
  }

  function fetchWeather() {
    setWeather(
      '<i class="fas fa-location-crosshairs wb-icon wb-spin"></i>' +
      '<span class="wb-weather-text">Fetching weather…</span>'
    );

    var url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude='  + geo.lat +
      '&longitude=' + geo.lon +
      '&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m' +
      '&temperature_unit=celsius' +
      '&windspeed_unit=kmh' +
      '&timezone=' + encodeURIComponent(LOCAL_TZ);

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var c    = data.current;
        var code = c.weathercode;
        var info = WMO_CODES[code] || { label: 'Unknown', icon: 'fa-cloud' };
        var temp = Math.round(c.temperature_2m);
        var feel = Math.round(c.apparent_temperature);
        var wind = Math.round(c.windspeed_10m);
        var hum  = Math.round(c.relativehumidity_2m);

        setWeather(
          '<i class="fas ' + info.icon + ' wb-icon"></i>' +
          '<span class="wb-weather-text">' +
            '<strong style="color:var(--text-primary,#F1F5F9)">' + temp + '°C</strong>' +
            ' · ' + info.label +
            ' · Feels ' + feel + '°C' +
            ' · ' + hum + '% RH' +
            ' · ' + wind + ' km/h' +
            ' <span style="opacity:.55;font-size:9px;">' + geo.label + '</span>' +
          '</span>'
        );

        // Refresh every 10 minutes
        setTimeout(fetchWeather, 10 * 60 * 1000);
      })
      .catch(function (err) {
        setWeather(
          '<i class="fas fa-triangle-exclamation wb-icon" style="color:#F59E0B"></i>' +
          '<span class="wb-weather-text">Weather unavailable</span>'
        );
        // Retry in 2 minutes on error
        setTimeout(fetchWeather, 2 * 60 * 1000);
        console.warn('[WeatherBar] fetch failed:', err);
      });
  }

  // Detect location first, THEN fetch weather for those coordinates.
  // Give the page 800ms to settle either way.
  detectLocation().then(function () {
    setTimeout(fetchWeather, 800);
  });

})();

// Experience tab system — static HTML panels
(function() {
  var tabs = document.querySelectorAll('.exp-tab');
  var panels = document.querySelectorAll('.exp-panel');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
})();


// ============================================================
// ✦ SECTOR ORBIT — 3D Glass Ellipse Carousel v3.0
// ============================================================
// Mexican Wave — sine-wave bounce across horizontal chip row
// Each chip oscillates up/down with a staggered phase offset,
// creating a rolling wave. Peak chip = active (glowing).
// Drag left/right to surf the wave manually.
// ============================================================
(function () {
  'use strict';

  // ── Tuning ──────────────────────────────────────────────
  var WAVE_SPEED   = 0.022;  // radians per frame (wave advance speed)
  var WAVE_AMP     = 16;     // vertical bounce amplitude in px
  var DRAG_SENS    = 0.012;  // drag → phase shift sensitivity
  var SCALE_MIN    = 0.80;   // chip scale at wave trough
  var SCALE_MAX    = 1.06;   // chip scale at wave peak
  var OPACITY_MIN  = 0.38;   // chip opacity at wave trough
  var OPACITY_MAX  = 1.00;   // chip opacity at wave peak
  var ENTRY_MS     = 580;    // staggered fade-in duration
  // ────────────────────────────────────────────────────────

  function initWave() {
    var wrap  = document.querySelector('.sector-ticker-wrap');
    var track = document.querySelector('.sector-ticker-track');
    if (!wrap || !track) return;

    var allItems = track.querySelectorAll('.sector-ticker-item');
    var items = [];
    for (var i = 0; i < Math.min(5, allItems.length); i++) {
      items.push(allItems[i]);
    }
    for (var j = 5; j < allItems.length; j++) {
      allItems[j].style.display = 'none';
    }
    if (!items.length) return;

    var N        = items.length;
    var phase    = 0;       // global wave phase (radians)
    var paused   = false;
    var dragging = false;
    var lastX    = 0;
    var frontIdx = 0;
    var started  = false;
    var cachedW  = 0;       // last known real width

    // ── Measure the actual rendered width, retrying until non-zero ──
    function getRealWidth() {
      // Try the wrap first, then fall back up the DOM tree
      var w = wrap.getBoundingClientRect().width;
      if (!w) w = wrap.offsetWidth;
      if (!w && wrap.parentElement) w = wrap.parentElement.getBoundingClientRect().width;
      return w || 0;
    }

    // Evenly distribute chip X positions across the pill track
    function getXPositions(w) {
      var padX   = Math.max(30, w * 0.08);
      var usable = w - padX * 2;
      var step   = N > 1 ? usable / (N - 1) : 0;
      var pos    = [];
      for (var i = 0; i < N; i++) {
        pos.push(padX + i * step - w / 2);  // offset from center (left:50%)
      }
      return pos;
    }

    function positionItems(ph) {
      var w = getRealWidth();
      if (!w) return;           // layout not ready yet — skip frame
      cachedW = w;

      var xPos      = getXPositions(w);
      var maxSin    = -Infinity;
      var newFront  = 0;
      var TWO_PI    = Math.PI * 2;
      var phaseStep = TWO_PI / N;  // equal phase gap between chips

      items.forEach(function (el, i) {
        var chipPhase = ph + i * phaseStep;
        var sinVal    = Math.sin(chipPhase);   // -1 (trough) → +1 (peak)
        var zNorm     = (sinVal + 1) / 2;      // 0 → 1

        var scale   = SCALE_MIN   + (SCALE_MAX   - SCALE_MIN)   * zNorm;
        var opacity = OPACITY_MIN + (OPACITY_MAX  - OPACITY_MIN) * zNorm;
        var dy      = -sinVal * WAVE_AMP;      // negative = chip goes UP at peak
        var zIndex  = Math.round(zNorm * 8 + 1);

        el.style.transform =
          'translate(calc(-50% + ' + xPos[i].toFixed(2) + 'px),' +
          ' calc(-50% + '          + dy.toFixed(2)      + 'px))' +
          ' scale('                + scale.toFixed(3)   + ')';
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex  = zIndex;

        if (sinVal > maxSin) { maxSin = sinVal; newFront = i; }
      });

      // Toggle active class only on change
      if (newFront !== frontIdx) {
        items[frontIdx].classList.remove('sti-active');
        items[newFront].classList.add('sti-active');
        frontIdx = newFront;
      }
    }

    // ── Animation loop ─────────────────────────────────────
    function tick() {
      if (!dragging && !paused) {
        phase += WAVE_SPEED;
      }
      phase = phase % (Math.PI * 2);
      positionItems(phase);
      requestAnimationFrame(tick);
    }

    // ── Mouse drag ─────────────────────────────────────────
    wrap.addEventListener('mousedown', function (e) {
      dragging = true;
      lastX    = e.clientX;
      wrap.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      phase += (e.clientX - lastX) * DRAG_SENS;
      lastX  = e.clientX;
    });
    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = 'grab';
    });

    // ── Touch drag ─────────────────────────────────────────
    wrap.addEventListener('touchstart', function (e) {
      dragging = true;
      lastX    = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (!dragging || !e.touches[0]) return;
      phase += (e.touches[0].clientX - lastX) * DRAG_SENS;
      lastX  = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function () {
      dragging = false;
    });

    // ── Hover pause ────────────────────────────────────────
    wrap.addEventListener('mouseenter', function () {
      if (!dragging) paused = true;
    });
    wrap.addEventListener('mouseleave', function () {
      paused = false;
    });

    // ── Start: wait until the wrap has a real rendered width ──
    // The gate overlay hides everything on load; the wrap gets width
    // only after the gate dismisses and layout is painted.
    function tryStart() {
      var w = getRealWidth();
      if (!w) {
        // Not painted yet — retry next frame
        requestAnimationFrame(tryStart);
        return;
      }
      if (started) return;
      started = true;

      // Staggered entry fade-in
      items.forEach(function (el) {
        el.style.opacity    = '0';
        el.style.visibility = 'visible';
      });
      positionItems(0);
      items[0].classList.add('sti-active');

      items.forEach(function (el, i) {
        setTimeout(function () {
          el.style.transition = 'opacity ' + ENTRY_MS + 'ms cubic-bezier(0.22,1,0.36,1)';
          el.style.opacity = '';
          setTimeout(function () { el.style.transition = ''; }, ENTRY_MS + 50);
        }, 100 + i * 80);
      });

      wrap.classList.add('wave-initialized');
      tick();
    }

    // Also re-spread chips on window resize (e.g. orientation change)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        positionItems(phase);
      }, 80);
    });

    // Kick off — will self-retry via rAF until layout is ready
    requestAnimationFrame(tryStart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWave);
  } else {
    initWave();
  }
})();



// ============================================================
// NAV LOGO NAME — Click navigates to homepage / main website
// ============================================================
(function () {
  'use strict';

  function initNavNameLink() {
    var el = document.getElementById('navLogoName');
    if (!el) return;

    var _wasDragging = false;

    // Set the name text
    if (!el.textContent.trim()) {
      el.textContent = 'Sajid Mehmood';
    }

    // Detect if drag just happened so we don't navigate on drag-release
    el.addEventListener('mousedown', function () { _wasDragging = false; });
    el.addEventListener('mousemove', function () { _wasDragging = true; });
    el.addEventListener('touchstart', function () { _wasDragging = false; }, { passive: true });
    el.addEventListener('touchmove',  function () { _wasDragging = true;  }, { passive: true });

    el.addEventListener('click', function (e) {
      if (_wasDragging) { _wasDragging = false; return; }
      // If gate is still visible, do nothing
      // FIX: id was 'gateOverlay' (camelCase) which never matched the real
      // element id="gate-overlay", so this check silently always failed.
      var gate = document.getElementById('gate-overlay');
      if (gate && document.body.classList.contains('gate-active')) return;
      // Navigate to top of main website
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update URL to root without reload
      if (history.pushState) history.pushState(null, '', '/');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavNameLink);
  } else {
    initNavNameLink();
  }
})();


// ============================================================
// SECTION NEW-A · INTERSECTION OBSERVER — Reveal Animations
// Handles: .reveal-up, .reveal-left, .reveal-scale,
//          .timeline-item, .stack-tech-item, .why-item,
//          .stat-card, .sti-progress-fill (tech stack bars)
// ============================================================

(function () {
  'use strict';

  function initRevealObserver() {
    var REVEAL_SELECTORS = [
      '.reveal-up', '.reveal-left', '.reveal-scale',
      '.timeline-item', '.why-item', '.stat-card',
      '.rec-screenshot-card', '.cisco-cert-card',
      '.availability-banner', '.cta-action-btn'
    ];

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    REVEAL_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        revealObs.observe(el);
      });
    });

    // Stack tech items — also trigger progress bar fill
    var stackObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          stackObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.stack-tech-item').forEach(function (el) {
      stackObs.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealObserver);
  } else {
    initRevealObserver();
  }
})();


// ============================================================
// SECTION NEW-B · ANIMATED STAT COUNTERS (Stats Grid)
// Targets elements with data-stat-count="600" etc.
// Easing: exponential decay for a snappy feel.
// ============================================================

(function () {
  'use strict';

  function animateStatNum(el, target, suffix) {
    var duration = 1800;
    var start    = performance.now();
    suffix = suffix || '';

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      // Ease out expo
      var eased = 1 - Math.pow(2, -10 * progress);
      var current = Math.ceil(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  function initStatCounters() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var raw    = el.getAttribute('data-stat-count') || '0';
        // Support suffix like "600+" or "95%" — split number from suffix
        var match  = raw.match(/^(\d+)(.*)$/);
        if (!match) return;
        var num    = parseInt(match[1], 10);
        var suffix = match[2] || '';
        el.textContent = '0' + suffix;
        animateStatNum(el, num, suffix);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-stat-count]').forEach(function (el) {
      obs.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatCounters);
  } else {
    initStatCounters();
  }
})();


// ============================================================
// SECTION NEW-C · FLOATING WHATSAPP BUTTON
// Auto-hides when mobile sticky CTA bar is visible.
// Shows after 3s scroll delay so it doesn't appear instantly.
// ============================================================

(function () {
  'use strict';

  function initFloatWhatsApp() {
    var btn = document.getElementById('floatWhatsApp');
    if (!btn) return;

    // Hide initially
    btn.style.opacity    = '0';
    btn.style.transform  = 'scale(0.7)';
    btn.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    btn.style.pointerEvents = 'none';

    var shown    = false;
    var _rafPend = false;

    window.addEventListener('scroll', function () {
      if (_rafPend) return;
      _rafPend = true;
      requestAnimationFrame(function () {
        _rafPend = false;
        var shouldShow = window.scrollY > 300;
        if (shouldShow && !shown) {
          shown = true;
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1)';
          btn.style.pointerEvents = 'auto';
        } else if (!shouldShow && shown) {
          shown = false;
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.7)';
          btn.style.pointerEvents = 'none';
        }
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatWhatsApp);
  } else {
    initFloatWhatsApp();
  }
})();


// ============================================================
// SECTION NEW-D · STICKY MOBILE CTA BAR
// Hides when user scrolls near the contact section.
// Shows when user scrolls up / is in hero/about area.
// ============================================================

(function () {
  'use strict';

  function initStickyMobileCTA() {
    var bar = document.getElementById('stickyMobileCTA');
    if (!bar) return;

    var lastScrollY  = 0;
    var _rafPend     = false;
    var HIDE_AT_BOTTOM = 80; // px from bottom — hide near footer

    window.addEventListener('scroll', function () {
      if (_rafPend) return;
      _rafPend = true;
      requestAnimationFrame(function () {
        _rafPend = false;
        var scrollY    = window.scrollY;
        var pageH      = document.body.scrollHeight;
        var windowH    = window.innerHeight;
        var nearBottom = (pageH - scrollY - windowH) < HIDE_AT_BOTTOM;

        if (nearBottom) {
          bar.classList.add('hidden');
        } else {
          bar.classList.remove('hidden');
        }
        lastScrollY = scrollY;
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickyMobileCTA);
  } else {
    initStickyMobileCTA();
  }
})();


// ============================================================
// SECTION NEW-E · AVAILABILITY STATUS — Live Date/Time Chip
// Injects current Qatar time and "Available" status
// into any element with id="availabilityTime"
// ============================================================

(function () {
  'use strict';

  function updateAvailabilityTime() {
    var el = document.getElementById('availabilityTime');
    if (!el) return;
    try {
      var now  = new Date();
      var opts = { timeZone: 'Asia/Qatar', hour: '2-digit', minute: '2-digit', hour12: true };
      var time = now.toLocaleTimeString('en-US', opts);
      el.textContent = 'Qatar ' + time;
    } catch (e) { /* ignore */ }
  }

  function initAvailabilityTime() {
    updateAvailabilityTime();
    setInterval(updateAvailabilityTime, 60000); // update every minute
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvailabilityTime);
  } else {
    initAvailabilityTime();
  }
})();


// ============================================================
// SECTION NEW-F · RECRUITER RECOMMENDATION CARDS
// Populates .rec-screenshots-grid with the two LinkedIn
// colleagues specified. Falls back gracefully if element missing.
// ============================================================

(function () {
  'use strict';

  var RECOMMENDATIONS = [
    {
      initials:    'RA',
      name:        'Rayees Abdullah',
      role:        'Senior IT Engineer · UBTJV Project',
      linkedinUrl: 'https://www.linkedin.com/in/rayees-abdullah-927a171a1',
      quote:       'Sajid demonstrated exceptional technical skill and dedication throughout the UBTJV project. His ability to handle complex IT challenges under pressure while maintaining professionalism made him an invaluable team member. Working alongside him was a genuine pleasure.'
    },
    {
      initials:    'SM',
      name:        'Shafeek Mohamed',
      role:        'IT Manager · PIH Head Office',
      linkedinUrl: 'https://www.linkedin.com/in/shafeek-mohamed-4434b951',
      quote:       'As IT Manager at PIH, I witnessed firsthand how Sajid led our head office support during critical operations. His technical depth, calm under pressure, and cross-functional communication were outstanding. He consistently resolved complex server and infrastructure issues with minimal escalation.'
    }
  ];

  function buildRecCard(rec) {
    var card = document.createElement('div');
    card.className = 'rec-screenshot-card reveal-up';

    var header = document.createElement('div');
    header.className = 'rec-card-header';

    var avatar = document.createElement('div');
    avatar.className = 'rec-avatar';
    avatar.textContent = rec.initials;

    var meta = document.createElement('div');
    meta.className = 'rec-card-meta';

    var nameEl = document.createElement('div');
    nameEl.className = 'rec-name';
    nameEl.textContent = rec.name;

    var roleEl = document.createElement('div');
    roleEl.className = 'rec-role';
    roleEl.textContent = rec.role;

    meta.appendChild(nameEl);
    meta.appendChild(roleEl);

    var badge = document.createElement('a');
    badge.href   = rec.linkedinUrl;
    badge.target = '_blank';
    badge.rel    = 'noopener noreferrer';
    badge.className = 'rec-linkedin-badge';
    badge.setAttribute('aria-label', 'View ' + rec.name + ' on LinkedIn');
    badge.innerHTML = '<i class="fab fa-linkedin"></i>';

    header.appendChild(avatar);
    header.appendChild(meta);
    header.appendChild(badge);

    var quote = document.createElement('p');
    quote.className = 'rec-quote';
    quote.textContent = rec.quote;

    card.appendChild(header);
    card.appendChild(quote);
    return card;
  }

  function initRecCards() {
    var grids = document.querySelectorAll('.rec-screenshots-grid');
    if (!grids.length) return;
    grids.forEach(function (grid) {
      // Don't double-populate
      if (grid.children.length > 0) return;
      RECOMMENDATIONS.forEach(function (rec) {
        grid.appendChild(buildRecCard(rec));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecCards);
  } else {
    initRecCards();
  }
})();


// ============================================================
// SECTION NEW-G · CCNA CERTIFICATION CARD — Verification Link
// Adds click-to-verify behaviour on .cisco-verify-btn
// and animates the cert card on scroll entry.
// ============================================================

(function () {
  'use strict';

  function initCiscoCert() {
    // Animate cert card into view
    var certCard = document.querySelector('.cisco-cert-card');
    if (certCard) {
      var certObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Trigger verify badge pulse
            var badge = entry.target.querySelector('.cert-verify-badge');
            if (badge) {
              badge.style.animation = 'none';
              setTimeout(function () {
                badge.style.animation = '';
              }, 100);
            }
            certObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      certObs.observe(certCard);
    }

    // Verify button: open Cisco cert checker
    document.querySelectorAll('.cisco-verify-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var certId = btn.getAttribute('data-cert-id');
        if (certId) {
          e.preventDefault();
          window.open(
            'https://cp.certmetrics.com/cisco/en/public/verify/credential/' + certId,
            '_blank', 'noopener,noreferrer'
          );
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCiscoCert);
  } else {
    initCiscoCert();
  }
})();


// ============================================================
// SECTION NEW-H · TECH STACK — Animated Emoji Grid Builder
// Renders .stack-tech-grid elements from data-* attributes.
// Also handles manual stagger delay for each item.
// ============================================================

(function () {
  'use strict';

  // Tech stack data — grouped categories with emoji logos
  var TECH_STACK = [
    {
      category: 'Endpoint Management',
      items: [
        { emoji: '🖥️',  label: 'Windows 10/11',   pct: 95 },
        { emoji: '🍎',  label: 'macOS',            pct: 80 },
        { emoji: '🐧',  label: 'Linux (Ubuntu)',   pct: 75 },
        { emoji: '📱',  label: 'Mobile MDM',       pct: 70 },
        { emoji: '🔧',  label: 'SCCM / Intune',    pct: 82 }
      ]
    },
    {
      category: 'Cisco Networking',
      items: [
        { emoji: '🌐',  label: 'Cisco Switches',   pct: 88 },
        { emoji: '📡',  label: 'Cisco Routers',    pct: 85 },
        { emoji: '🔒',  label: 'Cisco ASA/FTD',    pct: 78 },
        { emoji: '📶',  label: 'Cisco WLC/WAP',    pct: 80 },
        { emoji: '🛡️',  label: 'CCNA Certified',   pct: 90 }
      ]
    },
    {
      category: 'Microsoft Infrastructure',
      items: [
        { emoji: '🗂️',  label: 'Active Directory', pct: 92 },
        { emoji: '📬',  label: 'Exchange / M365',  pct: 88 },
        { emoji: '☁️',  label: 'Azure AD',         pct: 75 },
        { emoji: '📊',  label: 'SharePoint',       pct: 72 },
        { emoji: '🖨️',  label: 'Print Services',   pct: 85 }
      ]
    },
    {
      category: 'Security & Firewalls',
      items: [
        { emoji: '🔥',  label: 'Fortinet FortiGate', pct: 80 },
        { emoji: '🛡️',  label: 'Kaspersky EDR',      pct: 88 },
        { emoji: '🔐',  label: 'VPN / Zero Trust',   pct: 78 },
        { emoji: '📋',  label: 'SIEM Basics',        pct: 65 },
        { emoji: '🚨',  label: 'Incident Response',  pct: 85 }
      ]
    },
    {
      category: 'VMware & Servers',
      items: [
        { emoji: '⚙️',  label: 'VMware vSphere',  pct: 78 },
        { emoji: '🗄️',  label: 'Windows Server',  pct: 90 },
        { emoji: '📦',  label: 'Hyper-V',         pct: 72 },
        { emoji: '💾',  label: 'NAS / SAN',       pct: 70 },
        { emoji: '🔄',  label: 'Backup & DR',     pct: 82 }
      ]
    }
  ];

  function buildStackGrid(container) {
    if (!container) return;
    // Don't rebuild if already populated
    if (container.querySelector('.stack-category')) return;

    TECH_STACK.forEach(function (group) {
      var section = document.createElement('div');
      section.className = 'stack-category';

      var label = document.createElement('div');
      label.className = 'stack-cat-label';
      label.textContent = group.category;
      section.appendChild(label);

      var grid = document.createElement('div');
      grid.className = 'stack-tech-grid';

      group.items.forEach(function (item, idx) {
        var el = document.createElement('div');
        el.className = 'stack-tech-item stagger-' + Math.min(idx + 1, 6);
        el.setAttribute('data-pct', item.pct);

        var emoji = document.createElement('span');
        emoji.className   = 'sti-emoji';
        emoji.textContent = item.emoji;

        var lbl = document.createElement('span');
        lbl.className   = 'sti-label';
        lbl.textContent = item.label;

        var bar = document.createElement('div');
        bar.className = 'sti-progress';
        var fill = document.createElement('div');
        fill.className = 'sti-progress-fill';
        // Set width via CSS custom property for the fill target
        fill.style.setProperty('--pct', (item.pct / 100).toFixed(2));
        bar.appendChild(fill);

        el.appendChild(emoji);
        el.appendChild(lbl);
        el.appendChild(bar);
        grid.appendChild(el);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });

    // Now observe each stack item for scroll reveal + bar animation
    var stackObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el   = entry.target;
          var pct  = parseFloat(el.getAttribute('data-pct') || '0') / 100;
          el.classList.add('in-view');
          var fill = el.querySelector('.sti-progress-fill');
          if (fill) {
            setTimeout(function () {
              fill.style.transform = 'scaleX(' + pct + ')';
            }, 80);
          }
          stackObs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    container.querySelectorAll('.stack-tech-item').forEach(function (el) {
      stackObs.observe(el);
    });
  }

  function initTechStack() {
    var containers = document.querySelectorAll('.tech-stack-container, #techStackGrid, .stack-container');
    containers.forEach(function (c) { buildStackGrid(c); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechStack);
  } else {
    initTechStack();
  }
})();


// ============================================================
// SECTION NEW-I · WHY HIRE ME — Dynamic Card Builder
// Renders #whyHireGrid from internal data.
// Staggered reveal via IntersectionObserver.
// ============================================================

(function () {
  'use strict';

  var WHY_HIRE = [
    { emoji: '🧘', title: 'Calm Under Pressure',         desc: 'Managed live incidents at Hamad Airport, FIFA World Cup cyber attack, and hospital EMR systems — composure is a core skill.' },
    { emoji: '🏢', title: 'Enterprise Environment DNA',  desc: '3+ years across PIH, Military Medical City, and HIA — deep familiarity with large-scale corporate IT governance and SLAs.' },
    { emoji: '⬆️', title: 'High Uptime Mindset',         desc: 'Zero EMR downtime across 3 hospital sites. Zero infrastructure downtime during HIA UPS failure. Uptime is personal.' },
    { emoji: '🤝', title: 'Cross-Functional Communication', desc: 'Briefed CEOs, Directors, and hospital managers. Equally fluent with IT teams, vendors, and non-technical stakeholders.' },
    { emoji: '⚡', title: 'Fast Troubleshooting',        desc: '1000+ tickets managed with 95%+ SLA compliance. Systematic diagnosis, rapid resolution — minimal business disruption.' },
    { emoji: '📄', title: 'Documentation Discipline',    desc: 'Built digital asset registries, audit logs, and inventory systems from scratch across multiple enterprise deployments.' },
    { emoji: '🌍', title: 'GCC Market Knowledge',        desc: '4+ years based in Qatar — familiar with local IT standards, government systems, and enterprise culture across GCC.' },
    { emoji: '🔐', title: 'Security-First Thinking',     desc: 'Led active cyber incident response during FIFA 2022. Deployed Kaspersky EDR centrally. VPN, firewall, and zero-trust exposure.' }
  ];

  function buildWhyHireGrid(container) {
    if (!container) return;
    if (container.children.length > 0) return; // don't repopulate

    WHY_HIRE.forEach(function (item, idx) {
      var el = document.createElement('div');
      el.className = 'why-item reveal-up stagger-' + Math.min((idx % 6) + 1, 6);

      var iconWrap = document.createElement('div');
      iconWrap.className   = 'why-icon-wrap';
      iconWrap.textContent = item.emoji;

      var content = document.createElement('div');
      content.className = 'why-content';

      var title = document.createElement('div');
      title.className   = 'why-title';
      title.textContent = item.title;

      var desc = document.createElement('div');
      desc.className   = 'why-desc';
      desc.textContent = item.desc;

      content.appendChild(title);
      content.appendChild(desc);
      el.appendChild(iconWrap);
      el.appendChild(content);
      container.appendChild(el);
    });
  }

  function initWhyHire() {
    var containers = document.querySelectorAll('#whyHireGrid, .why-hire-grid');
    containers.forEach(function (c) { buildWhyHireGrid(c); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhyHire);
  } else {
    initWhyHire();
  }
})();


// ============================================================
// SECTION NEW-J · LINKEDIN HERO ICON — Inject into hero section
// Adds LinkedIn icon next to hero social row if not already present.
// ============================================================

(function () {
  'use strict';

  var LINKEDIN_URL = 'https://www.linkedin.com/in/rayees-abdullah-927a171a1'; // replace with Sajid's URL when known

  function initLinkedInHero() {
    // Look for the hero social links row
    var socialRow = document.querySelector('.hero-social-row, .hero-cta-row, .hero-links, .hero-actions');
    if (!socialRow) return;
    // Don't double-inject
    if (socialRow.querySelector('.linkedin-hero-icon')) return;

    var a = document.createElement('a');
    a.href      = 'https://www.linkedin.com/in/sajid-mehmood';
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.className = 'linkedin-hero-icon';
    a.setAttribute('aria-label', 'LinkedIn Profile');
    a.innerHTML = '<i class="fab fa-linkedin-in"></i>';

    socialRow.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLinkedInHero);
  } else {
    initLinkedInHero();
  }
})();


// ============================================================
// SECTION NEW-K · CTA CONTACT BUTTONS — Action Builder
// Builds or wires up the 4 action CTA buttons dynamically
// if .contact-cta-grid exists but is empty.
// ============================================================

(function () {
  'use strict';

  var CTA_BUTTONS = [
    {
      id:        'ctaResume',
      className: 'cta-action-btn cta-btn-resume',
      icon:      '⬇️',
      label:     'Download Resume',
      href:      'https://drive.google.com/uc?export=download&id=1-Ktw3XGNO4UZvxATGR9ED44NZiFMlwz_',
      download:  true
    },
    {
      id:        'ctaWhatsApp',
      className: 'cta-action-btn cta-btn-whatsapp',
      icon:      '💬',
      label:     'WhatsApp Me',
      href:      'https://wa.me/97455782505',
      external:  true
    },
    {
      id:        'ctaSchedule',
      className: 'cta-action-btn cta-btn-schedule',
      icon:      '📅',
      label:     'Schedule Interview',
      href:      'mailto:sajidmehmood.it@gmail.com?subject=Interview%20Request',
      external:  false
    },
    {
      id:        'ctaLinkedIn',
      className: 'cta-action-btn cta-btn-linkedin',
      icon:      '🔗',
      label:     'LinkedIn Profile',
      href:      'https://www.linkedin.com/in/sajid-mehmood',
      external:  true
    }
  ];

  function buildCTAGrid(container) {
    if (!container) return;
    // Wire up existing buttons first
    CTA_BUTTONS.forEach(function (btn) {
      var existing = document.getElementById(btn.id);
      if (existing) return; // already in HTML
    });

    // If grid is empty, build it
    if (container.children.length > 0) return;

    CTA_BUTTONS.forEach(function (btn) {
      var a = document.createElement('a');
      a.id        = btn.id;
      a.className = btn.className;
      a.href      = btn.href;
      if (btn.external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      if (btn.download) { a.setAttribute('download', ''); }

      var iconSpan = document.createElement('span');
      iconSpan.className   = 'cta-btn-icon';
      iconSpan.textContent = btn.icon;

      var labelSpan = document.createElement('span');
      labelSpan.textContent = btn.label;

      a.appendChild(iconSpan);
      a.appendChild(labelSpan);
      container.appendChild(a);
    });
  }

  function initCTAButtons() {
    var grids = document.querySelectorAll('.contact-cta-grid');
    grids.forEach(function (g) { buildCTAGrid(g); });

    // Wire floating WhatsApp independently
    var floatBtn = document.getElementById('floatWhatsApp');
    if (floatBtn && !floatBtn.getAttribute('href')) {
      floatBtn.href   = 'https://wa.me/97455782505';
      floatBtn.target = '_blank';
      floatBtn.rel    = 'noopener noreferrer';
    }

    // Wire sticky mobile CTA buttons
    var stickyWa  = document.getElementById('stickyWhatsApp');
    var stickyInt = document.getElementById('stickyInterview');
    if (stickyWa)  { stickyWa.href  = 'https://wa.me/97455782505'; stickyWa.target  = '_blank'; stickyWa.rel  = 'noopener noreferrer'; }
    if (stickyInt) { stickyInt.href = 'mailto:sajidmehmood.it@gmail.com?subject=Interview%20Request'; }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCTAButtons);
  } else {
    initCTAButtons();
  }
})();


// ============================================================
// SECTION NEW-L · VISITOR COUNTER (localStorage)
// Increments a visit counter and renders it into
// any element with id="visitorCounter".
// ============================================================

(function () {
  'use strict';

  function initVisitorCounter() {
    var el = document.getElementById('visitorCounter');
    if (!el) return;

    try {
      var key   = '_smPageViews';
      var count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(count));
      // Display count with a tasteful label
      var formatted = count >= 1000
        ? (count / 1000).toFixed(1) + 'k'
        : count.toString();
      el.textContent = '👁 ' + formatted + ' visit' + (count === 1 ? '' : 's');
      el.title = 'Your visit count on this device';
    } catch (e) {
      el.textContent = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorCounter);
  } else {
    initVisitorCounter();
  }
})();


// ============================================================
// SECTION NEW-M · MAGNETIC HOVER — enhanced version
// Applies a smooth magnetic pull to elements with
// class .magnetic or data-magnetic attribute.
// Integrates with existing initMagneticButtons() gracefully.
// ============================================================

(function () {
  'use strict';

  function initMagneticEnhanced() {
    // Cursor-follow magnetic effect removed — elements with .magnetic /
    // [data-magnetic] now rely solely on fixed CSS hover states.
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticEnhanced);
  } else {
    initMagneticEnhanced();
  }
})();


// ============================================================
// SECTION NEW-N · HERO SECTION TILT — removed.
// The hero card no longer rotates toward the cursor; its fixed
// perspective/translateZ depth is set in CSS (see the "FIXED SPATIAL
// 3D SYSTEM" block).
// ============================================================


// ============================================================
// SECTION NEW-O · SEO META TAGS — Dynamic Injection
// Injects recruiter-targeted SEO keywords and Open Graph
// meta tags dynamically if not already in the <head>.
// ============================================================

(function () {
  'use strict';

  var SEO_META = [
    { name: 'description', content: 'Sajid Mehmood — IT Support Engineer & System Engineer based in Qatar. Available for IT roles in Qatar & GCC. CCNA Certified. 4+ years enterprise experience at PIH, Hamad Airport, Military Medical City.' },
    { name: 'keywords',    content: 'IT Support Engineer Qatar, Desktop Support Engineer Qatar, Network Support Specialist GCC, CCNA Engineer Doha, System Engineer Qatar, IT Helpdesk GCC, Active Directory Qatar, Endpoint Management Qatar, IT Jobs Qatar 2025, Immediate Joiner Qatar IT' },
    { property: 'og:title',       content: 'Sajid Mehmood — IT Support Engineer | Qatar & GCC' },
    { property: 'og:description', content: 'CCNA Certified IT Engineer with 4+ years at Power International Holding, Hamad Airport, and Military Medical City. Available for immediate joining in Qatar & GCC.' },
    { property: 'og:type',        content: 'profile' },
    { name: 'robots',    content: 'index, follow' },
    { name: 'author',    content: 'Sajid Mehmood' }
  ];

  function injectSEOMeta() {
    SEO_META.forEach(function (m) {
      var attr = m.name ? 'name' : 'property';
      var val  = m.name || m.property;
      // Check if already exists
      var existing = document.querySelector('meta[' + attr + '="' + val + '"]');
      if (existing) return;
      var tag = document.createElement('meta');
      tag.setAttribute(attr, val);
      tag.setAttribute('content', m.content);
      document.head.appendChild(tag);
    });

    // Canonical link
    if (!document.querySelector('link[rel="canonical"]')) {
      var canonical = document.createElement('link');
      canonical.rel  = 'canonical';
      canonical.href = window.location.origin + window.location.pathname;
      document.head.appendChild(canonical);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSEOMeta);
  } else {
    injectSEOMeta();
  }
})();


// ============================================================
// SECTION NEW-P · TOUCH PRESS — Extended Selectors
// Extends initTouchPressStates() with new CTA elements
// so iOS users feel native tap feedback.
// ============================================================

(function () {
  'use strict';

  function extendTouchPressStates() {
    var newSelectors = [
      '.cta-action-btn',
      '.linkedin-profile-btn',
      '.cisco-verify-btn',
      '.float-whatsapp',
      '.sticky-mobile-cta a',
      '.rec-screenshot-card',
      '.why-item',
      '.stat-card'
    ].join(',');

    document.querySelectorAll(newSelectors).forEach(function (el) {
      el.addEventListener('touchstart',  function () { el.classList.add('pressed'); },    { passive: true });
      el.addEventListener('touchend',    function () { setTimeout(function () { el.classList.remove('pressed'); }, 150); }, { passive: true });
      el.addEventListener('touchcancel', function () { el.classList.remove('pressed'); }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extendTouchPressStates);
  } else {
    extendTouchPressStates();
  }
})();



// ============================================================
// SECTION INLINE-A · PDF RESUME MODAL
// Moved from inline <script> in index.html
// ============================================================

(function () {
// CV now served from Google Drive (was: embedded base64 PDF).
// Old Drive link: https://drive.google.com/file/d/1wdY06c35F-FkQEh53MEjuYQFbIfOn71g/view?usp=drive_link
// New Drive link: https://drive.google.com/file/d/1-Ktw3XGNO4UZvxATGR9ED44NZiFMlwz_/view?usp=drive_link
var CV_DRIVE_ID = '1-Ktw3XGNO4UZvxATGR9ED44NZiFMlwz_';

function openPdfModal() {
  var modal = document.getElementById('pdfResumeModal');
  var iframe = document.getElementById('pdfIframe');
  var dlBtn = document.getElementById('pdfDownloadBtn');
  // Point the preview + download links at the Drive-hosted CV
  if (!iframe.src || iframe.src === 'about:blank') {
    iframe.src = 'https://drive.google.com/file/d/' + CV_DRIVE_ID + '/preview';
    dlBtn.href = 'https://drive.google.com/uc?export=download&id=' + CV_DRIVE_ID;
  }
  modal.classList.add('pdf-modal--open');
  document.body.classList.add('pdf-modal-open');
}

function closePdfModal() {
  document.getElementById('pdfResumeModal').classList.remove('pdf-modal--open');
  document.body.classList.remove('pdf-modal-open');
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePdfModal();
});

// Expose to global scope — inline onclick="" handlers in the HTML
// run in global/window scope and can't see functions declared only
// inside this IIFE otherwise.
window.openPdfModal  = openPdfModal;
window.closePdfModal = closePdfModal;
})();


// ============================================================
// GATE INTEGRATION — resume + certificate links require a name
// ============================================================
// The gate no longer opens on scroll. Instead it opens the moment a
// visitor tries to view the resume PDF or a certificate/credential
// link, and only lets that specific action through once they've
// entered a name (see window.requireGateThen in the gate module above).
(function () {
  // Wrap the resume opener so every "View Resume" button goes through
  // the gate first.
  var _openResumeDirect = window.openPdfModal;
  window.openPdfModal = function () {
    if (window.requireGateThen) {
      window.requireGateThen(_openResumeDirect, 'your résumé');
    } else {
      _openResumeDirect();
    }
  };

  // Certificate / credential links are plain <a href target="_blank">
  // tags — some static in the HTML, some rendered later by
  // loadCertifications(). One delegated listener on document covers
  // both, regardless of when they appear in the DOM.
  var GATED_LINK_SELECTOR = '.cc-cert-btn, .chc-verify-btn, .rec-letter-btn, .btn-sm-gold';

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest(GATED_LINK_SELECTOR) : null;
    if (!link) return;
    if (link.getAttribute('data-gate-ok') === '1') return; // already unlocked

    e.preventDefault();

    var card = link.closest('.cert-card, .cert-hero-card, .recommendation-card, .rec-card');
    var titleEl = card ? card.querySelector('.cc-title, .chc-title') : null;
    var title = titleEl ? titleEl.textContent.trim() : (link.textContent || '').trim() || 'a certificate';
    var href = link.getAttribute('href');

    window.requireGateThen(function () {
      link.setAttribute('data-gate-ok', '1');
      window.open(href, '_blank', 'noopener,noreferrer');
    }, title);
  });
})();


// ============================================================
// SECTION INLINE-A2 · CERTIFICATE IMAGE LIGHTBOX (View Certificate)
// Gated: requires the visitor to submit their name first, same as the
// résumé and other certificate links (see window.requireGateThen above).
// ============================================================
(function () {
  function _openCertModalDirect(src, title, downloadHref) {
    var modal   = document.getElementById('certImgModal');
    var img     = document.getElementById('certModalImg');
    var titleEl = document.getElementById('certModalTitle');
    var dlBtn   = document.getElementById('certModalDownloadBtn');
    if (!modal || !img) return;
    img.classList.remove('cert-modal-img--zoomed');
    img.src = src;
    img.alt = title || 'Certificate';
    if (titleEl) titleEl.textContent = title || 'Certificate';
    if (dlBtn) {
      if (downloadHref) {
        dlBtn.href = downloadHref;
        dlBtn.style.display = '';
      } else {
        dlBtn.style.display = 'none';
      }
    }
    modal.classList.add('pdf-modal--open');
    document.body.classList.add('cert-modal-open');
  }

  function closeCertModal() {
    var modal = document.getElementById('certImgModal');
    if (modal) modal.classList.remove('pdf-modal--open');
    document.body.classList.remove('cert-modal-open');
  }

  function toggleCertZoom() {
    var img = document.getElementById('certModalImg');
    if (img) img.classList.toggle('cert-modal-img--zoomed');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCertModal();
  });

  // Delegated click on any "View Certificate" trigger — opens the gate
  // first (unless the visitor's name is already known this session).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.chc-view-cert-btn') : null;
    if (!btn) return;
    e.preventDefault();
    var src   = btn.getAttribute('data-cert-img');
    var title = btn.getAttribute('data-cert-title') || 'Certificate';
    var dl    = btn.getAttribute('data-cert-download');
    if (window.requireGateThen) {
      window.requireGateThen(function () {
        _openCertModalDirect(src, title, dl);
      }, title);
    } else {
      _openCertModalDirect(src, title, dl);
    }
  });

  window.closeCertModal   = closeCertModal;
  window.toggleCertZoom   = toggleCertZoom;
})();


// ============================================================
// SECTION INLINE-B · HIE IMAGE LIGHTBOX MODAL
// Moved from inline <script> in index.html
// ============================================================

(function () {
function openHieModal(src, title, returnTo) {
  var modal = document.getElementById('hieImgModal');
  var img   = document.getElementById('hieModalImg');
  var lbl   = document.getElementById('hieModalTitle');
  var back  = document.getElementById('hieModalBackLink');
  var wrap  = document.getElementById('hieModalImgWrap');
  if (wrap) wrap.classList.remove('hie-img-load-error'); // reset any prior error state
  img.style.display = '';
  img.src = src;
  img.alt = title;
  lbl.textContent = title;
  if (back) back.setAttribute('href', '#' + (returnTo || 'fieldwork'));
  modal.classList.add('hie-modal--open');
  document.body.classList.add('hie-modal-body-lock');
}
function hieModalImgError() {
  var wrap = document.getElementById('hieModalImgWrap');
  var img  = document.getElementById('hieModalImg');
  if (img.src) { // ignore the initial empty src="" firing onerror
    if (wrap) wrap.classList.add('hie-img-load-error');
    img.style.display = 'none';
  }
}
function hieModalImgLoaded() {
  var wrap = document.getElementById('hieModalImgWrap');
  if (wrap) wrap.classList.remove('hie-img-load-error');
}
function closeHieModal() {
  document.getElementById('hieImgModal').classList.remove('hie-modal--open');
  document.body.classList.remove('hie-modal-body-lock');
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeHieModal();
});

// Expose to global scope — inline onclick="" handlers in the HTML
// run in global/window scope and can't see functions declared only
// inside this IIFE otherwise. (This is what was breaking the
// "View Graphic Version" popup on the Quotes cards, and would have
// broken the Fieldwork gallery lightbox the same way.)
window.openHieModal      = openHieModal;
window.closeHieModal     = closeHieModal;
window.hieModalImgError  = hieModalImgError;
window.hieModalImgLoaded = hieModalImgLoaded;
})();

// ============================================================
// STEP 4 — CINEMATIC HERO — removed.
// The decorative glow is now fixed in place via CSS instead of
// following the mouse; the background stays fully independent of
// cursor position.
// ============================================================

// ============================================================
// STEP 6 — VISIONOS FLOATING DOCK
// Magnification physics · active state · tooltip
// ============================================================
(function () {
  'use strict';

  function initVisionDock() {
    var dock = document.getElementById('visionDock');
    var itemsEl = document.getElementById('vdItems');
    if (!dock || !itemsEl) return;

    var items = Array.from(itemsEl.querySelectorAll('.vd-item'));
    var MAX_SCALE  = 1.60;   // peak scale at cursor
    var MID_SCALE  = 1.28;   // neighbour scale
    var EDGE_SCALE = 1.08;   // second neighbour
    var MAX_LIFT   = -14;    // px up at peak
    var RADIUS     = 90;     // px influence radius
    var ITEM_W     = 52 + 8; // item width + gap

    function getItemCenters() {
      return items.map(function(item) {
        var r = item.getBoundingClientRect();
        return r.left + r.width / 2;
      });
    }

    // Cursor-follow magnification removed — dock items no longer scale
    // toward the mouse. Fixed hover scale/lift is handled in CSS.

    // ── Active section highlighting ──
    function markActive() {
      var scrollY = window.scrollY + window.innerHeight * 0.4;
      var sections = document.querySelectorAll('section[id], div[id]');
      var active = '';
      sections.forEach(function(s) {
        if (s.offsetTop <= scrollY) active = s.id;
      });
      items.forEach(function(item) {
        var href = item.getAttribute('href') || '';
        var id   = href.replace('#', '');
        item.classList.toggle('is-active', id === active && id !== '');
      });
    }

    var _markPending = false;
    window.addEventListener('scroll', function() {
      if (_markPending) return;
      _markPending = true;
      requestAnimationFrame(function() { _markPending = false; markActive(); });
    }, { passive: true });
    markActive();

    // ── Refraction flash on click ──
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var glass = item.querySelector('.vd-item-glass');
        if (!glass) return;
        glass.classList.add('refract-active');
        setTimeout(function() { glass.classList.remove('refract-active'); }, 800);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisionDock);
  } else {
    initVisionDock();
  }
})();


// ============================================================
// STEP 7 — ADVANCED CINEMATIC EFFECTS ENGINE
// Particles · global mouse glow · scanline · cursor · depth
// ============================================================
(function () {
  'use strict';

  // ── 1. CUSTOM CURSOR — removed. Uses the normal system cursor. ──
  function initCursor() { return; }

  // ── 2. GLOBAL MOUSE GLOW — removed. The background/decorative glow
  // must stay independent of cursor position; it is now fixed via CSS. ──
  function initGlobalMouseGlow() { return; }

  // ── 3. PARTICLE SYSTEM ───────────────────────────────────
  function initParticles() {
    var canvas = document.getElementById('cinematicCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var W, H, dpr;
    var particles = [];
    var PARTICLE_COUNT = 55;
    // No cursor influence — background particles are fully independent
    // of pointer position.

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W   = window.innerWidth;
      H   = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    var COLORS = [
      [155, 114, 247],   // purple
      [0,   212, 255],   // cyan
      [255, 114, 192],   // pink
      [200, 220, 255],   // ice blue
    ];

    function createParticle(forced) {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x:    forced ? rand(0, W) : rand(0, W),
        y:    forced ? rand(0, H) : H + rand(0, 60),
        vx:   rand(-0.18, 0.18),
        vy:   rand(-0.28, -0.06),
        r:    rand(1.2, 2.8),
        base_r: rand(1.2, 2.8),
        alpha: rand(0.15, 0.55),
        base_alpha: rand(0.15, 0.55),
        color: col,
        pulse_phase: rand(0, Math.PI * 2),
        pulse_speed: rand(0.008, 0.022),
        // Connection line weight
        connected: false,
      };
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }

    var LINE_DIST = 130;

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);

      var t = Date.now();

      // Update particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.pulse_phase += p.pulse_speed;
        var pulse = 0.5 + 0.5 * Math.sin(p.pulse_phase);

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.995;
        p.vy *= 0.997;

        // Clamp velocity
        var spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (spd > 0.55) { p.vx *= 0.55/spd; p.vy *= 0.55/spd; }

        // Respawn
        if (p.y < -20 || p.x < -20 || p.x > W + 20) {
          var np = createParticle(false);
          particles[i] = np;
          continue;
        }

        var r   = p.base_r * (0.85 + 0.3 * pulse);
        var a   = p.base_alpha * (0.7 + 0.5 * pulse);
        var col = p.color;

        // Draw glow halo
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        grad.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (a * 0.7).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + Math.min(a * 1.4, 0.75).toFixed(3) + ')';
        ctx.fill();
      }

      // Draw connection lines between nearby particles
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var pa = particles[i], pb = particles[j];
          var dx = pa.x - pb.x, dy = pa.y - pb.y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < LINE_DIST) {
            var lineA = (1 - d / LINE_DIST) * 0.12;
            var ca = pa.color, cb = pb.color;
            var grad2 = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            grad2.addColorStop(0, 'rgba(' + ca[0]+','+ca[1]+','+ca[2]+','+lineA.toFixed(3)+')');
            grad2.addColorStop(1, 'rgba(' + cb[0]+','+cb[1]+','+cb[2]+','+lineA.toFixed(3)+')');
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = grad2;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  // ── 4. NEON SCANLINE ─────────────────────────────────────
  function initScanline() {
    var line = document.getElementById('neonScanline');
    if (!line) return;

    var y = 0;
    var speed = 1.8;
    var visible = false;
    var lastTime = 0;
    var pauseUntil = 0;

    function tick(now) {
      if (now < pauseUntil) {
        requestAnimationFrame(tick);
        return;
      }

      if (!visible) {
        // Start a new scan
        y = -2;
        visible = true;
        line.style.opacity = '0';
      }

      y += speed;

      // Fade in from top, fade out at bottom
      var prog = y / window.innerHeight;
      var alpha = prog < 0.1  ? prog / 0.1 :
                  prog > 0.85 ? (1 - prog) / 0.15 : 1;

      line.style.transform = 'translateY(' + y + 'px) translateZ(0)'; /* transform instead of top — compositor-only */
      line.style.opacity = (alpha * 0.65).toFixed(3);

      if (y > window.innerHeight + 4) {
        visible = false;
        line.style.opacity = '0';
        // Pause 8-16s between sweeps
        pauseUntil = now + 8000 + Math.random() * 8000;
      }

      requestAnimationFrame(tick);
    }

    pauseUntil = performance.now() + 3000;
    requestAnimationFrame(tick);
  }

  // ── 5. SCROLL-DRIVEN SECTION DEPTH ───────────────────────
  function initScrollDepth() {
    // Parallax ambient orbs based on scroll
    var orbA = document.querySelector('.amb-orb-a');
    var orbB = document.querySelector('.amb-orb-b');
    var orbC = document.querySelector('.amb-orb-c');

    var _depthPending = false;
    window.addEventListener('scroll', function() {
      if (_depthPending) return;
      _depthPending = true;
      requestAnimationFrame(function() {
        _depthPending = false;
        var sy = window.scrollY;
        if (orbA) orbA.style.transform = 'translateY(' + (sy * 0.04) + 'px) translateZ(0)';
        if (orbB) orbB.style.transform = 'translateY(' + (-sy * 0.03) + 'px) translateZ(0)';
        if (orbC) orbC.style.transform = 'translateY(' + (sy * 0.025) + 'px) translateZ(0)';
      });
    }, { passive: true });
  }

  // ── 6. SECTION TITLE NEON GLOW ON ENTER ─────────────────
  function initTitleGlow() {
    var titles = document.querySelectorAll('.sec-title');
    if (!('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('neon-reflect');
          obs.unobserve(e.target); /* add-only — no class churn on scroll direction change */
        }
      });
    }, { threshold: 0.5 });

    titles.forEach(function(t) { obs.observe(t); });
  }

  // ── 7. GLASS CARD MOUSE-TILT — removed.
  // Cards keep a fixed hover lift (translateY/scale) defined in CSS,
  // with no rotation or tracking toward the cursor.
  function initCardTilt() { return; }

  // ── 8. GLASS REFRACTION ON SCROLL ENTRY ──────────────────
  function initScrollRefraction() {
    if (!('IntersectionObserver' in window)) return;
    var glassEls = document.querySelectorAll('.gc-card, .glass-card, .hero-vchip');

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('refract-active');
          setTimeout(function() { e.target.classList.remove('refract-active'); }, 900);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });

    glassEls.forEach(function(el) { obs.observe(el); });
  }

  // ── INIT ALL ──────────────────────────────────────────────
  function initAll() {
    // Cursor/mouse-reactive effects removed: initCursor, initGlobalMouseGlow,
    // initParticles (mouse attraction), initCardTilt (rotateX/Y toward cursor).
    initScanline();
    initScrollDepth();
    initTitleGlow();
    initScrollRefraction();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();


// ============================================================
// STEP 8–10 · RESPONSIVE, PERFORMANCE & FINAL QUALITY
// ============================================================

(function () {
  'use strict';

  // ── Utility: debounce ──────────────────────────────────────
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  // ── Utility: throttle via rAF ──────────────────────────────
  function rafThrottle(fn) {
    var raf = false;
    return function () {
      if (raf) return;
      raf = true;
      var args = arguments, ctx = this;
      requestAnimationFrame(function () {
        fn.apply(ctx, args);
        raf = false;
      });
    };
  }

  // ── Device detection ──────────────────────────────────────
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var isLowEnd      = isTouchDevice && !window.matchMedia('(min-width:768px)').matches;

  // ============================================================
  // A · RESPONSIVE VIEWPORT MANAGER
  // ============================================================
  var ViewportManager = (function () {
    var W = window.innerWidth;
    var H = window.innerHeight;

    function update() {
      W = window.innerWidth;
      H = window.innerHeight;
      // Update CSS custom property for true mobile viewport height
      document.documentElement.style.setProperty('--real-vh', (H * 0.01) + 'px');
    }

    update();
    window.addEventListener('resize', debounce(update, 120), { passive: true });

    // iOS: update on orientation change
    window.addEventListener('orientationchange', function () {
      setTimeout(update, 200);
    }, { passive: true });

    return {
      get w() { return W; },
      get h() { return H; },
      isMobile:  function () { return W < 768;  },
      isTablet:  function () { return W >= 768 && W < 1024; },
      isDesktop: function () { return W >= 1024; }
    };
  })();

  // ============================================================
  // B · MOBILE TOUCH INTERACTIONS
  // ============================================================

  // ── B1. Touch ripple on glass elements ──
  function initTouchRipple() {
    var rippleTargets = document.querySelectorAll(
      '.btn-primary, .btn-ghost, .gate-btn, .fab-option, .msc-btn, .nav-mob-link, .recruiter-view-btn'
    );

    function createRipple(el, x, y) {
      var rect = el.getBoundingClientRect();
      var rx = x - rect.left;
      var ry = y - rect.top;
      var size = Math.max(rect.width, rect.height) * 2;

      var ripple = document.createElement('span');
      ripple.style.cssText = [
        'position:absolute',
        'left:' + (rx - size / 2) + 'px',
        'top:'  + (ry - size / 2) + 'px',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'border-radius:50%',
        'background:rgba(255,255,255,0.18)',
        'transform:scale(0) translateZ(0)',
        'pointer-events:none',
        'z-index:100',
        'transition:transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease'
      ].join(';');

      var prev = el.style.position;
      if (!prev || prev === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);

      requestAnimationFrame(function () {
        ripple.style.transform = 'scale(1) translateZ(0)';
        ripple.style.opacity   = '0';
      });

      setTimeout(function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 500);
    }

    rippleTargets.forEach(function (el) {
      el.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        createRipple(el, t.clientX, t.clientY);
      }, { passive: true });

      // Also on click for desktop
      el.addEventListener('click', function (e) {
        if (!isTouchDevice) createRipple(el, e.clientX, e.clientY);
      });
    });
  }

  // ── B2. Mobile nav drawer: touch swipe to close ──
  function initMobileSwipeClose() {
    var drawer = document.getElementById('navMobDrawer');
    if (!drawer) return;

    var startY = 0, startX = 0;

    drawer.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    }, { passive: true });

    drawer.addEventListener('touchend', function (e) {
      var dy = e.changedTouches[0].clientY - startY;
      var dx = Math.abs(e.changedTouches[0].clientX - startX);
      // Swipe up: close drawer
      if (dy < -50 && dx < 40) {
        var toggle = document.getElementById('navToggle');
        if (toggle && drawer.classList.contains('open')) {
          toggle.click();
        }
      }
    }, { passive: true });
  }

  // ── B3. Gate card: swipe up to dismiss on mobile ──
  function initGateSwipe() {
    var card = document.querySelector('.gate-glass-card');
    if (!card || !ViewportManager.isMobile()) return;

    var startY = 0, isDragging = false;

    card.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    card.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        card.style.transform = 'translateY(' + (dy * 0.35) + 'px)';
        card.style.transition = 'none';
      }
    }, { passive: true });

    card.addEventListener('touchend', function (e) {
      isDragging = false;
      var dy = e.changedTouches[0].clientY - startY;
      card.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = '';
    }, { passive: true });
  }

  // ── B4. Optimized touch scroll: momentum-aware dock ──
  function initDockTouchScroll() {
    var dock = document.getElementById('visionDock');
    if (!dock) return;
    dock.style.webkitOverflowScrolling = 'touch';
  }

  // ============================================================
  // C · RESPONSIVE DOCK BEHAVIOR
  // ============================================================
  function initResponsiveDock() {
    var dock  = document.getElementById('visionDock');
    if (!dock) return;

    function update() {
      if (ViewportManager.isMobile()) {
        dock.setAttribute('aria-label', 'Navigation');
      } else {
        dock.setAttribute('aria-label', 'Quick navigation dock');
      }
    }

    update();
    window.addEventListener('resize', debounce(update, 150), { passive: true });
  }

  // ============================================================
  // D · PERFORMANCE: Adaptive particle count
  // ============================================================
  function setAdaptiveParticles() {
    // Low-end / mobile: disable heavy canvas
    if (isLowEnd) {
      var canvas = document.getElementById('cinematicCanvas');
      if (canvas) canvas.style.display = 'none';

      var heroCanvas = document.getElementById('heroCanvas');
      if (heroCanvas) heroCanvas.style.display = 'none';
    }
  }

  // ============================================================
  // E · PERFORMANCE: IntersectionObserver lazy image reveal
  // ============================================================
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    var imgs = document.querySelectorAll('img[loading="lazy"]');
    var obs  = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('loaded');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px 0px' });

    imgs.forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () { img.classList.add('loaded'); });
        obs.observe(img);
      }
    });
  }

  // ============================================================
  // F · PERFORMANCE: Efficient scroll handler consolidation
  // ============================================================
  function initScrollHub() {
    var scrollY = 0;

    var mobileStickyBar  = document.getElementById('mobileStickyBar');
    var fabContainer     = document.getElementById('fabContainer');
    var lastScrollY      = 0;
    var ticking          = false;

    function onScroll() {
      scrollY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;

          // Mobile sticky bar: hide when near top, show when scrolled
          if (mobileStickyBar) {
            if (scrollY > 80) {
              mobileStickyBar.classList.add('visible');
            } else {
              mobileStickyBar.classList.remove('visible');
            }
          }

          // FAB: hide on scroll down, show on scroll up
          if (fabContainer) {
            var diff = scrollY - lastScrollY;
            if (diff > 20 && scrollY > 200) {
              fabContainer.style.transform = 'translateY(120px)';
              fabContainer.style.opacity   = '0';
            } else if (diff < -10 || scrollY < 200) {
              fabContainer.style.transform = '';
              fabContainer.style.opacity   = '';
            }
          }

          lastScrollY = scrollY;
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ============================================================
  // G · RESPONSIVE NAV: active link tracking
  // ============================================================
  function initActiveNav() {
    var sections = document.querySelectorAll('main [id]');
    var vdItems  = document.querySelectorAll('.vd-item[href^="#"]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (!sections.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;

        vdItems.forEach(function (item) {
          var href = item.getAttribute('href');
          if (href === '#' + id) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });

        navLinks.forEach(function (link) {
          var href = link.getAttribute('href');
          if (href === '#' + id) {
            link.classList.add('is-active');
          } else {
            link.classList.remove('is-active');
          }
        });
      });
    }, {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { obs.observe(s); });
  }

  // ============================================================
  // H · FINAL QUALITY: Premium hover parallax — removed.
  // The hero portrait/chips/type column no longer move in response to
  // mouse position; their fixed spatial depth is set in CSS.
  // ============================================================
  function initHeroParallax() { return; }

  // ============================================================
  // I · FINAL QUALITY: Smooth mobile sticky CTA transition
  // ============================================================
  function initMobileStickyStyles() {
    var bar = document.getElementById('mobileStickyBar');
    if (!bar) return;

    // Add transition for smooth appear/disappear
    bar.style.transition = 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease';

    // Start hidden, JS will reveal after scroll
    if (window.scrollY < 80) {
      bar.classList.remove('visible');
    }
  }

  // ============================================================
  // J · PERFORMANCE: CSS class for nav state (avoid JS style thrash)
  // ============================================================
  function initNavScrollState() {
    var nav = document.getElementById('topNav');
    if (!nav) return;

    var scrolled = false;
    window.addEventListener('scroll', rafThrottle(function () {
      var nowScrolled = window.scrollY > 40;
      if (nowScrolled !== scrolled) {
        scrolled = nowScrolled;
        nav.classList.toggle('is-scrolled', scrolled);
      }
    }), { passive: true });
  }

  // ============================================================
  // K · RESPONSIVE FAB: position & transition setup
  // ============================================================
  function initFabResponsive() {
    var fab = document.getElementById('fabContainer');
    if (!fab) return;

    // Smooth hide/show via CSS class
    fab.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease';
  }

  // ============================================================
  // L · PERFORMANCE: Passive event listeners for touch
  // ============================================================
  function initPassiveListeners() {
    // Register wheel and touchmove as passive globally
    // (improves scroll performance significantly on mobile)
    window.addEventListener('touchstart', function () {}, { passive: true });
    window.addEventListener('touchmove',  function () {}, { passive: true });
    window.addEventListener('wheel',      function () {}, { passive: true });
  }

  // ============================================================
  // M · FINAL QUALITY: Orb mouse-follow — removed.
  // The glow orb no longer tracks the cursor; it is positioned with a
  // fixed CSS transform instead.
  // ============================================================
  function initChMouseFollow() { return; }

  // ============================================================
  // INIT ALL — deferred after DOM ready
  // ============================================================
  function init() {
    initTouchRipple();
    initMobileSwipeClose();
    initGateSwipe();
    initDockTouchScroll();
    initResponsiveDock();
    setAdaptiveParticles();
    initLazyImages();
    initScrollHub();
    initActiveNav();
    initHeroParallax();
    initMobileStickyStyles();
    initNavScrollState();
    initFabResponsive();
    initPassiveListeners();
    initChMouseFollow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


// ── CHIP PULSE CYCLER ─────────────────────────────────────────
(function () {
  var ACTIVE_BG  = 'rgba(255,255,255,0.30)';
  var ACTIVE_SHD = 'inset 0 1px 0 rgba(255,255,255,0.70),0 4px 16px rgba(0,0,0,0.22),0 0 18px rgba(212,216,224,0.30),0 0 0 1px rgba(255,255,255,0.35)';
  var ACTIVE_CLR = 'rgba(244,244,245,1.00)';
  var ACTIVE_SCL = 'scale(1.10)';
  var REST_BG    = 'rgba(255,255,255,0.14)';
  var REST_SHD   = 'inset 0 1px 0 rgba(255,255,255,0.35),0 1px 4px rgba(0,0,0,0.14)';
  var REST_CLR   = 'rgba(244,244,245,0.88)';

  function activate(el) {
    el.style.background = ACTIVE_BG;
    el.style.boxShadow  = ACTIVE_SHD;
    el.style.color      = ACTIVE_CLR;
    el.style.transform  = ACTIVE_SCL;
  }
  function deactivate(el) {
    el.style.background = REST_BG;
    el.style.boxShadow  = REST_SHD;
    el.style.color      = REST_CLR;
    el.style.transform  = 'scale(1)';
  }

  function init() {
    var chips = document.querySelectorAll('#chipPill .chip');
    if (!chips.length) return;
    var i = 0;
    activate(chips[i]);
    setInterval(function () {
      deactivate(chips[i]);
      i = (i + 1) % chips.length;
      activate(chips[i]);
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// ============================================================
// SECTION NEW-C · HEADING & TEXT ENTRANCE ANIMATIONS
// Progressive enhancement: tags headings/eyebrows/paragraphs with
// .txt-reveal + reveals them via IntersectionObserver as the user
// scrolls. Adds html.js-text-anim first — the CSS only hides text
// when that class is present, so if this script fails or
// IntersectionObserver isn't supported, everything just stays
// visible (no permanently-blank text risk).
// ============================================================

(function () {
  'use strict';

  function initTextAnimations() {
    if (!('IntersectionObserver' in window)) return;

    // Groups of elements to animate, in the order they should be
    // tagged (used to derive stagger for elements that sit right
    // next to each other, e.g. the hero block).
    var heroSelectors = [
      '.hero-eyebrow-row',
      '.hero-stat-badges',
      '.hero-display-name .hero-name-first',
      '.hero-display-name .hero-name-last',
      '.hero-name-rule',
      '.hero-statement',
      '.hero-kpis',
      '.hero-ctas'
    ];

    var siteWideSelectors = [
      '.sec-eyebrow',
      '.sec-title',
      '.sec-subtitle'
    ];

    document.documentElement.classList.add('js-text-anim');

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    function tag(el, staggerIndex) {
      if (!el || el.classList.contains('txt-reveal')) return;
      el.classList.add('txt-reveal');
      if (staggerIndex) {
        el.classList.add('txt-stagger-' + Math.min(staggerIndex, 4));
      }
      revealObs.observe(el);
    }

    // Hero: staggered, one after another, since it's all on screen
    // together at load.
    heroSelectors.forEach(function (sel, i) {
      var el = document.querySelector(sel);
      tag(el, i % 4 + 1);
    });

    // Section headings/eyebrows/subtitles sitewide: each section's
    // own trio staggers slightly against itself, then plays as that
    // section scrolls into view.
    siteWideSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var staggerIndex = sel === '.sec-eyebrow' ? 1 : (sel === '.sec-title' ? 2 : 3);
        tag(el, staggerIndex);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextAnimations);
  } else {
    initTextAnimations();
  }
})();


// =============================================================================
// [SECTION: CV / CERTIFICATE GATE]
// Source file: cv-gate.js (original, untouched below this line)
// =============================================================================

/* ================================================================
   CV / CERTIFICATE GATE — standalone module
   ----------------------------------------------------------------
   Completely separate from script.js and its existing name-only
   #gate-overlay. This file is self-contained: its own DOM (built at
   runtime), its own CSS namespace (cv-gate.css), its own storage
   keys.

   Integration point: script.js already calls
     window.requireGateThen(action, context)
   before letting a visitor open the résumé (openPdfModal) or a
   certificate link. Because this script tag loads AFTER script.js
   (see index.html) and both use `defer`, this file runs after
   script.js has finished defining window.requireGateThen — so
   simply reassigning window.requireGateThen here overrides that
   hook for every future call, with zero edits to script.js itself.

   Fields collected: Visitor Name (required), Company/Organization
   (optional), and Purpose
   (required single choice: Recruitment / Verification / Other).

   Submitted info is kept in this browser's storage (so returning
   visitors aren't re-asked) AND sent straight to a Telegram chat via
   the Bot API — directly from the browser, no backend/worker needed.

   SETUP — fill these two in before deploying:
     TG_BOT_TOKEN — from @BotFather, e.g. "123456789:AAExampleTokenHere"
     TG_CHAT_ID   — the chat/user id that should receive the messages
   Get your chat id by messaging your bot once, then visiting
   https://api.telegram.org/bot<TOKEN>/getUpdates and reading the
   "chat":{"id": ...} field from the response.

   NOTE ON SECURITY: because this runs in the visitor's browser, the
   bot token below is visible to anyone who views source / opens
   devtools. That means someone could technically read it and use it
   to send messages through your bot (they can't read your chat
   history or messages sent to you, only send new ones as the bot).
   For a simple portfolio lead-capture form this tradeoff is normally
   fine, but don't reuse a token for anything more sensitive.
================================================================= */

// ================================================================
// SHARED TELEGRAM HELPER
// ----------------------------------------------------------------
// Used by the gate module (initial submission message) below, and
// by the activity-tracking module further down the file (per-view /
// per-download "Opened" / "Downloaded" pings). Kept as one small
// shared object so the bot token/chat id are only set in one place.
// ================================================================
var CVGateTelegram = (function () {
  var TG_BOT_TOKEN = '8934474613:AAF7w88DVEYa1w9vrGFxZ2aFzVvRVa7FydA';
  var TG_CHAT_ID    = '8235795754';

  // Server-side relay (Cloudflare Worker or similar) that forwards to
  // Telegram FROM YOUR SERVER instead of the visitor's browser. This is
  // what makes delivery work in places where api.telegram.org itself is
  // blocked/throttled at the ISP level (this has happened in Pakistan,
  // Iran, and a few other countries at various times) — the visitor's
  // browser only ever talks to your own domain, which isn't blocked.
  // Leave '' to skip straight to the direct Telegram call below.
  var RELAY_URL = 'https://script.google.com/macros/s/AKfycbyjXRc2RRb8eKhJkHpdMoZInqxawSbHgHYbEbaDTGhu8yeuFci9jMwZOoLHzOfyrVj4Vg/exec';

  var QUEUE_KEY = 'cvgate_tg_pending';
  var MAX_QUEUE = 20;
  var MAX_ATTEMPTS_PER_SEND = 2;

  // Minimal escaping so a visitor typing "<" or "&" into name/company
  // can't break Telegram's HTML parse_mode.
  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function readQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(arr) === '[object Array]' ? arr : [];
    } catch (e) { return []; }
  }

  function writeQueue(arr) {
    try {
      if (arr.length > MAX_QUEUE) arr = arr.slice(arr.length - MAX_QUEUE);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
    } catch (e) { /* storage full/unavailable — drop silently */ }
  }

  function enqueue(text) {
    var q = readQueue();
    q.push({ text: text, ts: Date.now() });
    writeQueue(q);
  }

  function directTelegramCall(text) {
    if (!TG_BOT_TOKEN || TG_BOT_TOKEN.indexOf('PASTE_') === 0) return Promise.resolve(false);
    if (!TG_CHAT_ID || String(TG_CHAT_ID).indexOf('PASTE_') === 0) return Promise.resolve(false);
    var url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function relayCall(text) {
    // Content-Type is deliberately 'text/plain' (not 'application/json')
    // so this stays a CORS "simple request" and skips the OPTIONS
    // preflight — Google Apps Script Web Apps don't handle preflight
    // requests, so a JSON content-type here would make every call fail.
    // The body itself is still valid JSON; Apps Script parses it fine
    // via e.postData.contents regardless of the header.
    return fetch(RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ text: text })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  // Tries the relay (if configured) then the direct call, with one retry
  // each on failure — covers transient blips without hammering anything.
  function attemptDelivery(text, attemptsLeft) {
    var chain = RELAY_URL ? relayCall(text) : Promise.resolve(false);
    return chain.then(function (ok) {
      if (ok) return true;
      return directTelegramCall(text);
    }).then(function (ok) {
      if (ok) return true;
      if (attemptsLeft > 1) return attemptDelivery(text, attemptsLeft - 1);
      return false;
    });
  }

  function send(text) {
    // Fire-and-forget from the caller's point of view: never blocks or
    // interrupts the visitor. If every attempt fails (e.g. this visitor's
    // network blocks Telegram outright and no relay is configured), the
    // message is queued and retried automatically next time this browser
    // loads the page — silently, no visitor-facing effect either way.
    attemptDelivery(text, MAX_ATTEMPTS_PER_SEND).then(function (ok) {
      if (!ok) enqueue(text);
    });
  }

  function flushQueue() {
    var q = readQueue();
    if (!q.length) return;
    writeQueue([]); // clear now; anything that still fails re-queues itself
    q.forEach(function (item) {
      attemptDelivery(item.text, MAX_ATTEMPTS_PER_SEND).then(function (ok) {
        if (!ok) enqueue(item.text);
      });
    });
  }

  // Retry any backlog on load and whenever the browser regains connectivity.
  if (typeof window !== 'undefined') {
    setTimeout(flushQueue, 1500);
    window.addEventListener('online', flushQueue);
  }

  function readVisitorInfo() {
    try {
      var raw = localStorage.getItem('cvgate_visitor_info');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // Sent every time a visitor opens or downloads the résumé, a
  // certificate, or a recommendation letter — separate from the
  // one-time "gate submission" message, so you can see not just who
  // came by but what they actually looked at.
  function notifyActivity(action, docLabel) {
    var visitor = readVisitorInfo();
    var emoji = action === 'Downloaded' ? '\u2B07\uFE0F' : '\uD83D\uDC41\uFE0F';
    var text =
      '\uD83D\uDCC4 <b>Document Activity</b>\n' +
      '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
      '\uD83D\uDC64 <b>Name:</b> ' + escapeHtml(visitor ? visitor.name : 'Unknown visitor') + '\n' +
      '\uD83C\uDFE2 <b>Company:</b> ' + escapeHtml((visitor && visitor.company) || '\u2014') + '\n' +
      '\uD83D\uDCC1 <b>Document:</b> ' + escapeHtml(docLabel || 'Document') + '\n' +
      emoji + ' <b>Action:</b> ' + escapeHtml(action) + '\n' +
      '\uD83D\uDD52 <b>Time:</b> ' + escapeHtml(new Date().toLocaleString());
    send(text);
  }

  return { escapeHtml: escapeHtml, send: send, notifyActivity: notifyActivity };
})();

(function () {
  'use strict';

  function sendToTelegram(info) {
    var pageUrl = location.href;
    // Only linkify real http(s) pages — local file:// URLs (e.g. while
    // testing) aren't a protocol Telegram will render as a link.
    var pageLine = /^https?:\/\//i.test(pageUrl)
      ? '<a href="' + CVGateTelegram.escapeHtml(pageUrl) + '">' + CVGateTelegram.escapeHtml(pageUrl.replace(/^https?:\/\//i, '')) + '</a>'
      : CVGateTelegram.escapeHtml(pageUrl);

    var text =
      '\uD83C\uDD95 <b>New CV / Certificate Gate Submission</b>\n' +
      '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
      '\uD83D\uDC64 <b>Name:</b> ' + CVGateTelegram.escapeHtml(info.name) + '\n' +
      '\uD83C\uDFE2 <b>Company:</b> ' + CVGateTelegram.escapeHtml(info.company || '\u2014') + '\n' +
      '\uD83C\uDFAF <b>Purpose:</b> ' + CVGateTelegram.escapeHtml(info.purpose) + '\n' +
      '\uD83D\uDD17 <b>Page:</b> ' + pageLine + '\n' +
      '\uD83D\uDD52 <b>Time:</b> ' + CVGateTelegram.escapeHtml(new Date().toLocaleString());

    CVGateTelegram.send(text);
  }

  var REMEMBER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, same window as the site's existing gate

  var LS_INFO_KEY    = 'cvgate_visitor_info';   // JSON: {name, company, purpose}
  var LS_SEEN_AT_KEY  = 'cvgate_seen_at';
  var SS_UNLOCKED_KEY = '_cvGateUnlocked';       // this tab/session only

  var unlocked = false;
  var pending = null; // { action, context }

  // ── Determine if this visitor is already unlocked ──────────────
  try {
    if (sessionStorage.getItem(SS_UNLOCKED_KEY) === '1') {
      unlocked = true;
    } else {
      var seenAt = parseInt(localStorage.getItem(LS_SEEN_AT_KEY) || '0', 10);
      var info = localStorage.getItem(LS_INFO_KEY);
      if (info && seenAt && (Date.now() - seenAt < REMEMBER_MS)) {
        unlocked = true;
        sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
      }
    }
  } catch (e) { /* private browsing — storage may be unavailable */ }

  // ── Build the modal markup once, lazily, on first use ──────────
  var els = null;

  function buildModal() {
    if (els) return els;

    var overlay = document.createElement('div');
    overlay.id = 'cvg-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cvgTitle');

    overlay.innerHTML =
      '<div class="cvg-backdrop" id="cvgBackdrop"></div>' +
      '<div class="cvg-card">' +
        '<button type="button" class="cvg-close" id="cvgClose" aria-label="Close">&times;</button>' +
        '<div class="cvg-eyebrow">Before You Continue</div>' +
        '<h2 class="cvg-title" id="cvgTitle">Quick <span>introduction</span></h2>' +
        '<p class="cvg-subtitle">A couple of details before viewing the CV or certificates — helps me know who\u2019s stopping by.</p>' +
        '<form class="cvg-form" id="cvgForm" novalidate>' +
          '<div class="cvg-field">' +
            '<label class="cvg-label" for="cvgName">Visitor Name<span class="cvg-req">*</span></label>' +
            '<input class="cvg-input" id="cvgName" name="name" type="text" placeholder="Your full name" autocomplete="name" required>' +
          '</div>' +
          '<div class="cvg-field">' +
            '<label class="cvg-label" for="cvgCompany">Company / Organization<span class="cvg-opt">(optional)</span></label>' +
            '<input class="cvg-input" id="cvgCompany" name="company" type="text" placeholder="Where you work" autocomplete="organization">' +
          '</div>' +
          '<div class="cvg-field">' +
            '<label class="cvg-label">Purpose<span class="cvg-req">*</span></label>' +
            '<div class="cvg-radio-group" id="cvgPurposeGroup">' +
              '<div class="cvg-radio-option">' +
                '<input type="radio" name="cvgPurpose" id="cvgPurposeRecruit" value="Recruitment">' +
                '<label for="cvgPurposeRecruit">Recruitment</label>' +
              '</div>' +
              '<div class="cvg-radio-option">' +
                '<input type="radio" name="cvgPurpose" id="cvgPurposeVerify" value="Verification">' +
                '<label for="cvgPurposeVerify">Verification</label>' +
              '</div>' +
              '<div class="cvg-radio-option">' +
                '<input type="radio" name="cvgPurpose" id="cvgPurposeOther" value="Other">' +
                '<label for="cvgPurposeOther">Other</label>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p class="cvg-error-text" id="cvgError"></p>' +
          '<button type="submit" class="cvg-submit-btn" id="cvgSubmitBtn">Continue</button>' +
        '</form>' +
        '<p class="cvg-privacy-note">Shared only to give you access — never sold or spammed.</p>' +
      '</div>';

    document.body.appendChild(overlay);

    els = {
      overlay:  overlay,
      backdrop: overlay.querySelector('#cvgBackdrop'),
      closeBtn: overlay.querySelector('#cvgClose'),
      form:     overlay.querySelector('#cvgForm'),
      name:     overlay.querySelector('#cvgName'),
      company:  overlay.querySelector('#cvgCompany'),
      error:    overlay.querySelector('#cvgError')
    };

    els.closeBtn.addEventListener('click', cancelGate);
    els.backdrop.addEventListener('click', cancelGate);
    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitGate();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('cvg-visible')) cancelGate();
    });

    return els;
  }

  function showModal() {
    var e = buildModal();
    e.overlay.classList.add('cvg-visible');
    document.body.classList.add('cvg-active');
    e.error.textContent = '';
    setTimeout(function () { e.name.focus(); }, 400);
  }

  function hideModal() {
    if (!els) return;
    els.overlay.classList.remove('cvg-visible');
    document.body.classList.remove('cvg-active');
  }

  function cancelGate() {
    hideModal();
    pending = null; // declining does not run the gated action
  }

  function submitGate() {
    var e = buildModal();
    var name = e.name.value.trim();
    var company = e.company.value.trim();
    var purposeEl = e.form.querySelector('input[name="cvgPurpose"]:checked');
    var purpose = purposeEl ? purposeEl.value : '';

    if (!name) {
      e.error.textContent = 'Please enter your name.';
      e.name.classList.add('cvg-invalid');
      e.name.focus();
      return;
    }
    e.name.classList.remove('cvg-invalid');

    if (!purpose) {
      e.error.textContent = 'Please select a purpose.';
      return;
    }
    e.error.textContent = '';

    var info = { name: name, company: company, purpose: purpose };

    try {
      localStorage.setItem(LS_INFO_KEY, JSON.stringify(info));
      localStorage.setItem(LS_SEEN_AT_KEY, String(Date.now()));
      sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
    } catch (err) { /* private browsing — ignore */ }

    sendToTelegram(info);

    unlocked = true;

    var toRun = pending;
    pending = null;
    hideModal();

    if (toRun && typeof toRun.action === 'function') {
      setTimeout(toRun.action, 350);
    }
  }

  // ── Public hook — overrides script.js's name-only gate trigger ──
  window.requireGateThen = function (action, context) {
    if (unlocked) {
      if (typeof action === 'function') action();
      return;
    }
    pending = { action: action, context: context || '' };
    showModal();
  };
})();

/* ================================================================
   CV / CERTIFICATE GATE — INLINE DOCUMENT VIEWER
   ----------------------------------------------------------------
   Certificate and recommendation-letter links (.cc-cert-btn,
   .chc-verify-btn, .rec-letter-btn, .btn-sm-gold) point straight at
   Google Drive share URLs. script.js's own gate-integration handler
   (see "GATED_LINK_SELECTOR" there) opens those with
   window.open(href, '_blank') once the visitor is gated — i.e. it
   navigates away to Google Drive.

   This module intercepts the same clicks first (a capture-phase
   listener always runs before script.js's bubble-phase one, so
   stopping propagation here pre-empts it with zero edits to
   script.js) and instead shows the file inline via Drive's
   embeddable /preview endpoint, in a modal on top of the page. The
   visitor never leaves sajidmk.com. An "open in Drive" and a direct
   download link are kept in the modal header as a fallback/escape
   hatch.

   Only affects links that actually point at drive.google.com — any
   other href on those same classes is left completely untouched.
================================================================= */
(function () {
  'use strict';

  var DOC_LINK_SELECTOR = '.cc-cert-btn, .chc-verify-btn, .rec-letter-btn, .btn-sm-gold';

  function extractDriveId(href) {
    var m = /\/d\/([a-zA-Z0-9_-]+)/.exec(href || '');
    return m ? m[1] : null;
  }

  var els = null;

  function buildModal() {
    if (els) return els;

    var overlay = document.createElement('div');
    overlay.id = 'cvgDocOverlay';
    overlay.className = 'cvg-doc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cvgDocTitle');

    overlay.innerHTML =
      '<div class="cvg-doc-backdrop" id="cvgDocBackdrop"></div>' +
      '<div class="cvg-doc-panel">' +
        '<div class="cvg-doc-header">' +
          '<span class="cvg-doc-title" id="cvgDocTitle">Document</span>' +
          '<div class="cvg-doc-actions">' +
            '<a class="cvg-doc-action-btn" id="cvgDocOpenBtn" target="_blank" rel="noopener noreferrer" title="Open in Google Drive"><i class="fas fa-up-right-from-square"></i></a>' +
            '<a class="cvg-doc-action-btn" id="cvgDocDownloadBtn" title="Download"><i class="fas fa-download"></i></a>' +
            '<button type="button" class="cvg-doc-action-btn cvg-doc-close" id="cvgDocCloseBtn" aria-label="Close">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="cvg-doc-body">' +
          '<div class="cvg-doc-loading" id="cvgDocLoading">Loading preview\u2026</div>' +
          '<iframe class="cvg-doc-iframe" id="cvgDocFrame" src="" title="Document preview"></iframe>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    els = {
      overlay: overlay,
      backdrop: overlay.querySelector('#cvgDocBackdrop'),
      title: overlay.querySelector('#cvgDocTitle'),
      frame: overlay.querySelector('#cvgDocFrame'),
      loading: overlay.querySelector('#cvgDocLoading'),
      openBtn: overlay.querySelector('#cvgDocOpenBtn'),
      dlBtn: overlay.querySelector('#cvgDocDownloadBtn'),
      closeBtn: overlay.querySelector('#cvgDocCloseBtn')
    };

    function close() {
      overlay.classList.remove('cvg-doc-visible');
      document.body.classList.remove('cvg-doc-active');
      // Clear the src once the close animation finishes so a Drive
      // preview (or any embedded playback) doesn't keep running
      // invisibly in the background.
      setTimeout(function () { els.frame.src = ''; }, 300);
    }

    els.closeBtn.addEventListener('click', close);
    els.backdrop.addEventListener('click', close);
    els.dlBtn.addEventListener('click', function () {
      // Never blocks the native download — only records that it happened.
      CVGateTelegram.notifyActivity('Downloaded', els.dlBtn.getAttribute('data-doc-title'));
    });
    els.frame.addEventListener('load', function () {
      els.loading.style.display = 'none';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('cvg-doc-visible')) close();
    });

    els.close = close;
    return els;
  }

  function openDocModal(href, title) {
    var id = extractDriveId(href);
    var e = buildModal();

    e.title.textContent = title || 'Document';
    e.openBtn.href = href;
    e.dlBtn.href = id ? ('https://drive.google.com/uc?export=download&id=' + id) : href;
    e.loading.style.display = '';
    e.frame.src = id ? ('https://drive.google.com/file/d/' + id + '/preview') : href;

    e.overlay.classList.add('cvg-doc-visible');
    document.body.classList.add('cvg-doc-active');

    e.dlBtn.setAttribute('data-doc-title', title || 'Document');
    CVGateTelegram.notifyActivity('Opened', title);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest(DOC_LINK_SELECTOR) : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (!/drive\.google\.com/i.test(href)) return; // not a Drive link — leave it alone

    e.preventDefault();
    e.stopPropagation(); // capture phase: runs before script.js's own handler on the same click

    var card = link.closest('.cert-card, .cert-hero-card, .recommendation-card, .rec-card');
    var titleEl = card ? card.querySelector('.cc-title, .chc-title') : null;
    var title = titleEl ? titleEl.textContent.trim() : (link.textContent || '').trim() || 'Certificate';

    if (window.requireGateThen) {
      window.requireGateThen(function () { openDocModal(href, title); }, title);
    } else {
      openDocModal(href, title);
    }
  }, true); // capture phase — see comment block above
})();

/* ================================================================
   CV / CERTIFICATE GATE — VISITOR ACTIVITY TRACKING
   ----------------------------------------------------------------
   STEP 2. Standalone tracking layer, still separate from script.js
   and from the gate module above (this is a second, independent
   IIFE appended to the same file). script.js is not touched and is
   not read by this code.

   How it works: rather than hooking into openPdfModal / closePdfModal
   / openCertModal / closeCertModal (which live in script.js and are
   off-limits), this module watches the CV and certificate modals
   that already exist in index.html (#pdfResumeModal, #certImgModal)
   with a MutationObserver on their `class` attribute. Both modals
   share the same `.pdf-modal--open` class per styles.css, so a
   single generic watcher covers both. Download buttons
   (#pdfDownloadBtn, #certModalDownloadBtn) are tracked with a plain
   click listener that never calls preventDefault — the native
   download is untouched.

   What's recorded (this browser's localStorage only — nothing is
   sent anywhere; no Telegram, no server, no dashboard yet):
     Visitor-level  (already collected by the gate above):
       name, company, purpose, submission date/time
     Per-activity event:
       type          cv_view | cv_download | cert_view | cert_download
       certName      (certificate events only, read from the modal's
                      own title element at the moment it's shown)
       startedAt / endedAt / durationMs   (view events only — this is
                      strictly "how long the document was left open
                      in the modal", not a claim that it was read)
       device        Mobile / Desktop (best-effort UA + pointer check)
       timestamp     when the event was recorded

   TESTING: open the browser devtools console and run
     cvGateTracking.debugPrint()
   after viewing/downloading the CV or a certificate to see the
   recorded visitor info and activity log. cvGateTracking.getLog()
   and cvGateTracking.getVisitor() return the raw data;
   cvGateTracking.clearLog() wipes the activity log for retesting.
================================================================= */
(function () {
  'use strict';

  var LOG_KEY = 'cvgate_activity_log';
  var VID_KEY = 'cvgate_visitor_id';
  var MAX_LOG_ENTRIES = 300;

  // ── Visitor id: stable per browser, independent of the gate's own storage ──
  function getVisitorId() {
    try {
      var id = localStorage.getItem(VID_KEY);
      if (!id) {
        id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VID_KEY, id);
      }
      return id;
    } catch (e) { return 'unknown'; }
  }

  // ── Device detection (best-effort; not exact) ───────────────────
  function detectDevice() {
    try {
      var ua = navigator.userAgent || '';
      var isMobileUA = /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      var isCoarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      var isNarrow = window.innerWidth <= 820;
      return (isMobileUA || (isCoarse && isNarrow)) ? 'Mobile' : 'Desktop';
    } catch (e) { return 'Unknown'; }
  }

  // ── Log storage helpers ──────────────────────────────────────
  function readLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(arr) === '[object Array]' ? arr : [];
    } catch (e) { return []; }
  }

  function writeLog(arr) {
    try {
      if (arr.length > MAX_LOG_ENTRIES) arr = arr.slice(arr.length - MAX_LOG_ENTRIES);
      localStorage.setItem(LOG_KEY, JSON.stringify(arr));
    } catch (e) { /* storage full or unavailable — drop silently */ }
  }

  function readVisitorInfo() {
    try {
      var raw = localStorage.getItem('cvgate_visitor_info');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function merge(base, extra) {
    if (extra) {
      for (var k in extra) { if (extra.hasOwnProperty(k)) base[k] = extra[k]; }
    }
    return base;
  }

  // Appends a new event, returns its id (used to fill in endedAt /
  // durationMs later, once a view session ends).
  function logEvent(type, extra) {
    var visitor = readVisitorInfo();
    var entry = merge({
      id: 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      visitorId: getVisitorId(),
      visitorName: visitor ? visitor.name : null,
      visitorCompany: visitor ? visitor.company : null,
      visitorPurpose: visitor ? visitor.purpose : null,
      device: detectDevice(),
      type: type,
      timestamp: new Date().toISOString()
    }, extra);
    var log = readLog();
    log.push(entry);
    writeLog(log);
    return entry.id;
  }

  function updateEvent(id, patch) {
    var log = readLog();
    for (var i = 0; i < log.length; i++) {
      if (log[i].id === id) {
        merge(log[i], patch);
        break;
      }
    }
    writeLog(log);
  }

  // ── Generic "viewed" tracker for a modal that toggles the shared
  //    .pdf-modal--open class (both #pdfResumeModal and #certImgModal
  //    use that class per styles.css, so one watcher covers both) ──
  function trackModal(modalId, eventType, getExtra, labelFn) {
    var el = document.getElementById(modalId);
    if (!el) return; // element not present on this page — skip quietly

    var isOpen = el.classList.contains('pdf-modal--open');
    var openedAt = null;
    var currentEventId = null;

    function handleOpen() {
      openedAt = Date.now();
      var extra = getExtra ? getExtra() : null;
      currentEventId = logEvent(eventType, merge({
        startedAt: new Date(openedAt).toISOString(),
        endedAt: null,
        durationMs: null
      }, extra));
      CVGateTelegram.notifyActivity('Opened', labelFn ? labelFn(extra) : 'Document');
    }

    function handleClose() {
      if (!currentEventId || openedAt === null) return;
      var endedAt = Date.now();
      updateEvent(currentEventId, {
        endedAt: new Date(endedAt).toISOString(),
        durationMs: endedAt - openedAt
      });
      currentEventId = null;
      openedAt = null;
    }

    if (isOpen) handleOpen(); // tracking script started after modal was already open

    var observer = new MutationObserver(function () {
      var nowOpen = el.classList.contains('pdf-modal--open');
      if (nowOpen && !isOpen) {
        isOpen = true;
        handleOpen();
      } else if (!nowOpen && isOpen) {
        isOpen = false;
        handleClose();
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    // If the tab is closed/hidden while a modal is still open, finalize
    // the in-progress session so viewing time isn't silently lost.
    window.addEventListener('pagehide', handleClose);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') handleClose();
    });
  }

  function attachDownloadTracker(btnId, eventType, getExtra, labelFn) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Never blocks or alters the native download — only records that
      // the download link was clicked; the browser's own save dialog
      // (if any) happens independently of this.
      var extra = getExtra ? getExtra() : null;
      logEvent(eventType, extra);
      CVGateTelegram.notifyActivity('Downloaded', labelFn ? labelFn(extra) : 'Document');
    });
  }

  function getCertName() {
    var titleEl = document.getElementById('certModalTitle');
    return { certName: titleEl ? titleEl.textContent.trim() : null };
  }

  function certLabel(extra) {
    return (extra && extra.certName) || 'Certificate';
  }
  function resumeLabel() {
    return 'R\u00e9sum\u00e9';
  }

  function init() {
    trackModal('pdfResumeModal', 'cv_view', null, resumeLabel);
    trackModal('certImgModal', 'cert_view', getCertName, certLabel);

    attachDownloadTracker('pdfDownloadBtn', 'cv_download', null, resumeLabel);
    attachDownloadTracker('certModalDownloadBtn', 'cert_download', getCertName, certLabel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Debug / test helpers — open devtools console and run these ──
  window.cvGateTracking = {
    getVisitor: readVisitorInfo,
    getLog: readLog,
    clearLog: function () { try { localStorage.removeItem(LOG_KEY); } catch (e) {} },
    debugPrint: function () {
      console.log('Visitor:', readVisitorInfo());
      console.table(readLog());
    }
  };
})();


// ============================================================
// SECTION NEW-G · RECRUITER FAST PASS PANEL
// Wires up the "Recruiter Fast Pass" buttons (desktop nav +
// mobile drawer) to open/close #recruiterPanel. Previously the
// HTML/CSS for this panel existed but nothing ever toggled its
// `hidden` attribute, so the buttons did nothing on click.
// ============================================================
(function () {
  var panel        = document.getElementById('recruiterPanel');
  var backdrop      = document.getElementById('recruiterPanelBackdrop');
  var closeBtn      = document.getElementById('recruiterPanelClose');
  var openBtnDesktop = document.getElementById('recruiterViewBtn');
  var openBtnMobile  = document.getElementById('recruiterViewMobBtn');
  var navToggle      = document.getElementById('navToggle');
  var navDrawer      = document.getElementById('navMobDrawer');

  if (!panel) return;

  var lastFocused = null;

  function openPanel(e) {
    if (e) e.preventDefault();

    // If opened from the mobile drawer, close the drawer first.
    if (navDrawer && navDrawer.classList.contains('open')) {
      navDrawer.classList.remove('open');
      if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }

    lastFocused = document.activeElement;
    panel.hidden = false;
    document.body.classList.add('recruiter-panel-open');
    if (openBtnDesktop) openBtnDesktop.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true;
    document.body.classList.remove('recruiter-panel-open');
    if (openBtnDesktop) openBtnDesktop.setAttribute('aria-expanded', 'false');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  if (openBtnDesktop) openBtnDesktop.addEventListener('click', openPanel);
  if (openBtnMobile)  openBtnMobile.addEventListener('click', openPanel);
  if (closeBtn)        closeBtn.addEventListener('click', closePanel);
  if (backdrop)         backdrop.addEventListener('click', closePanel);

  // Any item inside the panel marked data-recruiter-close (including
  // the CV link, which also triggers openPdfModal via inline onclick)
  // should close this panel after being clicked.
  var closeTriggers = panel.querySelectorAll('[data-recruiter-close]');
  for (var i = 0; i < closeTriggers.length; i++) {
    closeTriggers[i].addEventListener('click', function () {
      closePanel();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
})();

// ===== Recruiter Fast Pass — liquid floating text =====
// Splits ".rvb-text" into per-letter spans (spaces preserved) so
// each letter can bob independently via CSS, giving a "floating in
// water" wave instead of the whole label moving as one block.
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var nodes = document.querySelectorAll('.rvb-text');
  for (var n = 0; n < nodes.length; n++) {
    var el = nodes[n];
    var text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var letter = document.createElement('span');
      letter.className = 'rvb-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.style.setProperty('--i', i);
      letter.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(letter);
    }
  }
})();


// ============================================================
// SECTION FIX-1 · "WHAT VISITORS SAY" REVIEW FORM
// AUDIT FIX: the HTML/CSS for this form and its star rating already
// existed, but no JavaScript anywhere wired them up — clicking a star
// did nothing, and submitting the form just triggered a native page
// reload (no listener called preventDefault()). This section makes the
// star input interactive and the form submit safely.
//
// IMPORTANT — ACTION NEEDED: this posts to REVIEW_WORKER_URL below.
// Fill that in with your actual Cloudflare Worker endpoint (the one
// mentioned in the HTML comment near the review section) once you have
// it deployed. Until it's set, the form still validates and gives the
// visitor clear feedback instead of silently failing or reloading the
// page — it just can't persist/display reviews yet.
// ============================================================
(function () {
  'use strict';

  var REVIEW_WORKER_URL = ''; // <-- put your Cloudflare Worker URL here, e.g. 'https://your-worker.your-subdomain.workers.dev'

  var form      = document.getElementById('reviewForm');
  var starsWrap = document.getElementById('reviewStars');
  var ratingEl  = document.getElementById('reviewRatingValue');
  var statusEl  = document.getElementById('reviewFormStatus');
  var grid      = document.getElementById('reviewsGrid');
  var emptyState = document.getElementById('reviewsEmptyState');

  if (!form) return;

  // ── Star rating input ──────────────────────────────────────
  var stars = starsWrap ? Array.prototype.slice.call(starsWrap.querySelectorAll('i[data-star]')) : [];

  function paintStars(value) {
    stars.forEach(function (star) {
      var starVal = +star.getAttribute('data-star');
      star.classList.toggle('review-star', true); // use the styling already defined in styles.css
      star.classList.toggle('active', starVal <= value);
    });
  }

  function setRating(value) {
    if (ratingEl) ratingEl.value = String(value);
    paintStars(value);
  }

  if (stars.length) {
    paintStars(0);
    stars.forEach(function (star) {
      var starVal = +star.getAttribute('data-star');
      star.addEventListener('click', function () { setRating(starVal); });
      star.addEventListener('mouseenter', function () { paintStars(starVal); });
    });
    starsWrap.addEventListener('mouseleave', function () {
      paintStars(ratingEl ? +ratingEl.value : 0);
    });
  }

  // ── Rendering an approved review as a card ─────────────────
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function starGlyphs(rating) {
    var r = Math.max(0, Math.min(5, +rating || 0));
    return '\u2605'.repeat(r) + '\u2606'.repeat(5 - r);
  }

  function renderReview(review) {
    var card = document.createElement('div');
    card.className = 'review-card';
    var dateStr = review.date ? escapeHtml(review.date) : '';
    card.innerHTML =
      '<div class="review-card-header">' +
        '<span class="rc-name">' + escapeHtml(review.name) + '</span>' +
        (dateStr ? '<span class="rc-date">' + dateStr + '</span>' : '') +
      '</div>' +
      '<div class="review-stars" aria-hidden="true">' + starGlyphs(review.rating) + '</div>' +
      '<p class="rc-text">' + escapeHtml(review.message) + '</p>';
    return card;
  }

  function renderReviews(list) {
    if (!grid) return;
    if (!list || !list.length) return; // leave the existing empty state as-is
    if (emptyState) emptyState.remove();
    list.forEach(function (review) { grid.appendChild(renderReview(review)); });
  }

  // ── Load approved reviews on page load ─────────────────────
  function loadApprovedReviews() {
    if (!REVIEW_WORKER_URL || !grid) return; // no endpoint configured yet — keep the static empty state
    fetch(REVIEW_WORKER_URL + '/reviews', { method: 'GET' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { renderReviews(Array.isArray(data) ? data : (data && data.reviews) || []); })
      .catch(function () { /* silent — empty state remains */ });
  }
  loadApprovedReviews();

  // ── Submit handler ──────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // FIX: this was missing entirely, so submitting reloaded the page

    var name    = (document.getElementById('reviewName') || {}).value || '';
    var message = (document.getElementById('reviewMessage') || {}).value || '';
    var rating  = ratingEl ? +ratingEl.value : 0;

    name = name.trim();
    message = message.trim();

    if (!name || !message || !rating) {
      if (statusEl) {
        statusEl.textContent = 'Please add your name, a short review, and a star rating before submitting.';
        statusEl.classList.add('review-form-status--error');
      }
      return;
    }

    var submitBtn = document.getElementById('reviewSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) {
      statusEl.classList.remove('review-form-status--error');
      statusEl.textContent = 'Submitting…';
    }

    if (!REVIEW_WORKER_URL) {
      // No backend configured yet — tell the visitor honestly rather than
      // pretending it was saved.
      if (statusEl) statusEl.textContent = 'Thanks! Review submissions are being set up right now — please check back soon.';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    fetch(REVIEW_WORKER_URL + '/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, message: message, rating: rating })
    })
      .then(function (r) { if (!r.ok) throw new Error('Request failed'); return r.json().catch(function () { return {}; }); })
      .then(function () {
        if (statusEl) statusEl.textContent = 'Thanks! Your review has been submitted and will appear once approved.';
        form.reset();
        setRating(0);
      })
      .catch(function () {
        if (statusEl) statusEl.textContent = 'Something went wrong sending your review — please try again in a moment.';
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();

/* =====================================================================
   LIQUID-GLASS BUTTON RIPPLE — one delegated listener, no per-button
   handlers, no rAF loop. Positions a CSS-only ripple via custom
   properties and toggles a class to (re)play the CSS keyframe.
===================================================================== */
(function () {
  var HOST_SELECTOR = [
    '.btn-primary', '.btn-ghost', '.btn-gold', '.btn-sm-gold', '.smrv-submit-btn',
    '.gate-btn', '.gate-cancel-btn', '.gate-close',
    '.engage-cta-btn', '.es-pill', '.erc-download', '.engage-row',
    '.fab-main', '.fab-option',
    '.hero-linkedin-btn', '.rec-linkedin-btn', '.ref-linkedin-btn',
    '.hie-modal-btn', '.pdf-modal-btn',
    '.msc-btn',
    '.nav-mob-link', '.nav-mob-toggle',
    '.recruiter-view-btn', '.recruiter-view-mob-btn', '.recruiter-panel-close', '.recruiter-panel-item',
    '.social-orb',
    '.command-circle', '.back-top'
  ].join(',');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolveHost(matched) {
    // circular social icons: the ripple lives on the inner circle, not the label column
    if (matched.classList.contains('social-orb')) {
      return matched.querySelector('span') || matched;
    }
    return matched;
  }

  function onPointerDown(e) {
    if (reduceMotion) return;
    var matched = e.target.closest(HOST_SELECTOR);
    if (!matched) return;

    var host = resolveHost(matched);
    var rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var px = typeof e.clientX === 'number' ? e.clientX : rect.left + rect.width / 2;
    var py = typeof e.clientY === 'number' ? e.clientY : rect.top + rect.height / 2;
    var x = px - rect.left;
    var y = py - rect.top;
    var size = Math.max(rect.width, rect.height) * 1.8;

    host.style.setProperty('--rX', x + 'px');
    host.style.setProperty('--rY', y + 'px');
    host.style.setProperty('--rS', size + 'px');

    // restart the animation even on rapid repeat clicks
    host.classList.remove('gw-rippling');
    void host.offsetWidth; // force reflow
    host.classList.add('gw-rippling');
  }

  function onAnimationEnd(e) {
    if (e.animationName === 'gwbRipple') {
      e.target.classList.remove('gw-rippling');
    }
  }

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('animationend', onAnimationEnd, true);
})();


// ============================================================
// SECTION 25 · TROUBLESHOOTING LAB (scenario picker → diagnostic path)
// ----------------------------------------------------------------
// The .tsl-scenario-btn / #tslPanel markup and CSS already existed
// (see .tsl-* rules in styles.css) but nothing populated #tslPanel or
// wired the scenario buttons — the panel rendered permanently empty
// and clicking a scenario did nothing. This adds the missing data +
// render + click-handling, matching the .tsl-panel-head/.tsl-steps/
// .tsl-step/.tsl-panel-outcome structure the CSS already styles.
// One delegated click listener; panel HTML is rebuilt (not appended)
// on every switch, so nothing accumulates in the DOM.
// ============================================================

var TSL_SCENARIOS = {
  'no-internet': {
    title: 'No Internet Connection',
    badge: '~5 MIN FIX',
    desc: 'User reports the connection is completely down — no browsing, no app sync.',
    steps: [
      { title: 'Confirm the scope', detail: 'Check if it\u2019s one device or the whole site/network — rules out a single NIC/driver issue vs. an upstream outage.' },
      { title: 'Check physical layer', detail: 'Cable seated, link lights on the switch/NIC, Wi-Fi toggle not accidentally off.' },
      { title: 'Verify IP configuration', detail: 'ipconfig /all (or ifconfig) — look for an APIPA 169.254.x.x address, which points to a DHCP failure.' },
      { title: 'Release/renew and flush DNS', detail: 'ipconfig /release && ipconfig /renew, then ipconfig /flushdns to rule out a stale lease or cache.' },
      { title: 'Test upstream', detail: 'Ping the gateway, then a public IP, then a domain name — isolates whether the fault is local, ISP-side, or DNS.' }
    ],
    outcome: 'Root cause found in the DHCP lease or gateway hop in the vast majority of cases — resolved without escalating to the ISP.'
  },
  'slow-computer': {
    title: 'Slow Computer',
    badge: '~10 MIN FIX',
    desc: 'User reports the machine has become sluggish over time, especially at startup.',
    steps: [
      { title: 'Check resource usage', detail: 'Task Manager / Activity Monitor — sort by CPU, memory, and disk to spot a runaway or misbehaving process.' },
      { title: 'Review startup programs', detail: 'Disable unnecessary auto-start apps — the most common cause of a slow boot-to-usable time.' },
      { title: 'Check disk health & free space', detail: 'Low free space (under ~10%) and SMART errors both degrade performance; confirmed disk isn\u2019t failing.' },
      { title: 'Scan for malware', detail: 'A quick scan rules out background processes silently eating CPU/network.' },
      { title: 'Check for pending updates', detail: 'OS and driver updates queued in the background can cause intermittent slowdowns until they finish installing.' }
    ],
    outcome: 'Most slowdowns trace back to startup bloat or low disk space — both fixed without a reimage.'
  },
  'printer': {
    title: 'Printer Not Working',
    badge: '~5 MIN FIX',
    desc: 'User can\u2019t print — job either fails silently or sits stuck in the queue.',
    steps: [
      { title: 'Check the physical printer', detail: 'Powered on, no error lights, paper loaded, no jam — the fastest possible fix.' },
      { title: 'Confirm network/connection status', detail: 'Ping the printer\u2019s IP (network printers) or check the USB/cable connection.' },
      { title: 'Clear the print queue', detail: 'A stuck job at the front of the queue blocks every job behind it — clear it and restart the Print Spooler service.' },
      { title: 'Verify the correct driver/default printer', detail: 'Wrong or corrupted driver, or print job routed to the wrong device.' },
      { title: 'Send a test print', detail: 'Confirms the fix actually worked before closing the ticket.' }
    ],
    outcome: 'A stuck spooler job accounts for most "not working" printer tickets — resolved in one restart of the service.'
  },
  'dns': {
    title: 'DNS Problem',
    badge: '~7 MIN FIX',
    desc: 'Internet connects fine, but websites won\u2019t load by name (IPs still work).',
    steps: [
      { title: 'Confirm it\u2019s DNS, not connectivity', detail: 'Ping a known public IP directly — if that works but a domain name doesn\u2019t resolve, it\u2019s DNS specifically.' },
      { title: 'Flush the local DNS cache', detail: 'ipconfig /flushdns clears a stale or poisoned local cache — resolves a large share of these tickets alone.' },
      { title: 'Test an alternate DNS resolver', detail: 'Temporarily point at 1.1.1.1 or 8.8.8.8 to isolate whether the issue is the configured DNS server itself.' },
      { title: 'Check the DHCP/router-assigned DNS settings', detail: 'A misconfigured router or DHCP scope can be silently handing out a dead DNS server to every device on the network.' },
      { title: 'Verify from a second device', detail: 'Confirms whether the fault is device-specific or affecting the whole network before closing out.' }
    ],
    outcome: 'Nearly always a stale cache or a bad DNS server hand-off — fixed locally, no ISP escalation needed.'
  }
};

function _tslRenderPanel(key) {
  var panel = document.getElementById('tslPanel');
  var data = TSL_SCENARIOS[key];
  if (!panel || !data) return;

  var stepsHtml = data.steps.map(function (step, i) {
    return (
      '<li class="tsl-step" style="animation-delay:' + (i * 0.07).toFixed(2) + 's">' +
        '<div class="tsl-step-rail">' +
          '<span class="tsl-step-num">' + (i + 1) + '</span>' +
          '<span class="tsl-step-line"></span>' +
        '</div>' +
        '<div class="tsl-step-body">' +
          '<p class="tsl-step-title">' + step.title + '</p>' +
          '<p class="tsl-step-detail">' + step.detail + '</p>' +
        '</div>' +
      '</li>'
    );
  }).join('');

  panel.innerHTML =
    '<div class="tsl-panel-head">' +
      '<h3 class="tsl-panel-title">' + data.title + '</h3>' +
      '<span class="tsl-panel-badge">' + data.badge + '</span>' +
    '</div>' +
    '<p class="tsl-panel-desc">' + data.desc + '</p>' +
    '<ol class="tsl-steps">' + stepsHtml + '</ol>' +
    '<div class="tsl-panel-outcome">' +
      '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
      '<p>' + data.outcome + '</p>' +
    '</div>';
}

function initTroubleshootingLab() {
  var wrap = document.getElementById('tslScenarios');
  var panel = document.getElementById('tslPanel');
  if (!wrap || !panel) return;

  var buttons = wrap.querySelectorAll('.tsl-scenario-btn');

  wrap.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.tsl-scenario-btn') : null;
    if (!btn || !wrap.contains(btn)) return;
    var key = btn.getAttribute('data-scenario');
    if (!key || !TSL_SCENARIOS[key]) return;

    buttons.forEach(function (b) {
      var active = b === btn;
      b.classList.toggle('tsl-active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    _tslRenderPanel(key);
  });

  // Render whichever button already carries aria-selected="true" in the
  // markup (defaults to "No Internet") so the panel isn't empty on load.
  var initialBtn = wrap.querySelector('.tsl-scenario-btn[aria-selected="true"]') || buttons[0];
  if (initialBtn) {
    initialBtn.classList.add('tsl-active');
    _tslRenderPanel(initialBtn.getAttribute('data-scenario'));
  }
}

// ============================================================
// PORTRAIT 360 — interactive 3D tilt on mouse move (desktop only;
// the spinning ring halo itself is pure CSS, see styles.css).
// Skips entirely on touch devices and prefers-reduced-motion.
// ============================================================
(function () {
  var frame = document.getElementById('heroPortraitFrame');
  var ring  = document.getElementById('heroPortraitRing');
  if (!frame || !ring) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (reduceMotion || isCoarsePointer) return;

  var MAX_TILT = 10; // degrees
  var raf = null;

  function handleMove(e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var rect = ring.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;  // 0..1
      var py = (e.clientY - rect.top) / rect.height;   // 0..1
      var tiltY = (px - 0.5) * 2 * MAX_TILT;   // left/right
      var tiltX = (0.5 - py) * 2 * MAX_TILT;   // up/down
      frame.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
      frame.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
      frame.style.setProperty('--tilt-scale', '1.03');
    });
  }

  function resetTilt() {
    frame.style.setProperty('--tilt-x', '0deg');
    frame.style.setProperty('--tilt-y', '0deg');
    frame.style.setProperty('--tilt-scale', '1');
  }

  ring.addEventListener('mousemove', handleMove);
  ring.addEventListener('mouseleave', resetTilt);
})();
