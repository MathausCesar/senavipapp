# 🚀 GUIA RÁPIDO DE INICIO - BOLETOS PWA

## ✅ Status Atual
- **Build**: ✅ Compilando sem erros
- **Servidor Dev**: ✅ Rodando em `http://localhost:3000`
- **PWA**: ✅ Service Worker configurado
- **Supabase**: ⏳ Aguardando configuração

---

## 📝 PRÓXIMOS PASSOS (5-10 minutos)

### 1️⃣ Configurar Supabase
```bash
# 1. Ir em https://supabase.com e criar projeto gratuito
# 2. Copiar credenciais (Project URL + Anon Key)
# 3. Colar em .env.local:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# 4. Recarregar localhost:3000 (Ctrl+R)
```

### 2️⃣ Aplicar Schema SQL
```bash
# 1. Abrir Supabase Dashboard > SQL Editor
# 2. + New Query
# 3. Copiar todo conteúdo de: supabase/schema.sql
# 4. Colar e rodar (Ctrl+Enter)
# 5. Verificar no final: "Query executed"
```

### 3️⃣ Criar Storage Bucket (para anexos futuros)
```bash
# 1. Supabase > Storage
# 2. "+ New Bucket"
# 3. Nome: attachments
# 4. Deixar público (ou controlar via RLS - padrão)
```

### 4️⃣ Testar Localmente
```bash
# Em http://localhost:3000:

1. Clique "Cadastrar-se"
2. Use seu e-mail (ex: seu@email.com)
3. Senha com 6+ caracteres
4. Clique "Cadastrar"
5. Deve ir para Dashboard se sucesso!
```

### 5️⃣ Criar Boleto de Teste
```bash
1. Dashboard > "Cadastrar boleto"
2. Fornecedor: "Água"
3. Valor: 150,00
4. Data: Hoje (ou futura)
5. Clique "Salvar boleto"
6. Deve aparecer em "Ver por data"
```

---

## 🎨 Customizações Recomendadas (Opcional)

### Criar Ícones PWA
O app usa ícones em `public/`:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

Usar ferramentas online para criar:
- https://www.favicon-generator.org/
- https://www.canva.com/

Salvar como PNG e colocar em `public/`.

### Mudar Cor de Tema
Em `public/manifest.json`:
```json
"theme_color": "#2563eb"  // Azul atual
// Trocar para: #10b981 (verde), #f59e0b (laranja), #ef4444 (vermelho)
```

Em `app/layout.tsx`:
```tsx
<meta name="theme-color" content="#2563eb" />  // Trocar aqui tbm
```

---

## 🧪 Checklist de Testes

- [ ] Login/Signup funciona
- [ ] Dashboard mostra cards
- [ ] Criar boleto funciona
- [ ] Listar com filtro por data
- [ ] Marcar como pago
- [ ] Editar boleto
- [ ] Deletar boleto
- [ ] Filtro "Atrasados"
- [ ] Filtro "Pagos"

---

## 📱 Testar PWA (Mobile)

### Android Chrome
1. Abra `http://192.168.1.14:3000` no Chrome mobile
2. Tap ⋯ (menu) > "Instalar"
3. App aparece na home
4. Tap para abrir (funciona standalone)

### iOS Safari
1. Abra Safari > tap Compartilhar
2. "Adicionar à tela inicial"
3. Aparece como web app

---

## 🔧 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **"Invalid login"** | Confirmar e-mail em Supabase > Auth |
| **Boleto não aparece** | Verificar em Supabase > SQL: `SELECT * FROM bills;` |
| **Erro de RLS** | Reexecutar `schema.sql` |
| **Env não carrega** | Restart dev server: Ctrl+C, depois `npm run dev` |
| **PWA não instala** | Usar HTTPS em produção (Vercel funciona) |

---

## 🌐 Deploy em Produção (Vercel)

Quando pronto:
```bash
1. git init && git add . && git commit -m "first"
2. git remote add origin https://github.com/seu-user/senavip
3. git push -u origin main
4. Vercel.com > New Project > Select GitHub repo
5. Add env vars (NEXT_PUBLIC_SUPABASE_URL e ANON_KEY)
6. Deploy!
```

---

## 📚 Documentação Completa

- **Supabase Setup**: `supabase/SETUP_INSTRUCTIONS.md`
- **Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **README**: `README.md`

---

## ❓ Dúvidas?

1. **TypeScript/Next.js**: https://nextjs.org/docs
2. **Supabase**: https://supabase.com/docs
3. **Tailwind**: https://tailwindcss.com/docs

---

**Tudo pronto? Vá para http://localhost:3000 e comece a usar! 🎉**
