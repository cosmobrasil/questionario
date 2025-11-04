# Como Executar o SQL no Supabase

## Passo a Passo

### 1. Acessar o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
- Faça login na sua conta

### 2. Abrir o SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor**

### 3. Executar o Script
- Clique em **New Query** (botão azul no topo)
- Abra o arquivo `supabase-tables.sql` 
- Copie TODO o conteúdo do arquivo
- Cole no SQL Editor
- Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### 4. Verificar se Funcionou
- Você deve ver a mensagem "Success. No rows returned"
- Vá para **Table Editor** (menu lateral)
- Verifique se as tabelas aparecem:
  - ✅ `empresas`
  - ✅ `questionarios`

### 5. (Opcional) Verificar a View
- No SQL Editor, execute:
```sql
SELECT * FROM vw_dados_dashboard;
```
- Deve retornar vazio (normal, ainda não há dados)

## ✅ Pronto!
Após executar o SQL, o aplicativo do questionário estará pronto para salvar dados no Supabase.


