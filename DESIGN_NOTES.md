# Notas de design — "Pressing"

Redesenho do front (React + Vite + Tailwind v4). Direção escolhida pelo cliente:
**Pressing (capa modernista)** — app inteiro.

## Conceito
Dois primitivos, tirados de como se convive com uma coleção:
- **Capa (sleeve):** quadrado, arte em primeiro plano, moldura mínima, cantos retos
  (3px), UMA sombra real (disco encostado na estante). Nada de borda em tudo.
- **Lombada (spine):** linhas finas — artista (grotesca condensada) / título /
  nº de catálogo (mono). É como se lê uma estante de perfil.

## Tokens

### Cor — neutros quentes (papel + cera), não zinc
Luz:  bg #ebe8df · surface #fcfbf9 · surface-2 #e4e0d4 · border #dcd7c9 ·
      border-strong #c3bca7 · ink #1c180f · muted #6a6350 · faint #948b74
Escuro: bg #15120d · surface #1d1913 · surface-2 #2a241b · border #322b20 ·
      border-strong #483f2e · ink #f3eee1 · muted #a79b82 · faint #766b54

Accent = "tinta única". 8 opções mantidas (o cliente construiu o seletor).
Retunadas para papel quente; default novo = azul (Blue Note). Texto sobre accent
= #fbfaf7, exceto amber (usa ink).

### Tipo — 2 famílias + 1 face de dados
- Display: **Archivo** (variável wdth+wght). Títulos, números grandes, wordmark.
  Condensada (font-stretch ~82%) = etiqueta de lombada.
- Corpo/UI: **Public Sans**.
- Identificadores (catálogo/matriz/código de barras): **IBM Plex Mono**, escopo
  mínimo — só alfanuméricos que são de fato "carimbados".

Escala: base 16. Título de página 1.75rem Archivo 700 / -0.02em. Hero ~2.5rem.
Cabeçalho de seção: Archivo 600, 0.8125rem, tracking 0.04em, SEM caixa alta,
SEM cor de accent — filete de 1px depois do rótulo.

### Layout
- Mobile: header simples + tab bar inferior (5) — mantido.
- Desktop (lg+): trilho vertical à esquerda (64px) com wordmark girada tipo
  lombada + ícones + config embaixo. Conteúdo com pl-16.
- Alinhamento: tudo à esquerda (é um catálogo).
- Home: abre direto na "estante" (grade de capas). Título + contagem em uma linha
  (número grande inline, não é o hero de stat gigante). Faixa "ouvido por último".

### Movimento
- UMA sequência no load da Home: grade de capas com fade-stagger sutil (cap 24).
- Sem scale/lift em hover de card. Hover = filete de accent (spine tick / underline).
- prefers-reduced-motion respeitado (kill global).

## Revisão contra o brief (tells evitados)
- Cream #F4F1EA + serif + terracota (#D97757): neutros são papel de baixa croma
  (não amarelo), SEM serifa, accent default azul.
- Near-black + vermilion/acid único: neutros são papel, accent é trocável, usado
  em blocos/arestas (não tint em tudo).
- SaaS-card kit: sem raio único, sem borda+sombra cinza em toda caixa. Capas sem
  borda; painéis com filete; hierarquia de raio (3px capa / 6px painel).
- Chrome de template: rótulos em CAIXA ALTA removidos; ` • ` reduzido a 1 uso
  (linha de specs do disco); sem "01/02/03"; sem "→" no texto de link.
- Mono só para identificadores reais, nunca para rótulos de UI.

## Utilitários CSS novos (index.css)
.u-condensed .u-ident .u-sleeve .u-credit(.k/.fill/.v) .u-sec .u-spine
.u-reveal (+ --i) .u-field .u-btn/.u-btn-primary/.u-btn-ghost

## Feito (1ª passada — app inteiro)
- index.html: fontes (Archivo + Public Sans + IBM Plex Mono), theme-color, favicon.
- src/index.css: sistema completo (tokens quentes, @layer components u-field/u-btn/u-sec,
  utilitários u-sleeve/u-credit/u-condensed/u-ident/u-spine/u-reveal, reduced-motion).
- ThemeContext: accents retunados; theme-color novo.
- components/SectionHeading.jsx (novo) — usado em detalhe, forms, dashboards, Mais, Config.
- Layout: trilho vertical no desktop (lg+) com wordmark girada; header + tab bar no mobile.
- DiscoCard = capa (u-sleeve, cantos 3px, sem borda); DiscoListItem = lombada (u-spine,
  artista condensada em caixa alta, nº de catálogo em mono).
- DiscoDetalhe: título grande, linha de specs (único uso de ' · '), seções em
  leader-dot (u-credit), ficha técnica como créditos de álbum.
- Gráficos: sem card; filete de topo (border-t-2), valores em mono, barras retas.
- DashboardTile: filete de topo + número grande em Archivo. DashboardTabs: sublinhado.
- Login: painel-capa (bloco de accent) + tipografia grande + motivo de sulcos.
- Forms/Cadastro/Wishlist/Audições/Mais/Config: u-field, u-btn, SectionHeading, spine rows.

## Verificado (screenshots headless, mock de API)
Login (claro/escuro/mobile), Home (grade/lombada/mobile), Detalhe, Audições,
Dashboards (coleção/financeiro), Form, Mais, Config, nav mobile. Build + lint OK.

## Aberto p/ próxima passada
- Faixa "Ouvido por último" na Home ainda um pouco esparsa.
- Grade de stat tiles do dashboard: 7 itens em 3 colunas deixa a última linha solta.
- Ícone placeholder de capa com pouco contraste (só aparece sem url_capa).

## Tentado e descartado
- Caixa alta em labels/eyebrows (tell). Mantida só em: wordmark e lombada (vernáculo real).
- Mono em rótulos de UI (tell). Mantido só em identificadores (catálogo/matriz/código).
