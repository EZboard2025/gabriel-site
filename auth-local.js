// Sistema de autenticação local (temporário para MVP)
// Salva usuários no localStorage até configurar backend real

const AUTH_LOCAL = {
    users: JSON.parse(localStorage.getItem('ramppy_users') || '[]'),
    currentUser: JSON.parse(localStorage.getItem('ramppy_current_user') || 'null'),

    // Salvar usuários no localStorage
    saveUsers() {
        localStorage.setItem('ramppy_users', JSON.stringify(this.users));
    },

    // Salvar usuário atual
    saveCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('ramppy_current_user', JSON.stringify(user));
    },

    // Registrar novo usuário
    async register(email, password, fullName) {
        try {
            // Validações
            if (!email || !password || !fullName) {
                throw new Error('Preencha todos os campos');
            }

            if (password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Verifica se usuário já existe
            const userExists = this.users.find(u => u.email === email);
            if (userExists) {
                throw new Error('Este email já está cadastrado');
            }

            // Criar novo usuário
            const newUser = {
                id: Date.now().toString(),
                email: email,
                fullName: fullName,
                createdAt: new Date().toISOString(),
                password: btoa(password) // Base64 simples (não usar em produção!)
            };

            this.users.push(newUser);
            this.saveUsers();

            // Fazer login automático
            const userWithoutPassword = { ...newUser };
            delete userWithoutPassword.password;
            this.saveCurrentUser(userWithoutPassword);

            return { success: true, user: userWithoutPassword };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Fazer login
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Preencha todos os campos');
            }

            const user = this.users.find(u => u.email === email);

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (user.password !== btoa(password)) {
                throw new Error('Senha incorreta');
            }

            // Login bem-sucedido
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            this.saveCurrentUser(userWithoutPassword);

            return { success: true, user: userWithoutPassword };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Fazer logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('ramppy_current_user');
        return { success: true };
    },

    // Verificar se está logado
    isLoggedIn() {
        return this.currentUser !== null;
    },

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }
};

// Exportar para uso global
window.AUTH_LOCAL = AUTH_LOCAL;
