// ============================================
// RAMPPY SECURITY UTILITIES - NÍVEL GOOGLE
// ============================================

(function() {
    'use strict';

    // ==========================================
    // 1. SANITIZAÇÃO E VALIDAÇÃO
    // ==========================================

    class SecurityUtils {
        constructor() {
            this.initCSRFToken();
            this.initRateLimiter();
            this.setupSecurityHeaders();
        }

        // Sanitização contra XSS
        sanitizeHTML(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // Escape HTML entities
        escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            };
            return String(text).replace(/[&<>"'`=\/]/g, s => map[s]);
        }

        // Validação de email rigorosa
        validateEmail(email) {
            const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!re.test(email)) return false;
            if (email.length > 254) return false;

            // Bloqueia emails temporários conhecidos
            const tempDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com'];
            const domain = email.split('@')[1];
            if (tempDomains.includes(domain)) return false;

            return true;
        }

        // Validação de input genérica
        validateInput(input, type = 'text', maxLength = 1000) {
            if (!input) return false;
            if (input.length > maxLength) return false;

            // Remove caracteres perigosos
            const dangerous = /<script|<iframe|javascript:|onerror=|onclick=|onload=/gi;
            if (dangerous.test(input)) return false;

            switch(type) {
                case 'name':
                    return /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/.test(input);
                case 'company':
                    return /^[a-zA-ZÀ-ÿ0-9\s&,.-]{2,200}$/.test(input);
                case 'phone':
                    return /^[\d\s()+-]{10,20}$/.test(input);
                case 'message':
                    return input.length >= 10 && input.length <= maxLength;
                default:
                    return true;
            }
        }

        // ==========================================
        // 2. CSRF PROTECTION
        // ==========================================

        initCSRFToken() {
            const token = this.generateSecureToken();
            sessionStorage.setItem('csrf_token', token);

            // Adiciona token em todos os forms
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('form').forEach(form => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'csrf_token';
                    input.value = token;
                    form.appendChild(input);
                });
            });
        }

        validateCSRFToken(token) {
            const storedToken = sessionStorage.getItem('csrf_token');
            return token && storedToken && token === storedToken;
        }

        generateSecureToken(length = 32) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }

        // ==========================================
        // 3. RATE LIMITING
        // ==========================================

        initRateLimiter() {
            this.rateLimits = new Map();
            this.cleanupInterval = setInterval(() => this.cleanupRateLimits(), 60000);
        }

        checkRateLimit(action, identifier = 'global', maxAttempts = 5, windowMs = 60000) {
            const key = `${action}:${identifier}`;
            const now = Date.now();

            if (!this.rateLimits.has(key)) {
                this.rateLimits.set(key, []);
            }

            const attempts = this.rateLimits.get(key);
            const recentAttempts = attempts.filter(time => now - time < windowMs);

            if (recentAttempts.length >= maxAttempts) {
                const oldestAttempt = recentAttempts[0];
                const resetTime = oldestAttempt + windowMs;
                const waitTime = Math.ceil((resetTime - now) / 1000);

                throw new Error(`Rate limit excedido. Tente novamente em ${waitTime} segundos.`);
            }

            recentAttempts.push(now);
            this.rateLimits.set(key, recentAttempts);

            return true;
        }

        cleanupRateLimits() {
            const now = Date.now();
            const maxAge = 300000; // 5 minutos

            for (const [key, attempts] of this.rateLimits) {
                const recent = attempts.filter(time => now - time < maxAge);
                if (recent.length === 0) {
                    this.rateLimits.delete(key);
                } else {
                    this.rateLimits.set(key, recent);
                }
            }
        }

        // ==========================================
        // 4. PASSWORD SECURITY (bcrypt-like)
        // ==========================================

        async hashPassword(password) {
            // Usar Web Crypto API para hash seguro
            const encoder = new TextEncoder();
            const salt = crypto.getRandomValues(new Uint8Array(16));

            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits']
            );

            const hashBuffer = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000, // Alto número de iterações
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );

            const hashArray = new Uint8Array(hashBuffer);
            const saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('');
            const hashHex = Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');

            return `pbkdf2$100000$${saltHex}$${hashHex}`;
        }

        async verifyPassword(password, storedHash) {
            const parts = storedHash.split('$');
            if (parts[0] !== 'pbkdf2' || parts.length !== 4) return false;

            const iterations = parseInt(parts[1]);
            const salt = new Uint8Array(parts[2].match(/.{2}/g).map(byte => parseInt(byte, 16)));
            const hash = parts[3];

            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits']
            );

            const hashBuffer = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );

            const hashArray = new Uint8Array(hashBuffer);
            const computedHash = Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');

            return computedHash === hash;
        }

        // ==========================================
        // 5. SESSION MANAGEMENT
        // ==========================================

        createSecureSession(userData) {
            const sessionId = this.generateSecureToken();
            const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutos

            const session = {
                id: sessionId,
                userId: userData.id,
                expiresAt: expiresAt,
                fingerprint: this.generateFingerprint()
            };

            // Usar sessionStorage em vez de localStorage
            sessionStorage.setItem('ramppy_session', JSON.stringify(session));

            // Dados não sensíveis em localStorage
            localStorage.setItem('ramppy_user', JSON.stringify({
                nome: userData.nome,
                email: userData.email,
                empresa: userData.empresa
            }));

            return session;
        }

        validateSession() {
            const sessionStr = sessionStorage.getItem('ramppy_session');
            if (!sessionStr) return false;

            try {
                const session = JSON.parse(sessionStr);

                // Verifica expiração
                if (Date.now() > session.expiresAt) {
                    this.clearSession();
                    return false;
                }

                // Verifica fingerprint
                if (session.fingerprint !== this.generateFingerprint()) {
                    this.clearSession();
                    return false;
                }

                // Renovar sessão se estiver próxima de expirar
                if (Date.now() > session.expiresAt - (5 * 60 * 1000)) {
                    session.expiresAt = Date.now() + (30 * 60 * 1000);
                    sessionStorage.setItem('ramppy_session', JSON.stringify(session));
                }

                return true;
            } catch (e) {
                this.clearSession();
                return false;
            }
        }

        clearSession() {
            sessionStorage.removeItem('ramppy_session');
            localStorage.removeItem('ramppy_user');
        }

        generateFingerprint() {
            // Cria fingerprint baseado em características do navegador
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown',
                navigator.platform
            ].join('|');

            // Hash simples do fingerprint
            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }

            return hash.toString(36);
        }

        // ==========================================
        // 6. SECURITY HEADERS
        // ==========================================

        setupSecurityHeaders() {
            // CSP via meta tag (sem frame-ancestors que causa erro)
            if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
                const csp = document.createElement('meta');
                csp.httpEquiv = 'Content-Security-Policy';
                csp.content = "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: https:; " +
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
                    "frame-src https://www.google.com; " +
                    "object-src 'none'; " +
                    "base-uri 'self'; " +
                    "form-action 'self';";
                    // Removido frame-ancestors - só funciona via HTTP header, não meta tag
                document.head.appendChild(csp);
            }

            // Headers de segurança devem ser definidos via servidor HTTP
            // frame-ancestors deve ser configurado via .htaccess ou vercel.json
        }

        // ==========================================
        // 7. INPUT MONITORING
        // ==========================================

        setupInputProtection() {
            document.addEventListener('DOMContentLoaded', () => {
                // Prevenir paste de scripts
                document.querySelectorAll('input, textarea').forEach(element => {
                    element.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const text = (e.clipboardData || window.clipboardData).getData('text');
                        const clean = this.sanitizeHTML(text);
                        document.execCommand('insertText', false, clean);
                    });

                    // Validação em tempo real
                    element.addEventListener('input', (e) => {
                        const value = e.target.value;
                        if (/<script|<iframe|javascript:|onerror=|onclick=/gi.test(value)) {
                            e.target.value = value.replace(/<script|<iframe|javascript:|onerror=|onclick=/gi, '');
                            this.showSecurityWarning();
                        }
                    });
                });
            });
        }

        showSecurityWarning() {
            if (window.ramppyNotifications) {
                window.ramppyNotifications.show(
                    'Conteúdo suspeito detectado e removido',
                    'warning'
                );
            }
        }

        // ==========================================
        // 8. ANTI-BOT MEASURES
        // ==========================================

        generateChallenge() {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const answer = num1 + num2;

            sessionStorage.setItem('challenge_answer', answer.toString());

            return {
                question: `Quanto é ${num1} + ${num2}?`,
                field: '<input type="number" name="challenge" required placeholder="Resposta" style="width: 100px;">'
            };
        }

        validateChallenge(userAnswer) {
            const correctAnswer = sessionStorage.getItem('challenge_answer');
            sessionStorage.removeItem('challenge_answer');

            return userAnswer && correctAnswer && userAnswer === correctAnswer;
        }

        // ==========================================
        // 9. LOGGING SEGURO
        // ==========================================

        secureLog(message, level = 'info') {
            // Em produção, desabilitar logs
            if (window.location.hostname !== 'localhost' &&
                !window.location.hostname.includes('192.168')) {
                return;
            }

            // Sanitizar mensagem antes de logar
            const safe = this.sanitizeHTML(message);
            console[level](`[SECURITY] ${safe}`);
        }
    }

    // Instanciar globalmente
    window.RamppySecurity = new SecurityUtils();

    // Auto-inicializar proteções
    window.RamppySecurity.setupInputProtection();

    // Desabilitar console em produção
    if (window.location.hostname !== 'localhost' &&
        !window.location.hostname.includes('192.168')) {
        const noop = () => {};
        ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
            console[method] = noop;
        });
    }

})();