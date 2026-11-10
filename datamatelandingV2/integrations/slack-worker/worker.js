/**
 * DataMate · formulario B2B → Slack
 * Cloudflare Worker que recibe el JSON del formulario (schema datamate.b2b_lead.v1),
 * lo valida y lo publica en el canal interno con un Incoming Webhook de Slack.
 *
 * Secretos / variables (wrangler secret put …):
 *   SLACK_WEBHOOK_URL          obligatorio: canal por defecto (ej. #leads)
 *   SLACK_WEBHOOK_URL_FDE      opcional: canal para Forward Deployed Engineer
 *   SLACK_WEBHOOK_URL_DATOS    opcional: canal para proyectos de datos
 *   ALLOWED_ORIGINS            obligatorio: orígenes permitidos separados por coma
 *                              (ej. https://datamate.cl,https://www.datamate.cl,https://gybzzmatt.github.io)
 * El webhook nunca llega al navegador: vive solo aquí.
 */

const TYPE_LABEL = { etapa: "Solución por etapa", fde: "Forward Deployed Engineer", datos: "Proyecto de datos", alianza: "Alianza o partnership" };
const STAGE_LABEL = { presencia: "1 · Presencia", orden: "2 · Orden", automatizacion: "3 · Automatización", inteligencia: "4 · Inteligencia", confianza: "5 · Confianza y escala", "no-se": "No sabe: quiere diagnóstico" };
const FREE_MAIL = /@(gmail|hotmail|outlook|yahoo|live|icloud)\./i;
const MAX_BODY = 16 * 1024;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, cors);
    if (!allowed.includes(origin)) return json({ ok: false, error: "origin" }, 403, cors);

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, error: "too_large" }, 413, cors);
    let p;
    try { p = JSON.parse(raw); } catch { return json({ ok: false, error: "json" }, 400, cors); }

    // Honeypot: responde OK sin publicar nada.
    if (p && typeof p.fax === "string" && p.fax.trim()) return json({ ok: true }, 200, cors);

    const problem = validate(p);
    if (problem) return json({ ok: false, error: problem }, 422, cors);

    const hook = (p.tipo === "fde" && env.SLACK_WEBHOOK_URL_FDE) || (p.tipo === "datos" && env.SLACK_WEBHOOK_URL_DATOS) || env.SLACK_WEBHOOK_URL;
    if (!hook) return json({ ok: false, error: "not_configured" }, 500, cors);

    const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toSlack(p)) });
    if (!res.ok) return json({ ok: false, error: "slack" }, 502, cors);
    return json({ ok: true }, 200, cors);
  },
};

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

const str = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const opt = (v, max) => v === undefined || v === "" || (typeof v === "string" && v.length <= max);
const list = (v) => Array.isArray(v) && v.length <= 10 && v.every((x) => typeof x === "string" && x.length <= 120);

function validate(p) {
  if (!p || p.schema !== "datamate.b2b_lead.v1") return "schema";
  if (!TYPE_LABEL[p.tipo]) return "tipo";
  const c = p.contacto || {}, e = p.empresa || {}, x = p.contexto || {}, d = p.detalles || {};
  if (!str(c.nombre, 120) || !str(c.cargo, 120) || !str(c.empresa, 160) || !str(c.pais, 60)) return "contacto";
  if (!str(c.email, 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) return "email";
  if (!opt(c.telefono, 30) || !opt(e.industria, 80) || !opt(e.web, 200) || !str(e.tamano, 40)) return "empresa";
  if (!str(x.mensaje, 2000) || x.mensaje.trim().length < 20 || !str(x.plazo, 60) || !opt(x.presupuesto, 60) || !opt(x.origen, 60)) return "contexto";
  if (p.consentimiento !== true) return "consentimiento";
  if (p.tipo === "etapa" && !(list(d.etapas) && d.etapas.length)) return "detalles";
  if (p.tipo === "fde" && !(list(d.foco) && d.foco.length)) return "detalles";
  if (p.tipo === "datos" && !(list(d.tipos) && d.tipos.length)) return "detalles";
  if (p.tipo === "alianza" && !str(d.tipo_alianza, 80)) return "detalles";
  return null;
}

/** Escapa los caracteres de control de mrkdwn de Slack y corta menciones como <!channel>. */
const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toSlack(p) {
  const d = p.detalles || {}, c = p.contacto, e = p.empresa, x = p.contexto;
  const rows = [["Tipo", TYPE_LABEL[p.tipo]]];
  if (p.tipo === "etapa") rows.push(["Etapas", d.etapas.map((s) => STAGE_LABEL[s] || s).join(", ")]);
  if (p.tipo === "fde") {
    rows.push(["Foco", d.foco.join(", ")]);
    rows.push(["Formato", [d.modalidad, d.dedicacion, d.duracion].filter(Boolean).join(" · ") || "—"]);
    if (d.stack) rows.push(["Stack", d.stack]);
  }
  if (p.tipo === "datos") {
    rows.push(["Proyecto", d.tipos.join(", ")]);
    if (d.idiomas && d.idiomas.length) rows.push(["Idiomas", d.idiomas.join(", ")]);
    if (d.volumen) rows.push(["Volumen", d.volumen]);
  }
  if (p.tipo === "alianza") rows.push(["Alianza", d.tipo_alianza]);
  rows.push(["Contacto", `${c.nombre} · ${c.cargo}`]);
  rows.push(["Empresa", [c.empresa, `${e.tamano} personas`, e.industria, c.pais].filter(Boolean).join(" · ")]);
  rows.push(["Email", c.email + (FREE_MAIL.test(c.email) ? "  _(correo personal)_" : "")]);
  if (c.telefono) rows.push(["Teléfono", c.telefono]);
  rows.push(["Plazo", [x.plazo, x.presupuesto].filter(Boolean).join(" · ")]);
  if (e.web) rows.push(["Web", e.web]);
  if (x.origen) rows.push(["Origen", x.origen]);
  const utm = (p.meta && p.meta.utm) || {};
  const utmText = Object.keys(utm).map((k) => `${k}=${utm[k]}`).join(" · ");

  const title = `Nuevo lead B2B · ${TYPE_LABEL[p.tipo]} · ${c.empresa}`;
  return {
    text: title, // notificación y fallback
    blocks: [
      { type: "header", text: { type: "plain_text", text: title.slice(0, 150), emoji: false } },
      { type: "section", fields: rows.slice(0, 10).map(([k, v]) => ({ type: "mrkdwn", text: `*${esc(k)}*\n${esc(v)}` })) },
      ...(rows.length > 10 ? [{ type: "section", fields: rows.slice(10).map(([k, v]) => ({ type: "mrkdwn", text: `*${esc(k)}*\n${esc(v)}` })) }] : []),
      { type: "section", text: { type: "mrkdwn", text: "*Qué quiere resolver*\n>" + esc(x.mensaje).slice(0, 2800).replace(/\n/g, "\n>") } },
      { type: "context", elements: [{ type: "mrkdwn", text: esc([p.meta && p.meta.pagina, p.meta && p.meta.enviado, utmText].filter(Boolean).join(" · ")) || "datamate.cl" }] },
    ],
  };
}

export { validate, toSlack };
