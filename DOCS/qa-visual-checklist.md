# Checklist QA Visual y Accesibilidad

## General
1. Compilación sin errores y servidor activo.
2. Revisión en modo claro y oscuro.
3. Pruebas en breakpoints: 360, 768, 1024, 1280, 1920 px.
4. Tipografías legibles y tamaños consistentes.

## Accesibilidad
1. Foco visible en todos los elementos interactivos.
2. `aria-invalid` en inputs con errores; mensajes claros.
3. Navegación por teclado: editores y vistas públicas.
4. Contraste mínimo AA para texto e iconos.
5. Respeto a `prefers-reduced-motion` cuando aplique.

## Rendimiento
1. Animaciones viewport‑aware; sin jank al desplazarse.
2. Observadores (Timeline) limitados al contenedor; sin fugas.
3. Cálculos movidos a utilidades puras (`pricing`, `timeline`).

## Módulos Públicos
1. Hero: overlay garantiza legibilidad; títulos no se superponen al fondo.
2. Intro: headings claros; texto con espaciado adecuado.
3. Options: hover sin desplazamiento brusco; acordeón “Más detalles” fluido.
4. Pricing: badges visibles, descuentos correctos y desglose por categoría cuando aplica.
5. Timeline: línea de progreso se actualiza; pasos importantes resaltados; badge en fase.
6. Payment: lectura cómoda; decoraciones sutiles.
7. CTA: enlaces funcionales; etiquetas accesibles.
8. References: imágenes proporcionales; títulos/categorías/URLs válidos.
9. Text: contenido sin desbordes; encabezado claro.

## Editores
1. Labels flotantes: estados `focus/hover` y `helper` visibles.
2. Validaciones: longitudes mín/máx y patrones (tel/email/url).
3. Presets de badge: botones funcionales y coherentes con vista pública.
4. HelpPanel: desplegable y contenido útil en cada editor.

## Criterios de aceptación
1. Interacción coherente y reversible sin errores.
2. Legibilidad y contraste AA en ambos modos.
3. Animaciones suaves, sin impactar navegación ni lectura.
4. Edición refleja correctamente en la vista pública.
5. Responsive sin desbordes ni superposiciones.

