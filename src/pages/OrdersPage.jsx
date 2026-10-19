import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import ContactBar from "../components/ContactBar"
import { getOrderStatusTone } from "../data/orderStatus"
import "./OrdersPage.css"

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

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const location = useLocation()

  useEffect(() => {
    const controller = new AbortController()

    fetch("http://localhost:3000/api/orders", {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          if (response.status === 401) throw new Error("Your login session has expired. Please log in to view your orders.")
          throw new Error(data.message || "Unable to load your orders. Please try again.")
        }
        return data
      })
      .then((data) => {
        if (!Array.isArray(data.orders)) throw new Error("The order history response was invalid. Please try again.")
        setOrders(data.orders)
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load your orders. Please try again.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return (
    <>
      <main className="orders-page">
        <div className="orders-container">
          <p className="eyebrow">YOUR ORDERS</p>
          <h1>ORDERS.</h1>

          {loading ? (
            <p className="orders-text" role="status">Loading your orders…</p>
          ) : error ? (
            <div className="orders-error-state">
              <p className="orders-text" role="alert">{error}</p>
              {error.includes("login session") && (
                <Link to="/login" state={{ from: location }} className="continue-shopping-button">LOG IN</Link>
              )}
            </div>
          ) : orders.length === 0 ? (
            <>
              <p className="orders-text">You have no orders yet. Start shopping and build your collection.</p>
              <Link to="/" className="continue-shopping-button">CONTINUE SHOPPING</Link>
            </>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-heading">
                    <h2>Order #{order.id}</h2>
                    <span className={`order-status order-status--${getOrderStatusTone(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p><span>Date</span><strong>{formatDate(order.order_date)}</strong></p>
                  <p><span>Total</span><strong>{formatPrice(order.total_cents)}</strong></p>
                  <Link to={`/orders/${order.id}`} className="order-detail-link">VIEW ORDER DETAILS</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <ContactBar />
    </>
  )
}

export default OrdersPage
