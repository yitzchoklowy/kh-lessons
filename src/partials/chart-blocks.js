  /* The Rambam's motion tables (KH 12:1–2, 14:1–3, 16:2), printed as he gives
     them — every row he lists, in his order, at his precision — with a trace of
     exactly which rows the current day count draws on and what each contributes.
     The values come from the engine's constants, never from a copy here. */
  function renderBlockChart(host, spec) {
    var B = spec.blocks;
    var L = spec.labels || ["1 day", "10 days", "100 days", "1,000 days", "10,000 days",
                            "29 days", "a regular year"];
    var G = spec.signs || [];
    var rows = [
      { key: "d", label: L[0], mult: 1,     v: dmsToDecimal(spec.daily), sign: G[0] },
      { key: "h", label: L[1], mult: 10,    v: dmsToDecimal(B.p10),      sign: G[1] },
      { key: "i", label: L[2], mult: 100,   v: dmsToDecimal(B.p100),     sign: G[2] },
      { key: "j", label: L[3], mult: 1000,  v: dmsToDecimal(B.p1000),    sign: G[3] },
      { key: "k", label: L[4], mult: 10000, v: dmsToDecimal(B.p10000),   sign: G[4] },
      { key: null, label: L[5], v: dmsToDecimal(B.p29),  sign: G[5], note: spec.labels ? "" : "a whole month at a step" },
      { key: null, label: L[6], v: dmsToDecimal(B.p354), sign: G[6], note: spec.labels ? "" : "354 days at a step" }
    ];
    var H = spec.heads || ["in", "it moves", "this count"];
    var plain = !!spec.plain;          // his table only: no trace, nothing that moves
    var h = '<div class="rc-head"><h4>' + spec.title + '</h4><span class="rc-ref">' + spec.ref + "</span></div>" +
            (spec.note ? '<p class="rc-note">' + spec.note + "</p>" : "") +
            '<div class="rc-scroll"><table><thead><tr><th>' + H[0] + "</th><th>" + H[1] +
            (plain ? "" : "</th><th>" + H[2]) + "</th></tr></thead><tbody>";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += '<tr data-row="' + (r.key || "spare" + i) + '"' +
           (spec.pick ? ' data-days="' + [1, 10, 100, 1000, 10000, 29, 354][i] + '"' : "") +
           (r.key ? "" : ' class="spare"') + '>' +
           '<td class="in">' + r.label + (r.note ? "<small>" + r.note + "</small>" : "") + "</td>" +
           '<td class="moves">' + formatDms(r.v) +
           (r.sign ? '<small dir="rtl">' + r.sign + "</small>" : "") + "</td>" +
           (plain ? "" : '<td class="use">' + (r.key ? "" : "—") + "</td>") + "</tr>";
    }
    h += "</tbody></table></div>" + (plain ? "" : '<div class="rc-sum" data-sum></div>');
    host.innerHTML = h;
    host.className = "rchart";
    host._rows = rows;
    host._heb = !!spec.heb;
  }

  /* `inputs` is the engine step's own inputs object, so the trace can never
     drift from the number the page is showing. */
  function startKey(I) {
    return I.startPosition ? "startPosition" : I.maslulStart ? "maslulStart"
         : I.apogeeStart ? "apogeeStart" : "startPos";
  }

  function traceBlockChart(host, inputs, step, startLabel) {
    var rows = host._rows, parts = [], total = inputs[startKey(inputs)].value;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], td = host.querySelectorAll("tbody tr")[i];
      var n = r.key ? inputs[r.key].value : 0;
      td.classList.toggle("on", !!n);
      if (r.key) {
        td.querySelector(".use").textContent = n ? "× " + n + "  =  " + formatDms(normalizeDegrees(n * r.v)) : "×0";
        if (n) { total += n * r.v; parts.push(n + " × " + r.mult.toLocaleString()); }
      }
    }
    host.querySelector("[data-sum]").innerHTML = host._heb
      ? "מתחיל ב־<b>" + startLabel + "</b>, מוסיף כל שורה, ומשליך הגלגלים השלמים: <b>" +
        step.formatted + "</b>" +
        '<span class="eq">' + inputs.daysFromBase.value.toLocaleString() + " = " + parts.join("  +  ") + "</span>"
      : "Start at <b>" + startLabel + "</b>, add every row above, drop the whole circles: <b>" +
        step.formatted + "</b>" +
        '<span class="eq">' + inputs.daysFromBase.value.toLocaleString() + " days  =  " +
        parts.join("  +  ") + "</span>";
  }

  /* The running-total ledger for any block-built figure: start, every row added,
     every whole circle explicitly thrown away, and the total that falls out.
     Recomputes independently and returns null if it disagrees with the engine. */
  function blockLedger(step, tbl, dailyDms, startLabel, heb) {
    var SIZES = heb
      ? [["k", 10000, "עשרת אלפים יום"], ["j", 1000, "אלף יום"], ["i", 100, "מאה יום"], ["h", 10, "עשרה ימים"]]
      : [["k", 10000, "10,000"], ["j", 1000, "1,000"], ["i", 100, "100"], ["h", 10, "10"]];
    var W = heb
      ? { at: "בעיקר", each: "לכל אחד", shed: "השלך", circles: "גלגלים שלמים", circle: "גלגל שלם", day: "יום" }
      : { at: "Position at the epoch", each: "each", shed: "throw away", circles: "whole circles", circle: "whole circle", day: "day" };
    var I = step.inputs, T = CONSTANTS[tbl], rows = [];
    var total = I[startKey(I)].value;
    function shed() {
      while (total >= 360) {
        var n = Math.floor(total / 360); total -= n * 360;
        rows.push({ l: W.shed + " " + n + " " + (n > 1 ? W.circles : W.circle),
                    a: "− " + n * 360 + "°", t: formatDms(total), drop: true });
      }
    }
    rows.push({ l: W.at, s: startLabel, t: formatDms(total) });
    for (var b = 0; b < SIZES.length; b++) {
      var n = I[SIZES[b][0]].value; if (!n) continue;
      var one = dmsToDecimal(T["p" + SIZES[b][1]]);
      total += n * one;
      rows.push({ l: heb ? SIZES[b][2] + " × " + n : n + " × " + SIZES[b][2] + " days",
                  s: formatDms(one) + " " + W.each, a: "+ " + formatDms(n * one), t: formatDms(total) });
      shed();
    }
    if (I.d.value) {
      var day1 = dmsToDecimal(dailyDms);
      total += I.d.value * day1;
      rows.push({ l: heb ? W.day + " × " + I.d.value : I.d.value + " × 1 day",
                  s: formatDms(day1) + " " + W.each, a: "+ " + formatDms(I.d.value * day1), t: formatDms(total) });
      shed();
    }
    if (Math.abs(total - step.result) > 1e-9) {
      return [{ l: heb ? "החשבון אינו מסכים עם המנוע" : "recomputation disagreed with the engine", t: "" }];
    }
    rows.push({ l: step.hebrewName, t: step.formatted, out: true });
    return rows;
  }

  /* The six pieces of a block calculation, as a drill: decompose the day count,
     then finish the figure in degrees, minutes and seconds. */
  function blockDrillSteps(tbl, dailyDms, dailyLabel, resultHeb) {
    var SIZES = [["k", 10000, "10,000"], ["j", 1000, "1,000"], ["i", 100, "100"], ["h", 10, "10"]];
    var out = SIZES.map(function (b, n) {
      return {
        ask: function () {
          return "How many whole blocks of <b>" + b[2] + " days</b> are in it" +
            (n ? ", after the bigger blocks are taken out" : "") + "?";
        },
        type: "int",
        answer: function (c) { return c.step.inputs[b[0]].value; },
        hint: function () { return "Divide, keep the whole number; the remainder goes to the next row down."; },
        after: function (c) {
          var one = dmsToDecimal(CONSTANTS[tbl]["p" + b[1]]);
          return "That row is " + formatDms(one) + " each, so it brings " +
            formatDms(normalizeDegrees(c.step.inputs[b[0]].value * one)) + ".";
        }
      };
    });
    out.push({
      ask: function () { return "And how many single days are left over?"; },
      type: "int",
      answer: function (c) { return c.step.inputs.d.value; },
      after: function (c) {
        return "At " + dailyLabel + " a day, those bring " +
          formatDms(normalizeDegrees(c.step.inputs.d.value * dmsToDecimal(dailyDms))) + ".";
      }
    });
    out.push({
      ask: function () {
        return "Add the starting place and every row, drop the whole circles. What is " +
          '<span dir="rtl">' + resultHeb + "</span>?";
      },
      type: "dms",
      answer: function (c) { return c.step.result; },
      hint: function () { return "Add them all up first; only then take the circles off."; },
      after: function (c) {
        var z = zodiacPosition(c.step.result);
        return "Which puts it " + z.ordinalDegree + "° into " + z.hebrew + ".";
      }
    });
    return out;
  }
