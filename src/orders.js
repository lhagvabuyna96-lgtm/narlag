const prices = require("./prices");

const AREAS = ["Шадивлан", "Жаргалант", "Хандгайт", "Хуурай мухар", "Яргайт", "Гачуурт", "Налайх", "Тэрэлж", "Бусад"];
const TIMES = ["Аль ч цаг", "Өглөө 08–12", "Өдөр 12–16", "Орой 16–19"];
const STATUSES = ["шинэ", "баталгаажсан", "дууссан", "цуцалсан"];

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
  const note = cleanNote(body.note, 1000);

  if (name.length < 2) throw fail("Нэрээ бүтнээр нь бичнэ үү.");
  if (phone.length !== 8) throw fail("Утасны дугаар 8 оронтой байна.");
  if (!AREAS.includes(area)) throw fail("Зуслангийн бүсээ сонгоно уу.");
  if (place.length < 3) throw fail("Хашаа, байршилаа бичнэ үү.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInUlaanbaatar()) {
    throw fail("Өнөөдрөөс хойшхи өдөр сонгоно уу.");
  }
  if (!TIMES.includes(time)) time = "Аль ч цаг";

  const lawn = Math.min(prices.num(body.lawn), 20000);
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
    items,
    service,
    rent,
    buy,
    deliveryFee,
    deposit,
    total: service + rent + buy + deliveryFee
  };
}

module.exports = { AREAS, STATUSES, buildOrder };
