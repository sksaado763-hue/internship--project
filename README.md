# HavitGrowth

**Powerful tools. One simple platform.**

HavitGrowth is a privacy-first library of 125+ browser-based tools for developers, creators, students, marketers, and everyday work. Every tool runs 100% client-side — your text, images, and documents never leave your device.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47a248?logo=mongodb&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

---

## Highlights

- **125+ working tools** across 8 categories, with zero uploads and zero accounts
- **Curated discovery sections** — the home page and tool directory group tools into hand-tuned sections like *PDF & Document Utilities*, *Popular Featured Tools*, and *Image Converters (Pic to Format)*
- **Instant search** across tool names, descriptions, categories, and tags
- **Category filters and favorites** — favorites persist between visits
- **Light and dark themes** that remember your choice
- **Arcade games** — a separate `/games` playground
- **Blog and guides** for workflows and productivity
- **Contact page** powered by Web3Forms

## Tool catalog

| Category | What you'll find |
| --- | --- |
| PDF & Document Utilities | Merge, split, rotate, compress, protect, watermark, and sign PDFs; convert between PDF and Word/Excel/PowerPoint/JPG |
| Popular Featured Tools | Word & character counters, case converter, JSON formatter, URL/Base64 codecs, password generator |
| AI & Smart Generators | Background remover, content detector, email writer, text humanizer, image generator, voice tools, meme and QR generators |
| Image Converters (Pic to Format) | Convert images between PNG, JPG, WebP, GIF, ICO, BMP, and SVG; upscale, compress, crop, pick colors, generate gradients and favicons |
| Developer & Web Utilities | JSON formatter, JWT debugger, regex tester, Base64/URL codecs, UUID generator, binary converter, IP subnet calculator |
| Social Media & Video Tools | YouTube, Instagram, TikTok, Facebook, Twitter, and Pinterest helpers; thumbnail downloaders, hashtag and title generators, comment pickers |
| SEO & Website Health | Domain age lookups, SSL certificate guidance, backlink analysis helpers, keyword density and meta tag checkers |
| Calculators & Financial Tools | Loan EMI, mortgage, compound interest, salary, tax, BMI, calorie, GPA, age, pregnancy, and scientific calculators |

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 7, Tailwind CSS, React Router 7, lucide-react |
| In-browser processing | jsPDF, pdf-lib, pdf.js, tesseract.js (OCR), heic2any |
| Backend (optional) | Express 5, Mongoose 8, helmet, express-rate-limit |
| Deployment | Vercel (static client build with SPA rewrites) |

A single shared registry (`shared/toolRegistry.js`) drives routing, the tool directory, home page sections, search, and the footer — add a tool once and it appears everywhere.

## Project structure

```
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── tools/       # One component per tool (42+ files)
│       │   ├── games/       # Arcade and physics games
│       │   └── common/      # Cards, buttons, search, marquee
│       ├── pages/           # Home, Tools, Tool, Blog, Games, About, Contact
│       ├── data/            # tools.js, toolSections.js, siteContent.js
│       └── context/         # Theme + Favorites providers
├── server/                  # Express REST API + MongoDB catalog (optional)
├── shared/
│   ├── toolRegistry.js      # Source of truth for all tools
│   └── toolCategories.js    # Category definitions
└── vercel.json              # Client build + SPA rewrites
```

## Getting started

**Requirements:** Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
# 1. Install dependencies (root workspace installs client + server)
npm ci

# 2. Frontend only — tools run entirely in the browser
npm run dev:client          # http://localhost:5173

# 3. Optional: full stack with the catalog API
#    Copy server/.env.example to server/.env and set MONGODB_URI
npm run dev                 # client + server together
npm run seed:catalog        # load starter categories and tools into MongoDB
```

## Adding a new tool

Four files, one tool:

1. **`shared/toolRegistry.js`** — add the registry entry (slug, name, description, categorySlug, icon, tags)
2. **`client/src/components/tools/MyToolTool.jsx`** — build the tool UI; processing stays client-side
3. **`client/src/pages/ToolPage.jsx`** — import the component and map it to the slug in `toolInterfaces`
4. **Discovery wiring** — add the icon to the icons map in `client/src/data/tools.js`, and add the slug to a curated section in `client/src/data/toolSections.js` so it shows up in the home page and directory sections

Verify the section counts in the browser on both `/` and `/tools` before shipping.

## Deployment

The site deploys to Vercel from `master`. The root `vercel.json` builds the client workspace (`npm run build` → `client/dist`) and serves it with SPA rewrites, so pushing to `master` ships a new deployment automatically.

```bash
npm run build    # verify the production build locally
```

## Privacy note

HavitGrowth is built privacy-first. Text, image, and document tools process everything locally in your browser — there is no upload endpoint, and the tool library is designed to keep it that way. API keys, where used, stay server-side and never ship in the client bundle.
