// Brand Color Loader
// This script loads the user's brand color and applies it site-wide

(function() {
    'use strict';

    // Check if user is logged in and load their brand color
    async function loadUserBrandColor() {
        try {
            // Get user session from localStorage
            const sessionData = localStorage.getItem('ramppy_session');
            if (!sessionData) return;

            const user = JSON.parse(sessionData);
            if (!user || !user.id) return;

            // Try to get from localStorage first (faster)
            const cachedColor = localStorage.getItem('ramppy_brand_color');
            if (cachedColor) {
                applyBrandColor(cachedColor);
            }

            // Then fetch from database to ensure it's up to date
            if (typeof supabase !== 'undefined') {
                const { data, error } = await supabase
                    .from('users')
                    .select('brand_color')
                    .eq('id', user.id)
                    .single();

                if (!error && data?.brand_color) {
                    applyBrandColor(data.brand_color);
                    localStorage.setItem('ramppy_brand_color', data.brand_color);
                }
            }
        } catch (error) {
            console.log('Usando cor padrão da Ramppy');
        }
    }

    // Apply brand color to the entire site
    function applyBrandColor(color) {
        const rgb = hexToRgb(color);

        // Pre-calculate color variations
        const colorDark = adjustBrightness(color, -20);
        const colorDark15 = adjustBrightness(color, -15);
        const colorLight15 = adjustBrightness(color, 15);
        const colorLight30 = adjustBrightness(color, 30);

        // Set all color variables
        document.documentElement.style.setProperty('--primary-green', color);
        document.documentElement.style.setProperty('--primary-green-dark', colorDark);
        document.documentElement.style.setProperty('--primary-green-light', adjustBrightness(color, 20));

        // Set RGB values for rgba usage
        document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

        // Create or update dynamic styles
        let styleElement = document.getElementById('dynamic-brand-colors');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-brand-colors';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            /* Shooting Stars */
            .shooting-stars::before,
            .shooting-stars::after {
                background: linear-gradient(90deg, ${color}, transparent) !important;
            }

            /* Stars Background - All stars with brand color */
            .stars {
                background-image:
                    radial-gradient(3px 3px at 72% 34%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8), transparent),
                    radial-gradient(3px 3px at 15% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), transparent),
                    radial-gradient(3px 3px at 15% 25%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), transparent),
                    radial-gradient(3px 3px at 88% 11%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(3px 3px at 55% 65%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(2px 2px at 82% 88%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), transparent),
                    radial-gradient(3px 3px at 25% 85%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), transparent),
                    radial-gradient(2px 2px at 91% 45%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), transparent),
                    radial-gradient(2px 2px at 45% 75%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(3px 3px at 8% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(3px 3px at 20% 55%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), transparent),
                    radial-gradient(2px 2px at 68% 2%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), transparent),
                    radial-gradient(4px 4px at 42% 32%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8), transparent),
                    radial-gradient(2px 2px at 33% 98%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(3px 3px at 28% 12%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), transparent),
                    radial-gradient(2px 2px at 95% 70%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), transparent) !important;
                background-size: 100% 100%;
                background-position: 0 0;
            }

            /* Gradient Text - Override hardcoded gradient */
            .gradient-text {
                background: linear-gradient(135deg, ${color} 0%, ${colorDark15} 20%, ${colorLight15} 40%, ${colorLight30} 60%, ${color} 80%, ${colorDark15} 100%) !important;
                background-size: 200% 200%;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                background-clip: text !important;
                text-shadow: 0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5) !important;
                animation: gradient-shift 8s ease infinite !important;
            }

            h1 span.gradient-text {
                text-shadow: 0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4) !important;
            }

            /* Gradient Orbs */
            .gradient-orb {
                background: radial-gradient(circle, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, transparent 70%) !important;
            }

            /* Badges and Highlights */
            .profile-badge,
            .urgency-badge,
            .section-tag {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
                border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
                color: ${color} !important;
            }

            /* Button Hover Effects */
            .btn-primary:hover {
                box-shadow: 0 8px 32px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
            }

            /* Input Focus */
            input:focus, textarea:focus, select:focus {
                border-color: ${color} !important;
                box-shadow: 0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
            }

            /* Links hover */
            .nav-links a:hover {
                color: ${color} !important;
            }

            /* Feature cards */
            .feature-card:hover {
                border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
            }

            /* Stats and highlights */
            .stat-icon {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
                color: ${color} !important;
            }

            /* Benefit items checkmarks */
            .benefit-item svg {
                stroke: ${color} !important;
            }

            /* Footer links hover */
            .footer-links a:hover {
                color: ${color} !important;
            }

            /* Avatar border */
            .profile-avatar {
                border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) !important;
                box-shadow: 0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
            }

            /* Edit button hover */
            .btn-edit:hover,
            .avatar-edit-btn:hover {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
                border-color: ${color} !important;
                color: ${color} !important;
            }

            /* Avatar edit button background */
            .avatar-edit-btn {
                background: ${color} !important;
            }

            .avatar-edit-btn:hover {
                background: ${colorDark} !important;
            }

            /* Step circles - Change background to brand color */
            .step-visual {
                background: linear-gradient(135deg, ${color} 0%, ${colorDark} 100%) !important;
                box-shadow: 0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
            }

            /* Feature card icons */
            .feature-card-icon {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
                color: ${color} !important;
            }

            .feature-card-icon svg {
                stroke: ${color} !important;
            }

            /* FAQ items when active */
            .faq-item.active .faq-question {
                color: ${color} !important;
            }

            /* Social links hover */
            .social-links a:hover {
                color: ${color} !important;
            }

            /* Form privacy link */
            .form-privacy a {
                color: ${color} !important;
            }

            /* Switch link */
            .switch-link {
                color: ${color} !important;
            }

            /* Forgot password link */
            .forgot-password {
                color: ${color} !important;
            }

            /* Mobile menu button hover */
            .mobile-menu-btn:hover span {
                background: ${color} !important;
            }

            /* Step number backgrounds */
            .step-number {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) !important;
                color: ${color} !important;
            }

            /* Step connector lines */
            .step-connector {
                background: linear-gradient(90deg, transparent, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), transparent) !important;
            }

            /* Customization info box */
            .customization-info {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) !important;
                border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
            }

            /* Success message */
            .success-message {
                background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important;
                border-color: ${color} !important;
            }

            .success-icon {
                background: ${color} !important;
            }
        `;
    }

    // Convert hex to RGB
    function hexToRgb(hex) {
        const num = parseInt(hex.replace('#', ''), 16);
        return {
            r: (num >> 16) & 0xff,
            g: (num >> 8) & 0xff,
            b: num & 0xff
        };
    }

    // Utility: Adjust color brightness
    function adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
        const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    // Load brand color when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadUserBrandColor);
    } else {
        loadUserBrandColor();
    }
})();
