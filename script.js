// ============================================================
// SAJID MEHMOOD · IT SYSTEMS ENGINEER PORTFOLIO
// script.js — Enhanced with iOS/Mobile fixes & touch states
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 50 });
    }

    initNav();
    initDarkMode();
    initCursor();
    initFAB();
    initCounters();
    initRings();
    initFolderTabs();
    initTestimonialsSlider();
    initTouchPressStates();   // iOS "pressed" feedback
    initSectionFadeIn();       // Smooth section reveal
    loadProjects();
    loadExperience();
    loadArsenal();
    loadLanguages();
    loadCertifications();
    initSkillBars();
    initScrollReveal();
    printSignature();
});

// ════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════
function initNav() {
    const nav       = document.getElementById('topNav');
    const hamburger = document.getElementById('hamburger');
    const drawer    = document.getElementById('mobileDrawer');
    const navLinks  = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (!nav) return;
        nav.classList.toggle('scrolled', window.scrollY > 60);

        let current = '';
        document.querySelectorAll('section[id]').forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }, { passive: true });

    function openDrawer() {
        hamburger.classList.add('open');
        drawer.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        // Prevent body scroll on iOS while drawer is open
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger?.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    document.querySelectorAll('.mob-link').forEach(link => {
        link.addEventListener('click', () => closeDrawer());
    });

    document.addEventListener('click', (e) => {
        if (
            drawer?.classList.contains('open') &&
            !drawer.contains(e.target) &&
            !hamburger?.contains(e.target)
        ) {
            closeDrawer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    // Smooth scroll with iOS-safe offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navH = nav ? nav.offsetHeight : 68;
            const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });
}

// ════════════════════════════════════════
// DARK / LIGHT MODE
// ════════════════════════════════════════
function initDarkMode() {
    const body    = document.body;
    const KEY     = 'sm-theme';
    const toggles = [
        document.getElementById('darkToggle'),
        document.getElementById('darkToggleMob')
    ];

    function applyTheme(dark) {
        body.classList.toggle('dark-mode', dark);
        toggles.forEach(btn => {
            if (!btn) return;
            const icon  = btn.querySelector('.toggle-icon');
            const label = btn.querySelector('.toggle-label');
            if (icon)  icon.textContent  = dark ? '☀️' : '🌙';
            if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';
        });
    }

    const saved = localStorage.getItem(KEY);
    applyTheme(saved !== null ? saved === '1' : true);

    toggles.forEach(btn => {
        btn?.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-mode');
            applyTheme(isDark);
            localStorage.setItem(KEY, isDark ? '1' : '0');
        });
    });
}

// ════════════════════════════════════════
// CUSTOM CURSOR (desktop only)
// ════════════════════════════════════════
function initCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || window.innerWidth < 1024) return;

    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    (function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .project-card, .exp-card, .arsenal-category').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width   = '48px';
            ring.style.height  = '48px';
            ring.style.opacity = '0.3';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width   = '28px';
            ring.style.height  = '28px';
            ring.style.opacity = '0.6';
        });
    });
}

// ════════════════════════════════════════
// TOUCH PRESSED STATES (iOS feedback)
// Adds a .pressed class on touchstart, removes on touchend/cancel
// ════════════════════════════════════════
function initTouchPressStates() {
    const selectors = [
        '.btn', '.fab-option', '.fab-main', '.mob-link',
        '.contact-item', '.social-btn', '.exp-btn', '.nav-resume-btn',
        '.slider-btn', '.slider-dot', '.ftab', '.pc-link',
        '.contact-item-whatsapp', '.social-btn-whatsapp'
    ];

    const interactives = document.querySelectorAll(selectors.join(', '));

    interactives.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('pressed');
        }, { passive: true });

        el.addEventListener('touchend', () => {
            setTimeout(() => el.classList.remove('pressed'), 150);
        }, { passive: true });

        el.addEventListener('touchcancel', () => {
            el.classList.remove('pressed');
        }, { passive: true });
    });
}

// ════════════════════════════════════════
// SECTION SMOOTH FADE-IN ON SCROLL
// ════════════════════════════════════════
function initSectionFadeIn() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sections = document.querySelectorAll('.section');

    // Set initial state only for sections not yet visible
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Don't hide sections already in viewport on load
        if (rect.top > window.innerHeight) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(24px)';
            section.style.transition = 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.4,0,0.2,1)';
        }
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(section => observer.observe(section));
}

// ════════════════════════════════════════
// FLOATING ACTION BUTTON
// ════════════════════════════════════════
function initFAB() {
    const container = document.getElementById('fabContainer');
    const mainBtn   = document.getElementById('fabMain');
    if (!mainBtn || !container) return;

    function closeFAB() {
        container.classList.remove('open');
        mainBtn.classList.remove('open');
    }

    mainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.toggle('open');
        mainBtn.classList.toggle('open');
    });

    document.querySelector('.fab-option-contact')?.addEventListener('click', closeFAB);

    document.addEventListener('click', e => {
        if (!container.contains(e.target)) closeFAB();
    });

    // Scroll show/hide with iOS-safe passive listener
    Object.assign(container.style, {
        opacity: '0',
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease'
    });

    window.addEventListener('scroll', () => {
        const visible = window.scrollY > 200;
        container.style.opacity       = visible ? '1' : '0';
        container.style.pointerEvents = visible ? 'auto' : 'none';
    }, { passive: true });
}

// ════════════════════════════════════════
// COUNTER ANIMATION
// ════════════════════════════════════════
function initCounters() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el  = entry.target;
            const end = +el.getAttribute('data-count');
            animateCount(el, end);
            observer.unobserve(el);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

function animateCount(el, target) {
    const duration = 1600;
    const start    = performance.now();
    const step = now => {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.ceil(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    };
    requestAnimationFrame(step);
}

// ════════════════════════════════════════
// SVG RING ANIMATIONS
// ════════════════════════════════════════
function initRings() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const ring = entry.target;
            const pct  = parseInt(ring.getAttribute('data-percent'));
            const circ = 2 * Math.PI * 50;
            setTimeout(() => {
                ring.style.strokeDashoffset = circ - (pct / 100) * circ;
            }, 350);
            observer.unobserve(ring);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.ring-fg').forEach(r => observer.observe(r));
}

// ════════════════════════════════════════
// EDUCATION FOLDER TABS
// ════════════════════════════════════════
function initFolderTabs() {
    document.querySelectorAll('.ftab').forEach(tab => {
        tab.addEventListener('click', () => {
            const paneId = tab.getAttribute('data-pane');
            document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.folder-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(paneId)?.classList.add('active');
        });
    });
}

// ════════════════════════════════════════
// TESTIMONIALS SLIDER
// ════════════════════════════════════════
function initTestimonialsSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots   = document.querySelectorAll('.slider-dot');
    const prev   = document.getElementById('sliderPrev');
    const next   = document.getElementById('sliderNext');
    if (!slides.length) return;

    let current   = 0;
    let autoTimer = null;

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current]?.classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current]?.classList.add('active');
    }

    function startAuto() {
        autoTimer = setInterval(() => goTo(current + 1), 6000);
    }

    function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
    }

    prev?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    next?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goTo(+dot.getAttribute('data-index'));
            resetAuto();
        });
    });

    // Touch / swipe support (passive for iOS performance)
    let touchStartX = 0;
    let touchStartY = 0;
    const slider = document.getElementById('testimonialsSlider');

    slider?.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    slider?.addEventListener('touchend', e => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
        // Only trigger if horizontal swipe (not vertical scroll)
        if (Math.abs(dx) > 50 && dy < 40) {
            goTo(dx > 0 ? current + 1 : current - 1);
            resetAuto();
        }
    }, { passive: true });

    startAuto();
}

// ════════════════════════════════════════
// SKILL BARS
// ════════════════════════════════════════
function initSkillBars() {
    const container = document.getElementById('arsenalBento');
    if (!container) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.sk-bar-fill').forEach(bar => {
                setTimeout(() => { bar.style.width = bar.getAttribute('data-width'); }, 200);
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    observer.observe(container);
}

// ════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════
function initScrollReveal() {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = document.querySelectorAll('.project-card, .exp-card, .ach-item, .lang-card');

    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = '';
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08 });

    elements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    setTimeout(() => {
        elements.forEach(el => { el.style.opacity = '1'; });
    }, 2000);
}

// ════════════════════════════════════════
// DATA — PROJECTS
// ════════════════════════════════════════
const projectsData = [
    {
        icon:      'fa-plane-departure',
        sector:    'Aviation · Infrastructure',
        title:     'Hamad International Airport Expansion',
        challenge: 'Deliver a multi-phase IT infrastructure rollout for an operational international airport requiring 24/7 uptime. Zero margin for deployment errors during high-traffic windows.',
        solution:  'Led full-cycle device provisioning across two expansion phases. Deployed POS systems and hospitality networks, integrating retail hubs with core airport infrastructure. Implemented a new asset tracking protocol mid-project.',
        impact:    '100% infrastructure readiness maintained across both phases. Equipment loss reduced by 10% via the newly introduced asset tracking system.',
        tools:     ['PXE Booting', 'Cisco IOS', 'Asset Management', 'POS Systems', 'LAN/WAN', 'Windows Imaging'],
        letter:    { text: 'View Project Letter', url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
    },
    {
        icon:      'fa-hospital',
        sector:    'Healthcare · EMR Systems',
        title:     'Military Medical City Hospital',
        challenge: 'Manage 500+ technical support tickets across three separate hospital sites simultaneously, while keeping life-critical EMR systems online for 300+ medical staff without any downtime.',
        solution:  'Executed a high-velocity system reimaging and OS deployment strategy. Prioritized L2 troubleshooting for critical hardware failures and provided dedicated EMR support, bridging standard IT with specialized medical software.',
        impact:    '95% SLA compliance achieved consistently. Zero EMR downtime recorded across the full engagement. 300+ staff onboarded across MMCH, KMC, and TVH.',
        tools:     ['EMR Systems', 'OS Reimaging', 'Active Directory', 'L2 Troubleshooting', 'SCCM', 'Hardware Repair'],
        letter:    { text: 'View Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }
    },
    {
        icon:      'fa-passport',
        sector:    'Government · Compliance',
        title:     'Al Tawkel Immigration Center',
        challenge: 'Transition a government-facing immigration center to a modernized enterprise IT infrastructure while managing sensitive digital assets and complex government liaison workflows.',
        solution:  'Overhauled LAN network and server configurations to support secure visa processing. Acted as technical liaison with government authorities to resolve credential recovery cases and sensitive documentation workflows.',
        impact:    'Digital asset registry created from scratch, eliminating equipment discrepancies. System security hardened. Visa processing workflows streamlined through infrastructure modernization.',
        tools:     ['LAN Configuration', 'Server Admin', 'Office 365', 'Security Compliance', 'Asset Registry', 'Digital Credentials'],
        letter:    { text: 'View Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }
    }
];

function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    projectsData.forEach((proj, i) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', i * 100);

        const toolsHTML = proj.tools.map(t => `<span class="pc-tool-badge">${t}</span>`).join('');

        card.innerHTML = `
            <div class="pc-header">
                <div class="pc-icon"><i class="fas ${proj.icon}"></i></div>
                <span class="pc-sector-tag">${proj.sector}</span>
            </div>
            <h3 class="pc-title">${proj.title}</h3>
            <div class="pc-challenge-solution">
                <div class="pc-block">
                    <span class="pc-block-label challenge">
                        <i class="fas fa-triangle-exclamation"></i> The Challenge
                    </span>
                    <p class="pc-block-text">${proj.challenge}</p>
                </div>
                <div class="pc-block">
                    <span class="pc-block-label solution">
                        <i class="fas fa-circle-check"></i> The Solution
                    </span>
                    <p class="pc-block-text">${proj.solution}</p>
                </div>
            </div>
            <div class="pc-impact">
                <strong><i class="fas fa-chart-line"></i> Impact</strong>
                ${proj.impact}
            </div>
            <div class="pc-tools">${toolsHTML}</div>
            ${proj.letter ? `
            <a href="${proj.letter.url}" target="_blank" rel="noopener noreferrer" class="pc-link">
                <i class="fas fa-file-contract"></i> ${proj.letter.text}
                <i class="fas fa-arrow-up-right-from-square" style="margin-left:auto;"></i>
            </a>` : ''}
        `;

        grid.appendChild(card);
    });
}

// ════════════════════════════════════════
// DATA — EXPERIENCE
// ════════════════════════════════════════
const experienceData = [
    {
        date:    'Apr 2025 – Aug 2025',
        title:   'IT Executive & Business Development',
        type:    'Internship',
        company: 'Al Tawkel Immigration Center · Dubai, UAE',
        responsibilities: [
            '<b>Enterprise L2 Support:</b> Delivered Level 2 technical support — hardware repairs, system reimaging, network troubleshooting, and Office 365 configurations across all staff.',
            '<b>Infrastructure Overhaul:</b> Installed and configured enterprise IT infrastructure including servers, LAN networks, and multi-function peripherals.',
            '<b>Digital Asset Registry:</b> Architected and maintained a comprehensive digital IT asset catalogue, eliminating lifecycle discrepancies across the estate.',
            '<b>Government Liaison:</b> Coordinated directly with government authorities to resolve complex cases involving credential recovery, overstay fines, and sensitive documentation.'
        ],
        letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }]
    },
    {
        date:    'Nov 2023 – Feb 2024',
        title:   'IT Support Engineer',
        type:    'Project Deployment',
        company: 'Military Medical City Hospital (MMCH) · Al-Rayyan, Qatar',
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
            '<b>High-Volume Incident Management:</b> Managed 500+ support tickets across three hospital sites, maintaining 95% SLA compliance throughout.',
            '<b>EMR Application Support:</b> Dedicated troubleshooting for Electronic Medical Records system — zero downtime achieved across the engagement.',
            '<b>Multi-Site OS Deployment:</b> Performed system reimaging and full application configuration for 300+ medical staff.',
            '<b>L1 & L2 Escalation:</b> Handled password resets, software installs, OS crashes, and critical hardware failures.',
            '<b>Preventive Maintenance:</b> Scheduled maintenance and security patching to maintain compliance with hospital IT governance policies.',
            '<b>Asset Inventory:</b> Accurate digital asset records maintained across all three facilities.'
        ],
        letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }]
    },
    {
        date:    'Feb 2022 – Nov 2023',
        title:   'IT Support Engineer',
        type:    'Full-Time',
        company: 'Star Link – Power International Holding · Doha, Qatar',
        projects: [
            { icon: 'fa-plane',     label: 'HIA Airport Expansion',       color: '#1a6fbf', gradient: 'linear-gradient(135deg,#1a6fbf,#2196f3)', detail: 'Phase 1: Feb–Oct 2022 · Phase 2: Apr–Nov 2023' },
            { icon: 'fa-utensils', label: 'Aura Group — POS Deployment',  color: '#b07d2e', gradient: 'linear-gradient(135deg,#b07d2e,#f0a500)',  detail: 'Al Maha Island restaurants & cafés' },
            { icon: 'fa-building', label: 'UCC Saudi Arabia',             color: '#1a7a4a', gradient: 'linear-gradient(135deg,#1a7a4a,#27ae60)',  detail: '25 machines provisioned & deployed' },
            { icon: 'fa-heartbeat',label: 'Elegancia Health Care',        color: '#7b2fbf', gradient: 'linear-gradient(135deg,#7b2fbf,#a855f7)',  detail: 'Cross-subsidiary onsite IT support' },
            { icon: 'fa-road',     label: 'InfraRoad Trading',            color: '#c0551a', gradient: 'linear-gradient(135deg,#c0551a,#e8793a)',  detail: 'On-site infrastructure services' }
        ],
        responsibilities: [
            '<b>Executive-Level Support:</b> Dedicated technical support for CEOs, Executives, and Directors at PIH Head Office — zero downtime for mission-critical operations.',
            '<b>HIA Expansion Lead:</b> Led IT operations for two phases of the Hamad International Airport Expansion. Managed full infrastructure readiness across all airport nodes.',
            '<b>POS Deployment — Aura Group:</b> Configured and deployed POS systems for multiple Aura Group venues across Al Maha Island.',
            '<b>UCC Saudi Arabia:</b> Provisioned and deployed 25 workstations and peripheral systems against strict handover deadlines.',
            '<b>Cross-Subsidiary Coverage:</b> Delivered onsite IT for Elegancia Health Care, UCC Holding, and ASSETS Group.',
            '<b>Asset Optimisation:</b> Implemented tracking protocols that reduced equipment loss by 10% across group companies.',
            '<b>Vendor & Telecom Coordination:</b> Managed VoIP and connectivity resolution with external vendors across diverse project sites.'
        ],
        letters: [
            { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
            { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
        ]
    },
    {
        date:    'May 2021 – Feb 2022',
        title:   'Customer Service Agent',
        type:    'Full-Time',
        company: 'STARLINK (Ooredoo International) · Qatar',
        responsibilities: [
            '<b>Technical Inbound Support:</b> High-volume inbound and outbound call handling, resolving service and product issues in a fast-paced telecoms environment.',
            '<b>First-Call Resolution:</b> Identified customer needs and delivered targeted solutions, achieving first-call resolution rates consistently above target.',
            '<b>Technical Assistance:</b> Supported customers with network and technical issues across Ooredoo product lines.',
            '<b>CRM Record Keeping:</b> Maintained accurate call records within internal database systems for reporting and follow-up accuracy.',
            '<b>Continuous Development:</b> Attended regular structured training to improve product knowledge, communication, and performance metrics.'
        ],
        letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1F1dRuB9Bp3aLm0M2A0RZ_xmzFoYaElKp/view?usp=sharing' }]
    }
];

function loadExperience() {
    const timeline = document.getElementById('expTimeline');
    if (!timeline) return;

    experienceData.forEach((exp, i) => {
        const item = document.createElement('div');
        item.className = 'exp-item';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', i * 80);

        const lettersHTML = (exp.letters || []).map(l =>
            `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="exp-btn">
                <i class="fas fa-file-contract"></i>${l.text}
            </a>`
        ).join('');

        const statsHTML = exp.stats?.length ? `
            <div class="exp-stats-strip">
                ${exp.stats.map((s, si) => `
                    <div class="exp-stat-chip" style="animation-delay:${si * 80}ms">
                        <div class="esc-icon"><i class="fas ${s.icon}"></i></div>
                        <div class="esc-body">
                            <span class="esc-value">${s.value}</span>
                            <span class="esc-label">${s.label}</span>
                        </div>
                    </div>`).join('')}
            </div>` : '';

        const projectsHTML = exp.projects?.length ? `
            <div class="exp-projects-row">
                ${exp.projects.map((p, pi) => `
                    <div class="exp-project-box" style="--proj-color:${p.color};background:${p.gradient || p.color};animation-delay:${pi * 80}ms">
                        <div class="epb-glow"></div>
                        <div class="epb-icon"><i class="fas ${p.icon}"></i></div>
                        <div class="epb-info">
                            <span class="epb-label">${p.label}</span>
                            <span class="epb-detail">${p.detail}</span>
                        </div>
                        <div class="epb-shine"></div>
                    </div>`).join('')}
            </div>` : '';

        item.innerHTML = `
            <div class="exp-card">
                <div class="exp-header">
                    <div class="exp-title-row">
                        <h3 class="exp-title">${exp.title}</h3>
                        ${exp.type ? `<span class="exp-type-badge">${exp.type}</span>` : ''}
                    </div>
                    <div class="exp-meta">
                        <span class="exp-date"><i class="fas fa-calendar-alt"></i> <b>${exp.date}</b></span>
                        <span class="exp-company-name">${exp.company}</span>
                    </div>
                </div>
                ${statsHTML}
                ${projectsHTML}
                <ul class="exp-list">
                    ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                </ul>
                <div class="exp-actions">${lettersHTML}</div>
            </div>
        `;

        timeline.appendChild(item);
    });
}

// ════════════════════════════════════════
// DATA — TECHNICAL ARSENAL
// ════════════════════════════════════════
const arsenalData = [
    {
        id: 'infrastructure', icon: 'fa-server',
        title: 'Infrastructure', subtitle: 'Core Systems · Deployment · Lifecycle',
        color: '#C5A059', span: false,
        tools: [
            { icon: 'fa-windows',      name: 'Windows 10 / 11',    color: '#0078D7' },
            { icon: 'fa-apple',        name: 'macOS',              color: '#888' },
            { icon: 'fa-compact-disc', name: 'OS Reimaging',       color: '#C5A059' },
            { icon: 'fa-tools',        name: 'Hardware Repair',    color: '#E07B39' },
            { icon: 'fa-database',     name: 'Asset Management',   color: '#27AE60' },
            { icon: 'fa-desktop',      name: 'Device Provisioning',color: '#3B82F6' }
        ]
    },
    {
        id: 'networking', icon: 'fa-network-wired',
        title: 'Networking', subtitle: 'CCNA · LAN/WAN · Cisco IOS',
        color: '#3B82F6', span: false,
        tools: [
            { icon: 'fa-circle-nodes',             name: 'Cisco IOS',         color: '#1D4ED8' },
            { icon: 'fa-wifi',                     name: 'WLAN Config',       color: '#06B6D4' },
            { icon: 'fa-arrows-split-up-and-left', name: 'TCP/IP / OSPF',    color: '#3B82F6' },
            { icon: 'fa-phone-volume',             name: 'VoIP',              color: '#8B5CF6' },
            { icon: 'fa-shield-halved',            name: 'Firewall / ACL',    color: '#EF4444' },
            { icon: 'fa-diagram-project',          name: 'VLAN Segmentation', color: '#F59E0B' }
        ]
    },
    {
        id: 'productivity', icon: 'fa-cloud',
        title: 'Cloud & Productivity', subtitle: 'Microsoft 365 · SharePoint · Azure',
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
        id: 'security', icon: 'fa-shield-halved',
        title: 'Security & Compliance', subtitle: 'Governance · Patching · Hardening',
        color: '#EF4444', span: false,
        tools: [
            { icon: 'fa-lock',            name: 'Security Patching',   color: '#EF4444' },
            { icon: 'fa-user-lock',       name: 'Access Control',      color: '#F59E0B' },
            { icon: 'fa-clipboard-check', name: 'IT Governance',       color: '#27AE60' },
            { icon: 'fa-bug',             name: 'Vulnerability Triage',color: '#EC4899' }
        ]
    },
    {
        id: 'specialty', icon: 'fa-stethoscope',
        title: 'Specialist Platforms', subtitle: 'EMR · POS · ERP · Immigration Systems',
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
    const bento = document.getElementById('arsenalBento');
    if (!bento) return;

    arsenalData.forEach((cat, i) => {
        const card = document.createElement('div');
        card.className = `arsenal-category${cat.span ? ' span-2' : ''}`;
        card.style.setProperty('--cat-color', cat.color);
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', i * 80);

        const toolsHTML = cat.tools.map(t =>
            `<span class="tool-chip" style="--tool-color:${t.color}">
                <i class="fas ${t.icon}"></i>${t.name}
            </span>`
        ).join('');

        card.innerHTML = `
            <div class="ac-head">
                <div class="ac-icon"><i class="fas ${cat.icon}"></i></div>
                <div>
                    <div class="ac-title">${cat.title}</div>
                    <div class="ac-subtitle">${cat.subtitle}</div>
                </div>
            </div>
            <div class="ac-tools">${toolsHTML}</div>
        `;

        bento.appendChild(card);
    });
}

// ════════════════════════════════════════
// DATA — LANGUAGES
// ════════════════════════════════════════
const languages = [
    { name: 'English',      level: 'Professional' },
    { name: 'Urdu / Hindi', level: 'Native' },
    { name: 'Pashto',       level: 'Native' }
];

function loadLanguages() {
    const grid = document.getElementById('langGrid');
    if (!grid) return;
    languages.forEach(l => {
        const card = document.createElement('div');
        card.className = 'lang-card';
        card.innerHTML = `<span class="lang-name">${l.name}</span><span class="lang-level">${l.level}</span>`;
        grid.appendChild(card);
    });
}

// ════════════════════════════════════════
// DATA — CERTIFICATIONS
// ════════════════════════════════════════
const certData = [
    {
        icon: 'fa-graduation-cap', title: 'Odoo ERP Training',
        desc: 'Workshop covering business processes, product, vendor, and customer management within enterprise ERP environments.',
        url:  'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
    },
    {
        icon: 'fa-trophy', title: 'Aptech ACCP Graduation',
        desc: 'Advanced Diploma in Software Engineering — comprehensive applied computing programme.',
        url:  'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
    },
    {
        icon: 'fa-hands-helping', title: 'MDX Career Fair',
        desc: 'Certificate of appreciation for volunteering at the Middlesex University Dubai Career Fair.',
        url:  'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
    },
    {
        icon: 'fa-award', title: 'Safety Award — HIA',
        desc: 'Recognition for exemplary safety practices during the Hamad International Airport Expansion Project.',
        url:  'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=sharing'
    }
];

function loadCertifications() {
    const grid = document.getElementById('certsGrid');
    if (!grid) return;

    certData.forEach((cert, i) => {
        const frame = document.createElement('div');
        frame.className = 'cert-card';
        frame.setAttribute('data-aos', 'fade-up');
        frame.setAttribute('data-aos-delay', i * 80);
        frame.innerHTML = `
            <div class="cert-card-inner">
                <div class="cc-icon"><i class="fas ${cert.icon}"></i></div>
                <div class="cc-title">${cert.title}</div>
                <div class="cc-desc">${cert.desc}</div>
                ${cert.url ? `
                <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm">
                    <i class="fas fa-eye"></i> View Certificate
                </a>` : ''}
            </div>
        `;
        grid.appendChild(frame);
    });
}

// ════════════════════════════════════════
// CONSOLE SIGNATURE
// ════════════════════════════════════════
function printSignature() {
    console.log(
        '%c⚜  SAJID MEHMOOD · IT SYSTEMS ENGINEER',
        'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
    );
    console.log('%cCCNA Certified · Enterprise Infrastructure · WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
}