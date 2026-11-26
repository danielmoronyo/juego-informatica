/* =====================================================================
 *  BISAGRA CERO · portada
 * ===================================================================== */
(function () {
  const { LAPTOPS, eur, icon, chip, esc } = SC;

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function ticketHtml(t) {
    return `<div class="paper anim-print">
      <div class="paper-head">
        <span class="paper-name">${esc(t.client.name)}</span>
        <span class="mono tiny">muestra #${String(t.id).padStart(3, "0")}</span>
      </div>
      <p class="paper-role">${esc(t.client.role)} · ${esc(t.client.mood)}</p>
      <ul class="paper-reqs">${t.reqs.map((r) => `<li><span class="arrow">›</span><span>${esc(r.client)}</span></li>`).join("")}</ul>
      <div class="paper-foot">${
        t.answer ? '<span class="ink-ok">solución única en el mostrador</span>' : '<span class="ink-ko">ningún portátil vale · rechazar</span>'
      }</div>
    </div>`;
  }

  SC.initIntro = function (root) {
    const cheapest = LAPTOPS.reduce((a, b) => (b.price < a.price ? b : a));
    const dearest = LAPTOPS.reduce((a, b) => (b.price > a.price ? b : a));

    root.innerHTML = `<div class="intro-grid">
      <div>
        <div class="chips anim-rise" style="animation-delay:40ms">
          ${chip(`${icon("radio", 11)} turno abierto 24 h`, "mint")}
          ${chip("4 portátiles · PcComponentes", "copper")}
          ${chip("Categoría: Portátiles · nuevos")}
        </div>

        <h1 class="hero-title anim-rise">
          <span class="t-solder">Bisagra</span>
          <span class="stroke-copper">cero</span>
          <span class="t-mint">el mostrador de los baratos</span>
        </h1>

        <p class="hero-lede anim-rise" style="animation-delay:100ms">
          Cuatro portátiles nuevos son los más baratos de la primera página de PcComponentes: del
          <span class="mono t-amber">${cheapest.fullName}</span> a ${eur(cheapest.price)} hasta el
          <span class="mono t-amber">${dearest.fullName}</span> a ${eur(dearest.price)}. Todos de 15,6", todos con 8 GB y 512 GB
          de SSD… y aun así ninguno es igual. Tu trabajo: venderle a cada cliente el único que le sirve antes de que se canse de esperar.
        </p>

        <div class="hero-actions anim-rise" style="animation-delay:160ms">
          <button type="button" class="btn btn-primary btn-lg" data-go="taller">${icon("arrowRight", 16)} Abrir el mostrador</button>
          <button type="button" class="btn btn-ghost btn-lg" data-go="duelo">${icon("gauge", 16)} Duelo de fichas</button>
        </div>

        <dl class="hero-stats anim-rise">
          ${[
            ["board", "portátiles en tienda", "4"],
            ["cpu", "con procesador AMD", "1"],
            ["memory", "con RAM ampliable", "1"],
            ["radio", "con Windows", "3"],
          ]
            .map(
              ([ic, k, v]) => `<div class="hero-stat"><dt><span class="t-copper">${icon(ic, 14)}</span>${k}</dt><dd>${v}</dd></div>`,
            )
            .join("")}
        </dl>
      </div>

      <div class="intro-side anim-rise" style="animation-delay:240ms">
        <div class="intro-glow anim-float"></div>
        <div class="printer-bar">
          <span class="eyebrow">impresora de pedidos</span>
          <span class="online"><span class="dot led"></span> en línea</span>
        </div>
        <div id="sample-ticket"></div>
        <div class="board-list">
          ${LAPTOPS.map(
            (b, i) => `<button type="button" class="board-row" data-go="fichas">
              <span class="mono tiny t-dim3">${String(i + 1).padStart(2, "0")}</span>
              <span class="board-row-bar" style="background:${b.color}"></span>
              <span class="minw0 grow">
                <span class="board-row-name trunc">${b.fullName}</span>
                <span class="board-row-sub">${b.cpu} · ${b.panel} · ${b.windows ? "Windows 11" : "sin SO"}</span>
              </span>
              <span class="board-row-price">${eur(b.price)}</span>
            </button>`,
          ).join("")}
        </div>
        <div class="panel method-note">
          Método: se tomó la primera página de la categoría <span class="t-dim8">Portátiles</span> de PcComponentes y se
          eligieron los cuatro equipos nuevos (no reacondicionados) más baratos. Los precios de la web fluctúan: el juego usa los de la captura.
        </div>
      </div>
    </div>`;

    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-go]");
      if (!t) return;
      SC.sound.play("click");
      go(t.dataset.go);
    });

    // ticket de muestra rotativo
    const samples = Array.from({ length: 6 }, (_, k) => SC.makeTicket(k === 5));
    const host = SC.$("#sample-ticket", root);
    let i = 0;
    const show = () => (host.innerHTML = ticketHtml(samples[i++ % samples.length]));
    show();
    setInterval(show, 3400);
  };
})();
