document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initProjectFiltering();
    initContactForm();
    initSpotlight();
    initAppleStyleEffects();
    initHeroTyping();
});

// 1. DYNAMIC SPOTLIGHT FUNCTION (Safe for all pages)
function initSpotlight() {
    // Check if spotlight exists on this page
    const sTitle = document.getElementById('spotlight-title');
    const sDesc = document.getElementById('spotlight-desc');
    const sCat = document.getElementById('spotlight-cat');
    const sTech = document.getElementById('spotlight-tech');
    const sImg = document.getElementById('spotlight-img');
    const sLink = document.getElementById('spotlight-link');
    const pFill = document.querySelector('.progress-fill');

    // If elements don't exist (e.g., on games.html), stop immediately
    if (!sTitle || !sImg) return;

    // Spotlight Data
    const spotlightProjects = [
        {
            title: "OHE HEALTH",
            category: "WEBSITE",
            desc: "One of my most recent works",
            tech: "UI/UX • Laravel",
            img: "https://github.com/CRAEZIAN/Guillermo/blob/main/projects/screenshot%20one%20health/Landing_Page_(Desktop).png",
            link: "#gallery-one-health"
        },
        {
            title: "CRAZIAN_ART",
            category: "ART ACCOUNT",
            desc: "My art account where all my art is posted.",
            tech: "Drawing • Painting • Photography",
            img: "https://github.com/CRAEZIAN/Guillermo/blob/main/projects/pics/crazianpage.png",
            link: "https://github.com/CRAEZIAN"
        },
        {
            title: "EMJMG",
            category: "PERSONAL INSTAGRAM ACCOUNT",
            desc: "Personal Account where I post my most recent outfits",
            tech: "Photography • Editing • Social Media",
            img: "https://github.com/CRAEZIAN/Guillermo/blob/main/projects/pics/8.png",
            link: "https://www.instagram.com/emjmg/"
        },
        {
            title: "MEDGE GUILLERMO?",
            category: "WHO IS",
            desc: "A page dedicated to me hehe",
            tech: "Background • Hobby",
            img: "https://github.com/CRAEZIAN/Guillermo/blob/main/projects/pics/Aboutme.jpg",
            link: "about.html"
        }
    ];

    let currentSpotlight = 0;

    function rotateSpotlight() {
        // Pick next project
        const p = spotlightProjects[currentSpotlight];

        // 1. Reset Animations (Fade Out)
        sTitle.classList.remove('reveal-text');
        sDesc.classList.remove('reveal-text');
        sImg.classList.remove('zoom-active');

        // Reset Progress Bar Animation (Force Reflow)
        if (pFill) {
            pFill.style.animation = 'none';
            pFill.offsetHeight; /* Trigger reflow */
            pFill.style.animation = 'progress 4s linear infinite';
        }

        // Trigger text reflow
        void sTitle.offsetWidth;

        // 2. Update Content
        sTitle.textContent = p.title;
        sDesc.textContent = p.desc;
        if (sCat) sCat.textContent = p.category;
        if (sTech) sTech.textContent = p.tech;
        sImg.src = p.img;
        if (sLink) sLink.href = p.link;

        // 3. Add Animations Back (Fade In)
        sTitle.classList.add('reveal-text');
        sDesc.classList.add('reveal-text');
        setTimeout(() => sImg.classList.add('zoom-active'), 50);

        // 4. Increment Index
        currentSpotlight = (currentSpotlight + 1) % spotlightProjects.length;
    }

    // Start Loop
    rotateSpotlight();
    setInterval(rotateSpotlight, 4000);
}

// 2. NAVIGATION (scroll background + active links + MOBILE SIDEBAR)
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile sidebar elements (safe if not present)
    const toggleBtn = document.querySelector('.nav-toggle');
    const overlay = document.getElementById('navOverlay');

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    function openNav() {
        if (!navbar) return;
        navbar.classList.add('open');
        document.body.classList.add('nav-open');

        if (overlay) overlay.classList.add('show');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
        if (!navbar) return;
        navbar.classList.remove('open');
        document.body.classList.remove('nav-open');

        if (overlay) overlay.classList.remove('show');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    // Toggle button click
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (!navbar) return;
            navbar.classList.contains('open') ? closeNav() : openNav();
        });
    }

    // Overlay click closes
    if (overlay) {
        overlay.addEventListener('click', closeNav);
    }

    // Close sidebar when clicking a nav link (mobile only)
    if (navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) closeNav();
            });
        });
    }

    // ESC closes sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
    });

    // If resized to desktop, ensure sidebar closes
    window.addEventListener('resize', () => {
        if (!isMobile()) closeNav();
    });

    // Navbar background on scroll -> use CSS class (.scrolled)
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // set initial state
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    navLinks.forEach(link => link.classList.remove('active'));
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => navObserver.observe(section));
    }
}

// 3. SCROLL ANIMATIONS
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section-title, .experience-card, .project-card, .skill-item');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// 4. PROJECT FILTERING
function initProjectFiltering() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (categoryBtns.length === 0) return;

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');

            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });
        });
    });
}

// 5. CONTACT FORM
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const inputs = form.querySelectorAll('.form-input');

    // Input Focus Effects
    inputs.forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => {
            if (!input.value) input.parentElement.classList.remove('focused');
        });
    });

    // Submit Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const subject = `Portfolio Contact from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

        // Opens default mail client
        window.open(`mailto:roycenoel2001@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    });
}

// 6. APPLE STYLE EFFECTS (Ripple & Hover)
function initAppleStyleEffects() {
    // Button Ripple
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit, .btn-outline');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            const diameter = Math.max(button.clientWidth, button.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
            circle.classList.add('ripple');

            const ripple = button.getElementsByClassName('ripple')[0];
            if (ripple) ripple.remove();

            button.appendChild(circle);
        });
    });

    // Keyboard Navigation Accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });

    // Page Load Animation
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

// 7. HERO TYPING EFFECT
function initHeroTyping() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;

    const roles = [
        "Developer & Designer",
        "Professional Student",
        "Full Stack Tambay",
        "Cafe Hunter",
        "UI/UX Designer"
    ];

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = true;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            tagline.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            tagline.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 3000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start loop after initial 3s delay
    setTimeout(type, 3000);
}
