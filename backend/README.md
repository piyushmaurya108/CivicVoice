# 🏛️ CivicVoice Backend

Node.js + Express + MongoDB backend for **CivicVoice**, a civic-complaint aggregator that uses Gemini Vision to analyse complaint photos, clusters nearby reports geospatially, and auto-generates formal petition letters with the correct government portal.

---

## ⚡ Quick start

```bash
# 1. Install
npm install

# 2. Create your .env (see "Environment variables" below)
cp .env.example .env

# 3. (Optional) Seed 25 demo complaints
npm run seed

# 4. Run
npm run dev      # with auto-reload (nodemon)
# or
npm start        # plain node
```

Server defaults to **http://localhost:5000**.
Health check: `GET http://localhost:5000/api/health`

---

## 🔑 Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | https://www.mongodb.com/cloud/atlas/register — create a free M0 cluster, click **Connect → Drivers**, copy the URI |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey — free tier works |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | https://cloudinary.com — sign up free, all 3 values are on the dashboard |
| `FRONTEND_URL` | URL where your frontend runs (default `http://localhost:5173`) |
| `PORT` | API port (default `5000`) |

⚠️ **MongoDB Atlas:** in **Network Access**, allow your IP (or `0.0.0.0/0` for development).

---

## 🌱 Seed script

```bash
npm run seed
# or
node seed.js
```

This **drops** any existing complaints and inserts 25 realistic ones across Punjab (Ludhiana, Jalandhar, Amritsar) and Delhi. Each has a real coordinate, a templated petition, and the correct matched portal — no API keys are called during seeding.

---

## 🛣️ API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/health` | Health check |
| `POST` | `/api/complaints` | Submit complaint (full AI pipeline) — **multipart/form-data** with fields `image`, `latitude`, `longitude`, `description?` |
| `GET`  | `/api/complaints` | Paginated list (`?page=&limit=&type=&state=&severity=&status=`) |
| `GET`  | `/api/complaints/:id` | Single complaint |
| `GET`  | `/api/complaints/nearby` | `?lat=&lng=&radius=&type=` — geospatial $near query |
| `GET`  | `/api/complaints/stats` | Aggregate counts (total, byType, bySeverity, recentCount, statesCovered) |
| `GET`  | `/api/portals` | `?state=&district=&city=&type=` — portal lookup |

### What the POST pipeline does

1. Validates the image and lat/lng
2. Uploads the image to **Cloudinary**
3. Calls **Gemini 2.0 Flash Vision** to classify type, severity, write a description, extract landmarks
4. Reverse-geocodes the coordinates with **Nominatim** (OpenStreetMap, free)
5. Runs a **`$near` MongoDB query** for same-type complaints within 500 m in the last 30 days
6. Matches the correct **government portal** via `portals.json` (district MC > district PWD > state portal > CPGRAMS)
7. Calls **Gemini text** to draft a formal petition letter
8. Saves the complaint, syncs the cluster `nearbyCount`
9. Returns the full document plus the petition text and portal info

If Gemini or Nominatim fail, the pipeline falls back gracefully — the request **never crashes**.

---

## 📂 Project structure

```
civicvoice-backend/
├── config/
│   ├── db.js              Mongoose connection
│   ├── cloudinary.js      Cloudinary config + upload helper
│   └── portals.json       Government portal database
├── controllers/
│   ├── complaintController.js
│   └── portalController.js
├── middleware/
│   ├── upload.js          Multer (memory, 5MB, images only)
│   ├── errorHandler.js    Global error handler
│   └── validate.js        express-validator wrapper
├── models/
│   └── Complaint.js       Mongoose schema with 2dsphere index
├── routes/
│   ├── complaintRoutes.js
│   └── portalRoutes.js
├── services/
│   ├── geminiService.js   Vision + petition drafting
│   ├── geocodeService.js  Nominatim reverse geocode
│   ├── clusterService.js  Geospatial cluster queries
│   └── petitionService.js Petition wrapper
├── utils/
│   └── portalMatcher.js   Picks the right portal
├── server.js              Express entry point
├── seed.js                Seeds 25 demo complaints
├── package.json
└── .env.example
```

---

## 🧪 Testing the API

```bash
# Health
curl http://localhost:5000/api/health

# List
curl http://localhost:5000/api/complaints

# Stats
curl http://localhost:5000/api/complaints/stats

# Nearby (Ludhiana centre)
curl "http://localhost:5000/api/complaints/nearby?lat=30.9010&lng=75.8573&radius=500"

# Portal lookup
curl "http://localhost:5000/api/portals?state=Punjab&district=Ludhiana&city=Ludhiana&type=broken_road"

# Submit (multipart)
curl -X POST http://localhost:5000/api/complaints \
  -F "image=@/path/to/photo.jpg" \
  -F "latitude=30.9010" \
  -F "longitude=75.8573" \
  -F "description=Big pothole near Civil Lines"
```

---

## ⚠️ Known limitations

- **Free-tier rate limits** — Gemini, Cloudinary and Nominatim are all free but rate-limited. Heavy load will throttle.
- **Nominatim usage policy** — 1 request/second per app. Production use should self-host Nominatim or use a paid provider.
- **No user authentication** — MVP is anonymous (a session ID is generated). Add JWT auth for production.
- **Portal database is curated** — covers Punjab, Delhi, UP, Maharashtra, Karnataka in detail. Other states fall back to **CPGRAMS** (`pgportal.gov.in`), which is the correct national fallback.
- **`status` is read-only via API** — no admin endpoints to mark complaints as `under_review` / `resolved` (intentional for MVP — add admin auth later).

---

## 🧰 Tech stack

- **Node.js 18+** + Express 4
- **MongoDB** (Atlas free tier) via Mongoose 8
- **Multer** memory storage → **Cloudinary** for image hosting
- **@google/generative-ai** (Gemini 2.0 Flash) for vision + petition drafting
- **Nominatim** (free OpenStreetMap) for reverse geocoding
- **helmet**, **cors**, **morgan**, **dotenv**, **express-validator**

---

## 📜 License

MIT — use freely.
