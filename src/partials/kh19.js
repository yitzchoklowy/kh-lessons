  /* Everything chapter 19 asks for, at a whole day from the עיקר.

     "כל חשבון זה בקירוב בלא דקדוק, לפי שאינו מועיל בראייה" — י״ט:י״א. He works
     this chapter in whole degrees and says so, and his own worked sum of י״ט:י״א
     only comes out if each figure is rounded before the next takes it. So every
     stage here is still the engine's own, and only its answer is rounded, the
     way he rounds it.

       chapter19At(n) → { day, amiti, mazal, sunTrue,
                          incl, inclDeg, inclNorth,
                          rochav, rochavDeg, rochavNorth,
                          dist, distDeg, distNorth, bearing }
  */
  function chapter19At(n) {
    var v = chapter15At(n);
    return build19(n, v.amiti, v.sunTrue, calculateNodePosition(n).result);
  }

  /* One night's figures from its three places — the moon's true place, the
     sun's, and the ראש. Every stage is the engine's own step. */
  function build19(day, amiti, sunTrue, rosh) {
    var v = { amiti: amiti, sunTrue: sunTrue };
    var lat = calculateMoonLatitude(amiti, rosh);

    var incl = calculateInclination(v.amiti);
    var inclDeg = Math.round(incl.result);
    var rochavDeg = Math.round(Math.abs(lat.result));
    var rochavNorth = lat.result >= 0;
    var dist = calculateEquatorDistance(inclDeg, incl.direction === 'north', rochavDeg, rochavNorth);

    return {
      day: day, rosh: rosh,
      amiti: v.amiti, sunTrue: v.sunTrue, mazal: zodiacPosition(v.amiti),
      incl: incl.result, inclDeg: inclDeg, inclNorth: incl.direction === 'north', inclStep: incl,
      rochav: Math.abs(lat.result), rochavDeg: rochavDeg, rochavNorth: rochavNorth,
      dist: dist.result, distDeg: Math.round(dist.result),
      distNorth: dist.direction === 'north', distStep: dist,
      bearing: bearingOf(Math.round(dist.result), dist.direction === 'north'),
      /* the same distance unrounded, + north: where the drawings place it */
      signed: (incl.direction === 'north' ? 1 : -1) * incl.result + lat.result
    };
  }

  /* The drawings move the way the instrument moves — between whole days, not
     in jumps. The three places are carried forward between two whole days and
     handed back to the engine, so every in-between figure is still its own.
     The ledgers keep to whole days, the way he counts them. */
  var C19 = {}, C19N = 0;
  function chapter19Cached(n) {
    if (!C19[n]) {
      if (C19N > 80) { C19 = {}; C19N = 0; }
      C19[n] = chapter19At(n); C19N++;
    }
    return C19[n];
  }
  function tw19(x, y, f) { return normalizeDegrees(x + (((y - x + 540) % 360) - 180) * f); }
  function chapter19Live(dayFloat) {
    var n = Math.floor(dayFloat), f = dayFloat - n, a = chapter19Cached(n);
    if (f <= 0) return a;
    var b = chapter19Cached(n + 1);
    return build19(dayFloat, tw19(a.amiti, b.amiti, f), tw19(a.sunTrue, b.sunTrue, f),
                   tw19(a.rosh, b.rosh, f));
  }

  /* The nine rows he lists in י״ט:ז. The nought row is the table's own — ראש
     טלה stands on the line, י״ט:ג — and he begins at ten. */
  function inclinationRows() { return KH19.INCLINATION_TABLE.slice(1); }

  /* The two rows a folded מנין falls between, and how far along it stands —
     the part he tells you to take in י״ט:ח. */
  function inclBracket(eff) {
    var T = KH19.INCLINATION_TABLE;
    for (var i = 0; i < T.length - 1; i++) {
      if (eff >= T[i].degrees && eff <= T[i + 1].degrees) {
        var a = T[i].degrees, b = T[i + 1].degrees;
        return { lo: i, hi: i + 1, eff: eff, part: b === a ? 0 : (eff - a) / (b - a),
                 gap: T[i + 1].inclination - T[i].inclination };
      }
    }
    return { lo: 0, hi: 1, eff: eff, part: 0, gap: 0 };
  }

  /* His three rules of י״ט:ט, in his words — the rules of רוחב הירח over again. */
  var INCL_FOLD = [
    { from: 90,  to: 180, says: "תגרע אותו ממאה ושמונים",        op: "180° −" },
    { from: 180, to: 270, says: "תגרע ממנו מאה ושמונים",          op: "− 180°" },
    { from: 270, to: 360, says: "תגרע אותו משלש מאות ושישים",     op: "360° −" }
  ];
  function inclFold(lon) {
    var x = normalizeDegrees(lon), q = Math.min(3, Math.floor(x / 90));
    var eff = q === 0 ? x : q === 1 ? 180 - x : q === 2 ? x - 180 : 360 - x;
    return { q: q, eff: eff, north: x < 180 };
  }

  /* י״ט:י״ב–י״ד — where it will be seen, and which way its פגימה turns.
     "או קרוב ממנו בשתים שלש מעלות" — his own margin for standing on the line. */
  function bearingOf(dist, north) {
    if (dist <= 3) {
      return { id: "even", notch: "east", mark: "י״ט:י״ב",
               where: "מכוון כנגד אמצע מערב",
               says: "ותיראה פגמתו מכוונת כנגד מזרח העולם בשוה" };
    }
    return north
      ? { id: "north", notch: "south", mark: "י״ט:י״ג",
          where: "בין מערב העולם ובין צפונו",
          says: "ותיראה פגמתו נוטה מכנגד מזרח העולם כנגד דרום העולם" }
      : { id: "south", notch: "north", mark: "י״ט:י״ד",
          where: "בין מערב העולם ובין דרומו",
          says: "ותיראה פגמתו נוטה מכנגד מזרח העולם כנגד צפון העולם" };
  }

  function maxIncl() {
    var T = KH19.INCLINATION_TABLE;
    return T[T.length - 1].inclination;          // his twenty-three and a half
  }
  /* whole degrees where the figure is whole, and a half where he gives a half */
  function degIncl(x) {
    var d = Math.floor(x + 1e-9), m = Math.round((x - d) * 60);
    if (m === 60) { d++; m = 0; }
    return m ? d + "° " + m + "′" : d + "°";
  }

  // ═══ י״ט:ב–ו — the two circles, and the two places they meet ═════════
  /* The same picture chapter sixteen draws, one storey up: there a circle
     leaning off the sun's, here the sun's own leaning off the line that girds
     the middle of the world. His words are almost the same words. Two circles
     of one size about one centre project as two ellipses nested and touching at
     the two points, so the plane of the line is washed in beneath them and the
     mazalos ride on the leaning circle, where they belong — the belt is the
     leaning circle's own division, not the line's.

     Nothing here is exaggerated: his lean is three and twenty degrees and a
     half, which draws large enough on its own. */
  var EV = { w: 640, h: 372, cx: 320, cy: 180, r: 148,
             view: 30, spin: -28, belt: [1.02, 1.3, 1.16], plane: 1.72 };
  var RAD19 = Math.PI / 180;

  function proj19(X0, Y0, Z) {
    var f = EV.spin * RAD19, e = EV.view * RAD19;
    var X = X0 * Math.cos(f) - Y0 * Math.sin(f);
    var Y = X0 * Math.sin(f) + Y0 * Math.cos(f);
    return [EV.cx + X, EV.cy - (Y * Math.sin(e) + Z * Math.cos(e))];
  }
  /* u is counted from ראש טלה, which is where his two circles meet */
  function ecl19(u, radius, lean) {
    var i = (lean === undefined ? maxIncl() : lean) * RAD19, t = u * RAD19;
    var r = radius === undefined ? EV.r : radius;
    return proj19(r * Math.cos(t), r * Math.sin(t) * Math.cos(i), r * Math.sin(t) * Math.sin(i));
  }
  function foot19(u, radius) { return ecl19(u, radius, 0); }   // straight down onto the line

  function path19(from, to, lean, radius) {
    var step = to > from ? 3 : -3, d = "", u = from, q;
    for (; step > 0 ? u < to : u > to; u += step) {
      q = ecl19(u, radius, lean);
      d += (d ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    q = ecl19(to, radius, lean);
    return d + (d ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
  }
  function belt19(k) {
    var r1 = EV.r * EV.belt[0], r2 = EV.r * EV.belt[1], a0 = k * 30, a1 = a0 + 30, d = "", a, q;
    for (a = a0; a <= a1; a += 3) {
      q = ecl19(a, r2);
      d += (d ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    for (a = a1; a >= a0; a -= 3) {
      q = ecl19(a, r1);
      d += " L " + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    return d + " Z";
  }

  function zodiacTiltFigure() {
    var MZ = CONSTANTS.CONSTELLATIONS, g = "";
    g += '<marker id="tip19" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" ' +
         'orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--sunc)"></path></marker>';
    // the plane of the line that girds the middle of the world
    var pr = EV.r * EV.plane, pe = pr * Math.sin(EV.view * RAD19);
    g += '<radialGradient id="plane19" cx=".5" cy=".5" r=".5">' +
         '<stop offset="0" stop-color="var(--minus)" stop-opacity=".14"></stop>' +
         '<stop offset=".62" stop-color="var(--minus)" stop-opacity=".08"></stop>' +
         '<stop offset="1" stop-color="var(--minus)" stop-opacity="0"></stop></radialGradient>' +
         '<ellipse cx="' + EV.cx + '" cy="' + EV.cy + '" rx="' + pr.toFixed(1) +
         '" ry="' + pe.toFixed(1) + '" fill="url(#plane19)"></ellipse>';
    // the twelve, riding on the leaning circle, because they are its own division
    for (var k = 0; k < 12; k++) {
      g += '<path id="mz19_' + k + '" d="' + belt19(k) + '" fill="currentColor" fill-opacity="' +
           (k % 2 ? ".05" : ".02") + '" stroke="currentColor" stroke-opacity=".12"></path>';
      var nm = ecl19(k * 30 + 15, EV.r * EV.belt[2]);
      g += '<text x="' + nm[0].toFixed(1) + '" y="' + (nm[1] + 4).toFixed(1) + '" font-size="13" ' +
           'text-anchor="middle" fill="currentColor" fill-opacity=".45" direction="rtl">' +
           MZ[k] + "</text>";
    }
    // הקו השוה המסבב באמצע העולם: the far rim lighter than the near
    g += '<path d="' + path19(-EV.spin, 180 - EV.spin, 0) + '" fill="none" stroke="var(--minus)" ' +
         'stroke-width="1.7" stroke-opacity=".4"></path>' +
         '<path d="' + path19(180 - EV.spin, 360 - EV.spin, 0) + '" fill="none" ' +
         'stroke="var(--minus)" stroke-width="2.2" stroke-opacity=".85"></path>';
    // the circle the sun goes round, leaning off it
    g += '<path d="' + path19(0, 360) + '" fill="none" stroke="var(--sunc)" ' +
         'stroke-width="2" stroke-opacity=".35"></path>' +
         '<path id="ev19Swept" fill="none" stroke="var(--sunc)" stroke-width="2.8" ' +
         'marker-end="url(#tip19)"></path>';
    // the two places they meet, and the two furthest from the line
    var A = ecl19(0), B = ecl19(180), N = ecl19(90), S = ecl19(270);
    var halo = 'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round" ';
    g += '<line x1="' + A[0].toFixed(1) + '" y1="' + A[1].toFixed(1) + '" x2="' + B[0].toFixed(1) +
         '" y2="' + B[1].toFixed(1) + '" stroke="var(--minus)" stroke-opacity=".45" ' +
         'stroke-dasharray="5 4"></line>';
    [[A, "ראש טלה", 1], [B, "ראש מאזנים", -1]].forEach(function (m) {
      g += '<circle cx="' + m[0][0].toFixed(1) + '" cy="' + m[0][1].toFixed(1) +
           '" r="5.5" fill="var(--minus)"></circle>' +
           '<text x="' + (m[0][0] + m[2] * 6).toFixed(1) + '" y="' + (m[0][1] - 13).toFixed(1) +
           '" font-size="15" ' + halo + 'text-anchor="middle" fill="var(--minus)" ' +
           'direction="rtl">' + m[1] + "</text>";
    });
    // how far the leaning circle gets from the line, at its two furthest
    [[90, N, "ראש סרטן", -16], [270, S, "ראש גדי", 20]].forEach(function (m) {
      var f = foot19(m[0]);
      g += '<line x1="' + m[1][0].toFixed(1) + '" y1="' + m[1][1].toFixed(1) + '" x2="' +
           f[0].toFixed(1) + '" y2="' + f[1].toFixed(1) + '" stroke="var(--sunc)" ' +
           'stroke-opacity=".5" stroke-width="1.4"></line>' +
           '<text x="' + m[1][0].toFixed(1) + '" y="' + (m[1][1] + m[3]).toFixed(1) +
           '" font-size="13" ' + halo + 'text-anchor="middle" fill="var(--sunc)" ' +
           'fill-opacity=".9" direction="rtl">' + m[2] + " · " + degIncl(maxIncl()) + "</text>";
    });
    g += '<circle cx="' + EV.cx + '" cy="' + EV.cy + '" r="3.6" fill="currentColor" ' +
         'fill-opacity=".55"></circle>';
    // the sun, and how far it stands from the line this moment
    g += '<line id="ev19Drop" stroke="var(--mas)" stroke-width="1.8"></line>' +
         '<circle id="ev19Foot" r="2.6" fill="var(--minus)" fill-opacity=".8"></circle>' +
         '<circle id="ev19Sun" r="7" fill="var(--sunc)"></circle>' +
         '<text id="ev19Val" font-size="13" ' + halo + 'text-anchor="middle" fill="var(--mas)" ' +
         'font-family="IBM Plex Mono, monospace">—</text>';
    g += '<path id="ev19Grab" class="grab19" fill="none" stroke="transparent" stroke-width="26" ' +
         'pointer-events="stroke" style="cursor:grab;touch-action:none" d="' + path19(0, 360) + '"></path>';
    // the key
    var lx = EV.w - 18;
    g += '<circle cx="' + lx + '" cy="15" r="5" fill="var(--sunc)"></circle>' +
         '<text x="' + (lx - 15) + '" y="20" font-size="14" ' + halo + 'fill="var(--sunc)" ' +
         'direction="rtl" text-anchor="start">העגולה שבה מהלך השמש</text>' +
         '<circle cx="' + lx + '" cy="38" r="5" fill="var(--minus)"></circle>' +
         '<text x="' + (lx - 15) + '" y="43" font-size="14" ' + halo + 'fill="var(--minus)" ' +
         'direction="rtl" text-anchor="start">הקו השוה</text>';
    g += '<text x="' + EV.cx + '" y="' + (EV.h - 8) + '" font-size="13" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".45" direction="rtl">' +
         'חציה נוטה לצפון וחציה נוטה לדרום</text>';
    return '<svg viewBox="0 0 ' + EV.w + " " + EV.h + '" role="img" ' +
      'aria-label="The circle girding the middle of the world, and the circle the sun travels leaning off it, crossing at the head of Aries and the head of Libra. Six mazalos lean north of the line and six south.">' +
      g + "</svg>";
  }

  function markZodiacTilt(v) {
    var sun = document.getElementById("ev19Sun");
    if (!sun) return;
    var u = normalizeDegrees(v.sunTrue);
    var p = ecl19(u), f = foot19(u);
    sun.setAttribute("cx", p[0].toFixed(1)); sun.setAttribute("cy", p[1].toFixed(1));
    var foot = document.getElementById("ev19Foot");
    foot.setAttribute("cx", f[0].toFixed(1)); foot.setAttribute("cy", f[1].toFixed(1));
    var drop = document.getElementById("ev19Drop");
    drop.setAttribute("x1", p[0].toFixed(1)); drop.setAttribute("y1", p[1].toFixed(1));
    drop.setAttribute("x2", f[0].toFixed(1)); drop.setAttribute("y2", f[1].toFixed(1));
    document.getElementById("ev19Swept").setAttribute("d", u < 2 ? "" : path19(0, u));
    var s = calculateInclination(u);
    var val = document.getElementById("ev19Val");
    val.setAttribute("x", ((p[0] + f[0]) / 2 + 30).toFixed(1));
    val.setAttribute("y", ((p[1] + f[1]) / 2 + 4).toFixed(1));
    val.textContent = s.result < 1 / 60 ? "—" : degIncl(Math.round(s.result));
    var mr = Math.floor(u / 30);
    for (var k = 0; k < 12; k++) {
      var band = document.getElementById("mz19_" + k);
      if (!band) continue;
      band.setAttribute("fill", k === mr ? "var(--sunc)" : "currentColor");
      band.setAttribute("fill-opacity", k === mr ? ".16" : (k % 2 ? ".05" : ".02"));
    }
  }

  /* Rule eight: this circle turns too, and what turns with it is the day. */
  function grabTilt19() {
    var handle = document.getElementById("ev19Grab");
    if (!handle) return;
    var svg = handle.ownerSVGElement, holding = false;
    var RATE = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
    function nearest(e) {
      var b = svg.getBoundingClientRect();
      var p = [(e.clientX - b.left) * EV.w / b.width, (e.clientY - b.top) * EV.h / b.height];
      var best = 0, bd = Infinity;
      for (var u = 0; u < 360; u += 1) {
        var q = ecl19(u), d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]);
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
      var now = normalizeDegrees(chapter15At(Math.round(day)).sunTrue);
      day = Math.max(0, Math.round(day + shortest(nearest(e) - now) / RATE));
      drawAt(day);
    });
    function drop() { if (!holding) return; holding = false; setDay(day); }
    handle.addEventListener("pointerup", drop);
    handle.addEventListener("pointercancel", drop);
  }

  // ═══ י״ט:ז–י — the line, the lean, and the width upon it ════════════
  /* His table, unfolded round the whole circle: the line straight, and the
     mazalos rising off it to three and twenty and a half at ראש סרטן and
     falling as far at ראש גדי. Every height is a row of his table of י״ט:ז,
     placed by his own rules of י״ט:ט — not a curve fitted to them.
     The moon then stands off the lean by its own רוחב, which is the whole of
     י״ט:י drawn: one way, they gather; two ways, they eat each other. */
  var IW = { w: 520, h: 208, x0: 34, x1: 496, mid: 96, amp: 66 };
  /* 360 is the far end of the strip, not its start again — normalizing it would
     send the last point back across the whole figure */
  function iwX(deg) {
    var d = deg >= 360 ? 360 : normalizeDegrees(deg);
    return IW.x0 + (d / 360) * (IW.x1 - IW.x0);
  }
  function iwY(val) { return IW.mid - (val / maxIncl()) * IW.amp; }

  function inclWaveRows() {
    var T = KH19.INCLINATION_TABLE, out = [];
    for (var d = 0; d <= 360; d += 10) {
      var f = inclFold(d), row = null;
      for (var i = 0; i < T.length; i++) if (Math.abs(T[i].degrees - f.eff) < 1e-9) row = T[i];
      if (row) out.push({ d: d, v: (d > 180 ? -1 : 1) * row.inclination });
    }
    return out;
  }

  function inclWaveFigure(withMoon) {
    var pts = inclWaveRows().map(function (p) { return iwX(p.d).toFixed(1) + "," + iwY(p.v).toFixed(1); });
    var halo = 'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round" ';
    var g = '<line x1="' + IW.x0 + '" y1="' + IW.mid + '" x2="' + IW.x1 + '" y2="' + IW.mid +
            '" stroke="var(--minus)" stroke-opacity=".7" stroke-width="1.6"></line>';
    for (var d = 0; d <= 360; d += 90) {
      g += '<line x1="' + iwX(d).toFixed(1) + '" y1="' + (IW.mid - 5) + '" x2="' + iwX(d).toFixed(1) +
           '" y2="' + (IW.mid + 5) + '" stroke="currentColor" stroke-opacity=".3"></line>' +
           '<text x="' + iwX(d).toFixed(1) + '" y="' + (IW.h - 8) + '" font-size="11" ' +
           'text-anchor="middle" fill="currentColor" fill-opacity=".45" ' +
           'font-family="IBM Plex Mono, monospace">' + d + '°</text>';
    }
    [[0, "ראש טלה"], [90, "ראש סרטן"], [180, "ראש מאזנים"], [270, "ראש גדי"]].forEach(function (m) {
      g += '<text x="' + iwX(m[0]).toFixed(1) + '" y="' + (IW.h - 24) + '" font-size="12" ' +
           'text-anchor="middle" fill="var(--minus)" fill-opacity=".8" direction="rtl">' +
           m[1] + "</text>";
    });
    g += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="var(--sunc)" ' +
         'stroke-width="2"></polyline>';
    // the two sides, out at the right where the wave is at the line
    g += '<text x="' + (IW.x1 - 14) + '" y="' + (iwY(maxIncl()) + 4).toFixed(1) + '" font-size="12" ' +
         'text-anchor="middle" fill="currentColor" fill-opacity=".5" direction="rtl">צפון</text>' +
         '<text x="' + (IW.x1 - 14) + '" y="' + (iwY(-maxIncl()) + 4).toFixed(1) + '" font-size="12" ' +
         'text-anchor="middle" fill="currentColor" fill-opacity=".5" direction="rtl">דרום</text>';
    g += '<line id="iwDrop" stroke="var(--sunc)" stroke-width="1.8"></line>' +
         '<circle id="iwDot" cx="-9" cy="-9" r="4.5" fill="var(--sunc)"></circle>' +
         '<text id="iwVal" x="-9" y="-9" font-size="12.5" ' + halo + 'text-anchor="middle" ' +
         'fill="var(--sunc)" font-family="IBM Plex Mono, monospace">—</text>';
    if (withMoon) {
      g += '<line id="iwRochav" stroke="var(--mean)" stroke-width="2.4"></line>' +
           '<circle id="iwMoon" cx="-9" cy="-9" r="5.5" fill="var(--mean)" ' +
           'stroke="var(--card)" stroke-width="1.5"></circle>' +
           '<line id="iwTotal" stroke="var(--mas)" stroke-width="1.6" stroke-dasharray="4 3"></line>' +
           '<text id="iwTotalVal" x="-9" y="-9" font-size="12.5" ' + halo + 'text-anchor="middle" ' +
           'fill="var(--mas)" font-family="IBM Plex Mono, monospace">—</text>';
    }
    g += '<circle id="iwGrab" cx="-99" cy="-99" r="17" fill="transparent" ' +
         'style="cursor:grab;touch-action:none"></circle>';
    return '<div class="curve"><svg viewBox="0 0 ' + IW.w + " " + IW.h + '" role="img" ' +
      'aria-label="The line straight across, and the mazalos leaning off it: north to three and twenty and a half degrees at the head of Cancer, back to nothing at the head of Libra, and as far south at the head of Capricorn.">' +
      g + "</svg></div>";
  }

  function markInclWave(v) {
    var dot = document.getElementById("iwDot");
    if (!dot) return;
    var lon = normalizeDegrees(v.amiti);
    var signed = v.inclNorth ? v.incl : -v.incl;   // placed exactly; read in whole degrees
    var x = iwX(lon), y = iwY(signed);
    dot.setAttribute("cx", x.toFixed(1)); dot.setAttribute("cy", y.toFixed(1));
    var drop = document.getElementById("iwDrop");
    drop.setAttribute("x1", x.toFixed(1)); drop.setAttribute("y1", IW.mid);
    drop.setAttribute("x2", x.toFixed(1)); drop.setAttribute("y2", y.toFixed(1));
    /* the lean of the degree reads on one side of its line, and the moon's
       whole distance on the other, so the two never sit on each other */
    var val = document.getElementById("iwVal");
    val.setAttribute("x", (x - 24).toFixed(1));
    val.setAttribute("y", ((IW.mid + y) / 2 + 4).toFixed(1));
    val.textContent = degIncl(v.inclDeg);

    var grab = document.getElementById("iwGrab"), moon = document.getElementById("iwMoon");
    if (grab) { grab.setAttribute("cx", x.toFixed(1)); grab.setAttribute("cy", y.toFixed(1)); }
    if (!moon) return;
    var top = signed + (v.rochavNorth ? v.rochav : -v.rochav);
    var my = iwY(top);
    moon.setAttribute("cx", x.toFixed(1)); moon.setAttribute("cy", my.toFixed(1));
    if (grab) grab.setAttribute("cy", my.toFixed(1));
    var r = document.getElementById("iwRochav");
    r.setAttribute("x1", x.toFixed(1)); r.setAttribute("y1", y.toFixed(1));
    r.setAttribute("x2", x.toFixed(1)); r.setAttribute("y2", my.toFixed(1));
    var t = document.getElementById("iwTotal");
    t.setAttribute("x1", (x + 14).toFixed(1)); t.setAttribute("y1", IW.mid);
    t.setAttribute("x2", (x + 14).toFixed(1)); t.setAttribute("y2", my.toFixed(1));
    var tv = document.getElementById("iwTotalVal");
    tv.setAttribute("x", (x + 46).toFixed(1));
    tv.setAttribute("y", ((IW.mid + my) / 2 + 4).toFixed(1));
    tv.textContent = degIncl(v.distDeg);
  }

  /* Rule eight: take hold of the moon and move it through the mazalos. What
     really moves is the day count, so the sun, the ראש — and with it the
     רוחב — and the קשת come round at their own rates, and every figure on the
     page is the engine's for that moment. Let go and it settles on a whole
     day, because he counts whole days. */
  function grabInclWave() {
    var h = document.getElementById("iwGrab");
    if (!h) return;
    var svg = h.ownerSVGElement, holding = false;
    var RATE = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    function lonAt(e) {
      var b = svg.getBoundingClientRect();
      var x = (e.clientX - b.left) * IW.w / b.width;
      return Math.max(0, Math.min(359.9, (x - IW.x0) / (IW.x1 - IW.x0) * 360));
    }
    function shortest(a) { return ((a + 540) % 360) - 180; }
    h.addEventListener("pointerdown", function (e) {
      holding = true;
      playing = false; el.play.textContent = "▶ Turn"; stopRun();
      svg.classList.add("dragging");
      h.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    h.addEventListener("pointermove", function (e) {
      if (!holding) return;
      var want = lonAt(e);
      /* the moon's own motion is uneven, so ask twice: the mean rate carries
         the first step, and the engine's place on that moment corrects it */
      for (var i = 0; i < 2; i++) {
        day = Math.max(0, day + shortest(want - chapter19Live(day).amiti) / RATE);
      }
      drawAt(day);
    });
    function drop() {
      if (!holding) return;
      holding = false;
      svg.classList.remove("dragging");
      setDay(Math.round(day));
    }
    h.addEventListener("pointerup", drop);
    h.addEventListener("pointercancel", drop);
  }

  // ═══ י״ט:י״ב–ט״ו — where it is seen, and how high ════════════════════
  /* The western sky at the hour of the sighting, as a man standing in it sees:
     מערב before him, צפון at his right hand, דרום at his left.

     This is the chapter's instrument, and everything it asks for is on it. The
     moon stands north or south along the horizon by its distance from the line
     — the lean of its degree and its own רוחב together, י״ט:י. Its פגימה turns
     away from due east toward the side he names, and turns further the further
     it stands off, "ולפי רוב המרחק לפי רוב הנטייה". It hangs as high as its
     קשת is long, י״ט:ט״ו. Take hold of it and carry it north or south, and the
     day count is what answers: the page finds the nearest moment when the
     moon really stood there, and every figure is the engine's for that moment.

     The direction of the turn and that it grows are his; how many degrees it
     turns by, and how high a degree of קשת hangs, are a scale drawn here, and
     the drawing says so. */
  var SK = { w: 560, h: 300, mid: 280, horizon: 226, span: 236, unit: 24 };

  function skX(signed) {
    var k = Math.max(-1.25, Math.min(1.25, signed / SK.unit));
    return SK.mid + k * 0.66 * SK.span;
  }
  /* degrees and minutes — the קשת is carried to the minute in chapter 17 */
  function dm19(x) {
    var d = Math.floor(x + 1e-9), m = Math.round((x - d) * 60);
    if (m === 60) { d++; m = 0; }
    return d + "° " + (m < 10 ? "0" : "") + m + "′";
  }

  function skyFigure() {
    var halo = 'paint-order="stroke" stroke="var(--card)" stroke-width="3.5" stroke-linejoin="round" ';
    var L = SK.mid - SK.span, R = SK.mid + SK.span, g = "";
    g += '<rect x="' + L + '" y="' + SK.horizon + '" width="' + (2 * SK.span) + '" height="' +
         (SK.h - SK.horizon) + '" fill="currentColor" fill-opacity=".05"></rect>' +
         '<line x1="' + L + '" y1="' + SK.horizon + '" x2="' + R + '" y2="' + SK.horizon +
         '" stroke="currentColor" stroke-opacity=".45" stroke-width="2"></line>';
    // how far from the line, in degrees, north to the right and south to the left
    for (var d = -20; d <= 20; d += 10) {
      var x = skX(d);
      g += '<line x1="' + x.toFixed(1) + '" y1="' + SK.horizon + '" x2="' + x.toFixed(1) + '" y2="' +
           (SK.horizon + (d === 0 ? 9 : 5)) + '" stroke="currentColor" stroke-opacity=".4"></line>' +
           (d === 0 ? "" : '<text x="' + x.toFixed(1) + '" y="' + (SK.horizon + 17) + '" font-size="10" ' +
           'text-anchor="middle" fill="currentColor" fill-opacity=".38" ' +
           'font-family="IBM Plex Mono, monospace">' + Math.abs(d) + "°</text>");
    }
    [[1, "צפון העולם"], [0, "אמצע מערב"], [-1, "דרום העולם"]].forEach(function (m) {
      g += '<text x="' + (SK.mid + m[0] * SK.span * 0.86).toFixed(1) + '" y="' + (SK.horizon + 38) +
           '" font-size="13.5" text-anchor="middle" fill="currentColor" fill-opacity=".6" ' +
           'direction="rtl">' + m[1] + "</text>";
    });
    // due east, which is straight up — the sun is beneath the horizon — and the
    // angle the פגימה turns away from it
    g += '<line id="sk19Up" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 4"></line>' +
         '<text id="sk19UpL" font-size="11.5" ' + halo + 'text-anchor="middle" fill="currentColor" ' +
         'fill-opacity=".55" direction="rtl">כנגד מזרח</text>' +
         '<path id="sk19Arc" fill="none" stroke="var(--mas)" stroke-width="2"></path>';
    // the moon: the lit body, and the shadow that bites it
    g += '<defs><mask id="sk19Mask">' +
         '<circle id="sk19Lit" cx="0" cy="0" r="28" fill="#fff"></circle>' +
         '<circle id="sk19Cut" cx="0" cy="0" r="28" fill="#000"></circle>' +
         "</mask></defs>" +
         '<circle id="sk19Disc" cx="0" cy="0" r="28" fill="none" stroke="currentColor" ' +
         'stroke-opacity=".18" stroke-dasharray="3 3"></circle>' +
         '<circle id="sk19Body" cx="0" cy="0" r="28" fill="var(--mean)" mask="url(#sk19Mask)"></circle>' +
         '<line id="sk19Notch" stroke="var(--mas)" stroke-width="1.8" stroke-dasharray="5 3"></line>' +
         '<text id="sk19NotchL" font-size="13" ' + halo + 'text-anchor="middle" fill="var(--mas)" ' +
         'direction="rtl">פגימה</text>';
    // how high it hangs, and how far it stands off the line, at its foot
    g += '<line id="sk19Height" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 4"></line>' +
         '<text id="sk19HeightL" font-size="12.5" ' + halo + 'text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".7" direction="rtl">—</text>' +
         '<path id="sk19Foot" fill="var(--mas)"></path>' +
         '<text id="sk19FootL" font-size="12.5" ' + halo + 'text-anchor="middle" fill="var(--mas)" ' +
         'direction="rtl">—</text>';
    g += '<circle id="sk19Grab" class="grab19" r="36" fill="transparent" ' +
         'style="cursor:grab;touch-action:none"></circle>';
    g += '<text x="' + SK.mid + '" y="' + (SK.h - 7) + '" font-size="12" text-anchor="middle" ' +
         'fill="currentColor" fill-opacity=".42" direction="rtl">' +
         'לא שלו: כמה מעלות ההטיה, וכמה גובה למעלת קשת — מצוירים</text>';
    return '<div class="curve"><svg viewBox="0 0 ' + SK.w + " " + SK.h + '" role="img" ' +
      'aria-label="The western sky at sunset: west ahead, north to the right, south to the left. The crescent stands off the middle of the west by its distance from the line, turns its hollow side away from due east as far as it stands off, and hangs as high as its arc of vision is long.">' +
      g + '</svg><div class="sky-read" id="sk19Read"></div></div>';
  }

  /* keshet: his קשת הראייה, from chapter seventeen */
  /* seen: chapter seventeen's own verdict for the night. His question is asked
     of witnesses, and there are none on a night the moon is not seen — then it
     is drawn faint, with no height, and the page says so. */
  function markSky(v, keshet, seen) {
    var body = document.getElementById("sk19Body");
    if (!body) return;
    var visible = seen !== false;
    body.setAttribute("opacity", visible ? "1" : ".28");
    var s = v.signed, x = skX(s);
    var high = visible ? Math.max(0.15, Math.min(1, (keshet || 0) / 14)) : 0.3;
    var y = SK.horizon - 30 - high * 118;
    ["sk19Disc", "sk19Body", "sk19Lit", "sk19Grab"].forEach(function (id) {
      var e2 = document.getElementById(id);
      e2.setAttribute("cx", x.toFixed(1)); e2.setAttribute("cy", y.toFixed(1));
    });
    /* north of the line the hollow leans toward the south — to the left — and
       south of it toward the north; how far, by how far it stands off */
    var turn = -Math.max(-1.25, Math.min(1.25, s / SK.unit)) * 48;
    var t = (turn - 90) * RAD19, up = -90 * RAD19;
    var cut = document.getElementById("sk19Cut");
    cut.setAttribute("cx", (x + Math.cos(t) * 17).toFixed(1));
    cut.setAttribute("cy", (y + Math.sin(t) * 17).toFixed(1));
    seg("sk19Notch", x, y, x + Math.cos(t) * 76, y + Math.sin(t) * 76);
    at("sk19NotchL", x + Math.cos(t) * 92, y + Math.sin(t) * 92 + 4);
    seg("sk19Up", x, y - 30, x, y - 80);
    at("sk19UpL", x + (turn < 0 ? 30 : -30), y - 84);
    var r = 52, a0 = [x + Math.cos(up) * r, y + Math.sin(up) * r],
        a1 = [x + Math.cos(t) * r, y + Math.sin(t) * r];
    document.getElementById("sk19Arc").setAttribute("d", Math.abs(turn) < 1 ? "" :
      "M " + a0[0].toFixed(1) + " " + a0[1].toFixed(1) + " A " + r + " " + r + " 0 0 " +
      (turn < 0 ? 0 : 1) + " " + a1[0].toFixed(1) + " " + a1[1].toFixed(1));

    /* a night nobody sees has no height to show — the verdict and the קשת's
       own chip already say so — so the height and its label step aside */
    var hline = document.getElementById("sk19Height"), hl = document.getElementById("sk19HeightL");
    hline.setAttribute("opacity", visible ? "1" : "0");
    hl.setAttribute("opacity", visible ? "1" : "0");
    seg("sk19Height", x, SK.horizon, x, y + 30);
    at("sk19HeightL", x + (s >= 0 ? -44 : 44), (SK.horizon + y + 30) / 2 + 4);
    hl.textContent = keshet === undefined ? "—" : "קשת " + dm19(keshet);
    document.getElementById("sk19Foot").setAttribute("d",
      "M " + x.toFixed(1) + " " + (SK.horizon - 1) + " l -6 -9 l 12 0 z");
    var fl = document.getElementById("sk19FootL");
    at("sk19FootL", x, SK.horizon - 14);
    fl.textContent = v.distDeg <= 0 ? "על הקו" :
      degIncl(v.distDeg) + " " + (v.distNorth ? "צפון" : "דרום");

    var read = document.getElementById("sk19Read");
    if (read) {
      read.innerHTML =
        chip("sun", "נטיית מעלתו", degIncl(v.inclDeg) + " " + (v.inclNorth ? "צפון" : "דרום"), "י״ט:ז–ט") +
        chip("mean", "רוחבו", degIncl(v.rochavDeg) + " " + (v.rochavNorth ? "צפון" : "דרום"), "פרק ט״ז") +
        chip("mas", "מרחקו מעל הקו השוה", fl.textContent, "י״ט:י") +
        (keshet === undefined ? "" : chip("ink", "קשת הראייה", visible ? dm19(keshet) : "—", "פרק י״ז"));
    }
  }
  function chip(c, name, val, mark) {
    return '<span class="c-' + c + '"><small>' + name + " · " + mark + '</small><b dir="ltr">' +
           val + "</b></span>";
  }
  function seg(id, x1, y1, x2, y2) {
    var l = document.getElementById(id);
    l.setAttribute("x1", x1.toFixed(1)); l.setAttribute("y1", y1.toFixed(1));
    l.setAttribute("x2", x2.toFixed(1)); l.setAttribute("y2", y2.toFixed(1));
  }
  function at(id, x, y) {
    var t = document.getElementById(id);
    t.setAttribute("x", x.toFixed(1)); t.setAttribute("y", y.toFixed(1));
  }

  /* Rule eight, in the sky — but his question is asked of witnesses, and there
     are witnesses only on a ליל ראייה. So the hand carries the moon from one
     such night to another: the page gathers the nights of seeing two years
     either side, the very nights the instrument's ‹ ליל ראייה › steps through,
     and goes to the one on which the moon stood nearest to where the hand has
     put it — the nearest in time, of those that stood equally near. */
  var LIL19 = null;
  function lilNights(around) {
    var d = Math.max(1, Math.round(around));
    if (LIL19 && LIL19.at === d) return LIL19.list;
    var days = [], back = d, fwd = d, i;
    if (isLil(d)) days.push(d);                        // tonight is one of them
    for (i = 0; i < 24; i++) {
      var p = prevLil(back);
      if (!(p >= 0) || p >= back) break;
      days.push(back = p);
    }
    for (i = 0; i < 24; i++) {
      var q = nextLil(fwd);
      if (!(q > fwd)) break;
      days.push(fwd = q);
    }
    LIL19 = { at: d, list: days.map(function (n) {
      return { day: n, signed: chapter19At(n).signed, seen: chapter17At(n).verdict.seen };
    }) };
    return LIL19.list;
  }

  function grabSky() {
    var h = document.getElementById("sk19Grab");
    if (!h) return;
    var svg = h.ownerSVGElement, holding = false, from = 0, nights = [];
    function want(e) {
      var b = svg.getBoundingClientRect();
      var x = (e.clientX - b.left) * SK.w / b.width;
      return Math.max(-30, Math.min(30, (x - SK.mid) / (0.66 * SK.span) * SK.unit));
    }
    h.addEventListener("pointerdown", function (e) {
      holding = true;
      playing = false; el.play.textContent = "▶ Turn"; stopRun();
      from = Math.round(day);
      nights = lilNights(from);
      svg.classList.add("dragging");
      h.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    h.addEventListener("pointermove", function (e) {
      if (!holding || !nights.length) return;
      var target = want(e), best = nights[0], cost = Infinity;
      for (var i = 0; i < nights.length; i++) {
        /* a night with witnesses outweighs one a few degrees nearer on which
           nobody sees it — his question is only asked when there is an answer */
        var c = Math.abs(nights[i].signed - target) + (nights[i].seen ? 0 : 4) +
                0.002 * Math.abs(nights[i].day - from);
        if (c < cost) { cost = c; best = nights[i]; }
      }
      if (best.day !== day) { day = best.day; drawAt(day); }
    });
    function drop() {
      if (!holding) return;
      holding = false;
      svg.classList.remove("dragging");
      setDay(Math.round(day));
    }
    h.addEventListener("pointerup", drop);
    h.addEventListener("pointercancel", drop);
  }

  /* The instrument's corner says what this chapter reads off it, and in full
     light: the view it is borrowed from dims that slot, which is how a figure
     came to be drawn at a seventh of its strength. The place goes on top. */
  function corner19(top, bottom) {
    if (!el.corner) return;
    var all = el.corner.querySelectorAll("text, circle"), t = el.corner.querySelectorAll("text");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("dimmed");
    if (t[0]) t[0].textContent = top.label;
    if (el.cMean) { el.cMean.classList.remove("dimmed"); el.cMean.textContent = top.value; }
    if (el.cMasLbl) el.cMasLbl.textContent = bottom.label;
    if (el.cMas) { el.cMas.classList.remove("dimmed"); el.cMas.textContent = bottom.value; }
  }
