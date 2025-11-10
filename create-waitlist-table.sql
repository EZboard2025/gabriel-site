DROP POLICY IF EXISTS "Inserção pública na fila de espera" ON public.fila_espera;
DROP POLICY IF EXISTS "Apenas admins podem ver fila de espera" ON public.fila_espera;
DROP POLICY IF EXISTS "public_insert_waitlist" ON public.fila_espera;
DROP POLICY IF EXISTS "no_select_waitlist" ON public.fila_espera;

DROP TABLE IF EXISTS public.fila_espera CASCADE;

CREATE TABLE public.fila_espera (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
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

CREATE INDEX idx_fila_espera_email ON public.fila_espera(email);
CREATE INDEX idx_fila_espera_created ON public.fila_espera(created_at);

ALTER TABLE public.fila_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_waitlist" ON public.fila_espera FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "no_select_waitlist" ON public.fila_espera FOR SELECT TO public USING (false);
