# NzolaNet — Components
**Módulo:** 08  
**Depende de:** 01-colors, 02-typography, 03-spacing, 05-buttons

Este módulo cobre os componentes de interface reutilizáveis que não são cards nem formulários. Cada componente é especificado com a sua anatomia, estados e implementação.

---

## 1. Navbar / Header

A navbar é o componente de navegação global, sempre visível em desktop e tablet.

### 1.1 Estrutura (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]  ←  flex 1  →  [🔔 Notificações]  [Avatar ▾]          │
└─────────────────────────────────────────────────────────────────┘
         64px de altura, sticky top: 0
```

```scss
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--navbar-height);              // 64px
  background-color: var(--bg-base);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  padding: 0 var(--navbar-padding-x);        // 0 16px
  gap: var(--space-4);

  // Blur effect — muito subtil, sem glassmorphism excessivo
  backdrop-filter: blur(12px);
  background-color: rgba(var(--bg-base-rgb), 0.92);
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  flex-shrink: 0;

  .logo-mark {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    font-size: var(--text-xl);
    font-weight: var(--weight-bold);
    color: var(--text-primary);
    letter-spacing: var(--tracking-tight);
    // Ocultar em mobile — só o logo-mark
    @media (max-width: 640px) { display: none; }
  }
}

.navbar__spacer { flex: 1; }

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.navbar__notif-btn {
  // btn-icon ghost md
  position: relative;

  .notif-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background-color: var(--notif-unread-dot);
    border: 2px solid var(--bg-base);
    // Pulse animation quando há novas notificações
    animation: notif-pulse 2s ease-in-out infinite;
  }
}

@keyframes notif-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

.navbar__user-menu-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);
  border: none;
  background: transparent;

  &:hover { background-color: var(--state-hover); }

  .navbar__user-avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .navbar__user-name {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-primary);
    @media (max-width: 768px) { display: none; }
  }

  .navbar__chevron {
    color: var(--text-secondary);
    width: 16px;
    height: 16px;
    @media (max-width: 768px) { display: none; }
  }

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }
}
```

### 1.2 Sidebar de Navegação (Desktop)

```scss
.sidebar-nav {
  position: sticky;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  width: var(--sidebar-width);               // 240px
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
  flex-shrink: 0;

  // Colapsada (tablet)
  &.is-collapsed {
    width: var(--sidebar-collapsed);          // 72px
    align-items: center;

    .nav-item__label { display: none; }
    .nav-item        { justify-content: center; }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);    // 12px
  border-radius: var(--radius-md);
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color            var(--duration-fast) var(--ease-out);
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);

  &:hover {
    background-color: var(--state-hover);
    color: var(--text-primary);
  }

  &.is-active {
    background-color: var(--state-selected);
    color: var(--text-brand);
    font-weight: var(--weight-semibold);

    svg { color: var(--text-brand); }
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
}

.nav-item__label {
  white-space: nowrap;
  overflow: hidden;
}
```

### 1.3 Bottom Navigation (Mobile)

```scss
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  height: var(--bottom-nav-height);          // 56px
  background-color: var(--bg-base);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-4);
  // Safe area para notch
  padding-bottom: env(safe-area-inset-bottom);

  @media (min-width: 768px) { display: none; }
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);

  svg { width: 24px; height: 24px; }

  .bottom-nav__label {
    font-size: 10px;
    font-weight: var(--weight-medium);
  }

  &.is-active {
    color: var(--text-brand);
  }
}
```

---

## 2. Avatar

```scss
// Tamanhos
.avatar {
  border-radius: var(--radius-full);
  object-fit: cover;
  display: block;
  background-color: var(--bg-overlay);  // Fallback
  flex-shrink: 0;

  &.avatar-xs  { width: var(--avatar-xs);  height: var(--avatar-xs);  }   // 24px
  &.avatar-sm  { width: var(--avatar-sm);  height: var(--avatar-sm);  }   // 32px
  &.avatar-md  { width: var(--avatar-md);  height: var(--avatar-md);  }   // 40px
  &.avatar-lg  { width: var(--avatar-lg);  height: var(--avatar-lg);  }   // 56px
  &.avatar-xl  { width: var(--avatar-xl);  height: var(--avatar-xl);  }   // 80px
  &.avatar-2xl { width: var(--avatar-2xl); height: var(--avatar-2xl); }   // 120px
}

// Avatar com iniciais (fallback quando sem foto)
.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--bg-overlay);
  color: var(--text-secondary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-xs);
  user-select: none;
  flex-shrink: 0;

  &.avatar-lg  { font-size: var(--text-base); }
  &.avatar-xl  { font-size: var(--text-xl);   }
  &.avatar-2xl { font-size: var(--text-2xl);  }
}

// Avatar com anel de online (futuro — presence indicator)
.avatar-wrapper {
  position: relative;
  display: inline-block;
  flex-shrink: 0;

  .presence-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    background-color: var(--text-success);
    border: 2px solid var(--bg-base);
  }
}
```

---

## 3. Badge

Para contadores de notificações, status, tags.

```scss
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--badge-radius);        // full
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
  flex-shrink: 0;
  line-height: var(--leading-none);

  // Tamanhos
  &.badge-sm {
    height: var(--badge-height-sm);          // 18px
    min-width: 18px;
    padding: 0 var(--space-2);              // 0 8px (reduz para números simples)
    font-size: 10px;
    letter-spacing: var(--tracking-wide);
  }

  &.badge-md {
    height: var(--badge-height-md);          // 22px
    min-width: 22px;
    padding: 0 var(--space-2);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
  }

  // Variantes
  &.badge-brand {
    background-color: var(--bg-brand);
    color: var(--text-on-brand);
  }

  &.badge-neutral {
    background-color: var(--bg-overlay);
    color: var(--text-secondary);
    border: 1px solid var(--border-default);
  }

  &.badge-success {
    background-color: var(--bg-success);
    color: var(--text-success);
  }

  &.badge-warning {
    background-color: var(--bg-warning);
    color: var(--text-warning);
  }

  &.badge-danger {
    background-color: var(--bg-danger);
    color: var(--text-danger);
  }

  // Badge de número (notificações) — apenas número
  &.badge-count {
    padding: 0 var(--space-1);
    font-size: 11px;
    font-weight: var(--weight-bold);
    // Para números ≥ 10: "9+" ou "99+"
  }
}
```

---

## 4. Tabs

Usado para navegar entre "Para ti" / "A seguir" no feed, e entre secções no perfil.

```scss
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--tab-height);               // 44px
  padding: 0 var(--tab-padding-x);         // 0 16px
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  text-decoration: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    color        var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
  position: relative;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;

  &:hover:not(.is-active) {
    color: var(--text-primary);
    background-color: var(--state-hover);
  }

  &.is-active {
    color: var(--text-primary);
    font-weight: var(--weight-semibold);
    border-bottom-color: var(--border-brand);  // Indicador de brand
  }

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: -2px;
  }

  // Badge de contagem dentro do tab
  .tab-count {
    margin-left: var(--space-2);
    font-size: 11px;
    font-weight: var(--weight-semibold);
    color: var(--text-tertiary);
    background-color: var(--bg-overlay);
    padding: 1px 6px;
    border-radius: var(--radius-full);
  }

  &.is-active .tab-count {
    color: var(--text-brand);
    background-color: var(--bg-brand-subtle);
  }
}
```

---

## 5. Dropdown Menu

```scss
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown__menu {
  position: absolute;
  z-index: var(--z-dropdown);
  background-color: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--dropdown-radius);    // 10px
  box-shadow: var(--shadow-lg);
  padding: var(--dropdown-padding-y) 0;    // 8px top/bottom
  min-width: 180px;
  max-width: 260px;

  // Posicionamento padrão: abaixo e alinhado à direita
  top: calc(100% + 8px);
  right: 0;

  // Animação de entrada
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
  transform-origin: top right;
  transition:
    opacity   var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
  pointer-events: none;

  &.is-open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  }
}

.dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  height: var(--dropdown-item-height);     // 40px
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-out);
  white-space: nowrap;

  svg {
    width: 16px;
    height: 16px;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  &:hover { background-color: var(--state-hover); }
  &:active { background-color: var(--state-active); }

  &.is-danger {
    color: var(--text-danger);
    svg { color: var(--text-danger); }
    &:hover { background-color: var(--bg-danger); }
  }

  &:focus-visible {
    outline: none;
    background-color: var(--state-hover);
  }
}

.dropdown__separator {
  height: 1px;
  background-color: var(--border-subtle);
  margin: var(--space-2) 0;
}

.dropdown__section-label {
  padding: var(--space-2) var(--space-4);
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}
```

---

## 6. Modal

Para confirmações de eliminação (post/comentário) e edição de perfil.

```scss
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backdrop-filter: blur(4px);

  // Animação
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  &.is-open { opacity: 1; }
}

.modal {
  z-index: var(--z-modal);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--modal-radius);        // 14px
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: var(--modal-max-sm);            // 480px
  max-height: calc(100vh - var(--space-8));
  overflow-y: auto;
  padding: var(--modal-padding);             // 24px

  // Animação de entrada
  transform: translateY(8px) scale(0.98);
  transition:
    transform var(--duration-moderate) var(--ease-out),
    opacity   var(--duration-moderate) var(--ease-out);

  .modal-overlay.is-open & {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.modal__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-snug);
}

.modal__close {
  // btn-icon ghost sm
  flex-shrink: 0;
}

.modal__body {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

// Modal mobile — bottom sheet
@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-width: 100%;
    padding-bottom: calc(var(--modal-padding) + env(safe-area-inset-bottom));
    transform: translateY(100%);

    .modal-overlay.is-open & {
      transform: translateY(0);
    }
  }
}
```

---

## 7. Toast / Notification

Feedback temporário de acções (publicado com sucesso, erro no upload, etc.).

```scss
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  pointer-events: none;

  @media (max-width: 640px) {
    bottom: calc(var(--bottom-nav-height) + var(--space-4));
    right: var(--space-4);
    left: var(--space-4);
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 360px;
  width: 100%;
  pointer-events: all;

  // Animação de entrada
  animation: toast-in var(--duration-moderate) var(--ease-out) forwards;

  &.is-leaving {
    animation: toast-out var(--duration-normal) var(--ease-in) forwards;
  }

  // Variantes
  .toast__icon { flex-shrink: 0; width: 18px; height: 18px; }

  &.toast-success .toast__icon { color: var(--text-success); }
  &.toast-warning .toast__icon { color: var(--text-warning); }
  &.toast-error   .toast__icon { color: var(--text-danger);  }
  &.toast-info    .toast__icon { color: var(--text-info);    }
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.toast__description {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: var(--leading-snug);
}

.toast__close {
  flex-shrink: 0;
  // btn-icon ghost (no ring, very small)
  color: var(--text-tertiary);
  &:hover { color: var(--text-secondary); }
}

@keyframes toast-in {
  from { opacity: 0; transform: translateX(100%) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(100%); }
}

@media (max-width: 640px) {
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(100%) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
}
```

---

## 8. User Mention Chip

Para mencionar utilizadores em posts e comentários.

```scss
.mention-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  background-color: var(--bg-brand-subtle);
  color: var(--text-brand);
  font-size: inherit;
  font-weight: var(--weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);

  &:hover {
    background-color: rgba(232, 85, 15, 0.20);
  }
}
```

---

## 9. Admin Badge

Para identificar visualmente utilizadores com papel de Administrador (M7).

```scss
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--bg-warning);
  color: var(--text-warning);
  font-size: 10px;
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  border: 1px solid var(--border-warning);

  svg { width: 10px; height: 10px; }
}
```

---

## 10. Private Profile Lock

Para perfis privados (RF-025, RN-006) — indicador visual de privacidade.

```scss
.profile-privacy-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);

  svg { width: 12px; height: 12px; }

  &.is-private { color: var(--text-warning); }
  &.is-public  { color: var(--text-tertiary); }
}
```
