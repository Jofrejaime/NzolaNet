# NzolaNet — Colors
**Módulo:** 01  
**Depende de:** nenhum (base do sistema)

---

## 1. Filosofia e Intenção

O sistema de cores da NzolaNet é construído sobre três camadas:

1. **Primitives** — Paletas raw com todas as tonalidades (não são usadas diretamente na UI)
2. **Semantic tokens** — Nomes com significado funcional (background, text, border…)
3. **Component tokens** — Tokens específicos de componente, derivados dos semânticos

Esta separação permite:
- Trocar o tema inteiro mudando apenas os semantic tokens
- Manter dark/light mode sem duplicar lógica de componente
- Escalar para múltiplos temas no futuro

---

## 2. Paleta Primitiva

### 2.1 Neutral (Cinzentos)

A espinha dorsal da UI. Tons neutros quentes (não frios puros) para suavidade visual.

```scss
// Neutral Primitives — quente, não frio
$neutral-0:   #FFFFFF;
$neutral-50:  #FAFAFA;
$neutral-100: #F5F5F4;
$neutral-150: #EFEFED;
$neutral-200: #E8E8E5;
$neutral-300: #D1D1CC;
$neutral-400: #A8A8A2;
$neutral-500: #767670;
$neutral-600: #54544F;
$neutral-700: #3A3A37;
$neutral-800: #252523;
$neutral-850: #1C1C1A;
$neutral-900: #141412;
$neutral-950: #0D0D0C;
$neutral-1000: #080807;
```

**Porquê tons quentes?** Cinzentos com subtil temperatura quente (hue ~40°) reduzem a sensação de frieza técnica, tornando o feed mais confortável para leitura prolongada.

---

### 2.2 Brand / Accent (Sunset Orange)

```scss
// Brand Primitives — Sunset Orange
$brand-50:   #FFF3EE;
$brand-100:  #FFE4D6;
$brand-200:  #FFC5A8;
$brand-300:  #FF9D72;
$brand-400:  #FF7040;
$brand-500:  #E8550F;  // ← BASE — usar como referência
$brand-600:  #C9460A;
$brand-700:  #A33708;
$brand-800:  #7C2905;
$brand-900:  #551C03;
$brand-950:  #2E0F01;
```

**Escolha do Sunset Orange `#E8550F`:** Vibra sem ser agressivo, tem boa legibilidade contra fundos escuros (contrast 4.8:1 sobre `#141412`), evoca calor humano e energia — adequado para uma plataforma social. Diferencia claramente de redes sociais com accent azul (Twitter, Facebook, LinkedIn).

---

### 2.3 Semantic — Success, Warning, Danger, Info

```scss
// Semantic Primitives
$green-400:  #4ADE80;
$green-500:  #22C55E;
$green-600:  #16A34A;
$green-900:  #052E16;

$amber-400:  #FBBF24;
$amber-500:  #F59E0B;
$amber-900:  #2D1A01;

$red-400:    #F87171;
$red-500:    #EF4444;
$red-600:    #DC2626;
$red-900:    #2D0707;

$blue-400:   #60A5FA;
$blue-500:   #3B82F6;
$blue-600:   #2563EB;
$blue-900:   #03123A;
```

---

## 3. Semantic Tokens — Dark Mode (Primário)

O dark mode é o modo primário de design. Todos os componentes são desenhados no escuro primeiro.

```css
/* ===== DARK MODE ===== */
[data-theme="dark"], :root {

  /* Backgrounds — camadas de elevação */
  --bg-base:      #0D0D0C;   /* Fundo raiz (body, página) */
  --bg-surface:   #141412;   /* Cards, posts, superfícies principais */
  --bg-elevated:  #1C1C1A;   /* Menus dropdown, modais, tooltips */
  --bg-overlay:   #252523;   /* Hover states, backgrounds secundários */
  --bg-sunken:    #090908;   /* Campos de input, áreas côncavas */
  --bg-brand:     #E8550F;   /* Botão primário, elementos de destaque */
  --bg-brand-subtle: rgba(232, 85, 15, 0.12); /* Fundo de elementos com accent (badges, highlights) */

  /* Borders */
  --border-subtle:  #1F1F1D;  /* Divisores muito suaves (entre posts no feed) */
  --border-default: #2C2C29;  /* Bordas padrão de cards e inputs */
  --border-strong:  #3D3D3A;  /* Bordas de foco, elementos ativos */
  --border-brand:   #E8550F;  /* Foco de brand, estados ativos de accent */

  /* Text */
  --text-primary:   #F2F2F0;   /* Corpo de texto, títulos */
  --text-secondary: #A8A8A2;   /* Timestamps, meta-informação, labels */
  --text-tertiary:  #666663;   /* Placeholders, texto desactivado */
  --text-disabled:  #3D3D3A;   /* Elementos desactivados */
  --text-inverse:   #0D0D0C;   /* Texto sobre botões de brand/filled */
  --text-brand:     #FF7040;   /* Links, mentions, texto de brand */
  --text-on-brand:  #FFFFFF;   /* Texto sobre bg-brand */

  /* Semantic text */
  --text-success: #4ADE80;
  --text-warning: #FBBF24;
  --text-danger:  #F87171;
  --text-info:    #60A5FA;

  /* Semantic backgrounds */
  --bg-success: rgba(74, 222, 128, 0.10);
  --bg-warning: rgba(251, 191, 36, 0.10);
  --bg-danger:  rgba(248, 113, 113, 0.10);
  --bg-info:    rgba(96, 165, 250, 0.10);

  /* Semantic borders */
  --border-success: rgba(74, 222, 128, 0.30);
  --border-warning: rgba(251, 191, 36, 0.30);
  --border-danger:  rgba(248, 113, 113, 0.30);
  --border-info:    rgba(96, 165, 250, 0.30);

  /* Interaction states */
  --state-hover:   rgba(255, 255, 255, 0.05);  /* Overlay para hover genérico */
  --state-active:  rgba(255, 255, 255, 0.08);
  --state-focus:   rgba(232, 85, 15, 0.20);    /* Ring de foco com brand */
  --state-selected: rgba(232, 85, 15, 0.15);

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md:   0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-xl:   0 16px 48px rgba(0, 0, 0, 0.7);

  /* Baze button — interação especial */
  --baze-default:  #A8A8A2;
  --baze-active:   #E8550F;
  --baze-bg-active: rgba(232, 85, 15, 0.12);
}
```

---

## 4. Semantic Tokens — Light Mode

```css
/* ===== LIGHT MODE ===== */
[data-theme="light"] {

  /* Backgrounds */
  --bg-base:     #FAFAFA;
  --bg-surface:  #FFFFFF;
  --bg-elevated: #F5F5F4;
  --bg-overlay:  #EFEFED;
  --bg-sunken:   #F0F0EE;
  --bg-brand:    #E8550F;
  --bg-brand-subtle: rgba(232, 85, 15, 0.08);

  /* Borders */
  --border-subtle:  #EFEFED;
  --border-default: #E8E8E5;
  --border-strong:  #D1D1CC;
  --border-brand:   #E8550F;

  /* Text */
  --text-primary:   #141412;
  --text-secondary: #54544F;
  --text-tertiary:  #A8A8A2;
  --text-disabled:  #D1D1CC;
  --text-inverse:   #FFFFFF;
  --text-brand:     #C9460A;
  --text-on-brand:  #FFFFFF;

  /* Semantic text */
  --text-success: #16A34A;
  --text-warning: #D97706;
  --text-danger:  #DC2626;
  --text-info:    #2563EB;

  /* Semantic backgrounds */
  --bg-success: rgba(22, 163, 74, 0.08);
  --bg-warning: rgba(217, 119, 6, 0.08);
  --bg-danger:  rgba(220, 38, 38, 0.08);
  --bg-info:    rgba(37, 99, 235, 0.08);

  /* Semantic borders */
  --border-success: rgba(22, 163, 74, 0.25);
  --border-warning: rgba(217, 119, 6, 0.25);
  --border-danger:  rgba(220, 38, 38, 0.25);
  --border-info:    rgba(37, 99, 235, 0.25);

  /* Interaction states */
  --state-hover:    rgba(0, 0, 0, 0.04);
  --state-active:   rgba(0, 0, 0, 0.07);
  --state-focus:    rgba(232, 85, 15, 0.15);
  --state-selected: rgba(232, 85, 15, 0.10);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);

  /* Baze button */
  --baze-default:   #767670;
  --baze-active:    #E8550F;
  --baze-bg-active: rgba(232, 85, 15, 0.10);
}
```

---

## 5. Tokens de Notificação

Cores específicas para o sistema de notificações (M6).

```css
--notif-baze:      #E8550F;  /* Baze recebido */
--notif-baze-bg:   rgba(232, 85, 15, 0.12);
--notif-comment:   #60A5FA;  /* Comentário recebido */
--notif-comment-bg: rgba(96, 165, 250, 0.10);
--notif-follow:    #4ADE80;  /* Novo seguidor */
--notif-follow-bg: rgba(74, 222, 128, 0.10);
--notif-unread-dot: #E8550F; /* Indicador de não lido */
```

---

## 6. Regras de Uso

### ✅ Correto

```html
<!-- Usar sempre CSS custom properties -->
<div style="background: var(--bg-surface); color: var(--text-primary);">

<!-- Angular: via class ou variável no component -->
<div class="bg-surface text-primary">
```

```scss
// SCSS — referenciar sempre as variáveis
.post-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}
```

### ❌ Proibido

```scss
// NUNCA usar valores primitivos directamente na UI
.post-card {
  background: #141412;    // ❌ hardcoded — quebra no light mode
  color: #F2F2F0;         // ❌
  border-color: #2C2C29;  // ❌
}

// NUNCA usar preto/branco absolutos em superfícies
background: #000000;  // ❌
background: #FFFFFF;  // ❌ (usar --bg-surface)
```

---

## 7. Contraste e Acessibilidade

| Combinação | Ratio (Dark) | WCAG | Ratio (Light) | WCAG |
|-----------|-------------|------|--------------|------|
| `--text-primary` over `--bg-surface` | 12.8:1 | AAA | 13.1:1 | AAA |
| `--text-secondary` over `--bg-surface` | 5.2:1 | AA | 5.8:1 | AA |
| `--text-brand` over `--bg-surface` | 4.8:1 | AA | 4.6:1 | AA |
| `--text-on-brand` over `--bg-brand` | 4.5:1 | AA | 4.5:1 | AA |
| `--text-tertiary` over `--bg-surface` | 2.8:1 | *(só para textos não-críticos ≥24px)* | 3.1:1 | — |

> ⚠️ `--text-tertiary` não cumpre AA para texto de corpo. Usar **apenas** em placeholders, labels desactivadas ou texto ≥ 24px/bold.

---

## 8. Implementação Angular — Theme Switch

```typescript
// theme.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'dark' | 'light'>('dark');

  toggle() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nzola-theme', next);
  }

  init() {
    const saved = localStorage.getItem('nzola-theme') as 'dark' | 'light';
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = saved ?? preferred;
    this.theme.set(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }
}
```
