/* ============================================================
   reviews-portfolio.js  ·  sajidmk.com
   "What People Say" — animated marquee of approved reviews

   SECURITY MODEL
   ──────────────
   · Uses ONLY the public anon key (safe to expose).
   · RLS policy "public_can_read_approved_reviews" means the
     anon role can only SELECT rows WHERE status = 'approved'.
     Rejected and pending rows are invisible even if queried.
   · All DB output is HTML-escaped before injection (XSS safe).

   SETUP
   ─────
   1. Run STEP1_supabase_sql.sql once in your Supabase SQL Editor.
   2. Add the Supabase CDN script BEFORE this file:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   3. Paste your ANON key into REVIEWS_ANON_KEY below.
   4. Drop <script src="reviews-portfolio.js"></script> before </body>.
   ============================================================ */

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  var REVIEWS_URL      = 'https://ruiqfkzuqxxbyvycvsfo.supabase.co';
  var REVIEWS_ANON_KEY = 'PASTE_YOUR_REVIEWS_ANON_KEY_HERE';
  /*
     How to get it:
       Supabase Dashboard → Your Reviews Project
       → Project Settings → API → "anon" (public)
     This key is intentionally public-safe. Service-role key
     is NEVER used in any frontend file.
  */

  /* ── WHERE TO INJECT ─────────────────────────────────────── */
  var ANCHOR_SELECTORS = [
    '#engage',
    '.engage-wrap',
    '[data-section="engage"]',
    '.contact-section',
    '#contact'
  ];

  /* ── SUPABASE CLIENT (singleton) ──────────────────────────── */
  var _db = null;
  function getDb() {
    if (_db) return _db;
    if (!window.supabase) {
      console.warn('[WPS] Supabase SDK not loaded — add the CDN <script> before reviews-portfolio.js');
      return null;
    }
    try {
      _db = window.supabase.createClient(REVIEWS_URL, REVIEWS_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {
      console.error('[WPS] Client error:', e);
    }
    return _db;
  }

  /* ── ANCHOR FINDER ─────────────────────────────────────────── */
  function findAnchor() {
    for (var i = 0; i < ANCHOR_SELECTORS.length; i++) {
      var el = document.querySelector(ANCHOR_SELECTORS[i]);
      if (el) return el.closest('.section') || el.closest('section') || el;
    }
    return null;
  }

  /* ── XSS-SAFE HTML ESCAPE ──────────────────────────────────── */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /* ── STARS ─────────────────────────────────────────────────── */
  function starsHTML(rating) {
    var n = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    return '<span class="wps-stars-filled" aria-hidden="true">' + '★'.repeat(n) + '</span>'
         + '<span class="wps-stars-empty"  aria-hidden="true">' + '★'.repeat(5 - n) + '</span>';
  }

  /* ── RELATIVE DATE ──────────────────────────────────────────── */
  function relDate(ds) {
    if (!ds) return '';
    var d = Math.floor((Date.now() - new Date(ds).getTime()) / 1000);
    if (d < 60)      return 'just now';
    if (d < 3600)    return Math.floor(d / 60)    + 'm ago';
    if (d < 86400)   return Math.floor(d / 3600)  + 'h ago';
    if (d < 2592000) return Math.floor(d / 86400) + 'd ago';
    return new Date(ds).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  /* ── AVATAR INITIALS ────────────────────────────────────────── */
  function initials(name) {
    var p = String(name || 'V').trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  /* ── DETERMINISTIC AVATAR HUE ──────────────────────────────── */
  var HUES = [211, 262, 158, 32, 340, 185, 280, 50];
  function avatarHue(name) {
    var h = 0, s = String(name || 'V');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return HUES[h % HUES.length];
  }

  /* ── CARD HTML ──────────────────────────────────────────────── */
  function buildCard(r) {
    var safeName = esc(r.name   || 'Visitor');
    var safeText = esc(r.review || '');
    var hue      = avatarHue(r.name || 'V');
    var rating   = parseInt(r.rating, 10) || 5;
    var date     = relDate(r.created_at);
    return (
      '<div class="wps-card" role="article">' +
        '<div class="wps-card-top">' +
          '<div class="wps-avatar" style="--wps-hue:' + hue + '" aria-hidden="true">' +
            initials(r.name) +
          '</div>' +
          '<div class="wps-meta">' +
            '<span class="wps-name">' + safeName + '</span>' +
            '<span class="wps-date">' + esc(date) + '</span>' +
          '</div>' +
          '<div class="wps-stars" aria-label="' + rating + ' out of 5 stars">' +
            starsHTML(rating) +
          '</div>' +
        '</div>' +
        '<p class="wps-text">\u201c' + safeText + '\u201d</p>' +
      '</div>'
    );
  }

  /* ── SKELETON CARDS ─────────────────────────────────────────── */
  function buildSkeletons(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += (
        '<div class="wps-card wps-skel-card" aria-hidden="true">' +
          '<div class="wps-card-top">' +
            '<div class="wps-skel wps-skel-av"></div>' +
            '<div class="wps-meta">' +
              '<div class="wps-skel" style="width:42%;height:13px;margin-bottom:5px;"></div>' +
              '<div class="wps-skel" style="width:26%;height:11px;"></div>' +
            '</div>' +
            '<div class="wps-skel" style="width:68px;height:16px;border-radius:8px;"></div>' +
          '</div>' +
          '<div class="wps-skel" style="width:100%;height:14px;margin-top:4px;"></div>' +
          '<div class="wps-skel" style="width:88%;height:14px;margin-top:6px;"></div>' +
          '<div class="wps-skel" style="width:60%;height:14px;margin-top:6px;"></div>' +
        '</div>'
      );
    }
    return out;
  }

  /* ── CSS INJECTION (scoped, injected once) ──────────────────── */
  var _cssInjected = false;
  function injectCSS() {
    if (_cssInjected || document.getElementById('wps-styles')) return;
    _cssInjected = true;
    var s = document.createElement('style');
    s.id = 'wps-styles';
    s.textContent = [
      /* Section wrapper */
      '.wps-section{padding:var(--section-pad,clamp(32px,4.5vw,60px)) 0;position:relative;z-index:10;}',
      '.wps-section::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
        'background:radial-gradient(ellipse 80% 50% at 50% 50%,rgba(255,255,255,.08) 0%,transparent 70%),',
        'radial-gradient(ellipse 50% 30% at 20% 80%,rgba(212,168,64,.03) 0%,transparent 60%);}',

      /* Section header — matches site's sec-eyebrow / sec-title / sec-rule pattern */
      '.wps-header{margin-bottom:clamp(20px,3vw,36px);}',
      '.wps-eyebrow{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;',
        'letter-spacing:.14em;color:var(--ink-3,#475569);text-transform:uppercase;margin-bottom:6px;}',
      '.wps-eyebrow-line{width:20px;height:1.5px;background:currentColor;opacity:.5;border-radius:2px;}',
      '.wps-title{font-family:var(--ff-serif,"Playfair Display",Georgia,serif);',
        'font-size:clamp(22px,3vw,36px);font-weight:700;line-height:1.1;margin:0 0 6px;',
        'background:linear-gradient(135deg,#1A1D24 0%,#3A3D50 60%,#5A5070 100%);',
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}',
      '.wps-rule{width:32px;height:2.5px;',
        'background:linear-gradient(90deg,var(--cyan,#D4D8E0) 0%,var(--purple,#A8ADB8) 100%);',
        'border-radius:6px;margin-top:8px;}',
      '.wps-subtitle{font-size:13.5px;color:var(--ink-3,#475569);margin-top:10px;font-weight:500;}',

      /* Marquee */
      '.wps-marquee-outer{overflow:hidden;position:relative;',
        'mask-image:linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%);',
        '-webkit-mask-image:linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%);}',
      '.wps-marquee-track{display:flex;gap:16px;width:max-content;',
        'animation:wpsScroll 32s linear infinite;}',
      '.wps-marquee-track:hover{animation-play-state:paused;}',
      '@keyframes wpsScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}',

      /* Card — luxury glassmorphism matching the portfolio */
      '.wps-card{',
        'flex:0 0 300px;display:flex;flex-direction:column;gap:10px;',
        'padding:20px 22px;border-radius:var(--r-xl,20px);',
        'background:linear-gradient(160deg,rgba(255,255,255,.82) 0%,rgba(250,250,246,.68) 100%);',
        'backdrop-filter:blur(32px) saturate(150%);',
        '-webkit-backdrop-filter:blur(32px) saturate(150%);',
        'border-top:1.5px solid rgba(255,255,255,.82);',
        'border-left:1px solid rgba(255,255,255,.58);',
        'border-right:1px solid rgba(255,255,255,.42);',
        'border-bottom:1px solid rgba(196,181,253,.28);',
        'box-shadow:var(--sh-glass-md,inset 0 1.5px 0 rgba(255,255,255,.85),0 14px 36px rgba(90,100,135,.12),0 0 0 .75px rgba(255,255,255,.55));',
        'transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease;',
        'cursor:default;user-select:none;}',
      '.wps-card:hover{transform:translateY(-3px) scale(1.012);',
        'box-shadow:var(--sh-glass-lg,inset 0 2px 0 rgba(255,255,255,.9),0 20px 50px rgba(80,92,130,.14),0 0 0 .75px rgba(255,255,255,.65));}',

      /* Card internals */
      '.wps-card-top{display:flex;align-items:center;gap:11px;}',
      '.wps-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;',
        'display:flex;align-items:center;justify-content:center;',
        'font-size:12px;font-weight:700;color:#fff;letter-spacing:.02em;',
        'background:hsl(var(--wps-hue,211),55%,52%);',
        'box-shadow:0 2px 8px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.22);}',
      '.wps-meta{flex:1;min-width:0;}',
      '.wps-name{display:block;font-size:13px;font-weight:700;color:#0d1018;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.wps-date{display:block;font-size:10.5px;font-weight:500;color:var(--ink-4,#475569);margin-top:1px;}',
      '.wps-stars{font-size:14px;letter-spacing:1px;flex-shrink:0;}',
      '.wps-stars-filled{color:#f59e0b;}',
      '.wps-stars-empty{color:rgba(0,0,0,.14);}',
      '.wps-text{font-size:13px;line-height:1.68;color:#252c3a;font-weight:500;margin:0;font-style:italic;}',

      /* Skeleton shimmer */
      '.wps-skel{background:linear-gradient(90deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.09) 50%,rgba(0,0,0,.05) 75%);',
        'background-size:400% 100%;animation:wpsSk 1.5s ease infinite;border-radius:8px;}',
      '@keyframes wpsSk{0%{background-position:100% 0}100%{background-position:0% 0}}',
      '.wps-skel-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;}',

      /* Empty */
      '.wps-empty{text-align:center;padding:40px 20px;color:var(--ink-3,#475569);font-size:14px;}',

      /* Mobile fallback */
      '@media(max-width:600px){',
        '.wps-marquee-outer{overflow:auto;mask-image:none;-webkit-mask-image:none;}',
        '.wps-marquee-track{animation:none;width:max-content;padding-bottom:12px;}',
        '.wps-card{flex:0 0 260px;}',
      '}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── BUILD SECTION ──────────────────────────────────────────── */
  var _section = null;
  function buildSection() {
    var sec = document.createElement('section');
    sec.className = 'wps-section section';
    sec.id        = 'what-people-say';
    sec.setAttribute('aria-label', 'What People Say');
    sec.innerHTML = (
      '<div class="container section-inner">' +
        '<div class="wps-header section-header">' +
          '<div class="wps-eyebrow sec-eyebrow">' +
            '<span class="wps-eyebrow-line"></span>Visitor Reviews' +
          '</div>' +
          '<h2 class="wps-title sec-title">What People Say</h2>' +
          '<div class="wps-rule sec-rule"></div>' +
          '<p class="wps-subtitle">Kind words from people who\'ve visited this portfolio.</p>' +
        '</div>' +
        '<div class="wps-marquee-outer" id="wps-marquee-outer">' +
          '<div class="wps-marquee-track" id="wps-track">' +
            buildSkeletons(4) +
          '</div>' +
        '</div>' +
      '</div>'
    );
    return sec;
  }

  function injectSection() {
    if (_section) return;
    injectCSS();
    _section = buildSection();
    var anchor = findAnchor();
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(_section, anchor);
    } else {
      document.body.appendChild(_section);
    }
  }

  /* ── RENDER ─────────────────────────────────────────────────── */
  function renderReviews(reviews) {
    var track = document.getElementById('wps-track');
    if (!track) return;
    if (!reviews || !reviews.length) {
      track.innerHTML       = '<div class="wps-empty">No reviews yet — check back soon.</div>';
      track.style.animation = 'none';
      return;
    }
    var cards = reviews.map(buildCard).join('');
    track.innerHTML             = cards + cards; /* double for seamless loop */
    track.style.animation       = '';
    var dur                     = Math.max(20, reviews.length * 8);
    track.style.animationDuration = dur + 's';
  }

  /* ── FETCH (anon key — RLS returns only approved rows) ─────── */
  async function fetchReviews() {
    var client = getDb();
    if (!client) return;
    try {
      var res = await client
        .from('reviews')
        .select('id, name, review, rating, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (res.error) { console.error('[WPS] Fetch error:', res.error.message); return; }
      renderReviews(res.data);
    } catch (e) {
      console.error('[WPS] Unexpected error:', e);
    }
  }

  /* ── REAL-TIME SUBSCRIPTION ─────────────────────────────────── */
  function subscribeRealtime() {
    var client = getDb();
    if (!client) return;
    client
      .channel('wps-approved-live')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'reviews', filter: 'status=eq.approved'
      }, function () { fetchReviews(); })
      .subscribe();
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    injectSection();
    fetchReviews();
    subscribeRealtime();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) fetchReviews();
    });
    setInterval(fetchReviews, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
