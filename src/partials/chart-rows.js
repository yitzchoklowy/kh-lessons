  /* A lookup table the Rambam gives as a list of rows — his correction tables
     (KH 13:4, 15:6), the latitude table (16:11), and the like. Printed as he
     prints it, every row, and traced: the two rows the current value falls
     between, and the proportional part he tells you to take (KH 13:7-8). */
  function renderRowChart(host, spec) {
    var t = spec.table, h =
      '<div class="rc-head"><h4>' + spec.title + '</h4><span class="rc-ref">' + spec.ref + "</span></div>" +
      '<p class="rc-note">' + spec.note + "</p>" +
      "<table><thead><tr><th>" + spec.inHead + "</th><th>" + spec.outHead + "</th><th>this one</th></tr></thead><tbody>";
    for (var i = 0; i < t.length; i++) {
      h += '<tr data-row="' + i + '"><td class="in">' + spec.inCell(t[i]) + "</td>" +
           '<td class="moves">' + spec.outCell(t[i]) + "</td>" +
           '<td class="use"></td></tr>';
    }
    h += '</tbody></table><div class="rc-sum" data-sum></div>';
    host.innerHTML = h;
    host.className = "rchart";
  }

  function traceRowChart(host, spec, x, got) {
    var t = spec.table, rows = host.querySelectorAll("tbody tr"), lo = 0, hi = 0;
    for (var i = 0; i < t.length - 1; i++) {
      if (x >= spec.key(t[i]) && x <= spec.key(t[i + 1])) { lo = i; hi = i + 1; break; }
    }
    for (var j = 0; j < rows.length; j++) {
      var on = (j === lo || j === hi);
      rows[j].classList.toggle("on", on);
      rows[j].querySelector(".use").textContent = on ? (j === lo ? "just under" : "just over") : "";
    }
    var a = spec.key(t[lo]), b = spec.key(t[hi]);
    var part = b === a ? 0 : (x - a) / (b - a);
    host.querySelector("[data-sum]").innerHTML =
      spec.what + " is <b>" + formatDms(x) + "</b> — between the <b>" + a + "°</b> and <b>" + b +
      "°</b> rows, <b>" + Math.round(part * 100) + "%</b> of the way." +
      '<span class="eq">' + (part === 0 ? "read straight off the table" :
        "take that much of the step between them — KH 13:7-8") + "  →  " + formatDms(got) + "</span>";
  }
