# Auditoría de Modo Oscuro

## Alcance
- Admin: Layout, Sidebar, Dashboard, Builder, Login, Setup, ImageUpload, SortableModule.
- Público: PublicProposalView, PreviewProposalView, Hero, Timeline, Pricing, CTA, Text.

## Tokens aplicados
- Fondo y texto: `bg-background`, `text-foreground`
- Bordes: `border-border`
- Superficies: `bg-card`, `bg-muted`, `backdrop-blur`
- Texto secundario: `text-muted-foreground`
- Marca: `--brand-blue (#0054df)`, `--brand-cyan (#33ccff)`

## Cambios clave
- Sustitución de clases específicas (`zinc/*`, `text-white`, `border-white/10`, `bg-white/5`) por tokens.
- Estados hover/focus: `hover:bg-muted`, `focus-visible:ring` en inputs y botones.
- Indicadores y etiquetas: uso consistente de colores de marca y muted.
- Carga/empty states: superficies con `bg-card` y bordes `border`.

## Verificados
- Botones: normal/hover/disabled (border, fondo y texto adaptan modo).
- Popups/Sheet: `bg-card` + `border` y blur.
- Navegación/Header/Sidebar: contraste correcto en ambos modos.
- Formularios: inputs/labels; estados focus visibles.
- Iconos: `currentColor` (lucide).
- Tipografía: headings y párrafos con tokens de texto.

## Pendientes y mejoras
- Añadir toasts temáticos y estados de error con tokens.
- Pruebas end-to-end de contraste e interacciones con Playwright.

## Contraste
- Validaciones automatizadas básicas en `src/__tests__/contrast.spec.ts`.
- Bordes y divisores usan `border` para consistencia; evitar opacidades insuficientes.

