# SahakarConnect — 2-Person Parallel Execution Plan (Real-Time Mobile Architecture)

This document outlines the step-by-step parallel roadmap for our 2-person team across all phases of building SahakarConnect as a **real-time, downloadable mobile application platform** with a web-based administrative command center.

---

## 🤝 Team Roles & Responsibilities

| Role | Primary Responsibility | Key Deliverables |
|---|---|---|
| **Person 1 (Backend & Realtime Core Engine)** | Server, Database, Realtime Sockets, Matching Engine & Payment Splits | Express.js, MongoDB Atlas (Mongoose), Firebase Admin Auth, Socket.io Server, Geospatial + ML/XGBoost Fair-Match Engine, Realtime Cascading Dispatch, Twilio/WhatsApp Fallback, Dual Payment Ledger (Razorpay + COD 88/5/4/3 Split) |
| **Person 2 (Mobile SuperApp & Web Admin)** | Downloadable Mobile Apps & Management Portal | Unified React Native (Expo) `sahakar_app` with seamless role-switching (Customer Mode ↔ Worker Mode), Live GPS tracking map, Realtime 45s countdown popup, Next.js Web Admin Dashboard |

---

## 📱 System Architecture Overview

```
                        ┌────────────────────────────────────────────────┐
                        │              EXPRESS + SOCKET.IO               │
                        │           Backend Server (Render)             │
                        └───────┬────────────────────────┬───────────────┘
                                │                        │
               REST + Realtime Socket            REST + Realtime Socket
                                │                        │
         ┌──────────────────────┴───────┐         ┌──────┴───────────────────────┐
         │     CUSTOMER MOBILE MODE     │         │      WORKER MOBILE MODE      │
         │  • Browse categories & book  │         │  • Online/Offline toggle     │
         │  • Realtime status timeline  │         │  • Realtime 45s Offer Popup  │
         │  • Live GPS worker map       │         │  • Milestone actions         │
         │  • Pay via Razorpay or COD   │         │  • GPS live location stream  │
         └──────────────────────────────┘         └──────────────────────────────┘
                       ▲                                         ▲
                       └───────────────────┬─────────────────────┘
                                           │
                           📱 UNIFIED "sahakar_app" (Expo)
                           One Downloadable Android APK
                                           │
                                 (Desktop Web Browser)
                                           ▼
                           💻 Next.js Admin Panel (`frontend/`)
                           Cooperative Governance & Live Monitoring
```

---

## 📋 Phase 1: Foundations & Infrastructure (Target: 1–2 Days)
*Goal: Prove full-stack connectivity: Mobile App ↔ Backend ↔ MongoDB Atlas ↔ Socket.io ↔ Render*

### 👤 Person 1 Tasks (Backend Track):
1. **Server & Socket.io Initialization:**
   - Upgrade `server.js` from plain Express to `http.createServer(app)` with `socket.io`.
   - Add CORS configuration supporting both local network IPs (for mobile dev) and production domains.
   - Verify health check route `GET /health` reporting MongoDB status and active socket client count.
2. **MongoDB Atlas Geospatial Indexing:**
   - Configure SRV DNS and verify connection to Atlas cluster.
   - Create `2dsphere` index on worker and booking geospatial coordinates.
3. **Deploy Backend to Render:**
   - Deploy backend on Render with live URL (e.g., `https://sahakar-api.onrender.com`).
   - Configure environment variables (`MONGODB_URI`, `PORT`, `FIREBASE_SERVICE_ACCOUNT`).

### 👤 Person 2 Tasks (Mobile & Web Track):
1. **Consolidate Mobile SuperApp (`sahakar_app/`):**
   - Structure `sahakar_app` with unified navigation enabling instant role-switching between **Customer Mode** and **Worker Mode**.
   - Install core mobile packages: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `socket.io-client`, `axios`, `expo-location`, `react-native-maps`, `@react-native-async-storage/async-storage`.
2. **Mobile Connectivity & Socket Ping Screen:**
   - Add a developer debug card in the mobile app testing REST `/health` and emitting a test socket ping to the server.
3. **Initialize Web Admin (`frontend/`):**
   - Clean Next.js project in `frontend/` designated specifically for cooperative administrators.
   - Connect and verify API reachability from the admin web dashboard.

> **🎯 Phase 1 Milestone:** Mobile app connects to live backend on Render; socket connection confirms two-way realtime communication between phone and server.

---

## 📋 Phase 2: Core Data, Authentication & Booking Pipeline (Target: 3–5 Days)
*Goal: Real customer authentication, service catalog, booking creation, and worker profile onboarding on mobile.*

### 👤 Person 1 Tasks (Backend Track):
1. **Mongoose Schemas (`models/`):**
   - `User.js`: Firebase UID, phone, name, email, activeRole (`customer` | `worker` | `admin`), walletBalance.
   - `WorkerProfile.js`: User ref, category, skills array, verificationStatus, isOnline, currentLocation (GeoJSON Point), lastJobAssignedAt, ratingAvg.
   - `Booking.js`: Customer ref, worker ref, category, serviceDetails, status (`pending`, `offered`, `accepted`, `en_route`, `arrived`, `in_progress`, `completed`, `cancelled`), pickup/serviceLocation (GeoJSON Point), paymentMethod (`razorpay` | `cash`), paymentStatus, financialBreakdown.
2. **Authentication & Session Sync (`middleware/auth.js` & `routes/auth.js`):**
   - Firebase Phone OTP verification middleware.
   - `POST /api/auth/sync`: Creates/fetches user record and returns active profile.
   - `POST /api/auth/switch-role`: Allows toggling between customer and worker roles.
3. **Core REST APIs (`routes/`):**
   - `GET /api/services`: Dynamic list of available cooperative trade categories (Electrician, Plumber, Carpenter, etc.).
   - `POST /api/bookings`: Create booking entry and initialize matching cycle.
   - `GET /api/bookings/my`: Realtime list of customer's active and historical orders.
   - `GET /api/worker/profile` & `PUT /api/worker/status`: Update worker availability (online/offline) and category.

### 👤 Person 2 Tasks (Mobile App Track):
1. **Authentication Flow (Customer & Worker):**
   - Modern dark/light onboarding with Phone OTP verification.
   - Mode switcher on Profile drawer/header: "Switch to Worker Mode" / "Switch to Customer Mode".
2. **Customer Booking Flow (Mobile):**
   - **Explore/Home Tab:** Service category grid with dynamic pricing and ETA badges.
   - **Booking Screen:** Location selector (with auto-detect via `expo-location`), scheduled slot or instant dispatch, service notes.
   - **Payment Preference Selector:** Choose between Online (UPI/Card) or Cash on Delivery (COD).
3. **Worker Profile & Go-Online Flow (Mobile):**
   - Worker dashboard with large "GO ONLINE" toggle switch.
   - Service category selector and current trade certification/skill tags.
4. **Admin Dashboard Foundation (`frontend/`):**
   - Next.js live overview displaying all bookings and registered workers.

> **🎯 Phase 2 Milestone:** A customer can open the app on Android, place a service request with location, and the booking is logged in MongoDB with matching initiated.

---

## 📋 Phase 3: Realtime Matching, Live GPS Tracking & Payments (Target: 5–7 Days)
*Goal: Intelligent ML/Fair-Match dispatch → 45s countdown popup → Live GPS stream on map → Dual payment & 88/5/4/3 split.*

### 👤 Person 1 Tasks (Backend Track):
1. **Geospatial + XGBoost / Fair-Match Ranking Engine (`services/fairMatch.js`):**
   - Step 1: MongoDB `$nearSphere` geospatial filter to locate online, idle workers within 8km radius belonging to the requested category.
   - Step 2: Multi-factor ranking calculation:
     - **Proximity Score (40%)**: Distance decay function from customer coordinates.
     - **Rotation Fairness Score (30%)**: Time elapsed since last allocated booking (prevents work monopolization).
     - **Performance / Rating Score (20%)**: Historical completed job ratings and punctuality.
     - **XGBoost / Acceptance Probability Score (10%)**: Prediction based on worker category and historical acceptance rate.
2. **Realtime Socket.io Cascading Dispatch Server (`services/dispatch.js`):**
   - Assign exclusive 45-second offer to the #1 ranked candidate.
   - Emit `new-offer` to candidate's socket room (`worker:${workerId}`).
   - **SMS / WhatsApp Fallback (Twilio / Gupshup):** If worker fails to interact with in-app socket within 15 seconds, trigger an instant urgent SMS/WhatsApp alert with deep link.
   - **Auto-Cascade Logic:** If worker taps "Deny" or 45s timer expires without response, immediately penalize response score and auto-cascade offer to candidate #2.
3. **Live GPS Stream Relay (`sockets/tracking.js`):**
   - Listen for `worker-location-update` events from active worker.
   - Broadcast live coordinates to `booking:${bookingId}` room for the customer map in real time.
4. **Dual Payment & Cooperative Split Engine (`services/payment.js`):**
   - **Razorpay Online Flow:** Create order via Razorpay SDK; verify signature on completion webhook.
   - **Cash on Delivery (COD) Flow:** Worker marks cash collected; customer confirms OTP or in-app prompt.
   - **Cooperative Commission Split (Multi-document Transaction):**
     - **88%** Direct Worker Payout
     - **5%** Primary Society Fee
     - **4%** Platform Maintenance & Tech
     - **3%** Worker Emergency Welfare Fund

### 👤 Person 2 Tasks (Mobile App Track):
1. **Realtime Job Offer Modal (`components/OfferModal.js`):**
   - High-urgency overlay popping up on worker device with sound & vibration.
   - Animated 45-second radial countdown bar, customer distance, category, and guaranteed net payout.
   - "ACCEPT" (Green) and "DECLINE" (Red) action buttons emitting instant socket events.
2. **Active Job Lifecycle & Milestone Controller:**
   - Sequential worker progression: **En Route ➔ Arrived ➔ Start Job ➔ Complete Job**.
   - Background GPS streaming during "En Route" using `expo-location` updating server every 5 seconds.
3. **Customer Realtime Live Tracking Screen (`screens/CustomerTrackingScreen.js`):**
   - Interactive live map (`react-native-maps`) showing worker's moving marker and ETA.
   - Milestone status timeline updated instantly via Socket.io without page refreshes.
4. **Payment & Rating Dialogs:**
   - In-app Razorpay checkout for online payment OR Cash receipt confirmation.
   - Immediate breakdown display: "You paid ₹500 (Worker receives ₹440 / Cooperative keeps ₹60)".
   - 5-star rating submission with feedback tags.

> **🎯 Phase 3 Milestone:** Complete end-to-end realtime demonstration: Customer books → Worker phone rings with 45s popup → Worker accepts → Customer watches worker approach on live map → Job completes → Customer pays via Razorpay or COD → Cooperative 88/5/4/3 split is recorded.

---

## 📋 Phase 4: Cooperative Differentiators, Governance & Demo Polish (36-Hour Hackathon)

### 👤 Person 1 Tasks (Backend Track):
1. **Fair-Match Explainability API (`GET /api/admin/match-audit/:bookingId`):**
   - Returns full mathematical breakdown of why Worker A was chosen over Worker B (Proximity, Rotation, Fairness index, Category match).
2. **Worker Welfare Fund Ledger & Emergency Claims API:**
   - Routes for workers to view accrued 3% emergency fund balance and submit micro-welfare claims (medical, tool repair).
3. **Identity & Skill Verification Sandbox (Stretch):**
   - Mock Aadhaar / Skill Council verification endpoint confirming verified worker badges.

### 👤 Person 2 Tasks (Mobile & Web Admin Track):
1. **Admin Fair-Match Audit Panel (`frontend/app/admin/matches`):**
   - Visual inspection tool comparing worker candidate scores with radar charts to demonstrate anti-monopoly fair distribution to hackathon judges.
2. **Worker Welfare & Cooperative Governance Screen:**
   - In-app mobile screen showing the worker their cooperative dividends, insurance cover, and voting rights.
3. **Demo Readiness & Presentation Polish:**
   - Realistic seed data for 15 workers and 10 categories across Pune/Mumbai coordinates.
   - Expo production APK build using EAS CLI: `eas build -p android --profile preview`.
   - Backup offline demo script and screen recording.

---

## 🛠️ Git & Development Coordination Workflow

1. **Person 1** works in root (`server.js`, `routes/`, `models/`, `services/`, `sockets/`).
2. **Person 2** works in `sahakar_app/` (Mobile SuperApp) and `frontend/` (Web Admin).
3. Always pull latest changes before starting work:
   ```bash
   git pull origin main
   ```
4. Commit and push feature changes with descriptive conventional commit messages:
   ```bash
   git add .
   git commit -m "feat(realtime): implement 45s cascading dispatch and live GPS socket relay"
   git push origin main
   ```
