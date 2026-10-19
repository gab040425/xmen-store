import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getCartTotalCents } from "../data/cart"
import {
  clearCheckoutAttempt,
  createCheckoutIdempotencyKey,
  readCheckoutAttempt,
  serializeCheckoutPayload,
  writeCheckoutAttempt,
} from "../data/checkoutAttempt"
import ContactBar from "../components/ContactBar"
import "./CheckoutPage.css"

const productTypeLabels = {
  funko_pop: "Funko Pop",
  mini_figurine: "Mini Figurine",
  scale_1_6: "1:6 Scale Figurine",
}

const fieldLimits = {
  name: 100,
  email: 254,
  phone: 32,
  street: 200,
  city: 100,
  postal_code: 20,
  country: 100,
}

const formatPrice = (priceCents) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)

const getInitialDelivery = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  street: user?.street || "",
  city: user?.city || "",
  postal_code: user?.postal_code || "",
  country: user?.country || "",
})

const formatCustomization = (customization = {}) =>
  Object.entries(customization)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ")

function CheckoutPage({ cart, currentUser, onOrderSuccess }) {
  const navigate = useNavigate()
  const [pendingAttempt, setPendingAttempt] = useState(() => readCheckoutAttempt(currentUser?.id))
  const [delivery, setDelivery] = useState(() =>
    readCheckoutAttempt(currentUser?.id)?.payload.delivery || getInitialDelivery(currentUser)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [confirmedNewAttempt, setConfirmedNewAttempt] = useState(false)
  const editedFields = useRef(new Set())
  const submissionLock = useRef(false)
  const handledSuccessOrderId = useRef(null)
  const cartTotalCents = getCartTotalCents(cart)
  const requestPayload = {
    items: cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      customization: item.customization || {},
    })),
    delivery: Object.fromEntries(
      Object.entries(delivery).map(([field, value]) => [field, value.trim()])
    ),
  }
  const requestSnapshot = serializeCheckoutPayload(requestPayload)
  const completedAttemptMatchesCurrent = pendingAttempt?.status === "succeeded" &&
    pendingAttempt.snapshot === requestSnapshot
  const attemptNeedsResolution = pendingAttempt &&
    pendingAttempt.status !== "succeeded" &&
    (pendingAttempt.status === "conflict" || pendingAttempt.snapshot !== requestSnapshot)

  useEffect(() => {
    if (!pendingAttempt || pendingAttempt.status !== "succeeded") return

    if (cart.length === 0 || completedAttemptMatchesCurrent) {
      if (completedAttemptMatchesCurrent && cart.length > 0 && handledSuccessOrderId.current !== pendingAttempt.orderId) {
        onOrderSuccess(currentUser.id)
        handledSuccessOrderId.current = pendingAttempt.orderId
      }
      navigate(`/orders/${pendingAttempt.orderId}`, { replace: true })
    }
  }, [cart.length, completedAttemptMatchesCurrent, currentUser?.id, navigate, onOrderSuccess, pendingAttempt])

  useEffect(() => {
    if (currentUser?.id == null) return undefined
    if (readCheckoutAttempt(currentUser.id)) return undefined

    let active = true
    fetch("http://localhost:3000/api/me", { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load saved delivery details.")
        return response.json()
      })
      .then((data) => {
        if (!active || !data.user) return
        if (readCheckoutAttempt(currentUser.id)) return
        setDelivery((current) => Object.fromEntries(
          Object.entries(getInitialDelivery(data.user)).map(([field, value]) => [
            field,
            editedFields.current.has(field) || current[field] ? current[field] : value,
          ])
        ))
      })
      .catch(() => {
        // Keep the editable form available when saved profile details cannot be loaded.
      })

    return () => { active = false }
  }, [currentUser?.id])

  const updateField = (event) => {
    const { name, value } = event.target
    editedFields.current.add(name)
    setDelivery((current) => ({ ...current, [name]: value }))
  }

  const validateDelivery = () => {
    for (const [field, maxLength] of Object.entries(fieldLimits)) {
      const value = delivery[field].trim()
      const optional = field === "phone"
      if ((!optional && !value) || value.length > maxLength) {
        return `Please enter a valid ${field.replaceAll("_", " ")} (maximum ${maxLength} characters).`
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email.trim())) {
      return "Please enter a valid email address."
    }

    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submissionLock.current) return
    setError("")

    if (cart.length === 0) {
      setError("Your cart is empty. Add an item before checking out.")
      return
    }

    const validationError = validateDelivery()
    if (validationError) {
      setError(validationError)
      return
    }

    if (attemptNeedsResolution || completedAttemptMatchesCurrent) {
      setError("Resolve the previous checkout attempt before submitting changed details.")
      return
    }

    submissionLock.current = true
    setSubmitting(true)
    try {
      let attempt = pendingAttempt?.status !== "succeeded" ? pendingAttempt : null
      if (!attempt) {
        attempt = {
          key: createCheckoutIdempotencyKey(),
          payload: requestPayload,
          snapshot: requestSnapshot,
          status: "pending",
        }
        if (!writeCheckoutAttempt(currentUser.id, attempt)) {
          throw new Error("Your browser could not save a secure checkout retry. Enable session storage and try again.")
        }
        setPendingAttempt(attempt)
      }

      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": attempt.key,
        },
        body: JSON.stringify(attempt.payload),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const knownRejectedRequest = response.status === 400 || response.status === 404 ||
          (response.status === 409 && /not have enough stock|no longer has enough stock/i.test(result.message || ""))
        if (knownRejectedRequest) {
          if (clearCheckoutAttempt(currentUser.id)) setPendingAttempt(null)
        } else if (response.status === 409) {
          const conflictedAttempt = { ...attempt, status: "conflict" }
          if (writeCheckoutAttempt(currentUser.id, conflictedAttempt)) setPendingAttempt(conflictedAttempt)
        }

        if (response.status === 409) {
          throw new Error(result.message || "Stock changed while you were checking out. Review your cart and try again.")
        }
        if (response.status === 401) {
          throw new Error("Your login has expired. Please log in again before placing this test order.")
        }
        throw new Error(result.message || "We could not create the test order. Your cart is still saved; please try again.")
      }

      if (!Number.isSafeInteger(result.orderId) || result.orderId < 1) {
        throw new Error("The order response was incomplete. Your cart has been kept; please contact the shop before retrying.")
      }

      const completedAttempt = { ...attempt, status: "succeeded", orderId: result.orderId }
      writeCheckoutAttempt(currentUser.id, completedAttempt)
      setPendingAttempt(completedAttempt)
      onOrderSuccess(currentUser.id)
      handledSuccessOrderId.current = result.orderId
      navigate(`/orders/${result.orderId}`, { replace: true })
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the shop server. Your cart is still saved; please try again.")
    } finally {
      submissionLock.current = false
      setSubmitting(false)
    }
  }

  const startNewAttempt = () => {
    if (!confirmedNewAttempt) return
    if (!clearCheckoutAttempt(currentUser.id)) {
      setError("The previous attempt could not be cleared from browser storage. Please try again.")
      return
    }
    setPendingAttempt(null)
    setConfirmedNewAttempt(false)
    setError("")
  }

  const attemptResolution = attemptNeedsResolution && (
    <section className="checkout-attempt-warning" aria-label="Unresolved checkout attempt">
      <p>
        A previous checkout may have completed. Its original request is saved, and changed cart or delivery details cannot be submitted with that key.
        Check your order history and details before starting over.
      </p>
      <Link to="/orders" className="checkout-back-link">Check order history</Link>
      <label className="checkout-attempt-confirmation">
        <input
          type="checkbox"
          checked={confirmedNewAttempt}
          onChange={(event) => setConfirmedNewAttempt(event.target.checked)}
        />
        I checked my orders and confirmed the previous attempt did not create this order.
      </label>
      <button type="button" className="checkout-reset-button" disabled={!confirmedNewAttempt || submitting} onClick={startNewAttempt}>
        START A NEW ATTEMPT
      </button>
    </section>
  )

  return (
    <>
      <main className="checkout-page">
        <div className="checkout-container">
          <p className="eyebrow">SECURE YOUR COLLECTION</p>
          <h1>CHECKOUT.</h1>

          {cart.length === 0 && !pendingAttempt ? (
            <section className="checkout-empty-state">
              <p>Your cart is empty. Add a figure before checking out.</p>
              <Link to="/" className="checkout-primary-link">CONTINUE SHOPPING</Link>
            </section>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-review" aria-labelledby="checkout-review-title">
                <h2 id="checkout-review-title">Review your order</h2>
                <div className="checkout-items">
                  {cart.map((item) => (
                    <article className="checkout-item" key={item.key}>
                      <div>
                        <h3>{item.name}</h3>
                        <p>{productTypeLabels[item.productType] || item.productType}</p>
                        {formatCustomization(item.customization) && (
                          <p>Customization: {formatCustomization(item.customization)}</p>
                        )}
                        <p>{item.quantity} × {formatPrice(item.priceCents)}</p>
                      </div>
                      <strong>{formatPrice(item.priceCents * item.quantity)}</strong>
                    </article>
                  ))}
                </div>
                <div className="checkout-total-row">
                  <span>Order total</span>
                  <strong>{formatPrice(cartTotalCents)}</strong>
                </div>
                {cart.length === 0 && <p className="checkout-price-note">Your cart is empty. Resolve the saved attempt below before continuing.</p>}
                <p className="checkout-price-note">Final prices and stock are confirmed by the shop when you submit.</p>
              </section>

              <form className="checkout-form" onSubmit={handleSubmit}>
                <h2>Delivery details</h2>
                {attemptNeedsResolution && attemptResolution}
                {pendingAttempt?.status === "pending" && !attemptNeedsResolution && (
                  <p className="checkout-attempt-note" role="status">A previous request is unresolved. Submitting again will safely retry the same saved order.</p>
                )}
                <label>
                  Full name
                  <input name="name" autoComplete="name" value={delivery.name} onChange={updateField} maxLength={fieldLimits.name} required disabled={submitting} />
                </label>
                <label>
                  Email
                  <input name="email" type="email" autoComplete="email" value={delivery.email} onChange={updateField} maxLength={fieldLimits.email} required disabled={submitting} />
                </label>
                <label>
                  Phone <span>(optional)</span>
                  <input name="phone" type="tel" autoComplete="tel" value={delivery.phone} onChange={updateField} maxLength={fieldLimits.phone} disabled={submitting} />
                </label>
                <label>
                  Street address
                  <input name="street" autoComplete="street-address" value={delivery.street} onChange={updateField} maxLength={fieldLimits.street} required disabled={submitting} />
                </label>
                <div className="checkout-form-row">
                  <label>
                    City
                    <input name="city" autoComplete="address-level2" value={delivery.city} onChange={updateField} maxLength={fieldLimits.city} required disabled={submitting} />
                  </label>
                  <label>
                    Postal code
                    <input name="postal_code" autoComplete="postal-code" value={delivery.postal_code} onChange={updateField} maxLength={fieldLimits.postal_code} required disabled={submitting} />
                  </label>
                </div>
                <label>
                  Country
                  <input name="country" autoComplete="country-name" value={delivery.country} onChange={updateField} maxLength={fieldLimits.country} required disabled={submitting} />
                </label>

                {error && <p className="checkout-error" role="alert">{error}</p>}
                <p className="checkout-test-notice">This creates a test order only. No payment will be taken.</p>
                <button className="checkout-submit-button" type="submit" disabled={submitting || cart.length === 0 || Boolean(attemptNeedsResolution) || pendingAttempt?.status === "conflict"}>
                  {submitting ? "PLACING TEST ORDER…" : "PLACE TEST ORDER"}
                </button>
                <Link to="/cart" className="checkout-back-link">Back to cart</Link>
              </form>
            </div>
          )}
        </div>
      </main>
      <ContactBar />
    </>
  )
}

export default CheckoutPage
