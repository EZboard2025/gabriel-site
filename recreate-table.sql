-- RECRIAR TABELA USERS - Execute no SQL Editor do Supabase

-- 1. Deletar tabela antiga se existir
DROP TABLE IF EXISTS users CASCADE;

-- 2. Criar tabela nova
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índice
CREATE INDEX idx_users_email ON users(email);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Política: Permitir qualquer um cadastrar
CREATE POLICY "Permitir cadastro público"
ON users FOR INSERT
WITH CHECK (true);

-- 6. Política: Permitir qualquer um ler (para login)
CREATE POLICY "Permitir leitura pública"
ON users FOR SELECT
USING (true);

-- 7. Política: Permitir qualquer um atualizar
CREATE POLICY "Permitir atualização pública"
ON users FOR UPDATE
USING (true);

-- 8. Verificar se funcionou
SELECT * FROM users;
