-- Tabela simples para memória do agente n8n
-- Baseada na estrutura solicitada

CREATE TABLE IF NOT EXISTS memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhorar performance de busca por session_id
CREATE INDEX IF NOT EXISTS idx_memory_session_id ON memory(session_id);

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory(created_at DESC);