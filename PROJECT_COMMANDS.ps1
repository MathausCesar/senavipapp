#!/usr/bin/env powershell
# Arquivo: PROJECT_COMMANDS.ps1
# Descrição: Comandos principais do projeto (copiar e executar no PowerShell)

# ============================================================================
# SETUP INICIAL
# ============================================================================

# 1. Instalar dependências (primeira vez)
npm install

# 2. Verificar build
npm run build

# 3. Copiar env example
Copy-Item .env.example .env.local

# ============================================================================
# DESENVOLVIMENTO
# ============================================================================

# 4. Rodar servidor local
npm run dev
# Acesse: http://localhost:3000

# 5. Abrir em navegador
Start-Process http://localhost:3000

# ============================================================================
# BUILD + TESTE
# ============================================================================

# 6. Build para produção
npm run build

# 7. Servir build localmente
npx serve@latest -s .next -l 3000

# 8. Limpar cache build
Remove-Item .next -Recurse -Force
Remove-Item node_modules -Recurse -Force
npm install
npm run dev

# ============================================================================
# DEPLOY (Vercel)
# ============================================================================

# 9. Preparar para GitHub
git init
git add .
git commit -m "Initial commit: PWA Boletos"

# 10. Criar repositório (fazer em GitHub web, depois:)
git remote add origin https://github.com/seu-user/senavip.git
git branch -M main
git push -u origin main

# ============================================================================
# SUPABASE
# ============================================================================

# 11. Testar conexão Supabase (executar no Node REPL)
node -e "
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL:', url ? '✅' : '❌');
console.log('KEY:', key ? '✅' : '❌');
"

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# 12. Ver logs do servidor
npm run dev 2>&1 | Tee-Object -FilePath dev.log

# 13. Verificar porta 3000 está livre
netstat -ano | findstr :3000

# 14. Matar processo na porta 3000
Get-Process | Where-Object {$_.Port -eq 3000} | Stop-Process

# 15. Reinstalar dependências
Remove-Item package-lock.json
Remove-Item node_modules -Recurse -Force
npm install

# ============================================================================
# TESTE RÁPIDO
# ============================================================================

# 16. Executar em modo de teste (mock)
npm run dev -- --experimental-turbopack

# 17. Gerar relatório Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# ============================================================================
# LIMPEZA
# ============================================================================

# 18. Limpar todos os caches
npm cache clean --force
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# 19. Reset para estado original
git reset --hard
git clean -fd

# ============================================================================
# DOCUMENTAÇÃO
# ============================================================================

# 20. Listar arquivos principais
Get-ChildItem -Path .\app -Recurse -File
Get-ChildItem -Path .\components -Recurse -File
Get-ChildItem -Path .\lib -Recurse -File

# ============================================================================
# MONITORAMENTO
# ============================================================================

# 21. Verificar tamanho do projeto
(Get-ChildItem -Recurse -Path . | Measure-Object -Property Length -Sum).Sum / 1MB | Out-Default

# 22. Listar todas as dependências
npm list

# ============================================================================
# AUTOMAÇÃO (OPCIONAL)
# ============================================================================

# 23. Alias útil (adicionar a $PROFILE para persistir)
function devstart { npm run dev }
function devbuild { npm run build }
function devclean { Remove-Item .next -Recurse -Force; Remove-Item node_modules -Recurse -Force; npm install }

# ============================================================================
# QUICK REFERENCE
# ============================================================================

# Iniciar tudo:
#   1. npm install
#   2. Configurar .env.local
#   3. npm run dev
#   4. Abrir http://localhost:3000

# Fazer deploy:
#   1. git push
#   2. Vercel detecta e faz deploy automático

# Testar PWA:
#   1. npm run build
#   2. Abrir em chrome DevTools > Lighthouse
#   3. Gerar PWA report

# ============================================================================
