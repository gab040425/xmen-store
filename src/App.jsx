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
  useLocation
} from "react-router-dom"
import { useLayoutEffect, useEffect, useState } from "react"

import characters, { getImage } from './data/characters'
import CharacterPage from "./pages/CharacterPage"
import SearchResults from "./pages/SearchResults"
import LoginPage from "./pages/LoginPage"
import SignupPage from './pages/SignupPage'
import FavouritesPage from './pages/FavouritesPage'
import AccountPage from "./pages/AccountPage"
import CartPage from './pages/CartPage'
import OrdersPage from "./pages/OrdersPage"

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

function HomePage() {
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

        <div className="character-grid">
          {characters.map((character) => (
            <Link
              to={`/characters/${character.id}`}
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
        </div>
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
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
// Returns null because it doesnt return anything, just perform an action

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
        setCurrentUser(data.user)
        setIsLoggedIn(true)
      })
      .catch(() => {
        setCurrentUser(null)
        setIsLoggedIn(false)
      })
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
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentUser={setCurrentUser}
      />

      <ScrollToTop />

      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Search results page */}
        <Route
          path="/search"
          element={<SearchResults />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <LoginPage
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={setCurrentUser}
            />
          }
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={
            <SignupPage
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={setCurrentUser}
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
              setCurrentUser={setCurrentUser}
            />
          }
        />

        {/* Order Page */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* Favourites Page */}
        <Route path="/favourites" element={<FavouritesPage />} />

        {/* Cart Page */}
        <Route path="/cart" element={<CartPage />} />

        {/* Character page */}
        {/* :id is a dynamic URL parameter */}
        <Route
          path="/characters/:id"
          element={<CharacterPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}


export default App
