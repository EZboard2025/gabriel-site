# 💬 Guia Rápido - Tabela de Mensagens do Chat

## 📋 1. Criar a tabela no PostgreSQL

Execute o arquivo `memory_table.sql`:

```bash
psql -U postgres -d seu_banco < database/memory_table.sql
```

Ou copie e cole no psql:
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);
```

---

## 🔧 2. Configurar no n8n

### Passo 1: Adicionar Credencial PostgreSQL
1. Vá em **Credentials** → **Add Credential** → **Postgres**
2. Preencha:
   - Host: `localhost` (ou seu servidor)
   - Database: `seu_banco`
   - User: `postgres`
   - Password: `sua_senha`
   - Port: `5432`

### Passo 2: Workflow para Chat com Memória

```
Webhook (POST)
  → Salvar mensagem do usuário
  → Buscar histórico
  → Enviar para IA (com contexto)
  → Salvar resposta da IA
  → Retornar resposta
```

---

## 📝 3. Queries no n8n PostgreSQL Node

### Salvar mensagem do USUÁRIO
```sql
INSERT INTO chat_messages (session_id, role, message)
VALUES ('{{$json.sessionId}}', 'user', '{{$json.chatInput}}');
```

### Salvar resposta do ASSISTENTE
```sql
INSERT INTO chat_messages (session_id, role, message)
VALUES ('{{$json.sessionId}}', 'assistant', '{{$json.response}}');
```

### Buscar histórico (últimas 10 mensagens)
```sql
SELECT role, message, created_at
FROM chat_messages
WHERE session_id = '{{$json.sessionId}}'
ORDER BY created_at ASC
LIMIT 10;
```

---

## 🤖 4. Exemplo de Function Node para Formatar Contexto

```javascript
// Pegar histórico do PostgreSQL
const history = $input.all();

// Formatar para OpenAI/Anthropic
const messages = history.map(item => ({
  role: item.json.role === 'user' ? 'user' : 'assistant',
  content: item.json.message
}));

// Adicionar nova mensagem do usuário
messages.push({
  role: 'user',
  content: $('Webhook').item.json.chatInput
});

return { messages };
```

---

## ✅ 5. Testar

1. Execute o SQL para criar a tabela
2. Configure o workflow no n8n
3. Teste enviando uma mensagem do frontend
4. Verifique no banco:
```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 6. Queries Úteis

### Ver todas as mensagens de uma sessão
```sql
SELECT role, message, created_at
FROM chat_messages
WHERE session_id = 'session_1234567890_abc123xyz'
ORDER BY created_at;
```

### Ver sessões ativas hoje
```sql
SELECT DISTINCT session_id, COUNT(*) as msg_count
FROM chat_messages
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY session_id;
```

### Limpar sessões antigas (+ de 30 dias)
```sql
DELETE FROM chat_messages
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 🎯 Pronto!

Agora seu chat tem memória e contexto! Cada sessão mantém o histórico de conversa. 🚀