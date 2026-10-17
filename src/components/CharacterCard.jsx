/*
  CHARACTER CARD

  This component displays a single character as a reusable card.

  Instead of writing the same card HTML for every character,
  we create the card once and reuse it by passing different
  character data into the component.

  The character data is received through a React prop.
*/

import { getImage } from "../data/characters"

function CharacterCard({ character }) {
  // "character" is a prop passed into this component.
  // It contains all the information needed to display the card.
  return (
    <div className="character-card">
      <div className="character-image">
        <img
        src={getImage(character.image)}
        alt={character.name}
        />
      </div>

      <h3>{character.name}</h3>

      <p>{character.description}</p>

      <button>View Collection →</button>
    </div>
  )
}

export default CharacterCard

// Currently unused for some reason
// Maybe delete it?
