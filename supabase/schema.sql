-- ============================================================================
-- Supabase Schema: Boletos (Bills) PWA
-- ============================================================================
-- Este arquivo contém todas as tabelas, índices e políticas RLS
-- para o aplicativo de controle de boletos.
--
-- INSTRUÇÕES DE APLICAÇÃO:
-- 1. Acesse o painel Supabase: https://app.supabase.com
-- 2. Vá em "SQL Editor" (ou "SQL" no menu lateral)
-- 3. Cole TODO o conteúdo deste arquivo
-- 4. Clique em "Run" (ou Ctrl+Enter)
-- 5. Verifique que não há erros (tudo deve ser green checkmarks)
-- 6. Vá em "Auth" > "Policies" para confirmar as RLS foram criadas
-- ============================================================================

-- Criar tabela families
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela family_members
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Criar tabela bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

-- ============================================================================
-- ÍNDICES (para performance)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_family_id ON bills(family_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- ENABLE RLS em todas as tabelas
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABELA: families
-- ============================================================================
-- Proprietário pode ver e editar sua própria família
DROP POLICY IF EXISTS "families_owner_select" ON families;
CREATE POLICY "families_owner_select"
  ON families FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "families_owner_update" ON families;
CREATE POLICY "families_owner_update"
  ON families FOR UPDATE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "families_owner_delete" ON families;
CREATE POLICY "families_owner_delete"
  ON families FOR DELETE
  USING (owner_id = auth.uid());

-- Usuários podem criar famílias
DROP POLICY IF EXISTS "families_insert" ON families;
CREATE POLICY "families_insert"
  ON families FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    OR current_user = 'postgres'
  );

-- Membros da família podem VER a família
DROP POLICY IF EXISTS "families_member_select" ON families;
CREATE POLICY "families_member_select"
  ON families FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABELA: family_members
-- ============================================================================
-- Membros podem ver lista de membros da sua família
DROP POLICY IF EXISTS "family_members_select" ON family_members;
CREATE POLICY "family_members_select"
  ON family_members FOR SELECT
  USING (user_id = auth.uid());

-- Proprietário pode adicionar/remover membros
DROP POLICY IF EXISTS "family_members_insert" ON family_members;
CREATE POLICY "family_members_insert"
  ON family_members FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT families.id FROM families
      WHERE families.owner_id = auth.uid()
    )
    OR current_user = 'postgres'
  );

DROP POLICY IF EXISTS "family_members_delete" ON family_members;
CREATE POLICY "family_members_delete"
  ON family_members FOR DELETE
  USING (
    family_id IN (
      SELECT families.id FROM families
      WHERE families.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TABELA: bills
-- ============================================================================
-- Usuários podem ver boletos da sua família
DROP POLICY IF EXISTS "bills_select" ON bills;
CREATE POLICY "bills_select"
  ON bills FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem criar boletos na sua família
DROP POLICY IF EXISTS "bills_insert" ON bills;
CREATE POLICY "bills_insert"
  ON bills FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem editar boletos da sua família
DROP POLICY IF EXISTS "bills_update" ON bills;
CREATE POLICY "bills_update"
  ON bills FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem deletar boletos da sua família
DROP POLICY IF EXISTS "bills_delete" ON bills;
CREATE POLICY "bills_delete"
  ON bills FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STORAGE POLICIES (para anexos de boletos)
-- ============================================================================
-- Criar bucket 'attachments' se não existir (via UI do Supabase)
-- Depois, aplicar esta policy via SQL Editor:

DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
CREATE POLICY "attachments_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT CAST(bills.family_id AS TEXT) FROM bills
      WHERE bills.family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
CREATE POLICY "attachments_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT CAST(bills.family_id AS TEXT) FROM bills
      WHERE bills.family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "attachments_delete" ON storage.objects;
CREATE POLICY "attachments_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT CAST(bills.family_id AS TEXT) FROM bills
      WHERE bills.family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- FUNÇÃO: Criar família automaticamente ao fazer signup
-- ============================================================================
CREATE OR REPLACE FUNCTION create_family_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO families (owner_id, name)
  VALUES (NEW.id, 'Minha Família');

  -- Adicionar o usuário como owner
  INSERT INTO family_members (family_id, user_id, role)
  SELECT id, NEW.id, 'owner' FROM families WHERE owner_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_family_on_signup();

-- ============================================================================
-- DICAS DE TESTE:
-- ============================================================================
-- 1. Criar um usuário via Sign Up no app Next.js
-- 2. A família será criada automaticamente (verifique em "families")
-- 3. O usuário aparecerá em "family_members" com role 'owner'
-- 4. Criar um boleto deve funcionar (check em "bills")
-- 5. Outro usuário convidado deve ver os mesmos boletos
-- ============================================================================
