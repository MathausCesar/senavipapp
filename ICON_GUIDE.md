# 🎨 Guia de Ícones e Customização PWA

## Ícones Necessários

O app precisa de dois ícones PNG (quadrados) na pasta `public/`:

1. **icon-192x192.png** (192 x 192 pixels)
2. **icon-512x512.png** (512 x 512 pixels)

Ambos devem ser a mesma imagem em tamanhos diferentes.

## Opções para Criar Ícones

### Opção 1: Usar Ferramenta Online (Mais Fácil)
1. Vá em https://www.favicon-generator.org/
2. Faça upload de uma imagem (ex: emoji 💰 salvo como PNG)
3. Download dos ícones
4. Salvar em `public/`

### Opção 2: Usar Logo/Imagem Existente
1. Ter uma imagem quadrada
2. Redimensionar para 192x192 (online: https://imageresizer.com/)
3. Copiar para `public/icon-192x192.png`
4. Redimensionar original para 512x512
5. Salvar como `public/icon-512x512.png`

### Opção 3: Criar Ícone Simples no Canva (Grátis)
1. https://www.canva.com/create/favicon/
2. Usar template ou desenhar algo
3. Download em PNG
4. Redimensionar e salvar

## Ícone Recomendado para Este App

Um ícone simples que funciona bem:
- **Fundo**: Azul (#2563eb) ou Verde (#10b981)
- **Símbolo**: Emoji 💰, 📋, ou 💳
- **Texto**: Opcional (pode ficar pequeno demais)

## Testando PWA

Após adicionar ícones:

1. **Desktop**: F12 > Application > Manifest > Verifica `icons`
2. **Mobile**: Desinstalar app anterior, reinstalar
3. **Verificar**: Ícone deve aparecer na home screen

## Adicionar Badge/Notificação Futura

Para mostrar contador de boletos atrasados (feature futura):

```javascript
// Em SW (public/sw.js) - adicionar depois:
if (self.registration.scope === "/") {
  self.registration.update();
}

// Mostrar notificação:
self.registration.showNotification('Boleto atrasado!', {
  badge: '/icon-192x192.png',
  icon: '/icon-192x192.png',
  body: 'Você tem 1 boleto vencido'
});
```

## Cores Recomendadas

- **Primária**: #2563eb (Azul)
- **Sucesso**: #10b981 (Verde)
- **Alerta**: #f59e0b (Laranja)
- **Perigo**: #ef4444 (Vermelho)

Alterar em `public/manifest.json`:
```json
"theme_color": "#2563eb"
```

## Teste Completo de PWA

```bash
# 1. Build
npm run build

# 2. Servir build local
npx serve@latest -s out -l 3000

# 3. Lighthouse (F12 > Lighthouse > PWA)
# Deve ter score 80+

# 4. Mobile: tela inicial
# Deve instalar corretamente
```

## Próximas Features com Ícones

- 📸 Upload de anexos
- 🔔 Notificações push
- 📊 Gráficos de gastos
- 🤝 Convite de membros
- 🔍 Busca de boletos

---

**Dica**: Se usar emoji como ícone, converter para PNG:
1. Google Images > emoji 💰
2. Screenshot ou salvar imagem
3. Colocar em background branco
4. Redimensionar para 192x192 e 512x512
