// ============================================
// RAMPPY SECURE AUTHENTICATION SYSTEM
// ============================================

(function() {
    'use strict';

    function initializeAuth() {
        // Aguardar security utils carregar
        if (!window.RamppySecurity) {
            console.error('Security utilities não carregadas!');
            return;
        }

        // Verificar Supabase
        const supabaseRef = window.supabaseClient || window.supabase || supabase;
        if (!supabaseRef) {
            console.error('Supabase ainda não disponível!');
            return;
        }

        const security = window.RamppySecurity;

    // ==========================================
    // REGISTRO SEGURO
    // ==========================================

    window.signupUser = async function(nome, email, senha, empresa) {
        try {
            // Validações básicas
            if (!nome || nome.trim().length < 2) {
                throw new Error('Nome deve ter pelo menos 2 caracteres.');
            }

            if (!email || !email.includes('@')) {
                throw new Error('Email inválido.');
            }

            if (!senha || senha.length < 6) {
                throw new Error('Senha deve ter pelo menos 6 caracteres.');
            }

            // Sanitizar dados
            const sanitizedData = {
                id: Date.now().toString(),
                nome: nome.trim(),
                email: email.toLowerCase().trim(),
                senha: btoa(senha), // Base64 simples (temporário)
                empresa: empresa ? empresa.trim() : '',
                created_at: new Date().toISOString()
            };

            // Verificar se email já existe
            const users = JSON.parse(localStorage.getItem('ramppy_users') || '[]');
            const existingUser = users.find(u => u.email === sanitizedData.email);

            if (existingUser) {
                throw new Error('Este email já está cadastrado.');
            }

            // Adicionar novo usuário
            users.push(sanitizedData);
            localStorage.setItem('ramppy_users', JSON.stringify(users));

            // Fazer login automático
            const userSession = {
                id: sanitizedData.id,
                nome: sanitizedData.nome,
                email: sanitizedData.email,
                empresa: sanitizedData.empresa
            };
            localStorage.setItem('ramppy_user', JSON.stringify(userSession));

            return {
                success: true,
                message: 'Conta criada com sucesso! Bem-vindo à Ramppy.'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };

    // ==========================================
    // LOGIN SEGURO
    // ==========================================

    window.loginUser = async function(email, senha) {
        try {
            // Validação básica
            if (!email || !senha) {
                throw new Error('Email e senha são obrigatórios.');
            }

            email = email.toLowerCase().trim();

            // Buscar usuário no localStorage
            const users = JSON.parse(localStorage.getItem('ramppy_users') || '[]');
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('Email ou senha incorretos.');
            }

            // Verificar senha
            if (user.senha !== btoa(senha)) {
                throw new Error('Email ou senha incorretos.');
            }

            // Login bem-sucedido
            const userSession = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                empresa: user.empresa
            };
            localStorage.setItem('ramppy_user', JSON.stringify(userSession));

            return {
                success: true,
                user: userSession
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };

    // ==========================================
    // LOGOUT SEGURO
    // ==========================================

    window.logoutUser = function() {
        security.clearSession();
        window.location.href = '/';
    };

    // ==========================================
    // VERIFICAR SESSÃO
    // ==========================================

    window.checkAuth = function() {
        return security.validateSession();
    };

    // ==========================================
    // OBTER USUÁRIO ATUAL
    // ==========================================

    window.getCurrentUser = function() {
        // Validar sessão primeiro
        if (!security.validateSession()) {
            return null;
        }

        // Obter dados do usuário de localStorage
        const userStr = localStorage.getItem('ramppy_user');
        if (!userStr) return null;

        try {
            const userData = JSON.parse(userStr);
            return {
                ...userData,
                isLoggedIn: true
            };
        } catch (e) {
            return null;
        }
    };

    // ==========================================
    // RECUPERAÇÃO DE SENHA SEGURA
    // ==========================================

    window.requestPasswordReset = async function(email) {
        try {
            // Rate limiting agressivo
            security.checkRateLimit('password-reset', email, 2, 3600000); // 2 em 1 hora

            if (!security.validateEmail(email)) {
                throw new Error('Email inválido.');
            }

            email = email.toLowerCase().trim();

            // Sempre retornar sucesso para não revelar se email existe
            const resetToken = security.generateSecureToken();
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

            // Verificar se usuário existe (internamente)
            const { data: user } = await supabaseRef
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (user) {
                // Salvar token de reset
                await supabaseRef
                    .from('users')
                    .update({
                        reset_token: resetToken,
                        reset_expires: expires.toISOString()
                    })
                    .eq('email', email);

                // Aqui enviaria email real
                console.log('Reset token:', resetToken);
            }

            // Sempre retornar mensagem de sucesso
            return {
                success: true,
                message: 'Se o email existir em nossa base, você receberá instruções de recuperação.'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };

    // ==========================================
    // AUTO-LOGOUT POR INATIVIDADE
    // ==========================================

    let activityTimer;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

    function resetActivityTimer() {
        clearTimeout(activityTimer);

        if (security.validateSession()) {
            activityTimer = setTimeout(() => {
                if (window.ramppyNotifications) {
                    window.ramppyNotifications.modal({
                        title: 'Sessão Expirada',
                        message: 'Sua sessão expirou por inatividade. Faça login novamente.',
                        type: 'warning'
                    });
                }
                logoutUser();
            }, INACTIVITY_TIMEOUT);
        }
    }

    // Monitorar atividade
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });

    // Iniciar timer
    resetActivityTimer();

    // ==========================================
    // PROTEÇÃO CONTRA CONSOLE
    // ==========================================

    // Detectar DevTools
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.log('%cATENÇÃO!', 'color: red; font-size: 30px; font-weight: bold;');
                console.log('%cEsta é uma área de desenvolvimento. Se alguém pediu para você copiar/colar algo aqui, é uma tentativa de ROUBO!', 'color: red; font-size: 16px;');
                console.log('%cNunca cole código que você não entende!', 'color: orange; font-size: 14px;');
            }
        } else {
            devtools.open = false;
        }
    }, 500);

    } // Fim da função initializeAuth

    // Tentar inicializar imediatamente
    if (window.supabaseClient || window.supabase || (typeof supabase !== 'undefined' && supabase)) {
        initializeAuth();
    } else {
        // Se Supabase não estiver pronto, aguardar
        console.log('Aguardando Supabase carregar...');
        let attempts = 0;
        const maxAttempts = 10;

        const checkSupabase = setInterval(function() {
            attempts++;
            if (window.supabaseClient || window.supabase || (typeof supabase !== 'undefined' && supabase)) {
                console.log('Supabase detectado! Inicializando auth...');
                clearInterval(checkSupabase);
                initializeAuth();
            } else if (attempts >= maxAttempts) {
                console.error('Timeout esperando Supabase carregar');
                clearInterval(checkSupabase);
            }
        }, 500);
    }

})();