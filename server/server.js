/* global process */
import express from "express"
import cors from "cors"
import Database from "better-sqlite3"
import bcrypt from "bcrypt"
import session from "express-session"
import "dotenv/config";
import { createHash } from "node:crypto"
import { resolve } from "node:path"

const app = express()
const databasePath = resolve(process.env.DB_PATH || "server/xmen-shop.db")
const installationId = createHash("sha256").update(databasePath).digest("hex")
const db = new Database(databasePath)
db.pragma("foreign_keys = ON")
if (db.pragma("foreign_keys", { simple: true }) !== 1) {
  throw new Error("SQLite foreign-key enforcement could not be enabled.")
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run()

const userColumns = db.prepare(`
  PRAGMA table_info(users)
`).all()

const existingColumns = userColumns.map(column => column.name)

if (!existingColumns.includes("phone")) {
  db.prepare(`
    ALTER TABLE users ADD COLUMN phone TEXT
  `).run()
}

if (!existingColumns.includes("street")) {
  db.prepare(`
    ALTER TABLE users ADD COLUMN street TEXT
  `).run()
}

if (!existingColumns.includes("city")) {
  db.prepare(`
    ALTER TABLE users ADD COLUMN city TEXT
  `).run()
}

if (!existingColumns.includes("postal_code")) {
  db.prepare(`
    ALTER TABLE users ADD COLUMN postal_code TEXT
  `).run()
}

if (!existingColumns.includes("country")) {
  db.prepare(`
    ALTER TABLE users ADD COLUMN country TEXT
  `).run()
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS favourites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    character_id TEXT NOT NULL,
    UNIQUE(user_id, character_id)
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    total REAL NOT NULL
  )
`).run()

const orderColumns = db.prepare(`
  PRAGMA table_info(orders)
`).all().map(column => column.name)

const orderColumnMigrations = [
  ["total_cents", `INTEGER CHECK (
    total_cents IS NULL OR (typeof(total_cents) = 'integer' AND total_cents >= 0)
  )`],
  ["customer_name", `TEXT CHECK (customer_name IS NULL OR length(customer_name) <= 100)`],
  ["customer_email", `TEXT CHECK (customer_email IS NULL OR length(customer_email) <= 254)`],
  ["customer_phone", `TEXT CHECK (customer_phone IS NULL OR length(customer_phone) <= 32)`],
  ["shipping_street", `TEXT CHECK (shipping_street IS NULL OR length(shipping_street) <= 200)`],
  ["shipping_city", `TEXT CHECK (shipping_city IS NULL OR length(shipping_city) <= 100)`],
  ["shipping_postal_code", `TEXT CHECK (shipping_postal_code IS NULL OR length(shipping_postal_code) <= 20)`],
  ["shipping_country", `TEXT CHECK (shipping_country IS NULL OR length(shipping_country) <= 100)`],
  ["idempotency_key", `TEXT CHECK (idempotency_key IS NULL OR length(idempotency_key) BETWEEN 16 AND 128)`],
  ["request_fingerprint", `TEXT CHECK (request_fingerprint IS NULL OR length(request_fingerprint) = 64)`],
]

for (const [columnName, columnDefinition] of orderColumnMigrations) {
  if (!orderColumns.includes(columnName)) {
    db.exec(`ALTER TABLE orders ADD COLUMN ${columnName} ${columnDefinition}`)
  }
}

db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_orders_user_order_date
  ON orders (user_id, order_date DESC)
`).run()

db.prepare(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency_key
  ON orders (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    popularity INTEGER NOT NULL,
    accent TEXT NOT NULL,
    accent_secondary TEXT,
    image TEXT NOT NULL,
    image_position TEXT,
    bio TEXT NOT NULL
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    character_id TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (
      product_type IN ('funko_pop', 'mini_figurine', 'scale_1_6')
    ),
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL CHECK (
      typeof(price_cents) = 'integer' AND price_cents >= 0
    ),
    stock_quantity INTEGER NOT NULL CHECK (
      typeof(stock_quantity) = 'integer' AND stock_quantity >= 0
    ),
    image_url TEXT CHECK (length(image_url) BETWEEN 1 AND 2048),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE RESTRICT
  )
`).run()

const productImageUrlColumn = db.pragma("table_info(products)")
  .find(column => column.name === "image_url")

if (!productImageUrlColumn) {
  throw new Error("The products table is missing its image_url column.")
}

if (productImageUrlColumn.notnull) {
  const sqliteVersion = db.prepare("SELECT sqlite_version() AS version").get().version
  const [major, minor, patch] = sqliteVersion.split(".").map(Number)
  const supportsDropNotNull = major > 3 || (major === 3 && (minor > 53 || (minor === 53 && patch >= 0)))

  if (!supportsDropNotNull) {
    throw new Error(`Making product images optional requires SQLite 3.53.0 or newer; found ${sqliteVersion}.`)
  }

  db.transaction(() => {
    db.exec("ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL")
  }).immediate()
}

db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_products_character_active_type
  ON products (character_id, is_active, product_type)
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL CHECK (length(trim(product_name)) BETWEEN 1 AND 200),
    product_type TEXT NOT NULL CHECK (
      product_type IN ('funko_pop', 'mini_figurine', 'scale_1_6')
    ),
    quantity INTEGER NOT NULL CHECK (
      typeof(quantity) = 'integer' AND quantity > 0
    ),
    unit_price_cents INTEGER NOT NULL CHECK (
      typeof(unit_price_cents) = 'integer' AND unit_price_cents >= 0
    ),
    line_total_cents INTEGER NOT NULL CHECK (
      typeof(line_total_cents) = 'integer' AND line_total_cents >= 0
    ),
    customization_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  )
`).run()

db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id, id)
`).run()

db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items (product_id)
`).run()

db.prepare(`
  CREATE TRIGGER IF NOT EXISTS products_set_updated_at
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN NEW.updated_at = OLD.updated_at
  BEGIN
    UPDATE products
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
  END
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS abilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id)
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS character_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL,
    alias TEXT NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id)
  )
`).run()

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(express.json())

const setAuthenticatedUser = (req, userId) => {
  req.session.userId = userId
}

const makeOrderError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode })

const isPlainObject = value =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const hasOnlyKeys = (value, allowedKeys) =>
  Object.keys(value).every(key => allowedKeys.includes(key))

const orderTotalCents = order => {
  if (order.total_cents !== null && typeof order.total_cents !== "undefined") {
    return Number.isSafeInteger(order.total_cents) && order.total_cents >= 0
      ? order.total_cents
      : null
  }

  const legacyTotal = Number(order.total)
  const legacyTotalCents = Math.round(legacyTotal * 100)
  return Number.isFinite(legacyTotal) && legacyTotal >= 0 && Number.isSafeInteger(legacyTotalCents)
    ? legacyTotalCents
    : null
}

app.get("/api/orders", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." })
  }

  const orders = db.prepare(`
    SELECT id, order_date, status, total, total_cents
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC, id DESC
  `).all(req.session.userId).map(order => ({
    ...order,
    total_cents: orderTotalCents(order),
  }))

  res.json({ orders })
})

app.get("/api/orders/:orderId", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." })
  }

  if (!/^[1-9]\d*$/.test(req.params.orderId)) {
    return res.status(400).json({ message: "Invalid order ID." })
  }

  const orderId = Number(req.params.orderId)
  if (!Number.isSafeInteger(orderId)) {
    return res.status(400).json({ message: "Invalid order ID." })
  }

  const order = db.prepare(`
    SELECT id, order_date, status, total, total_cents
    FROM orders
    WHERE id = ? AND user_id = ?
  `).get(orderId, req.session.userId)

  if (!order) {
    return res.status(404).json({ message: "Order not found." })
  }

  const items = db.prepare(`
    SELECT id, product_id, product_name, product_type, quantity,
           unit_price_cents, line_total_cents, customization_json
    FROM order_items
    WHERE order_id = ?
    ORDER BY id
  `).all(orderId).map(item => {
    let customization = null
    if (item.customization_json) {
      try {
        customization = JSON.parse(item.customization_json)
      } catch {
        customization = null
      }
    }

    return {
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_type: item.product_type,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      line_total_cents: item.line_total_cents,
      customization,
    }
  })

  res.json({
    order: {
      ...order,
      total_cents: orderTotalCents(order),
    },
    items,
  })
})

app.post("/api/orders", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." })
  }

  const idempotencyKey = req.get("Idempotency-Key")
  if (
    typeof idempotencyKey !== "string" ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)
  ) {
    return res.status(400).json({ message: "Provide a valid Idempotency-Key header." })
  }

  const body = req.body
  if (
    !isPlainObject(body) ||
    !hasOnlyKeys(body, ["items", "delivery"]) ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 50
  ) {
    return res.status(400).json({ message: "Provide between 1 and 50 valid order items." })
  }

  if (!isPlainObject(body.delivery)) {
    return res.status(400).json({ message: "Provide delivery details." })
  }

  const deliveryFields = ["name", "email", "phone", "street", "city", "postal_code", "country"]
  if (!hasOnlyKeys(body.delivery, deliveryFields)) {
    return res.status(400).json({ message: "Delivery details contain unsupported fields." })
  }

  const requiredDeliveryFields = [
    ["name", 100],
    ["email", 254],
    ["street", 200],
    ["city", 100],
    ["postal_code", 20],
    ["country", 100],
  ]
  const delivery = {}

  for (const [field, maxLength] of requiredDeliveryFields) {
    const value = body.delivery[field]
    if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
      return res.status(400).json({ message: `Enter a valid ${field.replaceAll("_", " ")}.` })
    }
    delivery[field] = value.trim()
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email)) {
    return res.status(400).json({ message: "Enter a valid email address." })
  }

  if (body.delivery.phone !== undefined && body.delivery.phone !== null) {
    if (typeof body.delivery.phone !== "string" || body.delivery.phone.trim().length > 32) {
      return res.status(400).json({ message: "Enter a valid phone number." })
    }
    delivery.phone = body.delivery.phone.trim() || null
  } else {
    delivery.phone = null
  }

  const requestedItems = new Map()
  for (const item of body.items) {
    if (
      !isPlainObject(item) ||
      !hasOnlyKeys(item, ["productId", "quantity", "customization"]) ||
      !Number.isSafeInteger(item.productId) || item.productId < 1 ||
      !Number.isSafeInteger(item.quantity) || item.quantity < 1
    ) {
      return res.status(400).json({ message: "Each item needs a positive productId and quantity." })
    }

    const customization = item.customization === undefined ? {} : item.customization
    if (!isPlainObject(customization) || Object.keys(customization).length > 0) {
      return res.status(400).json({ message: "Product customization is not supported yet." })
    }

    const key = `${item.productId}:${JSON.stringify(customization)}`
    const existingItem = requestedItems.get(key)
    const quantity = (existingItem?.quantity || 0) + item.quantity
    if (!Number.isSafeInteger(quantity)) {
      return res.status(400).json({ message: "Requested quantity is too large." })
    }
    requestedItems.set(key, {
      productId: item.productId,
      quantity,
      customizationJson: null,
    })
  }

  const orderItems = [...requestedItems.values()].sort((left, right) => left.productId - right.productId)
  const normalizedRequest = {
    items: orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      customization: {},
    })),
    delivery: {
      name: delivery.name,
      email: delivery.email,
      phone: delivery.phone,
      street: delivery.street,
      city: delivery.city,
      postal_code: delivery.postal_code,
      country: delivery.country,
    },
  }
  const requestFingerprint = createHash("sha256")
    .update(JSON.stringify(normalizedRequest))
    .digest("hex")
  const findActiveProduct = db.prepare(`
    SELECT id, product_type, name, price_cents, stock_quantity
    FROM products
    WHERE id = ? AND is_active = 1
  `)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      user_id, order_date, status, total, total_cents,
      customer_name, customer_email, customer_phone,
      shipping_street, shipping_city, shipping_postal_code, shipping_country,
      idempotency_key, request_fingerprint
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const findIdempotentOrder = db.prepare(`
    SELECT id, status, total, total_cents, request_fingerprint
    FROM orders
    WHERE user_id = ? AND idempotency_key = ?
  `)
  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      order_id, product_id, product_name, product_type, quantity,
      unit_price_cents, line_total_cents, customization_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const decrementStock = db.prepare(`
    UPDATE products
    SET stock_quantity = stock_quantity - ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ? AND is_active = 1 AND stock_quantity >= ?
  `)

  const createOrder = db.transaction(() => {
    const existingOrder = findIdempotentOrder.get(req.session.userId, idempotencyKey)
    if (existingOrder) {
      if (existingOrder.request_fingerprint !== requestFingerprint) {
        throw makeOrderError(409, "This idempotency key was already used for different checkout details.")
      }

      const existingTotalCents = orderTotalCents(existingOrder)
      if (existingTotalCents === null) {
        throw makeOrderError(500, "The existing order total cannot be processed.")
      }

      return {
        orderId: existingOrder.id,
        status: existingOrder.status,
        totalCents: existingTotalCents,
        replayed: true,
      }
    }

    let totalCents = 0
    const checkedItems = orderItems.map(item => {
      const product = findActiveProduct.get(item.productId)
      if (!product) {
        throw makeOrderError(404, `Product ${item.productId} was not found or is no longer available.`)
      }
      if (item.quantity > product.stock_quantity) {
        throw makeOrderError(409, `${product.name} does not have enough stock for the requested quantity.`)
      }
      if (!Number.isSafeInteger(product.price_cents)) {
        throw makeOrderError(500, `The stored price for ${product.name} cannot be processed.`)
      }

      const lineTotalCents = product.price_cents * item.quantity
      totalCents += lineTotalCents
      if (!Number.isSafeInteger(lineTotalCents) || !Number.isSafeInteger(totalCents)) {
        throw makeOrderError(400, "The order total is too large to process.")
      }

      return {
        ...item,
        productName: product.name,
        productType: product.product_type,
        unitPriceCents: product.price_cents,
        lineTotalCents,
      }
    })

    const orderResult = insertOrder.run(
      req.session.userId,
      new Date().toISOString(),
      "test_order_made",
      totalCents / 100,
      totalCents,
      delivery.name,
      delivery.email,
      delivery.phone,
      delivery.street,
      delivery.city,
      delivery.postal_code,
      delivery.country,
      idempotencyKey,
      requestFingerprint
    )
    const orderId = Number(orderResult.lastInsertRowid)

    for (const item of checkedItems) {
      const stockUpdate = decrementStock.run(item.quantity, item.productId, item.quantity)
      if (stockUpdate.changes !== 1) {
        throw makeOrderError(409, `${item.productName} no longer has enough stock.`)
      }

      insertOrderItem.run(
        orderId,
        item.productId,
        item.productName,
        item.productType,
        item.quantity,
        item.unitPriceCents,
        item.lineTotalCents,
        item.customizationJson
      )
    }

    return { orderId, totalCents, status: "test_order_made", replayed: false }
  })

  try {
    const { orderId, status, totalCents, replayed } = createOrder.immediate()
    return res.status(replayed ? 200 : 201).json({
      message: replayed
        ? "The existing test order was returned. No payment has been taken."
        : "Test order created. No payment has been taken.",
      orderId,
      status,
      totalCents,
      total: totalCents / 100,
      paymentReceived: false,
    })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }

    console.error("Order creation failed:", error)
    return res.status(500).json({ message: "Unable to create the test order." })
  }
})

const PORT = Number(process.env.PORT) || 3000

const isValidProductImageUrl = (value) => {
  if (value === null) return true

  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return false
  }

  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `)

    try {
        const result = insertUser.run(name, email, hashedPassword)
        const user = db.prepare(`
          SELECT id, name, email, phone, street, city, postal_code, country
          FROM users
          WHERE id = ?
        `).get(Number(result.lastInsertRowid))

        setAuthenticatedUser(req, user.id)

        res.json({
            message: "Registration successful!",
          user: { ...user, installationId }
        })
        } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
            message: "An account with this email already exists."
            })
        }

        res.status(500).json({
            message: "Something went wrong while creating your account."
        })
    }
})

app.post("/api/login", async (req, res) => {
    console.log("LOGIN REQUEST RECEIVED")
  const { email, password } = req.body

  const user = db.prepare(`
    SELECT * FROM users
    WHERE email = ?
  `).get(email)

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password."
    })
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid email or password."
    })
  }

  setAuthenticatedUser(req, user.id)
  console.log("SESSION AFTER LOGIN:", req.session)

  res.json({
    message: "Login successful!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      street: user.street ?? null,
      city: user.city ?? null,
      postal_code: user.postal_code ?? null,
      country: user.country ?? null,
      installationId
    }
  })
})

app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Could not log out."
      })
    }

    res.json({
      message: "Logout successful."
    })
  })
})

app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const user = db.prepare(`
    SELECT id, name, email, phone, street, city, postal_code, country
    FROM users
    WHERE id = ?
  `).get(req.session.userId)

  if (!user) {
    return res.status(401).json({
      message: "User not found."
    })
  }

  res.json({
    user: { ...user, installationId }
  })
})

app.put("/api/account", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const {
    name,
    email,
    phone,
    street,
    city,
    postal_code,
    country
  } = req.body

  try {
    db.prepare(`
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        street = ?,
        city = ?,
        postal_code = ?,
        country = ?
      WHERE id = ?
    `).run(
      name,
      email,
      phone,
      street,
      city,
      postal_code,
      country,
      req.session.userId
    )

    res.json({
      message: "Account updated successfully."
    })
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "An account with this email already exists."
      })
    }

    res.status(500).json({
      message: "Something went wrong while updating your account."
    })
  }
})

app.delete("/api/account", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `).run(req.session.userId)

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Account deleted, but could not clear the session."
      })
    }

    res.json({
      message: "Account deleted successfully."
    })
  })
})

app.post("/api/favourites", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const { characterId } = req.body

  try {
    db.prepare(`
      INSERT INTO favourites (user_id, character_id)
      VALUES (?, ?)
    `).run(req.session.userId, characterId)

    res.json({
      message: "Favourite added."
    })
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Character is already a favourite."
      })
    }

    res.status(500).json({
      message: "Something went wrong."
    })
  }
})

app.delete("/api/favourites/:characterId", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const { characterId } = req.params

  db.prepare(`
    DELETE FROM favourites
    WHERE user_id = ? AND character_id = ?
  `).run(req.session.userId, characterId)

  res.json({
    message: "Favourite removed."
  })
})

app.get("/api/favourites", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const favourites = db.prepare(`
    SELECT character_id
    FROM favourites
    WHERE user_id = ?
  `).all(req.session.userId)

  res.json({
    favourites: favourites.map(favourite => favourite.character_id)
  })
})

app.get("/api/characters", (req, res) => {
    const characters = db.prepare(`
        SELECT *
        FROM characters
        ORDER BY popularity DESC
    `).all()

    const getAliases = db.prepare(`
        SELECT alias
        FROM character_aliases
        WHERE character_id = ?
    `)

    const getAbilities = db.prepare(`
        SELECT id, name, description
        FROM abilities
        WHERE character_id = ?
    `)

    const result = characters.map(character => ({
        ...character,
        aliases: getAliases.all(character.id).map(row => row.alias),
        abilities: getAbilities.all(character.id)
    }))

    res.json(result)
})

app.get("/api/products", (req, res) => {
  const { characterId } = req.query
  let products

  if (characterId !== undefined) {
    if (
      typeof characterId !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(characterId)
    ) {
      return res.status(400).json({ message: "Invalid characterId." })
    }

    const characterExists = db.prepare(
      "SELECT 1 FROM characters WHERE id = ?"
    ).get(characterId)

    if (!characterExists) {
      return res.status(404).json({ message: "Character not found." })
    }

    products = db.prepare(`
      SELECT id, character_id, product_type, name, description, price_cents,
             stock_quantity, image_url, is_active, created_at, updated_at
      FROM products
      WHERE is_active = 1 AND character_id = ?
      ORDER BY product_type, name COLLATE NOCASE, id
    `).all(characterId)
  } else {
    products = db.prepare(`
      SELECT id, character_id, product_type, name, description, price_cents,
             stock_quantity, image_url, is_active, created_at, updated_at
      FROM products
      WHERE is_active = 1
      ORDER BY character_id, product_type, name COLLATE NOCASE, id
    `).all()
  }

  if (products.some(product => !isValidProductImageUrl(product.image_url))) {
    return res.status(500).json({ message: "A product has an invalid image URL." })
  }

  res.json(products)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
