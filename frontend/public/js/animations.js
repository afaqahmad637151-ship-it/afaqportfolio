// frontend/public/js/animations.js

// Ensure GSAP and ScrollTrigger are loaded (they should be globally available via <script> tags)
// If not, you might need to import them dynamically if using modules heavily:
// import { gsap } from './lib/gsap.min.js';
// import { ScrollTrigger } from './lib/ScrollTrigger.min.js';
// import { SplitText } from './lib/SplitText.min.js'; // If SplitText is available

/**
 * Initializes all GSAP and ScrollTrigger animations for the portfolio.
 */
export function initializeAnimations() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) { // Only if SplitText is loaded
        gsap.registerPlugin(SplitText);
    }

    // --- Lenis Smooth Scroll Initialization ---
    if (window.Lenis) {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Linear with slight overshoot
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
        
        window.lenisInstance = lenis; // Make lenis accessible globally for programmatic scrolls
    }

    // --- Loading Screen Animation ---
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        gsap.to(loadingScreen, {
            opacity: 0,
            visibility: 'hidden',
            delay: 2, // Allow content to load visually
            duration: 1,
            ease: 'power2.out',
            onComplete: () => {
                loadingScreen.remove(); // Remove from DOM after animation
                // Ensure initial Lenis refresh after loading screen is gone
                if (window.lenisInstance) {
                    window.lenisInstance.resize();
                    window.lenisInstance.raf(gsap.ticker.time * 1000);
                }
            }
        });
    }

    // --- Hero Section Animations ---
    const heroHeading = document.querySelector('.hero-heading');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    const heroVideo = document.querySelector('#hero .background-video');

    if (heroHeading && heroDescription && heroButtons) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

        // Split text for cinematic reveal (requires SplitText plugin)
        let splitHeading;
        if (window.SplitText) {
            splitHeading = new SplitText(heroHeading, { type: 'chars' });
            tl.from(splitHeading.chars, {
                opacity: 0,
                y: 50,
                rotationX: -90,
                stagger: 0.02,
                duration: 0.8
            }, 0.5);
        } else {
            // Fallback if SplitText is not available
            tl.from(heroHeading, {
                opacity: 0,
                y: 50,
                duration: 1.2
            }, 0.5);
        }
        
        // Parallax for hero content against video
        ScrollTrigger.create({
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            animation: gsap.to(heroHeading, { yPercent: -30, ease: "none" }),
        });
        ScrollTrigger.create({
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            animation: gsap.to(heroDescription, { yPercent: -20, ease: "none" }),
        });
        ScrollTrigger.create({
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            animation: gsap.to(heroButtons, { yPercent: -10, ease: "none" }),
        });
        // Video parallax (opposite direction)
        if (heroVideo) {
            ScrollTrigger.create({
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
                animation: gsap.to(heroVideo, { yPercent: 20, ease: "none" }),
            });
        }


        // Description and buttons fade in
        tl.to(heroDescription, { opacity: 1, y: 0, duration: 1.2 }, "-=0.8")
          .to(heroButtons, { opacity: 1, y: 0, duration: 1 }, "-=0.6");
    }

    // --- Section Scroll-Triggered Reveals ---
    const revealContainers = document.querySelectorAll('.reveal-container');

    revealContainers.forEach(container => {
        // Section Heading Reveal
        const sectionHeading = container.querySelector('.section-heading');
        if (sectionHeading) {
            let splitSectionHeading;
            if (window.SplitText) {
                splitSectionHeading = new SplitText(sectionHeading, { type: 'words,chars' });
                gsap.from(splitSectionHeading.chars, {
                    opacity: 0,
                    y: 20,
                    rotationX: -90,
                    stagger: 0.01,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionHeading,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    }
                });
            } else {
                gsap.from(sectionHeading, {
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionHeading,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    }
                });
            }
        }

        // Generic fade-in-up for child elements
        gsap.utils.toArray(container.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right')).forEach(element => {
            gsap.from(element, {
                opacity: 0,
                x: element.classList.contains('fade-in-left') ? -50 : (element.classList.contains('fade-in-right') ? 50 : 0),
                y: element.classList.contains('fade-in-up') ? 50 : 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                }
            });
        });

        // Blur reveal for images
        const blurRevealImages = container.querySelectorAll('.blur-reveal-image');
        blurRevealImages.forEach(img => {
            gsap.to(img, {
                filter: 'blur(0px)',
                opacity: 1,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: img,
                    start: 'top 80%',
                    end: 'bottom 30%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => img.classList.add('revealed'),
                    onLeaveBack: () => img.classList.remove('revealed') // Revert on scroll up
                }
            });
        });
    });

    // --- Staggered Card Reveals (Skills, Services, Portfolio, Testimonials) ---
    const staggerReveal = (selector, triggerSelector = selector, delay = 0, yOffset = 50) => {
        gsap.from(selector, {
            opacity: 0,
            y: yOffset,
            scale: 0.95,
            rotationX: -10,
            stagger: 0.1, // Stagger effect
            duration: 0.8,
            ease: 'power3.out',
            delay: delay,
            scrollTrigger: {
                trigger: triggerSelector,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            }
        });
    };

    staggerReveal('.skill-card', '#skills-grid', 0.5); // Delay after heading
    staggerReveal('.service-card', '#services-grid', 0.5);
    staggerReveal('.project-card', '#portfolio-grid', 0.5);
    staggerReveal('.testimonial-card', '#testimonials-carousel', 0.5);

    // --- Navbar Shrink on Scroll ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top -80', // After scrolling 80px
            end: 'max',
            onEnter: () => gsap.to(navbar, { padding: '8px 0', duration: 0.3, backgroundColor: 'rgba(15, 23, 42, 0.9)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }),
            onLeaveBack: () => gsap.to(navbar, { padding: '16px 0', duration: 0.3, backgroundColor: 'rgba(15, 23, 42, 0.7)', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' })
        });
    }

    // --- Video Background Opacity on Scroll ---
    document.querySelectorAll('.cinematic-background').forEach(section => {
        const video = section.querySelector('.background-video');
        if (video) {
            gsap.to(video, {
                filter: 'brightness(0.3) blur(5px)', // Darken and blur more on scroll
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                }
            });
        }
    });

    // --- Mouse Parallax (Optional - complex for pure HTML, simplified example) ---
    // For a truly advanced effect, might use a dedicated library or more complex JS.
    // This is a simplified version for demonstration.
    const parallaxElements = document.querySelectorAll('.hero-content, .about-image'); // Example targets
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxSpeed || 0.05); // Data attribute for speed
            gsap.to(el, {
                x: x * 20 * speed,
                y: y * 20 * speed,
                rotationX: y * 2, // Slight 3D tilt
                rotationY: -x * 2,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });

    // --- 3D Hover Effect for Cards (example, CSS handles base, GSAP can enhance) ---
    document.querySelectorAll('.glassmorphism-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width; // 0-1
            const y = (e.clientY - rect.top) / rect.height; // 0-1

            const rotateX = (y - 0.5) * 20; // -10 to 10 degrees
            const rotateY = (x - 0.5) * -20; // -10 to 10 degrees

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                scale: 1.03,
                duration: 0.3,
                ease: 'power2.out',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)',
            });
        });
    });

    // --- Cursor Glow effect is initialized in utils.js, GSAP could enhance its behavior if needed ---
    // For instance, scaling it on hover over interactive elements with a GSAP timeline.
}