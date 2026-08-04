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
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const animateElements = document.querySelectorAll(
            '.skill-card, .stat-item, .about-content, .project-card'
        );

        if (animateElements.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        animateElements.forEach((el, index) => {
            el.classList.add('scroll-animate');
            el.style.setProperty('--scroll-delay', `${Math.min(index * 0.04, 0.16)}s`);

            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
                el.classList.add('is-visible');
            } else {
                observer.observe(el);
            }
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
            themeToggle.checked = isDark;
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

        themeToggle.addEventListener('change', function() {
            const nextTheme = themeToggle.checked ? 'dark' : 'light';
            applyTheme(nextTheme);

            try {
                localStorage.setItem('theme', nextTheme);
            } catch (e) {
                // Ignore storage errors
            }
        });
    }

    // ============================================
    // OJT gallery — horizontal carousel (scroll-snap)
    // ============================================
    function initOjtGalleryCarousel() {
        const viewport = document.getElementById('ojtCarouselViewport');
        const root = document.getElementById('ojtSlideshow');
        if (!viewport || !root) return;

        const slides = Array.from(viewport.querySelectorAll('.ojt-slide'));
        const n = slides.length;
        if (n === 0) return;

        const prevBtn = document.getElementById('ojtPrev');
        const nextBtn = document.getElementById('ojtNext');
        const thumbsHost = document.getElementById('ojtThumbs');
        const countCurrent = document.getElementById('ojtSlideCurrent');
        const countTotal = document.getElementById('ojtSlideTotal');
        const progressFill = document.getElementById('ojtProgressFill');

        const reduceMotion = window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (countTotal) countTotal.textContent = String(n);

        slides.forEach((slide, i) => {
            const body = slide.querySelector('.ojt-body');
            if (!body || body.querySelector('.ojt-ask-ai')) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ojt-ask-ai';
            btn.textContent = 'Ask AI about this';
            const title = slide.querySelector('.ojt-week');
            const titleText = title ? title.textContent.trim() : '';
            btn.setAttribute('aria-label', titleText ? `Ask AI about ${titleText}` : 'Ask AI about this OJT entry');
            body.appendChild(btn);
        });

        const thumbButtons = [];
        if (thumbsHost) {
            slides.forEach((slide, i) => {
                const img = slide.querySelector('.ojt-media img');
                const src = img ? img.getAttribute('src') : '';
                const titleText = slide.querySelector('.ojt-week')?.textContent?.trim() || `Entry ${i + 1}`;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'ojt-thumb';
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                btn.setAttribute('aria-label', `Show: ${titleText}`);
                btn.dataset.index = String(i);
                if (src) btn.style.backgroundImage = `url("${src}")`;
                thumbsHost.appendChild(btn);
                thumbButtons.push(btn);
                btn.addEventListener('click', () => goTo(i));
            });
        }

        let activeIndex = 0;
        let scrollRaf = null;

        function scrollBehavior() {
            return reduceMotion ? 'auto' : 'smooth';
        }

        function updateA11y(index, alignThumb) {
            slides.forEach((s, i) => {
                s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
            });
            thumbButtons.forEach((t, i) => {
                const on = i === index;
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.classList.toggle('is-active', on);
                if (on && alignThumb) {
                    t.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: scrollBehavior() });
                }
            });
        }

        function updateUI(index, alignThumb) {
            activeIndex = index;
            if (countCurrent) countCurrent.textContent = String(index + 1);
            if (progressFill) progressFill.style.width = `${((index + 1) / n) * 100}%`;
            updateA11y(index, Boolean(alignThumb));
        }

        function slideWidth() {
            return viewport.clientWidth || 1;
        }

        function goTo(i) {
            const next = ((i % n) + n) % n;
            const w = slideWidth();
            viewport.scrollTo({
                left: next * w,
                behavior: scrollBehavior()
            });
            updateUI(next, true);
        }

        function readIndexFromScroll() {
            const w = slideWidth();
            if (w <= 0) return 0;
            let idx = Math.round(viewport.scrollLeft / w);
            idx = Math.max(0, Math.min(n - 1, idx));
            return idx;
        }

        function onScroll() {
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(() => {
                const idx = readIndexFromScroll();
                if (idx !== activeIndex) updateUI(idx, false);
            });
        }

        viewport.addEventListener('scroll', onScroll, { passive: true });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => goTo(activeIndex + 1));
        }

        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goTo(activeIndex - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goTo(activeIndex + 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                goTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goTo(n - 1);
            }
        });

        window.addEventListener('resize', debounce(() => {
            const w = slideWidth();
            viewport.scrollTo({ left: activeIndex * w, behavior: 'auto' });
        }, 120));

        updateUI(0, false);
        viewport.scrollLeft = 0;
    }

    // ============================================
    // OJT — Ask AI button (per slide)
    // ============================================
    function initOjtAiTriggers() {
        const buttons = document.querySelectorAll('.ojt-ask-ai');
        if (buttons.length === 0) return;

        buttons.forEach((btn) => {
            const entry = btn.closest('.ojt-entry');
            const titleEl = entry ? entry.querySelector('.ojt-week') : null;
            const query = titleEl ? titleEl.textContent.trim() : '';
            if (!query) return;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('connery-ai:ask', { detail: { query } }));
            });
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
        initOjtGalleryCarousel();
        initOjtAiTriggers();

        updateActiveNavLink();

        window.addEventListener('popstate', updateActiveNavLink);

        const optimizedScrollHandler = debounce(updateActiveNavLink, 16);
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
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

})();
