# 📷 Leitura de Boletos por Câmera

## ✨ Novo Recurso Implementado

O aplicativo agora possui **leitura automática de boletos** através da câmera do dispositivo, extraindo automaticamente todos os dados bancários.

## 🎯 Como Usar

### Opção 1: Escanear com Câmera 📱

1. Acesse **"Novo Boleto"**
2. Clique em **"📷 Escanear com Câmera"**
3. Permita o acesso à câmera quando solicitado
4. Posicione o código de barras do boleto na área indicada
5. Aguarde a leitura automática
6. Os dados serão preenchidos automaticamente! ✅

**Dicas para melhor leitura:**
- Mantenha o boleto bem iluminado
- Posicione o código horizontalmente
- Distância ideal: 15-20cm da câmera
- Evite reflexos e sombras

### Opção 2: Digitar Linha Digitável ⌨️

1. Acesse **"Novo Boleto"**
2. Clique em **"⌨️ Digitar Manualmente"**
3. Cole ou digite a linha digitável (47 dígitos)
4. Clique em **"🔍 Processar"**
5. Os dados serão extraídos automaticamente! ✅

## 📊 Dados Extraídos Automaticamente

Quando você escaneia ou digita um boleto, o sistema extrai:

- ✅ **Valor** - Valor total a pagar
- ✅ **Vencimento** - Data de vencimento
- ✅ **Banco** - Código e nome do banco
- ✅ **Fornecedor** - Nome do banco/beneficiário
- ✅ **Nosso Número** - Identificação do banco
- ✅ **Linha Digitável** - Código completo para consulta

## 🏦 Bancos Suportados

O parser reconhece os principais bancos brasileiros:
- Banco do Brasil (001)
- Santander (033)
- Caixa Econômica Federal (104)
- Bradesco (237)
- Itaú / Itaú Unibanco (341, 652)
- Banco Safra (422)
- Citibank (745)
- E mais 6 outros bancos

## 🔧 Campos Adicionais Opcionais

Você pode expandir **"Dados Bancários Adicionais"** para preencher:
- Beneficiário
- Agência
- Conta
- Número do documento
- Valor original (antes de multas/juros)
- Observações

## ⚠️ Importante - Atualização do Banco

**Para usar este recurso, você precisa atualizar o banco de dados:**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o script `supabase/add_boleto_fields.sql`
4. Verifique se os campos foram criados

Veja instruções completas em: [supabase/README.md](./supabase/README.md)

## 🛠️ Tecnologias Utilizadas

- **html5-qrcode** - Biblioteca para leitura de códigos de barras
- **Parser FEBRABAN** - Validação e extração de dados bancários
- **Módulo 10 e 11** - Validação de dígitos verificadores
- **Supabase** - Armazenamento dos dados expandidos

## 📱 Compatibilidade

- ✅ Navegadores modernos (Chrome, Safari, Firefox, Edge)
- ✅ Android (Chrome, Firefox)
- ✅ iOS (Safari, Chrome)
- ✅ Desktop com webcam

## 🎨 Fluxo de UX

```
[Novo Boleto]
      ↓
[Escolher: Câmera ou Manual]
      ↓
┌─────────────────┬──────────────────┐
│   📷 Câmera     │  ⌨️ Manual       │
├─────────────────┼──────────────────┤
│ Abre scanner    │ Mostra campo     │
│ Lê código       │ Digita/cola      │
│ Extrai dados    │ Clica processar  │
└─────────────────┴──────────────────┘
      ↓
[Formulário Preenchido]
      ↓
[Ajustar campos (opcional)]
      ↓
[💾 Salvar boleto]
```

## 🐛 Troubleshooting

**"Não foi possível acessar a câmera"**
→ Verifique as permissões do navegador para acesso à câmera

**"Linha digitável inválida"**
→ Verifique se o código tem 47 dígitos e está correto

**"Erro ao ler boleto"**
→ Tente melhorar a iluminação ou use a entrada manual

**Código não é reconhecido**
→ Alguns boletos antigos podem não seguir o padrão FEBRABAN

## 📈 Próximos Passos

Recursos planejados:
- [ ] Leitura de QR Code (Pix)
- [ ] OCR para ler texto do boleto
- [ ] Histórico de boletos lidos
- [ ] Notificações de vencimento
- [ ] Integração com bancos (consulta automática)

---

**Desenvolvido para Sena Vip** 🎯
