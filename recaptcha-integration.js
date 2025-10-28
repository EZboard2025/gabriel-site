// ============================================
// GOOGLE reCAPTCHA v3 INTEGRATION
// ============================================

(function() {
    'use strict';

    // IMPORTANTE: Substitua pela sua chave pública do reCAPTCHA
    const RECAPTCHA_SITE_KEY = '6LdKN5MqAAAAAL3RhI7eKBz8X9B6kEYmFvQ0VqNJ';

    class RecaptchaManager {
        constructor() {
            this.isLoaded = false;
            this.loadRecaptcha();
        }

        loadRecaptcha() {
            // Adicionar script do reCAPTCHA
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                this.isLoaded = true;
                this.setupFormProtection();
            };

            document.head.appendChild(script);
        }

        async getToken(action = 'submit') {
            if (!this.isLoaded) {
                throw new Error('reCAPTCHA não carregado');
            }

            return new Promise((resolve) => {
                grecaptcha.ready(() => {
                    grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
                        .then(token => resolve(token))
                        .catch(err => {
                            console.error('Erro ao obter token reCAPTCHA:', err);
                            resolve(null);
                        });
                });
            });
        }

        setupFormProtection() {
            document.addEventListener('DOMContentLoaded', () => {
                // Proteger formulário de fila de espera
                const waitlistForm = document.getElementById('waitlist-form');
                if (waitlistForm) {
                    this.protectForm(waitlistForm, 'waitlist');
                }

                // Proteger formulário de contato
                const contactForm = document.getElementById('contact-form');
                if (contactForm) {
                    this.protectForm(contactForm, 'contact');
                }

                // Proteger formulário de login
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    this.protectForm(loginForm, 'login');
                }

                // Proteger formulário de registro
                const signupForm = document.getElementById('signup-form');
                if (signupForm) {
                    this.protectForm(signupForm, 'signup');
                }
            });
        }

        protectForm(form, action) {
            // Interceptar submit
            const originalSubmit = form.onsubmit;

            form.onsubmit = async (e) => {
                e.preventDefault();

                // Mostrar loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.innerHTML : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Verificando...</span>';
                }

                try {
                    // Obter token do reCAPTCHA
                    const token = await this.getToken(action);

                    if (!token) {
                        throw new Error('Falha na verificação de segurança');
                    }

                    // Adicionar token ao form
                    let tokenInput = form.querySelector('input[name="recaptcha_token"]');
                    if (!tokenInput) {
                        tokenInput = document.createElement('input');
                        tokenInput.type = 'hidden';
                        tokenInput.name = 'recaptcha_token';
                        form.appendChild(tokenInput);
                    }
                    tokenInput.value = token;

                    // Verificar score no servidor (simulado aqui)
                    const isHuman = await this.verifyToken(token, action);

                    if (!isHuman) {
                        throw new Error('Verificação de segurança falhou. Tente novamente.');
                    }

                    // Continuar com submit original
                    if (originalSubmit) {
                        originalSubmit.call(form, e);
                    } else {
                        // Submit padrão
                        form.submit();
                    }

                } catch (error) {
                    if (window.ramppyNotifications) {
                        window.ramppyNotifications.modal({
                            title: 'Erro de Verificação',
                            message: error.message,
                            type: 'error'
                        });
                    } else {
                        alert(error.message);
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                }

                return false;
            };
        }

        async verifyToken(token, action) {
            // Em produção, isso deve ser feito no servidor
            // Aqui apenas simulamos a verificação

            // Verificação básica do token
            if (!token || token.length < 100) {
                return false;
            }

            // Em produção, fazer chamada para seu backend:
            // const response = await fetch('/api/verify-recaptcha', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ token, action })
            // });
            // const data = await response.json();
            // return data.success && data.score > 0.5;

            // Simulação (sempre retorna true em desenvolvimento)
            if (window.location.hostname === 'localhost' ||
                window.location.hostname.includes('192.168')) {
                return true;
            }

            // Em produção, seria mais rigoroso
            return Math.random() > 0.1; // 90% de chance de sucesso (simulado)
        }

        // Badge do reCAPTCHA customizado
        hideBadge() {
            const style = document.createElement('style');
            style.innerHTML = `
                .grecaptcha-badge {
                    visibility: hidden !important;
                }
            `;
            document.head.appendChild(style);

            // Adicionar texto de conformidade
            const footer = document.querySelector('.footer');
            if (footer) {
                const disclaimer = document.createElement('div');
                disclaimer.style.cssText = 'text-align: center; font-size: 12px; color: #666; padding: 10px;';
                disclaimer.innerHTML = 'Este site é protegido pelo reCAPTCHA e pelo Google ' +
                    '<a href="https://policies.google.com/privacy" target="_blank">Política de Privacidade</a> e ' +
                    '<a href="https://policies.google.com/terms" target="_blank">Termos de Serviço</a>.';
                footer.appendChild(disclaimer);
            }
        }
    }

    // Inicializar
    window.ramppyRecaptcha = new RecaptchaManager();

    // Opcional: esconder badge (mas manter conformidade)
    // window.ramppyRecaptcha.hideBadge();

})();