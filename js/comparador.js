/* =====================================================================
 *  BISAGRA CERO · comparador de valor (radar, barras y tabla)
 * ===================================================================== */
(function () {
  const { LAPTOPS: BOARDS, eur, icon, num } = SC;

  const AXES = ["rendimiento", "ampliacion", "conectividad", "pantalla", "movilidad"];
  const AXIS_LABELS = { rendimiento: "Rendimiento", ampliacion: "Ampliación", conectividad: "Conectividad", pantalla: "Pantalla", movilidad: "Movilidad" };

  const avg = (b) => AXES.reduce((s, a) => s + b.scores[a], 0) / AXES.length;
  const round1 = (n) => Math.round(n * 10) / 10;

  const ROWS = [
    { label: "Precio", get: (b) => eur(b.price), best: (b) => b.price, dir: "low" },
    { label: "Procesador", get: (b) => `${b.cpu} · ${b.cores} núcleos / ${b.threads} hilos · ${num(b.turbo)} GHz`, best: (b) => b.threads, dir: "high" },
    { label: "Gráfica", get: (b) => b.gpu },
    { label: "Memoria", get: (b) => `${b.ramGb} GB ${b.ramType} · ${b.ramNote}`, best: (b) => b.ramMaxGb, dir: "high" },
    { label: "Almacenamiento", get: (b) => `${b.ssdGb} GB SSD NVMe PCIe ${b.ssdGen}.0`, best: (b) => b.ssdGen, dir: "high" },
    { label: "Pantalla", get: (b) => `${num(b.screen)}" ${b.res} ${b.panel}${b.nits ? ` · ${b.nits} nits` : ""}` },
    { label: "USB", get: (b) => `${b.usbA} × USB-A 3.2${b.usb2 ? ` · ${b.usb2} × USB 2.0` : ""} · ${b.usbC} × USB-C` },
    { label: "Otros puertos", get: (b) => [b.hdmi, b.rj45 && "RJ-45", b.cardReader && "microSD", "audio"].filter(Boolean).join(" · ") },
    { label: "Inalámbrico", get: (b) => `Wi-Fi ${b.wifi} · Bluetooth ${b.bt}`, best: (b) => b.wifiN, dir: "high" },
    { label: "Webcam", get: (b) => b.webcam },
    { label: "Batería", get: (b) => `${num(b.batteryWh)} Wh`, best: (b) => b.batteryWh, dir: "high" },
    { label: "Peso", get: (b) => `${num(b.weightKg, 2)} kg`, best: (b) => b.weightKg, dir: "low" },
    { label: "Dimensiones", get: (b) => b.dims, best: (b) => b.thickMm, dir: "low" },
    { label: "Teclado", get: (b) => `${b.numpad ? "Con" : "Sin"} teclado numérico${b.fingerprint ? " · huella" : ""}` },
    { label: "Sistema", get: (b) => b.os },
  ];

  function tableHtml() {
    const head = BOARDS.map(
      (b) => `<th><div class="row gap2"><span class="sw" style="background:${b.color}"></span><span class="th-model">${b.model}</span></div>
        <span class="mono tiny t-amber">${eur(b.price)}</span></th>`,
    ).join("");
    const body = ROWS.map((row) => {
      let bestIdx = -1;
      if (row.best) {
        const vals = BOARDS.map(row.best);
        bestIdx = vals.indexOf(row.dir === "low" ? Math.min(...vals) : Math.max(...vals));
      }
      const cells = BOARDS.map((b, i) => {
        const mark = row.best ? (bestIdx === i ? `<span class="t-mint">${icon("check", 13)}</span>` : `<span class="t-pcb">${icon("minus", 13)}</span>`) : "";
        return `<td><span class="cell">${mark}<span class="${row.best && bestIdx === i ? "t-solder" : ""}">${SC.esc(row.get(b))}</span></span></td>`;
      }).join("");
      return `<tr><td class="sticky-col">${row.label}</td>${cells}</tr>`;
    }).join("");
    return `<table class="comp-table"><thead><tr><th class="sticky-col">Atributo</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  SC.initComparador = function (el) {
    el.innerHTML = `<div class="comp-grid">
      <div class="panel pad">
        <div class="comp-head">
          <h3 class="h-small">Radar de prestaciones</h3>
          <div class="chips" data-ref="toggles">
            ${BOARDS.map((b) => `<button type="button" class="toggle on" data-id="${b.id}" style="--c:${b.color}">${b.model}</button>`).join("")}
          </div>
        </div>
        <div class="chart-box" data-ref="radar"></div>
        <p class="note">Puntuación propia 0-100 derivada de la ficha técnica de cada portátil (no es un benchmark oficial).</p>
      </div>

      <div class="panel pad">
        <h3 class="h-small mb3">Prestaciones frente a precio</h3>
        <div class="legend">
          <span><i style="background:linear-gradient(90deg,${BOARDS.map((b) => b.color).join(",")})"></i>Prestaciones medias</span>
          <span><i class="legend-copper"></i>Valor (peso del precio)</span>
        </div>
        <div class="chart-box" data-ref="bars"></div>
        <p class="note">La barra cobriza aplica un 60 % de peso al precio: por eso el Alurin i3 gana en valor aunque pierda en casi todo lo demás.</p>
      </div>

      <div class="panel ovh span2">
        <div class="panel-head"><span class="panel-kicker">Tabla comparativa completa</span></div>
        <div class="table-scroll">${tableHtml()}</div>
      </div>
    </div>`;

    /* radar con conmutadores */
    let active = BOARDS.map((b) => b.id);
    const radar = SC.radarChart(el.querySelector('[data-ref="radar"]'), { labels: AXES.map((a) => AXIS_LABELS[a]) });
    const refreshRadar = () => {
      radar.update(BOARDS.filter((b) => active.includes(b.id)).map((b) => ({ label: b.model, color: b.color, data: AXES.map((a) => b.scores[a]) })));
      el.querySelectorAll(".toggle").forEach((t) => t.classList.toggle("on", active.includes(t.dataset.id)));
    };
    el.querySelector('[data-ref="toggles"]').addEventListener("click", (e) => {
      const t = e.target.closest(".toggle");
      if (!t) return;
      const id = t.dataset.id;
      active = active.includes(id) ? (active.length > 1 ? active.filter((x) => x !== id) : active) : [...active, id];
      SC.sound.play("click");
      refreshRadar();
    });

    /* barras: prestaciones vs valor (se anima al entrar en pantalla) */
    const barsHost = el.querySelector('[data-ref="bars"]');
    const radarHost = el.querySelector('[data-ref="radar"]');
    const drawBars = () =>
      SC.barChart(barsHost, {
        labels: BOARDS.map((b) => b.model),
        series: [
          { label: "Prestaciones medias", data: BOARDS.map((b) => round1(avg(b))), fill: (i) => BOARDS[i].color + "cc" },
          { label: "Valor (peso del precio)", data: BOARDS.map((b) => round1(b.scores.precio * 0.6 + avg(b) * 0.4)), fill: "rgba(217,135,63,0.35)", stroke: "rgba(217,135,63,0.9)" },
        ],
        tooltipExtra: (i) => {
          const b = BOARDS[i];
          return `<span class="t-amber">${eur(b.price)}${b.msrp ? ` · oferta -${SC.discount(b)}%` : ""}</span>`;
        },
      });

    let drawn = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !drawn) {
          drawn = true;
          refreshRadar();
          drawBars();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(radarHost);
  };
})();
