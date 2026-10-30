(function () {
  var KEY = "narlag-basket";
  var closeTimer = 0;
  var toastTimer = 0;

  function tools() {
    return window.NARLAG_TOOLS || [];
  }

  function findTool(id) {
    return tools().find(function (tool) { return tool.id === id; });
  }

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    document.dispatchEvent(new CustomEvent("narlag:basket"));
  }

  function daysOnPage() {
    var input = document.querySelector("[data-rent-days]");
    var n = input ? parseInt(input.value, 10) : 1;
    return Number.isFinite(n) && n > 0 ? Math.min(n, 30) : 1;
  }

  function totals(days) {
    days = Math.max(1, Math.min(days || 1, 30));
    var lines = [];
    var rentRaw = 0;
    var buy = 0;
    var deposit = 0;
    var hasRent = false;

    read().forEach(function (item) {
      var tool = findTool(item.id);
      if (!tool) return;
      var qty = Math.max(1, Math.min(item.qty || 1, 20));
      if (item.mode === "buy") {
        var buySum = (tool.buy || 0) * qty;
        buy += buySum;
        lines.push({ id: item.id, mode: "buy", name: tool.name, qty: qty, sum: buySum });
      } else if (item.mode === "rent" && tool.rent) {
        hasRent = true;
        var raw = tool.rent * qty * days;
        rentRaw += raw;
        deposit += window.NarlagPrice.deposit(tool.buy || 0, qty);
        lines.push({ id: item.id, mode: "rent", name: tool.name, qty: qty, sum: raw, rate: tool.rent });
      }
    });

    var discount = days >= 7 ? Math.round(rentRaw * 0.15) : 0;
    var rent = rentRaw - discount;
    return {
      lines: lines,
      days: days,
      rentRaw: rentRaw,
      rent: rent,
      buy: buy,
      discount: discount,
      deposit: deposit,
      hasRent: hasRent,
      sum: rent + buy
    };
  }

  function updateCount() {
    var count = read().reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
    document.querySelectorAll("[data-basket-count]").forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }

  function render() {
    updateCount();
    var body = document.querySelector("[data-basket-body]");
    var foot = document.querySelector("[data-basket-foot]");
    if (!body || !foot) return;

    var items = read();
    if (!items.length) {
      body.innerHTML = '<p class="drawer__empty">Сагс хоосон байна. Багажаа түрээслэх эсвэл авахаар нэмээрэй.</p>';
      foot.innerHTML = '<a class="btn btn--leaf" href="bagaj.php">Багаж үзэх</a>';
      return;
    }

    var days = daysOnPage();
    var bill = totals(days);
    body.innerHTML = bill.lines.map(function (line) {
      var mode = line.mode === "rent" ? "Түрээс" : "Худалдаа";
      var unit = line.mode === "rent"
        ? window.NarlagPrice.format(line.rate) + " / өдөр"
        : window.NarlagPrice.format(line.sum);
      return (
        '<article class="line">' +
          "<div><p class=\"line__mode\">" + mode + "</p><h3>" + escapeHtml(line.name) + "</h3><p class=\"line__unit\">" + unit + "</p></div>" +
          '<div class="qty">' +
            '<button type="button" data-qty="' + line.id + '" data-mode="' + line.mode + '" data-delta="-1" aria-label="Хасах">−</button>' +
            "<span>" + line.qty + "</span>" +
            '<button type="button" data-qty="' + line.id + '" data-mode="' + line.mode + '" data-delta="1" aria-label="Нэмэх">+</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    var note = days >= 7 && bill.hasRent
      ? '<p class="drawer__note">7 хоногоос дээш түрээс 15% хямд тооцогдлоо.</p>'
      : '<p class="drawer__note">Түрээсийн хоногийг захиалгын хуудсанд сонгоно.</p>';
    foot.innerHTML =
      note +
      (bill.hasRent ? "<p><span>Түрээс (" + days + " хоног)</span><strong>" + window.NarlagPrice.format(bill.rent) + "</strong></p>" : "") +
      (bill.buy ? "<p><span>Худалдаа</span><strong>" + window.NarlagPrice.format(bill.buy) + "</strong></p>" : "") +
      (bill.deposit ? "<p><span>Барьцаа, буцаана</span><strong>" + window.NarlagPrice.format(bill.deposit) + "</strong></p>" : "") +
      '<p class="drawer__sum"><span>Багаж нийт</span><strong>' + window.NarlagPrice.format(bill.sum) + "</strong></p>" +
      '<a class="btn btn--sun" href="zahialga.php">Захиалга руу</a>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function add(id, mode) {
    var tool = findTool(id);
    if (!tool) return;
    if (mode === "rent" && !tool.rent) return;
    var items = read();
    var row = items.find(function (item) { return item.id === id && item.mode === mode; });
    if (row) {
      if (row.qty >= 20) {
        toast("Нэг багажнаас 20-оос илүү авахгүй.");
        return;
      }
      row.qty += 1;
    } else {
      items.push({ id: id, mode: mode, qty: 1 });
    }
    write(items);
    toast(tool.name + " сагсанд нэмэгдлээ");
    open();
  }

  function changeQty(id, mode, delta) {
    var items = read();
    var row = items.find(function (item) { return item.id === id && item.mode === mode; });
    if (!row) return;
    var next = row.qty + delta;
    if (next <= 0) {
      items = items.filter(function (item) { return !(item.id === id && item.mode === mode); });
    } else if (next <= 20) {
      row.qty = next;
    }
    write(items);
  }

  function open() {
    var drawer = document.getElementById("basket");
    if (!drawer) return;
    clearTimeout(closeTimer);
    drawer.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    document.body.classList.add("no-scroll");
    var closeBtn = drawer.querySelector(".drawer__close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    var drawer = document.getElementById("basket");
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    closeTimer = setTimeout(function () {
      if (!drawer.classList.contains("is-open")) drawer.hidden = true;
    }, 280);
  }

  function toast(text) {
    var el = document.querySelector("[data-toast]");
    if (!el) return;
    el.textContent = text;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 2200);
  }

  document.addEventListener("click", function (event) {
    var addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      add(addBtn.dataset.id, addBtn.dataset.add);
      return;
    }
    var qtyBtn = event.target.closest("[data-qty]");
    if (qtyBtn) {
      changeQty(qtyBtn.dataset.qty, qtyBtn.dataset.mode, parseInt(qtyBtn.dataset.delta, 10));
      return;
    }
    if (event.target.closest("[data-open-basket]")) open();
    if (event.target.closest("[data-close-basket]")) close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });

  var dataNode = document.getElementById("catalog-data");
  try {
    window.NARLAG_TOOLS = dataNode ? JSON.parse(dataNode.textContent) : [];
  } catch (err) {
    window.NARLAG_TOOLS = [];
  }

  render();
  window.NarlagBasket = { read: read, write: write, totals: totals, render: render, open: open };
})();
