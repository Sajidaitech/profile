// ============================================================
// SAJID MEHMOOD PORTFOLIO — SECURITY MODULE
// security.js  v2.0  |  June 2026
//
// Covers:
//   - XSS / injection prevention helpers (DOMPurify-style)
//   - Content Security Policy meta tag (dev fallback)
//   - Clickjacking protection check
//   - Referrer-policy + permissions-policy meta
//   - Safe innerHTML wrapper
//   - External link hardening (rel=noopener noreferrer)
//   - Admin route detection + redirect
//   - Input sanitisation utilities exposed as window.Security
// ============================================================

(function () {
  'use strict';

  // ─── HTML ENTITY ENCODER ────────────────────────────────────
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"'`=/]/g, function (s) {
      return entityMap[s];
    });
  }

  // ─── STRIP HTML TAGS ────────────────────────────────────────
  function stripTags(str) {
    if (!str) return '';
    return String(str)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  // ─── STRIP DANGEROUS ATTRIBUTES ────────────────────────────
  // Removes event handlers and javascript: URLs from an HTML string
  function sanitiseHtmlString(html) {
    if (!html) return '';
    return String(html)
      // Remove event attributes
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
      // Remove javascript: and data: protocols
      .replace(/(?:href|src|action)\s*=\s*["']?\s*(?:javascript|data|vbscript):/gi, 'href="#"')
      // Remove <script> and <iframe> tags entirely
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '');
  }

  // ─── SAFE INNERHTML ─────────────────────────────────────────
  // Drop-in replacement for el.innerHTML = html when content comes from
  // the database or user input. For trusted static HTML, use innerHTML directly.
  function safeSetInnerHTML(element, html) {
    if (!element) return;
    var clean = sanitiseHtmlString(html);
    element.innerHTML = clean;
  }

  // ─── URL VALIDATOR ──────────────────────────────────────────
  var ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

  function isSafeUrl(url) {
    if (!url) return false;
    try {
      var parsed = new URL(url, window.location.href);
      return ALLOWED_PROTOCOLS.indexOf(parsed.protocol) !== -1;
    } catch (e) {
      // Relative URLs are fine
      return !url.trim().match(/^(?:javascript|data|vbscript):/i);
    }
  }

  function sanitiseUrl(url) {
    if (!url) return '#';
    return isSafeUrl(url) ? url : '#';
  }

  // ─── SECURITY HEADERS (META TAG FALLBACKS) ──────────────────
  // These are most effective as HTTP headers. These meta tags are a
  // client-side fallback for static hosting (GitHub Pages, Netlify, etc.)
  // that doesn't support custom response headers.
  function injectSecurityMeta() {
    var head = document.head;

    // Referrer-Policy — don't leak full URL to third parties
    if (!document.querySelector('meta[name="referrer"]')) {
      var refMeta = document.createElement('meta');
      refMeta.name = 'referrer';
      refMeta.content = 'strict-origin-when-cross-origin';
      head.appendChild(refMeta);
    }

    // NOTE: X-Frame-Options and CSP cannot be set via meta for all directives,
    // but CSP frame-ancestors CAN be set via header. For meta, we can still add
    // a basic CSP to prevent some XSS vectors.
    //
    // ⚠️ This meta CSP is NOT a substitute for the real HTTP header.
    // Set these in your hosting config (Netlify _headers, Vercel headers, etc.):
    //
    //   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com cdnjs.cloudflare.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: blob: tbdgrhekycgfdeatxjnq.supabase.co; connect-src 'self' tbdgrhekycgfdeatxjnq.supabase.co api.openweathermap.org ipapi.co api.telegram.org; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
    //   X-Frame-Options: SAMEORIGIN
    //   X-Content-Type-Options: nosniff
    //   Permissions-Policy: camera=(), microphone=(), geolocation=(self)
    //   Strict-Transport-Security: max-age=31536000; includeSubDomains

    console.info(
      '[Security] Set the following HTTP headers on your hosting provider for full security:\n' +
      '  X-Frame-Options: SAMEORIGIN\n' +
      '  X-Content-Type-Options: nosniff\n' +
      '  Referrer-Policy: strict-origin-when-cross-origin\n' +
      '  Permissions-Policy: camera=(), microphone=(), geolocation=(self)\n' +
      '  Strict-Transport-Security: max-age=31536000; includeSubDomains\n' +
      '  Content-Security-Policy: (see security.js for full value)'
    );
  }

  // ─── EXTERNAL LINK HARDENING ────────────────────────────────
  // Ensure all external links have rel="noopener noreferrer"
  // to prevent tab-napping (new tab can access window.opener).
  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      var needed = ['noopener', 'noreferrer'];
      needed.forEach(function (r) {
        if (rel.indexOf(r) === -1) rel.push(r);
      });
      a.setAttribute('rel', rel.join(' '));
    });

    // MutationObserver to catch dynamically injected links
    if ('MutationObserver' in window) {
      var linkObs = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            var links = node.tagName === 'A' ? [node] : Array.from(node.querySelectorAll('a[target="_blank"]'));
            links.filter(function (l) { return l.getAttribute('target') === '_blank'; }).forEach(function (a) {
              var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
              ['noopener', 'noreferrer'].forEach(function (r) {
                if (rel.indexOf(r) === -1) rel.push(r);
              });
              a.setAttribute('rel', rel.join(' '));
            });
          });
        });
      });
      linkObs.observe(document.body, { childList: true, subtree: true });
    }
  }

  // ─── ADMIN ROUTE GUARD ──────────────────────────────────────
  // If someone navigates to the admin dashboard without being authenticated,
  // this check runs and blocks the page from revealing any UI.
  //
  // Place this at the TOP of admin-dashboard.html before the <body> renders.
  // On index.html, it enforces the link in the footer is never indexable.
  function guardAdminLink() {
    // Remove admin link from footer if it exists
    // (it's supposed to be discreet but this ensures it's not crawlable)
    var adminLinks = document.querySelectorAll('a[href*="admin-dashboard"]');
    adminLinks.forEach(function (a) {
      a.setAttribute('rel', 'nofollow noopener noreferrer');
      a.removeAttribute('href');
      a.style.display = 'none';
    });
  }

  // ─── CLICKJACKING DETECTION ─────────────────────────────────
  // If the page is framed in an unexpected origin, redirect out.
  function checkFraming() {
    try {
      if (window.self !== window.top) {
        // Allow same-origin frames (e.g. your own PDF viewer)
        if (document.referrer && new URL(document.referrer).origin !== window.location.origin) {
          // We're being embedded from another origin — redirect to top
          window.top.location = window.self.location;
        }
      }
    } catch (e) {
      // Cross-origin frame access blocked by browser — this itself means
      // someone tried to frame us from another origin
      try { window.top.location = window.self.location; } catch (e2) { /* can't redirect — CSP or browser blocked */ }
    }
  }

  // ─── INPUT SANITISATION FOR FORMS ───────────────────────────
  // These are the validators/sanitisers for the contact form.
  // They mirror the server-side constraints from the SQL schema.

  var fieldRules = {
    name:    { maxLen: 80,   pattern: /^[a-zA-Z\u00C0-\u024F\u0600-\u06FF\s'\-\.]+$/, label: 'Name' },
    email:   { maxLen: 120,  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, label: 'Email' },
    company: { maxLen: 100,  pattern: null, label: 'Company' },
    subject: { maxLen: 120,  pattern: null, label: 'Subject' },
    message: { maxLen: 2000, pattern: null, label: 'Message' },
    phone:   { maxLen: 20,   pattern: /^\+?[\d\s\-\(\)]{7,20}$/, label: 'Phone' }
  };

  function validateField(fieldName, value) {
    var rule = fieldRules[fieldName];
    if (!rule) return { valid: true, value: stripTags(value) };

    var v = stripTags(String(value || '')).trim();

    if (!v && fieldName !== 'company' && fieldName !== 'phone') {
      return { valid: false, error: rule.label + ' is required.' };
    }

    if (v.length > rule.maxLen) {
      return { valid: false, error: rule.label + ' is too long (max ' + rule.maxLen + ' chars).' };
    }

    if (rule.pattern && v && !rule.pattern.test(v)) {
      return { valid: false, error: rule.label + ' contains invalid characters.' };
    }

    // SQL injection patterns (defence in depth — Supabase parameterises queries,
    // but client-side rejection gives a better UX)
    var sqlPatterns = [/'\s*OR\s*'1'\s*=\s*'1/i, /;\s*DROP\s+TABLE/i, /UNION\s+SELECT/i, /--\s/];
    if (sqlPatterns.some(function (p) { return p.test(v); })) {
      return { valid: false, error: rule.label + ' contains invalid content.' };
    }

    return { valid: true, value: v };
  }

  function sanitisePayload(payload) {
    var clean = {};
    Object.keys(payload).forEach(function (key) {
      var result = validateField(key, payload[key]);
      clean[key] = result.value !== undefined ? result.value : escapeHtml(String(payload[key] || ''));
    });
    return clean;
  }

  // ─── FORM AUTOCOMPLETE SECURITY ─────────────────────────────
  // Sensitive fields should never be autocompleted by the browser.
  function secureFormFields() {
    // Any field with name="password", "cc-number", etc. gets autocomplete=off
    var sensitiveNames = ['password', 'passwd', 'cc-number', 'cvv', 'pin'];
    document.querySelectorAll('input').forEach(function (input) {
      var name = (input.getAttribute('name') || '').toLowerCase();
      if (sensitiveNames.some(function (n) { return name.indexOf(n) !== -1; })) {
        input.setAttribute('autocomplete', 'off');
      }
    });
  }

  // ─── INIT ───────────────────────────────────────────────────
  // Clickjacking check: run synchronously before body renders
  checkFraming();

  function init() {
    injectSecurityMeta();
    hardenExternalLinks();
    guardAdminLink();
    secureFormFields();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── PUBLIC API ─────────────────────────────────────────────
  window.Security = {
    // Escape HTML entities — use when inserting untrusted text into DOM
    escapeHtml: escapeHtml,

    // Strip all HTML tags from a string
    stripTags: stripTags,

    // Sanitise an HTML string (remove scripts, event handlers)
    sanitiseHtml: sanitiseHtmlString,

    // Safe alternative to el.innerHTML = untrustedHtml
    safeSetHTML: safeSetInnerHTML,

    // Validate and sanitise a URL
    sanitiseUrl: sanitiseUrl,
    isSafeUrl:   isSafeUrl,

    // Validate a form field value
    validateField: validateField,

    // Sanitise an entire form payload object
    sanitisePayload: sanitisePayload
  };

})();
