/* =====================================================================
 *  BISAGRA CERO · motor del juego
 *  Cada requisito es una prueba real sobre la ficha técnica del portátil.
 *  El generador garantiza una única solución… o ninguna (en cuyo caso
 *  hay que rechazar el pedido).
 * ===================================================================== */
(function () {
  const LAPTOPS = SC.LAPTOPS;
  const MIN_PRICE = Math.min(...LAPTOPS.map((x) => x.price));

  /* Requisitos que pueden aparecer en un pedido normal */
  const REQUIREMENTS = [
    { id: "windows", client: "«Lo quiero encender y usar: con Windows ya instalado.»", tag: "Windows incluido", test: (l) => l.windows },
    { id: "noos", client: "«Ya tengo licencia y voy a poner Linux: no me cobres sistema.»", tag: "Sin sistema operativo", test: (l) => !l.windows },
    { id: "amd", client: "«En casa todo es AMD Ryzen, no cambio de bando.»", tag: "Procesador AMD", test: (l) => l.cpuBrand === "AMD" },
    { id: "intel", client: "«El programa de la gestoría solo está certificado en Intel.»", tag: "Procesador Intel", test: (l) => l.cpuBrand === "Intel" },
    { id: "ramexp", client: "«Ahora 8 GB, pero el año que viene quiero subir a 16.»", tag: "RAM ampliable", test: (l) => l.ramMaxGb > l.ramGb },
    { id: "rj45", client: "«En la oficina el Wi-Fi va fatal: necesito cable de red.»", tag: "Puerto RJ-45", test: (l) => l.rj45 },
    { id: "sd", client: "«Vuelco vídeos de la cámara deportiva desde la microSD.»", tag: "Lector microSD", test: (l) => l.cardReader },
    { id: "finger", client: "«Desbloqueo con huella, que odio teclear contraseñas.»", tag: "Lector de huella", test: (l) => l.fingerprint },
    { id: "wifi6", client: "«Me han puesto un router Wi-Fi 6, quiero aprovecharlo.»", tag: "Wi-Fi 6 o superior", test: (l) => l.wifiN >= 6 },
    { id: "wifi6e", client: "«Quiero la banda de 6 GHz: Wi-Fi 6E sí o sí.»", tag: "Wi-Fi 6E", test: (l) => l.wifi === "6E" },
    { id: "usbc2", client: "«Cargador y monitor por USB-C a la vez: dos puertos USB-C.»", tag: "2 × USB-C", test: (l) => l.usbC >= 2 },
    { id: "pcie4", client: "«Muevo proyectos de vídeo enormes: SSD PCIe 4.0.»", tag: "SSD PCIe 4.0", test: (l) => l.ssdGen >= 4 },
    { id: "ips", client: "«Con los paneles TN veo los colores lavados: quiero IPS.»", tag: "Pantalla IPS", test: (l) => l.panel === "IPS" },
    { id: "numpad", client: "«Llevo la contabilidad del bar: teclado numérico.»", tag: "Teclado numérico", test: (l) => l.numpad },
    { id: "cam2", client: "«Doy clases online: webcam Full HD de 2 MP.»", tag: "Webcam 2 MP", test: (l) => l.webcamMp >= 2 },
    { id: "shutter", client: "«Quiero una tapa física en la webcam, por si acaso.»", tag: "Tapa de webcam", test: (l) => l.shutter },
    { id: "cores10", client: "«Compilo código todo el día: más de 10 núcleos.»", tag: "≥ 10 núcleos", test: (l) => l.cores >= 10 },
    { id: "iris", client: "«Retoco fotos en Lightroom: gráfica Intel Iris Xe.»", tag: "Gráfica Iris Xe", test: (l) => l.gpu.includes("Iris") },
    { id: "thin", client: "«Va en una funda fina: no más de 18 mm de grosor.»", tag: "≤ 18 mm de grosor", test: (l) => l.thickMm <= 18 },
    { id: "slim20", client: "«Que no sea un ladrillo: por debajo de 2 cm de grosor.»", tag: "< 20 mm de grosor", test: (l) => l.thickMm < 20 },
    { id: "bat47", client: "«Batería de al menos 47 Wh, que viajo en tren.»", tag: "Batería ≥ 47 Wh", test: (l) => l.batteryWh >= 47 },
    { id: "light", client: "«Me duele la espalda: menos de 1,65 kg.»", tag: "Peso < 1,65 kg", test: (l) => l.weightKg < 1.65 },
    { id: "budget400", client: "«400 € justos, ni un céntimo más.»", tag: "Presupuesto ≤ 400 €", test: (l) => l.price <= 400 },
    { id: "budget440", client: "«Tengo 440 € ahorrados de la paga.»", tag: "Presupuesto ≤ 440 €", test: (l) => l.price <= 440 },
    { id: "budget450", client: "«Máximo 450 €, que luego hay que comprar ratón.»", tag: "Presupuesto ≤ 450 €", test: (l) => l.price <= 450 },
    { id: "lenovo", client: "«Solo Lenovo: el técnico de la empresa los conoce.»", tag: "Marca Lenovo", test: (l) => l.brand === "Lenovo" },
    { id: "asus", client: "«Solo ASUS, mi último me duró ocho años.»", tag: "Marca ASUS", test: (l) => l.brand === "ASUS" },
    { id: "alurin", client: "«Quiero la marca de la casa, Alurin.»", tag: "Marca Alurin", test: (l) => l.brand === "Alurin" },
    { id: "cheapest", client: "«El más barato que tengas, me da igual todo lo demás… con Windows.»", tag: "El más barato · Windows", test: (l) => l.price === MIN_PRICE && l.windows },
    {
      id: "amd-sd",
      client: "«AMD y con lector microSD integrado, para el dron.»",
      tag: "AMD + microSD",
      impossible: true,
      test: (l) => l.cpuBrand === "AMD" && l.cardReader,
    },
  ];

  /* Requisitos que ninguno de los cuatro cumple */
  const TRAMPAS = [
    { id: "gpu", client: "«Para jugar a Cyberpunk: gráfica dedicada RTX.»", tag: "Gráfica dedicada", impossible: true, test: (l) => !/UHD|Iris|Radeon 610M/.test(l.gpu) },
    { id: "ram16", client: "«16 GB de RAM de fábrica, no quiero abrir nada.»", tag: "16 GB de serie", impossible: true, test: (l) => l.ramGb >= 16 },
    { id: "oled", client: "«Pantalla OLED, que he visto una y ya no hay vuelta atrás.»", tag: "Pantalla OLED", impossible: true, test: (l) => l.panel === "OLED" },
    { id: "small", client: "«Que quepa en el bolso: 14 pulgadas o menos.»", tag: "Pantalla ≤ 14\"", impossible: true, test: (l) => l.screen <= 14 },
    { id: "ultralight", client: "«Por debajo de 1,4 kg, lo llevo a todas partes.»", tag: "Peso < 1,4 kg", impossible: true, test: (l) => l.weightKg < 1.4 },
    { id: "tb", client: "«Necesito 1 TB de SSD de serie para las fotos.»", tag: "SSD de 1 TB", impossible: true, test: (l) => l.ssdGb >= 1000 },
    { id: "wpro", client: "«Windows 11 Pro, que lo meto en el dominio de la empresa.»", tag: "Windows 11 Pro", impossible: true, test: (l) => l.os.includes("Pro") },
    { id: "wifi7", client: "«Wi-Fi 7 para el router nuevo de fibra.»", tag: "Wi-Fi 7", impossible: true, test: (l) => l.wifiN >= 7 },
    { id: "bat60", client: "«Batería de 60 Wh o más, que paso el día fuera.»", tag: "Batería ≥ 60 Wh", impossible: true, test: (l) => l.batteryWh >= 60 },
    { id: "rj45ips", client: "«Cable de red y pantalla IPS, las dos cosas.»", tag: "RJ-45 + IPS", impossible: true, test: (l) => l.rj45 && l.panel === "IPS" },
    { id: "amdwin", client: "«Un Ryzen que venga con Windows puesto.»", tag: "AMD + Windows", impossible: true, test: (l) => l.cpuBrand === "AMD" && l.windows },
  ];

  /* Relleno: lo cumplen los cuatro */
  const FILLERS = [
    { id: "fhd", client: "«Pantalla Full HD como mínimo.»", tag: "Full HD", test: (l) => l.res.startsWith("1920") },
    { id: "nvme", client: "«Que arranque rápido: SSD NVMe.»", tag: "SSD NVMe", test: (l) => l.ssdGb >= 256 },
    { id: "hdmi", client: "«Lo conecto a la tele por HDMI.»", tag: "Salida HDMI", test: (l) => l.hdmi.startsWith("HDMI") },
    { id: "ssd512", client: "«512 GB de disco, con menos no me apaño.»", tag: "SSD 512 GB", test: (l) => l.ssdGb >= 512 },
  ];

  const CLIENTS = [
    { name: "Lucía", role: "2º de bachillerato", mood: "con exámenes" },
    { name: "Raúl", role: "autónomo, fontanería", mood: "con prisa" },
    { name: "Ane", role: "estudiante de diseño", mood: "exigente con la pantalla" },
    { name: "Paco", role: "bar de barrio", mood: "tacaño" },
    { name: "Inés", role: "teletrabajo, gestoría", mood: "harta del Wi-Fi" },
    { name: "Hugo", role: "programador junior", mood: "entusiasta" },
    { name: "Marisa", role: "abuela tecnológica", mood: "desconfiada" },
    { name: "Yusuf", role: "youtuber de rutas", mood: "con drones y cámaras" },
  ];

  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rnd(arr.length)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let ticketSeq = 0;

  /** Genera un pedido. answer = id del portátil correcto, o null si hay que rechazar. */
  function makeTicket(forceTrap = false) {
    const trap = forceTrap || Math.random() < 0.22;

    if (trap) {
      const trapReq = pick(TRAMPAS);
      const extra = Math.random() < 0.75 ? pick(REQUIREMENTS.filter((r) => !r.impossible)) : null;
      const reqs = extra ? [trapReq, extra] : [trapReq];
      if (LAPTOPS.filter((l) => reqs.every((r) => r.test(l))).length === 0) {
        return { id: ++ticketSeq, client: pick(CLIENTS), reqs, answer: null, rejected: true };
      }
    }

    // Pedido normal: recortar candidatos hasta dejar 1 con al menos 2 requisitos.
    for (let attempt = 0; attempt < 60; attempt++) {
      const target = pick(LAPTOPS);
      const pool = shuffle(REQUIREMENTS.filter((r) => !r.impossible && r.test(target)));
      const chosen = [];
      let candidates = [...LAPTOPS];
      for (const req of pool) {
        if (candidates.length === 1 && chosen.length >= 2) break;
        if (chosen.length >= 3) break;
        const next = candidates.filter(req.test);
        if (next.length === 0 || next.length === candidates.length) continue;
        chosen.push(req);
        candidates = next;
      }
      if (candidates.length === 1 && candidates[0].id === target.id) {
        if (chosen.length < 2) {
          const extra = pool.find((r) => !chosen.includes(r));
          if (extra) chosen.push(extra);
        }
        if (chosen.length < 3 && Math.random() < 0.4) {
          const filler = pick(FILLERS.filter((f) => !chosen.some((c) => c.id === f.id)));
          if (filler) chosen.push(filler);
        }
        return { id: ++ticketSeq, client: pick(CLIENTS), reqs: chosen, answer: target.id, rejected: false };
      }
    }

    const t = pick(LAPTOPS);
    const solo = REQUIREMENTS.find((r) => !r.impossible && r.test(t) && LAPTOPS.filter(r.test).length === 1);
    return { id: ++ticketSeq, client: pick(CLIENTS), reqs: [solo], answer: t.id, rejected: false };
  }

  /* ---------------- Duelo de fichas ---------------- */
  const wifiTxt = (v) => (v === 6.5 ? "6E" : String(v));
  const DUEL_ATTRS = [
    { key: "price", label: "Precio", dir: "low", format: (v) => SC.eur(v), why: "más barato" },
    { key: "cores", label: "Núcleos de CPU", dir: "high", format: (v) => `${v} núcleos` },
    { key: "threads", label: "Hilos de CPU", dir: "high", format: (v) => `${v} hilos` },
    { key: "turbo", label: "Frecuencia turbo", dir: "high", format: (v) => `${SC.num(v)} GHz` },
    { key: "ramMaxGb", label: "RAM máxima", dir: "high", format: (v) => `${v} GB` },
    { key: "batteryWh", label: "Batería", dir: "high", format: (v) => `${SC.num(v)} Wh` },
    { key: "weightKg", label: "Peso", dir: "low", format: (v) => `${SC.num(v, 2)} kg`, why: "más ligero" },
    { key: "thickMm", label: "Grosor", dir: "low", format: (v) => `${SC.num(v)} mm`, why: "más fino" },
    { key: "usbC", label: "Puertos USB-C", dir: "high", format: (v) => `${v} × USB-C` },
    { key: "wifiN", label: "Generación Wi-Fi", dir: "high", format: (v) => `Wi-Fi ${wifiTxt(v)}` },
    { key: "ssdGen", label: "PCIe del SSD", dir: "high", format: (v) => `PCIe ${v}.0` },
    { key: "webcamMp", label: "Resolución webcam", dir: "high", format: (v) => (v >= 2 ? "2 MP" : "720p") },
  ];

  function makeDuel(lastKey) {
    for (let i = 0; i < 30; i++) {
      const a = pick(LAPTOPS);
      const b = pick(LAPTOPS.filter((x) => x.id !== a.id));
      const attr = pick(DUEL_ATTRS);
      const key = `${a.id}-${b.id}-${attr.key}`;
      if (key === lastKey) continue;
      const va = a[attr.key];
      const vb = b[attr.key];
      const winner = va === vb ? "tie" : (va > vb) === (attr.dir === "high") ? "a" : "b";
      if (winner === "tie" && i < 22 && Math.random() < 0.8) continue; // el empate debe ser la excepción
      return { a, b, attr, winner, key };
    }
    return { a: LAPTOPS[0], b: LAPTOPS[2], attr: DUEL_ATTRS[4], winner: "tie", key: "fallback" };
  }

  /* ---------------- Puntuación ---------------- */
  const ROUND_TIME = 22; // escala de referencia del bonus de tiempo (ver taller.js)

  function scoreFor({ timeLeft, streak, nReqs, trap }) {
    const base = trap ? 180 : 120;
    const timeBonus = Math.round(timeLeft * 12);
    const precision = (nReqs - 1) * 45;
    const streakMul = 1 + Math.min(streak, 8) * 0.15;
    return Math.round((base + timeBonus + precision) * streakMul);
  }

  Object.assign(SC, { REQUIREMENTS, TRAMPAS, FILLERS, CLIENTS, DUEL_ATTRS, ROUND_TIME, makeTicket, makeDuel, scoreFor, shuffle });
})();
