 /*
   CharacterPage component

   This page displays the details of one selected mutant.

   It is responsible for:
   - Finding the character from the URL
   - Displaying the character's image and information
   - Providing a back button
   - Letting the user choose a figure type
   - Showing the character's biography
   - Expanding and collapsing powers & abilities
   - Displaying the reusable ContactBar
 */

import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import characters, { getImage } from "../data/characters"
import ContactBar from "../components/ContactBar"


function CharacterPage() {

  /* =========================
     URL INFORMATION
     =========================

     useParams() gives us values from dynamic URL
     parameters.

     Our route in App.jsx is:

       /characters/:id

     Therefore, if the URL is:

       /characters/wolverine

     id will contain:

       "wolverine"
  */

  const { id } = useParams()


  /*
    useLocation() gives us information about the
    current navigation/location.

    We use location.state to remember where the user
    came from, so the Back button can return them to
    the correct page.
  */

  const location = useLocation()


  /* =========================
     ABILITY STATE
     =========================

     openAbility stores the name of the ability that
     is currently expanded.

     null means no ability is currently open.

     Example:

       openAbility = "Flight"

     means the Flight description is visible.
  */

  const [openAbility, setOpenAbility] = useState(null)
  const [isFavourite, setIsFavourite] = useState(false)

  useEffect(() => {
    fetch("http://localhost:3000/api/favourites", {
      credentials: "include"
    })
      .then(response => response.json())
      .then(data => {
        console.log("Full response:", data)
        console.log("My favourites:", data.favourites)
        console.log("Current character:", id)

        if (data.favourites && data.favourites.includes(id)) {
          setIsFavourite(true)
        } else {
          setIsFavourite(false)
        }
      })
  }, [id])

  /* =========================
     FIND CHARACTER
     =========================

     characters is the array containing all of our
     character data.

     find() searches the array and returns the first
     character whose id matches the URL id.

     Example:

       URL id: "wolverine"

       character.id: "wolverine"

       → Wolverine object is returned.
  */

  const character = characters.find(
    (character) => character.id === id
  )


  /* =========================
     CHARACTER NOT FOUND
     =========================

     If the URL contains an id that does not exist
     in characters.js, character will be undefined.

     In that situation, show an error message instead
     of trying to display missing character information.
  */

  if (!character) {
    return (
      <main className="character-page">

        <h1>Character not found</h1>

        <Link to="/">
          ← Back to Mutants
        </Link>

      </main>
    )
  }


  /* =========================
     CHARACTER PAGE
     =========================

     The character's accent colours are passed to CSS
     through CSS custom properties.

     CharacterPage.css/App.css can then use:

       var(--character-accent)

     and

       var(--character-accent-secondary)

     to create the character-specific glow.
  */

  return (
    <>

      <main
        className="character-page"
        style={{
          "--character-accent": character.accent,
          "--character-accent-secondary":
            character.accentSecondary || character.accent
        }}
      >

        {/* Back to the previous page */}

        <Link
          to={location.state?.from || "/"}
          className="back-button"
        >
          ← Back to Mutants
        </Link>


        {/* =========================
            PRODUCT SECTION
            ========================= */}

        <div className="character-detail">

          {/* Character image */}

          <div className="character-detail-image">

            <img
              src={getImage(character.image)}
              alt={character.name}
            />

          </div>


          {/* Character information */}

          <div className="character-info">

            <p className="eyebrow">
              X-MEN COLLECTION
            </p>

            <h1>{character.name}</h1>

            <p className="character-description">
              {character.description}
            </p>


            {/* Favourite button */}

            <button
              className={`favorite-button ${isFavourite ? "favourited" : ""}`}
              onClick={() => {
                if (isFavourite) {
                  fetch(`http://localhost:3000/api/favourites/${id}`, {
                    method: "DELETE",
                    credentials: "include"
                  })
                    .then(response => response.json())
                    .then(() => {
                      setIsFavourite(false)
                    })
                } else {
                  fetch("http://localhost:3000/api/favourites", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      characterId: id
                    })
                  })
                    .then(response => response.json())
                    .then(() => {
                      setIsFavourite(true)
                    })
                }
              }}
            >
              <span className="favorite-heart">
                {isFavourite ? "♥" : "♡"}
              </span>{" "}
              {isFavourite ? "FAVOURITED" : "FAVOURITE"}
            </button>


            {/* =========================
                FIGURE OPTIONS
                ========================= */}

            <section className="figure-section">

              <h2>CHOOSE YOUR FIGURE</h2>

              <div className="figure-options">

                <button>Funko Pop</button>
                <button>Mini Figurine</button>
                <button>1:6 Scale</button>

              </div>

            </section>

          </div>

        </div>


        {/* =========================
            CHARACTER INFORMATION
            ========================= */}

        <section className="character-lore">

          <h2>
            ABOUT {character.name.toUpperCase()}
          </h2>

          <p>{character.bio}</p>


          <h2>POWERS & ABILITIES</h2>


          {/* =========================
              ABILITY LIST
              =========================

              map() creates one ability section for
              every ability stored in characters.js.
          */}

          <div className="ability-list">

            {character.abilities.map((ability) => (

              <div
                className="ability-item"
                key={ability.name}
              >

                {/* Ability title/button */}

                <button
                  className="ability-button"

                  onClick={() =>
                    setOpenAbility(
                      openAbility === ability.name
                        ? null
                        : ability.name
                    )
                  }
                >

                  <span>
                    {ability.name}
                  </span>


                  {/* Arrow changes when the ability is open */}

                  <span
                    className={`ability-arrow ${
                      openAbility === ability.name
                        ? "open"
                        : ""
                    }`}
                  ></span>

                </button>


                {/* Ability description */}

                {openAbility === ability.name && (

                  <div className="ability-description">

                    <p>
                      {ability.description}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        </section>

      </main>


      {/* Reusable contact section */}

      <ContactBar />

    </>
  )
}


export default CharacterPage
