# Instruções para Atualizar o Banco de Dados

## ⚠️ Importante

Execute o script `add_boleto_fields.sql` no seu banco de dados Supabase para adicionar os novos campos necessários para leitura de boletos por câmera.

## Como Executar

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `add_boleto_fields.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

## Novos Campos Adicionados

- `linha_digitavel` - Linha digitável do boleto (47 dígitos)
- `codigo_barras` - Código de barras do boleto (44 dígitos)
- `beneficiario` - Nome do beneficiário/cedente
- `banco` - Código e nome do banco
- `agencia` - Agência bancária
- `conta` - Conta bancária
- `nosso_numero` - Nosso número do banco
- `documento` - Número do documento/fatura
- `valor_original` - Valor original do boleto

## Verificação

Após executar o script, você pode verificar se os campos foram criados executando:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bills';
```
