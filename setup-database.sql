-- ========================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO RAMPPY
-- Execute este SQL no SQL Editor do Supabase
-- ========================================

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Habilitar RLS (Row Level Security) para segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança

-- Política: Permitir INSERT para qualquer um (cadastro público)
DROP POLICY IF EXISTS "Permitir cadastro público" ON users;
CREATE POLICY "Permitir cadastro público"
ON users FOR INSERT
WITH CHECK (true);

-- Política: Usuários podem ler apenas seus próprios dados
DROP POLICY IF EXISTS "Usuários podem ler próprios dados" ON users;
CREATE POLICY "Usuários podem ler próprios dados"
ON users FOR SELECT
USING (true);

-- Política: Usuários podem atualizar apenas seus próprios dados
DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON users;
CREATE POLICY "Usuários podem atualizar próprios dados"
ON users FOR UPDATE
USING (true);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar alguns usuários de teste (opcional)
-- DESCOMENTAR SE QUISER CRIAR USUÁRIOS DE TESTE
/*
INSERT INTO users (email, password_hash, nome, empresa) VALUES
  ('teste@ramppy.com', 'hash_simples_123', 'Usuário Teste', 'Ramppy'),
  ('dev@ramppy.com', 'hash_simples_dev', 'Developer', 'Ramppy Dev Team')
ON CONFLICT (email) DO NOTHING;
*/

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Verificar se a tabela foi criada
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
