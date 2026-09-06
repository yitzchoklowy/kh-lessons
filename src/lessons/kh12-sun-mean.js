var LESSON = {
  ch: "12:1", heb: "מהלך אמצע השמש", title: "The sun's mean motion",
  lede: "0° 59′ 8⅓″ a day, and a table of blocks.",
  next: { href: "kh12-govah.html", label: "the govah, KH 12:2" },
  step: function (d) { return calculateSunMeanLongitude(d); },
  dials: [
    { heb: "אמצע השמש", en: "the mean sun — where an evenly-moving sun would be",
      colour: "--sun", zodiac: true, value: function (d, st) { return st.result; } }
  ],
  chartsNote: "The rows this day count draws on are lit.",
  charts: [{
    type: "blocks", colour: "--sun",
    title: "מהלך אמצע השמש", ref: "KH 12:1",
    note: "How far the mean sun moves in each block of days.",
    blocks: CONSTANTS.SUN_MEAN_PERIOD_BLOCKS, daily: CONSTANTS.SUN.MEAN_MOTION_PER_DAY,
    startLabel: "7° 3′ 32″ in טלה",
    step: function (d) { return calculateSunMeanLongitude(d); }
  }],
  ledger: {
    colour: "--sun", title: "אמצע השמש", cap: "KH 12:1–2 · 0° 59′ 8⅓″ a day, west → east",
    rows: function (d, st) { return blockLedger(st, "SUN_MEAN_PERIOD_BLOCKS", CONSTANTS.SUN.MEAN_MOTION_PER_DAY, "7° 3′ 32″ in טלה — KH 12:2"); }
  },
  drill: {
    colour: "--sun",
    title: "Work out אמצע השמש", ref: "KH 12:1–2",
    note: "Read the rows off the table above.",
    newCase: function () {
      var d = 280000 + Math.floor(Math.random() * 60000);
      return { day: d, step: calculateSunMeanLongitude(d) };
    },
    caseLine: function (c) {
      return "Days from the epoch: <b>" + c.day.toLocaleString() + "</b> · that is " +
        dayDate(c.day) + ". You start at <b>7° 3′ 32″</b> in טלה.";
    },
    steps: blockDrillSteps("SUN_MEAN_PERIOD_BLOCKS", CONSTANTS.SUN.MEAN_MOTION_PER_DAY,
      "0° 59′ 8⅓″", "אמצע השמש")
  },
  quotes: [
    { ref: "KH 12:1", text: "“The mean progress of the sun in one day … is 59 minutes and 8 seconds, " +
      "in symbols 0° 59′ 8″.”" },
    { ref: "KH 12:2", text: "“The position of the sun's mean on Wednesday night, the third of Nisan 4938 … " +
      "was 7 degrees, 3 minutes and 32 seconds in the constellation of Aries.”" }
  ],
};
