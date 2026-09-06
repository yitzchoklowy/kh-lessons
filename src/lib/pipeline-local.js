/* Local pipeline — the same order as engine/pipeline.js, minus the
   fixed-calendar (KH 6-10) chain, which needs hebcal. */
function runPipeline(date) {
  var epochStep = calculateDaysFromEpoch(date);
  var days = epochStep.result;

  var sunDailyMotion = getSunDailyMotion();
  var sunMeanLon = calculateSunMeanLongitude(days);
  var sunApogee = calculateSunApogee(days);
  var sunMaslul = calculateSunMaslul(sunMeanLon.result, sunApogee.result);
  var sunCorrection = lookupMaslulCorrection(sunMaslul.result);
  var sunTrueLon = calculateSunTrueLongitude(sunMeanLon.result, sunMaslul.result, sunCorrection.result);

  var moonMeanLon = calculateMoonMeanLongitude(days);
  var seasonCorrection = calculateSeasonCorrection(sunTrueLon.result);
  var adjustedMoonMeanLon = normalizeDegrees(moonMeanLon.result + seasonCorrection.result);
  var moonMaslul = calculateMoonMaslul(days);
  var doubleElong = calculateDoubleElongation(adjustedMoonMeanLon, sunMeanLon.result);
  var maslulHanachon = calculateMaslulHanachon(moonMaslul.result, doubleElong.result);
  var moonCorrection = lookupMoonMaslulCorrection(maslulHanachon.result);
  var moonTrueLon = calculateMoonTrueLongitude(
    adjustedMoonMeanLon, maslulHanachon.result, moonCorrection.result, moonCorrection.direction);
  var nodePos = calculateNodePosition(days);
  var moonLat = calculateMoonLatitude(moonTrueLon.result, nodePos.result);

  var elongation = calculateElongation(moonTrueLon.result, sunTrueLon.result);
  var moonPhase = calculateMoonPhase(elongation.result);
  var orechSheni = calculateOrechSheni(elongation.result, moonTrueLon.result);
  var rochavSheni = calculateRochavSheni(moonLat.result, moonTrueLon.result);
  var orechShlishi = calculateOrechShlishi(orechSheni.result, rochavSheni.result, moonTrueLon.result);
  var orechRevii = calculateOrechRevii(orechShlishi.result, moonTrueLon.result);
  var mnatGovah = calculateMnatGovahHaMedinah(moonLat.result);
  var keshet = calculateKeshetHaReiyah(orechRevii.result, mnatGovah.result, moonLat.result);
  var visibility = determineVisibility({
    orechRishon: elongation.result,
    keshetHaReiyah: keshet.result,
    moonTrueLon: moonTrueLon.result,
  });
  var season = calculateSeasonalInfo(days);

  var steps = [
    epochStep, sunDailyMotion, sunMeanLon, sunApogee, sunMaslul, sunCorrection, sunTrueLon,
    moonMeanLon, seasonCorrection, moonMaslul, doubleElong, maslulHanachon, moonCorrection,
    moonTrueLon, nodePos, moonLat,
    elongation, moonPhase, orechSheni, rochavSheni, orechShlishi, orechRevii, mnatGovah,
    keshet, visibility, season,
  ];
  var stepMap = {};
  for (var i = 0; i < steps.length; i++) stepMap[steps[i].id] = steps[i];

  return {
    steps: steps,
    stepMap: stepMap,
    daysFromEpoch: days,
    sun: {
      meanLongitude: sunMeanLon.result,
      trueLongitude: sunTrueLon.result,
      apogee: sunApogee.result,
      maslul: sunMaslul.result,
      maslulCorrection: sunCorrection.result,
      constellation: zodiacPosition(sunTrueLon.result),
    },
    moon: {
      meanLongitude: moonMeanLon.result,
      adjustedMeanLongitude: adjustedMoonMeanLon,
      trueLongitude: moonTrueLon.result,
      maslul: moonMaslul.result,
      doubleElongation: doubleElong.result,
      maslulHanachon: maslulHanachon.result,
      maslulCorrection: moonCorrection.result,
      latitude: moonLat.result,
      nodePosition: nodePos.result,
      constellation: zodiacPosition(moonTrueLon.result),
      phase: moonPhase.result,
      phaseHebrew: moonPhase.hebrewResult,
      elongation: elongation.result,
      orechSheni: orechSheni.result,
      rochavSheni: rochavSheni.result,
      orechShlishi: orechShlishi.result,
      orechRevii: orechRevii.result,
      mnatGovahHaMedinah: mnatGovah.result,
      keshetHaReiyah: keshet.result,
      isVisible: visibility.result,
      visibilityVerdict: visibility.verdict,
      visibilityPath: visibility.path,
      illumination: (1 - Math.cos(elongation.result * Math.PI / 180)) / 2,
    },
    season: season.result,
  };
}
