-- ============================================================================
-- Supabase Schema: Sena Vip (Empresa) - Boletos
-- ============================================================================
-- Este arquivo define as tabelas e políticas para o contexto empresarial.
-- Não há mais "família". Todos os boletos pertencem à empresa Sena Vip.
-- Usuários são funcionários autenticados pelo Supabase Auth.
-- ============================================================================

-- Tabela de funcionários (usuários do Supabase Auth)
-- Não precisa criar tabela extra, pois usamos auth.users

-- Tabela principal de boletos
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('open', 'paid')) DEFAULT 'open',
  notes TEXT,
  attachment_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_created_by ON bills(created_by);

-- Row Level Security (RLS)
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Políticas: todo funcionário autenticado pode ver, criar, editar e deletar boletos
DROP POLICY IF EXISTS "bills_select" ON bills;
CREATE POLICY "bills_select"
  ON bills FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bills_insert" ON bills;
CREATE POLICY "bills_insert"
  ON bills FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "bills_update" ON bills;
CREATE POLICY "bills_update"
  ON bills FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bills_delete" ON bills;
CREATE POLICY "bills_delete"
  ON bills FOR DELETE
  USING (auth.role() = 'authenticated');

-- Storage policies para anexos (bucket 'attachments')
DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
CREATE POLICY "attachments_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
CREATE POLICY "attachments_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "attachments_delete" ON storage.objects;
CREATE POLICY "attachments_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');

-- ============================================================================
-- DICAS DE USO:
-- - Todos os boletos pertencem à empresa Sena Vip.
-- - Usuários são funcionários autenticados.
-- - Para controle de permissões avançado, adicione campo 'role' em auth.users (via metadata) ou crie tabela 'employees'.
-- ============================================================================
