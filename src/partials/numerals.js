  /* His numbers are written in words. A reader checking the arithmetic wants
     figures. So every number in the halacha carries both, and a control says
     which is showing: his words, his words with the figure beside them, or the
     figure in their place.

     Mark a number in the text as

         <b class="w">שלש מאות ושישים</b>

     and the figure is worked out from the words themselves — nothing is typed
     twice, so a page cannot gloss a number wrongly. Where his phrasing splits a
     number around a unit ("עשר מעלות ומחצה") the span carries `data-d` and that
     value is used instead. A phrase this does not understand gets no figure at
     all rather than a guessed one. */

  var HEB_ONES = {
    "אחד": 1, "אחת": 1, "שנים": 2, "שתים": 2, "שני": 2, "שתי": 2, "שניה": 2,
    "שלשה": 3, "שלש": 3, "שלושה": 3, "שלוש": 3, "שלשת": 3,
    "ארבעה": 4, "ארבע": 4, "ארבעת": 4,
    "חמישה": 5, "חמש": 5, "חמשה": 5, "חמשת": 5,
    "שישה": 6, "שש": 6, "ששה": 6, "ששת": 6,
    "שבעה": 7, "שבע": 7, "שבעת": 7,
    "שמונה": 8, "שמונת": 8,
    "תשעה": 9, "תשע": 9, "תשעת": 9
  };
  var HEB_TENS = {
    "עשר": 10, "עשרה": 10, "עשרים": 20,
    "שלשים": 30, "שלושים": 30, "ארבעים": 40, "חמישים": 50,
    "שישים": 60, "ששים": 60, "שבעים": 70, "שמונים": 80, "תשעים": 90
  };
  var HEB_HUND = { "מאה": 100, "מאתים": 200, "מאתיים": 200 };

  function hebrewWordsToNumber(text) {
    var toks = String(text).replace(/[.,:;]/g, " ").split(/\s+/);
    var total = 0, pending = 0, half = 0, seen = false, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (!t) continue;
      if (t.length > 1 && t.charAt(0) === "ו") t = t.slice(1);   // ...ושישים

      if (t === "מאות") { total += (pending || 1) * 100; pending = 0; seen = true; continue; }
      if (t === "אלפים" || t === "אלף") { total += (pending || 1) * 1000; pending = 0; seen = true; continue; }
      /* אחת עשרה — a unit already standing turns the ten into a teen */
      if ((t === "עשר" || t === "עשרה") && pending) { total += pending + 10; pending = 0; seen = true; continue; }

      total += pending; pending = 0;                              // nothing more can join it

      if (HEB_ONES[t] !== undefined) { pending = HEB_ONES[t]; seen = true; continue; }
      if (HEB_TENS[t] !== undefined) { total += HEB_TENS[t]; seen = true; continue; }
      if (HEB_HUND[t] !== undefined) { total += HEB_HUND[t]; seen = true; continue; }
      if (t === "ומחצה" || t === "מחצה" || t === "וחצי" || t === "חצי") { half = 0.5; continue; }
      return null;                                                // a word we do not know
    }
    total += pending + half;
    return seen ? total : null;
  }

  /* Half a degree is his own way of saying it, so keep the half. */
  function numText(v) {
    if (v === null) return "";
    var whole = Math.floor(v);
    return (v - whole === 0.5) ? (whole ? whole + "½" : "½") : String(v);
  }

  /* Give every marked number its figure, and wire the control that shows it. */
  function numerals(root, control) {
    var MODES = ["as", "both", "digits"];
    var LABEL = { as: "כלשונו", both: "ולצידם", digits: "במספרים" };
    var marks = root.querySelectorAll("b.w, .w");
    var i, m, v;

    for (i = 0; i < marks.length; i++) {
      m = marks[i];
      if (m.dataset.done) continue;
      v = m.dataset.d !== undefined ? Number(m.dataset.d) : hebrewWordsToNumber(m.textContent);
      m.dataset.done = "1";
      if (v === null || isNaN(v)) { m.classList.add("nofig"); continue; }
      m.dataset.d = String(v);
      m.innerHTML = '<span class="ws">' + m.innerHTML + "</span>" +
                    '<span class="dg" dir="ltr">' + numText(v) + "</span>";
    }

    function set(mode) {
      root.setAttribute("data-num", mode);
      var b = control.querySelectorAll("button");
      for (var k = 0; k < b.length; k++) {
        b[k].setAttribute("aria-pressed", String(b[k].dataset.mode === mode));
      }
      try { localStorage.setItem("kh-num", mode); } catch (e) { /* private window */ }
    }

    var html = "";
    for (i = 0; i < MODES.length; i++) {
      html += '<button type="button" data-mode="' + MODES[i] + '" aria-pressed="false">' +
              LABEL[MODES[i]] + "</button>";
    }
    control.innerHTML = '<span class="nl">מספריו</span>' + html;
    control.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-mode]");
      if (b) set(b.dataset.mode);
    });

    var saved = null;
    try { saved = localStorage.getItem("kh-num"); } catch (e) { /* private window */ }
    set(MODES.indexOf(saved) >= 0 ? saved : "both");
  }
