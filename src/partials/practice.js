  /* Practice: the reader works the Rambam's calculation themselves, one piece at
     a time. Steps unlock in order, so nothing is answered before the thing it
     rests on. Every expected answer is produced by the engine at check time —
     never stored in the page — so a drill cannot drift from the lesson above it.

       drill(host, {
         title, ref, note,
         newCase()          → an object describing a fresh case (usually { day })
         caseLine(c)        → the html shown above the questions
         steps: [{
           ask(c)           → the question, as html
           type             → "int" | "dms" | "pick"
           choices(c)       → for "pick": [{ label, value }]
           answer(c)        → the expected value: a number, or degrees for "dms"
           unit             → suffix for "int"
           hint(c)          → shown by "Show me", before the answer
           after(c)         → what it means, shown once the step is settled
         }]
       }
  */
  function drill(host, spec) {
    var c = null, settled = 0, right = 0, asked = 0;

    function dmsInputs(i) {
      return '<input id="a' + i + 'd" type="number" step="1" placeholder="מעלות"><span class="unit">°</span>' +
             '<input id="a' + i + 'm" type="number" step="1" placeholder="חלקים"><span class="unit">′</span>' +
             '<input id="a' + i + 's" type="number" step="1" placeholder="שניות"><span class="unit">″</span>';
    }

    function render() {
      var h = '<div class="dr-head"><h3>' + spec.title + '</h3><span class="dr-ref">' + spec.ref + "</span></div>" +
              '<p class="dr-note">' + spec.note + "</p>" +
              '<div class="dr-case">' + spec.caseLine(c) + "</div>";
      for (var i = 0; i < spec.steps.length; i++) {
        var s = spec.steps[i];
        h += '<div class="dr-step" data-i="' + i + '" data-state="' + (i === 0 ? "open" : "locked") + '">' +
             '<div class="dr-ask"><span class="dr-n">' + (i + 1) + '.</span><span class="dr-q">' + s.ask(c) + "</span></div>" +
             '<div class="dr-row">';
        if (s.type === "pick") {
          var ch = s.choices(c);
          for (var k = 0; k < ch.length; k++) {
            h += '<button type="button" class="pick" data-pick="' + k + '" aria-pressed="false">' + ch[k].label + "</button>";
          }
        } else if (s.type === "dms") {
          h += dmsInputs(i);
        } else {
          h += '<input id="a' + i + '" type="number" step="any" class="wide">' +
               (s.unit ? '<span class="unit">' + s.unit + "</span>" : "");
        }
        h += '<button type="button" class="check">בדוק</button>' +
             '<button type="button" class="tell">הראה לי</button></div>' +
             '<div class="dr-say" hidden></div></div>';
      }
      h += '<div class="dr-foot"><button type="button" class="again">יום אחר</button>' +
           '<span class="score"></span></div>';
      host.innerHTML = h;
      host.className = "drill";
      wire();
      score();
    }

    function stepEl(i) { return host.querySelector('.dr-step[data-i="' + i + '"]'); }

    function say(i, cls, html) {
      var el = stepEl(i).querySelector(".dr-say");
      el.className = "dr-say " + cls;
      el.innerHTML = html;
      el.hidden = false;
    }

    function settle(i, got) {
      var s = spec.steps[i], el = stepEl(i);
      el.dataset.state = "done";
      el.querySelector(".check").disabled = true;
      if (i + 1 < spec.steps.length) stepEl(i + 1).dataset.state = "open";
      settled++;
      if (got) right++;
      score();
    }

    function score() {
      host.querySelector(".score").textContent =
        settled ? right + " / " + settled + " נכונים" : spec.steps.length + " חלקים";
    }

    function read(i) {
      var s = spec.steps[i];
      if (s.type === "dms") {
        var d = host.querySelector("#a" + i + "d").value,
            m = host.querySelector("#a" + i + "m").value,
            sec = host.querySelector("#a" + i + "s").value;
        if (d === "" && m === "" && sec === "") return null;
        return (Number(d) || 0) + (Number(m) || 0) / 60 + (Number(sec) || 0) / 3600;
      }
      if (s.type === "pick") {
        var b = stepEl(i).querySelector('.pick[aria-pressed="true"]');
        return b ? Number(b.dataset.pick) : null;
      }
      var v = host.querySelector("#a" + i).value;
      return v === "" ? null : Number(v);
    }

    function check(i) {
      var s = spec.steps[i], mine = read(i);
      if (mine === null) { say(i, "told", "מלא תחילה."); return; }
      var want = s.answer(c), tail = s.after ? '<span class="why">' + s.after(c) + "</span>" : "";

      if (s.type === "pick") {
        var ch = s.choices(c), ok = ch[mine].value === want;
        if (ok) { say(i, "ok", "יפה — <b>" + ch[mine].label + "</b>." + tail); settle(i, true); }
        else {
          var wanted = ch.filter(function (x) { return x.value === want; })[0];
          say(i, "no", "לא זו. והוא <b>" + (wanted ? wanted.label : String(want)) + "</b>." + tail);
          settle(i, false);
        }
        return;
      }
      if (s.type === "dms") {
        var off = Math.abs(mine - want);
        if (off < 1 / 60) { say(i, "ok", "יפה — <b>" + formatDms(want) + "</b>." + tail); settle(i, true); }
        else if (off < 0.5) {
          say(i, "near", "קרוב מאד. והוא <b>" + formatDms(want) + "</b> — you were " +
              formatDms(off) + "." + tail);
          settle(i, true);
        } else {
          say(i, "no", "והוא <b>" + formatDms(want) + "</b> — you were " + formatDms(off) + "." + tail);
          settle(i, false);
        }
        return;
      }
      if (mine === want) { say(i, "ok", "יפה — <b>" + want.toLocaleString() + "</b>." + tail); settle(i, true); }
      else { say(i, "no", "והוא <b>" + want.toLocaleString() + "</b>." + tail); settle(i, false); }
    }

    function tell(i) {
      var s = spec.steps[i], el = stepEl(i);
      if (el.dataset.state === "done") return;
      if (s.hint && !el.dataset.hinted) { el.dataset.hinted = "1"; say(i, "told", s.hint(c)); return; }
      var want = s.answer(c);
      var shown = s.type === "dms" ? formatDms(want)
        : s.type === "pick" ? (s.choices(c).filter(function (x) { return x.value === want; })[0] || {}).label
        : want.toLocaleString();
      say(i, "told", "והוא <b>" + shown + "</b>." +
          (s.after ? '<span class="why">' + s.after(c) + "</span>" : ""));
      settle(i, false);
    }

    function wire() {
      host.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        if (b.classList.contains("again")) { start(); return; }
        var st = b.closest(".dr-step");
        if (!st) return;
        var i = Number(st.dataset.i);
        if (b.classList.contains("pick")) {
          var all = st.querySelectorAll(".pick");
          for (var k = 0; k < all.length; k++) all[k].setAttribute("aria-pressed", String(all[k] === b));
        } else if (b.classList.contains("check")) check(i);
        else if (b.classList.contains("tell")) tell(i);
      });
      host.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        var st = e.target.closest(".dr-step");
        if (st) { e.preventDefault(); check(Number(st.dataset.i)); }
      });
    }

    function start() { c = spec.newCase(); settled = 0; right = 0; render(); }
    start();
  }
