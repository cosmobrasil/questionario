DROP POLICY IF EXISTS public_insert_empresas ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios ON questionarios;
DROP POLICY IF EXISTS public_insert_empresas_auth ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios_auth ON questionarios;

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

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

SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios')
ORDER BY tablename;


