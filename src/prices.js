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
  return m2 * 300;
}

function lawnHigh(m2) {
  m2 = num(m2);
  return m2 * 500;
}

function trees(small, mid, large) {
  return num(small) * 4000 + num(mid) * 12000 + num(large) * 70000;
}

function treesHigh(small, mid, large) {
  return num(small) * 8000 + num(mid) * 18000 + num(large) * 120000;
}

function deposit(buyPrice, qty) {
  return Math.round((buyPrice || 0) * 0.3) * qty;
}

module.exports = { EDGE, DELIVERY, WEEK_FROM, WEEK_OFF, num, lawn, lawnHigh, trees, treesHigh, deposit };
