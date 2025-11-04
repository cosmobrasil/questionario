# 🧪 Teste do Questionário de Circularidade

## ✅ Servidor Rodando
**URL:** http://localhost:8000

## ✅ Arquivos Verificados
- ✅ `index.html` - Carregando corretamente
- ✅ `config.js` - Configuração do Supabase OK
- ✅ `app.js` - JavaScript funcionando
- ✅ `style.css` - Estilos carregando

## 🧪 Como Testar

### 1. Acesse no Navegador
Abra: **http://localhost:8000**

### 2. Fluxo de Teste
1. **Tela de Termos**
   - Leia os termos
   - Marque o checkbox de aceite
   - Clique em "Continuar"

2. **Dados da Empresa**
   - Preencha todos os campos:
     - Nome da Empresa
     - CNPJ
     - Nome do Responsável
     - E-mail
     - Setor Econômico
     - Produto Avaliado
   - Clique em "Próximo: Questionário"

3. **Questionário (12 Questões)**
   - Para cada questão, selecione uma opção
   - Use "Anterior" ou "Próximo"
   - Verifique a barra de progresso
   - Na última questão, clique em "Finalizar"

4. **Confirmação**
   - Deve aparecer "Questionário Concluído!"
   - Os dados devem estar salvos no Supabase

### 3. Verificar no Supabase
Acesse: https://supabase.com/dashboard/project/uapwjnnzexamassmwxjc
- Table Editor → `empresas` → deve ter novo registro
- Table Editor → `questionarios` → deve ter novas respostas

## ⚠️ Possíveis Problemas

### Se os dados não forem salvos:
1. Verifique a anon key no `config.js`
2. Verifique se o Supabase está acessível
3. Abra o console do navegador (F12) e veja os erros

### Se a página não carregar:
1. Verifique se o servidor está rodando
2. Pare o servidor (Ctrl+C)
3. Reinicie: `python3 -m http.server 8000`

## 🚀 Próximos Passos
Após o teste bem-sucedido:
1. Fazer deploy no Netlify
2. Testar em produção
3. Começar a coletar dados reais


