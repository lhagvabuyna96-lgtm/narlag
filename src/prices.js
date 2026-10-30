const EDGE = 25000;
const DELIVERY = 15000;
const WEEK_FROM = 7;
const WEEK_OFF = 0.15;

function num(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function lawn(m2) {
  m2 = num(m2);
  if (!m2) return 0;
  let price = 80000;
  if (m2 > 100) price += (Math.min(m2, 300) - 100) * 700;
  if (m2 > 300) price += (m2 - 300) * 500;
  return price;
}

function trees(small, mid, large) {
  return num(small) * 40000 + num(mid) * 80000 + num(large) * 150000;
}

function deposit(buyPrice, qty) {
  return Math.round((buyPrice || 0) * 0.3) * qty;
}

module.exports = { EDGE, DELIVERY, WEEK_FROM, WEEK_OFF, num, lawn, trees, deposit };
