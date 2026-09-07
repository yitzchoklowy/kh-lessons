  /* A list the Rambam gives as rows — the nine additions of KH 15:3, the מנות
     of KH 15:6, the latitudes of KH 16:11. Printed as he prints it: every row
     he names, in his order, and traced — the row the day's figure lands on,
     or the two rows it falls between when he tells you to take the part.

       renderListChart(host, {
         title, ref, note,
         heads: [right, left],
         rows: [{ in, sub, out }]        every string built from CONSTANTS
       })
       traceListChart(host, hits, sum)   hits: [{ i, tag }] · sum: html
  */
  function renderListChart(host, spec) {
    var h = '<div class="rc-head"><h4>' + spec.title + "</h4>" +
            '<span class="rc-ref">' + spec.ref + "</span></div>";
    if (spec.note) h += '<p class="rc-note">' + spec.note + "</p>";
    h += '<div class="rc-scroll"><table><thead><tr><th>' + spec.heads[0] +
         "</th><th>" + spec.heads[1] + "</th><th></th></tr></thead><tbody>";
    for (var i = 0; i < spec.rows.length; i++) {
      var r = spec.rows[i];
      h += '<tr data-row="' + i + '"><td class="in">' + r.in +
           (r.sub ? "<small>" + r.sub + "</small>" : "") + "</td>" +
           '<td class="moves">' + r.out + '</td><td class="use"></td></tr>';
    }
    h += '</tbody></table></div><div class="rc-sum" data-sum></div>';
    host.innerHTML = h;
    host.className = "rchart";
  }

  function traceListChart(host, hits, sum) {
    var rows = host.querySelectorAll("tbody tr");
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.remove("on");
      rows[i].querySelector(".use").textContent = "";
    }
    for (var k = 0; k < hits.length; k++) {
      var tr = rows[hits[k].i];
      if (!tr) continue;
      tr.classList.add("on");
      tr.querySelector(".use").textContent = hits[k].tag;
    }
    host.querySelector("[data-sum]").innerHTML = sum;
  }

  /* His figures, written the way he writes them: whole degrees where the row is
     whole degrees, degrees and minutes where he gives minutes. Reads the value
     off the engine — nothing here is transcribed. */
  function degMin(x) {
    var d = Math.floor(x + 1e-9), m = Math.round((x - d) * 60);
    if (m === 60) { d++; m = 0; }
    return d ? d + "°" + (m ? " " + m + "′" : "") : m + "′";
  }
