/*
  OrdersPage component

  This page will eventually show the user's
  previous orders.

  For now, there are no real orders because
  the website is not connected to a backend yet.
*/

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import "./OrdersPage.css"
import ContactBar from "../components/ContactBar"

function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch("http://localhost:3000/api/orders", {
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) {
          return null
        }

        return response.json()
      })
      .then(data => {
        if (data) {
          setOrders(data.orders)
        }
      })
  }, [])

  return (
    <>
      <main className="orders-page">

        <div className="orders-container">

          <p className="eyebrow">YOUR ORDERS</p>

          <h1>ORDERS.</h1>

          {orders.length === 0 ? (
            <>
              <p className="orders-text">
                You haven't bought anything yet. Start shopping and build your collection.
              </p>

              <Link to="/" className="continue-shopping-button">
                CONTINUE SHOPPING
              </Link>
            </>
          ) : (
            <div className="orders-list">
              {/* Orders will appear here later */}
            </div>
          )}

        </div>

      </main>

      < ContactBar />
    </>
  )
}

export default OrdersPage
