# Como usar a tabela memory no n8n

## 1. Criar a tabela no PostgreSQL

Execute o SQL:
```sql
CREATE TABLE IF NOT EXISTS memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_session_id ON memory(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory(created_at DESC);
```

## 2. No n8n - Salvar memória

SQL no PostgreSQL Node:
```sql
INSERT INTO memory (session_id, message)
VALUES ('{{$json.sessionId}}', '{{$json.message}}');
```

## 3. No n8n - Buscar memórias

SQL no PostgreSQL Node:
```sql
SELECT * FROM memory
WHERE session_id = '{{$json.sessionId}}'
ORDER BY created_at DESC
LIMIT 10;
```

## 4. Exemplo de estrutura JSON para message
```json
{
  "role": "user",
  "content": "texto da mensagem",
  "metadata": {
    "timestamp": "2024-01-01T10:00:00Z",
    "type": "chat"
  }
}
```