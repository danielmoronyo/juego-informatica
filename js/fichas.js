/* =====================================================================
 *  BISAGRA CERO · escaparate (fichas de cada portátil)
 * ===================================================================== */
(function () {
  const { LAPTOPS, eur, icon, chip, esc, num } = SC;
  const TILT = [-0.7, 0.5, 0.35, -0.45];

  function ficha(l, i) {
    const specs = [
      ["Procesador", `${l.cpu} · ${l.cores}N/${l.threads}H · ${num(l.turbo)} GHz`],
      ["Gráfica", l.gpu],
      ["RAM", `${l.ramGb} GB ${l.ramType} · ${l.ramNote}`],
      ["SSD", `${l.ssdGb} GB NVMe PCIe ${l.ssdGen}.0`],
      ["Pantalla", `${num(l.screen)}" ${l.res} ${l.panel}${l.nits ? ` · ${l.nits} nits` : ""}`],
      ["Puertos", `${l.usbA}× USB-A${l.usb2 ? ` · ${l.usb2}× USB 2.0` : ""} · ${l.usbC}× USB-C · ${l.hdmi}${l.rj45 ? " · RJ-45" : ""}${l.cardReader ? " · microSD" : ""}`],
      ["Inalámbrico", `Wi-Fi ${l.wifi} · Bluetooth ${l.bt}`],
      ["Webcam", l.webcam],
      ["Batería", `${num(l.batteryWh)} Wh`],
      ["Peso / grosor", `${num(l.weightKg, 2)} kg · ${num(l.thickMm)} mm`],
      ["Teclado", `${l.numpad ? "con" : "sin"} teclado numérico${l.fingerprint ? " · lector de huella" : ""}`],
      ["Sistema", l.os],
    ];
    return `<div class="reveal" style="transition-delay:${i * 90}ms">
      <article class="panel ficha">
        <span class="ficha-bar" style="background:${l.color}"></span>
        <div class="ficha-head" style="transform:rotate(${TILT[i]}deg)">
          <div>
            <div class="eyebrow">ficha ${String(i + 1).padStart(2, "0")}</div>
            <h3 class="ficha-model">${l.model}</h3>
            <div class="mono small t-dim45">${l.brand} · ${l.cpu}</div>
          </div>
          <div class="ficha-price">
            <div class="big">${eur(l.price)}</div>
            ${l.msrp ? `<div class="mono tiny t-dim4"><s>${eur(l.msrp)}</s> <span class="t-mint">-${SC.discount(l)}%</span></div>` : ""}
          </div>
        </div>

        <div class="ficha-art">
          <img src="${SC.laptopImg(l)}" alt="Ilustración del ${esc(l.fullName)}" loading="lazy">
          <button type="button" class="zoom-btn" data-zoom="${l.id}">${icon("expand", 12)} ampliar</button>
        </div>

        <p class="ficha-hype">${esc(l.hype)}</p>

        <div class="ficha-pros">
          <ul>${l.good.map((g) => `<li class="t-dim75"><span class="t-mint">${icon("thumbUp", 13)}</span>${esc(g)}</li>`).join("")}</ul>
          <ul>${l.bad.map((g) => `<li class="t-dim6"><span class="t-hot">${icon("thumbDown", 13)}</span>${esc(g)}</li>`).join("")}</ul>
        </div>

        <dl class="ficha-specs">
          ${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>

        <div class="ficha-foot">
          <div class="chips">
            ${chip(l.cpuBrand, l.cpuBrand === "AMD" ? "amber" : "muted")}
            ${chip(`Wi-Fi ${l.wifi}`, l.wifiN >= 6 ? "mint" : "muted")}
            ${l.windows ? chip("Windows 11", "copper") : chip("sin SO", "hot")}
          </div>
          <a class="link" href="${l.url}" target="_blank" rel="noreferrer noopener">ver en PcComponentes ${icon("external", 13)}</a>
        </div>
      </article>
    </div>`;
  }

  SC.initFichas = function (el) {
    el.innerHTML = `<div class="fichas-grid">${LAPTOPS.map(ficha).join("")}</div>
      <div class="notes">
        <span class="t-copper eyebrow-lg">Notas del mostrador</span>
        <span>· Los cuatro tienen pantalla de 15,6" Full HD, 8 GB de RAM y SSD de 512 GB.</span>
        <span>· Ninguno lleva gráfica dedicada ni Windows 11 Pro.</span>
        <span>· Solo el Lenovo permite ampliar la RAM: en los otros tres va soldada.</span>
      </div>`;
    el.addEventListener("click", (e) => {
      const z = e.target.closest("[data-zoom]");
      if (z) {
        SC.sound.play("click");
        SC.openZoom(SC.laptopById(z.dataset.zoom));
      }
    });
    SC.observeReveal(el);
  };
})();
