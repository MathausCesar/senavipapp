# 🏗️ ARQUITETURA DO PROJETO - PWA BOLETOS

## Visão Geral
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                    │
│  - Pages (rotas dinâmicas com App Router)                   │
│  - Components (UI reutilizáveis)                            │
│  - Lib (utilities, tipos, supabase client)                  │
│  - Public (PWA manifest, service worker, ícones)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─► Supabase Client (supabase-js)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  BACKEND (Supabase)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication (Email + Password)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                  │ │
│  │  - families (table)                                   │ │
│  │  - family_members (table)                             │ │
│  │  - bills (table)                                      │ │
│  │  - Row Level Security (RLS) Policies                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage (attachments bucket)                         │ │
│  │  - Para uploads de boletos (foto/PDF)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
senavip/
│
├── app/ ........................ App Router (Next.js 14+)
│   ├── layout.tsx ............. Layout raiz (PWA metadata)
│   ├── page.tsx ............... Home (redirect based on auth)
│   │
│   ├── login/
│   │   └── page.tsx ........... Página de login/signup
│   │
│   └── app/ ................... Grupo protegido (requer auth)
│       ├── layout.tsx ......... Header + footer
│       │
│       ├── dashboard/
│       │   └── page.tsx ....... Dashboard com resumo
│       │
│       └── bills/
│           ├── page.tsx ....... Listagem com filtros
│           ├── new/
│           │   └── page.tsx ... Criar boleto
│           └── [id]/
│               └── edit/
│                   └── page.tsx .... Editar boleto
│
├── components/ ................ Componentes React reutilizáveis
│   ├── Button.tsx ............. Botão (sizes, variants)
│   ├── Input.tsx .............. Input com validação
│   ├── Card.tsx ............... Container card
│   ├── Tabs.tsx ............... Abas para filtros
│   ├── Badge.tsx .............. Status badge (colors)
│   ├── Loading.tsx ............ Spinner de carregamento
│   ├── EmptyState.tsx ......... Estado vazio
│   ├── ToastProvider.tsx ....... Toast notifications
│   └── ServiceWorkerProvider.tsx .... PWA registration
│
├── lib/ ....................... Utilitários e helpers
│   ├── supabaseClient.ts ....... Cliente Supabase
│   ├── types.ts ............... Tipos TypeScript (Bill, Family, etc)
│   └── withProtectedRoute.ts ... HOC para rotas protegidas
│
├── public/ .................... Assets estáticos PWA
│   ├── manifest.json .......... PWA metadata + ícones
│   ├── sw.js .................. Service Worker (cache, offline)
│   ├── offline.html ........... Página offline
│   ├── icon-192x192.png ....... Ícone PWA (criar)
│   └── icon-512x512.png ....... Ícone PWA (criar)
│
├── supabase/ .................. Backend + SQL
│   ├── schema.sql ............. DDL + RLS policies
│   └── SETUP_INSTRUCTIONS.md .. Guia de setup
│
├── next.config.ts ............. Configuração Next.js
├── tailwind.config.ts ......... Configuração Tailwind
├── tsconfig.json .............. Configuração TypeScript
├── package.json ............... Dependências
├── .env.example ............... Template de env vars
├── .env.local ................. Env vars local (git ignore)
│
├── README.md .................. Documentação principal
├── QUICK_START.md ............. 5 passos para começar
├── DEPLOYMENT_CHECKLIST.md .... Checklist completo
├── ICON_GUIDE.md .............. Guia de ícones
├── SUMMARY.md ................. Sumário executivo
└── PROJECT_COMMANDS.ps1 ....... Scripts PowerShell
```

---

## 🔄 Fluxo de Dados

### Autenticação
```
Usuário Input (login/password)
    ↓
Validação (Zod)
    ↓
Supabase Auth (email/password)
    ↓
✅ Sessão criada
    ↓
Redirect /app/dashboard
    ↓
Trigger: create_family_on_signup
    ↓
Tabela families + family_members populadas
```

### Criar/Listar Boleto
```
Form Input (fornecedor, valor, data)
    ↓
Validação (Zod)
    ↓
Supabase INSERT/SELECT (bills table)
    ↓
RLS Policy: Valida user é membro da family
    ↓
✅ Sucesso (ou erro clara)
    ↓
Toast + Refresh lista
```

### Compartilhamento Família
```
Usuário A (owner) cria account
    ↓
Trigger: family + family_member criados
    ↓
Usuário B faz login com outro e-mail
    ↓
Sua própria family criada (antes de convite)
    ↓
[FUTURA]: Convite via token/link
    ↓
Usuário B adicionado a family de A
    ↓
family_members: [(A, owner), (B, member)]
    ↓
RLS: B vê boletos de A
```

---

## 🔐 Row Level Security (RLS)

### Princípio
Cada query SQL é automaticamente filtrada baseado no `auth.uid()`:

### Tabelas Protegidas

#### families
```sql
-- Owner só vê sua família
SELECT * FROM families 
WHERE owner_id = auth.uid()

-- Membros também veem (futuro)
SELECT * FROM families
WHERE id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
```

#### family_members
```sql
-- Membro vê lista de membros de sua família
SELECT * FROM family_members
WHERE family_id IN (
  SELECT family_id FROM family_members WHERE user_id = auth.uid()
)
```

#### bills
```sql
-- Membro vê boletos de sua família
SELECT * FROM bills
WHERE family_id IN (
  SELECT family_id FROM family_members WHERE user_id = auth.uid()
)
```

#### storage.attachments
```
Bucket: "attachments"
Pasta: /{family_id}/{file}

RLS: Usuário só acessa se membro da família
```

---

## 🧩 Componentes + Responsabilidades

| Componente | Responsabilidade | Reutilizável |
|-----------|-----------------|-------------|
| Button | Renderizar botão (sizes, variants) | ✅ Sim |
| Input | Renderizar input com label + erro | ✅ Sim |
| Card | Container base | ✅ Sim |
| Tabs | Abas para filtros | ✅ Sim |
| Badge | Status/tag com cores | ✅ Sim |
| Loading | Spinner de carregamento | ✅ Sim |
| EmptyState | Estado vazio com CTA | ✅ Sim |
| ToastProvider | Notificações toast | ✅ Sim |
| ServiceWorkerProvider | Registrar SW | ✅ Sim |

---

## 📡 API Supabase (RealTime)

Não implementado no MVP, mas disponível para:

```typescript
// Exemplo (futura feature)
const subscription = supabase
  .channel('bills')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'bills' },
    (payload) => {
      console.log('Bill changed:', payload);
      // Atualizar UI em real-time
    }
  )
  .subscribe();
```

---

## 🧪 Testing Strategy

### Unit Tests (Próxima fase)
```typescript
// Exemplo
describe('BillCreateSchema', () => {
  it('validates positive amount', () => {
    expect(() => BillCreateSchema.parse({ amount: -1 })).toThrow();
  });
});
```

### E2E Tests (Próxima fase)
```typescript
// Exemplo com Cypress/Playwright
describe('Login Flow', () => {
  it('creates family on signup', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('novo@email.com');
    cy.get('input[name=password]').type('senha123');
    cy.contains('Cadastrar').click();
    cy.url().should('include', '/app/dashboard');
  });
});
```

---

## 📊 Performance

### Bundle Size
- Next.js: ~180KB
- Tailwind: ~50KB
- Supabase: ~100KB
- Total: ~330KB (gzipped ~100KB)

### Optimization
- [x] Image optimization
- [x] Code splitting por rota
- [x] PWA caching
- [ ] Service Worker cache strategies (TODO)

---

## 🚀 Deployment Pipeline

```
Local Development
    ↓
    npm run dev (localhost:3000)
    ↓
Git Commit + Push
    ↓
GitHub Repository
    ↓
Vercel Webhook (auto-triggered)
    ↓
    - npm install
    - npm run build
    - npm run start
    ↓
Production URL (seu-projeto.vercel.app)
    ↓
CDN Edge (Vercel)
    ↓
PWA Installable
```

---

## 🔄 CI/CD (Futuro)

```yaml
# .github/workflows/build.yml (sugerido)
name: CI/CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test (TODO)
      - uses: vercel/action@master
```

---

## 📚 Dependências Principais

```json
{
  "next": "16.1.5",           // Framework
  "react": "19.0.0",           // UI library
  "typescript": "5.x",         // Type safety
  "tailwindcss": "3.x",        // Styling
  "@supabase/supabase-js": "2.x", // Backend
  "zod": "3.x",                // Validation
  "react-hot-toast": "2.x"     // Notifications
}
```

---

## 🔮 Roadmap (Fase 2+)

1. **Convites de Membro** (v1.1)
   - Email com link de convite
   - Aceitar/recusar convite

2. **Upload de Anexos** (v1.2)
   - Foto do boleto
   - PDF do boleto
   - Supabase Storage

3. **Notificações Push** (v1.3)
   - Alerta de boleto atrasado
   - Web Push API

4. **Scanner OCR** (v2.0)
   - Camera access
   - Ler dados do boleto automaticamente

5. **Relatórios** (v2.1)
   - Exportar Excel
   - Gráfico de gastos mensais

---

## ✅ Checklist de Arquitetura

- [x] Separação de concerns (UI/Logic)
- [x] RLS implementado
- [x] Componentes reutilizáveis
- [x] Tipos TypeScript strict
- [x] PWA manifest + SW
- [x] Mobile-first responsive
- [x] Documentação inline
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] CI/CD pipeline

---

**Nota**: Esta arquitetura foi desenhada para escalabilidade e manutenibilidade futura, mantendo simplicidade no MVP.
