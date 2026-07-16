/* =========================================================
   EvaCloudd — JS global
   Nav mobile, tema, scroll reveal, FAQ, contadores,
   formulário -> WhatsApp, cookie, tracking helper.
   ========================================================= */
(function () {
  "use strict";

  /* ---- Configuração central (edite aqui) ---- */
  const CONFIG = {
    whatsapp: "551637064700",           // número em formato internacional (sem +, sem espaços)
    defaultMsg: "Olá! Vim pelo site da EvaCloudd e quero saber mais sobre as soluções.",
  };
  window.EVA = CONFIG;

  /* ---- Helper de tracking (Google Ads / Meta Pixel / GTM) ---- */
  // Dispara eventos de conversão de forma segura, mesmo sem os scripts carregados.
  window.trackLead = function (label, extra) {
    try {
      // GTM / GA4
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: "generate_lead", lead_source: label || "site" }, extra || {}));
      // Meta Pixel
      if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_name: label });
      // Google Ads (defina window.GADS_CONVERSION = 'AW-XXXX/YYYY' para ativar)
      if (typeof window.gtag === "function" && window.GADS_CONVERSION) {
        window.gtag("event", "conversion", { send_to: window.GADS_CONVERSION });
      }
    } catch (e) { /* silencioso */ }
  };

  /* ---- Link de WhatsApp padrão ---- */
  function waLink(msg) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg || CONFIG.defaultMsg);
  }
  // Preenche todos os [data-wa] com o link e dispara tracking ao clicar
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var custom = el.getAttribute("data-wa-msg");
    el.setAttribute("href", waLink(custom));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
    el.addEventListener("click", function () { window.trackLead(el.getAttribute("data-wa") || "whatsapp"); });
  });

  /* ---- Tema (dark/light) com persistência ---- */
  var root = document.documentElement;
  var saved = localStorage.getItem("eva-theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  function updateThemeIcon() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-icon]").forEach(function (i) { i.textContent = dark ? "☀️" : "🌙"; });
  }
  updateThemeIcon();
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("eva-theme", next);
      updateThemeIcon();
    });
  });

  /* ---- Navbar: sombra ao rolar + menu mobile ---- */
  var nav = document.querySelector(".nav");
  var menu = document.querySelector(".mobile-menu");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });
  var burger = document.querySelector(".hamburger");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      if (menu) menu.classList.toggle("show", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    if (menu) menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open"); menu.classList.remove("show"); document.body.style.overflow = "";
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Contadores animados ---- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "", dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          el.textContent = val.toLocaleString("pt-BR") + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---- FAQ: fecha os outros ao abrir um ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---- Formulário de lead -> WhatsApp ---- */
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var nome = (data.get("nome") || "").toString().trim();
      var tel = (data.get("telefone") || "").toString().trim();
      var seg = (data.get("segmento") || "").toString().trim();
      var msg = (data.get("mensagem") || "").toString().trim();
      var interesse = form.getAttribute("data-interesse") || "as soluções da EvaCloudd";

      var texto = "Olá! Meu nome é " + (nome || "(não informado)") +
        ".\nTenho interesse em " + interesse + ".";
      if (seg) texto += "\nSegmento: " + seg;
      if (tel) texto += "\nMeu telefone: " + tel;
      if (msg) texto += "\nMensagem: " + msg;

      window.trackLead(form.getAttribute("data-lead-form") || "form", { segmento: seg });

      // redireciona para obrigado (rastreio de conversão) e abre WhatsApp
      var wa = waLink(texto);
      var thanks = form.getAttribute("data-thanks");
      window.open(wa, "_blank", "noopener");
      if (thanks) window.location.href = thanks;
      else { form.reset(); showToast(form); }
    });
  });
  function showToast(form) {
    var ok = form.querySelector("[data-form-ok]");
    if (ok) { ok.style.display = "block"; setTimeout(function () { ok.style.display = "none"; }, 6000); }
  }

  /* ---- Cookie consent ---- */
  var cookie = document.querySelector(".cookie");
  if (cookie && !localStorage.getItem("eva-cookie")) {
    setTimeout(function () { cookie.classList.add("show"); }, 1200);
    cookie.querySelectorAll("[data-cookie]").forEach(function (b) {
      b.addEventListener("click", function () {
        localStorage.setItem("eva-cookie", b.getAttribute("data-cookie"));
        cookie.classList.remove("show");
      });
    });
  }

  /* ---- Ano no footer ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

})();
