/* ============================================================
   reviews-portfolio.js  ·  sajidmk.com
   Approved reviews — works with BOTH:
     · New HTML: two-column pill panel (#rppPillsList)
     · Old HTML: injects a marquee section before #contact

   SECURITY MODEL
   ──────────────
   · Uses ONLY the public anon key — safe to expose.
   · RLS "public_can_read_approved_reviews" ensures anon role
     can only SELECT rows WHERE status = 'approved'.
   · All DB output is HTML-escaped before injection (XSS safe).
============================================================ */

(function () {
  'use strict';

  /* ── CONFIG ── */
  var REVIEWS_URL      = 'https://ruiqfkzuqxxbyvycvsfo.supabase.co';
  var REVIEWS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXFma3p1cXh4Ynl2eWN2c2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTI2OTgsImV4cCI6MjA5NjA4ODY5OH0._5q21Pf3Wn2IIYCw5yU-lmt-j05DuQH-oCmalQ4no4U';

  var PILLS_PER_PAGE = 5;

  /* ── SUPABASE CLIENT (singleton) ── */
  var _db = null;
  function getDb() {
    if (_db) return _db;
    if (!window.supabase) {
      console.warn('[RPP] Supabase SDK not loaded');
      return null;
    }
    try {
      _db = window.supabase.createClient(REVIEWS_URL, REVIEWS_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) { console.error('[RPP] Client error:', e); }
    return _db;
  }

  /* ── Wait for Supabase SDK ── */
  function waitForClient(maxMs) {
    var t0 = Date.now();
    return new Promise(function (resolve) {
      (function poll() {
        var c = getDb();
        if (c) return resolve(c);
        if (Date.now() - t0 > maxMs) return resolve(null);
        setTimeout(poll, 300);
      })();
    });
  }

  /* ── XSS-SAFE ESCAPE ── */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /* ── SHARED HELPERS ── */
  function relDate(ds) {
    if (!ds) return '';
    var d = Math.floor((Date.now() - new Date(ds).getTime()) / 1000);
    if (d < 60)      return 'just now';
    if (d < 3600)    return Math.floor(d / 60)    + 'm ago';
    if (d < 86400)   return Math.floor(d / 3600)  + 'h ago';
    if (d < 2592000) return Math.floor(d / 86400) + 'd ago';
    return new Date(ds).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  function initials(name) {
    var p = String(name || 'V').trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  var HUES = [211, 262, 158, 32, 340, 185, 280, 50];
  function avatarHue(name) {
    var h = 0, s = String(name || 'V');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return HUES[h % HUES.length];
  }

  /* ============================================================
     MODE A — NEW HTML (pill panel already in DOM)
  ============================================================ */

  function starsHTMLPill(rating) {
    var n = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += i <= n
        ? '<span class="rpp-star-fill">★</span>'
        : '<span class="rpp-star-empty">★</span>';
    }
    return out;
  }

  function buildPill(r) {
    var safeName = esc(r.name   || 'Visitor');
    var safeText = esc(r.review || '');
    var rating   = parseInt(r.rating, 10) || 5;
    return (
      '<div class="rpp-pill rpp-pill-enter" role="article" aria-label="Review by ' + safeName + '">' +
        '<div class="rpp-pill-row1">' +
          '<span class="rpp-pill-name">' + safeName + '</span>' +
          '<span class="rpp-pill-stars" aria-label="' + rating + ' out of 5 stars">' +
            starsHTMLPill(rating) +
          '</span>' +
        '</div>' +
        '<p class="rpp-pill-text">\u201c' + safeText + '\u201d</p>' +
      '</div>'
    );
  }

  var _allReviews  = [];
  var _currentPage = 0;

  function renderPillPage(page) {
    var listEl  = document.getElementById('rppPillsList');
    var pageNav = document.getElementById('rppPagination');
    if (!listEl) return;

    var totalPages = Math.max(1, Math.ceil(_allReviews.length / PILLS_PER_PAGE));
    page = Math.max(0, Math.min(page, totalPages - 1));
    _currentPage = page;

    if (!_allReviews.length) {
      listEl.innerHTML = '<div class="rpp-empty">No approved reviews yet — check back soon.</div>';
      if (pageNav) pageNav.style.display = 'none';
      return;
    }

    var start = page * PILLS_PER_PAGE;
    var slice = _allReviews.slice(start, start + PILLS_PER_PAGE);
    listEl.innerHTML = slice.map(buildPill).join('');

    if (pageNav) {
      if (totalPages <= 1) {
        pageNav.style.display = 'none';
      } else {
        pageNav.style.display = 'flex';
        var dots = '';
        for (var i = 0; i < totalPages; i++) {
          dots += '<button class="rpp-dot' + (i === page ? ' active' : '') + '" ' +
            'data-page="' + i + '" ' +
            'aria-label="Page ' + (i + 1) + '" ' +
            'aria-pressed="' + (i === page ? 'true' : 'false') + '">' +
            '</button>';
        }
        pageNav.innerHTML = dots;
        pageNav.querySelectorAll('.rpp-dot').forEach(function (btn) {
          btn.addEventListener('click', function () {
            renderPillPage(parseInt(btn.dataset.page, 10));
          });
        });
      }
    }
  }

  /* ============================================================
     MODE B — OLD HTML (inject marquee section)
  ============================================================ */

  function starsHTMLMarquee(rating) {
    var n = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    return '<span class="wps-stars-filled" aria-hidden="true">' + '★'.repeat(n) + '</span>'
         + '<span class="wps-stars-empty"  aria-hidden="true">' + '★'.repeat(5 - n) + '</span>';
  }

  function buildCard(r) {
    var safeName = esc(r.name   || 'Visitor');
    var safeText = esc(r.review || '');
    var hue      = avatarHue(r.name || 'V');
    var rating   = parseInt(r.rating, 10) || 5;
    var date     = relDate(r.created_at);
    return (
      '<div class="wps-card" role="article">' +
        '<div class="wps-card-top">' +
          '<div class="wps-avatar" style="--wps-hue:' + hue + '" aria-hidden="true">' + initials(r.name) + '</div>' +
          '<div class="wps-meta">' +
            '<span class="wps-name">' + safeName + '</span>' +
            '<span class="wps-date">' + esc(date) + '</span>' +
          '</div>' +
          '<div class="wps-stars" aria-label="' + rating + ' out of 5 stars">' + starsHTMLMarquee(rating) + '</div>' +
        '</div>' +
        '<p class="wps-text">\u201c' + safeText + '\u201d</p>' +
      '</div>'
    );
  }

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

  var _cssInjected = false;
  function injectMarqueeCSS() {
    if (_cssInjected || document.getElementById('wps-styles')) return;
    _cssInjected = true;
    var s = document.createElement('style');
    s.id = 'wps-styles';
    s.textContent = [
      '.wps-section{padding:var(--section-pad,clamp(32px,4.5vw,60px)) 0;position:relative;z-index:10;}',
      '.wps-section::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
        'background:radial-gradient(ellipse 80% 50% at 50% 50%,rgba(255,255,255,.08) 0%,transparent 70%);}',
      '.wps-header{margin-bottom:clamp(20px,3vw,36px);}',
      '.wps-eyebrow{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;',
        'letter-spacing:.14em;color:var(--ink-3,#475569);text-transform:uppercase;margin-bottom:6px;}',
      '.wps-eyebrow-line{width:20px;height:1.5px;background:currentColor;opacity:.5;border-radius:2px;}',
      '.wps-title{font-family:var(--ff-serif,"Playfair Display",Georgia,serif);',
        'font-size:clamp(22px,3vw,36px);font-weight:700;line-height:1.1;margin:0 0 6px;',
        'background:linear-gradient(135deg,#1A1D24 0%,#3A3D50 60%,#5A5070 100%);',
        '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}',
      '.wps-rule{width:32px;height:2.5px;background:linear-gradient(90deg,#D4D8E0 0%,#A8ADB8 100%);border-radius:6px;margin-top:8px;}',
      '.wps-subtitle{font-size:13.5px;color:var(--ink-3,#475569);margin-top:10px;font-weight:500;}',
      '.wps-marquee-outer{overflow:hidden;position:relative;',
        'mask-image:linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%);',
        '-webkit-mask-image:linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%);}',
      '.wps-marquee-track{display:flex;gap:16px;width:max-content;animation:wpsScroll 32s linear infinite;}',
      '.wps-marquee-track:hover{animation-play-state:paused;}',
      '@keyframes wpsScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}',
      '.wps-card{flex:0 0 300px;display:flex;flex-direction:column;gap:10px;padding:20px 22px;border-radius:20px;',
        'background:linear-gradient(160deg,rgba(255,255,255,.82) 0%,rgba(250,250,246,.68) 100%);',
        'backdrop-filter:blur(32px) saturate(150%);-webkit-backdrop-filter:blur(32px) saturate(150%);',
        'border-top:1.5px solid rgba(255,255,255,.82);border-left:1px solid rgba(255,255,255,.58);',
        'border-right:1px solid rgba(255,255,255,.42);border-bottom:1px solid rgba(196,181,253,.28);',
        'box-shadow:inset 0 1.5px 0 rgba(255,255,255,.85),0 14px 36px rgba(90,100,135,.12),0 0 0 .75px rgba(255,255,255,.55);',
        'transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease;cursor:default;user-select:none;}',
      '.wps-card:hover{transform:translateY(-3px) scale(1.012);}',
      '.wps-card-top{display:flex;align-items:center;gap:11px;}',
      '.wps-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;',
        'font-size:12px;font-weight:700;color:#fff;letter-spacing:.02em;',
        'background:hsl(var(--wps-hue,211),55%,52%);box-shadow:0 2px 8px rgba(0,0,0,.14);}',
      '.wps-meta{flex:1;min-width:0;}',
      '.wps-name{display:block;font-size:13px;font-weight:700;color:#0d1018;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.wps-date{display:block;font-size:10.5px;font-weight:500;color:#475569;margin-top:1px;}',
      '.wps-stars{font-size:14px;letter-spacing:1px;flex-shrink:0;}',
      '.wps-stars-filled{color:#f59e0b;}',
      '.wps-stars-empty{color:rgba(0,0,0,.14);}',
      '.wps-text{font-size:13px;line-height:1.68;color:#252c3a;font-weight:500;margin:0;font-style:italic;}',
      '.wps-skel{background:linear-gradient(90deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.09) 50%,rgba(0,0,0,.05) 75%);',
        'background-size:400% 100%;animation:wpsSk 1.5s ease infinite;border-radius:8px;}',
      '@keyframes wpsSk{0%{background-position:100% 0}100%{background-position:0% 0}}',
      '.wps-skel-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;}',
      '.wps-empty{text-align:center;padding:40px 20px;color:#475569;font-size:14px;}',
      '@media(max-width:600px){.wps-marquee-outer{overflow:auto;mask-image:none;-webkit-mask-image:none;}',
        '.wps-marquee-track{animation:none;width:max-content;padding-bottom:12px;}.wps-card{flex:0 0 260px;}}',
    ].join('');
    document.head.appendChild(s);
  }

  var _marqueeSection = null;
  function ensureMarqueeSection() {
    if (_marqueeSection && document.contains(_marqueeSection)) return;
    injectMarqueeCSS();
    var sec = document.createElement('section');
    sec.className = 'wps-section section';
    sec.id        = 'what-people-say';
    sec.setAttribute('aria-label', 'What People Say');
    sec.innerHTML = (
      '<div class="container section-inner">' +
        '<div class="wps-header section-header">' +
          '<div class="wps-eyebrow sec-eyebrow"><span class="wps-eyebrow-line"></span>Visitor Reviews</div>' +
          '<h2 class="wps-title sec-title">What People Say</h2>' +
          '<div class="wps-rule sec-rule"></div>' +
          '<p class="wps-subtitle">Kind words from people who\'ve visited this portfolio.</p>' +
        '</div>' +
        '<div class="wps-marquee-outer" id="wps-marquee-outer">' +
          '<div class="wps-marquee-track" id="wps-track">' + buildSkeletons(4) + '</div>' +
        '</div>' +
      '</div>'
    );

    // Find a good anchor to insert before
    var anchors = ['#engage', '.engage-wrap', '[data-section="engage"]', '.contact-section', '#contact', 'footer'];
    var anchor = null;
    for (var i = 0; i < anchors.length; i++) {
      var el = document.querySelector(anchors[i]);
      if (el) { anchor = el.closest('.section') || el.closest('section') || el; break; }
    }
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(sec, anchor);
    } else {
      document.querySelector('main') ? document.querySelector('main').appendChild(sec)
                                     : document.body.appendChild(sec);
    }
    _marqueeSection = sec;
  }

  function renderMarquee(reviews) {
    var track = document.getElementById('wps-track');
    if (!track) return;
    if (!reviews || !reviews.length) {
      track.innerHTML       = '<div class="wps-empty">No reviews yet — check back soon.</div>';
      track.style.animation = 'none';
      return;
    }
    var cards = reviews.map(buildCard).join('');
    track.innerHTML              = cards + cards;
    track.style.animation        = '';
    track.style.animationDuration = Math.max(20, reviews.length * 8) + 's';
  }

  /* ============================================================
     SHARED FETCH + REALTIME
  ============================================================ */

  function isNewHTML() {
    return !!document.getElementById('rppPillsList');
  }

  // ── Debounced fetchAndRender ─────────────────────────────────────────────
  // Three triggers fire fetchAndRender: realtime subscription, visibilitychange,
  // and a 60-second interval. Without a debounce these can overlap — e.g. a
  // review submitted from another tab triggers realtime AND visibilitychange
  // within milliseconds of each other. The 500ms debounce collapses concurrent
  // calls into one network request.
  var _fetchDebounceTimer = null;
  function fetchAndRenderDebounced() {
    clearTimeout(_fetchDebounceTimer);
    _fetchDebounceTimer = setTimeout(fetchAndRender, 500);
  }

  async function fetchAndRender() {
    var client = await waitForClient(5000);
    if (!client) {
      console.warn('[RPP] Supabase unavailable after 5s');
      return;
    }
    try {
      var res = await client
        .from('reviews')
        .select('id, name, review, rating, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (res.error) { console.error('[RPP] Fetch error:', res.error.message); return; }
      var data = res.data || [];

      if (isNewHTML()) {
        /* New pill panel */
        _allReviews = data;
        renderPillPage(0); // always jump to top (newest) on refresh
      } else {
        /* Old HTML — inject/update marquee */
        ensureMarqueeSection();
        renderMarquee(data);
      }
    } catch (e) {
      console.error('[RPP] Unexpected error:', e);
    }
  }

  function subscribeRealtime() {
    var client = getDb();
    if (!client) return;
    client
      .channel('rpp-approved-live')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'reviews'
        /* NOTE: no filter — we watch all changes so any approve/reject
           triggers an immediate refresh showing the latest approved set */
      }, function () {
        fetchAndRenderDebounced();
      })
      .subscribe();
  }

  /* Hide legacy website-reviews section if present */
  function hideOldStatic() {
    var old = document.getElementById('website-reviews');
    if (old) old.style.display = 'none';
  }

  /* ── INIT ── */
  function init() {
    hideOldStatic();
    fetchAndRender();
    subscribeRealtime();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) fetchAndRenderDebounced();
    });
    setInterval(fetchAndRenderDebounced, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
