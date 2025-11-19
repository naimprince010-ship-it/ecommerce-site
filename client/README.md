# Client (Storefront)

This directory hosts the public-facing storefront built with **Vite + React**.

## Prerequisites
- Node.js 18+ and npm installed.
- API base URL available (see `.env.example`).

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (or export env vars) based on `.env.example`:
   ```bash
   cp .env.example .env
   # update VITE_API_BASE_URL if your API runs somewhere else
   ```
3. Start the Vite dev server (defaults to `http://localhost:5173`):
   ```bash
   npm run dev
   ```

## Production build
Create an optimized build with:
```bash
npm run build
```
Then serve the contents of `dist/` from your preferred static host.
