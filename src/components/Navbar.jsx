/*
  Navbar component

  This component is responsible for:
  - Displaying the website navigation bar
  - Handling character searches
  - Showing character suggestions while searching
  - Navigating to search results or character pages
  - Hiding the navbar when scrolling down
  - Showing the navbar again when scrolling up
*/

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import characters from "../data/characters"
import "./Navbar.css"


function Navbar({ isLoggedIn, currentUser, setIsLoggedIn, setCurrentUser }) {

  /* =========================
     SEARCH STATE
     =========================

     searchTerm stores whatever the user has typed
     into the search input.

     showSuggestions controls whether the suggestion
     dropdown is currently visible.
  */

  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  /*
    useNavigate allows this component to change the
    current URL using JavaScript.

    We use it when:
    - The user submits a search
    - The user clicks a character suggestion
  */

  const navigate = useNavigate()


  /* =========================
     NAVBAR VISIBILITY STATE
     =========================

     showNav controls whether the navbar is visible.

     true  → navbar is shown
     false → navbar is hidden
  */

  const [showNav, setShowNav] = useState(true)


  /* =========================
     HIDE / SHOW ON SCROLL
     =========================

     React does not automatically know when the
     browser is scrolling.

     We therefore listen for the browser's "scroll"
     event and compare the current scroll position
     with the previous one.

     If the user scrolls down:
       → hide navbar

     If the user scrolls up:
       → show navbar

     If the user is near the top:
       → always show navbar
  */

  useEffect(() => {

    // Remember the scroll position from the previous event.
    let lastScrollY = window.scrollY


    const handleScroll = () => {

      const currentScrollY = window.scrollY


      // Always show the navbar when near the top of the page.
      if (currentScrollY <= 10) {
        setShowNav(true)

      // Scrolling down → hide the navbar.
      } else if (currentScrollY > lastScrollY) {
        setShowNav(false)

      // Scrolling up → show the navbar.
      } else {
        setShowNav(true)
      }


      // Save the current position for the next scroll event.
      lastScrollY = currentScrollY
    }


    /*
      Tell the browser to run handleScroll whenever
      the user scrolls.
    */

    window.addEventListener("scroll", handleScroll)


    /*
      Remove the event listener when Navbar is removed.

      This prevents the old listener from continuing
      to run and avoids unnecessary memory usage.
    */

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }

  }, [])


  /* =========================
     SEARCH
     =========================

     handleSearch is called when the user presses
     Enter or clicks the Search button.
  */

  const handleSearch = () => {

    /*
      trim() removes unnecessary spaces from the
      beginning and end of the search.

      Example:
      "  Wolverine  " → "Wolverine"
    */

    const search = searchTerm.trim()


    // Do nothing if the search box is empty.
    if (!search) {
      return
    }


    /*
      Navigate to the search results page.

      encodeURIComponent makes the search safe to
      place inside a URL.

      Example:
      Wolverine → /search?q=Wolverine
    */

    navigate(`/search?q=${encodeURIComponent(search)}`)
  }


  /* =========================
     SEARCH SUGGESTIONS
     =========================

     Filter the character database based on what
     the user has typed.

     Suggestions can match:
     - Character name
     - Character ID
     - Character aliases
  */

  const suggestions = characters.filter((character) => {

    // Make the search case-insensitive.
    const search = searchTerm.trim().toLowerCase()


    // No search text → no suggestions.
    if (!search) {
      return false
    }


    /*
      Keep the character if the search text appears
      in the character's name, ID, or any alias.
    */

    return (
      character.name.toLowerCase().includes(search) ||
      character.id.toLowerCase().includes(search) ||
      character.aliases?.some(
        (alias) => alias.toLowerCase().includes(search)
      )
    )
  })


  /* =========================
     CLOSE SUGGESTIONS
     =========================

     If the user clicks somewhere outside the search
     area, hide the suggestion dropdown.
  */

  useEffect(() => {

    const handleClickOutside = (event) => {

      /*
        closest() checks whether the clicked element
        belongs to the .nav-search element.

        If it doesn't, the click happened outside
        the search area.
      */

      if (!event.target.closest(".nav-search")) {
        setShowSuggestions(false)
      }
    }

    //Listen for mouse clicks anywhere on the page.

    document.addEventListener("mousedown", handleClickOutside)


    //Remove the listener when Navbar is removed.

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])


  /* =========================
     NAVBAR UI
     ========================= */

  return (
    <nav className={showNav ? "navbar visible" : "navbar hidden"}>

      <h2>X-MEN SHOP</h2>


      {/* Search area */}
      <div className="nav-search">

        <input
          type="text"
          placeholder="Search for a character..."
          value={searchTerm}

          /*
            Controlled input:

            React stores the input value in searchTerm.

            Every time the user types:
            1. Update searchTerm
            2. Show the suggestions
          */
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowSuggestions(true)
          }}

          // Show suggestions when the input is selected.
          onFocus={() => setShowSuggestions(true)}

          /*
            Allow the user to press Enter instead of
            having to click the Search button.
          */
          onKeyDown={(e) => {

            if (e.key === "Enter") {
              setShowSuggestions(false)
              handleSearch()
            }
          }}
        />


        <button onClick={handleSearch}>
          Search
        </button>

      </div>


      {/* =========================
          SEARCH SUGGESTIONS
          =========================

          Only display this section when:
          - suggestions are enabled
          - the user has actually typed something
      */}

      {showSuggestions && searchTerm.trim() && (

        <div className="search-suggestions">

          {suggestions.length > 0 ? (

            /*
              map() creates one suggestion button
              for every matching character.
            */

            suggestions.map((character) => (

              <button
                key={character.id}
                className="search-suggestion"

                onClick={() => {
                  setShowSuggestions(false)

                  /*
                    Go directly to the selected
                    character's page.
                  */
                  navigate(`/characters/${character.id}`)
                }}
              >

                <span className="suggestion-name">
                  {character.name}
                </span>

                <span className="suggestion-description">
                  {character.description}
                </span>

              </button>
            ))

          ) : (

            // Display this when the search has no matches.
            <div className="search-no-results">
              No mutants found.
            </div>

          )}

        </div>
      )}


      {/* Navigation links */}
      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/favourites">♡ Favourites</Link>

        <div className="account-menu">

        <Link to="/login">
          {isLoggedIn ? currentUser.name : "Account"}
        </Link>

        <div className="account-dropdown">

          {isLoggedIn ? (
            <>
              <Link to="/account">Your Account</Link>
              <Link to="/orders">Your Orders</Link>
              <button
                onClick={() => {
                  fetch("http://localhost:3000/api/logout", {
                    method: "POST",
                    credentials: "include"
                  })
                    .then(response => response.json())
                    .then(() => {
                      setIsLoggedIn(false)
                      setCurrentUser(null)
                      navigate("/")
                    })
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}

        </div>

      </div>

        <Link to="/cart">Cart</Link>

      </div>

    </nav>
  )
}


export default Navbar
