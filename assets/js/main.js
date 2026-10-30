(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll(".faq__item").forEach(function (item) {
    var button = item.querySelector("button");
    if (!button) return;
    button.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.dataset.filter;
      var grid = document.getElementById("tool-grid");
      if (!grid) return;
      document.querySelectorAll("[data-filter]").forEach(function (peer) {
        var on = peer === button;
        peer.classList.toggle("is-on", on);
        peer.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var visible = 0;
      grid.querySelectorAll(".tool").forEach(function (card) {
        var show = filter === "all" || card.dataset.cat === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      var empty = document.getElementById("tool-empty");
      if (empty) empty.hidden = visible !== 0;
    });
  });

  var estimator = document.getElementById("estimator");
  if (estimator && window.NarlagPrice) {
    var total = document.getElementById("est-total");
    var parts = document.getElementById("est-parts");
    var link = document.getElementById("est-link");

    function paintEstimate() {
      var price = window.NarlagPrice;
      var lawn = price.lawn(estimator.elements.lawn.value);
      var tree = price.trees(
        estimator.elements.small.value,
        estimator.elements.mid.value,
        estimator.elements.large.value
      );
      var edge = estimator.elements.edge.checked ? price.EDGE : 0;
      var rows = [];
      if (lawn) rows.push("Зүлэг " + price.format(lawn));
      if (tree) rows.push("Мод " + price.format(tree));
      if (edge) rows.push("Ирмэг " + price.format(edge));
      if (!rows.length) rows.push("Тоо оруулаагүй байна");
      if (parts) parts.textContent = rows.join(" · ");
      if (total) total.textContent = price.format(lawn + tree + edge);
      if (link) {
        var query = new URLSearchParams();
        ["lawn", "small", "mid", "large"].forEach(function (name) {
          query.set(name, estimator.elements[name].value || "0");
        });
        if (estimator.elements.edge.checked) query.set("edge", "1");
        link.href = "zahialga.php?" + query.toString();
      }
    }

    estimator.addEventListener("input", paintEstimate);
    estimator.addEventListener("change", paintEstimate);
    paintEstimate();
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
