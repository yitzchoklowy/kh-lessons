  /* ליל הראייה — the one night the question is ever asked.

     The month begins on the day the crescent was seen, so day one is the first
     evening after the molad on which this same calculation says it showed; and
     ליל ל׳ is twenty-nine nights on from it — the night that opens the thirtieth
     day, the night the court sits. (The real court's day one came from
     witnesses; this is the calculation standing in for them.)

     Every night between two of these is a night he never asks about, which is
     why the instrument steps from one to the next. */
  var LIL_MOLAD_FIRST = -1.9307;                        // molad ניסן of the עיקר year
  var LIL_INTERVAL = 29 + 12 / 24 + 793 / (24 * 1080);  // כ״ט י״ב תשצ״ג — KH 6:3

  function moladDayAt(i) { return LIL_MOLAD_FIRST + i * LIL_INTERVAL; }
  function moladNear(day) { return Math.round((day - LIL_MOLAD_FIRST) / LIL_INTERVAL); }

  var lilCache = {};
  function lilAt(i) {
    if (lilCache[i] !== undefined) return lilCache[i];
    var from = Math.floor(moladDayAt(i)), found = from + 2;
    for (var d = from + 1; d <= from + 5; d++) {
      if (runPipeline(new Date(EPOCH_MS + d * 86400000)).moon.isVisible) { found = d; break; }
    }
    lilCache[i] = found + 29;
    return lilCache[i];
  }

  function nextLil(day) {
    var i = moladNear(day);
    for (var k = -3; k <= 4; k++) { var d = lilAt(i + k); if (d > day) return d; }
    return day;
  }
  function prevLil(day) {
    var i = moladNear(day);
    for (var k = 4; k >= -4; k--) { var d = lilAt(i + k); if (d < day) return d; }
    return day;
  }
  function isLil(day) {
    var i = moladNear(day);
    for (var k = -2; k <= 2; k++) if (lilAt(i + k) === day) return true;
    return false;
  }
