# Formulario B2B → Slack

El formulario del homepage (`#contacto`) envía un JSON a este Worker de Cloudflare. El Worker lo valida y lo publica en el Slack interno con un Incoming Webhook. La URL del webhook vive solo aquí, nunca en el sitio.

```
Navegador ──POST JSON──▶ Worker (valida, antispam, CORS) ──▶ Slack Incoming Webhook ──▶ #canal
```

## Puesta en marcha (una vez)

1. **Slack:** crea una app en https://api.slack.com/apps → *Incoming Webhooks* → activa y agrega un webhook al canal de leads (por ejemplo `#leads-b2b`). Opcional: uno para FDE y otro para proyectos de datos.
2. **Cloudflare:** desde esta carpeta:
   ```bash
   npx wrangler login
   npx wrangler secret put SLACK_WEBHOOK_URL
   npx wrangler secret put SLACK_WEBHOOK_URL_FDE     # opcional
   npx wrangler secret put SLACK_WEBHOOK_URL_DATOS   # opcional
   npx wrangler deploy
   ```
   Revisa `ALLOWED_ORIGINS` en `wrangler.toml`: solo esos dominios pueden enviar.
3. **Sitio:** pega la URL del Worker en `FORM_ENDPOINT` (archivo `form_section.py`), corre `python3 build.py` y haz commit. Sin endpoint, el formulario funciona en **modo vista previa**: valida y muestra el mensaje que llegaría a Slack, pero no envía nada.

## Probar

```bash
node test.mjs   # validación, honeypot, CORS, ruteo por canal y escape de menciones
```

## Esquema del payload (`datamate.b2b_lead.v1`)

| Campo | Tipo | Notas |
|---|---|---|
| `tipo` | `etapa` · `fde` · `datos` · `alianza` | Obligatorio |
| `detalles` | objeto | Según `tipo`: `etapas[]` · `foco[]`, `modalidad`, `dedicacion`, `duracion`, `stack` · `tipos[]`, `idiomas[]`, `volumen` · `tipo_alianza` |
| `contacto` | `nombre`, `cargo`, `empresa`, `email`, `pais`, `telefono?` | |
| `empresa` | `tamano`, `industria?`, `web?` | |
| `contexto` | `mensaje` (20–2000), `plazo`, `presupuesto?`, `origen?` | |
| `consentimiento` | `true` | Obligatorio |
| `meta` | `pagina`, `enviado` (ISO), `utm{}` | |
| `fax` | string | Honeypot: si viene con texto, responde OK y no publica |

## Seguridad

- CORS solo para `ALLOWED_ORIGINS`; el resto recibe 403.
- Tamaño máximo 16 KB; validación de cada campo con límites de largo.
- El texto se escapa antes de ir a Slack, así que nadie puede disparar `@channel` desde el formulario.
- No guarda nada: si quieren historial, el siguiente paso es escribir también a una tabla o a la CRM.
- Recomendado al publicar: una regla de *rate limiting* de Cloudflare sobre la ruta del Worker (por ejemplo 5 envíos por minuto por IP).
