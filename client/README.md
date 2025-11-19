# Storefront Client

A Vite + React storefront that consumes the existing ecommerce API.

## Environment

Copy `.env.example` to `.env` if you need to point at a different API base URL:

```
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend (defaults to the deployed Render URL).

## Install & Run

```bash
cd client
npm install
npm run dev -- --host --port 5173
```

## Build & Preview

Build the production bundle and serve a production-like preview:

```bash
npm run build
npm run preview -- --host --port 4173
```

The preview server listens on `0.0.0.0:4173`, so you can open it via:

```
http://localhost:4173
```

Replace `localhost` with your machine's IP (e.g., `http://192.168.1.10:4173`) to share over your LAN.
