// script.js
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('a');

    // 1. Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active'); // Optional: for animating the button
    });

    // 2. Close Mobile Menu on Link Click (for smooth navigation)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Optional: Add the 'active' class to the nav menu for better mobile styles
    // Add the following CSS to the bottom of style.css:
    /*
    @media (max-width: 768px) {
        .nav-menu {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out;
        }

        .nav-menu.active {
            max-height: 300px; // Adjust based on number of links
        }

        .mobile-menu-btn {
            display: block;
            background: transparent;
            border: none;
            padding: 10px;
            cursor: pointer;
        }
    }
    */
});