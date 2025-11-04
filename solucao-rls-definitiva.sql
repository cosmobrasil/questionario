-- ============================================
-- SOLUÇÃO DEFINITIVA - POLÍTICAS RLS
-- Execute este script INTEIRO no SQL Editor
-- ============================================

-- PASSO 1: Remover TODAS as políticas existentes
DROP POLICY IF EXISTS public_insert_empresas ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios ON questionarios;
DROP POLICY IF EXISTS public_insert_empresas_auth ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios_auth ON questionarios;

-- PASSO 2: Garantir que RLS está habilitado
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar política SIMPLES para INSERT de usuários anônimos
-- Esta é a forma mais direta e garantida de funcionar
CREATE POLICY "Permitir INSERT anon empresas" ON empresas
    FOR INSERT 
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir INSERT anon questionarios" ON questionarios
    FOR INSERT 
    TO anon
    USING (true)
    WITH CHECK (true);

-- PASSO 4: Verificar se funcionou
SELECT 
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios')
ORDER BY tablename;

-- Se você ver 2 linhas acima (uma para cada tabela), está OK!

