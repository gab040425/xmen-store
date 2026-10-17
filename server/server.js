/* global process */
import express from "express"
import cors from "cors"
import Database from "better-sqlite3"
import bcrypt from "bcrypt"
import session from "express-session"
import "dotenv/config";

const app = express()
const db = new Database("server/xmen-shop.db")

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

app.get("/api/orders", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in."
    })
  }

  const orders = db.prepare(`
    SELECT id, order_date, status, total
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
  `).all(req.session.userId)

  res.json({
    orders: orders
  })
})

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(express.json())

const PORT = 3000

app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `)

    try {
        insertUser.run(name, email, hashedPassword)

        res.json({
            message: "Registration successful!",
            name: name,
            email: email
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

  req.session.userId = user.id
  console.log("SESSION AFTER LOGIN:", req.session)

  res.json({
    message: "Login successful!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
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
    user: user
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
