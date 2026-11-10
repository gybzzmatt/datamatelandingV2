(function () {
  "use strict";
  var STAGES = __STAGES__;
  var STATUS = __STATUS__;
  var MAIL = "__MAIL__";

  /* Buscador de etapa (hero): solo estado en memoria. */
  var result = document.getElementById("finder-result");
  var options = Array.prototype.slice.call(document.querySelectorAll(".finder-option"));
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var s = STAGES.filter(function (x) { return x.id === btn.dataset.stage; })[0];
      if (!s || !result) return;
      options.forEach(function (o) { o.setAttribute("aria-pressed", String(o === btn)); });
      var st = STATUS[s.status];
      result.textContent = "";
      result.appendChild(el("p", "mono-label c-blue", "ETAPA " + s.n + " · " + s.name));
      result.appendChild(el("p", "finder-solution", s.solution));
      var meta = el("div", "finder-meta");
      meta.appendChild(el("span", "chip " + st[1], st[0]));
      var a = el("a", "link", "Pedir ayuda con esta etapa");
      a.href = "#contacto";
      a.addEventListener("click", function () { if (window.DMForm) window.DMForm.preselectStage(s.id); });
      meta.appendChild(a);
      result.appendChild(meta);
    });
  });

  /* ── Formulario B2B. Envía JSON al Worker de Slack (data-endpoint). Sin endpoint: modo vista previa. ── */
  var form = document.getElementById("b2b-form");
  if (form) (function () {
    var done = document.getElementById("form-done");
    var summary = document.getElementById("err-summary");
    var list = document.getElementById("err-list");
    var statusEl = document.getElementById("submit-status");
    var submitBtn = document.getElementById("b2b-submit");
    var endpoint = (form.getAttribute("data-endpoint") || "").trim();
    var TYPE_LABEL = { etapa: "Solución por etapa", fde: "Forward Deployed Engineer", datos: "Proyecto de datos", alianza: "Alianza o partnership" };
    var STAGE_LABEL = { presencia: "1 · Presencia", orden: "2 · Orden", automatizacion: "3 · Automatización", inteligencia: "4 · Inteligencia", confianza: "5 · Confianza y escala", "no-se": "No sabe: quiere diagnóstico" };
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var FREE_MAIL = /@(gmail|hotmail|outlook|yahoo|live|icloud)\./i;

    function val(name) { var f = form.elements[name]; return f ? String(f.value || "").trim() : ""; }
    function vals(name) { return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; }); }
    function tipo() { var c = form.querySelector('input[name="tipo"]:checked'); return c ? c.value : ""; }

    function showPanel() {
      var t = tipo();
      Array.prototype.forEach.call(form.querySelectorAll("[data-panel]"), function (p) { p.hidden = p.getAttribute("data-panel") !== t; });
    }
    Array.prototype.forEach.call(form.querySelectorAll('input[name="tipo"]'), function (r) { r.addEventListener("change", function () { showPanel(); clearErr("g-tipo"); }); });

    function setErr(id, msg) {
      var box = document.getElementById(id + "-err");
      var wrap = form.querySelector('[data-field="' + id + '"]');
      var ctl = document.getElementById(id);
      if (box) { box.textContent = msg; box.hidden = false; }
      if (wrap) wrap.classList.add("has-err");
      if (ctl && /^(INPUT|SELECT|TEXTAREA)$/.test(ctl.tagName)) {
        ctl.setAttribute("aria-invalid", "true");
        var d = (ctl.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
        if (d.indexOf(id + "-err") < 0) d.push(id + "-err");
        ctl.setAttribute("aria-describedby", d.join(" "));
      }
    }
    function clearErr(id) {
      var box = document.getElementById(id + "-err");
      var wrap = form.querySelector('[data-field="' + id + '"]');
      var ctl = document.getElementById(id);
      if (box) { box.textContent = ""; box.hidden = true; }
      if (wrap) wrap.classList.remove("has-err");
      if (ctl && ctl.removeAttribute) ctl.removeAttribute("aria-invalid");
    }
    form.addEventListener("input", function (e) {
      var w = e.target.closest && e.target.closest("[data-field]");
      if (w && w.classList.contains("has-err")) clearErr(w.getAttribute("data-field"));
    });

    function validate() {
      var errs = [];
      function need(id, ok, msg) { if (!ok) errs.push([id, msg]); else clearErr(id); }
      var t = tipo();
      need("g-tipo", !!t, "Elige el tipo de ayuda que buscas.");
      if (t === "etapa") need("g-etapas", vals("etapas").length > 0, "Marca al menos una etapa, o «No lo sé».");
      if (t === "fde") need("g-fde-foco", vals("fde_foco").length > 0, "Marca en qué trabajaría el ingeniero.");
      if (t === "datos") need("g-datos-tipo", vals("datos_tipo").length > 0, "Marca el tipo de proyecto de datos.");
      if (t === "alianza") need("f-alianza-tipo", !!val("alianza_tipo"), "Elige el tipo de alianza.");
      need("f-nombre", val("nombre").length >= 2, "Escribe tu nombre y apellido.");
      need("f-cargo", val("cargo").length >= 2, "Escribe tu cargo.");
      need("f-empresa", val("empresa").length >= 2, "Escribe el nombre de tu empresa.");
      need("f-email", EMAIL_RE.test(val("email")), "Escribe un email válido, por ejemplo nombre@empresa.com.");
      need("f-pais", !!val("pais"), "Elige tu país.");
      var tel = val("telefono");
      need("f-telefono", !tel || /^\+?[0-9 ()\-]{7,20}$/.test(tel), "Escribe el teléfono solo con números y el código de país, por ejemplo +507 6000 0000.");
      need("f-tamano", !!val("tamano"), "Elige el tamaño de tu empresa.");
      need("f-mensaje", val("mensaje").length >= 20, "Cuéntanos un poco más: mínimo 20 caracteres.");
      need("f-plazo", !!val("plazo"), "Elige cuándo quieres empezar.");
      var web = val("web");
      need("f-web", !web || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(web), "Escribe la dirección completa, empezando con https://.");
      need("f-consent", form.elements.consentimiento.checked, "Necesitamos tu autorización para responderte.");
      errs.forEach(function (e) { setErr(e[0], e[1]); });
      return errs;
    }

    function showSummary(errs) {
      list.textContent = "";
      errs.forEach(function (e) {
        var li = document.createElement("li"); var a = document.createElement("a");
        a.href = "#" + e[0]; a.textContent = e[1]; a.className = "link";
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          var target = document.getElementById(e[0]);
          var focusable = target && (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName) ? target : target.querySelector("input,select,textarea"));
          if (focusable) { focusable.focus(); focusable.scrollIntoView({ block: "center" }); }
        });
        li.appendChild(a); list.appendChild(li);
      });
      summary.hidden = false; summary.focus();
    }

    function utm() {
      var out = {};
      try { var q = new URLSearchParams(location.search); ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { if (q.get(k)) out[k] = q.get(k).slice(0, 120); }); } catch (e) {}
      return out;
    }

    function payload() {
      var t = tipo();
      var details = {};
      if (t === "etapa") details = { etapas: vals("etapas") };
      if (t === "fde") details = { foco: vals("fde_foco"), modalidad: val("fde_modalidad"), dedicacion: val("fde_dedicacion"), duracion: val("fde_duracion"), stack: val("fde_stack") };
      if (t === "datos") details = { tipos: vals("datos_tipo"), idiomas: vals("datos_idiomas"), volumen: val("datos_volumen") };
      if (t === "alianza") details = { tipo_alianza: val("alianza_tipo") };
      return {
        schema: "datamate.b2b_lead.v1",
        tipo: t,
        detalles: details,
        contacto: { nombre: val("nombre"), cargo: val("cargo"), empresa: val("empresa"), email: val("email"), telefono: val("telefono"), pais: val("pais") },
        empresa: { tamano: val("tamano"), industria: val("industria"), web: val("web") },
        contexto: { mensaje: val("mensaje"), plazo: val("plazo"), presupuesto: val("presupuesto"), origen: val("origen") },
        consentimiento: true,
        meta: { pagina: location.href.split("#")[0].slice(0, 300), enviado: new Date().toISOString(), utm: utm() },
        fax: val("fax")
      };
    }

    /* Mismo formato que arma el Worker en Slack (integrations/slack-worker/worker.js). */
    function previewLines(p) {
      var d = p.detalles, L = [];
      L.push(["Tipo", TYPE_LABEL[p.tipo]]);
      if (p.tipo === "etapa") L.push(["Etapas", d.etapas.map(function (s) { return STAGE_LABEL[s] || s; }).join(", ")]);
      if (p.tipo === "fde") { L.push(["Foco", d.foco.join(", ")]); L.push(["Formato", [d.modalidad, d.dedicacion, d.duracion].filter(Boolean).join(" · ") || "—"]); if (d.stack) L.push(["Stack", d.stack]); }
      if (p.tipo === "datos") { L.push(["Proyecto", d.tipos.join(", ")]); if (d.idiomas.length) L.push(["Idiomas", d.idiomas.join(", ")]); if (d.volumen) L.push(["Volumen", d.volumen]); }
      if (p.tipo === "alianza") L.push(["Alianza", d.tipo_alianza]);
      L.push(["Contacto", p.contacto.nombre + " · " + p.contacto.cargo]);
      L.push(["Empresa", p.contacto.empresa + " · " + p.empresa.tamano + " personas" + (p.empresa.industria ? " · " + p.empresa.industria : "") + " · " + p.contacto.pais]);
      L.push(["Email", p.contacto.email + (FREE_MAIL.test(p.contacto.email) ? "  (correo personal)" : "")]);
      if (p.contacto.telefono) L.push(["Teléfono", p.contacto.telefono]);
      L.push(["Plazo", p.contexto.plazo + (p.contexto.presupuesto ? " · " + p.contexto.presupuesto : "")]);
      if (p.empresa.web) L.push(["Web", p.empresa.web]);
      if (p.contexto.origen) L.push(["Origen", p.contexto.origen]);
      return L;
    }
    function renderPreview(p) {
      var box = document.getElementById("slack-msg"); box.textContent = "";
      box.appendChild(el("p", "slack-head", "Nuevo lead B2B · " + TYPE_LABEL[p.tipo] + " · " + p.contacto.empresa));
      var dl = el("dl", "slack-fields");
      previewLines(p).forEach(function (r) { var w = el("div"); w.appendChild(el("dt", "", r[0])); w.appendChild(el("dd", "", r[1])); dl.appendChild(w); });
      box.appendChild(dl);
      box.appendChild(el("blockquote", "slack-quote", p.contexto.mensaje));
      document.getElementById("slack-preview").hidden = false;
    }

    function finish(p, previewOnly) {
      form.hidden = true;
      document.getElementById("done-text").textContent = previewOnly
        ? "Modo vista previa: este formulario todavía no está conectado a Slack, así que no se envió nada. Abajo ves el mensaje que recibiría el equipo."
        : "Te escribiremos a " + p.contacto.email + " para coordinar. Si quieres adelantar, agenda el diagnóstico ahora.";
      document.getElementById("done-title").textContent = previewOnly ? "Formulario completo." : "Gracias. Ya la tiene el equipo.";
      document.getElementById("done-label").textContent = previewOnly ? "VISTA PREVIA · SIN ENVIAR" : "SOLICITUD RECIBIDA";
      if (previewOnly) renderPreview(p); else document.getElementById("slack-preview").hidden = true;
      done.hidden = false; done.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      var errs = validate();
      if (errs.length) { showSummary(errs); return; }
      summary.hidden = true;
      var p = payload();
      if (p.fax) { finish(p, false); return; } /* honeypot: respuesta normal, sin enviar */
      if (!endpoint) { finish(p, true); return; }
      submitBtn.disabled = true; submitBtn.textContent = "Enviando…";
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); finish(p, false); })
        .catch(function () { statusEl.textContent = "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo, o escríbenos a " + MAIL + "."; })
        .then(function () { submitBtn.disabled = false; submitBtn.textContent = "Enviar solicitud →"; });
    });

    document.getElementById("form-again").addEventListener("click", function () {
      form.reset(); showPanel(); done.hidden = true; form.hidden = false;
      var first = form.querySelector('input[name="tipo"]'); if (first) first.focus();
    });

    window.DMForm = {
      preselectStage: function (id) {
        var r = document.getElementById("f-tipo-etapa"); if (r) { r.checked = true; showPanel(); clearErr("g-tipo"); }
        var c = form.querySelector('input[name="etapas"][value="' + id + '"]'); if (c) c.checked = true;
      }
    };
    showPanel();
  })();

  /* Cerrar el menú móvil al elegir un link. */
  var menu = document.querySelector(".menu");
  if (menu) menu.addEventListener("click", function (e) { if (e.target.tagName === "A") menu.removeAttribute("open"); });

  /* ── Motion: 3 familias (char-rise, word-light, pin de etapas) + "Amanecer" de Soul. ── */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  if (!gsap || !ScrollTrigger) return;
  var OK = "(prefers-reduced-motion: no-preference)";
  if (!window.matchMedia(OK).matches) return;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  document.documentElement.classList.add("motion-ok");
  document.documentElement.style.scrollBehavior = "auto";

  if (window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.12, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  /* 1. Hero: char-rise del H1 (una vez). */
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    gsap.from(hero.querySelectorAll("[data-hero-in]"), { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.35 });
    var he = hero.querySelector("[data-hero-enso]");
    if (he) gsap.from(he, { rotate: -20, autoAlpha: 0, duration: 1.2, ease: "power3.out" });
    var title = hero.querySelector("[data-hero-title]");
    if (title && SplitText) fontsReady.then(function () {
      SplitText.create(title, { type: "lines,chars", mask: "lines", autoSplit: true, aria: "auto",
        onSplit: function (s) { return gsap.from(s.chars, { yPercent: 110, stagger: 0.02, duration: 0.8, ease: "power3.out" }); } });
      ScrollTrigger.refresh();
    });
  }

  /* 2. Declaración: word-light scrub. */
  var stmt = document.querySelector("[data-statement]");
  if (stmt && SplitText) {
    var sw = SplitText.create(stmt, { type: "words", aria: "auto" });
    gsap.fromTo(sw.words, { opacity: 0.18 }, { opacity: 1, ease: "none", stagger: 1,
      scrollTrigger: { trigger: stmt, start: "top 70%", end: "bottom 45%", scrub: 0.5 } });
  }

  var mm = gsap.matchMedia();

  /* 3. Etapas: pin + crossfade (pico). Solo escritorio. */
  mm.add("(min-width: 1024px) and " + OK, function () {
    var section = document.querySelector("[data-steps]");
    if (!section) return;
    var steps = gsap.utils.toArray("[data-step]", section);
    var visuals = gsap.utils.toArray("[data-step-visual]", section);
    var progress = section.querySelector("[data-progress]");
    var enso = section.querySelector("[data-steps-enso]");
    var counter = section.querySelector("[data-step-counter]");
    var n = steps.length;
    if (n < 2) return;
    section.classList.add("steps-pinned");
    gsap.set(progress, { scaleY: 0, transformOrigin: "top" });
    gsap.set(steps.slice(1), { autoAlpha: 0, yPercent: 12 });
    gsap.set(visuals.slice(1), { autoAlpha: 0, scale: 0.9 });
    var current = 1;
    var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
      trigger: section, start: "top top", end: "+=250%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) {
        var v = Math.min(n, Math.floor(self.progress * n) + 1);
        if (v !== current && counter) { current = v; counter.textContent = "ETAPA " + v + " / " + n; }
      } } });
    tl.to(progress, { scaleY: 1, duration: n }, 0);
    if (enso) tl.to(enso, { rotate: 360, duration: n }, 0);
    var fade = 0.35;
    for (var i = 0; i < n - 1; i++) {
      var at = i + 1 - fade / 2;
      tl.to(steps[i], { autoAlpha: 0, yPercent: -12, duration: fade, ease: "power2.inOut" }, at);
      tl.fromTo(steps[i + 1], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: fade, ease: "power2.inOut", immediateRender: false }, at);
      if (visuals.length === n) {
        tl.to(visuals[i], { autoAlpha: 0, scale: 0.9, duration: fade, ease: "power2.inOut" }, at);
        tl.fromTo(visuals[i + 1], { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: fade, ease: "power2.inOut", immediateRender: false }, at);
      }
    }
    return function () { section.classList.remove("steps-pinned"); if (counter) counter.textContent = "ETAPA 1 / " + n; };
  });

  /* auteur-allow: motion-budget -- Soul es un sub-brand con scope propio; "Amanecer" es la única transición de su sección. */
  var soul = document.getElementById("soul");
  if (soul) {
    var sky = soul.querySelector(".soul-sky"), inner = soul.querySelector(".soul-sky-inner"), content = soul.querySelector("[data-soul-content]");
    mm.add("(min-width: 768px) and " + OK, function () {
      var st = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: soul, start: "top bottom", end: "top 25%", scrub: 0.6, refreshPriority: -1, invalidateOnRefresh: true } });
      st.fromTo(sky, { clipPath: "inset(46% 6% 46% 6% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 }, 0);
      st.fromTo(inner, { yPercent: 18 }, { yPercent: 0, duration: 1 }, 0);
      /* El contenido entra cuando el cielo ya lo cubre: el texto oscuro nunca queda sobre fondo oscuro. */
      st.fromTo(content, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7);
    });
    mm.add("(max-width: 767px) and " + OK, function () {
      gsap.fromTo(content, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: soul, start: "top 80%", once: true } });
    });
  }

  ScrollTrigger.refresh();
  fontsReady.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
