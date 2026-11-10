"""Formulario B2B del homepage. Lo importa build.py; el contenido de las opciones vive aquí."""
from html import escape

FORM_ENDPOINT = ""  # URL del Worker que reenvía a Slack (integrations/slack-worker). Vacío = modo vista previa.
CALENDAR_URL = "https://calendar.app.google/RGbMFkhDrxdj8udg7"

COUNTRIES = ["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Ecuador", "El Salvador", "España",
             "Estados Unidos", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú",
             "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela", "Otro"]
SIZES = ["1–10", "11–50", "51–200", "201–1.000", "Más de 1.000"]
INDUSTRIES = ["Hotelería y turismo", "Retail y comercio", "Manufactura", "Logística y distribución", "Servicios profesionales",
              "Salud", "Educación", "Finanzas y seguros", "Tecnología", "Sector público", "Otra"]
TYPES = [
    ("etapa", "Solución por etapa", "Presencia, orden, automatización, datos o seguridad para tu empresa."),
    ("fde", "Forward Deployed Engineer", "Un ingeniero de DataMate trabajando dentro de tu equipo hasta dejar la solución en producción."),
    ("datos", "Proyecto de datos", "Anotación, evaluación de modelos, preparación de datos o analítica, con alcance cerrado."),
    ("alianza", "Alianza o partnership", "Integración tecnológica, referidos o proyectos conjuntos."),
]
STAGE_OPTS = [("presencia", "1 · Presencia"), ("orden", "2 · Orden"), ("automatizacion", "3 · Automatización"),
              ("inteligencia", "4 · Inteligencia"), ("confianza", "5 · Confianza y escala"), ("no-se", "No lo sé: quiero el diagnóstico")]
FDE_FOCUS = ["Integrar IA en sistemas que ya usamos", "Agentes y automatización de procesos", "Ingeniería de datos y pipelines",
             "Llevar un modelo a producción", "Otro"]
FDE_MODE = ["Remoto", "Híbrido", "Presencial (Panamá o Chile)"]
FDE_DEDICATION = ["Tiempo completo", "Medio tiempo", "Por hitos"]
FDE_DURATION = ["Menos de 1 mes", "1–3 meses", "3–6 meses", "Más de 6 meses", "Aún no lo sé"]
DATA_TYPES = ["Anotación y etiquetado", "Evaluación de modelos y RLHF", "Preparación y limpieza de datos",
              "Pipelines e ingeniería de datos", "Analítica y tableros", "Otro"]
LANGS = ["Español", "Portugués", "Inglés", "Otro"]
ALLIANCE = ["Integración tecnológica", "Referidos o reventa", "Proyecto conjunto", "Otro"]
TIMING = ["Lo antes posible", "En 1–3 meses", "Estoy explorando"]
BUDGET = ["Ya tenemos presupuesto", "Lo estamos definiendo", "Todavía no"]
SOURCES = ["Recomendación", "LinkedIn", "Google o un asistente de IA", "Evento", "Otro"]


def _opts(items, placeholder):
    return f'<option value="">{placeholder}</option>' + "".join(f"<option>{escape(i)}</option>" for i in items)


def _checks(name, items, kind="checkbox"):
    out = []
    for i, it in enumerate(items):
        val, label = it if isinstance(it, tuple) else (it, it)
        out.append(f'<label class="opt" for="f-{name}-{i}"><input type="{kind}" id="f-{name}-{i}" name="{name}" value="{escape(val)}"><span>{escape(label)}</span></label>')
    return "".join(out)


def _field(fid, label, control, hint="", req=False, wide=False):
    star = '<span class="req" aria-hidden="true">*</span>' if req else '<span class="opt-tag">opcional</span>'
    h = f'<p class="hint" id="{fid}-hint">{hint}</p>' if hint else ""
    return f'<div class="field{" field-wide" if wide else ""}" data-field="{fid}"><label for="{fid}">{label} {star}</label>{control}{h}<p class="err" id="{fid}-err" hidden></p></div>'


def _group(gid, legend, inner, req=False, hint=""):
    star = '<span class="req" aria-hidden="true">*</span>' if req else '<span class="opt-tag">opcional</span>'
    h = f'<p class="hint">{hint}</p>' if hint else ""
    return f'<fieldset class="group" id="{gid}" data-field="{gid}"><legend>{legend} {star}</legend>{h}<div class="opts">{inner}</div><p class="err" id="{gid}-err" hidden></p></fieldset>'


def form_html():
    types = "".join(
        f'<label class="type-card" for="f-tipo-{v}"><input type="radio" id="f-tipo-{v}" name="tipo" value="{v}"><span class="type-name">{t}</span><span class="type-desc">{d}</span></label>'
        for v, t, d in TYPES)
    contact = "".join([
        _field("f-nombre", "Nombre y apellido", '<input id="f-nombre" name="nombre" type="text" autocomplete="name" maxlength="120" required>', req=True),
        _field("f-cargo", "Cargo", '<input id="f-cargo" name="cargo" type="text" autocomplete="organization-title" maxlength="120" required>', req=True),
        _field("f-empresa", "Empresa", '<input id="f-empresa" name="empresa" type="text" autocomplete="organization" maxlength="160" required>', req=True),
        _field("f-email", "Email corporativo", '<input id="f-email" name="email" type="email" autocomplete="email" maxlength="200" required placeholder="tu@empresa.com">', req=True),
        _field("f-pais", "País", f'<select id="f-pais" name="pais" required>{_opts(COUNTRIES, "Selecciona")}</select>', req=True),
        _field("f-telefono", "Teléfono o WhatsApp", '<input id="f-telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" placeholder="+507 6000 0000" aria-describedby="f-telefono-hint">', hint="Con código de país."),
        _field("f-tamano", "Tamaño de la empresa", f'<select id="f-tamano" name="tamano" required>{_opts(SIZES, "Personas en la empresa")}</select>', req=True),
        _field("f-industria", "Industria", f'<select id="f-industria" name="industria">{_opts(INDUSTRIES, "Selecciona")}</select>'),
    ])
    panels = f'''
<div class="panel" data-panel="etapa" hidden>
  {_group("g-etapas", "¿En qué etapa necesitas ayuda?", _checks("etapas", STAGE_OPTS), req=True, hint="Puedes marcar más de una.")}
</div>
<div class="panel" data-panel="fde" hidden>
  {_group("g-fde-foco", "¿En qué trabajaría el ingeniero?", _checks("fde_foco", FDE_FOCUS), req=True)}
  <div class="row-3">
    {_field("f-fde-modalidad", "Modalidad", f'<select id="f-fde-modalidad" name="fde_modalidad">{_opts(FDE_MODE, "Selecciona")}</select>')}
    {_field("f-fde-dedicacion", "Dedicación", f'<select id="f-fde-dedicacion" name="fde_dedicacion">{_opts(FDE_DEDICATION, "Selecciona")}</select>')}
    {_field("f-fde-duracion", "Duración estimada", f'<select id="f-fde-duracion" name="fde_duracion">{_opts(FDE_DURATION, "Selecciona")}</select>')}
  </div>
  {_field("f-fde-stack", "Herramientas y sistemas que usan hoy", '<input id="f-fde-stack" name="fde_stack" type="text" maxlength="300" placeholder="Ej.: SAP, HubSpot, Google Workspace, Python, AWS">', wide=True)}
</div>
<div class="panel" data-panel="datos" hidden>
  {_group("g-datos-tipo", "¿Qué tipo de proyecto de datos?", _checks("datos_tipo", DATA_TYPES), req=True)}
  {_group("g-datos-idiomas", "Idiomas de los datos", _checks("datos_idiomas", LANGS))}
  {_field("f-datos-volumen", "Volumen o escala estimada", '<input id="f-datos-volumen" name="datos_volumen" type="text" maxlength="200" placeholder="Ej.: 20.000 registros, 6 meses de tickets de soporte">', wide=True)}
</div>
<div class="panel" data-panel="alianza" hidden>
  {_field("f-alianza-tipo", "Tipo de alianza", f'<select id="f-alianza-tipo" name="alianza_tipo" required>{_opts(ALLIANCE, "Selecciona")}</select>', req=True)}
</div>'''
    context = "".join([
        _field("f-mensaje", "¿Qué quieres resolver?", '<textarea id="f-mensaje" name="mensaje" rows="5" minlength="20" maxlength="2000" required aria-describedby="f-mensaje-hint" placeholder="El problema, cómo lo resuelven hoy y qué cambiaría si estuviera resuelto."></textarea>',
               hint="Mínimo 20 caracteres. No incluyas contraseñas ni datos personales de clientes.", req=True, wide=True),
        _field("f-plazo", "¿Cuándo quieres empezar?", f'<select id="f-plazo" name="plazo" required>{_opts(TIMING, "Selecciona")}</select>', req=True),
        _field("f-presupuesto", "Presupuesto", f'<select id="f-presupuesto" name="presupuesto">{_opts(BUDGET, "Selecciona")}</select>'),
        _field("f-web", "Sitio web de la empresa", '<input id="f-web" name="web" type="url" inputmode="url" maxlength="200" placeholder="https://">'),
        _field("f-origen", "¿Cómo nos conociste?", f'<select id="f-origen" name="origen">{_opts(SOURCES, "Selecciona")}</select>'),
    ])
    return f'''
<section id="contacto" class="section door" aria-labelledby="contacto-title">
  <div class="wrap contact-grid">
    <div class="contact-intro">
      <h2 id="contacto-title" class="h2" style="max-width:13ch">Cuéntanos qué necesitas.</h2>
      <p class="prose" style="margin-top:20px">Para una etapa de tu empresa, un ingeniero dentro de tu equipo o un proyecto de datos con alcance cerrado. Toma unos 3 minutos.</p>
      <ol class="next-steps" aria-label="Qué pasa después de enviar">
        <li><span class="method-n">1</span><p>Tu solicitud llega directo al equipo de DataMate.</p></li>
        <li><span class="method-n">2</span><p>La revisamos y te escribimos para coordinar.</p></li>
        <li><span class="method-n">3</span><p>Agendamos el diagnóstico y te enviamos su valor antes de la sesión.</p></li>
      </ol>
      <p class="fineprint">¿Prefieres correo? <span class="select-all">hello@datamate.cl</span></p>
    </div>

    <div class="form-shell">
      <form id="b2b-form" class="b2b-form card-glass" novalidate data-endpoint="{escape(FORM_ENDPOINT)}" aria-describedby="form-req-note">
        <p id="form-req-note" class="fineprint" style="margin-top:0">Los campos con <span class="req" aria-hidden="true">*</span><span class="sr-only">asterisco</span> son obligatorios.</p>
        <div class="err-summary" id="err-summary" tabindex="-1" hidden><p><strong>Revisa estos campos:</strong></p><ul id="err-list"></ul></div>

        <fieldset class="step">
          <legend class="step-legend"><span class="method-n">1</span>¿Qué tipo de ayuda buscas? <span class="req" aria-hidden="true">*</span></legend>
          <div class="type-grid" data-field="g-tipo" id="g-tipo">{types}</div>
          <p class="err" id="g-tipo-err" hidden></p>
          {panels}
        </fieldset>

        <fieldset class="step">
          <legend class="step-legend"><span class="method-n">2</span>Tu empresa</legend>
          <div class="row-2">{contact}</div>
        </fieldset>

        <fieldset class="step">
          <legend class="step-legend"><span class="method-n">3</span>Contexto</legend>
          <div class="row-2">{context}</div>
        </fieldset>

        <div class="hp" aria-hidden="true"><label for="f-fax">No llenar este campo</label><input id="f-fax" name="fax" type="text" tabindex="-1" autocomplete="off"></div>

        <div class="consent" data-field="f-consent">
          <label class="opt" for="f-consent"><input type="checkbox" id="f-consent" name="consentimiento" value="si" required><span>Acepto que DataMate use estos datos para responder mi solicitud. <a class="link" href="https://hub.datamate.cl/privacidad">Política de privacidad</a></span></label>
          <p class="err" id="f-consent-err" hidden></p>
        </div>

        <div class="submit-row">
          <button type="submit" class="btn-primary" id="b2b-submit">Enviar solicitud →</button>
          <p class="fineprint" id="submit-status" role="status" aria-live="polite" style="margin-top:0"></p>
        </div>
      </form>

      <div class="form-done card-glass" id="form-done" tabindex="-1" hidden>
        <p class="mono-label c-blue" id="done-label">SOLICITUD RECIBIDA</p>
        <h3 class="done-title" id="done-title">Gracias. Ya la tiene el equipo.</h3>
        <p class="prose" id="done-text" style="margin-top:12px"></p>
        <div class="cta-row" style="margin-top:24px">
          <a class="btn-primary" href="{CALENDAR_URL}" target="_blank" rel="noopener">Agendar el diagnóstico →</a>
          <button type="button" class="btn-ghost" id="form-again">Enviar otra solicitud</button>
        </div>
        <div class="slack-preview" id="slack-preview" hidden>
          <p class="mono-label c-muted">VISTA PREVIA DEL MENSAJE EN SLACK</p>
          <div class="slack-msg" id="slack-msg"></div>
        </div>
      </div>
    </div>
  </div>
</section>'''
