# Zayid — Realtime Auction Platform

A modern, Firebase-powered realtime auction platform built with React, Vite, and Tailwind CSS. Zayid enables users to browse auctions, place bids in real time, manage profiles, receive push notifications, and process payments seamlessly.

## 🧾 Description

Zayid streamlines the auction experience for buyers and sellers. It offers a responsive web interface for discovering items, creating auctions, bidding with live updates, secure authentication, notifications, and dashboard analytics. Target users include auction organizers, sellers, and bidders who require a low-latency, scalable, and user-friendly platform.

## 🧰 Tech Stack

- **Frontend**: React 19, Vite 7, React Router 7, Tailwind CSS 4, DaisyUI
- **State & Forms**: React Hook Form, Formik, Yup, React Toastify
- **Realtime & Backend**: Firebase (Auth, Firestore, Realtime Database, Cloud Messaging), Cloud Functions for Firebase
- **UI/UX & Charts**: Framer Motion, React Chart.js 2
- **Media & Carousels**: Swiper, React Slick (slick-carousel)
- **Maps**: Leaflet, React Leaflet, Leaflet GeoSearch, @react-google-maps/api
- **Utilities**: date-fns, uuid, jsPDF, SweetAlert2
- **Tooling**: ESLint, @vitejs/plugin-react, @tailwindcss/vite

## 🌟 Features

- **User authentication**: Sign up, login, and session management with Firebase Auth
- **Auctions**: Create, list, view, and manage auctions with media galleries
- **Realtime bidding**: Live bids and auction status updates
- **Notifications**: Push notifications via Firebase Cloud Messaging; in-app toasts
- **Payments**: Payment hooks and utilities with extensible providers
- **Dashboard & analytics**: Statistics and charts for admins and users
- **Location-aware**: Map search and geolocation support (Leaflet/Google Maps)
- **Documents & exports**: PDF generation (invoices, receipts) with jsPDF
- **Responsive UI**: Tailwind CSS + DaisyUI components and transitions (Framer Motion)

## ⚙️ Workflow / System Overview

### User Flow

1. User visits the app and authenticates (email/password or provider).
2. Users can browse auctions and drill into an auction detail page.
3. Authenticated users place bids; updates propagate in real time to all viewers.
4. Sellers/admins manage auctions via the dashboard (create/update/close).
5. Users receive notifications on key events (outbid, auction start/end, disputes, etc.).
6. Payments are initiated for winning bids; receipts may be generated as PDFs.

### Data Flow

- **Frontend** (React) reads/writes to **Firestore** and/or **Realtime Database** for auctions, bids, and user profiles.
- **Cloud Functions** handle server-side triggers (e.g., sending emails, notifications, integrity checks).
- **Cloud Messaging** delivers push notifications to subscribed clients (service worker in `public/firebase-messaging-sw.js`).
- **Storage/Assets** and other external services (maps, carousels, PDFs) enhance UX.

### Frontend ↔ Backend Communication

- Reads/writes via Firebase SDKs (Auth, Firestore, Realtime Database, Messaging).
- Cloud Functions provide secure backend logic triggered by database events.

### Sequence Diagram (conceptual)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant FE as React App (Vite)
  participant FB as Firebase Auth/DB
  participant CF as Cloud Functions
  participant FCM as Cloud Messaging

  U->>FE: Sign in / view auctions
  FE->>FB: Auth request / query auctions
  FB-->>FE: Auth token / auctions snapshot (realtime)

  U->>FE: Place bid
  FE->>FB: Write bid (Firestore/RTDB)
  FB-->>FE: Realtime update to all listeners
  FB-->>CF: Trigger on bid create/update
  CF-->>FCM: Send push notification (outbid/winner)
  FCM-->>FE: Push message to service worker

  U->>FE: Complete payment
  FE->>FB: Update payment records
  FB-->>FE: Confirmation; FE may generate PDF receipt
```

## 🧑‍💻 Installation & Setup

### Prerequisites

- Node.js 20+ (LTS recommended). Cloud Functions target Node 22 runtime.
- npm 9+ (bundled with Node 20+) or pnpm/yarn equivalent
- Firebase CLI (optional, for emulators/deploy): `npm i -g firebase-tools`

### Clone

```bash
git clone <your-repo-url>.git
cd Zayid
```

### Install dependencies

```bash
# Root (frontend)
npm install

# Cloud Functions (serverless)
cd functions && npm install && cd ..
```

### Run in development

```bash
# Start Vite dev server
npm run dev

# (Optional) Start Firebase emulators for Functions
# Requires firebase.json to be configured
# In a separate terminal
cd functions && npm run serve
```

### Production build & preview

```bash
# Build
npm run build

# Preview production build locally
npm run preview

# (Optional) Deploy to Firebase Hosting/Functions
# Make sure you are logged in: firebase login
cd functions && npm run deploy
```

## 🚀 Usage

- Open the app at the printed local URL (typically `http://localhost:5173`).
- Create an account or sign in.
- Explore auctions, open an auction detail page, and place a bid.
- Manage your profile and view dashboard analytics.
- If notifications are enabled, allow browser permissions to receive push alerts.
- For payments, follow the on-screen flow; generated PDFs (receipts) may download automatically.

> Tip: Use multiple browser windows or devices to observe realtime bidding updates.

## 📂 Project Structure

```
Zayid/
├─ dist/                        # Production build output (generated)
├─ functions/                  # Cloud Functions (Node 22 runtime)
│  ├─ index.js
│  ├─ package.json
│  └─ ...
├─ public/                     # Static assets, service workers
│  ├─ firebase-messaging-sw.js
│  └─ index.html
├─ src/
│  ├─ App.jsx                  # App entry
│  ├─ main.jsx                 # Vite root render
│  ├─ assets/                  # Icons, images, sounds
│  ├─ components/              # UI components (auctions, dashboard, common)
│  ├─ config/Firebase.jsx      # Firebase initialization (Auth/DB/Messaging)
│  ├─ context/                 # React context (e.g., UserContext)
│  ├─ hooks/                   # Data + action hooks (auctions, payments, etc.)
│  ├─ Pages/                   # Route pages
│  ├─ utils/                   # Utilities (cloudinary, date, validation)
│  └─ index.css                # Global styles
├─ eslint.config.js
├─ vite.config.js              # Vite + React + Tailwind plugin config
├─ package.json                # Frontend package manifest
└─ README.md
```

## 🔧 Configuration / Environment Variables

This project uses Vite, so environment variables must be prefixed with `VITE_` to be exposed to the client.

Create a `.env.local` in the project root:

```env
# Firebase web app config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional: Messaging public VAPID key
VITE_FIREBASE_VAPID_KEY=your_public_vapid_key
```

Then update `src/config/Firebase.jsx` to read from `import.meta.env` (recommended for production) or ensure the inline config matches your deployment environment. Do not commit secrets to version control.

## 🧩 API / Data Flow

Zayid primarily uses Firebase client SDKs and Cloud Functions (event-driven). Typical collections and records may include:

- `users`: profile and roles
- `auctions`: auction metadata (title, description, images, start/end, status)
- `bids`: user bids referencing an `auctionId`, amount, timestamp
- `notifications`: in-app notifications
- `mail`: used to trigger email sending via Firestore + Cloud Functions (see `sendEmail` in `Firebase.jsx`)

Example client write (conceptual):

```js
// Firestore: add a bid
await addDoc(collection(db, "bids"), {
  auctionId,
  userId,
  amount,
  createdAt: serverTimestamp(),
});
```

Cloud Functions (conceptual):

- `onCreate`/`onUpdate` triggers on `bids/*` to validate bids, update auction leader, and notify users via FCM.
- `onCreate` trigger on `mail/*` to send transactional emails.

> For REST endpoints, prefer callable functions or HTTPS triggers if needed. Ensure security rules and server checks protect business invariants (e.g., bid increments, auction closure).

## 🧑‍🤝‍🧑 Contributing Guidelines

1. Fork the repository and create a feature branch from `main`:
   - `git checkout -b feat/your-feature`
2. Install dependencies and run the app locally.
3. Follow existing code style (ESLint) and naming conventions.
4. Add tests or thorough manual validation steps where applicable.
5. Commit with conventional messages (e.g., `feat:`, `fix:`, `docs:`).
6. Open a Pull Request with a clear description, screenshots, and testing notes.

## 🧭 Roadmap / Future Enhancements

- Expanded payment provider integrations and webhooks
- Role-based access control (admin, seller, bidder) hardening
- Advanced auction types (reserve price, Dutch auctions)
- Improved dispute resolution workflows
- Offline-first capabilities and optimistic UI
- Analytics and operational dashboards

## 🐛 Known Issues

- Browser push notifications depend on user permission and device support
- Network quality may affect realtime updates
- Some features rely on enabling the Firebase service worker and HTTPS

## 🪪 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## 🙏 Credits & Acknowledgments

- Built with **React**, **Vite**, and **Tailwind CSS**
- Backend powered by **Firebase** and **Cloud Functions**
- UI components and inspiration from **DaisyUI**, **Swiper**, **React Slick**
- Maps by **Leaflet** and **Google Maps** APIs
- Charts by **Chart.js** via `react-chartjs-2`
- Special thanks to all contributors and the open-source community
