# NzolaNet — Cards
**Módulo:** 06  
**Depende de:** 01-colors, 02-typography, 03-spacing, 05-buttons

---

## 1. Filosofia

Os cards são a unidade atómica da rede social. O **post card** é o componente mais visto, mais repetido e mais crítico de toda a plataforma. Cada detalhe conta — desde o espaçamento ao comportamento do hover.

**Critérios de design para cards:**
- **Escaneabilidade** — O utilizador percebe em < 300ms quem publicou, quando e de que trata o post
- **Densidade correcta** — Informação suficiente sem sufocar
- **Hierarquia clara** — Nome > Conteúdo > Acções > Meta-dados
- **Hover subtil** — Feedback visual sem distrair da leitura

---

## 2. Post Card (Feed Item)

O componente mais importante do sistema. Representa uma publicação no feed (RF-007, RN-003).

### 2.1 Anatomia

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar 40px]  [Nome]  [@handle]  [·]  [Timestamp]  [⋯]│ ← Header
│                                                         │
│  Corpo do texto da publicação                          │ ← Body
│  (max 65ch, leading-normal)                            │
│                                                         │
│  [Imagem opcional — rounded-md]                        │ ← Media (opcional)
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [🔥 12 bazes]  [💬 3 comentários]         [↗ Partilhar]│ ← Actions
└─────────────────────────────────────────────────────────┘
```

### 2.2 Especificação Completa

```scss
.post-card {
  // Layout
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--bg-surface);

  // Separador (usar border-top em vez de gap)
  border-top: 1px solid var(--border-subtle);

  // Hover state — subtle, para indicar clicabilidade
  transition: background-color var(--duration-fast) var(--ease-out);
  &:hover {
    background-color: var(--state-hover);
  }

  // Cursor — o card inteiro é "clicável" para navegar
  cursor: pointer;
}

.post-card__inner {
  padding: var(--post-padding-y) var(--post-padding-x);
  // 20px top/bottom, 16px left/right
  display: flex;
  flex-direction: column;
  gap: var(--space-3);   // 12px entre header, body, media e actions
}

// ── Header ──────────────────────────────────────────────────
.post-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);   // 12px entre avatar e meta
}

.post-card__avatar {
  width: var(--post-avatar-size);    // 40px
  height: var(--post-avatar-size);
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--bg-overlay);
}

.post-card__meta {
  flex: 1;
  min-width: 0;          // Permite truncar texto
  display: flex;
  flex-direction: column;
  gap: 2px;              // 2px — muito justo entre nome e handle
}

.post-card__author-row {
  display: flex;
  align-items: center;
  gap: var(--space-1);   // 4px
  min-width: 0;
}

.post-card__display-name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
}

.post-card__handle {
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-card__separator-dot {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.post-card__timestamp {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-card__menu-btn {
  margin-left: auto;
  flex-shrink: 0;
  // Usar btn-icon ghost sm
}

// ── Body ────────────────────────────────────────────────────
.post-card__body {
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  // NÃO limitar max-width aqui — o container pai controla
  word-wrap: break-word;
  overflow-wrap: break-word;
}

// Texto truncado com "Ver mais" (posts > 4 linhas)
.post-card__body.is-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__see-more {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-brand);
  cursor: pointer;
  margin-top: var(--space-1);

  &:hover { text-decoration: underline; }
}

// Mentions e hashtags dentro do corpo
.post-card__mention {
  color: var(--text-brand);
  font-weight: var(--weight-medium);
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

// ── Media ───────────────────────────────────────────────────
.post-card__media {
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-overlay);

  img, video {
    width: 100%;
    height: auto;
    max-height: 480px;
    object-fit: cover;
    display: block;
  }

  // Aspect ratio para imagens únicas
  &.is-single-image {
    aspect-ratio: 16 / 9;
    img { height: 100%; }
  }
}

// ── Actions ─────────────────────────────────────────────────
.post-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-top: var(--space-1);   // Leve respiração extra acima das acções
  margin-left: calc(-1 * var(--space-2)); // Compensar padding dos botões

  // Partilhar fica no canto direito
  .btn-share {
    margin-left: auto;
  }
}
```

### 2.3 Post Card — Versão de Detalhe (Página de Post)

Quando o post é visualizado na sua própria página:

```scss
.post-card--detail {
  .post-card__body {
    font-size: var(--text-lg);         // 18px — maior para leitura de detalhe
    line-height: var(--leading-relaxed); // 1.625
  }

  .post-card__timestamp {
    font-size: var(--text-sm);         // timestamp maior
    color: var(--text-secondary);
  }

  // Stats adicionais visíveis em detalhe
  .post-card__stats {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4) 0;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
  }

  .post-card__stat-item {
    display: flex;
    gap: var(--space-1);
    font-size: var(--text-sm);

    strong {
      color: var(--text-primary);
      font-weight: var(--weight-semibold);
    }
    span {
      color: var(--text-secondary);
    }
  }
}
```

---

## 3. Comment Item

Representa um comentário numa publicação (RF-015, M4).

```scss
.comment-item {
  display: flex;
  gap: var(--space-3);             // 12px
  padding: var(--comment-padding-y) var(--comment-padding-x);
  // 12px top/bottom, 16px left/right
  position: relative;

  &:hover {
    background-color: var(--state-hover);
  }
}

.comment-item__avatar {
  width: var(--comment-avatar-size);   // 32px
  height: var(--comment-avatar-size);
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.comment-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.comment-item__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);             // 8px
  flex-wrap: wrap;
}

.comment-item__author {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

.comment-item__handle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.comment-item__timestamp {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-left: auto;
}

.comment-item__body {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  word-wrap: break-word;
}

.comment-item__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
  margin-left: calc(-1 * var(--space-2));
}

// Menu de acções (editar/eliminar) — aparece no hover
.comment-item__menu {
  position: absolute;
  top: var(--space-3);
  right: var(--space-4);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);

  .comment-item:hover & { opacity: 1; }
}
```

---

## 4. Profile Card (Sugestão de Seguimento)

Aparece na sidebar e em páginas de sugestões (M1 — seguir utilizadores).

```scss
.profile-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);             // 12px
  padding: var(--space-3) var(--space-4); // 12px 16px
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) var(--ease-out);

  &:hover {
    background-color: var(--state-hover);
  }
}

.profile-card__avatar {
  width: var(--avatar-md);         // 40px
  height: var(--avatar-md);
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.profile-card__info {
  flex: 1;
  min-width: 0;
}

.profile-card__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card__handle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card__action {
  flex-shrink: 0;
  // Botão follow — btn-brand-ghost btn-sm
}
```

---

## 5. Notification Card

Representa uma notificação do sistema (M6 — RF-022, RF-023, RF-024).

```scss
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);             // 12px
  padding: var(--notif-padding-y) var(--notif-padding-x); // 12px 16px
  cursor: pointer;
  position: relative;
  transition: background-color var(--duration-fast) var(--ease-out);
  border-bottom: 1px solid var(--border-subtle);

  &:hover {
    background-color: var(--state-hover);
  }

  // Não lida
  &.is-unread {
    background-color: var(--state-selected);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: var(--notif-unread-dot);
      border-radius: 0 var(--radius-full) var(--radius-full) 0;
    }
  }
}

.notif-item__icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.notif-item__avatar {
  width: var(--notif-avatar);      // 36px
  height: var(--notif-avatar);
  border-radius: var(--radius-full);
  object-fit: cover;
}

// Ícone de tipo sobreposto ao avatar
.notif-item__type-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-base);

  svg { width: 10px; height: 10px; }

  // Tipos
  &.is-baze    { background-color: var(--notif-baze);    }
  &.is-comment { background-color: var(--notif-comment); }
  &.is-follow  { background-color: var(--notif-follow);  }
}

.notif-item__content {
  flex: 1;
  min-width: 0;
}

.notif-item__text {
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--text-primary);

  strong { font-weight: var(--weight-semibold); }
}

.notif-item__timestamp {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

// Preview do post na notificação
.notif-item__preview {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40ch;
}
```

---

## 6. Skeleton Loading States

Para todos os cards — usado enquanto o feed carrega (lazy loading, paginação).

```scss
// Mixin definido em 04-tokens.md
// @include skeleton;

.post-card-skeleton {
  padding: var(--post-padding-y) var(--post-padding-x);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: none;            // O skeleton em si não anima
}

.post-card-skeleton__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

// Cada bloco skeleton tem a classe skeleton-block + dimensões
.skeleton-block {
  @include skeleton;
  border-radius: var(--radius-sm);
}

// Dimensões específicas
.skeleton-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
.skeleton-name   { width: 120px; height: 14px; }
.skeleton-handle { width: 80px;  height: 12px; }
.skeleton-line-full    { width: 100%; height: 14px; }
.skeleton-line-partial { width: 70%;  height: 14px; }
.skeleton-media  { width: 100%; height: 240px; border-radius: var(--radius-md); }
```

**HTML Template:**

```html
<!-- post-card-skeleton.component.html -->
<div class="post-card-skeleton" aria-label="A carregar publicação..." aria-busy="true">
  <div class="post-card-skeleton__header">
    <div class="skeleton-block skeleton-avatar"></div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div class="skeleton-block skeleton-name"></div>
      <div class="skeleton-block skeleton-handle"></div>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div class="skeleton-block skeleton-line-full"></div>
    <div class="skeleton-block skeleton-line-full"></div>
    <div class="skeleton-block skeleton-line-partial"></div>
  </div>
</div>
```

---

## 7. Empty State Card

Para feeds vazios, listas de comentários vazias, notificações sem conteúdo.

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  gap: var(--space-4);
  text-align: center;
}

.empty-state__icon {
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.empty-state__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 35ch;
  line-height: var(--leading-relaxed);
}
```

---

## 8. Anti-padrões

```html
<!-- ❌ Post card sem avatar -->
<div class="post-card">
  <p>Texto sem identidade do autor</p>
</div>

<!-- ✅ Sempre incluir todos os elementos definidos em RN-003 -->
<div class="post-card">
  <img class="post-card__avatar" ...>
  <span class="post-card__display-name">...</span>
  <span class="post-card__timestamp">...</span>
  <p class="post-card__body">...</p>
  <div class="post-card__actions">...</div>
</div>

<!-- ❌ Não fazer hover com background claro (quebra dark mode) -->
.post-card:hover { background: #f0f0f0; } /* ❌ */

<!-- ✅ Usar o token de estado -->
.post-card:hover { background: var(--state-hover); } /* ✅ */
```
