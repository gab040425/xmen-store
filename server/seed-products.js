import Database from "better-sqlite3"

const db = new Database("server/xmen-shop.db")
db.pragma("foreign_keys = ON")

const characterId = "wolverine"

const products = [
  {
    productType: "funko_pop",
    name: "Wolverine Funko Pop",
    description: "Classic unmasked Wolverine vinyl Pop figure.",
    priceCents: 1499,
    stockQuantity: 10,
    imageUrl: "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw083c35b5/images/funko/upload/1/88207_Marvel_S1_UncannyWolverine_POP_EDIT_T7_GLAM_frontview-WEB.png?sh=800&sw=800",
  },
  {
    productType: "mini_figurine",
    name: "Wolverine Mini Figurine",
    description: "A compact Wolverine mini-figure in an action pose.",
    priceCents: 1999,
    stockQuantity: 5,
    imageUrl: "https://media.entertainmentearth.com/assets/images/057b244aae33434aa00a4e1062a01240lg.jpg",
  },
  {
    productType: "scale_1_6",
    name: "Wolverine 1:6 Scale Figurine",
    description: "A detailed 1:6 scale Wolverine collectible figure.",
    priceCents: 12999,
    stockQuantity: 2,
    imageUrl: "https://www.sideshow.com/storage/product-images/913487/wolverine_marvel_gallery_6669babca5a5b.jpg",
  },
]

const insertIfMissing = db.prepare(`
  INSERT INTO products (
    character_id,
    product_type,
    name,
    description,
    price_cents,
    stock_quantity,
    image_url,
    is_active
  )
  SELECT ?, ?, ?, ?, ?, ?, ?, 1
  WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE character_id = ? AND product_type = ? AND name = ?
  )
`)

const seedProducts = db.transaction(() => {
  const character = db.prepare(
    "SELECT id FROM characters WHERE id = ?"
  ).get(characterId)

  if (!character) {
    throw new Error(`Character '${characterId}' does not exist.`)
  }

  let insertedCount = 0

  for (const product of products) {
    insertedCount += insertIfMissing.run(
      characterId,
      product.productType,
      product.name,
      product.description,
      product.priceCents,
      product.stockQuantity,
      product.imageUrl,
      characterId,
      product.productType,
      product.name
    ).changes
  }

  return insertedCount
})

try {
  const insertedCount = seedProducts.immediate()
  console.log(`Product seed complete. Inserted ${insertedCount} demo products.`)
} finally {
  db.close()
}
