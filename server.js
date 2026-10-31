require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./src/db");
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
    offer: "",
    ...data,
    catalog: catalog.catalogJson(tools)
  });
}

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  return res.redirect("/nevtreh?next=" + encodeURIComponent(req.originalUrl));
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect("/nevtreh?next=" + encodeURIComponent(req.originalUrl));
  if (req.session.user.role !== "admin") {
    const error = new Error("forbidden");
    error.status = 403;
    return next(error);
  }
  return next();
}

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
  scripts: ["/assets/js/booking.js"]
})));

app.get("/nevtreh", asyncRoute((req, res) => {
  if (req.session.user) return res.redirect(req.session.user.role === "admin" ? "/admin" : "/profile");
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
  if (!matches) {
    return renderPage(res.status(401), "auth", {
      page: "login",
      title: "Нэвтрэх — Зуслан зүлэг сервис",
      mode: "login",
      nextPath,
      error: "Имэйл эсвэл нууц үг буруу байна."
    });
  }
  req.session.user = db.publicUser(row);
  const landing = row.role === "admin" ? "/admin" : "/profile";
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
  return renderPage(res, "orders", {
    page: "mine",
    title: "Миний захиалга — Зуслан зүлэг сервис",
    orders: await db.listOrders(req.session.user.id)
  });
}));

app.get("/admin", requireAdmin, asyncRoute(async (req, res) => {
  return renderPage(res, "admin", {
    page: "admin",
    title: "Админ — Зуслан зүлэг сервис",
    orders: await db.listOrders(null),
    statuses: orders.STATUSES
  });
}));

app.post("/admin/zahialga/:id/tuluv", requireAdmin, asyncRoute(async (req, res) => {
  const status = String(req.body.status || "");
  if (!orders.STATUSES.includes(status)) return res.redirect("/admin");
  await db.updateOrderStatus(req.params.id, status);
  res.redirect("/admin");
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
