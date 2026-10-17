/*
  CartPage component

  This page will eventually show the items
  that the user has added to their shopping cart.

  For now, users who are not logged in are asked
  to log in before they can access their cart.
*/

import { Link } from "react-router-dom"
import "./CartPage.css"
import ContactBar from "../components/ContactBar"

function CartPage() {
  return (
    <>
      <main className="cart-page">

        <div className="cart-container">

          <p className="eyebrow">YOUR SHOPPING CART</p>

          <h1>YOUR CART.</h1>

          <p className="cart-text">
            Log in to view and manage the items in your cart.
          </p>

          <Link to="/login" className="cart-login-button">
            LOG IN
          </Link>

        </div>

      </main>

      < ContactBar />
    </>
  )
}

export default CartPage
