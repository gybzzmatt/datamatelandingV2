# DataMate — sitio web (v2)

Homepage de DataMate con la narrativa del pivot (opción A): **"Identificamos tu etapa de madurez digital y te acompañamos en cada etapa con soluciones dedicadas."** Página estática de una sola vista, sin backend.

Se publica en GitHub Pages con el workflow `.github/workflows/pages.yml` en cada push a `main`.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Página publicada (generada por `build.py`; incluye el JS) |
| `site.css` | Estilos: tokens Neon-Zen (claro y oscuro) y el scope propio de Soul |
| `src/site.js` | Buscador de etapa y animaciones (GSAP + Lenis por CDN) |
| `build.py` | Contenido (etapas, entregas, preguntas) y generador de `index.html` |
| `docs/design/` | `DESIGN.md` (reglas que se leen antes de cualquier cambio), `STORYBOARD.md`, `COMMIT-SHEET.md` |
| `docs/research/` | Investigación comparativa de UX y etapas |

## Editar

1. Cambia el contenido en `build.py`, los estilos en `site.css` o el comportamiento en `src/site.js`.
2. Corre `python3 build.py` para regenerar `index.html`.
3. Haz commit de los cambios, incluido `index.html`. El workflow también regenera la página antes de publicarla.

## Reglas de contenido

- Sin precios, porcentajes, nombres de clientes ni partners hasta tener aprobación o permiso escrito.
- "Preparación para ISO 27001", nunca "certificación".
- La sección Soul usa su propio sistema de diseño (`.soul-scope`); no se mezcla con Neon-Zen.
- Motion: tres familias (char-rise del H1, word-light de la declaración, pin de etapas) más la transición "Amanecer" de Soul. Todo respeta `prefers-reduced-motion` y la página se lee completa sin JavaScript.

## Pendiente antes de lanzar

- Los links a la lista de espera de Soul, Red de expertos, Términos y Privacidad apuntan a `https://hub.datamate.cl`, que aún no está publicado.
- Validar con el área de finanzas el texto de "precio fijo" y la sesión de diagnóstico de 90 minutos.
