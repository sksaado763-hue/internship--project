# Meridian Tools

An original, privacy-minded foundation for a growing library of focused online tools. This repository uses a React and Vite client, an Express REST API, and MongoDB through Mongoose.

## Current build: design system and home page

The app now has a responsive landing page, persistent light and dark themes, keyboard-accessible navigation and dialogs, shared interface components, and the Express/MongoDB foundation. Tool pages and the searchable tool registry are the next build steps.

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

## Verify the app

- Open the Vite URL printed in the terminal (usually <http://localhost:5173>) to view the landing page.
- Open <http://localhost:5000/api/health>. A running API returns `{"success":true,"message":"API is running"}`.
- MongoDB is optional for this starter health route; without a configured URI, the API logs a warning and starts without database access.

## Dependencies

| Package | Purpose |
| --- | --- |
| React, React DOM | UI components and browser rendering |
| Vite, React plugin | Local development server and production builds |
| React Router | Client-side navigation for future tool pages |
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
  src/App.jsx                    Lazy routes, theme provider, and search state
  src/components/common/         Buttons, badges, search field, accessible dialog
  src/components/layout/         Responsive navigation, page layout, footer
  src/context/ThemeContext.jsx   Persistent light/dark theme
  src/data/siteContent.js        Shared navigation, category, and stat content
  src/pages/                     Home and not-found pages
  src/styles.css                 Central design tokens and responsive styles
  src/main.jsx                   Browser entry point and router provider
server/                         Express + Mongoose application
  src/app.js                     Middleware and health endpoint
  src/server.js                  Environment loading, DB connection, HTTP listener
  .env.example                   Local environment variable template
package.json                     npm workspaces and root scripts
```

## API

### `GET /api/health`

Returns `200 OK` with `{ "success": true, "message": "API is running" }`.

## Next steps

1. Add the tool registry and reusable tool page components.
2. Implement the word counter, character counter, and case converter with browser-side logic.
3. Add MongoDB models and service/controller-based catalog endpoints.
