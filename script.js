// ============================================
// Portfolio JavaScript
// Sajid Mehmood · IT Support Engineer
// sajidmk.com
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // Initialise AOS scroll animations
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 40 });
    }

    initNav();
    initDarkMode();
    initCursor();
    initCounters();
    initRings();
    initFolderTabs();
    loadExperience();
    loadSkills();
    loadTechStack();
    loadLanguages();
    loadCertifications();
    initSkillBars();
    initScrollReveal();
    initHeroEmoji();
    initMobileEmojiTicker();
    initHoverParticles();
});


// ════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════

function initNav() {
    const nav       = document.getElementById('topNav');
    const hamburger = document.getElementById('hamburger');
    const drawer    = document.getElementById('mobileDrawer');
    const navLinks  = document.querySelectorAll('.nav-link');

    // Scroll: shrink nav + highlight active section
    window.addEventListener('scroll', () => {
        nav?.classList.toggle('scrolled', window.scrollY > 60);

        let current = '';
        document.querySelectorAll('section[id]').forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) current = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    });

    // Hamburger toggle
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        drawer?.classList.toggle('open');
    });

    // Close drawer on link click
    document.querySelectorAll('.mob-link').forEach(l => {
        l.addEventListener('click', () => {
            hamburger?.classList.remove('open');
            drawer?.classList.remove('open');
        });
    });

    // Close drawer on outside click
    document.addEventListener('click', e => {
        if (
            drawer?.classList.contains('open') &&
            !drawer.contains(e.target) &&
            !hamburger?.contains(e.target)
        ) {
            hamburger?.classList.remove('open');
            drawer?.classList.remove('open');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });
}


// ════════════════════════════════════════
// DARK MODE
// ════════════════════════════════════════

function initDarkMode() {
    const body        = document.body;
    const toggles     = [document.getElementById('darkToggle'), document.getElementById('darkToggleMob')];
    const STORAGE_KEY = 'sm-dark-mode';

    function applyDark(isDark) {
        body.classList.toggle('dark-mode', isDark);
        toggles.forEach(btn => {
            if (!btn) return;
            const icon  = btn.querySelector('.toggle-icon');
            const label = btn.querySelector('.toggle-label');
            if (icon)  icon.textContent  = isDark ? '☀️' : '🌙';
            if (label) label.textContent = isDark ? 'Light' : 'Dark';
        });
    }

    // Restore saved preference, fall back to system preference
    const saved       = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDark(saved !== null ? saved === '1' : prefersDark);

    toggles.forEach(btn => {
        btn?.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-mode');
            applyDark(isDark);
            localStorage.setItem(STORAGE_KEY, isDark ? '1' : '0');
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

    document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
        // Ring follows with a slight lag for a trailing effect
        setTimeout(() => {
            ring.style.left = e.clientX + 'px';
            ring.style.top  = e.clientY + 'px';
        }, 70);
    });

    // Expand ring on interactive elements
    document.querySelectorAll('a, button, .skill-card, .exp-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width   = '44px';
            ring.style.height  = '44px';
            ring.style.opacity = '.4';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width   = '28px';
            ring.style.height  = '28px';
            ring.style.opacity = '.6';
        });
    });
}


// ════════════════════════════════════════
// COUNTER ANIMATION (KPI numbers)
// ════════════════════════════════════════

function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(el);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
    });
}

function animateCount(el) {
    const target   = +el.getAttribute('data-count');
    const duration = 1400;
    const start    = performance.now();
    const step = now => {
        const progress  = Math.min((now - start) / duration, 1);
        el.textContent  = Math.ceil(progress * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    };
    requestAnimationFrame(step);
}


// ════════════════════════════════════════
// SVG RING ANIMATIONS
// ════════════════════════════════════════

function initRings() {
    document.querySelectorAll('.ring-fg').forEach(ring => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const pct  = parseInt(ring.getAttribute('data-percent'));
                const circ = 2 * Math.PI * 50;
                ring.style.strokeDasharray  = circ;
                ring.style.strokeDashoffset = circ;
                // Small delay so the animation is visible after entering viewport
                setTimeout(() => {
                    ring.style.strokeDashoffset = circ - (pct / 100) * circ;
                }, 300);
                observer.unobserve(ring);
            });
        }, { threshold: 0.4 });
        observer.observe(ring);
    });
}


// ════════════════════════════════════════
// EDUCATION FOLDER TABS
// ════════════════════════════════════════

function initFolderTabs() {
    const tabs = document.querySelectorAll('.ftab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const paneId = tab.getAttribute('data-pane');

            // Deactivate all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.folder-pane').forEach(p => p.classList.remove('active'));

            // Activate clicked tab and its pane
            tab.classList.add('active');
            document.getElementById(paneId)?.classList.add('active');
        });
    });
}


// ════════════════════════════════════════
// SKILL BAR ANIMATION
// ════════════════════════════════════════

function initSkillBars() {
    const bento = document.getElementById('skillsBento');
    if (!bento) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.sk-bar-fill').forEach(bar => {
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-width');
                }, 200);
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    observer.observe(bento);
}


// ════════════════════════════════════════
// CONTACT FORM
// ════════════════════════════════════════

function handleContactForm() {
    const name    = document.getElementById('cf-name')?.value.trim();
    const email   = document.getElementById('cf-email')?.value.trim();
    const subject = document.getElementById('cf-subject')?.value.trim();
    const message = document.getElementById('cf-message')?.value.trim();
    const note    = document.getElementById('cfNote');
    const btn     = document.getElementById('cfSubmit');

    // Basic validation
    if (!name || !email || !message) {
        note.textContent = '⚠ Please fill in your name, email, and message.';
        note.style.color = '#e74c3c';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = '⚠ Please enter a valid email address.';
        note.style.color = '#e74c3c';
        return;
    }

    // Build mailto link and open mail client
    const body       = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
    const mailtoLink = 'mailto:sajidmehmood@outlook.com?subject=' +
                       encodeURIComponent(subject || 'Portfolio Enquiry — ' + name) +
                       '&body=' + encodeURIComponent(body);

    window.location.href = mailtoLink;
    note.textContent = '✓ Your mail client has been opened. Looking forward to hearing from you!';
    note.style.color = '#27ae60';
    if (btn) btn.disabled = true;
}


// ════════════════════════════════════════
// DATA — EXPERIENCE
// ════════════════════════════════════════

/*
 * Each responsibility entry supports inline HTML.
 * Bold tags are used to highlight:
 *   - Date ranges / project phases
 *   - Key role titles / section headings
 *   - Notable achievements and metrics
 */
const experienceData = [
    {
        date:    'Apr 2025 – Aug 2025',
        title:   'IT Executive & Business Development Intern',
        type:    'Internship',
        company: 'Al Tawkel Immigration Center · Dubai, UAE',
        responsibilities: [
            '<b>L2 IT Support:</b> Delivered Level 2 technical support covering hardware repairs, system reimaging, network troubleshooting, and <b>Office 365</b> email configurations for all company staff.',
            '<b>Infrastructure Management:</b> Installed, configured, and maintained enterprise IT infrastructure including servers, LAN networks, and multi-function printers across office premises.',
            '<b>Digital Asset Management:</b> Created and maintained comprehensive digital IT asset records, significantly streamlining lifecycle management and reducing equipment discrepancies.',
            '<b>Business Operations Support:</b> Assisted with core immigration business operations including visa applications, cancellations, and <b>Golden Visa</b> processing workflows.',
            '<b>Government Liaison:</b> Coordinated directly with government authorities to resolve complex cases involving absconding employees, overstay fines, and lost passport recovery.'
        ],
        letters: [
            { text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }
        ]
    },
    {
        date:    'Nov 2023 – Feb 2024',
        title:   'IT Support Engineer',
        type:    'Short-term Project',
        company: 'Military Medical City Hospital (MMCH) · Doha, Qatar',
        responsibilities: [
            '<b>High-Volume Ticket Management:</b> Managed <b>500+ support tickets</b> across three hospital sites, maintaining <b>95% SLA compliance</b> throughout the project duration.',
            '<b>L1 & L2 Support:</b> Handled L1 tasks (password resets, software installations, network fixes) and escalated L2 troubleshooting covering OS crashes and critical hardware failures.',
            '<b>System Deployment:</b> Performed system reimaging, OS deployment, and full application configuration for over <b>300 medical staff</b> across all hospital departments.',
            '<b>EMR Application Support:</b> Provided dedicated troubleshooting for the Electronic Medical Records (EMR) system used by doctors and nurses, significantly reducing operational downtime.',
            '<b>Preventive Maintenance & Compliance:</b> Conducted scheduled preventive maintenance and security patching to ensure compliance with hospital IT governance policies.',
            '<b>Asset Inventory:</b> Maintained accurate digital asset inventory records, improving lifecycle management accuracy across all three hospital facilities.'
        ],
        letters: [
            { text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }
        ]
    },
    {
        date:    'Feb 2022 – Nov 2023',
        title:   'IT Support Engineer',
        type:    'Full Time',
        company: 'Star Link – Power International Holding · Doha, Qatar',
        responsibilities: [
            '<b>Executive & Head Office Support:</b> Provided dedicated technical support to <b>CEOs, Executives, and Directors</b> at the PIH Head Office, ensuring <b>zero downtime</b> for mission-critical operations and senior management.',
            '<b>Project Management — HIA Expansion:</b> Led IT support operations for the <b>Hamad International Airport (HIA) Expansion</b> project across two phases (<b>Feb 2022 – Oct 2022</b> & <b>Apr 2023 – Nov 2023</b>), managing full infrastructure readiness and onsite technical requirements.',
            '<b>Hospitality & Retail Systems:</b> Configured and deployed <b>POS systems</b> for <b>Aura Group</b> restaurants at Al Maha Island, ensuring seamless integration and operational stability for high-traffic dining venues.',
            '<b>Cross-Subsidiary Support:</b> Delivered specialised onsite IT support for <b>Elegancia Health Care</b>, <b>UCC Holding</b>, and <b>ASSETS Group</b>, conducting frequent site visits to resolve complex hardware and network issues.',
            '<b>L1/L2 Incident Management:</b> Resolved complex login errors, email configurations, and network failures for <b>200+ staff</b> across retail and corporate environments.',
            '<b>Infrastructure & Deployment:</b> Managed full-cycle device provisioning including OS imaging, hardware upgrades, and preventive maintenance for desktops, laptops, and specialised POS hardware.',
            '<b>Asset Optimisation:</b> Monitored and documented IT assets across multiple group companies, implementing tracking protocols that <b>reduced equipment loss by 10%</b>.',
            '<b>Vendor Coordination:</b> Collaborated with external vendors and telecommunications providers to resolve VoIP and connectivity issues across diverse project sites.'
        ],
        letters: [
            { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
            { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
        ]
    },
    {
        date:    'May 2021 – Feb 2022',
        title:   'Customer Service Agent',
        type:    'Full Time',
        company: 'STARLINK (Ooredoo International Telecommunications Company) · Qatar',
        responsibilities: [
            '<b>Inbound & Outbound Support:</b> Handled high volumes of inbound and outbound customer calls, efficiently resolving service and product issues in a fast-paced telecoms environment.',
            '<b>Issue Resolution:</b> Identified customer needs, researched suitable solutions, and provided well-informed alternatives to ensure first-call resolution wherever possible.',
            '<b>Technical Assistance:</b> Supported customers with network and technical issues across <b>Ooredoo</b> product lines, escalating complex cases to the appropriate teams.',
            '<b>CRM & Record Keeping:</b> Maintained accurate and detailed call records within internal database systems, ensuring data integrity for reporting and follow-ups.',
            '<b>Relationship Building:</b> Engaged proactively with customers to build sustainable, long-term relationships that improved retention and customer satisfaction scores.',
            '<b>Continuous Learning:</b> Regularly attended structured training sessions to improve product knowledge, communication skills, and overall performance metrics.'
        ],
        letters: [
            { text: 'Experience Letter', url: 'https://drive.google.com/file/d/1F1dRuB9Bp3aLm0M2A0RZ_xmzFoYaElKp/view?usp=sharing' }
        ]
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

        // Build "View Letter" button(s)
        const lettersHTML = (exp.letters || []).map(l =>
            '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer" class="exp-btn">' +
            '<i class="fas fa-file-contract"></i>' + l.text + '</a>'
        ).join('');

        item.innerHTML =
            '<div class="exp-card">' +
              '<div class="exp-header">' +
                '<div class="exp-title-row">' +
                  '<h3 class="exp-title">' + exp.title + '</h3>' +
                  (exp.type ? '<span class="exp-type-badge">' + exp.type + '</span>' : '') +
                '</div>' +
                '<div class="exp-meta">' +
                  '<span class="exp-date"><i class="fas fa-calendar-alt"></i> <b>' + exp.date + '</b></span>' +
                  '<span class="exp-company-name">' + exp.company + '</span>' +
                '</div>' +
              '</div>' +
              '<ul class="exp-list">' +
                exp.responsibilities.map(r => '<li>' + r + '</li>').join('') +
              '</ul>' +
              '<div class="exp-actions">' + lettersHTML + '</div>' +
            '</div>';

        timeline.appendChild(item);
    });
}


// ════════════════════════════════════════
// DATA — SKILLS
// ════════════════════════════════════════

const skillsData = [
    { name: 'L1 & L2 IT Support',            icon: 'fa-headset',        level: 90,  cat: 'Core Competency' },
    { name: 'Hardware Repair & Maintenance',  icon: 'fa-tools',          level: 98,  cat: 'Hands-on Experience' },
    { name: 'System Reimaging & OS Deploy',   icon: 'fa-compact-disc',   level: 85,  cat: 'Practiced Regularly' },
    { name: 'Network Support (LAN/WAN)',      icon: 'fa-network-wired',  level: 85,  cat: 'CCNA Foundation' },
    { name: 'IT Asset Management',            icon: 'fa-database',       level: 100, cat: 'Full Lifecycle' },
    { name: 'Office 365 & SharePoint',        icon: 'fa-envelope-open',  level: 97,  cat: 'Daily Use' },
    { name: 'Onboarding IT Processes',        icon: 'fa-user-plus',      level: 90,  cat: 'Multi-company Experience' },
    { name: 'H/W, S/W & OS Troubleshooting', icon: 'fa-bug',            level: 100, cat: 'Expert Level' },
    { name: 'Digital Asset Inventory',        icon: 'fa-clipboard-list', level: 100, cat: 'Cross-sector Practice' }
];

function loadSkills() {
    const bento = document.getElementById('skillsBento');
    if (!bento) return;

    skillsData.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', i * 60);
        card.innerHTML =
            '<div class="sk-icon"><i class="fas ' + s.icon + '"></i></div>' +
            '<div class="sk-name"><b>' + s.name + '</b></div>' +
            '<div class="sk-cat">' + s.cat + '</div>' +
            '<div class="sk-bar-track"><div class="sk-bar-fill" data-width="' + s.level + '%"></div></div>' +
            '<div class="sk-pct"><b>' + s.level + '%</b></div>';
        bento.appendChild(card);
    });
}


// ════════════════════════════════════════
// DATA — TECH STACK PILLS
// ════════════════════════════════════════

const techStack = [
    'Windows 10 / 11', 'macOS',
    'Office 365', 'SharePoint', 'Active Directory', 'Outlook', 'Microsoft Teams',
    'LAN / WAN / Wi-Fi', 'VoIP', 'Network Troubleshooting', 'TCP/IP',
    'System Reimaging', 'Hardware Repair', 'EMR Systems', 'POS Systems',
    'SQL Basics', 'Project Management', 'Odoo ERP'
];

function loadTechStack() {
    const container = document.getElementById('techPills');
    if (!container) return;

    techStack.forEach((t, i) => {
        const pill = document.createElement('span');
        pill.className    = 'tech-pill';
        pill.textContent  = t;
        pill.setAttribute('data-aos', 'zoom-in');
        pill.setAttribute('data-aos-delay', i * 25);
        container.appendChild(pill);
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
        card.innerHTML  =
            '<span class="lang-name"><b>' + l.name + '</b></span>' +
            '<span class="lang-level">' + l.level + '</span>';
        grid.appendChild(card);
    });
}


// ════════════════════════════════════════
// DATA — CERTIFICATIONS
// ════════════════════════════════════════

const cvLink = 'https://drive.google.com/file/d/1wdY06c35F-FkQEh53MEjuYQFbIfOn71g/view?usp=sharing';

const additionalCerts = [
    {
        icon:  'fa-graduation-cap',
        title: 'Odoo ERP Training',
        desc:  'Workshop covering business processes, product, vendor, and customer management.',
        url:   'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
    },
    {
        icon:  'fa-trophy',
        title: 'Aptech Graduation',
        desc:  'Advanced Diploma in Software Engineering (ACCP) certification.',
        url:   'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
    },
    {
        icon:  'fa-hands-helping',
        title: 'MDX Career Fair',
        desc:  'Certificate of appreciation for volunteering at the Middlesex University Career Fair.',
        url:   'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
    },
    {
        icon:  'fa-award',
        title: 'Safety Award — HIA',
        desc:  'Recognition for exemplary safety practices during the Airport Expansion Project.',
        url:   'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=sharing'
    }
];

function loadCertifications() {
    const wall = document.getElementById('certsWall');
    if (!wall) return;

    additionalCerts.forEach((cert, i) => {
        const frame = document.createElement('div');
        frame.className = 'cw-frame';
        frame.setAttribute('data-aos', 'fade-up');
        frame.setAttribute('data-aos-delay', i * 80);
        frame.innerHTML =
            '<div class="cw-frame-inner">' +
              '<div class="cw-icon"><i class="fas ' + cert.icon + '"></i></div>' +
              '<div class="cw-title"><b>' + cert.title + '</b></div>' +
              '<div class="cw-desc">' + cert.desc + '</div>' +
              (cert.url
                ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm"><i class="fas fa-eye"></i> View Certificate</a>'
                : '') +
            '</div>';
        wall.appendChild(frame);
    });
}


// ════════════════════════════════════════
// SCROLL REVEAL (Intersection Observer)
// ════════════════════════════════════════

/*
 * Pauses CSS animations on off-screen elements and starts them
 * only when they scroll into the viewport — improving performance
 * and creating a clean staggered entrance effect on mobile.
 */
function initScrollReveal() {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = document.querySelectorAll(
        '.achieve-item, .skill-card, .exp-card, .contact-card, .cw-frame, .lang-card, .tech-pill'
    );

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity            = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    els.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}


// ════════════════════════════════════════
// HERO EMOJI WAVE
// ════════════════════════════════════════

/*
 * Appends a waving hand emoji (👋) to the hero ID-card name.
 * Clicking or tapping replays the CSS wave animation.
 * On page load an automatic single wave fires after 1.8 s.
 */
function initHeroEmoji() {
    const idName = document.querySelector('.id-name');
    if (!idName) return;

    const wave = document.createElement('span');
    wave.textContent = ' 👋';
    wave.style.cssText = 'display:inline-block;animation:none;cursor:pointer;';
    wave.setAttribute('aria-hidden', 'true');
    idName.appendChild(wave);

    // Helper: restart the keyframe animation
    function replayWave() {
        wave.style.animation = 'none';
        requestAnimationFrame(() => {
            wave.style.animation = 'waveEmoji .8s ease';
        });
        wave.addEventListener('animationend', () => {
            wave.style.animation = 'none';
        }, { once: true });
    }

    wave.addEventListener('click', replayWave);

    // Auto-wave once on load
    setTimeout(replayWave, 1800);
}


// ════════════════════════════════════════
// MOBILE EMOJI TICKER
// ════════════════════════════════════════

/*
 * On small screens only, inserts an animated emoji strip above
 * the hero copy to give the section a lively, mobile-friendly feel.
 */
function initMobileEmojiTicker() {
    if (window.innerWidth > 768) return;

    const hero = document.querySelector('.hero-copy');
    if (!hero) return;

    const ticker = document.createElement('div');
    ticker.setAttribute('aria-hidden', 'true');
    ticker.style.cssText = [
        'font-size:22px',
        'letter-spacing:8px',
        'text-align:center',
        'margin-bottom:12px',
        'animation:fadeInDown .8s ease both',
        'user-select:none'
    ].join(';');
    ticker.textContent = '💻 🌐 ⚙️ 🔧 📡';
    hero.insertAdjacentElement('afterbegin', ticker);
}


// ════════════════════════════════════════
// GOLD PARTICLE BURST ON BUTTON CLICK
// ════════════════════════════════════════

/*
 * Attaches a click handler to every .btn-gold element that spawns
 * 8 small gold dots radiating outward from the click point.
 * Each particle fades and scales down over ~550 ms before being removed.
 */
function initHoverParticles() {
    document.querySelectorAll('.btn-gold').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = btn.getBoundingClientRect();
            const cx   = e.clientX - rect.left;
            const cy   = e.clientY - rect.top;

            for (let i = 0; i < 8; i++) {
                const dot   = document.createElement('span');
                const angle = (i / 8) * 2 * Math.PI;
                const dist  = 28 + Math.random() * 20;

                dot.style.cssText = [
                    'position:absolute',
                    'width:5px',
                    'height:5px',
                    'border-radius:50%',
                    'background:var(--gold-lt)',
                    'pointer-events:none',
                    'z-index:99',
                    'left:'  + (cx - 2.5) + 'px',
                    'top:'   + (cy - 2.5) + 'px',
                    'transition:transform .5s ease,opacity .5s ease',
                    'opacity:1'
                ].join(';');

                btn.style.position = 'relative';
                btn.style.overflow = 'visible';
                btn.appendChild(dot);

                // Trigger transition on next frame
                requestAnimationFrame(() => {
                    dot.style.transform = 'translate(' +
                        (Math.cos(angle) * dist) + 'px,' +
                        (Math.sin(angle) * dist) + 'px) scale(0)';
                    dot.style.opacity = '0';
                });

                // Clean up particle after animation completes
                setTimeout(() => dot.remove(), 550);
            }
        });
    });
}


// ════════════════════════════════════════
// CONSOLE SIGNATURE
// ════════════════════════════════════════

console.log(
    '%c⚜ Sajid Mehmood — IT Support Engineer Portfolio',
    'font-size:16px;font-weight:bold;color:#C5A059;background:#2D3436;padding:10px 22px;border-radius:4px;'
);
console.log('%cBuilt with precision · sajidmk.com', 'font-size:11px;color:#718096;');

