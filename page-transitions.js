// Page Transitions
document.addEventListener('DOMContentLoaded', function() {
    // Fade in on page load
    document.body.classList.remove('page-transition');

    // Add smooth transition for navigation links
    const links = document.querySelectorAll('a[href]');

    links.forEach(link => {
        // Skip links that open in new tab, are anchors, or have specific classes to ignore
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        if (
            target === '_blank' ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.classList.contains('no-transition')
        ) {
            return;
        }

        link.addEventListener('click', function(e) {
            // Check if it's a valid internal link
            if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
                e.preventDefault();

                // Add transition class
                document.body.classList.add('page-transition');

                // Navigate after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 800); // Match the CSS transition duration
            } else if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
                // Handle absolute URLs on same domain
                e.preventDefault();

                document.body.classList.add('page-transition');

                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            }
        });
    });
});

// Ensure page fades in when using back/forward buttons
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        document.body.classList.remove('page-transition');
    }
});
