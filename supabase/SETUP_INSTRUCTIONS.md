# 🚀 Setup do Supabase para Boletos PWA

## Passo 1: Criar projeto Supabase
1. Vá em https://app.supabase.com
2. Clique "New Project"
3. Escolha "Create a new project"
4. Nome do projeto: `senavip-boletos`
5. Crie uma senha de database (guarde!)
6. Region: escolha a mais perto de você
7. Aguarde criação (~ 2 minutos)

## Passo 2: Copiar credenciais
1. Vá em "Project Settings" (ícone de engrenagem)
2. Clique em "API"
3. Copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cole no arquivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXxxxx
```

## Passo 3: Criar Storage Bucket (anexos)
1. Vá em "Storage" (painel lateral)
2. Clique "+ New Bucket"
3. Nome: `attachments`
4. Desmarque "Make it private" (ou deixe private, será controlado por RLS)
5. Clique "Create bucket"

## Passo 4: Aplicar Schema e RLS
1. Vá em "SQL Editor"
2. Clique "+ New Query"
3. Cole todo o conteúdo de `supabase/schema.sql`
4. Clique "Run" (Ctrl+Enter)
5. Aguarde execução
6. Verifique se não há erros (tudo deve ser green)

## Passo 5: Configurar CORS (se necessário)
Se tiver erro CORS ao testar, vá em:
1. "Project Settings" → "API"
2. Procure "CORS allowed origins"
3. Adicione: `http://localhost:3000` e sua URL de produção
4. Salve

## Pronto!
Agora você pode:
- Rodar `npm run dev` localmente
- Fazer login/signup
- Criar boletos
- Testar compartilhamento de família

### Troubleshooting:
- **"Invalid login credentials"**: Verifique se o usuário foi criado em "Authentication"
- **"RLS policy error"**: Execute novamente o schema.sql, certificando que não há erros
- **"Bucket not found"**: Crie manualmente em Storage
