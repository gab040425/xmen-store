# X-Men Store

This is my first attempt to create a website with a backend server connected. It is a local demo for browsing an X-Men collectible catalogue. The project combines a React storefront with an Express API and a SQLite database, including account sessions, favourites, a user-specific cart, and test-order checkout.

> This is a locally run learning and portfolio project. It is not a deployed production store and checkout does not take payment.

## Features

- Browse and search 14 X-Men character profiles, including biographies, abilities, aliases, and character portraits.
- View products associated with a character, with product type, price, and stock availability.
- Register, sign in, update account details, and manage favourites using the existing session-based API.
- Add products to a cart, adjust quantities, and retain a cart per signed-in user in browser storage.
- Submit a test order; the backend validates current prices and stock and saves order and item snapshots.
- View order history and an individual order confirmation, including the test-order/no-payment status.

Product catalogue records are maintained in SQLite through the seed scripts; there is no admin dashboard. Product-specific images are temporarily not displayed in the catalogue UI.

## Tech stack

- **Frontend:** React 19, React Router, Vite, and CSS.
- **Backend:** Node.js, Express 5, `express-session`, and `bcrypt`.
- **Database:** SQLite through `better-sqlite3`.
- **Language:** JavaScript (ES modules).

## Architecture

The Vite application in `src/` renders the storefront and calls the Express API at `http://localhost:3000`. The API and additive SQLite schema initialization are in `server/server.js`. By default, the backend opens `server/xmen-shop.db`; set `DB_PATH` in the backend environment to select a different database path. The database stores accounts, characters, products, favourites, orders, and order items. Browser cart data is stored separately and scoped to the signed-in user.

## Local setup

Each local clone has its own SQLite database, user accounts, favourites, and order history. Cart data is stored in browser `localStorage` and keyed by both the authenticated user ID and an opaque installation namespace derived by the backend from the resolved SQLite database path. Clones using different database paths therefore keep separate carts even when they run at the same browser origin. This namespace remains stable across reloads and browser sessions while the database path stays the same; moving a database to a different path creates a new cart namespace.

Browser storage is not a security boundary: users and scripts running on the same browser origin can inspect or change its values. Carts created by older versions under unscoped or user-ID-only keys are left untouched and are not automatically imported, because their originating installation cannot be determined safely. The app does not read those old keys.

### Prerequisites

- Node.js `22.13` or later in the `22.x` line, or `24+`, and npm. These ranges satisfy the Node engine requirements in the current lockfile, including `better-sqlite3`, Vite, and ESLint.
- A local machine that can build `better-sqlite3` if a prebuilt binary is unavailable.

### Install dependencies

From the repository root:

```bash
npm install
```

### Configure the local session secret

Create a local `.env` file in the repository root. Do not replace an existing `.env`; edit it locally if it already exists. The `.env.example` file documents the required variable, but its placeholder is not a usable secret.

Generate a unique value with Node.js:

```bash
node --input-type=commonjs -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in your local `.env`:

```dotenv
SESSION_SECRET=replace_with_your_generated_value
```

Keep `.env` private and out of Git. The app currently uses a local Express session setup; this configuration is for local development, not a production deployment.

### Initialize a fresh local database and demo catalogue

Run these steps only when setting up a fresh demo database. Start the backend once so its startup code creates/migrates the schema, then stop it before running the seed scripts:

```bash
npm run server
```

After the server has initialized the database, stop it with `Ctrl+C`. From the repository root, seed the character data and then the complete product catalogue:

```bash
node server/seed-characters.js
npm run seed:products
```

Then start the backend and frontend in separate terminals as described below. The server creates tables and applies additive schema changes at startup; there is no separate migration command.

**Important character-seed behavior:** `seed-characters.js` uses `INSERT OR REPLACE` and deletes/recreates aliases and abilities for each seeded character. Use it for initial demo-data setup only; do not rerun it against an established database whose character-related data must be preserved.

The master product seed defines all 42 demo products. It validates the definitions and required characters, inserts within a transaction, and skips rows matching `(character_id, product_type, name)` without changing any existing product fields. It reads `DB_PATH` from the environment or local `.env`, and defaults to `server/xmen-shop.db`. A custom database must already have the application schema and character records initialized.

The setup commands above are for a clean demo catalogue. Do not run seed scripts against a database containing user or order data without first reviewing their behavior and making a separate verified backup.

`DB_PATH` is read from the process environment or root `.env` by the backend, character seed, and product seed. All three default to `server/xmen-shop.db`. The one-off `server/fix-mini-figurine-image.js` repair script always uses that default path and does not support `DB_PATH`.

### Start the app

In one terminal, start the backend from the repository root:

```bash
npm run server
```

In a second terminal, start Vite:

```bash
npm run dev
```

Open the local frontend URL printed by Vite (normally `http://localhost:5173`). The API server defaults to `http://localhost:3000`.

## Demo checklist

- Create an account and sign in.
- Search for a character, open the character page, and review its biography, abilities, and products.
- Add and remove characters from favourites, then revisit the favourites page.
- Add an available product to the cart, adjust its quantity, refresh, and confirm the signed-in user's cart persists.
- Proceed through checkout with delivery details. A successful submission creates a **test order** and changes stock; no payment is taken.
- Open order history and view the new order's details/confirmation.

Use only demo data when testing. Checkout writes orders and reduces product stock in the selected SQLite database.

## Screenshots

| Homepage |
| --- |
| <img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/4bc40287-95c5-45ea-8910-bbb9c5a09b9e" />|

| Character detail |
| --- |
| <img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/0a002029-8763-424d-b10f-060cf6815580" />

| Cart and checkout |
| --- |
| <img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/07ee229b-2ded-4ba0-8b7a-25e8d3627b98" />

| Order history / confirmation |
| --- |
| <img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/0b76cb45-4596-4910-aee5-6368373be547" /> |

## Development commands

```bash
npm run build    # Create the production frontend build in dist/
npm run lint     # Run ESLint
npm run preview  # Preview the built frontend locally
```

## Limitations

- This is a local portfolio demo, not a deployed or production-hardened commerce service.
- Checkout creates test orders only; there is no payment processing.
- Product records are maintained through local SQLite seed scripts; there is no admin dashboard.
- Session and database configuration are intended for local development. Production hosting, operational security, and deployment are outside this project's scope.
- The catalogue UI currently hides product-specific images; character portraits remain part of the character experience.

## Author

GitHub: [@gab040425](https://github.com/gab040425)
