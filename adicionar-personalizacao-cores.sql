-- Adicionar campo de cor da marca na tabela users
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE users
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7) DEFAULT '#22c55e';

-- Comentário para documentação
COMMENT ON COLUMN users.brand_color IS 'Cor da marca da empresa (formato hexadecimal #RRGGBB) - substitui o verde padrão em toda a plataforma';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'brand_color';
