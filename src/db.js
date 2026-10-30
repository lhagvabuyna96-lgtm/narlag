const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL алга. Neon холболтын мөрийг .env эсвэл Render дээр тавина уу.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false }
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      rent INTEGER,
      buy INTEGER NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      area TEXT NOT NULL,
      place TEXT NOT NULL,
      visit_date DATE NOT NULL,
      time_window TEXT NOT NULL,
      lawn_m2 INTEGER NOT NULL DEFAULT 0,
      tree_small INTEGER NOT NULL DEFAULT 0,
      tree_mid INTEGER NOT NULL DEFAULT 0,
      tree_large INTEGER NOT NULL DEFAULT 0,
      edge BOOLEAN NOT NULL DEFAULT false,
      rent_days INTEGER NOT NULL DEFAULT 0,
      delivery BOOLEAN NOT NULL DEFAULT false,
      note TEXT NOT NULL DEFAULT '',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      service INTEGER NOT NULL DEFAULT 0,
      rent INTEGER NOT NULL DEFAULT 0,
      buy INTEGER NOT NULL DEFAULT 0,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      deposit INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'шинэ',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS session (
      sid varchar PRIMARY KEY,
      sess json NOT NULL,
      expire timestamp(6) NOT NULL
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire)');
  await seedTools();
  await seedAdmin();
}

async function seedTools() {
  const file = path.join(__dirname, "..", "assets", "data", "catalog.json");
  const tools = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const tool of tools) {
    await pool.query(
      `INSERT INTO tools (id, name, cat, icon, description, rent, buy, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         cat = EXCLUDED.cat,
         icon = EXCLUDED.icon,
         description = EXCLUDED.description,
         rent = EXCLUDED.rent,
         buy = EXCLUDED.buy,
         featured = EXCLUDED.featured`,
      [
        tool.id,
        tool.name,
        tool.cat,
        tool.icon,
        tool.desc,
        tool.rent,
        tool.buy,
        Boolean(tool.featured)
      ]
    );
  }
}

async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 8) {
    console.warn("ADMIN_EMAIL ба 8-аас урт ADMIN_PASSWORD тавиагүй тул админ үүсээгүй.");
    return;
  }
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, phone, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'admin')`,
    ["Админ", "99112244", email, passwordHash]
  );
  console.log("Админ бүртгэл үүслээ:", email);
}

function publicTool(row) {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    icon: row.icon,
    desc: row.description,
    rent: row.rent,
    buy: row.buy,
    featured: row.featured
  };
}

async function listTools() {
  const result = await pool.query(
    "SELECT id, name, cat, icon, description, rent, buy, featured FROM tools ORDER BY featured DESC, name"
  );
  return result.rows.map(publicTool);
}

async function toolsById() {
  const tools = await listTools();
  const map = new Map();
  tools.forEach((tool) => map.set(tool.id, tool));
  return map;
}

function publicUser(row) {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email, role: row.role };
}

async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, name, phone, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

async function createCustomer({ name, phone, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, phone, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, name, phone, email, role`,
    [name, phone, email, passwordHash]
  );
  return publicUser(result.rows[0]);
}

async function insertOrder(order) {
  await pool.query(
    `INSERT INTO orders (
      id, user_id, customer_name, phone, area, place, visit_date, time_window,
      lawn_m2, tree_small, tree_mid, tree_large, edge, rent_days, delivery, note,
      items, service, rent, buy, delivery_fee, deposit, total, status
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,$14,$15,$16,
      $17::jsonb,$18,$19,$20,$21,$22,$23,'шинэ'
    )`,
    [
      order.id, order.userId, order.name, order.phone, order.area, order.place, order.date, order.time,
      order.lawn, order.small, order.mid, order.large, order.edge, order.days, order.delivery, order.note,
      JSON.stringify(order.items), order.service, order.rent, order.buy, order.deliveryFee, order.deposit, order.total
    ]
  );
}

async function listOrders(userId) {
  const result = userId
    ? await pool.query(
      `SELECT o.*, u.email FROM orders o LEFT JOIN users u ON u.id = o.user_id
       WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    )
    : await pool.query(
      `SELECT o.*, u.email FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
  return result.rows;
}

async function updateOrderStatus(id, status) {
  const result = await pool.query(
    "UPDATE orders SET status = $2 WHERE id = $1 RETURNING id",
    [id, status]
  );
  return result.rowCount > 0;
}

module.exports = {
  pool,
  init,
  listTools,
  toolsById,
  findUserByEmail,
  createCustomer,
  publicUser,
  insertOrder,
  listOrders,
  updateOrderStatus
};
