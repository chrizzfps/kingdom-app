# Public UI Style Spec

## Direccion visual
- Estetica minimalista premium inspirada en Apple, Linear y Stripe.
- Balance de modulos claros y oscuros para ritmo visual.
- Microinteracciones sutiles con enfasis en claridad funcional.
- La vista publica es independiente del tema del admin panel.

## Layout y grid
- Cada modulo usa `min-h-[100dvh]` como altura base.
- Contenido principal centrado con margenes laterales consistentes (`px-6` a `md:px-12`).
- Anchos maximos controlados por tipo de contenido (`max-w-4xl`, `max-w-5xl`, `max-w-6xl`).

## Jerarquia tipografica
- Titulos principales: peso `font-semibold`, tracking tight, line-height compacta.
- Subtitulos y cuerpo: contraste alto, tamaños fluidos por breakpoint.
- Evitar animacion letra por letra para mantener tono editorial y sobrio.

## Spacing system
- Espaciado vertical principal por seccion: `py-10` a `py-20`.
- Distancias internas de cards: `p-5`/`p-6`/`p-8` segun breakpoint.
- Separaciones entre bloques: uso de `gap-*` consistente por modulo.

## Color y contraste
- Paleta base neutral (`zinc`) con acentos controlados.
- Fondos oscuros: texto `white` / `zinc-300`.
- Fondos claros: texto `zinc-900` / `zinc-600`.
- Bordes de baja frecuencia visual para definir estructura sin ruido.

## Motion
- Entradas suaves (`opacity + y`) entre `0.35s` y `0.6s`.
- Hover states discretos (shadow, translate y scale muy leve).
- Evitar efectos exuberantes para conservar apariencia premium.

## Iconografia
- Uso reducido de iconos en zonas de soporte para evitar ruido visual.
- Uso de iconos grandes (HUGE) solo en puntos de alto valor semantico.
- Evitar mezclar muchos estilos iconograficos en una misma seccion.

## Criterios de calidad visual aplicados
- Consistencia de bordes, radios y sombras.
- Correccion de desalineaciones y contraste entre modulos.
- Armonia entre iconos, botones, textos y tarjetas.
- Coherencia global manteniendo identidad por seccion.
