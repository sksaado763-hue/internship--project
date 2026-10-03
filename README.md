# Meridian Tools

An original, privacy-minded foundation for a growing library of focused online tools. This repository uses a React and Vite client, an Express REST API, and MongoDB through Mongoose.

## Day 1 · Step 1: Project foundation

This first step establishes a runnable frontend and backend, workspace scripts, environment configuration, and baseline server security. Tool pages, the finished design system, and database-backed catalog endpoints are planned for subsequent steps.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 7 requirement)
- npm 10+
- MongoDB Community Server locally, or a MongoDB connection URI

## Install

From the repository root:

```bash
npm install
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

## Verify the starter

- Open <http://localhost:5173> to view the Meridian Tools foundation page.
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

## Initial structure

```text
client/                 React + Vite application
  src/App.jsx            Starter landing screen
  src/main.jsx           Browser entry point and router provider
  src/styles.css         Starter responsive styles and Tailwind layers
server/                 Express + Mongoose application
  src/app.js             Middleware and health endpoint
  src/server.js          Environment loading, DB connection, HTTP listener
  .env.example           Local environment variable template
package.json             npm workspaces and root scripts
```

## API

### `GET /api/health`

Returns `200 OK` with `{ "success": true, "message": "API is running" }`.

## Next steps

1. Establish the shared design system, responsive navigation, footer, and home page.
2. Add the tool registry and reusable tool page components.
3. Implement the word counter, character counter, and case converter with browser-side logic.
4. Add MongoDB models and service/controller-based catalog endpoints.
