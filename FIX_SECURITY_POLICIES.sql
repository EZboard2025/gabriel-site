-- ========================================
-- CORREÇÃO DE SEGURANÇA CRÍTICA - RAMPPY
-- ========================================
-- Execute este SQL no Supabase imediatamente!

-- 1. REMOVER POLÍTICA PERIGOSA DA TABELA USERS
DROP POLICY IF EXISTS "allow_all" ON public.users;

-- 2. CRIAR POLÍTICAS SEGURAS PARA USERS
-- Usuários só podem ver seus próprios dados
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Permitir inserção apenas durante signup (através de função RPC)
CREATE POLICY "users_insert_signup" ON public.users
    FOR INSERT
    WITH CHECK (false); -- Desabilita insert direto, use função RPC

-- 3. CORRIGIR POLÍTICAS DA TABELA CONTATOS
DROP POLICY IF EXISTS "Admins podem ler contatos" ON public.contatos;

-- Apenas admins podem ler contatos (adicione lógica de admin)
CREATE POLICY "admin_read_contatos" ON public.contatos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND email IN ('admin@ramppy.com', 'suporte@ramppy.com')
        )
    );

-- 4. CORRIGIR POLÍTICAS DA TABELA FILA_ESPERA
DROP POLICY IF EXISTS "no_select_waitlist" ON public.fila_espera;

-- Apenas admins podem ler fila de espera
CREATE POLICY "admin_read_fila_espera" ON public.fila_espera
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND email IN ('admin@ramppy.com', 'suporte@ramppy.com')
        )
    );

-- 5. ADICIONAR POLÍTICA PARA TABELA RAMPPY
-- Assumindo que é uma tabela de configurações
CREATE POLICY "ramppy_read_authenticated" ON public.ramppy
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ========================================
-- FUNÇÃO SEGURA PARA SIGNUP COM BCRYPT
-- ========================================
CREATE OR REPLACE FUNCTION public.signup_user(
    p_email TEXT,
    p_password TEXT,
    p_nome TEXT,
    p_empresa TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user json;
BEGIN
    -- Validar email
    IF NOT p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Email inválido';
    END IF;

    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'Email já cadastrado';
    END IF;

    -- Criar usuário no auth.users do Supabase
    v_user_id := gen_random_uuid();

    -- Inserir na tabela users com senha hasheada
    INSERT INTO public.users (id, email, password_hash, nome, empresa)
    VALUES (
        v_user_id,
        p_email,
        crypt(p_password, gen_salt('bf')), -- Bcrypt hash
        p_nome,
        p_empresa
    )
    RETURNING json_build_object(
        'id', id,
        'email', email,
        'nome', nome,
        'empresa', empresa
    ) INTO v_user;

    RETURN v_user;
END;
$$;

-- ========================================
-- FUNÇÃO SEGURA PARA LOGIN
-- ========================================
CREATE OR REPLACE FUNCTION public.login_user(
    p_email TEXT,
    p_password TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user json;
    v_password_hash TEXT;
BEGIN
    -- Buscar usuário e verificar senha
    SELECT
        password_hash,
        json_build_object(
            'id', id,
            'email', email,
            'nome', nome,
            'empresa', empresa
        )
    INTO v_password_hash, v_user
    FROM public.users
    WHERE email = p_email;

    IF v_user IS NULL THEN
        RAISE EXCEPTION 'Email ou senha inválidos';
    END IF;

    -- Verificar senha com bcrypt
    IF NOT (v_password_hash = crypt(p_password, v_password_hash)) THEN
        RAISE EXCEPTION 'Email ou senha inválidos';
    END IF;

    RETURN v_user;
END;
$$;

-- ========================================
-- ADICIONAR ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- ========================================
-- HABILITAR EXTENSÃO PARA CRIPTOGRAFIA
-- ========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================
-- ADICIONAR CAMPO is_admin NA TABELA USERS
-- ========================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Definir admins iniciais
UPDATE public.users
SET is_admin = true
WHERE email IN ('admin@ramppy.com', 'suporte@ramppy.com');

-- ========================================
-- POLÍTICAS REVISADAS COM CAMPO is_admin
-- ========================================
DROP POLICY IF EXISTS "admin_read_contatos" ON public.contatos;
CREATE POLICY "admin_read_contatos" ON public.contatos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "admin_read_fila_espera" ON public.fila_espera;
CREATE POLICY "admin_read_fila_espera" ON public.fila_espera
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- ========================================
-- IMPORTANTE: APÓS EXECUTAR ESTE SCRIPT
-- ========================================
-- 1. Teste todas as funcionalidades
-- 2. Verifique se as políticas estão funcionando
-- 3. Atualize o código JavaScript para usar as funções RPC
-- 4. Remova o hash simples do JavaScript
-- 5. Use SEMPRE HTTPS em produção