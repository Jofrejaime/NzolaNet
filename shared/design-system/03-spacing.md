# NzolaNet — Spacing
**Módulo:** 03  
**Depende de:** nenhum (base do sistema)

---

## 1. Filosofia

O espaçamento é o ritmo visual da interface. Numa rede social, o spacing equilibra duas forças opostas:

- **Densidade:** o utilizador precisa de ver muito conteúdo rapidamente (feed, comentários)
- **Respiração:** o conteúdo precisa de espaço para ser lido com conforto

A NzolaNet usa um **sistema de 4pt** (não 8pt). A base de 4 permite granularidade suficiente para componentes compactos (badges, timestamps) sem quebrar a grade para componentes maiores. Todos os valores são múltiplos de 4.

**Regra de ouro:** Se não existe um token para o valor que precisas, não uses esse valor. Escolhe o token mais próximo e ajusta o componente.

---

## 2. Escala de Espaçamento

```scss
// ── Spacing Scale ─────────────────────────────────────────────
//    Token       px    rem       Uso típico
$space-0:    0px;   // 0     —    Reset / baseline
$space-1:    4px;   // 0.25  —    Ícone + label gap, micro-ajustes
$space-2:    8px;   // 0.5   —    Gap entre ícone e texto em linha, inner padding de badge
$space-3:    12px;  // 0.75  —    Padding vertical de botões small, gap em grupos de ícones
$space-4:    16px;  // 1     —    Padding horizontal standard, gap entre elementos de linha
$space-5:    20px;  // 1.25  —    Padding vertical de botões md, gap entre campos de form
$space-6:    24px;  // 1.5   —    Padding de card, gap entre posts no feed
$space-8:    32px;  // 2     —    Secções dentro de card, padding de modal
$space-10:   40px;  // 2.5   —    Gap entre secções de perfil, header height
$space-12:   48px;  // 3     —    Padding de página, gap entre blocos grandes
$space-16:   64px;  // 4     —    Hero sections, espaçamento de auth page
$space-20:   80px;  // 5     —    Padding de página em desktop
$space-24:   96px;  // 6     —    Espaços maiores, raramente usados na UI social
```

**CSS Custom Properties:**

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

---

## 3. Tokens de Componente

Componentes específicos têm os seus próprios tokens semânticos que referenciam a escala base.

```css
:root {
  /* Post / Feed */
  --post-padding-x:     var(--space-4);   /* 16px — padding lateral de post */
  --post-padding-y:     var(--space-5);   /* 20px — padding vertical de post */
  --post-gap:           var(--space-2);   /* 8px  — gap entre avatar e conteúdo */
  --post-separator:     1px;              /* Espessura do divider entre posts */
  --post-avatar-size:   40px;             /* Tamanho do avatar no feed */
  --post-avatar-offset: 56px;             /* Largura da coluna do avatar (avatar + gap) */

  /* Comments */
  --comment-padding-x:  var(--space-4);
  --comment-padding-y:  var(--space-3);   /* 12px — mais compacto que post */
  --comment-gap:        var(--space-2);
  --comment-avatar-size: 32px;
  --comment-indent:     var(--space-6);   /* Indentação visual de thread */

  /* Card */
  --card-padding:       var(--space-5);   /* 20px — padding interno de cards genéricos */
  --card-radius:        12px;
  --card-gap:           var(--space-4);

  /* Navbar */
  --navbar-height-mobile:  56px;
  --navbar-height-desktop: 64px;
  --navbar-padding-x:      var(--space-4);

  /* Sidebar */
  --sidebar-width:         280px;
  --sidebar-collapsed:     72px;
  --sidebar-padding-x:     var(--space-4);
  --sidebar-padding-y:     var(--space-3);

  /* Form */
  --input-height-sm: 36px;
  --input-height-md: 44px;
  --input-height-lg: 52px;
  --input-padding-x: var(--space-4);
  --input-padding-y: var(--space-3);
  --form-gap:        var(--space-5);      /* Gap entre campos de formulário */
  --form-label-gap:  var(--space-2);      /* Gap entre label e input */

  /* Button */
  --btn-padding-x-sm: var(--space-3);    /* 12px */
  --btn-padding-y-sm: var(--space-2);    /* 8px */
  --btn-padding-x-md: var(--space-4);    /* 16px */
  --btn-padding-y-md: var(--space-3);    /* 12px */
  --btn-padding-x-lg: var(--space-5);    /* 20px */
  --btn-padding-y-lg: var(--space-4);    /* 16px */
  --btn-icon-gap:     var(--space-2);    /* 8px — gap entre ícone e label */

  /* Modal */
  --modal-padding:    var(--space-6);    /* 24px */
  --modal-gap:        var(--space-5);
  --modal-max-width-sm: 480px;
  --modal-max-width-md: 640px;

  /* Notification */
  --notif-padding-x:  var(--space-4);
  --notif-padding-y:  var(--space-3);
  --notif-gap:        var(--space-3);
  --notif-avatar:     36px;
}
```

---

## 4. Border Radius

Raios de borda consistentes. O sistema usa **três valores principais**.

```css
:root {
  --radius-sm:   6px;   /* Badges, chips, tooltips, inputs pequenos */
  --radius-md:   10px;  /* Botões, inputs standard, dropdowns */
  --radius-lg:   14px;  /* Cards, modais, post cards */
  --radius-xl:   20px;  /* Bottom sheets mobile, elementos grandes */
  --radius-full: 9999px; /* Avatares, pills, toggle buttons */
}
```

**Mapa de uso:**

| Componente | Radius |
|-----------|--------|
| Avatar | `--radius-full` |
| Botão | `--radius-md` |
| Badge / Chip | `--radius-full` |
| Input | `--radius-md` |
| Card / Post | `--radius-lg` |
| Dropdown / Menu | `--radius-md` |
| Modal | `--radius-lg` |
| Toast | `--radius-md` |
| Tooltip | `--radius-sm` |
| Bottom Sheet | `--radius-xl` (top only) |
| Media (imagens em posts) | `--radius-md` |

> **Regra:** Nunca usar `border-radius: 4px` — é visualmente inconsistente com o sistema. O mínimo é `--radius-sm` (6px).

---

## 5. Containers e Layout

### 5.1 Larguras de Container

```css
:root {
  --container-feed:      600px;  /* Largura do feed principal */
  --container-sidebar:   280px;  /* Sidebar direita (suggestions, trending) */
  --container-page:      1280px; /* Largura máxima da página */
  --container-auth:      400px;  /* Formulários de login/registo */
  --container-modal-sm:  480px;
  --container-modal-md:  640px;
}
```

### 5.2 Layout Principal — Grid

```
┌─────────────────────────────────────────────────┐
│                   NAVBAR (fixo)                  │ 64px
├──────────┬──────────────────────┬───────────────┤
│          │                      │               │
│ NAV      │   FEED PRINCIPAL     │   SIDEBAR     │
│ LATERAL  │   max-width: 600px   │   280px       │
│ 72px/    │                      │               │
│ 240px    │                      │               │
│          │                      │               │
└──────────┴──────────────────────┴───────────────┘
```

**Em desktop (≥1024px):**
- Nav lateral: 240px (expandida)
- Feed: flex-grow, max-width 600px
- Sidebar: 280px (sugestões de seguimento, trending)

**Em tablet (768px–1023px):**
- Nav lateral: 72px (só ícones, colapsada)
- Feed: flex-grow, max-width 600px
- Sidebar: oculta

**Em mobile (< 768px):**
- Nav lateral: oculta → Bottom navigation bar
- Feed: full-width, sem max-width
- Sidebar: oculta

### 5.3 Padding de Página

```scss
// Padding horizontal do conteúdo em relação à viewport
$page-padding-mobile:  var(--space-4);   // 16px
$page-padding-tablet:  var(--space-6);   // 24px
$page-padding-desktop: var(--space-8);   // 32px
```

---

## 6. Z-Index Scale

```css
:root {
  --z-base:       0;
  --z-raised:     10;    /* Cards com hover elevado */
  --z-dropdown:   100;   /* Menus dropdown */
  --z-sticky:     200;   /* Navbar sticky, headers de secção */
  --z-overlay:    300;   /* Backdrops de modal */
  --z-modal:      400;   /* Modais */
  --z-toast:      500;   /* Toasts / notifications */
  --z-tooltip:    600;   /* Tooltips (sempre no topo) */
}
```

---

## 7. Guia de Decisão de Espaçamento

Quando decidir quanto espaçamento usar, seguir este critério:

| Contexto | Token | Valor |
|---------|-------|-------|
| Ícone → texto (mesmo elemento) | `--space-2` | 8px |
| Elementos irmãos dentro de um componente | `--space-3` ou `--space-4` | 12–16px |
| Padding interno de componente compacto | `--space-3` | 12px |
| Padding interno de componente standard | `--space-4` → `--space-5` | 16–20px |
| Gap entre componentes no feed | `--space-6` | 24px (via separator) |
| Gap entre secções de página | `--space-8` → `--space-12` | 32–48px |
| Padding de página (mobile) | `--space-4` | 16px |

---

## 8. Densidade Visual do Feed

O feed usa **separadores em vez de espaçamento** para separar posts. Isto mantém o conteúdo denso (mais posts visíveis) sem sacrificar legibilidade.

```scss
// Post separator — preferir a gap
.feed-item + .feed-item {
  border-top: 1px solid var(--border-subtle);
  // NÃO usar margin-top — o separator já cria a separação visual
}

// Dentro de um post — usar padding, não margin
.post-card {
  padding: var(--post-padding-y) var(--post-padding-x);
  // 20px top/bottom, 16px left/right
}
```

---

## 9. Anti-padrões

```scss
// ❌ Valores fora da escala
margin-top: 10px;  // ❌ → usar var(--space-3) = 12px
padding: 15px;     // ❌ → usar var(--space-4) = 16px
gap: 6px;          // ❌ → usar var(--space-2) = 8px

// ❌ Padding assimétrico sem razão
padding: 16px 20px 12px 16px; // ❌ — usar valores iguais ou pares simétricos

// ❌ Usar margin para criar separação no feed
.post + .post {
  margin-top: 24px; // ❌ — usar border-top: 1px solid var(--border-subtle)
}

// ❌ Border radius inconsistente
border-radius: 8px;  // ❌ — usar var(--radius-md) = 10px
border-radius: 16px; // ❌ — usar var(--radius-lg) = 14px ou var(--radius-xl) = 20px

// ✅ Correcto
.post-card {
  padding: var(--post-padding-y) var(--post-padding-x);
  border-radius: var(--radius-lg);
}
```
