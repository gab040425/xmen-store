import { Link } from "react-router-dom"
import { getCartTotalCents } from "../data/cart"
import "./CartPage.css"
import ContactBar from "../components/ContactBar"

const productTypeLabels = {
  funko_pop: "Funko Pop",
  mini_figurine: "Mini Figurine",
  scale_1_6: "1:6 Scale Figurine",
}

const formatPrice = (priceCents) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100)

const formatCustomization = (customization = {}) =>
  Object.entries(customization)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ")

function CartPage({ cart, setItemQuantity, removeItem }) {
  const cartTotalCents = getCartTotalCents(cart)

  return (
    <>
      <main className="cart-page">
        <div className="cart-container">
          <p className="eyebrow">YOUR SHOPPING CART</p>
          <h1>YOUR CART.</h1>

          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <p className="cart-text">Your cart is empty. Find a figure for your collection.</p>
              <Link to="/" className="cart-continue-button">CONTINUE SHOPPING</Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const customization = formatCustomization(item.customization)
                  const itemSubtotal = item.priceCents * item.quantity

                  return (
                    <article className="cart-item" key={item.key}>
                      <div className="cart-item-details">
                        <h2>{item.name}</h2>
                        <p className="cart-item-variant">
                          Variant: {productTypeLabels[item.productType] || item.productType}
                        </p>
                        {item.description && <p className="cart-item-description">{item.description}</p>}
                        {customization && <p className="cart-item-customization">Customization: {customization}</p>}
                        <p className="cart-item-unit-price">Unit price: {formatPrice(item.priceCents)}</p>
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={item.quantity <= 1}
                            onClick={() => setItemQuantity(item.key, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => setItemQuantity(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-remove-button"
                          type="button"
                          onClick={() => removeItem(item.key)}
                        >
                          Remove
                        </button>
                      </div>

                      <p className="cart-item-subtotal">Subtotal: {formatPrice(itemSubtotal)}</p>
                    </article>
                  )
                })}
              </div>

              <div className="cart-summary">
                <span>Total</span>
                <strong>{formatPrice(cartTotalCents)}</strong>
              </div>
              <div className="cart-page-actions">
                <Link to="/checkout" className="cart-continue-button">PROCEED TO CHECKOUT</Link>
                <Link to="/" className="cart-shopping-link">CONTINUE SHOPPING</Link>
              </div>
            </>
          )}
        </div>
      </main>

      <ContactBar />
    </>
  )
}

export default CartPage
