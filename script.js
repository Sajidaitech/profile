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
// CUSTOM CURSOR (desktop only)
// ════════════════════════════════════════

function initCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || window.innerWidth < 1024) return;

    document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
        setTimeout(() => {
            ring.style.left = e.clientX + 'px';
            ring.style.top  = e.clientY + 'px';
        }, 70);
    });

    document.querySelectorAll('a, button, .skill-card, .exp-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width = '44px'; ring.style.height = '44px'; ring.style.opacity = '.4';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width = '28px'; ring.style.height = '28px'; ring.style.opacity = '.6';
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
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.ceil(progress * target);
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
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.folder-pane').forEach(p => p.classList.remove('active'));
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
                setTimeout(() => { bar.style.width = bar.getAttribute('data-width'); }, 200);
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

const experienceData = [
    {
        date: 'Apr 2025 – Aug 2025',
        title: 'IT Executive & Business Development Intern',
        type: 'Internship',
        company: 'Al Tawkel Immigration Center · Dubai, UAE',
        responsibilities: [
            'Delivered Level 2 IT support including hardware repairs, system reimaging, network troubleshooting, and Office 365 email configurations',
            'Installed, configured, and maintained enterprise IT infrastructure (servers, networks, printers)',
            'Created and maintained digital IT asset records, streamlining lifecycle management',
            'Assisted with immigration business operations including visa applications, cancellations, and Golden Visa processing',
            'Coordinated with government authorities to resolve absconding employee cases, overstay fines, and lost passports'
        ],
        letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }]
    },
    {
        date: 'Nov 2023 – Feb 2024',
        title: 'IT Support Engineer',
        type: 'Short-term Project',
        company: 'Military Medical City Hospital (MMCH) · Doha, Qatar',
        responsibilities: [
            'Managed 500+ support tickets across three hospitals, ensuring 95% SLA compliance',
            'Handled L1 tasks (password resets, software installs, network fixes) and L2 troubleshooting (OS crashes, hardware failures)',
            'Performed system reimaging, OS deployment, and application configuration for 300+ medical staff',
            'Supported EMR application troubleshooting for doctors and nurses, reducing downtime',
            'Conducted preventive maintenance and patching for compliance with IT policies',
            'Maintained digital asset inventory, improving lifecycle management accuracy'
        ],
        letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }]
    },
    {
        date: 'Feb 2022 – Nov 2023',
        title: 'IT Support Engineer',
        type: 'Full Time',
        company: 'Star Link – Power International Holding · Doha, Qatar',
        responsibilities: [
            'Delivered daily IT support for 200+ staff across retail and corporate offices',
            'Resolved L1 issues: login errors, email configs, printer problems, software installations',
            'Handled L2 incidents: hardware replacements, OS troubleshooting, network failures',
            'Performed imaging, upgrades, and preventive maintenance for desktops, laptops, POS systems',
            'Monitored and documented IT assets, reducing missing equipment by 20%',
            'Collaborated with vendors and telecoms for VoIP/connectivity issues',
            'Supported onboarding (device provisioning, account setup, access control)',
            'Trained staff on troubleshooting and IT best practices, reducing repeat tickets'
        ],
        letters: [
            { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
            { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
        ]
    },
    {
        date: 'May 2021 – Feb 2022',
        title: 'Customer Service Agent',
        type: 'Full Time',
        company: 'STARLINK (Ooredoo International Telecommunications Company) · Qatar',
        responsibilities: [
            'Handled inbound/outbound customer calls, resolving service and product issues',
            'Identified customer needs, researched solutions, and provided appropriate alternatives',
            'Supported customers with network and technical issues across Ooredoo products',
            'Maintained accurate call records in database systems',
            'Engaged customers and built sustainable long-term relationships',
            'Regularly attended training sessions to improve product knowledge and performance'
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
                  '<span class="exp-date"><i class="fas fa-calendar-alt"></i> ' + exp.date + '</span>' +
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
            '<div class="sk-name">' + s.name + '</div>' +
            '<div class="sk-cat">' + s.cat + '</div>' +
            '<div class="sk-bar-track"><div class="sk-bar-fill" data-width="' + s.level + '%"></div></div>' +
            '<div class="sk-pct">' + s.level + '%</div>';
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
        pill.className = 'tech-pill';
        pill.textContent = t;
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
        card.innerHTML = '<span class="lang-name">' + l.name + '</span><span class="lang-level">' + l.level + '</span>';
        grid.appendChild(card);
    });
}


// ════════════════════════════════════════
// DATA — CERTIFICATIONS
// ════════════════════════════════════════

const additionalCerts = [
    {
        icon: 'fa-graduation-cap',
        title: 'Odoo ERP Training',
        desc: 'Workshop covering business processes, product, vendor, and customer management.',
        url: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
    },
    {
        icon: 'fa-trophy',
        title: 'Aptech Graduation',
        desc: 'Advanced Diploma in Software Engineering (ACCP) certification.',
        url: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
    },
    {
        icon: 'fa-hands-helping',
        title: 'MDX Career Fair',
        desc: 'Certificate of appreciation for volunteering at the Middlesex University Career Fair.',
        url: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
    },
    {
        icon: 'fa-award',
        title: 'Safety Award — HIA',
        desc: 'Recognition for exemplary safety practices during the Airport Expansion Project.',
        url: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVGbGi5HcFh4lrN9/view?usp=drive_link'
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
              '<div class="cw-title">' + cert.title + '</div>' +
              '<div class="cw-desc">' + cert.desc + '</div>' +
              (cert.url ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm"><i class="fas fa-eye"></i> View Certificate</a>' : '') +
            '</div>';
        wall.appendChild(frame);
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
