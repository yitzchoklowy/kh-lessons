var LESSON = {
  ch: "12:2", heb: "גובה השמש", title: "The sun's far point",
  lede: "The sun's circle is not centred on us, so there is one point where it is furthest " +
        "away. That point drifts — about a degree every seventy years — and chapter 13 " +
        "measures everything from it.",
  prev: { href: "kh12-sun-mean.html", label: "the mean sun, KH 12:1" },
  next: { href: "kh13-maslul.html", label: "the maslul, KH 13:1–3" },
  step: function (d) { return calculateSunApogee(d); },
  dials: [
    { heb: "גובה השמש", en: "the far point of the sun's circle", colour: "--sun", zodiac: true,
      value: function (d, st) { return st.result; } },
    { heb: "אמצע השמש", en: "the mean sun, for comparison", colour: "--muted",
      value: function (d) { return calculateSunMeanLongitude(d).result; },
      note: function (d) {
        return "the gap between them is the maslul: " +
          formatDms(calculateSunMaslul(calculateSunMeanLongitude(d).result, calculateSunApogee(d).result).result);
      } }
  ],
  chartsNote: "The same block method, with its own — very much slower — table. Watch a year " +
              "go by and the mean sun runs right round; the govah barely stirs.",
  charts: [{
    type: "blocks", colour: "--sun",
    title: "מהלך הגובה", ref: "KH 12:2",
    note: "How far the far point drifts in each block of days.",
    blocks: CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS, daily: CONSTANTS.SUN.APOGEE_MOTION_PER_DAY,
    startLabel: "26° 45′ 8″ in תאומים",
    step: function (d) { return calculateSunApogee(d); }
  }],
  ledger: {
    colour: "--sun", title: "גובה השמש", cap: "KH 12:2 · about 1½ seconds every ten days",
    rows: function (d, st) { return blockLedger(st, "SUN_APOGEE_PERIOD_BLOCKS", CONSTANTS.SUN.APOGEE_MOTION_PER_DAY, "26° 45′ 8″ in תאומים — KH 12:2"); }
  },
  drill: {
    colour: "--sun",
    title: "Work out גובה השמש", ref: "KH 12:2",
    note: "The same six pieces, on a table where every row is tiny.",
    newCase: function () {
      var d = 280000 + Math.floor(Math.random() * 60000);
      return { day: d, step: calculateSunApogee(d) };
    },
    caseLine: function (c) {
      return "Days from the epoch: <b>" + c.day.toLocaleString() + "</b> · that is " +
        dayDate(c.day) + ". You start at <b>26° 45′ 8″</b> in תאומים.";
    },
    steps: blockDrillSteps("SUN_APOGEE_PERIOD_BLOCKS", CONSTANTS.SUN.APOGEE_MOTION_PER_DAY,
      "about 0° 0′ 0.15″", "גובה השמש")
  },
  quotes: [
    { ref: "KH 12:2", text: "“The sun's apogee moves at a very slow rate … its movement in ten days " +
      "is one and a half seconds.”",
      tail: "A degree takes about seventy years, which is why the Rambam can hand you a starting " +
            "position and a tiny table and leave it at that." }
  ],
  note: "Press <b>one year</b> and watch: the mean sun goes right round, the govah moves five seconds."
};
