-- Adicionar campo telefone na tabela users

ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone TEXT;
