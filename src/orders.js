const prices = require("./prices");

const AREAS = ["Шадивлан", "Жаргалант", "Хандгайт", "Хуурай мухар", "Яргайт", "Гачуурт", "Налайх", "Тэрэлж", "Бусад"];
const TIMES = ["Аль ч цаг", "Өглөө 08–12", "Өдөр 12–16", "Орой 16–19"];
const DONE = "гүйцэтгэсэн";
const STATUSES = ["шинэ", "баталгаажсан", "дууссан", DONE, "цуцалсан"];
const JOBS = ["зүлэг", "мод", "жолооч", "ерөнхий"];

function cleanLine(value, max) {
  return String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanNote(value, max) {
  return String(value || "").replace(/<[^>]*>/g, "").replace(/\r\n?/g, "\n").trim().slice(0, max);
}

function phoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("976")) digits = digits.slice(3);
  return digits;
}

function todayInUlaanbaatar() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar" }).format(new Date());
}

function makeId() {
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ulaanbaatar",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date()).replace(/\D/g, "");
  return "NS-" + stamp + "-" + Math.floor(10 + Math.random() * 90);
}

function coordinate(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 1e6) / 1e6;
}

function fail(message) {
  const error = new Error(message);
  error.status = 422;
  return error;
}

async function buildOrder(body, user, toolsById) {
  if (cleanLine(body.website, 80)) {
    return { honeypot: true };
  }

  const name = cleanLine(body.name, 80);
  const phone = phoneDigits(body.phone);
  const area = cleanLine(body.area, 40);
  const place = cleanLine(body.place, 160);
  const date = String(body.date || "").trim();
  let time = cleanLine(body.time, 40);
  let note = cleanNote(body.note, 1000);

  if (name.length < 2) throw fail("Нэрээ бүтнээр нь бичнэ үү.");
  if (phone.length !== 8) throw fail("Утасны дугаар 8 оронтой байна.");
  if (!AREAS.includes(area)) throw fail("Зуслангийн бүсээ сонгоно уу.");
  if (place.length < 3) throw fail("Хашаа, байршилаа бичнэ үү.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInUlaanbaatar()) {
    throw fail("Өнөөдрөөс хойшхи өдөр сонгоно уу.");
  }
  if (!TIMES.includes(time)) time = "Аль ч цаг";
  const lat = coordinate(body.lat, 41, 53);
  const lng = coordinate(body.lng, 87, 120);
  if (lat == null || lng == null) throw fail("Газрын зураг дээр хашааныхаа цэгийг заана уу.");

  const lawn = Math.min(prices.num(body.lawn), 20000);
  if (lawn > 0) {
    const hint = "Урьдчилсан зүлэг " + lawn + " м²: " + prices.lawn(lawn) + "–" + prices.lawnHigh(lawn) + "₮. Бодит үнийг очиж хэмжсэний дараа тогтооно.";
    note = note ? hint + "\n" + note : hint;
  }
  const small = Math.min(prices.num(body.small), 100);
  const mid = Math.min(prices.num(body.mid), 100);
  const large = Math.min(prices.num(body.large), 100);
  const edge = Boolean(body.edge);
  const days = Math.min(Math.max(prices.num(body.days) || 1, 1), 30);
  const itemsIn = Array.isArray(body.items) ? body.items : null;
  if (!itemsIn) throw fail("Багажны сагс буруу байна.");
  if (itemsIn.length > 30) throw fail("Нэг захиалгад 30-оос олон мөр оруулахгүй.");

  let rentRaw = 0;
  let buy = 0;
  let deposit = 0;
  const items = [];

  for (const item of itemsIn) {
    if (!item || typeof item !== "object") throw fail("Багажны мөр буруу байна.");
    const id = String(item.id || "");
    const mode = String(item.mode || "");
    const qty = prices.num(item.qty);
    const tool = toolsById.get(id);
    if (!tool || (mode !== "rent" && mode !== "buy") || qty < 1 || qty > 20) {
      throw fail("Багажны мэдээлэл хуучирсан байна. Хуудсыг шинэчилнэ үү.");
    }
    if (mode === "rent") {
      if (!tool.rent) throw fail(tool.name + " түрээслэхгүй.");
      rentRaw += tool.rent * qty * days;
      deposit += prices.deposit(tool.buy, qty);
    } else {
      buy += tool.buy * qty;
    }
    items.push({ id, name: tool.name, mode, qty });
  }

  const discount = days >= prices.WEEK_FROM ? Math.round(rentRaw * prices.WEEK_OFF) : 0;
  const rent = rentRaw - discount;
  const service = prices.lawn(lawn) + prices.trees(small, mid, large) + (edge ? prices.EDGE : 0);
  const deliveryFee = body.delivery && items.length ? prices.DELIVERY : 0;

  return {
    id: makeId(),
    userId: user.id,
    name,
    phone,
    area,
    place,
    date,
    time,
    lawn,
    small,
    mid,
    large,
    edge,
    days: items.length ? days : 0,
    delivery: deliveryFee > 0,
    note,
    lat,
    lng,
    items,
    service,
    rent,
    buy,
    deliveryFee,
    deposit,
    total: service + rent + buy + deliveryFee
  };
}

function whole(value, max) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n <= max ? n : null;
}

function readMeasure(body) {
  const lawnM2 = whole(body.lawn_m2, 20000);
  const small = whole(body.tree_small, 100);
  const mid = whole(body.tree_mid, 100);
  const large = whole(body.tree_large, 100);
  const lawnMoney = whole(body.lawn_money, 100000000);
  const treeMoney = whole(body.tree_money, 100000000);
  const rentMoney = whole(body.rent_money, 100000000);
  const buyMoney = whole(body.buy_money, 100000000);
  if ([lawnM2, small, mid, large, lawnMoney, treeMoney, rentMoney, buyMoney].some((n) => n == null)) {
    return { error: "measure" };
  }
  return { lawnM2, small, mid, large, lawnMoney, treeMoney, rentMoney, buyMoney };
}

function setNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function written(value) {
  return value !== null && value !== undefined && value !== "";
}

function figures(order) {
  const quoted = {
    lawnM2: setNumber(order.lawn_m2),
    small: setNumber(order.tree_small),
    mid: setNumber(order.tree_mid),
    large: setNumber(order.tree_large),
    lawnMoney: prices.lawn(order.lawn_m2),
    treeMoney: prices.trees(order.tree_small, order.tree_mid, order.tree_large),
    rent: setNumber(order.rent),
    buy: setNumber(order.buy)
  };
  const lawnM2 = written(order.actual_lawn_m2) ? setNumber(order.actual_lawn_m2) : quoted.lawnM2;
  const small = written(order.actual_tree_small) ? setNumber(order.actual_tree_small) : quoted.small;
  const mid = written(order.actual_tree_mid) ? setNumber(order.actual_tree_mid) : quoted.mid;
  const large = written(order.actual_tree_large) ? setNumber(order.actual_tree_large) : quoted.large;
  const lawnMoney = written(order.actual_lawn) ? setNumber(order.actual_lawn) : quoted.lawnMoney;
  const treeMoney = written(order.actual_trees) ? setNumber(order.actual_trees) : quoted.treeMoney;
  const rent = written(order.actual_rent) ? setNumber(order.actual_rent) : quoted.rent;
  const buy = written(order.actual_buy) ? setNumber(order.actual_buy) : quoted.buy;
  const edgeMoney = order.edge ? prices.EDGE : 0;
  const delivery = setNumber(order.delivery_fee);
  const service = lawnMoney + treeMoney + edgeMoney;
  return {
    quoted,
    lawnM2,
    small,
    mid,
    large,
    lawnMoney,
    treeMoney,
    edgeMoney,
    rent,
    buy,
    service,
    delivery,
    deposit: setNumber(order.deposit),
    total: service + rent + buy + delivery,
    measured: [
      order.actual_lawn_m2, order.actual_tree_small, order.actual_tree_mid, order.actual_tree_large,
      order.actual_lawn, order.actual_trees, order.actual_rent, order.actual_buy
    ].some(written)
  };
}

function pricedMeasure(order, body) {
  const input = readMeasure(body);
  if (input.error) return input;
  const edgeMoney = order.edge ? prices.EDGE : 0;
  const service = input.lawnMoney + input.treeMoney + edgeMoney;
  const delivery = setNumber(order.delivery_fee);
  return {
    ...input,
    service,
    rent: input.rentMoney,
    buy: input.buyMoney,
    total: service + input.rentMoney + input.buyMoney + delivery
  };
}

module.exports = { AREAS, STATUSES, DONE, JOBS, buildOrder, figures, readMeasure, pricedMeasure };
