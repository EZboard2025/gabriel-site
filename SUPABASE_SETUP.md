# Configuração do Supabase para Ramppy

## Passo 1: Criar Conta e Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub, Google, etc)
4. Crie um novo projeto:
   - Nome: Ramppy
   - Database Password: Crie uma senha forte
   - Region: Escolha a mais próxima (ex: South America (São Paulo))

## Passo 2: Criar Tabela de Usuários

No painel do Supabase:

1. Vá em "SQL Editor" no menu lateral
2. Cole e execute o seguinte SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX idx_users_email ON users(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler apenas seus próprios dados
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Política: Qualquer um pode se cadastrar
CREATE POLICY "Anyone can insert"
ON users FOR INSERT
WITH CHECK (true);
```

## Passo 3: Obter Credenciais

1. No menu lateral, vá em "Project Settings" (ícone de engrenagem)
2. Clique em "API"
3. Copie:
   - **Project URL** (algo como: https://xxxxx.supabase.co)
   - **anon public** key (chave longa começando com "eyJ...")

## Passo 4: Configurar no Projeto

Abra o arquivo `supabase-config.js` e substitua:

```javascript
const SUPABASE_URL = 'COLE_SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'COLE_SUA_CHAVE_AQUI';
```

## Passo 5: Testar

1. Abra o site
2. Tente criar uma conta
3. Faça login com as credenciais criadas
4. Verifique no Supabase > Table Editor > users se o usuário foi criado

## Recursos Adicionais

- Documentação: https://supabase.com/docs
- Guia de Auth: https://supabase.com/docs/guides/auth
- API Reference: https://supabase.com/docs/reference/javascript

## Segurança

⚠️ **IMPORTANTE:**
- NUNCA commite as credenciais no Git
- A chave `anon` é pública (segura para frontend)
- Para produção, configure políticas de RLS adequadas
- Habilite autenticação por email no Supabase
