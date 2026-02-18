// ===================================
// PROFESSIONAL MAHOGANY OFFICE PORTFOLIO
// Executive Desk Interactions
// VERSION: February 2026
// ===================================

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
    }
});

// ===================================
// Custom Cursor (Leather Notepad Style)
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
            }, 70);
        });

        // Enhanced cursor on hover
        const hoverElements = document.querySelectorAll('a, button, .btn, .nav-link, .stat-card, .skill-card, .business-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorFollower.style.transform = 'scale(1.5)';
                this.cursorFollower.style.borderColor = 'var(--brass-bright)';
            });
            el.addEventListener('mouseleave', () => {
                this.cursorFollower.style.transform = 'scale(1)';
                this.cursorFollower.style.borderColor = 'var(--brass-medium)';
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
const navOverlay = document.getElementById('navOverlay');

function closeNav() {
    mobileToggle.classList.remove('active');
    sideNav.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
}

if (mobileToggle && sideNav) {
    mobileToggle.addEventListener('click', () => {
        const isActive = sideNav.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active', isActive);
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                closeNav();
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
// Typing Effect for Hero Section
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

        this.element.innerHTML = this.txt;

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
// Counter Animation for Stats
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
        date: 'Oct 2020 - Feb 2022',
        title: 'IT Support Technician',
        company: 'Ooredoo Qatar',
        location: 'Doha, Qatar',
        responsibilities: [
            'Delivered comprehensive IT technical support to Ooredoo retail staff and customers across multiple service centers',
            'Performed hardware diagnostics, repairs, and software troubleshooting on computers and telecommunications equipment',
            'Assisted customers and staff with configuration of mobile devices, routers, and network equipment',
            'Maintained IT infrastructure in retail outlets, ensuring minimal downtime and optimal service delivery',
            'Documented technical issues and solutions in ticketing systems to improve knowledge base and support processes',
            'Collaborated with network teams to resolve connectivity and service delivery issues for enterprise and retail customers'
        ],
        experienceLetter: 'https://drive.google.com/file/d/1F1dRuB9Bp3aLm0M2A0RZ_xmzFoYaElKp/view?usp=sharing'
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

        let projectsHTML = '';
        if (exp.projects) {
            projectsHTML = `
                <div style="margin: 15px 0;">
                    <strong style="color: #38bdf8; font-weight:700;">Projects:</strong>
                    ${exp.projects.map(proj => `<div style="margin-left: 15px; color: var(--text-secondary);">${proj}</div>`).join('')}
                </div>
            `;
        }

        if (exp.project) {
            projectsHTML = `
                <div style="margin: 15px 0;">
                    <strong style="color: #38bdf8; font-weight:700;">Project:</strong>
                    <div style="margin-left: 15px; color: var(--text-secondary);">${exp.project}</div>
                </div>
            `;
        }

        let lettersHTML = '';
        if (exp.experienceLetter) {
            lettersHTML = `<a href="${exp.experienceLetter}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, var(--brass-bright), var(--brass-dark)); color: #0f0f0f; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.3s;">
                <i class="fas fa-file-contract"></i> View Experience Letter
            </a>`;
        }
        
        if (exp.experienceLetters) {
            lettersHTML = exp.experienceLetters.map(letter => 
                `<a href="${letter.url}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; margin-right: 10px; padding: 10px 20px; background: linear-gradient(135deg, var(--brass-bright), var(--brass-dark)); color: #0f0f0f; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.3s;">
                    <i class="fas fa-file-contract"></i> ${letter.text}
                </a>`
            ).join('');
        }

        item.innerHTML = `
            <div class="timeline-date">${exp.date}</div>
            <div class="timeline-content">
                <h3 class="timeline-title">${exp.title}</h3>
                <div class="timeline-subtitle">${exp.company} - ${exp.location}</div>
                ${projectsHTML}
                <div class="timeline-description">
                    <ul>
                        ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                    </ul>
                </div>
                ${lettersHTML}
            </div>
        `;

        timeline.appendChild(item);
    });
}

loadExperience();

// ===================================
// Load Education
// ===================================
const educationData = [
    {
        degree: 'Bachelor of Science in IT',
        institution: 'Middlesex University Dubai',
        date: 'Sep 2024 - Jun 2025',
        grade: 'Expected Graduation: 2025',
        certificateLink: 'https://drive.google.com/file/d/17IYNcUbLLQfEJS0_4VtscE6xejH7p4XB/view?usp=sharing'
    },
    {
        degree: 'Advanced Diploma in Software Engineering',
        institution: 'Aptech Qatar',
        date: 'Nov 2020 - Nov 2023',
        grade: 'ACCP Certification',
        certificateLink: 'https://drive.google.com/file/d/1J_d7bN2xAYlI33Uzp5YQPZ3kt8fFHamy/view?usp=sharing'
    },
    {
        degree: 'IGCSE',
        institution: 'Bright Future International School',
        date: 'Sep 2017 - Jul 2018',
        grade: 'Cambridge International Examination'
    }
];

function loadEducation() {
    const educationTimeline = document.querySelector('.education-timeline');
    if (!educationTimeline) return;

    educationTimeline.innerHTML = '';

    educationData.forEach((edu, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', index * 100);

        const certificateButton = edu.certificateLink ? 
            `<a href="${edu.certificateLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, var(--brass-bright), var(--brass-dark)); color: #0f0f0f; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.3s;">
                <i class="fas fa-certificate"></i> View Certificate
            </a>` : '';

        item.innerHTML = `
            <div class="timeline-date">${edu.date}</div>
            <div class="timeline-content">
                <h3 class="timeline-title">${edu.degree}</h3>
                <div class="timeline-subtitle">${edu.institution}</div>
                <p style="color: var(--text-secondary); margin-top: 10px;">${edu.grade}</p>
                ${certificateButton}
            </div>
        `;

        educationTimeline.appendChild(item);
    });
}

loadEducation();

// ===================================
// Load Skills Data
// ===================================
const skillsData = [
    {
        name: 'Hardware & Systems',
        icon: 'fa-tools',
        level: 95,
        category: 'Expert'
    },
    {
        name: 'Network Administration',
        icon: 'fa-network-wired',
        level: 92,
        category: 'Expert'
    },
    {
        name: 'IT Operations',
        icon: 'fa-server',
        level: 90,
        category: 'Expert'
    },
    {
        name: 'Technical Support',
        icon: 'fa-headset',
        level: 98,
        category: 'Expert'
    },
    {
        name: 'Asset Management',
        icon: 'fa-database',
        level: 88,
        category: 'Advanced'
    },
    {
        name: 'Troubleshooting',
        icon: 'fa-bug',
        level: 96,
        category: 'Expert'
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
                <div class="skill-icon">
                    <i class="fas ${skill.icon}"></i>
                </div>
                <div>
                    <h4 class="skill-name">${skill.name}</h4>
                    <p class="skill-level">${skill.category}</p>
                </div>
            </div>
            <div class="skill-progress">
                <div class="skill-progress-fill" style="width: 0%" data-width="${skill.level}%"></div>
            </div>
        `;

        skillsGrid.appendChild(card);
    });

    // Animate skill bars when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-progress-fill');
                skillBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 300);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (skillsGrid) {
        observer.observe(skillsGrid);
    }
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
        badge.className = 'tech-item';
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
        card.className = 'language-item';
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
// Animate Circular Progress Bars in About Section
// ===================================
function animateCircularProgress() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const percent = parseInt(circle.getAttribute('data-percent'));
                const radius = 52;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percent / 100) * circumference;
                
                // Animate the stroke-dashoffset
                setTimeout(() => {
                    circle.style.strokeDashoffset = offset;
                }, 300);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => observer.observe(bar));
}

// Run animation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateCircularProgress);
} else {
    animateCircularProgress();
}

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
            `<a href="${cert.certificateLink}" target="_blank" class="cert-btn" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, var(--brass-bright), var(--brass-dark)); color: #0f0f0f; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.3s;">
                <i class="fas fa-eye"></i> View Certificate
            </a>` : '';

        card.innerHTML = `
            <div class="cert-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <h4 style="font-family: 'Playfair Display', serif; font-size: 20px; margin: 15px 0 10px; color: var(--text-primary);">${cert.title}</h4>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px;">${cert.description}</p>
            ${certButton}
        `;

        certsGrid.appendChild(card);
    });
}

loadCertifications();

// ===================================
// Greeting based on time of day
// ===================================
function setGreeting() {
    const greetingElement = document.querySelector('.hero-greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting = 'Good Day!';

    if (hour < 12) {
        greeting = 'Good Morning!';
    } else if (hour < 18) {
        greeting = 'Good Afternoon!';
    } else {
        greeting = 'Good Evening!';
    }

    greetingElement.textContent = greeting;
}

setGreeting();

// ===================================
// Smooth Scrolling Enhancement
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Parallax effect removed for smooth scrolling
// ===================================

// ===================================
// Add subtle hover effects
// ===================================
document.querySelectorAll('.business-card, .notepad-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s ease';
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===================================
// Console signature
// ===================================
console.log('%c🪵 Wood Office Portfolio ', 'font-size: 20px; font-weight: bold; color: #c9a961; background: #3d2f24; padding: 10px 20px; border-radius: 5px;');
console.log('%cDesigned with craftsmanship by Sajid Mehmood', 'font-size: 12px; color: #8b6f47;');
// ===================================
// COUNTDOWN TIMER
// ===================================
// ▶ Change this date whenever you want to update the target
const targetDate = new Date("March 1, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const gap = targetDate - now;
    const el  = document.getElementById('timer');
    if (!el) return;

    if (gap <= 0) {
        el.innerHTML = '🚀 LAUNCHED';
        return;
    }

    const d = Math.floor(gap / (1000 * 60 * 60 * 24));
    const h = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((gap % (1000 * 60)) / 1000);

    el.textContent = `${d}d ${h}h ${m}m ${s}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown(); // run immediately

// ===================================
// COUNTDOWN BANNER DISMISS
// ===================================
(function () {
    const banner      = document.getElementById('countdownBanner');
    const dismissBtn  = document.getElementById('dismissBanner');
    const body        = document.body;

    if (!banner) return;

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem('bannerDismissed');
    if (dismissed) {
        banner.classList.add('hidden');
    } else {
        body.classList.add('banner-visible');
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            banner.classList.add('hidden');
            body.classList.remove('banner-visible');
            sessionStorage.setItem('bannerDismissed', '1');
        });
    }
})();