// ============================================================
// SAJID MEHMOOD PORTFOLIO — CONTACT FORM MODULE
// contact-form.js  v2.0  |  June 2026
//
// Features:
//   - Supabase contact_messages storage via PortfolioData
//   - Full client-side validation with inline error messages
//   - Honeypot spam field
//   - Time-based submission guard (bot detection)
//   - Rate limiting (localStorage: max 3 per hour)
//   - Success / error toast notifications
//   - Accessible ARIA live region
// ============================================================

(function () {
  'use strict';

  // ─── CONSTANTS ──────────────────────────────────────────────
  var RATE_LIMIT_KEY   = '_smContactSubmissions';
  var RATE_LIMIT_MAX   = 3;          // max submissions per window
  var RATE_LIMIT_WINDOW = 3600000;   // 1 hour in ms
  var MIN_FILL_TIME    = 3000;       // min ms to fill form (bot guard)
  var TOAST_DURATION   = 5000;       // ms toast stays visible

  // ─── SANITIZE ───────────────────────────────────────────────
  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }

  function stripTags(str) {
    if (!str) return '';
    return String(str).replace(/<[^>]*>/g, '').trim();
  }

  // ─── VALIDATORS ─────────────────────────────────────────────
  var validators = {
    name: function (v) {
      v = v.trim();
      if (!v) return 'Name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (v.length > 80) return 'Name must be 80 characters or fewer.';
      if (/<|>|script/i.test(v)) return 'Name contains invalid characters.';
      return null;
    },
    email: function (v) {
      v = v.trim();
      if (!v) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
      if (v.length > 120) return 'Email is too long.';
      return null;
    },
    subject: function (v) {
      v = (v || '').trim();
      if (!v) return 'Please enter a subject.';
      if (v.length < 3) return 'Subject is too short.';
      if (v.length > 120) return 'Subject must be 120 characters or fewer.';
      return null;
    },
    message: function (v) {
      v = (v || '').trim();
      if (!v) return 'Message is required.';
      if (v.length < 10) return 'Message is too short — please give some context.';
      if (v.length > 2000) return 'Message is too long (max 2000 characters).';
      return null;
    }
  };

  // ─── RATE LIMITER ────────────────────────────────────────────
  function checkRateLimit() {
    try {
      var raw = localStorage.getItem(RATE_LIMIT_KEY);
      var data = raw ? JSON.parse(raw) : { submissions: [], window_start: Date.now() };
      var now = Date.now();

      // Reset window if expired
      if (now - data.window_start > RATE_LIMIT_WINDOW) {
        data = { submissions: [], window_start: now };
      }

      if (data.submissions.length >= RATE_LIMIT_MAX) {
        var waitMins = Math.ceil((RATE_LIMIT_WINDOW - (now - data.window_start)) / 60000);
        return { allowed: false, wait: waitMins };
      }
      return { allowed: true, data: data };
    } catch (e) {
      return { allowed: true, data: { submissions: [], window_start: Date.now() } };
    }
  }

  function recordSubmission(data) {
    try {
      data.submissions.push(Date.now());
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    } catch (e) { /* storage full — non-fatal */ }
  }

  // ─── TOAST NOTIFICATIONS ────────────────────────────────────
  function injectToastStyles() {
    if (document.getElementById('cf-toast-css')) return;
    var s = document.createElement('style');
    s.id = 'cf-toast-css';
    s.textContent = [
      '#cf-toast-root{position:fixed;bottom:28px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}',
      '.cf-toast{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:12px;',
      '  min-width:280px;max-width:380px;font-family:"DM Sans",system-ui,sans-serif;font-size:14px;',
      '  box-shadow:0 8px 32px rgba(0,0,0,0.28),0 2px 8px rgba(0,0,0,0.16);',
      '  pointer-events:auto;cursor:pointer;',
      '  animation:cf-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;}',
      '.cf-toast.cf-toast-exit{animation:cf-slide-out 0.3s ease forwards;}',
      '.cf-toast--success{background:linear-gradient(135deg,#0f2d1a,#0d3320);border:1px solid rgba(52,211,102,0.3);color:#e8f5ec;}',
      '.cf-toast--error{background:linear-gradient(135deg,#2d0f0f,#330d0d);border:1px solid rgba(248,113,113,0.3);color:#fde8e8;}',
      '.cf-toast--warning{background:linear-gradient(135deg,#2d240f,#332a0d);border:1px solid rgba(251,191,36,0.3);color:#fdf3e8;}',
      '.cf-toast-icon{flex-shrink:0;font-size:18px;line-height:1;margin-top:1px;}',
      '.cf-toast-body{flex:1;}',
      '.cf-toast-title{font-weight:600;font-size:13px;letter-spacing:0.01em;margin-bottom:3px;}',
      '.cf-toast-msg{opacity:0.82;font-size:13px;line-height:1.45;}',
      '.cf-toast-close{flex-shrink:0;opacity:0.45;font-size:16px;cursor:pointer;line-height:1;margin-top:1px;background:none;border:none;color:inherit;padding:0;}',
      '.cf-toast-close:hover{opacity:0.9;}',
      '@keyframes cf-slide-in{from{opacity:0;transform:translateX(40px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}',
      '@keyframes cf-slide-out{to{opacity:0;transform:translateX(40px) scale(0.95)}}'
    ].join('');
    document.head.appendChild(s);
  }

  function showToast(type, title, message) {
    injectToastStyles();
    var root = document.getElementById('cf-toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'cf-toast-root';
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('aria-atomic', 'true');
      document.body.appendChild(root);
    }

    var icons = { success: '✓', error: '✕', warning: '⚠' };
    var toast = document.createElement('div');
    toast.className = 'cf-toast cf-toast--' + type;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = [
      '<span class="cf-toast-icon">' + (icons[type] || '●') + '</span>',
      '<div class="cf-toast-body">',
      '  <div class="cf-toast-title">' + sanitize(title) + '</div>',
      '  <div class="cf-toast-msg">' + sanitize(message) + '</div>',
      '</div>',
      '<button class="cf-toast-close" aria-label="Dismiss">×</button>'
    ].join('');

    root.appendChild(toast);

    function dismiss() {
      toast.classList.add('cf-toast-exit');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }

    toast.querySelector('.cf-toast-close').addEventListener('click', dismiss);
    toast.addEventListener('click', dismiss);

    var timer = setTimeout(dismiss, TOAST_DURATION);
    toast.addEventListener('mouseenter', function () { clearTimeout(timer); });
    toast.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 2000); });
  }

  // ─── FIELD ERROR HELPERS ────────────────────────────────────
  function injectFormStyles() {
    if (document.getElementById('cf-form-css')) return;
    var s = document.createElement('style');
    s.id = 'cf-form-css';
    s.textContent = [
      /* Inline error message */
      '.cf-field-error{display:block;font-size:12px;color:#f87171;margin-top:4px;font-family:"DM Sans",system-ui,sans-serif;}',
      '.cf-field-error:empty{display:none;}',
      /* Invalid field highlight */
      '.cf-input-invalid{outline:2px solid rgba(248,113,113,0.6)!important;outline-offset:2px;}',
      /* Submit button loading state */
      '.cf-btn-loading{opacity:0.65;pointer-events:none;cursor:not-allowed;}',
      '.cf-btn-loading::after{content:" ·";animation:cf-dots 1s steps(3,end) infinite;}',
      '@keyframes cf-dots{0%{content:" ·"}33%{content:" ··"}66%{content:" ···"}100%{content:" ·"}}',
      /* Char counter */
      '.cf-char-counter{font-size:11px;opacity:0.45;font-family:"DM Sans",system-ui,sans-serif;float:right;margin-top:4px;}',
      '.cf-char-counter.cf-near-limit{color:#fbbf24;}',
      '.cf-char-counter.cf-over-limit{color:#f87171;font-weight:600;}',
      /* Honeypot — visually hidden but accessible hidden */
      '.cf-honeypot{opacity:0;position:absolute;top:0;left:0;height:0;width:0;z-index:-1;pointer-events:none;}'
    ].join('');
    document.head.appendChild(s);
  }

  function setFieldError(field, message) {
    var fieldEl = field.closest ? field.closest('.cf-field, .contact-field, .form-group') || field.parentNode : field.parentNode;
    var errEl = fieldEl.querySelector('.cf-field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'cf-field-error';
      errEl.setAttribute('role', 'alert');
      errEl.setAttribute('aria-live', 'polite');
      field.parentNode.insertBefore(errEl, field.nextSibling);
    }
    errEl.textContent = message || '';
    if (message) {
      field.classList.add('cf-input-invalid');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errEl.id || (errEl.id = 'err-' + field.id));
    } else {
      field.classList.remove('cf-input-invalid');
      field.removeAttribute('aria-invalid');
    }
  }

  function clearFieldError(field) {
    setFieldError(field, '');
  }

  // ─── CHAR COUNTER ───────────────────────────────────────────
  function attachCharCounter(textarea, max) {
    var counter = document.createElement('span');
    counter.className = 'cf-char-counter';
    textarea.parentNode.appendChild(counter);

    function update() {
      var len = textarea.value.length;
      counter.textContent = len + ' / ' + max;
      counter.className = 'cf-char-counter' + (len > max ? ' cf-over-limit' : len > max * 0.85 ? ' cf-near-limit' : '');
    }
    textarea.addEventListener('input', update);
    update();
  }

  // ─── FORM BUILDER ───────────────────────────────────────────
  // Injects a contact form into any element with id="contact-form-mount"
  // or a passed container element.
  function buildContactForm(container) {
    if (!container) return;
    var formHtml = [
      '<form id="sajid-contact-form" novalidate autocomplete="on" aria-label="Contact Sajid Mehmood">',

      // ── Honeypot (invisible to humans, traps bots)
      '<div class="cf-honeypot" aria-hidden="true">',
      '  <label>Leave this field empty</label>',
      '  <input type="text" name="cf_website" tabindex="-1" autocomplete="off" value="">',
      '</div>',

      // ── Name
      '<div class="cf-field">',
      '  <label for="cf-name">Full Name <span aria-hidden="true">*</span></label>',
      '  <input type="text" id="cf-name" name="name" placeholder="e.g. Ahmed Al-Rashid"',
      '         autocomplete="name" maxlength="80" required aria-required="true">',
      '</div>',

      // ── Email
      '<div class="cf-field">',
      '  <label for="cf-email">Email Address <span aria-hidden="true">*</span></label>',
      '  <input type="email" id="cf-email" name="email" placeholder="you@company.com"',
      '         autocomplete="email" maxlength="120" required aria-required="true">',
      '</div>',

      // ── Company (optional)
      '<div class="cf-field">',
      '  <label for="cf-company">Company / Organisation <span style="opacity:.5;font-weight:400;">(optional)</span></label>',
      '  <input type="text" id="cf-company" name="company" placeholder="e.g. Qatar Airways"',
      '         autocomplete="organization" maxlength="100">',
      '</div>',

      // ── Subject
      '<div class="cf-field">',
      '  <label for="cf-subject">Subject <span aria-hidden="true">*</span></label>',
      '  <input type="text" id="cf-subject" name="subject" placeholder="e.g. IT Support Role — Hamad Medical"',
      '         maxlength="120" required aria-required="true">',
      '</div>',

      // ── Message
      '<div class="cf-field">',
      '  <label for="cf-message">Message <span aria-hidden="true">*</span></label>',
      '  <textarea id="cf-message" name="message" rows="5" maxlength="2000"',
      '            placeholder="Tell me about the opportunity, project, or question..."',
      '            required aria-required="true"></textarea>',
      '</div>',

      // ── Privacy note + Submit
      '<div class="cf-footer">',
      '  <p class="cf-privacy">',
      '    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">',
      '      <path d="M6 1L2 3v3c0 2.5 1.8 4.7 4 5.2C8.2 10.7 10 8.5 10 6V3L6 1z"',
      '            stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',
      '    </svg>',
      '    Your details are stored securely and never shared.',
      '  </p>',
      '  <button type="submit" id="cf-submit-btn" class="cf-submit">',
      '    <span class="cf-submit-label">Send Message</span>',
      '    <svg class="cf-submit-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
      '      <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      '    </svg>',
      '  </button>',
      '</div>',

      '</form>',

      // ── Success state (hidden initially)
      '<div id="cf-success-state" style="display:none;" role="status" aria-live="polite">',
      '  <div class="cf-success-icon">',
      '    <svg viewBox="0 0 48 48" fill="none" width="48" height="48" aria-hidden="true">',
      '      <circle cx="24" cy="24" r="22" stroke="rgba(52,211,102,0.5)" stroke-width="1.5"/>',
      '      <path d="M14 25l7 7 13-14" stroke="#34d366" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
      '    </svg>',
      '  </div>',
      '  <h3 class="cf-success-title">Message Sent!</h3>',
      '  <p class="cf-success-msg">Thanks for reaching out. I typically reply within 4 hours during Qatar business hours.</p>',
      '  <button class="cf-success-reset" id="cf-reset-btn">Send Another Message</button>',
      '</div>'
    ].join('\n');

    container.innerHTML = formHtml;

    // Inject styles
    injectFormStyles();
    injectContactFormBaseStyles();

    // Attach char counter to textarea
    var msgArea = container.querySelector('#cf-message');
    if (msgArea) attachCharCounter(msgArea, 2000);

    // Wire up the form
    wireForm(container.querySelector('#sajid-contact-form'), container.querySelector('#cf-success-state'));
  }

  // Base styles for the form UI (matches portfolio's luxury aesthetic)
  function injectContactFormBaseStyles() {
    if (document.getElementById('cf-base-css')) return;
    var s = document.createElement('style');
    s.id = 'cf-base-css';
    s.textContent = [
      '#sajid-contact-form{display:grid;gap:18px;}',
      '#sajid-contact-form .cf-field{display:flex;flex-direction:column;gap:6px;}',
      '#sajid-contact-form label{font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;opacity:0.6;font-family:"DM Sans",system-ui,sans-serif;}',
      '#sajid-contact-form label span[aria-hidden]{color:#f87171;}',
      '#sajid-contact-form input,#sajid-contact-form textarea{',
      '  font-family:"DM Sans",system-ui,sans-serif;font-size:14px;',
      '  padding:11px 14px;border-radius:8px;',
      '  background:rgba(255,255,255,0.06);',
      '  border:1px solid rgba(255,255,255,0.12);',
      '  color:inherit;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;',
      '  outline:none;resize:vertical;}',
      '#sajid-contact-form input:focus,#sajid-contact-form textarea:focus{',
      '  border-color:rgba(200,169,110,0.6);',
      '  background:rgba(255,255,255,0.09);',
      '  box-shadow:0 0 0 3px rgba(200,169,110,0.12);}',
      '#sajid-contact-form input::placeholder,#sajid-contact-form textarea::placeholder{opacity:0.35;}',
      '.cf-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}',
      '.cf-privacy{display:flex;align-items:center;gap:6px;font-size:11.5px;opacity:0.45;font-family:"DM Sans",system-ui,sans-serif;margin:0;}',
      '.cf-submit{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;',
      '  border-radius:8px;font-family:"DM Sans",system-ui,sans-serif;font-size:14px;font-weight:500;',
      '  background:linear-gradient(135deg,#C8A96E,#b8924a);color:#1a0e00;border:none;cursor:pointer;',
      '  transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s;box-shadow:0 4px 16px rgba(200,169,110,0.3);}',
      '.cf-submit:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(200,169,110,0.45);}',
      '.cf-submit:active{transform:translateY(0);}',
      '.cf-submit-arrow{transition:transform 0.2s;}',
      '.cf-submit:hover .cf-submit-arrow{transform:translateX(3px);}',
      /* Success state */
      '#cf-success-state{text-align:center;padding:32px 16px;}',
      '.cf-success-icon{margin:0 auto 16px;width:48px;}',
      '.cf-success-title{font-size:20px;font-weight:600;margin:0 0 8px;font-family:"Playfair Display",Georgia,serif;}',
      '.cf-success-msg{font-size:14px;opacity:0.65;margin:0 0 24px;font-family:"DM Sans",system-ui,sans-serif;line-height:1.5;}',
      '.cf-success-reset{background:none;border:1px solid rgba(255,255,255,0.2);color:inherit;',
      '  padding:8px 18px;border-radius:8px;font-family:"DM Sans",system-ui,sans-serif;font-size:13px;',
      '  cursor:pointer;opacity:0.6;transition:opacity 0.2s;}',
      '.cf-success-reset:hover{opacity:1;}'
    ].join('');
    document.head.appendChild(s);
  }

  // ─── FORM WIRING ────────────────────────────────────────────
  function wireForm(form, successState) {
    if (!form) return;

    var formStartTime = Date.now();
    var fields = {
      name:    form.querySelector('#cf-name'),
      email:   form.querySelector('#cf-email'),
      subject: form.querySelector('#cf-subject'),
      message: form.querySelector('#cf-message')
    };
    var submitBtn = form.querySelector('#cf-submit-btn');
    var honeypot  = form.querySelector('input[name="cf_website"]');

    // Clear errors on input
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field) return;
      field.addEventListener('input', function () { clearFieldError(field); });
      field.addEventListener('blur',  function () {
        var err = validators[key] ? validators[key](field.value) : null;
        if (err) setFieldError(field, err);
      });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // ── 1. Honeypot check
      if (honeypot && honeypot.value) {
        // Silently succeed (don't reveal we caught them)
        fakeSuccess(form, successState);
        return;
      }

      // ── 2. Time-based bot guard
      if (Date.now() - formStartTime < MIN_FILL_TIME) {
        fakeSuccess(form, successState);
        return;
      }

      // ── 3. Validate all fields
      var hasErrors = false;
      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        if (!field) return;
        var err = validators[key] ? validators[key](field.value) : null;
        if (err) {
          setFieldError(field, err);
          hasErrors = true;
        }
      });

      if (hasErrors) {
        // Focus first invalid field
        var firstInvalid = form.querySelector('.cf-input-invalid');
        if (firstInvalid) firstInvalid.focus();
        showToast('warning', 'Check your details', 'Please fix the highlighted fields before sending.');
        return;
      }

      // ── 4. Rate limit
      var rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        showToast('warning', 'Too many messages', 'Please wait ' + rateCheck.wait + ' minute(s) before sending another message.');
        return;
      }

      // ── 5. Submit
      setSubmitting(submitBtn, true);

      var payload = {
        type:    'contact',
        name:    sanitize(stripTags(fields.name.value)),
        email:   sanitize(stripTags(fields.email.value)),
        company: sanitize(stripTags((form.querySelector('#cf-company') || {}).value || '')),
        subject: sanitize(stripTags(fields.subject.value)),
        message: sanitize(stripTags(fields.message.value)),
        section: 'contact'
      };

      var result = { success: false, error: 'PortfolioData not available' };

      if (window.PortfolioData && typeof window.PortfolioData.submitContactMessage === 'function') {
        result = await window.PortfolioData.submitContactMessage(payload);
      } else {
        // Fallback: PortfolioData not ready — wait for it
        result = await new Promise(function (resolve) {
          var timeout = setTimeout(function () {
            resolve({ success: false, error: 'Service timeout — please try WhatsApp or email directly.' });
          }, 8000);

          document.addEventListener('portfolioDataReady', async function handler() {
            clearTimeout(timeout);
            document.removeEventListener('portfolioDataReady', handler);
            if (window.PortfolioData && typeof window.PortfolioData.submitContactMessage === 'function') {
              resolve(await window.PortfolioData.submitContactMessage(payload));
            } else {
              resolve({ success: false, error: 'Service unavailable.' });
            }
          });
        });
      }

      setSubmitting(submitBtn, false);

      if (result.success) {
        recordSubmission(rateCheck.data);
        showSuccess(form, successState);
        showToast('success', 'Message delivered!', 'I\'ll get back to you within 4 hours. ✓');
      } else {
        showToast('error', 'Failed to send', result.error || 'Something went wrong. Please try WhatsApp or email directly.');
      }
    });

    // Reset button
    var resetBtn = successState ? successState.querySelector('#cf-reset-btn') : null;
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        // Clear all error states
        Object.keys(fields).forEach(function (key) {
          if (fields[key]) clearFieldError(fields[key]);
        });
        successState.style.display = 'none';
        form.style.display = '';
        formStartTime = Date.now(); // reset timer
        if (fields.name) fields.name.focus();
      });
    }
  }

  function setSubmitting(btn, loading) {
    if (!btn) return;
    var label = btn.querySelector('.cf-submit-label');
    if (loading) {
      btn.classList.add('cf-btn-loading');
      btn.disabled = true;
      if (label) label.textContent = 'Sending';
    } else {
      btn.classList.remove('cf-btn-loading');
      btn.disabled = false;
      if (label) label.textContent = 'Send Message';
    }
  }

  function showSuccess(form, successState) {
    form.style.display = 'none';
    if (successState) successState.style.display = '';
  }

  function fakeSuccess(form, successState) {
    // Show success without actually submitting (catches bots)
    setTimeout(function () { showSuccess(form, successState); }, 800 + Math.random() * 600);
  }

  // ─── AUTO-MOUNT ──────────────────────────────────────────────
  // Mounts the form into any element with [data-contact-form] or
  // id="contact-form-mount". Falls back to appending inside #contact section.
  function autoMount() {
    var targets = document.querySelectorAll('[data-contact-form], #contact-form-mount');
    if (targets.length) {
      targets.forEach(function (t) { buildContactForm(t); });
      return;
    }

    // Secondary: look for .engage-right or .engage-form-slot inside #contact
    var contactSection = document.getElementById('contact');
    if (!contactSection) return;

    var slot = contactSection.querySelector('.engage-form-slot, .cf-slot');
    if (slot) {
      buildContactForm(slot);
    }
    // If no slot is found, the form won't auto-inject.
    // Call window.ContactForm.mount(element) manually.
  }

  // ─── PUBLIC API ──────────────────────────────────────────────
  window.ContactForm = {
    // Mount the form into a specific element
    mount: function (container) {
      if (typeof container === 'string') container = document.querySelector(container);
      buildContactForm(container);
    },
    // Show a toast manually
    toast: showToast,
    // Submit a message programmatically (e.g. from gate quick-connect)
    submit: async function (payload) {
      var rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        showToast('warning', 'Too many messages', 'Please wait ' + rateCheck.wait + ' minute(s).');
        return { success: false };
      }
      if (!window.PortfolioData) return { success: false, error: 'PortfolioData not loaded' };
      var result = await window.PortfolioData.submitContactMessage(payload);
      if (result.success) recordSubmission(rateCheck.data);
      return result;
    }
  };

  // Auto-mount on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }

})();
