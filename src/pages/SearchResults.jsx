/*
  SearchResults component

  This page displays the mutants that match the search
  entered by the user.

  It is responsible for:
  - Reading the search term from the URL
  - Filtering the character database
  - Displaying matching characters
  - Showing a message when there are no matches
  - Remembering that the user came from the search page
*/

import { useSearchParams, Link } from "react-router-dom"
import characters, { getImage } from "../data/characters"
import ContactBar from "../components/ContactBar"
import "./SearchResults.css"

function SearchResults() {

  /* =========================
     READ SEARCH TERM
     =========================

     The search page URL looks like:

       /search?q=wolverine

     useSearchParams() allows us to read the
     "q" value from the URL.

     searchParams.get("q") gives us:

       "wolverine"
  */

  const [searchParams] = useSearchParams()

  const searchTerm =
    searchParams.get("q")?.toLowerCase() || ""


  /* =========================
     FIND MATCHING CHARACTERS
     =========================

     Filter the character database and keep characters
     whose:
     - name
     - id
     - or aliases

     contain the search term.
  */

  const results = characters.filter((character) => {

    // Convert the name and ID to lowercase so
    // the search is not case-sensitive.
    const name = character.name.toLowerCase()
    const id = character.id.toLowerCase()


    /*
      aliases is an array, so we use map() to convert
      every alias to lowercase.

      The || [] makes sure we still have an empty
      array if a character has no aliases.
    */

    const aliases =
      character.aliases?.map((alias) => alias.toLowerCase()) || []


    /*
      Keep this character if at least one of these
      conditions is true:

      - search term appears in the name
      - search term appears in the ID
      - search term appears in any alias

      some() checks whether at least one alias matches.
    */

    return (
      name.includes(searchTerm) ||
      id.includes(searchTerm) ||
      aliases.some((alias) => alias.includes(searchTerm))
    )
  })


  /* =========================
     PAGE UI
     ========================= */

  return (
    <>

      <main className="search-results-page">

        {/* Return to the homepage */}

        <Link
          to="/"
          className="back-button"
        >
          ← Back to Home
        </Link>


        {/* =========================
            SEARCH RESULTS HEADING
            ========================= */}

        <div className="search-results-heading">

          <p className="eyebrow">
            SEARCH RESULTS
          </p>

          <h1>
            RESULTS FOR <span>"{searchTerm}"</span>
          </h1>

          <p className="search-results-count">
            {results.length} mutant
            {results.length !== 1 ? "s" : ""} found
          </p>

        </div>


        {/* =========================
            RESULTS / NO RESULTS
            =========================

            If there are matching characters,
            display the character cards.

            Otherwise, display the no-results message.
        */}

        {results.length > 0 ? (

          <div className="character-grid">

            {results.map((character) => (

              <Link
                to={`/characters/${character.id}`}

                /*
                  Remember where the user came from.

                  CharacterPage uses this value so its
                  Back button can return to these search
                  results instead of always returning home.
                */
                state={{
                  from: `/search?q=${searchTerm}`
                }}

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

                <span>
                  View Character →
                </span>

              </Link>
            ))}

          </div>

        ) : (

          /* =========================
             NO RESULTS
             ========================= */

          <div className="no-results">

            <h2>
              No mutants found.
            </h2>

            <p>
              We couldn't find any mutants matching
              "{searchTerm}".
            </p>

            <Link
              to="/"
              className="no-results-button"
            >
              Browse All Mutants
            </Link>

          </div>

        )}

      </main>


      {/* Reusable contact section */}

      <ContactBar />

    </>
  )
}


export default SearchResults
