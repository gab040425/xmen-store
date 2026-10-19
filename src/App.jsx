/*

  This file contains the main structure of the website.

  It is responsible for:
  - Displaying the homepage
  - Setting up navigation between pages
  - Connecting the different pages to React Router
  - Automatically scrolling to the top when changing pages
*/


/* =========================
   IMPORTS
   ========================= */

import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigationType,
  Navigate
} from "react-router-dom"
import { useLayoutEffect, useEffect, useRef, useState } from "react"

import { getImage, loadCharacters } from './data/characters'
import {
  addProductToCart,
  getCartItemCount,
  readCart,
  removeCartItem,
  setCartItemQuantity,
  writeCart,
} from './data/cart'
import CharacterPage from "./pages/CharacterPage"
import SearchResults from "./pages/SearchResults"
import LoginPage from "./pages/LoginPage"
import SignupPage from './pages/SignupPage'
import FavouritesPage from './pages/FavouritesPage'
import AccountPage from "./pages/AccountPage"
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from "./pages/OrdersPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"

import Navbar from "./components/Navbar"
import ContactBar from "./components/ContactBar"


/* =========================
   HOMEPAGE
   =========================

   HomePage contains the main landing page of the website.

   It includes:
   - The hero section
   - The featured mutant collection
   - Character cards
   - The contact bar

   The character cards are generated using .map().
   This means we can add or remove characters from
   characters.js without manually creating a new card here.
*/

function HomePage({ characters, charactersLoading, charactersError }) {
  return (
    <main>
      <section className="hero-section">
        <p className="eyebrow">
          THE ULTIMATE MUTANT COLLECTION
        </p>

        <h1>
          FIND YOUR
          <br />
          <span>MUTANT.</span>
        </h1>

        <p className="hero-text">
          Discover X-Men collectibles and create the figure you've always
          wanted.
        </p>
      </section>

      <section id="characters" className="characters-section">
        <div className="section-heading">
          <p className="eyebrow">
            EXPLORE THE COLLECTION
          </p>

          <h2>Featured Mutants</h2>
        </div>

        {charactersLoading ? (
          <p role="status">Loading characters…</p>
        ) : charactersError ? (
          <p role="alert">{charactersError}</p>
        ) : <div className="character-grid">
          {characters.map((character) => (
            <Link
              to={`/characters/${character.id}`}
              state={{ from: "/", returnToHistory: true }}
              className="character-card"
              key={character.id}
            >
              <div className="character-image">
                <img
                  src={getImage(character.image)}
                  alt={character.name}
                  style={{ objectPosition: character.imagePosition || "center" }}
                />
              </div>

              <h3>{character.name}</h3>

              <p>{character.description}</p>

              <span>View Character →</span>
            </Link>
          ))}
        </div>}
      </section>

      <ContactBar />
    </main>
  )
}

/* =========================
   SCROLL TO TOP
   =========================

   React Router normally changes the page without refreshing the browser.

   Because the browser does not reload the page,
   the scroll position can remain where it was on the previous page.

   This component detects when the URL path changes and manually scrolls the user back to the top.
*/

function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const homepagePositions = useRef(new Map())

  useLayoutEffect(() => {
    const positions = homepagePositions.current
    if (location.pathname === "/" && navigationType === "POP" && positions.has(location.key)) {
      const { x, y } = positions.get(location.key)
      window.scrollTo(x, y)
    } else {
      window.scrollTo(0, 0)
    }

    return () => {
      if (location.pathname === "/") {
        positions.set(location.key, { x: window.scrollX, y: window.scrollY })
      }
    }
  }, [location.key, location.pathname, navigationType])

  return null
}
// Returns null because it doesnt return anything, just perform an action

function AuthenticatedCart({ authChecked, isLoggedIn, currentUser, ...cartProps }) {
  const location = useLocation()

  if (!authChecked) {
    return <main className="cart-page"><p role="status">Checking your login...</p></main>
  }

  if (!isLoggedIn || currentUser?.id == null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <CartPage {...cartProps} />
}

function AuthenticatedCheckout({ authChecked, isLoggedIn, currentUser, ...checkoutProps }) {
  const location = useLocation()

  if (!authChecked) {
    return <main className="cart-page"><p role="status">Checking your login...</p></main>
  }

  if (!isLoggedIn || currentUser?.id == null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <CheckoutPage {...checkoutProps} currentUser={currentUser} />
}

function AuthenticatedPage({ authChecked, isLoggedIn, currentUser, children }) {
  const location = useLocation()

  if (!authChecked) {
    return <main className="orders-page"><p role="status">Checking your login...</p></main>
  }

  if (!isLoggedIn || currentUser?.id == null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

/* =========================
   MAIN APP
   =========================

   App is the main component of the website.

   BrowserRouter enables client-side navigation.
   Routes contains all of the available pages.
   Each Route connects a URL path to a React component.
*/

function App() {

  /*
  isLoggedIn: Stores the current login status
  setIsLoggedIn: Used later to change login status
  */

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [characters, setCharacters] = useState([])
  const [charactersLoading, setCharactersLoading] = useState(true)
  const [charactersError, setCharactersError] = useState("")
  const [cart, setCart] = useState([])
  const [cartOwnerKey, setCartOwnerKey] = useState(null)
  const currentUserId = currentUser?.id == null ? null : String(currentUser.id)
  const currentInstallationId = currentUser?.installationId ?? null
  const currentCartOwnerKey = currentUserId !== null && typeof currentInstallationId === "string"
    ? `${currentInstallationId}:${currentUserId}`
    : null
  const currentUserIdRef = useRef(currentUserId)
  const isCartAuthenticated = authChecked && isLoggedIn && currentUserId !== null
  const cartIsReady = isCartAuthenticated && currentCartOwnerKey !== null && cartOwnerKey === currentCartOwnerKey
  const visibleCart = cartIsReady ? cart : []

  const updateCurrentUser = (user) => {
    setCurrentUser(user)

    const userId = user?.id == null ? null : String(user.id)
    const installationId = typeof user?.installationId === "string" ? user.installationId : null
    const ownerKey = userId !== null && installationId !== null
      ? `${installationId}:${userId}`
      : null
    setCart(ownerKey === null ? [] : readCart(userId, installationId))
    setCartOwnerKey(ownerKey)
  }

  useLayoutEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    if (cartIsReady) {
      writeCart(cart, currentUserId, currentInstallationId)
    }
  }, [cart, cartIsReady, currentUserId, currentInstallationId])

  const addToCart = (product, customization = {}) => {
    if (!cartIsReady) return false

    setCart(currentCart => addProductToCart(currentCart, product, customization))
    return true
  }

  const changeCartItemQuantity = (key, quantity) => {
    if (!cartIsReady) return
    setCart(currentCart => setCartItemQuantity(currentCart, key, quantity))
  }

  const deleteCartItem = (key) => {
    if (!cartIsReady) return
    setCart(currentCart => removeCartItem(currentCart, key))
  }

  const clearCartAfterOrder = (orderUserId) => {
    if (orderUserId == null || currentInstallationId === null) return
    const orderOwnerId = String(orderUserId)
    writeCart([], orderOwnerId, currentInstallationId)
    if (currentUserIdRef.current === orderOwnerId) setCart([])
  }

  useEffect(() => {
    let isCurrent = true
    loadCharacters()
      .then(data => { if (isCurrent) setCharacters(data) })
      .catch(() => {
        if (isCurrent) setCharactersError("Unable to load characters. Please check that the shop server is running and try again.")
      })
      .finally(() => { if (isCurrent) setCharactersLoading(false) })
    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    fetch("http://localhost:3000/api/me", {
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Not logged in")
        }

        return response.json()
      })
      .then(data => {
        updateCurrentUser(data.user)
        setIsLoggedIn(true)
      })
      .catch(() => {
        updateCurrentUser(null)
        setIsLoggedIn(false)
      })
      .finally(() => setAuthChecked(true))
  }, [])



  /*
    Disable the browser's automatic scroll restoration.

    We do this because ScrollToTop handles scrolling ourselves when the user changes pages.
  */
  useEffect(() => {
    window.history.scrollRestoration = "manual"

    return () => {
      window.history.scrollRestoration = "auto"
    }
  }, [])

  return (
    <BrowserRouter>
      <Navbar
        characters={characters}
        cartCount={getCartItemCount(visibleCart)}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentUser={updateCurrentUser}
      />

      <ScrollToTop />

      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage characters={characters} charactersLoading={charactersLoading} charactersError={charactersError} />} />

        {/* Search results page */}
        <Route
          path="/search"
          element={<SearchResults characters={characters} charactersLoading={charactersLoading} charactersError={charactersError} />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <LoginPage
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={updateCurrentUser}
            />
          }
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={
            <SignupPage
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={updateCurrentUser}
            />
          }
        />

        {/* Account Page */}
        <Route
          path="/account"
          element={
            <AccountPage
              key={currentUser?.id ?? currentUser?.email ?? "no-user"}
              currentUser={currentUser}
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={updateCurrentUser}
            />
          }
        />

        {/* Order History and Confirmation Pages */}
        <Route
          path="/orders"
          element={
            <AuthenticatedPage authChecked={authChecked} isLoggedIn={isLoggedIn} currentUser={currentUser}>
              <OrdersPage />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <AuthenticatedPage authChecked={authChecked} isLoggedIn={isLoggedIn} currentUser={currentUser}>
              <OrderConfirmationPage currentUser={currentUser} />
            </AuthenticatedPage>
          }
        />

        {/* Favourites Page */}
        <Route path="/favourites" element={<FavouritesPage characters={characters} charactersLoading={charactersLoading} charactersError={charactersError} />} />

        {/* Cart Page */}
        <Route
          path="/cart"
          element={
            <AuthenticatedCart
              authChecked={authChecked}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              cart={visibleCart}
              setItemQuantity={changeCartItemQuantity}
              removeItem={deleteCartItem}
            />
          }
        />

        {/* Checkout Page */}
        <Route
          path="/checkout"
          element={
            <AuthenticatedCheckout
              authChecked={authChecked}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              cart={visibleCart}
              onOrderSuccess={clearCartAfterOrder}
            />
          }
        />

        {/* Character page */}
        {/* :id is a dynamic URL parameter */}
        <Route
          path="/characters/:id"
          element={<CharacterPage characters={characters} charactersLoading={charactersLoading} charactersError={charactersError} addToCart={addToCart} />}
        />
      </Routes>
    </BrowserRouter>
  )
}


export default App
