  /* KH 14:5 as the Rambam lists it: eight bands, starting from mid-Pisces and
     running forward through the mazalos. The engine stores nine rows because the
     first one wraps past 0°; the two halves are shown joined here, the way he
     says it, with the split noted. Values come from the engine's table. */
  function renderBandChart(host, title, ref, note) {
    var B = CONSTANTS.SEASON_CORRECTIONS;
    var order = [], seenWrap = false;
    for (var i = 0; i < B.length; i++) {
      if (B[i].sunFrom === 345 || B[i].sunFrom === 0) {
        if (seenWrap) continue;
        seenWrap = true;
        order.push({ from: 345, to: 15, wrap: true, adj: B[i].adjustment, phrase: B[i].sourcePhrase });
      } else {
        order.push({ from: B[i].sunFrom, to: B[i].sunTo, adj: B[i].adjustment, phrase: B[i].sourcePhrase });
      }
    }
    order.sort(function (a, b) { return (a.wrap ? -1 : b.wrap ? 1 : a.from - b.from); });

    var h = '<div class="rc-head"><h4>' + title + '</h4><span class="rc-ref">' + ref + "</span></div>" +
            '<p class="rc-note">' + note + "</p>" +
            "<table><thead><tr><th>when the sun is</th><th>do this</th><th>today</th></tr></thead><tbody>";
    for (var j = 0; j < order.length; j++) {
      var b = order[j];
      h += '<tr data-band="' + b.from + '"><td class="in"><span dir="rtl">' +
           b.phrase.replace(/\s*\([^)]*\)\s*$/, "") + "</span>" +
           "<small>" + b.from + "° – " + b.to + "°" + (b.wrap ? " (across 0°)" : "") + "</small></td>" +
           '<td class="moves">' + (b.adj === 0 ? "leave it" :
             (b.adj > 0 ? "add " : "take off ") + Math.abs(b.adj * 60) + "′") + "</td>" +
           '<td class="use"></td></tr>';
    }
    h += "</tbody></table><div class=\"rc-sum\" data-sum></div>";
    host.innerHTML = h;
    host.className = "rchart";
    host._order = order;
  }

  function traceBandChart(host, sunLon, band, mean) {
    var rows = host.querySelectorAll("tbody tr"), order = host._order;
    for (var i = 0; i < order.length; i++) {
      var b = order[i];
      var hit = b.wrap ? (sunLon >= 345 || sunLon < 15) : (sunLon >= b.from && sunLon < b.to);
      rows[i].classList.toggle("on", hit);
      rows[i].querySelector(".use").textContent = hit ? "← the sun is here" : "";
    }
    host.querySelector("[data-sum]").innerHTML =
      "The sun stands at <b>" + formatDms(sunLon) + "</b>, so: <b>" +
      (band.adjustment === 0 ? "no change" :
        (band.adjustment > 0 ? "+" : "−") + Math.abs(band.adjustment * 60) + "′") + "</b>" +
      '<span class="eq">' + formatDms(mean) + "   →   " +
      formatDms(normalizeDegrees(mean + band.adjustment)) + "</span>";
  }
