# SahakarConnect — 2-Person Parallel Execution Plan

This document outlines the step-by-step parallel roadmap for our 2-person team across all 4 phases of building SahakarConnect.

---

## 🤝 Team Roles & Responsibilities

| Role | Primary Responsibility | Key Deliverables |
|---|---|---|
| **Person 1 (Backend & Core Engine)** | Server, Database, APIs, Algorithms & Integrations | Express.js, MongoDB Atlas (Mongoose), Firebase Admin Auth, Fair-Match Algorithm, Socket.io Server, Razorpay Split |
| **Person 2 (Frontend & Mobile Apps)** | Web Clients, Mobile App & User Interfaces | Next.js Customer Web App, Admin Dashboard, React Native (Expo) Worker App, UI Socket/API Integration |

---

## 📋 Phase 1: Foundations (Target: 1–2 Days)
*Goal: Prove full stack connectivity (Frontend ↔ Backend ↔ MongoDB Atlas ↔ Deployed Live)*

### 👤 Person 1 Tasks (Backend Track):
1. **Clean & Prepare Server:**
   - Uninstall unnecessary placeholder dependencies: `npm uninstall node.js`
   - Add run scripts to `package.json`:
     ```json
     "scripts": {
       "start": "node server.js",
       "dev": "node --watch server.js"
     }
     ```
   - Add `GET /health` route in `server.js` returning `{ status: "ok", timestamp: new Date().toISOString() }`.
2. **Verify Database Connection:**
   - Test read/write connectivity with MongoDB Atlas.
3. **Deploy Backend on Render (Free Tier):**
   - Create a Web Service on [render.com](https://render.com) connected to the GitHub repo.
   - Add `MONGODB_URI` environment variable in Render settings.
   - Provide the live backend URL (e.g., `https://sahakar-api.onrender.com`) to Person 2.

### 👤 Person 2 Tasks (Frontend Track):
1. **Initialize Next.js Project:**
   - Scaffold the app in the repository root or `/frontend`:
     ```bash
     npx create-next-app@latest frontend --tailwind --app --js
     ```
2. **Build Connectivity Test Page:**
   - In `frontend/app/page.js`, make a `fetch()` call to the `/health` endpoint using `process.env.NEXT_PUBLIC_API_URL`.
   - Show a visual indicator (Green/Red badge) confirming backend and DB connectivity.
3. **Deploy Frontend on Vercel (Free Tier):**
   - Connect the repo to [vercel.com](https://vercel.com) with root directory set to `frontend`.
   - Set environment variable `NEXT_PUBLIC_API_URL` to Person 1's Render URL.

> **🎯 Phase 1 Milestone:** You both have live URLs on the internet communicating with the cloud database.

---

## 📋 Phase 2: Core Data & Booking CRUD (Target: 3–5 Days)
*Goal: Real customer sign up, create a booking; Admin can view all bookings in a dashboard.*

### 👤 Person 1 Tasks (Backend Track):
1. **Design Mongoose Schemas (`models/`):**
   - `User.js`: Firebase UID, name, phone, email, role (`customer`, `worker`, `admin`).
   - `WorkerProfile.js`: User reference, skills array, location GeoJSON, online status.
   - `ServiceCategory.js`: Category name, description, icon, basePrice.
   - `Booking.js`: Customer reference, service reference, status (`pending`, `matched`, `accepted`, `in_progress`, `completed`, `cancelled`), address, scheduledAt.
2. **Implement Firebase Auth Middleware (`middleware/auth.js`):**
   - Verify incoming Bearer token using Firebase Admin SDK.
   - Attach authenticated user details and role to `req.user`.
3. **Build Core REST APIs (`routes/`):**
   - `POST /api/auth/sync` — Sync user profile upon Firebase login.
   - `GET /api/services` — Public list of service categories.
   - `POST /api/bookings` — Create a new booking (status: `pending`).
   - `GET /api/bookings/my` — Get bookings for the authenticated customer.
   - `GET /api/admin/bookings` & `GET /api/admin/workers` — Admin-only dashboard feeds.

### 👤 Person 2 Tasks (Frontend Track):
1. **Firebase Client Authentication:**
   - Set up Firebase Web SDK in Next.js.
   - Build `/login` supporting Phone OTP for customers and Email/Password for Admin.
2. **Customer Booking Flow:**
   - **Home Page (`/`):** Service category showcase cards.
   - **Booking Page (`/book/[serviceId]`):** Address input and scheduled date/time picker.
   - **My Bookings (`/my-bookings`):** List of past and active bookings with current status.
3. **Admin Dashboard (`/admin`):**
   - Build a clean dashboard displaying live tables of all bookings and registered workers.
   - Implement TanStack Query (`@tanstack/react-query`) for smooth data fetching and caching.

> **🎯 Phase 2 Milestone:** A real user can log in on the frontend, place a service booking, and it immediately appears on the admin dashboard.

---

## 📋 Phase 3: Realtime Matching, Mobile App & Payments (Target: 5–7 Days)
*Goal: Customer books → Worker receives offer on Mobile App → Accepts → Completes → Customer Pays.*

### 👤 Person 1 Tasks (Backend Track):
1. **Worker Geospatial Search:**
   - Add `2dsphere` index to `WorkerProfile.location`.
   - Build a query to find available workers within an 8km radius using MongoDB `$near`.
2. **Fair-Match Engine v1 (2 Factors):**
   - Create `services/fairMatch.js`:
     - Factor 1: **Proximity Score** (distance from job location, weight: 0.6).
     - Factor 2: **Rotation-Fairness Score** (time elapsed since last assigned job, weight: 0.4).
3. **Socket.io Realtime Dispatch Server:**
   - Upgrade HTTP server to support Socket.io.
   - Manage worker connections and rooms (`worker-${workerId}`).
   - Emit `new-offer` to the top Fair-Match candidate with a 45-second timer.
   - Implement accept/reject logic and automatic cascading re-offer to the next best worker.
4. **Razorpay & Commission Split:**
   - Set up Razorpay Node.js SDK (`POST /api/payments/create-order`).
   - On successful payment webhook, execute the **88/5/4/3** cooperative split in a multi-document transaction:
     - **88%** Worker Payout
     - **5%** Society Fee
     - **4%** Platform Maintenance
     - **3%** Worker Welfare Fund

### 👤 Person 2 Tasks (Frontend & Mobile Track):
1. **Worker Mobile App (React Native + Expo):**
   - Scaffold Expo app in `/worker-app` (`npx create-expo-app@latest worker-app`).
   - Worker login screen and "Go Online / Offline" status switch.
2. **Realtime Job Offer UI:**
   - Connect the worker app to Socket.io.
   - Build an incoming offer popup with a 45-second countdown bar, payout amount, and distance.
3. **Worker Execution Flow:**
   - Action buttons: "En Route" ➔ "Arrived" ➔ "Start Job" ➔ "Complete Job".
4. **Customer Live Tracking & Payment Screen:**
   - Live status timeline on customer web app synced via Socket.io.
   - Razorpay Checkout modal triggering upon job completion.
   - Post-service 1–5 star rating submission.

> **🎯 Phase 3 Milestone:** Full end-to-end demo: Customer books ➔ Worker accepts on mobile ➔ Completes job ➔ Customer pays ➔ Commission split recorded.

---

## 📋 Phase 4: Cooperative Differentiators & Finale Polish (36-Hour Hackathon)

### 👤 Person 1 Tasks (Backend Track):
1. **Fair-Match 4-Factor Engine:** Extend algorithm to incorporate worker ratings and skill-match weights.
2. **Welfare Fund & Dispute Backend:** Endpoints for emergency welfare claims and society dispute logs.
3. **Identity Verification Sandbox (Stretch):** Sandbox.co.in / Setu Aadhaar mock verification API.

### 👤 Person 2 Tasks (Frontend Track):
1. **Fair-Match Explainability Panel:** Admin view visually breaking down the formula score for why Worker X won over Worker Y (major judging demo highlight).
2. **Welfare Claims & Governance UI:** Worker claim submission form and society admin review portal.
3. **Demo Polish:** Loading skeletons, empty states, realistic seed data, and a backup demo video recording.

---

## 🛠️ Quick Git Workflow for 2 People

1. **Person 1** works on backend routes and server files.
2. **Person 2** works in `frontend/` and `worker-app/` folders.
3. Always pull latest changes before starting work:
   ```bash
   git pull origin main
   ```
4. Commit and push feature changes with clear messages:
   ```bash
   git add .
   git commit -m "feat(backend): add booking CRUD routes"
   git push origin main
   ```
