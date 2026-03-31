// ============================================================
// SAJID MEHMOOD · IT SYSTEMS ENGINEER
// script.js — Consolidated (gate + portfolio logic)
// ============================================================


// ============================================================
// SECTION 1 · GATE OVERLAY
// ============================================================

(function () {
  var TG_TOKEN   = '8716049751:AAGInSyDf0cwRJW95nc-9YlLc6dBTzrx6AU';
  var TG_CHAT_ID = '8235795754';

  document.body.style.overflow = 'hidden';

  var nameInput = document.getElementById('gVisitorName');
  if (nameInput) {
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') gateSubmit();
    });
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 400);
  });

  window.gateSubmit = function () {
    var input   = document.getElementById('gVisitorName');
    var name    = input ? input.value.trim() : '';
    var errorEl = document.getElementById('gErrorMsg');
    var btn     = document.getElementById('gSubmitBtn');

    if (!name) {
      if (errorEl) errorEl.classList.add('show');
      if (input) {
        input.focus();
        input.style.borderColor = '#e74c3c';
        setTimeout(function () {
          input.style.borderColor = '';
          if (errorEl) errorEl.classList.remove('show');
        }, 2500);
      }
      return;
    }

    if (errorEl) errorEl.classList.remove('show');
    if (btn) btn.classList.add('loading');

    var successName = document.getElementById('gSuccessName');
    var successEl   = document.getElementById('gSuccess');
    if (successName) successName.textContent = 'Welcome, ' + name + '!';
    if (successEl)   successEl.classList.add('show');

    var revealed = false;
    function revealPortfolio() {
      if (revealed) return;
      revealed = true;
      var overlay = document.getElementById('gateOverlay');
      if (overlay) overlay.classList.add('hidden');
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }
    setTimeout(revealPortfolio, 5000);

    sendTelegramNotification(name, revealPortfolio);
  };

  function sendTelegramNotification(name, callback) {
    var ua = navigator.userAgent;

    var device = '💻 Desktop';
    if      (/iPhone/i.test(ua))          device = '📱 iPhone';
    else if (/iPad/i.test(ua))            device = '📱 iPad';
    else if (/Android.*Mobile/i.test(ua)) device = '📱 Android Phone';
    else if (/Android/i.test(ua))         device = '📱 Android Tablet';

    var os = 'Unknown OS';
    if      (/Windows NT 10/i.test(ua))       os = 'Windows 10/11';
    else if (/Windows NT 6/i.test(ua))        os = 'Windows (older)';
    else if (/Mac OS X/i.test(ua))            os = 'macOS';
    else if (/iPhone OS ([\d_]+)/i.test(ua))  os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/i)[1].replace(/_/g, '.');
    else if (/Android ([\d.]+)/i.test(ua))    os = 'Android ' + ua.match(/Android ([\d.]+)/i)[1];
    else if (/Linux/i.test(ua))               os = 'Linux';

    var browser = 'Unknown';
    if      (/Edg\//i.test(ua))     browser = 'Microsoft Edge';
    else if (/OPR\//i.test(ua))     browser = 'Opera';
    else if (/Chrome\//i.test(ua))  browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua))  browser = 'Safari';

    var screenRes = window.screen.width + 'x' + window.screen.height;
    var lang      = navigator.language || 'Unknown';
    var referrer  = document.referrer  || 'Direct / Bookmark';
    var time      = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Qatar', weekday: 'short', year: 'numeric',
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    function esc(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function sendMsg(ip, city, country, isp) {
      // Determine device category based on screen width
      var screenWidth = window.screen.width;
      var deviceCategory = 'Desktop';
      if      (screenWidth < 480)  deviceCategory = 'Mobile';
      else if (screenWidth < 1024) deviceCategory = 'Tablet / Small Desktop';

      // Self-visit detection
      var isLocal     = referrer.includes('127.0.0.1') || referrer.includes('localhost');
      var statusEmoji = isLocal ? '🛠️' : '🎯';
      var statusTitle = isLocal ? 'Local Test' : 'New Visitor';

      var msg =
        statusEmoji + ' <b>' + statusTitle + ': ' + esc(name) + ' is viewing your Portfolio!</b>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📍 <b>' + esc(city) + ', ' + esc(country) + '</b>\n' +
        '🏢 <i>ISP: ' + esc(isp) + '</i>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '👤 <b>Visitor:</b> '      + esc(name)                               + '\n' +
        '🔗 <b>Source:</b> <code>' + esc(referrer)                           + '</code>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🖥️ <b>Device:</b> '       + esc(device)                             + '\n' +
        '⚙️ <b>OS:</b> '           + esc(os)                                 + '\n' +
        '🌐 <b>Browser:</b> '      + esc(browser)                            + '\n' +
        '📐 <b>Screen:</b> '       + esc(screenRes) + ' <i>(' + esc(deviceCategory) + ')</i>\n' +
        '🗣️ <b>Language:</b> '     + esc(lang)                               + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🕐 <b>Time (Qatar):</b> ' + esc(time)                               + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🛠️ <a href="https://ipinfo.io/' + ip + '">Logs</a> | ' +
        '📍 <a href="https://www.google.com/maps/search/' + ip + '">Map</a> | ' +
        '🔒 IP: <code>' + esc(ip) + '</code>';

      fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML' })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) {
          fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TG_CHAT_ID,
              text: (isLocal ? '[Local Test]' : '[New Visitor]') + ' ' + name + ' — ' + ip + ' — ' + city + ', ' + country + ' — ' + deviceCategory + ' — ' + time
            })
          }).catch(function () {});
        }
      })
      .catch(function () {})
      .finally(function () { callback(); });
    }

    fetch('https://api.ipify.org?format=json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var ip = d.ip || 'Unknown';
        fetch('https://ipapi.co/' + ip + '/json/')
          .then(function (r) { return r.json(); })
          .then(function (g) {
            if (g.error) throw new Error('ipapi error');
            sendMsg(ip, g.city || 'Unknown', g.country_name || 'Unknown', g.org || 'Unknown ISP');
          })
          .catch(function () {
            fetch('https://ip-api.com/json/' + ip + '?fields=status,city,country,isp')
              .then(function (r) { return r.json(); })
              .then(function (g) {
                sendMsg(ip, g.city || 'Unknown', g.country || 'Unknown', g.isp || 'Unknown ISP');
              })
              .catch(function () { sendMsg(ip, 'Unknown', 'Unknown', 'Unknown ISP'); });
          });
      })
      .catch(function () { sendMsg('Unknown', 'Unknown', 'Unknown', 'Unknown ISP'); });
  }
})();


// ============================================================
// SECTION 2 · PORTFOLIO INIT (DOMContentLoaded)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 50 });
  }
  initNav();
  initCursor();
  initFAB();
  initCounters();
  initRings();
  initFolderTabs();
  initTestimonialsSlider();
  initTouchPressStates();
  initSectionFadeIn();
  loadProjects();
  loadExperience();
  loadArsenal();
  loadLanguages();
  loadCertifications();
  initSkillBars();
  initScrollReveal();
  initMagneticButtons();
  initSoftParallax();
  initDynamicStaggerObserver();
  setTimeout(initStaggerFadeIn, 50);
  printSignature();
});


// ============================================================
// SECTION 3 · NAVIGATION
// ============================================================

function initNav() {
  var nav       = document.getElementById('topNav');
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('mobileDrawer');
  var navLinks  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function () {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
    var current = '';
    document.querySelectorAll('section[id]').forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
  }

  document.querySelectorAll('.mob-link').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('click', function (e) {
    if (drawer && drawer.classList.contains('open') &&
        !drawer.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 68;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH - 16, behavior: 'smooth' });
    });
  });

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
// SECTION 4 · CUSTOM CURSOR (desktop only)
// ============================================================

function initCursor() {
  var dot  = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.innerWidth < 1024) return;

  var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .project-card, .exp-card, .arsenal-category').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.style.width = '48px'; ring.style.height = '48px'; ring.style.opacity = '0.3'; });
    el.addEventListener('mouseleave', function () { ring.style.width = '28px'; ring.style.height = '28px'; ring.style.opacity = '0.6'; });
  });
}


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
    el.addEventListener('touchstart',  function () { el.classList.add('pressed'); }, { passive: true });
    el.addEventListener('touchend',    function () { setTimeout(function () { el.classList.remove('pressed'); }, 150); }, { passive: true });
    el.addEventListener('touchcancel', function () { el.classList.remove('pressed'); }, { passive: true });
  });
}


// ============================================================
// SECTION 7 · COUNTER ANIMATION
// ============================================================

function initCounters() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, +entry.target.getAttribute('data-count'));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { observer.observe(el); });
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
  document.querySelectorAll('.ftab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ftab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.folder-pane').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var pane = document.getElementById(tab.getAttribute('data-pane'));
      if (pane) pane.classList.add('active');
    });
  });
}


// ============================================================
// SECTION 10 · TESTIMONIALS SLIDER
// ============================================================

function initTestimonialsSlider() {
  var slides = document.querySelectorAll('.testimonial-slide');
  var dots   = document.querySelectorAll('.slider-dot');
  var prev   = document.getElementById('sliderPrev');
  var next   = document.getElementById('sliderNext');
  if (!slides.length) return;

  var current = 0, autoTimer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() { autoTimer = setInterval(function () { goTo(current + 1); }, 6000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  if (prev) prev.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
  if (next) next.addEventListener('click', function () { goTo(current + 1); resetAuto(); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () { goTo(+dot.getAttribute('data-index')); resetAuto(); });
  });

  var slider = document.getElementById('testimonialsSlider');
  var tx = 0, ty = 0;
  if (slider) {
    slider.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      var dx = tx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50 && Math.abs(ty - e.changedTouches[0].clientY) < 40) { goTo(dx > 0 ? current + 1 : current - 1); resetAuto(); }
    }, { passive: true });
  }

  startAuto();
}


// ============================================================
// SECTION 11 · SECTION FADE-IN ON SCROLL
// ============================================================

function initSectionFadeIn() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sections = document.querySelectorAll('.section');
  sections.forEach(function (sec) {
    if (sec.getBoundingClientRect().top > window.innerHeight) {
      sec.style.cssText = 'opacity:0;transform:translateY(24px);transition:opacity 0.65s ease,transform 0.65s cubic-bezier(0.4,0,0.2,1);';
    }
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(function (sec) { observer.observe(sec); });
}


// ============================================================
// SECTION 12 · SCROLL REVEAL (cards)
// ============================================================

function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') return;
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var els = document.querySelectorAll('.project-card, .exp-card, .ach-item, .lang-card');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.cssText = 'transition:opacity 0.5s ease,transform 0.5s ease;opacity:1;transform:none;';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  els.forEach(function (el) { el.style.opacity = '0'; observer.observe(el); });
  setTimeout(function () { els.forEach(function (el) { el.style.opacity = '1'; }); }, 2000);
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

  document.querySelectorAll('.stagger-child, .bento-item, .cert-card, .ach-item, .lang-item')
    .forEach(function (el) { observer.observe(el); });
}


// ============================================================
// SECTION 14 · SKILL BARS
// ============================================================

function initSkillBars() {
  var container = document.getElementById('arsenalBento');
  if (!container) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.sk-bar-fill').forEach(function (bar) {
        setTimeout(function () { bar.style.width = bar.getAttribute('data-width'); }, 200);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  observer.observe(container);
}


// ============================================================
// SECTION 15 · MAGNETIC BUTTONS (desktop)
// ============================================================

function initMagneticButtons() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.btn-gold, .btn-ghost, .nav-resume-btn').forEach(function (btn) {
    btn.classList.add('btn-magnetic');
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.28) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px) scale(1.04)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
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
// SECTION 17 · SKELETON LOADING (projects)
// ============================================================

function showProjectSkeleton() {
  var grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.insertAdjacentHTML('beforebegin',
    '<div class="projects-skeleton" id="projectsSkeleton">' +
    [1,2,3].map(function () {
      return '<div class="skeleton skeleton-card">' +
        '<div class="skeleton skeleton-line" style="height:18px;width:60%;margin-bottom:16px;"></div>' +
        '<div class="skeleton skeleton-line" style="height:12px;width:100%;margin-bottom:8px;"></div>' +
        '<div class="skeleton skeleton-line" style="height:12px;width:80%;margin-bottom:20px;"></div>' +
        '<div class="skeleton skeleton-line" style="height:12px;width:40%;"></div>' +
        '</div>';
    }).join('') +
    '</div>'
  );
}

function hideProjectSkeleton() {
  var skel = document.getElementById('projectsSkeleton');
  if (!skel) return;
  skel.style.transition = 'opacity 0.3s ease';
  skel.style.opacity    = '0';
  setTimeout(function () { skel.remove(); }, 300);
}


// ============================================================
// SECTION 18 · DYNAMIC STAGGER / SKELETON OBSERVER
// ============================================================

function initDynamicStaggerObserver() {
  var targets = ['projectsGrid','certsGrid','arsenalBento','langGrid']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var mo = new MutationObserver(function () {
    initStaggerFadeIn();
    var grid = document.getElementById('projectsGrid');
    if (grid && grid.children.length > 0) hideProjectSkeleton();
  });

  targets.forEach(function (t) { mo.observe(t, { childList: true }); });
}


// ============================================================
// SECTION 19 · DATA — PROJECTS
// ============================================================

var projectsData = [
  {
    icon: 'fa-plane-departure', sector: 'Aviation · Infrastructure',
    title: 'Hamad International Airport Expansion',
    challenge: 'Deliver a multi-phase IT infrastructure rollout for an operational international airport requiring 24/7 uptime. Zero margin for deployment errors during high-traffic windows.',
    solution:  'Led full-cycle device provisioning across two expansion phases. Deployed POS systems and hospitality networks, integrating retail hubs with core airport infrastructure. Implemented a new asset tracking protocol mid-project.',
    impact:    '100% infrastructure readiness maintained across both phases. Equipment loss reduced by 10% via the newly introduced asset tracking system.',
    tools:     ['PXE Booting', 'Cisco IOS', 'Asset Management', 'POS Systems', 'LAN/WAN', 'Windows Imaging'],
    
  },
  {
    icon: 'fa-hospital', sector: 'Healthcare · EMR Systems',
    title: 'Military Medical City Hospital',
    challenge: 'Manage 500+ technical support tickets across three separate hospital sites simultaneously, while keeping life-critical EMR systems online for 300+ medical staff without any downtime.',
    solution:  'Executed a high-velocity system reimaging and OS deployment strategy. Prioritized L2 troubleshooting for critical hardware failures and provided dedicated EMR support.',
    impact:    '95% SLA compliance achieved consistently. Zero EMR downtime recorded. 300+ staff onboarded across MMCH, KMC, and TVH.',
    tools:     ['EMR Systems', 'OS Reimaging', 'Active Directory', 'L2 Troubleshooting', 'SCCM', 'Hardware Repair'],
    
  },
  {
    icon: 'fa-passport', sector: 'Government · Compliance',
    title: 'Al Tawkel Immigration Center',
    challenge: 'Transition a government-facing immigration center to a modernized enterprise IT infrastructure while managing sensitive digital assets and complex government liaison workflows.',
    solution:  'Overhauled LAN network and server configurations to support secure visa processing. Acted as technical liaison with government authorities to resolve credential recovery cases.',
    impact:    'Digital asset registry created from scratch, eliminating equipment discrepancies. System security hardened. Visa processing workflows streamlined.',
    tools:     ['LAN Configuration', 'Server Admin', 'Office 365', 'Security Compliance', 'Asset Registry', 'Digital Credentials'],
    
  }
];

function loadProjects() {
  var grid = document.getElementById('projectsGrid');
  if (!grid) return;
  projectsData.forEach(function (p, i) {
    var card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', i * 100);
    card.innerHTML =
      '<div class="pc-header"><div class="pc-icon"><i class="fas ' + p.icon + '"></i></div><span class="pc-sector-tag">' + p.sector + '</span></div>' +
      '<h3 class="pc-title">' + p.title + '</h3>' +
      '<div class="pc-challenge-solution">' +
        '<div class="pc-block"><span class="pc-block-label challenge"><i class="fas fa-triangle-exclamation"></i> The Challenge</span><p class="pc-block-text">' + p.challenge + '</p></div>' +
        '<div class="pc-block"><span class="pc-block-label solution"><i class="fas fa-circle-check"></i> The Solution</span><p class="pc-block-text">' + p.solution + '</p></div>' +
      '</div>' +
      '<div class="pc-impact"><strong><i class="fas fa-chart-line"></i> Impact</strong>' + p.impact + '</div>' +
      '<div class="pc-tools">' + p.tools.map(function (t) { return '<span class="pc-tool-badge">' + t + '</span>'; }).join('') + '</div>' +
      (p.letter ? '<a href="' + p.letter.url + '" target="_blank" rel="noopener noreferrer" class="pc-link"><i class="fas fa-file-contract"></i> ' + p.letter.text + '<i class="fas fa-arrow-up-right-from-square" style="margin-left:auto;"></i></a>' : '');
    grid.appendChild(card);
  });
}


// ============================================================
// SECTION 20 · DATA — EXPERIENCE
// ============================================================

var experienceData = [
  {
    date: 'Apr 2025 – Aug 2025', title: 'IT Executive & Business Development',
    type: 'Internship', company: 'Al Tawkel Immigration Center · Dubai, UAE',
    responsibilities: [
      '<b>Enterprise L2 Support:</b> Hardware repairs, system reimaging, network troubleshooting, and Office 365 configurations.',
      '<b>Infrastructure Overhaul:</b> Installed and configured servers, LAN networks, and multi-function peripherals.',
      '<b>Digital Asset Registry:</b> Architected a comprehensive digital IT asset catalogue, eliminating lifecycle discrepancies.',
      '<b>Government Liaison:</b> Coordinated with authorities on credential recovery, overstay fines, and sensitive documentation.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }]
  },
  {
    date: 'Nov 2023 – Feb 2024', title: 'IT Support Engineer',
    type: 'Project Deployment', company: 'Military Medical City Hospital (MMCH) · Al-Rayyan, Qatar',
    stats: [
      { icon: 'fa-hospital',   value: '3',    label: 'Hospital Sites' },
      { icon: 'fa-ticket',     value: '500+', label: 'Tickets Managed' },
      { icon: 'fa-user-md',    value: '300+', label: 'Staff Supported' },
      { icon: 'fa-gauge-high', value: '95%',  label: 'SLA Compliance' }
    ],
    projects: [
      { icon: 'fa-hospital-alt', label: 'MMCH — Military Medical City', color: '#0f6cbf', gradient: 'linear-gradient(135deg,#0f6cbf,#1a8fe8)', detail: 'Main site · Al-Rayyan · Primary hub' },
      { icon: 'fa-flag',         label: 'KMC — Korean Medical Center',  color: '#c0392b', gradient: 'linear-gradient(135deg,#c0392b,#e74c3c)', detail: 'Lusail Boulevard · New deployment' },
      { icon: 'fa-eye',          label: 'TVH — The View Hospital',      color: '#6c3483', gradient: 'linear-gradient(135deg,#6c3483,#9b59b6)', detail: 'Katara · New system rollout' }
    ],
    responsibilities: [
      '<b>High-Volume Incident Management:</b> Managed 500+ support tickets, maintaining 95% SLA compliance.',
      '<b>EMR Application Support:</b> Zero downtime on Electronic Medical Records systems.',
      '<b>Multi-Site OS Deployment:</b> System reimaging and application configuration for 300+ staff.',
      '<b>L1 & L2 Escalation:</b> Password resets, software installs, OS crashes, and hardware failures.',
      '<b>Preventive Maintenance:</b> Scheduled patching aligned with hospital IT governance.',
      '<b>Asset Inventory:</b> Accurate digital asset records across all three facilities.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }]
  },
  {
    date: 'Feb 2022 – Nov 2023', title: 'IT Support Engineer',
    type: 'Full-Time', company: 'Star Link – Power International Holding · Doha, Qatar',
    projects: [
      { icon: 'fa-plane',      label: 'HIA Airport Expansion',      color: '#1a6fbf', gradient: 'linear-gradient(135deg,#1a6fbf,#2196f3)', detail: 'Phase 1: Feb–Oct 2022 · Phase 2: Apr–Nov 2023' },
      { icon: 'fa-utensils',   label: 'Aura Group — POS Deployment', color: '#b07d2e', gradient: 'linear-gradient(135deg,#b07d2e,#f0a500)', detail: 'Al Maha Island restaurants & cafés' },
      { icon: 'fa-building',   label: 'UCC Saudi Arabia',            color: '#1a7a4a', gradient: 'linear-gradient(135deg,#1a7a4a,#27ae60)', detail: '25 machines provisioned & deployed' },
      { icon: 'fa-heartbeat',  label: 'Elegancia Health Care',       color: '#7b2fbf', gradient: 'linear-gradient(135deg,#7b2fbf,#a855f7)', detail: 'Cross-subsidiary onsite IT support' },
      { icon: 'fa-road',       label: 'InfraRoad Trading',           color: '#c0551a', gradient: 'linear-gradient(135deg,#c0551a,#e8793a)', detail: 'On-site infrastructure services' }
    ],
    responsibilities: [
      '<b>Executive-Level Support:</b> Dedicated technical support for CEOs, Executives, and Directors at PIH Head Office.',
      '<b>HIA Expansion Lead:</b> Led IT operations for two phases of the Hamad International Airport Expansion.',
      '<b>POS Deployment — Aura Group:</b> Configured and deployed POS systems across Al Maha Island venues.',
      '<b>UCC Saudi Arabia:</b> Provisioned and deployed 25 workstations against strict handover deadlines.',
      '<b>Cross-Subsidiary Coverage:</b> Delivered onsite IT for Elegancia Health Care, UCC Holding, and ASSETS Group.',
      '<b>Asset Optimisation:</b> Tracking protocols reduced equipment loss by 10% across group companies.',
      '<b>Vendor & Telecom Coordination:</b> Managed VoIP and connectivity with external vendors.'
    ],
    letters: [
      { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
      { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
    ]
  },
  {
    date: 'May 2021 – Feb 2022', title: 'Customer Service Agent',
    type: 'Full-Time', company: 'STARLINK (Ooredoo International) · Qatar',
    responsibilities: [
      '<b>Technical Inbound Support:</b> High-volume inbound/outbound call handling across Ooredoo product lines.',
      '<b>First-Call Resolution:</b> Consistently above-target first-call resolution rates.',
      '<b>Technical Assistance:</b> Network and technical issue support across product lines.',
      '<b>CRM Record Keeping:</b> Accurate call records maintained in internal database systems.',
      '<b>Continuous Development:</b> Regular training on product knowledge and performance metrics.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1F1dRuB9Bp3aLm0M2A0RZ_xmzFoYaElKp/view?usp=sharing' }]
  }
];

function loadExperience() {
  var timeline = document.getElementById('expTimeline');
  if (!timeline) return;

  experienceData.forEach(function (exp, i) {
    var item = document.createElement('div');
    item.className = 'exp-item';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', i * 80);

    var statsHTML = exp.stats && exp.stats.length
      ? '<div class="exp-stats-strip">' + exp.stats.map(function (s, si) {
          return '<div class="exp-stat-chip" style="animation-delay:' + (si*80) + 'ms"><div class="esc-icon"><i class="fas ' + s.icon + '"></i></div><div class="esc-body"><span class="esc-value">' + s.value + '</span><span class="esc-label">' + s.label + '</span></div></div>';
        }).join('') + '</div>' : '';

    var projectsHTML = exp.projects && exp.projects.length
      ? '<div class="exp-projects-row">' + exp.projects.map(function (p, pi) {
          return '<div class="exp-project-box" style="--proj-color:' + p.color + ';background:' + (p.gradient||p.color) + ';animation-delay:' + (pi*80) + 'ms"><div class="epb-glow"></div><div class="epb-icon"><i class="fas ' + p.icon + '"></i></div><div class="epb-info"><span class="epb-label">' + p.label + '</span><span class="epb-detail">' + p.detail + '</span></div><div class="epb-shine"></div></div>';
        }).join('') + '</div>' : '';

    var lettersHTML = (exp.letters || []).map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer" class="exp-btn"><i class="fas fa-file-contract"></i>' + l.text + '</a>';
    }).join('');

    item.innerHTML =
      '<div class="exp-card">' +
        '<div class="exp-header">' +
          '<div class="exp-title-row"><h3 class="exp-title">' + exp.title + '</h3>' + (exp.type ? '<span class="exp-type-badge">' + exp.type + '</span>' : '') + '</div>' +
          '<div class="exp-meta"><span class="exp-date"><i class="fas fa-calendar-alt"></i> <b>' + exp.date + '</b></span><span class="exp-company-name">' + exp.company + '</span></div>' +
        '</div>' +
        statsHTML + projectsHTML +
        '<ul class="exp-list">' + exp.responsibilities.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>' +
        '<div class="exp-actions">' + lettersHTML + '</div>' +
      '</div>';

    timeline.appendChild(item);
  });
}


// ============================================================
// SECTION 21 · DATA — TECHNICAL ARSENAL
// ============================================================

var arsenalData = [
  {
    id: 'infrastructure', icon: 'fa-server', title: 'Infrastructure', subtitle: 'Core Systems · Deployment · Lifecycle',
    color: '#C5A059', span: false,
    tools: [
      { icon: 'fa-windows',      name: 'Windows 10 / 11',     color: '#0078D7' },
      { icon: 'fa-apple',        name: 'macOS',               color: '#888' },
      { icon: 'fa-compact-disc', name: 'OS Reimaging',        color: '#C5A059' },
      { icon: 'fa-tools',        name: 'Hardware Repair',     color: '#E07B39' },
      { icon: 'fa-database',     name: 'Asset Management',    color: '#27AE60' },
      { icon: 'fa-desktop',      name: 'Device Provisioning', color: '#3B82F6' }
    ]
  },
  {
    id: 'networking', icon: 'fa-network-wired', title: 'Networking', subtitle: 'CCNA · LAN/WAN · Cisco IOS',
    color: '#3B82F6', span: false,
    tools: [
      { icon: 'fa-circle-nodes',             name: 'Cisco IOS',         color: '#1D4ED8' },
      { icon: 'fa-wifi',                     name: 'WLAN Config',       color: '#06B6D4' },
      { icon: 'fa-arrows-split-up-and-left', name: 'TCP/IP / OSPF',     color: '#3B82F6' },
      { icon: 'fa-phone-volume',             name: 'VoIP',              color: '#8B5CF6' },
      { icon: 'fa-shield-halved',            name: 'Firewall / ACL',    color: '#EF4444' },
      { icon: 'fa-diagram-project',          name: 'VLAN Segmentation', color: '#F59E0B' }
    ]
  },
  {
    id: 'productivity', icon: 'fa-cloud', title: 'Cloud & Productivity', subtitle: 'Microsoft 365 · SharePoint · Azure',
    color: '#06B6D4', span: false,
    tools: [
      { icon: 'fa-envelope',    name: 'Office 365',       color: '#D93F00' },
      { icon: 'fa-share-nodes', name: 'SharePoint',       color: '#038387' },
      { icon: 'fa-users-gear',  name: 'Active Directory', color: '#0078D7' },
      { icon: 'fa-comments',    name: 'Microsoft Teams',  color: '#6264A7' },
      { icon: 'fa-cloud',       name: 'Azure (AZ-900)',   color: '#0072C6' }
    ]
  },
  {
    id: 'security', icon: 'fa-shield-halved', title: 'Security & Compliance', subtitle: 'Governance · Patching · Hardening',
    color: '#EF4444', span: false,
    tools: [
      { icon: 'fa-lock',            name: 'Security Patching',    color: '#EF4444' },
      { icon: 'fa-user-lock',       name: 'Access Control',       color: '#F59E0B' },
      { icon: 'fa-clipboard-check', name: 'IT Governance',        color: '#27AE60' },
      { icon: 'fa-bug',             name: 'Vulnerability Triage', color: '#EC4899' }
    ]
  },
  {
    id: 'specialty', icon: 'fa-stethoscope', title: 'Specialist Platforms', subtitle: 'EMR · POS · ERP · Immigration Systems',
    color: '#8B5CF6', span: true,
    tools: [
      { icon: 'fa-heart-pulse',   name: 'EMR Systems',         color: '#EC4899' },
      { icon: 'fa-cash-register', name: 'POS Systems',         color: '#F59E0B' },
      { icon: 'fa-cubes',         name: 'Odoo ERP',            color: '#714B67' },
      { icon: 'fa-passport',      name: 'Immigration Systems', color: '#3B82F6' },
      { icon: 'fa-terminal',      name: 'PowerShell',          color: '#2563EB' },
      { icon: 'fa-table',         name: 'SQL Basics',          color: '#F97316' }
    ]
  }
];

function loadArsenal() {
  var bento = document.getElementById('arsenalBento');
  if (!bento) return;
  arsenalData.forEach(function (cat, i) {
    var card = document.createElement('div');
    card.className = 'arsenal-category' + (cat.span ? ' span-2' : '');
    card.style.setProperty('--cat-color', cat.color);
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', i * 80);
    card.innerHTML =
      '<div class="ac-head"><div class="ac-icon"><i class="fas ' + cat.icon + '"></i></div><div><div class="ac-title">' + cat.title + '</div><div class="ac-subtitle">' + cat.subtitle + '</div></div></div>' +
      '<div class="ac-tools">' + cat.tools.map(function (t) {
        return '<span class="tool-chip" style="--tool-color:' + t.color + '"><i class="fas ' + t.icon + '"></i>' + t.name + '</span>';
      }).join('') + '</div>';
    bento.appendChild(card);
  });
}


// ============================================================
// SECTION 22 · DATA — LANGUAGES
// ============================================================

var languages = [
  { name: 'English',      level: 'Professional' },
  { name: 'Urdu / Hindi', level: 'Native' },
  { name: 'Pashto',       level: 'Native' }
];

function loadLanguages() {
  var grid = document.getElementById('langGrid');
  if (!grid) return;
  languages.forEach(function (l) {
    var card = document.createElement('div');
    card.className = 'lang-card';
    card.innerHTML = '<span class="lang-name">' + l.name + '</span><span class="lang-level">' + l.level + '</span>';
    grid.appendChild(card);
  });
}


// ============================================================
// SECTION 23 · DATA — CERTIFICATIONS
// ============================================================

var certData = [
  {
    icon: 'fa-graduation-cap', title: 'Odoo ERP Training',
    desc: 'Workshop covering business processes, product, vendor, and customer management within enterprise ERP environments.',
    url: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
  },
  {
    icon: 'fa-trophy', title: 'Aptech ACCP Graduation',
    desc: 'Advanced Diploma in Software Engineering — comprehensive applied computing programme.',
    url: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
  },
  {
    icon: 'fa-hands-helping', title: 'MDX Career Fair',
    desc: 'Certificate of appreciation for volunteering at the Middlesex University Dubai Career Fair.',
    url: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
  },
  {
    icon: 'fa-award', title: 'Safety Award — HIA',
    desc: 'Recognition for exemplary safety practices during the Hamad International Airport Expansion Project.',
    url: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=sharing'
  }
];

function loadCertifications() {
  var grid = document.getElementById('certsGrid');
  if (!grid) return;
  certData.forEach(function (cert, i) {
    var frame = document.createElement('div');
    frame.className = 'cert-card';
    frame.setAttribute('data-aos', 'fade-up');
    frame.setAttribute('data-aos-delay', i * 80);
    frame.innerHTML =
      '<div class="cert-card-inner">' +
        '<div class="cc-icon"><i class="fas ' + cert.icon + '"></i></div>' +
        '<div class="cc-title">' + cert.title + '</div>' +
        '<div class="cc-desc">' + cert.desc + '</div>' +
        (cert.url ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm"><i class="fas fa-eye"></i> View Certificate</a>' : '') +
      '</div>';
    grid.appendChild(frame);
  });
}


// ============================================================
// SECTION 24 · CONSOLE SIGNATURE
// ============================================================

function printSignature() {
  console.log(
    '%c⚜  SAJID MEHMOOD · IT SYSTEMS ENGINEER',
    'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
  );
  console.log('%cCCNA Certified · Enterprise Infrastructure · WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
}
