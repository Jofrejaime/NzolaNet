# NzolaNet — Design System
**Versão:** 1.0  
**Data:** Maio 2026  
**Stack alvo:** Angular 17+ · Tailwind CSS · SCSS · CSS Custom Properties

---

## O que é este documento

Este Design System é o contrato visual e de interação da plataforma NzolaNet. Define **todos os tokens, componentes, padrões e regras** que garantem consistência, escalabilidade e excelência de experiência em toda a aplicação.

Não é um tutorial. É uma especificação de produção.

---

## Filosofia de Design

A NzolaNet é uma rede social centrada em **conteúdo e conexão humana**. O design deve amplificar o conteúdo — nunca competir com ele.

Os quatro princípios que guiam cada decisão:

| Princípio | Significado Prático |
|-----------|-------------------|
| **Conteúdo primeiro** | A UI desaparece. O texto, as imagens e as interações ocupam o centro. |
| **Densidade equilibrada** | O feed é denso por necessidade, mas nunca sufocante. Espaço branco é usado com intenção. |
| **Clareza de ação** | Cada elemento interativo é imediatamente reconhecível. Sem ambiguidade nos CTAs. |
| **Ritmo visual consistente** | Spacing, radius, sombras e tipografia seguem sistemas — não intuições. |

---

## Identidade Visual

**"Nzola"** em Kimbundu significa *amor* e *afeto*. A paleta e a tipografia refletem calor humano expresso com precisão técnica — caloroso sem ser informal, moderno sem ser frio.

**Accent color:** `#E8550F` — Sunset Orange. Vibrante, quente, decisivo. Usado com disciplina para criar hierarquia de ação.

**Modo escuro:** Tratamento de primeira classe. O dark mode não é uma inversão — é uma paleta independente calibrada para reduzir fadiga ocular em sessões longas de feed.

---

## Estrutura do Design System

| Ficheiro | Conteúdo |
|----------|---------|
| `01-colors.md` | Paleta completa, CSS vars, light/dark mode |
| `02-typography.md` | Fonte, escala tipográfica, line-heights, hierarquia |
| `03-spacing.md` | Sistema de espaçamento 4pt, containers, grid |
| `04-tokens.md` | Todos os CSS Custom Properties num só lugar |
| `05-buttons.md` | Variantes, estados, tamanhos, padrões de interação |
| `06-cards.md` | Post card, profile card, notification card, skeletons |
| `07-forms.md` | Inputs, textarea, validação, post composer |
| `08-components.md` | Navbar, avatar, badge, tabs, modal, dropdown, toast |
| `09-motion.md` | Durações, easings, animações-chave |
| `10-responsive-rules.md` | Breakpoints, layouts, mobile-first |
| `11-accessibility.md` | WCAG, contraste, foco, ARIA, teclado |
| `12-icons.md` | Sistema de ícones, sizing, uso |

---

## Stack de Implementação

```
Angular 17+        → Componentes standalone, signals
Tailwind CSS 3.4+  → Classes utilitárias; tema customizado
SCSS               → Mixins, design tokens como variáveis
CSS Custom Props   → Theming light/dark sem re-compilar
Google Fonts       → Plus Jakarta Sans (carregamento optimizado)
```

---

## Como usar este documento

1. **Designers:** Replicar tokens no Figma como Variables. Cada token é um Figma Variable.
2. **Developers:** Importar `tokens.scss` no projecto. Usar CSS vars no HTML, nunca valores raw.
3. **Ambos:** Este documento é a fonte única de verdade. Em caso de conflito, este documento prevalece.

---

## Anti-padrões Globais

> ❌ Nunca usar valores de cor, espaçamento ou tipografia fora dos tokens definidos.  
> ❌ Nunca adicionar um novo componente sem seguir as regras de spacing e border-radius definidas.  
> ❌ Nunca criar uma variante de botão não especificada neste documento sem aprovação do design.  
> ❌ Nunca usar `!important` para sobrepor tokens — corrigir a origem do problema.
