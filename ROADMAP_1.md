# ROADMAP.md — SahakarConnect: Zero to Working Prototype

**Who this is for:** a team that has never shipped a full-stack app before. No step assumes prior knowledge beyond "can write basic JavaScript." Follow phases in order — do not skip ahead to Phase 3 features because they're more exciting. The boring Phase 1 plumbing is what makes Phase 3 possible without everything breaking.

**How to use this doc:** each phase has a goal, a stack decision box, and a numbered list of small steps. Check items off in `tracker.md` as you go. If a step says "learn X first," spend 30–60 min on that before touching code — building on a concept you don't understand costs more time later than learning it now.

---

## 0. Reality Check on Timing (read this before anything else)

SIH 2026 runs in stages: institute-level shortlisting now, national portal submission, then a Grand Finale hackathon (36-hour build window) later in the year. **That gap between now and the Grand Finale is your real runway — not 36 hours.** Treat it like this:

- **Phases 1–2 of this roadmap = homework, done over the coming weeks, before any clock starts.** This is where you actually learn the stack and get a boring-but-working skeleton live.
- **Phase 3 = what you build during the internal-round demo push and refine before the Finale.**
- **Phase 4 = what you finish *during* the 36-hour Grand Finale itself**, plus polish.

If you try to learn Node, React, MongoDB, and Socket.io *and* build the whole product inside a single 36-hour window with zero prior experience, you will not finish. Say that plainly to your team now, not after you've burned two weeks avoiding it.

---

## 1. Finalized Tech Stack

Two calls below are **reversed from an earlier, more advanced-team-oriented recommendation** — flagged explicitly so nobody's confused when they see Mongo instead of Postgres in this doc. Reasoning, not just the verdict:

| Layer | Choice | Why (beginner-specific reasoning) |
|---|---|---|
| Database | **MongoDB (Atlas, free cloud tier)** | Reversed from Postgres. Postgres+PostGIS is technically the better fit for this ledger-heavy domain, *but* it demands learning SQL, migrations, and a fairly niche GIS extension simultaneously — thin tutorial coverage for a beginner stuck on a PostGIS radius query. MongoDB's "find nearby" pattern ($near/2dsphere) is one of the most commonly tutorialized beginner topics that exists, and Atlas needs zero local database installation. For a team learning from zero, resource-availability beats theoretical purity. |
| Backend | **Node.js + Express** | Reversed from Fastify. Functionally similar for our needs; Express has by far the largest volume of beginner tutorials, Stack Overflow answers, and course content. Fastify is a fine upgrade later, not a good first teacher. |
| Backend language | JavaScript (not TypeScript, initially) | Learning TypeScript's type system *and* the app at the same time doubles the beginner learning curve. Write in plain JS through Phase 2; introduce TypeScript in Phase 3 once the team is comfortable, if there's appetite — optional, not required. |
| Auth (all roles) | **Firebase Authentication** (Phone Auth for customers, Email/Password for worker & admin) | Reversed from hand-rolled JWT. Building your own password hashing, JWT signing, and refresh-token rotation correctly is a real security task — easy to get subtly wrong. Firebase handles it; your backend just verifies the ID token via the Firebase Admin SDK. One less hard subsystem to build from scratch. |
| File storage | **Firebase Storage** | Same Firebase project as Auth — one dashboard, one SDK family, fewer new services to learn. Used for KYC docs, job-completion photos. |
| Push notifications | **Firebase Cloud Messaging** | Same reasoning — already in the Firebase project. |
| Web frontend (customer + admin) | **Next.js (React) + Tailwind CSS** | Kept as-is. Huge tutorial base, and Vercel deployment is one command. |
| Worker mobile app | **React Native + Expo (managed)** | Flutter dropped. Learning Dart *and* JavaScript at the same time is unnecessary cognitive load for a from-zero team — one language (JS) across web, mobile, and backend means everything you learn transfers everywhere. Expo Go also lets you demo the app live on any phone via QR scan, no app-store wait. |
| Realtime | **Socket.io** | Kept as-is. Well-documented, works cleanly with both Next.js and Expo. |
| Payments | **Razorpay (test mode)** | Kept as-is. |
| Maps | **Mapbox** | Kept over self-hosted OSRM/Leaflet — one API key, no server to run. Google Maps Platform has more tutorials but requires a billing account/card even for free-tier use; Mapbox doesn't. Revisit OSRM later only if you want the "open infrastructure" pitch angle and have spare time. |
| Multilingual (worker app voice) | **Bhashini API** | Kept — free self-serve signup at bhashini.gov.in, real government-backed ASR/NMT/TTS, genuinely good for the pitch. Phase 4 item, not core path. |
| Identity/KYC verification | **Setu.co or Sandbox.co.in developer sandbox** (not the government "API Setu" exchange, which is a different, less self-serve platform — don't confuse the two in your pitch) | Real sandbox Aadhaar verification with test data, self-serve signup. Apply for API credentials as early as possible (support-ticket turnaround, not instant). Phase 4 stretch item. |
| Criminal/background check | **Manual police-verification-certificate (PCC) upload + admin review only.** No ML model. eCourts sandbox lookup, if used at all, is a supplementary manual-review aid, clearly labeled, never an automated decision. | An ML model "predicting criminality" has no valid training data and is a bias risk (a model like this can end up encoding name/religion/caste correlations as "risk" — a real and serious harm, not just a technical weak point). This isn't a corner to cut for time — it's a corner that shouldn't exist. Skip it in Phase 4 unless there's a lot of spare time, and even then keep it manual. |

⚠️ **Note:** `schema.md`, `techSpec.md`, `architecture.md`, `INTEGRATIONS.md`, and `API_SPEC.md` in `/docs` were written for the earlier Postgres/Fastify/custom-JWT version. They're now out of sync with this stack. Don't code against them as-is for DB/auth specifics — the entity list, API routes, and business logic (Fair-Match formula, commission split, welfare fund, RBAC roles) in those files are all still correct and should be followed; only the DB engine, backend framework, and auth mechanism sections are stale. Say the word once your team has read this roadmap and I'll rewrite those files to match.

---

## 2. Feature → Phase Map (nothing from the full feature list gets dropped — just sequenced)

| Feature | Phase |
|---|---|
| Browse categories, view services | 2 |
| Booking creation (no matching yet) | 2 |
| Customer/worker/admin login | 2 |
| Basic admin table views | 2 |
| Fair-Match Engine (2-factor: proximity + fairness) | 3 |
| Fair-Match Engine (full 4-factor, +rating +skill) | 3/4 |
| Worker app: offers, accept/reject, status updates | 3 |
| Realtime dispatch (Socket.io) | 3 |
| Live tracking (customer) | 3 |
| Payments (Razorpay) + commission split | 3 |
| Ratings | 3 |
| Welfare fund + claims | 4 |
| Disputes | 4 |
| Fair-Match explainability panel | 4 |
| Federation aggregate dashboard | 4 |
| KYC document upload (Firebase Storage) | 4 |
| Aadhaar sandbox verification | 4 (stretch) |
| Bhashini voice assistant | 4 (stretch) |
| Background/criminal check (manual only) | 4 (stretch, low priority) |
| FairnessMeter, PriceBreakdownChip, TrustBadge UI components | 3–4 (build as their underlying feature lands) |

---

## 3. Phase 1 — Foundations (prove the whole chain works, before building anything real)

**Goal by end of phase:** one live URL, showing data pulled from a real cloud database, deployed on the internet — not on anyone's laptop. Nothing fancy. This proves every link in the chain works before you add complexity to any of them.

1. Install: Node.js (LTS), VS Code, Git, create a GitHub account and repo.
2. Create a free MongoDB Atlas cluster (cloud-hosted, no local install needed).
3. Create a free Firebase project (you'll use this for Auth, Storage, and Push later).
4. Refresh JS fundamentals if needed: variables, functions, arrays/objects, `async/await`, JSON. (freeCodeCamp or MDN — don't need a full course, just enough to not be lost.)
5. Build a one-file Express server with a single route: `GET /health` returning `{ status: "ok" }`. Run it locally, hit it with a browser or Postman/Thunder Client.
6. Connect that server to MongoDB Atlas via Mongoose. Create one throwaway collection, write one document to it, read it back. This is your first "the backend can talk to the database" proof.
7. Create a bare Next.js app with one page that `fetch()`s your Express `/health` route and displays the result. This is your first "the frontend can talk to the backend" proof.
8. Push everything to GitHub. Deploy the Express backend to Render (free tier) and the Next.js frontend to Vercel (free tier). Confirm the deployed frontend can reach the deployed backend — not just localhost talking to localhost.
9. Learn (conceptually, no code yet): what a REST API is, what a JWT/auth token is for, what Socket.io does differently from a normal HTTP request.

**You're done with Phase 1 when:** a URL you can send a teammate shows real data fetched from a real cloud database, on the internet.

---

## 4. Phase 2 — Core Data & Basic CRUD (the skeleton, no smart logic yet)

**Goal by end of phase:** real users can sign up, log in, and create a booking. An admin can see a list of everything. No matching algorithm yet — bookings just get created with status `pending`.

1. Design your Mongoose schemas (simplified versions of what's in `docs/schema.md`): `User`, `WorkerProfile`, `CustomerProfile`, `ServiceCategory`, `ServiceListing`, `Booking`. Keep fields minimal at first — you can add more later.
2. Set up Firebase Phone Auth, following Firebase's own quickstart, for customer login. Set up Firebase Email/Password auth for worker and admin login (simpler than phone OTP for internal roles).
3. On your Express backend, add a middleware that verifies the Firebase ID token sent from the frontend (using the Firebase Admin SDK) and attaches the user's role to the request. This is your entire auth system — no password hashing, no JWT signing code to write yourself.
4. Build the customer web flow: see a static list of service categories → pick one → fill a simple booking form → save it (status `pending`, no worker assigned yet).
5. Build a minimal admin page: a plain table listing all bookings and all workers. Not styled, not fancy — just visible and correct.
6. Once basic fetch/display is working with plain `useEffect`, introduce TanStack Query (React Query) to replace it — understand the manual way first so the library's value is obvious, not magic.

**You're done with Phase 2 when:** a real person can sign up, log in, and create a booking that shows up correctly in an admin table.

---

## 5. Phase 3 — The Real Product (matching, realtime, payments — this is where it becomes SahakarConnect)

**Goal by end of phase:** the full loop works live — customer books, a worker gets a real-time offer, accepts it, completes the job, customer pays, customer rates. This is your demo floor. If you run out of time after this phase, you still have something real to show.

1. Set up an Expo project for the worker app. First milestone: a login screen + a hardcoded "my jobs" list — just prove Expo Go works on a real phone via QR scan before wiring any real data.
2. Add `location` (GeoJSON point) to your `WorkerProfile` schema, and create a `2dsphere` index on it. Write **one isolated script** that queries "find all workers within 8km of this point" using `$near` — test this in complete isolation before plugging it into anything else. This is historically the trickiest single step for beginners; don't skip the isolated-test step.
3. Build Fair-Match Engine **v1, simplified to 2 factors**: proximity + rotation-fairness only (skip rating and skill-match weighting for now — add them back in Phase 4 once the 2-factor version demonstrably spreads jobs across workers instead of always picking the same one).
4. Wire Socket.io: when a booking is created, emit an event; the worker app listens and shows the offer. Start with no accept/reject timer — just "push it and show it" — add the 45-second countdown once the basic push works.
5. Add accept/reject handling, and re-offer to the next candidate on reject/timeout.
6. Add job status updates on the worker app: en route → arrived → in progress → completed. Mirror this as a simple status timeline on the customer's tracking screen.
7. Integrate Razorpay test mode following their own quickstart — a "Pay Now" button on a completed booking.
8. On successful payment (webhook), write the 88/5/4/3 commission split to your `Payment` and `Payout` collections — use a MongoDB multi-document transaction here so a crash mid-write can't leave the numbers inconsistent.
9. Add a simple 1–5 star rating + comment, tied to the booking, shown after completion.

**You're done with Phase 3 when:** you can run through customer → offer → accept → complete → pay → rate, live, without anyone typing fake data into the database by hand.

---

## 6. Phase 4 — Differentiators & Demo Polish

**Goal:** the features that make this a *cooperative* platform and not a generic booking app in the judges' eyes, plus making sure the demo can't fall apart on stage. Work top-to-bottom; stop wherever the clock runs out — everything below is additive, nothing here is required for the core loop to work.

1. Bring the Fair-Match Engine up to the full 4-factor formula (add rating and skill-match weighting) — only after the 2-factor version is proven solid.
2. Build the Fair-Match explainability panel on the admin dashboard: show the score breakdown for each candidate on a given job. Strong, concrete live-demo moment.
3. Welfare fund ledger + claim flow (worker files → admin approves/rejects).
4. Dispute filing + society-admin resolution screen.
5. Federation-level aggregate dashboard (read-only rollup across societies).
6. KYC document upload via Firebase Storage.
7. **(Stretch, only with time to spare)** Aadhaar sandbox verification via Setu.co/Sandbox.co.in — apply for API credentials well before you plan to build this, approval isn't instant.
8. **(Stretch, only with time to spare)** Bhashini voice assistant — fixed command grammar only ("mark arrived," "mark complete," "read next offer aloud"), not a general chatbot.
9. **(Lowest priority, manual-only if attempted at all)** Background verification: PCC document upload + admin review. Skip entirely if time is short — this was never meant to be automated (see stack table above).
10. Polish pass: empty states, loading states, error states. Seed realistic demo data. Rehearse the full demo twice, live, on the actual devices you'll use. Record a backup demo video in case live wifi fails.
11. Build the pitch deck content from `docs/SIH_PITCH_PROPOSAL.md`.

---

## 7. If You're Genuinely Out of Time

Cut in this order, not randomly: (10) background check entirely → (9) voice assistant → (8) Aadhaar sandbox → (7) federation dashboard → (6) explainability panel polish. **Never cut the Fair-Match rotation-fairness term itself** (even the simple 2-factor version) — that's the one thing separating this from "Urban Company with a green logo," and it's the cheapest-to-keep, most-valuable-to-show piece in the entire roadmap.
