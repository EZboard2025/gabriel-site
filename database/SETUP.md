# 🚀 Setup Rápido - Salvar Mensagens Automaticamente

## ✅ O que foi configurado:

1. **proxy-tts.js** agora tem endpoint `/save-message`
2. **simulacao.html** salva automaticamente:
   - Mensagens do usuário
   - Respostas da IA
3. Tudo é salvo na tabela `chat_messages`

---

## 📋 Passo a Passo

### 1️⃣ Criar a tabela no PostgreSQL

Execute no psql ou pgAdmin:

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

Ou execute o arquivo:
```bash
psql -U postgres -d seu_banco < database/memory_table.sql
```

---

### 2️⃣ Configurar credenciais do banco

Crie um arquivo `.env` na raiz do projeto:

```bash
# Copie o .env.example
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha
```

---

### 3️⃣ Reiniciar o proxy

Se o proxy já está rodando, reinicie:

```bash
# Ctrl+C para parar (se estiver rodando)
# Depois inicie novamente:
node proxy-tts.js
```

Você deve ver:
```
🎤 Proxy TTS rodando em http://localhost:3002
```

---

### 4️⃣ Testar

1. Acesse a simulação: `http://localhost:8000/simulacao.html`
2. Inicie um roleplay
3. Fale algo
4. Verifique no banco:

```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;
```

Você deve ver suas mensagens salvas! ✅

---

## 📊 Estrutura das mensagens salvas

```sql
id          | UUID único
session_id  | Ex: session_1234567890_abc123xyz
role        | 'user' ou 'assistant'
message     | Texto da mensagem
created_at  | Timestamp automático
```

---

## 🔍 Queries úteis

### Ver conversa completa de uma sessão
```sql
SELECT role, message, created_at
FROM chat_messages
WHERE session_id = 'sua_sessao_aqui'
ORDER BY created_at;
```

### Ver últimas 20 mensagens
```sql
SELECT session_id, role, message, created_at
FROM chat_messages
ORDER BY created_at DESC
LIMIT 20;
```

### Contar mensagens por sessão
```sql
SELECT session_id, COUNT(*) as total
FROM chat_messages
GROUP BY session_id
ORDER BY total DESC;
```

---

## 🎯 Fluxo de salvamento

```
Usuário fala
  ↓
Frontend salva no banco (role: user)
  ↓
Frontend envia para n8n
  ↓
n8n processa com IA
  ↓
Frontend recebe resposta
  ↓
Frontend salva no banco (role: assistant)
  ↓
Frontend toca áudio TTS
```

---

## ⚠️ Troubleshooting

### Erro: "relation chat_messages does not exist"
- Execute o SQL para criar a tabela

### Erro: "password authentication failed"
- Verifique as credenciais no `.env`
- Certifique-se que o PostgreSQL está rodando

### Mensagens não aparecem no banco
- Verifique o console do navegador (F12)
- Verifique os logs do proxy-tts.js
- Teste manualmente:
```bash
curl -X POST http://localhost:3002/save-message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","role":"user","message":"teste"}'
```

---

## ✅ Status

- [x] Tabela criada
- [x] proxy-tts.js configurado
- [x] Frontend integrado
- [x] Pacote pg instalado
- [ ] .env configurado (você precisa fazer)
- [ ] Testar salvamento

🎉 **Está quase pronto! Só falta configurar o `.env` com suas credenciais do PostgreSQL!**
