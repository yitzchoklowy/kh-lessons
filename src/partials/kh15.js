  /* Everything chapter 15 asks for, at a whole day from the עיקר. Every figure
     is the engine's own step; the pages only lay them out, so no two pages can
     disagree about what the same day gives.

       chapter15At(n) → { sunMean, moonSight, merchak, kaful, maslul,
                          add, nachon, mnat, dir, amiti }
  */
  function chapter15At(n) {
    var sunMean = calculateSunMeanLongitude(n);
    var apogee = calculateSunApogee(n);
    var sunMaslul = calculateSunMaslul(sunMean.result, apogee.result);
    var sunCorr = lookupMaslulCorrection(sunMaslul.result);
    var sunTrue = calculateSunTrueLongitude(sunMean.result, sunMaslul.result, sunCorr.result);

    var moonMean = calculateMoonMeanLongitude(n);
    var season = calculateSeasonCorrection(sunTrue.result);
    var moonSight = normalizeDegrees(moonMean.result + season.result);

    var maslul = calculateMoonMaslul(n);
    var kaful = calculateDoubleElongation(moonSight, sunMean.result);
    var nachon = calculateMaslulHanachon(maslul.result, kaful.result);

    /* "ואין מקפידין על החלקים במסלול" — KH 15:8. He folds a course past a
       hundred and eighty back off three hundred and sixty (KH 15:7), and enters
       the table with whole degrees. Both foldings are his; the lookup that
       follows is the engine's own. */
    var course = nachon.result <= 180 ? nachon.result : 360 - nachon.result;
    var asked = Math.floor(course);
    var mnat = lookupMoonMaslulCorrection(nachon.result <= 180 ? asked : 360 - asked);
    var dir = nachon.result <= 180 ? "subtract" : "add";
    var amiti = calculateMoonTrueLongitude(moonSight, nachon.result, mnat.result, dir);

    return {
      day: n,
      sunMean: sunMean.result,
      sunTrue: sunTrue.result,
      moonMean: moonMean.result,
      season: season.result,
      moonSight: moonSight,
      merchak: normalizeDegrees(moonSight - sunMean.result),
      kaful: kaful.result,
      maslul: maslul.result,
      add: nachon.inputs.adjustment.value,
      nachon: nachon.result,
      course: course,
      asked: asked,
      mnat: mnat.result,
      dir: dir,
      amiti: amiti.result
    };
  }

  /* The rows of KH 15:3 he actually gives — the engine carries two more, for
     distances past the ones a sighting can reach, and those are not his. */
  function hisAdditions() {
    return CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS.filter(function (r) {
      return r.source !== "approximated";
    });
  }

  /* Which of his rows a doubled distance falls on. He says "חמש מעלות או קרוב
     לחמש", so the row is found by the nearest whole degree, as the engine does. */
  function additionRow(kaful) {
    var rows = hisAdditions(), eff = kaful <= 180 ? kaful : 360 - kaful, k = Math.round(eff);
    for (var i = 0; i < rows.length; i++) {
      if (k >= rows[i].minElongation && k <= rows[i].maxElongation) return i;
    }
    return -1;
  }

  /* The two rows of KH 15:6 the course falls between, and how far along it sits
     — the part he tells you to take in KH 15:7. Entered with whole degrees, the
     way he enters it. */
  function mnatBracket(asked) {
    var T = CONSTANTS.MOON_MASLUL_CORRECTIONS;
    for (var i = 0; i < T.length - 1; i++) {
      if (asked >= T[i].maslul && asked <= T[i + 1].maslul) {
        var a = T[i].maslul, b = T[i + 1].maslul;
        return { lo: i, hi: i + 1, part: b === a ? 0 : (asked - a) / (b - a) };
      }
    }
    return { lo: 0, hi: 1, part: 0 };
  }
