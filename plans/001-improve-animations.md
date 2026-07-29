# 001 — Motion & Animation System Upgrade

- **Status**: IN_PROGRESS
- **Commit**: HEAD
- **Severity**: HIGH
- **Category**: Performance, Easing & Duration, Physicality, Accessibility, Cohesion
- **Estimated scope**: 2 files (`style.css`, `RAB_Pemotongan_Pohon_AHSP2026.html`)

## Problem

1. `style.css` defines a single blanket `--transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);` that animates all properties off-GPU for inputs, buttons, cards, and nav items.
2. Interactive buttons (`.btn-primary`, `.action-btn`, `.btn-icon`) and nav items (`.nav-item`) lack `:active` tactile click feedback (`transform: scale(0.97)`).
3. Complete absence of `@media (prefers-reduced-motion: reduce)`.
4. High-frequency actions use sluggish 300ms durations instead of 150ms micro-interaction timing.
5. Tab transitions use hardcoded 400ms `@keyframes fadeIn` which cannot interrupt smoothly.

## Target

Introduce structured motion tokens, add `:active` tactile feedback, refactor view transitions to natural entrances, add staggered entrances for KPI cards, and include reduced motion accessibility handling.

```css
/* target tokens in style.css */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 250ms;

--transition-fast: transform var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
--transition-normal: transform var(--duration-normal) var(--ease-out), background-color var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out);
```

## Boundaries

- Do NOT touch JS calculations (`app.js`, `data-ahsp.js`, `excel-export.js`, `build_excel.py`).
- Do NOT alter HTML element structures, forms, or IDs.
- CSS and HTML presentation layer only.

## Verification

- **Feel check**: Click buttons and nav items to verify active scale feedback (`scale(0.97)`). Switch tabs to verify smooth natural entry.
- **Accessibility**: Emulate `prefers-reduced-motion` in browser DevTools to confirm spatial translates are suppressed while maintaining color/opacity states.
