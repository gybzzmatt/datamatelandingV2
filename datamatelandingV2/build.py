import json, html, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from form_section import form_html
ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
HUB = "https://hub.datamate.cl"
MAIL = "hello@datamate.cl"
ENSO = "M26 6 C36 6 40 14 40 22 C40 30 34 38 22 38 C12 38 4 31 4 22 C4 13 10 6 18 5.2"
STAGES = [
 dict(id="presencia", n=1, name="Presencia", quote="No me encuentran en internet.", solution="Landing, sitio web, SEO y GEO", detail="Tu negocio aparece cuando te buscan en Google, en mapas y en los asistentes de IA, y cada visita tiene una forma clara de contactarte.", status="hoy", note=""),
 dict(id="orden", n=2, name="Orden", quote="Todo está en Excel y WhatsApp.", solution="ERP o sistema a medida, CRM", detail="Clientes, ventas, inventario y facturas en un solo sistema hecho para tu forma de operar, no en cinco archivos sueltos.", status="hoy", note=""),
 dict(id="automatizacion", n=3, name="Automatización", quote="Mi equipo no da abasto.", solution="Agentes de IA: Soul para hoteles y agentes a medida", detail="Las tareas repetitivas pasan a agentes con reglas claras: qué pueden hacer solos y qué necesita tu aprobación.", status="pilotos", note=""),
 dict(id="inteligencia", n=4, name="Inteligencia", quote="Tengo datos y no los uso.", solution="Datos y analítica para pymes", detail="Tus datos ordenados responden preguntas de negocio: qué se vende, qué cae y dónde actuar primero.", status="pronto", note="La entregaremos con un partner. La anunciamos cuando el acuerdo esté firmado."),
 dict(id="confianza", n=5, name="Confianza y escala", quote="Mis clientes me piden seguridad y mi equipo no sabe usar IA.", solution="Formación en IA y preparación para ISO 27001", detail="Tu equipo aprende a usar IA en su trabajo diario y tu empresa llega preparada a una auditoría.", status="preparacion", note="Preparamos; la certificación la emite una entidad independiente."),
]
STATUS = {"hoy":("Se entrega hoy","tone-green"),"pilotos":("En pilotos","tone-blue"),"pronto":("Próximamente","tone-muted"),"preparacion":("En preparación","tone-muted")}

def glyph(i, attrs=""):
    o = f'<svg {attrs} viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    if i=="presencia": b='<circle cx="60" cy="60" r="5" fill="currentColor" stroke="none"/><path d="M42 78a25.5 25.5 0 0 1 0-36M78 42a25.5 25.5 0 0 1 0 36"/><path d="M28 92a45 45 0 0 1 0-64M92 28a45 45 0 0 1 0 64" opacity=".45"/>'
    elif i=="orden": b="".join(f'<rect x="{x}" y="{y}" width="24" height="24" rx="5" fill="{"currentColor" if x==48 and y==48 else "none"}"/>' for y in (18,48,78) for x in (18,48,78))
    elif i=="automatizacion": b='<circle cx="24" cy="60" r="10"/><circle cx="60" cy="30" r="10"/><circle cx="60" cy="90" r="10"/><circle cx="96" cy="60" r="10" fill="currentColor"/><path d="M32 53.5 52 36.5M32 66.5 52 83.5M68 36.5 88 53.5M68 83.5 88 66.5"/>'
    elif i=="inteligencia": b='<path d="M18 102h84" opacity=".45"/><path d="M80 46v56" stroke-dasharray="3 6" opacity=".45"/><path d="M22 84 42 70 60 76 80 46 100 30"/><circle cx="80" cy="46" r="6" fill="currentColor" stroke="none"/>'
    else: b='<path d="M60 20 100 41 60 62 20 41Z"/><path d="M20 60 60 81 100 60"/><path d="M20 79 60 100 100 79" opacity=".45"/>'
    return o+b+"</svg>"

def enso(attrs, sw="2.2"):
    return f'<svg {attrs} viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="{ENSO}" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round"/></svg>'

def mailto(subject="Diagnóstico de etapa"):
    from urllib.parse import quote
    return f"mailto:{MAIL}?subject={quote(subject)}"

LOGO_ATTR = 'width="30" height="30"'
logo = f'<span class="logo">{enso(LOGO_ATTR,"3.5")}<span class="logo-word">DATAMATE</span></span>'
finder_opts = "\n".join(f'<button type="button" class="finder-option" id="finder-{s["id"]}" data-stage="{s["id"]}" aria-pressed="false">“{s["quote"]}”</button>' for s in STAGES)
stack = "".join(glyph(s["id"], 'data-step-visual class="glyph-lg"') for s in STAGES)
steps = ""
for s in STAGES:
    lab, tone = STATUS[s["status"]]
    note = f'<span class="note">{s["note"]}</span>' if s["note"] else ""
    steps += f'''<li data-step class="step">
  <span class="step-dot" aria-hidden="true"></span>
  {glyph(s["id"], 'data-step-glyph-inline class="glyph-sm"')}
  <p class="mono-label c-blue">ETAPA {s["n"]} · {s["name"]}</p>
  <h3 class="step-quote">“{s["quote"]}”</h3>
  <p class="step-solution">{s["solution"]}</p>
  <p class="prose step-detail">{s["detail"]}</p>
  <p class="step-meta"><span class="chip {tone}">{lab}</span>{note}</p>
</li>\n'''

METHOD = [("Diagnóstico de etapa","Una sesión de 90 minutos sobre tu operación y un informe con tus 3 prioridades. Sales sabiendo qué hacer primero."),
 ("Implementación a precio fijo","Un problema, un entregable, un plazo. El precio se acuerda por escrito antes de empezar."),
 ("Acompañamiento mensual","Mantenimiento, mejoras y soporte de lo que ya funciona, y el diagnóstico de la etapa que sigue.")]
method = "".join(f'<li class="method-row"><span class="method-n">{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></li>' for i,(t,d) in enumerate(METHOD))
WORK = [("Sitios web con posicionamiento para negocios de servicios y distribución.",'<span class="mono-label c-muted">ETAPA 1 · PRESENCIA</span>'),
 ("Un sistema de gestión a medida para una empresa manufacturera.",'<span class="mono-label c-muted">ETAPA 2 · ORDEN</span>'),
 ("Soul, nuestro equipo de agentes para hoteles.",'<span class="mono-label c-muted">ETAPA 3 · EN PILOTOS</span>'),
 ("Operaciones de datos con expertos de Latinoamérica para empresas de IA de Estados Unidos.",f'<a class="mono-label link" href="{HUB}/proyectos">RED DE EXPERTOS</a>')]
work = "".join(f'<li class="work-row"><p>{t}</p>{l}</li>' for t,l in WORK)
SOUL_WAIT = f"{HUB}/soul?utm_source=datamate-web&utm_medium=ecosystem&utm_campaign=landing_soul#lista"
SOUL_FOOT = f"{HUB}/soul?utm_source=datamate-web&utm_medium=ecosystem&utm_campaign=footer"
SOUL_DEMO = "https://soulmate-agent-hub.lovable.app/?utm_source=datamate-web&utm_medium=ecosystem&utm_campaign=landing_soul"
FAQ = [("¿Tengo que pasar por las cinco etapas?","No. El diagnóstico ubica tu siguiente paso útil. Muchas empresas resuelven una etapa y siguen por su cuenta."),
 ("¿Cuánto cuesta?","Cada implementación tiene un precio fijo, acordado por escrito antes de empezar. El valor del diagnóstico te lo enviamos antes de agendar."),
 ("¿Certifican ISO 27001?","No. Preparamos a tu empresa para la auditoría; la certificación la emite una entidad certificadora independiente."),
 ("¿Soul ya está disponible?",f'Está en etapa de pilotos con los primeros hoteles. <a class="link" href="{SOUL_WAIT}">Sumarme a la lista de espera</a>'),
 ("¿Dónde está el equipo?","En Panamá y Chile. Trabajamos en remoto con empresas de Latinoamérica."),
 ("¿Sigue la red de expertos de DataMate?",f'Sí, para proyectos de expertos contribuidores. <a class="link" href="{HUB}/proyectos">Ver proyectos</a>')]
faq = "".join(f'<details class="faq"><summary>{q}</summary><p>{a}</p></details>' for q,a in FAQ)

CHAT=[("agent","Revenue · Soul","El sábado vas al 96% y tres hoteles de la zona están sobre CLP 110 mil. Propongo subir de CLP 94 mil a 108 mil."),("human","Gerente","Dale, apruebo."),("agent","Revenue · Soul","Listo. Publicado en todos los canales y guardado en el registro de cambios.")]
chat="".join(f'<li class="soul-msg {"is-human" if f=="human" else ""}"><span class="soul-label">{l}</span><p class="soul-bubble {"soul-bubble-human" if f=="human" else "soul-bubble-agent"}">{t}</p></li>' for f,l,t in CHAT)
IC={"sliders":'<path d="M10 5H3M21 5h-7M14 3v4M21 12h-9M8 12H3M8 10v4M12 19H3M21 19h-5M16 17v4"/>',
"stop":'<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9Z"/><path d="m15 9-6 6M9 9l6 6"/>',
"key":'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 11.5 9.5-9.5M16 7l3 3"/>',
"trend":'<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>'}
TRUST=[("sliders","Autonomía que tú ajustas: propone, actúa dentro de un margen o actúa y se detiene en casos críticos."),("stop","Reglas de parada visibles: cada agente muestra qué nunca hace sin tu firma."),("key","Bóveda y billetera con límites: credenciales y gastos solo dentro de topes, todo registrado."),("trend","Autonomía ganada: Soul pide más libertad solo después de un historial limpio.")]
trust="".join(f'<li><span class="soul-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{IC[i]}</svg></span><span class="soul-text">{t}</span></li>' for i,t in TRUST)
CHIP_OK='<span class="soul-chip soul-chip-ok">ACTIVO</span>'
CHIP_SOON='<span class="soul-chip soul-chip-soon">PRONTO</span>'
ROSTER=[("Comercial",[("Analista de revenue",1),("Eventos y grupos",1),("Marketing y redes",1),("Upsell y servicios",0)]),("Experiencia del huésped",[("Reputación",1),("Recepción nocturna 23–07 h",1),("Concierge de destino",0)]),("Operaciones",[("Mantenimiento",1),("Housekeeping",0)]),("Administración",[("Caja y facturación",0),("Planificación de turnos",0)])]
roster="".join(f'<div><h4>{a}</h4><dl>'+"".join(f'<div class="soul-row"><dt>{n}</dt><dd>{CHIP_OK if ok else CHIP_SOON}</dd></div>' for n,ok in ag)+'</dl></div>' for a,ag in ROSTER)

css = open(P("site.css")).read()
js = open(P("src","site.js")).read().replace("__STAGES__", json.dumps([{k:s[k] for k in ("id","n","name","solution","status")} for s in STAGES], ensure_ascii=False)).replace("__STATUS__", json.dumps(STATUS, ensure_ascii=False)).replace("__MAIL__", MAIL)

TITLE="DataMate"
DESC="Identificamos en qué etapa de madurez digital está tu empresa y ejecutamos el siguiente paso: presencia, orden, automatización, datos y seguridad. Equipo en Panamá y Chile."
FONTS='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:ital,wght@0,400;0,500;1,400&family=Syne:wght@800&display=swap">'
FORM = form_html()
body = f'''
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="site-header">
  <nav class="wrap nav" aria-label="Principal">
    <a href="#inicio" aria-label="DataMate, inicio">{logo}</a>
    <ul class="nav-links">
      <li><a href="#etapas">Etapas</a></li><li><a href="#metodo">Cómo trabajamos</a></li><li><a href="#entregas">Lo que entregamos</a></li><li><a href="#soul">Soul</a></li>
    </ul>
    <div class="nav-right">
      <a class="nav-text" href="{HUB}/proyectos">Red de expertos</a>
      <a class="btn-primary btn-sm" href="#contacto">Agendar diagnóstico</a>
      <details class="menu"><summary aria-label="Abrir menú"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
        <div class="menu-panel"><a href="#etapas">Etapas</a><a href="#metodo">Cómo trabajamos</a><a href="#entregas">Lo que entregamos</a><a href="#soul">Soul</a><a href="{HUB}/proyectos">Red de expertos</a></div></details>
    </div>
  </nav>
</header>

<div class="bg-aurora">
<section id="inicio" class="hero" aria-labelledby="hero-title" data-hero>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="mono-label c-blue">TECNOLOGÍA E IA PARA PYMES</p>
      <h1 id="hero-title" class="h1" data-hero-title>Transformación digital, una etapa a la vez.</h1>
      <p class="prose lead" data-hero-in>Identificamos en qué etapa de madurez digital está tu empresa y ejecutamos contigo el siguiente paso: presencia, orden, automatización, datos o seguridad.</p>
      <div class="cta-row">
        <a data-hero-in class="btn-primary" href="#contacto">Agendar diagnóstico →</a>
        <a data-hero-in class="btn-ghost" href="#etapas">Ver las 5 etapas</a>
      </div>
      <p class="mono-label c-muted" data-hero-in>PANAMÁ · CHILE · REMOTO EN LATAM</p>
    </div>
    <aside class="finder card-glass" aria-labelledby="finder-title" data-hero-in>
      <h2 id="finder-title">¿Qué frase suena a tu empresa?</h2>
      <div class="finder-list" role="group" aria-labelledby="finder-title">
{finder_opts}
      </div>
      <div class="finder-result" id="finder-result" aria-live="polite"><p class="finder-hint">Elige una frase y te mostramos tu etapa y la solución que le corresponde.</p></div>
    </aside>
  </div>
  {enso('class="hero-enso" data-hero-enso')}
</section>
</div>

<main id="contenido">
<section class="section" aria-label="Declaración">
  <div class="wrap"><p class="statement" data-statement>La mayoría de las pymes no necesita más tecnología. Necesita saber cuál es su siguiente paso y a alguien que lo ejecute con ella.</p></div>
</section>

<section id="etapas" class="section bg-surface" aria-labelledby="etapas-title" data-steps>
  <div class="wrap" data-steps-inner>
    <h2 id="etapas-title" class="h2" style="max-width:18ch">Cada etapa empieza con una frase que ya dijiste.</h2>
    <p class="prose" style="max-width:56ch;margin-top:20px">No es una escalera obligatoria: puedes ir adelantado en ventas y atrasado en operaciones. Buscamos tu siguiente paso útil.</p>
    <div class="steps-grid">
      <div class="steps-aside-col">
        <div class="steps-aside" data-steps-aside>
          <div class="enso-stage">{enso('class="steps-enso" data-steps-enso')}<div class="stage-visual-stack">{stack}</div></div>
          <div class="progress-col">
            <div class="progress-track" aria-hidden="true"><div class="progress-fill" data-progress></div></div>
            <p class="mono-label c-muted" data-step-counter aria-hidden="true">ETAPA 1 / 5</p>
          </div>
        </div>
      </div>
      <ol class="steps-list" data-steps-list>
{steps}      </ol>
    </div>
  </div>
</section>

<section id="metodo" class="section" aria-labelledby="metodo-title">
  <div class="wrap method-grid">
    <div><h2 id="metodo-title" class="h2" style="max-width:14ch">Tres pasos, siempre en este orden.</h2><p class="prose" style="margin-top:24px">Te decimos lo que no podemos hacer.</p></div>
    <ol class="method-list">{method}</ol>
  </div>
</section>

<section id="entregas" class="section bg-surface" aria-labelledby="entregas-title">
  <div class="wrap">
    <h2 id="entregas-title" class="h2">Lo que ya entregamos.</h2>
    <ul class="work-list">{work}</ul>
    <p class="fineprint">Publicamos el nombre de cada cliente cuando tenemos su autorización por escrito.</p>
  </div>
</section>

<section id="soul" aria-labelledby="soul-title" class="soul-scope soul-has-sky section">
  <div class="soul-sky" aria-hidden="true"><div class="soul-sky-inner"></div></div>
  <div class="wrap soul-content" data-soul-content>
    <div class="soul-glass soul-head">
      <div class="soul-pills"><p class="soul-pill" aria-label="Soul by DataMate"><span class="soul-logo">soul</span><span>by DataMate</span></p><p class="soul-pill">Otro producto de DataMate</p></div>
      <h2 id="soul-title" class="soul-h2">Automatizamos el back of the house. <em>Tu equipo, la experiencia.</em></h2>
      <p class="soul-lead">Colaboradores virtuales para que tu equipo se encargue de la experiencia y tu propiedad opere con más eficiencia.</p>
    </div>
    <div class="soul-grid">
      <div>
        <figure class="soul-glass soul-fig"><figcaption class="soul-caption">Ejemplo · Demo</figcaption><ol class="soul-chat" aria-label="Conversación de ejemplo por WhatsApp">{chat}</ol></figure>
        <h3 class="soul-h3" style="margin-top:48px">Por qué confiar</h3>
        <ul class="soul-trust">{trust}</ul>
      </div>
      <div>
        <div class="soul-glass soul-roster"><h3 class="soul-h3">Un equipo de agentes</h3><div class="soul-roster-list">{roster}</div></div>
        <div class="soul-actions">
          <a class="soul-cta" href="{SOUL_WAIT}">Unirme a la lista de espera →</a>
          <div class="soul-links"><a class="soul-link" href="{SOUL_DEMO}" target="_blank" rel="noopener" aria-label="Probar la demo de Soul (se abre en una pestaña nueva)">Probar la demo →</a><a class="soul-link" href="{mailto("Soul para mi hotel")}">Quiero Soul en mi hotel</a></div>
          <p class="soul-text" style="font-size:13px;margin-top:12px">Demo con datos de un hotel ficticio. Aún no conecta sistemas reales.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="limites-title">
  <div class="wrap two-col">
    <div><h2 id="limites-title" class="h2" style="max-width:12ch">Lo que no prometemos.</h2>
      <ul class="limits"><li>Resultados en porcentaje, hasta tener un caso medido que los respalde.</li><li>Plazos o alcances de palabra. Todo queda por escrito.</li><li>Lo que depende de un tercero (un partner, WhatsApp, tu sistema actual) como si dependiera solo de nosotros.</li></ul></div>
    <div class="faq-list">{faq}</div>
  </div>
</section>

{FORM}
</main>

<footer class="footer">
  <div class="wrap footer-grid">
    <div>{logo}<p class="footer-mail">{MAIL}</p></div>
    <nav aria-label="Soluciones"><p class="footer-h">Soluciones</p><a href="#etapas">Las 5 etapas</a><a href="#metodo">Cómo trabajamos</a><a href="#entregas">Lo que entregamos</a></nav>
    <nav aria-label="Productos DataMate"><p class="footer-h">Productos DataMate</p><a href="{SOUL_FOOT}">Soul, agentes para hotelería</a><a href="{HUB}/proyectos">Red de expertos</a></nav>
    <nav aria-label="Legal"><p class="footer-h">Legal</p><a href="{HUB}/terminos">Términos</a><a href="{HUB}/privacidad">Privacidad</a></nav>
  </div>
  <div class="wrap"><p class="mono-label c-muted" style="margin-top:40px">DATAMATE · PANAMÁ · CHILE</p></div>
</footer>
'''
LIBS='''<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>'''
os.makedirs(P("build"), exist_ok=True)
frag = f'<title>{TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{FONTS}\n<style>\n{css}\n</style>\n{body}\n{LIBS}\n<script>\n{js}\n</script>\n'
open(P("build","datamate-home.artifact.html"),"w").write(frag)
full = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>DataMate — Transformación digital para pymes, una etapa a la vez</title>
<meta name="description" content="{DESC}">
<meta property="og:title" content="DataMate — Transformación digital para pymes, una etapa a la vez">
<meta property="og:description" content="{DESC}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{FONTS}
<link rel="stylesheet" href="site.css">
</head>
<body>
{body}
{LIBS}
<script>
{js}
</script>
</body>
</html>
'''
open(P("index.html"),"w").write(full)
print(len(frag))
