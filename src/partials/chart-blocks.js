  /* The Rambam's motion tables (KH 12:1–2, 14:1–3, 16:2), printed as he gives
     them — every row he lists, in his order, at his precision — with a trace of
     exactly which rows the current day count draws on and what each contributes.
     The values come from the engine's constants, never from a copy here. */
  function renderBlockChart(host, spec) {
    var B = spec.blocks;
    var rows = [
      { key: "d", label: "1 day",         mult: 1,     v: dmsToDecimal(spec.daily) },
      { key: "h", label: "10 days",       mult: 10,    v: dmsToDecimal(B.p10) },
      { key: "i", label: "100 days",      mult: 100,   v: dmsToDecimal(B.p100) },
      { key: "j", label: "1,000 days",    mult: 1000,  v: dmsToDecimal(B.p1000) },
      { key: "k", label: "10,000 days",   mult: 10000, v: dmsToDecimal(B.p10000) },
      { key: null, label: "29 days",      note: "a whole month at a step", v: dmsToDecimal(B.p29) },
      { key: null, label: "a regular year", note: "354 days at a step",    v: dmsToDecimal(B.p354) }
    ];
    var h = '<div class="rc-head"><h4>' + spec.title + '</h4><span class="rc-ref">' + spec.ref + "</span></div>" +
            '<p class="rc-note">' + spec.note + "</p>" +
            "<table><thead><tr><th>in</th><th>it moves</th><th>this count</th></tr></thead><tbody>";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += '<tr data-row="' + (r.key || "spare" + i) + '"' + (r.key ? "" : ' class="spare"') + '>' +
           '<td class="in">' + r.label + (r.note ? "<small>" + r.note + "</small>" : "") + "</td>" +
           '<td class="moves">' + formatDms(r.v) + "</td>" +
           '<td class="use">' + (r.key ? "" : "—") + "</td></tr>";
    }
    h += '</tbody></table><div class="rc-sum" data-sum></div>';
    host.innerHTML = h;
    host.className = "rchart";
    host._rows = rows;
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
    host.querySelector("[data-sum]").innerHTML =
      "Start at <b>" + startLabel + "</b>, add every row above, drop the whole circles: <b>" +
      step.formatted + "</b>" +
      '<span class="eq">' + inputs.daysFromBase.value.toLocaleString() + " days  =  " +
      parts.join("  +  ") + "</span>";
  }

  /* The running-total ledger for any block-built figure: start, every row added,
     every whole circle explicitly thrown away, and the total that falls out.
     Recomputes independently and returns null if it disagrees with the engine. */
  function blockLedger(step, tbl, dailyDms, startLabel) {
    var SIZES = [["k", 10000, "10,000"], ["j", 1000, "1,000"], ["i", 100, "100"], ["h", 10, "10"]];
    var I = step.inputs, T = CONSTANTS[tbl], rows = [];
    var total = I[startKey(I)].value;
    function shed() {
      while (total >= 360) {
        var n = Math.floor(total / 360); total -= n * 360;
        rows.push({ l: "throw away " + n + " whole circle" + (n > 1 ? "s" : ""),
                    a: "− " + n * 360 + "°", t: formatDms(total), drop: true });
      }
    }
    rows.push({ l: "Position at the epoch", s: startLabel, t: formatDms(total) });
    for (var b = 0; b < SIZES.length; b++) {
      var n = I[SIZES[b][0]].value; if (!n) continue;
      var one = dmsToDecimal(T["p" + SIZES[b][1]]);
      total += n * one;
      rows.push({ l: n + " × " + SIZES[b][2] + " days", s: formatDms(one) + " each",
                  a: "+ " + formatDms(n * one), t: formatDms(total) });
      shed();
    }
    if (I.d.value) {
      var day1 = dmsToDecimal(dailyDms);
      total += I.d.value * day1;
      rows.push({ l: I.d.value + " × 1 day", s: formatDms(day1) + " each",
                  a: "+ " + formatDms(I.d.value * day1), t: formatDms(total) });
      shed();
    }
    if (Math.abs(total - step.result) > 1e-9) {
      return [{ l: "recomputation disagreed with the engine — hidden", t: "" }];
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
