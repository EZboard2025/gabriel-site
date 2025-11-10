-- =============================================
-- CORREÇÃO DA TABELA FILA_ESPERA - VERSÃO 2
-- Execute linha por linha ou em blocos
-- =============================================

-- PASSO 1: Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Inserção pública na fila de espera" ON public.fila_espera;
DROP POLICY IF EXISTS "Apenas admins podem ver fila de espera" ON public.fila_espera;

-- PASSO 2: Remover tabela existente
DROP TABLE IF EXISTS public.fila_espera CASCADE;

-- PASSO 3: Criar nova tabela com constraints corretos
CREATE TABLE public.fila_espera (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    empresa TEXT NOT NULL,
    cargo TEXT NOT NULL,
    tipo_empresa TEXT,
    tamanho_equipe_vendas TEXT,
    faturamento_anual TEXT,
    modelo_vendas TEXT,
    ciclo_vendas TEXT,
    usa_crm TEXT,
    sobre_empresa TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: Adicionar constraint para email único
ALTER TABLE public.fila_espera ADD CONSTRAINT unique_email_fila UNIQUE (email);

-- PASSO 5: Criar índices
CREATE INDEX idx_fila_espera_email ON public.fila_espera(email);
CREATE INDEX idx_fila_espera_created ON public.fila_espera(created_at);

-- PASSO 6: Habilitar RLS
ALTER TABLE public.fila_espera ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Criar política de inserção pública
CREATE POLICY "public_insert_waitlist"
ON public.fila_espera
FOR INSERT
TO public
WITH CHECK (true);

-- PASSO 8: Criar política de leitura (ninguém pode ler por enquanto)
CREATE POLICY "no_select_waitlist"
ON public.fila_espera
FOR SELECT
TO public
USING (false);

-- PASSO 9: Verificar se foi criado corretamente
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'fila_espera';
