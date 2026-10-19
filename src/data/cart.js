const CART_STORAGE_PREFIX = "xmen-shop-cart:"

export const getCartStorageKey = (userId, installationId) =>
  userId === null || typeof userId === "undefined" ||
  typeof installationId !== "string" || installationId.length === 0
    ? null
    : `${CART_STORAGE_PREFIX}${installationId}:${userId}`

const isCartItem = (item) =>
  item &&
  typeof item.key === "string" &&
  typeof item.productId !== "undefined" &&
  typeof item.name === "string" &&
  typeof item.productType === "string" &&
  Number.isInteger(item.priceCents) &&
  item.priceCents >= 0 &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0

export const readCart = (userId, installationId) => {
  const storageKey = getCartStorageKey(userId, installationId)
  if (!storageKey) return []

  try {
    const storedCart = window.localStorage.getItem(storageKey)
    const parsedCart = storedCart ? JSON.parse(storedCart) : []
    return Array.isArray(parsedCart) ? parsedCart.filter(isCartItem) : []
  } catch {
    return []
  }
}

export const writeCart = (cart, userId, installationId) => {
  const storageKey = getCartStorageKey(userId, installationId)
  if (!storageKey) return

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(cart))
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }
}

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys)
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = sortObjectKeys(value[key])
        return sorted
      }, {})
  }

  return value
}

const normalizeCustomization = (customization) =>
  customization && typeof customization === "object" && !Array.isArray(customization)
    ? sortObjectKeys(customization)
    : {}

export const addProductToCart = (cart, product, customization = {}) => {
  const selectedCustomization = normalizeCustomization(customization)
  const key = `${product.id}:${JSON.stringify(selectedCustomization)}`
  const existingItem = cart.find((item) => item.key === key)

  if (existingItem) {
    return cart.map((item) =>
      item.key === key ? { ...item, quantity: item.quantity + 1 } : item
    )
  }

  return [
    ...cart,
    {
      key,
      productId: product.id,
      characterId: product.character_id,
      name: product.name,
      productType: product.product_type,
      description: product.description || "",
      priceCents: product.price_cents,
      quantity: 1,
      customization: selectedCustomization,
    },
  ]
}

export const setCartItemQuantity = (cart, key, quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) return cart
  return cart.map((item) => (item.key === key ? { ...item, quantity } : item))
}

export const removeCartItem = (cart, key) =>
  cart.filter((item) => item.key !== key)

export const getCartItemCount = (cart) =>
  cart.reduce((total, item) => total + item.quantity, 0)

export const getCartTotalCents = (cart) =>
  cart.reduce((total, item) => total + item.priceCents * item.quantity, 0)
