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
      var a = el("a", "link", "Agendar diagnóstico de esta etapa");
      a.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Diagnóstico de etapa: " + s.n + ". " + s.name);
      meta.appendChild(a);
      result.appendChild(meta);
    });
  });

  /* Copiar correo: el mailto puede no abrir en todos los contextos, así que el correo siempre es visible. */
  var copyBtn = document.getElementById("copy-mail");
  var copyStatus = document.getElementById("copy-status");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    function selectText() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById("mail-text"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      copyStatus.textContent = "Correo seleccionado. Cópialo con Ctrl/Cmd + C.";
    }
    try {
      navigator.clipboard.writeText(MAIL).then(function () { copyStatus.textContent = "Correo copiado."; }, selectText);
    } catch (e) { selectText(); }
  });

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
