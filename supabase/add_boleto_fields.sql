-- ============================================================================
-- Adicionar campos para leitura completa de boletos bancários
-- ============================================================================

-- Adicionar novos campos à tabela bills
ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS linha_digitavel TEXT,
  ADD COLUMN IF NOT EXISTS codigo_barras TEXT,
  ADD COLUMN IF NOT EXISTS beneficiario TEXT,
  ADD COLUMN IF NOT EXISTS banco TEXT,
  ADD COLUMN IF NOT EXISTS agencia TEXT,
  ADD COLUMN IF NOT EXISTS conta TEXT,
  ADD COLUMN IF NOT EXISTS nosso_numero TEXT,
  ADD COLUMN IF NOT EXISTS documento TEXT,
  ADD COLUMN IF NOT EXISTS valor_original DECIMAL(10,2);

-- Criar índice para busca por linha digitável
CREATE INDEX IF NOT EXISTS idx_bills_linha_digitavel ON bills(linha_digitavel);

-- Comentários para documentação
COMMENT ON COLUMN bills.linha_digitavel IS 'Linha digitável do boleto (47 dígitos)';
COMMENT ON COLUMN bills.codigo_barras IS 'Código de barras do boleto (44 dígitos)';
COMMENT ON COLUMN bills.beneficiario IS 'Nome do beneficiário/cedente';
COMMENT ON COLUMN bills.banco IS 'Código e nome do banco';
COMMENT ON COLUMN bills.agencia IS 'Agência bancária';
COMMENT ON COLUMN bills.conta IS 'Conta bancária';
COMMENT ON COLUMN bills.nosso_numero IS 'Nosso número do banco';
COMMENT ON COLUMN bills.documento IS 'Número do documento/fatura';
COMMENT ON COLUMN bills.valor_original IS 'Valor original do boleto (antes de juros/multas)';
