// Fix para garantir que as funções de autenticação estejam disponíveis
(function() {
    'use strict';

    let checkAttempts = 0;
    const maxAttempts = 20;

    function checkAuthFunctions() {
        checkAttempts++;

        const hasLoginUser = typeof window.loginUser === 'function';
        const hasSignupUser = typeof window.signupUser === 'function';
        const hasGetCurrentUser = typeof window.getCurrentUser === 'function';
        const hasLogoutUser = typeof window.logoutUser === 'function';

        console.log(`[Auth Check #${checkAttempts}] Functions available:`, {
            loginUser: hasLoginUser,
            signupUser: hasSignupUser,
            getCurrentUser: hasGetCurrentUser,
            logoutUser: hasLogoutUser
        });

        if (hasLoginUser && hasSignupUser && hasGetCurrentUser && hasLogoutUser) {
            console.log('✓ Todas as funções de autenticação estão disponíveis!');

            // Disparar evento customizado para indicar que auth está pronto
            window.dispatchEvent(new CustomEvent('authReady'));

            // Atualizar botões
            if (typeof updateAuthButtons === 'function') {
                updateAuthButtons();
            }

            return true;
        }

        if (checkAttempts >= maxAttempts) {
            console.error('✗ Timeout esperando funções de autenticação');

            // Criar funções vazias para evitar erros
            if (!hasLoginUser) {
                window.loginUser = function() {
                    console.error('loginUser não está disponível');
                    return Promise.resolve({ success: false, error: 'Sistema de login não carregado' });
                };
            }

            if (!hasSignupUser) {
                window.signupUser = function() {
                    console.error('signupUser não está disponível');
                    return Promise.resolve({ success: false, error: 'Sistema de cadastro não carregado' });
                };
            }

            if (!hasGetCurrentUser) {
                window.getCurrentUser = function() {
                    console.error('getCurrentUser não está disponível');
                    return null;
                };
            }

            if (!hasLogoutUser) {
                window.logoutUser = function() {
                    console.error('logoutUser não está disponível');
                    localStorage.removeItem('ramppy_session');
                    localStorage.removeItem('ramppy_user');
                };
            }

            return false;
        }

        // Tentar novamente
        setTimeout(checkAuthFunctions, 250);
    }

    // Iniciar verificação quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthFunctions);
    } else {
        // DOM já está carregado
        checkAuthFunctions();
    }
})();