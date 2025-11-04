# 🚨 CORREÇÃO URGENTE - Políticas RLS

## ⚠️ Problema
Erro: `new row violates row-level security policy for table "empresas"`

Isso significa que as políticas RLS não estão permitindo INSERTs de usuários anônimos.

## ✅ Solução Rápida

### **OPÇÃO 1: Script Completo (RECOMENDADO)**

1. Abra o arquivo `corrigir-rls-completo.sql` neste projeto
2. Copie TODO o conteúdo
3. Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
4. Vá em **SQL Editor** → **New Query**
5. Cole o código completo
6. Clique em **Run** (ou Ctrl/Cmd + Enter)
7. Verifique se aparecem as políticas no resultado

### **OPÇÃO 2: Desabilitar RLS Temporariamente (PARA TESTE)**

⚠️ **ATENÇÃO**: Isso remove a segurança. Use apenas para teste rápido.

```sql
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios DISABLE ROW LEVEL SECURITY;
```

Depois de testar, reabilite:
```sql
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_insert_empresas ON empresas
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY public_insert_questionarios ON questionarios
    FOR INSERT TO anon WITH CHECK (true);
```

## 📋 Verificação

Após executar o script, execute esta query para verificar:

```sql
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('empresas', 'questionarios');
```

**Resultado esperado:**
```
tablename    | policyname                    | roles   | cmd
-------------|-------------------------------|---------|-------
empresas     | public_insert_empresas        | {anon}  | INSERT
empresas     | public_insert_empresas_auth   | {authenticated} | INSERT
questionarios| public_insert_questionarios   | {anon}  | INSERT
questionarios| public_insert_questionarios_auth | {authenticated} | INSERT
```

## 🔄 Após Executar

1. **Recarregue a página do questionário** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Limpe o cache** se necessário (aba anônima)
3. **Teste novamente** preenchendo um questionário

## ❓ Ainda não funciona?

Se ainda der erro após executar o script:

1. Verifique no console do navegador se há outros erros
2. Confirme que a chave anônima está correta no `config.js`
3. Verifique se as tabelas existem no Supabase (Table Editor)

## 📞 Debug

Execute no SQL Editor para ver todas as políticas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'empresas';
SELECT * FROM pg_policies WHERE tablename = 'questionarios';
```

Se não aparecer nenhuma política, elas não foram criadas. Execute o script novamente.

