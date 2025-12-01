// ===================================
// Documents Section JavaScript
// ===================================

class DocumentsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParallaxEffect();
        this.setupCardHoverEffects();
        this.setupButtonEffects();
        this.setupDownloadTracking();
        this.setupTooltips();
        this.createFloatingParticles();
    }

    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Add stagger effect to cards
                    if (entry.target.classList.contains('doc-card')) {
                        const cards = document.querySelectorAll('.doc-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('animate-in');
                            }, index * 100);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all document cards
        const cards = document.querySelectorAll('.doc-card');
        cards.forEach(card => observer.observe(card));

        // Observe CV card
        const cvCard = document.querySelector('.cv-card');
        if (cvCard) observer.observe(cvCard);
    }

    // Parallax scrolling effect
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const section = document.querySelector('.documents-section');
            
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrolled > sectionTop - window.innerHeight && 
                    scrolled < sectionTop + sectionHeight) {
                    const parallaxElements = section.querySelectorAll('.doc-icon');
                    parallaxElements.forEach((el, index) => {
                        const speed = 0.05 * (index + 1);
                        const yPos = (scrolled - sectionTop) * speed;
                        el.style.transform = `translateY(${yPos}px)`;
                    });
                }
            }
        });
    }

    // Advanced card hover effects
    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.doc-card');
        
        cards.forEach(card => {
            // Mouse move tilt effect
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateY(-10px)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });

            // Add sparkle effect on hover
            card.addEventListener('mouseenter', (e) => {
                this.createSparkles(e.currentTarget);
            });
        });
    }

    // Create sparkle effect
    createSparkles(element) {
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                animation: sparkle 0.8s ease-out forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
            `;
            
            element.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 800);
        }
    }

    // Button ripple effects
    setupButtonEffects() {
        const buttons = document.querySelectorAll('.doc-btn, .cv-btn');
        
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
                    background: rgba(255, 255, 255, 0.5);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: rippleEffect 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });

            // Add loading animation on download
            if (button.classList.contains('cv-btn') || button.classList.contains('doc-btn')) {
                button.addEventListener('click', (e) => {
                    if (button.href && button.href.includes('.pdf')) {
                        this.showDownloadAnimation(button);
                    }
                });
            }
        });
    }

    // Download button animation
    showDownloadAnimation(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        button.style.pointerEvents = 'none';
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.pointerEvents = 'auto';
                button.style.background = '';
            }, 2000);
        }, 1500);
    }

    // Track downloads with analytics
    setupDownloadTracking() {
        const downloadButtons = document.querySelectorAll('[data-track="download"]');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const docName = button.getAttribute('data-doc-name') || 'Unknown Document';
                console.log(`Download tracked: ${docName}`);
                
                // You can integrate with Google Analytics here
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'download', {
                        'event_category': 'Documents',
                        'event_label': docName
                    });
                }
                
                this.showNotification(`Downloading ${docName}...`);
            });
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out, slideOutRight 0.5s ease-out 2.5s;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    // Setup tooltips for icons
    setupTooltips() {
        const icons = document.querySelectorAll('.doc-icon');
        
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip') || 'Document';
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: 120%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    white-space: nowrap;
                    pointer-events: none;
                    animation: fadeIn 0.3s ease-out;
                    z-index: 100;
                `;
                
                this.style.position = 'relative';
                this.appendChild(tooltip);
            });
            
            icon.addEventListener('mouseleave', function() {
                const tooltip = this.querySelector('.custom-tooltip');
                if (tooltip) tooltip.remove();
            });
        });
    }

    // Create floating particles background
    createFloatingParticles() {
        const section = document.querySelector('.documents-section');
        if (!section) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        `;
        
        section.insertBefore(particlesContainer, section.firstChild);
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 15}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
}

// ===================================
// CSS Animations (add to stylesheet)
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes sparkle {
        0% {
            transform: scale(0) translateY(0);
            opacity: 1;
        }
        100% {
            transform: scale(1) translateY(-50px);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(-40px) translateX(-10px);
        }
        75% {
            transform: translateY(-20px) translateX(5px);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards !important;
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize on DOM ready
// ===================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DocumentsManager();
    });
} else {
    new DocumentsManager();
}

// ===================================
// Utility Functions
// ===================================

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentsManager;
}
const mobileToggle = document.querySelector('.mobile-nav-toggle');
const sideNav = document.querySelector('.side-nav');

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    sideNav.classList.toggle('active');
});

// Close nav when clicking a link on mobile
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            mobileToggle.classList.remove('active');
            sideNav.classList.remove('active');
        }
    });
});