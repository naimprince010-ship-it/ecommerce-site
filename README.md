# ecommerce-site

Node.js + Express API with MongoDB for products, now extended with JWT authentication, Cloudinary image uploads, and a minimal React admin panel for managing catalog data.

## Environment variables
Create a `.env` file (or configure variables in Render) using `.env.example` as a reference:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<random string for signing tokens>
CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>
```

## Backend
Location: `server/`

### Setup & run locally
```bash
cd server
npm install
npm run dev  # or: MONGO_URI=... JWT_SECRET=... npm start
```
The API listens on `PORT` (defaults to `5000`) and keeps the existing `GET /` health check plus `/api/products` routes. CORS is enabled for cross-origin calls from the admin panel.

### Create the first admin user
Use Postman/cURL against your deployed API or local server:
```bash
POST /api/auth/register
Content-Type: application/json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "strongpassword"
}
```
The route hashes the password and stores an admin user.

### Log in and obtain a token
```bash
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "strongpassword"
}
```
The response includes `token` and user info. Supply the token as `Authorization: Bearer <token>` when creating/updating/deleting products.

### Product image uploads
`POST /api/products` accepts `multipart/form-data` with fields `name`, `price`, `description`, and optional file field `image`. The image is uploaded to Cloudinary and the secure URL is stored as `imageUrl`. If you omit the file, the endpoint still works.

## Admin frontend
Location: `admin/` (Vite + React).

### Configure and run locally
```bash
cd admin
npm install
# optionally override the API base URL
VITE_API_BASE_URL="https://your-render-app.onrender.com" npm run dev
```
Open the printed localhost URL to use the admin panel. It supports login, listing products, creating a product (including image upload), and deleting a product. The JWT token is stored in `localStorage` for authenticated actions.

By default, the admin panel targets `https://ecommerce-site-onrender.com`; set `VITE_API_BASE_URL` to your actual Render URL for deployments.
