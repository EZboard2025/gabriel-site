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
            // Rate limiting
            security.checkRateLimit('signup', email, 3, 300000); // 3 tentativas em 5 minutos

            // Validações rigorosas
            if (!security.validateInput(nome, 'name')) {
                throw new Error('Nome inválido. Use apenas letras e espaços.');
            }

            if (!security.validateEmail(email)) {
                throw new Error('Email inválido ou temporário não permitido.');
            }

            if (!security.validateInput(empresa, 'company')) {
                throw new Error('Nome da empresa inválido.');
            }

            // Validar força da senha
            if (senha.length < 8) {
                throw new Error('Senha deve ter pelo menos 8 caracteres.');
            }

            if (!/[A-Z]/.test(senha)) {
                throw new Error('Senha deve conter pelo menos uma letra maiúscula.');
            }

            if (!/[a-z]/.test(senha)) {
                throw new Error('Senha deve conter pelo menos uma letra minúscula.');
            }

            if (!/[0-9]/.test(senha)) {
                throw new Error('Senha deve conter pelo menos um número.');
            }

            if (!/[^A-Za-z0-9]/.test(senha)) {
                throw new Error('Senha deve conter pelo menos um caractere especial.');
            }

            // Hash seguro da senha
            const passwordHash = await security.hashPassword(senha);

            // Sanitizar dados
            const sanitizedData = {
                nome: security.sanitizeHTML(nome),
                email: email.toLowerCase().trim(),
                password_hash: passwordHash,
                empresa: security.sanitizeHTML(empresa),
                created_at: new Date().toISOString(),
                email_verified: false,
                verification_token: security.generateSecureToken(),
                last_login: null,
                login_attempts: 0,
                locked_until: null
            };

            // Verificar se email já existe (sem revelar informação)
            const { data: existingUser, error: checkError } = await supabaseRef
                .from('users')
                .select('id')
                .eq('email', sanitizedData.email)
                .maybeSingle();

            if (existingUser) {
                // Mensagem genérica para não revelar que email existe
                throw new Error('Erro ao criar conta. Verifique os dados e tente novamente.');
            }

            // Inserir usuário
            const { data, error } = await supabaseRef
                .from('users')
                .insert([sanitizedData])
                .select()
                .single();

            if (error) {
                console.error('Erro Supabase:', error);
                throw new Error('Erro ao criar conta. Tente novamente mais tarde.');
            }

            // Enviar email de verificação (simulado por enquanto)
            console.log('Token de verificação:', sanitizedData.verification_token);

            return {
                success: true,
                message: 'Conta criada! Verifique seu email para ativar sua conta.'
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
            // Rate limiting
            security.checkRateLimit('login', email, 5, 300000); // 5 tentativas em 5 minutos

            // Validação básica
            if (!email || !senha) {
                throw new Error('Email e senha são obrigatórios.');
            }

            email = email.toLowerCase().trim();

            // Buscar usuário
            const { data: user, error } = await supabaseRef
                .from('users')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            // Mensagem genérica para não revelar se usuário existe
            const genericError = 'Email ou senha incorretos.';

            if (error || !user) {
                // Delay artificial para prevenir timing attacks
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
                throw new Error(genericError);
            }

            // Verificar se conta está bloqueada
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
                const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
                throw new Error(`Conta bloqueada. Tente novamente em ${minutesLeft} minutos.`);
            }

            // Verificar senha
            const isValidPassword = await security.verifyPassword(senha, user.password_hash);

            if (!isValidPassword) {
                // Incrementar tentativas de login
                const newAttempts = (user.login_attempts || 0) + 1;
                let updateData = { login_attempts: newAttempts };

                // Bloquear após 5 tentativas
                if (newAttempts >= 5) {
                    const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
                    updateData.locked_until = lockUntil.toISOString();
                    updateData.login_attempts = 0;
                }

                await supabaseRef
                    .from('users')
                    .update(updateData)
                    .eq('id', user.id);

                // Delay artificial
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
                throw new Error(genericError);
            }

            // Verificar se email foi verificado
            if (!user.email_verified) {
                throw new Error('Por favor, verifique seu email antes de fazer login.');
            }

            // Login bem-sucedido - resetar tentativas e atualizar último login
            await supabaseRef
                .from('users')
                .update({
                    login_attempts: 0,
                    locked_until: null,
                    last_login: new Date().toISOString()
                })
                .eq('id', user.id);

            // Criar sessão segura
            const session = security.createSecureSession({
                id: user.id,
                nome: user.nome,
                email: user.email,
                empresa: user.empresa
            });

            return {
                success: true,
                user: {
                    nome: user.nome,
                    email: user.email,
                    empresa: user.empresa
                }
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