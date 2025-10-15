-- SCRIPT DE CONFIGURAÇÃO DO BANCO RAMPPY
-- Execute este SQL no SQL Editor do Supabase

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

-- 2. Criar índice
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas
DROP POLICY IF EXISTS "Permitir cadastro público" ON users;
DROP POLICY IF EXISTS "Usuários podem ler próprios dados" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON users;

-- 5. Política: Permitir INSERT para qualquer um
CREATE POLICY "Permitir cadastro público"
ON users FOR INSERT
WITH CHECK (true);

-- 6. Política: Usuários podem ler todos os dados
CREATE POLICY "Usuários podem ler próprios dados"
ON users FOR SELECT
USING (true);

-- 7. Política: Usuários podem atualizar
CREATE POLICY "Usuários podem atualizar próprios dados"
ON users FOR UPDATE
USING (true);

-- 8. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Remover trigger antigo
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 10. Criar trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
