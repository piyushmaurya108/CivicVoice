# 🏛️ CivicVoice Frontend

Vite + React 18 frontend for **CivicVoice**, a civic-complaint aggregator. Citizens upload a photo, drop a pin on an interactive map, and the app uses the backend's Gemini-powered pipeline to identify the issue, find similar complaints nearby, and produce a ready-to-submit petition for the correct government portal.

---

## ⚡ Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# edit .env and point VITE_API_BASE_URL at your backend

# 3. Run
npm run dev      # http://localhost:5173

# 4. Build for production
npm run build
npm run preview
```

> ⚠️ **Backend must be running.** Start `civicvoice-backend` first (default `:5000`) and ensure `VITE_API_BASE_URL` matches.

---

## 🔑 Environment variables

Copy `.env.example` to `.env`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL of the backend API (default `http://localhost:5000/api`) |
| `VITE_APP_NAME` | App name (default `CivicVoice`) |

---

## 🧱 Tech stack

- **Vite 5** + **React 18**
- **React Router v6** — routing
- **Axios** — HTTP client (centralised in `src/api/index.js`)
- **Leaflet + react-leaflet** — interactive maps with OpenStreetMap tiles (no API key needed)
- **react-dropzone** — image upload with drag-and-drop
- **Tailwind CSS 3** — styling (no UI kit)
- **react-hot-toast** — notifications
- **lucide-react** — icons

---

## 📂 Project structure

```
civicvoice-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.js            All axios calls + describeError()
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ComplaintMap.jsx    Leaflet map (picker + feed modes)
│   │   ├── ImageUploader.jsx   react-dropzone
│   │   ├── ComplaintCard.jsx
│   │   ├── PetitionModal.jsx
│   │   ├── ComplaintCounter.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Home.jsx            Hero + how-it-works + live stats
│   │   ├── SubmitComplaint.jsx Main flow: photo + pin → petition + portal
│   │   ├── ComplaintFeed.jsx   Map + list + filters + pagination
│   │   ├── ComplaintDetail.jsx Single complaint view
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useGeolocation.js   Browser GPS hook
│   │   └── useComplaints.js    Fetch + paginate hook
│   ├── utils/
│   │   └── formatters.js       Date, severity, address helpers
│   ├── App.jsx                 Router
│   ├── main.jsx                Entry point
│   └── index.css               Tailwind + global styles
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── .env.example
```

---

## 🗺️ Map component notes

`ComplaintMap.jsx` runs in two modes:

- **Picker mode** (used in `SubmitComplaint`) — pass `onLocationPick` to enable click-to-drop and the GPS button. The user's pin is shown live and the map flies to it.
- **Feed mode** (used in `ComplaintFeed` / `ComplaintDetail`) — pass a `complaints` array. Markers are colour-coded by severity (green / amber / orange / red) and clicking opens a popup with a link to the detail page.

Vite's bundler breaks Leaflet's default-icon paths; the component imports the icons explicitly and rebuilds `L.Icon.Default` to fix this — no extra config needed.

---

## ✅ Feature checklist

| Feature | Where |
|---|---|
| Drag-drop image upload (5 MB / JPEG / PNG / WebP) | `ImageUploader` |
| Click-to-pin location | `ComplaintMap` picker mode |
| GPS button (`navigator.geolocation`) | `useGeolocation` hook |
| Live coordinate readout | `SubmitComplaint` |
| Submit progress (% upload) | `SubmitComplaint` |
| Result panel: petition + portal + steps + copy button | `SubmitComplaint` |
| Live stats fetched from `/api/complaints/stats` | `Home` |
| Recent 3 complaints on home | `Home` |
| Filter by type / severity / status | `ComplaintFeed` |
| Pagination | `ComplaintFeed` |
| Mobile list/map toggle | `ComplaintFeed` |
| Severity-coloured markers | `ComplaintMap` |
| Clipboard-copy petition + toast | `SubmitComplaint`, `ComplaintDetail`, `PetitionModal` |
| Network / 4xx / 5xx error display | `describeError` in `api/index.js` |

---

## ⚠️ Known limitations

- **Backend dependency** — every page (except 404) calls the backend. With no backend running you'll see "Server unavailable" toasts.
- **Geolocation needs HTTPS in production** — `navigator.geolocation` only works on `localhost` over HTTP. Production deployments must be HTTPS.
- **Tile usage policy** — OpenStreetMap tiles have a courteous-use policy. For heavy traffic, switch to Mapbox / MapTiler / a self-hosted tile server (just change the `<TileLayer url=…>` in `ComplaintMap.jsx`).
- **No client-side route guards / auth** — the MVP is anonymous.

---

## 📜 License

MIT — use freely.
