# NzolaNet — Buttons
**Módulo:** 05  
**Depende de:** 01-colors, 02-typography, 03-spacing, 04-tokens

---

## 1. Filosofia

Os botões comunicam hierarquia de ação. Numa rede social, a clareza de ação é crítica — o utilizador deve saber instantaneamente qual a ação principal, quais são secundárias e quais são perigosas.

**Princípio de hierarquia:**
1. **Máximo um botão Primary** por view/contexto — é o CTA mais importante
2. **Secondary/Ghost** para ações complementares
3. **Danger** apenas em ações destrutivas irreversíveis (com confirmação)
4. **Text** para ações de menor importância ou em contexto inline

---

## 2. Variantes

### 2.1 Primary

Ação principal. Máximo um por ecrã.

```scss
// Estrutura base
.btn-primary {
  background-color: var(--bg-brand);          // #E8550F
  color: var(--text-on-brand);                // #FFFFFF
  border: none;

  &:hover:not(:disabled) {
    background-color: #C9460A;                // brand-600
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(232, 85, 15, 0.35);
  }

  &:active:not(:disabled) {
    background-color: #A33708;                // brand-700
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background-color: var(--bg-overlay);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

**Usos na NzolaNet:** "Publicar", "Guardar alterações", "Registar", "Entrar"

### 2.2 Secondary

Ação importante mas não a principal. Tem border visível.

```scss
.btn-secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);

  &:hover:not(:disabled) {
    background-color: var(--state-hover);
    border-color: var(--border-strong);
  }

  &:active:not(:disabled) {
    background-color: var(--state-active);
  }

  &:disabled {
    color: var(--text-disabled);
    border-color: var(--border-subtle);
    cursor: not-allowed;
  }
}
```

**Usos na NzolaNet:** "Cancelar", "Editar publicação", "Ver perfil"

### 2.3 Ghost

Sem border, sem fundo. Para ações de menor prioridade em zonas densas.

```scss
.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border: none;

  &:hover:not(:disabled) {
    background-color: var(--state-hover);
    color: var(--text-primary);
  }

  &:active:not(:disabled) {
    background-color: var(--state-active);
  }

  &:disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}
```

**Usos na NzolaNet:** Botões de ação em post (comentar, partilhar, opções)

### 2.4 Brand Ghost

Ghost com cor de brand. Para follow button e ações de brand sem fundo filled.

```scss
.btn-brand-ghost {
  background-color: transparent;
  color: var(--text-brand);
  border: 1px solid var(--border-brand);

  &:hover:not(:disabled) {
    background-color: var(--bg-brand-subtle);
  }

  &:active:not(:disabled) {
    background-color: rgba(232, 85, 15, 0.20);
  }
}
```

**Usos na NzolaNet:** "Seguir" (estado antes de seguir)

### 2.5 Following (Toggle State)

Estado após seguir. Comunica "podes deixar de seguir".

```scss
.btn-following {
  background-color: var(--bg-overlay);
  color: var(--text-primary);
  border: 1px solid var(--border-default);

  &:hover:not(:disabled) {
    background-color: var(--bg-danger);
    color: var(--text-danger);
    border-color: var(--border-danger);
    // Label muda para "Deixar de seguir" no hover (via JS)
  }
}
```

### 2.6 Danger

Ações destrutivas. Sempre com confirmação antes de executar.

```scss
.btn-danger {
  background-color: var(--bg-danger);
  color: var(--text-danger);
  border: 1px solid var(--border-danger);

  &:hover:not(:disabled) {
    background-color: #EF4444;             // red-500
    color: #FFFFFF;
    border-color: #EF4444;
  }

  &:active:not(:disabled) {
    background-color: #DC2626;             // red-600
  }
}
```

**Usos na NzolaNet:** "Eliminar publicação" (em modal de confirmação), "Remover comentário" (admin)

### 2.7 Text

Link-style. Sem fundo, sem border, inline com texto.

```scss
.btn-text {
  background-color: transparent;
  color: var(--text-brand);
  border: none;
  padding: 0;
  height: auto;
  text-decoration: none;

  &:hover:not(:disabled) {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:disabled {
    color: var(--text-tertiary);
    cursor: not-allowed;
    text-decoration: none;
  }
}
```

**Usos na NzolaNet:** "Esqueceu a senha?", mentions em texto, links inline

---

## 3. Tamanhos

Três tamanhos. Cada um tem altura fixa para consistência em layouts.

```scss
// ── Small ──────────────────────────────────────────────────────
.btn-sm {
  height: var(--btn-height-sm);             // 32px
  padding: 0 var(--btn-padding-x-sm);       // 0 12px
  font-size: var(--text-xs);                // 12px
  font-weight: var(--weight-semibold);      // 600
  letter-spacing: var(--tracking-wide);     // 0.02em
  gap: var(--space-1);                      // 4px (icon + label)
}

// ── Medium (padrão) ────────────────────────────────────────────
.btn-md {
  height: var(--btn-height-md);             // 40px
  padding: 0 var(--btn-padding-x-md);       // 0 16px
  font-size: var(--text-sm);                // 14px
  font-weight: var(--weight-semibold);      // 600
  gap: var(--btn-icon-gap);                 // 8px
}

// ── Large ──────────────────────────────────────────────────────
.btn-lg {
  height: var(--btn-height-lg);             // 48px
  padding: 0 var(--btn-padding-x-lg);       // 0 20px
  font-size: var(--text-base);              // 16px
  font-weight: var(--weight-semibold);      // 600
  gap: var(--btn-icon-gap);                 // 8px
}
```

---

## 4. Base Styles (partilhados por todos)

```scss
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--btn-radius);         // 10px
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-none);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color            var(--duration-fast) var(--ease-out),
    border-color     var(--duration-fast) var(--ease-out),
    transform        var(--duration-fast) var(--ease-out),
    box-shadow       var(--duration-fast) var(--ease-out);

  // Focus
  &:focus { outline: none; }
  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }

  // Loading state
  &[aria-busy="true"] {
    cursor: wait;
    pointer-events: none;
    opacity: 0.7;
  }

  // Full width variant
  &.btn-full {
    width: 100%;
  }
}
```

---

## 5. Icon Buttons

Botões quadrados com apenas ícone. Touch target mínimo de 44px respeitado.

```scss
.btn-icon {
  border-radius: var(--radius-md);          // 10px
  padding: 0;
  flex-shrink: 0;

  &.btn-icon-sm {
    width:  var(--btn-icon-only-sm);        // 32px
    height: var(--btn-icon-only-sm);
    // Compensar com touch area invisible
    &::after {
      content: '';
      position: absolute;
      inset: -6px;                          // Expande touch target a 44px
    }
  }

  &.btn-icon-md {
    width:  var(--btn-icon-only-md);        // 40px
    height: var(--btn-icon-only-md);
    &::after { content: ''; position: absolute; inset: -2px; }
  }

  &.btn-icon-lg {
    width:  var(--btn-icon-only-lg);        // 48px
    height: var(--btn-icon-only-lg);
  }

  // Circular variant
  &.btn-icon-circle {
    border-radius: var(--radius-full);
  }
}
```

---

## 6. O Botão Baze (Interação Especial)

O baze é a interação central da plataforma (M3). O seu botão tem comportamento de toggle e animação especial.

```scss
.btn-baze {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);                      // 4px
  padding: var(--space-1) var(--space-2);   // 4px 8px
  border-radius: var(--radius-full);
  border: none;
  background-color: transparent;
  color: var(--baze-default);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition:
    color            var(--duration-normal) var(--ease-out),
    background-color var(--duration-normal) var(--ease-out),
    transform        var(--duration-fast)   var(--ease-spring);

  svg {
    width: 18px;
    height: 18px;
    transition:
      fill      var(--duration-normal) var(--ease-out),
      transform var(--duration-fast)   var(--ease-spring);
  }

  // Hover
  &:hover:not(:disabled):not(.is-active) {
    background-color: var(--baze-bg-active);
    color: var(--baze-active);
    svg { stroke: var(--baze-active); }
  }

  // Active (deu baze)
  &.is-active {
    color: var(--baze-active);
    svg {
      fill: var(--baze-active);
      stroke: var(--baze-active);
    }
  }

  // Animação ao dar baze
  &.is-animating {
    svg {
      transform: scale(1.35);
    }
  }

  // Touch target
  min-height: 44px;
  min-width: 44px;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }
}
```

**Animação do baze (Angular):**

```typescript
// baze-button.component.ts
onBazeClick() {
  if (this.isAnimating) return;

  this.isAnimating = true;
  this.isActive = !this.isActive;
  this.count += this.isActive ? 1 : -1;

  // Emitir evento para o serviço
  this.bazeService.toggle(this.postId);

  setTimeout(() => {
    this.isAnimating = false;
  }, 300);
}
```

---

## 7. Loading State

```html
<!-- Botão em loading -->
<button class="btn-base btn-primary btn-md" aria-busy="true" disabled>
  <svg class="btn-spinner" aria-hidden="true"><!-- spinner icon --></svg>
  <span>A publicar...</span>
</button>
```

```scss
.btn-spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Redução de movimento — substituir por opacity pulse
@media (prefers-reduced-motion: reduce) {
  .btn-spinner { animation: none; }
  [aria-busy="true"] { animation: pulse 1s ease-in-out infinite; }
}
```

---

## 8. Angular Component

```typescript
// button.component.ts
@Component({
  selector: 'nzola-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading ? 'true' : null"
      (click)="onClick.emit($event)">
      @if (loading) {
        <svg class="btn-spinner" aria-hidden="true">...</svg>
      } @else if (iconLeft) {
        <ng-content select="[slot=icon-left]"></ng-content>
      }
      <ng-content></ng-content>
      @if (iconRight && !loading) {
        <ng-content select="[slot=icon-right]"></ng-content>
      }
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'text' | 'brand-ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() full = false;
  @Input() iconLeft = false;
  @Input() iconRight = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return [
      'btn-base',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.full ? 'btn-full' : '',
    ].filter(Boolean).join(' ');
  }
}
```

---

## 9. Padrões Proibidos

```html
<!-- ❌ Dois botões primary no mesmo contexto -->
<button class="btn-primary">Publicar</button>
<button class="btn-primary">Guardar rascunho</button>

<!-- ✅ Correcto -->
<button class="btn-primary">Publicar</button>
<button class="btn-secondary">Guardar rascunho</button>

<!-- ❌ Usar div/span clicável em vez de button -->
<div class="btn-primary" (click)="submit()">Publicar</div>

<!-- ✅ Correcto — semântica e acessibilidade -->
<button class="btn-primary" (click)="submit()">Publicar</button>

<!-- ❌ Ação destrutiva sem confirmação -->
<button class="btn-danger" (click)="deletePost()">Eliminar</button>

<!-- ✅ Correcto — modal de confirmação primeiro -->
<button class="btn-danger" (click)="openDeleteConfirmModal()">Eliminar</button>
```
