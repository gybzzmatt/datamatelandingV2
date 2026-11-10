// node test.mjs — prueba validación, honeypot, CORS y el armado de Block Kit sin llamar a Slack.
import worker, { validate, toSlack } from "./worker.js";
import assert from "node:assert/strict";

const base = {
  schema: "datamate.b2b_lead.v1", tipo: "fde",
  detalles: { foco: ["Agentes y automatización de procesos"], modalidad: "Remoto", dedicacion: "", duracion: "1–3 meses", stack: "HubSpot <!channel>" },
  contacto: { nombre: "Ana Ejemplo", cargo: "Gerenta", empresa: "Empresa Demo", email: "ana@empresademo.com", telefono: "", pais: "Panamá" },
  empresa: { tamano: "51–200", industria: "", web: "" },
  contexto: { mensaje: "Queremos clasificar pedidos de WhatsApp y cargarlos al ERP.", plazo: "En 1–3 meses", presupuesto: "", origen: "" },
  consentimiento: true, meta: { pagina: "https://datamate.cl/", enviado: "2026-11-10T00:00:00Z", utm: { utm_source: "linkedin" } }, fax: "",
};
assert.equal(validate(base), null);
assert.equal(validate({ ...base, consentimiento: false }), "consentimiento");
assert.equal(validate({ ...base, contacto: { ...base.contacto, email: "x" } }), "email");
assert.equal(validate({ ...base, detalles: { foco: [] } }), "detalles");
const msg = toSlack(base);
assert.ok(JSON.stringify(msg).includes("&lt;!channel&gt;"), "las menciones se escapan");
assert.equal(msg.blocks[0].type, "header");

const env = { ALLOWED_ORIGINS: "https://datamate.cl", SLACK_WEBHOOK_URL: "https://hooks.slack.test/x" };
let posted = null;
globalThis.fetch = async (url, init) => { posted = { url, body: JSON.parse(init.body) }; return new Response("ok", { status: 200 }); };
const req = (body, origin = "https://datamate.cl") => new Request("https://w.test/", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });

assert.equal((await worker.fetch(req(base, "https://evil.test"), env)).status, 403);
posted = null; assert.equal((await worker.fetch(req({ ...base, fax: "spam" }), env)).status, 200); assert.equal(posted, null, "honeypot no publica");
assert.equal((await worker.fetch(req({ ...base, tipo: "x" }), env)).status, 422);
const ok = await worker.fetch(req(base), env);
assert.equal(ok.status, 200); assert.equal(posted.url, env.SLACK_WEBHOOK_URL);
assert.equal((await worker.fetch(req(base), { ...env, SLACK_WEBHOOK_URL_FDE: "https://hooks.slack.test/fde" })).status, 200);
assert.equal(posted.url, "https://hooks.slack.test/fde", "FDE va a su canal");
console.log("worker tests ok ·", posted.body.text);
