  /* Previous and next, in his order — chapter, then halacha. The list is
     src/order.json, injected by the build so the index and these buttons can
     never disagree. */
  (function () {
    var ORDER = /*@ORDER*/[];
    function go() {
      var here = (location.pathname.split("/").pop() || "index.html");
      var i = -1, k;
      for (k = 0; k < ORDER.length; k++) if (ORDER[k].file === here) i = k;
      if (i < 0) return;
      var page = document.querySelector(".page") || document.body;
      var nav = document.createElement("nav");
      nav.className = "pagenav";
      function side(item, dir) {
        if (!item) return '<span class="pn-gap"></span>';
        return '<a class="pn ' + dir + '" href="' + item.file + '">' +
               '<span class="pn-dir">' + (dir === "prev" ? "הקודם" : "הבא") + "</span>" +
               '<span class="pn-name">' + item.name + "</span>" +
               '<span class="pn-mark">' + item.mark + "</span></a>";
      }
      /* The row is RTL, so the first one written lands on the right — and on the
         right is where you came from. */
      nav.innerHTML = side(ORDER[i - 1], "prev") + side(ORDER[i + 1], "next");
      page.appendChild(nav);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  })();
