/**
 * Portfolio Website - JavaScript
 * Handles navigation, animations, form submission, and interactive features
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');
    const navbar = document.querySelector('.navbar');

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function initMobileMenu() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded for accessibility
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle menu visibility
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // Smooth Scrolling for Navigation Links
    // ============================================
    function initSmoothScroll() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Only handle internal anchor links
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // ============================================
    // Active Navigation Link Highlighting
    // ============================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    function initNavbarScroll() {
        if (!navbar) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.scrollY;
            
            // Add shadow when scrolled
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // ============================================
    // Intersection Observer for Scroll Animations
    // ============================================
    function initScrollAnimations() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            return; // Skip animations if user prefers reduced motion
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.skill-card, .project-card, .stat-item, .about-content'
        );

        animateElements.forEach((el, index) => {
            // Set initial state
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            
            observer.observe(el);
        });
    }

    // ============================================
    // Contact Form Handling
    // ============================================
    function initContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Basic validation
            if (!name || !email || !subject || !message) {
                showFormFeedback('Please fill in all fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormFeedback('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission (replace with actual API call)
            showFormFeedback('Sending message...', 'success');
            
            // Simulate async submission
            setTimeout(() => {
                // In a real application, you would send the data to a server here
                console.log('Form submitted:', { name, email, subject, message });
                
                showFormFeedback('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                
                // Clear feedback after 5 seconds
                setTimeout(() => {
                    formFeedback.textContent = '';
                    formFeedback.className = 'form-feedback';
                }, 5000);
            }, 1000);
        });
    }

    function showFormFeedback(message, type) {
        if (!formFeedback) return;
        
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.setAttribute('role', 'status');
        formFeedback.setAttribute('aria-live', 'polite');
        
        // Scroll to feedback if needed
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============================================
    // Keyboard Navigation Enhancement
    // ============================================
    function initKeyboardNavigation() {
        // Add keyboard support for cards
        const cards = document.querySelectorAll('.skill-card, .project-card');
        
        cards.forEach(card => {
            card.addEventListener('keydown', function(e) {
                // Activate on Enter or Space
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (e.key === ' ') {
                        e.preventDefault(); // Prevent page scroll
                    }
                    card.click();
                }
            });
        });
    }

    // ============================================
    // Performance Optimization: Lazy Loading
    // ============================================
    function initLazyLoading() {
        // If images are added later, use Intersection Observer for lazy loading
        const images = document.querySelectorAll('img[data-src]');
        
        if (images.length === 0) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ============================================
    // Scroll to Top Functionality (Optional)
    // ============================================
    function initScrollToTop() {
        // Create scroll-to-top button if needed
        // This is optional and can be added if the page gets long
    }

    // ============================================
    // Theme Toggle (Light/Dark)
    // ============================================
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const root = document.documentElement;

        function applyTheme(theme) {
            const isDark = theme === 'dark';
            root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            themeToggle.textContent = isDark ? 'Light' : 'Dark';
        }

        let storedTheme = null;
        try {
            storedTheme = localStorage.getItem('theme');
        } catch (e) {
            // Ignore storage errors (private mode, blocked cookies, etc.)
        }

        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme === 'dark' || storedTheme === 'light'
            ? storedTheme
            : (prefersDark ? 'dark' : 'light');

        applyTheme(initialTheme);

        themeToggle.addEventListener('click', function() {
            const currentTheme = root.getAttribute('data-theme') || 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

            applyTheme(nextTheme);

            try {
                localStorage.setItem('theme', nextTheme);
            } catch (e) {
                // Ignore storage errors
            }
        });
    }

    // ============================================
    // Initialize All Functions
    // ============================================
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all features
        initThemeToggle();
        initMobileMenu();
        initSmoothScroll();
        initNavbarScroll();
        initScrollAnimations();
        initContactForm();
        initKeyboardNavigation();
        initLazyLoading();

        // Update active nav link on scroll
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Initial check

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function() {
            updateActiveNavLink();
        });

        // Log initialization (remove in production)
        console.log('Portfolio website initialized successfully');
    }

    // Start initialization
    init();

    // ============================================
    // Utility Functions
    // ============================================
    
    /**
     * Debounce function for performance optimization
     * Limits how often a function can be called
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optimize scroll handlers with debouncing
    const optimizedScrollHandler = debounce(() => {
        updateActiveNavLink();
    }, 10);

    window.addEventListener('scroll', optimizedScrollHandler);

})();
