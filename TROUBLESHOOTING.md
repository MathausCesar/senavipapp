# ❓ FAQ & TROUBLESHOOTING - PWA BOLETOS

## ❓ Perguntas Frequentes

### Q: Como começar do zero?
**A:** Leia `QUICK_START.md` - 5 passos de 5 minutos cada.

### Q: Preciso de conta de pagamento Supabase?
**A:** Não! Supabase é grátis até 50.000 linhas de dados. Mais que suficiente para MVP.

### Q: E se eu perder minha senha Supabase?
**A:** Sem problema - você não precisa dela após setup inicial. As credenciais estão em `.env.local`.

### Q: Posso usar outro banco de dados (PostgreSQL, MySQL)?
**A:** Supabase usa PostgreSQL internamente, mas para trocar, precisaria alterar schema. Recomendamos Supabase.

### Q: Como adicionar um segundo usuário à família?
**A:** Ainda não implementado (Fase 2). Por enquanto, cada usuário tem sua própria família.

### Q: Funciona offline?
**A:** Sim, mas com limitações. O Service Worker cacheia páginas estáticas. Dados precisam sincronizar ao voltar online.

### Q: Como exportar boletos?
**A:** Em Supabase > SQL Editor: `SELECT * FROM bills WHERE family_id = 'xxx'` > Copy to Excel.

### Q: Posso hospedar em outro lugar que não Vercel?
**A:** Sim - Next.js funciona em qualquer servidor Node.js (Railway, Render, Heroku).

### Q: E a segurança dos dados sensíveis (valores)?
**A:** RLS no Supabase garante que usuário só vê dados de sua família. Encriptado em trânsito (HTTPS).

---

## 🐛 TROUBLESHOOTING

### ❌ "npm install" falha
```bash
# Solução 1: Limpar cache npm
npm cache clean --force

# Solução 2: Deletar node_modules e reinstalar
Remove-Item node_modules -Recurse -Force
npm install

# Solução 3: Usar npm versão mais recente
npm install -g npm@latest
npm install
```

---

### ❌ "npm run dev" não inicia
```bash
# Verificar se porta 3000 está livre
netstat -ano | findstr :3000

# Matar processo na porta 3000
Get-Process -Id 12345 | Stop-Process  # (trocar 12345 pelo PID)

# Tentar novamente
npm run dev
```

---

### ❌ "Cannot find module @supabase/supabase-js"
```bash
# Reinstalar dependências
npm install

# Se ainda não funcionar:
npm uninstall @supabase/supabase-js
npm install @supabase/supabase-js
```

---

### ❌ "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Causa**: `.env.local` não preenchido ou servidor não recarregado

**Solução**:
1. Preencher `.env.local` com credenciais reais
2. Parar dev server (Ctrl+C)
3. Rodar novamente: `npm run dev`
4. Recarregar página (F5)

---

### ❌ "Invalid login credentials"

**Causa**: E-mail/senha incorretos OU usuário não confirmado

**Solução**:
1. Verificar se e-mail é válido (typo?)
2. Tentar "Cadastrar-se" em vez de login
3. Em Supabase > Auth > Users: confirmar se usuário existe
4. Se existe mas sem confirmação: editar e marcar "Confirm email"

---

### ❌ "RLS policy error" ao criar boleto

**Causa**: Schema SQL não foi executado corretamente

**Solução**:
1. Ir em Supabase > SQL Editor > "+ New Query"
2. Copiar TODO conteúdo de `supabase/schema.sql`
3. Colar e rodar (Ctrl+Enter)
4. Verificar último resultado: "Query executed" ✅
5. Recarregar localhost:3000

---

### ❌ Boleto não aparece após criar

**Causa**: 
- RLS está bloqueando (user_id não bate)
- Dados não foram salvo no banco

**Solução**:
1. Abrir Supabase > SQL Editor
2. Rodar: `SELECT * FROM bills;`
3. Se vazio: RLS está bloqueando INSERT
4. Se tem dados: Verificar se `family_id` bate com dados do user

```sql
-- Debug: Ver famílias do usuário
SELECT * FROM family_members WHERE user_id = auth.uid();

-- Debug: Ver boletos da família
SELECT * FROM bills WHERE family_id = 'xyz';
```

---

### ❌ Build erro "Cannot find module"

```bash
# Limpar tudo
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm cache clean --force

# Reinstalar
npm install
npm run build
```

---

### ❌ PWA não instala no celular

**Causas possíveis**:
1. Usando HTTP (localhost OK)
2. Service Worker não carregou
3. Manifest.json inválido

**Soluções**:
1. Testar em HTTPS (Vercel funciona)
2. DevTools > Application > Service Workers: deve mostrar "activated and running"
3. DevTools > Application > Manifest: verificar se todos os campos estão preenchidos

---

### ❌ Offline não funciona

**Causa**: Service Worker não registrado

**Solução**:
1. Abrir DevTools (F12)
2. Application > Service Workers
3. Deve estar "activated and running"
4. Se não: verificar DevTools > Console para erros
5. Recarregar: Ctrl+Shift+R (hard refresh)

---

### ❌ Dados não sincronizam do celular

**Causa**: Sync funciona para online. Offline: esperar conexão voltar.

**Solução**:
1. Ligar WiFi/móvel
2. Esperar 5-10 segundos
3. Refresca página (pull-to-refresh)
4. Dados devem sincronizar

---

### ❌ Erro: "CORS policy blocked"

**Causa**: Supabase CORS não configurado

**Solução**:
1. Supabase > Project Settings > API
2. Procure "CORS allowed origins"
3. Adicione:
   - `http://localhost:3000` (dev)
   - `https://seu-projeto.vercel.app` (prod)
4. Salve e recarregue página

---

### ❌ Deploy em Vercel falha

**Causa**: Env vars não setadas

**Solução**:
1. Vercel > Project Settings > Environment Variables
2. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```
3. Redeploy: Vercel > Deployments > Redeploy

---

### ❌ Página branca ao acessar

**Causa**: Erro de JS não renderiza

**Solução**:
1. Abrir DevTools > Console (F12)
2. Ver erro exato
3. Se error de Supabase: verificar `.env.local`
4. Se erro de componente: procurar em console
5. Reportar erro se persistir

---

### ❌ "TypeError: Cannot read property 'user' of null"

**Causa**: Supabase session não carregou

**Solução**:
1. Esperar 2-3 segundos (delay de carregamento)
2. Recarregar página (F5)
3. Se persistir: logout + login novamente

---

## 🔍 DEBUG TIPS

### Ver dados no Supabase
```bash
# Supabase Dashboard > SQL Editor > New Query

SELECT * FROM bills;
SELECT * FROM families;
SELECT * FROM family_members;
SELECT * FROM auth.users;
```

### Ver dados no Local Storage
```javascript
// DevTools > Console
localStorage.getItem('sb-access-token')  // Token da sessão
localStorage.getItem('sb-refresh-token')
```

### Ver dados em Network
```bash
# DevTools > Network > Filter: "supabase"
# Deve ver requests para API Supabase
# Status 200 = sucesso
# Status 403 = RLS bloqueou
# Status 401 = Não autenticado
```

### Logs de Service Worker
```javascript
// DevTools > Application > Service Workers
// Clique em "Inspect" para ver console do SW
```

---

## 🆘 Se nada funcionar...

### Checklist Final
- [ ] `.env.local` preenchido?
- [ ] Schema SQL executado em Supabase?
- [ ] `npm install` rodou sem erro?
- [ ] `npm run dev` está rodando?
- [ ] Recarreguei página (Ctrl+Shift+R)?
- [ ] Console (F12) mostra algum erro?

### Passos de Reset Total
```bash
# 1. Parar servidor
Ctrl+C

# 2. Limpar tudo
Remove-Item .next -Recurse -Force
Remove-Item node_modules -Recurse -Force
npm cache clean --force

# 3. Reinstalar
npm install

# 4. Verificar env
cat .env.local  # (deve ter credenciais)

# 5. Rodar novamente
npm run dev

# 6. Recarregar browser (Ctrl+Shift+R)
```

---

## 📞 Conseguindo Ajuda

1. **Documentação**: Leia `README.md`, `QUICK_START.md`, `ARCHITECTURE.md`
2. **Supabase Docs**: https://supabase.com/docs
3. **Next.js Docs**: https://nextjs.org/docs
4. **GitHub**: Criar issue com erro e stack trace
5. **Community**: Discord Supabase ou Next.js community

---

## ⚡ Performance Tips

1. **Melhorar Lighthouse Score**
   - Adicionar ícones PNG (icon-192x192.png, icon-512x512.png)
   - Service Worker pronto
   - Manifest valid

2. **Otimizar Database**
   - Índices criados em `due_date` e `status`
   - RLS policies otimizadas
   - Queries com limit/offset para pagination

3. **Reduzir Bundle**
   - Já otimizado (Tailwind purged)
   - Next.js code splitting automático

---

## 🚀 Dicas de Produção

1. **Monitorar Erros**
   - Vercel > Analytics
   - Supabase > Logs

2. **Backups**
   - Supabase > Backups (automático diariamente)

3. **Segurança**
   - Nunca commitar `.env.local`
   - Usar HTTPS sempre
   - RLS policies validadas

---

**Ainda com problemas? Reporte com:**
- URL onde está rodando
- Screenshot do erro
- Output do console (F12)
- Output de `npm run build`

Estou aqui para ajudar! 🎉
