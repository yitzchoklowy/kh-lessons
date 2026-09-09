  /* What chapter seventeen is correcting for, drawn — in his own order.

     Each figure is one claim, and each has a handle: move it and the correction
     it stands for grows, shrinks, or changes sign. The claims are the
     commentators' — יד פשוטה in his פתיחה and on halachos ה–י״ב, and המפרש on
     halachos א, ו–י״א, ט״ו–י״ז. What is drawn from geometry rather than from
     their words is labelled where it is shown. */

  var RD = Math.PI / 180;
  function svg(w, h, id, label, body) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" id="' + id + '" role="img" ' +
      'aria-label="' + label + '">' + body + "</svg>";
  }
  function ln(x1, y1, x2, y2, stroke, extra) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) +
      '" y2="' + y2.toFixed(1) + '" stroke="' + stroke + '" ' + (extra || "") + "></line>";
  }
  function tx(x, y, s, o) {
    o = o || {};
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' +
      (o.size || 11) + '" text-anchor="' + (o.anchor || "middle") + '" fill="' +
      (o.fill || "currentColor") + '" fill-opacity="' + (o.op || ".7") + '"' +
      (o.mono ? ' font-family="IBM Plex Mono, monospace"' : "") +
      (o.weight ? ' font-weight="' + o.weight + '"' : "") + ">" + s + "</text>";
  }
  function dot(x, y, c, r) {
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r || 3.4) +
      '" fill="' + c + '"></circle>';
  }

  /* ── 1. שינוי המראה — his first correction, and המפרש's figure מ״ו ──
     The line from the middle of the earth and the line from a man standing on
     its face do not land on the same place of the circle of the mazalos. The
     arc between where they land is שינוי המראה. It is largest at the setting
     point and nothing at all overhead, "לפי שהקו היוצא ממוצק הארץ והקו היוצא
     משטח הארץ... נופלים זה על זה". */
  /* The earth sits at the foot and the circle of the mazalos sweeps overhead,
     so ONE radius serves every altitude and nothing in the drawing changes size
     as the moon is raised. What moves is the moon, along its own arc — which is
     the only thing that ought to move. */
  var FP = { w: 640, h: 476, cx: 152, cy: 414, r: 40, far: 322, moon: 208 };

  function figParallax(alt) {
    var g = "", a = alt * RD;
    var mx = FP.cx, my = FP.cy - FP.r;                       // the man, on top
    var lx = mx + FP.moon * Math.cos(a), ly = my - FP.moon * Math.sin(a);

    /* the circle of the mazalos — a quarter of it, drawn once and for all */
    var arc = "";
    for (var d = -4; d <= 102; d += 1.5) {
      var q = [FP.cx + FP.far * Math.cos(d * RD), FP.cy - FP.far * Math.sin(d * RD)];
      arc += (arc ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    g += '<path d="' + arc + '" fill="none" stroke="currentColor" stroke-opacity=".28" stroke-width="1.2"></path>';
    g += tx(FP.cx + FP.far + 6, FP.cy - 10, "גלגל המזלות",
            { anchor: "end", op: ".45", size: 10.5 });

    function hitFrom(px, py, qx, qy) {
      var ux = qx - px, uy = qy - py, L = Math.sqrt(ux * ux + uy * uy);
      ux /= L; uy /= L;
      var ex = px - FP.cx, ey = py - FP.cy;
      var bb = ex * ux + ey * uy, cc = ex * ex + ey * ey - FP.far * FP.far;
      var t = -bb + Math.sqrt(bb * bb - cc);
      return [px + ux * t, py + uy * t];
    }
    var N = hitFrom(FP.cx, FP.cy, lx, ly);       // from the middle — the true place
    var M = hitFrom(mx, my, lx, ly);             // from his standing place — the seen one

    g += '<circle cx="' + FP.cx + '" cy="' + FP.cy + '" r="' + FP.r +
         '" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-opacity=".3"></circle>';
    g += dot(FP.cx, FP.cy, "currentColor", 2.6);
    g += tx(FP.cx - 14, FP.cy + 4, "א", { op: ".85", weight: "700" });
    g += ln(28, my, FP.cx + 84, my, "currentColor", 'stroke-opacity=".28" stroke-dasharray="4 3"');
    g += tx(28, my - 8, "האופק שלו", { anchor: "start", op: ".45", size: 10 });
    g += dot(mx, my, "currentColor", 3);
    g += tx(mx - 13, my - 6, "מ", { op: ".85", weight: "700" });

    g += ln(FP.cx, FP.cy, N[0], N[1], "currentColor", 'stroke-opacity=".45" stroke-width="1.3" stroke-dasharray="5 4"');
    g += ln(mx, my, M[0], M[1], "var(--mean)", 'stroke-width="1.6"');
    g += '<use href="#gMoon" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '"></use>';
    g += tx(lx - 18, ly - 8, "ל", { fill: "var(--mean)", op: "1", weight: "700" });

    // the arc between the two landings — that is the whole of it
    var an = Math.atan2(FP.cy - N[1], N[0] - FP.cx) / RD;
    var am = Math.atan2(FP.cy - M[1], M[0] - FP.cx) / RD;
    var sweep = "", st = an > am ? -0.8 : 0.8;
    for (var u = an; st > 0 ? u < am : u > am; u += st) {
      var pp = [FP.cx + FP.far * Math.cos(u * RD), FP.cy - FP.far * Math.sin(u * RD)];
      sweep += (sweep ? " L " : "M ") + pp[0].toFixed(1) + " " + pp[1].toFixed(1);
    }
    if (sweep) g += '<path d="' + sweep + '" fill="none" stroke="var(--mas)" stroke-width="4.5" stroke-linecap="round"></path>';
    g += dot(N[0], N[1], "currentColor", 3.2) + dot(M[0], M[1], "var(--mas)", 3.6);
    var out = 1 + 17 / FP.far;                              // just clear of the circle
    g += tx(FP.cx + (N[0] - FP.cx) * out, FP.cy + (N[1] - FP.cy) * out, "נ",
            { op: ".85", weight: "700" });
    var out2 = 1 - 19 / FP.far;                             // and just inside it
    g += tx(FP.cx + (M[0] - FP.cx) * out2, FP.cy + (M[1] - FP.cy) * out2 + 4, "מ׳",
            { fill: "var(--mas)", op: "1", weight: "700" });
    /* the name, set just outside the circle where the two landings fall */
    var mid = (an + am) / 2, rl = FP.far + 44;
    var lx2 = FP.cx + rl * Math.cos(mid * RD), ly2 = FP.cy - rl * Math.sin(mid * RD);
    g += tx(Math.min(616, Math.max(70, lx2)), Math.min(452, Math.max(30, ly2)), "שינוי המראה",
            { anchor: mid > 55 ? "middle" : "start", fill: "var(--mas)", op: "1",
              size: 11.5, weight: "700" });

    /* the drawing is wide so the thing can be seen; the number is the true one,
       taken from his own sixty radii */
    var par = Math.asin(Math.sin((90 - alt) * RD) / 60) / RD;
    g += tx(30, 44, Math.round(par * 60) + "′",
            { anchor: "start", fill: "var(--mas)", op: "1", size: 21, mono: true });
    g += tx(30, 64, "גובה הירח " + Math.round(alt) + "°", { anchor: "start", op: ".5", size: 10 });
    g += tx(320, 466, "הציור מוגזם — הירח רחוק מן הארץ כפי ששים מרדיוסה, ואז הקשת קטנה בהרבה",
            { op: ".45", size: 10 });
    return svg(FP.w, FP.h, "fp",
      "The earth at the foot, a man standing on it, and the circle of the mazalos sweeping " +
      "overhead: the line from the centre and the line from the surface land on two different " +
      "places of it, and the gap is widest when the moon is low.", g);
  }

  /* ── 2. גובה המדינה ──
     Jerusalem stands two and thirty degrees off the line of the equator, so the
     moon does not come down square upon the horizon but along a slant; a
     northern רוחב buys it time above the horizon, a southern one costs it. */
  var F3 = { w: 640, h: 280, y0: 214, sx: 150, ppd: 17 };

  function figGovah(rochav) {
    var g = "", lat = 32, slant = (90 - lat) * RD;
    g += ln(40, F3.y0, 604, F3.y0, "currentColor", 'stroke-opacity=".45" stroke-width="1.4"');
    g += tx(598, F3.y0 + 17, "האופק המערבי", { anchor: "end", op: ".5" });
    var up = 150;
    g += ln(F3.sx, F3.y0, F3.sx + up * Math.cos(slant), F3.y0 - up * Math.sin(slant),
            "currentColor", 'stroke-opacity=".28" stroke-dasharray="4 3"');
    g += tx(F3.sx + 92, F3.y0 - 84, "בירושלים נוטה ל״ב°", { op: ".4", size: 10 });

    var mx = F3.sx + 118, my = F3.y0 - 92;
    var off = rochav * F3.ppd;
    var px = Math.sin(slant), py = Math.cos(slant);
    var lx = mx + px * off, ly = my + py * off;
    g += ln(mx, my, lx, ly, "var(--mas)", 'stroke-width="2"');
    var foot = function (x, y) { return x + (F3.y0 - y) / Math.tan(slant); };
    var f0 = foot(mx, my), f1 = foot(lx, ly);
    g += ln(mx, my, f0, F3.y0, "currentColor", 'stroke-opacity=".3" stroke-dasharray="3 3"');
    g += ln(lx, ly, f1, F3.y0, "var(--mean)", 'stroke-width="1.4" stroke-dasharray="5 4"');
    g += ln(f0, F3.y0 + 8, f1, F3.y0 + 8, "var(--mas)", 'stroke-width="4" stroke-linecap="round"');
    g += '<use href="#gMoon" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '"></use>';
    g += tx((f0 + f1) / 2, F3.y0 + 27, (rochav >= 0 ? "מאחר את שקיעתו" : "מקדים את שקיעתו"),
            { fill: "var(--mas)", op: "1", size: 11 });
    g += tx(614, 40, (rochav >= 0 ? "רוחב צפוני " : "רוחב דרומי ") + Math.abs(rochav).toFixed(1) + "°",
            { anchor: "end", fill: "var(--mas)", op: "1", weight: "700", size: 12.5 });
    g += tx(614, 62, "שני שלישיו: " + (Math.abs(rochav) * 2 / 3).toFixed(2) + "°",
            { anchor: "end", op: ".6", size: 11, mono: true });
    g += tx(614, 80, "מנת גובה המדינה", { anchor: "end", op: ".45", size: 10 });
    return svg(F3.w, F3.h, "f3",
      "The moon comes down on a slant at Jerusalem, so a northern width keeps it up longer " +
      "and a southern one brings it down sooner.", g);
  }

  /* ── 3. הקשת היא זמן ──
     A degree of the equator is four minutes of the day turning, so the arc is
     the wait between the sun going down and the moon following it. */
  var F4 = { w: 640, h: 150, x0: 46, x1: 600, top: 20 };

  function figTime(keshet) {
    var g = "", sc = (F4.x1 - F4.x0) / F4.top;
    var X = function (d) { return F4.x0 + d * sc; };
    var band = function (a, b, col, op) {
      return '<rect x="' + X(a).toFixed(1) + '" y="52" width="' + ((b - a) * sc).toFixed(1) +
        '" height="26" fill="' + col + '" fill-opacity="' + op + '"></rect>';
    };
    g += band(0, 9, "var(--no)", ".3") + band(9, 14, "var(--mas)", ".25") + band(14, F4.top, "var(--yes)", ".3");
    g += tx(X(4.5), 70, "אינו נראה", { op: ".8", size: 11 });
    g += tx(X(11.5), 70, "הקיצין", { op: ".8", size: 11 });
    g += tx(X(17), 70, "ודאי ייראה", { op: ".8", size: 11 });
    g += ln(F4.x0, 84, F4.x1, 84, "currentColor", 'stroke-opacity=".3"');
    for (var d = 0; d <= F4.top; d += 2) {
      g += ln(X(d), 84, X(d), 90, "currentColor", 'stroke-opacity=".3"');
      g += tx(X(d), 104, d + "°", { op: ".45", size: 9.5, mono: true });
      g += tx(X(d), 122, d * 4 + "׳", { op: ".45", size: 9.5, mono: true, fill: "var(--mean)" });
    }
    g += tx(F4.x0 - 8, 104, "קשת", { anchor: "end", op: ".5", size: 10 });
    g += tx(F4.x0 - 8, 122, "דקות", { anchor: "end", op: ".5", size: 10, fill: "var(--mean)" });
    g += ln(X(keshet), 44, X(keshet), 92, "var(--ink)", 'stroke-width="2"');
    g += tx(Math.min(F4.x1 - 54, Math.max(F4.x0 + 54, X(keshet))), 36,
            degMin(keshet) + " · " + Math.round(keshet * 4) + " דקות",
            { op: "1", size: 12, weight: "700", mono: true });
    return svg(F4.w, F4.h, "f4",
      "The arc of vision in degrees, and the same arc as minutes of waiting: four to the degree.", g);
  }

  /* ── 4. שני המעגלים ──
     Why there are two great circles at all, and why an arc on the one is not an
     arc on the other: the sun and moon travel on the מילקה, and the whole sky
     turns once a day on קו המשווה — and time, and therefore setting, is
     measured on the second. They lean from one another by twenty-three and a
     half degrees. */
  var FG = { w: 640, h: 340, cx: 320, cy: 174, r: 128, view: 26, eps: 23.5 };

  function figGlobe(spin) {
    var g = "", e = FG.view * RD, f = spin * RD, i = FG.eps * RD;
    function proj(X0, Y0, Z) {
      var X = X0 * Math.cos(f) - Y0 * Math.sin(f);
      var Y = X0 * Math.sin(f) + Y0 * Math.cos(f);
      return [FG.cx + X, FG.cy - (Y * Math.sin(e) + Z * Math.cos(e))];
    }
    function ring(lean, from, to) {
      var d = "";
      for (var t = from; t <= to; t += 3) {
        var q = proj(FG.r * Math.cos(t * RD), FG.r * Math.sin(t * RD) * Math.cos(lean),
                     FG.r * Math.sin(t * RD) * Math.sin(lean));
        d += (d ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
      }
      return d;
    }
    function at(lean, t) {
      return proj(FG.r * Math.cos(t * RD), FG.r * Math.sin(t * RD) * Math.cos(lean),
                  FG.r * Math.sin(t * RD) * Math.sin(lean));
    }
    g += '<circle cx="' + FG.cx + '" cy="' + FG.cy + '" r="' + FG.r +
         '" fill="currentColor" fill-opacity=".045" stroke="currentColor" stroke-opacity=".18"></circle>';
    // the axis the whole sky turns on
    var pn = proj(0, 0, FG.r * 1.16), ps = proj(0, 0, -FG.r * 1.16);
    g += ln(pn[0], pn[1], ps[0], ps[1], "currentColor", 'stroke-opacity=".3" stroke-dasharray="4 4"');
    g += tx(pn[0], pn[1] - 8, "הקוטב", { op: ".45", size: 10 });
    g += '<path d="' + ring(0, 0, 360) + '" fill="none" stroke="var(--mean)" stroke-width="2" stroke-opacity=".85"></path>';
    g += '<path d="' + ring(i, 0, 360) + '" fill="none" stroke="var(--sunc)" stroke-width="2" stroke-opacity=".85"></path>';
    // where the two cross
    var c1 = at(0, 0), c2 = at(0, 180);
    g += dot(c1[0], c1[1], "currentColor", 3) + dot(c2[0], c2[1], "currentColor", 3);
    // the sun, out on the leaning circle
    var s = at(i, 58);
    g += '<use href="#gSun" x="' + s[0].toFixed(1) + '" y="' + s[1].toFixed(1) + '"></use>';
    var lb1 = at(0, 118), lb2 = at(i, 128);
    g += tx(lb1[0], lb1[1] + 16, "קו המשווה", { fill: "var(--mean)", op: "1", size: 11.5, weight: "700" });
    g += tx(lb2[0], lb2[1] - 12, "המילקה", { fill: "var(--sunc)", op: "1", size: 11.5, weight: "700" });
    g += tx(320, 306, "עליו סובב הרקיע פעם ביום — ובו נמדד הזמן, ט״ו מעלות לשעה",
            { fill: "var(--mean)", op: ".75", size: 10.5 });
    g += tx(320, 324, "ועליו הולכים השמש והירח — ובו נמדד האורך. ונוטים זה מזה כ״ג וחצי מעלות",
            { fill: "var(--sunc)", op: ".75", size: 10.5 });
    return svg(FG.w, FG.h, "fg",
      "Two great circles on one sphere: the equator, which the sky turns on once a day, and the " +
      "ecliptic, which the sun and moon travel along, leaning from it by twenty-three and a half degrees.", g);
  }

  /* ── 5. חמשת האורכים, כאחד ──
     His figures 17-8 and 17-9 together, and the whole chain on one drawing.

     On the circle of the mazalos, all measured from the sun ש:
       שנ₀  אורך ראשון   the raw gap between the two true places
       שנ   אורך שני     less שינוי מראה האורך, which is always taken off
       שג   אורך שלישי   less (or plus) מעגל הירח, the piece גנ
     and then, on the equator, along lines parallel to the western horizon:
       אב   אורך רביעי   the arc that sets together with שג
       אב׳  קשת הראייה   plus or minus two thirds of the first width

     Two handles: the width moves ג across נ and the addition becomes a
     subtraction, and the setting slant grows and shrinks אב against שג. */
  var F1 = { w: 640, h: 340, ox: 40, oy: 212, tilt: 18, ppd: 16, mag: 1.35 };

  function figLengths(rochav, slant) {
    var t = F1.tilt * RD, g = "", sl = slant * RD;
    var ex = function (d) { return F1.ox + d * F1.ppd * Math.cos(t); };
    var ey = function (d) { return F1.oy - d * F1.ppd * Math.sin(t); };
    var ux = Math.cos(t), uy = -Math.sin(t);              // along the mazalos
    var px = -Math.sin(t), py = -Math.cos(t);             // square to them

    g += ln(18, F1.oy, 622, F1.oy, "currentColor", 'stroke-opacity=".45" stroke-width="1.4"');
    g += tx(618, F1.oy + 16, "קו המשווה", { anchor: "end", op: ".5", size: 10 });
    g += ln(F1.ox - 32 * ux, F1.oy - 32 * uy, ex(31), ey(31),
            "var(--sunc)", 'stroke-opacity=".45" stroke-width="1.3"');
    g += tx(ex(29), ey(29) - 11, "המילקה", { fill: "var(--sunc)", op: ".7", size: 10 });

    /* his own שינוי מראה האורך for שור, the mazal of his worked example */
    var par = CONSTANTS.PARALLAX_LON_BY_MAZAL[1].chalakim / 60;
    var dS = 3, dN0 = 20, dN = dN0 - par;
    var sx = ex(dS), sy = ey(dS);
    var n0x = ex(dN0), n0y = ey(dN0);                     // before the parallax
    var nx = ex(dN), ny = ey(dN);                         // after it
    var lx = nx + px * rochav * F1.ppd * F1.mag, ly = ny + py * rochav * F1.ppd * F1.mag;
    var gx = lx, dG = (gx - F1.ox) / (F1.ppd * ux);
    var cx = ex(dG), cy = ey(dG);

    function slide(x, y) { return x + (F1.oy - y) / Math.tan(sl); }
    var A = slide(sx, sy), B = slide(cx, cy);
    var gov = (rochav >= 0 ? 1 : -1) * Math.abs(rochav) * (2 / 3) * F1.ppd;
    var B2 = B + gov;

    // the constructions, faint
    g += ln(sx, sy, A, F1.oy, "currentColor", 'stroke-opacity=".26" stroke-dasharray="3 3"');
    g += ln(cx, cy, B, F1.oy, "currentColor", 'stroke-opacity=".26" stroke-dasharray="3 3"');
    g += ln(lx, ly, gx, F1.oy, "currentColor", 'stroke-width="1" stroke-opacity=".22" stroke-dasharray="2 3"');
    g += ln(nx, ny, lx, ly, "var(--mas)", 'stroke-width="1.8"');
    g += tx(620, F1.oy - 9, "המקווקוים — מקבילים לאופק המערבי", { anchor: "end", op: ".34", size: 9 });

    // the five lengths, each on its own rail
    function rail(x1, y1, x2, y2, off, col) {
      return ln(x1 + px * off, y1 + py * off, x2 + px * off, y2 + py * off, col,
                'stroke-width="4" stroke-linecap="round"');
    }
    g += rail(sx, sy, n0x, n0y, 20, "var(--faint)");
    g += rail(sx, sy, nx, ny, 11, "var(--sunc)");
    g += rail(sx, sy, cx, cy, 2, "var(--mean)");
    g += ln(A, F1.oy + 10, B, F1.oy + 10, "var(--ink)", 'stroke-width="4" stroke-linecap="round"');
    g += ln(A, F1.oy + 21, B2, F1.oy + 21, "var(--mas)", 'stroke-width="4" stroke-linecap="round"');

    ly = Math.min(F1.h - 44, Math.max(16, ly));
    g += dot(sx, sy, "var(--sunc)") + dot(n0x, n0y, "currentColor", 2.6) +
         dot(nx, ny, "currentColor") + dot(lx, ly, "var(--mas)") + dot(cx, cy, "var(--mean)");
    g += tx(sx - 3, sy + 17, "ש", { op: ".9", weight: "700" });
    g += tx(nx + 7, ny + 17, "נ", { op: ".9", weight: "700" });
    g += tx(Math.min(628, lx + 15), Math.max(22, ly + 4), "ל",
            { fill: "var(--mas)", op: "1", weight: "700" });
    g += tx(cx - 10, cy - 21, "ג", { fill: "var(--mean)", op: "1", weight: "700" });
    g += tx(A, F1.oy + 40, "א", { op: ".8", weight: "700" });
    g += tx(B, F1.oy + 40, "ב", { op: ".8", weight: "700" });

    var word = Math.abs(cx - nx) < 2 ? "ג עומד על נ — אין מעגל"
      : cx > nx ? "ג אחר נ — תוסיף המעגל" : "ג לפני נ — תגרע המעגל";
    g += tx(320, 22, word, { fill: "var(--mas)", op: "1", size: 12.5, weight: "700" });

    /* the key, along the foot — five names for one distance */
    var key = [["אורך ראשון", "var(--faint)", "י״ז:א"], ["אורך שני", "var(--sunc)", "י״ז:ה"],
               ["אורך שלישי", "var(--mean)", "י״ז:י״א"], ["אורך רביעי", "var(--ink)", "י״ז:י״ב"],
               ["קשת הראייה", "var(--mas)", "י״ז:י״ב"]];
    var kx = 30, ky = 310;
    for (var i = 0; i < key.length; i++) {
      var x = kx + i * 120;
      g += ln(x, ky - 4, x + 20, ky - 4, key[i][1], 'stroke-width="4" stroke-linecap="round"');
      g += tx(x + 26, ky, key[i][0], { anchor: "start", op: ".85", size: 10.5 });
      g += tx(x + 26, ky + 13, key[i][2], { anchor: "start", op: ".4", size: 8.5, mono: true });
    }
    return svg(F1.w, F1.h, "f1",
      "One distance measured five times: three on the circle of the mazalos, and two on the equator.", g);
  }

  /* ── מצעדי המזלות — the third of the four ──
     Equal arcs of the circle of the mazalos do not take equal time to set. Ten
     degrees standing in one mazal may set in thirty-five minutes and ten
     degrees in another in forty-five: what sets is the arc of the EQUATOR that
     comes down with them, and that is longer for some mazalos and shorter for
     others. His table of ארוכי וקצרי שקיעה is nothing but this. */
  var FM = { w: 640, h: 264, y0: 196, ppd: 15 };

  /* his six pairs, most drawn out first, as ר׳ לוי אבן חביב ranks them at
     Jerusalem's horizon — and the fraction each pair asks for is his own */
  function matzadRows() {
    var T = CONSTANTS.SETTING_TIME_BY_MAZAL, out = [];
    for (var i = 0; i < 6; i++) out.push({ a: T[11 - i], b: T[i] });
    return out.sort(function (x, y) {
      var f = function (r) { return r.operation === "add" ? r.fraction
        : r.operation === "none" ? 0 : -r.fraction; };
      return f(y.b) - f(x.b);
    });
  }

  function figMatzadim(pick) {
    var rows = matzadRows(), r = rows[Math.max(0, Math.min(rows.length - 1, Math.round(pick)))];
    var g = "", ARC = 10;                                  // ten degrees of the mazalos
    var frac = r.b.operation === "add" ? r.b.fraction
             : r.b.operation === "none" ? 0 : -r.b.fraction;
    var onEq = ARC * (1 + frac);

    g += ln(30, FM.y0, 610, FM.y0, "currentColor", 'stroke-opacity=".4" stroke-width="1.3"');
    g += tx(606, FM.y0 + 17, "קו המשווה — ומעלה אחת, ארבע דקות",
            { anchor: "end", op: ".45", size: 10 });

    var x0 = 96;
    // the same ten degrees of the mazalos, twice over
    g += ln(x0, FM.y0 - 74, x0 + ARC * FM.ppd, FM.y0 - 74, "var(--sunc)",
            'stroke-width="5" stroke-linecap="round"');
    g += tx(x0 + ARC * FM.ppd / 2, FM.y0 - 86, "עשר מעלות מן המזלות",
            { fill: "var(--sunc)", op: "1", size: 11 });
    g += ln(x0, FM.y0 - 66, x0, FM.y0 - 8, "currentColor", 'stroke-opacity=".25" stroke-dasharray="3 3"');
    g += ln(x0 + ARC * FM.ppd, FM.y0 - 66, x0 + onEq * FM.ppd, FM.y0 - 8,
            "currentColor", 'stroke-opacity=".25" stroke-dasharray="3 3"');
    g += ln(x0, FM.y0 - 8, x0 + onEq * FM.ppd, FM.y0 - 8, "var(--mean)",
            'stroke-width="5" stroke-linecap="round"');
    g += tx(x0 + onEq * FM.ppd / 2, FM.y0 - 18, "ומה ששוקע עמן",
            { fill: "var(--mean)", op: "1", size: 11 });

    g += tx(320, 34, r.a.hebrew + " · " + r.b.hebrew,
            { op: "1", size: 15, weight: "700", fill: "var(--mas)" });
    g += tx(320, 54, r.b.operation === "none" ? "תניח כמות שהוא"
            : (r.b.operation === "add" ? "תוסיף " : "תגרע ") + r.b.phrase,
            { op: ".7", size: 11.5 });
    g += tx(320, 236, "עשר מעלות אלו שוקעות ב־" + Math.round(onEq * 4) + " דקות",
            { op: ".9", size: 12.5, weight: "700", mono: true });
    g += tx(320, 254, "ולוּ עמדו במזל שכנגדו בסדר, היה זמנן אחר", { op: ".45", size: 10 });
    return svg(FM.w, FM.h, "fm",
      "Ten degrees of the circle of the mazalos, and the arc of the equator that comes down " +
      "with them: longer in some mazalos, shorter in others.", g);
  }
