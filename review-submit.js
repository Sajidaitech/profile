/* ============================================================
   review-submit.js  ·  sajidmk.com
   "Leave a Review" form handler

   SECURITY MODEL
   ──────────────
   · Uses ONLY the public anon key — never the service_role key.
   · Inserts into the `reviews` table (dedicated table from
     STEP1_supabase_sql.sql, NOT the old contact_messages table).
   · RLS policy "visitors_can_insert_reviews" enforces server-side:
       ✓ status must be 'pending'  (cannot self-approve)
       ✓ name   length 1–120
       ✓ review length 1–1000
       ✓ rating 1–5
   · Client-side validation mirrors all constraints (defence in depth).
   · All strings trimmed and length-capped before insert.
   · Error messages injected via textContent only (XSS-safe).
   · No service_role key is stored in or loaded by this file.

   SETUP
   ─────
   1. Run STEP1_supabase_sql.sql in Supabase SQL Editor.
   2. Paste your anon (public) key into REVIEWS_ANON_KEY below.
   3. Add <script src="review-submit.js" defer></script> to index.html
      (before </body>). The Supabase CDN script must load first.
   ============================================================ */

(function () {
  'use strict';

  /* ── CONFIG ── */
  var REVIEWS_URL      = 'https://ruiqfkzuqxxbyvycvsfo.supabase.co';
  var REVIEWS_ANON_KEY = 'sb_publishable_B2lglqFpDltoMmz-RYQ_oA_UIDiWHNI'; /* Supabase → tbdgrhekycgfdeatxjnq project → Project Settings → API → anon (public) */
  /*
     Supabase Dashboard → Reviews Project
     → Project Settings → API → anon (public)
     Safe to expose. RLS enforces all server-side rules.
     ⚠ NEVER paste the service_role key here.
  */

  /* ── Constraints (mirror SQL CHECK exactly) ── */
  var NAME_MIN   = 1;
  var NAME_MAX   = 120;
  var REVIEW_MIN = 10;   /* UX minimum — SQL allows ≥1; we ask for ≥10 */
  var REVIEW_MAX = 1000;

  /* ── Supabase client (lazy singleton) ── */
  var _client = null;
  function getClient() {
    if (_client) return _client;
    if (!window.supabase) return null;
    try {
      _client = window.supabase.createClient(REVIEWS_URL, REVIEWS_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {
      console.error('[ReviewSubmit] Client error:', e);
    }
    return _client;
  }

  /* ── Wait for Supabase SDK (handles defer / async load) ── */
  function waitForClient(maxMs) {
    var t0 = Date.now();
    return new Promise(function (resolve) {
      (function poll() {
        var c = getClient();
        if (c) return resolve(c);
        if (Date.now() - t0 > maxMs) return resolve(null);
        setTimeout(poll, 300);
      })();
    });
  }

  /* ── Inline validation error display ── */
  function clearErr(id) {
    var old = document.getElementById(id + '-err');
    if (old) old.parentNode.removeChild(old);
    var field = document.getElementById(id);
    if (field) { field.removeAttribute('aria-describedby'); field.removeAttribute('aria-invalid'); }
  }

  function showErr(id, msg) {
    clearErr(id);
    var field = document.getElementById(id);
    if (!field) return;
    var el = document.createElement('p');
    el.id            = id + '-err';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = 'margin:3px 0 8px;font-size:12px;font-weight:600;color:#fca5a5;-webkit-text-fill-color:#fca5a5;';
    el.textContent   = msg;  /* textContent — never innerHTML — for XSS safety */
    field.setAttribute('aria-describedby', el.id);
    field.setAttribute('aria-invalid', 'true');
    field.parentNode.insertBefore(el, field.nextSibling);
  }

  function clearAllErrors() {
    ['reviewName', 'reviewText', 'reviewStars'].forEach(clearErr);
  }

  /* ── Star rating state ── */
  var _rating = 0;

  function highlightStars(n) {
    document.querySelectorAll('.review-star').forEach(function (s) {
      var v = parseInt(s.dataset.val, 10);
      if (v <= n) { s.classList.add('active'); s.setAttribute('aria-checked', 'true'); }
      else        { s.classList.remove('active'); s.setAttribute('aria-checked', 'false'); }
    });
  }

  function selectRating(val) {
    _rating = val;
    highlightStars(_rating);
    clearErr('reviewStars');
    document.querySelectorAll('.review-star').forEach(function (s) {
      s.setAttribute('tabindex', parseInt(s.dataset.val, 10) === val ? '0' : '-1');
    });
  }

  /* ── Wire star rating widget ── */
  function initStars() {
    var stars = Array.prototype.slice.call(
      document.querySelectorAll('.review-star[role="radio"]')
    );
    if (!stars.length) return;

    stars.forEach(function (s, i) {
      s.addEventListener('mouseover', function () {
        if (_rating === 0) highlightStars(parseInt(s.dataset.val, 10));
      });
      s.addEventListener('mouseleave', function () { highlightStars(_rating); });
      s.addEventListener('click', function (e) {
        e.preventDefault();
        selectRating(parseInt(s.dataset.val, 10));
        s.focus();
      });
      s.addEventListener('touchend', function (e) {
        e.preventDefault();
        selectRating(parseInt(s.dataset.val, 10));
      }, { passive: false });
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); selectRating(parseInt(s.dataset.val, 10));
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          var n = stars[Math.min(i + 1, stars.length - 1)];
          selectRating(parseInt(n.dataset.val, 10)); n.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          var p = stars[Math.max(i - 1, 0)];
          selectRating(parseInt(p.dataset.val, 10)); p.focus();
        }
      });
    });
  }

  /* ── Character counter ── */
  function initCharCounter() {
    var ta = document.getElementById('reviewText');
    var cc = document.getElementById('reviewCharCount');
    if (!ta || !cc) return;
    ta.setAttribute('maxlength', REVIEW_MAX);
    ta.addEventListener('input', function () {
      var len = ta.value.length;
      cc.textContent = len;
      var warn = len / REVIEW_MAX >= 0.9;
      cc.style.color = warn ? 'rgba(252,165,165,.9)' : 'rgba(255,255,255,.45)';
      cc.style.webkitTextFillColor = cc.style.color;
    });
    /* Update the /NNN label next to counter */
    var counterLabel = cc.parentNode;
    if (counterLabel) {
      counterLabel.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.includes('/')) {
          n.textContent = '/' + REVIEW_MAX;
        }
      });
    }
  }

  /* ── Pre-fill name from localStorage ── */
  function prefillName() {
    try {
      var saved = localStorage.getItem('sajid_visitor_name')
               || sessionStorage.getItem('sajid_visitor_name');
      var el = document.getElementById('reviewName');
      if (saved && el && !el.value) el.value = saved.slice(0, NAME_MAX);
    } catch (_) {}
  }

  /* ── Client-side validation ── */
  function validate(name, review, rating) {
    var errs = [];
    if (!name || name.length < NAME_MIN)
      errs.push({ id: 'reviewName', msg: 'Please enter your name.' });
    else if (name.length > NAME_MAX)
      errs.push({ id: 'reviewName', msg: 'Name must be ' + NAME_MAX + ' characters or fewer.' });

    if (!rating || rating < 1 || rating > 5)
      errs.push({ id: 'reviewStars', msg: 'Please select a star rating (1–5).' });

    if (!review || review.length < REVIEW_MIN)
      errs.push({ id: 'reviewText', msg: 'Please write at least ' + REVIEW_MIN + ' characters.' });
    else if (review.length > REVIEW_MAX)
      errs.push({ id: 'reviewText', msg: 'Review must be ' + REVIEW_MAX + ' characters or fewer.' });

    return errs;
  }

  /* ── MAIN SUBMIT HANDLER ── */
  window.submitReview = async function submitReview() {
    var btn = document.getElementById('reviewSubmitBtn');

    /* 1. Collect + trim */
    var name   = (String(document.getElementById('reviewName')?.value  || '').trim()).slice(0, NAME_MAX);
    var review = (String(document.getElementById('reviewText')?.value  || '').trim()).slice(0, REVIEW_MAX);
    var rating = _rating;

    /* 2. Validate */
    clearAllErrors();
    var errs = validate(name, review, rating);
    if (errs.length) {
      errs.forEach(function (e) { showErr(e.id, e.msg); });
      var first = document.getElementById(errs[0].id);
      if (first) first.focus();
      return;
    }

    /* 3. Lock UI */
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…'; }

    /* 4. Persist name */
    try {
      localStorage.setItem('sajid_visitor_name', name);
      sessionStorage.setItem('sajid_visitor_name', name);
    } catch (_) {}

    /* 5. Wait for SDK */
    var client = await waitForClient(4000);

    /* 6. Insert into `reviews` table (anon key + RLS handles the rest)
          Server enforces: status='pending', name 1–120, review 1–1000, rating 1–5 */
    var ok = false;
    if (client) {
      try {
        var res = await client.from('reviews').insert({
          name:   name,
          review: review,
          rating: rating,
          status: 'pending'   /* belt + braces — RLS also enforces this */
        });
        if (res.error) {
          console.error('[ReviewSubmit] Insert error:', res.error.message);
        } else {
          ok = true;
        }
      } catch (e) {
        console.error('[ReviewSubmit] Unexpected error:', e);
      }
    } else {
      console.warn('[ReviewSubmit] Supabase client unavailable.');
    }

    /* 7. Always show thank-you (good UX regardless of network issues) */
    var formEl   = document.getElementById('reviewForm');
    var thanksEl = document.getElementById('reviewThanks');
    if (formEl)   formEl.style.display   = 'none';
    if (thanksEl) thanksEl.style.display = 'block';

    /* 8. Re-enable button (form hidden, but useful if network failed) */
    if (!ok && btn) {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
    }
  };

  /* ── Expose rating getter (used by any legacy callers) ── */
  window._getReviewRating = function () { return _rating; };

  /* ── BOOT ── */
  function init() {
    initStars();
    initCharCounter();
    prefillName();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
