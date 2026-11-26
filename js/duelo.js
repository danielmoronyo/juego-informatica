/* =====================================================================
 *  BISAGRA CERO · segundo modo: duelo de fichas
 * ===================================================================== */
(function () {
  const { eur, icon, chip, stat, fmtInt } = SC;
  const S = {
    duel: SC.makeDuel(),
    phase: "ready", // ready | live | reveal | over
    level: SC.loadLevel("duelo"),
    time: 0,
    score: 0,
    streak: 0,
    lives: 3,
    picked: null,
    rounds: 0,
    best: 0,
  };
  let root;
  let raf = 0;
  let timer = 0;
  const play = (v) => SC.sound.play(v);
  const lvl = () => SC.timeLevel(S.level);
  const bestKey = () => `bc0.bestDuel.${S.level}`;
  const pctNow = () => (lvl().secs ? (S.time / lvl().secs) * 100 : 100);

  const fmt = (v) => (S.duel.attr.format ? S.duel.attr.format(v) : `${v}${S.duel.attr.unit}`);
  const tone = (pct) => (pct > 50 ? "bg-mint" : pct > 25 ? "bg-amber" : "bg-hot");

  function header() {
    return `<div class="panel-head">
      <span class="row gap2"><span class="t-copper">${icon("swords", 15)}</span><span class="panel-kicker">Duelo de fichas</span></span>
      <span class="row gap5">
        ${stat("Puntos", fmtInt(S.score), "mint")}
        ${stat("Racha", `×${S.streak}`, S.streak >= 3 ? "amber" : "solder")}
        ${chip(`${icon("timer", 11)} ${lvl().label}`, lvl().secs === 20 ? "hot" : lvl().secs ? "amber" : "muted")}
        ${SC.fuses(S.lives, 15)}
      </span>
    </div>`;
  }

  function sideHtml(side) {
    const d = S.duel;
    const b = side === "a" ? d.a : d.b;
    const reveal = S.phase === "reveal" || S.phase === "over";
    const win = reveal && (d.winner === side || d.winner === "tie");
    const chose = S.picked === side;
    return `<div class="duel-side ${reveal ? (win ? "win" : "lose") : ""} ${side === "b" ? "side-b" : ""}">
      <div class="duel-side-head">
        <div><div class="eyebrow">${b.brand}</div><div class="duel-model">${b.model}</div></div>
        <span class="mono bold t-amber">${eur(b.price)}</span>
      </div>
      <img class="duel-art" src="${SC.laptopImg(b)}" alt="Ilustración del ${b.fullName}" draggable="false">
      <div class="duel-val">
        <span class="eyebrow">${d.attr.label}</span>
        <span class="duel-num ${reveal ? (win ? "t-mint" : "t-dim5") : "t-dim25"}">${reveal ? fmt(b[d.attr.key]) : "???"}</span>
      </div>
      <button type="button" class="btn ${chose ? "btn-primary" : "btn-ghost"} btn-sm btn-block mt3" data-pick="${side}" ${S.phase !== "live" ? "disabled" : ""}>
        Gana ${side === "a" ? "izquierda" : "derecha"} <span class="kbd-hint">[${side === "a" ? "←" : "→"}]</span>
      </button>
    </div>`;
  }

  function render() {
    if (S.phase === "ready") {
      root.innerHTML = `<div class="panel ovh">${header()}
        <div class="duel-ready">
          <div>
            <h3 class="duel-title">Dos portátiles, un dato, <span class="t-amber">${SC.levelPhrase(lvl())}</span>.</h3>
            <p class="body-txt">Se sortean dos de los cuatro portátiles y un dato de su ficha técnica. Decide cuál gana —o si empatan—${lvl().secs ? " antes de que se agote el tiempo." : " a tu ritmo."} Con las fichas estudiadas esto vuela.</p>
            <div class="mt4">${SC.levelPicker(S.level, false)}</div>
            <div class="row gap3 wrap mt4">
              <button type="button" class="btn btn-primary" data-act="start">${icon("trophy", 14)} Empezar duelo</button>
              <span class="mono tiny t-dim4">← izquierda · E empate · derecha →</span>
            </div>
          </div>
          <div class="attr-box">
            <div class="eyebrow mb2">Atributos en juego</div>
            <div class="chips">${SC.DUEL_ATTRS.map((a) => a.label)
              .map((a) => chip(a))
              .join("")}</div>
            <p class="mono tiny t-dim45 mt3">Récord · ${lvl().label}: <span class="t-amber">${fmtInt(S.best)}</span> pts</p>
          </div>
        </div>
      </div>`;
      return;
    }

    const d = S.duel;
    const pct = pctNow();
    const reveal = S.phase === "reveal" || (S.phase === "over" && S.picked !== undefined);
    let explain = "";
    if (reveal) {
      const good = S.picked === d.winner;
      const win = d.winner === "a" ? d.a : d.b;
      explain = `<p class="feedback ${good ? "good" : "bad"} anim-print mt4">
        ${fmt(d.a[d.attr.key])} vs ${fmt(d.b[d.attr.key])} ·
        ${
          d.winner === "tie"
            ? "empate: los dos tienen el mismo dato"
            : `gana ${win.model} (${d.attr.why || "dato mayor"})`
        }${S.picked === null ? " · tiempo agotado" : ""}
      </p>`;
    }
    const over =
      S.phase === "over"
        ? `<div class="over-box">
            <div><div class="over-title">Sin batería</div>
              <p class="mono small t-dim6">${S.rounds} duelos · ${fmtInt(S.score)} pts · récord ${lvl().label} ${fmtInt(Math.max(S.best, S.score))}</p>
              <div class="mt3">${SC.levelPicker(S.level, false)}</div></div>
            <button type="button" class="btn btn-danger" data-act="start">${icon("trophy", 14)} Revancha <span class="kbd-hint">[espacio]</span></button>
          </div>`
        : "";

    root.innerHTML = `<div class="panel ovh">${header()}
      <div class="pad4">
        <div class="timebar-row mb4"><div class="timebar thin"><div class="timebar-fill ${lvl().secs ? tone(pct) : "bg-calm"}" data-ref="bar" style="width:${pct}%"></div></div>
          <span class="time-txt t-dim5" data-ref="time">${SC.timeTxt(lvl(), S.time)}</span></div>
        <div class="duel-q">
          <span class="t-copper">${icon("sort", 15)}</span>
          <p>¿Quién gana en <span class="t-amber">${d.attr.label}</span>?</p>
        </div>
        <div class="duel-grid">
          ${sideHtml("a")}
          <div class="duel-mid">
            <button type="button" class="btn ${S.picked === "tie" ? "btn-amber" : "btn-ghost"}" data-pick="tie" ${S.phase !== "live" ? "disabled" : ""}>Empate</button>
            <span class="mono tiny t-dim35">[E] o [↓]</span>
          </div>
          ${sideHtml("b")}
        </div>
        ${explain}
        ${over}
      </div>
    </div>`;
  }

  function paintTime() {
    const bar = root.querySelector('[data-ref="bar"]');
    if (!bar || !lvl().secs) return;
    const pct = pctNow();
    bar.style.width = pct + "%";
    bar.className = "timebar-fill " + tone(pct);
    const t = root.querySelector('[data-ref="time"]');
    if (t) {
      t.textContent = SC.timeTxt(lvl(), S.time);
      t.className = "time-txt " + (pct > 25 ? "t-dim5" : "t-hot");
    }
  }

  function startClock() {
    cancelAnimationFrame(raf);
    const total = lvl().secs;
    if (!total) return; // nivel sin tiempo
    const t0 = performance.now();
    let lastWhole = total;
    const loop = () => {
      if (S.phase !== "live") return;
      S.time = Math.max(0, total - (performance.now() - t0) / 1000);
      paintTime();
      const w = Math.ceil(S.time);
      if (w !== lastWhole) {
        lastWhole = w;
        if (w <= 4 && w > 0) play("tick");
      }
      if (S.time <= 0) return answer(null);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function nextDuel() {
    S.duel = SC.makeDuel(S.duel.key);
    S.picked = null;
    S.time = lvl().secs || 0;
    S.rounds += 1;
    S.phase = "live";
    render();
    startClock();
  }

  function answer(choice) {
    if (S.phase !== "live") return;
    cancelAnimationFrame(raf);
    const good = choice === S.duel.winner;
    S.picked = choice;
    S.phase = "reveal";

    if (good) {
      // bonus de tiempo normalizado a la escala original (12 s × 9 pts) y multiplicador del nivel
      const bonus = lvl().secs ? Math.round((S.time / lvl().secs) * 108) : 0;
      S.score += Math.round((60 + bonus + S.streak * 12) * lvl().mult);
      S.streak += 1;
      play("ok");
      render();
      timer = setTimeout(nextDuel, 1900);
      return;
    }

    S.streak = 0;
    S.lives = Math.max(0, S.lives - 1);
    play(S.lives <= 0 ? "over" : "bad");
    render();
    timer = setTimeout(() => {
      if (S.lives <= 0) {
        if (S.score > SC.store.num(bestKey())) SC.store.set(bestKey(), String(S.score));
        S.phase = "over";
        render();
        S.best = Math.max(S.best, S.score);
      } else nextDuel();
    }, 1900);
  }

  function start() {
    clearTimeout(timer);
    Object.assign(S, { score: 0, streak: 0, lives: 3, rounds: 1, time: lvl().secs || 0, duel: SC.makeDuel(), picked: null, phase: "live" });
    render();
    play("start");
    startClock();
  }

  function setLevel(id) {
    if ((S.phase !== "ready" && S.phase !== "over") || id === S.level) return;
    S.level = SC.timeLevel(id).id;
    SC.saveLevel("duelo", S.level);
    S.best = SC.store.num(bestKey());
    play("click");
    render();
  }

  function onKey(e) {
    if (SC.activeSection !== "duelo" || SC.isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".modal")) return;
    if (S.phase === "ready" || S.phase === "over") {
      const lv = SC.TIME_LEVELS.find((l) => l.key === e.key);
      if (lv) setLevel(lv.id);
      else if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        start();
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      answer("a");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      answer("b");
    } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "e") {
      e.preventDefault();
      answer("tie");
    } else if (e.code === "Space") e.preventDefault();
  }

  SC.initDuelo = function (el) {
    root = el;
    S.best = SC.store.num(bestKey());
    render();
    root.addEventListener("click", (e) => {
      const lv = e.target.closest("[data-level]");
      if (lv && !lv.disabled) return setLevel(lv.dataset.level);
      const p = e.target.closest("[data-pick]");
      if (p && !p.disabled) return answer(p.dataset.pick);
      const a = e.target.closest('[data-act="start"]');
      if (a) start();
    });
    window.addEventListener("keydown", onKey);
  };
})();
