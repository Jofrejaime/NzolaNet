# NzolaNet — Design Tokens
**Módulo:** 04  
**Depende de:** 01-colors, 02-typography, 03-spacing  
**Ficheiro:** `src/styles/tokens.scss` (importar no `styles.scss`)

---

## 1. Propósito

Este ficheiro consolida **todos os tokens do sistema** num único lugar de referência. É a fonte de verdade para implementação. Os módulos anteriores (colors, typography, spacing) documentam a **filosofia e o porquê**; este módulo fornece o **código pronto a usar**.

---

## 2. tokens.scss — Completo

```scss
// ╔════════════════════════════════════════════════════════════╗
// ║          NZOLANET — DESIGN TOKENS v1.0                     ║
// ║  Importar em styles.scss antes de qualquer outro ficheiro  ║
// ╚════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────
// 1. TYPOGRAPHY
// ─────────────────────────────────────────────────────────────

:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
               'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace,
               SFMono-Regular, Menlo, monospace;

  --text-xs:   0.75rem;    // 12px
  --text-sm:   0.875rem;   // 14px
  --text-base: 1rem;       // 16px
  --text-lg:   1.125rem;   // 18px
  --text-xl:   1.25rem;    // 20px
  --text-2xl:  1.5rem;     // 24px
  --text-3xl:  1.875rem;   // 30px
  --text-4xl:  2.25rem;    // 36px

  --weight-light:     300;
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
  --weight-extrabold: 800;

  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  --tracking-tight:  -0.02em;
  --tracking-snug:   -0.01em;
  --tracking-normal: 0em;
  --tracking-wide:   0.02em;
  --tracking-wider:  0.05em;
}

// ─────────────────────────────────────────────────────────────
// 2. SPACING
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// 3. BORDER RADIUS
// ─────────────────────────────────────────────────────────────

:root {
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-full: 9999px;
}

// ─────────────────────────────────────────────────────────────
// 4. LAYOUT
// ─────────────────────────────────────────────────────────────

:root {
  --container-feed:      600px;
  --container-sidebar:   280px;
  --container-page:      1280px;
  --container-auth:      400px;

  --sidebar-width:       240px;
  --sidebar-collapsed:   72px;
  --navbar-height:       64px;
  --navbar-height-mobile:56px;
  --bottom-nav-height:   56px;
}

// ─────────────────────────────────────────────────────────────
// 5. COMPONENT TOKENS
// ─────────────────────────────────────────────────────────────

:root {
  /* Post */
  --post-padding-x:       var(--space-4);
  --post-padding-y:       var(--space-5);
  --post-avatar-size:     40px;
  --post-avatar-offset:   56px;

  /* Comment */
  --comment-padding-x:    var(--space-4);
  --comment-padding-y:    var(--space-3);
  --comment-avatar-size:  32px;
  --comment-indent:       var(--space-6);

  /* Card */
  --card-padding:         var(--space-5);
  --card-radius:          var(--radius-lg);
  --card-gap:             var(--space-4);

  /* Button */
  --btn-radius:           var(--radius-md);
  --btn-padding-x-sm:     var(--space-3);
  --btn-padding-y-sm:     var(--space-2);
  --btn-padding-x-md:     var(--space-4);
  --btn-padding-y-md:     var(--space-3);
  --btn-padding-x-lg:     var(--space-5);
  --btn-padding-y-lg:     var(--space-4);
  --btn-icon-gap:         var(--space-2);
  --btn-height-sm:        32px;
  --btn-height-md:        40px;
  --btn-height-lg:        48px;
  --btn-icon-only-sm:     32px;
  --btn-icon-only-md:     40px;
  --btn-icon-only-lg:     48px;

  /* Input */
  --input-height-sm:      36px;
  --input-height-md:      44px;
  --input-height-lg:      52px;
  --input-padding-x:      var(--space-4);
  --input-padding-y:      var(--space-3);
  --input-radius:         var(--radius-md);
  --form-gap:             var(--space-5);
  --form-label-gap:       var(--space-2);

  /* Avatar */
  --avatar-xs:   24px;
  --avatar-sm:   32px;
  --avatar-md:   40px;
  --avatar-lg:   56px;
  --avatar-xl:   80px;
  --avatar-2xl:  120px;

  /* Badge */
  --badge-height-sm:  18px;
  --badge-height-md:  22px;
  --badge-padding-x:  var(--space-2);
  --badge-radius:     var(--radius-full);

  /* Modal */
  --modal-padding:    var(--space-6);
  --modal-radius:     var(--radius-lg);
  --modal-max-sm:     480px;
  --modal-max-md:     640px;

  /* Dropdown */
  --dropdown-padding-y:   var(--space-2);
  --dropdown-item-height: 40px;
  --dropdown-radius:      var(--radius-md);

  /* Notification item */
  --notif-padding-x:  var(--space-4);
  --notif-padding-y:  var(--space-3);
  --notif-avatar:     36px;

  /* Tab */
  --tab-height:       44px;
  --tab-padding-x:    var(--space-4);
}

// ─────────────────────────────────────────────────────────────
// 6. Z-INDEX
// ─────────────────────────────────────────────────────────────

:root {
  --z-base:     0;
  --z-raised:   10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
  --z-tooltip:  600;
}

// ─────────────────────────────────────────────────────────────
// 7. MOTION
// ─────────────────────────────────────────────────────────────

:root {
  --duration-instant:  50ms;
  --duration-fast:     100ms;
  --duration-normal:   200ms;
  --duration-moderate: 300ms;
  --duration-slow:     400ms;
  --duration-sluggish: 600ms;

  --ease-linear:       linear;
  --ease-in:           cubic-bezier(0.4, 0, 1, 1);
  --ease-out:          cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:       cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce:       cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

// ─────────────────────────────────────────────────────────────
// 8. BREAKPOINTS (usados via @media)
// ─────────────────────────────────────────────────────────────

// Não são CSS vars (não funcionam em @media queries)
// Definidos como SCSS variables
$bp-sm:   640px;
$bp-md:   768px;
$bp-lg:   1024px;
$bp-xl:   1280px;
$bp-2xl:  1536px;

// Mixins de conveniência
@mixin sm  { @media (min-width: $bp-sm)  { @content; } }
@mixin md  { @media (min-width: $bp-md)  { @content; } }
@mixin lg  { @media (min-width: $bp-lg)  { @content; } }
@mixin xl  { @media (min-width: $bp-xl)  { @content; } }
@mixin 2xl { @media (min-width: $bp-2xl) { @content; } }

// ─────────────────────────────────────────────────────────────
// 9. FOCUS RING (acessibilidade)
// ─────────────────────────────────────────────────────────────

:root {
  --focus-ring-width:  2px;
  --focus-ring-offset: 2px;
  --focus-ring-color:  var(--border-brand);

  // Aplicar via mixin
}

@mixin focus-ring {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

@mixin focus-visible-ring {
  &:focus {
    outline: none;
  }
  &:focus-visible {
    @include focus-ring;
  }
}

// ─────────────────────────────────────────────────────────────
// 10. UTILITY MIXINS
// ─────────────────────────────────────────────────────────────

// Truncar texto com reticências
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Multi-line clamp
@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Touch target mínimo
@mixin touch-target {
  min-height: 44px;
  min-width: 44px;
}

// Skeleton loading shimmer
@mixin skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-overlay) 25%,
    var(--bg-elevated) 50%,
    var(--bg-overlay) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Visually hidden (accessible)
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Redução de movimento
@mixin reduce-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}

// ─────────────────────────────────────────────────────────────
// 11. DARK/LIGHT COLOR TOKENS
// (definidos nos respectivos themes — ver 01-colors.md)
// Referência rápida dos tokens semânticos:
// ─────────────────────────────────────────────────────────────

// BACKGROUNDS:   --bg-base | --bg-surface | --bg-elevated | --bg-overlay | --bg-sunken
//                --bg-brand | --bg-brand-subtle
//                --bg-success | --bg-warning | --bg-danger | --bg-info

// BORDERS:       --border-subtle | --border-default | --border-strong | --border-brand
//                --border-success | --border-warning | --border-danger | --border-info

// TEXT:          --text-primary | --text-secondary | --text-tertiary | --text-disabled
//                --text-inverse | --text-brand | --text-on-brand
//                --text-success | --text-warning | --text-danger | --text-info

// SHADOWS:       --shadow-sm | --shadow-md | --shadow-lg | --shadow-xl

// STATES:        --state-hover | --state-active | --state-focus | --state-selected

// INTERACTION:   --baze-default | --baze-active | --baze-bg-active

// NOTIFICATIONS: --notif-baze | --notif-baze-bg | --notif-comment | --notif-comment-bg
//                --notif-follow | --notif-follow-bg | --notif-unread-dot
```

---

## 3. Tailwind Config Extension

Para integrar os tokens com Tailwind CSS:

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...fontFamily.sans],
        mono: ['JetBrains Mono', 'Fira Code', ...fontFamily.mono],
      },
      colors: {
        brand: {
          DEFAULT: '#E8550F',
          50:  '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFC5A8',
          300: '#FF9D72',
          400: '#FF7040',
          500: '#E8550F',
          600: '#C9460A',
          700: '#A33708',
          800: '#7C2905',
          900: '#551C03',
        },
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        full: '9999px',
      },
      maxWidth: {
        feed:    '600px',
        sidebar: '280px',
        auth:    '400px',
      },
      height: {
        navbar:         '64px',
        'navbar-mobile':'56px',
        'bottom-nav':   '56px',
      },
      transitionDuration: {
        '50':  '50ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};
```

---

## 4. Angular — styles.scss Setup

```scss
// src/styles.scss

// 1. Google Fonts (alternativa ao link no HTML)
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

// 2. Design Tokens (gerado acima)
@import 'tokens';

// 3. Tailwind directives
@tailwind base;
@tailwind components;
@tailwind utilities;

// 4. Global resets e base styles
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  lang: pt;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

// Focus visible global (substituir o outline padrão feio)
:focus {
  outline: none;
}
:focus-visible {
  outline: 2px solid var(--border-brand);
  outline-offset: 2px;
}

// Redução de motion global
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
