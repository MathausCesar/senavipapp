# 💰 Controle de Boletos - PWA Familia

Um Progressive Web App (PWA) para gerenciar boletos compartilhados entre familiares. Totalmente otimizado para usabilidade de idosos com interface grande, clara e simples.

## 🎯 Features MVP

✅ **Autenticação Simples** - Login com e-mail e senha  
✅ **Famílias Compartilhadas** - Dois usuários veem os mesmos boletos  
✅ **CRUD de Boletos** - Criar, editar, deletar, marcar como pago  
✅ **Filtros Inteligentes** - Por data, atrasados, pagos  
✅ **Dashboard** - Cards com resumo visual de pendências  
✅ **PWA** - Funciona offline e instalável no celular  
✅ **Segurança** - Row Level Security (RLS) no Supabase  
✅ **Mobile-First** - Totalmente responsivo  
✅ **Acessibilidade** - Fonte grande (18-20px), alto contraste  

## 🛠 Stack Utilizada

- **Frontend**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Postgres + Storage)
- **Validação**: Zod
- **Notificações**: react-hot-toast
- **PWA**: next-pwa + Service Worker
- **Deploy**: Vercel

## 🚀 Quick Start

### 1. Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase (grátis em https://supabase.com)

### 2. Setup Local

```bash
# Clonar repositório (ou navegar até a pasta do projeto)
cd f:\Dev\senavip

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas credenciais Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 3. Configurar Supabase

**Leia o guia completo em:** `supabase/SETUP_INSTRUCTIONS.md`

Resumo rápido:
1. Crie um projeto em supabase.com
2. Copie as credenciais para `.env.local`
3. Crie o bucket `attachments` em Storage
4. Execute o SQL em `supabase/schema.sql` via SQL Editor
5. Pronto! ✅

### 4. Rodar Localmente

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

### 5. Testar PWA

**Desktop (Chrome/Edge):**
- Abra as DevTools (F12)
- Vá em "Lighthouse"
- Clique "Generate report"
- Verá a pontuação de PWA

**Android/iOS:**
- Acesse http://localhost:3000
- Tap "Adicionar à tela inicial" (mobile) ou ⋯ > "Instalar app"
- O app funciona offline e salva dados no cache

## 📁 Estrutura do Projeto

```
senavip/
├── app/
│   ├── layout.tsx              # Layout raiz (PWA meta)
│   ├── page.tsx                # Home (redirect)
│   ├── login/
│   │   └── page.tsx            # Página de login/signup
│   └── app/
│       ├── layout.tsx          # Layout autenticado (header)
│       ├── dashboard/
│       │   └── page.tsx        # Home com resumo
│       └── bills/
│           ├── page.tsx        # Lista com filtros
│           ├── new/
│           │   └── page.tsx    # Criar boleto
│           └── [id]/
│               └── edit/
│                   └── page.tsx # Editar boleto
├── components/
│   ├── Button.tsx              # Botão (lg, accessible)
│   ├── Input.tsx               # Input com validação
│   ├── Card.tsx                # Card container
│   ├── Tabs.tsx                # Abas para filtros
│   ├── Badge.tsx               # Status badge
│   ├── Loading.tsx             # Loading spinner
│   ├── EmptyState.tsx          # Vazio (sem boletos)
│   └── ToastProvider.tsx       # Notificações
├── lib/
│   ├── supabaseClient.ts       # Cliente Supabase
│   └── types.ts                # Tipos (Bill, Family, etc)
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── offline.html            # Página offline
│   ├── icon-192x192.png        # (criar: 192x192)
│   └── icon-512x512.png        # (criar: 512x512)
├── supabase/
│   ├── schema.sql              # DDL + RLS
│   └── SETUP_INSTRUCTIONS.md   # Guia passo-a-passo
├── .env.example                # Template de env vars
├── .env.local                  # Env local (git ignore)
├── next.config.ts              # Configuração Next + PWA
├── tailwind.config.ts          # Tailwind
├── tsconfig.json               # TypeScript config
└── package.json                # Dependências
```

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS:

- **families**: Só o owner vê sua família
- **family_members**: Membros veem lista de membros
- **bills**: Membros veem e editam boletos da família
- **storage.attachments**: Acesso controlado por family_id

**Nunca exponha** a `SERVICE_ROLE_KEY` no frontend. Usamos apenas `ANON_KEY` com RLS.

### Autenticação

- Signup cria automaticamente uma `family` vazia
- Usuário é adicionado como `owner`
- Segundo usuário pode ser convidado (futura feature)

## 📱 PWA Features

### ✅ Funciona Offline
- Service Worker cacheia paginas principais
- Tenta sincronizar ao voltar online
- Mostra página offline amigável

### ✅ Instalável
- Manifest com ícone 192x192 e 512x512
- "Adicionar à tela inicial" em mobile
- Modo standalone (sem barra de URL)

### ✅ Responsivo
- Mobile-first design
- Funciona em todos os tamanhos

## 🚀 Deploy (Vercel)

```bash
# 1. Push para GitHub
git remote add origin https://github.com/seu-user/senavip.git
git push -u origin main

# 2. Conecte no Vercel
# - Vá em vercel.com
# - "New Project" > "Import from GitHub"
# - Selecione o repositório

# 3. Configure Environment Variables
# Add em "Settings" > "Environment Variables":
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# 4. Deploy automático ao fazer push para main
```

## 🧪 Testes Manuais

### Teste de Autenticação
1. Acesse /login
2. Clique "Cadastrar-se"
3. Use seu e-mail
4. Será redirecionado para /app/dashboard

### Teste de Boleto
1. Dashboard > "Cadastrar boleto"
2. Preencha fornecedor, valor, data
3. Clique "Salvar"
4. Vá em "Ver por data" e confirme na lista
5. Teste editar e deletar

### Teste de Filtros
1. Em /app/bills, mude de aba
2. "Por Data" - use o date picker
3. "Atrasados" - crie um boleto com data passada
4. "Pagos" - marque um como pago e veja em aba

### Teste de PWA (Android)
1. Abra em Chrome mobile
2. Tap ⋯ (menu) > "Instalar"
3. Funciona como app nativo
4. Funciona offline (teste desligando WiFi)

## 📚 Guias Adicionais

- **Supabase Setup**: `supabase/SETUP_INSTRUCTIONS.md`
- **API Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## 🐛 Troubleshooting

### "Invalid login credentials"
- Verifique se o usuário foi criado em Supabase > Auth
- Confirme se o e-mail está confirmado (se exigido)

### "RLS policy error"
- Execute novamente `supabase/schema.sql` via SQL Editor
- Verifique se não há erros de sintaxe

### "Bucket not found"
- Vá em Storage > + New bucket
- Nome: `attachments`
- Deixe public se necessário, ou controle via RLS

### PWA não funciona offline
- Verifique se o Service Worker está registrado
- Abra DevTools > Application > Service Workers
- Deve estar "activated and running"

### Dados não sincronizam
- Verifique credenciais Supabase em `.env.local`
- Teste em Supabase > SQL Editor: `select * from bills;`

## 📝 Licença

MIT

## 🤝 Contribuindo

Sinta-se livre para fazer fork, criar issues e enviar PRs!

---

**Feito com ❤️ para facilitar a vida de idosos e suas famílias.**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
