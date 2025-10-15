// Autenticação com Supabase
// IMPORTANTE: Execute o SQL em setup-database.sql no Supabase antes de usar!

// Função auxiliar para hash de senha (simplificada)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Cadastrar usuário
async function signupUser(nome, email, senha, empresa) {
    try {
        if (!supabase) {
            throw new Error('Supabase não está configurado');
        }

        // Verificar se email já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        // Criar hash da senha
        const passwordHash = simpleHash(senha);

        // Inserir novo usuário
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    nome,
                    email,
                    password_hash: passwordHash,
                    empresa
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Criar sessão local
        const userSession = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            empresa: data.empresa,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('ramppy_session', JSON.stringify(userSession));

        return { success: true, user: userSession };
    } catch (error) {
        console.error('Erro no signup:', error);
        return { success: false, error: error.message };
    }
}

// Fazer login
async function loginUser(email, senha) {
    try {
        if (!supabase) {
            throw new Error('Supabase não está configurado');
        }

        // Buscar usuário no banco
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar senha
        const passwordHash = simpleHash(senha);
        if (user.password_hash !== passwordHash) {
            throw new Error('Senha incorreta');
        }

        // Criar sessão
        const userSession = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            empresa: user.empresa,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('ramppy_session', JSON.stringify(userSession));

        return { success: true, user: userSession };
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, error: error.message };
    }
}

// Fazer logout
function logoutUser() {
    localStorage.removeItem('ramppy_session');
    return { success: true };
}

// Pegar usuário logado
function getCurrentUser() {
    const session = localStorage.getItem('ramppy_session');
    if (!session) return null;

    try {
        const user = JSON.parse(session);
        return user.isLoggedIn ? user : null;
    } catch {
        return null;
    }
}

// Verificar se está logado
function isLoggedIn() {
    return getCurrentUser() !== null;
}
