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
     Nothing travels here yet. There is the earth, the ring of the mazalos, and
     the graduation between them, and a place is a direction from the one to the
     other: the circle is drawn light for the whole round and dark for how far
     round from ראש טלה the place lies. That dark part is a measurement, not a
     journey — no body has been named yet, so nothing carries an arrowhead and
     nothing has a path of its own. */
  var CX11 = 310, CY11 = 320,
      R_CIRC = 196, R_PTR = 196, R_IN11 = 206, R_OUT11 = 270,
      R_SUB = 9, R_MAG_IN = 104, R_MAG_OUT = 132, MAG_SPAN = 150,
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

  function annulus(r0, r1, a0, a1) {
    var big = normalizeDegrees(a1 - a0) > 180 ? 1 : 0;
    var o0 = P11(r1, a0), o1 = P11(r1, a1), i1 = P11(r0, a1), i0 = P11(r0, a0);
    return "M " + o0[0].toFixed(1) + " " + o0[1].toFixed(1) +
           " A " + r1 + " " + r1 + " 0 " + big + " 0 " + o1[0].toFixed(1) + " " + o1[1].toFixed(1) +
           " L " + i1[0].toFixed(1) + " " + i1[1].toFixed(1) +
           " A " + r0 + " " + r0 + " 0 " + big + " 1 " + i0[0].toFixed(1) + " " + i0[1].toFixed(1) + " Z";
  }

  /* Which piece of the circle a clause opens, and into how many. Each one is a
     piece of the piece above it: a mazal out of the round, a מעלה out of the
     mazal, a חלק out of the מעלה, a שניה out of the חלק. */
  function magSource(mode, p) {
    var d = decimalToDms(p.into), sec = Math.floor(d.seconds);
    var degAt = p.index * ARC + Math.floor(p.into);
    var chelekAt = degAt + d.minutes / PER;
    var shniyaAt = chelekAt + sec / (PER * PER);
    if (mode === "sign")
      return { a0: p.index * ARC, w: ARC, n: ARC, hit: Math.floor(p.into),
               name: "מזל " + p.mazal, holds: ARC + " מעלות" };
    if (mode === "maalah")
      return { a0: degAt, w: 1, n: PER, hit: d.minutes,
               name: "מעלה " + gem(p.ordinal), holds: PER + " חלקים" };
    if (mode === "chelek")
      return { a0: chelekAt, w: 1 / PER, n: PER, hit: sec,
               name: "חלק " + gem(d.minutes || PER), holds: PER + " שניות" };
    if (mode === "shniya")
      return { a0: shniyaAt, w: 1 / (PER * PER), n: PER,
               hit: Math.round((d.seconds - sec) * PER),
               name: "שניה " + gem(sec || PER), holds: PER + " שלישיות" };
    return null;
  }

  /* One piece of the circle, opened out inside the circle it came off — with
     the two lines that say which piece it is. A חלק of a מעלה is a sixtieth of
     a thirtieth of a twelfth of the round; it cannot be drawn where it lies, so
     it is drawn beside itself, and the two lines carry the eye between them. */
  function magMarkup(mode, p) {
    var s = magSource(mode, p);
    if (!s) return "";
    var mid = s.a0 + s.w / 2, half = MAG_SPAN / 2;
    var b0 = mid - half, b1 = mid + half, cw = MAG_SPAN / s.n, g = "", k;

    // the two lines out of the piece it came from
    var e0 = P11(R_CIRC, s.a0), e1 = P11(R_CIRC, s.a0 + s.w);
    var f0 = P11(R_MAG_OUT, b0), f1 = P11(R_MAG_OUT, b1);
    g += '<path d="M ' + e0[0].toFixed(1) + " " + e0[1].toFixed(1) + " L " + f0[0].toFixed(1) +
         " " + f0[1].toFixed(1) + " M " + e1[0].toFixed(1) + " " + e1[1].toFixed(1) + " L " +
         f1[0].toFixed(1) + " " + f1[1].toFixed(1) + '" stroke="var(--mas)" ' +
         'stroke-opacity=".45" stroke-width="1" stroke-dasharray="4 3" fill="none"></path>';

    // the piece itself on the circle, marked however small it is
    g += '<path d="' + annulus(R_CIRC, R_CIRC + R_SUB, s.a0, s.a0 + Math.max(s.w, 0.45)) +
         '" fill="var(--mas)" fill-opacity=".85"></path>';

    // opened out
    g += '<path d="' + annulus(R_MAG_IN, R_MAG_OUT, b0, b1) + '" fill="var(--sunk)" ' +
         'stroke="currentColor" stroke-opacity=".25"></path>';
    g += '<path d="' + annulus(R_MAG_IN, R_MAG_OUT, b0 + s.hit * cw, b0 + (s.hit + 1) * cw) +
         '" fill="var(--mas)" fill-opacity=".45"></path>';
    for (k = 0; k <= s.n; k++) {
      var a = b0 + k * cw, ten = k % 10 === 0;
      var t0 = P11(ten ? R_MAG_IN : R_MAG_OUT - 8, a), t1 = P11(R_MAG_OUT, a);
      g += '<line x1="' + t0[0].toFixed(1) + '" y1="' + t0[1].toFixed(1) + '" x2="' +
           t1[0].toFixed(1) + '" y2="' + t1[1].toFixed(1) + '" stroke="currentColor" ' +
           'stroke-opacity="' + (ten ? ".45" : ".2") + '" stroke-width="1"></line>';
      if (ten && k < s.n) {
        var nl = P11(R_MAG_OUT + 11, a + cw / 2);
        g += '<text x="' + nl[0].toFixed(1) + '" y="' + (nl[1] + 3.5).toFixed(1) +
             '" font-size="9" text-anchor="middle" fill="currentColor" fill-opacity=".4" ' +
             'font-family="IBM Plex Mono, monospace">' + k + "</text>";
      }
    }

    var lb = P11(R_MAG_IN - 16, mid);
    g += '<text x="' + lb[0].toFixed(1) + '" y="' + lb[1].toFixed(1) + '" font-size="12.5" ' +
         'text-anchor="middle" paint-order="stroke" stroke="var(--card)" stroke-width="3.5" ' +
         'stroke-linejoin="round" fill="var(--mas)">' + s.name + "</text>";
    g += '<text x="' + lb[0].toFixed(1) + '" y="' + (lb[1] + 15).toFixed(1) + '" font-size="10.5" ' +
         'text-anchor="middle" paint-order="stroke" stroke="var(--card)" stroke-width="3.5" ' +
         'stroke-linejoin="round" fill="currentColor" fill-opacity=".5">' + s.holds + "</text>";
    return g;
  }

  /* A mazal divided into its thirty, drawn where it lies — at this size the
     degrees still have room to be told apart, and the finer parts do not. */
  function subMarkup(mode, p) {
    if (mode !== "sign" && mode !== "maalah") return "";
    var g = "", k, a0 = p.index * ARC;
    for (k = 0; k <= ARC; k++) {
      var t0 = P11(R_CIRC, a0 + k), t1 = P11(R_CIRC + R_SUB, a0 + k);
      g += '<line x1="' + t0[0].toFixed(1) + '" y1="' + t0[1].toFixed(1) + '" x2="' +
           t1[0].toFixed(1) + '" y2="' + t1[1].toFixed(1) + '" stroke="var(--mas)" ' +
           'stroke-opacity=".55" stroke-width="1"></line>';
    }
    return g;
  }

  function wheelMarkup() {
    return '' +
      '<defs><marker id="zTip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" ' +
      'markerHeight="5.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--mas)"></path></marker>' +
      '<g id="zEarth"><circle r="9" fill="#2f6fae"></circle>' +
      '<circle r="9" fill="none" stroke="#0d2b45" stroke-opacity=".55" stroke-width="1"></circle></g></defs>' +
      '<g id="zring">' + ringMarkup() + "</g>" +
      /* The circle he is dividing. Nothing travels on it on this page — there is
         the earth, the mazalos, and the three hundred and sixty degrees between
         them — so it is drawn as a graduation, not as anybody's path. */
      '<circle cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.4" stroke-opacity=".3"></circle>' +
      '<g id="zsub"></g><g id="zmag" opacity="0"></g>' +
      // ראש טלה, where the count opens
      '<line x1="' + CX11 + '" y1="' + CY11 + '" x2="' + (CX11 + R_OUT11) + '" y2="' + CY11 +
      '" stroke="currentColor" stroke-opacity=".22" stroke-width="1"></line>' +
      '<text id="zHeadLbl" x="' + (CX11 + R_CIRC - 4) + '" y="' + (CY11 - 8) +
      '" font-size="10" text-anchor="end" fill="currentColor" fill-opacity=".45">ראש טלה</text>' +
      /* how far round from ראש טלה the place lies — a measurement along the
         graduation, not a journey, so it carries no arrowhead */
      '<path id="zarc" fill="none" stroke="var(--mas)" stroke-width="2.8"></path>' +
      // a fat transparent stroke on the circle is the handle
      '<circle id="zgrab" class="grab" cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC +
      '" fill="none" stroke="transparent" stroke-width="26" pointer-events="stroke"></circle>' +
      // ── what each of his clauses points at, dark until it is asked for ──
      '<circle id="zfull" cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC +
      '" fill="none" stroke="var(--mas)" stroke-width="4" opacity="0"></circle>' +
      '<path id="zsecArc" fill="none" stroke="var(--mas)" stroke-width="5" ' +
      'stroke-linecap="round" opacity="0"></path>' +
      '<text id="zsecLbl" font-size="13" text-anchor="middle" fill="var(--mas)" ' +
      'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round" ' +
      'font-family="IBM Plex Mono, monospace" opacity="0">30°</text>' +
      '<g id="zstart" opacity="0">' +
      '<line x1="' + CX11 + '" y1="' + CY11 + '" x2="' + (CX11 + R_OUT11) + '" y2="' + CY11 +
      '" stroke="var(--mas)" stroke-width="2.4"></line>' +
      '<circle cx="' + (CX11 + R_CIRC) + '" cy="' + CY11 + '" r="5" fill="var(--mas)"></circle>' +
      '<text x="' + (CX11 + R_CIRC - 6) + '" y="' + (CY11 - 12) + '" font-size="12" ' +
      'text-anchor="end" fill="var(--mas)">ראש טלה · 0°</text></g>' +
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

  /* His clause, on the drawing. Each one lights the thing it names and nothing
     else; with no clause chosen the wheel stands as it was. */
  function showOn(mode, deg) {
    var p = readPlace(deg), i;
    var full = document.getElementById("zfull"),
        arc = document.getElementById("zsecArc"),
        lbl = document.getElementById("zsecLbl"),
        start = document.getElementById("zstart");

    full.setAttribute("opacity", mode === "round" ? ".9" : "0");
    start.setAttribute("opacity", mode === "start" ? "1" : "0");
    /* the bright marker says ראש טלה itself; two of them on the same spot is one too many */
    document.getElementById("zHeadLbl").setAttribute("opacity", mode === "start" ? "0" : "1");

    /* the finer parts, on the circle itself: the mazal cut into its thirty
       where that can still be seen, and the piece opened out where it cannot */
    document.getElementById("zsub").innerHTML = subMarkup(mode, p);
    var mag = document.getElementById("zmag");
    mag.innerHTML = magMarkup(mode, p);
    mag.setAttribute("opacity", mag.innerHTML ? "1" : "0");
    /* the pointer would run straight through what is being looked at */
    document.getElementById("zptr").setAttribute("opacity", mag.innerHTML ? ".25" : "1");

    var onSector = mode === "sign" || mode === "start" || mode === "maalah";
    var band = mode === "start" ? 0 : p.index;
    if (onSector) {
      arc.setAttribute("d", arc11(R_CIRC + 30, band * ARC, (band + 1) * ARC));
      arc.setAttribute("opacity", ".95");
      var mid = P11(R_CIRC + 15, band * ARC + ARC / 2);
      lbl.setAttribute("x", mid[0].toFixed(1));
      lbl.setAttribute("y", (mid[1] + 4).toFixed(1));
      lbl.textContent = ARC + "°";
      lbl.setAttribute("opacity", mode === "sign" ? ".95" : "0");
    } else {
      arc.setAttribute("opacity", "0");
      lbl.setAttribute("opacity", "0");
    }

    /* on ראש טלה the first sector is the one being pointed at, not the one the
       place happens to stand in */
    for (i = 0; i < 12; i++) {
      var lit = onSector ? i === band : i === p.index;
      document.getElementById("zsec" + i).setAttribute("fill-opacity", lit ? (onSector ? ".2" : ".1") : "0");
      document.getElementById("znm" + i).setAttribute("fill-opacity", lit ? ".95" : ".45");
      document.getElementById("zst" + i).setAttribute("opacity", lit ? "1" : ".45");
    }
    litBand(mode === "sign" ? "sign" : mode === "maalah" ? "maalah"
          : mode === "chelek" ? "chelek" : mode === "shniya" ? "shniya" : "");
  }

  /* ── the ladder of י״א:ז, drawn ───────────────────────────────────────────
     "וכן תדקדק החשבון ותחלק כל זמן שתרצה." One mazal opened out into its thirty
     מעלות; the מעלה this place stands in opened into its sixty חלקים; that חלק
     into its שניות, and that שניה into its שלישיות. Each band is one cell of
     the band above it, blown up — which is the whole of what he is saying.

     Every count comes off the engine: thirty from its sign arc, sixty from the
     minute it divides a degree into. */
  var LOU = { x0: 44, x1: 584, top: 44, h: 26, gap: 84 };

  function loupeBands(p) {
    var d = decimalToDms(p.into);
    var sec = Math.floor(d.seconds), third = Math.round((d.seconds - sec) * PER);
    return [
      { key: "sign",   n: ARC, hit: Math.floor(p.into),
        name: "מזל " + p.mazal, holds: ARC + " מעלות" },
      { key: "maalah", n: PER, hit: d.minutes,
        name: "מעלה " + gem(p.ordinal) + " בו", holds: PER + " חלקים" },
      { key: "chelek", n: PER, hit: sec,
        name: "חלק " + gem(d.minutes || PER), holds: PER + " שניות" },
      { key: "shniya", n: PER, hit: third,
        name: "שניה " + gem(sec || PER), holds: PER + " שלישיות" }
    ];
  }

  function loupeMarkup(p) {
    var bands = loupeBands(p), W = LOU.x1 - LOU.x0, g = "", i, k;

    for (i = 0; i < bands.length; i++) {
      var b = bands[i], y = LOU.top + i * LOU.gap, cw = W / b.n;

      // the cell of the band above that this one opens out
      if (i > 0) {
        var a = bands[i - 1], aw = W / a.n, ay = LOU.top + (i - 1) * LOU.gap + LOU.h;
        var lx = LOU.x0 + a.hit * aw, rx = lx + aw;
        g += '<path class="lz lz' + i + '" d="M ' + lx.toFixed(1) + " " + ay +
             " L " + rx.toFixed(1) + " " + ay + " L " + LOU.x1 + " " + y +
             " L " + LOU.x0 + " " + y + ' Z" fill="var(--mas)" fill-opacity=".07" ' +
             'stroke="var(--mas)" stroke-opacity=".3" stroke-width="1" ' +
             'stroke-dasharray="4 3"></path>';
      }

      g += '<g class="lb lb-' + b.key + '">';
      g += '<rect x="' + LOU.x0 + '" y="' + y + '" width="' + W + '" height="' + LOU.h +
           '" rx="4" fill="var(--sunk)" stroke="currentColor" stroke-opacity=".18"></rect>';
      g += '<rect class="lhit" x="' + (LOU.x0 + b.hit * cw).toFixed(1) + '" y="' + y +
           '" width="' + cw.toFixed(1) + '" height="' + LOU.h +
           '" fill="var(--mas)" fill-opacity=".3"></rect>';

      for (k = 0; k <= b.n; k++) {
        var x = LOU.x0 + k * cw, ten = k % 10 === 0;
        g += '<line x1="' + x.toFixed(1) + '" y1="' + (y + LOU.h - (ten ? 15 : 7)) +
             '" x2="' + x.toFixed(1) + '" y2="' + (y + LOU.h) + '" stroke="currentColor" ' +
             'stroke-opacity="' + (ten ? ".5" : ".22") + '" stroke-width="1"></line>';
        if (ten && k < b.n) {
          g += '<text x="' + x.toFixed(1) + '" y="' + (y + LOU.h + 13) +
               '" font-size="9.5" text-anchor="middle" fill="currentColor" fill-opacity=".38" ' +
               'font-family="IBM Plex Mono, monospace">' + k + "</text>";
        }
      }

      // what this band is, and what it holds
      /* the zoom cone passes behind these, so punch them out of it */
      var HALO = 'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" ' +
                 'stroke-linejoin="round" ';
      g += '<text x="' + LOU.x1 + '" y="' + (y - 8) + '" font-size="12" text-anchor="end" ' +
           HALO + 'fill="var(--mas)" fill-opacity=".95">' + b.name + "</text>";
      g += '<text x="' + LOU.x0 + '" y="' + (y - 8) + '" font-size="11" text-anchor="start" ' +
           HALO + 'fill="currentColor" fill-opacity=".45">' + b.holds + "</text>";
      g += "</g>";
    }
    return '<svg viewBox="0 0 620 ' + (LOU.top + 3 * LOU.gap + LOU.h + 26) + '" id="loupe" ' +
           'role="img" aria-label="One mazal opened into its thirty degrees, one degree into ' +
           'its sixty parts, and each part again, as far as the count is taken.">' + g + "</svg>";
  }

  /* Which rung the reader is being shown. Everything else stays visible but
     plainly out of the way — the whole ladder is the point. */
  function litBand(key) {
    var g = document.querySelectorAll("#loupe .lb"), i;
    for (i = 0; i < g.length; i++) {
      g[i].setAttribute("opacity", !key || g[i].classList.contains("lb-" + key) ? "1" : ".28");
    }
    var z = document.querySelectorAll("#loupe .lz");
    for (i = 0; i < z.length; i++) z[i].setAttribute("opacity", key ? ".45" : "1");
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
