// Handlers de autenticação seguros com verificação de disponibilidade
// Este arquivo substitui auth-handlers.js com correções de timing

(function() {
    'use strict';

    // Aguardar funções de auth estarem disponíveis
    function waitForAuthFunctions(callback) {
        let attempts = 0;
        const maxAttempts = 20;

        function check() {
            attempts++;

            if (typeof window.loginUser === 'function' &&
                typeof window.signupUser === 'function' &&
                typeof window.getCurrentUser === 'function' &&
                typeof window.logoutUser === 'function') {

                console.log('✓ Funções de auth disponíveis');
                callback();
                return true;
            }

            if (attempts >= maxAttempts) {
                console.error('✗ Timeout esperando funções de auth');
                return false;
            }

            setTimeout(check, 250);
        }

        check();
    }

    // Inicializar handlers quando funções estiverem prontas
    waitForAuthFunctions(function() {
        initializeAuthHandlers();
    });

    function initializeAuthHandlers() {
        console.log('Inicializando handlers de autenticação...');

        // ============= LOGIN =============
        const loginFormAuth = document.getElementById('login-form');
        if (loginFormAuth) {
            // Remover listeners antigos
            const newLoginForm = loginFormAuth.cloneNode(true);
            loginFormAuth.parentNode.replaceChild(newLoginForm, loginFormAuth);

            newLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Login form submitted');

                const email = document.getElementById('login-email').value;
                const senha = document.getElementById('login-senha').value;

                const submitBtn = newLoginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Entrando...';
                submitBtn.disabled = true;

                try {
                    const result = await window.loginUser(email, senha);

                    if (result && result.success) {
                        // Fechar modal
                        const loginModal = document.getElementById('login-modal');
                        if (loginModal) {
                            loginModal.classList.remove('active');
                            document.body.style.overflow = '';
                        }

                        // Resetar form
                        newLoginForm.reset();

                        // Atualizar UI
                        updateAuthButtons();
                    } else {
                        const errorMsg = (result && result.error) || 'Erro ao fazer login';
                        showNotification(errorMsg, 'error');
                    }

                } catch (error) {
                    console.error('Erro no login:', error);
                    showNotification('Erro ao fazer login. Tente novamente.', 'error');
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // ============= CADASTRO =============
        const signupFormAuth = document.getElementById('signup-form');
        if (signupFormAuth) {
            // Remover listeners antigos
            const newSignupForm = signupFormAuth.cloneNode(true);
            signupFormAuth.parentNode.replaceChild(newSignupForm, signupFormAuth);

            newSignupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Signup form submitted');

                const nome = document.getElementById('signup-nome').value;
                const email = document.getElementById('signup-email').value;
                const senha = document.getElementById('signup-senha').value;
                const empresa = document.getElementById('signup-empresa').value;

                const submitBtn = newSignupForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Criando conta...';
                submitBtn.disabled = true;

                try {
                    const result = await window.signupUser(nome, email, senha, empresa);

                    if (result && result.success) {
                        // Mostrar mensagem de sucesso
                        showNotification(result.message || 'Conta criada com sucesso!', 'success');

                        // Fechar modal
                        const signupModal = document.getElementById('signup-modal');
                        if (signupModal) {
                            signupModal.classList.remove('active');
                            document.body.style.overflow = '';
                        }

                        // Resetar form
                        newSignupForm.reset();

                        // Atualizar UI
                        updateAuthButtons();
                    } else {
                        const errorMsg = (result && result.error) || 'Erro ao criar conta';
                        showNotification(errorMsg, 'error');
                    }

                } catch (error) {
                    console.error('Erro no cadastro:', error);
                    showNotification('Erro ao criar conta. Tente novamente.', 'error');
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    // ============= ATUALIZAR BOTÕES =============
    window.updateAuthButtons = function() {
        if (typeof window.getCurrentUser !== 'function') {
            console.warn('getCurrentUser não está disponível ainda');
            return;
        }

        const user = window.getCurrentUser();
        const navActions = document.querySelector('.nav-actions');

        if (!navActions) return;

        const loginBtn = navActions.querySelector('.btn-login');
        const signupBtn = navActions.querySelector('.btn-signup');

        if (user && user.isLoggedIn) {
            // Usuário logado - mostrar "Meu Perfil"
            if (loginBtn) {
                loginBtn.textContent = 'Meu Perfil';
                loginBtn.href = '#perfil';

                // Remover handlers antigos
                const newLoginBtn = loginBtn.cloneNode(true);
                loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

                // Adicionar novo handler
                newLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showProfile();
                });
            }

            if (signupBtn) {
                signupBtn.style.display = 'none';
            }
        } else {
            // Usuário não logado - mostrar "Login" e "Cadastro"
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.href = '#login';
            }

            if (signupBtn) {
                signupBtn.style.display = '';
            }
        }
    };

    // ============= PERFIL =============
    window.showProfile = function() {
        if (typeof window.getCurrentUser !== 'function') {
            console.error('getCurrentUser não está disponível');
            return;
        }

        const user = window.getCurrentUser();

        if (!user) {
            showNotification('Você não está logado', 'error');
            return;
        }

        // Criar modal customizado
        const profileModal = document.createElement('div');
        profileModal.className = 'modal-overlay active';
        profileModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="login-header">
                    <h2>Meu Perfil</h2>
                </div>

                <div style="margin: 24px 0;">
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--text-secondary); font-size: 13px;">Nome:</strong>
                        <p style="margin: 4px 0 0 0; color: var(--text-primary);">${user.nome || 'Não informado'}</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--text-secondary); font-size: 13px;">Email:</strong>
                        <p style="margin: 4px 0 0 0; color: var(--text-primary);">${user.email || 'Não informado'}</p>
                    </div>
                    ${user.empresa ? `
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--text-secondary); font-size: 13px;">Empresa:</strong>
                        <p style="margin: 4px 0 0 0; color: var(--text-primary);">${user.empresa}</p>
                    </div>
                    ` : ''}
                </div>

                <button onclick="handleLogout()" class="btn-primary btn-full" style="margin-bottom: 12px;">
                    Fazer Logout
                </button>
                <button onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" class="btn-secondary btn-full">
                    Fechar
                </button>
            </div>
        `;

        document.body.appendChild(profileModal);
        document.body.style.overflow = 'hidden';
    };

    // ============= LOGOUT =============
    window.handleLogout = function() {
        if (typeof window.logoutUser === 'function') {
            window.logoutUser();
        }

        // Fechar modal de perfil
        const profileModal = document.querySelector('.modal-overlay');
        if (profileModal) {
            profileModal.remove();
            document.body.style.overflow = '';
        }

        // Recarregar página
        location.reload();
    };

    // Função auxiliar para notificações
    function showNotification(message, type) {
        // Usar sistema de notificação se disponível
        if (window.NotificationSystem && window.NotificationSystem.show) {
            window.NotificationSystem.show(message, type);
        } else {
            // Fallback para alert
            alert(message);
        }
    }

    // ============= VERIFICAR LOGIN AO CARREGAR =============
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar funções estarem disponíveis
        waitForAuthFunctions(function() {
            updateAuthButtons();
        });
    });

    // Verificar quando página volta a ficar visível
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && typeof updateAuthButtons === 'function') {
            updateAuthButtons();
        }
    });

    // Escutar evento customizado de auth pronto
    window.addEventListener('authReady', () => {
        console.log('Auth está pronto - atualizando UI');
        if (typeof updateAuthButtons === 'function') {
            updateAuthButtons();
        }
    });

})();