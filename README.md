# Gustavo — Portfólio de Edição VSL

Site estático (HTML + CSS + JS puro, sem build) do portfólio de edição de VSL.

## Estrutura

```
index.html              página única
styles/main.css         layout, tipografia e tokens de cor (:root)
styles/components.css   menu lateral (staggered menu) e headline TrueFocus
scripts/site.js         menu, TrueFocus, lazy-load dos vídeos em loop e dos players VTurb
fonts/                  Geist (variável) e Playfair Display italic, em woff2
media/                  vídeos em loop (.mp4) e posters (.jpg)
hero-background-*.webp  arte do hero (desktop e mobile)
og.jpg, favicon.svg     social share e ícone
```

GSAP vem de CDN (`cdnjs`) e é usado só na animação do menu.
Todos os caminhos são relativos, então o site funciona em qualquer host:
Vercel, Netlify, GitHub Pages (inclusive em subpasta) ou aberto direto do disco.

## Rodar local

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

## Paleta

Os tokens de cor ficam no `:root` de `styles/main.css`. Trocar a cor de destaque
do site inteiro é trocar três valores:

| Token            | Valor     | Onde aparece                                          |
| ---------------- | --------- | ----------------------------------------------------- |
| `--accent`       | `#4fd0ff` | destaque claro: botões, tags, box-shadow, títulos no escuro |
| `--accent-deep`  | `#1554c4` | destaque escuro: eyebrows, ênfase em títulos no claro |
| `--accent-dark`  | `#0a3b8f` | variação mais fechada do destaque                     |
| `--red`          | `#ff3b2f` | numeração do menu e sombra do botão                   |
| `--blue`         | `#2559ff` | uma das tags de `proof-tags`                          |

As artes `hero-background-desktop.webp`, `hero-background-mobile.webp` e `og.jpg`
têm a cor de destaque embutida no pixel — foram convertidas para azul por
deslocamento de matiz, não por CSS. Se a paleta mudar de novo, essas três
imagens precisam ser regeradas.

## Notas

- **Mídia é autorizada.** Vídeos, posters e embeds VTurb são trabalhos do Gustavo
  e do Jean Pontes, usados com autorização.
- **Players VTurb** são servidos pela conta `078ca594-…`
  (`scripts/site.js` → `VTURB_ACCOUNT`, mais os `data-player-id` no `index.html`).
  Se um player for removido ou renomeado lá, a VSL correspondente para de carregar aqui.
- **Textos, cases e números** vieram da referência de layout — revisar antes de divulgar.
- **WhatsApp**: conferir se o link `wa.me` no `index.html` aponta para o número certo.
