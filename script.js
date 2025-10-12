// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Smooth Scroll with Offset for Fixed Navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });
});

// Navbar Visibility on Scroll + Space Background Fade
const navbar = document.querySelector('.navbar');
const spaceBackground = document.querySelector('.space-background');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Show navbar when scrolling down past 100px
    if (currentScroll > 100) {
        navbar.classList.add('visible');
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.classList.remove('visible');
        navbar.style.boxShadow = 'none';
    }

    // Fade out space background gradually until FAQ section
    const faqSection = document.querySelector('.faq');
    const fadeStartPoint = windowHeight * 0.5; // Start fading halfway through first viewport

    let fadeEndPoint = documentHeight * 0.85; // Default fallback
    if (faqSection) {
        // Fade should complete when FAQ section reaches middle of viewport
        fadeEndPoint = faqSection.offsetTop - (windowHeight / 2);
    }

    const fadeRange = fadeEndPoint - fadeStartPoint;

    let opacity = 1;
    if (currentScroll > fadeStartPoint) {
        const scrollInFadeRange = currentScroll - fadeStartPoint;
        const fadeProgress = scrollInFadeRange / fadeRange;
        opacity = 1 - (fadeProgress * 0.80); // Fade from 1.0 to 0.2
    }

    opacity = Math.max(0.2, Math.min(1, opacity)); // Keep minimum 20% visibility

    if (spaceBackground) {
        spaceBackground.style.opacity = opacity;
    }

    lastScroll = currentScroll;
});

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Waitlist Form Handler
const waitlistForm = document.getElementById('waitlist-form');
const successMessage = document.getElementById('success-message');

if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(waitlistForm);
        const data = Object.fromEntries(formData);

        // Simulate form submission (replace with actual API call)
        try {
            // Show loading state
            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Processando...</span>';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store in localStorage (for demo purposes)
            const waitlistData = JSON.parse(localStorage.getItem('waitlist') || '[]');
            waitlistData.push({
                ...data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('waitlist', JSON.stringify(waitlistData));

            // Hide form and show success message
            waitlistForm.style.display = 'none';
            successMessage.style.display = 'block';

            // Optional: Send to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'waitlist_signup', {
                    'event_category': 'engagement',
                    'event_label': 'Waitlist Form'
                });
            }

            // Reset form
            waitlistForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert('Erro ao processar sua solicitação. Por favor, tente novamente.');

            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Phone Number Mask
const phoneInput = document.getElementById('telefone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '($1');
        }

        e.target.value = value;
    });
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.sobre-card, .step, .feature-card, .faq-item').forEach(el => {
    observer.observe(el);
});

// Add animation class to CSS
const style = document.createElement('style');
style.textContent = `
    .sobre-card, .step, .feature-card, .faq-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .nav-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 10, 0.98);
        padding: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
    }
`;
document.head.appendChild(style);

// Advanced Space Particles Effect
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    const starsCount = 150;

    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.className = 'particle-star';

        const size = Math.random() * 2.5 + 0.5;
        const isGreen = Math.random() > 0.85; // 15% chance de ser verde
        const speed = 15 + Math.random() * 50; // velocidade variada
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const opacity = 0.3 + Math.random() * 0.7;
        const delay = Math.random() * -speed;

        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${isGreen ? 'rgba(34, 197, 94, 0.9)' : 'white'};
            border-radius: 50%;
            top: ${startY}%;
            left: ${startX}%;
            opacity: ${opacity};
            box-shadow: 0 0 ${size * 2}px ${isGreen ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 255, 255, 0.5)'};
            animation: moveParticle ${speed}s linear infinite, twinkleParticle ${2 + Math.random() * 3}s ease-in-out infinite;
            animation-delay: ${delay}s, ${Math.random() * 2}s;
            will-change: transform, opacity;
        `;
        starsContainer.appendChild(star);
    }

    // Adiciona estrelas cadentes ocasionais
    setInterval(() => {
        if (Math.random() > 0.7) {
            createShootingStar();
        }
    }, 2500);
}

// Criar estrelas cadentes
function createShootingStar() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';

    const startX = 30 + Math.random() * 40;
    const startY = Math.random() * 40;
    const isGreen = Math.random() > 0.5;
    const angle = 45 + Math.random() * 20;

    star.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: ${isGreen ? 'rgba(34, 197, 94, 1)' : 'white'};
        border-radius: 50%;
        top: ${startY}%;
        left: ${startX}%;
        box-shadow: 0 0 10px ${isGreen ? 'rgba(34, 197, 94, 0.9)' : 'rgba(255, 255, 255, 0.9)'},
                    0 0 25px ${isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
        animation: shootingStar ${1 + Math.random() * 0.5}s ease-out forwards;
        pointer-events: none;
        will-change: transform, opacity;
        z-index: 10;
    `;

    starsContainer.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 1500);
}

// Adiciona animações CSS dinâmicas
const starAnimations = document.createElement('style');
starAnimations.textContent = `
    @keyframes moveParticle {
        from {
            transform: translate(0, 0);
        }
        to {
            transform: translate(-120vw, -120vh);
        }
    }

    @keyframes twinkleParticle {
        0%, 100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }

    @keyframes shootingStar {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        70% {
            opacity: 1;
        }
        100% {
            transform: translate(200px, 200px) scale(0);
            opacity: 0;
        }
    }

    .particle-star {
        will-change: transform, opacity;
    }

    .shooting-star {
        will-change: transform, opacity;
    }
`;
document.head.appendChild(starAnimations);

// Initialize on load
window.addEventListener('load', () => {
    createStars();
});

// Counter Animation for Stats (if you add stats section)
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Track waitlist count
function updateWaitlistCount() {
    const countElement = document.querySelector('.waitlist-count');
    if (countElement) {
        const waitlistData = JSON.parse(localStorage.getItem('waitlist') || '[]');
        animateCounter(countElement, waitlistData.length);
    }
}

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    const heroText = document.querySelector('.hero-text');

    if (heroVisual && window.innerWidth > 768) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    if (heroText && window.innerWidth > 768) {
        heroText.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Add floating animation to cards
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
});

// Easter Egg: Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

window.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        // Easter egg activated
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Log welcome message
console.log('%c🚀 Ramppy - Ramp up your sales!', 'font-size: 20px; font-weight: bold; color: #22c55e;');
console.log('%cInteressado em trabalhar conosco? Entre em contato!', 'font-size: 14px; color: #a3a3a3;');

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Página carregada em ${pageLoadTime}ms`);
    });
}

// Login Modal
const loginModal = document.getElementById('login-modal');
const loginButton = document.querySelector('.btn-login');
const modalClose = document.querySelector('.modal-close');
const loginForm = document.getElementById('login-form');
const togglePassword = document.querySelector('.toggle-password');

// Open modal
if (loginButton) {
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
}

// Close modal
if (modalClose) {
    modalClose.addEventListener('click', () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });
}

// Close modal when clicking outside
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('active')) {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Toggle password visibility
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('login-senha');
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        // Change icon
        const eyeIcon = togglePassword.querySelector('svg');
        if (type === 'text') {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        // Show loading state
        const submitBtn = loginForm.querySelector('.btn-login-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;

        try {
            // Simulate API call (replace with actual authentication)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store login state (demo purposes)
            localStorage.setItem('user', JSON.stringify({
                email: email,
                loginTime: new Date().toISOString()
            }));

            // Close modal
            loginModal.classList.remove('active');
            document.body.style.overflow = '';

            // Show success message
            alert('Login realizado com sucesso! Bem-vindo à Ramppy.');

            // Reset form
            loginForm.reset();

        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Dev Login button (bypass authentication for development)
const devLoginBtn = document.querySelector('.btn-dev-login');
if (devLoginBtn) {
    devLoginBtn.addEventListener('click', () => {
        localStorage.setItem('user', JSON.stringify({
            email: 'dev@ramppy.com',
            loginTime: new Date().toISOString(),
            isDev: true
        }));

        loginModal.classList.remove('active');
        document.body.style.overflow = '';
        alert('Dev Login realizado! Bem-vindo.');
    });
}

// Liquid Glass Mouse Follow Effect on Cards
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });

    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
    });
});