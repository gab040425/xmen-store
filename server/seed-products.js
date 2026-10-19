/* global process */

import "dotenv/config";
import Database from "better-sqlite3";

const databasePath = process.env.DB_PATH || "server/xmen-shop.db";
const productTypes = ["funko_pop", "mini_figurine", "scale_1_6"];
const requiredCharacterIds = [
  "wolverine",
  "magneto",
  "storm",
  "gambit",
  "nightcrawler",
  "cyclops",
  "emma-frost",
  "jean-grey",
  "mystique",
  "polaris",
  "professor-x",
  "quicksilver",
  "scarlet-witch",
  "stepford-cuckoos",
];

const products = [
  {
    "characterId": "wolverine",
    "productType": "funko_pop",
    "name": "Wolverine Funko Pop",
    "description": "Classic unmasked Wolverine vinyl Pop figure.",
    "priceCents": 1499,
    "stockQuantity": 10,
    "imageUrl": "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw083c35b5/images/funko/upload/1/88207_Marvel_S1_UncannyWolverine_POP_EDIT_T7_GLAM_frontview-WEB.png?sh=800&sw=800",
    "isActive": 1
  },
  {
    "characterId": "wolverine",
    "productType": "mini_figurine",
    "name": "Wolverine Mini Figurine",
    "description": "A compact Wolverine mini-figure in an action pose.",
    "priceCents": 1999,
    "stockQuantity": 5,
    "imageUrl": "https://media.entertainmentearth.com/assets/images/057b244aae33434aa00a4e1062a01240lg.jpg",
    "isActive": 1
  },
  {
    "characterId": "wolverine",
    "productType": "scale_1_6",
    "name": "Wolverine 1:6 Scale Figurine",
    "description": "A detailed 1:6 scale Wolverine collectible figure.",
    "priceCents": 12999,
    "stockQuantity": 2,
    "imageUrl": "https://www.sideshow.com/storage/product-images/913487/wolverine_marvel_gallery_6669babca5a5b.jpg",
    "isActive": 1
  },
  {
    "characterId": "magneto",
    "productType": "funko_pop",
    "name": "Magneto Classic Funko Pop",
    "description": "A classic comic-inspired Magneto vinyl Pop figure.",
    "priceCents": 1499,
    "stockQuantity": 5,
    "imageUrl": "https://funko.com/on/demandware.static/-/Sites-funko-master-catalog/default/dw547b7fb0/images/funko/49285-1.png",
    "isActive": 1
  },
  {
    "characterId": "magneto",
    "productType": "mini_figurine",
    "name": "Magneto X-Men Mini Co. Figurine",
    "description": "A stylized Mini Co. figure of Magneto in his classic X-Men look.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": "https://www.sideshow.com/storage/product-images/911173/magneto-x-men-mini-co_marvel_gallery_6290f646d8403.jpg",
    "isActive": 1
  },
  {
    "characterId": "magneto",
    "productType": "scale_1_6",
    "name": "Magneto Sixth Scale Collectible Figure",
    "description": "A detailed sixth-scale Magneto collectible figure.",
    "priceCents": 29999,
    "stockQuantity": 1,
    "imageUrl": "https://www.sideshow.com/storage/product-images/100338/magneto_marvel_gallery_64b8ac3e93495.jpg",
    "isActive": 1
  },
  {
    "characterId": "storm",
    "productType": "funko_pop",
    "name": "Storm Wasteland Funko Pop",
    "description": "A vinyl Pop figure of Storm in her Wasteland look from X-Men '97.",
    "priceCents": 1499,
    "stockQuantity": 5,
    "imageUrl": "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dwedbb8a81/images/funko/upload/91896_Xmen97_POP5_POP_Glam-WEB.png?sh=800&sw=800",
    "isActive": 1
  },
  {
    "characterId": "storm",
    "productType": "mini_figurine",
    "name": "Storm Mini Co. Figurine",
    "description": "A stylized Iron Studios Mini Co. figure of Storm above a Sentinel base.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": "https://ironstudios.com/cdn/shop/files/090258_0_1024x1024.jpg?v=1752766288",
    "isActive": 1
  },
  {
    "characterId": "storm",
    "productType": "scale_1_6",
    "name": "Storm Sixth Scale Figure by Mondo",
    "description": "A sixth-scale Mondo collectible figure of Storm.",
    "priceCents": 24999,
    "stockQuantity": 2,
    "imageUrl": "https://mondoshop.com/cdn/shop/files/Storm_PP008.jpg?v=1760557438&width=2000",
    "isActive": 1
  },
  {
    "characterId": "gambit",
    "productType": "funko_pop",
    "name": "Gambit Classic Funko Pop",
    "description": "A comic-inspired vinyl Pop figure of the kinetic Cajun, Gambit.",
    "priceCents": 1499,
    "stockQuantity": 5,
    "imageUrl": "https://funko.com/on/demandware.static/-/Sites-funko-master-catalog/default/dw00f36370/images/funko/45914-1.png",
    "isActive": 1
  },
  {
    "characterId": "gambit",
    "productType": "mini_figurine",
    "name": "Gambit Mini Co. Figurine",
    "description": "A stylized Mini Co. figurine featuring Gambit with his signature cards.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": "https://www.wog.ch/nas/cover_large/fig/fig_marvelcomicsminicogambit17cm.jpg",
    "isActive": 1
  },
  {
    "characterId": "gambit",
    "productType": "scale_1_6",
    "name": "Gambit Sixth Scale Collectible Figure",
    "description": "A detailed sixth-scale collectible figure of the X-Men's Gambit.",
    "priceCents": 29999,
    "stockQuantity": 1,
    "imageUrl": "https://www.sideshow.com/storage/product-images/913187/gambit_marvel_gallery_65de7006c6744.jpg",
    "isActive": 1
  },
  {
    "characterId": "nightcrawler",
    "productType": "funko_pop",
    "name": "Nightcrawler Classic Funko Pop",
    "description": "A classic blue-furred Nightcrawler vinyl Pop figure.",
    "priceCents": 1499,
    "stockQuantity": 5,
    "imageUrl": "https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw60648a4e/images/funko/49294-1.png?sh=800&sw=800",
    "isActive": 1
  },
  {
    "characterId": "nightcrawler",
    "productType": "mini_figurine",
    "name": "Nightcrawler X-Men Mini Co. Figurine",
    "description": "A stylized Mini Co. figure of the teleporting X-Man.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": "https://www.sideshow.com/storage/product-images/911174/nightcrawler-x-men-mini-co_marvel_gallery_6290f67a549fb.jpg",
    "isActive": 1
  },
  {
    "characterId": "nightcrawler",
    "productType": "scale_1_6",
    "name": "Nightcrawler Sixth Scale Figure by Mondo",
    "description": "A detailed sixth-scale Mondo figure of Nightcrawler.",
    "priceCents": 29999,
    "stockQuantity": 1,
    "imageUrl": "https://www.sideshow.com/storage/product-images/914836/mondo-marvel-nightcrawler-sixth-scale-figure-gallery-68b875d026cff.jpg",
    "isActive": 1
  },
  {
    "characterId": "cyclops",
    "productType": "funko_pop",
    "name": "Cyclops Optic Blast Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Cyclops's ruby-quartz visor.",
    "priceCents": 1699,
    "stockQuantity": 8,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "cyclops",
    "productType": "mini_figurine",
    "name": "Cyclops Field Leader Mini Figurine",
    "description": "A fictional compact display figure of the X-Men's focused field leader.",
    "priceCents": 3499,
    "stockQuantity": 4,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "cyclops",
    "productType": "scale_1_6",
    "name": "Cyclops Visor Command 1:6 Figure",
    "description": "A fictional sixth-scale display figure in Cyclops's classic blue-and-yellow colors.",
    "priceCents": 21999,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "emma-frost",
    "productType": "funko_pop",
    "name": "Emma Frost Diamond Form Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible capturing Emma Frost's diamond form.",
    "priceCents": 1799,
    "stockQuantity": 6,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "emma-frost",
    "productType": "mini_figurine",
    "name": "White Queen Mini Figurine",
    "description": "A fictional compact Emma Frost display figure in an elegant white outfit.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "emma-frost",
    "productType": "scale_1_6",
    "name": "Emma Frost Hellfire 1:6 Figure",
    "description": "A fictional sixth-scale display figure inspired by the White Queen's Hellfire look.",
    "priceCents": 25999,
    "stockQuantity": 1,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "jean-grey",
    "productType": "funko_pop",
    "name": "Jean Grey Phoenix Spark Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Jean Grey's Phoenix power.",
    "priceCents": 1699,
    "stockQuantity": 7,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "jean-grey",
    "productType": "mini_figurine",
    "name": "Jean Grey Telepath Mini Figurine",
    "description": "A fictional compact display figure of Jean Grey surrounded by a Phoenix motif.",
    "priceCents": 3699,
    "stockQuantity": 5,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "jean-grey",
    "productType": "scale_1_6",
    "name": "Phoenix Rising 1:6 Figure",
    "description": "A fictional sixth-scale Jean Grey display figure with a flowing Phoenix-inspired design.",
    "priceCents": 27999,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "mystique",
    "productType": "funko_pop",
    "name": "Mystique Shapeshifter Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Mystique's blue appearance.",
    "priceCents": 1599,
    "stockQuantity": 5,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "mystique",
    "productType": "mini_figurine",
    "name": "Mystique Covert Agent Mini Figurine",
    "description": "A fictional compact display figure of the elusive shapeshifter.",
    "priceCents": 3299,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "mystique",
    "productType": "scale_1_6",
    "name": "Mystique Raven Form 1:6 Figure",
    "description": "A fictional sixth-scale display figure inspired by Mystique's classic look.",
    "priceCents": 23999,
    "stockQuantity": 1,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "polaris",
    "productType": "funko_pop",
    "name": "Polaris Magnetic Force Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Polaris's magnetic powers.",
    "priceCents": 1699,
    "stockQuantity": 6,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "polaris",
    "productType": "mini_figurine",
    "name": "Polaris Magnetic Orbit Mini Figurine",
    "description": "A fictional compact display figure of Polaris with a dynamic magnetic pose.",
    "priceCents": 3799,
    "stockQuantity": 4,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "polaris",
    "productType": "scale_1_6",
    "name": "Polaris Magnetic Guardian 1:6 Figure",
    "description": "A fictional sixth-scale Polaris display figure in her signature green palette.",
    "priceCents": 22999,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "professor-x",
    "productType": "funko_pop",
    "name": "Professor X Cerebro Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Professor X and Cerebro.",
    "priceCents": 1799,
    "stockQuantity": 5,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "professor-x",
    "productType": "mini_figurine",
    "name": "Professor X Mentor Mini Figurine",
    "description": "A fictional compact display figure honoring the X-Men's founder and mentor.",
    "priceCents": 3499,
    "stockQuantity": 3,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "professor-x",
    "productType": "scale_1_6",
    "name": "Professor X X-Mansion 1:6 Figure",
    "description": "A fictional sixth-scale Professor X display figure with a classic tailored look.",
    "priceCents": 19999,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "quicksilver",
    "productType": "funko_pop",
    "name": "Quicksilver Supersonic Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Quicksilver in motion.",
    "priceCents": 1599,
    "stockQuantity": 8,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "quicksilver",
    "productType": "mini_figurine",
    "name": "Quicksilver Speed Force Mini Figurine",
    "description": "A fictional compact display figure posed at super speed.",
    "priceCents": 3299,
    "stockQuantity": 5,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "quicksilver",
    "productType": "scale_1_6",
    "name": "Quicksilver Velocity 1:6 Figure",
    "description": "A fictional sixth-scale display figure inspired by Quicksilver's silver-and-blue suit.",
    "priceCents": 18999,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "scarlet-witch",
    "productType": "funko_pop",
    "name": "Scarlet Witch Chaos Magic Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible inspired by Scarlet Witch's chaos magic.",
    "priceCents": 1799,
    "stockQuantity": 6,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "scarlet-witch",
    "productType": "mini_figurine",
    "name": "Scarlet Witch Hex Mini Figurine",
    "description": "A fictional compact display figure with a dramatic spellcasting pose.",
    "priceCents": 3999,
    "stockQuantity": 3,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "scarlet-witch",
    "productType": "scale_1_6",
    "name": "Scarlet Witch Scarlet Hex 1:6 Figure",
    "description": "A fictional sixth-scale display figure inspired by Scarlet Witch's red costume.",
    "priceCents": 26999,
    "stockQuantity": 1,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "stepford-cuckoos",
    "productType": "funko_pop",
    "name": "Stepford Cuckoos Telepathic Trio Vinyl Collectible",
    "description": "A fictional demo-store vinyl collectible celebrating the Stepford Cuckoos' shared telepathy.",
    "priceCents": 1899,
    "stockQuantity": 4,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "stepford-cuckoos",
    "productType": "mini_figurine",
    "name": "Stepford Cuckoos Hive Mind Mini Figurine",
    "description": "A fictional compact display figure inspired by the sisters' coordinated powers.",
    "priceCents": 4499,
    "stockQuantity": 2,
    "imageUrl": null,
    "isActive": 1
  },
  {
    "characterId": "stepford-cuckoos",
    "productType": "scale_1_6",
    "name": "Stepford Cuckoos White Queen 1:6 Figure",
    "description": "A fictional sixth-scale display figure in a coordinated white uniform.",
    "priceCents": 24999,
    "stockQuantity": 0,
    "imageUrl": null,
    "isActive": 1
  }
];

const validateProducts = () => {
  if (products.length !== 42 || requiredCharacterIds.length !== 14) {
    throw new Error("The master seed must define 42 products for 14 characters.");
  }

  const requiredIds = new Set(requiredCharacterIds);
  const productNames = new Set();
  const combinations = new Set();

  for (const product of products) {
    const combination = product.characterId + ":" + product.productType;
    const productKey = combination + ":" + product.name;
    let imageIsValid = product.imageUrl === null;

    if (typeof product.imageUrl === "string" && product.imageUrl.length > 0 && product.imageUrl.length <= 2048) {
      try {
        const imageUrl = new URL(product.imageUrl);
        imageIsValid = ["http:", "https:"].includes(imageUrl.protocol) && Boolean(imageUrl.hostname);
      } catch {
        imageIsValid = false;
      }
    }

    if (
      !requiredIds.has(product.characterId) ||
      !productTypes.includes(product.productType) ||
      typeof product.name !== "string" ||
      product.name.trim().length === 0 ||
      product.name.length > 200 ||
      typeof product.description !== "string" ||
      product.description.trim().length === 0 ||
      !Number.isSafeInteger(product.priceCents) ||
      product.priceCents < 0 ||
      !Number.isSafeInteger(product.stockQuantity) ||
      product.stockQuantity < 0 ||
      ![0, 1].includes(product.isActive) ||
      !imageIsValid ||
      productNames.has(productKey) ||
      combinations.has(combination)
    ) {
      throw new Error("Invalid or duplicate product definition: " + productKey);
    }

    productNames.add(productKey);
    combinations.add(combination);
  }

  const expectedCombinations = new Set(
    requiredCharacterIds.flatMap(characterId =>
      productTypes.map(productType => characterId + ":" + productType),
    ),
  );
  if (combinations.size !== 42 || [...expectedCombinations].some(key => !combinations.has(key))) {
    throw new Error("Each character must have exactly one definition for every product type.");
  }
};

validateProducts();

const db = new Database(databasePath);
db.pragma("foreign_keys = ON");

try {
  const imageUrlColumn = db.pragma("table_info(products)").find(column => column.name === "image_url");
  if (!imageUrlColumn) throw new Error("The products table is missing its image_url column.");
  if (imageUrlColumn.notnull) throw new Error("The products table must allow NULL image_url values before running this seed.");

  const findCharacter = db.prepare("SELECT 1 FROM characters WHERE id = ?");
  const insertIfMissing = db.prepare(
    "INSERT INTO products (character_id, product_type, name, description, price_cents, stock_quantity, image_url, is_active) " +
    "SELECT ?, ?, ?, ?, ?, ?, ?, ? " +
    "WHERE NOT EXISTS (SELECT 1 FROM products WHERE character_id = ? AND product_type = ? AND name = ?)"
  );

  const seedProducts = db.transaction(() => {
    for (const characterId of requiredCharacterIds) {
      if (!findCharacter.get(characterId)) {
        throw new Error("Required character '" + characterId + "' does not exist.");
      }
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const changes = insertIfMissing.run(
        product.characterId,
        product.productType,
        product.name,
        product.description,
        product.priceCents,
        product.stockQuantity,
        product.imageUrl,
        product.isActive,
        product.characterId,
        product.productType,
        product.name,
      ).changes;
      insertedCount += changes;
      skippedCount += 1 - changes;
    }

    return { insertedCount, skippedCount };
  });

  const { insertedCount, skippedCount } = seedProducts.immediate();
  console.log("Product seed complete. Inserted " + insertedCount + " products; skipped " + skippedCount + " matching products.");
} catch (error) {
  console.error("Product seed failed: " + error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
