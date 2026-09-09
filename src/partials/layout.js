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
      sum.innerHTML = 'דבריו<span class="mark"></span>';
      var mark = sum.querySelector(".mark");
      var eyebrow = header.querySelector(".eyebrow");
      if (eyebrow) mark.textContent = ((eyebrow.textContent || "").split(/\s+/).pop() || "");
      text.appendChild(sum);
      var wrap = document.createElement("div");
      wrap.className = "said-in";
      for (var i = 0; i < said.length; i++) wrap.appendChild(said[i]);
      text.appendChild(wrap);

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

      body.appendChild(text);
      body.appendChild(work);
      page.insertBefore(body, keep[0] || null);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lay);
    else lay();
  })();
