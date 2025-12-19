-- =============================================
-- RAMPPY NEWS - DATABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de Edições
CREATE TABLE IF NOT EXISTS editions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true
);

-- Tabela de Destaques (tópicos de cada edição)
CREATE TABLE IF NOT EXISTS edition_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL DEFAULT '📰',
    text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Artigos
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'GERAL',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_edition_topics_edition_id ON edition_topics(edition_id);
CREATE INDEX IF NOT EXISTS idx_articles_edition_id ON articles(edition_id);
CREATE INDEX IF NOT EXISTS idx_editions_published_at ON editions(published_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler edições publicadas
CREATE POLICY "Edições públicas são visíveis para todos" ON editions
    FOR SELECT USING (is_published = true);

-- Política: Qualquer um pode ler tópicos de edições publicadas
CREATE POLICY "Tópicos de edições públicas são visíveis" ON edition_topics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM editions
            WHERE editions.id = edition_topics.edition_id
            AND editions.is_published = true
        )
    );

-- Política: Qualquer um pode ler artigos de edições publicadas
CREATE POLICY "Artigos de edições públicas são visíveis" ON articles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM editions
            WHERE editions.id = articles.edition_id
            AND editions.is_published = true
        )
    );

-- Política: Usuários autenticados podem criar/editar (para admin)
CREATE POLICY "Admins podem criar edições" ON editions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar edições" ON editions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar edições" ON editions
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem criar tópicos" ON edition_topics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar tópicos" ON edition_topics
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar tópicos" ON edition_topics
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem criar artigos" ON articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar artigos" ON articles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar artigos" ON articles
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- FUNÇÃO PARA BUSCAR EDIÇÃO COMPLETA
-- =============================================

CREATE OR REPLACE FUNCTION get_full_editions()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', e.id,
                'title', e.title,
                'date', e.published_at,
                'topics', (
                    SELECT json_agg(
                        json_build_object(
                            'emoji', t.emoji,
                            'text', t.text
                        ) ORDER BY t.display_order
                    )
                    FROM edition_topics t
                    WHERE t.edition_id = e.id
                ),
                'articles', (
                    SELECT json_agg(
                        json_build_object(
                            'category', a.category,
                            'title', a.title,
                            'content', a.content,
                            'image', a.image_url
                        ) ORDER BY a.display_order
                    )
                    FROM articles a
                    WHERE a.edition_id = e.id
                )
            ) ORDER BY e.published_at DESC
        )
        FROM editions e
        WHERE e.is_published = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKET PARA IMAGENS (opcional)
-- =============================================

-- Criar bucket para imagens dos artigos
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('article-images', 'article-images', true);

-- Política para upload de imagens (usuários autenticados)
-- CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'article-images' AND auth.role() = 'authenticated'
--     );

-- Política para visualização pública de imagens
-- CREATE POLICY "Imagens são públicas" ON storage.objects
--     FOR SELECT USING (bucket_id = 'article-images');
