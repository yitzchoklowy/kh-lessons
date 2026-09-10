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

  /* ── one piece, opened out ────────────────────────────────────────────────
     A place sits inside a chain of pieces, each one a cell of the one before
     it: a mazal out of the round, a מעלה out of that mazal, a חלק out of that
     מעלה, a שניה out of that חלק. */
  function pieceChain(p) {
    /* Every rung is named the way he names a degree in י״א:ח — a place part-way
       through a piece is in the next one up, and one standing exactly on a mark
       has completed it (י״א:ט) — and the cell lit on each wedge is the one its
       name says. The parts come off the engine already rounded, so a place
       exactly on a mark reads as exactly on it. */
    var d = decimalToDms(p.into);
    var o1 = p.ordinal,
        o2 = hisOrdinal(d.minutes + d.seconds / PER),
        o3 = hisOrdinal(d.seconds),
        o4 = hisOrdinal((d.seconds - Math.floor(d.seconds)) * PER);
    return [
      { key: "sign",   n: ARC, hit: o1 - 1, name: "מזל " + p.mazal,     holds: ARC + " מעלות" },
      { key: "maalah", n: PER, hit: o2 - 1, name: "מעלה " + gem(o1),    holds: PER + " חלקים" },
      { key: "chelek", n: PER, hit: o3 - 1, name: "חלק " + gem(o2),     holds: PER + " שניות" },
      { key: "shniya", n: PER, hit: o4 - 1, name: "שניה " + gem(o3),    holds: PER + " שלישיות" }
    ];
  }

  var LEVEL = { sign: 0, maalah: 1, chelek: 2, shniya: 3 };
  /* ── the piece itself, lifted out — and then looked into ─────────────────
     Pressing כל מזל ומזל שלשים lifts the mazal's wedge out of the ring — the
     same curved shape — and it grows as it comes, turning upright so its marks
     can be read, while the rest of the round steps back.

     The finer clauses bring out nothing new. They enlarge the wedge already
     out: the chosen מעלה swells inside it until it is wide enough to hold its
     sixty חלקים, and they appear inside it; press again and the chosen חלק
     swells in turn until its sixty שניות fit. The wedge is a window on the
     mazal and each clause narrows it onto the piece it names, so every part
     keeps its true size against its neighbours — which is the point of dividing
     at all. The piece shown fills four fifths of the window, with a sliver of
     each neighbour at either side, so it is always plain what it is a part of. */
  var SLAB = { span: 30, r1: 955, thick: 84, top: 56, ms: 560, zoom: 950 };
  /* a degree, a חלק, a שניה, a שלישית — each a sixtieth of the one before,
     the sixty read off the engine */
  var UNIT = [1, 1 / PER, 1 / (PER * PER), 1 / (PER * PER * PER)];
  var MARK = ["°", "′", "″", "‴"];

  function slabAt(C, mid, span, r0, r1) {
    var rm = (r0 + r1) / 2, t = mid * RAD11;
    return { C: C, ax: C[0] - rm * Math.cos(t), ay: C[1] + rm * Math.sin(t),
             mid: mid, span: span, r0: r0, r1: r1 };
  }
  function SP(s, r, a) {
    var t = a * RAD11;
    return [s.ax + r * Math.cos(t), s.ay - r * Math.sin(t)];
  }
  function xy(pt) { return pt[0].toFixed(1) + " " + pt[1].toFixed(1); }
  function slabPath(s, a0, a1, r0, r1) {
    var big = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return "M " + xy(SP(s, r1, a0)) + " A " + r1.toFixed(1) + " " + r1.toFixed(1) + " 0 " + big +
           " 0 " + xy(SP(s, r1, a1)) + " L " + xy(SP(s, r0, a1)) + " A " + r0.toFixed(1) + " " +
           r0.toFixed(1) + " 0 " + big + " 1 " + xy(SP(s, r0, a0)) + " Z";
  }

  /* where the wedge comes to rest, upright over the wheel */
  function slabHome() {
    var r1 = SLAB.r1, r0 = r1 - SLAB.thick;
    return slabAt([CX11, SLAB.top + SLAB.thick / 2], 90, SLAB.span, r0, r1);
  }
  /* where it comes from: the mazal's own sector of the ring */
  function ringSource(p) {
    var mid = p.index * ARC + ARC / 2;
    return slabAt(P11((R_IN11 + R_OUT11) / 2, mid), mid, ARC, R_IN11, R_OUT11);
  }
  function lerpSlab(S, T, e) {
    var sm = S.mid - 360 * Math.round((S.mid - T.mid) / 360);   // turn the short way
    function L(a, b) { return a + (b - a) * e; }
    return slabAt([L(S.C[0], T.C[0]), L(S.C[1], T.C[1])], L(sm, T.mid),
                  L(S.span, T.span), L(S.r0, T.r0), L(S.r1, T.r1));
  }

  /* The piece a depth shows, in degrees of its mazal — where it starts, how big
     it is, into how many it is cut and which of them this place is in. Depth 1
     is the mazal; 2 the chosen מעלה; 3 the chosen חלק; 4 the chosen שניה. */
  function pieceAt(d, chain) {
    if (d <= 1) return { start: 0, size: ARC, n: chain[0].n, hit: chain[0].hit };
    var start = 0, k;
    for (k = 0; k < d - 1; k++) start += chain[k].hit * UNIT[k];
    return { start: start, size: UNIT[d - 2], n: chain[d - 1].n, hit: chain[d - 1].hit };
  }
  /* what the wedge looks onto: the whole mazal, or the piece and a sliver
     either side of it */
  function windowFor(d, chain) {
    if (d <= 1) return { c: ARC / 2, w: ARC };
    var q = pieceAt(d, chain);
    return { c: q.start + q.size / 2, w: q.size * 1.25 };
  }

  var HALO11 = 'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round" ';

  function wedgeMarkup(s, view, d, chain, o) {
    var W = view.w, lo = view.c - W / 2, hi = lo + W;
    var arcPx = s.r1 * s.span * RAD11, th = s.r1 - s.r0, a0 = s.mid - s.span / 2;
    function A(x) { return a0 + (x - lo) / W * s.span; }
    function line(x, r0, r1, col, op, wd) {
      var pa = SP(s, r1, A(x)), pb = SP(s, r0, A(x));
      return '<line x1="' + pa[0].toFixed(1) + '" y1="' + pa[1].toFixed(1) + '" x2="' +
             pb[0].toFixed(1) + '" y2="' + pb[1].toFixed(1) + '" stroke="' + col +
             '" stroke-opacity="' + op + '" stroke-width="' + wd + '"></line>';
    }
    function text(x, r, str, size, fill, op, bold) {
      var q = SP(s, r, A(x));
      return '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + size * .35).toFixed(1) +
             '" font-size="' + size + '" text-anchor="middle" ' + HALO11 + 'fill="' + fill +
             '" fill-opacity="' + op + '"' + (bold ? ' font-weight="700"' : "") +
             ' font-family="IBM Plex Mono, monospace">' + str + "</text>";
    }
    var g = "", L, t, k, x;

    g += '<path d="' + slabPath(s, a0, a0 + s.span, s.r0, s.r1) + '" fill="var(--card)" ' +
         'stroke="var(--mas)" stroke-opacity=".85" stroke-width="1.4"></path>';
    /* past either end of the mazal the window looks onto its neighbour */
    if (lo < 0) g += '<path d="' + slabPath(s, A(lo), A(Math.min(0, hi)), s.r0, s.r1) +
                     '" fill="var(--sunk)"></path>';
    if (hi > ARC) g += '<path d="' + slabPath(s, A(Math.max(ARC, lo)), A(hi), s.r0, s.r1) +
                       '" fill="var(--sunk)"></path>';

    /* two cells are lit: the piece now filling the window, lightly — it was the
       lit cell a rung up — and where the place stands inside it. The rungs
       above are wider than the window, so lighting them would only wash it out. */
    for (L = Math.max(1, d - 1); L <= d; L++) {
      var q = pieceAt(L, chain), cw = q.size / q.n;
      var c0 = Math.max(q.start + q.hit * cw, lo), c1 = Math.min(q.start + (q.hit + 1) * cw, hi);
      if (c1 > c0) g += '<path d="' + slabPath(s, A(c0), A(c1), s.r0, s.r1) + '" fill="var(--mas)" ' +
                        'fill-opacity="' + (L === d ? ".5" : ".16") + '"></path>';
    }

    /* every mark that has room to be seen, coarsest first; a finer one comes
       into view as the window narrows enough to give it room */
    for (t = 0; t < UNIT.length; t++) {
      var u = UNIT[t], px = u / W * arcPx;
      if (px < 2.5) continue;
      var op = (Math.min(1, (px - 2.5) / 4) * [.75, .6, .5, .45][t]).toFixed(2);
      var kS = Math.ceil(Math.max(lo, 0) / u - 1e-9), kE = Math.floor(Math.min(hi, ARC) / u + 1e-9);
      for (k = kS; k <= kE; k++) {
        if (t > 0 && k % PER === 0) continue;                 // a coarser mark stands here
        var h = th * Math.min(.9, [.5, .36, .24, .15][t] * (k % 10 === 0 ? 1.35 : 1));
        g += line(k * u, s.r1 - h, s.r1, "currentColor", op, t === 0 ? 1.2 : 1);
      }
    }

    /* the piece shown, bounded by the two marks it lies between */
    var P = pieceAt(d, chain);
    if (d >= 2) {
      g += line(P.start, s.r0, s.r1, "var(--mas)", ".95", 2.2);
      g += line(P.start + P.size, s.r0, s.r1, "var(--mas)", ".95", 2.2);
    }

    if (o > 0) {
      /* under it: its own count, nought to thirty or to sixty */
      for (k = 0; k <= P.n; k += 10) {
        x = P.start + k * P.size / P.n;
        if (x >= lo && x <= hi) g += text(x, s.r0 - 14, k + MARK[d - 1], 10.5, "currentColor", (.65 * o).toFixed(2));
      }
      /* over it: where it sits in the piece it was cut from */
      if (d >= 2) {
        var pv = chain[d - 2].hit;
        g += text(P.start, s.r1 + 13, pv + MARK[d - 2], 12, "var(--mas)", o.toFixed(2), true);
        g += text(P.start + P.size, s.r1 + 13, (pv + 1) + MARK[d - 2], 12, "var(--mas)", o.toFixed(2), true);
      }
      var nm = SP(s, s.r0 + th * .2, s.mid);
      g += '<text x="' + nm[0].toFixed(1) + '" y="' + (nm[1] + 4).toFixed(1) + '" font-size="13" ' +
           'text-anchor="middle" ' + HALO11 + 'fill="var(--mas)" fill-opacity="' + o.toFixed(2) +
           '" font-weight="700">' + chain[d - 1].name + " — " + chain[d - 1].holds + "</text>";
    }
    return g;
  }

  var POP = { depth: 0, key: "", p: null, raf: 0, view: null,
              lift: null, zFrom: null, zTo: null, zStart: 0 };

  /* the window between two depths: its width shrinks at an even rate to the
     eye, and its middle moves in step, so the piece being entered never leaves
     the view on the way in */
  function viewAt(now) {
    if (!POP.zFrom) return { c: POP.zTo.c, w: POP.zTo.w, u: 1 };
    var u = Math.min(1, Math.max(0, (now - POP.zStart) / SLAB.zoom));
    var e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    var a = POP.zFrom, b = POP.zTo;
    if (Math.abs(a.w - b.w) < 1e-15) return { c: a.c + (b.c - a.c) * e, w: b.w, u: u };
    var w = Math.exp(Math.log(a.w) * (1 - e) + Math.log(b.w) * e);
    return { c: b.c + (a.c - b.c) * (w - b.w) / (a.w - b.w), w: w, u: u };
  }

  function popDraw(now) {
    var host = document.getElementById("zmag");
    if (!host || !POP.depth) return;
    var p = POP.p, chain = pieceChain(p), home = slabHome();
    var el = POP.lift === null ? 1 : Math.min(1, Math.max(0, (now - POP.lift) / SLAB.ms));
    var s = el < 1 ? lerpSlab(ringSource(p), home, 1 - Math.pow(1 - el, 3)) : home;
    var v = viewAt(now);
    POP.view = { c: v.c, w: v.w };
    /* the counts are read once it has come to rest */
    var o = el < 1 ? 0 : (v.u < .85 ? 0 : (v.u - .85) / .15);
    host.innerHTML = el <= 0 ? "" : wedgeMarkup(s, v, POP.depth, chain, o);
    POP.raf = (el < 1 || v.u < 1) ? requestAnimationFrame(popDraw) : 0;
  }

  /* Lift the mazal out, or look further into it. The first press brings the
     wedge out of the ring; each press after narrows the window onto the piece
     it names, or widens it back out; when the place itself moves, everything
     is simply redrawn where it now stands. */
  function popTo(depth, p) {
    var key = depth + ":" + p.lon;
    if (key === POP.key) return;
    var was = POP.depth, fresh = !POP.p || POP.p.lon !== p.lon, now = performance.now();
    /* a reader who has asked for less motion gets it already in place */
    var still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    POP.key = key; POP.p = p; POP.depth = depth;
    if (POP.raf) cancelAnimationFrame(POP.raf);
    POP.raf = 0;
    if (!depth) {
      POP.view = null; POP.lift = null; POP.zFrom = null;
      var h = document.getElementById("zmag");
      if (h) h.innerHTML = "";
      return;
    }
    var chain = pieceChain(p);
    POP.zTo = windowFor(depth, chain);
    if (still || (fresh && was > 0)) {
      POP.lift = null; POP.zFrom = null;
    } else if (!was) {
      POP.lift = now;
      POP.zFrom = depth > 1 ? windowFor(1, chain) : null;
      POP.zStart = now + SLAB.ms;
    } else {
      POP.lift = null;
      POP.zFrom = POP.view || windowFor(was, chain);
      POP.zStart = now;
    }
    popDraw(now);
  }

  /* The chain, written out, so the piece being looked at is never just another
     nought-to-sixty: every rung above it, and the one open now. */
  function chainSay(mode, p) {
    var depth = LEVEL[mode];
    if (depth === undefined) return null;
    var chain = pieceChain(p), parts = [], i;
    for (i = 0; i <= depth; i++) {
      parts.push(i === depth ? "<b>" + chain[i].name + " — " + chain[i].holds + "</b>"
                             : chain[i].name);
    }
    return parts.join(" › ");
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
      '<circle id="zgal" cx="' + CX11 + '" cy="' + CY11 + '" r="' + R_CIRC + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.4" stroke-opacity=".3"></circle>' +
      '<g id="zsub"></g>' +
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
      'fill="currentColor" fill-opacity=".55">הארץ</text>' +
      /* the lifted pieces go over everything, and never take the hand off the wheel */
      '<g id="zmag" opacity="0" pointer-events="none"></g>';
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
    var depth = LEVEL[mode] === undefined ? 0 : LEVEL[mode] + 1;
    var opened = depth > 0;
    var mag = document.getElementById("zmag");
    mag.setAttribute("opacity", opened ? "1" : "0");
    popTo(depth, p);
    document.getElementById("zsub").innerHTML = "";
    /* while one piece is being looked at, the rest of the round steps back —
       the graduation, the sweep, and the sight-line all belong to the whole */
    document.getElementById("zptr").setAttribute("opacity", opened ? ".18" : "1");
    document.getElementById("zarc").setAttribute("opacity", opened ? ".18" : "1");
    document.getElementById("zgal").setAttribute("stroke-opacity", opened ? ".1" : ".3");
    document.getElementById("zdot").setAttribute("opacity", opened ? ".2" : "1");

    var onSector = mode === "start" || LEVEL[mode] !== undefined;
    var band = mode === "start" ? 0 : p.index;
    if (onSector) {
      arc.setAttribute("d", arc11(R_CIRC + 30, band * ARC, (band + 1) * ARC));
      arc.setAttribute("opacity", mode === "start" ? ".95" : "0");
      var mid = P11(R_CIRC + 15, band * ARC + ARC / 2);
      lbl.setAttribute("x", mid[0].toFixed(1));
      lbl.setAttribute("y", (mid[1] + 4).toFixed(1));
      lbl.textContent = ARC + "°";
      lbl.setAttribute("opacity", "0");
    } else {
      arc.setAttribute("opacity", "0");
      lbl.setAttribute("opacity", "0");
    }

    /* on ראש טלה the first sector is the one being pointed at, not the one the
       place happens to stand in */
    for (i = 0; i < 12; i++) {
      var lit = onSector ? i === band : i === p.index;
      var rest = opened ? ".12" : ".45";
      document.getElementById("zsec" + i).setAttribute("fill-opacity", lit ? (onSector ? ".2" : ".1") : "0");
      document.getElementById("znm" + i).setAttribute("fill-opacity", lit ? ".95" : rest);
      document.getElementById("zst" + i).setAttribute("opacity", lit ? "1" : rest);
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
    /* the flat ruler reads the place exactly as the lifted wedges do */
    return pieceChain(p);
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
