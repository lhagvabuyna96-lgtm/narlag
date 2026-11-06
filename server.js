require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./src/db");
const reports = require("./src/reports");
const PgSessionStore = require("./src/session-store");
const orders = require("./src/orders");
const catalog = require("./src/catalog");

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET алга.");
  process.exit(1);
}

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.money = catalog.money;
app.locals.figures = orders.figures;
app.locals.kinds = orders.kinds;
app.locals.when = (value) => value
  ? new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date(value))
  : "";
app.locals.day = (value) => {
  if (!value) return "";
  if (value instanceof Date) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return value.getFullYear() + "-" + month + "-" + date;
  }
  return String(value).slice(0, 10);
};
app.locals.itemsOf = (order) => {
  if (Array.isArray(order.items)) return order.items;
  if (typeof order.items === "string") {
    try {
      const parsed = JSON.parse(order.items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(session({
  store: new PgSessionStore(),
  name: "narlag.sid",
  secret: process.env.SESSION_SECRET || "narlag-dev-secret",
  resave: false,
  saveUninitialized: false,
  proxy: isProd,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

async function renderPage(res, view, data = {}) {
  const tools = await db.listTools();
  res.render(view, {
    title: "Зуслан зүлэг сервис",
    desc: "Зуслангийн зүлэг тэгшлэх, мод засах, багаж түрээс ба худалдаа.",
    page: "",
    toolsHtml: "",
    scripts: [],
    error: "",
    notice: "",
    passwordError: "",
    draft: null,
    nextPath: "/",
    orders: [],
    all: false,
    offer: "",
    mapKey: "",
    ...data,
    catalog: catalog.catalogJson(tools)
  });
}

function landingFor(role) {
  if (role === "admin") return "/admin";
  if (role === "worker") return "/ajil";
  return "/profile";
}

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/nevtreh?next=" + encodeURIComponent(req.originalUrl));
  db.findUserById(req.session.user.id).then((row) => {
    if (!row || row.active === false) {
      return req.session.destroy(() => res.redirect("/nevtreh"));
    }
    req.session.user = db.publicUser(row);
    next();
  }).catch(next);
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect("/nevtreh?next=" + encodeURIComponent(req.originalUrl));
    db.findUserById(req.session.user.id).then((row) => {
      if (!row || row.active === false || row.role !== role) {
        const error = new Error("forbidden");
        error.status = 403;
        return next(error);
      }
      req.session.user = db.publicUser(row);
      next();
    }).catch(next);
  };
}

const requireAdmin = requireRole("admin");
const requireWorker = requireRole("worker");

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", asyncRoute((req, res) => renderPage(res, "home", {
  page: "home",
  title: "Зуслан зүлэг сервис"
})));

app.get(["/zuileg", "/zuileg.php"], asyncRoute((req, res) => renderPage(res, "zuileg", {
  page: "lawn",
  title: "Зүлэг тэгшлэх — Зуслан зүлэг сервис"
})));

app.get(["/mod", "/mod.php"], asyncRoute((req, res) => renderPage(res, "mod", {
  page: "tree",
  title: "Мод засах — Зуслан зүлэг сервис"
})));

app.get(["/une", "/une.php"], asyncRoute((req, res) => renderPage(res, "une", {
  page: "price",
  title: "Үнэ — Зуслан зүлэг сервис"
})));

app.get(["/tuurees", "/tuurees.php", "/bagaj", "/bagaj.php"], asyncRoute(async (req, res) => {
  const tools = await db.listTools();
  return renderPage(res, "tools", {
    page: "rent",
    title: "Багаж түрээс — Зуслан зүлэг сервис",
    offer: "rent",
    toolsHtml: catalog.renderTools(tools, "rent")
  });
}));

app.get(["/hudaldah", "/hudaldah.php"], asyncRoute(async (req, res) => {
  const tools = await db.listTools();
  return renderPage(res, "tools", {
    page: "sale",
    title: "Багаж худалдаа — Зуслан зүлэг сервис",
    offer: "buy",
    toolsHtml: catalog.renderTools(tools, "buy")
  });
}));

app.get(["/zahialga", "/zahialga.php"], asyncRoute((req, res) => renderPage(res, "order", {
  page: "order",
  title: "Захиалга — Зуслан зүлэг сервис",
  scripts: ["/assets/js/map-pin.js", "/assets/js/booking.js"],
  mapKey: process.env.MAPTILER_KEY || ""
})));

app.get("/nevtreh", asyncRoute((req, res) => {
  if (req.session.user) return res.redirect(landingFor(req.session.user.role));
  return renderPage(res, "auth", {
    page: "login",
    title: "Нэвтрэх — Зуслан зүлэг сервис",
    mode: "login",
    nextPath: safeNext(req.query.next)
  });
}));

app.post("/nevtreh", asyncRoute(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const nextPath = safeNext(req.body.next);
  const row = await db.findUserByEmail(email);
  const matches = row && await bcrypt.compare(password, row.password_hash);
  if (!matches || row.active === false) {
    return renderPage(res.status(401), "auth", {
      page: "login",
      title: "Нэвтрэх — Зуслан зүлэг сервис",
      mode: "login",
      nextPath,
      error: matches && row.active === false ? "Энэ бүртгэл идэвхгүй байна." : "Имэйл эсвэл нууц үг буруу байна."
    });
  }
  req.session.user = db.publicUser(row);
  const landing = landingFor(row.role);
  req.session.save(() => res.redirect(nextPath === "/" ? landing : nextPath));
}));

app.get("/burtgel", asyncRoute((req, res) => {
  if (req.session.user) return res.redirect("/profile");
  return renderPage(res, "auth", {
    page: "login",
    title: "Бүртгүүлэх — Зуслан зүлэг сервис",
    mode: "register",
    nextPath: safeNext(req.query.next)
  });
}));

app.post("/burtgel", asyncRoute(async (req, res) => {
  const name = String(req.body.name || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const phone = String(req.body.phone || "").replace(/\D/g, "").slice(-8);
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const again = String(req.body.again || "");
  const nextPath = safeNext(req.body.next);
  const back = (status, error) => renderPage(res.status(status), "auth", {
    page: "login",
    title: "Бүртгүүлэх — Зуслан зүлэг сервис",
    mode: "register",
    nextPath,
    error
  });

  if (name.length < 2) return back(422, "Нэрээ бүтнээр нь бичнэ үү.");
  if (phone.length !== 8) return back(422, "Утасны дугаар 8 оронтой байна.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back(422, "Имэйл хаягаа зөв бичнэ үү.");
  if (password.length < 8) return back(422, "Нууц үг хамгийн багадаа 8 тэмдэгт байна.");
  if (password !== again) return back(422, "Нууц үг хоёр талбар дээр адилхан биш байна.");
  if (await db.findUserByEmail(email)) return back(409, "Энэ имэйлээр бүртгэл байна. Нэвтэрнэ үү.");

  const user = await db.createCustomer({ name, phone, email, password });
  req.session.user = user;
  req.session.save(() => res.redirect(nextPath === "/" ? "/profile" : nextPath));
}));

app.post("/garah", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("narlag.sid");
    res.redirect("/");
  });
});

app.get("/profile", requireLogin, asyncRoute((req, res) => renderPage(res, "profile", {
  page: "profile",
  title: "Профайл — Зуслан зүлэг сервис",
  notice: req.query.ok === "profile" ? "Нэр, утас шинэчлэгдлээ." : req.query.ok === "password" ? "Нууц үг солигдлоо." : "",
  passwordError: ""
})));

app.post("/profile", requireLogin, asyncRoute(async (req, res) => {
  const name = String(req.body.name || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const phone = String(req.body.phone || "").replace(/\D/g, "").slice(-8);
  const again = (error) => renderPage(res.status(422), "profile", {
    page: "profile",
    title: "Профайл — Зуслан зүлэг сервис",
    notice: "",
    passwordError: "",
    error,
    draft: { name, phone }
  });
  if (name.length < 2) return again("Нэрээ бүтнээр нь бичнэ үү.");
  if (phone.length !== 8) return again("Утасны дугаар 8 оронтой байна.");
  const user = await db.updateProfile(req.session.user.id, { name, phone });
  if (!user) return res.redirect("/garah");
  req.session.user = user;
  req.session.save(() => res.redirect("/profile?ok=profile"));
}));

app.post("/profile/nuuts", requireLogin, asyncRoute(async (req, res) => {
  const current = String(req.body.current || "");
  const password = String(req.body.password || "");
  const again = String(req.body.again || "");
  const row = await db.findUserByEmail(req.session.user.email);
  const fail = (passwordError) => renderPage(res.status(422), "profile", {
    page: "profile",
    title: "Профайл — Зуслан зүлэг сервис",
    notice: "",
    error: "",
    passwordError
  });
  if (!row || !(await bcrypt.compare(current, row.password_hash))) return fail("Одоогийн нууц үг буруу байна.");
  if (password.length < 8) return fail("Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна.");
  if (password !== again) return fail("Шинэ нууц үг хоёр талбар дээр адилхан биш байна.");
  await db.updatePassword(row.id, password);
  res.redirect("/profile?ok=password");
}));

app.get("/zahialguud", requireLogin, asyncRoute(async (req, res) => {
  const all = req.session.user.role === "admin";
  return renderPage(res, "orders", {
    page: "mine",
    title: (all ? "Бүх захиалга" : "Миний захиалга") + " — Зуслан зүлэг сервис",
    all,
    orders: await db.listOrders(all ? null : req.session.user.id)
  });
}));

const ADMIN_OK = {
  created: "Ажилчин нэмэгдлээ. Тэр имэйл, нууц үгээрээ нэвтэрнэ.",
  saved: "Ажилчин хадгалагдлаа.",
  deleted: "Ажилчин хасагдлаа.",
  measured: "Бодит дүн хадгалагдлаа."
};
const ADMIN_ERR = {
  name: "Нэрийг бүтнээр нь бичнэ үү.",
  phone: "Утасны дугаар 8 оронтой байна.",
  email: "Имэйл хаягаа зөв бичнэ үү.",
  taken: "Энэ имэйлээр бүртгэл байна.",
  password: "Нууц үг хамгийн багадаа 8 тэмдэгт байна.",
  again: "Нууц үг хоёр талбар дээр адилхан биш байна.",
  job: "Ажлын төрлийг сонгоно уу.",
  missing: "Ажилчин олдсонгүй.",
  used: "Энэ ажилчин захиалгатай холбоотой тул идэвхгүй болгоно уу.",
  measure: "Хэмжээ болон дүн 0 буюу түүнээс их бүхэл тоо байна.",
  cancelled: "Цуцалсан захиалгыг засахгүй."
};

function workerInput(body, creating) {
  const name = String(body.name || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-8);
  const email = String(body.email || "").trim().toLowerCase();
  const job = String(body.job || "");
  const password = String(body.password || "");
  const again = String(body.again || "");
  const active = body.active === "1" || body.active === "on";
  if (name.length < 2) return { error: "name" };
  if (phone.length !== 8) return { error: "phone" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "email" };
  if (!orders.JOBS.includes(job)) return { error: "job" };
  if (creating || password || again) {
    if (password.length < 8) return { error: "password" };
    if (creating && password !== again) return { error: "again" };
  }
  return { name, phone, email, job, password, active: creating ? true : active };
}

function adminBack(res, code, kind) {
  const query = new URLSearchParams({ tab: "workers" });
  if (code) query.set(kind, code);
  res.redirect("/admin?" + query.toString());
}

app.get("/admin/tailan", requireAdmin, asyncRoute(async (req, res) => {
  const report = reports.buildReport(await db.listOrders(null));
  return renderPage(res, "report", {
    page: "admin",
    title: "Тайлан — Зуслан зүлэг сервис",
    report,
    reportJson: JSON.stringify(report).replace(/</g, "\\u003c"),
    scripts: [
      "https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js",
      "/assets/js/report.js"
    ]
  });
}));

app.post("/admin/tailan/tatakh", requireAdmin, asyncRoute(async (req, res) => {
  const report = reports.buildReport(await db.listOrders(null));
  const word = req.body.format === "word";
  const buffer = word ? await reports.toWord(report) : await reports.toExcel(report);
  const filename = "narlag-tailan-" + report.generatedAt + (word ? ".docx" : ".xlsx");
  res.setHeader("Content-Type", word
    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
  res.send(Buffer.from(buffer));
}));

app.get("/admin", requireAdmin, asyncRoute(async (req, res) => {
  const tab = req.query.tab === "orders" ? "orders" : "workers";
  return renderPage(res, "admin", {
    page: "admin",
    title: "Админ — Зуслан зүлэг сервис",
    tab,
    workers: await db.listWorkers(),
    jobs: orders.JOBS,
    orders: tab === "orders" ? await db.listOrders(null) : [],
    statuses: orders.STATUSES,
    notice: ADMIN_OK[req.query.ok] || "",
    error: ADMIN_ERR[req.query.err] || ""
  });
}));

app.post("/admin/ajilchin", requireAdmin, asyncRoute(async (req, res) => {
  const input = workerInput(req.body, true);
  if (input.error) return adminBack(res, input.error, "err");
  const created = await db.createWorker(input);
  if (!created) return adminBack(res, "taken", "err");
  adminBack(res, "created", "ok");
}));

app.post("/admin/ajilchin/:id", requireAdmin, asyncRoute(async (req, res) => {
  const input = workerInput(req.body, false);
  if (input.error) return adminBack(res, input.error, "err");
  const result = await db.updateWorker(req.params.id, input);
  if (result !== "saved") return adminBack(res, result, "err");
  adminBack(res, "saved", "ok");
}));

app.post("/admin/ajilchin/:id/ustgah", requireAdmin, asyncRoute(async (req, res) => {
  const result = await db.deleteWorker(req.params.id);
  if (result !== "deleted") return adminBack(res, result, "err");
  adminBack(res, "deleted", "ok");
}));

app.post("/admin/zahialga/:id/tuluv", requireAdmin, asyncRoute(async (req, res) => {
  const status = String(req.body.status || "");
  if (!orders.STATUSES.includes(status)) return res.redirect("/admin?tab=orders");
  await db.updateOrderStatus(req.params.id, status);
  res.redirect("/admin?tab=orders");
}));

app.get("/ajil", requireWorker, asyncRoute(async (req, res) => {
  return renderPage(res, "worker", {
    page: "work",
    title: "Захиалга — Зуслан зүлэг сервис",
    orders: await db.listOrders(null),
    notice: req.query.ok === "done" ? "Захиалгыг гүйцэтгэсэн болголоо." : (req.query.ok === "measured" ? "Бодит дүн хадгалагдлаа." : ""),
    error: req.query.err === "cancelled" ? "Цуцалсан захиалгыг засахгүй." : (req.query.err === "measure" ? "Хэмжээ болон дүн 0 буюу түүнээс их бүхэл тоо байна." : ""),
    scripts: ["/assets/js/map-view.js"],
    mapKey: process.env.MAPTILER_KEY || ""
  });
}));

async function saveMeasure(id, body) {
  const order = await db.getOrder(id);
  if (!order) return "missing";
  if (order.status === "цуцалсан") return "cancelled";
  const measure = orders.pricedMeasure(order, body);
  if (measure.error) return measure.error;
  const saved = await db.updateMeasurement(id, measure);
  return saved ? "saved" : "cancelled";
}

app.post("/ajil/zahialga/:id/hemjilt", requireWorker, asyncRoute(async (req, res) => {
  const result = await saveMeasure(req.params.id, req.body);
  if (result === "saved") return res.redirect("/ajil?ok=measured");
  return res.redirect("/ajil?err=" + (result === "measure" ? "measure" : "cancelled"));
}));

app.post("/admin/zahialga/:id/hemjilt", requireAdmin, asyncRoute(async (req, res) => {
  const result = await saveMeasure(req.params.id, req.body);
  if (result === "saved") return res.redirect("/admin?tab=orders&ok=measured");
  const code = result === "measure" ? "measure" : "cancelled";
  return res.redirect("/admin?tab=orders&err=" + code);
}));

app.post("/ajil/zahialga/:id/guitsesen", requireWorker, asyncRoute(async (req, res) => {
  const order = await db.getOrder(req.params.id);
  if (!order) return res.redirect("/ajil");
  if (order.status === "цуцалсан") return res.redirect("/ajil?err=cancelled");
  if (order.status !== orders.DONE) await db.updateOrderStatus(order.id, orders.DONE);
  res.redirect("/ajil?ok=done");
}));

async function receiveOrder(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ ok: false, message: "Захиалахын тулд нэвтэрнэ үү." });
  }
  try {
    const built = await orders.buildOrder(req.body || {}, req.session.user, await db.toolsById());
    if (built.honeypot) return res.json({ ok: true, id: "NS-0000", total: 0, deposit: 0 });
    await db.insertOrder(built);
    res.json({ ok: true, id: built.id, total: built.total, deposit: built.deposit, service: built.service });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ ok: false, message: error.message });
    throw error;
  }
}

app.post(["/api/orders", "/api/zahialga.php"], asyncRoute(receiveOrder));

app.use((req, res) => {
  res.status(404).send("Хуудас олдсонгүй.");
});

app.use((err, req, res, next) => {
  if (err.status === 403) {
    return renderPage(res.status(403), "forbidden", { title: "Хандах эрхгүй — Зуслан зүлэг сервис", page: "admin" });
  }
  console.error(err);
  if (req.path.startsWith("/api/")) {
    res.status(500).json({ ok: false, message: "Серверийн алдаа. Дахин оролдоно уу." });
    return;
  }
  res.status(500).send("Серверийн алдаа.");
});

db.init()
  .then(() => {
    app.listen(port, () => console.log("Сервер " + port + " порт дээр ажиллаж байна."));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
