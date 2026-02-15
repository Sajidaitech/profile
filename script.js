// ===================================
// LUXURY IT ENGINEER PORTFOLIO
// Premium Dashboard Interactions
// VERSION: Moon Upward Bowl Shape - Feb 15, 2026 v3
// ===================================

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
            'Delivered comprehensive Level 2 IT support, including advanced hardware diagnostics, repairs, system reimaging, and network troubleshooting',
            'Installed, configured, and maintained enterprise IT infrastructure components including servers, workstations, and network equipment',
            'Created and maintained comprehensive digital IT asset records, improving inventory accuracy and lifecycle management',
            'Assisted with immigration business operations and client support, providing technical solutions for visa processing systems',
            'Implemented preventive maintenance schedules for IT equipment, reducing unexpected downtime by proactive issue resolution',
            'Provided end-user training on new systems and applications to enhance staff productivity and technology adoption'
        ],
        experienceLetter: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing'
    },
    {
        date: 'Nov 2023 - Feb 2024',
        title: 'IT Support Engineer',
        company: 'Elegancia HealthCare (Military Medical City Hospital)',
        location: 'Doha, Qatar',
        projects: [
            '1. EWS-MMC (Qatar Armed Force Military Medical City Hospital)',
            '2. TVH (The View Hospital)',
            '3. KMC (Korean Medical Center)'
        ],
        responsibilities: [
            'Spearheaded the resolution of 500+ high-priority support tickets across three hospital facilities, consistently maintaining a 95% SLA compliance rate',
            'Installed and configured computer hardware, operating systems, and healthcare-specific applications across multiple medical centers',
            'Executed large-scale system reimaging and automated OS deployment using SCCM/MDT for 300+ medical workstations to minimize clinical downtime',
            'Provided specialized technical support for Electronic Medical Record (EMR) applications, ensuring seamless data access for doctors and nursing staff',
            'Monitored and maintained critical computer systems and networks, ensuring 24/7 uptime for medical IoT devices and patient care systems',
            'Delivered face-to-face and remote technical support, guiding healthcare staff through complex system configurations and issue resolution',
            'Troubleshot system and network problems, diagnosing and solving hardware or software faults in high-pressure medical environments',
            'Performed hardware repairs and break-fix operations on medical workstations, minimizing equipment downtime',
            'Resolved system slowness issues and performed online software updates to maintain optimal system performance',
            'Troubleshot and resolved mail-related problems in Office 365, Outlook Express, and Microsoft Outlook for medical staff',
            'Configured email clients and performed backup and restore operations to ensure data integrity and business continuity',
            'Installed and configured network printers (Sharp, HP, Canon), troubleshooting printer connectivity issues across hospital departments',
            'Optimized digital asset inventory protocols, implementing a tracking system that significantly improved hardware lifecycle management and procurement planning',
            'Collaborated with the network team to troubleshoot connectivity issues within critical care units, maintaining strict HIPAA compliance standards'
        ],
        experienceLetter: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing'
    },
    {
        date: 'Feb 2022 - Nov 2023',
        title: 'IT Support Engineer',
        company: 'Star Link (Client: Power International Holding)',
        location: 'Doha, Qatar',
        project: 'HIA Western Taxiway & Stand Development Works (May 2022 - Oct 2023)',
        responsibilities: [
            'Delivered comprehensive L1 and L2 technical support for a diverse user base of 200+ employees across retail, corporate, and construction site offices',
            'Managed the end-to-end IT infrastructure setup for the Hamad International Airport Expansion Project (HIAEP) site offices, including hardware staging and peripheral configuration',
            'Installed and configured computer hardware, operating systems, and specialized engineering applications for airport construction project teams',
            'Monitored and maintained computer systems and networks across multiple remote construction sites, ensuring reliable connectivity',
            'Provided face-to-face and remote technical support to staff and clients, resolving complex configuration and system issues',
            'Troubleshot system and network problems, diagnosing and solving hardware or software faults in challenging field environments',
            'Performed hardware repairs and break-fix operations, minimizing downtime for critical project management systems',
            'Executed system reimaging and hard drive troubleshooting to resolve software issues and restore system functionality',
            'Conducted troubleshooting and maintenance of computers, operating systems, and network infrastructure',
            'Resolved mail-related problems in Office 365, Outlook Express, and Microsoft Outlook for project personnel',
            'Configured email clients including Outlook Express and Office 365, performing backup and restore operations',
            'Installed and configured network printers (Sharp, HP, Canon) and troubleshot printer connectivity issues across project sites',
            'Resolved system slowness problems and performed online software updates to maintain optimal performance',
            'Administered Active Directory user accounts, group policies, and Office 365 permissions to ensure secure access for project personnel',
            'Provided specialized technical support for engineering tools including AutoCAD and Primavera P6, ensuring project teams maintained productivity',
            'Monitored and audited IT asset movements across multiple project sites, reducing equipment loss and discrepancies by 20% through rigorous documentation',
            'Implemented standardized troubleshooting checklists, reducing average ticket turnaround time and improving service efficiency'
        ],
        experienceLetters: [
            { 
                text: 'Starlink Experience Letter', 
                url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' 
            },
            { 
                text: 'Airport Project Letter', 
                url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' 
            }
        ]
    },
    {
        date: 'May 2021 - Feb 2022',
        title: 'Customer Service Agent',
        company: 'STARLINK (Ooredoo International Telecommunications)',
        location: 'Qatar',
        responsibilities: [
            'Received inbound calls including transferred sales leads and calls from current and potential customers for international telecommunications services',
            'Managed large amounts of inbound and outbound calls in a timely manner, maintaining high service quality standards',
            'Identified customer needs, clarified information, researched every issue, and provided solutions and/or alternatives',
            'Placed outbound follow-up calls to sales leads and persuaded potential customers to complete and submit applications',
            'Answered questions about product details, company policies, and accounting issues for diverse international clientele',
            'Assisted customers with technical issues experienced with network and connectivity services, providing immediate remote support',
            'Utilized advanced diagnostic questioning to provide remote technical support for mobile and telecommunications services',
            'Built sustainable relationships and engaged customers by going the extra mile in service delivery',
            'Kept records of all conversations in the call center database in a comprehensible way, maintaining meticulous data integrity',
            'Frequently attended educational seminars to improve knowledge and performance level, staying current with product offerings',
            'Achieved consistently high customer satisfaction scores through effective problem resolution and professional communication',
            'Collaborated with technical teams to escalate and resolve complex network and service issues affecting multiple customers'
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
        
        // Handle projects for experiences with multiple projects
        let projectsHTML = '';
        if (exp.projects) {
            projectsHTML = `
                <div class="timeline-projects">
                    <strong>Projects:</strong>
                    <ul class="projects-list">
                        ${exp.projects.map(proj => `<li>${proj}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else if (exp.project) {
            projectsHTML = `
                <div class="timeline-projects">
                    <strong>Project:</strong> ${exp.project}
                </div>
            `;
        }
        
        // Handle experience letter links
        let lettersHTML = '';
        if (exp.experienceLetter) {
            // Single experience letter
            lettersHTML = `
                <div class="experience-actions">
                    <a href="${exp.experienceLetter}" target="_blank" class="timeline-link">
                        <i class="fas fa-file-pdf"></i> View Experience Letter
                    </a>
                </div>
            `;
        } else if (exp.experienceLetters && exp.experienceLetters.length > 0) {
            // Multiple experience letters
            lettersHTML = '<div class="experience-actions">';
            exp.experienceLetters.forEach(letter => {
                lettersHTML += `
                    <a href="${letter.url}" target="_blank" class="timeline-link">
                        <i class="fas fa-file-pdf"></i> ${letter.text}
                    </a>
                `;
            });
            lettersHTML += '</div>';
        }

        item.innerHTML = `
            <div class="timeline-content">
                <span class="timeline-date">${exp.date}</span>
                <h3>${exp.title}</h3>
                <h4 class="timeline-company">${exp.company}</h4>
                <p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${exp.location}</p>
                ${projectsHTML}
                <ul class="timeline-responsibilities">${responsibilities}</ul>
                ${lettersHTML}
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
    { name: 'English', level: 'Fluent' },
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
        certificateLink: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
    },
    {
        icon: 'fa-trophy',
        title: 'Aptech Graduation',
        description: 'Advanced Diploma in Software Engineering (ACCP) certification.',
        certificateLink: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
    },
    {
        icon: 'fa-hands-helping',
        title: 'MDX Career Fair',
        description: 'Certificate of appreciation for volunteering at the Middlesex University Career Fair.',
        certificateLink: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
    },
    {
        icon: 'fa-award',
        title: 'Safety Award - HIA',
        description: 'Recognition for following the best safety rules during the Airport Project.',
        certificateLink: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=drive_link'
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

        const certButton = cert.certificateLink ? 
            `<a href="${cert.certificateLink}" target="_blank" class="cert-btn">
                <i class="fas fa-eye"></i> View Certificate
            </a>` : '';

        card.innerHTML = `
            <div class="cert-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <h4>${cert.title}</h4>
            <p>${cert.description}</p>
            ${certButton}
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
        certificateLink: 'https://drive.google.com/file/d/17IYNcUbLLQfEJS0_4VtscE6xejH7p4XB/view?usp=sharing'
    },
    {
        icon: 'fa-laptop-code',
        degree: 'Advanced Diploma in Software Engineering',
        institution: 'Aptech Qatar',
        date: 'Nov 2020 - Nov 2023',
        certificateLink: 'https://drive.google.com/file/d/1J_d7bN2xAYlI33Uzp5YQPZ3kt8fFHamy/view?usp=sharing'
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
// Wood Table Workspace Animation
// ===================================
class WoodTableWorkspaceAnimation {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.techItems = [];
        this.showTable = false; // Will show table only on hero section
        this.init();
    }

    createCanvas() {
        const container = document.querySelector('.hero-particles');
        if (!container) return null;

        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0'; // Changed to 0 so text appears in front
        container.appendChild(canvas);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.techItems = [];
            this.createTechItems();
        });

        return canvas;
    }

    createTechItems() {
        // Position items on the wood table (realistic workspace layout)
        const items = [
            // Left side - Laptop setup
            { type: 'laptop', x: 20, y: 50, size: 180, rotation: 0, zIndex: 3 },
            { type: 'mouse', x: 35, y: 58, size: 50, rotation: -15, zIndex: 2 },
            { type: 'mousepad', x: 32, y: 55, size: 120, rotation: 2, zIndex: 1 },
            
            // Center - Notebook and pen
            { type: 'notebook', x: 50, y: 52, size: 100, rotation: 8, zIndex: 2 },
            { type: 'pen', x: 55, y: 48, size: 60, rotation: -35, zIndex: 3 },
            
            // Right side - Monitor and iPad
            { type: 'monitor', x: 70, y: 45, size: 140, rotation: 0, zIndex: 4 },
            { type: 'keyboard', x: 70, y: 60, size: 110, rotation: 0, zIndex: 2 },
            { type: 'ipad', x: 85, y: 55, size: 90, rotation: -5, zIndex: 2 }
        ];

        items.forEach(item => {
            this.techItems.push({
                type: item.type,
                x: (this.canvas.width * item.x) / 100,
                y: (this.canvas.height * item.y) / 100,
                size: item.size,
                rotation: item.rotation * (Math.PI / 180),
                zIndex: item.zIndex,
                shadow: true
            });
        });
        
        // Sort by zIndex for proper layering
        this.techItems.sort((a, b) => a.zIndex - b.zIndex);
    }

    checkIfHeroSection() {
        // Check if we're viewing the hero section
        const heroSection = document.querySelector('#home');
        if (!heroSection) return false;
        
        const rect = heroSection.getBoundingClientRect();
        // Show table if hero section is at least 30% visible
        return rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
    }

    init() {
        if (!this.canvas) return;

        // Create tech items
        this.createTechItems();

        this.animate();
    }

    getStarColor() {
        const rand = Math.random();
        if (rand < 0.5) return { r: 255, g: 240, b: 220 }; // Warm white
        if (rand < 0.7) return { r: 255, g: 220, b: 200 }; // Peachy white
        if (rand < 0.85) return { r: 255, g: 200, b: 180 }; // Soft orange
        if (rand < 0.95) return { r: 240, g: 180, b: 200 }; // Pink-white
        return { r: 220, g: 160, b: 220 }; // Soft purple
    }

    createMoonCraters() {
        // Generate realistic crater positions
        const numCraters = 15;
        for (let i = 0; i < numCraters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.moon.radius * 0.7;
            const size = Math.random() * 12 + 3;
            
            this.moon.craterPositions.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                radius: size,
                depth: Math.random() * 0.3 + 0.2
            });
        }
    }

    createShootingStar() {
        this.shootingStars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.5,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 8 + 4,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
            opacity: 1,
            life: 100
        });
    }

    createClouds() {
        // Create 6-10 realistic wispy clouds spread throughout sky
        const numberOfClouds = Math.floor(Math.random() * 5) + 6;
        
        for (let i = 0; i < numberOfClouds; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height, // Spread across entire sky
                width: Math.random() * 300 + 180,
                height: Math.random() * 70 + 40,
                speed: Math.random() * 0.15 + 0.05, // Slower, more natural
                opacity: Math.random() * 0.3 + 0.5, // More visible for daytime
                puffCount: Math.floor(Math.random() * 5) + 6,
                depth: Math.random(),
                wispiness: Math.random() * 0.4 + 0.6 // More wispy
            });
        }
    }

    drawClouds() {
        if (!this.ctx) return;

        this.clouds.forEach(cloud => {
            // Move clouds slowly
            cloud.x += cloud.speed;

            // Wrap around screen
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }

            this.ctx.save();
            this.ctx.globalAlpha = cloud.opacity;

            // Draw cloud as multiple overlapping circles with natural variation
            const puffRadius = cloud.height / 2;
            const spacing = cloud.width / cloud.puffCount;

            for (let i = 0; i < cloud.puffCount; i++) {
                const progress = i / (cloud.puffCount - 1);
                const x = cloud.x + (i * spacing) + (Math.sin(progress * Math.PI) * 25);
                const y = cloud.y + (Math.sin(i * 0.6) * puffRadius * 0.5);
                
                // Vary radius for natural shape - thinner at edges
                const edgeFactor = Math.sin(progress * Math.PI);
                const radius = puffRadius * (0.5 + edgeFactor * 0.7) * cloud.wispiness;

                // Create wispy, natural gradient - evening pink/purple clouds
                const gradient = this.ctx.createRadialGradient(
                    x, y, 0,
                    x, y, radius * 1.8
                );
                
                // Evening cloud colors - pink, purple, and warm tones
                gradient.addColorStop(0, 'rgba(255, 200, 220, 0.85)'); // Soft pink
                gradient.addColorStop(0.3, 'rgba(255, 180, 210, 0.65)'); // Pink
                gradient.addColorStop(0.5, 'rgba(240, 160, 200, 0.45)'); // Rose
                gradient.addColorStop(0.7, 'rgba(220, 140, 190, 0.25)'); // Muted rose
                gradient.addColorStop(1, 'rgba(200, 120, 180, 0)'); // Purple fade

                this.ctx.beginPath();
                this.ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add secondary puff for natural depth
                if (Math.random() > 0.5) {
                    const offsetX = (Math.random() - 0.5) * radius * 0.8;
                    const offsetY = (Math.random() - 0.5) * radius * 0.6;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x + offsetX, y + offsetY, radius * 0.8, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });
    }

    drawWoodTable() {
        if (!this.ctx) return;
        
        const tableY = this.canvas.height * 0.35; // Table starts at 35% from top
        const tableHeight = this.canvas.height * 0.65; // Takes up bottom 65%
        
        // Draw realistic wood texture
        const woodGradient = this.ctx.createLinearGradient(0, tableY, 0, this.canvas.height);
        woodGradient.addColorStop(0, '#8B6F47'); // Lighter wood
        woodGradient.addColorStop(0.3, '#7A5C3C');
        woodGradient.addColorStop(0.6, '#6B4E2E'); // Medium wood
        woodGradient.addColorStop(1, '#5A3F22'); // Darker wood
        
        this.ctx.fillStyle = woodGradient;
        this.ctx.fillRect(0, tableY, this.canvas.width, tableHeight);
        
        // Add wood grain texture
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        for (let i = 0; i < 30; i++) {
            const y = tableY + Math.random() * tableHeight;
            const length = Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2;
            const x = Math.random() * (this.canvas.width - length);
            
            this.ctx.strokeStyle = Math.random() > 0.5 ? '#4A3420' : '#9B7E5A';
            this.ctx.lineWidth = Math.random() * 2 + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + length, y + (Math.random() - 0.5) * 10);
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        // Add subtle table edge shadow
        const edgeShadow = this.ctx.createLinearGradient(0, tableY - 20, 0, tableY + 20);
        edgeShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
        edgeShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = edgeShadow;
        this.ctx.fillRect(0, tableY - 20, this.canvas.width, 40);
        
        // Add some ambient lighting on table
        const lightGradient = this.ctx.createRadialGradient(
            this.canvas.width * 0.5, tableY + tableHeight * 0.3, 0,
            this.canvas.width * 0.5, tableY + tableHeight * 0.3, this.canvas.width * 0.6
        );
        lightGradient.addColorStop(0, 'rgba(255, 250, 240, 0.08)');
        lightGradient.addColorStop(0.6, 'rgba(255, 250, 240, 0.02)');
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = lightGradient;
        this.ctx.fillRect(0, tableY, this.canvas.width, tableHeight);
    }

    drawTechItems() {
        if (!this.ctx) return;

        this.techItems.forEach(item => {
            this.ctx.save();
            
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.rotation);
            
            // Draw shadow for items on table
            if (item.shadow) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.ellipse(0, item.size * 0.4, item.size * 0.5, item.size * 0.15, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
            
            // Draw based on type
            switch(item.type) {
                case 'laptop':
                    this.drawLaptop(item.size);
                    break;
                case 'monitor':
                    this.drawMonitor(item.size);
                    break;
                case 'keyboard':
                    this.drawKeyboard(item.size);
                    break;
                case 'mouse':
                    this.drawMouse(item.size);
                    break;
                case 'notebook':
                    this.drawNotebook(item.size);
                    break;
                case 'ipad':
                    this.drawIpad(item.size);
                    break;
                case 'pen':
                    this.drawPen(item.size);
                    break;
                case 'mousepad':
                    this.drawMousepad(item.size);
                    break;
            }
            
            this.ctx.restore();
        });
    }

    drawLaptop(size) {
        // MacBook-style laptop
        const baseHeight = size * 0.55;
        const screenHeight = size * 0.75;
        
        // Laptop base (bottom part) - aluminum look
        const baseGradient = this.ctx.createLinearGradient(-size/2, 0, size/2, 0);
        baseGradient.addColorStop(0, '#c0c0c0');
        baseGradient.addColorStop(0.5, '#e8e8e8');
        baseGradient.addColorStop(1, '#b8b8b8');
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(-size/2, 0, size, baseHeight);
        
        // Base 3D edge
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.fillRect(-size/2, baseHeight - 5, size, 5);
        
        // Trackpad
        this.ctx.strokeStyle = '#909090';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(-size * 0.25, baseHeight * 0.4, size * 0.5, baseHeight * 0.35);
        
        // Keyboard area
        this.ctx.fillStyle = '#1a1a1a';
        const keySpacing = size / 14;
        const keySize = size / 18;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 12; j++) {
                const keyX = -size/2 + 20 + j * keySpacing;
                const keyY = baseHeight * 0.15 + i * (keySpacing * 0.8);
                
                // Key gradient for 3D effect
                const keyGrad = this.ctx.createLinearGradient(keyX, keyY, keyX, keyY + keySize);
                keyGrad.addColorStop(0, '#4a4a4a');
                keyGrad.addColorStop(1, '#2a2a2a');
                this.ctx.fillStyle = keyGrad;
                this.ctx.fillRect(keyX, keyY, keySize, keySize);
            }
        }
        
        // Screen back (aluminum)
        const screenBackGrad = this.ctx.createLinearGradient(-size/2.2, -screenHeight, size/2.2, -screenHeight);
        screenBackGrad.addColorStop(0, '#b0b0b0');
        screenBackGrad.addColorStop(0.5, '#d8d8d8');
        screenBackGrad.addColorStop(1, '#a8a8a8');
        this.ctx.fillStyle = screenBackGrad;
        this.ctx.fillRect(-size/2.2, -screenHeight, size * 0.91, screenHeight);
        
        // Screen bezel (thin black border)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-size/2.2, -screenHeight, size * 0.91, screenHeight);
        
        // Screen display (glowing)
        const screenGrad = this.ctx.createRadialGradient(0, -screenHeight/2, 0, 0, -screenHeight/2, size * 0.6);
        screenGrad.addColorStop(0, '#6ea8dc');
        screenGrad.addColorStop(0.5, '#4a86c4');
        screenGrad.addColorStop(1, '#2d5a8c');
        this.ctx.fillStyle = screenGrad;
        this.ctx.fillRect(-size/2.35, -screenHeight * 0.94, size * 0.85, screenHeight * 0.88);
        
        // Screen reflection/shine
        const shineGrad = this.ctx.createLinearGradient(0, -screenHeight, 0, -screenHeight/2);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = shineGrad;
        this.ctx.fillRect(-size/2.35, -screenHeight * 0.94, size * 0.85, screenHeight * 0.4);
        
        // Camera dot
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.beginPath();
        this.ctx.arc(0, -screenHeight * 0.9, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Logo (Apple-style)
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.font = `${size * 0.15}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💻', 0, -screenHeight * 0.45);
    }

    drawMonitor(size) {
        // Modern monitor with thin bezels
        
        // Stand base
        const baseGrad = this.ctx.createLinearGradient(-size * 0.25, size * 0.75, size * 0.25, size * 0.85);
        baseGrad.addColorStop(0, '#a0a0a0');
        baseGrad.addColorStop(1, '#707070');
        this.ctx.fillStyle = baseGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(0, size * 0.82, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Stand neck
        const neckGrad = this.ctx.createLinearGradient(-size * 0.06, size * 0.4, size * 0.06, size * 0.75);
        neckGrad.addColorStop(0, '#b8b8b8');
        neckGrad.addColorStop(0.5, '#d0d0d0');
        neckGrad.addColorStop(1, '#a0a0a0');
        this.ctx.fillStyle = neckGrad;
        this.ctx.fillRect(-size * 0.06, size * 0.4, size * 0.12, size * 0.38);
        
        // Monitor back (silver aluminum)
        const backGrad = this.ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        backGrad.addColorStop(0, '#c8c8c8');
        backGrad.addColorStop(0.5, '#e0e0e0');
        backGrad.addColorStop(1, '#b8b8b8');
        this.ctx.fillStyle = backGrad;
        this.ctx.fillRect(-size/2, -size/2, size, size);
        
        // Thin bezel
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-size/2, -size/2, size, size);
        
        // Screen display with realistic glow
        const screenGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
        screenGrad.addColorStop(0, '#5a9fd4');
        screenGrad.addColorStop(0.4, '#4a86c4');
        screenGrad.addColorStop(0.8, '#2d5a8c');
        screenGrad.addColorStop(1, '#1a3a5c');
        this.ctx.fillStyle = screenGrad;
        this.ctx.fillRect(-size * 0.47, -size * 0.47, size * 0.94, size * 0.94);
        
        // Screen content (code/UI simulation)
        this.ctx.fillStyle = 'rgba(80, 200, 120, 0.3)';
        this.ctx.font = `${size * 0.04}px monospace`;
        this.ctx.textAlign = 'left';
        for (let i = 0; i < 8; i++) {
            this.ctx.fillText('< code />', -size * 0.4, -size * 0.35 + i * (size * 0.08));
        }
        
        // Screen reflection
        const reflectGrad = this.ctx.createLinearGradient(0, -size * 0.47, 0, 0);
        reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = reflectGrad;
        this.ctx.fillRect(-size * 0.47, -size * 0.47, size * 0.94, size * 0.5);
        
        // Power LED
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(0, size * 0.45, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // LED glow
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(0, size * 0.45, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawKeyboard(size) {
        // Mechanical keyboard with RGB lighting
        
        // Keyboard body with metallic finish
        const bodyGrad = this.ctx.createLinearGradient(-size/2, -size * 0.18, size/2, size * 0.12);
        bodyGrad.addColorStop(0, '#3a3a3a');
        bodyGrad.addColorStop(0.5, '#4a4a4a');
        bodyGrad.addColorStop(1, '#2a2a2a');
        this.ctx.fillStyle = bodyGrad;
        this.ctx.fillRect(-size/2, -size * 0.18, size, size * 0.3);
        
        // Bottom edge (darker)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-size/2, size * 0.1, size, size * 0.05);
        
        // Keys with mechanical look
        const keySpacing = size / 15;
        const keyWidth = size / 17;
        const keyHeight = size / 17;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 15; j++) {
                const keyX = -size/2 + 10 + j * keySpacing;
                const keyY = -size * 0.12 + i * (keySpacing * 0.85);
                
                // Key cap gradient (concave appearance)
                const keyGrad = this.ctx.createRadialGradient(
                    keyX + keyWidth/2, keyY + keyHeight/2, 0,
                    keyX + keyWidth/2, keyY + keyHeight/2, keyWidth
                );
                keyGrad.addColorStop(0, '#6a6a6a');
                keyGrad.addColorStop(0.6, '#5a5a5a');
                keyGrad.addColorStop(1, '#3a3a3a');
                this.ctx.fillStyle = keyGrad;
                this.ctx.fillRect(keyX, keyY, keyWidth, keyHeight);
                
                // Key highlight (top edge)
                this.ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';
                this.ctx.fillRect(keyX, keyY, keyWidth, 1);
                
                // RGB underglow (random color for effect)
                if (Math.random() > 0.7) {
                    const colors = ['rgba(255, 0, 100, 0.4)', 'rgba(0, 200, 255, 0.4)', 'rgba(100, 255, 0, 0.4)'];
                    this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    this.ctx.fillRect(keyX, keyY + keyHeight, keyWidth, 2);
                }
            }
        }
        
        // Space bar (longer)
        const spaceX = -size * 0.25;
        const spaceY = size * 0.05;
        const spaceGrad = this.ctx.createLinearGradient(spaceX, spaceY, spaceX + size * 0.5, spaceY);
        spaceGrad.addColorStop(0, '#5a5a5a');
        spaceGrad.addColorStop(0.5, '#6a6a6a');
        spaceGrad.addColorStop(1, '#4a4a4a');
        this.ctx.fillStyle = spaceGrad;
        this.ctx.fillRect(spaceX, spaceY, size * 0.5, keyHeight);
        
        // Brand logo area
        this.ctx.fillStyle = 'rgba(212, 165, 116, 0.6)';
        this.ctx.font = `${size * 0.06}px Arial`;
        this.ctx.textAlign = 'right';
        this.ctx.fillText('⌨', size/2 - 10, size * 0.05);
    }

    drawMouse(size) {
        // Modern wireless mouse with ergonomic design
        
        // Mouse body - 3D effect
        this.ctx.save();
        
        // Main body gradient (glossy finish)
        const bodyGrad = this.ctx.createRadialGradient(
            -size * 0.15, -size * 0.3, size * 0.05,
            0, 0, size * 0.6
        );
        bodyGrad.addColorStop(0, '#f0f0f0');
        bodyGrad.addColorStop(0.4, '#d8d8d8');
        bodyGrad.addColorStop(0.8, '#a8a8a8');
        bodyGrad.addColorStop(1, '#888888');
        
        this.ctx.fillStyle = bodyGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.35, size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glossy highlight
        const highlightGrad = this.ctx.createRadialGradient(
            -size * 0.12, -size * 0.25, 0,
            -size * 0.12, -size * 0.25, size * 0.25
        );
        highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = highlightGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(-size * 0.08, -size * 0.2, size * 0.18, size * 0.25, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Button separation line
        this.ctx.strokeStyle = '#707070';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size * 0.45);
        this.ctx.lineTo(0, size * 0.05);
        this.ctx.stroke();
        
        // Left button subtle highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.3, -size * 0.4);
        this.ctx.lineTo(0, -size * 0.45);
        this.ctx.lineTo(0, -size * 0.1);
        this.ctx.lineTo(-size * 0.25, -size * 0.05);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Scroll wheel (detailed)
        const wheelGrad = this.ctx.createLinearGradient(-size * 0.1, -size * 0.22, size * 0.1, -size * 0.18);
        wheelGrad.addColorStop(0, '#606060');
        wheelGrad.addColorStop(0.5, '#808080');
        wheelGrad.addColorStop(1, '#505050');
        this.ctx.fillStyle = wheelGrad;
        this.ctx.fillRect(-size * 0.08, -size * 0.22, size * 0.16, size * 0.18);
        
        // Wheel grip texture
        this.ctx.strokeStyle = '#404040';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < 8; i++) {
            const y = -size * 0.21 + i * (size * 0.022);
            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.08, y);
            this.ctx.lineTo(size * 0.08, y);
            this.ctx.stroke();
        }
        
        // Side buttons (small)
        this.ctx.fillStyle = '#606060';
        this.ctx.fillRect(-size * 0.32, size * 0.05, size * 0.08, size * 0.12);
        this.ctx.fillRect(-size * 0.32, size * 0.19, size * 0.08, size * 0.12);
        
        // Status LED
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(0, size * 0.35, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawNotebook(size) {
        // Leather-bound notebook with realistic texture
        
        // Leather cover with texture gradient
        const leatherGrad = this.ctx.createLinearGradient(-size/2, -size * 0.7, size/2, size * 0.7);
        leatherGrad.addColorStop(0, '#8B4513');
        leatherGrad.addColorStop(0.3, '#A0522D');
        leatherGrad.addColorStop(0.7, '#8B4513');
        leatherGrad.addColorStop(1, '#6B3410');
        this.ctx.fillStyle = leatherGrad;
        this.ctx.fillRect(-size/2, -size * 0.7, size, size * 1.4);
        
        // Leather texture (subtle lines)
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        this.ctx.strokeStyle = '#5a2a0a';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < 25; i++) {
            const x = -size/2 + Math.random() * size;
            const y = -size * 0.65 + Math.random() * size * 1.3;
            const len = Math.random() * 30 + 10;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + len, y + (Math.random() - 0.5) * 5);
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        // Embossed title area
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(-size * 0.35, -size * 0.55, size * 0.7, size * 0.15);
        
        this.ctx.fillStyle = 'rgba(212, 165, 116, 0.8)';
        this.ctx.font = `bold ${size * 0.08}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('NOTES', 0, -size * 0.43);
        
        // Elastic band
        const bandGrad = this.ctx.createLinearGradient(-size/2, 0, size/2, 0);
        bandGrad.addColorStop(0, '#2a2a2a');
        bandGrad.addColorStop(0.5, '#3a3a3a');
        bandGrad.addColorStop(1, '#2a2a2a');
        this.ctx.fillStyle = bandGrad;
        this.ctx.fillRect(-size * 0.52, -size * 0.1, size * 1.04, size * 0.06);
        
        // Page edges (white/cream colored)
        this.ctx.fillStyle = '#f5f5dc';
        this.ctx.fillRect(size * 0.48, -size * 0.68, size * 0.05, size * 1.36);
        
        // Page lines for texture
        this.ctx.strokeStyle = 'rgba(200, 180, 160, 0.3)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < 20; i++) {
            const y = -size * 0.65 + i * (size * 0.065);
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.48, y);
            this.ctx.lineTo(size * 0.53, y);
            this.ctx.stroke();
        }
        
        // Corner details (metal corners)
        this.ctx.fillStyle = '#c0c0c0';
        const cornerSize = size * 0.08;
        // Top left
        this.ctx.beginPath();
        this.ctx.moveTo(-size/2, -size * 0.7);
        this.ctx.lineTo(-size/2 + cornerSize, -size * 0.7);
        this.ctx.lineTo(-size/2, -size * 0.7 + cornerSize);
        this.ctx.closePath();
        this.ctx.fill();
        // Bottom right
        this.ctx.beginPath();
        this.ctx.moveTo(size/2, size * 0.7);
        this.ctx.lineTo(size/2 - cornerSize, size * 0.7);
        this.ctx.lineTo(size/2, size * 0.7 - cornerSize);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawIpad(size) {
        // Modern iPad Pro with thin bezels
        
        // Back case (aluminum)
        const backGrad = this.ctx.createLinearGradient(-size/2, -size * 0.72, size/2, size * 0.72);
        backGrad.addColorStop(0, '#b8b8b8');
        backGrad.addColorStop(0.5, '#d8d8d8');
        backGrad.addColorStop(1, '#a8a8a8');
        this.ctx.fillStyle = backGrad;
        this.ctx.fillRect(-size/2, -size * 0.72, size, size * 1.44);
        
        // Thin bezel (space gray)
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(-size/2, -size * 0.72, size, size * 1.44);
        
        // Screen with gradient
        const screenGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.8);
        screenGrad.addColorStop(0, '#5a9fd4');
        screenGrad.addColorStop(0.5, '#4a86c4');
        screenGrad.addColorStop(1, '#2d5a8c');
        this.ctx.fillStyle = screenGrad;
        this.ctx.fillRect(-size * 0.48, -size * 0.7, size * 0.96, size * 1.4);
        
        // App icons simulation
        const iconSize = size * 0.12;
        const iconSpacing = size * 0.15;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const x = -size * 0.35 + col * iconSpacing;
                const y = -size * 0.5 + row * iconSpacing;
                
                // Icon background with gradient
                const iconGrad = this.ctx.createRadialGradient(x, y, 0, x, y, iconSize);
                const color = colors[Math.floor(Math.random() * colors.length)];
                iconGrad.addColorStop(0, color);
                iconGrad.addColorStop(1, this.adjustColor(color, -30));
                
                this.ctx.fillStyle = iconGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(x - iconSize/2, y - iconSize/2, iconSize, iconSize, iconSize * 0.2);
                this.ctx.fill();
                
                // Icon shine
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.roundRect(x - iconSize/2, y - iconSize/2, iconSize, iconSize/3, iconSize * 0.2);
                this.ctx.fill();
            }
        }
        
        // Dock at bottom
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        this.ctx.beginPath();
        this.ctx.roundRect(-size * 0.4, size * 0.52, size * 0.8, size * 0.13, size * 0.03);
        this.ctx.fill();
        
        // Dock icons
        for (let i = 0; i < 4; i++) {
            const x = -size * 0.3 + i * iconSpacing * 0.9;
            const y = size * 0.58;
            this.ctx.fillStyle = colors[i];
            this.ctx.beginPath();
            this.ctx.roundRect(x - iconSize/2, y - iconSize/2, iconSize, iconSize, iconSize * 0.2);
            this.ctx.fill();
        }
        
        // Screen reflection
        const reflectGrad = this.ctx.createLinearGradient(0, -size * 0.7, 0, 0);
        reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = reflectGrad;
        this.ctx.fillRect(-size * 0.48, -size * 0.7, size * 0.96, size * 0.7);
        
        // Camera (top center)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.arc(0, -size * 0.68, size * 0.018, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Camera lens
        this.ctx.strokeStyle = '#4a4a4a';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    adjustColor(color, amount) {
        // Helper function to darken/lighten colors
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    drawPen(size) {
        // Premium metal pen with clip
        
        // Pen body (metallic gradient)
        const bodyGrad = this.ctx.createLinearGradient(-size * 0.1, -size/2, size * 0.1, size/2);
        bodyGrad.addColorStop(0, '#c0c0c0');
        bodyGrad.addColorStop(0.2, '#e8e8e8');
        bodyGrad.addColorStop(0.4, '#a8a8a8');
        bodyGrad.addColorStop(0.6, '#d0d0d0');
        bodyGrad.addColorStop(1, '#909090');
        this.ctx.fillStyle = bodyGrad;
        this.ctx.fillRect(-size * 0.08, -size/2, size * 0.16, size);
        
        // Pen grip section (rubber/textured)
        const gripGrad = this.ctx.createLinearGradient(-size * 0.08, size * 0.15, size * 0.08, size * 0.35);
        gripGrad.addColorStop(0, '#4a4a4a');
        gripGrad.addColorStop(0.5, '#5a5a5a');
        gripGrad.addColorStop(1, '#3a3a3a');
        this.ctx.fillStyle = gripGrad;
        this.ctx.fillRect(-size * 0.08, size * 0.15, size * 0.16, size * 0.2);
        
        // Grip texture lines
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < 12; i++) {
            const y = size * 0.16 + i * (size * 0.015);
            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.08, y);
            this.ctx.lineTo(size * 0.08, y);
            this.ctx.stroke();
        }
        
        // Pen tip (metal cone)
        this.ctx.save();
        const tipGrad = this.ctx.createLinearGradient(0, size * 0.45, 0, size * 0.65);
        tipGrad.addColorStop(0, '#a0a0a0');
        tipGrad.addColorStop(0.5, '#808080');
        tipGrad.addColorStop(1, '#505050');
        this.ctx.fillStyle = tipGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.08, size * 0.48);
        this.ctx.lineTo(0, size * 0.68);
        this.ctx.lineTo(size * 0.08, size * 0.48);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Tip point (black)
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.02, size * 0.65);
        this.ctx.lineTo(0, size * 0.7);
        this.ctx.lineTo(size * 0.02, size * 0.65);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // Pen clip (metal)
        const clipGrad = this.ctx.createLinearGradient(size * 0.08, -size * 0.45, size * 0.15, -size * 0.1);
        clipGrad.addColorStop(0, '#b8b8b8');
        clipGrad.addColorStop(0.5, '#d8d8d8');
        clipGrad.addColorStop(1, '#a0a0a0');
        this.ctx.fillStyle = clipGrad;
        this.ctx.fillRect(size * 0.08, -size * 0.45, size * 0.06, size * 0.35);
        
        // Clip rounded end
        this.ctx.beginPath();
        this.ctx.arc(size * 0.11, -size * 0.45, size * 0.03, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Brand ring (gold accent)
        this.ctx.fillStyle = '#D4A574';
        this.ctx.fillRect(-size * 0.09, -size * 0.15, size * 0.18, size * 0.04);
        
        // Top cap (glossy)
        const capGrad = this.ctx.createRadialGradient(-size * 0.04, -size * 0.48, 0, 0, -size/2, size * 0.12);
        capGrad.addColorStop(0, '#f0f0f0');
        capGrad.addColorStop(0.5, '#d0d0d0');
        capGrad.addColorStop(1, '#a0a0a0');
        this.ctx.fillStyle = capGrad;
        this.ctx.fillRect(-size * 0.08, -size/2, size * 0.16, size * 0.12);
        
        // Cap highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(-size * 0.06, -size/2, size * 0.08, size * 0.03);
    }

    drawMousepad(size) {
        // Large gaming mousepad with RGB edges
        
        // Mousepad base (fabric texture)
        const baseGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.7);
        baseGrad.addColorStop(0, '#2a2a2a');
        baseGrad.addColorStop(0.7, '#1a1a1a');
        baseGrad.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = baseGrad;
        this.ctx.fillRect(-size/2, -size * 0.36, size, size * 0.72);
        
        // Fabric texture simulation
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < 100; i++) {
            this.ctx.fillStyle = Math.random() > 0.5 ? '#3a3a3a' : '#151515';
            this.ctx.fillRect(
                -size/2 + Math.random() * size,
                -size * 0.36 + Math.random() * size * 0.72,
                2, 2
            );
        }
        this.ctx.restore();
        
        // RGB LED edges (glowing effect)
        const rgbColors = [
            { color: 'rgba(255, 0, 100, 0.6)', pos: 0 },
            { color: 'rgba(255, 100, 0, 0.6)', pos: 0.25 },
            { color: 'rgba(0, 255, 100, 0.6)', pos: 0.5 },
            { color: 'rgba(0, 100, 255, 0.6)', pos: 0.75 },
            { color: 'rgba(255, 0, 255, 0.6)', pos: 1 }
        ];
        
        // Top edge RGB
        const topGrad = this.ctx.createLinearGradient(-size/2, -size * 0.37, size/2, -size * 0.37);
        rgbColors.forEach(c => topGrad.addColorStop(c.pos, c.color));
        this.ctx.strokeStyle = topGrad;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(-size/2, -size * 0.37);
        this.ctx.lineTo(size/2, -size * 0.37);
        this.ctx.stroke();
        
        // Bottom edge RGB
        const bottomGrad = this.ctx.createLinearGradient(size/2, size * 0.37, -size/2, size * 0.37);
        rgbColors.forEach(c => bottomGrad.addColorStop(c.pos, c.color));
        this.ctx.strokeStyle = bottomGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(size/2, size * 0.37);
        this.ctx.lineTo(-size/2, size * 0.37);
        this.ctx.stroke();
        
        // Left edge RGB
        this.ctx.strokeStyle = rgbColors[0].color;
        this.ctx.beginPath();
        this.ctx.moveTo(-size/2, -size * 0.37);
        this.ctx.lineTo(-size/2, size * 0.37);
        this.ctx.stroke();
        
        // Right edge RGB
        this.ctx.strokeStyle = rgbColors[2].color;
        this.ctx.beginPath();
        this.ctx.moveTo(size/2, -size * 0.37);
        this.ctx.lineTo(size/2, size * 0.37);
        this.ctx.stroke();
        
        // RGB glow effect
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = topGrad;
        this.ctx.strokeRect(-size/2, -size * 0.36, size, size * 0.72);
        this.ctx.restore();
        
        // Center logo/design
        this.ctx.fillStyle = 'rgba(212, 165, 116, 0.3)';
        this.ctx.font = `${size * 0.2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚡', 0, size * 0.08);
        
        // Stitched edge detail
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);
        this.ctx.strokeRect(-size/2 + 5, -size * 0.36 + 5, size - 10, size * 0.72 - 10);
        this.ctx.setLineDash([]);
        
        // Anti-slip rubber base texture (visible at edges)
        this.ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.ctx.fillRect(-size/2 - 2, -size * 0.36 - 2, size + 4, 3);
        this.ctx.fillRect(-size/2 - 2, size * 0.36, size + 4, 2);
    }

    drawShootingStars() {
        if (!this.ctx) return;

        this.shootingStars.forEach((star, index) => {
            star.life--;
            star.opacity = star.life / 100;

            if (star.life <= 0) {
                this.shootingStars.splice(index, 1);
                return;
            }

            const endX = star.x + Math.cos(star.angle) * star.length;
            const endY = star.y + Math.sin(star.angle) * star.length;

            // Create gradient for shooting star trail - warm sunset colors
            const gradient = this.ctx.createLinearGradient(
                star.x, star.y, endX, endY
            );
            gradient.addColorStop(0, `rgba(255, 220, 180, ${star.opacity})`); // Warm white
            gradient.addColorStop(0.3, `rgba(255, 180, 120, ${star.opacity * 0.8})`); // Peachy
            gradient.addColorStop(0.6, `rgba(255, 140, 100, ${star.opacity * 0.6})`); // Orange
            gradient.addColorStop(1, 'rgba(238, 90, 111, 0)'); // Coral fade

            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            // Move shooting star
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
        });
    }

    animate() {
        if (!this.canvas || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Check if we should show the table
        this.showTable = this.checkIfHeroSection();
        
        if (this.showTable) {
            // Draw wood table
            this.drawWoodTable();
            
            // Draw tech items on table
            this.drawTechItems();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawSingleStar(star) {
        if (!this.ctx) return;

        // Move stars very slowly for subtle realism
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen
        if (star.x < 0) star.x = this.canvas.width;
        if (star.x > this.canvas.width) star.x = 0;
        if (star.y < 0) star.y = this.canvas.height;
        if (star.y > this.canvas.height) star.y = 0;

        // Natural twinkling effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.25 + 0.75;

        // Draw star with realistic color and glow
        const colorStr = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.opacity * twinkle})`;
        
        // Subtle glow for larger stars
        if (star.radius > 1) {
            const glowGradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.radius * 2.5
            );
            glowGradient.addColorStop(0, colorStr);
            glowGradient.addColorStop(0.4, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.opacity * twinkle * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(200, 220, 240, 0)');

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
        }

        // Draw star core
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colorStr;
        this.ctx.fill();
        
        // Add cross pattern for brighter stars
        if (star.radius > 1.5) {
            this.ctx.strokeStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.opacity * twinkle * 0.4})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x - star.radius * 2, star.y);
            this.ctx.lineTo(star.x + star.radius * 2, star.y);
            this.ctx.moveTo(star.x, star.y - star.radius * 2);
            this.ctx.lineTo(star.x, star.y + star.radius * 2);
            this.ctx.stroke();
        }
    }
}

new WoodTableWorkspaceAnimation();

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
    }
};

function changeLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    
    // Update all text with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const langBtn = document.getElementById(`btn-${lang}`);
    if (langBtn) {
        langBtn.classList.add('active');
    }

    // Save choice
    localStorage.setItem('lang', lang);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    changeLanguage(savedLang);
});


console.log('🎯 Luxury IT Engineer Portfolio Loaded Successfully!');