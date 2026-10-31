(function () {
  var LAWN_LOW = 300;
  var LAWN_HIGH = 500;
  var EDGE = 25000;
  var DELIVERY = 15000;
  var WEEK = 7;
  var OFF = 0.15;

  function num(v) {
    var n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function format(n) {
    return Math.round(n || 0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₮";
  }

  function lawn(m2) {
    return num(m2) * LAWN_LOW;
  }

  function lawnHigh(m2) {
    return num(m2) * LAWN_HIGH;
  }

  function trees(small, mid, large) {
    return num(small) * 40000 + num(mid) * 80000 + num(large) * 150000;
  }

  function rent(dayRate, qty, days) {
    var raw = dayRate * qty * days;
    if (days >= WEEK) return raw - Math.round(raw * OFF);
    return raw;
  }

  function deposit(buyPrice, qty) {
    return Math.round(buyPrice * 0.3) * qty;
  }

  window.NarlagPrice = {
    EDGE: EDGE,
    DELIVERY: DELIVERY,
    num: num,
    format: format,
    lawn: lawn,
    lawnHigh: lawnHigh,
    trees: trees,
    rent: rent,
    deposit: deposit
  };
})();
