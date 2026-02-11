// ===================================
// EXECUTIVE WALNUT & GLASS PORTFOLIO
// Modern JavaScript - 2026
// ===================================

'use strict';

// ===================================
// INITIALIZE ON DOM LOAD
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeAOS();
    initializeCustomCursor();
    initializeMobileNav();
    initializeActiveNavigation();
    initializeTypingEffect();
    initializeCounters();
    loadExperience();
    loadSkills();
    loadTechStack();
    loadLanguages();
    loadCertifications();
    loadEducation();
    initializeParticles();
    initializeSmoothScroll();
    initializeButtonEffects();
    
    console.log('✅ Executive Walnut Portfolio Initialized');
});

// ===================================
// AOS ANIMATION INITIALIZATION
// ===================================
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
            disable: 'mobile'
        });
    }
}

// ===================================
// CUSTOM CURSOR
// ===================================
function initializeCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower || window.innerWidth <= 1024) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor movement
    function animateCursor() {
        const speed = 0.15;
        const followerSpeed = 0.08;
        
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        followerX += (mouseX - followerX) * followerSpeed;
        followerY += (mouseY - followerY) * followerSpeed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Scale cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link, .tag, .tech-item');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.style.transform = 'scale(1.6)';
            cursor.style.transform = 'scale(0.7)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorFollower.style.transform = 'scale(1)';
            cursor.style.transform = 'scale(1)';
        });
    });
}

// ===================================
// MOBILE NAVIGATION
// ===================================
function initializeMobileNav() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const sideNav = document.getElementById('sideNav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileToggle || !sideNav) return;
    
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        sideNav.classList.toggle('active');
    });
    
    // Close nav on link click (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                mobileToggle.classList.remove('active');
                sideNav.classList.remove('active');
            }
        });
    });
    
    // Close nav on outside click (mobile)
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
// ACTIVE NAVIGATION HIGHLIGHTING
// ===================================
function initializeActiveNavigation() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    
    function updateActiveNav() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 180) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
}

// ===================================
// TYPING EFFECT
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
        
        let typeSpeed = this.isDeleting ? 50 : 95;
        
        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 450;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

function initializeTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    
    if (typingElement) {
        const words = [
            'IT Support Engineer',
            'Technical Specialist',
            'CCNA Certified Professional',
            'Network Administrator'
        ];
        new TypeWriter(typingElement, words, 2200);
    }
}

// ===================================
// COUNTER ANIMATION
// ===================================
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;
    
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateCounters(counters);
            }
        });
    }, { threshold: 0.4 });
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);
}

function animateCounters(counters) {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const duration = 1800;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// ===================================
// LOAD EXPERIENCE DATA
// ===================================
function loadExperience() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    const experienceData = [
        {
            date: 'Apr 2025 - Aug 2025',
            title: 'IT Executive & Business Development Intern',
            company: 'Al Tawkel Immigration Center',
            location: 'Dubai, UAE',
            responsibilities: [
                'Delivered Level 2 IT support, including hardware repairs, system reimaging, network troubleshooting',
                'Installed, configured, and maintained enterprise IT infrastructure',
                'Created and maintained digital IT asset records',
                'Assisted with immigration business operations'
            ],
            link: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing'
        },
        {
            date: 'Nov 2023 - Feb 2024',
            title: 'IT Support Engineer',
            company: 'Military Medical City Hospital (MMCH)',
            location: 'Doha, Qatar',
            subLocations: [
                'TVH (The View Hospital)',
                'KMC (Korean Medical Center)'
            ],
            responsibilities: [
                'Managed 500+ support tickets across three hospitals, ensuring 95% SLA compliance',
                'Performed system reimaging and OS deployment for 300+ medical staff',
                'Supported EMR application troubleshooting for doctors and nurses',
                'Maintained digital asset inventory, improving lifecycle management'
            ],
            link: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing'
        },
        {
            date: 'Feb 2022 - Nov 2023',
            title: 'IT Support Engineer / IT Officer',
            company: 'Power International Holding - Star Link / UBT Joint Venture',
            location: 'Head Office: The 18th Tower, Lusail | Project Site: Hamad International Airport, Doha, Qatar',
            project: 'Western Taxiway & Stand Development Works (HIAEP/0012)',
            responsibilities: [
                'Delivered daily IT support for 200+ staff across retail and corporate offices',
                'Resolved L1 & L2 incidents with quick turnaround times',
                'Managed IT support for the Hamad International Airport Expansion Project',
                'Monitored and documented IT assets, reducing missing equipment by 10%',
                'Coordinated IT operations between Lusail head office and airport project site'
            ],
            links: [
                { text: 'Starlink Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
                { text: 'Airport Project Letter', url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
            ]
        },
        {
            date: 'May 2021 - Feb 2022',
            title: 'Customer Service Agent',
            company: 'STARLINK (Ooredoo Telecommunications Company)',
            location: 'Qatar',
            responsibilities: [
                'Handled inbound/outbound customer calls with resolution focus',
                'Identified customer needs and provided technical support',
                'Maintained accurate call records in database systems',
                'Built sustainable customer relationships'
            ]
        }
    ];
    
    timeline.innerHTML = '';
    
    experienceData.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', index * 90);
        
        const responsibilities = exp.responsibilities.map(resp => `<li>${resp}</li>`).join('');
        
        let projectHTML = '';
        if (exp.project) {
            projectHTML = `<p class="timeline-project" style="font-size: 0.9rem; color: var(--copper-light); margin-bottom: 12px;"><i class="fas fa-briefcase"></i> ${exp.project}</p>`;
        }
        
        let subLocationsHTML = '';
        if (exp.subLocations && exp.subLocations.length > 0) {
            subLocationsHTML = '<div class="timeline-sublocations">';
            exp.subLocations.forEach((subLoc, idx) => {
                subLocationsHTML += `<p class="timeline-sublocation">${idx + 1}. ${subLoc}</p>`;
            });
            subLocationsHTML += '</div>';
        }
        
        let linksHTML = '';
        if (exp.link) {
            linksHTML = `<a href="${exp.link}" target="_blank" class="exp-link">
                <i class="fas fa-file-pdf"></i> View Experience Letter
            </a>`;
        } else if (exp.links) {
            linksHTML = '<div class="exp-links" style="display: flex; gap: 10px; flex-wrap: wrap;">';
            exp.links.forEach(link => {
                linksHTML += `<a href="${link.url}" target="_blank" class="exp-link">
                    <i class="fas fa-file-pdf"></i> ${link.text}
                </a>`;
            });
            linksHTML += '</div>';
        }
        
        item.innerHTML = `
            <div class="timeline-content">
                <span class="timeline-date">${exp.date}</span>
                <h3>${exp.title}</h3>
                <h4>${exp.company}</h4>
                <p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${exp.location}</p>
                ${subLocationsHTML}
                ${projectHTML}
                <ul>${responsibilities}</ul>
                ${linksHTML}
            </div>
        `;
        
        timeline.appendChild(item);
    });
}

// ===================================
// LOAD SKILLS DATA
// ===================================
function loadSkills() {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;
    
    const skillsData = [
        {
            icon: 'fa-tools',
            title: 'Hardware & Systems',
            tags: ['System Reimaging', 'Hardware Repair', 'OS Troubleshooting', 'System Setup']
        },
        {
            icon: 'fa-network-wired',
            title: 'Network & Infrastructure',
            tags: ['LAN/WAN Support', 'Active Directory', 'SharePoint', 'Network Troubleshooting', 'CCNA Certified']
        },
        {
            icon: 'fa-server',
            title: 'IT Operations',
            tags: ['Asset Management', 'Ticket Resolution', 'SLA Compliance', 'Lifecycle Management']
        },
        {
            icon: 'fa-users',
            title: 'Support & Training',
            tags: ['Level 1 & 2 Support', 'User Training', 'Onboarding', 'Team Coordination']
        }
    ];
    
    skillsGrid.innerHTML = '';
    
    skillsData.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 95);
        
        const tags = skill.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <div class="skill-icon">
                <i class="fas ${skill.icon}"></i>
            </div>
            <h3>${skill.title}</h3>
            <div class="skill-tags">${tags}</div>
        `;
        
        skillsGrid.appendChild(card);
    });
}

// ===================================
// LOAD TECH STACK
// ===================================
function loadTechStack() {
    const techItems = document.querySelector('.tech-items');
    if (!techItems) return;
    
    const techStack = [
        { icon: 'fab fa-windows', name: 'Windows' },
        { icon: 'fab fa-apple', name: 'macOS' },
        { icon: 'fas fa-cloud', name: 'Office 365' },
        { icon: 'fas fa-network-wired', name: 'Networking' },
        { icon: 'fab fa-js', name: 'JavaScript' },
        { icon: 'fas fa-database', name: 'SQL' }
    ];
    
    techItems.innerHTML = '';
    
    techStack.forEach((tech, index) => {
        const item = document.createElement('div');
        item.className = 'tech-item';
        item.setAttribute('data-aos', 'zoom-in');
        item.setAttribute('data-aos-delay', index * 45);
        
        item.innerHTML = `
            <i class="${tech.icon}"></i>
            <span>${tech.name}</span>
        `;
        
        techItems.appendChild(item);
    });
}

// ===================================
// LOAD LANGUAGES
// ===================================
function loadLanguages() {
    const languagesGrid = document.querySelector('.languages-grid');
    if (!languagesGrid) return;
    
    const languages = [
        { name: 'English', percentage: 100 },
        { name: 'Urdu/Hindi', percentage: 100 },
        { name: 'Pashto', percentage: 100 }
    ];
    
    languagesGrid.innerHTML = '';
    
    languages.forEach((lang, index) => {
        const item = document.createElement('div');
        item.className = 'language-item';
        item.setAttribute('data-aos', 'fade-right');
        item.setAttribute('data-aos-delay', index * 95);
        
        item.innerHTML = `
            <span class="language-name">${lang.name}</span>
            <div class="language-bar-container">
                <div class="language-bar" style="width: 0%" data-width="${lang.percentage}%"></div>
            </div>
            <span class="language-percent">${lang.percentage}%</span>
        `;
        
        languagesGrid.appendChild(item);
    });
    
    // Animate language bars
    setTimeout(() => {
        document.querySelectorAll('.language-bar').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }, 450);
}

// ===================================
// LOAD CERTIFICATIONS
// ===================================
function loadCertifications() {
    const certsGrid = document.querySelector('.certs-grid');
    if (!certsGrid) return;
    
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
        },
        {
            icon: 'fa-camera',
            title: 'Photography Contest',
            description: 'Participation in the TECHVIBES 2023 Photography contest at Aptech Qatar.',
            link: 'https://drive.google.com/file/d/12sPuwNrd2uWZfszUXMKbOVUFOGgzD0Uo/view?usp=drive_link'
        }
    ];
    
    certsGrid.innerHTML = '';
    
    certificationsData.forEach((cert, index) => {
        const card = document.createElement('div');
        card.className = 'cert-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 95);
        
        card.innerHTML = `
            <div class="cert-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <h4>${cert.title}</h4>
            <p>${cert.description}</p>
            <a href="${cert.link}" target="_blank" class="doc-btn">
                <i class="fas fa-eye"></i> View Certificate
            </a>
        `;
        
        certsGrid.appendChild(card);
    });
}

// ===================================
// LOAD EDUCATION
// ===================================
function loadEducation() {
    const educationGrid = document.querySelector('.education-grid');
    if (!educationGrid) return;
    
    const educationData = [
        {
            icon: 'fa-university',
            degree: 'Bachelor of Science in IT',
            institution: 'Middlesex University Dubai',
            date: 'Sep 2024 - Jun 2025'
        },
        {
            icon: 'fa-laptop-code',
            degree: 'Advanced Diploma in Software Engineering',
            institution: 'Aptech Qatar',
            date: 'Nov 2020 - Nov 2023'
        },
        {
            icon: 'fa-school',
            degree: 'IGCSE',
            institution: 'Bright Future International School',
            date: 'Sep 2017 - Jul 2018'
        }
    ];
    
    educationGrid.innerHTML = '';
    
    educationData.forEach((edu, index) => {
        const card = document.createElement('div');
        card.className = 'edu-card';
        card.setAttribute('data-aos', 'flip-left');
        card.setAttribute('data-aos-delay', index * 95);
        
        card.innerHTML = `
            <div class="edu-icon">
                <i class="fas ${edu.icon}"></i>
            </div>
            <h3>${edu.degree}</h3>
            <h4>${edu.institution}</h4>
            <p class="edu-date">${edu.date}</p>
        `;
        
        educationGrid.appendChild(card);
    });
}

// ===================================
// PARTICLE ANIMATION
// ===================================
function initializeParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const numberOfParticles = 40;
    
    // Create particles
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.4 + 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(184, 115, 51, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initializeSmoothScroll() {
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
}

// ===================================
// BUTTON RIPPLE EFFECTS
// ===================================
function initializeButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .doc-btn, .download-btn, .cert-btn');
    
    buttons.forEach(button => {
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
                animation: ripple-effect 0.55s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 550);
        });
    });
}

// ===================================
// ADD DYNAMIC STYLES
// ===================================
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cursor-blink {
        animation: cursor-blink-anim 1s step-end infinite;
    }
    
    @keyframes cursor-blink-anim {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    
    .timeline-project {
        font-size: 0.9rem;
        color: var(--copper-light);
        margin-bottom: 12px;
    }
    
    .exp-links {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
`;

document.head.appendChild(dynamicStyles);
