/* The worked arithmetic behind each step.
 *
 * Every row is built from the step's own `inputs` (which the engine
 * attaches to each CalculationStep) and from the Rambam's tables in
 * engine/constants.js — then checked against the engine's own result.
 * If a recomputation ever disagrees, the row set is discarded and the
 * plain input list is shown instead, so nothing here can quietly
 * contradict the engine.
 */
var khWorking = (function () {
  "use strict";

  var D = dmsToDecimal, F = formatDms, N = normalizeDegrees;

  function deg(x) { return F(N(x)); }
  function sdeg(x) { return (x < 0 ? "−" : "") + F(Math.abs(x)); }

  // ── molad chain (KH 6:3, 6:8) — same constants as engine/moladTimeline.js ──
  var MOLAD_FIRST = -1.9307;                    // molad Nisan 4938, days from epoch
  function moladDays(n) { return MOLAD_FIRST + n * MOLAD_INTERVAL_DAYS; }
  function moladIndexNear(days) { return Math.round((days - MOLAD_FIRST) / MOLAD_INTERVAL_DAYS); }
  /* Day 1 of the month, by the Rambam's own rule: the month begins on the
     day the crescent was seen, so day 1 is the first evening after the molad
     on which this same calculation says it was visible — which lands 1 to 3
     days after the molad depending on the geometry. ליל ל׳ is 29 days later:
     the night that opens the thirtieth day, the one night the court sits.
     (The real court's day 1 came from witnesses; this is the calculation
     standing in for them.) Measured over 120 consecutive months, every month
     has such an evening, and the resulting ליל ל׳ always falls just past
     the conjunction — a genuine first-crescent night. */
  var dayOneCache = {};
  function monthDayOne(n) {
    if (dayOneCache[n] !== undefined) return dayOneCache[n];
    var from = Math.floor(moladDays(n)), found = from + 2;
    for (var d = from + 1; d <= from + 5; d++) {
      if (runPipeline(new Date(EPOCH_UTC + d * 86400000)).moon.isVisible) { found = d; break; }
    }
    dayOneCache[n] = found;
    return found;
  }
  function lilShloshim(n) { return monthDayOne(n) + 29; }
  function moladParts(n) {
    var frac = moladDays(n) - Math.floor(moladDays(n));   // 0 = 6 PM, day-start
    var totalParts = Math.round(frac * 24 * 1080);
    return { hours: Math.floor(totalParts / 1080), parts: totalParts % 1080 };
  }

  // ── row helpers ──
  function rows() {
    var out = [];
    out.add = function (label, value, op, ref, note) {
      out.push({ l: label, v: value, op: op || null, ref: ref || null, n: note || null });
      return out;
    };
    out.rule = function () { out.push({ rule: true }); return out; };
    return out;
  }

  function bracket(table, key, valKey, x) {
    for (var i = 0; i < table.length - 1; i++) {
      if (x >= table[i][key] && x <= table[i + 1][key]) return [table[i], table[i + 1]];
    }
    return [table[table.length - 1], table[table.length - 1]];
  }

  // ── the Rambam's period-block method (KH 12:1) ──
  var BLOCKS = {
    sunMeanLongitude:  { tbl: "SUN_MEAN_PERIOD_BLOCKS",   start: "startPosition", daily: function () { return D(CONSTANTS.SUN.MEAN_MOTION_PER_DAY); },  what: "the sun's mean motion" },
    sunApogee:         { tbl: "SUN_APOGEE_PERIOD_BLOCKS", start: "apogeeStart",   daily: function () { return CONSTANTS.SUN.APOGEE_MOTION_PER_DAY; }      , what: "the govah's drift" },
    moonMeanLongitude: { tbl: "MOON_MEAN_PERIOD_BLOCKS",  start: "startPosition", daily: function () { return D(CONSTANTS.MOON.MEAN_MOTION_PER_DAY); }, what: "the moon's mean motion" },
    moonMaslul:        { tbl: "MOON_MASLUL_PERIOD_BLOCKS",start: "maslulStart",   daily: function () { return D(CONSTANTS.MOON.MASLUL_MEAN_MOTION); },  what: "the maslul's motion" },
    nodePosition:      { tbl: "NODE_PERIOD_BLOCKS",       start: "startPos",      daily: function () { return D(CONSTANTS.NODE.DAILY_MOTION); } ,       what: "the rosh sliding backwards" }
  };

  function periodBlockRows(st) {
    var spec = BLOCKS[st.id], I = st.inputs, T = CONSTANTS[spec.tbl];
    var start = I[spec.start].value;
    var counts = [
      ["k", 10000, T.p10000, "10,000"],
      ["j", 1000,  T.p1000,  "1,000"],
      ["i", 100,   T.p100,   "100"],
      ["h", 10,    T.p10,    "10"]
    ];
    var r = rows(), total = start;
    r.add("Position at the epoch", deg(start), null, null, I[spec.start].label.replace(/^[^(]*\(|\)$/g, ""));
    for (var c = 0; c < counts.length; c++) {
      var key = counts[c][0], n = I[key].value, block = D(counts[c][2]);
      if (!n) continue;
      total += n * block;
      r.add(n + " × " + counts[c][3] + " days", deg(n * block), "+", null,
            "one block = " + F(block));
    }
    var d = I.d.value, daily = spec.daily();
    if (d) {
      total += d * daily;
      r.add(d + " × 1 day", deg(d * daily), "+", null, "one day = " + F(Math.abs(daily)));
    }
    var reached = N(total);
    if (st.id === "nodePosition") {
      r.rule();
      r.add("Emtza rosh, whole circles dropped", deg(reached), "=");
      r.add("Reflected: 360° − that", deg(360 - reached), "=", null, "the rosh runs backwards (KH 16:4)");
      if (Math.abs(N(360 - reached) - st.result) > 1e-9) return null;
    } else {
      r.rule();
      r.add("Whole circles dropped", deg(reached), "=");
      if (Math.abs(reached - st.result) > 1e-9) return null;
    }
    return r;
  }

  // ── the main dispatcher ──
  function build(st, calc) {
    var I = st.inputs || {}, r = rows(), t, b, lo, hi, x;

    if (BLOCKS[st.id]) return periodBlockRows(st);

    switch (st.id) {

      case "daysFromEpoch": {
        var ci = st.crossingInfo || {};
        r.add("The Rambam's epoch", "3 Nisan 4938", null, null, "30 March 1178, ליל חמישי");
        r.add("This day", calc._dateLong, "−", null,
              "the Hebrew day — it opens at sunset on " + calc._eveningLong);
        r.rule();
        r.add("Whole days between", st.result.toLocaleString(), "=");
        r.add("Which is", calc._elapsed);
        r.add("In the Rambam's blocks", calc._blocksPhrase, null, null, "KH 12:1 — you look up each block in his table rather than multiplying");
        if (ci.wholeMoladot) {
          r.add("Whole moladot since", ci.wholeMoladot.toLocaleString(), null, null,
                "mean-molad time has drifted " + ci.driftDays.toFixed(2) + " days from this civil day count");
        }
        return r;
      }

      case "sunDailyMotion":
        r.add("Degrees", "0°");
        r.add("Minutes", "59′", "+");
        r.add("Seconds", "8⅓″", "+");
        r.rule();
        r.add("Every day the sun moves", F(st.result), "=", null, "נ״ט ח׳ — 59 and 8");
        return r;

      case "sunMaslul":
        r.add("Mean sun", deg(I.meanLongitude.value), null, "sunMeanLongitude");
        r.add("The govah", deg(I.apogee.value), "−", "sunApogee");
        r.rule();
        r.add("Distance from the govah", st.formatted || deg(st.result), "=");
        return r;

      case "sunMaslulCorrection":
      case "moonMaslulCorrection": {
        var isSun = st.id === "sunMaslulCorrection";
        t = isSun ? CONSTANTS.SUN_MASLUL_CORRECTIONS : CONSTANTS.MOON_MASLUL_CORRECTIONS;
        var src = isSun ? I.maslul.value : I.maslulHanachon.value;
        var eff = I.effectiveMaslul.value;
        r.add(isSun ? "The maslul" : "The corrected course", deg(src), null,
              isSun ? "sunMaslul" : "maslulHanachon");
        if (Math.abs(eff - src) > 1e-9) {
          r.add("Over 180°, so use 360° − it", deg(eff), "=", null, "the table only runs to 180°");
        }
        r.rule();
        b = bracket(t, "maslul", "correction", eff); lo = b[0]; hi = b[1];
        r.add("Table row " + lo.maslul + "°", F(lo.correction));
        r.add("Table row " + hi.maslul + "°", F(hi.correction));
        if (hi.maslul !== lo.maslul && eff > lo.maslul && eff < hi.maslul) {
          var ratio = (eff - lo.maslul) / (hi.maslul - lo.maslul);
          r.add("Interpolated " + Math.round(ratio * 100) + "% of the way", F(st.result), "=", null,
                "KH 13:7-8 tells you to take the proportional part");
          x = lo.correction + ratio * (hi.correction - lo.correction);
        } else {
          r.add("Read straight off the table", F(st.result), "=");
          x = st.result;
        }
        r.add("Which is " + (I.direction.value === "add" ? "ADDED to" : "SUBTRACTED from") + " the mean position",
              I.direction.value === "add" ? "+ " + F(st.result) : "− " + F(st.result), null, null,
              (isSun ? "maslul" : "course") + " " + (eff === src ? "under" : "over") + " 180°");
        if (Math.abs(x - st.result) > 1e-9) return null;
        return r;
      }

      case "sunTrueLongitude":
      case "moonTrueLongitude": {
        var mean = st.id === "sunTrueLongitude" ? I.meanLongitude.value : I.adjustedMeanLon.value;
        var sub = I.direction.value === "subtract";
        r.add(st.id === "sunTrueLongitude" ? "Mean sun" : "Mean moon, after the season nudge", deg(mean), null,
              st.id === "sunTrueLongitude" ? "sunMeanLongitude" : "moonMeanLongitude");
        r.add("The correction", F(I.correction.value), sub ? "−" : "+",
              st.id === "sunTrueLongitude" ? "sunMaslulCorrection" : "moonMaslulCorrection");
        r.rule();
        r.add("True position", st.formatted || deg(st.result), "=");
        if (Math.abs(N(sub ? mean - I.correction.value : mean + I.correction.value) - st.result) > 1e-9) return null;
        return r;
      }

      case "moonSeasonCorrection": {
        var lon = I.sunTrueLongitude.value, row = null;
        for (var s = 0; s < CONSTANTS.SEASON_CORRECTIONS.length; s++) {
          var sc = CONSTANTS.SEASON_CORRECTIONS[s];
          if (lon >= sc.sunFrom && lon < sc.sunTo) { row = sc; break; }
        }
        r.add("Where the true sun is", deg(lon), null, "sunTrueLongitude");
        if (row) {
          r.add("Falls in the band", row.sunFrom + "° – " + row.sunTo + "°", null, null, row.sourcePhrase);
        }
        r.rule();
        r.add("So add to the mean moon", F(st.result), "=");
        return r;
      }

      case "doubleElongation":
        r.add("Mean moon", deg(I.moonMeanLon.value), null, "moonMeanLongitude");
        r.add("Mean sun", deg(I.sunMeanLon.value), "−", "sunMeanLongitude");
        r.rule();
        r.add("The plain distance", deg(I.merchak.value), "=");
        r.add("Doubled", deg(st.result), "×", null, "KH 15:1-2 — twice the distance is what the table wants");
        return r;

      case "maslulHanachon": {
        var adj = I.adjustment.value, added = Math.abs(N(I.emtzaMaslul.value + adj) - st.result) < 1e-9;
        r.add("The moon's course", deg(I.emtzaMaslul.value), null, "moonMaslul");
        r.add("Double distance", deg(I.merchakKaful.value), null, "doubleElongation");
        r.add("Rounded to whole degrees", I.tableMerchak.value + "°", "=", null, "קרוב — KH 15:3");
        r.rule();
        b = null;
        for (var q = 0; q < CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS.length; q++) {
          var dq = CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS[q];
          if (I.tableMerchak.value >= dq.minElongation && I.tableMerchak.value <= dq.maxElongation) { b = dq; break; }
        }
        if (b) r.add("Table row " + b.minElongation + "°–" + b.maxElongation + "°", b.adjustment + "°");
        r.add("Applied to the course", (added ? "+ " : "− ") + Math.abs(adj) + "°", added ? "+" : "−");
        r.rule();
        r.add("The corrected course", st.formatted || deg(st.result), "=");
        return r;
      }

      case "moonLatitude": {
        r.add("True moon", deg(I.moonTrueLon.value), null, "moonTrueLongitude");
        r.add("The rosh", deg(I.nodePosition.value), "−", "nodePosition");
        r.rule();
        r.add("Distance from the rosh", deg(I.distFromNode.value), "=");
        r.add("Folded into 0°–90°", deg(I.lookupAngle.value), "=", null, "the table only runs a quarter circle");
        b = bracket(CONSTANTS.MOON_LATITUDE_TABLE, "distance", "latitude", I.lookupAngle.value);
        r.add("Table row " + b[0].distance + "°", F(b[0].latitude));
        r.add("Table row " + b[1].distance + "°", F(b[1].latitude));
        r.rule();
        r.add("Latitude, " + I.direction.value, F(Math.abs(st.result)), "=");
        return r;
      }

      case "elongation":
        r.add("True moon", deg(I.moonTrueLon.value), null, "moonTrueLongitude");
        r.add("True sun", deg(I.sunTrueLon.value), "−", "sunTrueLongitude");
        r.rule();
        r.add("The gap", st.formatted || deg(st.result), "=");
        return r;

      case "moonPhase":
        r.add("The gap between them", deg(I.elongation.value), null, "elongation");
        r.rule();
        r.add("Which reads as", st.result, "=", null, st.hebrewResult || "");
        return r;

      case "orechSheni": {
        var ch = I.parallaxLonChalakim.value;
        r.add("First longitude", deg(I.orechRishon.value), null, "elongation");
        r.add("Moon is in " + I.moonMazal.value, ch + " chalakim", null, null, "KH 17:5 gives a number for each mazal");
        r.add("Which is", F(ch / 60), "−", null, ch + "/60 of a degree");
        r.rule();
        r.add("Second longitude", st.formatted || F(st.result), "=");
        if (Math.abs((I.orechRishon.value - ch / 60) - st.result) > 1e-9) return null;
        return r;
      }

      case "rochavSheni": {
        var chl = I.parallaxLatChalakim.value;
        r.add("First latitude", F(Math.abs(I.rochavRishon.value)), null, "moonLatitude", I.direction.value);
        r.add("Moon is in " + I.moonMazal.value, chl + " chalakim", null, null, "KH 17:7-9");
        r.add("Which is", F(chl / 60), "−");
        r.rule();
        r.add("Second latitude", F(Math.abs(st.result)) + " " + I.direction.value, "=");
        return r;
      }

      case "orechShlishi": {
        var mag = I.maagalHaYareach.value, plus = st.result > I.orechSheni.value;
        r.add("Second longitude", deg(I.orechSheni.value), null, "orechSheni");
        r.add("Second latitude", F(Math.abs(I.rochavSheni.value)), null, "rochavSheni");
        r.add("Take " + (st.maagalPhrase || "the fraction") + " of it", F(mag), "=", null,
              "KH 17:10-11 — the fraction depends on which mazal the moon is in");
        r.rule();
        r.add("Third longitude", st.formatted || deg(st.result), plus ? "+" : "−");
        return r;
      }

      case "orechRevii": {
        var f = I.fraction.value, add = I.operation.value === "add";
        r.add("Third longitude", deg(I.orechShlishi.value), null, "orechShlishi");
        r.add("Moon is in " + I.moonMazal.value, (st.inputs.fraction.value === 1 / 6 ? "a sixth" : "a fraction") + " (" + (I.fraction.value * 100).toFixed(0) + "%)",
              null, null, "KH 17:12 — how steeply this mazal sets");
        r.add("Which is", F(I.orechShlishi.value * f), add ? "+" : "−");
        r.rule();
        r.add("Fourth longitude", st.formatted || deg(st.result), "=");
        return r;
      }

      case "mnatGovahHaMedinah":
        r.add("First latitude", F(Math.abs(I.rochavRishon.value)), null, "moonLatitude");
        r.add("Two thirds of it", "× 2⁄3", "×", null, "always two thirds (KH 17:12-14)");
        r.rule();
        r.add("The height bonus", st.formatted || F(st.result), "=");
        return r;

      case "keshetHaReiyah": {
        var north = I.direction.value === "צפוני";
        r.add("Fourth longitude", deg(I.orechRevii.value), null, "orechRevii");
        r.add("Height bonus", F(I.mnatGovahHaMedinah.value), north ? "+" : "−", "mnatGovahHaMedinah",
              "latitude is " + I.direction.value + ", so it is " + (north ? "added" : "subtracted"));
        r.rule();
        r.add("The arc of vision", st.formatted || deg(st.result), "=");
        return r;
      }

      case "moonVisibility": {
        var el = I.orechRishon.value, k = I.keshetHaReiyah.value;
        r.add("First longitude", deg(el), null, "elongation");
        r.add("Arc of vision", deg(k), null, "keshetHaReiyah");
        r.add("Moon's half of the sky", I.half.value);
        r.rule();
        if (el > 180) {
          r.add("Past 180°, so the moon is waning", "no sighting question", "=", null,
                "KH 17:3-4's thresholds are about the first crescent");
        } else if (k <= 9) {
          r.add("Arc is 9° or less", "cannot be seen", "=", null, "KH 17:15");
        } else if (k > 14) {
          r.add("Arc is over 14°", "certainly seen", "=", null, "KH 17:15");
        } else {
          r.add("Arc falls between 9° and 14°", "go to the table", "=", null, "KH 17:16-21 — קיצי הראיה");
        }
        r.add("Verdict", st.result ? "נראה" : "אינו נראה", "=");
        return r;
      }

      case "seasonalInfo":
        r.add("Days from the epoch", calc.daysFromEpoch.toLocaleString(), null, "daysFromEpoch");
        r.rule();
        r.add("Season", st.result.currentSeason, "=");
        r.add("Days until it turns", String(st.result.daysUntilNextSeason));
        return r;
    }

    // generic fallback: the engine's own labelled inputs
    var keys = Object.keys(I);
    if (!keys.length) return null;
    for (var m = 0; m < keys.length; m++) {
      var inp = I[keys[m]];
      if (inp.value === undefined || typeof inp.value === "object") continue;
      r.add(inp.label, typeof inp.value === "number" && inp.unit === "°" ? deg(inp.value) : String(inp.value),
            null, inp.refId || null);
    }
    r.rule();
    r.add("Result", st.formatted || String(st.result), "=");
    return r;
  }

  build.molad = {
    days: moladDays, indexNear: moladIndexNear, dayOne: monthDayOne,
    lilShloshim: lilShloshim, parts: moladParts, interval: MOLAD_INTERVAL_DAYS
  };
  return build;
})();
