// Handlers de autenticação para os formulários
// Este arquivo conecta os formulários HTML com as funções de autenticação

// ============= LOGIN =============
const loginFormAuth = document.getElementById('login-form');
if (loginFormAuth) {
    loginFormAuth.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        const submitBtn = loginFormAuth.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;

        try {
            const result = await loginUser(email, senha);

            if (result.success) {
                // Fechar modal
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                    loginModal.classList.remove('active');
                    document.body.style.overflow = '';
                }

                // Resetar form
                loginFormAuth.reset();

                // Atualizar UI
                updateAuthButtons();
            } else {
                alert(result.error || 'Erro ao fazer login');
            }

        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============= CADASTRO =============
const signupFormAuth = document.getElementById('signup-form');
if (signupFormAuth) {
    signupFormAuth.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('signup-nome').value;
        const email = document.getElementById('signup-email').value;
        const senha = document.getElementById('signup-senha').value;
        const empresa = document.getElementById('signup-empresa').value;

        const submitBtn = signupFormAuth.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Criando conta...';
        submitBtn.disabled = true;

        try {
            const result = await signupUser(nome, email, senha, empresa);

            if (result.success) {
                // Fechar modal SEM ALERT
                const signupModal = document.getElementById('signup-modal');
                if (signupModal) {
                    signupModal.classList.remove('active');
                    document.body.style.overflow = '';
                }

                // Resetar form
                signupFormAuth.reset();

                // Atualizar UI
                updateAuthButtons();
            } else {
                alert(result.error || 'Erro ao criar conta');
            }

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro ao criar conta. Tente novamente.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============= ATUALIZAR BOTÕES =============
function updateAuthButtons() {
    const user = getCurrentUser();
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
                window.location.href = 'perfil.html';
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
}

// ============= PERFIL =============
function showProfile() {
    const user = getCurrentUser();

    if (!user) {
        alert('Você não está logado');
        return;
    }

    // Criar modal customizado ao invés de confirm
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
                    <p style="margin: 4px 0 0 0; color: var(--text-primary);">${user.nome}</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: var(--text-secondary); font-size: 13px;">Email:</strong>
                    <p style="margin: 4px 0 0 0; color: var(--text-primary);">${user.email}</p>
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
}

// ============= LOGOUT =============
function handleLogout() {
    logoutUser();

    // Fechar modal de perfil
    const profileModal = document.querySelector('.modal-overlay');
    if (profileModal) {
        profileModal.remove();
        document.body.style.overflow = '';
    }

    // Recarregar página
    location.reload();
}

// ============= VERIFICAR LOGIN AO CARREGAR =============
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
});

// Verificar quando página volta a ficar visível
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateAuthButtons();
    }
});

// ============= DEV LOGIN (BYPASS) =============
const devLoginBtn = document.querySelector('.btn-dev-login');
if (devLoginBtn) {
    devLoginBtn.addEventListener('click', async () => {
        // Criar usuário dev se não existir
        const users = JSON.parse(localStorage.getItem('ramppy_users') || '[]');
        if (!users.find(u => u.email === 'dev@ramppy.com')) {
            await signupUser('Developer', 'dev@ramppy.com', 'dev123', 'Ramppy');
        } else {
            await loginUser('dev@ramppy.com', 'dev123');
        }

        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        updateAuthButtons();
    });
}
