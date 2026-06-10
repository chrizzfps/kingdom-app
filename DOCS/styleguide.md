# Sistema de Diseño Kingdom

## Tipografía
- Familia: `var(--font-sans)` basada en system UI
- Jerarquía: `.heading-1`, `.heading-2`, `.heading-3`, `.text-body`, `.text-body-lg`
- Unidades: tamaños en REM, interlineado controlado
- Espaciado vertical: `.vspace-1..4`

## Colores
- Paleta restringida: `--brand-blue`, `--brand-cyan`, `--foreground`, `--background`
- Variables HSL en `:root`; uso mediante `hsl(var(--...))`
- Validación en runtime con `sanitizeColors(colors: string[])`
 - Bordes y superficies: usar `border-border`, `bg-card`, `bg-muted` en lugar de valores fijos

## Layout y Alineación
- Centrados con `MotionSection` (flex, snap)
- Guías con `AlignmentGuides` (grid visual suave)

## Interacciones
- Micro‑animaciones con `framer-motion`
- Cursor FX con halos de marca (`CursorFX`)
- Galería con lightbox (`PremiumGallery`)
 - Estados `hover/active/focus`: aplicar `hover:bg-muted`, `focus-visible:ring`, `hover:text-foreground` siempre con tokens

## Responsive
- Breakpoints via utilidades y clases responsive
- Imágenes: `background-size: contain` y `object-contain` según contexto
 - Hero: fondo full-screen con `img.object-cover`; texto en `text-white` con `drop-shadow` para legibilidad

## Accesibilidad
- Contraste de textos con gradientes sutiles
- `aria-label` en elementos interactivos
 - Pruebas de contraste básicas en `src/__tests__/contrast.spec.ts`
