# ✅ CHECKLIST DE DEPLOYMENT - BOLETOS PWA

## 📋 Pré-Requisitos
- [ ] Node.js 18+ instalado
- [ ] npm ou yarn funcionando
- [ ] Conta Supabase criada (grátis)
- [ ] Git configurado (para deploy)

## 🔧 Setup Local

### Passo 1: Instalação
```bash
cd f:\Dev\senavip
npm install
```
- [ ] npm install sem erros
- [ ] Todas as dependências instaladas

### Passo 2: Configuração Supabase
```bash
# 1. Criar projeto em https://supabase.com
# 2. Copiar credenciais
# 3. Colar em .env.local:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```
- [ ] .env.local criado com credenciais corretas
- [ ] Não commitar .env.local no git!

### Passo 3: Executar Schema SQL
```bash
# 1. Abrir supabase/schema.sql
# 2. Copiar TODO o conteúdo
# 3. Abrir Supabase Dashboard > SQL Editor
# 4. Colar e executar (Ctrl+Enter)
```
- [ ] Tabelas criadas (families, family_members, bills)
- [ ] RLS policies aplicadas
- [ ] Storage bucket "attachments" criado
- [ ] Sem erros na execução

### Passo 4: Rodar Localmente
```bash
npm run dev
```
- [ ] Servidor inicia em http://localhost:3000
- [ ] Sem erros no console

## 🧪 Testes Funcionais

### Teste 1: Autenticação
- [ ] Ir para /login
- [ ] Clicar "Cadastrar-se"
- [ ] Preencher e-mail e senha (6+ caracteres)
- [ ] Ser redirecionado para /app/dashboard
- [ ] Logout funciona
- [ ] Login com senha incorreta mostra erro

### Teste 2: Dashboard
- [ ] Cards de resumo aparecem
- [ ] "Atrasados", "Próximos 7 dias", "Total em aberto" mostram 0 inicialmente
- [ ] Botões "Ver por data" e "Cadastrar boleto" funcionam

### Teste 3: Criar Boleto
- [ ] Ir em "Cadastrar boleto"
- [ ] Preencher: Fornecedor, Valor, Data
- [ ] Deixar Status como "Em aberto"
- [ ] Clicar "Salvar"
- [ ] Ser redirecionado para /app/bills
- [ ] Boleto aparecer na lista

### Teste 4: Filtros de Boleto
- [ ] Aba "Por Data": Selecionar uma data futura, boleto some
- [ ] Selecionar hoje, boleto aparece
- [ ] Aba "Atrasados": Criar boleto com data passada, marca atrasado
- [ ] Aba "Pagos": Marcar como pago, aparece em pagos

### Teste 5: Editar Boleto
- [ ] Clicar "✏️ Editar" em um boleto
- [ ] Mudar fornecedor e valor
- [ ] Clicar "Salvar alterações"
- [ ] Boleto atualizado na lista

### Teste 6: Deletar Boleto
- [ ] Clicar "🗑️ Deletar"
- [ ] Confirmação aparece
- [ ] Confirmar
- [ ] Boleto desaparece da lista

### Teste 7: Marcar como Pago
- [ ] Em um boleto aberto, clicar "✅ Marcar como pago"
- [ ] Status muda para "Pago"
- [ ] Botão muda para "🔄 Reabrir"
- [ ] Ir em aba "Pagos", boleto aparece lá

## 📱 Testes PWA

### Desktop (Chrome/Edge)
- [ ] Abrir DevTools (F12)
- [ ] Ir em "Lighthouse"
- [ ] Gerar report de PWA
- [ ] Score deve ser ~80+

### Mobile (Android)
- [ ] Abrir em Chrome mobile: http://localhost:3000
- [ ] Tap ⋯ (menu) > "Instalar"
- [ ] App aparece na home
- [ ] App abre em modo fullscreen (sem barra de URL)
- [ ] Desligar WiFi
- [ ] App continua funcionando (offline)
- [ ] Página principal carrega

### iOS
- [ ] Safari > Compartilhar > "Adicionar à tela inicial"
- [ ] App aparece na home
- [ ] Mesmo teste de offline

## 🚀 Build para Produção

```bash
npm run build
```
- [ ] Build completa sem erros
- [ ] Arquivo de saída criado (.next/)

## 🌐 Deploy Vercel

### Setup
1. [ ] Código commitado no GitHub
2. [ ] Conectar Vercel ao GitHub repo
3. [ ] Framework: Next.js (auto-detectado)
4. [ ] Build command: `npm run build`
5. [ ] Output directory: `.next`

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```
- [ ] Variables adicionadas em Settings > Environment Variables
- [ ] Redeployed após adicionar

### Deploy
- [ ] Deploy iniciado
- [ ] Build bem-sucedido
- [ ] App acessível em seu-projeto.vercel.app

### Testes em Produção
- [ ] [ ] Acesso login funciona
- [ ] [ ] Criar boleto funciona
- [ ] [ ] Listar boletos funciona
- [ ] [ ] PWA instalável em produção
- [ ] [ ] Offline funciona

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Invalid login credentials" | Verifique Supabase > Auth, confirme e-mail |
| "RLS policy error" | Execute schema.sql novamente |
| "Bucket not found" | Crie bucket "attachments" em Storage |
| PWA não instala | Teste em HTTPS (Vercel funciona) |
| Dados não sincronizam | Verifique .env.local, teste em Supabase SQL Editor |
| Build erro "Cannot find module" | `rm -rf node_modules`, `npm install` |

## ✨ Features Opcionais (Fase 2)

- [ ] Upload de anexos (foto/PDF do boleto)
- [ ] Convite de membro por e-mail
- [ ] Notificações push
- [ ] Scanner de boleto (OCR)
- [ ] Histórico de pagamentos
- [ ] Exportar para PDF/Excel
- [ ] Tema claro/escuro
- [ ] Suporte a múltiplas famílias

## 📞 Suporte

- **Docs Supabase**: https://supabase.com/docs
- **Docs Next.js**: https://nextjs.org/docs
- **GitHub Issues**: Criar issue se encontrar bug

---

**Status Final:** ☑️ Pronto para produção!
