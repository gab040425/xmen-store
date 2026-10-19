import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { clearCompletedCheckoutAttempt } from "../data/checkoutAttempt"
import { getOrderStatusTone } from "../data/orderStatus"
import ContactBar from "../components/ContactBar"
import "./OrderConfirmationPage.css"

const productTypeLabels = {
  funko_pop: "Funko Pop",
  mini_figurine: "Mini Figurine",
  scale_1_6: "1:6 Scale Figurine",
}

const formatPrice = (priceCents) =>
  Number.isSafeInteger(priceCents)
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(priceCents / 100)
    : "Total unavailable"

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

const formatCustomization = (customization) => {
  if (!customization || typeof customization !== "object" || Array.isArray(customization)) return ""
  return Object.entries(customization).map(([name, value]) => `${name}: ${value}`).join(", ")
}

function OrderConfirmationPage({ currentUser }) {
  const { orderId } = useParams()
  const location = useLocation()
  const [orderRequest, setOrderRequest] = useState(() => ({
    orderId,
    order: null,
    items: [],
    loading: true,
    error: "",
    loginExpired: false,
  }))

  useEffect(() => {
    const controller = new AbortController()

    fetch(`http://localhost:3000/api/orders/${encodeURIComponent(orderId)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const requestError = new Error(
            response.status === 404
              ? "This order could not be found or is unavailable for this account."
              : data.message || "Unable to load this order. Please try again."
          )
          requestError.status = response.status
          throw requestError
        }
        return data
      })
      .then((data) => {
        if (data.order?.id === Number(orderId)) {
          clearCompletedCheckoutAttempt(currentUser?.id, orderId)
        }
        setOrderRequest({
          orderId,
          order: data.order || null,
          items: Array.isArray(data.items) ? data.items : [],
          loading: false,
          error: "",
          loginExpired: false,
        })
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setOrderRequest({
            orderId,
            order: null,
            items: [],
            loading: false,
            error: requestError.message || "Unable to load this order. Please try again.",
            loginExpired: requestError.status === 401,
          })
        }
      })

    return () => controller.abort()
  }, [currentUser?.id, orderId])

  const currentRequest = orderRequest.orderId === orderId
    ? orderRequest
    : { order: null, items: [], loading: true, error: "", loginExpired: false }
  const { order, items, loading, error, loginExpired } = currentRequest

  return (
    <>
      <main className="order-confirmation-page">
        <div className="order-confirmation-container">
          <p className="eyebrow">ORDER DETAILS</p>
          <h1>{loading ? "LOADING ORDER." : order ? `ORDER #${order.id}.` : "ORDER DETAILS."}</h1>

          {loading ? (
            <p className="order-confirmation-message" role="status">Loading order details…</p>
          ) : error ? (
            <section className="order-confirmation-state" role="alert">
              <p>{error}</p>
              {loginExpired && <Link to="/login" state={{ from: location }} className="order-confirmation-button">LOG IN</Link>}
              {!loginExpired && <Link to="/orders" className="order-confirmation-secondary-link">Back to your orders</Link>}
            </section>
          ) : !order ? (
            <section className="order-confirmation-state" role="alert">
              <p>This order could not be loaded.</p>
              <Link to="/orders" className="order-confirmation-secondary-link">Back to your orders</Link>
            </section>
          ) : (
            <>
              {order.status === "test_order_made" && (
                <p className="order-test-notice">This is a test order. No payment was taken.</p>
              )}
              <section className="order-confirmation-summary">
                <p><span>Order ID</span><strong>#{order.id}</strong></p>
                <p><span>Date</span><strong>{formatDate(order.order_date)}</strong></p>
                <p>
                  <span>Status</span>
                  <strong className={`order-status order-status--${getOrderStatusTone(order.status)}`}>
                    {order.status}
                  </strong>
                </p>
                <p className="order-confirmation-total"><span>Total</span><strong>{formatPrice(order.total_cents)}</strong></p>
              </section>

              <section className="order-confirmation-items" aria-labelledby="order-items-heading">
                <h2 id="order-items-heading">Items</h2>
                {items.length === 0 ? (
                  <p className="order-confirmation-message">Item details are unavailable for this historical order.</p>
                ) : items.map((item) => (
                  <article className="order-confirmation-item" key={item.id}>
                    <div>
                      <h3>{item.product_name}</h3>
                      <p>{productTypeLabels[item.product_type] || item.product_type}</p>
                      <p>Quantity: {item.quantity} · Unit price: {formatPrice(item.unit_price_cents)}</p>
                      {formatCustomization(item.customization) && <p>Customization: {formatCustomization(item.customization)}</p>}
                    </div>
                    <strong>{formatPrice(item.line_total_cents)}</strong>
                  </article>
                ))}
              </section>

              <div className="order-confirmation-actions">
                <Link to="/orders" className="order-confirmation-button">YOUR ORDER HISTORY</Link>
                <Link to="/" className="order-confirmation-secondary-link">Continue shopping</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <ContactBar />
    </>
  )
}

export default OrderConfirmationPage
