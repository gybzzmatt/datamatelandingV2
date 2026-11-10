# COMMIT-SHEET — DataMate Hub (hub.datamate.cl)

Registro: **direct** (página con escena pico de scroll) + **system** (app con login para talento, cliente y admin).
Restricción superior: **DataMate Design System "Neon-Zen"** (Brand Guide 2026). La marca es un insumo, no un reflejo; donde choca con las prohibiciones genéricas de la skill, gana la marca y se documenta con `auteur-allow`.

## 1. Peak / Signature
Pico = **escena 4 "Cómo funciona"**: la sección se fija (*stop scroll*, ~250vh en desktop) y los 5 pasos del onboarding avanzan con el scroll. A la izquierda queda el Enso de DataMate, que gira un cuarto de vuelta por paso. Una barra de progreso vertical crece con `scaleY` y cada paso entra con un cruce de opacidad + `yPercent`. Es el único momento ≥8 de intensidad.
Firma de marca: el Enso como objeto que "acompaña" al experto por el proceso.

## 2. Color
- Marca: Carbon `#0B0B0B` (60 %) · Obsidian `#121216` (30 %) · Signal Green `#81FBA5` (≤10 %, **solo** CTAs y estados de validación/pagado) · Electric Blue `#44BFFC` (enlaces, foco, datos) · Deep Purple `#5C41FF` (solo en la bruma Aurora).
- Nivel: committed-dark. **L media del fondo ≈ 0,15** (Carbon). Razón: es la ecología 60-30-10 obligatoria de la Brand Guide 2026, no "oscuro = premium". El contraste lo hacen el verde de acción y el texto blanco al 78 %.
- `/* auteur-allow: dark-default -- canvas Carbon exigido por Brand Guide 2026 (60-30-10) */`
- La Aurora usa azul (h≈230) + púrpura (h≈280) al 12 % de opacidad: no es un degradado púrpura→azul en bloque, sino atmósfera detrás del vidrio. **Prohibido** el degradado en texto (se descarta la variante de KPI del Design System).

## 3. Type
- Display: **Poppins** 800–900, tracking −0.03em (la guía pide −2 %; la skill pone el piso en −0.04em). Fallback Archivo.
- Texto: **DM Sans** 400/500, 16–18 px, interlineado 1.65, 65–75ch.
- Datos/etiquetas: **JetBrains Mono** 500 MAYÚSCULAS, +0.14em.
- Eje de contraste: geométrica pesada × grotesca humanista × mono técnica. Se descarta Space Grotesk (la usaba la landing V3 y es una fuente reflejo); se descarta Inter.

## 4. Grid break
El Enso del hero (SVG, 70vh) sale del contenedor de 1200 px por la derecha y cruza el borde inferior del hero hacia la escena 2. La palabra que se ilumina en la escena 2 queda por encima del trazo, que actúa como hilo entre secciones.

## 5. Motion budget (3 familias, nada más con scroll)
1. **Char-rise** solo en el H1 del hero (intro, una vez).
2. **Word-light scrub** en la declaración de la escena 2.
3. **Pinned stop-scroll** en la escena 4 (pico).
Todo lo demás: estados hover/focus en CSS de 150–250 ms. Las secciones adyacentes nunca comparten revelado. Reduced motion: sin Lenis, sin pin, contenido estático visible.

## 6. Reflex check
a) Marketplaces de "gana dinero entrenando IA": fondo blanco, tarjetas de vacantes en grilla, métricas gigantes ("$X pagados") y logos de clientes en carrusel.
b) Quien evita (a): negro + neón + 3D genérico + "join the future".
c) DataMate Hub: lidera con **la fecha de pago** (widget del próximo pago en el hero, en vez de una métrica inflada), el Enso como guía del proceso y cero logos o cifras que no sean reales. El diferenciador de confianza (cuándo cobras) es el contenido, no la decoración.

## 7. House tells broken
1. **Eyebrow mono sobre cada sección** → solo en el hero y en "Pagos". El resto abre con el titular directo.
2. **Hero con fila de métricas** → se reemplaza por una tarjeta "Próximo ciclo de pago" con fechas reales calculadas (cierre y ventana de pago).
3. **Grilla de tarjetas de íconos idénticas** en "Para empresas" → lista partida con texto a la izquierda y formulario de CTA a la derecha.


---
# Addendum v2 — pivot opción A (9-nov-2026)
Se mantiene el sistema Neon-Zen (tokens, tipos, grid break del Enso). Cambia el contenido y la firma.

- **Peak / firma:** la escena fijada pasa de "Cómo funciona" (onboarding de expertos) a **las 5 etapas de madurez**. Misma mecánica y números (pin +=250%, scrub .6). El Enso ahora lleva adentro el glifo de la etapa activa; los glifos hacen crossfade (opacity + scale .9→1).
- **Firma del hero:** el **buscador de etapa** ("¿Qué frase suena a tu empresa?") reemplaza la tarjeta de ciclo de pago. El diagnóstico es el contenido; no hay métricas.
- **Color:** la barra de progreso pasa a Electric Blue. Signal Green queda solo en el CTA primario y en el estado "Se entrega hoy".
- **Motion budget:** las mismas 3 familias + la excepción Soul "Amanecer". Sin familias nuevas.
- **Reflex check:** (a) agencias de IA para pymes: hero "AI-first", grilla de servicios con iconos, logos y porcentajes. (b) quien lo evita: consultora enterprise con taxonomías. (c) DataMate: abre con la frase del cliente, muestra el estado real de cada solución y dice lo que no promete.
- **House tells rotos:** grilla de tarjetas de servicios → escena fijada de etapas y lista tipográfica de entregas; fila de métricas → buscador de etapa.
- **Integridad:** sin precios (pendiente de finanzas), sin nombres de clientes (pendiente de permisos), sin partners nombrados, "preparación ISO 27001" nunca "certificación".
