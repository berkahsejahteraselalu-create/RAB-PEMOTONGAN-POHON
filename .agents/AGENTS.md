# Project Rules & Design Guidelines

## HTML / Web UI Design Engineering Standards

Whenever designing, modifying, reviewing, or styling HTML/CSS/JS interfaces in this project, adhere strictly to **Emil Kowalski's Design Engineering Philosophy** (referencing [.agents/skills/emil-design-eng/SKILL.md](file:///c:/Users/Windows%2011/Documents/RAB%20DAN%20ANALISA%20PEMOTONGAN%20POHON/.agents/skills/emil-design-eng/SKILL.md)):

1. **Craft & Micro-Interactions**:
   - Every interactive element (buttons, cards, inputs) must feel responsive to touch/click (e.g., `:active` scale down `transform: scale(0.97)`).
   - Specify exact CSS transition properties (e.g. `transition: transform 200ms ease-out`), NEVER use `transition: all`.
   - Use natural entrances (`opacity: 0; transform: scale(0.95)`) instead of popping from `scale(0)` or 0 height without opacity.

2. **Purposeful Animation Framework**:
   - Never animate high-frequency actions (100+ times/day).
   - Use `ease-out` for entering/appearing elements so they start fast and feel responsive.
   - Maintain spatial consistency (toasts/drawers enter and exit from the same direction).

3. **UI Review Format**:
   - When reviewing or proposing UI/CSS changes, present recommendations using markdown tables with `| Before | After | Why |` columns.
