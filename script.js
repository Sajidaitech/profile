// ===================================
// LUXURY IT ENGINEER PORTFOLIO
// Premium Dashboard Interactions
// =================================== ==

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 900,
            easing: 'ease-out-cubic',
            once: true,
            offset: 40
        });
    }
});

// ===================================
// Premium Custom Cursor
// =================================== 
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorFollower = document.querySelector('.cursor-follower');
        
        if (this.cursor && this.cursorFollower && window.innerWidth > 1024) {
            this.init();
        }
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                this.cursorFollower.style.left = e.clientX + 'px';
                this.cursorFollower.style.top = e.clientY + 'px';
            }, 80);
        });

        // Enhanced cursor on hover
        const hoverElements = document.querySelectorAll('a, button, .btn, .nav-link, .stat-card, .skill-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorFollower.style.transform = 'scale(1.6)';
                this.cursorFollower.style.borderColor = 'var(--gold-bright)';
            });
            el.addEventListener('mouseleave', () => {
                this.cursorFollower.style.transform = 'scale(1)';
                this.cursorFollower.style.borderColor = 'var(--gold-muted)';
            });
        });
    }
}

new CustomCursor();

// ===================================
// Mobile Navigation
// ===================================
const mobileToggle = document.getElementById('mobileNavToggle');
const sideNav = document.getElementById('sideNav');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileToggle && sideNav) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        sideNav.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                mobileToggle.classList.remove('active');
                sideNav.classList.remove('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            if (!sideNav.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                sideNav.classList.remove('active');
            }
        }
    });
}

// ===================================
// Active Navigation Link Tracking
// ===================================
const sections = document.querySelectorAll('.section, .hero');
const navLinksArray = Array.from(navLinks);

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinksArray.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===================================
// Premium Typing Effect
// ===================================
class TypeWriter {
    constructor(element, words, wait = 2500) {
        this.element = element;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.isDeleting = false;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.innerHTML = `<span class="typing-text">${this.txt}</span><span class="cursor-blink">|</span>`;

        let typeSpeed = 90;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

const typingElement = document.querySelector('.typing-effect');
if (typingElement) {
    const words = [
        'IT Support Engineer',
        'Network Specialist',
        'CCNA Certified Professional',
        'System Administrator'
    ];
    new TypeWriter(typingElement, words, 2200);
}

// ===================================
// Counter Animation for Dashboard Stats
// ===================================
class CountUp {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.speed = 180;
        this.hasAnimated = false;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animateCounters();
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-count');
                const count = +counter.innerText;
                const inc = target / this.speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }
}

new CountUp();

// ===================================
// Load Professional Experience
// ===================================
const experienceData = [
    {
        date: 'Apr 2025 - Aug 2025',
        title: 'IT Executive & Business Development Intern',
        company: 'Al Tawkel Immigration Center',
        location: 'Dubai, UAE',
        responsibilities: [
            'Delivered Level 2 IT support, including hardware repairs, system reimaging, network troubleshooting',
            'Installed, configured, and maintained enterprise IT infrastructure',
            'Created and maintained comprehensive digital IT asset records',
            'Assisted with immigration business operations and client support'
        ],
        link: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing'
    },
    {
        date: 'Nov 2023 - Feb 2024',
        title: 'IT Support Engineer',
        company: 'Military Medical City Hospital (MMCH)',
        location: 'Doha, Qatar',
        responsibilities: [
            'Managed 500+ support tickets across three hospitals, ensuring 95% SLA compliance',
            'Performed system reimaging and OS deployment for 300+ medical staff',
            'Supported EMR application troubleshooting for doctors and nurses',
            'Maintained digital asset inventory, improving lifecycle management'
        ],
        link: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing'
    },
    {
        date: 'May 2021 - Nov 2023',
        title: 'IT Support Engineer / IT Officer',
        company: 'Star Link / UCC-Bahadir-Tedeschia JV (HIAEP)',
        location: 'Doha, Qatar',
        responsibilities: [
            'Delivered daily IT support for 200+ staff across retail and corporate offices',
            'Resolved L1 & L2 incidents with quick turnaround times',
            'Managed IT support for the Hamad International Airport Expansion Project',
            'Monitored and documented IT assets, reducing missing equipment by 20%'
        ],
        links: [
            { text: 'Starlink Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
            { text: 'Airport Project Letter', url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
        ]
    },
    {
        date: 'May 2021 - Feb 2022',
        title: 'Customer Service Agent',
        company: 'STARLINK (Ooredoo International)',
        location: 'Qatar',
        responsibilities: [
            'Handled inbound/outbound customer calls with resolution focus',
            'Identified customer needs and provided technical support',
            'Maintained accurate call records in database systems',
            'Built sustainable customer relationships'
        ]
    }
];

function loadExperience() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    experienceData.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', index * 100);

        const responsibilities = exp.responsibilities.map(resp => `<li>${resp}</li>`).join('');
        
        let linksHTML = '';
        if (exp.link) {
            linksHTML = `<a href="${exp.link}" target="_blank" class="timeline-link">
                <i class="fas fa-file-pdf"></i> View Experience Letter
            </a>`;
        } else if (exp.links) {
            linksHTML = '<div class="timeline-links">';
            exp.links.forEach(link => {
                linksHTML += `<a href="${link.url}" target="_blank" class="timeline-link">
                    <i class="fas fa-file-pdf"></i> ${link.text}
                </a>`;
            });
            linksHTML += '</div>';
        }

        item.innerHTML = `
            <div class="timeline-content">
                <span class="timeline-date">${exp.date}</span>
                <h3>${exp.title}</h3>
                <h4 class="timeline-company">${exp.company}</h4>
                <p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${exp.location}</p>
                <ul class="timeline-responsibilities">${responsibilities}</ul>
                ${linksHTML}
            </div>
        `;

        timeline.appendChild(item);
    });
}

loadExperience();

// ===================================
// Load Skills Data - Control Panel Style
// ===================================
const skillsData = [
    {
        name: 'Hardware & Systems',
        icon: 'fa-tools',
        level: 95
    },
    {
        name: 'Network Administration',
        icon: 'fa-network-wired',
        level: 92
    },
    {
        name: 'IT Operations',
        icon: 'fa-server',
        level: 90
    },
    {
        name: 'Technical Support',
        icon: 'fa-headset',
        level: 98
    },
    {
        name: 'Asset Management',
        icon: 'fa-database',
        level: 88
    },
    {
        name: 'Troubleshooting',
        icon: 'fa-bug',
        level: 96
    }
];

function loadSkills() {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    skillsGrid.innerHTML = '';

    skillsData.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        card.innerHTML = `
            <div class="skill-header">
                <h4 class="skill-name">${skill.name}</h4>
                <div class="skill-icon">
                    <i class="fas ${skill.icon}"></i>
                </div>
            </div>
            <div class="skill-progress">
                <div class="skill-fill" style="width: 0%" data-width="${skill.level}%"></div>
            </div>
        `;

        skillsGrid.appendChild(card);
    });

    // Animate skill bars
    setTimeout(() => {
        document.querySelectorAll('.skill-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }, 600);
}

loadSkills();

// ===================================
// Load Tech Stack
// ===================================
const techStack = [
    'Windows Server',
    'Active Directory',
    'Office 365',
    'SharePoint',
    'Network Protocols',
    'CCNA',
    'System Imaging',
    'Hardware Repair',
    'Ticketing Systems',
    'Asset Management',
    'SQL Basics',
    'EMR Systems'
];

function loadTechStack() {
    const techItems = document.querySelector('.tech-items');
    if (!techItems) return;

    techItems.innerHTML = '';

    techStack.forEach((tech, index) => {
        const badge = document.createElement('span');
        badge.className = 'tech-badge';
        badge.textContent = tech;
        badge.setAttribute('data-aos', 'zoom-in');
        badge.setAttribute('data-aos-delay', index * 40);

        techItems.appendChild(badge);
    });
}

loadTechStack();

// ===================================
// Load Languages
// ===================================
const languages = [
    { name: 'English', level: 'Native/Fluent' },
    { name: 'Urdu/Hindi', level: 'Native/Fluent' },
    { name: 'Pashto', level: 'Native/Fluent' }
];

function loadLanguages() {
    const languagesGrid = document.querySelector('.languages-grid');
    if (!languagesGrid) return;

    languagesGrid.innerHTML = '';

    languages.forEach((lang, index) => {
        const card = document.createElement('div');
        card.className = 'language-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        card.innerHTML = `
            <h5 class="language-name">${lang.name}</h5>
            <p class="language-level">${lang.level}</p>
        `;

        languagesGrid.appendChild(card);
    });
}

loadLanguages();

// ===================================
// Load Additional Certifications
// ===================================
const certificationsData = [
    {
        icon: 'fa-graduation-cap',
        title: 'Odoo ERP Training',
        description: 'Workshop covering business processes, product, vendor, and customer management.',
        link: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
    },
    {
        icon: 'fa-trophy',
        title: 'Aptech Graduation',
        description: 'Advanced Diploma in Software Engineering (ACCP) certification.',
        link: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
    },
    {
        icon: 'fa-hands-helping',
        title: 'MDX Career Fair',
        description: 'Certificate of appreciation for volunteering at the Middlesex University Career Fair.',
        link: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
    },
    {
        icon: 'fa-award',
        title: 'Safety Award - HIA',
        description: 'Recognition for following the best safety rules during the Airport Project.',
        link: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=drive_link'
    }
];

function loadCertifications() {
    const certsGrid = document.querySelector('.certs-grid');
    if (!certsGrid) return;

    certsGrid.innerHTML = '';

    certificationsData.forEach((cert, index) => {
        const card = document.createElement('div');
        card.className = 'cert-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        card.innerHTML = `
            <div class="cert-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <h4>${cert.title}</h4>
            <p>${cert.description}</p>
            <a href="${cert.link}" target="_blank" class="cert-btn">
                <i class="fas fa-eye"></i> View Certificate
            </a>
        `;

        certsGrid.appendChild(card);
    });
}

loadCertifications();

// ===================================
// Load Education
// ===================================
const educationData = [
    {
        icon: 'fa-university',
        degree: 'Bachelor of Science in IT',
        institution: 'Middlesex University Dubai',
        date: 'Sep 2024 - Jun 2025',
        certificateLink: 'https://drive.google.com/file/d/17IYNcUbLLQfEJS0_4VtscE6xejH7p4XB/view?usp=sharing' // Add your certificate link here
    },
    {
        icon: 'fa-laptop-code',
        degree: 'Advanced Diploma in Software Engineering',
        institution: 'Aptech Qatar',
        date: 'Nov 2020 - Nov 2023',
        certificateLink: 'https:/https://drive.google.com/file/d/1hYnsw-6tLpbGuWy4RZCoeGUPDkzIrNSr/view?usp=sharing' // Add your certificate link here
    },
    {
        icon: 'fa-school',
        degree: 'IGCSE',
        institution: 'Bright Future International School',
        date: 'Sep 2017 - Jul 2018'
    }
];

function loadEducation() {
    const educationGrid = document.querySelector('.education-grid');
    if (!educationGrid) return;

    educationGrid.innerHTML = '';

    educationData.forEach((edu, index) => {
        const card = document.createElement('div');
        card.className = 'edu-card';
        card.setAttribute('data-aos', 'flip-left');
        card.setAttribute('data-aos-delay', index * 100);

        const certificateButton = edu.certificateLink ? 
            `<a href="${edu.certificateLink}" target="_blank" class="edu-cert-btn">
                <i class="fas fa-certificate"></i>
                <span>View Certificate</span>
            </a>` : '';

        card.innerHTML = `
            <div class="edu-icon">
                <i class="fas ${edu.icon}"></i>
            </div>
            <h3>${edu.degree}</h3>
            <h4>${edu.institution}</h4>
            <p class="edu-date">${edu.date}</p>
            ${certificateButton}
        `;

        educationGrid.appendChild(card);
    });
}

loadEducation();

// ===================================
// Particle Animation for Hero
// ===================================
class ParticleAnimation {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.numberOfParticles = 40;
        this.init();
    }

    createCanvas() {
        const container = document.querySelector('.hero-particles');
        if (!container) return null;

        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.appendChild(canvas);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return canvas;
    }

    init() {
        if (!this.canvas) return;

        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.8 + 0.8,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.4 + 0.2
            });
        }

        this.animate();
    }

    animate() {
        if (!this.canvas || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 175, 55, ${particle.opacity})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

new ParticleAnimation();

// ===================================
// Smooth Scroll
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Premium Button Ripple Effect
// ===================================
document.querySelectorAll('.btn, .cert-btn, .timeline-link').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.5s ease-out;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 500);
    });
});

// Add ripple and cursor blink animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(3.5);
            opacity: 0;
        }
    }
    
    .cursor-blink {
        animation: blink 1s step-end infinite;
        color: var(--gold-bright);
    }
    
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===================================
// Language Switcher with i18n
// ===================================
const translations = {
    en: {
        nav_name: "Sajid Mehmood",
        nav_title: "IT Engineer",
        nav_status: "Available for opportunities",
        nav_home: "Home",
        nav_about: "About",
        nav_education: "Education",
        nav_experience: "Experience",
        nav_skills: "Skills",
        nav_certifications: "Certifications",
        nav_contact: "Contact",
        hero_greeting: "System Initializing...",
        hero_first_name: "Sajid",
        hero_last_name: "Mehmood",
        hero_description: "Elite IT Support Engineer with 4+ years of experience delivering exceptional technical support across healthcare, immigration, and telecom sectors. CCNA certified professional specializing in network architecture and infrastructure optimization.",
        btn_connect: "Initialize Connection",
        btn_download_cv: "Download Credentials",
        stat_years: "Years Experience",
        stat_tickets: "Tickets Resolved",
        stat_sla: "SLA Compliance",
        scroll_explore: "Scroll to explore control panels",
        about_title: "ABOUT ME",
        education_title: "EDUCATION",
        experience_title: "PROFESSIONAL EXPERIENCE",
        skills_title: "SKILLS & EXPERTISE",
        certifications_title: "CERTIFICATIONS & ACHIEVEMENTS",
        contact_title: "LET'S CONNECT",
        tech_stack_title: "Technical Arsenal",
        languages_title: "Languages",
        latest_achievement: "Latest Achievement",
        ccna_cert_title: "CCNA 200-301 Network Fundamentals",
        ccna_cert_issuer: "Simplilearn SkillUp",
        ccna_cert_date: "Completed: January 17, 2026",
        ccna_cert_desc: "Comprehensive certification covering network fundamentals, routing protocols, switching technologies, and enterprise network security principles. Certificate Code: 9726449",
        view_certificate: "View Certificate",
        contact_intro: "Ready to collaborate on innovative IT solutions? I'm always open to discussing new projects, technical challenges, or opportunities to contribute to cutting-edge technology initiatives. Let's connect.",
        contact_email: "Email",
        contact_phone: "Phone",
        contact_location: "Location",
        contact_location_value: "Doha, Qatar",
        footer_copyright: "© 2026 Sajid Mehmood. Engineered with precision.",
        footer_subtitle: "IT Engineer & Technical Support Specialist"
    },
    ar: {
        nav_name: "ساجد محمود",
        nav_title: "مهندس تقنية معلومات",
        nav_status: "متاح للفرص",
        nav_home: "الرئيسية",
        nav_about: "من أنا",
        nav_education: "التعليم",
        nav_experience: "الخبرة",
        nav_skills: "المهارات",
        nav_certifications: "الشهادات",
        nav_contact: "اتصل",
        hero_greeting: "تهيئة النظام...",
        hero_first_name: "ساجد",
        hero_last_name: "محمود",
        hero_description: "مهندس دعم تقني متميز بخبرة تزيد عن 4 سنوات في تقديم دعم فني استثنائي في قطاعات الرعاية الصحية والهجرة والاتصالات. متخصص معتمد CCNA في بنية الشبكات وتحسين البنية التحتية.",
        btn_connect: "بدء الاتصال",
        btn_download_cv: "تحميل السيرة الذاتية",
        stat_years: "سنوات خبرة",
        stat_tickets: "تذاكر محلولة",
        stat_sla: "الامتثال لاتفاقية مستوى الخدمة",
        scroll_explore: "مرر لاستكشاف لوحات التحكم",
        about_title: "من أنا",
        education_title: "التعليم",
        experience_title: "الخبرة المهنية",
        skills_title: "المهارات والخبرة",
        certifications_title: "الشهادات والإنجازات",
        contact_title: "تواصل معي",
        tech_stack_title: "الأدوات التقنية",
        languages_title: "اللغات",
        latest_achievement: "آخر إنجاز",
        ccna_cert_title: "CCNA 200-301 أساسيات الشبكات",
        ccna_cert_issuer: "Simplilearn SkillUp",
        ccna_cert_date: "مكتمل: 17 يناير 2026",
        ccna_cert_desc: "شهادة شاملة تغطي أساسيات الشبكات وبروتوكولات التوجيه وتقنيات التبديل ومبادئ أمان الشبكات المؤسسية. رمز الشهادة: 9726449",
        view_certificate: "عرض الشهادة",
        contact_intro: "مستعد للتعاون في حلول تقنية مبتكرة؟ أنا دائمًا منفتح لمناقشة مشاريع جديدة وتحديات تقنية أو فرص للمساهمة في مبادرات تكنولوجية متطورة. لنتواصل.",
        contact_email: "البريد الإلكتروني",
        contact_phone: "الهاتف",
        contact_location: "الموقع",
        contact_location_value: "الدوحة، قطر",
        footer_copyright: "© 2026 ساجد محمود. مصمم بدقة.",
        footer_subtitle: "مهندس تقنية معلومات ومتخصص دعم فني"
    }
};

function changeLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update all text with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');

    // Save choice
    localStorage.setItem('lang', lang);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    changeLanguage(savedLang);
});

console.log('🎯 Luxury IT Engineer Portfolio Loaded Successfully!');
