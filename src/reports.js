const { STATUSES, figures } = require("./orders");

function money(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US") + "₮";
}

function monthKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit"
  }).format(date).slice(0, 7);
}

function dayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function buildReport(orders) {
  const byStatus = {};
  STATUSES.forEach((status) => { byStatus[status] = 0; });
  const byArea = {};
  const byMonth = {};
  const work = { "Зүлэг": 0, "Мод": 0, "Ирмэг": 0, "Түрээс": 0, "Худалдаа": 0, "Хүргэлт": 0 };
  const totals = { service: 0, rent: 0, buy: 0, delivery: 0, deposit: 0, total: 0, lawn: 0, trees: 0, pins: 0 };
  const groups = { order: 0, lawn: 0, trees: 0, edge: 0, buy: 0, rent: 0 };

  orders.forEach((order) => {
    const bill = figures(order);
    const status = order.status || "шинэ";
    byStatus[status] = (byStatus[status] || 0) + 1;
    const area = order.area || "Бусад";
    byArea[area] = (byArea[area] || 0) + 1;
    const month = monthKey(order.created_at);
    if (!byMonth[month]) byMonth[month] = { count: 0, total: 0 };
    byMonth[month].count += 1;
    byMonth[month].total += bill.total;
    totals.service += bill.service;
    totals.rent += bill.rent;
    totals.buy += bill.buy;
    totals.delivery += bill.delivery;
    totals.deposit += bill.deposit;
    totals.total += bill.total;
    const treeCount = bill.small + bill.mid + bill.large;
    totals.lawn += bill.lawnM2;
    totals.trees += treeCount;
    groups.lawn += bill.lawnMoney;
    groups.trees += bill.treeMoney;
    groups.edge += bill.edgeMoney;
    groups.order += bill.lawnMoney + bill.treeMoney + bill.edgeMoney;
    groups.buy += bill.buy;
    groups.rent += bill.rent;
    if (order.lat != null && order.lng != null) totals.pins += 1;
    if (bill.lawnM2 > 0) work["Зүлэг"] += 1;
    if (treeCount) work["Мод"] += 1;
    if (order.edge) work["Ирмэг"] += 1;
    if (bill.rent > 0) work["Түрээс"] += 1;
    if (bill.buy > 0) work["Худалдаа"] += 1;
    if (order.delivery) work["Хүргэлт"] += 1;
  });

  const months = Object.keys(byMonth).filter(Boolean).sort();
  const rows = orders.map((order) => {
    const bill = figures(order);
    return {
      id: order.id,
      customer: order.customer_name,
      phone: order.phone,
      date: dayKey(order.visit_date),
      area: order.area,
      place: order.place,
      lawnM2: bill.lawnM2,
      lawnMoney: bill.lawnMoney,
      treeMoney: bill.treeMoney,
      buy: bill.buy,
      rent: bill.rent,
      total: bill.total,
      status: order.status || "шинэ"
    };
  });

  return {
    generatedAt: dayKey(new Date()),
    count: orders.length,
    byStatus,
    byArea,
    groups,
    work,
    months: months.map((month) => ({ month, count: byMonth[month].count, total: byMonth[month].total })),
    totals,
    rows
  };
}

function pairs(object) {
  return Object.keys(object).map((key) => [key, object[key]]);
}

async function toExcel(report) {
  const ExcelJS = require("exceljs");
  const book = new ExcelJS.Workbook();
  book.creator = "Зуслан зүлэг сервис";
  const summary = book.addWorksheet("Хураангуй");
  summary.columns = [{ width: 28 }, { width: 22 }];
  summary.addRow(["Тайлан", report.generatedAt]);
  summary.addRow(["Нийт захиалга", report.count]);
  summary.addRow(["Нийт дүн", report.totals.total]);
  summary.addRow(["Үйлчилгээ", report.totals.service]);
  summary.addRow(["Түрээс", report.totals.rent]);
  summary.addRow(["Худалдаа", report.totals.buy]);
  summary.addRow(["Хүргэлт", report.totals.delivery]);
  summary.addRow(["Барьцаа", report.totals.deposit]);
  summary.addRow(["Зүлэг, м²", report.totals.lawn]);
  summary.addRow(["Мод, ширхэг", report.totals.trees]);
  summary.addRow(["Pin-тэй захиалга", report.totals.pins]);
  summary.addRow(["Төлөв · Захиалга", report.groups.order]);
  summary.addRow(["Төлөв · Зүлэг", report.groups.lawn]);
  summary.addRow(["Төлөв · Мод", report.groups.trees]);
  summary.addRow(["Төлөв · Худалдаа", report.groups.buy]);
  summary.addRow(["Төлөв · Түрээс", report.groups.rent]);
  summary.getRow(1).font = { bold: true };

  addSheet(book, "Төлөв", ["Хэсэг", "Дүн"], [
    ["Захиалга", report.groups.order],
    ["Зүлэг", report.groups.lawn],
    ["Мод", report.groups.trees],
    ["Ирмэг", report.groups.edge],
    ["Худалдаа", report.groups.buy],
    ["Түрээс", report.groups.rent]
  ]);
  addSheet(book, "Явц", ["Төлөв", "Тоо"], pairs(report.byStatus));
  addSheet(book, "Бүс", ["Бүс", "Тоо"], pairs(report.byArea));
  addSheet(book, "Ажил", ["Төрөл", "Захиалга"], pairs(report.work));
  addSheet(book, "Сар", ["Сар", "Тоо", "Дүн"], report.months.map((item) => [item.month, item.count, item.total]));
  addSheet(book, "Захиалга", ["Дугаар", "Захиалагч", "Утас", "Өдөр", "Бүс", "Байршил", "Зүлэг м²", "Зүлэг", "Мод", "Худалдаа", "Түрээс", "Дүн", "Төлөв"], report.rows.map((row) => [
    row.id, row.customer, row.phone, row.date, row.area, row.place, row.lawnM2, row.lawnMoney, row.treeMoney, row.buy, row.rent, row.total, row.status
  ]));
  return book.xlsx.writeBuffer();
}

function addSheet(book, name, headers, data) {
  const sheet = book.addWorksheet(name);
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  data.forEach((line) => sheet.addRow(line));
  sheet.columns.forEach((column) => { column.width = 22; });
}

async function toWord(report) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = await import("docx");

  function text(value, bold) {
    return new Paragraph({
      children: [new TextRun({ text: String(value ?? ""), bold: !!bold, font: "Calibri", size: bold ? 22 : 20 })]
    });
  }

  function cell(value, bold) {
    return new TableCell({
      width: { size: 1200, type: WidthType.DXA },
      children: [text(value, bold)]
    });
  }

  function table(headers, data) {
    const lines = data.length ? data : [headers.map(() => "—")];
    return new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({ children: headers.map((header) => cell(header, true)), tableHeader: true }),
        ...lines.map((line) => new TableRow({ children: line.map((value) => cell(value, false)) }))
      ]
    });
  }

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Зуслан зүлэг сервис — Тайлан", font: "Calibri" })]
        }),
        text("Огноо: " + report.generatedAt, false),
        text("Нийт захиалга: " + report.count + ". Нийт дүн: " + money(report.totals.total) + ".", false),
        text("Үйлчилгээ " + money(report.totals.service) + ", түрээс " + money(report.totals.rent) + ", худалдаа " + money(report.totals.buy) + ", хүргэлт " + money(report.totals.delivery) + ".", false),
        text("Зүлэг " + report.totals.lawn + " м², мод " + report.totals.trees + " ширхэг, pin-тэй захиалга " + report.totals.pins + ".", false),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Төлөв")] }),
        table(["Хэсэг", "Дүн"], [
          ["Захиалга", money(report.groups.order)],
          ["Зүлэг", money(report.groups.lawn)],
          ["Мод", money(report.groups.trees)],
          ["Худалдаа", money(report.groups.buy)],
          ["Түрээс", money(report.groups.rent)]
        ]),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Явц")] }),
        table(["Төлөв", "Тоо"], pairs(report.byStatus)),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Бүс")] }),
        table(["Бүс", "Тоо"], pairs(report.byArea)),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Ажил")] }),
        table(["Төрөл", "Захиалга"], pairs(report.work)),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Сар")] }),
        table(["Сар", "Тоо", "Дүн"], report.months.map((item) => [item.month, item.count, money(item.total)])),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Захиалга")] }),
        table(
          ["Дугаар", "Захиалагч", "Өдөр", "Бүс", "Дүн", "Төлөв"],
          report.rows.map((row) => [row.id, row.customer, row.date, row.area, money(row.total), row.status])
        )
      ]
    }]
  });
  return Packer.toBuffer(doc);
}

module.exports = { buildReport, toExcel, toWord, money };
