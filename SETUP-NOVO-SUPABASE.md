# 🚀 Setup do Novo Projeto Supabase

## Passo 1: Executar SQL no Supabase

### 1.1 Acessar o Dashboard
- URL: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
- Faça login na sua conta

### 1.2 Executar o Script SQL
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (botão azul)
3. Abra o arquivo `supabase-tables.sql` neste projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### 1.3 Verificar se Funcionou
Você deve ver: **"Success. No rows returned"**

No menu lateral, vá em **Table Editor** e verifique se aparecem:
- ✅ `empresas`
- ✅ `questionarios`

### 1.4 Testar a View
No SQL Editor, execute:
```sql
SELECT * FROM vw_dados_dashboard;
```
Deve retornar vazio (normal, ainda não há dados).

---

## Passo 2: Configurar Edge Function (Opcional - apenas se usar envio de e-mail)

### 2.1 Obter API Key do Resend
1. Acesse: https://resend.com/api-keys
2. Crie uma nova API key (ou use uma existente)
3. Copie a chave

### 2.2 Configurar Segredo no Supabase
No terminal, execute:
```bash
supabase secrets set RESEND_API_KEY=sua_chave_resend_aqui --project-ref uapwjnnzexamassmwxjc
```

**OU** via Dashboard:
1. Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc/settings/functions
2. Vá em **Secrets**
3. Adicione: `RESEND_API_KEY` = `sua_chave_resend_aqui`

### 2.3 Fazer Deploy da Edge Function
No terminal, execute:
```bash
# Certifique-se de estar na pasta do projeto
cd "supabase/functions/send-report"

# Deploy
supabase functions deploy send-report --project-ref uapwjnnzexamassmwxjc
```

**OU** via Dashboard:
1. Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc/functions
2. Clique em **Create a new function**
3. Use o código do arquivo `supabase/functions/send-report/index.ts`

---

## Passo 3: Verificar Configuração

### 3.1 Verificar Config.js
Confirme que `config.js` tem:
- ✅ SUPABASE_URL: `https://uapwjnnzexamassmwxjc.supabase.co`
- ✅ SUPABASE_ANON_KEY: preenchida com a chave correta

### 3.2 Testar Conexão
Abra o arquivo `testar-conexao.html` no navegador para verificar se a conexão está funcionando.

---

## Passo 4: Testar o Aplicativo

### 4.1 Iniciar Servidor Local
```bash
# No diretório do projeto
python3 -m http.server 8000
```

### 4.2 Acessar no Navegador
Abra: http://localhost:8000

### 4.3 Preencher Questionário de Teste
1. Aceite os termos
2. Preencha os dados da empresa
3. Responda as 12 questões
4. Finalize

### 4.4 Verificar Dados no Supabase
1. Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
2. Vá em **Table Editor** → `empresas` → deve ter novo registro
3. Vá em **Table Editor** → `questionarios` → deve ter novas respostas

---

## ✅ Checklist Final

- [ ] SQL executado com sucesso
- [ ] Tabelas `empresas` e `questionarios` criadas
- [ ] View `vw_dados_dashboard` criada
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de INSERT criadas
- [ ] Edge Function deployada (se necessário)
- [ ] Resend API Key configurada (se necessário)
- [ ] Teste de conexão funcionando
- [ ] Questionário de teste completo e dados salvos

---

## 🐛 Troubleshooting

### Erro ao executar SQL
- Verifique se já existem tabelas com os mesmos nomes
- Se sim, use `DROP TABLE IF EXISTS` antes de criar

### Erro ao salvar dados
- Verifique a chave anônima no `config.js`
- Verifique o console do navegador (F12) para erros
- Verifique se as políticas RLS estão corretas

### Erro no envio de e-mail
- Verifique se a Edge Function foi deployada
- Verifique se `RESEND_API_KEY` está configurada
- Verifique os logs da função no Supabase Dashboard

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase Dashboard
3. Logs da Edge Function (se aplicável)

