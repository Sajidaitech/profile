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

  // Minimal escaping so a visitor typing "<" or "&" into name/company
  // can't break Telegram's HTML parse_mode.
  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function send(text) {
    if (!TG_BOT_TOKEN || TG_BOT_TOKEN.indexOf('PASTE_') === 0) return; // not configured yet
    if (!TG_CHAT_ID || String(TG_CHAT_ID).indexOf('PASTE_') === 0) return;

    var url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';

    // Fire-and-forget: never block or interrupt the visitor's flow if
    // this fails (offline, ad blocker, Telegram down, etc).
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }).catch(function () { /* ignore — best effort only */ });
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
