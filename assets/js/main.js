/* =========================================================
   EvaCloudd — JS global
   Nav mobile, tema, scroll reveal, FAQ, contadores,
   formulário -> WhatsApp, cookie, tracking helper.
   ========================================================= */
(function () {
  "use strict";

  /* ---- Configuração central (EDITE AQUI) ---- */
  const CONFIG = {
    whatsapp: "551637064700",           // número do WhatsApp (formato internacional, sem +). TROQUE pelo celular/WhatsApp real!
    defaultMsg: "Olá! Vim pelo site da EvaCloudd e quero saber mais sobre as soluções.",

    // ---- Rastreamento (cole seus IDs; deixe vazio para desativar) ----
    gtmId: "",           // ex.: "GTM-XXXXXXX"
    metaPixelId: "",     // ex.: "123456789012345"
    googleAdsId: "",     // ex.: "AW-1234567890"  (tag base do Google Ads)
    adsConversion: "",   // ex.: "AW-1234567890/AbC-D_efG"  (rótulo de conversão de lead)

    // ---- Backup de lead (além do WhatsApp) ----
    // Cole a URL de um formulário Formspree (https://formspree.io) ou endpoint próprio.
    // Se vazio, envia só pelo WhatsApp.
    leadEndpoint: "",
  };
  window.EVA = CONFIG;
  if (CONFIG.adsConversion) window.GADS_CONVERSION = CONFIG.adsConversion;

  /* ---- Carrega tags de rastreamento (SÓ após consentimento de cookies) ---- */
  var tagsLoaded = false;
  function loadTags() {
    if (tagsLoaded) return; tagsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    // Google Tag Manager
    if (CONFIG.gtmId) {
      (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0], j = d.createElement(s); j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i; f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", CONFIG.gtmId);
    }
    // Google Ads / gtag
    if (CONFIG.googleAdsId) {
      var g = document.createElement("script"); g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.googleAdsId; document.head.appendChild(g);
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", CONFIG.googleAdsId);
    }
    // Meta Pixel
    if (CONFIG.metaPixelId) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CONFIG.metaPixelId); window.fbq("track", "PageView");
    }
  }
  window.EVA.loadTags = loadTags;

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
  // modo claro é o padrão; o visitante pode alternar para o escuro
  root.setAttribute("data-theme", saved || "light");
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

      // backup do lead: envia para o endpoint (Formspree/próprio), se configurado — não bloqueia o fluxo
      if (CONFIG.leadEndpoint) {
        try {
          fetch(CONFIG.leadEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ nome: nome, telefone: tel, segmento: seg, mensagem: msg, origem: form.getAttribute("data-lead-form") || "site", pagina: location.href })
          }).catch(function () {});
        } catch (e) { /* silencioso */ }
      }

      // abre WhatsApp e vai para a página de obrigado (rastreio de conversão)
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

  /* ---- Cookie consent (LGPD): tags só carregam após "Aceitar" ---- */
  var cookie = document.querySelector(".cookie");
  var cookieChoice = localStorage.getItem("eva-cookie");
  if (cookieChoice === "accept") loadTags(); // já consentiu antes
  if (cookie && !cookieChoice) {
    setTimeout(function () { cookie.classList.add("show"); }, 1200);
    cookie.querySelectorAll("[data-cookie]").forEach(function (b) {
      b.addEventListener("click", function () {
        var choice = b.getAttribute("data-cookie");
        localStorage.setItem("eva-cookie", choice);
        cookie.classList.remove("show");
        if (choice === "accept") loadTags();
      });
    });
  }

  /* ---- Ano no footer ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

})();

/* ===== Efeitos cinematográficos (cursor, nav auto-hide, parallax, wipe) ===== */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // cursor com brilho (só em dispositivos com mouse)
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var cg = document.createElement("div");
    cg.className = "cursor-glow";
    document.body.appendChild(cg);
    var cx = 0, cy = 0, tx = 0, ty = 0, shown = false;
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { cg.classList.add("on"); shown = true; }
    });
    (function loop() { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; cg.style.left = cx + "px"; cg.style.top = cy + "px"; requestAnimationFrame(loop); })();
    document.querySelectorAll("a, button, .card, .btn").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cg.classList.add("big"); });
      el.addEventListener("mouseleave", function () { cg.classList.remove("big"); });
    });
  }

  // navbar some ao descer, aparece ao subir
  var nav = document.querySelector(".nav");
  if (nav) {
    var last = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      if (y > last && y > 320) nav.classList.add("hide");
      else nav.classList.remove("hide");
      last = y;
    }, { passive: true });
  }

  // parallax suave — só quando rola (leitura e escrita em lote, sem loop contínuo)
  var isTouch = window.matchMedia && window.matchMedia("(hover: none)").matches;
  if (!reduce && !isTouch) {
    var px = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (px.length) {
      var ticking = false;
      var update = function () {
        var vh = window.innerHeight, centers = [], i;
        for (i = 0; i < px.length; i++) { var r = px[i].getBoundingClientRect(); centers[i] = (r.top + r.height / 2) - vh / 2; } // read
        for (i = 0; i < px.length; i++) { var sp = parseFloat(px[i].getAttribute("data-parallax")) || 0.06; px[i].style.transform = "translate3d(0," + (-centers[i] * sp).toFixed(1) + "px,0)"; } // write
        ticking = false;
      };
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }
  }

  // revelação em "wipe" das mídias
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal-img").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal-img").forEach(function (el) { el.classList.add("in"); });
  }
})();
