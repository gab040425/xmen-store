export const loadProducts = async (characterId, { signal } = {}) => {
  const query = new URLSearchParams()

  if (characterId) {
    query.set("characterId", characterId)
  }

  const queryString = query.toString()
  const endpoint = `http://localhost:3000/api/products${queryString ? `?${queryString}` : ""}`
  const response = await fetch(endpoint, { signal })

  if (!response.ok) {
    let message = `Failed to load products (${response.status}).`

    try {
      const errorData = await response.json()
      if (errorData.message) message = errorData.message
    } catch {
      // Keep the status-based message if the error response isn't JSON.
    }

    throw new Error(message)
  }

  const products = await response.json()

  if (!Array.isArray(products)) {
    throw new Error("The products API returned an invalid response.")
  }

  return products
}
