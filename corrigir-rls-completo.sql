-- ============================================
-- CORREÇÃO COMPLETA DE POLÍTICAS RLS
-- Execute este script COMPLETO no SQL Editor
-- ============================================

-- 1. Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE questionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes (se houverem)
DROP POLICY IF EXISTS public_insert_empresas ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios ON questionarios;
DROP POLICY IF EXISTS "public_insert_empresas" ON empresas;
DROP POLICY IF EXISTS "public_insert_questionarios" ON questionarios;

-- 3. Reabilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- 4. Criar novas políticas explicitamente para anon
CREATE POLICY public_insert_empresas ON empresas
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY public_insert_questionarios ON questionarios
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- 5. Também criar para authenticated (caso precise no futuro)
CREATE POLICY public_insert_empresas_auth ON empresas
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY public_insert_questionarios_auth ON questionarios
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 6. Verificar o resultado
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios')
ORDER BY tablename, policyname;

-- ============================================
-- Se você ver as políticas listadas acima,
-- está tudo correto! Pode testar o app.
-- ============================================


