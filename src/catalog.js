const { icon } = require("./icons");

function money(n) {
  return Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₮";
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

const CATS = { zuleg: "Зүлэг", mod: "Мод", gar: "Гар багаж" };

function renderTools(tools, offer) {
  return tools.map((tool) => {
    if (offer === "rent" && !tool.rent) return "";
    if (offer === "buy" && !tool.buy) return "";
    const showRent = offer !== "buy";
    const showBuy = offer !== "rent";
    const priceClass = showRent && showBuy ? "tool__prices" : "tool__prices tool__prices--one";
    const id = esc(tool.id);
    let prices = "";
    if (showRent) {
      prices += tool.rent
        ? `<p><span>Түрээс</span><strong>${money(tool.rent)}</strong><small>/өдөр</small></p>`
        : "<p><span>Түрээс</span><strong>—</strong></p>";
    }
    if (showBuy) prices += `<p><span>Худалдаа</span><strong>${money(tool.buy)}</strong></p>`;
    let actions = "";
    if (showRent && tool.rent) {
      actions += `<button type="button" class="btn btn--leaf" data-add="rent" data-id="${id}">Түрээслэх</button>`;
    }
    if (showBuy) actions += `<button type="button" class="btn btn--clay" data-add="buy" data-id="${id}">Авах</button>`;
    const cat = esc(tool.cat);
    return `<article class="tool" data-cat="${cat}">
      <div class="tool__art" data-cat="${cat}">${icon(tool.icon)}</div>
      <p class="tool__cat">${esc(CATS[tool.cat] || "")}</p>
      <h3>${esc(tool.name)}</h3>
      <p class="tool__desc">${esc(tool.desc)}</p>
      <div class="${priceClass}">${prices}</div>
      <div class="tool__actions">${actions}</div>
    </article>`;
  }).join("");
}

function catalogJson(tools) {
  return JSON.stringify(tools).replace(/</g, "\\u003c");
}

module.exports = { money, esc, renderTools, catalogJson };
