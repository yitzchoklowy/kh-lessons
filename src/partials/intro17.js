  /* The four things chapter seventeen is correcting for, drawn.

     Each figure is one claim, and each has a handle: move it and the correction
     it stands for grows, shrinks, or changes sign. The claims are יד פשוטה's,
     in his פתיחה לפרק י״ז and on halachos ה–י״ב; what is drawn from geometry
     rather than from his words is labelled where it is shown. */

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

  /* ── 1. מן המילקה אל קו המשווה — his figure 17-8 ──
     The sun ש and the moon's foot נ stand on the circle of the mazalos; the
     moon ל sits off it by the רוחב. Drop a line from ל square to the equator:
     where it cuts the circle of mazalos is ג. What the sighting wants is שג,
     not שנ — and גנ, the piece between them, is מעגל הירח. Move the רוחב and
     watch ג cross over נ: that is where his "יהיה הדבר הפך" comes from. */
  var F1 = { w: 640, h: 300, ox: 96, oy: 214, tilt: 24, ppd: 15 };

  function fig1(rochav) {
    var t = F1.tilt * RD, g = "";
    var ex = function (d) { return F1.ox + d * F1.ppd * Math.cos(t); };
    var ey = function (d) { return F1.oy - d * F1.ppd * Math.sin(t); };
    // the equator, and the circle of the mazalos crossing it
    g += ln(30, F1.oy, 616, F1.oy, "currentColor", 'stroke-opacity=".45" stroke-width="1.4"');
    g += tx(608, F1.oy + 17, "קו השווה", { anchor: "end", op: ".5" });
    g += ln(F1.ox - 60 * Math.cos(t), F1.oy + 60 * Math.sin(t), ex(30), ey(30),
            "var(--sunc)", 'stroke-opacity=".55" stroke-width="1.4"');
    g += tx(ex(29), ey(29) - 10, "המילקה", { fill: "var(--sunc)", op: ".8" });

    var dS = 6, dN = 17;                       // where the sun stands, and the moon's foot
    var sx = ex(dS), sy = ey(dS), nx = ex(dN), ny = ey(dN);
    // the moon, off the circle by its רוחב, square to the circle
    var px = -Math.sin(t), py = -Math.cos(t);
    var lx = nx + px * rochav * F1.ppd, ly = ny + py * rochav * F1.ppd;
    // square to the EQUATOR from the moon — where it cuts the circle is ג
    var gx = lx, gy = F1.oy;
    var dG = (gx - F1.ox) / (F1.ppd * Math.cos(t));
    var cx = ex(dG), cy = ey(dG);

    g += ln(lx, ly, gx, gy, "var(--mean)", 'stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity=".7"');
    g += ln(nx, ny, lx, ly, "var(--mas)", 'stroke-width="2"');
    // the two lengths, on the two circles
    g += ln(sx, sy, nx, ny, "var(--sunc)", 'stroke-width="3.4" stroke-linecap="round"');
    g += ln(sx, F1.oy, gx, F1.oy, "var(--mean)", 'stroke-width="3.4" stroke-linecap="round"');
    g += ln(sx, sy, sx, F1.oy, "currentColor", 'stroke-opacity=".25" stroke-dasharray="3 3"');

    var dot = function (x, y, c) {
      return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.4" fill="' + c + '"></circle>';
    };
    g += dot(sx, sy, "var(--sunc)") + dot(nx, ny, "currentColor") +
         dot(lx, ly, "var(--mean)") + dot(cx, cy, "var(--mas)");
    g += tx(sx, sy - 10, "ש", { op: ".9", weight: "700" });
    g += tx(nx + 12, ny - 4, "נ", { op: ".9", weight: "700" });
    g += tx(lx + (rochav >= 0 ? 13 : -13), ly + 4, "ל", { fill: "var(--mean)", op: "1", weight: "700" });
    g += tx(cx, cy + (rochav >= 0 ? -12 : 16), "ג", { fill: "var(--mas)", op: "1", weight: "700" });
    g += tx((sx + nx) / 2, (sy + ny) / 2 - 12, "אורך שני", { fill: "var(--sunc)", op: ".9" });
    g += tx((sx + gx) / 2, F1.oy + 17, "אורך שלישי", { fill: "var(--mean)", op: ".9" });
    g += tx((nx + lx) / 2 + 16, (ny + ly) / 2, "רוחב", { fill: "var(--mas)", op: ".9", size: 10 });
    var word = Math.abs(cx - nx) < 2 ? "ג עומד על נ — אין מה להוסיף"
      : cx > nx ? "ג אחר נ — תוסיף המעגל" : "ג לפני נ — תגרע המעגל";
    g += tx(320, 34, word, { fill: "var(--mas)", op: "1", size: 12.5, weight: "700" });
    g += tx(320, 54, "וקשת גנ היא מעגל הירח — מקצת מן הרוחב", { op: ".55", size: 10.5 });
    return svg(F1.w, F1.h, "f1",
      "The circle of the mazalos crossing the equator: the length between sun and moon on the one, " +
      "and the length that answers to it on the other.", g);
  }

  /* ── 2. שינוי המראה ──
     Every figure until now was reckoned from the middle of the earth. A man
     stands on its face, one radius off, and sees the moon lower than it is.
     The sun is too far for it to matter; the moon is sixty radii out, and near
     the horizon it matters most. */
  var F2 = { w: 640, h: 300, cx: 168, cy: 208, r: 54 };

  function fig2(alt) {
    var g = "", a = alt * RD;
    var mx = F2.cx, my = F2.cy - F2.r;                       // the man, on top
    g += '<circle cx="' + F2.cx + '" cy="' + F2.cy + '" r="' + F2.r +
         '" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-opacity=".3"></circle>';
    g += tx(F2.cx, F2.cy + 4, "א", { op: ".8", weight: "700" });
    g += '<circle cx="' + F2.cx + '" cy="' + F2.cy + '" r="2.6" fill="currentColor"></circle>';
    g += ln(F2.cx - 96, my, F2.cx + 96, my, "currentColor", 'stroke-opacity=".3" stroke-dasharray="4 3"');
    g += tx(F2.cx - 100, my - 5, "האופק שלו", { anchor: "end", op: ".45", size: 10 });
    g += '<circle cx="' + mx + '" cy="' + my + '" r="3" fill="currentColor"></circle>';
    g += tx(mx - 12, my - 6, "מ", { op: ".8", weight: "700" });

    var D = 300;                                             // the moon, far off to the right
    var lx = mx + D * Math.cos(a), ly = my - D * Math.sin(a);
    g += '<use href="#gMoon" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '"></use>';
    g += tx(lx, ly - 18, "ל", { fill: "var(--mean)", op: "1", weight: "700" });
    g += ln(mx, my, lx, ly, "var(--mean)", 'stroke-width="1.6"');
    g += ln(F2.cx, F2.cy, lx, ly, "currentColor", 'stroke-opacity=".45" stroke-width="1.4" stroke-dasharray="5 4"');

    /* the angle the two lines make — the geometry the correction stands for.
       Sixty earth-radii is his own figure for the moon's distance (י״ז:ו). */
    var z = 90 - alt;
    var par = Math.asin(Math.sin(z * RD) / 60) / RD;
    g += tx(596, 44, "שינוי המראה", { anchor: "end", fill: "var(--mas)", op: "1", weight: "700", size: 12.5 });
    g += tx(596, 66, Math.round(par * 60) + "′", { anchor: "end", fill: "var(--mas)", op: "1", size: 20, mono: true });
    g += tx(596, 86, "not his · גובה הירח " + Math.round(alt) + "°",
            { anchor: "end", op: ".45", size: 10 });
    g += tx(320, 278, "מן המרכז א רואים אותו במקום אחד, ומעל פני הארץ במקום נמוך ממנו",
            { op: ".55", size: 10.5 });
    return svg(F2.w, F2.h, "f2",
      "The earth, a man standing on it, and the moon: the line from the centre and the line " +
      "from the surface do not point to the same place.", g);
  }

  /* ── 3. גובה המדינה ──
     Jerusalem stands two and thirty degrees off the line of the equator, so
     the moon does not come down square upon the horizon but along a slant; a
     northern רוחב buys it time above the horizon, a southern one costs it. */
  var F3 = { w: 640, h: 280, y0: 214, sx: 150, ppd: 17 };

  function fig3(rochav) {
    var g = "", lat = 32, slant = (90 - lat) * RD;
    g += ln(40, F3.y0, 604, F3.y0, "currentColor", 'stroke-opacity=".45" stroke-width="1.4"');
    g += tx(598, F3.y0 + 17, "האופק המערבי", { anchor: "end", op: ".5" });
    // the track the moon comes down on, at Jerusalem's slant
    var up = 150;
    g += ln(F3.sx, F3.y0, F3.sx + up * Math.cos(slant), F3.y0 - up * Math.sin(slant),
            "currentColor", 'stroke-opacity=".28" stroke-dasharray="4 3"');
    g += tx(F3.sx + 86, F3.y0 - 78, "בירושלים נוטה כ״ב°", { op: ".4", size: 10 });

    var mx = F3.sx + 118, my = F3.y0 - 92;
    var off = rochav * F3.ppd;
    var px = Math.sin(slant), py = Math.cos(slant);
    var lx = mx + px * off, ly = my + py * off;
    g += ln(mx, my, lx, ly, "var(--mas)", 'stroke-width="2"');
    // where each of them meets the horizon, coming down the same slant
    var foot = function (x, y) { return x + (F3.y0 - y) / Math.tan(slant); };
    var f0 = foot(mx, my), f1 = foot(lx, ly);
    g += ln(mx, my, f0, F3.y0, "currentColor", 'stroke-opacity=".3" stroke-dasharray="3 3"');
    g += ln(lx, ly, f1, F3.y0, "var(--mean)", 'stroke-width="1.4" stroke-dasharray="5 4"');
    g += ln(f0, F3.y0 + 8, f1, F3.y0 + 8, "var(--mas)", 'stroke-width="4" stroke-linecap="round"');
    g += '<use href="#gMoon" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '"></use>';
    g += tx((f0 + f1) / 2, F3.y0 + 27, (rochav >= 0 ? "מאחר את שקיעתו" : "מקדים את שקיעתו"),
            { fill: "var(--mas)", op: "1", size: 11 });
    g += tx(596, 40, (rochav >= 0 ? "רוחב צפוני " : "רוחב דרומי ") +
            Math.abs(rochav).toFixed(1) + "°",
            { anchor: "end", fill: "var(--mas)", op: "1", weight: "700", size: 12.5 });
    g += tx(596, 62, "שני שלישיו: " + (Math.abs(rochav) * 2 / 3).toFixed(2) + "°",
            { anchor: "end", op: ".6", size: 11, mono: true });
    g += tx(596, 80, "מנת גובה המדינה", { anchor: "end", op: ".45", size: 10 });
    return svg(F3.w, F3.h, "f3",
      "The moon comes down on a slant at Jerusalem, so a northern width keeps it up longer " +
      "and a southern one brings it down sooner.", g);
  }

  /* ── 4. הקשת היא זמן ──
     A degree of the equator is four minutes of the day turning, so the arc is
     the wait between the sun going down and the moon following it. */
  var F4 = { w: 640, h: 150, x0: 46, x1: 600, top: 20 };

  function fig4(keshet) {
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
