# Site EvaCloudd

Site institucional da **EvaCloudd**, otimizado para tráfego pago (CTAs claros, formulários de lead, prova social e pronto para rastreamento). Feito em **HTML, CSS e JavaScript puros** (sem framework/build) — cada página em seu próprio arquivo.

---

## Como rodar

Não precisa de build. Basta abrir o `index.html` no navegador.

Para testar exatamente como em produção (fontes, imagens e caminhos relativos), rode um servidor local a partir da pasta do projeto:

```bash
# Python
python -m http.server 8000

# ou Node
npx serve
```

E acesse `http://localhost:8000`.

Para publicar, envie **todo o conteúdo da pasta** para a hospedagem (o `index.html` deve ficar na raiz).

---

## Estrutura

```
Site eva/
├── index.html                 # Página inicial
├── clouddchat.html            # Produto: ClouddChat (WhatsApp + CRM + IA)
├── clouddvoz.html             # Produto: ClouddVoz (telefonia / PABX)
├── integracoes.html           # Serviço: Integrações
├── sobre.html                 # Sobre nós
├── contato.html               # Contato
├── lp-clouddchat.html         # Landing page de campanha (noindex)
├── obrigado.html              # Página de agradecimento (pós-formulário)
├── politicadeprivacidade.html # Política de Privacidade (LGPD)
├── 404.html                   # Página de erro
├── robots.txt / sitemap.xml   # SEO
└── assets/
    ├── css/style.css          # Design system + estilos (temas claro/escuro)
    ├── js/main.js             # JS global (nav, tema, formulário, cookies, rastreamento)
    ├── fonts/                 # Fonte Inter (self-hosted, .woff2)
    └── img/                   # Imagens (.webp) + favicon.svg
        └── empresas/          # Logos dos clientes (carrossel da home)
```

> `clouddpages.html` existe mas está oculto do menu. As pastas `img/` (originais) e `_backup-site-claro/` são apenas material de trabalho/backup e não precisam ir para produção.

---

## Configuração (IMPORTANTE)

Antes de colocar no ar, edite o objeto `CONFIG` no topo de [assets/js/main.js](assets/js/main.js):

| Campo | O que é |
|-------|---------|
| `whatsapp` | Número do WhatsApp em formato internacional, sem `+` (ex.: `5516999999999`). **Troque pelo celular/WhatsApp real** — hoje está o telefone fixo. |
| `gtmId` | ID do Google Tag Manager (ex.: `GTM-XXXXXXX`). Vazio = desativado. |
| `metaPixelId` | ID do Meta Pixel (Facebook/Instagram Ads). |
| `googleAdsId` | Tag base do Google Ads (ex.: `AW-1234567890`). |
| `adsConversion` | Rótulo de conversão de lead do Google Ads. |
| `leadEndpoint` | URL de um formulário [Formspree](https://formspree.io) ou endpoint próprio, para receber os leads por e-mail além do WhatsApp. Vazio = envia só pelo WhatsApp. |

As tags de rastreamento (GTM, Meta Pixel, Google Ads) só carregam **após o usuário aceitar os cookies**, em conformidade com a LGPD.

---

## Logos de clientes (carrossel da home)

Os logos ficam em `assets/img/empresas/` no formato **WebP** e aparecem em cinza (ganham cor no hover), com rolagem automática.

Para **adicionar ou remover** uma empresa:

1. Coloque o logo (PNG/JPG) na pasta de origem `img/empresas/`.
2. Converta para WebP em `assets/img/empresas/`.
3. Adicione o `<div class="logo-item">…</div>` na seção `.logos-track` do [index.html](index.html) (a lista é duplicada uma vez para o loop ser contínuo — mantenha as duas cópias).

---

## Temas

O site abre no **modo claro** por padrão; o visitante pode alternar para o **modo escuro** pelo botão da barra de navegação. A preferência fica salva no navegador.

---

## Dados da empresa

**EVA CLOUDD LTDA** — CNPJ 53.778.298/0001-21
Av. Dr. Ismael Alonso Y Alonso, 2766 — São José, Franca/SP — CEP 14403-430
Telefone: (16) 3706-4700 · Seg a Sex, 8h às 17h30
[Instagram](https://www.instagram.com/evacloudd/) · [LinkedIn](https://www.linkedin.com/company/evacloudd/)
