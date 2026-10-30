(function () {
  var form = document.getElementById("order-form");
  if (!form || !window.NarlagPrice || !window.NarlagBasket) return;

  var params = new URLSearchParams(window.location.search);
  ["lawn", "small", "mid", "large"].forEach(function (name) {
    if (params.has(name) && form.elements[name]) form.elements[name].value = params.get(name);
  });
  if (params.get("edge") === "1" && form.elements.edge) form.elements.edge.checked = true;

  var dateInput = form.elements.date;
  if (dateInput) {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    dateInput.min = now.getFullYear() + "-" + month + "-" + day;
  }

  var summary = document.getElementById("summary");
  var grand = document.getElementById("grand");
  var errorBox = document.getElementById("form-error");

  function money(n) {
    return window.NarlagPrice.format(n);
  }

  function serviceBill() {
    var price = window.NarlagPrice;
    var lawn = price.lawn(form.elements.lawn.value);
    var trees = price.trees(form.elements.small.value, form.elements.mid.value, form.elements.large.value);
    var edge = form.elements.edge.checked ? price.EDGE : 0;
    return { lawn: lawn, trees: trees, edge: edge, sum: lawn + trees + edge };
  }

  function row(label, value) {
    return "<p><span>" + label + "</span><strong>" + value + "</strong></p>";
  }

  function paint() {
    window.NarlagBasket.render();
    var days = window.NarlagPrice.num(form.elements.days.value) || 1;
    if (days > 30) days = 30;
    var service = serviceBill();
    var tools = window.NarlagBasket.totals(days);
    var delivery = form.elements.delivery.checked && tools.lines.length ? window.NarlagPrice.DELIVERY : 0;
    var html = "";

    if (service.lawn) html += row("Зүлэг тэгшлэх", money(service.lawn));
    if (service.trees) html += row("Мод засах", money(service.trees));
    if (service.edge) html += row("Ирмэг засах", money(service.edge));
    if (form.elements.large && window.NarlagPrice.num(form.elements.large.value) > 0) {
      html += '<p class="summary__note">Том модны үнэ үзлэгээр өөрчлөгдөж болно.</p>';
    }

    tools.lines.forEach(function (line) {
      var label = (line.mode === "rent" ? "Түрээс · " : "Авах · ") + line.name;
      var extra = line.mode === "rent" ? " · " + days + " хоног" : "";
      html += '<div class="sum-line"><div><span>' + label + extra + "</span><strong>" + money(line.sum) + "</strong></div>" +
        '<div class="qty"><button type="button" data-qty="' + line.id + '" data-mode="' + line.mode + '" data-delta="-1" aria-label="Хасах">−</button>' +
        "<span>" + line.qty + "</span>" +
        '<button type="button" data-qty="' + line.id + '" data-mode="' + line.mode + '" data-delta="1" aria-label="Нэмэх">+</button></div></div>';
    });
    if (tools.discount) html += row("7 хоногийн хямдрал", "−" + money(tools.discount));
    if (delivery) html += row("Хүргэлт", money(delivery));
    if (!html) html += '<p class="summary__note">Тоо, багаж оруулаагүй бол үзэж үнэ хэлэх захиалга болно.</p>';
    if (tools.deposit) html += row("Барьцаа (буцаана)", money(tools.deposit));

    if (summary) summary.innerHTML = html;
    if (grand) grand.textContent = money(service.sum + tools.sum + delivery);
  }

  form.addEventListener("input", paint);
  document.addEventListener("narlag:basket", paint);
  paint();

  function fail(message) {
    if (!errorBox) return;
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function validPhone(value) {
    var digits = String(value).replace(/\D/g, "");
    if (digits.length === 11 && digits.indexOf("976") === 0) digits = digits.slice(3);
    return digits.length === 8;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (errorBox) errorBox.hidden = true;
    form.querySelectorAll(".is-bad").forEach(function (el) { el.classList.remove("is-bad"); });

    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    var area = form.elements.area.value;
    var place = form.elements.place.value.trim();
    var date = form.elements.date.value;

    if (name.length < 2) {
      form.elements.name.classList.add("is-bad");
      fail("Нэрээ бүтнээр нь бичнэ үү.");
      form.elements.name.focus();
      return;
    }
    if (!validPhone(phone)) {
      form.elements.phone.classList.add("is-bad");
      fail("Утасны дугаар 8 оронтой байна.");
      form.elements.phone.focus();
      return;
    }
    if (!area) {
      form.elements.area.classList.add("is-bad");
      fail("Зуслангийн бүсээ сонгоно уу.");
      return;
    }
    if (place.length < 3) {
      form.elements.place.classList.add("is-bad");
      fail("Хашаа, байршилаа бичнэ үү.");
      form.elements.place.focus();
      return;
    }
    if (!date || (dateInput && dateInput.min && date < dateInput.min)) {
      form.elements.date.classList.add("is-bad");
      fail("Өнөөдрөөс хойшхи өдөр сонгоно уу.");
      return;
    }
    if (form.elements.website && form.elements.website.value) return;

    var button = form.querySelector("[type=submit]");
    button.disabled = true;
    button.textContent = "Илгээж байна…";

    var days = window.NarlagPrice.num(form.elements.days.value) || 1;
    var payload = {
      name: name,
      phone: phone,
      area: area,
      place: place,
      date: date,
      time: form.elements.time.value,
      lawn: form.elements.lawn.value,
      small: form.elements.small.value,
      mid: form.elements.mid.value,
      large: form.elements.large.value,
      edge: form.elements.edge.checked,
      days: days,
      delivery: form.elements.delivery.checked,
      note: form.elements.note.value,
      website: form.elements.website.value,
      items: window.NarlagBasket.read()
    };

    fetch("api/zahialga.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.status === 401) {
          window.location.href = "/nevtreh?next=/zahialga";
          return;
        }
        if (!result.ok || !result.data.ok) {
          throw new Error((result.data && result.data.message) || "Захиалга илгээгдсэнгүй.");
        }
        window.NarlagBasket.write([]);
        form.hidden = true;
        var card = document.getElementById("summary-card");
        if (card) card.hidden = true;
        var success = document.getElementById("success");
        var text = document.getElementById("success-text");
        if (text) {
          var deposit = result.data.deposit
            ? " Барьцаа " + money(result.data.deposit) + ", багажийг бүтнээр буцаахад буцаана."
            : "";
          text.textContent = "Захиалгын дугаар " + result.data.id + ". Нийт " + money(result.data.total) + "." + deposit + " Бид 9911-2244 дугаараас холбогдож цагийг баталгаажуулна.";
        }
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      })
      .catch(function (err) {
        button.disabled = false;
        button.textContent = "Захиалга илгээх";
        fail(err.message || "Сервертэй холбогдож чадсангүй. 9911-2244 дугаарт залгана уу.");
      });
  });
})();
