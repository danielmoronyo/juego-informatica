/* =====================================================================
 *  BISAGRA CERO · modo principal: el mostrador de pedidos
 * ===================================================================== */
(function () {
  const { LAPTOPS, eur, icon, chip, esc, stat, fmtInt } = SC;
  const MIN = Math.min(...LAPTOPS.map((b) => b.price));
  const MAX = Math.max(...LAPTOPS.map((b) => b.price));

  const S = {
    phase: "ready", // ready | playing | result | over
    ticket: SC.makeTicket(),
    order: SC.shuffle(LAPTOPS),
    chosen: null,
    feedback: null,
    level: SC.loadLevel("taller"),
    time: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    fuses: 3,
    round: 0,
    stats: { ok: 0, bad: 0, rejects: 0 },
    probes: 2,
    busted: [],
    learn: false,
    high: 0,
  };

  let root, benchEl, orderEl, feedbackEl;
  let raf = 0;
  let autoTimer = 0;

  const lvl = () => SC.timeLevel(S.level);
  const highKey = () => `bc0.best${S.learn ? "Learn" : "Expert"}.${S.level}`;
  /** Porcentaje de la barra de tiempo (100 % fijo si no hay reloj). */
  const pctNow = () => (lvl().secs ? (S.time / lvl().secs) * 100 : 100);
  const fullTime = () => lvl().secs || 0;
  const play = (v) => SC.sound.play(v);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  function cardState(b) {
    if (S.busted.includes(b.id)) return "dim";
    if (S.phase !== "result") return "idle";
    if (S.ticket.answer === null) return S.chosen === null ? "correct" : "busted";
    if (b.id === S.ticket.answer) return "correct";
    if (b.id === S.chosen) return "wrong";
    return "busted";
  }

  function renderBench() {
    const pct = pctNow();
    const playing = S.phase === "playing";
    const inGame = S.phase === "playing" || S.phase === "result";
    const tone = lvl().secs ? barTone(pct, 55, 28) : "bg-calm";
    benchEl.innerHTML = `<div class="panel pad">
      <div class="bench-top">
        <div class="stats-row">
          <div class="rel" id="score-host">${stat("Puntos", `<span class="anim-ok inline-block">${fmtInt(S.score)}</span>`, "mint")}</div>
          ${stat("Racha", `×${S.streak}`, S.streak >= 4 ? "amber" : "solder")}
          ${stat("Pedido", String(S.round).padStart(2, "0"))}
        </div>
        <div class="row gap3">
          ${SC.fuses(S.fuses)}
          <button type="button" class="btn btn-ghost btn-sm" data-act="probe" title="Descarta un portátil que no vale (tecla P)"
            ${S.probes <= 0 || !playing || S.ticket.answer === null ? "disabled" : ""}>${icon("gauge", 13)} Diagnóstico ${S.probes}</button>
        </div>
      </div>

      ${SC.levelPicker(S.level, inGame)}

      <div class="timebar-row">
        <div class="timebar"><div class="timebar-fill ${tone}" data-ref="bar" style="width:${pct}%"></div></div>
        <span class="time-txt ${pct > 28 ? "t-dim5" : "t-hot"}" data-ref="time">${SC.timeTxt(lvl(), S.time)}</span>
      </div>

      <div class="cards-grid">
        ${S.order
          .map((b, i) =>
            SC.laptopCard({
              board: b,
              hotkey: String(i + 1),
              state: cardState(b),
              disabled: !playing || S.busted.includes(b.id),
              reqs: S.ticket.reqs,
              showAnalysis: S.learn || S.phase === "result",
            }),
          )
          .join("")}
      </div>

      <div class="bench-actions">
        <button type="button" class="reject-btn" data-act="reject" ${playing ? "" : "disabled"}>
          ${icon("ban", 14)} Rechazar pedido <span class="kbd-hint">[R]</span>
        </button>
        <div class="row gap3 wrap">
          <button type="button" class="learn-btn ${S.learn ? "on" : ""}" data-act="learn">${icon("bulb", 13)} Modo aprendiz ${S.learn ? "ON" : "OFF"}</button>
          ${
            S.phase === "result" && S.fuses > 0
              ? `<button type="button" class="btn btn-primary btn-sm" data-act="next">Siguiente pedido <span class="kbd-hint">[espacio]</span></button>`
              : ""
          }
        </div>
      </div>
    </div>`;
  }

  function renderFeedback() {
    const fb = S.feedback;
    if (!fb) {
      feedbackEl.innerHTML = `<p class="hint">Elige el único portátil que cumple <span class="t-amber">todos</span> los requisitos, o rechaza el pedido si ninguno llega. Teclas 1-4 · R rechazar · P diagnóstico.</p>`;
      return;
    }
    const good = fb.kind === "ok" || fb.kind === "reject-ok";
    const label = { ok: `+${fb.points}`, "reject-ok": `+${fb.points} no vendido`, bad: "fallo", timeout: "fuera de margen" }[fb.kind];
    feedbackEl.innerHTML = `<div class="feedback ${good ? "good" : "bad"} anim-print"><span class="fb-label">${label}</span><span>${esc(fb.text)}</span></div>`;
  }

  function renderOrder() {
    const status = S.phase === "ready" ? "en espera" : S.phase === "over" ? "tienda cerrada" : "imprimiendo";
    let body;
    if (S.phase === "ready") {
      body = `<div class="pad6">
        <h3 class="order-title">Cuatro portátiles.<br><span class="t-amber">Un cliente</span> indeciso.<br>${lvl().secs ? SC.levelPhrase(lvl()).replace(/^./, (c) => c.toUpperCase()) + "." : "Sin reloj."}</h3>
        <p class="body-txt">Eres el dependiente de guardia. En el mostrador solo hay los cuatro portátiles nuevos más baratos de PcComponentes:
          <span class="mono t-mint">${eur(MIN)}</span> a <span class="mono t-mint">${eur(MAX)}</span>. Cada pedido exige
          cumplir todos los requisitos… o se rechaza.</p>
        <ul class="bullets">
          <li><span class="t-copper">›</span>3 cargas de batería: cada fallo${lvl().secs ? " o tiempo agotado" : ""} gasta una.</li>
          <li><span class="t-copper">›</span>Puntos = (base${lvl().secs ? " + tiempo restante" : ""} + precisión) × racha × nivel.</li>
          <li><span class="t-copper">›</span>Nivel de tiempo: 20 s, 1 minuto o sin tiempo (elígelo en el panel o con las teclas 1-3).</li>
          <li><span class="t-copper">›</span>Diagnóstico: descarta un portátil que no vale (2 usos, +1 cada 6 aciertos).</li>
        </ul>
        <div class="row gap3 mt5">
          <button type="button" class="btn btn-primary btn-lg" data-act="start">${icon("play", 16)} Abrir tienda</button>
          <div class="record">Récord · ${lvl().label}<div class="record-num">${fmtInt(S.high)}</div></div>
        </div>
      </div>`;
    } else if (S.phase === "over") {
      const rating =
        S.score > 2200 ? "jefe de tienda" : S.score > 1400 ? "vendedor estrella" : S.score > 700 ? "becario con futuro" : "repasa las fichas y vuelve";
      body = `<div class="pad6">
        <h3 class="over-title">${icon("trophy", 20)} Fin de turno</h3>
        <p class="body-txt">Sin batería. La tienda cierra con ${S.round} pedidos atendidos.</p>
        <div class="stats-grid">
          ${stat("Puntuación", fmtInt(S.score), "mint")}
          ${stat(`Récord ${lvl().label}`, fmtInt(Math.max(S.high, S.score)), "amber")}
          ${stat("Aciertos", `${S.stats.ok}/${S.stats.ok + S.stats.bad}`)}
          ${stat("Mejor racha", `×${S.bestStreak}`)}
        </div>
        <p class="rating">Valoración: ${rating} · modo ${S.learn ? "aprendiz" : "profesional"} · nivel ${lvl().label}</p>
        <button type="button" class="btn btn-primary btn-lg btn-block mt5" data-act="start">${icon("restart", 16)} Nueva partida <span class="kbd-hint">[espacio]</span></button>
      </div>`;
    } else {
      const t = S.ticket;
      body = `<div class="pad4">
        <div class="paper big anim-print">
          <div class="paper-head">
            <span class="paper-name">${esc(t.client.name)}</span>
            <span class="mono tiny wide">#${String(t.id).padStart(4, "0")}</span>
          </div>
          <p class="paper-role">${esc(t.client.role)} · ${esc(t.client.mood)}</p>
          <ul class="paper-reqs">${t.reqs.map((r) => `<li><span class="arrow">›</span><span>${esc(r.client)}</span></li>`).join("")}</ul>
          <div class="paper-tags">${t.reqs.map((r) => `<span>${esc(r.tag)}</span>`).join("")}</div>
          <div class="paper-budget"><span>precios en el mostrador</span><span>${eur(MIN)} – ${eur(MAX)}</span></div>
        </div>
        <div class="order-foot">
          <span class="order-time">${icon("timer", 12)} <span data-ref="time2">${lvl().secs ? S.time.toFixed(1) + " s" : "sin límite"}</span></span>
          ${chip(
            S.phase === "result" ? "resuelto" : `${t.reqs.length} requisito${t.reqs.length > 1 ? "s" : ""}`,
            S.phase === "result" ? "mint" : "muted",
          )}
        </div>
      </div>`;
    }
    orderEl.innerHTML = `<div class="panel-head">
        <span class="panel-kicker">Pedido del cliente</span>
        <span class="status"><span class="dot ${S.phase === "playing" ? "led" : ""}"></span>${status}</span>
      </div>${body}`;
  }

  const barTone = (pct, hi, lo) => (pct > hi ? "bg-mint" : pct > lo ? "bg-amber" : "bg-hot");

  function renderAll() {
    renderBench();
    renderFeedback();
    renderOrder();
  }

  /** Actualización ligera del cronómetro (sin re-renderizar). */
  function paintTime() {
    if (!lvl().secs) return;
    const pct = pctNow();
    const bar = root.querySelector('[data-ref="bar"]');
    const t1 = root.querySelector('[data-ref="time"]');
    const t2 = root.querySelector('[data-ref="time2"]');
    if (bar) {
      bar.style.width = pct + "%";
      bar.className = "timebar-fill " + barTone(pct, 55, 28);
    }
    if (t1) {
      t1.textContent = S.time.toFixed(1) + "s";
      t1.className = "time-txt " + (pct > 28 ? "t-dim5" : "t-hot");
    }
    if (t2) t2.textContent = S.time.toFixed(1) + " s";
  }

  /* ------------------------------------------------------------------ */
  /*  Lógica                                                             */
  /* ------------------------------------------------------------------ */
  function startClock() {
    cancelAnimationFrame(raf);
    const total = lvl().secs;
    if (!total) return; // nivel sin tiempo: no hay reloj
    const started = performance.now();
    let lastWhole = Math.ceil(total);
    const loop = () => {
      if (S.phase !== "playing") return;
      S.time = Math.max(0, total - (performance.now() - started) / 1000);
      paintTime();
      const whole = Math.ceil(S.time);
      if (whole !== lastWhole) {
        lastWhole = whole;
        if (whole <= 5 && whole > 0) play("tick");
      }
      if (S.time <= 0) {
        resolve(null, true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function resolve(boardId, timeout = false) {
    if (S.phase !== "playing") return;
    cancelAnimationFrame(raf);
    const t = S.ticket;
    const correctId = t.answer;
    const isReject = boardId === null && !timeout;
    const good = !timeout && boardId === correctId;
    // El bonus de tiempo se normaliza a la escala original (22 s) para que los tres niveles sean comparables.
    const timeLeft = lvl().secs ? (Math.max(0, S.time) / lvl().secs) * 22 : 0;
    let fb;

    if (good) {
      const raw = SC.scoreFor({ timeLeft, streak: S.streak, nReqs: t.reqs.length, trap: t.rejected });
      const pts = Math.round((S.learn ? raw / 2 : raw) * lvl().mult);
      fb = {
        kind: isReject ? "reject-ok" : "ok",
        points: pts,
        text: isReject
          ? `Ninguno de los cuatro cumple: ${t.reqs.find((r) => r.impossible)?.tag ?? "requisito imposible"}. Pedido rechazado con criterio.`
          : `Venta cerrada · el ${SC.laptopById(correctId).fullName} cumple los ${t.reqs.length} requisitos.`,
      };
      S.score += pts;
      S.streak += 1;
      S.bestStreak = Math.max(S.bestStreak, S.streak);
      if (S.streak % 6 === 0) S.probes = Math.min(4, S.probes + 1);
      S.stats.ok += 1;
      if (isReject) S.stats.rejects += 1;
      play(isReject ? "coin" : "ok");
    } else {
      let reason;
      if (timeout) {
        const c = correctId && SC.laptopById(correctId);
        reason = c
          ? `${lvl().secs === 60 ? "Se agotó el minuto" : `Se agotaron los ${lvl().secs} s`} y el cliente se fue. La respuesta era el ${c.fullName} (${eur(c.price)}).`
          : `${lvl().secs === 60 ? "Se agotó el minuto" : `Se agotaron los ${lvl().secs} s`} y había que rechazar el pedido: ninguno de los cuatro lo cumple.`;
      } else if (isReject && correctId) {
        const c = SC.laptopById(correctId);
        reason = `El ${c.fullName} sí cumplía todo por ${eur(c.price)}. No se rechaza gratis.`;
      } else {
        const w = SC.laptopById(boardId);
        const bad = t.reqs.find((r) => !r.test(w));
        reason = `${w.model} falla «${bad.tag}». El cliente se va sin comprar.`;
      }
      fb = { kind: timeout ? "timeout" : "bad", points: 0, text: reason };
      S.streak = 0;
      S.stats.bad += 1;
      S.fuses -= 1;
      play(S.fuses <= 0 ? "over" : "bad");
    }

    S.chosen = boardId;
    S.feedback = fb;
    S.phase = "result";
    renderAll();

    if (good) SC.sparks(root.querySelector("#score-host"));

    clearTimeout(autoTimer);
    if (S.fuses <= 0) {
      autoTimer = setTimeout(gameOver, 850);
    } else {
      autoTimer = setTimeout(nextRound, 2600);
    }
  }

  function gameOver() {
    S.phase = "over";
    if (S.score > SC.store.num(highKey())) {
      SC.store.set(highKey(), String(S.score));
    }
    S.high = Math.max(S.high, S.score);
    renderAll();
  }

  function nextRound() {
    if (S.phase !== "result" || S.fuses <= 0) return;
    clearTimeout(autoTimer);
    S.chosen = null;
    S.feedback = null;
    S.busted = [];
    S.ticket = SC.makeTicket();
    S.round += 1;
    S.time = fullTime();
    S.phase = "playing";
    renderAll();
    play("print");
    startClock();
  }

  function start() {
    clearTimeout(autoTimer);
    Object.assign(S, {
      order: SC.shuffle(LAPTOPS),
      score: 0,
      streak: 0,
      bestStreak: 0,
      fuses: 3,
      round: 1,
      probes: 2,
      stats: { ok: 0, bad: 0, rejects: 0 },
      busted: [],
      chosen: null,
      feedback: null,
      ticket: SC.makeTicket(),
      time: fullTime(),
      phase: "playing",
    });
    renderAll();
    play("start");
    play("print");
    startClock();
  }

  function setLevel(id) {
    if (S.phase === "playing" || S.phase === "result" || id === S.level) return;
    S.level = SC.timeLevel(id).id;
    SC.saveLevel("taller", S.level);
    S.high = SC.store.num(highKey());
    S.time = fullTime();
    play("click");
    renderBench();
    renderOrder();
  }

  function fireProbe() {
    if (S.probes <= 0 || S.phase !== "playing" || S.ticket.answer === null) return;
    const candidates = S.order.filter((b) => b.id !== S.ticket.answer && !S.busted.includes(b.id));
    if (!candidates.length) return;
    S.busted.push(candidates[Math.floor(Math.random() * candidates.length)].id);
    S.probes -= 1;
    play("click");
    renderBench();
  }

  function toggleLearn() {
    S.learn = !S.learn;
    S.high = SC.store.num(highKey());
    play("click");
    renderBench();
    if (S.phase === "ready") renderOrder();
  }

  /* ------------------------------------------------------------------ */
  /*  Eventos                                                            */
  /* ------------------------------------------------------------------ */
  function onClick(e) {
    const lv = e.target.closest("[data-level]");
    if (lv && !lv.disabled) return setLevel(lv.dataset.level);
    const card = e.target.closest(".board-card");
    if (card && !card.disabled) return resolve(card.dataset.board);
    const act = e.target.closest("[data-act]");
    if (!act || act.disabled) return;
    ({ start, next: nextRound, reject: () => resolve(null), probe: fireProbe, learn: toggleLearn })[act.dataset.act]?.();
  }

  function onKey(e) {
    if (SC.activeSection !== "taller" || SC.isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".modal")) return;
    const isGo = e.code === "Space" || e.key === "Enter";
    if (S.phase === "ready" || S.phase === "over") {
      const lv = SC.TIME_LEVELS.find((l) => l.key === e.key);
      if (lv) setLevel(lv.id);
      else if (isGo) {
        e.preventDefault();
        start();
      }
      return;
    }
    if (S.phase === "result") {
      if (isGo) {
        e.preventDefault();
        nextRound();
      }
      return;
    }
    const idx = Number(e.key) - 1;
    if (idx >= 0 && idx < S.order.length) {
      if (!S.busted.includes(S.order[idx].id)) resolve(S.order[idx].id);
    } else if (e.key.toLowerCase() === "r") resolve(null);
    else if (e.key.toLowerCase() === "p") fireProbe();
    else if (isGo) e.preventDefault(); // evita el scroll accidental en plena partida
  }

  SC.initTaller = function (el) {
    root = el;
    root.innerHTML = `<div class="taller-grid">
      <div class="bench-col"><div data-ref="bench"></div><div class="feedback-slot" data-ref="feedback"></div></div>
      <div class="panel order-panel" data-ref="order"></div>
    </div>`;
    benchEl = root.querySelector('[data-ref="bench"]');
    feedbackEl = root.querySelector('[data-ref="feedback"]');
    orderEl = root.querySelector('[data-ref="order"]');
    S.time = fullTime();
    S.high = SC.store.num(highKey());
    renderAll();
    root.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
  };
})();
