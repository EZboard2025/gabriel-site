// Page Transitions JavaScript

// Add transition overlay to page
function initPageTransitions() {
    // Create transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition';
    document.body.appendChild(transitionOverlay);

    // Create loader
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(loader);

    // Fade in page on load
    window.addEventListener('load', () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    });

    // Handle all internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');

        if (!link) return;

        const href = link.getAttribute('href');

        // Skip external links, anchors, and special links
        if (!href ||
            href.startsWith('#') ||
            href.startsWith('http') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.target === '_blank') {
            return;
        }

        // Only transition for internal page links
        if (href.endsWith('.html') || href === 'index.html' || href === 'perfil.html') {
            e.preventDefault();
            navigateWithTransition(href);
        }
    });
}

// Navigate with smooth transition
function navigateWithTransition(url) {
    const transitionOverlay = document.querySelector('.page-transition');
    const loader = document.querySelector('.page-loader');

    // Show transition
    transitionOverlay.classList.add('active');
    loader.classList.add('active');

    // Navigate after transition
    setTimeout(() => {
        window.location.href = url;
    }, 150);
}

// Add body class for initial load
document.body.classList.add('loading');

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransitions);
} else {
    initPageTransitions();
}

// Smooth page transitions for specific navigation
window.navigateToProfile = function() {
    navigateWithTransition('perfil.html');
};

window.navigateToHome = function() {
    navigateWithTransition('index.html');
};
