  /* One shape for every lesson, built here rather than in each page.

     His words go into a panel on the right that folds away, because a reader
     who has read them once wants the instrument, not another scroll past the
     same halacha. Everything else — the diagram, the chart, the working, the
     drill — stands in the column beside them, and the diagram takes that
     column's whole width.

     On a phone there are no columns, so the working comes first and his words
     after it: the working is what the page is for.

     A page stays what it was — a header, a chart, a drill. Nothing here needs
     a page to know about it. */
  (function () {
    function lay() {
      var page = document.querySelector(".page");
      if (!page || page.dataset.laid) return;
      var header = page.querySelector("header");
      if (!header || header.parentNode !== page) return;
      var said = header.querySelectorAll(".halacha");
      if (!said.length) return;                       // nothing of his to fold
      page.dataset.laid = "1";

      var body = document.createElement("div");
      body.className = "body";

      var text = document.createElement("details");
      text.className = "said";
      text.open = true;
      var sum = document.createElement("summary");
      /* whose words these are — his, unless the page says otherwise */
      sum.innerHTML = (page.dataset.said || "לשון הרמב״ם") + '<span class="mark"></span>';
      var mark = sum.querySelector(".mark");
      var eyebrow = header.querySelector(".eyebrow");
      if (eyebrow) mark.textContent = ((eyebrow.textContent || "").split(/\s+/).pop() || "");
      text.appendChild(sum);
      var wrap = document.createElement("div");
      wrap.className = "said-in";
      for (var i = 0; i < said.length; i++) wrap.appendChild(said[i]);
      text.appendChild(wrap);

      /* A page may also say why its rule works — his commentators, quoted.
         It is folded shut: the halacha first, the reason for anyone who wants
         it. A page that has nothing to say here simply gets no panel. */
      var why = null, src = header.querySelector(".why-src") || page.querySelector(".why-src");
      if (src) {
        why = document.createElement("details");
        why.className = "why";
        var ws = document.createElement("summary");
        ws.innerHTML = 'למה זה עובד<span class="mark">מן המפרשים</span>';
        why.appendChild(ws);
        var win = document.createElement("div");
        win.className = "why-in";
        while (src.firstChild) win.appendChild(src.firstChild);
        why.appendChild(win);
        src.parentNode.removeChild(src);
      }

      var work = document.createElement("div");
      work.className = "work";
      var node = header.nextSibling, keep = [];
      while (node) {
        var next = node.nextSibling;
        if (node.nodeType === 1 && (node.classList.contains("note") ||
                                    node.classList.contains("pagenav"))) keep.push(node);
        else work.appendChild(node);
        node = next;
      }

      var side = document.createElement("div");
      side.className = "side";
      side.appendChild(text);
      if (why) side.appendChild(why);
      body.appendChild(side);
      body.appendChild(work);
      page.insertBefore(body, keep[0] || null);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lay);
    else lay();
  })();
