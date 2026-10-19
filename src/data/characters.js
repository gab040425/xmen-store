/*

  This file contains the data for all characters in the shop.

  Keeping the character information separate from the UI
  allows the same data to be reused by different parts of the website, such as:
  - The homepage
  - Search results
  - Character detail pages

  It also means that adding a new character only requires
  adding a new object to this array instead of changing
  the page components.
*/

/*
  Load all character images from the character-images folder.

  import.meta.glob() is a Vite feature that finds files
  matching the given path pattern.

  "eager: true" tells Vite to load the images immediately
  instead of waiting until they are requested.

  "?url" tells Vite to give us the URL of each image.
*/

const images = import.meta.glob(
  "../assets/character-images/*",
  { eager: true, query: "?url", import: "default" }
)

/*
  Find the image URL that matches a character's filename.

  The character data only stores the filename, for example:

    image: "wolverine.png"

  getImage() searches the imported images and returns
  the corresponding image URL.

  This allows our components to use:

    getImage(character.image)

  instead of manually importing every character image.
*/

const getImage = (filename) => {
  const imagePath = Object.keys(images).find((path) =>
    path.endsWith(`/${filename}`)
  )

  return images[imagePath]
}

/*
  Main character database.

  Each object represents one character and contains
  all the information needed by the website.

  The UI components read this data instead of
  hardcoding character information directly into JSX.

  Common properties:
  - id: unique identifier used in URLs
  - name: character's display name
  - description: short text shown on character cards
  - popularity: numerical popularity score
  - aliases: alternative names used by search
  - accent: character-specific visual accent color
  - accentSecondary: optional additional visual accent color
  - image: filename of the character image
  - imagePosition: optional image cropping position
  - bio: longer character description
  - abilities: list of the character's powers
*/
export const loadCharacters = async () => {
  const response = await fetch("http://localhost:3000/api/characters")

  if (!response.ok) {
    throw new Error("Failed to load characters.")
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new Error("The character API returned an invalid response.")
  }

  return data.map((character) => ({
    ...character,
    accentSecondary: character.accentSecondary ?? character.accent_secondary,
    imagePosition: character.imagePosition ?? character.image_position,
    aliases: Array.isArray(character.aliases) ? character.aliases : [],
    abilities: Array.isArray(character.abilities) ? character.abilities : [],
  }))
}

/*
  Export the character data and image helper so other files
  can use them.

  default export:
    characters → used when importing the character database

  named export:
    getImage → used when a component needs an image URL
*/
export { getImage }
