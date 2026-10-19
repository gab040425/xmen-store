/* global process */

import "dotenv/config"
import Database from "better-sqlite3"

const db = new Database(process.env.DB_PATH || "server/xmen-shop.db")

const characters = [
  {
    id: "wolverine",
    name: "Wolverine",
    description: "Adamantium. Claws. Attitude.",
    popularity: 98,
    accent: "#f2c94c",
    accentSecondary: null,
    image: "wolverine.png",
    imagePosition: null,
    bio: "A mutant with an unstoppable healing power, adamantium metal claws and no-nonsense attitude makes the man called Logan, one of the most ferocious heroes in the universe.",
    aliases: ["logan", "james howlett"],
    abilities: [
      ["Regenerative Healing", "If he does get into a scuffle, Wolverine’s healing powers kick in."],
      ["Adamantium Skeleton", "Wolverine’s skeleton is encased in adamantium, including his lethal retractable claws."],
      ["Enhanced Senses", "Wolverine’s enhanced senses enable him to sense fear, lies, and a host of other hard-to-detect sensations."],
      ["Impermeable skin", "Wolverine’s nearly impermeable skin protects him from projectiles and sharp weapons."],
      ["Expert Combatant", "Trained as a samurai, Wolverine knows his way around a sword and hand-to-hand combat."]
    ]
  },

  {
    id: "magneto",
    name: "Magneto",
    description: "Master of magnetism.",
    popularity: 95,
    accent: "#8e44ad",
    accentSecondary: "#e63946",
    image: "magneto.png",
    imagePosition: "center 0%",
    bio: "Using his mighty ability to control magnetic fields, the one called Magneto fights to help mutants replace humans as the world's dominant species.",
    aliases: ["erik lenshaw", "magnus"],
    abilities: [
      ["Manipulate Magnetism", "Magneto can manipulate magnetism and shoot electromagnetic pulses that can disable electronic devices. Using these abilities, he can bend metal, assemble machinery, and manipulate the iron in his enemies’ blood."],
      ["Control of Energy", "Magneto possesses power across the electromagnetic spectrum, allowing him to sometimes even control energy like visible light and gamma rays."],
      ["Force Fields", "Magneto can create powerful electromagnetic force fields capable of protecting himself and others from physical attacks and explosions."],
      ["Flight", "By manipulating magnetic fields around himself, Magneto can lift and propel his body through the air at incredible speeds."],
      ["Mutant Cause", "Despite his immense physical and magnetic abilities, Magneto’s greatest power may be his leadership, vision, and commitment to the mutant cause. Sometimes aligned with heroes—sometimes with villains—Magneto is the spearhead figure of mutant rights."]
    ]
  },

  {
    id: "storm",
    name: "Storm",
    description: "The sky answers to her.",
    popularity: 92,
    accent: "#7dd3fc",
    accentSecondary: null,
    image: "storm.png",
    imagePosition: "center 10%",
    bio: "Mutant Ororo Munroe confounds enemies of the X-Men by using her psionic abilities to manipulate the weather.",
    aliases: ["ororo munroe", "weather witch"],
    abilities: [
      ["Weather Manipulation", "As an atmokinetic, Storm can psionically control and manipulate weather patterns. She can induce lighting, create rain or fog, control and redirect the wind, and disperse natural storms."],
      ["Flight", "By using her powers over weather, Storm manipulates the winds around her to take to the skies and fly."],
      ["Atmospheric Perception", "Storm possesses an extraordinary sensitivity to changes in the atmosphere, allowing her to perceive weather patterns and environmental disturbances across vast distances."]
    ]
  },

  {
    id: "gambit",
    name: "Gambit",
    description: "Always holding the winning hand.",
    popularity: 90,
    accent: "#b026ff",
    accentSecondary: null,
    image: "gambit.png",
    imagePosition: null,
    bio: "Known as the Ragin' Cajun, Gambit is one of the foremost professional thieves in the world and becomes one of the X-Men’s most powerful weapons",
    aliases: ["remy lebeau", "le diable blanc"],
    abilities: [
      ["Kinetic Charging", "Gambit can infuse objects with kinetic energy, causing them to explode with tremendous force when released or triggered."],
      ["Explosive Cards", "Gambit famously charges playing cards with kinetic energy and throws them as precise, explosive projectiles."],
      ["Enhanced Agility", "His enhanced reflexes, balance, and agility allow Gambit to perform extraordinary acrobatic maneuvers and move effortlessly through combat."],
      ["Bo Staff Combat", "A skilled martial artist and staff fighter, Gambit combines his bo staff with his kinetic abilities to deliver powerful and unpredictable attacks."],
      ["Thief's Expertise", "Gambit's years as a master thief have given him exceptional skills in stealth, sleight of hand, lockpicking, infiltration, and reading people."]
    ]
  },

  {
    id: "nightcrawler",
    name: "Nightcrawler",
    description: "Teleporting blue mutant.",
    popularity: 95,
    accent: "#e30b5d",
    accentSecondary: null,
    image: "nightcrawler.png",
    imagePosition: null,
    bio: "Born with a demonic appearance but blessed with a gentle soul, Nightcrawler uses his teleportation and extraordinary agility to fight for those who fear him.",
    aliases: ["kurt wagner"],
    abilities: [
      ["Bamf Teleportation", "Nightcrawler can teleport himself and others by traveling through an alternate dimension, disappearing in a cloud of smoke and reappearing almost instantly."],
      ["Superhuman Agility", "His flexible physiology and extraordinary balance allow Nightcrawler to perform incredible acrobatic maneuvers."],
      ["Wall-Crawling", "Nightcrawler can cling to and move across vertical surfaces, making him extremely difficult to corner."],
      ["Enhanced Reflexes", "His heightened reflexes allow him to dodge attacks and react to danger with incredible speed."],
      ["Expert Swordsman", "Kurt is highly skilled with a sword, combining his fencing ability with teleportation and acrobatics to create an unpredictable fighting style."]
    ]
  },

  {
    id: "emma-frost",
    name: "Emma Frost",
    description: "The White Queen.",
    popularity: 87,
    accent: "#d9e6f2",
    accentSecondary: null,
    image: "emma-frost.png",
    imagePosition: "center 0%",
    bio: "The Diamond Diva and Headmistress Emma Frost uses her mutant psionic abilities to manipulate others, but when it comes to her students, she turns into a hero and joins the X-Men.",
    aliases: ["white queen"],
    abilities: [
      ["Telepathy", "Emma can read minds, communicate telepathically, manipulate thoughts, and influence the perceptions of others with extraordinary precision."],
      ["Diamond Form", "Emma can transform her body into an organic diamond form, granting her immense durability and strength while making her highly resistant to physical attacks."],
      ["Psychic Manipulation", "Emma can alter or control the minds of others, creating illusions, suppressing memories, and compelling people to act against their instincts."],
      ["Psychic Defense", "Her immense mental discipline allows Emma to shield her mind from psychic attacks and protect others from telepathic intrusion."],
      ["Mind-Link", "Emma can establish powerful psychic connections with individuals or groups, allowing her to communicate across great distances and coordinate allies without speaking."]
    ]
  },

  {
    id: "stepford-cuckoos",
    name: "Stepford Cuckoos",
    description: "Three minds. One voice.",
    popularity: 91,
    accent: "#f5d76e",
    accentSecondary: null,
    image: "stepford-cuckoos.png",
    imagePosition: null,
    bio: "The Stepford Cuckoos are a group of powerful mutant telepaths who share a psychic bond that allows them to function as a single collective mind. Originally five sisters, the Cuckoos are intelligent, calculating, and fiercely loyal to one another.",
    aliases: ["the Cuckoos", "Five-in-One"],
    abilities: [
      ["Telepathy", "Cloned from mutant Emma Frost, identical telepaths Sophie, Phoebe, Irma, Celeste, and Esme combine their powers into a hive-mind and join the X-Men as the Stepford Cuckoos."],
      ["Psychic Hive-Mind", "The sisters can link their minds together, dramatically amplifying their collective psychic power and allowing them to share thoughts, memories, and perceptions."],
      ["Psychic Possession", "By projecting their consciousness into another person's mind, the Cuckoos can influence or temporarily take control of their actions."],
      ["Astral Projection", "The Cuckoos can project their consciousness into the astral plane, allowing them to interact with other minds and psychic entities beyond their physical bodies."],
      ["Diamond Form", "Like their mentor Emma Frost, the Cuckoos can transform their bodies into an organic diamond form, granting them extraordinary durability and resistance to physical attacks."]
    ]
  },

  {
    id: "polaris",
    name: "Polaris",
    description: "Mistress of magnetism.",
    popularity: 90,
    accent: "#2ecc71",
    accentSecondary: null,
    image: "polaris.png",
    imagePosition: null,
    bio: "Possessing magnetic powers, much like her father, Lorna Dane fights to help her fellow mutants fight against persecution.",
    aliases: ["lorn dane"],
    abilities: [
      ["Magnetic Manipulation", "Her magnetic powers also allow her to by gliding along natural magnetic lines of force, as she is able to perceive the world around her in electromagnetic energy patterns."],
      ["Electromagnetic Energy", "Polaris can generate and manipulate electromagnetic energy, allowing her to unleash powerful blasts and interfere with electronic systems."],
      ["Flight", "By manipulating magnetic fields around herself, Polaris can levitate and propel her body through the air at high speeds."]
    ]
  },

  {
    id: "scarlet-witch",
    name: "Scarlet Witch",
    description: "She who rewrites reality.",
    popularity: 99,
    accent: "#c0392b",
    accentSecondary: null,
    image: "scarlet-witch.png",
    imagePosition: null,
    bio: "A powerful mutant sorceress, Wanda Maximoff has been a master of the mystical arts for both the X-Men and the Avengers.",
    aliases: ["wanda maximoff"],
    abilities: [
      ["Chaos Magic", "Wanda can manipulate Chaos Magic, which is so powerful, she has been able to generate armies from seemingly nowhere."],
      ["Reality Manipulation", "Scarlet Witch can alter reality on an extraordinary scale, reshaping matter and rewriting the conditions of the world around her with simple verbal commands."],
      ["Probability Manipulation", "Wanda can manipulate probability, causing unlikely events to occur and making it extraordinarily difficult for her opponents to predict or overcome her."],
      ["Telekinesis", "Wanda can move, restrain, and destroy objects with her mind, controlling everything from small objects to enormous structures."]
    ]
  },

  {
    id: "quicksilver",
    name: "Quicksilver",
    description: "The world's fastest mutant.",
    popularity: 94,
    accent: "#3498db",
    accentSecondary: null,
    image: "quicksilver.png",
    imagePosition: null,
    bio: "Born with extraordinary superhuman speed, Pietro Maximoff can move, think, and react faster than almost anyone alive. Impulsive and fiercely protective of his family, Quicksilver is a blur on the battlefield and a constant challenge to anyone who tries to stop him.",
    aliases: ["pietro maximoff"],
    abilities: [
      ["Superhuman Speed", "Quicksilver can move at incredible speeds, allowing him to cross vast distances in moments and overwhelm opponents before they can react."],
      ["Accelerated Perception", "Pietro experiences the world at a dramatically accelerated rate, allowing him to analyze situations and make decisions while everything around him appears almost frozen."],
      ["Superhuman Stamina", "His body is adapted to withstand the immense physical demands of his speed, allowing him to run for extended periods without suffering the exhaustion of a normal human."]
    ]
  },

  {
    id: "professor-x",
    name: "Professor X",
    description: "A mind without limits.",
    popularity: 97,
    accent: "#3498db",
    accentSecondary: null,
    image: "professor-x.png",
    imagePosition: null,
    bio: "A brilliant telepath and visionary leader, Charles Xavier dedicated his life to creating a world where mutants and humans could coexist peacefully. As the founder of the X-Men, he uses his extraordinary mind to guide and protect mutantkind.",
    aliases: ["charles xavier", "professor charles xavier"],
    abilities: [
      ["Telepathy", "Professor X is one of the most powerful telepaths on Earth, capable of reading minds, communicating across vast distances, and influencing the thoughts of others."],
      ["Psychic Manipulation", "Xavier can alter memories, suppress thoughts, influence behavior, and reshape a person's perception of reality through his immense psychic power."],
      ["Cerebro", "Using Cerebro, Professor X can amplify his telepathic abilities to locate and communicate with mutants across enormous distances."],
      ["Psychic Defense", "His immense mental discipline allows Xavier to shield his mind from psychic attacks and defend himself against even powerful telepaths."],
      ["Psychic Projection", "Professor X can project his consciousness into the minds of others, allowing him to communicate, influence, and interact with people far beyond his physical location."]
    ]
  },

  {
    id: "mystique",
    name: "Mystique",
    description: "No face, no allegiance.",
    popularity: 93,
    accent: "#3498db",
    accentSecondary: null,
    image: "mystique.png",
    imagePosition: null,
    bio: "A master of deception with the ability to become anyone she encounters, Mystique has spent her life navigating a world of shifting loyalties. Whether fighting for mutantkind or pursuing her own agenda, Raven Darkholme is never quite who she appears to be.",
    aliases: ["raven darkholme"],
    abilities: [
      ["Shapeshifting", "Mystique can transform her appearance to perfectly resemble other people, altering her facial features, body, voice, and even fingerprints."],
      ["Infiltration", "Her ability to assume almost any identity makes Mystique an exceptional spy and infiltrator, capable of deceiving even those closest to her targets."],
      ["Enhanced Agility", "Mystique possesses exceptional physical coordination and agility, allowing her to move with remarkable speed and precision during combat."],
      ["Expert Combatant", "Years of espionage and combat have made Mystique highly skilled in hand-to-hand fighting, weapons, and tactical warfare."]
    ]
  },

  {
    id: "cyclops",
    name: "Cyclops",
    description: "Unleashing the optic fury.",
    popularity: 96,
    accent: "#e74c3c",
    accentSecondary: null,
    image: "cyclops.png",
    imagePosition: null,
    bio: "From a stoic leader of the X-Men to a hardened radical, Cyclops is always true to mutantkind and determined to make Xavier’s dream of peace between mutants and humans a reality.",
    aliases: ["scott summers"],
    abilities: [
      ["Optic Blast", "Cyclops can unleash powerful beams of concussive energy from his eyes, capable of knocking back opponents, destroying obstacles, and leveling structures."],
      ["Energy Projection", "Scott can precisely control the direction, width, and intensity of his optic blasts, allowing him to use them for both devastating attacks and delicate maneuvers."],
      ["Ricochet Shots", "Cyclops can use his optic blasts to bounce energy off surfaces, striking targets from unexpected angles with remarkable accuracy."],
      ["Tactical Genius", "Scott is an exceptional battlefield strategist, capable of analyzing rapidly changing situations and coordinating the X-Men with precision."]
    ]
  },

  {
    id: "jean-grey",
    name: "Jean Grey",
    description: "The Phoenix rises again.",
    popularity: 98,
    accent: "#F4A261",
    accentSecondary: null,
    image: "jean-grey.png",
    imagePosition: null,
    bio: "From Marvel Girl to Dark Phoenix, Jean Grey's telepathic and telekinetic abilities make her one of the most powerful X-Men in history.",
    aliases: ["jean grey", "marvel girl", "phoenix"],
    abilities: [
      ["Telepathy", "Jean can read and communicate with minds, project thoughts, manipulate memories, and influence the consciousness of others across great distances."],
      ["Telekinesis", "Jean can move, lift, and manipulate matter with her mind, generating immense force and controlling objects with extraordinary precision."],
      ["Psychic Energy", "Jean can manifest powerful psychic energy as offensive blasts, shields, and other forms of concentrated mental force."],
      ["Psychic Projection", "Jean can project her consciousness beyond her physical body, allowing her to interact with other minds and operate on the astral plane."],
      ["Phoenix Force", "When bonded with the Phoenix Force, Jean gains cosmic-level power capable of manipulating matter, energy, and life on an unimaginable scale."]
    ]
  }
]

const insertCharacter = db.prepare(`
  INSERT OR REPLACE INTO characters (
    id,
    name,
    description,
    popularity,
    accent,
    accent_secondary,
    image,
    image_position,
    bio
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertAlias = db.prepare(`
  INSERT INTO character_aliases (character_id, alias)
  VALUES (?, ?)
`)

const insertAbility = db.prepare(`
  INSERT INTO abilities (character_id, name, description)
  VALUES (?, ?, ?)
`)

const seed = db.transaction(() => {
  for (const character of characters) {
    insertCharacter.run(
      character.id,
      character.name,
      character.description,
      character.popularity,
      character.accent,
      character.accentSecondary,
      character.image,
      character.imagePosition,
      character.bio
    )

    db.prepare(`
      DELETE FROM character_aliases
      WHERE character_id = ?
    `).run(character.id)

    db.prepare(`
      DELETE FROM abilities
      WHERE character_id = ?
    `).run(character.id)

    for (const alias of character.aliases) {
      insertAlias.run(character.id, alias)
    }

    for (const [name, description] of character.abilities) {
      insertAbility.run(character.id, name, description)
    }
  }
})

seed()

console.log(`Successfully seeded ${characters.length} characters.`)

db.close()
