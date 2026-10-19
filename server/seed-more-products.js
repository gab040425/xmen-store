import Database from "better-sqlite3"

const db = new Database("server/xmen-shop.db")
db.pragma("foreign_keys = ON")

// Demo prices and stock. Image URLs are direct product image assets.
const requiredCharacterIds = ["magneto", "storm", "gambit", "nightcrawler"]

const products = [
  {
    characterId: "magneto",
    productType: "funko_pop",
    name: "Magneto Classic Funko Pop",
    description: "A classic comic-inspired Magneto vinyl Pop figure.",
    priceCents: 1499,
    stockQuantity: 5,
    imageUrl: "https://funko.com/on/demandware.static/-/Sites-funko-master-catalog/default/dw547b7fb0/images/funko/49285-1.png",
  },
  {
    characterId: "magneto",
    productType: "mini_figurine",
    name: "Magneto X-Men Mini Co. Figurine",
    description: "A stylized Mini Co. figure of Magneto in his classic X-Men look.",
    priceCents: 3999,
    stockQuantity: 3,
    imageUrl: "https://www.sideshow.com/storage/product-images/911173/magneto-x-men-mini-co_marvel_gallery_6290f646d8403.jpg",
  },
  {
    characterId: "magneto",
    productType: "scale_1_6",
    name: "Magneto Sixth Scale Collectible Figure",
    description: "A detailed sixth-scale Magneto collectible figure.",
    priceCents: 29999,
    stockQuantity: 1,
    imageUrl: "https://www.sideshow.com/storage/product-images/100338/magneto_marvel_gallery_64b8ac3e93495.jpg",
  },
  {
    characterId: "storm",
    productType: "funko_pop",
    name: "Storm Wasteland Funko Pop",
    description: "A vinyl Pop figure of Storm in her Wasteland look from X-Men '97.",
    priceCents: 1499,
    stockQuantity: 5,
    imageUrl: "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dwedbb8a81/images/funko/upload/91896_Xmen97_POP5_POP_Glam-WEB.png?sh=800&sw=800",
  },
  {
    characterId: "storm",
    productType: "mini_figurine",
    name: "Storm Mini Co. Figurine",
    description: "A stylized Iron Studios Mini Co. figure of Storm above a Sentinel base.",
    priceCents: 3999,
    stockQuantity: 3,
    imageUrl: "https://ironstudios.com/cdn/shop/files/090258_0_1024x1024.jpg?v=1752766288",
  },
  {
    characterId: "storm",
    productType: "scale_1_6",
    name: "Storm Sixth Scale Figure by Mondo",
    description: "A sixth-scale Mondo collectible figure of Storm.",
    priceCents: 24999,
    stockQuantity: 2,
    imageUrl: "https://mondoshop.com/cdn/shop/files/Storm_PP008.jpg?v=1760557438&width=2000",
  },
  {
    characterId: "gambit",
    productType: "funko_pop",
    name: "Gambit Classic Funko Pop",
    description: "A comic-inspired vinyl Pop figure of the kinetic Cajun, Gambit.",
    priceCents: 1499,
    stockQuantity: 5,
    imageUrl: "https://funko.com/on/demandware.static/-/Sites-funko-master-catalog/default/dw00f36370/images/funko/45914-1.png",
  },
  {
    characterId: "gambit",
    productType: "mini_figurine",
    name: "Gambit Mini Co. Figurine",
    description: "A stylized Mini Co. figurine featuring Gambit with his signature cards.",
    priceCents: 3999,
    stockQuantity: 3,
    imageUrl: "https://www.wog.ch/nas/cover_large/fig/fig_marvelcomicsminicogambit17cm.jpg",
  },
  {
    characterId: "gambit",
    productType: "scale_1_6",
    name: "Gambit Sixth Scale Collectible Figure",
    description: "A detailed sixth-scale collectible figure of the X-Men's Gambit.",
    priceCents: 29999,
    stockQuantity: 1,
    imageUrl: "https://www.sideshow.com/storage/product-images/913187/gambit_marvel_gallery_65de7006c6744.jpg",
  },
  {
    characterId: "nightcrawler",
    productType: "funko_pop",
    name: "Nightcrawler Classic Funko Pop",
    description: "A classic blue-furred Nightcrawler vinyl Pop figure.",
    priceCents: 1499,
    stockQuantity: 5,
    imageUrl: "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw60648a4e/images/funko/49294-1.png?sh=800&sw=800",
  },
  {
    characterId: "nightcrawler",
    productType: "mini_figurine",
    name: "Nightcrawler X-Men Mini Co. Figurine",
    description: "A stylized Mini Co. figure of the teleporting X-Man.",
    priceCents: 3999,
    stockQuantity: 3,
    imageUrl: "https://www.sideshow.com/storage/product-images/911174/nightcrawler-x-men-mini-co_marvel_gallery_6290f67a549fb.jpg",
  },
  {
    characterId: "nightcrawler",
    productType: "scale_1_6",
    name: "Nightcrawler Sixth Scale Figure by Mondo",
    description: "A detailed sixth-scale Mondo figure of Nightcrawler.",
    priceCents: 29999,
    stockQuantity: 1,
    imageUrl: "https://www.sideshow.com/storage/product-images/914836/mondo-marvel-nightcrawler-sixth-scale-figure-gallery-68b875d026cff.jpg",
  },
]

const findCharacter = db.prepare("SELECT id FROM characters WHERE id = ?")
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
  for (const characterId of requiredCharacterIds) {
    if (!findCharacter.get(characterId)) {
      throw new Error(`Character '${characterId}' does not exist.`)
    }
  }

  let insertedCount = 0
  let skippedCount = 0

  for (const product of products) {
    const changes = insertIfMissing.run(
      product.characterId,
      product.productType,
      product.name,
      product.description,
      product.priceCents,
      product.stockQuantity,
      product.imageUrl,
      product.characterId,
      product.productType,
      product.name
    ).changes

    insertedCount += changes
    skippedCount += 1 - changes
  }

  return { insertedCount, skippedCount }
})

try {
  const { insertedCount, skippedCount } = seedProducts.immediate()
  console.log(
    `Product seed complete. Inserted ${insertedCount} demo products; skipped ${skippedCount} matching products.`,
  )
} catch (error) {
  console.error(`Product seed failed: ${error.message}`)
  process.exitCode = 1
} finally {
  db.close()
}
