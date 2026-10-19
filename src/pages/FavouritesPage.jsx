/*
  FavouritesPage component

  This page will eventually show the characters
  that the user has saved as favourites.

  For now, users who are not logged in are asked
  to log in before they can access their favourites.
*/

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getImage } from "../data/characters"
import "./FavouritesPage.css"

import ContactBar from "../components/ContactBar"

function FavouritesPage({ characters, charactersLoading, charactersError }) {
  const [favourites, setFavourites] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch("http://localhost:3000/api/favourites", {
      credentials: "include"
    })
      .then(response => {
        if (response.status === 401) {
          setIsLoggedIn(false)
          return null
        }

        return response.json()
      })
      .then(data => {
        if (data) {
          setIsLoggedIn(true)
          setFavourites(data.favourites)
        }
      })
  }, [])

  const favouriteCharacters = characters.filter(
    character => favourites.includes(character.id)
  )

  return (
    <>
      <main className="favourites-page">

        <div className="favourites-container">


          <p className="eyebrow">YOUR COLLECTION</p>

          <h1>FAVOURITES.</h1>

          {!isLoggedIn ? (
            <>
              <p className="favourites-text">
                Log in to save and view your favourite mutants.
              </p>

              <Link
                to="/login"
                className="favourites-login-button"
              >
                LOG IN
              </Link>
            </>
          ) : charactersLoading ? (
            <p role="status">Loading characters…</p>
          ) : charactersError ? (
            <p role="alert">{charactersError}</p>
          ) : favouriteCharacters.length > 0 ? (
            <div className="character-grid">
              {favouriteCharacters.map((character) => (
                <Link
                  to={`/characters/${character.id}`}
                  state={{ from: "/favourites" }}
                  className="character-card"
                  key={character.id}
                >
                  <div className="character-image">
                    <img
                      src={getImage(character.image)}
                      alt={character.name}
                      style={{
                        objectPosition:
                          character.imagePosition || "center"
                      }}
                    />
                  </div>

                  <h3>{character.name}</h3>

                  <p>{character.description}</p>

                  <span>View Character →</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-favourites">
              <p>
                You haven't saved any mutants yet.
              </p>

              <Link
                to="/"
                className="no-favourites-button"
              >
                BROWSE MUTANTS
              </Link>
            </div>
          )}

        </div>

      </main>

      <ContactBar />
    </>
  )
}

export default FavouritesPage
