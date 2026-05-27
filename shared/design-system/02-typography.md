# NzolaNet — Typography
**Módulo:** 02  
**Depende de:** 01-colors (para text tokens)

---

## 1. Filosofia

A tipografia é o elemento mais crítico de uma rede social. O utilizador passa horas a ler — posts, comentários, perfis, notificações. Uma tipografia errada causa fadiga em minutos; uma tipografia certa desaparece de tão confortável que é.

**Três princípios tipográficos inegociáveis:**

1. **Legibilidade máxima** — A fonte de corpo deve ser otimizada para leitura de texto curto em sequência (feed), não para leitura longa contínua.
2. **Hierarquia clara** — O utilizador deve saber instantaneamente o que é título, o que é corpo e o que é meta-dado.
3. **Consistência de escala** — Cada tamanho de texto tem um propósito único. Não inventar tamanhos fora da escala.

---

## 2. Escolha de Fontes

### 2.1 Fonte Principal — Plus Jakarta Sans

```css
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Helvetica, Arial, sans-serif;
```

**Porquê Plus Jakarta Sans?**

- **Geométrica humanista** — combina precisão geométrica (moderna, tech) com traços humanistas (legível, quente). O equilíbrio certo para uma rede social.
- **Excelente legibilidade em pequenos tamanhos** — o `x-height` alto (0.75) garante leitura confortável em 13–14px, crítico para meta-dados de post.
- **Pesos disponíveis** — 300, 400, 500, 600, 700, 800 cobrem toda a hierarquia.
- **Optimizada para ecrã** — Hinting cuidadoso, funciona bem em todos os sistemas operativos.
- **Diferenciação** — Não é Inter (over-used), não é Roboto (corporativo). Tem carácter sem ser extravagante.
- **Google Fonts** — Carregamento fiável, subsetting fácil, suporte Unicode completo.
- **Comportamento mobile** — Mantém legibilidade até 12px em alta densidade de pixel. Em baixa densidade, os pesos 400/500 performam melhor que 300.

### 2.2 Fonte Mono — JetBrains Mono

```css
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code',
             ui-monospace, SFMono-Regular, Menlo, monospace;
```

Usada exclusivamente em:
- Snippets de código em publicações
- Timestamps de formato técnico
- IDs internos (admin panel)

### 2.3 Carregamento — Google Fonts

```html
<!-- No <head> do index.html — preconnect primeiro -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

> **Optimização:** Usar `display=swap` para evitar FOIT (Flash of Invisible Text). O subsetting pelo Google Fonts reduz o peso para os caracteres latinos necessários.

---

## 3. Escala Tipográfica

Base: **16px** (1rem = 16px). Escala modular de razão ~1.25 (Major Third).

### 3.1 Definição dos Tokens

```scss
// ── Tamanhos ──────────────────────────────────────────────
$text-xs:   0.75rem;   // 12px — timestamps, badges, labels tiny
$text-sm:   0.875rem;  // 14px — meta-dados, comentários, labels
$text-base: 1rem;      // 16px — corpo principal do post, parágrafo
$text-lg:   1.125rem;  // 18px — subtítulos, cabeçalhos de secção
$text-xl:   1.25rem;   // 20px — títulos de página
$text-2xl:  1.5rem;    // 24px — hero headings, nome em perfil grande
$text-3xl:  1.875rem;  // 30px — display (usado raramente)
$text-4xl:  2.25rem;   // 36px — marketing / páginas de auth

// ── Pesos ─────────────────────────────────────────────────
$weight-light:    300;  // Nunca usar em texto < 16px
$weight-regular:  400;  // Corpo de texto, descrições
$weight-medium:   500;  // Labels activos, usernames em destaque
$weight-semibold: 600;  // Títulos de secção, subtítulos, botões
$weight-bold:     700;  // Headings principais, display names
$weight-extrabold:800;  // Display, hero (uso muito restrito)

// ── Line Heights ──────────────────────────────────────────
$leading-none:    1;      // Elementos de UI single-line (botões)
$leading-tight:   1.25;   // Headings curtos
$leading-snug:    1.375;  // Subtítulos, texto de UI
$leading-normal:  1.5;    // Corpo de texto (padrão)
$leading-relaxed: 1.625;  // Comentários longos, bio
$leading-loose:   1.75;   // Texto educacional / leitura longa (raro na UI)

// ── Letter Spacing ────────────────────────────────────────
$tracking-tight:  -0.02em;  // Headings grandes (≥ text-2xl)
$tracking-snug:   -0.01em;  // Headings médios
$tracking-normal: 0em;      // Corpo de texto
$tracking-wide:   0.02em;   // Labels uppercase, badges
$tracking-wider:  0.05em;   // Texto muito pequeno uppercase (status labels)

// ── Largura de leitura ────────────────────────────────────
$reading-width:      65ch;  // Máximo para corpo de post
$reading-width-wide: 75ch;  // Máximo para comentários
$reading-width-ui:   45ch;  // Máximo para tooltips, labels
```

---

## 4. Papéis Tipográficos

Cada papel tipográfico combina tamanho + peso + line-height + letter-spacing de forma pré-definida. Usar sempre os papéis, nunca combinações ad-hoc.

### 4.1 Display

```scss
// Usado em: páginas de autenticação, hero sections, 404
.type-display {
  font-size: $text-4xl;       // 36px
  font-weight: $weight-bold;  // 700
  line-height: $leading-tight; // 1.25
  letter-spacing: $tracking-tight; // -0.02em
}
```

### 4.2 Heading Large

```scss
// Usado em: nome do utilizador em página de perfil, títulos de modal
.type-heading-lg {
  font-size: $text-2xl;           // 24px
  font-weight: $weight-bold;      // 700
  line-height: $leading-tight;    // 1.25
  letter-spacing: $tracking-snug; // -0.01em
}
```

### 4.3 Heading Medium

```scss
// Usado em: títulos de secção no feed, "Para ti" / "A seguir"
.type-heading-md {
  font-size: $text-xl;              // 20px
  font-weight: $weight-semibold;    // 600
  line-height: $leading-snug;       // 1.375
  letter-spacing: $tracking-normal; // 0
}
```

### 4.4 Heading Small

```scss
// Usado em: cabeçalhos de card, nome do utilizador em posts
.type-heading-sm {
  font-size: $text-base;            // 16px
  font-weight: $weight-semibold;    // 600
  line-height: $leading-snug;       // 1.375
  letter-spacing: $tracking-normal;
}
```

### 4.5 Body (corpo do post)

```scss
// Usado em: texto principal das publicações
.type-body {
  font-size: $text-base;            // 16px
  font-weight: $weight-regular;     // 400
  line-height: $leading-normal;     // 1.5
  letter-spacing: $tracking-normal;
  max-width: $reading-width;        // 65ch
}
```

### 4.6 Body Small (comentários, bio)

```scss
// Usado em: texto de comentários, bio de perfil
.type-body-sm {
  font-size: $text-sm;              // 14px
  font-weight: $weight-regular;     // 400
  line-height: $leading-relaxed;    // 1.625
  letter-spacing: $tracking-normal;
  max-width: $reading-width-wide;   // 75ch
}
```

### 4.7 Label (UI elements)

```scss
// Usado em: botões, tabs, nav items, form labels
.type-label {
  font-size: $text-sm;              // 14px
  font-weight: $weight-medium;      // 500
  line-height: $leading-none;       // 1
  letter-spacing: $tracking-normal;
}
```

### 4.8 Label Small

```scss
// Usado em: badges, chips, status indicators, contadores de baze
.type-label-sm {
  font-size: $text-xs;              // 12px
  font-weight: $weight-medium;      // 500
  line-height: $leading-none;       // 1
  letter-spacing: $tracking-wide;   // 0.02em — necessário para legibilidade em 12px
}
```

### 4.9 Caption (meta-dados)

```scss
// Usado em: timestamps, "seguindo X pessoas", contadores secundários
.type-caption {
  font-size: $text-xs;              // 12px
  font-weight: $weight-regular;     // 400
  line-height: $leading-snug;       // 1.375
  letter-spacing: $tracking-normal;
  color: var(--text-secondary);     // Sempre secondary — nunca primary
}
```

### 4.10 Username / Handle

```scss
// Usado em: @username, display name em linha com texto
.type-username {
  font-size: inherit;               // Herda do contexto
  font-weight: $weight-semibold;    // 600
  line-height: inherit;
  color: var(--text-primary);
}

.type-handle {
  font-size: inherit;
  font-weight: $weight-regular;     // 400
  color: var(--text-secondary);
}
```

---

## 5. Uso em Componentes-Chave

### Post Card

```
Display Name     → type-heading-sm (16px/600)   → var(--text-primary)
@handle          → type-caption (12px/400)       → var(--text-secondary)
Timestamp        → type-caption (12px/400)       → var(--text-tertiary)
Corpo do post    → type-body (16px/400)           → var(--text-primary)
Contadores       → type-label-sm (12px/500)       → var(--text-secondary)
```

### Comentário

```
Display Name     → type-label (14px/500)         → var(--text-primary)
@handle          → type-caption (12px/400)       → var(--text-secondary)
Corpo            → type-body-sm (14px/400)        → var(--text-primary)
Timestamp        → type-caption (12px/400)       → var(--text-tertiary)
```

### Perfil

```
Nome             → type-heading-lg (24px/700)    → var(--text-primary)
@handle          → type-body-sm (14px/400)        → var(--text-secondary)
Bio              → type-body-sm (14px/400)        → var(--text-primary)
Stats (X posts)  → type-heading-sm (16px/600)    → var(--text-primary)
Label stats      → type-caption (12px/400)       → var(--text-secondary)
```

---

## 6. Regras de Tipografia em Português

Como a NzolaNet é uma plataforma em Português:
- Usar `lang="pt"` no `<html>` para hifenização correcta
- `hyphens: auto` apenas em biographies longas, nunca em headings
- Garantir suporte a caracteres: ã, â, á, à, é, ê, í, ó, ô, õ, ú, ç

---

## 7. CSS Custom Properties — Typography

```css
:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
               'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace,
               SFMono-Regular, Menlo, monospace;

  /* Sizes */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;

  /* Weights */
  --weight-light:     300;
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
  --weight-extrabold: 800;

  /* Line heights */
  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-snug:   -0.01em;
  --tracking-normal: 0em;
  --tracking-wide:   0.02em;
  --tracking-wider:  0.05em;
}
```

---

## 8. Responsividade Tipográfica

As fontes **não escalam automaticamente** entre breakpoints — apenas os elementos de display e heading large ajustam.

```scss
// Escala fluida para display (usado só em páginas de auth)
.type-display {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
}

// Heading Large — reduz 1 step em mobile
.type-heading-lg {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

// Todos os outros — SEM escala responsiva
// Corpo a 16px em mobile é intencional — menor causa falhas de acessibilidade
```

> **Regra:** Nunca usar `font-size` menor que **14px** em mobile. Nunca menor que **12px** em qualquer contexto.

---

## 9. Anti-padrões

```scss
// ❌ Nunca misturar pesos sem propósito hierárquico
.post-text {
  font-weight: 800; // ❌ Peso excessivo para corpo de texto
}

// ❌ Nunca usar letter-spacing negativo em texto pequeno
.timestamp {
  font-size: 12px;
  letter-spacing: -0.02em; // ❌ Ilegível em tamanhos pequenos
}

// ❌ Nunca criar tamanhos fora da escala
.random-element {
  font-size: 15px; // ❌ Usar 14px ou 16px
  font-size: 17px; // ❌ Usar 16px ou 18px
}

// ❌ Nunca usar text-tertiary para texto de acção
.action-button {
  color: var(--text-tertiary); // ❌ Não passa no contraste para elementos interactivos
}

// ✅ Correcto
.action-button {
  color: var(--text-secondary); // mínimo para elementos interactivos
}
```
