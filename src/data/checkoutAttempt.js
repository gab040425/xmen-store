const STORAGE_PREFIX = "xmen-shop-checkout-attempt:"
const KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

const storageKey = (userId) =>
  userId == null ? null : `${STORAGE_PREFIX}${userId}`

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((sorted, key) => {
      sorted[key] = sortObjectKeys(value[key])
      return sorted
    }, {})
  }
  return value
}

export const serializeCheckoutPayload = (payload) =>
  JSON.stringify({
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      customization: sortObjectKeys(item.customization || {}),
    })),
    delivery: {
      name: payload.delivery.name.trim(),
      email: payload.delivery.email.trim(),
      phone: payload.delivery.phone.trim(),
      street: payload.delivery.street.trim(),
      city: payload.delivery.city.trim(),
      postal_code: payload.delivery.postal_code.trim(),
      country: payload.delivery.country.trim(),
    },
  })

export const readCheckoutAttempt = (userId) => {
  const key = storageKey(userId)
  if (!key) return null

  try {
    const value = JSON.parse(window.sessionStorage.getItem(key) || "null")
    if (
      !value ||
      !KEY_PATTERN.test(value.key) ||
      !value.payload ||
      !Array.isArray(value.payload.items) ||
      !value.payload.delivery ||
      !["pending", "conflict", "succeeded"].includes(value.status) ||
      (value.status === "succeeded" && (!Number.isSafeInteger(value.orderId) || value.orderId < 1)) ||
      value.snapshot !== serializeCheckoutPayload(value.payload)
    ) {
      return null
    }
    return value
  } catch {
    return null
  }
}

export const writeCheckoutAttempt = (userId, attempt) => {
  const key = storageKey(userId)
  if (!key) return false

  try {
    window.sessionStorage.setItem(key, JSON.stringify(attempt))
    return true
  } catch {
    return false
  }
}

export const clearCheckoutAttempt = (userId) => {
  const key = storageKey(userId)
  if (!key) return false

  try {
    window.sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export const clearCompletedCheckoutAttempt = (userId, orderId) => {
  const attempt = readCheckoutAttempt(userId)
  if (attempt?.status !== "succeeded" || attempt.orderId !== Number(orderId)) return false
  return clearCheckoutAttempt(userId)
}

export const createCheckoutIdempotencyKey = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  if (!window.crypto?.getRandomValues) throw new Error("Secure checkout storage is unavailable.")

  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
