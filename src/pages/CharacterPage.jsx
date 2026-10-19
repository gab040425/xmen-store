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
import { getImage } from "../data/characters"
import { loadProducts } from "../data/products"
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


function CharacterPage({ characters, charactersLoading, charactersError }) {

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
  const [productData, setProductData] = useState({
    characterId: null,
    products: [],
    loading: true,
    error: "",
  })
  const [selectedProductId, setSelectedProductId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    loadProducts(id, { signal: controller.signal })
      .then(products => {
        setProductData({ characterId: id, products, loading: false, error: "" })
        setSelectedProductId(null)
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          setProductData({
            characterId: id,
            products: [],
            loading: false,
            error: error.message || "Unable to load products.",
          })
        }
      })

    return () => controller.abort()
  }, [id])

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
  const hasCurrentProductData = productData.characterId === id
  const products = hasCurrentProductData ? productData.products : []
  const productsLoading = !hasCurrentProductData || productData.loading
  const productsError = hasCurrentProductData ? productData.error : ""
  const selectedProduct = products.find(
    product => product.id === selectedProductId
  )


  /* =========================
     CHARACTER NOT FOUND
     =========================

     If the URL contains an id that does not exist
     in characters.js, character will be undefined.

     In that situation, show an error message instead
     of trying to display missing character information.
  */

  if (charactersLoading) {
    return <main className="character-page"><p role="status">Loading character…</p></main>
  }

  if (charactersError) {
    return <main className="character-page"><p role="alert">{charactersError}</p><Link to="/">Back to Mutants</Link></main>
  }

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

              {productsLoading ? (
                <p role="status">Loading products…</p>
              ) : productsError ? (
                <p role="alert">{productsError}</p>
              ) : products.length === 0 ? (
                <p className="empty-product-message">
                  No figures are available for this character yet. Please check back later.
                </p>
              ) : (
                <div className="figure-options">
                  {products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      className={`product-option ${selectedProductId === product.id ? "selected" : ""}`}
                      aria-pressed={selectedProductId === product.id}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <img src={product.image_url} alt="" loading="lazy" />
                      <span className="product-option-details">
                        <strong>{product.name}</strong>
                        <span>{productTypeLabels[product.product_type] || product.product_type}</span>
                        <span>{formatPrice(product.price_cents)}</span>
                        <span className={product.stock_quantity > 0 ? "product-in-stock" : "product-out-of-stock"}>
                          {product.stock_quantity > 0
                            ? `In stock (${product.stock_quantity} available)`
                            : "Out of stock"}
                        </span>
                      </span>
                    </button>
                  ))}
                  {selectedProduct && (
                    <p className="selected-product-message" role="status">
                      Selected: {selectedProduct.name}
                    </p>
                  )}
                </div>
              )}

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
