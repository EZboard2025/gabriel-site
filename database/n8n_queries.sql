-- =============================================
-- QUERIES PARA USAR NO N8N
-- =============================================

-- 1. SALVAR MENSAGEM DO USUÁRIO
-- Use no PostgreSQL Node após receber mensagem do usuário
INSERT INTO chat_messages (session_id, role, message)
VALUES ('{{$json.sessionId}}', 'user', '{{$json.chatInput}}');


-- 2. SALVAR RESPOSTA DO ASSISTENTE
-- Use no PostgreSQL Node após gerar resposta da IA
INSERT INTO chat_messages (session_id, role, message)
VALUES ('{{$json.sessionId}}', 'assistant', '{{$json.response}}');


-- 3. BUSCAR HISTÓRICO DE CONVERSA (últimas 10 mensagens)
-- Use no PostgreSQL Node ANTES de enviar para a IA
-- Isso dá contexto para a conversa
SELECT role, message, created_at
FROM chat_messages
WHERE session_id = '{{$json.sessionId}}'
ORDER BY created_at ASC
LIMIT 10;


-- 4. BUSCAR HISTÓRICO COMPLETO DA SESSÃO
-- Para análise ou debug
SELECT role, message, created_at
FROM chat_messages
WHERE session_id = '{{$json.sessionId}}'
ORDER BY created_at ASC;


-- 5. CONTAR MENSAGENS DE UMA SESSÃO
-- Útil para saber quantas interações já aconteceram
SELECT COUNT(*) as total_messages
FROM chat_messages
WHERE session_id = '{{$json.sessionId}}';


-- 6. LIMPAR MENSAGENS ANTIGAS (mais de 30 dias)
-- Execute periodicamente para manutenção
DELETE FROM chat_messages
WHERE created_at < NOW() - INTERVAL '30 days';


-- 7. BUSCAR ÚLTIMAS N SESSÕES ATIVAS
-- Ver sessões recentes
SELECT DISTINCT session_id, MAX(created_at) as last_message
FROM chat_messages
GROUP BY session_id
ORDER BY last_message DESC
LIMIT 10;


-- =============================================
-- EXEMPLO DE WORKFLOW N8N
-- =============================================

/*
FLUXO RECOMENDADO:

1. Webhook Trigger (recebe chatInput e sessionId)
   ↓
2. PostgreSQL Node - Salvar mensagem do usuário
   Query: INSERT INTO chat_messages (session_id, role, message)
          VALUES ('{{$json.sessionId}}', 'user', '{{$json.chatInput}}')
   ↓
3. PostgreSQL Node - Buscar histórico da conversa
   Query: SELECT role, message FROM chat_messages
          WHERE session_id = '{{$json.sessionId}}'
          ORDER BY created_at ASC LIMIT 10
   ↓
4. Function Node - Formatar contexto para IA
   Transformar o histórico em formato de mensagens para GPT
   ↓
5. OpenAI/Anthropic Node - Processar com IA
   Incluir o contexto no prompt
   ↓
6. PostgreSQL Node - Salvar resposta do assistente
   Query: INSERT INTO chat_messages (session_id, role, message)
          VALUES ('{{$json.sessionId}}', 'assistant', '{{$json.response}}')
   ↓
7. Respond to Webhook - Retornar resposta
*/