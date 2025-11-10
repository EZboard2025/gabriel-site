-- =============================================
-- CORREÇÃO DA TABELA FILA_ESPERA
-- Ajusta constraints para corresponder aos valores do formulário
-- =============================================

-- Remover tabela existente e recriar com valores corretos
DROP TABLE IF EXISTS public.fila_espera CASCADE;

CREATE TABLE public.fila_espera (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 100),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    telefone TEXT CHECK (telefone IS NULL OR telefone = '' OR telefone ~* '^[\d\s\(\)\+\-]{10,20}$'),
    empresa TEXT NOT NULL CHECK (length(empresa) >= 2 AND length(empresa) <= 200),
    cargo TEXT NOT NULL CHECK (length(cargo) >= 2 AND length(cargo) <= 100),

    -- Valores corrigidos para corresponder ao formulário
    tipo_empresa TEXT CHECK (tipo_empresa IN ('B2B', 'B2C', 'B2B2C')),
    tamanho_equipe_vendas TEXT CHECK (tamanho_equipe_vendas IN (
        '1-5', '6-15', '16-50', '51+'
    )),
    faturamento_anual TEXT,
    modelo_vendas TEXT CHECK (modelo_vendas IN (
        'Inside Sales', 'Field Sales', 'Híbrido', 'E-commerce'
    )),
    ciclo_vendas TEXT,
    usa_crm TEXT,
    sobre_empresa TEXT CHECK (sobre_empresa IS NULL OR length(sobre_empresa) <= 1000),

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
USING (false); -- Desabilitado por padrão (apenas backend pode ler)

-- =============================================
-- Verificar criação
-- =============================================
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'fila_espera'
ORDER BY ordinal_position;
