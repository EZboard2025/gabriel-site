// ============================================
// AUTENTICAÇÃO SEGURA COM SUPABASE - RAMPPY
// ============================================

// Configuração do Supabase (substitua com suas credenciais)
const SUPABASE_URL = 'https://pisvpbscqgoyhnnartwj.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Adicione sua chave anon

// Inicializar Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO SEGURAS
// ============================================

/**
 * Cadastrar novo usuário usando função RPC segura
 */
async function signupUserSecure(nome, email, senha, empresa) {
    try {
        // Validações do lado cliente
        if (!validateEmail(email)) {
            throw new Error('Email inválido');
        }

        if (!validatePassword(senha)) {
            throw new Error('Senha deve ter no mínimo 8 caracteres, incluindo letras e números');
        }

        if (!nome || nome.length < 2) {
            throw new Error('Nome deve ter no mínimo 2 caracteres');
        }

        // Chamar função RPC segura no Supabase
        const { data, error } = await supabaseClient
            .rpc('signup_user', {
                p_email: email,
                p_password: senha,
                p_nome: nome,
                p_empresa: empresa || ''
            });

        if (error) throw error;

        // Fazer login automaticamente após cadastro
        return await loginUserSecure(email, senha);

    } catch (error) {
        console.error('Erro no cadastro:', error);
        throw error;
    }
}

/**
 * Login de usuário usando função RPC segura
 */
async function loginUserSecure(email, senha) {
    try {
        // Validações básicas
        if (!email || !senha) {
            throw new Error('Email e senha são obrigatórios');
        }

        // Chamar função RPC segura no Supabase
        const { data, error } = await supabaseClient
            .rpc('login_user', {
                p_email: email,
                p_password: senha
            });

        if (error) throw error;

        // Armazenar dados do usuário de forma segura
        sessionStorage.setItem('user', JSON.stringify({
            id: data.id,
            email: data.email,
            nome: data.nome,
            empresa: data.empresa
        }));

        // Criar sessão no Supabase Auth (opcional mas recomendado)
        const { data: session, error: sessionError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (sessionError) {
            console.warn('Erro ao criar sessão:', sessionError);
        }

        return data;

    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

/**
 * Logout seguro
 */
async function logoutUserSecure() {
    try {
        // Limpar sessão do Supabase
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.warn('Erro ao fazer logout:', error);

        // Limpar dados locais
        sessionStorage.clear();
        localStorage.removeItem('user');

        // Redirecionar para página de login
        window.location.href = '/index.html';

    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

/**
 * Verificar se usuário está autenticado
 */
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session !== null;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

/**
 * Obter usuário atual
 */
async function getCurrentUser() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

// ============================================
// VALIDAÇÕES DE SEGURANÇA
// ============================================

/**
 * Validar email com regex robusto
 */
function validateEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!re.test(email)) return false;
    if (email.length > 254) return false;

    // Bloquear domínios de email temporário
    const blockedDomains = [
        'tempmail.com', 'guerrillamail.com', '10minutemail.com',
        'mailinator.com', 'throwaway.email', 'yopmail.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
        console.warn('Email temporário detectado:', domain);
        return false;
    }

    return true;
}

/**
 * Validar força da senha
 */
function validatePassword(password) {
    // Mínimo 8 caracteres
    if (password.length < 8) return false;

    // Deve conter pelo menos uma letra
    if (!/[a-zA-Z]/.test(password)) return false;

    // Deve conter pelo menos um número
    if (!/\d/.test(password)) return false;

    // Verificar senhas comuns
    const commonPasswords = [
        '12345678', 'password', 'qwerty', '123456789',
        'password123', 'admin123', '11111111'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
        return false;
    }

    return true;
}

/**
 * Calcular força da senha
 */
function getPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const strengthLevels = ['Muito Fraca', 'Fraca', 'Regular', 'Boa', 'Forte', 'Muito Forte'];
    return {
        score: strength,
        level: strengthLevels[Math.min(strength, 5)]
    };
}

// ============================================
// PROTEÇÃO CONTRA ATAQUES
// ============================================

/**
 * Rate limiting para prevenir força bruta
 */
const rateLimiter = {
    attempts: new Map(),
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos

    check(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];

        // Limpar tentativas antigas
        const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            const oldestAttempt = recentAttempts[0];
            const timeRemaining = Math.ceil((this.windowMs - (now - oldestAttempt)) / 60000);
            throw new Error(`Muitas tentativas. Tente novamente em ${timeRemaining} minutos.`);
        }

        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);
        return true;
    },

    reset(identifier) {
        this.attempts.delete(identifier);
    }
};

// ============================================
// LISTENERS DE SEGURANÇA
// ============================================

// Detectar tentativas de XSS
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('script')) {
        console.error('Possível tentativa de XSS detectada:', e.message);
        // Registrar incidente
        logSecurityIncident('XSS_ATTEMPT', { message: e.message });
    }
});

// Função para registrar incidentes de segurança
async function logSecurityIncident(type, details) {
    try {
        await supabaseClient
            .from('security_logs')
            .insert({
                type: type,
                details: details,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
    } catch (error) {
        console.error('Erro ao registrar incidente:', error);
    }
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

window.authSecure = {
    signup: signupUserSecure,
    login: loginUserSecure,
    logout: logoutUserSecure,
    checkAuth: checkAuthStatus,
    getCurrentUser: getCurrentUser,
    validateEmail: validateEmail,
    validatePassword: validatePassword,
    getPasswordStrength: getPasswordStrength
};

console.log('Sistema de autenticação seguro carregado ✅');