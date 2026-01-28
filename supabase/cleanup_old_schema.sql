-- ============================================================================
-- Script de Limpeza: Remove estrutura antiga de "família"
-- ============================================================================
-- Execute este script ANTES de aplicar o schema_empresa.sql
-- ============================================================================

-- 1. Remover trigger e função de signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_family_on_signup();

-- 2. Remover tabelas antigas (CASCADE remove automaticamente as policies e FKs)
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- 3. Limpar coluna family_id da tabela bills (se existir)
ALTER TABLE bills DROP COLUMN IF EXISTS family_id CASCADE;

-- Pronto! Agora você pode aplicar o schema_empresa.sql
