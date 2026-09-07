  /* Everything chapter 16 asks for, at a whole day from the עיקר. The moon's
     true place comes from chapter 15, the ראש from the engine's own step, and
     the רוחב from his table — so no two pages can disagree about a day.

       chapter16At(n) → { day, amiti, emtza, rosh, zanav,
                          maslul, eff, quarter, north, rochav, signed }
  */
  function chapter16At(n) {
    var v = chapter15At(n);
    var node = calculateNodePosition(n);
    var lat = calculateMoonLatitude(v.amiti, node.result);
    var maslul = lat.inputs.distFromNode.value;
    return {
      day: n,
      amiti: v.amiti,
      sunTrue: v.sunTrue,
      emtza: node.inputs.emtzaRosh.value,
      rosh: node.result,
      zanav: normalizeDegrees(node.result + 180),
      maslul: maslul,
      eff: lat.inputs.lookupAngle.value,
      quarter: Math.floor(normalizeDegrees(maslul) / 90),
      north: lat.result > 0,
      rochav: Math.abs(lat.result),
      signed: lat.result,
      node: node,
      lat: lat
    };
  }

  /* The rows he lists in ט״ז:י״א — ten degrees to ninety. The engine carries a
     nought row of its own for the point itself; he begins at ten. */
  function hisLatRows() {
    return CONSTANTS.MOON_LATITUDE_TABLE.slice(1);
  }

  /* ט״ז:י״ג–ט״ו — any מסלול brought inside the ninety degrees his table covers.
     Checked against the engine's own lookup angle by every page that uses it. */
  function foldMaslul(m) {
    var x = normalizeDegrees(m), q = Math.min(3, Math.floor(x / 90));
    var eff = q === 0 ? x : q === 1 ? 180 - x : q === 2 ? x - 180 : 360 - x;
    return { q: q, eff: eff, north: x <= 180 };
  }

  /* His three rules, in his words, as rows. The first quarter is not among them
     — there the מנין is asked of the table as it stands. */
  var FOLD_RULES = [
    { from: 90,  to: 180, ref: "ט״ז:י״ג", flip: true,
      range: "יתר על תשעים עד מאה ושמונים",
      says: "תגרע המסלול ממאה ושמונים", op: "180° −" },
    { from: 180, to: 270, ref: "ט״ז:י״ד", flip: false,
      range: "יתר ממאה ושמונים עד מאתים ושבעים",
      says: "תגרע ממנו מאה ושמונים", op: "− 180°" },
    { from: 270, to: 360, ref: "ט״ז:ט״ו", flip: true,
      range: "יתר על מאתים ושבעים עד שלש מאות ושישים",
      says: "תגרע אותו משלש מאות ושישים", op: "360° −" }
  ];

  /* The two rows of ט״ז:י״א a folded מסלול falls between, and how far along it
     sits — the part he tells you to take in ט״ז:י״ב. */
  function rochavBracket(eff) {
    var T = CONSTANTS.MOON_LATITUDE_TABLE;
    for (var i = 0; i < T.length - 1; i++) {
      if (eff >= T[i].distance && eff <= T[i + 1].distance) {
        var a = T[i].distance, b = T[i + 1].distance;
        return { lo: i, hi: i + 1, eff: eff,
                 part: b === a ? 0 : (eff - a) / (b - a),
                 gap: T[i + 1].latitude - T[i].latitude,
                 perDeg: (T[i + 1].latitude - T[i].latitude) / (b - a) };
      }
    }
    return { lo: 0, hi: 1, eff: eff, part: 0, gap: 0, perDeg: 0 };
  }

  /* The ledger of ט״ז:י — from the two places to the width, every line his. It
     recomputes the fold and the part itself and returns null rather than a
     figure the engine would not stand behind. */
  function rochavLedger(v) {
    var f = foldMaslul(v.maslul), b = rochavBracket(f.eff);
    var T = CONSTANTS.MOON_LATITUDE_TABLE;
    var mine = T[b.lo].latitude + b.part * b.gap;
    if (Math.abs(f.eff - v.eff) > 1e-9) return null;
    if (Math.abs(mine - v.rochav) > 1e-9) return null;
    var rows = [
      { l: "מקום הירח האמיתי", s: "פרק ט״ו", a: "", t: formatDms(v.amiti) },
      { l: "מקום הראש", s: "ט״ז:ג", a: "", t: formatDms(v.rosh) },
      { l: "תגרע מקום הראש ממקום הירח", a: "− " + formatDms(v.rosh), t: formatDms(v.maslul) },
      { l: "מסלול הרוחב", a: "", t: formatDms(v.maslul), out: true }
    ];
    if (f.q > 0) {
      var r = FOLD_RULES[f.q - 1];
      rows.push({ l: r.says, s: r.ref, a: r.op, t: formatDms(f.eff), drop: true });
    }
    rows.push({ l: "מנת מסלול הרוחב", s: "ט״ז:י״א–י״ב", a: formatDms(v.rochav),
                t: (v.rochav < 1 / 3600 ? "אין לו רוחב" : f.north ? "צפוני" : "דרומי"), out: true });
    return rows;
  }

  // ═══ his table of ט״ז:ב, and the turn at the end of it ═══════════════
  /* The rosh's rows are added the way every אמצע is added — but what falls out
     of them is the אמצע, and he then turns it round: "ותגרע האמצע משלש מאות
     ושישים, והנשאר הוא מקום הראש". So the trace and the ledger both stop at the
     אמצע, say his sentence, and only then give the place. Both recompute and
     show nothing rather than a figure the engine would not stand behind. */
  function nodeSum(step) {
    var I = step.inputs, T = CONSTANTS.NODE_PERIOD_BLOCKS;
    var total = I.startPos.value + I.k.value * dmsToDecimal(T.p10000) +
      I.j.value * dmsToDecimal(T.p1000) + I.i.value * dmsToDecimal(T.p100) +
      I.h.value * dmsToDecimal(T.p10) + I.d.value * dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
    total = normalizeDegrees(total);
    if (Math.abs(total - I.emtzaRosh.value) > 1e-9) return null;
    if (Math.abs(normalizeDegrees(360 - total) - step.result) > 1e-9) return null;
    return total;
  }

  function traceNodeChart(host, step, startLabel) {
    /* his headings sit in the tbody as rows of their own, so the traced rows are
       taken by their marker, not by their place in the table */
    var rows = host._rows, cells = host.querySelectorAll("tbody tr[data-row]"),
        I = step.inputs, parts = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], n = r.key ? I[r.key].value : 0;
      cells[i].classList.toggle("on", !!n);
      if (!r.key) continue;
      cells[i].querySelector(".use").textContent =
        n ? "× " + n + "  =  " + formatDms(normalizeDegrees(n * r.v)) : "×0";
      if (n) parts.push(n + " × " + r.mult.toLocaleString());
    }
    var emtza = nodeSum(step);
    host.querySelector("[data-sum]").innerHTML = emtza === null
      ? "החשבון אינו מסכים עם המנוע"
      : "מתחיל ב־<b>" + startLabel + "</b>, מוסיף כל שורה ומשליך הגלגלים השלמים — " +
        "<b>אמצע הראש</b> " + formatDms(emtza) + "." +
        "<br>ותגרע אמצע זה משלש מאות ושישים: <b>מקום הראש</b> " + step.formatted +
        '<span class="eq">' + I.daysFromBase.value.toLocaleString() + " = " + parts.join("  +  ") + "</span>";
  }

  function roshLedger(step) {
    var I = step.inputs, T = CONSTANTS.NODE_PERIOD_BLOCKS;
    var SIZES = [["k", 10000, "עשרת אלפים יום"], ["j", 1000, "אלף יום"],
                 ["i", 100, "מאה יום"], ["h", 10, "עשרה ימים"]];
    if (nodeSum(step) === null) return null;
    var total = I.startPos.value, rows = [];
    function shed() {
      while (total >= 360) {
        var c = Math.floor(total / 360); total -= c * 360;
        rows.push({ l: "השלך " + c + " " + (c > 1 ? "גלגלים שלמים" : "גלגל שלם"),
                    a: "− " + c * 360 + "°", t: formatDms(total), drop: true });
      }
    }
    rows.push({ l: "בעיקר", s: "ט״ז:ב", a: "", t: formatDms(total) });
    for (var b = 0; b < SIZES.length; b++) {
      var n = I[SIZES[b][0]].value; if (!n) continue;
      var one = dmsToDecimal(T["p" + SIZES[b][1]]);
      total += n * one;
      rows.push({ l: SIZES[b][2] + " × " + n, s: formatDms(one) + " לכל אחד",
                  a: "+ " + formatDms(n * one), t: formatDms(total) });
      shed();
    }
    if (I.d.value) {
      var day1 = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
      total += I.d.value * day1;
      rows.push({ l: "יום × " + I.d.value, s: formatDms(day1) + " לכל אחד",
                  a: "+ " + formatDms(I.d.value * day1), t: formatDms(total) });
      shed();
    }
    rows.push({ l: "אמצע הראש", a: "", t: formatDms(total), out: true });
    rows.push({ l: "תגרע האמצע משלש מאות ושישים", s: "ט״ז:ג", a: "360° −", t: formatDms(step.result) });
    rows.push({ l: "מקום הראש", s: zodiacPosition(step.result).ordinalDegree + " מעלות במזל " +
                zodiacPosition(step.result).hebrew, a: "", t: step.formatted, out: true });
    return rows;
  }

  // ═══ the two circles, and the two points they meet at ════════════════
  /* ט״ז:א drawn as he states it: the circle the sun goes round and the circle
     the moon goes round, seen from a little above the sun's own. Two circles
     that share a diameter project, from any one place, as two ellipses of the
     same width and different heights — so they cross at the ends of that
     diameter, and nowhere else. Those two crossings are the ראש and the זנב.
     The far half of each is drawn lighter, so the near rim reads as near.

     The lean is drawn four times life size: at his own five degrees the two
     ellipses would sit almost one on the other. The drawing says so under it. */
  var TV = { w: 520, h: 350, cx: 260, cy: 175, r: 205, view: 18, mag: 4 };
  var RAD16 = Math.PI / 180;
  var MAG_WORD = { 2: "פי שנים", 3: "פי שלשה", 4: "פי ארבעה", 5: "פי חמישה" };

  function maxRochav() {
    var T = CONSTANTS.MOON_LATITUDE_TABLE;
    return T[T.length - 1].latitude;         // his five degrees, read and not typed
  }
  function leanShown() { return maxRochav() * TV.mag; }

  /* whole degrees where the figure is whole degrees — the drawing's own labels */
  function degShort(x) {
    var d = Math.floor(x + 1e-9), m = Math.round((x - d) * 60);
    if (m === 60) { d++; m = 0; }
    return m ? d + "° " + m + "′" : d + "°";
  }

  /* u is measured from the ראש, the way he counts מסלול הרוחב */
  function tp(u, lean) {
    var i = (lean || 0) * RAD16, e = TV.view * RAD16, t = u * RAD16;
    var X = TV.r * Math.cos(t), Y = TV.r * Math.sin(t) * Math.cos(i),
        Z = TV.r * Math.sin(t) * Math.sin(i);
    return [TV.cx + X, TV.cy - (Y * Math.sin(e) + Z * Math.cos(e))];
  }
  function tfoot(u) {                        // straight down onto the sun's circle
    var i = leanShown() * RAD16, e = TV.view * RAD16, t = u * RAD16;
    var X = TV.r * Math.cos(t), Y = TV.r * Math.sin(t) * Math.cos(i);
    return [TV.cx + X, TV.cy - Y * Math.sin(e)];
  }
  function tpath(from, to, lean) {
    var step = to > from ? 2 : -2, d = "", u = from;
    for (; step > 0 ? u < to : u > to; u += step) {
      var p = tp(u, lean);
      d += (d ? " L " : "M ") + p[0].toFixed(1) + " " + p[1].toFixed(1);
    }
    var q = tp(to, lean);
    return d + (d ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
  }
  function lune(a, b) {                      // between the two circles, one half
    return tpath(a, b, leanShown()) + " " + tpath(b, a, 0).replace(/^M/, "L") + " Z";
  }

  function tiltFigure() {
    var lean = leanShown(), g = "";
    g += '<marker id="tip16" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" ' +
         'orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--mean)"></path></marker>';
    // the two halves he names, each between the circles
    g += '<path d="' + lune(0, 180) + '" fill="var(--mean)" fill-opacity=".08"></path>' +
         '<path d="' + lune(180, 360) + '" fill="var(--minus)" fill-opacity=".08"></path>';
    // the sun's circle: the far rim, then the near
    g += '<path d="' + tpath(0, 180, 0) + '" fill="none" stroke="var(--sunc)" stroke-width="1.6" stroke-opacity=".3"></path>' +
         '<path d="' + tpath(180, 360, 0) + '" fill="none" stroke="var(--sunc)" stroke-width="2" stroke-opacity=".8"></path>';
    // the moon's circle, leaning off it
    g += '<path d="' + tpath(0, 180, lean) + '" fill="none" stroke="var(--mean)" stroke-width="1.6" stroke-opacity=".16"></path>' +
         '<path d="' + tpath(180, 360, lean) + '" fill="none" stroke="var(--mean)" stroke-width="2" stroke-opacity=".28"></path>';
    // "שתי נקודות יש בה זו כנגד זו" — and the line that makes it plain
    var a = tp(0, 0), b = tp(180, 0);
    g += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) +
         '" y2="' + b[1].toFixed(1) + '" stroke="var(--minus)" stroke-opacity=".35" stroke-dasharray="5 4"></line>';
    g += '<path id="t16Sweep" fill="none" stroke="var(--mean)" stroke-width="3" marker-end="url(#tip16)"></path>';
    g += '<circle cx="' + TV.cx + '" cy="' + TV.cy + '" r="3.6" fill="currentColor" fill-opacity=".6"></circle>' +
         '<text x="' + TV.cx + '" y="' + (TV.cy + 17) + '" font-size="12" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".5" direction="rtl">הארץ</text>';
    // the two points themselves
    g += '<circle cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="5.5" fill="var(--minus)"></circle>' +
         '<text x="' + a[0].toFixed(1) + '" y="' + (a[1] - 13).toFixed(1) + '" font-size="15" text-anchor="middle" ' +
         'fill="var(--minus)" direction="rtl">ראש</text>' +
         '<circle cx="' + b[0].toFixed(1) + '" cy="' + b[1].toFixed(1) + '" r="5.5" fill="none" ' +
         'stroke="var(--minus)" stroke-width="2.2"></circle>' +
         '<text x="' + b[0].toFixed(1) + '" y="' + (b[1] - 13).toFixed(1) + '" font-size="15" text-anchor="middle" ' +
         'fill="var(--minus)" direction="rtl">זנב</text>';
    // חציה נוטה לצפון וחציה נוטה לדרום
    var top = tp(90, lean), bot = tp(270, lean);
    g += '<text x="' + TV.cx + '" y="' + (top[1] - 9).toFixed(1) + '" font-size="13" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".5" direction="rtl">צפון</text>' +
         '<text x="' + TV.cx + '" y="' + (bot[1] + 18).toFixed(1) + '" font-size="13" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".5" direction="rtl">דרום</text>';
    // each circle named beside itself, on the rim nearest the reader
    var ml = tp(125, lean), sl = tp(305, 0);
    g += '<text x="' + ml[0].toFixed(1) + '" y="' + (ml[1] - 14).toFixed(1) + '" font-size="13" ' +
         'text-anchor="middle" fill="var(--mean)" fill-opacity=".9" direction="rtl">עגולת הירח</text>' +
         '<text x="' + sl[0].toFixed(1) + '" y="' + (sl[1] + 18).toFixed(1) + '" font-size="13" ' +
         'text-anchor="middle" fill="var(--sunc)" fill-opacity=".9" direction="rtl">עגולת השמש</text>';
    // the moon itself, and how far it stands off the sun's circle
    g += '<line id="t16Drop" stroke="var(--mas)" stroke-width="1.6"></line>' +
         '<circle id="t16Foot" r="2.6" fill="var(--sunc)" fill-opacity=".8"></circle>' +
         '<circle id="t16Sun" r="6" fill="var(--sunc)"></circle>' +
         '<circle id="t16Moon" r="6" fill="var(--mean)"></circle>' +
         '<text id="t16Val" font-size="12" text-anchor="middle" fill="var(--mas)" ' +
         'font-family="IBM Plex Mono, monospace">—</text>';
    g += '<path id="t16Grab" class="grab16" fill="none" stroke="transparent" stroke-width="26" ' +
         'pointer-events="stroke" style="cursor:grab;touch-action:none" d="' +
         tpath(0, 360, lean) + '"></path>';
    // the one thing in the drawing that is not to his measure
    g += '<text x="' + TV.cx + '" y="' + (TV.h - 8) + '" font-size="11" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".45" direction="rtl">לא כמידתה: הנטייה מוגדלת ' +
         (MAG_WORD[TV.mag] || "×" + TV.mag) + ", ולאמיתה " + degShort(maxRochav()) + "</text>";
    return '<svg viewBox="0 0 ' + TV.w + " " + TV.h + '" role="img" ' +
      'aria-label="Two circles about the earth, one leaning off the other, crossing at two points opposite each other: the head and the tail. Half of the leaning circle stands north of the flat one, half south.">' +
      g + "</svg>";
  }

  function markTilt(v) {
    var moon = document.getElementById("t16Moon");
    if (!moon) return;
    var lean = leanShown(), u = normalizeDegrees(v.maslul);
    var m = tp(u, lean), f = tfoot(u), s = tp(normalizeDegrees(v.sunTrue - v.rosh), 0);
    moon.setAttribute("cx", m[0].toFixed(1)); moon.setAttribute("cy", m[1].toFixed(1));
    var foot = document.getElementById("t16Foot");
    foot.setAttribute("cx", f[0].toFixed(1)); foot.setAttribute("cy", f[1].toFixed(1));
    var drop = document.getElementById("t16Drop");
    drop.setAttribute("x1", m[0].toFixed(1)); drop.setAttribute("y1", m[1].toFixed(1));
    drop.setAttribute("x2", f[0].toFixed(1)); drop.setAttribute("y2", f[1].toFixed(1));
    var sun = document.getElementById("t16Sun");
    sun.setAttribute("cx", s[0].toFixed(1)); sun.setAttribute("cy", s[1].toFixed(1));
    document.getElementById("t16Sweep").setAttribute("d", u < 1 ? "" : tpath(0, u, lean));
    var val = document.getElementById("t16Val");
    val.setAttribute("x", ((m[0] + f[0]) / 2 + 26).toFixed(1));
    val.setAttribute("y", ((m[1] + f[1]) / 2 + 4).toFixed(1));
    val.textContent = v.rochav < 1 / 3600 ? "—" : degShort(v.rochav);
  }

  /* Rule eight again: this circle turns too. Dragging the moon round it moves
     the day count, so the ראש creeps the other way while it goes. */
  function grabTilt() {
    var handle = document.getElementById("t16Grab");
    if (!handle) return;
    var svg = handle.ownerSVGElement, holding = false;
    var RATE = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY) +
               dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);   // the מסלול grows by both
    function at(e) {
      var b = svg.getBoundingClientRect();
      return [(e.clientX - b.left) * TV.w / b.width, (e.clientY - b.top) * TV.h / b.height];
    }
    function nearest(p) {                    // the u whose point on the circle is closest
      var best = 0, bd = Infinity, lean = leanShown();
      for (var u = 0; u < 360; u += 1) {
        var q = tp(u, lean), d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]);
        if (d < bd) { bd = d; best = u; }
      }
      return best;
    }
    function shortest(a) { return ((a + 540) % 360) - 180; }
    handle.addEventListener("pointerdown", function (e) {
      holding = true;
      playing = false; el.play.textContent = "▶ Turn"; stopRun();
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!holding) return;
      var want = nearest(at(e)), now = normalizeDegrees(chapter16At(Math.round(day)).maslul);
      day = Math.max(0, Math.round(day + shortest(want - now) / RATE));
      drawAt(day);
    });
    function drop() { if (!holding) return; holding = false; setDay(day); }
    handle.addEventListener("pointerup", drop);
    handle.addEventListener("pointercancel", drop);
  }

  // ═══ the side view ═══════════════════════════════════════════════════
  /* A plan view cannot show a tilt: a circle leaning five degrees projects onto
     the flat as a circle again. So the leaning circle is drawn from the side —
     the sun's circle a straight line, the moon's circle the wave that leaves it
     at the ראש, climbs to five degrees, meets it again at the זנב and goes as
     far the other way. Every height on the wave is a row of his table of
     ט״ז:י״א, placed by his own rules of ט״ז:י״ג–ט״ו. Nothing here is a curve
     fitted to the shape; it is his nine figures, four times over. */
  var WV = { w: 460, h: 176, x0: 30, x1: 436, mid: 92, amp: 62 };

  function wvX(deg) { return WV.x0 + (normalizeDegrees(deg) / 360) * (WV.x1 - WV.x0); }
  function wvY(lat) {
    var top = CONSTANTS.MOON_LATITUDE_TABLE[CONSTANTS.MOON_LATITUDE_TABLE.length - 1].latitude;
    return WV.mid - (lat / top) * WV.amp;
  }

  function waveRows() {
    var T = CONSTANTS.MOON_LATITUDE_TABLE, out = [];
    for (var d = 0; d <= 360; d += 10) {
      var f = foldMaslul(d), row = null;
      for (var i = 0; i < T.length; i++) if (Math.abs(T[i].distance - f.eff) < 1e-9) row = T[i];
      if (!row) continue;
      out.push({ d: d, lat: (d > 180 ? -1 : 1) * row.latitude });
    }
    return out;
  }

  function waveFigure() {
    var pts = waveRows().map(function (p) { return wvX(p.d).toFixed(1) + "," + wvY(p.lat).toFixed(1); });
    var g = "";
    // the sun's circle, seen edge on
    g += '<line x1="' + WV.x0 + '" y1="' + WV.mid + '" x2="' + WV.x1 + '" y2="' + WV.mid +
         '" stroke="var(--sunc)" stroke-opacity=".55" stroke-width="1.4"></line>';
    for (var d = 0; d <= 360; d += 90) {
      g += '<line x1="' + wvX(d).toFixed(1) + '" y1="' + (WV.mid - 5) + '" x2="' + wvX(d).toFixed(1) +
           '" y2="' + (WV.mid + 5) + '" stroke="currentColor" stroke-opacity=".3"></line>' +
           '<text x="' + wvX(d).toFixed(1) + '" y="' + (WV.h - 6) + '" font-size="9.5" text-anchor="middle" ' +
           'fill="currentColor" fill-opacity=".45" font-family="IBM Plex Mono, monospace">' + d + '°</text>';
    }
    // where the two circles meet
    var marks = [[0, "ראש"], [180, "זנב"], [360, "ראש"]];
    for (var k = 0; k < marks.length; k++) {
      g += '<circle cx="' + wvX(marks[k][0]).toFixed(1) + '" cy="' + WV.mid +
           '" r="3.2" fill="var(--minus)"></circle>' +
           '<text x="' + wvX(marks[k][0]).toFixed(1) + '" y="' + (WV.mid + 20) + '" font-size="10.5" ' +
           'text-anchor="middle" fill="var(--minus)" direction="rtl">' + marks[k][1] + "</text>";
    }
    g += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="var(--mean)" stroke-width="2"></polyline>';
    var top = CONSTANTS.MOON_LATITUDE_TABLE[CONSTANTS.MOON_LATITUDE_TABLE.length - 1].latitude;
    g += '<text x="' + (WV.x0 - 4) + '" y="' + (wvY(top) + 3).toFixed(1) + '" font-size="10" text-anchor="end" ' +
         'fill="currentColor" fill-opacity=".45" direction="rtl">צפון</text>' +
         '<text x="' + (WV.x0 - 4) + '" y="' + (wvY(-top) + 3).toFixed(1) + '" font-size="10" text-anchor="end" ' +
         'fill="currentColor" fill-opacity=".45" direction="rtl">דרום</text>';
    // the folded twin, drawn only when a page asks for it
    g += '<line id="wvTie" stroke="var(--mas)" stroke-width="1.2" stroke-dasharray="4 3" opacity="0"></line>' +
         '<circle id="wvTwin" r="3" fill="none" stroke="var(--mas)" stroke-width="1.6" opacity="0"></circle>';
    g += '<line id="wvDrop" stroke="var(--mas)" stroke-width="1.6"></line>' +
         '<circle id="wvDot" cx="-9" cy="-9" r="4.2" fill="var(--mean)"></circle>' +
         '<text id="wvVal" x="-9" y="-9" font-size="10.5" text-anchor="middle" fill="var(--mas)" ' +
         'font-family="IBM Plex Mono, monospace">—</text>';
    return '<div class="curve"><svg viewBox="0 0 ' + WV.w + " " + WV.h + '" role="img" ' +
      'aria-label="The moon\'s circle seen from the side: it leaves the sun\'s circle at the head, reaches five degrees north, crosses back at the tail, and goes five degrees south.">' +
      g + "</svg></div>";
  }

  function markWave(v, fold) {
    var dot = document.getElementById("wvDot");
    if (!dot) return;
    var x = wvX(v.maslul), y = wvY(v.signed);
    dot.setAttribute("cx", x.toFixed(1)); dot.setAttribute("cy", y.toFixed(1));
    var drop = document.getElementById("wvDrop");
    drop.setAttribute("x1", x.toFixed(1)); drop.setAttribute("y1", WV.mid);
    drop.setAttribute("x2", x.toFixed(1)); drop.setAttribute("y2", y.toFixed(1));
    var val = document.getElementById("wvVal");
    val.setAttribute("x", x.toFixed(1));
    val.setAttribute("y", (v.signed >= 0 ? y - 10 : y + 15).toFixed(1));
    val.textContent = formatDms(v.rochav);
    var twin = document.getElementById("wvTwin"), tie = document.getElementById("wvTie");
    var f = foldMaslul(v.maslul), show = fold && f.q > 0;
    twin.setAttribute("opacity", show ? "1" : "0");
    tie.setAttribute("opacity", show ? "1" : "0");
    if (!show) return;
    var tx = wvX(f.eff), ty = wvY(v.rochav);
    twin.setAttribute("cx", tx.toFixed(1)); twin.setAttribute("cy", ty.toFixed(1));
    tie.setAttribute("x1", x.toFixed(1)); tie.setAttribute("y1", y.toFixed(1));
    tie.setAttribute("x2", tx.toFixed(1)); tie.setAttribute("y2", ty.toFixed(1));
  }

  // ═══ the ראש and the זנב on the shared instrument ════════════════════
  /* The two points are places in the mazalos, and that is how he gives them —
     "במזל בתולה בשבע ועשרים מעלות". So they go onto the wheel as places: the
     circle the ראש travels, light for the whole round and dark for what it has
     gone since the עיקר, and the arc from the ראש forward to the moon's true
     place, which is מסלול הרוחב itself. Built here rather than in wheel.html so
     every chapter-16 page draws the same picture from the same day count. */
  var R_ROSH = 200, R_ROCH = 176, roshEls = null;

  function nodeArt() {
    if (roshEls) return roshEls;
    var m =
      '<g id="n16">' +
      '<marker id="tipNode" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="var(--minus)"></path></marker>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R_ROCH + '" fill="none" stroke="currentColor" ' +
        'stroke-opacity=".16" stroke-width="1"></circle>' +
      '<path id="n16Arc" fill="none" stroke="var(--mas)" stroke-width="3.6" stroke-linecap="round"></path>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R_ROSH + '" fill="none" stroke="var(--minus)" ' +
        'stroke-width="1.6" stroke-opacity=".3"></circle>' +
      '<path id="n16Swept" fill="none" stroke="var(--minus)" stroke-width="2.6" marker-end="url(#tipNode)"></path>' +
      '<circle id="n16Grab" cx="' + CX + '" cy="' + CY + '" r="' + R_ROSH + '" fill="none" stroke="transparent" ' +
        'stroke-width="22" pointer-events="stroke" style="cursor:grab;touch-action:none"></circle>' +
      '<line id="n16From" stroke="var(--minus)" stroke-width="2" stroke-opacity=".5"></line>' +
      '<circle id="n16Rosh" r="4.6" fill="var(--minus)"></circle>' +
      '<text id="n16RoshL" font-size="11" text-anchor="middle" fill="var(--minus)" direction="rtl">ראש</text>' +
      '<circle id="n16Zanav" r="4.6" fill="none" stroke="var(--minus)" stroke-width="1.8"></circle>' +
      '<text id="n16ZanavL" font-size="11" text-anchor="middle" fill="var(--minus)" direction="rtl">זנב</text>' +
      '<line id="n16Sight" stroke="var(--mean)" stroke-width="1.5"></line>' +
      '<circle id="n16Moon" r="4.2" fill="var(--mean)"></circle>' +
      "</g>";
    el.corner.insertAdjacentHTML("beforebegin", m);
    roshEls = {};
    ["n16Arc", "n16Swept", "n16Grab", "n16From", "n16Rosh", "n16RoshL",
     "n16Zanav", "n16ZanavL", "n16Sight", "n16Moon"].forEach(function (id) {
      roshEls[id] = document.getElementById(id);
    });
    grabRosh();
    return roshEls;
  }

  /* The galgal katan of chapter 14 is still there, but this chapter is not
     about it. */
  function dimGalgalim() {
    [el.epi, el.epiC, el.grabEpi, el.arcEpi, el.farLine, el.farLbl, el.moonBody,
     el.sightLine, el.ptrMean, el.arcMean, el.defCircle, el.grabDef]
      .forEach(function (x) { if (x) x.classList.add("dimmed"); });
  }

  /* The instrument's own readouts say what this chapter reads off it. */
  function nodeDials() {
    var dm = document.querySelector(".dial.m"), ds = document.querySelector(".dial.s");
    /* the ראש reads in the colour it is drawn in, not the moon's */
    if (dm) {
      dm.querySelector(".lbl").innerHTML = "<i></i>מקום הראש";
      dm.style.setProperty("--c", "var(--minus)");
    }
    if (ds) ds.querySelector(".lbl").innerHTML = "<i></i>מסלול הרוחב";
    var cl = el.corner ? el.corner.querySelectorAll("text") : [];
    var dots = el.corner ? el.corner.querySelectorAll("circle") : [];
    if (cl[0]) { cl[0].textContent = "מקום הראש"; }
    if (dots[0]) dots[0].setAttribute("fill", "var(--minus)");
    if (el.cMean) el.cMean.setAttribute("fill", "var(--minus)");
    if (el.cMasLbl) el.cMasLbl.textContent = "רוחב הירח";
  }

  function drawNode(v) {
    var E = nodeArt();
    var rosh = P(R_ROSH, v.rosh), zan = P(R_ROSH, v.zanav);
    E.n16Rosh.setAttribute("cx", rosh[0].toFixed(2)); E.n16Rosh.setAttribute("cy", rosh[1].toFixed(2));
    E.n16Zanav.setAttribute("cx", zan[0].toFixed(2)); E.n16Zanav.setAttribute("cy", zan[1].toFixed(2));
    var rl = P(R_ROSH - 16, v.rosh), zl = P(R_ROSH - 16, v.zanav);
    put(E.n16RoshL, rl[0], rl[1] + 4);
    put(E.n16ZanavL, zl[0], zl[1] + 4);

    // light for the whole round, dark for what it has gone — and it goes backwards
    var start = normalizeDegrees(360 - dmsToDecimal(CONSTANTS.NODE.START_POSITION));
    E.n16Swept.setAttribute("d", arcPath(R_ROSH, start, v.rosh, false));
    var f0 = P(R_ROSH - 9, start), f1 = P(R_ROSH + 9, start);
    E.n16From.setAttribute("x1", f0[0].toFixed(1)); E.n16From.setAttribute("y1", f0[1].toFixed(1));
    E.n16From.setAttribute("x2", f1[0].toFixed(1)); E.n16From.setAttribute("y2", f1[1].toFixed(1));

    // מסלול הרוחב: from the ראש forward through the mazalos to the moon itself
    E.n16Arc.setAttribute("d", arcPath(R_ROCH, v.rosh, normalizeDegrees(v.rosh + v.maslul), true));
    var mo = P(R_ROCH, v.amiti);
    E.n16Moon.setAttribute("cx", mo[0].toFixed(2)); E.n16Moon.setAttribute("cy", mo[1].toFixed(2));
    E.n16Sight.setAttribute("x1", CX); E.n16Sight.setAttribute("y1", CY);
    E.n16Sight.setAttribute("x2", mo[0].toFixed(2)); E.n16Sight.setAttribute("y2", mo[1].toFixed(2));

    var zr = zodiacPosition(v.rosh);
    if (el.dMean) el.dMean.textContent = formatDms(v.rosh);
    if (el.dMeanZ) el.dMeanZ.textContent = zr.ordinalDegree + "° " + zr.hebrew;
    if (el.dMas) el.dMas.textContent = formatDms(v.maslul);
    if (el.cMean) el.cMean.textContent = formatDms(v.rosh);
    if (el.cMas) el.cMas.textContent = v.rochav < 1 / 3600 ? "—"
      : formatDms(v.rochav) + (v.north ? " צ" : " ד");
  }

  /* Rule eight: a circle you can take hold of. What really moves is the day
     count, so the moon comes round with it — at its own rate, which is why the
     ראש creeps while the moon races. */
  function grabRosh() {
    var art = document.getElementById("art"), handle = document.getElementById("n16Grab");
    var RATE = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION), holding = false;
    function at(e) {
      var b = art.getBoundingClientRect();
      return [(e.clientX - b.left) * 620 / b.width, (e.clientY - b.top) * 700 / b.height];
    }
    function shortest(a) { return ((a + 540) % 360) - 180; }
    handle.addEventListener("pointerdown", function (e) {
      holding = true;
      playing = false; el.play.textContent = "▶ Turn"; stopRun();
      art.classList.add("dragging");
      handle.setPointerCapture(e.pointerId);
      e.preventDefault(); e.stopPropagation();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!holding) return;
      var p = at(e), want = Math.atan2(CY - p[1], p[0] - CX) / (Math.PI / 180);
      var now = calculateNodePosition(Math.round(day)).result;
      day = Math.max(0, Math.round(day - shortest(want - now) / RATE));
      drawAt(day);
      e.stopPropagation();
    });
    function drop() { if (!holding) return; holding = false; art.classList.remove("dragging"); setDay(day); }
    handle.addEventListener("pointerup", drop);
    handle.addEventListener("pointercancel", drop);
  }
