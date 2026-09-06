  /* Builds a standard lesson page from a spec. Every lesson is the same shape —
     his chart, the trace, the working, and a drill — so a page describes what it
     is about and this puts it together. See CLAUDE.md for the rules it enforces.

       LESSON = {
         ch, heb, title, lede,        the header
         prev, next                   { href, label }
         step(day)                    the engine step this lesson is about
         dials: [{ heb, en, colour, value(day, step), zodiac }]
         charts: [ blocks | rows spec ]
         ledger: { title, cap, startLabel }   the running-total working, optional
         drill                        a spec for practice.js, optional
         quotes: [{ ref, text, tail }]
         note                         the footer sentence
       }
  */
  var EPOCH_MS = Date.UTC(1178, 2, 30);
  var TODAY = (function () {
    var t = new Date();
    return Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - EPOCH_MS) / 86400000);
  })();
  function dayDate(n) {
    return new Date(EPOCH_MS + n * 86400000)
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }

  function buildLesson(L) {
    var day = TODAY, host = document.getElementById("page");
    var charts = [], ledgerBody = null, dials = [];

    var h = "<header>" +
      '<div class="eyebrow">Rambam · Hilchos Kiddush HaChodesh ' + L.ch + "</div>" +
      "<h1><span class=\"heb\">" + L.heb + "</span>" + L.title + "</h1>" +
      '<p class="lede">' + L.lede + "</p>" +
      '<p class="updown">' +
      (L.prev ? '← ' + '<a href="' + L.prev.href + '">' + L.prev.label + "</a>" : "") +
      (L.prev && L.next ? "  ·  " : "") +
      (L.next ? '<a href="' + L.next.href + '">' + L.next.label + "</a> →" : "") +
      "</p></header>";

    h += '<div class="rig"><div class="dials">' +
         '<div class="dial" style="--c:var(--ink)"><span class="en">Days from the epoch — 3 Nisan 4938</span>' +
         '<span class="val" id="dDays">—</span><span class="in" id="dDate">—</span></div>';
    for (var i = 0; i < L.dials.length; i++) {
      var d = L.dials[i];
      h += '<div class="dial" style="--c:var(' + (d.colour || "--brass") + ')">' +
           '<span class="lbl"><i></i>' + d.heb + "</span>" +
           '<span class="en">' + d.en + "</span>" +
           '<span class="val" id="dv' + i + '">—</span>' +
           '<span class="in" id="di' + i + '">—</span></div>';
    }
    h += "</div>" +
      '<div class="transport">' +
      '<button type="button" data-go="0">⏮ epoch</button>' +
      '<button type="button" data-step="-10">−10d</button>' +
      '<button type="button" data-step="-1">−1d</button>' +
      '<button type="button" data-step="1">+1d</button>' +
      '<button type="button" data-step="10">+10d</button>' +
      '<button type="button" data-today>today</button>' +
      '<span class="gap"></span><label>day <input type="number" id="dayIn" step="1"></label></div>' +
      '<div class="transport second"><span class="tag">watch</span>' +
      '<button type="button" class="run" data-run="day">one day</button>' +
      '<button type="button" class="run" data-run="month">one month</button>' +
      '<button type="button" class="run" data-run="year">one year</button></div></div>';

    if (L.charts && L.charts.length) {
      h += "<h2>" + (L.chartsTitle || "The table he actually gives you") + "</h2>" +
           '<p class="sub">' + (L.chartsNote || "") + "</p>";
      for (var c = 0; c < L.charts.length; c++) {
        h += '<div id="ch' + c + '" class="rchart" style="--c:var(' + (L.charts[c].colour || "--brass") + ');margin-top:1rem"></div>';
      }
    }
    if (L.ledger) {
      h += '<div class="book" style="--c:var(' + (L.ledger.colour || "--brass") + ')"><h3>' + L.ledger.title + "</h3>" +
           '<p class="cap">' + L.ledger.cap + "</p>" +
           '<table class="led"><thead><tr><th>step</th><th>add / take off</th><th>running total</th></tr></thead>' +
           '<tbody id="ledger"></tbody></table></div>';
    }
    if (L.drill) {
      h += "<h2>Now work one yourself</h2>" +
           '<p class="sub">' + (L.drillNote || "Each piece unlocks the next, and nothing is marked from a stored answer.") + "</p>" +
           '<div id="drill" class="drill" style="--c:var(' + (L.drill.colour || "--brass") + ')"></div>';
    }
    if (L.quotes && L.quotes.length) {
      h += "<h2>In his own words</h2><div class=\"quotes\">";
      for (var q = 0; q < L.quotes.length; q++) {
        h += '<div class="q"><b>' + L.quotes[q].ref + "</b><span>" + L.quotes[q].text + "</span>" +
             (L.quotes[q].tail ? " " + L.quotes[q].tail : "") + "</div>";
      }
      h += "</div>";
    }
    h += '<p class="note">' + (L.note || "") +
      " Every figure is computed on this page by the project's own engine " +
      '(<a href="https://www.shluchimexchange.ai/kh/engine/index.json">shluchimexchange.ai/kh/engine</a>, MIT); ' +
      "charts read its tables, never a retyped copy. " +
      '<a href="index.html">All the lessons</a>.</p>';
    host.innerHTML = h;

    for (var k = 0; L.charts && k < L.charts.length; k++) {
      var el = document.getElementById("ch" + k), s = L.charts[k];
      if (s.type === "rows") renderRowChart(el, s); else renderBlockChart(el, s);
      charts.push(el);
    }
    ledgerBody = document.getElementById("ledger");

    function paintLedger(rows) {
      var out = "";
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        out += "<tr" + (r.out ? ' class="out"' : (r.drop ? ' class="drop"' : "")) + '><td class="l">' + r.l +
               (r.s ? "<small>" + r.s + "</small>" : "") + '</td><td class="a">' + (r.a || "") +
               '</td><td class="t">' + r.t + "</td></tr>";
      }
      ledgerBody.innerHTML = out;
    }

    function refresh() {
      var st = L.step ? L.step(day) : null;
      document.getElementById("dDays").textContent = day.toLocaleString();
      document.getElementById("dDate").textContent = dayDate(day);
      for (var i = 0; i < L.dials.length; i++) {
        var d = L.dials[i], v = d.value(day, st);
        document.getElementById("dv" + i).textContent = typeof v === "number" ? formatDms(v) : v;
        var extra = d.note ? d.note(day, st) : (d.zodiac && typeof v === "number"
          ? zodiacPosition(v).ordinalDegree + "° into " + zodiacPosition(v).hebrew + " · " + zodiacPosition(v).english
          : "");
        document.getElementById("di" + i).textContent = extra;
      }
      for (var k = 0; L.charts && k < L.charts.length; k++) {
        var s = L.charts[k];
        if (s.type === "rows") traceRowChart(charts[k], s, s.at(day, st), s.got(day, st));
        else traceBlockChart(charts[k], s.step(day).inputs, s.step(day), s.startLabel);
      }
      if (L.ledger) paintLedger(L.ledger.rows(day, st));
      var box = document.getElementById("dayIn");
      if (document.activeElement !== box) box.value = day;
    }

    function setDay(n) { day = Math.max(0, n); stopRun(); refresh(); }

    // one day / one month / one year, the same on every page
    var SPANS = { day: [1, 2.5], month: [29.530594, 12], year: [365.2468, 24] };
    var runTo = null, runRate = 0, runKind = null, last = 0, frac = 0;
    function stopRun() {
      runTo = null; runKind = null; frac = 0;
      var b = host.querySelectorAll("button.run");
      for (var i = 0; i < b.length; i++) b[i].classList.remove("on");
    }
    function tick(ts) {
      if (runTo !== null) {
        if (!last) last = ts;
        frac += (ts - last) / 1000 * runRate; last = ts;
        var whole = Math.floor(frac);
        if (whole >= 1) { day += whole; frac -= whole; refresh(); }
        if (day >= runTo) { day = runTo; stopRun(); refresh(); }
      }
      requestAnimationFrame(tick);
    }
    host.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.go !== undefined) setDay(Number(b.dataset.go));
      else if (b.dataset.step) setDay(day + Number(b.dataset.step));
      else if (b.hasAttribute("data-today")) setDay(TODAY);
      else if (b.dataset.run) {
        var kind = b.dataset.run;
        if (runKind === kind) { stopRun(); return; }
        stopRun(); runTo = day + Math.round(SPANS[kind][0]);
        runRate = SPANS[kind][0] / SPANS[kind][1]; runKind = kind; last = 0;
        b.classList.add("on");
      }
    });
    document.getElementById("dayIn").addEventListener("change", function () {
      var n = parseInt(this.value, 10); if (!isNaN(n)) setDay(n);
    });
    document.addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") setDay(day + 1);
      if (e.key === "ArrowLeft") setDay(day - 1);
    });

    if (L.drill) drill(document.getElementById("drill"), L.drill);
    refresh();
    requestAnimationFrame(tick);
  }
