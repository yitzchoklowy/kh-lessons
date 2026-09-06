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
  function traceBlockChart(host, inputs, step, startLabel) {
    var rows = host._rows, parts = [], total = inputs.startPosition
      ? inputs.startPosition.value : inputs.maslulStart.value;
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
