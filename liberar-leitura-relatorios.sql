-- ==============================================================================
-- SCRIPT DE LIBERAÇÃO DE LEITURA (SELECT)
-- Necessário para que a página relatorios.html consiga ler os dados.
-- Execute este script no SQL Editor do Supabase.
-- ==============================================================================

-- 1. Habilitar leitura para a tabela de empresas
-- Permite que qualquer usuário (anon) leia os dados. 
-- Como é um painel administrativo, idealmente deveria ter autenticação, 
-- mas seguindo a simplicidade solicitada:
DROP POLICY IF EXISTS "Permitir leitura empresas" ON empresas;

CREATE POLICY "Permitir leitura empresas"
ON empresas FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Habilitar leitura para a tabela de questionarios
DROP POLICY IF EXISTS "Permitir leitura questionarios" ON questionarios;

CREATE POLICY "Permitir leitura questionarios"
ON questionarios FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Habilitar leitura para a View (caso utilize a view vw_dados_dashboard)
-- Views no Supabase herdaram as permissões das tabelas, mas é bom garantir que o usuário tenha grant na view
GRANT SELECT ON vw_dados_dashboard TO anon, authenticated;
