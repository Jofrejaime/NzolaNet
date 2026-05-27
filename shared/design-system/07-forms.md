# NzolaNet — Forms
**Módulo:** 07  
**Depende de:** 01-colors, 02-typography, 03-spacing, 05-buttons

---

## 1. Filosofia

Os formulários da NzolaNet servem dois contextos distintos:

1. **Formulários de autenticação** (login, registo, recuperação de senha) — foco, sem distracções, layout centrado
2. **Composer de publicação** (criar/editar post) — inline no feed, fluido, não-intrusivo

Em ambos os casos: **clareza absoluta de estado** — o utilizador deve sempre saber se um campo é válido, inválido, focado ou desactivado.

---

## 2. Base: Input de Texto

### 2.1 Estrutura

```
[Label]
[Input field]            ← Altura fixa: 44px (md)
[Helper text / erro]     ← Aparece abaixo do input
```

### 2.2 Estilos

```scss
// ── Label ──────────────────────────────────────────────────────
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  line-height: var(--leading-snug);
  margin-bottom: var(--form-label-gap);     // 8px
  user-select: none;

  .form-label__required {
    color: var(--text-danger);
    margin-left: 2px;
    font-weight: var(--weight-regular);
  }
}

// ── Input base ────────────────────────────────────────────────
.form-input {
  display: block;
  width: 100%;
  height: var(--input-height-md);           // 44px
  padding: 0 var(--input-padding-x);        // 0 16px
  background-color: var(--bg-sunken);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--input-radius);       // 10px
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-none);
  transition:
    border-color     var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    box-shadow       var(--duration-fast) var(--ease-out);
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: var(--weight-regular);
  }

  // ── Estados ─────────────────────────────────────────────────

  &:hover:not(:disabled):not(:focus) {
    border-color: var(--border-strong);
  }

  &:focus {
    border-color: var(--border-brand);
    background-color: var(--bg-surface);
    box-shadow: 0 0 0 3px var(--state-focus);   // Ring de foco de brand
  }

  &:disabled {
    background-color: var(--bg-overlay);
    color: var(--text-disabled);
    border-color: var(--border-subtle);
    cursor: not-allowed;
    &::placeholder { color: var(--text-disabled); }
  }

  &[readonly] {
    background-color: var(--bg-overlay);
    cursor: default;
  }

  // ── Validação ────────────────────────────────────────────────

  &.is-error {
    border-color: var(--border-danger);
    background-color: var(--bg-danger);

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
  }

  &.is-success {
    border-color: var(--border-success);

    &:focus {
      box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.15);
    }
  }
}

// ── Input com ícone ───────────────────────────────────────────
.form-input-wrapper {
  position: relative;

  .form-input {
    &.has-icon-left  { padding-left: var(--space-10);  }   // 40px
    &.has-icon-right { padding-right: var(--space-10); }
  }

  .input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
    width: 18px;
    height: 18px;

    &.icon-left  { left: var(--space-4); }   // 16px
    &.icon-right { right: var(--space-4); }

    // Ícone interactivo (ex: toggle password)
    &.is-interactive {
      pointer-events: all;
      cursor: pointer;
      &:hover { color: var(--text-secondary); }
    }
  }
}

// ── Tamanhos alternativos ─────────────────────────────────────
.form-input--sm {
  height: var(--input-height-sm);    // 36px
  font-size: var(--text-sm);
  padding: 0 var(--space-3);         // 0 12px
}

.form-input--lg {
  height: var(--input-height-lg);    // 52px
  font-size: var(--text-lg);
}

// ── Helper text ───────────────────────────────────────────────
.form-helper {
  margin-top: var(--space-2);        // 8px
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
  color: var(--text-secondary);

  &.is-error   { color: var(--text-danger);  }
  &.is-success { color: var(--text-success); }
}

// ── Form group (label + input + helper) ─────────────────────
.form-group {
  display: flex;
  flex-direction: column;
}
```

---

## 3. Password Input

```html
<!-- Angular template -->
<div class="form-group">
  <label class="form-label" for="password">
    Senha <span class="form-label__required" aria-hidden="true">*</span>
  </label>
  <div class="form-input-wrapper">
    <input
      class="form-input has-icon-right"
      [type]="showPassword ? 'text' : 'password'"
      id="password"
      autocomplete="current-password"
      [class.is-error]="passwordError"
    >
    <button
      class="input-icon icon-right is-interactive"
      type="button"
      [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
      (click)="togglePassword()">
      <!-- eye / eye-off icon -->
    </button>
  </div>
  @if (passwordError) {
    <span class="form-helper is-error" role="alert">{{ passwordError }}</span>
  }
</div>
```

---

## 4. Textarea (Comentários)

```scss
.form-textarea {
  display: block;
  width: 100%;
  min-height: 80px;
  padding: var(--input-padding-y) var(--input-padding-x);  // 12px 16px
  background-color: var(--bg-sunken);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--input-radius);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  resize: vertical;
  min-height: 80px;
  max-height: 320px;
  transition:
    border-color     var(--duration-fast) var(--ease-out),
    box-shadow       var(--duration-fast) var(--ease-out);
  outline: none;

  &::placeholder { color: var(--text-tertiary); }

  &:focus {
    border-color: var(--border-brand);
    background-color: var(--bg-surface);
    box-shadow: 0 0 0 3px var(--state-focus);
  }

  &.is-error {
    border-color: var(--border-danger);
    background-color: var(--bg-danger);
  }
}

// Contador de caracteres
.form-textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-tertiary);

  &.is-near-limit { color: var(--text-warning); }
  &.is-at-limit   { color: var(--text-danger); }
}
```

---

## 5. Post Composer

O componente mais complexo do sistema de formulários. Aparece no topo do feed e na página de nova publicação.

### 5.1 Estrutura

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  [Texto: "O que está a acontecer?"]               │ ← Input área
│                                                             │
│  [Preview de media, se existir]                             │ ← Opcional
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [📷 Foto]  [🎥 Vídeo]  [·]  [Público ▾]    [Publicar →]  │ ← Toolbar
└─────────────────────────────────────────────────────────────┘
```

```scss
.composer {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  padding: var(--space-4);
}

.composer__main {
  display: flex;
  gap: var(--space-3);
}

.composer__avatar {
  width: var(--post-avatar-size);    // 40px
  height: var(--post-avatar-size);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.composer__input-area {
  flex: 1;
  min-width: 0;
}

.composer__textarea {
  width: 100%;
  min-height: 60px;
  max-height: 320px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: var(--font-sans);
  font-size: var(--text-lg);        // 18px — ligeiramente maior para composer
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  overflow-y: auto;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.composer__media-preview {
  margin-top: var(--space-3);
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;

  img, video {
    width: 100%;
    height: auto;
    max-height: 320px;
    object-fit: cover;
    display: block;
    border-radius: var(--radius-md);
  }

  .media-remove-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(4px);

    &:hover { background-color: rgba(0, 0, 0, 0.8); }
  }
}

.composer__toolbar {
  display: flex;
  align-items: center;
  padding-top: var(--space-3);
  margin-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  gap: var(--space-1);

  .composer__toolbar-actions {
    display: flex;
    gap: var(--space-1);
    align-items: center;
    flex: 1;
  }

  .composer__char-count {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-feature-settings: "tnum";    // Números tabulares para estabilidade visual
    min-width: 3ch;
    text-align: right;
    flex-shrink: 0;
    margin-right: var(--space-3);

    &.is-near-limit { color: var(--text-warning); }
    &.at-limit      { color: var(--text-danger);  }
  }
}

// Botão de anexar media — ghost com ícone
.composer__attach-btn {
  // btn-icon ghost md
  color: var(--text-secondary);
  &:hover { color: var(--text-brand); background-color: var(--bg-brand-subtle); }
}
```

### 5.2 Comportamento do Composer

```typescript
// composer.component.ts
@Component({ selector: 'nzola-composer', standalone: true, ... })
export class ComposerComponent {
  MAX_CHARS = 500;
  text = signal('');
  mediaFile = signal<File | null>(null);
  mediaPreviewUrl = signal<string | null>(null);
  isSubmitting = signal(false);

  get charsLeft() { return this.MAX_CHARS - this.text().length; }
  get isOverLimit() { return this.charsLeft < 0; }
  get canSubmit() { return this.text().trim().length > 0 && !this.isOverLimit; }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    this.mediaFile.set(file);
    this.mediaPreviewUrl.set(url);
  }

  async onSubmit() {
    if (!this.canSubmit || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.postService.create({ text: this.text(), media: this.mediaFile() });
      this.text.set('');
      this.mediaFile.set(null);
      this.mediaPreviewUrl.set(null);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

---

## 6. Checkbox e Radio

```scss
// Usando appearance: none para controlo total
.form-checkbox,
.form-radio {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border-default);
  background-color: var(--bg-sunken);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color     var(--duration-fast) var(--ease-out);
  position: relative;

  &:hover { border-color: var(--border-strong); }

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }

  &:checked {
    background-color: var(--bg-brand);
    border-color: var(--bg-brand);
  }

  &:disabled {
    background-color: var(--bg-overlay);
    border-color: var(--border-subtle);
    cursor: not-allowed;
  }
}

.form-checkbox {
  border-radius: var(--radius-sm);   // 6px — quadrado com cantos suaves

  // Checkmark via clip-path
  &:checked::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,...") center / 12px no-repeat;
    // SVG checkmark branco
  }
}

.form-radio {
  border-radius: var(--radius-full);   // circular

  &:checked::after {
    content: '';
    position: absolute;
    inset: 3px;
    background-color: white;
    border-radius: var(--radius-full);
  }
}

// Label wrapper para checkbox/radio
.form-check {
  display: flex;
  align-items: center;
  gap: var(--space-3);   // 12px
  cursor: pointer;

  .form-check__label {
    font-size: var(--text-sm);
    color: var(--text-primary);
    cursor: pointer;
    user-select: none;
  }

  &:has(:disabled) {
    cursor: not-allowed;
    .form-check__label { color: var(--text-disabled); }
  }
}
```

---

## 7. Toggle (Público/Privado)

Usado na configuração de privacidade do perfil (RF-025, RN-006).

```scss
.form-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-track {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-full);
    background-color: var(--bg-overlay);
    border: 1.5px solid var(--border-default);
    transition:
      background-color var(--duration-normal) var(--ease-out),
      border-color     var(--duration-normal) var(--ease-out);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background-color: var(--text-tertiary);
    border-radius: var(--radius-full);
    transition: transform var(--duration-normal) var(--ease-spring);
    box-shadow: var(--shadow-sm);
  }

  input:checked ~ .toggle-track {
    background-color: var(--bg-brand);
    border-color: var(--bg-brand);
  }

  input:checked ~ .toggle-thumb {
    transform: translateX(20px);
    background-color: white;
  }

  input:focus-visible ~ .toggle-track {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }

  input:disabled ~ .toggle-track {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

## 8. Formulário de Autenticação — Layout

```scss
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background-color: var(--bg-base);
}

.auth-card {
  width: 100%;
  max-width: var(--container-auth);   // 400px
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-8);            // 32px
  display: flex;
  flex-direction: column;
  gap: var(--space-6);               // 24px entre secções
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);               // 20px entre campos
}

.auth-card__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.auth-card__title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
}

.auth-card__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}

.auth-card__footer {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);

  a {
    color: var(--text-brand);
    font-weight: var(--weight-medium);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
```

---

## 9. Validação com Angular Reactive Forms

```typescript
// Exemplo: login.component.ts
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});

getErrorMessage(field: string): string | null {
  const control = this.loginForm.get(field);
  if (!control?.invalid || !control?.touched) return null;

  if (control.errors?.['required']) return 'Este campo é obrigatório.';
  if (control.errors?.['email'])    return 'Endereço de email inválido.';
  if (control.errors?.['minlength']) {
    return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
  }
  return 'Valor inválido.';
}
```

```html
<!-- Template de campo com validação -->
<div class="form-group">
  <label class="form-label" for="email">
    Email <span class="form-label__required" aria-hidden="true">*</span>
  </label>
  <input
    class="form-input"
    [class.is-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
    type="email"
    id="email"
    formControlName="email"
    autocomplete="email"
    [attr.aria-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
    [attr.aria-describedby]="'email-error'"
  >
  @if (getErrorMessage('email'); as error) {
    <span class="form-helper is-error" id="email-error" role="alert">{{ error }}</span>
  }
</div>
```

---

## 10. Anti-padrões

```html
<!-- ❌ Validar sem feedback visual -->
<input type="text" required>  <!-- sem classe is-error nem helper text -->

<!-- ❌ Usar placeholder como label -->
<input placeholder="Email">   <!-- placeholder desaparece ao escrever -->

<!-- ✅ Sempre label visível + placeholder como hint -->
<label>Email</label>
<input placeholder="ex: utilizador@exemplo.com">

<!-- ❌ Botão submit fora do formulário -->
<form>...</form>
<button type="submit">Entrar</button>  <!-- ❌ desconectado do form -->

<!-- ✅ Dentro do form ou com referência -->
<form (ngSubmit)="onSubmit()">
  ...
  <button type="submit">Entrar</button>
</form>
```
