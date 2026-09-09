  /* Everything chapter 17 asks for, at a whole day from the עיקר.

     "אין מדקדקין בשניות" — י״ז:י״ג. He carries every figure in degrees and
     minutes, and rounds each stage before the next stage takes it. Every stage
     here is still the engine's own step; only its answer is rounded, the way he
     rounds it. With that one rule his worked example of י״ז:י״ג–י״ד comes out
     to the minute — all nine figures — and his verdict of י״ז:כ״ב with them.

       chapter17At(n) → { day, amiti, sunTrue, rochav1, north,
                          orech1, orech2, lonChalakim,
                          rochav2, latChalakim,
                          maagal, band, orech3,
                          orech4, setRow, gov, keshet,
                          half, seen, path, gate }
  */
  function minutes(x) { return Math.round(x * 60) / 60; }

  function chapter17At(n) {
    var v = chapter15At(n);                      // his two true places, from פרק ט״ו
    var amiti = v.amiti, sunTrue = v.sunTrue;
    var node = calculateNodePosition(n);         // the ראש, from פרק ט״ז
    var lat = calculateMoonLatitude(amiti, node.result);

    var orech1 = minutes(calculateElongation(amiti, sunTrue).result);
    var rochav1 = minutes(lat.result);           // + צפוני, − דרומי

    var s2 = calculateOrechSheni(orech1, amiti);
    var orech2 = minutes(s2.result);

    var r2 = calculateRochavSheni(rochav1, amiti);
    var rochav2 = minutes(r2.result);

    var s3 = calculateOrechShlishi(orech2, rochav2, amiti);
    var orech3 = minutes(s3.result);

    var s4 = calculateOrechRevii(orech3, amiti);
    var orech4 = minutes(s4.result);

    var gov = minutes(calculateMnatGovahHaMedinah(rochav1).result);
    var keshet = minutes(calculateKeshetHaReiyah(orech4, gov, rochav1).result);

    var idx = zodiacPosition(amiti).index;
    return {
      day: n,
      amiti: amiti, sunTrue: sunTrue, mazal: zodiacPosition(amiti),
      rosh: node.result,
      orech1: orech1,
      rochav1: Math.abs(rochav1), signed1: rochav1, north: rochav1 >= 0,
      lonChalakim: CONSTANTS.PARALLAX_LON_BY_MAZAL[idx].chalakim,
      orech2: orech2,
      latChalakim: CONSTANTS.PARALLAX_LAT_BY_MAZAL[idx].chalakim,
      rochav2: Math.abs(rochav2), signed2: rochav2, north2: rochav2 >= 0,
      band: lookupBand(amiti),
      maagal: minutes(s3.maagalMagnitude),
      maagalAdds: orech3 > orech2,
      orech3: orech3,
      setRow: CONSTANTS.SETTING_TIME_BY_MAZAL[idx],
      orech4: orech4,
      gov: gov,
      keshet: keshet,
      half: capGemHalf(amiti),
      verdict: verdictOf(orech1, keshet, amiti)
    };
  }

  /* Which of his bands of י״ז:י׳ the moon stands in. */
  function lookupBand(lon) {
    var B = CONSTANTS.MOON_CIRCLE_FRACTIONS, x = normalizeDegrees(lon);
    for (var i = 0; i < B.length; i++) if (x >= B[i].from && x < B[i].to) return B[i];
    return B[0];
  }

  /* "מתחילת מזל גדי עד סוף מזל תאומים" — the half he keeps turning back to. */
  function capGemHalf(lon) {
    var x = normalizeDegrees(lon);
    return x >= 270 || x < 90;
  }

  /* י״ז:ג–ד and י״ז:ט״ו–כ״א, as one verdict with the halacha that decided it. */
  function verdictOf(orech1, keshet, amiti) {
    var T = CONSTANTS.EARLY_EXIT_THRESHOLDS;
    var half = capGemHalf(amiti) ? T.capricornGemini : T.cancerSagittarius;
    var mark = capGemHalf(amiti) ? "י״ז:ג" : "י״ז:ד";
    if (orech1 > 180) {
      return { seen: false, gate: "לפני ההתקבצות", mark: "י״ז:א",
               says: "הירח עדיין אחר השמש — אין כאן מולד חדש." };
    }
    if (orech1 <= half.invisibleMax) {
      return { seen: false, gate: "קץ קצר", mark: mark,
               says: "האורך הראשון " + half.invisibleMax + " מעלות בשוה או פחות — אי אפשר שייראה." };
    }
    if (orech1 > half.visibleMin) {
      return { seen: true, gate: "קץ ארוך", mark: mark,
               says: "האורך הראשון יתר על " + half.visibleMin + " מעלות — ודאי ייראה." };
    }
    if (keshet <= 9) {
      return { seen: false, gate: "קשת קצרה", mark: "י״ז:ט״ו",
               says: "קשת הראייה תשע מעלות או פחות — אי אפשר שייראה." };
    }
    if (keshet > 14) {
      return { seen: true, gate: "קשת ארוכה", mark: "י״ז:ט״ו",
               says: "קשת הראייה יתר על ארבע עשרה מעלות — אי אפשר שלא ייראה." };
    }
    var K = CONSTANTS.KITZEI_HAREIYAH_TABLE, row = null, ri = -1;
    for (var i = 0; i < K.length; i++) {
      if (keshet > K[i].kashtFromExclusive && keshet <= K[i].kashtUpTo) { row = K[i]; ri = i; }
    }
    if (!row) {
      return { seen: false, gate: "מחוץ לקיצין", mark: "י״ז:ט״ז", says: "" };
    }
    return {
      seen: orech1 >= row.orechMin, gate: "קיצי הראייה", mark: KITZ_MARK[ri], row: row, rowIndex: ri,
      says: "קשת הראייה בין " + row.kashtFromExclusive + " ל־" + row.kashtUpTo +
            ", וצריך אורך ראשון " + row.orechMin + " מעלות או יתר."
    };
  }
  var KITZ_MARK = ["י״ז:י״ז", "י״ז:י״ח", "י״ז:י״ט", "י״ז:כ", "י״ז:כ״א"];

  /* A night the two קצין of י״ז:ג–ד do not settle — the night the rest of the
     chapter exists for. */
  function investigateDay() {
    for (var t = 0; t < 900; t++) {
      var d = 280000 + Math.floor(Math.random() * 60000), v = chapter17At(d);
      var g = v.verdict.gate;
      if (g === "קיצי הראייה" || g === "קשת קצרה" || g === "קשת ארוכה") return v;
    }
    return chapter17At(29);
  }

  /* ── his tables, read off the engine ── */

  /* his own word for a whole degree of it — "תגרע מן האורך מעלה אחת" */
  function chal(x) { return x === 60 ? "1°" : x + "′"; }

  function parallaxLonRows() { return CONSTANTS.PARALLAX_LON_BY_MAZAL; }
  function parallaxLatRows() { return CONSTANTS.PARALLAX_LAT_BY_MAZAL; }

  /* י״ז:י׳ as he says it — fifteen bands, each naming its two mirrored places. */
  function circleRows() {
    var B = CONSTANTS.MOON_CIRCLE_FRACTIONS, out = [];
    for (var i = 0; i < B.length && B[i].from < 180; i++) out.push(B[i]);
    return out;
  }
  function bandIndex(lon) {
    var rows = circleRows(), x = normalizeDegrees(lon), h = x >= 180 ? x - 180 : x;
    for (var i = 0; i < rows.length; i++) if (h >= rows[i].from && h < rows[i].to) return i;
    return -1;
  }
  /* a place on his circle, in his own words: the mazal and the degree in it */
  function placeName(deg) {
    var z = zodiacPosition(normalizeDegrees(deg));
    var d = Math.round(z.positionInConstellation);
    return (d === 0 ? "תחילת " : d + "° ב") + z.hebrew;
  }
  /* where the moon itself stands — "בשמונה עשרה מעלות ממזל שור", the degree
     it is in, not the one it is nearest */
  function moonPlace(deg) {
    var z = zodiacPosition(normalizeDegrees(deg));
    var d = Math.floor(z.positionInConstellation);
    return (d === 0 ? "תחילת " : d + "° ב") + z.hebrew;
  }
  function bandLabel(r) {
    return placeName(r.from) + " – " + placeName(r.to === 180 ? 179.999 : r.to);
  }
  function bandLabel2(r) {
    return placeName(r.from + 180) + " – " + placeName(r.to + 180 === 360 ? 359.999 : r.to + 180);
  }

  /* י״ז:י״ב — his six pairs, one row each, the way he pairs them. */
  function settingRows() {
    var T = CONSTANTS.SETTING_TIME_BY_MAZAL, out = [];
    for (var i = 0; i < 6; i++) out.push({ a: T[11 - i], b: T[i], idxA: 11 - i, idxB: i });
    return out;
  }
  function settingRowIndex(lon) {
    var i = zodiacPosition(lon).index;
    return i <= 5 ? i : 11 - i;
  }
  function fracWord(r) {
    return r.operation === "none" ? r.phrase
      : (r.operation === "add" ? "תוסיף " : "תגרע ") + r.phrase;
  }

  /* ── the western horizon, the way יד פשוטה draws it ──
     Looking west, a little after the sun has gone down. The arcs are short
     enough to read as straight lines. The moon stands off the sun by the
     אורך along his circle of mazalos and by the רוחב across it, and what is
     asked is how much of the equator sets between the two — קשת הראיה.
     One degree of it is four minutes of waiting. */
  var SK = { w: 640, h: 320, y0: 244, x0: 70, x1: 596, deg: 26 };

  function skyFigure() {
    var g = "";
    g += '<line x1="' + SK.x0 + '" y1="' + SK.y0 + '" x2="' + SK.x1 + '" y2="' + SK.y0 +
         '" stroke="currentColor" stroke-opacity=".45" stroke-width="1.5"></line>';
    g += '<text x="' + SK.x1 + '" y="' + (SK.y0 + 18) + '" font-size="10.5" text-anchor="end" ' +
         'fill="currentColor" fill-opacity=".45">האופק המערבי</text>';
    g += '<path id="skTrack" fill="none" stroke="var(--mean)" stroke-width="1.4" ' +
         'stroke-dasharray="5 4" stroke-opacity=".75"></path>';
    g += '<line id="skDrop" stroke="var(--mean)" stroke-width="1" stroke-opacity=".35" ' +
         'stroke-dasharray="2 3"></line>';
    g += '<path id="skArc" fill="none" stroke="var(--mas)" stroke-width="4" ' +
         'stroke-linecap="round"></path>';
    g += '<text id="skArcT" font-size="11.5" text-anchor="middle" fill="var(--mas)" ' +
         'font-family="IBM Plex Mono, monospace">—</text>';
    g += '<line id="skLon" stroke="var(--sunc)" stroke-width="1.2" stroke-opacity=".55"></line>';
    g += '<text id="skLonT" font-size="10.5" text-anchor="middle" fill="var(--sunc)">—</text>';
    g += '<line id="skLat" stroke="var(--mas)" stroke-width="1.2" stroke-opacity=".55"></line>';
    g += '<text id="skLatT" font-size="10.5" text-anchor="start" fill="var(--mas)">—</text>';
    g += '<use id="skSun" href="#gSun" x="-99" y="-99"></use>';
    g += '<use id="skMoon" href="#gMoon" x="-99" y="-99"></use>';
    g += '<text id="skWait" x="' + SK.x0 + '" y="24" font-size="12" ' +
         'fill="currentColor" fill-opacity=".7">—</text>';
    return '<div class="sky"><svg viewBox="0 0 ' + SK.w + " " + SK.h + '" role="img" ' +
      'aria-label="Looking west after sunset: the sun below the horizon, the moon standing off it, ' +
      'and the arc of the equator that sets between the two.">' + g + "</svg></div>";
  }

  function skSet(id, attrs) {
    var e = document.getElementById(id);
    if (!e) return null;
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function skText(id, s) { var e = document.getElementById(id); if (e) e.textContent = s; }

  /* how steeply the mazal sets, taken from his own table of י״ז:י״ב: where he
     adds most the circle stands steepest, where he takes off it lies flattest */
  function setAngle(v) {
    var r = v.setRow, base = SK.deg;
    var lean = r.operation === "add" ? 1 + r.fraction * 2
             : r.operation === "subtract" ? 1 - r.fraction * 1.4 : 1;
    return base * lean;
  }

  function markSky(v) {
    if (!document.getElementById("skArc")) return;
    var PX = 26;                                    // pixels to the degree
    var a = setAngle(v) * Math.PI / 180;
    var sx = SK.x0 + 54, sy = SK.y0;                // where the sun went down
    // the moon: along his circle by the אורך, across it by the רוחב
    var alongX = v.orech1 * PX * Math.cos(a), alongY = -v.orech1 * PX * Math.sin(a);
    var acrossX = (v.north ? 1 : -1) * v.rochav1 * PX * Math.sin(a);
    var acrossY = (v.north ? 1 : -1) * v.rochav1 * PX * Math.cos(a);
    var mx = sx + alongX + acrossX, my = sy + alongY + acrossY;
    var jx = sx + alongX, jy = sy + alongY;         // the same place, with no רוחב

    skSet("skSun", { x: sx, y: sy + 16 });
    skSet("skMoon", { x: mx, y: my });
    // the track it sets on, and where that track meets the horizon
    var tx = mx + (my - SK.y0) / Math.tan(a), ty = SK.y0;
    skSet("skTrack", { d: "M " + mx.toFixed(1) + " " + my.toFixed(1) + " L " + tx.toFixed(1) + " " + ty.toFixed(1) });
    skSet("skDrop", { x1: jx.toFixed(1), y1: jy.toFixed(1), x2: mx.toFixed(1), y2: my.toFixed(1) });
    skSet("skLon", { x1: sx, y1: sy, x2: jx.toFixed(1), y2: jy.toFixed(1) });
    skText("skLonT", degMin(v.orech1));
    skSet("skLonT", { x: ((sx + jx) / 2).toFixed(1), y: ((sy + jy) / 2 - 9).toFixed(1) });
    skText("skLatT", (v.north ? "צפוני " : "דרומי ") + degMin(v.rochav1));
    skSet("skLatT", { x: (mx + 12).toFixed(1), y: ((jy + my) / 2).toFixed(1) });

    var ax = sx + v.keshet * PX;
    skSet("skArc", { d: "M " + sx + " " + (SK.y0 + 7) + " L " + ax.toFixed(1) + " " + (SK.y0 + 7) });
    skText("skArcT", degMin(v.keshet));
    skSet("skArcT", { x: ((sx + ax) / 2).toFixed(1), y: (SK.y0 + 24) });

    // one degree of the equator is four minutes of waiting — יד פשוטה, פתיחה לפרק י״ז
    var mins = v.keshet * 4;
    skText("skWait", "קשת הראייה " + degMin(v.keshet) + " — כרבע שעה ומעלה: " +
      Math.round(mins) + " דקות מן השקיעה עד שישקע הירח");
  }

  /* ── the chain, stage by stage, as one bar each ──
     His own arithmetic, made a shape: where the אורך grows and where it is cut
     back, and what is left standing as the קשת. */
  var CH = { w: 640, h: 176, x0: 128, x1: 604, top: 26, gap: 24 };

  function chainRows(v) {
    return [
      { k: "orech1", n: "אורך ראשון", val: v.orech1, mark: "י״ז:א" },
      { k: "orech2", n: "אורך שני", val: v.orech2, mark: "י״ז:ה" },
      { k: "orech3", n: "אורך שלישי", val: v.orech3, mark: "י״ז:י״א" },
      { k: "orech4", n: "אורך רביעי", val: v.orech4, mark: "י״ז:י״ב" },
      { k: "keshet", n: "קשת הראייה", val: v.keshet, mark: "י״ז:י״ב" }
    ];
  }

  function chainFigure() {
    return '<div class="chain"><svg viewBox="0 0 ' + CH.w + " " + CH.h + '" role="img" ' +
      'aria-label="The first longitude, and what each halacha adds to it or takes off, ' +
      'down to the arc of vision." id="chSvg"></svg></div>';
  }

  function markChain(v, lit) {
    var svg = document.getElementById("chSvg");
    if (!svg) return;
    var rows = chainRows(v), top = 0;
    for (var i = 0; i < rows.length; i++) top = Math.max(top, rows[i].val);
    top = Math.max(top, 16);
    var sc = (CH.x1 - CH.x0) / top, g = "";
    for (var j = 0; j < rows.length; j++) {
      var r = rows[j], y = CH.top + j * CH.gap, w = Math.max(1, r.val * sc);
      var on = r.k === lit, last = j === rows.length - 1;
      g += '<text x="' + (CH.x0 - 10) + '" y="' + (y + 4) + '" font-size="11" text-anchor="end" ' +
           'fill="currentColor" fill-opacity="' + (on ? ".95" : ".55") + '">' + r.n + "</text>";
      g += '<rect x="' + CH.x0 + '" y="' + (y - 7) + '" width="' + w.toFixed(1) + '" height="14" rx="3" ' +
           'fill="' + (last ? "var(--mas)" : "var(--mean)") + '" fill-opacity="' +
           (on ? ".85" : ".28") + '"></rect>';
      g += '<text x="' + (CH.x0 + w + 8) + '" y="' + (y + 4) + '" font-size="10.5" ' +
           'font-family="IBM Plex Mono, monospace" fill="currentColor" fill-opacity="' +
           (on ? ".9" : ".5") + '">' + degMin(r.val) + "</text>";
    }
    svg.innerHTML = g;
  }
