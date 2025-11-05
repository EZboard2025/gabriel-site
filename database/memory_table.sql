-- Tabela para armazenar mensagens do chat com contexto
-- Para uso com n8n e PostgreSQL Memory

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' ou 'assistant'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscar mensagens por session_id (performance)
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Índice composto para buscar mensagens de uma sessão ordenadas por data
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);

-- Comentários para documentação
COMMENT ON TABLE chat_messages IS 'Armazena histórico de mensagens do chat para contexto da conversa';
COMMENT ON COLUMN chat_messages.session_id IS 'ID único da sessão de roleplay';
COMMENT ON COLUMN chat_messages.role IS 'Quem enviou a mensagem: user ou assistant';
COMMENT ON COLUMN chat_messages.message IS 'Conteúdo da mensagem';
COMMENT ON COLUMN chat_messages.created_at IS 'Data e hora da mensagem';