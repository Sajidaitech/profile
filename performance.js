// ============================================================
// SAJID MEHMOOD PORTFOLIO — PERFORMANCE MODULE
// performance.js  v2.0  |  June 2026
//
// Techniques:
//   - Native lazy loading enforcement + IntersectionObserver polyfill
//   - Responsive image srcset helpers
//   - LCP image fast-path (eager + fetchpriority=high on critical images)
//   - CSS containment hints
//   - Font display fallback nudge
//   - Resource hints injection (preconnect / prefetch on idle)
//   - Deferred non-critical scripts
//   - Content-visibility: auto on below-fold sections
//   - will-change cleanup after animations
//   - requestIdleCallback polyfill + idle-time cleanup tasks
// ============================================================

(function () {
  'use strict';

  // ── rIC polyfill ────────────────────────────────────────────
  var rIC = window.requestIdleCallback || function (cb) { return setTimeout(function () { cb({ timeRemaining: function () { return 50; } }); }, 1); };

  // ── LAZY IMAGES ─────────────────────────────────────────────
  function initLazyImages() {
    // Set loading=lazy on all below-fold images that lack it
    // (Critical hero images already have loading="eager")
    var criticalSrcs = ['photo.jpg', 'logo.png'];

    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      var isCritical = criticalSrcs.some(function (c) { return src.indexOf(c) !== -1; });
      if (!isCritical) {
        img.setAttribute('loading', 'lazy');
      }
    });

    // Override loading="eager" on images that are not in the LCP viewport
    if ('IntersectionObserver' in window) {
      var viewH = window.innerHeight;
      document.querySelectorAll('img[loading="eager"]').forEach(function (img) {
        var rect = img.getBoundingClientRect();
        if (rect.top > viewH * 1.5) {
          img.setAttribute('loading', 'lazy');
        }
      });
    }

    // IntersectionObserver-based lazy loader for data-src images
    // (for any dynamically-injected images without native lazy)
    if ('IntersectionObserver' in window) {
      var lazyObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
          }
          img.classList.add('lazy-loaded');
          obs.unobserve(img);
        });
      }, { rootMargin: '200px 0px' });

      document.querySelectorAll('img[data-src], img[data-srcset]').forEach(function (img) {
        lazyObserver.observe(img);
      });
    }
  }

  // ── LCP OPTIMISATION ────────────────────────────────────────
  function optimiseLCP() {
    // Ensure hero photo and logo are treated as LCP candidates
    var lcpImages = document.querySelectorAll('.hero-portrait-img, img[fetchpriority="high"]');
    lcpImages.forEach(function (img) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
      img.decoding = 'sync'; // prioritise decode
    });

    // Add explicit width/height to images missing them (prevents layout shift = good CLS)
    document.querySelectorAll('img:not([width]):not([height])').forEach(function (img) {
      img.addEventListener('load', function () {
        if (!img.getAttribute('width') && img.naturalWidth) {
          img.setAttribute('width',  img.naturalWidth);
          img.setAttribute('height', img.naturalHeight);
        }
      }, { once: true });
    });
  }

  // ── CONTENT-VISIBILITY ──────────────────────────────────────
  // Apply content-visibility:auto to major below-fold sections.
  // This is the single highest-impact CSS CWV improvement for long pages.
  function applyContentVisibility() {
    // Exclude hero, nav, gate — they must render immediately
    var belowFoldSections = [
      '#why-hire', '#about', '#projects', '#experience',
      '#arsenal', '#education', '#achievements',
      '#certifications', '#fieldwork', '#references', '#contact'
    ];

    var style = document.createElement('style');
    style.id = 'perf-cv-css';
    // We set contain-intrinsic-size so the browser reserves scroll height
    style.textContent = belowFoldSections.map(function (sel) {
      return sel + '{content-visibility:auto;contain-intrinsic-size:0 600px;}';
    }).join('\n');
    document.head.appendChild(style);
  }

  // ── CSS CONTAINMENT ─────────────────────────────────────────
  function applyCSSContainment() {
    var style = document.createElement('style');
    style.id = 'perf-contain-css';
    style.textContent = [
      // Cards: layout + style containment avoids full-page reflow on hover
      '.project-card,.cert-card,.skill-card,.exp-tab-panel,.hie-card{contain:layout style;}',
      // Modals are fully self-contained
      '#pdfResumeModal,#hieImgModal{contain:strict;}',
      // Nav is fixed so it paints on its own compositor layer
      '.top-nav{will-change:transform;}',
      // FAB similarly
      '.fab-container{will-change:transform;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── WILL-CHANGE CLEANUP ─────────────────────────────────────
  // will-change is expensive if left on forever. Remove after first interaction.
  function cleanupWillChange() {
    var managed = [];
    document.querySelectorAll('[style*="will-change"]').forEach(function (el) {
      managed.push(el);
    });

    // After any scroll/resize event, remove will-change from elements
    // that have completed their animations
    function cleanup() {
      managed.forEach(function (el) {
        if (!el.classList.contains('animating')) {
          el.style.willChange = 'auto';
        }
      });
      managed = [];
      window.removeEventListener('scroll', cleanup);
      window.removeEventListener('resize', cleanup);
    }

    // Defer cleanup to after first meaningful interaction
    setTimeout(function () {
      window.addEventListener('scroll', cleanup, { passive: true, once: true });
    }, 3000);
  }

  // ── RESOURCE HINTS ──────────────────────────────────────────
  // Inject preconnect / dns-prefetch for third-party resources
  // that will be needed soon but aren't critical for first paint.
  function injectResourceHints() {
    var hints = [
      // Supabase — data fetches happen right after load
      { rel: 'preconnect',  href: 'https://tbdgrhekycgfdeatxjnq.supabase.co' },
      // Font Awesome CDN (icons deferred but needed soon)
      { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
    ];

    var head = document.head;
    hints.forEach(function (hint) {
      // Only add if not already present
      var exists = document.querySelector('link[rel="' + hint.rel + '"][href="' + hint.href + '"]');
      if (exists) return;
      var link = document.createElement('link');
      link.rel  = hint.rel;
      link.href = hint.href;
      if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
      head.appendChild(link);
    });
  }

  // ── DEFERRED SCRIPTS ────────────────────────────────────────
  // Any non-critical inline scripts can be scheduled via this helper.
  function scheduleIdle(fn, label) {
    rIC(function (deadline) {
      if (deadline.timeRemaining() > 5 || deadline.didTimeout) {
        try { fn(); } catch (e) { console.warn('[Perf] idle task failed (' + label + '):', e); }
      } else {
        setTimeout(function () { scheduleIdle(fn, label); }, 250);
      }
    }, { timeout: 3000 });
  }

  // ── FONT DISPLAY ────────────────────────────────────────────
  // Inject font-display:swap fallback for any @font-face that hasn't set it.
  // This prevents invisible text (FOIT) during font load.
  function enforceFontDisplaySwap() {
    if (!document.fonts || !document.fonts.forEach) return;
    // Can't modify loaded @font-face rules directly in a clean way,
    // but we can add a style that forces swap semantics via the CSS Font Loading API
    // by ensuring fonts load asynchronously (they already do via media=print trick).
    // This is informational — the index.html already uses display=swap in the Google Fonts URL.
  }

  // ── OBSERVER: TRACK LCP ─────────────────────────────────────
  function observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    try {
      var lcpObs = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        if (!entries.length) return;
        var lcp = entries[entries.length - 1];
        window._smLCP = lcp.startTime;
        // Log to console in dev; in prod this data can be sent to analytics
        if (lcp.startTime > 2500) {
          console.warn('[Perf] LCP is ' + Math.round(lcp.startTime) + 'ms — target < 2500ms');
        }
        lcpObs.disconnect();
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { /* PerformanceObserver not supported for LCP */ }
  }

  // ── OBSERVER: TRACK CLS ─────────────────────────────────────
  function observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    var clsScore = 0;
    try {
      var clsObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        window._smCLS = clsScore;
        if (clsScore > 0.1) {
          console.warn('[Perf] CLS score is ' + clsScore.toFixed(4) + ' — target < 0.1. Check images without explicit dimensions or dynamically injected content.');
        }
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
    } catch (e) { /* not supported */ }
  }

  // ── OBSERVER: TRACK FID / INP ────────────────────────────────
  function observeINP() {
    if (!('PerformanceObserver' in window)) return;
    try {
      var inpObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.duration > 200) {
            console.warn('[Perf] Long interaction (' + Math.round(entry.duration) + 'ms):', entry.name);
          }
        });
      });
      inpObs.observe({ type: 'event', buffered: true, durationThreshold: 100 });
    } catch (e) { /* not supported */ }
  }

  // ── IMAGE DECODE ASYNC ──────────────────────────────────────
  // Force async decoding on non-critical images so they don't block
  // the main thread during the first paint.
  function setAsyncDecoding() {
    document.querySelectorAll('img:not([loading="eager"])').forEach(function (img) {
      if (!img.getAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  }

  // ── REDUCE PAINT COMPLEXITY ─────────────────────────────────
  // Add GPU compositing hint to animated elements.
  function promoteAnimatedLayers() {
    var style = document.createElement('style');
    style.id = 'perf-compositing-css';
    style.textContent = [
      // Cinematic canvas: off main thread
      '#cinematicCanvas,#heroCanvas{transform:translateZ(0);backface-visibility:hidden;}',
      // AOS elements: hint the browser they'll animate
      '[data-aos]{will-change:opacity,transform;}',
      // Gallery spotlight / orbs
      '.gallery-spotlight,.amb-orb,.lg-light-leak{transform:translateZ(0);}',
      // Scroll progress bar
      '#scrollProgress{transform:translateZ(0);}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── MAIN INIT ───────────────────────────────────────────────
  function init() {
    // Critical (synchronous — before paint)
    optimiseLCP();
    injectResourceHints();
    promoteAnimatedLayers();

    // After DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
      onDOMReady();
    }

    // Observers can start immediately
    observeLCP();
    observeCLS();
    observeINP();
  }

  function onDOMReady() {
    initLazyImages();
    setAsyncDecoding();
    applyCSSContainment();

    // Slightly deferred — not needed for first paint
    setTimeout(function () {
      applyContentVisibility();
    }, 100);

    // Idle tasks — lowest priority
    scheduleIdle(cleanupWillChange, 'will-change-cleanup');
    scheduleIdle(enforceFontDisplaySwap, 'font-display');
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  window.PortfolioPerf = {
    // Re-run lazy image scan (call after dynamic content injection)
    refreshLazyImages: initLazyImages,
    // Get current CWV scores
    getMetrics: function () {
      return {
        lcp: window._smLCP || null,
        cls: window._smCLS || null
      };
    },
    // Schedule work during idle time
    scheduleIdle: scheduleIdle
  };

  init();

})();
