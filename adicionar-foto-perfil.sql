-- Adicionar campo para foto de perfil

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
