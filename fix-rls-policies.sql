-- Script para corrigir políticas RLS no Supabase
-- Execute este script no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc

-- Remover políticas existentes se houverem
DROP POLICY IF EXISTS public_insert_empresas ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios ON questionarios;

-- Criar políticas que permitem INSERT para usuários anônimos e autenticados
CREATE POLICY public_insert_empresas ON empresas
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY public_insert_questionarios ON questionarios
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas (opcional - apenas para conferência)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios')
ORDER BY tablename, policyname;

