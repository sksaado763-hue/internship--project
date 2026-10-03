# Meridian Tools

An original, privacy-minded foundation for a growing library of focused online tools. This repository uses a React and Vite client, an Express REST API, and MongoDB through Mongoose.

## Current build: searchable tools and text utilities

The app includes a responsive landing page, persistent light and dark themes, a searchable tool directory, persistent favorites, and six browser-based utilities. Text tools count words and characters or convert letter case. Developer tools format and validate JSON, encode and decode URL values, and convert UTF-8 text to and from Base64. Tool processing stays on the user's device. The Express API and MongoDB catalog are available for the server-side foundation.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 7 requirement)
- npm 10+
- MongoDB Community Server locally, or a MongoDB connection URI

## Install

From the repository root:

```bash
npm ci
```

Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI` to your local or hosted MongoDB connection string. `.env` files are ignored by Git.

To load the starter categories and tools into MongoDB after configuring the URI, run:

```bash
npm run seed:catalog
```

The seed command upserts the starter catalog and can be run more than once.

## Run

Start the client and server together:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
npm run dev:client
npm run dev:server
```

The Vite client runs at <http://localhost:5173>. The Express API runs at <http://localhost:5000>.

## Use the tools

- Open the Vite URL printed in the terminal (usually <http://localhost:5173>) to view the landing page and tool directory.
- Browse or search at <http://localhost:5173/tools>.
- Direct tool routes include `/tools/word-counter`, `/tools/character-counter`, `/tools/case-converter`, `/tools/json-formatter`, `/tools/url-encoder-decoder`, and `/tools/base64-encoder-decoder`.
- Favorite tools are saved in local browser storage. Text entered into the tools is processed in the browser.
- Open <http://localhost:5000/api/health>. A running API returns `{"success":true,"message":"API is running"}`.
- MongoDB is optional for the health route; catalog endpoints and the seed command require a configured, running database.

## Dependencies

| Package | Purpose |
| --- | --- |
| React, React DOM | UI components and browser rendering |
| Vite, React plugin | Local development server and production builds |
| React Router | Client-side navigation for the directory and tool pages |
| Tailwind CSS, PostCSS, Autoprefixer | Utility CSS and CSS processing |
| Lucide React | Consistent, accessible icon components |
| Express | REST API server |
| Mongoose | MongoDB connection and schemas |
| dotenv | Local environment configuration |
| CORS | Restrict browser API access to the client origin |
| Helmet | Secure HTTP response headers |
| Morgan | Development request logs |
| express-rate-limit | Baseline API request throttling |
| concurrently | Run client and server scripts together |

## Structure

```text
client/                         React + Vite application
  src/App.jsx                    Lazy routes, theme and favorites providers, search state
  src/components/common/         Shared controls and reusable tool cards
  src/components/layout/         Responsive navigation, page layout, footer
  src/components/tools/          Reusable tool page and three text-tool interfaces
  src/context/ThemeContext.jsx   Persistent light/dark theme
  src/context/FavoritesContext.jsx Persistent favorites
  src/data/                      Tool registry and shared page content
  src/pages/                     Home, directory, tool, and not-found pages
  src/utils/tools/               Isolated text analysis and case conversion logic
  src/styles.css                 Central design tokens and responsive styles
  src/main.jsx                   Browser entry point and router provider
shared/                          Catalog metadata shared by the client and server
server/                         Express + Mongoose application
  src/app.js                     Middleware and API routes
  src/controllers/               HTTP handlers
  src/middleware/                Catalog query validation and DB checks
  src/models/                    User, tool, and category schemas
  src/routes/                    API route definitions
  src/services/                  Catalog queries
  src/scripts/                   Idempotent starter catalog seed
  src/server.js                  Environment loading, DB connection, HTTP listener
  .env.example                   Local environment variable template
package.json                     npm workspaces and root scripts
```

## API

### `GET /api/health`

Returns `200 OK` with `{ "success": true, "message": "API is running" }`.

### `GET /api/tools`

Returns active tools in `{ "success": true, "data": { "tools": [] } }`. Optional query parameters: `search`, `category` (slug), `popular`, `featured`, and `new`.

### `GET /api/categories`

Returns active categories and their active tool counts in `{ "success": true, "data": { "categories": [] } }`.

## Next steps

1. Add more tools across the existing categories.
2. Connect the live directory to catalog data when database-backed editing is introduced.
3. Add optional accounts and cloud-synced preferences when authentication is introduced.
