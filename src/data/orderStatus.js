const positiveStatuses = new Set([
  "test_order_made",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "fulfilled",
  "successful",
  "succeeded",
])

const negativeStatuses = new Set([
  "failed",
  "unsuccessful",
  "cancelled",
  "canceled",
])

export const getOrderStatusTone = (status) => {
  if (typeof status !== "string") return "neutral"

  const normalizedStatus = status.trim().toLowerCase()
  if (positiveStatuses.has(normalizedStatus)) return "positive"
  if (negativeStatuses.has(normalizedStatus)) return "negative"
  return "neutral"
}
