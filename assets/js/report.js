(function () {
  var node = document.getElementById("report-data");
  if (!node || !window.Chart) return;
  var report = JSON.parse(node.textContent || "{}");
  if (!report.count) return;

  var ink = document.documentElement.getAttribute("data-theme") === "dark" ? "#e7f0e4" : "#1c2416";
  var muted = document.documentElement.getAttribute("data-theme") === "dark" ? "#b7c8b4" : "#5c6b58";
  Chart.defaults.color = muted;
  Chart.defaults.font.family = "Manrope, Segoe UI, sans-serif";
  var palette = ["#14633a", "#f0b429", "#1c6b8a", "#6d2e16", "#8a6a2f", "#143526"];

  function labels(object) {
    return Object.keys(object);
  }

  function values(object) {
    return Object.keys(object).map(function (key) { return object[key]; });
  }

  new Chart(document.getElementById("chart-status"), {
    type: "doughnut",
    data: {
      labels: labels(report.byStatus),
      datasets: [{ data: values(report.byStatus), backgroundColor: palette }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });

  new Chart(document.getElementById("chart-money"), {
    type: "bar",
    data: {
      labels: ["Үйлчилгээ", "Түрээс", "Худалдаа", "Хүргэлт", "Нийт"],
      datasets: [{
        data: [report.totals.service, report.totals.rent, report.totals.buy, report.totals.delivery, report.totals.total],
        backgroundColor: "#14633a"
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { color: muted } }, x: { ticks: { color: ink } } } }
  });

  new Chart(document.getElementById("chart-area"), {
    type: "bar",
    data: {
      labels: labels(report.byArea),
      datasets: [{ data: values(report.byArea), backgroundColor: "#f0b429" }]
    },
    options: { indexAxis: "y", plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById("chart-work"), {
    type: "bar",
    data: {
      labels: labels(report.work),
      datasets: [{ data: values(report.work), backgroundColor: "#1c6b8a" }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById("chart-month"), {
    type: "line",
    data: {
      labels: report.months.map(function (item) { return item.month; }),
      datasets: [
        { label: "Захиалга", data: report.months.map(function (item) { return item.count; }), borderColor: "#14633a", backgroundColor: "#14633a", tension: 0.3 },
        { label: "Дүн", data: report.months.map(function (item) { return item.total; }), borderColor: "#f0b429", backgroundColor: "#f0b429", tension: 0.3, yAxisID: "y1" }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true, position: "left" },
        y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false } }
      }
    }
  });
})();
