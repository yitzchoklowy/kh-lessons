  /* The palettes already answer to :root[data-theme]; this just lets a reader
     choose, and remembers it. */
  (function () {
    var KEY = "kh-theme";
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) root.setAttribute("data-theme", saved);

    var b = document.createElement("button");
    b.className = "themer";
    b.type = "button";
    b.setAttribute("aria-label", "מצב תצוגה");
    function dark() {
      var t = root.getAttribute("data-theme");
      if (t) return t === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function paint() { b.textContent = dark() ? "☾" : "☀"; }
    b.addEventListener("click", function () {
      var next = dark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });
    paint();
    // this runs in the head, so body may not exist yet
    if (document.body) document.body.appendChild(b);
    else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(b); });
  })();
