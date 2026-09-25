---
name: motion-and-visual-design
description: Design engineering standards for modern UI animation, layered glassmorphism, spring physics, and micro-interactions synthesized from MengTo/Skills, elayadesign/ai-design-skills, and ConardLi/garden-skills.
---

# Motion & Visual Design Engineering Standard

Synthesized from industry-leading design systems and AI agent skill collections ([MengTo/Skills](https://github.com/MengTo/Skills), [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills), and [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills)), this skill defines visual polish, motion primitives, and micro-interaction principles for building ultra-premium web applications.

---

## 1. Core Motion Principles

### 1.1 "Physical, Not Cartoony"
- Animation should feel grounded in physics: mass, friction, and tension.
- Avoid linear transitions (`ease` or `linear` feel robotic). Always use custom cubic-bezier curves:
  - **Primary Spring Exit/Enter**: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy entry, gentle settle)
  - **Tactile Interactive Springs**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (subtle organic overshoot)
  - **Smooth Ambient / Background**: `cubic-bezier(0.4, 0, 0.2, 1)` (seamless continuous flow)

### 1.2 Motion Choreography & Staggering
- When multiple elements load or transition, never animate them simultaneously.
- Stagger entrance by `30ms - 60ms` per item:
  ```css
  .item:nth-child(1) { animation-delay: 0.04s; }
  .item:nth-child(2) { animation-delay: 0.08s; }
  .item:nth-child(3) { animation-delay: 0.12s; }
  ```
- Primary focal elements (totals, primary CTA) settle first; metadata and subsidiary lists follow.

### 1.3 Latency & Performance Rules
- Animate **only composite properties**: `transform` and `opacity`. Never animate `margin`, `top`, `width`, or `height` directly during user interactions.
- Respect accessibility: Always include `@media (prefers-reduced-motion: reduce)`.

---

## 2. Layered Glassmorphism & Depth Architecture

### 2.1 The 4-Layer Depth Stack
1. **Canvas Layer (Z: 0)**: Deep dark background (`#0a0f1d`) with animated radial ambient glow meshes.
2. **Surface Layer (Z: 10)**: Frosted glass panel with `backdrop-filter: blur(20px) saturate(180%)`.
3. **Specular Highlight (Z: 11)**: 1px top reflection `inset 0 1px 0 0 rgba(255, 255, 255, 0.15)` simulating a physical beveled glass edge.
4. **Interactive Overlays (Z: 100)**: Modals and drawers with elevated shadows (`0 25px 60px -15px rgba(0, 0, 0, 0.7)`).

### 2.2 Specular Border Technique
```css
.glass-panel {
  background: rgba(18, 24, 43, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 20px 45px -15px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
    inset 0 0 20px 0 rgba(255, 255, 255, 0.02);
}
```

---

## 3. Micro-Interaction Standards

### 3.1 Button & Clickable States
- **Resting**: Subtle border glow, clear icon-text alignment.
- **Hover**: Lift (`transform: translateY(-2px) scale(1.01)`), enhanced outer glow, background brightness increase.
- **Active / Press**: Spring compress (`transform: translateY(0) scale(0.98)`).
- **Focus-Visible**: High-contrast accessibility ring (`outline: 2px solid var(--primary)` with `outline-offset: 2px`).

### 3.2 Shimmer Sweep for High-Value CTAs
A soft 45-degree luminous gradient sweep across primary buttons draws attention without distraction:
```css
@keyframes shimmerSweep {
  0% { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
}
```

---

## 4. UI Polish Checklist

- [x] Ambient floating mesh background with hardware-accelerated transforms.
- [x] Top specular 1px glass highlights on all cards and dialogs.
- [x] Spring cubic-bezier easing tokens for all hover and active states.
- [x] Staggered `fadeRise` entrance animations for cards and transactions.
- [x] Visual category distribution bar with animated widths.
- [x] Shimmer sweep on primary buttons.
- [x] Pulsing indicator dots on status badges.
