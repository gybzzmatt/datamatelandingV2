# DESIGN.md — DataMate (condensed for Lovable project knowledge)

> **v2 · 9-nov-2026 — pivot opción A.** El homepage (`/`) vende la escalera de 5 etapas para pymes (`src/config/stages.ts`) y no consulta backend. La plataforma de expertos sigue en /proyectos, /registro, /app y usa la nav `app`. Reglas del homepage: sin precios, sin nombres de clientes ni partners, sin porcentajes; "preparación ISO 27001", nunca "certificación"; estados reales por etapa (Se entrega hoy / En pilotos / Próximamente / En preparación).

## Product
DataMate Hub (hub.datamate.cl): marketplace de la red de expertos de DataMate en LatAm. Talento (contribuidores generalistas y expertos) crea su perfil, se postula a proyectos y cobra en USD. Los proyectos vienen de **clientes directos** y de **partners** (plataformas de datos de IA); el equipo DataMate (admin) aprueba y publica todo. Producto en español neutro LatAm, tuteo; inglés como segundo idioma.

## Integrity rules (non-negotiable)
- Cero datos inventados: sin métricas, logos de clientes, testimonios ni pagos ficticios. Los proyectos de ejemplo llevan `is_demo = true` y un badge visible "DEMO".
- No copiar marca, textos ni UI de Mercor, Finework u otras plataformas.
- No nombrar a un partner en una ficha pública salvo `partner_name_public = true`.
- Nunca usar lenguaje de agencia de reclutamiento ("vacantes", "empleo"); usar "proyectos", "tareas", "expertos", "red".

## Tokens (DataMate Design System "Neon-Zen")
```css
:root{
  --dm-carbon:#0B0B0B; --dm-obsidian:#121216; --dm-green:#81FBA5; --dm-green-hover:#9DFFC0;
  --dm-blue:#44BFFC; --dm-purple:#5C41FF; --dm-white:#FFFFFF;
  --fg-primary:#FFFFFF; --fg-secondary:rgba(255,255,255,.78); --fg-muted:rgba(236,240,255,.62); --fg-on-accent:#0B0B0B;
  --surface-glass:rgba(18,18,22,.74); --border-glass:rgba(68,191,252,.22); --border-faint:rgba(255,255,255,.06);
  --border-accent:rgba(129,251,165,.45); --warning:#F2B45C; --danger:#FF5C7A;
  --aurora: radial-gradient(1200px 640px at 80% 8%, rgba(92,65,255,.12) 0%, transparent 58%),
            radial-gradient(900px 540px at 12% 26%, rgba(68,191,252,.12) 0%, transparent 62%), #0B0B0B;
  --radius-card:16px; --radius-card-lg:24px; --radius-field:8px; --radius-pill:100px;
  --ease-out:cubic-bezier(0.16,1,0.3,1); --dur-ui:200ms; --dur-card:350ms;
}
```
- 60-30-10: Carbon canvas · Obsidian surfaces · **Signal Green only for primary CTAs and success/"Pagado" states**, never decorative.
- Cards: radius ≥16px, 1px `--border-glass`, `inset 0 1px 0 rgba(255,255,255,.04)`. Glass (`backdrop-filter: blur(20px)` + `--surface-glass`) **only over Aurora**; on flat sections use solid Obsidian.
- Focus: `outline:2px solid #44BFFC; outline-offset:3px`.
- Hover glow: analytic `0 16px 40px rgba(68,191,252,.12)`; action `0 0 30px rgba(129,251,165,.32)`.

## Type
- Display: Poppins 800/900, letter-spacing −0.03em, sentence case. `clamp(2.5rem, 1.2rem + 5vw, 5.5rem)` for H1.
- Body: DM Sans 400/500, 16–18px, line-height 1.65, max 70ch.
- Mono: JetBrains Mono 500 UPPERCASE, letter-spacing .14em — only for eyebrows (hero + Pagos only), chips, status badges, dates.
- Never: Inter, Space Grotesk, gradient text, ALL CAPS headlines.

## Motion (≤3 scroll families — nothing else scroll-triggered)
Foundation: `src/motion/MotionProvider.tsx` — GSAP ticker drives Lenis (lerp 0.12); adds `html.motion-ok` only when no reduced motion. Content visible by default; `.motion-ok [data-reveal="hidden"]{opacity:0}`.
1. **Char-rise** — hero H1 only. SplitText lines+chars, mask lines, yPercent 110→0, stagger .02, 0.8s power3.out, after `document.fonts.ready`.
2. **Word-light scrub** — scene 2 statement. Words opacity .18→1, scrub .5, start "top 70%", end "bottom 45%".
3. **Pinned stop-scroll** — "Las 5 etapas" `#etapas` (peak; antes "Cómo funciona"). Glifos del aside (`[data-step-visual]`) con crossfade autoAlpha + scale .9→1 en el mismo `at`/`fade` que los pasos; contador `ETAPA n / 5`. Desktop ≥1024px + motion ok: pin, end `+=250%`, scrub .6; progress bar `scaleY` 0→1 (transform-origin top); Enso rotates 90° per step; steps crossfade (opacity + yPercent 12). Mobile/reduced: static vertical timeline.
**Exception — Soul sub-brand (2-nov-2026):** 4. **"Amanecer"** — landing `#soul` only, scoped to `.soul-scope` (separate product). Sky layer `.soul-sky` clip-path `inset(46% 6% 46% 6% round 32px)` → `inset(0)`; inner gradient yPercent 18→0; title glass card opacity 0→1 + y 24→0 in the last 40%. Scrub .6, `top bottom` → `top 25%`, no pin, `refreshPriority:-1`. Desktop ≥768px; mobile = one-shot title fade .5s power2.out; reduced = static. Marked `auteur-allow: motion-budget` in code. Do not reuse this family elsewhere on the DataMate landing.
Rules: `useGSAP({ scope })`, `gsap.matchMedia()` with reduced branch, animate only transform/opacity/clip-path, no `transition: all`, no `window.addEventListener('scroll')`, no `opacity-0` classes in markup, keep native scrollbar, `body{overflow-x:clip}`.
UI micro-interactions: 150–250ms, `--ease-out`; hover only inside `(hover:hover) and (pointer:fine)`.

## Copy voice
Tú, operador, concreto. Cada afirmación con un mecanismo o un dato real. Prohibido: "revolucionario, robusto, cutting-edge, sinergias, transformación digital, seamless". CTAs de app en infinitivo ("Postular", "Guardar perfil", "Ver proyecto").

## Editing protocol
Read this file before any change. Keep the 3 DataMate motion families (+ the scoped Soul "Amanecer" exception); adding another requires removing one. New sections pick a layout not used by their neighbors. Don't introduce new colors or fonts.

## SSR rule (learned in build, 27-oct-2026)
Lovable's hosted runtime (Cloudflare Worker) forbids timers at global scope. GSAP/Lenis must NEVER be imported by SSR-reachable code: `MotionProvider` dynamic-imports `src/motion/runtime.ts` in `useEffect`; landing scenes live in `src/motion/LandingMotion.tsx`, lazy-loaded behind `<ClientOnly>`. A static `import gsap` in a route or root component returns HTTP 500 on every route of the hosted preview while localhost still works — always verify the hosted preview URL, not only localhost.

## Shipped motion (exact numbers)
| Family | Where | Numbers |
|---|---|---|
| Char-rise | Hero H1 | SplitText lines+chars, mask lines, yPercent 110→0, stagger .02, .8s power3.out; rest of hero autoAlpha/y16, .5s, stagger .06, delay .35; Enso rotate −20→0 1.2s |
| Word-light scrub | S2 statement | words opacity .18→1, scrub .5, top 70% → bottom 45% |
| Amanecer (Soul exception) | Landing #soul | clip inset 46%/6% r32 → 0, inner yPercent 18→0, title fade 0.6→1.0, scrub .6, top bottom → top 25%, ≥768px |
| Pinned stop-scroll (peak) | S3 Las 5 etapas | ≥1024px + motion ok; pin end +=250%, scrub .6; progress scaleY 0→1; Enso 0→360; step crossfade 35% of step span, power2.inOut, yPercent ±12; counter PASO n / 5 |

## Rejected
| Tried / considered | Why it lost |
|---|---|
| Infinite idle rotation of the hero Enso | Auto-motion >5s needs a pause control (WCAG 2.2.2); replaced by a one-shot entrance |
| Gradient text on KPI numbers (Design System variant) | Banned by the studio rules; KPIs replaced by the real "Próximo ciclo de pago" card |
| Space Grotesk (live landing V3 font) | Reflex font; Brand Guide 2026 says Poppins/Archivo |
| Third-party tech logos (AWS, NVIDIA, Snowflake…) from the old landing | Not real client relationships → integrity rule |
| PNG logo upload to Lovable | Upload host blocked by network allowlist; Enso SVG + Poppins wordmark used instead (DS-approved). Drag the PNG in the Lovable editor if needed |
| Static GSAP imports in routes | Caused HTTP 500 on the hosted preview (see SSR rule) |
| Tarjeta "Próximo ciclo de pago" en el hero (v1) | El pivot aleja el homepage de la narrativa de datos; la reemplaza el buscador de etapa |
| Cuestionario de 10 preguntas con puntaje | Necesita backend y un modelo de puntaje validado; por ahora 1 clic sobre 5 frases |
| Un universo gráfico por etapa (5 colores, Rive, Lottie) | Un solo lenguaje: glifos de trazo en Electric Blue dentro del Enso |
| Publicar rangos de precio del reporte | Son supuestos por validar; tarifas se escalan al área de finanzas |
