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
   (optional), Email (optional, validated if filled), and Purpose
   (required single choice: Recruitment / Verification / Other).

   No tracking, no Supabase, no Telegram, no dashboard — out of
   scope for this pass. Submitted info is only kept in this
   browser's storage so returning visitors aren't re-asked.
================================================================= */

(function () {
  'use strict';

  var REMEMBER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, same window as the site's existing gate

  var LS_INFO_KEY    = 'cvgate_visitor_info';   // JSON: {name, company, email, purpose}
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
            '<label class="cvg-label" for="cvgEmail">Email<span class="cvg-opt">(optional)</span></label>' +
            '<input class="cvg-input" id="cvgEmail" name="email" type="email" placeholder="you@company.com" autocomplete="email">' +
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
      email:    overlay.querySelector('#cvgEmail'),
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

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function submitGate() {
    var e = buildModal();
    var name = e.name.value.trim();
    var company = e.company.value.trim();
    var email = e.email.value.trim();
    var purposeEl = e.form.querySelector('input[name="cvgPurpose"]:checked');
    var purpose = purposeEl ? purposeEl.value : '';

    if (!name) {
      e.error.textContent = 'Please enter your name.';
      e.name.classList.add('cvg-invalid');
      e.name.focus();
      return;
    }
    e.name.classList.remove('cvg-invalid');

    if (email && !EMAIL_RE.test(email)) {
      e.error.textContent = 'That email address doesn\u2019t look right.';
      e.email.classList.add('cvg-invalid');
      e.email.focus();
      return;
    }
    e.email.classList.remove('cvg-invalid');

    if (!purpose) {
      e.error.textContent = 'Please select a purpose.';
      return;
    }
    e.error.textContent = '';

    var info = { name: name, company: company, email: email, purpose: purpose };

    try {
      localStorage.setItem(LS_INFO_KEY, JSON.stringify(info));
      localStorage.setItem(LS_SEEN_AT_KEY, String(Date.now()));
      sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
    } catch (err) { /* private browsing — ignore */ }

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
       name, company, email, purpose, submission date/time
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
      visitorEmail: visitor ? visitor.email : null,
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
  function trackModal(modalId, eventType, getExtra) {
    var el = document.getElementById(modalId);
    if (!el) return; // element not present on this page — skip quietly

    var isOpen = el.classList.contains('pdf-modal--open');
    var openedAt = null;
    var currentEventId = null;

    function handleOpen() {
      openedAt = Date.now();
      currentEventId = logEvent(eventType, merge({
        startedAt: new Date(openedAt).toISOString(),
        endedAt: null,
        durationMs: null
      }, getExtra ? getExtra() : null));
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

  function attachDownloadTracker(btnId, eventType, getExtra) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Never blocks or alters the native download — only records that
      // the download link was clicked; the browser's own save dialog
      // (if any) happens independently of this.
      logEvent(eventType, getExtra ? getExtra() : null);
    });
  }

  function getCertName() {
    var titleEl = document.getElementById('certModalTitle');
    return { certName: titleEl ? titleEl.textContent.trim() : null };
  }

  function init() {
    trackModal('pdfResumeModal', 'cv_view');
    trackModal('certImgModal', 'cert_view', getCertName);

    attachDownloadTracker('pdfDownloadBtn', 'cv_download');
    attachDownloadTracker('certModalDownloadBtn', 'cert_download', getCertName);
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
