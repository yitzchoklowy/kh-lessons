  /* Chapter eleven: the circle itself, before anything travels on it.

     Everything here reads a plain longitude the way he reads one — which mazal,
     and which degree of that mazal — and draws the circle it is read off. */
  <!--@include partials/zodiac.js-->

  var RAD11 = Math.PI / 180;

  /* The ladder of י״א:ז, taken from the engine rather than typed: one degree is
     sixty of the next thing down, and sixty of that again. */
  var PER = Math.round(1 / dmsToDecimal({ minutes: 1 }));
  var ARC = SIGN_ARC;
  var ROUND = ARC * 12;

  /* His ordinal. י״א:ח puts 10°30′40″ into תאומים "בחצי מעלת אחת עשרה" — a place
     part-way through a degree is inside the next one up, which is what the
     engine's ordinalDegree returns. י״א:ט puts 320° into דלי "בעשרים מעלה בו",
     and there the place has completed twenty degrees exactly and stands at the
     twenty-degree mark, not inside the twenty-first; the engine returns 21 for
     it. The engine is vendored verbatim and not edited, so the boundary is
     settled here, and both of his places are pinned in test/kh11.test.mjs. */
  function hisOrdinal(into) {
    var whole = Math.round(into);
    if (Math.abs(into - whole) < 1e-9) return whole === 0 ? 1 : whole;
    return Math.floor(into) + 1;
  }

  /* A place on the circle, said his way. */
  function readPlace(lon) {
    var z = zodiacPosition(lon);
    return {
      lon: normalizeDegrees(lon),
      index: z.index,
      mazal: z.hebrew,
      glyph: z.symbol,
      into: z.degreesInto,
      ordinal: hisOrdinal(z.degreesInto),
      passed: z.index
    };
  }

  /* Whole degrees read as whole degrees; anything finer keeps his three parts. */
  function degStr(v) {
    return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) + "°" : formatDms(v);
  }

  /* Hebrew numerals, for the degree he names in words. */
  function gem(n) {
    var ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"],
        TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"],
        HUND = ["", "ק", "ר", "ש", "ת"];
    var s = "", c = Math.floor(n / 100), r = n % 100;
    while (c > 4) { s += "ת"; c -= 4; }
    s += HUND[c];
    if (r === 15) s += "טו";
    else if (r === 16) s += "טז";
    else s += TENS[Math.floor(r / 10)] + ONES[r % 10];
    if (!s) return "0";
    return s.length === 1 ? s + "׳" : s.slice(0, -1) + "״" + s.slice(-1);
  }

  /* The twelve, in his order (י״א:ט), with the arc each one holds — every figure
     off the engine's own list and its own sign arc. */
  function mazalRows() {
    var rows = [];
    for (var k = 0; k < 12; k++) {
      rows.push({
        i: k,
        name: CONSTANTS.CONSTELLATIONS[k],
        glyph: SIGN_SYMBOLS[k],
        from: k * ARC,
        to: (k + 1) * ARC
      });
    }
    return rows;
  }

  /* ── the drawing ─────────────────────────────────────────────────────────
     One circle, in one colour: light for the whole round, dark for the part
     already swept from ראש טלה, an arrowhead at the leading end. */
  var CX11 = 310, CY11 = 320,
      R_CIRC = 172, R_PTR = 192, R_IN11 = 206, R_OUT11 = 270,
      R_NAME11 = 218, R_STAR11 = 248, R_TICK = 286;

  function P11(r, deg) {
    var t = deg * RAD11;
    return [CX11 + r * Math.cos(t), CY11 - r * Math.sin(t)];
  }

  function arc11(r, a0, a1) {
    var span = normalizeDegrees(a1 - a0);
    if (span < 0.25) return "";
    var p0 = P11(r, a0), p1 = P11(r, a1);
    return "M " + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A " + r + " " + r + " 0 " +
           (span > 180 ? 1 : 0) + " 0 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }

  function ringMarkup() {
    var s = [], k, a;
    function circle(r, op) {
      return '<circle cx="' + CX11 + '" cy="' + CY11 + '" r="' + r +
             '" fill="none" stroke="currentColor" stroke-opacity="' + op + '"></circle>';
    }
    s.push(circle(R_IN11, ".2"), circle(R_OUT11, ".2"));

    for (k = 0; k < 12; k++) {
      a = k * ARC;
      var w0 = P11(R_IN11, a), w1 = P11(R_OUT11, a),
          w2 = P11(R_OUT11, a + ARC), w3 = P11(R_IN11, a + ARC);
      s.push('<path id="zsec' + k + '" d="M ' + w0[0].toFixed(1) + ' ' + w0[1].toFixed(1) +
             ' L ' + w1[0].toFixed(1) + ' ' + w1[1].toFixed(1) +
             ' A ' + R_OUT11 + ' ' + R_OUT11 + ' 0 0 0 ' + w2[0].toFixed(1) + ' ' + w2[1].toFixed(1) +
             ' L ' + w3[0].toFixed(1) + ' ' + w3[1].toFixed(1) +
             ' A ' + R_IN11 + ' ' + R_IN11 + ' 0 0 1 ' + w0[0].toFixed(1) + ' ' + w0[1].toFixed(1) +
             ' Z" fill="var(--mas)" fill-opacity="0" stroke="none"></path>');
      s.push('<line x1="' + w0[0].toFixed(1) + '" y1="' + w0[1].toFixed(1) +
             '" x2="' + w1[0].toFixed(1) + '" y2="' + w1[1].toFixed(1) +
             '" stroke="currentColor" stroke-opacity=".2"></line>');

      // the constellation, drawn the way the wheel draws it everywhere else
      var c = P11(R_STAR11, a + ARC / 2), fig = STARS[k], W = 40, H = 34, g = [], e, q;
      var sx = function (p) { return c[0] + (p[0] - .5) * W; };
      var sy = function (p) { return c[1] + (p[1] - .5) * H; };
      for (e = 0; e < fig.e.length; e++) {
        var u = fig.p[fig.e[e][0]], v = fig.p[fig.e[e][1]];
        g.push('<line x1="' + sx(u).toFixed(1) + '" y1="' + sy(u).toFixed(1) +
               '" x2="' + sx(v).toFixed(1) + '" y2="' + sy(v).toFixed(1) +
               '" stroke="currentColor" stroke-width=".7"></line>');
      }
      for (q = 0; q < fig.p.length; q++) {
        g.push('<circle cx="' + sx(fig.p[q]).toFixed(1) + '" cy="' + sy(fig.p[q]).toFixed(1) +
               '" r="' + (fig.b.indexOf(q) >= 0 ? 2.1 : 1.3) + '" fill="currentColor"></circle>');
      }
      s.push('<g id="zst' + k + '" opacity=".45">' + g.join("") + "</g>");

      var n = P11(R_NAME11, a + ARC / 2);
      s.push('<text id="znm' + k + '" x="' + n[0].toFixed(1) + '" y="' + (n[1] + 4).toFixed(1) +
             '" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity=".45">' +
             '<tspan font-family="' + SYMFONT + '" font-size="12">' + SIGN_SYMBOLS[k] + VS +
             '</tspan> ' + CONSTANTS.CONSTELLATIONS[k] + "</text>");

      // where each mazal opens, in degrees of the whole round
      var t = P11(R_TICK, a);
      s.push('<text x="' + t[0].toFixed(1) + '" y="' + (t[1] + 3.5).toFixed(1) +
             '" font-size="9.5" text-anchor="middle" fill="currentColor" fill-opacity=".4" ' +
             'font-family="IBM Plex Mono, monospace">' + a + "°</text>");
    }
    return s.join("");
  }

  function wheelMarkup() {
    return '' +
      '<defs><marker id="zTip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" ' +
      'markerHeight="5.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--mas)"></path></marker>' +
      '<g id="zEarth"><circle r="9" fill="#2f6fae"></circle>' +
      '<circle r="9" fill="none" stroke="#0d2b45" stroke-opacity=".55" stroke-width="1"></circle></g></defs>' +
      '<g id="zring">' + ringMarkup() + "</g>" +
      // the whole round, light
      '<circle cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC + '" fill="none" ' +
      'stroke="var(--mas)" stroke-width="1.6" stroke-opacity=".3"></circle>' +
      // ראש טלה, where the count opens
      '<line x1="' + CX11 + '" y1="' + CY11 + '" x2="' + (CX11 + R_OUT11) + '" y2="' + CY11 +
      '" stroke="currentColor" stroke-opacity=".22" stroke-width="1"></line>' +
      '<text x="' + (CX11 + R_CIRC - 4) + '" y="' + (CY11 - 8) +
      '" font-size="10" text-anchor="end" fill="currentColor" fill-opacity=".45">ראש טלה</text>' +
      // the part already swept, dark, with the head at the leading end
      '<path id="zarc" fill="none" stroke="var(--mas)" stroke-width="2.8" ' +
      'marker-end="url(#zTip)"></path>' +
      // a fat transparent stroke on the circle is the handle
      '<circle id="zgrab" class="grab" cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC +
      '" fill="none" stroke="transparent" stroke-width="26" pointer-events="stroke"></circle>' +
      '<line id="zptr" stroke="var(--mas)" stroke-width="1.4" stroke-dasharray="5 3"></line>' +
      // a ring round the leading end, so the arrowhead is not lost in a blob
      '<circle id="zdot" r="8" fill="none" stroke="var(--mas)" stroke-width="1.5"></circle>' +
      '<use href="#zEarth" x="' + CX11 + '" y="' + CY11 + '"></use>' +
      '<text x="' + CX11 + '" y="' + (CY11 + 24) + '" font-size="11" text-anchor="middle" ' +
      'fill="currentColor" fill-opacity=".55">הארץ</text>';
  }

  /* Put the place at `deg` on the drawing. */
  function paintWheel(deg) {
    var p = P11(R_CIRC, deg), q = P11(R_PTR, deg), i;
    document.getElementById("zarc").setAttribute("d", arc11(R_CIRC, 0, deg));
    var ptr = document.getElementById("zptr");
    ptr.setAttribute("x1", CX11); ptr.setAttribute("y1", CY11);
    ptr.setAttribute("x2", q[0].toFixed(2)); ptr.setAttribute("y2", q[1].toFixed(2));
    var dot = document.getElementById("zdot");
    dot.setAttribute("cx", p[0].toFixed(2)); dot.setAttribute("cy", p[1].toFixed(2));

    var idx = readPlace(deg).index;
    for (i = 0; i < 12; i++) {
      document.getElementById("zsec" + i).setAttribute("fill-opacity", i === idx ? ".1" : "0");
      document.getElementById("zst" + i).setAttribute("opacity", i === idx ? "1" : ".45");
      document.getElementById("znm" + i).setAttribute("fill-opacity", i === idx ? ".9" : ".45");
    }
  }

  /* The running ledger, laid out the way every other page lays one out. */
  function paintLed(tbody, rows) {
    if (!rows) {
      tbody.innerHTML = '<tr><td class="l">recomputation disagreed with the engine — hidden</td></tr>';
      return;
    }
    var h = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += "<tr" + (r.out ? ' class="out"' : "") + '><td class="l">' + r.l +
           (r.s ? "<small>" + r.s + "</small>" : "") + '</td><td class="a">' + (r.a || "") +
           '</td><td class="t">' + r.t + "</td></tr>";
    }
    tbody.innerHTML = h;
  }

  /* Turning the circle by hand: the handle is the circle's own stroke, and only
     the handle takes the touch, so a phone can still be scrolled past the
     drawing. */
  function grabWheel(svg, onTurn) {
    var down = false;
    function angleAt(ev) {
      var b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      var x = (ev.clientX - b.left) / b.width * vb.width;
      var y = (ev.clientY - b.top) / b.height * vb.height;
      return normalizeDegrees(Math.atan2(CY11 - y, x - CX11) / RAD11);
    }
    svg.addEventListener("pointerdown", function (ev) {
      if (ev.target.id !== "zgrab" && ev.target.id !== "zdot") return;
      down = true;
      svg.classList.add("dragging");
      svg.setPointerCapture(ev.pointerId);
      onTurn(angleAt(ev));
    });
    svg.addEventListener("pointermove", function (ev) {
      if (!down) return;
      ev.preventDefault();
      onTurn(angleAt(ev));
    });
    function drop(ev) {
      if (!down) return;
      down = false;
      svg.classList.remove("dragging");
      try { svg.releasePointerCapture(ev.pointerId); } catch (e) { /* already gone */ }
    }
    svg.addEventListener("pointerup", drop);
    svg.addEventListener("pointercancel", drop);
  }
