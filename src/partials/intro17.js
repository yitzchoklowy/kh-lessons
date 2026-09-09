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
  var FP = { w: 640, h: 330, cx: 138, cy: 236, r: 44, far: 452, moon: 232 };

  function figParallax(alt) {
    var g = "", a = alt * RD;
    var mx = FP.cx, my = FP.cy - FP.r;                       // the man, on top
    // the circle of the mazalos, far off
    var arc = "";
    for (var d = -66; d <= 30; d += 2) {
      var q = [FP.cx + FP.far * Math.cos(d * RD), FP.cy - FP.far * Math.sin(d * RD)];
      arc += (arc ? " L " : "M ") + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    g += '<path d="' + arc + '" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1.2"></path>';
    g += tx(600, 300, "גלגל המזלות", { anchor: "end", op: ".45", size: 10.5 });

    g += '<circle cx="' + FP.cx + '" cy="' + FP.cy + '" r="' + FP.r +
         '" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-opacity=".3"></circle>';
    g += dot(FP.cx, FP.cy, "currentColor", 2.6);
    g += tx(FP.cx - 12, FP.cy + 4, "א", { op: ".85", weight: "700" });
    g += ln(FP.cx - 74, my, FP.cx + 74, my, "currentColor", 'stroke-opacity=".28" stroke-dasharray="4 3"');
    g += tx(FP.cx - 80, my - 5, "האופק שלו", { anchor: "end", op: ".45", size: 10 });
    g += dot(mx, my, "currentColor", 3);
    g += tx(mx + 11, my - 7, "מ", { op: ".85", weight: "700" });

    var lx = mx + FP.moon * Math.cos(a), ly = my - FP.moon * Math.sin(a);

    /* where each line lands on the circle of the mazalos */
    function hitFrom(px, py, qx, qy) {          // ray from p through q, out to the far circle
      var ux = qx - px, uy = qy - py, L = Math.sqrt(ux * ux + uy * uy);
      ux /= L; uy /= L;
      var ex = px - FP.cx, ey = py - FP.cy;
      var b = ex * ux + ey * uy, c = ex * ex + ey * ey - FP.far * FP.far;
      var t = -b + Math.sqrt(b * b - c);
      return [px + ux * t, py + uy * t];
    }
    var N = hitFrom(FP.cx, FP.cy, lx, ly);       // from the middle — the true place
    var M = hitFrom(mx, my, lx, ly);             // from his standing place — the seen one

    g += ln(FP.cx, FP.cy, N[0], N[1], "currentColor", 'stroke-opacity=".45" stroke-width="1.3" stroke-dasharray="5 4"');
    g += ln(mx, my, M[0], M[1], "var(--mean)", 'stroke-width="1.6"');
    g += '<use href="#gMoon" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '"></use>';
    g += tx(lx, ly - 18, "ל", { fill: "var(--mean)", op: "1", weight: "700" });

    // the arc between the two landings — that is the whole of it
    var an = Math.atan2(FP.cy - N[1], N[0] - FP.cx) / RD;
    var am = Math.atan2(FP.cy - M[1], M[0] - FP.cx) / RD;
    var sweep = "";
    var st = an > am ? -1.2 : 1.2;
    for (var u = an; st > 0 ? u < am : u > am; u += st) {
      var p = [FP.cx + FP.far * Math.cos(u * RD), FP.cy - FP.far * Math.sin(u * RD)];
      sweep += (sweep ? " L " : "M ") + p[0].toFixed(1) + " " + p[1].toFixed(1);
    }
    if (sweep) g += '<path d="' + sweep + '" fill="none" stroke="var(--mas)" stroke-width="4.5" stroke-linecap="round"></path>';
    g += dot(N[0], N[1], "currentColor", 3.2) + dot(M[0], M[1], "var(--mas)", 3.6);
    g += tx(N[0] - 16, N[1] - 8, "נ", { op: ".8", weight: "700" });
    g += tx(M[0] - 16, M[1] + 16, "מ׳", { fill: "var(--mas)", op: "1", weight: "700" });
    g += tx((N[0] + M[0]) / 2 + 62, (N[1] + M[1]) / 2 + 4, "שינוי המראה",
            { fill: "var(--mas)", op: "1", size: 11.5, weight: "700" });

    /* the figure is drawn wide so the thing can be seen; the number is the true
       one, taken from his own sixty radii */
    var par = Math.asin(Math.sin((90 - alt) * RD) / 60) / RD;
    g += tx(614, 40, Math.round(par * 60) + "′",
            { anchor: "end", fill: "var(--mas)", op: "1", size: 21, mono: true });
    g += tx(614, 60, "גובה הירח " + Math.round(alt) + "°", { anchor: "end", op: ".5", size: 10 });
    g += tx(320, 320, "הציור מוגזם — הירח רחוק מן הארץ כפי ששים מרדיוסה, ואז הקשת קטנה בהרבה",
            { op: ".45", size: 10 });
    return svg(FP.w, FP.h, "fp",
      "The earth, a man standing on it, the moon, and the circle of the mazalos beyond: the line " +
      "from the centre and the line from the surface land on two different places of it.", g);
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
    g += tx(X(keshet), 36, formatDms(keshet) + " · " + Math.round(keshet * 4) + " דקות",
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

  /* ── 5. ארבעת האורכים, כאחד ──
     His figure 17-8 and 17-9 together. שנ on the circle of the mazalos is the
     second length. Drop a line from the moon ל square to the equator: where it
     cuts the circle of mazalos is ג, and שג is the THIRD length — still on the
     circle of the mazalos. Then draw lines parallel to the western horizon
     through ש and through ג: where they meet the equator is א and ב, and אב is
     the FOURTH length, the arc of the equator that sets along with שג. */
  var F1 = { w: 640, h: 316, ox: 46, oy: 226, tilt: 19, ppd: 17, mag: 1.7 };

  function figLengths(rochav, slant) {
    var t = F1.tilt * RD, g = "", sl = slant * RD;
    var ex = function (d) { return F1.ox + d * F1.ppd * Math.cos(t); };
    var ey = function (d) { return F1.oy - d * F1.ppd * Math.sin(t); };
    g += ln(20, F1.oy, 620, F1.oy, "currentColor", 'stroke-opacity=".45" stroke-width="1.4"');
    g += tx(610, F1.oy + 17, "קו המשווה", { anchor: "end", op: ".5" });
    g += ln(F1.ox - 40 * Math.cos(t), F1.oy + 40 * Math.sin(t), ex(33), ey(33),
            "var(--sunc)", 'stroke-opacity=".5" stroke-width="1.4"');
    g += tx(ex(31), ey(31) - 11, "המילקה", { fill: "var(--sunc)", op: ".8" });

    var dS = 4, dN = 19;
    var sx = ex(dS), sy = ey(dS), nx = ex(dN), ny = ey(dN);
    var px = -Math.sin(t), py = -Math.cos(t);
    /* the רוחב drawn wider than life, or ג would sit on top of נ and the
       third length could not be told from the second */
    var lx = nx + px * rochav * F1.ppd * F1.mag, ly = ny + py * rochav * F1.ppd * F1.mag;
    var gx = lx, gy = F1.oy;                                  // square to the equator
    var dG = (gx - F1.ox) / (F1.ppd * Math.cos(t));
    var cx = ex(dG), cy = ey(dG);

    // parallel to the western horizon, from ש and from ג down to the equator
    function slide(x, y) { return [x + (F1.oy - y) / Math.tan(sl), F1.oy]; }
    var A = slide(sx, sy), B = slide(cx, cy);
    g += ln(sx, sy, A[0], A[1], "currentColor", 'stroke-opacity=".3" stroke-dasharray="3 3"');
    g += ln(cx, cy, B[0], B[1], "currentColor", 'stroke-opacity=".3" stroke-dasharray="3 3"');

    g += ln(lx, ly, gx, gy, "currentColor", 'stroke-width="1" stroke-opacity=".25" stroke-dasharray="2 3"');
    g += ln(nx, ny, lx, ly, "var(--mas)", 'stroke-width="2"');

    // the four lengths
    g += ln(sx, sy, nx, ny, "var(--sunc)", 'stroke-width="4" stroke-linecap="round"');
    g += ln(sx, sy - 9, cx, cy - 9, "var(--mean)", 'stroke-width="3.4" stroke-linecap="round"');
    g += ln(A[0], F1.oy + 9, B[0], F1.oy + 9, "var(--ink)", 'stroke-width="4" stroke-linecap="round"');

    g += dot(sx, sy, "var(--sunc)") + dot(nx, ny, "currentColor") +
         dot(lx, ly, "var(--mas)") + dot(cx, cy, "var(--mean)") +
         dot(A[0], A[1], "currentColor", 2.6) + dot(B[0], B[1], "currentColor", 2.6);
    g += tx(sx - 4, sy + 18, "ש", { op: ".9", weight: "700" });
    g += tx(nx + 6, ny + 17, "נ", { op: ".9", weight: "700" });
    g += tx(lx + (rochav >= 0 ? 15 : -15), ly + 5, "ל", { fill: "var(--mas)", op: "1", weight: "700" });
    g += tx(cx - 9, cy - 24, "ג", { fill: "var(--mean)", op: "1", weight: "700" });
    g += tx(A[0], F1.oy + 41, "א", { op: ".8", weight: "700" });
    g += tx(B[0], F1.oy + 41, "ב", { op: ".8", weight: "700" });

    g += tx((sx + nx) / 2 - 2, (sy + ny) / 2 + 24, "אורך שני", { fill: "var(--sunc)", op: "1", size: 11.5 });
    g += tx((sx + cx) / 2 - 4, (sy + cy) / 2 - 26, "אורך שלישי", { fill: "var(--mean)", op: "1", size: 11.5 });
    g += tx((A[0] + B[0]) / 2, F1.oy + 26, "אורך רביעי", { op: ".95", size: 11.5, weight: "700" });
    g += tx((nx + lx) / 2 + 20, (ny + ly) / 2 + 3, "רוחב", { fill: "var(--mas)", op: ".9", size: 10 });

    var word = Math.abs(cx - nx) < 2 ? "ג עומד על נ — אין מעגל"
      : cx > nx ? "ג אחר נ — תוסיף המעגל" : "ג לפני נ — תגרע המעגל";
    g += tx(320, 288, word, { fill: "var(--mas)", op: "1", size: 12.5, weight: "700" });
    var d34 = Math.abs(B[0] - A[0]) - Math.abs(cx - sx);
    g += tx(320, 307, "והרביעי " + (d34 >= 0 ? "ארוך" : "קצר") + " מן השלישי — לפי נטיית השקיעה",
            { op: ".55", size: 10.5 });
    g += tx(620, F1.oy - 10, "הקוים המקווקוים — מקבילים לאופק המערבי",
            { anchor: "end", op: ".38", size: 9.5 });

    return svg(F1.w, F1.h, "f1",
      "The second, third and fourth lengths on one drawing: two on the circle of the mazalos, " +
      "and the fourth on the equator.", g);
  }
