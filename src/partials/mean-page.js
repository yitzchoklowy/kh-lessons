  /* Every אמצע page is the same lesson: his table of blocks in one box, the
     wheel beside it swept from the epoch by whichever row is pressed, and a
     drill. A page supplies SPEC and his words; everything else is here, so a
     change lands on all of them at once.

       SPEC = {
         chartTitle, ref,          the box
         table, daily,             the engine's own table and daily rate
         signs,                    his סימנים, one per row
         startLabel,               where he starts, in his words
         step(day),                the engine step this page is about
         result                    the name of what falls out
       }
  */
  var ROW_LABELS = ["1 יום", "10 ימים", "100 יום", "1,000 יום", "10,000 יום",
                    "29 יום", "354 יום · שנה סדורה"];
  var ROW_SECTIONS = { 0: "מהלכו ביום אחד", 1: "מהלכו לימים רבים", 5: "לחודש ולשנה" };
  var REMAINDER_FROM = 2;          // his שארית starts at the hundred — the first past a circle

  function pageReady() {
    playing = false;
    if (el.play) el.play.textContent = "▶ Turn";
    setDay(1);

    renderBlockChart(document.getElementById("chart"), {
      title: SPEC.chartTitle, ref: SPEC.ref, note: "",
      heads: ["בכמה", "מהלך"], plain: true, pick: true, heb: true,
      labels: ROW_LABELS, signs: SPEC.signs,
      sections: ROW_SECTIONS, remainderFrom: REMAINDER_FROM,
      blocks: CONSTANTS[SPEC.table], daily: SPEC.daily,
      startLabel: SPEC.startLabel, step: SPEC.step
    });
    var first = document.querySelector("tr[data-days]");
    if (first) first.classList.add("on");

    drill(document.getElementById("drill"), {
      title: "עשה אתה", ref: SPEC.ref, note: "",
      newCase: function () {
        var d = 280000 + Math.floor(Math.random() * 60000);
        return { day: d, step: SPEC.step(d) };
      },
      caseLine: function (c) { return "מן העיקר <b>" + c.day.toLocaleString() + "</b> ימים."; },
      steps: blockDrillSteps(SPEC.table, SPEC.daily, SPEC.signs[0], SPEC.result)
    });
  }
