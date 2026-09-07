  var F = formatDms, N = normalizeDegrees, D = dmsToDecimal, RAD = Math.PI / 180;
  var EPOCH_MS = Date.UTC(1178, 2, 30);
  <!--@include partials/zodiac.js-->

  var CX = 310, CY = 372, R_DEF = 160, R_PTR = 214, R_ARC = 76,
      R_IN = 218, R_OUT = 276, R_STAR = 252, R_NAME = 228, R_SUN = 210;

  var KATAN_DEG = CONSTANTS.MOON.GALGALIM.GALGAL_KATAN.RADIUS_DEGREES;   // 5°, the model's own figure
  var RATIO = Math.sin(KATAN_DEG * RAD);
  var EPI_BIG = 40, EPI_TRUE = R_DEF * RATIO;

  var el = {};
  ["ring","arcMean","ptrMean",
   "epi","epiC","grabEpi","grabDef","farLine","farLbl","arcEpi","sightLine","moonBody","defCircle","fromTick","scaleNote","cMean","cMas","cMasLbl","corner",
   "dDays","dDate","dMean","dMeanZ","dMas",
   "play","speed","dayIn","rig","tabs",
   "scaleNote"].forEach(function (id) { el[id] = document.getElementById(id); });

  function P(r, deg) { var t = deg * RAD; return [CX + r * Math.cos(t), CY - r * Math.sin(t)]; }
  function put(node, x, y) { node.setAttribute("x", x.toFixed(2)); node.setAttribute("y", y.toFixed(2)); }
  function arcPath(r, a0, a1, ccw) {
    var span = ccw ? N(a1 - a0) : N(a0 - a1);
    if (span < 0.3) return "";
    var p0 = P(r, a0), p1 = P(r, a1);
    return "M " + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A " + r + " " + r + " 0 " +
           (span > 180 ? 1 : 0) + " " + (ccw ? 0 : 1) + " " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }

  // ── the ring of mazalos: glyph + name, one sector each ──
  (function () {
    var ring0 = function (r) {
      return '<circle cx="' + CX + '" cy="' + CY + '" r="' + r +
             '" fill="none" stroke="currentColor" stroke-opacity=".2"></circle>';
    };
    var s = [ring0(R_IN), ring0(R_OUT)];
    for (var k = 0; k < 12; k++) {
      var a = k * 30, i1 = P(R_IN, a), i2 = P(R_OUT, a);
      var w0 = P(R_IN, a), w1 = P(R_OUT, a), w2 = P(R_OUT, a + 30), w3 = P(R_IN, a + 30);
      s.push('<path id="sec' + k + '" d="M ' + w0[0].toFixed(1) + ' ' + w0[1].toFixed(1) +
             ' L ' + w1[0].toFixed(1) + ' ' + w1[1].toFixed(1) +
             ' A ' + R_OUT + ' ' + R_OUT + ' 0 0 0 ' + w2[0].toFixed(1) + ' ' + w2[1].toFixed(1) +
             ' L ' + w3[0].toFixed(1) + ' ' + w3[1].toFixed(1) +
             ' A ' + R_IN + ' ' + R_IN + ' 0 0 1 ' + w0[0].toFixed(1) + ' ' + w0[1].toFixed(1) +
             ' Z" fill="var(--brass)" fill-opacity="0" stroke="none"></path>');
      s.push('<line x1="' + i1[0].toFixed(1) + '" y1="' + i1[1].toFixed(1) + '" x2="' + i2[0].toFixed(1) +
             '" y2="' + i2[1].toFixed(1) + '" stroke="currentColor" stroke-opacity=".2"></line>');
      // the constellation itself
      var c = P(R_STAR, a + 15), fig = STARS[k], W = 40, H = 34, g = [];
      var sx = function (q) { return c[0] + (q[0] - .5) * W; };
      var sy = function (q) { return c[1] + (q[1] - .5) * H; };
      for (var e = 0; e < fig.e.length; e++) {
        var u = fig.p[fig.e[e][0]], v = fig.p[fig.e[e][1]];
        g.push('<line x1="' + sx(u).toFixed(1) + '" y1="' + sy(u).toFixed(1) + '" x2="' + sx(v).toFixed(1) +
               '" y2="' + sy(v).toFixed(1) + '" stroke="currentColor" stroke-width=".7"></line>');
      }
      for (var q = 0; q < fig.p.length; q++) {
        var big = fig.b.indexOf(q) >= 0;
        g.push('<circle cx="' + sx(fig.p[q]).toFixed(1) + '" cy="' + sy(fig.p[q]).toFixed(1) +
               '" r="' + (big ? 2.1 : 1.3) + '" fill="currentColor"></circle>');
      }
      s.push('<g id="st' + k + '" opacity=".45">' + g.join("") + "</g>");
      var n = P(R_NAME, a + 15);
      s.push('<text x="' + n[0].toFixed(1) + '" y="' + (n[1] + 4).toFixed(1) + '" font-size="11" text-anchor="middle" ' +
             'fill="currentColor" fill-opacity=".45" id="nm' + k + '">' +
             '<tspan font-family="' + SYMFONT + '" font-size="12">' + GLYPH[k] + VS + '</tspan> ' + MAZAL[k] + "</text>");
    }
    el.ring.innerHTML = s.join("");
  })();
  var sec = [], stm = [], nml = [];
  for (var k = 0; k < 12; k++) {
    sec.push(document.getElementById("sec" + k));
    stm.push(document.getElementById("st" + k));
    nml.push(document.getElementById("nm" + k));
  }
  function lightSector(idx) {
    for (var i = 0; i < 12; i++) {
      sec[i].setAttribute("fill-opacity", i === idx ? ".09" : "0");
      stm[i].setAttribute("opacity", i === idx ? "1" : ".45");
      nml[i].setAttribute("fill-opacity", i === idx ? ".9" : ".45");
    }
  }

  // ── the engine's numbers at whole days ──
  var cacheDay = null, cacheVals = null;
  function atDay(n) {
    if (cacheDay === n) return cacheVals;
    cacheDay = n;
    cacheVals = { mean: calculateMoonMeanLongitude(n), mas: calculateMoonMaslul(n) };
    return cacheVals;
  }
  function tween(a, b, f) { return N(a + (((b - a + 540) % 360) - 180) * f); }
  /* Where these two circles put the moon as seen from the earth — pure geometry
     of the chapter-14 model. The Rambam turns it into a table in chapter 15. */
  function sightAngle(mean, mas) {
    return N(mean - Math.atan2(RATIO * Math.sin(mas * RAD), 1 + RATIO * Math.cos(mas * RAD)) / RAD);
  }
  function bandFor(lon) {
    var B = CONSTANTS.SEASON_CORRECTIONS;
    for (var q = 0; q < B.length; q++) if (lon >= B[q].sunFrom && lon < B[q].sunTo) return B[q];
    return B[0];
  }

  // ── the running-total ledger, the Rambam's way ──
  var BLOCKS = [["k",10000,"10,000"],["j",1000,"1,000"],["i",100,"100"],["h",10,"10"]];
  function ledger(step, tbl, dailyDms, startLabel) {
    var I = step.inputs, T = CONSTANTS[tbl];
    var key = I.startPosition ? "startPosition" : "maslulStart";
    var total = I[key].value, rows = [];
    function shed() {
      while (total >= 360) {
        var c = Math.floor(total / 360); total -= c * 360;
        rows.push({ l: "throw away " + c + " whole circle" + (c > 1 ? "s" : ""),
                    a: "− " + c * 360 + "°", t: F(total), drop: true });
      }
    }
    rows.push({ l: "Position at the epoch", s: startLabel, a: "", t: F(total) });
    for (var b = 0; b < BLOCKS.length; b++) {
      var n = I[BLOCKS[b][0]].value; if (!n) continue;
      var one = D(T["p" + BLOCKS[b][1]]);
      total += n * one;
      rows.push({ l: n + " × " + BLOCKS[b][2] + " days", s: F(one) + " each", a: "+ " + F(n * one), t: F(total) });
      shed();
    }
    var d = I.d.value;
    if (d) {
      total += d * D(dailyDms);
      rows.push({ l: d + " × 1 day", s: F(D(dailyDms)) + " each", a: "+ " + F(d * D(dailyDms)), t: F(total) });
      shed();
    }
    if (Math.abs(total - step.result) > 1e-9) return null;
    rows.push({ l: step.hebrewName, a: "", t: step.formatted, out: true });
    return rows;
  }
  function paint(tbody, rows) {
    if (!rows) { tbody.innerHTML = '<tr><td class="l">recomputation disagreed with the engine — hidden</td></tr>'; return; }
    var h = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += "<tr" + (r.out ? ' class="out"' : (r.drop ? ' class="drop"' : "")) + '><td class="l">' + r.l +
           (r.s ? "<small>" + r.s + "</small>" : "") + '</td><td class="a">' + r.a +
           '</td><td class="t">' + r.t + "</td></tr>";
    }
    tbody.innerHTML = h;
  }

  // ── state ──
  var pageIsReady = false;

  /* A page says which galgal it is about; the other is dimmed rather than gone,
     so the whole machine is still visible. */
  var PAGE = document.querySelector(".page") || document.body;
  var EMPH = PAGE.dataset ? (PAGE.dataset.emph || "") : "";
  /* When a page is about one row of his table, the sweep starts where he starts
     — at the position at the epoch — so the arc IS that row's מהלך. */
  var FROM_EPOCH = PAGE.dataset && PAGE.dataset.epoch !== undefined
    ? Number(PAGE.dataset.epoch) : null;
  function emphasise() {
    if (!EMPH) return;
    var corner = el.corner ? el.corner.querySelectorAll("text, circle") : [];
    var mas = [el.epi, el.epiC, el.arcEpi, el.farLine, el.farLbl, el.moonBody, el.grabEpi,
               document.querySelector(".dial.s"), el.cMas, el.cMasLbl, corner[3], corner[5]];
    var mean = [el.defCircle, el.arcMean, el.ptrMean, el.sightLine, el.fromTick, el.grabDef,
                document.querySelector(".dial.m"), el.cMean, corner[0], corner[2]];
    var off = EMPH === "mean" ? mas : mean;
    for (var i = 0; i < off.length; i++) if (off[i]) off[i].classList.add("dimmed");
    var on = EMPH === "mean" ? mean : mas;
    for (var j = 0; j < on.length; j++) if (on[j]) on[j].classList.add("lit");
  }
  var day = 0, playing = false, last = 0, step = 1, lastWhole = null, trueScale = false;
  var runTo = null, runRate = 0, runKind = null;

  function drawAt(dayFloat) {
    var n = Math.floor(dayFloat), f = dayFloat - n;
    var a = atDay(n), b = f > 0 ? atDay(n + 1) : a;
    var mean = f > 0 ? tween(a.mean.result, b.mean.result, f) : a.mean.result;
    var mas  = f > 0 ? tween(a.mas.result,  b.mas.result,  f) : a.mas.result;
    var epiR = trueScale ? EPI_TRUE : EPI_BIG;

    var C = P(R_DEF, mean);
    el.epi.setAttribute("cx", C[0].toFixed(2)); el.epi.setAttribute("cy", C[1].toFixed(2));
    el.epi.setAttribute("r", epiR.toFixed(2));
    el.grabEpi.setAttribute("cx", C[0].toFixed(2)); el.grabEpi.setAttribute("cy", C[1].toFixed(2));
    el.grabEpi.setAttribute("r", epiR.toFixed(2));
    el.epiC.setAttribute("cx", C[0].toFixed(2)); el.epiC.setAttribute("cy", C[1].toFixed(2));
    var farA = mean, moonA = mean - mas;
    var Mo = [C[0] + epiR * Math.cos(moonA * RAD), C[1] - epiR * Math.sin(moonA * RAD)];
    // where the maslul is counted from: a crossbar on the rim, not a second radius
    var rim = [C[0] + epiR * Math.cos(farA * RAD), C[1] - epiR * Math.sin(farA * RAD)];
    var px = -Math.sin(farA * RAD), py = -Math.cos(farA * RAD);
    el.farLine.setAttribute("x1", (rim[0] - px * 5).toFixed(2));
    el.farLine.setAttribute("y1", (rim[1] - py * 5).toFixed(2));
    el.farLine.setAttribute("x2", (rim[0] + px * 5).toFixed(2));
    el.farLine.setAttribute("y2", (rim[1] + py * 5).toFixed(2));
    put(el.moonBody, Mo[0], Mo[1]);
    var fa2 = (farA + 20) * RAD, fl = epiR + 11;
    put(el.farLbl, C[0] + fl * Math.cos(fa2), C[1] - fl * Math.sin(fa2) + 3);
    var masFrom = (FROM_EPOCH !== null && EMPH === "mas") ? FROM_EPOCH : 0;
    var startA = farA - masFrom;
    var span = N(mas - masFrom);
    var q0 = [C[0] + epiR * Math.cos(startA * RAD), C[1] - epiR * Math.sin(startA * RAD)];
    var q1 = [C[0] + epiR * Math.cos(moonA * RAD), C[1] - epiR * Math.sin(moonA * RAD)];
    el.arcEpi.setAttribute("d", span < 1 ? "" : "M " + q0[0].toFixed(2) + " " + q0[1].toFixed(2) +
      " A " + epiR.toFixed(2) + " " + epiR.toFixed(2) + " 0 " + (span > 180 ? 1 : 0) + " 1 " +
      q1[0].toFixed(2) + " " + q1[1].toFixed(2));

    var tip = P(R_PTR, mean);
    el.ptrMean.setAttribute("x2", tip[0].toFixed(2)); el.ptrMean.setAttribute("y2", tip[1].toFixed(2));
    // the sweep hugs the big circle, the same way the maslul hugs the small one —
    // held just inside the epicycle so the arrowhead never lands under it
    var meanFrom = (FROM_EPOCH !== null && EMPH === "mean") ? FROM_EPOCH : 0;
    el.arcMean.setAttribute("d", arcPath(R_DEF, meanFrom, mean, true));
    if (el.fromTick) {
      var ft0 = P(R_DEF - 9, meanFrom), ft1 = P(R_DEF + 9, meanFrom);
      el.fromTick.setAttribute("x1", ft0[0].toFixed(1)); el.fromTick.setAttribute("y1", ft0[1].toFixed(1));
      el.fromTick.setAttribute("x2", ft1[0].toFixed(1)); el.fromTick.setAttribute("y2", ft1[1].toFixed(1));
      el.fromTick.setAttribute("opacity", FROM_EPOCH !== null && EMPH === "mean" ? "1" : "0");
    }
    el.cMean.textContent = (FROM_EPOCH !== null && EMPH === "mean")
      ? F(N(mean - FROM_EPOCH)) : F(mean);
    el.cMas.textContent = (FROM_EPOCH !== null && EMPH === "mas")
      ? F(N(mas - FROM_EPOCH)) : F(mas);



    var moonDir = Math.atan2(CY - Mo[1], Mo[0] - CX) / RAD;
    var lp = P(R_PTR, moonDir);
    el.sightLine.setAttribute("x2", lp[0].toFixed(2)); el.sightLine.setAttribute("y2", lp[1].toFixed(2));

    var z = zodiacPosition(mean);
    el.dDays.textContent = n.toLocaleString();
    el.dDate.textContent = new Date(EPOCH_MS + n * 86400000)
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    el.dMean.textContent = F(mean);
    el.dMeanZ.textContent = z.ordinalDegree + "° " + z.hebrew;
    el.dMas.textContent = F(mas);
    if (document.activeElement !== el.dayIn) el.dayIn.value = n;
    if (pageIsReady && typeof onDraw === "function") onDraw(n, mean, mas);
    lightSector(z.index);

  }


  function frame(ts) {
    if (!last) last = ts;
    var dt = (ts - last) / 1000; last = ts;
    if (runTo !== null) {
      day += dt * runRate;
      if (day >= runTo) { day = runTo; stopRun(); }
    } else if (playing) {
      day += dt * Number(el.speed.value);
      if (day < 0) day = 0;
    }
    drawAt(day);
    var w = Math.floor(day);
    requestAnimationFrame(frame);
  }
  function setDay(n) { stopRun(); day = Math.max(0, n); lastWhole = null; drawAt(day); }

  // ── watch one day / one month / one year ──
  var SPANS = { day: [1, 2.5], month: [29.530594, 12], year: [365.2468, 24] };
  var runBtns = document.querySelectorAll("button.run");
  function stopRun() {
    runTo = null; runKind = null;
    for (var i = 0; i < runBtns.length; i++) runBtns[i].classList.remove("on");
  }
  function startRun(kind) {
    if (runKind === kind) { stopRun(); return; }
    stopRun();
    var s = SPANS[kind];
    playing = false; el.play.textContent = "▶ Turn";
    day = Math.floor(day);
    runTo = day + s[0]; runRate = s[0] / s[1]; runKind = kind; last = 0;
    for (var i = 0; i < runBtns.length; i++) runBtns[i].classList.toggle("on", runBtns[i].dataset.run === kind);
  }
  for (var r = 0; r < runBtns.length; r++) {
    runBtns[r].addEventListener("click", function (e) { startRun(e.currentTarget.dataset.run); });
  }

  function setNote() {
    el.scaleNote.textContent = trueScale
      ? "True proportion: the small circle's radius is " + KATAN_DEG + "° of the big one."
      : "Small circle drawn larger than life.";
  }
  el.play.addEventListener("click", function () {
    stopRun(); playing = !playing; last = 0;
    el.play.textContent = playing ? "❙❙ Pause" : "▶ Turn";
  });
  document.getElementById("m1").addEventListener("click", function () { setDay(Math.floor(day) - 1); });
  document.getElementById("p1").addEventListener("click", function () { setDay(Math.floor(day) + 1); });
  document.getElementById("m10").addEventListener("click", function () { setDay(Math.floor(day) - 10); });
  document.getElementById("p10").addEventListener("click", function () { setDay(Math.floor(day) + 10); });
  document.getElementById("toEpoch").addEventListener("click", function () { setDay(0); });
  document.getElementById("toToday").addEventListener("click", function () {
    var t = new Date();
    setDay(Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - EPOCH_MS) / 86400000));
  });
  el.dayIn.addEventListener("change", function () {
    var n = parseInt(el.dayIn.value, 10); if (!isNaN(n)) setDay(n);
  });
  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") setDay(Math.floor(day) + 1);
    if (e.key === "ArrowLeft") setDay(Math.floor(day) - 1);
    if (e.key === " ") { e.preventDefault(); el.play.click(); }
  });

  // Dragging a circle turns it, and the day count is what really changes — so
  // the other circle comes with it, at its own rate.
  (function () {
    var art = document.getElementById("art"), holding = null;
    var RATE_MEAN = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    var RATE_MAS = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
    function at(e) {
      var b = art.getBoundingClientRect();
      return [(e.clientX - b.left) * 620 / b.width, (e.clientY - b.top) * 700 / b.height];
    }
    function shortest(a) { return ((a + 540) % 360) - 180; }
    art.addEventListener("pointerdown", function (e) {
      if (!e.target.classList.contains("grab")) return;
      holding = e.target.id === "grabEpi" ? "epi" : "def";
      playing = false; el.play.textContent = "▶ Turn"; stopRun();
      art.classList.add("dragging");
      art.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    art.addEventListener("pointermove", function (e) {
      if (!holding) return;
      var p = at(e), v = atDay(Math.floor(day)), f = day - Math.floor(day);
      var w = f > 0 ? atDay(Math.floor(day) + 1) : v;
      var mean = f > 0 ? tween(v.mean.result, w.mean.result, f) : v.mean.result;
      var mas = f > 0 ? tween(v.mas.result, w.mas.result, f) : v.mas.result;
      if (holding === "def") {
        var want = Math.atan2(CY - p[1], p[0] - CX) / RAD;
        day += shortest(want - mean) / RATE_MEAN;
      } else {
        var C = P(R_DEF, mean);
        var angC = Math.atan2(C[1] - p[1], p[0] - C[0]) / RAD;
        day += shortest(N(mean - angC) - mas) / RATE_MAS;
      }
      day = Math.max(0, Math.round(day));   // he counts whole days; the drag detents on them
      lastWhole = null;
      drawAt(day);
    });
    function drop(e) {
      if (!holding) return;
      holding = null;
      art.classList.remove("dragging");
      setDay(day);
    }
    art.addEventListener("pointerup", drop);
    art.addEventListener("pointercancel", drop);
  })();

  var today = new Date();
  day = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - EPOCH_MS) / 86400000);
  setNote();
  /* Deferred: wheel.js is included above the page's own code, so its `var`s are
     not assigned yet. Booting on the next tick lets the page finish first. */
  setTimeout(function () {
    if (typeof pageReady === "function") pageReady();
    pageIsReady = true;
    document.addEventListener("click", function (e) {
      var tr = e.target.closest ? e.target.closest("tr[data-days]") : null;
      if (!tr) return;
      var rows = document.querySelectorAll("tr[data-days]");
      for (var i = 0; i < rows.length; i++) rows[i].classList.toggle("on", rows[i] === tr);
      setDay(Number(tr.dataset.days));
    });
    drawAt(day);
    emphasise();
  }, 0);
  if (!PAGE.dataset.epoch &&
      (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    playing = true; el.play.textContent = "❙❙ Pause";
  }
  requestAnimationFrame(frame);
