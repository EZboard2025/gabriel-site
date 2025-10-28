-- ============================================
-- POLÍTICAS DE SEGURANÇA SUPABASE - NÍVEL GOOGLE
-- ============================================

-- IMPORTANTE: Execute este SQL no Supabase SQL Editor

-- =============================================
-- 1. TABELA DE USUÁRIOS COM SEGURANÇA MÁXIMA
-- =============================================

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS public.users CASCADE;

-- Criar tabela de usuários com campos de segurança
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    nome TEXT NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 100),
    empresa TEXT CHECK (length(empresa) <= 200),
    password_hash TEXT NOT NULL,

    -- Campos de segurança
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT DEFAULT gen_random_uuid()::text,
    reset_token TEXT,
    reset_expires TIMESTAMPTZ,

    -- Controle de login
    last_login TIMESTAMPTZ,
    login_attempts INT DEFAULT 0 CHECK (login_attempts >= 0 AND login_attempts <= 10),
    locked_until TIMESTAMPTZ,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 2FA (futuro)
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN DEFAULT false,

    -- Dados do perfil
    profile_photo TEXT CHECK (length(profile_photo) <= 1000000), -- Limite 1MB em base64
    bio TEXT CHECK (length(bio) <= 500),

    -- Índices para performance
    CONSTRAINT email_lowercase CHECK (email = lower(email))
);

-- Índices para queries rápidas
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_verification_token ON public.users(verification_token);
CREATE INDEX idx_users_reset_token ON public.users(reset_token);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 2. RLS (Row Level Security) PARA USERS
-- =============================================

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Ninguém pode ler dados de outros usuários
CREATE POLICY "Usuários podem ver apenas seus próprios dados"
ON public.users
FOR SELECT
USING (auth.uid()::text = id::text);

-- Política: Registro público permitido (mas com validações no cliente)
CREATE POLICY "Registro público permitido"
ON public.users
FOR INSERT
WITH CHECK (
    -- Email deve ser único (já garantido por constraint)
    -- Campos obrigatórios devem estar presentes
    email IS NOT NULL AND
    nome IS NOT NULL AND
    password_hash IS NOT NULL AND
    -- Prevenir injeção de campos administrativos
    email_verified = false AND
    login_attempts = 0 AND
    locked_until IS NULL
);

-- Política: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON public.users
FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (
    -- Não podem alterar campos críticos
    id = OLD.id AND
    email = OLD.email AND
    created_at = OLD.created_at
);

-- Política: Ninguém pode deletar usuários (soft delete apenas)
-- Não criar política de DELETE = negar todos os deletes

-- =============================================
-- 3. TABELA DE SESSÕES SEGURAS
-- =============================================

DROP TABLE IF EXISTS public.sessions CASCADE;

CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    ip_address INET,
    user_agent TEXT,
    fingerprint TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT session_not_expired CHECK (expires_at > NOW())
);

CREATE INDEX idx_sessions_token ON public.sessions(token);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_expires ON public.sessions(expires_at);

-- RLS para sessões
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias sessões"
ON public.sessions
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Sistema pode criar sessões"
ON public.sessions
FOR INSERT
WITH CHECK (true); -- Validações no backend

-- =============================================
-- 4. TABELA DE LOGS DE SEGURANÇA
-- =============================================

DROP TABLE IF EXISTS public.security_logs CASCADE;

CREATE TABLE public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 'login_failed', 'logout',
        'password_reset_requested', 'password_reset_completed',
        'account_locked', 'account_unlocked',
        'suspicious_activity', 'rate_limit_exceeded',
        'verification_completed', 'profile_updated'
    )),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_logs_user ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_event ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_created ON public.security_logs(created_at);

-- RLS para logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler logs
CREATE POLICY "Apenas admins podem ver logs"
ON public.security_logs
FOR SELECT
USING (false); -- Ninguém por enquanto

-- Sistema pode inserir logs
CREATE POLICY "Sistema pode inserir logs"
ON public.security_logs
FOR INSERT
WITH CHECK (true);

-- =============================================
-- 5. ATUALIZAR TABELA DE FILA DE ESPERA
-- =============================================

DROP TABLE IF EXISTS public.fila_espera CASCADE;

CREATE TABLE public.fila_espera (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 100),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    telefone TEXT CHECK (telefone ~* '^[\d\s\(\)\+\-]{10,20}$'),
    empresa TEXT NOT NULL CHECK (length(empresa) >= 2 AND length(empresa) <= 200),
    cargo TEXT NOT NULL CHECK (length(cargo) >= 2 AND length(cargo) <= 100),
    tipo_empresa TEXT CHECK (tipo_empresa IN ('B2B', 'B2C', 'B2B2C', 'Outro')),
    tamanho_equipe_vendas TEXT CHECK (tamanho_equipe_vendas IN (
        '1-5', '6-10', '11-20', '21-50', '51-100', '100+'
    )),
    faturamento_anual TEXT,
    modelo_vendas TEXT CHECK (modelo_vendas IN (
        'Inbound', 'Outbound', 'Híbrido', 'PLG', 'Channel'
    )),
    ciclo_vendas TEXT,
    usa_crm TEXT,
    sobre_empresa TEXT CHECK (length(sobre_empresa) <= 1000),

    -- Controle de spam
    ip_address INET,
    user_agent TEXT,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevenir duplicatas
    CONSTRAINT unique_email_fila UNIQUE (email)
);

CREATE INDEX idx_fila_espera_email ON public.fila_espera(email);
CREATE INDEX idx_fila_espera_created ON public.fila_espera(created_at);

-- RLS para fila de espera
ALTER TABLE public.fila_espera ENABLE ROW LEVEL SECURITY;

-- Política: Inserção pública permitida (com rate limiting no cliente)
CREATE POLICY "Inserção pública na fila de espera"
ON public.fila_espera
FOR INSERT
WITH CHECK (
    -- Validações básicas
    email IS NOT NULL AND
    nome IS NOT NULL AND
    empresa IS NOT NULL AND
    cargo IS NOT NULL
);

-- Apenas admins podem ler a fila
CREATE POLICY "Apenas admins podem ver fila de espera"
ON public.fila_espera
FOR SELECT
USING (false); -- Desabilitado por padrão

-- =============================================
-- 6. ATUALIZAR TABELA DE CONTATOS
-- =============================================

DROP TABLE IF EXISTS public.contatos CASCADE;

CREATE TABLE public.contatos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 100),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    mensagem TEXT NOT NULL CHECK (length(mensagem) >= 10 AND length(mensagem) <= 5000),

    -- Status
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'lido', 'respondido', 'arquivado')),

    -- Controle de spam
    ip_address INET,
    user_agent TEXT,
    spam_score FLOAT DEFAULT 0,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_contatos_email ON public.contatos(email);
CREATE INDEX idx_contatos_status ON public.contatos(status);
CREATE INDEX idx_contatos_created ON public.contatos(created_at);

-- RLS para contatos
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

-- Inserção pública permitida
CREATE POLICY "Inserção pública de contatos"
ON public.contatos
FOR INSERT
WITH CHECK (
    nome IS NOT NULL AND
    email IS NOT NULL AND
    mensagem IS NOT NULL AND
    status = 'novo'
);

-- Apenas admins podem ler
CREATE POLICY "Apenas admins podem ver contatos"
ON public.contatos
FOR SELECT
USING (false); -- Desabilitado por padrão

-- =============================================
-- 7. FUNÇÃO DE RATE LIMITING
-- =============================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INT DEFAULT 5,
    p_window_minutes INT DEFAULT 5
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    -- Contar tentativas recentes
    SELECT COUNT(*)
    INTO v_count
    FROM public.security_logs
    WHERE (details->>'identifier')::TEXT = p_identifier
    AND event_type = p_action
    AND created_at > (NOW() - (p_window_minutes || ' minutes')::INTERVAL);

    -- Verificar limite
    IF v_count >= p_max_attempts THEN
        -- Logar excesso de tentativas
        INSERT INTO public.security_logs (event_type, details)
        VALUES ('rate_limit_exceeded', jsonb_build_object(
            'identifier', p_identifier,
            'action', p_action,
            'attempts', v_count
        ));

        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. FUNÇÃO DE VALIDAÇÃO DE SENHA FORTE
-- =============================================

CREATE OR REPLACE FUNCTION validate_password_strength(p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Mínimo 8 caracteres
    IF length(p_password) < 8 THEN
        RETURN FALSE;
    END IF;

    -- Deve conter maiúscula
    IF p_password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;

    -- Deve conter minúscula
    IF p_password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;

    -- Deve conter número
    IF p_password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;

    -- Deve conter caractere especial
    IF p_password !~ '[^A-Za-z0-9]' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. LIMPEZA AUTOMÁTICA
-- =============================================

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.security_logs
    WHERE created_at < (NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- IMPORTANTE: PRÓXIMOS PASSOS
-- =============================================

-- 1. REGENERAR CHAVES DO SUPABASE:
--    Vá em Settings > API e regenere as chaves anon e service_role

-- 2. CONFIGURAR VARIÁVEIS DE AMBIENTE:
--    Nunca exponha chaves no código cliente

-- 3. IMPLEMENTAR BACKEND SEGURO:
--    Use Edge Functions do Supabase para validações server-side

-- 4. CONFIGURAR SMTP:
--    Para envio real de emails de verificação e reset

-- 5. HABILITAR AUDITORIA:
--    Vá em Settings > Database e habilite pgAudit

-- 6. BACKUP AUTOMÁTICO:
--    Configure backups diários em Settings > Backups

-- 7. MONITORAMENTO:
--    Configure alertas em Settings > Monitoring

-- =============================================
-- FIM DAS POLÍTICAS DE SEGURANÇA
-- =============================================