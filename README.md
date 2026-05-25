# Inventory Reservation System

A full-stack Inventory reservation system built with Next.js, Prisma, PostgreSQL (Neon), and TypeScript.

---

# Features

- Product inventory management across multiple warehouses
- Reserve inventory items
- Reservation countdown timer
- Confirm purchase flow
- Cancel reservation flow
- Automatic reservation expiry
- Concurrency-safe reservation handling
- Real-time UI updates without manual refresh
- Proper HTTP error handling (404, 409, 410)

---

# Tech Stack

- Next.js 15
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS
- Vercel

---

# Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/Daya-12345/allo-reservation-system.git
cd allo-reservation-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_neon_database_url"
```

---

## 4. Run Prisma Migrations

```bash
npx prisma migrate deploy
```

---

## 5. Seed Database

```bash
npm run seed
```

---

## 6. Start Development Server

```bash
npm run dev
```

Application runs at:

```txt
http://localhost:3000
```

---

# Reservation Flow

1. User selects a product inventory.
2. A reservation is created.
3. Reserved stock is deducted from available inventory.
4. User receives a countdown timer.
5. User can:
   - Confirm purchase
   - Cancel reservation
   - Allow reservation to expire automatically

---

# Reservation Expiry Mechanism

Each reservation stores an `expiresAt` timestamp.

The frontend continuously checks remaining time and displays a live countdown timer.

When the timer expires:
- Reservation status becomes `EXPIRED`
- Reserved stock is released back to inventory
- API returns HTTP `410 Gone`

A dedicated expiry endpoint handles cleanup safely.

---

# Concurrency Handling

Inventory reservations are protected using Prisma database transactions.

The reservation endpoint:
- Reads inventory inside a transaction
- Verifies stock availability
- Updates reserved stock atomically

This guarantees:
- Only one request can reserve the last available item
- Simultaneous requests are handled safely
- Overselling inventory is prevented

If inventory is unavailable, the API returns:

```txt
409 Conflict
```

---

# HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 404 | Resource not found |
| 409 | Conflict / insufficient stock |
| 410 | Reservation expired |
| 500 | Internal server error |

---

# Real-Time UI Updates

The UI updates automatically after:
- Reservation confirmation
- Reservation cancellation
- Reservation expiry

This is handled using:
- `router.refresh()`
- Local state updates

No manual browser refresh is required.

---

# Project Structure

```txt
src/
 ├── app/
 │    ├── api/
 │    ├── reservations/
 │    ├── page.tsx
 │
 ├── lib/
 │    └── prisma.ts
 │
prisma/
 ├── schema.prisma
 ├── seed.ts
 └── migrations/
```

---

# Trade-offs / Future Improvements

With more development time, the following improvements could be added:

- Background cron jobs for automatic expiry cleanup
- WebSocket-based live inventory synchronization
- Authentication and user accounts
- Reservation history tracking
- Automated unit and integration testing
- Docker support
- Improved UI responsiveness
- Better retry/error handling
- Distributed locking for large-scale concurrency

---

# Deployment

The application is deployed on Vercel.

---

# Author

Daya-12345
