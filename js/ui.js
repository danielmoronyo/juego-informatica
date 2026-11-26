/* =====================================================================
 *  BISAGRA CERO · utilidades de interfaz compartidas
 * ===================================================================== */
(function () {
  /* ---------- almacenamiento local tolerante a fallos ---------- */
  SC.store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    },
    num(k) {
      return Number(SC.store.get(k) || 0);
    },
  };

  SC.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  SC.fmtInt = (n) => n.toLocaleString("es-ES");

  SC.$ = (sel, root = document) => root.querySelector(sel);
  SC.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- piezas de marcado ---------- */
  SC.chip = (content, tone = "muted", extra = "") => `<span class="chip chip-${tone} ${extra}">${content}</span>`;

  SC.stat = (label, value, tone = "solder", attrs = "") =>
    `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value t-${tone}" ${attrs}>${value}</span></div>`;

  SC.fuses = (n, size = 17) =>
    `<span class="fuses" title="Fusibles restantes">${[0, 1, 2]
      .map((i) => SC.icon("zap", size, i < n ? "fuse-on" : "fuse-off"))
      .join("")}</span>`;

  /** Chispas al acertar: se insertan en un contenedor posicionado. */
  SC.sparks = (host, color = "#4cc9f0") => {
    if (!host) return;
    const box = document.createElement("span");
    box.className = "sparks";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("span");
      const size = 2 + Math.random() * 3.4;
      p.className = "spark";
      p.style.cssText = `width:${size}px;height:${size}px;background:${color};box-shadow:0 0 8px ${color};animation-delay:${(
        Math.random() * 0.18
      ).toFixed(2)}s;--dx:${((Math.random() * 2 - 1) * 110).toFixed(0)}px;--dy:${((Math.random() * 2 - 1) * 74).toFixed(0)}px`;
      box.appendChild(p);
    }
    host.appendChild(box);
    setTimeout(() => box.remove(), 1100);
  };

  /* ---------- aparición al hacer scroll ---------- */
  SC.observeReveal = (root = document) => {
    const els = SC.$$(".reveal:not(.is-in)", root);
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
  };

  /* ---------- carta de portátil (mostrador) ---------- */
  SC.laptopCard = ({ board: b, state = "idle", disabled, hotkey, reqs, showAnalysis }) => {
    const yn = (v) => (v ? "sí" : "no");
    let analysis = "";
    if (showAnalysis && reqs && reqs.length) {
      const fails = reqs.filter((r) => !r.test(b));
      analysis = `<ul class="bc-analysis">
        ${reqs
          .map((r) => {
            const ok = r.test(b);
            return `<li><span class="mark ${ok ? "ok" : "ko"}">${ok ? "✓" : "✕"}</span><span class="${ok ? "t-dim7" : "t-hot"} trunc">${SC.esc(r.tag)}</span></li>`;
          })
          .join("")}
        <li class="bc-verdict">${
          fails.length === 0 ? '<span class="t-mint">Cumple el pedido completo</span>' : `<span class="t-hot">Falla: ${SC.esc(fails[0].tag)}</span>`
        }</li>
      </ul>`;
    }
    const overlay =
      state === "correct"
        ? `<span class="bc-overlay"><span class="bc-badge ok">${SC.icon("check", 30)}</span></span>`
        : state === "wrong"
          ? `<span class="bc-overlay"><span class="bc-badge ko">${SC.icon("x", 30)}</span></span>`
          : "";

    return `<button type="button" class="board-card is-${state}" data-board="${b.id}" ${disabled ? "disabled" : ""}>
      <span class="bc-topbar"></span>
      ${disabled ? "" : '<span class="bc-scan"><span></span></span>'}
      <div class="bc-head">
        <div class="minw0">
          <div class="eyebrow">${b.brand}</div>
          <div class="bc-model trunc">${b.model}</div>
        </div>
        <div class="bc-price">
          <div class="num">${SC.eur(b.price).replace(" €", "")}</div>
          <div class="sub">€ IVA inc.</div>
        </div>
      </div>
      <div class="bc-art">
        <img src="${SC.laptopImg(b)}" alt="Ilustración del ${SC.esc(b.fullName)}" draggable="false">
        ${hotkey ? `<kbd class="bc-key">${hotkey}</kbd>` : ""}
        ${overlay}
      </div>
      <div class="chips bc-chips">
        ${SC.chip(`${SC.icon("cpu", 11)} ${b.cpu.replace("Intel Core ", "Core ")}`, "copper")}
        ${SC.chip(`${SC.icon("memory", 11)} ${b.ramGb} GB ${b.ramMaxGb > b.ramGb ? `→ ${b.ramMaxGb} GB` : "fijos"}`)}
        ${SC.chip(`${SC.icon("radio", 11)} Wi-Fi ${b.wifi}`)}
        ${b.windows ? SC.chip("Windows 11", "mint") : SC.chip("sin SO", "hot")}
      </div>
      <div class="bc-specs">
        <span><i>panel</i> ${b.panel}</span>
        <span><i>USB-C</i> ×${b.usbC}</span>
        <span class="${b.rj45 ? "t-mint" : ""}"><i>RJ-45</i> ${yn(b.rj45)}</span>
        <span class="${b.cardReader ? "t-mint" : ""}"><i>µSD</i> ${yn(b.cardReader)}</span>
        <span class="${b.fingerprint ? "t-mint" : ""}"><i>huella</i> ${yn(b.fingerprint)}</span>
        <span class="${b.numpad ? "t-mint" : ""}"><i>numérico</i> ${yn(b.numpad)}</span>
        <span><i>bat.</i> ${SC.num(b.batteryWh)} Wh</span>
        <span><i>peso</i> ${SC.num(b.weightKg, 2)} kg</span>
        <span><i>grosor</i> ${SC.num(b.thickMm)} mm</span>
      </div>
      ${analysis}
    </button>`;
  };

  /* ---------- vista ampliada de la ilustración ---------- */
  SC.openZoom = (b) => {
    const wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = `<div class="modal-box anim-rise">
        <div class="modal-head">
          <div><div class="eyebrow t-copper">${b.brand}</div><h3 class="display h-modal">${SC.esc(b.fullName)}</h3></div>
          ${SC.chip(`${SC.icon("zoom", 11)} vista ampliada`, "amber")}
        </div>
        <img class="modal-art" src="${SC.laptopImg(b)}" alt="Ilustración del ${SC.esc(b.fullName)}">
        <p class="mono small t-dim5">${SC.esc(b.cpu)} · ${b.gpu} · ${b.dims} · ${SC.num(b.weightKg, 2)} kg</p>
        <button type="button" class="btn btn-ghost btn-sm modal-close">${SC.icon("x", 13)} Cerrar <span class="kbd-hint">[Esc]</span></button>
      </div>`;
    const close = () => {
      wrap.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => e.key === "Escape" && close();
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest(".modal-close")) close();
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(wrap);
    SC.$(".modal-close", wrap).focus();
  };

  /* ---------- sección activa (para atajos de teclado y menú) ---------- */
  SC.activeSection = "inicio";
  SC.isTyping = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
})();

/* =====================================================================
 *  Niveles de tiempo (comunes al Mostrador y al Duelo)
 * ===================================================================== */
(function () {
  SC.TIME_LEVELS = [
    { id: "t20", key: "1", label: "20 s", secs: 20, mult: 1.3, desc: "exprés · puntos ×1,3" },
    { id: "t60", key: "2", label: "1 min", secs: 60, mult: 1, desc: "tranquilo · puntos ×1" },
    { id: "tinf", key: "3", label: "Sin tiempo", secs: null, mult: 0.6, desc: "sin reloj · puntos ×0,6" },
  ];
  SC.timeLevel = (id) => SC.TIME_LEVELS.find((l) => l.id === id) || SC.TIME_LEVELS[0];

  /** Nivel guardado para un modo ("taller" o "duelo"). */
  SC.loadLevel = (mode) => SC.timeLevel(SC.store.get(`bc0.level.${mode}`)).id;
  SC.saveLevel = (mode, id) => SC.store.set(`bc0.level.${mode}`, id);

  /** Texto del tiempo restante: "12.3s" o "∞". */
  SC.timeTxt = (lvl, t) => (lvl.secs ? t.toFixed(1) + "s" : "∞");

  /** Frase para titulares: "veinte segundos", "un minuto", "sin reloj". */
  SC.levelPhrase = (lvl) => (lvl.secs === 20 ? "veinte segundos" : lvl.secs === 60 ? "un minuto" : "sin reloj");

  /** Selector segmentado de nivel. locked = partida en curso. */
  SC.levelPicker = (currentId, locked) => {
    const cur = SC.timeLevel(currentId);
    return `<div class="level-row ${locked ? "is-locked" : ""}">
      <span class="level-label">${SC.icon("timer", 12)} Nivel de tiempo</span>
      <div class="level-seg" role="radiogroup" aria-label="Nivel de tiempo">
        ${SC.TIME_LEVELS.map(
          (l) => `<button type="button" role="radio" aria-checked="${l.id === cur.id}" class="level-btn ${l.id === cur.id ? "on" : ""}"
            data-level="${l.id}" ${locked ? "disabled" : ""} title="${l.desc}${locked ? " (termina la partida para cambiarlo)" : ` · tecla ${l.key}`}">${l.label}</button>`,
        ).join("")}
      </div>
      <span class="level-desc">${locked ? "fijado durante la partida" : `${cur.desc} · teclas 1-3`}</span>
    </div>`;
  };
})();
