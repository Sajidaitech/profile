/* ============================================================
   analytics.js  ·  sajidmk.com
   Visitor session tracker — runs once per page load.

   PURPOSE
   ───────
   1. Generate (or resume) a session ID and a stable browser
      fingerprint and write both to sessionStorage / localStorage
      so that script.js's _writeVisitorName() can use strategy 1
      (session_id match) or strategy 2 (fingerprint match) instead
      of falling through to the unsafe strategy 3 (recent-row
      fallback) that can corrupt a concurrent visitor's row.

   2. Insert one row into the `visitors` table in PROJECT A
      (the analytics / admin Supabase project) to record the page
      view. session_id and fingerprint are written to that row so
      _writeVisitorName() can later UPDATE the same row with the
      visitor's name.

   KEY DESIGN DECISIONS
   ────────────────────
   · Uses the PROJECT A anon key only. Never the service_role key.
   · RLS on `visitors` allows anon INSERT and anon UPDATE where
     visitor_name IS NULL (so the name-write-back works too).
   · session_id  — UUID v4 generated fresh each page load, stored
     in sessionStorage. Identifies this specific tab session.
   · fingerprint — a lightweight canvas + navigator hash, stored in
     localStorage so it persists across sessions for the same
     browser. Used as a secondary match key.
   · Both keys are written to sessionStorage under the exact names
     that _writeVisitorName() already reads:
       sessionStorage._smSessionId
       sessionStorage._smFingerprint   (also localStorage)
   · The Supabase INSERT is fire-and-forget — any error is swallowed
     so the portfolio page is never blocked or affected.
   · If Supabase SDK hasn't loaded by the time this script runs
     (both use defer, order isn't guaranteed), a retry loop polls
     for up to 8 seconds before giving up.
   · Duplicate inserts on soft-navigation are prevented by checking
     sessionStorage._smTracked.

   LOAD ORDER (index.html)
   ───────────────────────
   Add this script tag AFTER the Supabase CDN tag and BEFORE
   script.js (or alongside it — all three use defer so they race,
   but the gate fires at 10% scroll which gives plenty of time):

     <script src="analytics.js" defer></script>
     <script src="script.js"    defer></script>

   SUPABASE TABLE EXPECTED SCHEMA (visitors)
   ──────────────────────────────────────────
   Column         Type        Notes
   ─────────────────────────────────────────────────────────────
   id             uuid        default gen_random_uuid(), PK
   session_id     text        unique per page load
   fingerprint    text        stable per browser
   visitor_name   text        null until gate form submitted
   page           text        pathname + search
   referrer       text        document.referrer (trimmed)
   user_agent     text        navigator.userAgent
   screen         text        e.g. "1920x1080"
   timezone       text        Intl timezone string
   language       text        navigator.language
   created_at     timestamptz default now()
   ─────────────────────────────────────────────────────────────
   All columns except id and created_at are nullable so a partial
   insert never fails due to schema mismatches.
============================================================ */

(function () {
  'use strict';

  /* ── PROJECT A credentials (analytics / admin) ──────────────
     Same project as admin-gate.js and dashboard.js.
     Anon key only — service_role key is never in client code. */
  var SUPA_URL = 'https://tbdgrhekycgfdeatxjnq.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU';

  /* ── Constants ─────────────────────────────────────────────── */
  var TABLE          = 'visitors';
  var SS_SESSION_KEY = '_smSessionId';    // sessionStorage — read by script.js
  var SS_FP_KEY      = '_smFingerprint'; // sessionStorage — read by script.js
  var LS_FP_KEY      = '_smFingerprint'; // localStorage   — persists across sessions
  var SS_TRACKED_KEY = '_smTracked';     // sessionStorage — dedup guard
  var SDK_POLL_MS    = 300;              // poll interval while waiting for Supabase SDK
  var SDK_TIMEOUT_MS = 8000;            // give up after 8 s

  /* ── Supabase client (lazy singleton, anon only) ──────────── */
  var _db = null;
  function _getDb() {
    if (_db) return _db;
    if (!window.supabase) return null;
    try {
      _db = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {
      console.warn('[Analytics] Client creation failed:', e.message);
    }
    return _db;
  }

  /* ── UUID v4 generator (no crypto.randomUUID — broader compat) ── */
  function _uuid4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    /* Fallback: manual v4 using crypto.getRandomValues or Math.random */
    var buf = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf);
    } else {
      for (var i = 0; i < 16; i++) buf[i] = Math.floor(Math.random() * 256);
    }
    /* Set version 4 bits */
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    var hex = Array.from(buf).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    return hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20);
  }

  /* ── Lightweight browser fingerprint ─────────────────────────
     Combines:
       · Canvas 2D pixel hash  (rendering engine differences)
       · navigator.language
       · screen dimensions + color depth
       · timezone offset
       · platform / userAgent prefix
     NOT tracking-grade — it exists solely so that if a user opens
     a second tab or refreshes, _writeVisitorName() can still find
     their row via strategy 2 and update it with the correct name
     rather than creating a new orphan row.
     The hash is FNV-1a 32-bit — fast, no external dependency. ── */
  function _fnv32a(str) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      /* Emulate 32-bit unsigned multiply */
      hash = ((hash >>> 0) * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function _canvasHash() {
    try {
      var c = document.createElement('canvas');
      c.width = 240; c.height = 60;
      var ctx = c.getContext('2d');
      if (!ctx) return 'nocanvas';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('sajidmk', 2, 15);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.fillText('sajidmk', 4, 17);
      return _fnv32a(c.toDataURL().slice(0, 512));
    } catch (e) {
      return 'nocanvas';
    }
  }

  function _buildFingerprint() {
    /* Check localStorage first — reuse existing FP for this browser */
    try {
      var existing = localStorage.getItem(LS_FP_KEY);
      if (existing && /^[0-9a-f]{16,}$/.test(existing)) return existing;
    } catch (_) {}

    var parts = [
      _canvasHash(),
      navigator.language || 'xx',
      (screen.width || 0) + 'x' + (screen.height || 0),
      (screen.colorDepth || 24),
      (new Date().getTimezoneOffset()),
      (navigator.hardwareConcurrency || 0),
      /* First 80 chars of UA — stable across minor version bumps */
      (navigator.userAgent || '').slice(0, 80)
    ];
    var fp = _fnv32a(parts.join('|')) + _fnv32a(parts.reverse().join('|'));

    try { localStorage.setItem(LS_FP_KEY, fp); } catch (_) {}
    return fp;
  }

  /* ── Session ID — one per tab, persists across soft navigations ── */
  function _getSessionId() {
    try {
      var existing = sessionStorage.getItem(SS_SESSION_KEY);
      if (existing) return existing;
      var fresh = _uuid4();
      sessionStorage.setItem(SS_SESSION_KEY, fresh);
      return fresh;
    } catch (_) {
      return _uuid4(); // private browsing — still track, just can't persist
    }
  }

  /* ── Collect page-level metadata ─────────────────────────────── */
  function _collectMeta(sessionId, fingerprint) {
    var tz = 'Unknown';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) {}

    return {
      session_id:   sessionId,
      fingerprint:  fingerprint,
      visitor_name: null,    /* name written later by _writeVisitorName() */
      page:         (location.pathname + location.search).slice(0, 500),
      referrer:     (document.referrer || '').slice(0, 500),
      user_agent:   (navigator.userAgent || '').slice(0, 500),
      screen:       (screen.width || 0) + 'x' + (screen.height || 0),
      timezone:     tz,
      language:     navigator.language || null,
    };
  }

  /* ── Wait for the Supabase SDK to be available ───────────────── */
  function _waitForSdk(timeoutMs) {
    var t0 = Date.now();
    return new Promise(function (resolve) {
      (function poll() {
        var db = _getDb();
        if (db) return resolve(db);
        if (Date.now() - t0 > timeoutMs) return resolve(null);
        setTimeout(poll, SDK_POLL_MS);
      })();
    });
  }

  /* ── MAIN — runs once per page load ─────────────────────────── */
  async function _track() {
    /* Dedup guard: only track once per session */
    try {
      if (sessionStorage.getItem(SS_TRACKED_KEY) === '1') return;
    } catch (_) {}

    /* 1. Generate / resume identifiers */
    var sessionId   = _getSessionId();
    var fingerprint = _buildFingerprint();

    /* 2. Write to sessionStorage immediately so _writeVisitorName()
          can use strategies 1 & 2 even if the DB insert is slow */
    try {
      sessionStorage.setItem(SS_SESSION_KEY, sessionId);
      sessionStorage.setItem(SS_FP_KEY, fingerprint);
    } catch (_) {}

    /* 3. Also mirror to alternate key names script.js reads */
    try {
      sessionStorage.setItem('sajid_session_id', sessionId);
      localStorage.setItem(LS_FP_KEY, fingerprint); // already set by _buildFingerprint, belt-and-suspenders
    } catch (_) {}

    /* 4. Wait for Supabase SDK */
    var db = await _waitForSdk(SDK_TIMEOUT_MS);
    if (!db) {
      console.warn('[Analytics] Supabase SDK unavailable — skipping DB insert');
      return;
    }

    /* 5. Insert visitor row (fire-and-forget — never throws to caller) */
    try {
      var meta = _collectMeta(sessionId, fingerprint);
      var res = await db.from(TABLE).insert(meta);
      if (res.error) {
        /* Common case: RLS blocked the insert (e.g. table doesn't exist yet)
           Log it silently — never surface to the user */
        console.warn('[Analytics] Insert error:', res.error.message);
      } else {
        /* Mark as tracked for this session */
        try { sessionStorage.setItem(SS_TRACKED_KEY, '1'); } catch (_) {}
        console.debug('[Analytics] Visitor row inserted. session_id:', sessionId.slice(0, 8) + '…');
      }
    } catch (e) {
      console.warn('[Analytics] Unexpected error:', e.message);
    }
  }

  /* ── Boot: run after DOM is ready ────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _track);
  } else {
    _track();
  }

})();
