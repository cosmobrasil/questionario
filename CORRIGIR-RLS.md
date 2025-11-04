# 🔧 Correção RLS - Políticas de Segurança

## Problema
O erro "new row violates row-level security policy for table 'empresas'" ocorre porque as políticas RLS não estão permitindo INSERT para usuários anônimos.

## Solução

Execute o seguinte SQL no Supabase Dashboard:

### Passo 1: Acessar SQL Editor
1. Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
2. Vá em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar Script de Correção
Copie e cole o seguinte código:

```sql
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS public_insert_empresas ON empresas;
DROP POLICY IF EXISTS public_insert_questionarios ON questionarios;

-- Criar políticas corretas para usuários anônimos
CREATE POLICY public_insert_empresas ON empresas
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY public_insert_questionarios ON questionarios
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Verificar se RLS está habilitado
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;
```

### Passo 3: Verificar Políticas
Execute este comando para verificar se as políticas foram criadas:

```sql
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios')
ORDER BY tablename, policyname;
```

Você deve ver algo como:
```
tablename      | policyname              | roles           | cmd
---------------|-------------------------|-----------------|-----
empresas       | public_insert_empresas  | {anon,authenticated} | INSERT
questionarios  | public_insert_questionarios | {anon,authenticated} | INSERT
```

## ✅ Após Executar

1. Recarregue a página do questionário
2. Teste novamente preenchendo um questionário
3. Os dados devem ser salvos sem erro

## 📋 Arquivo Completo

O arquivo `fix-rls-policies.sql` contém o script completo para correção.

