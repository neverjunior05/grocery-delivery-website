# FreshHarvest Express — Full-Stack Grocery Delivery Platform

A production-grade, fast, low-friction full-stack grocery delivery platform built with Next.js (App Router), PostgreSQL via Drizzle ORM, JWT role-based authentication, and a responsive Tailwind CSS UI.

## Tech Stack
- **Frontend & Backend:** Next.js 16 (App Router, Server Route Handlers), React 19
- **Database & ORM:** PostgreSQL + Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Authentication:** JWT (`jsonwebtoken`) + `bcryptjs`, role-based access control (`customer`, `delivery`, `admin`)
- **State & UI:** React Context API (`AppContext`), Tailwind CSS v4, Lucide Icons, Sora & Inter typography
- **File Uploads:** Server-side file validation & storage (`/api/upload`)
- **Payments:** Sandbox Card checkout mode with atomic stock re-validation

---

## Project Structure
```
project-root/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # signup, login, me endpoints
│   │   │   ├── products/      # public browse, filter, admin CRUD
│   │   │   ├── categories/    # category CRUD
│   │   │   ├── cart/          # cart fetch, update, clear
│   │   │   ├── orders/        # order creation, status update, reorder
│   │   │   ├── delivery-slots/# delivery slot list & capacity check
│   │   │   ├── favorites/     # toggle & list user favorites
│   │   │   ├── reports/       # revenue, low stock & staff stats
│   │   │   ├── upload/        # image upload validator
│   │   │   ├── seed/          # repopulate database seed
│   │   │   └── health/        # platform healthcheck
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # main application controller
│   ├── components/
│   │   ├── Navbar.tsx         # sticky header, search & demo reset
│   │   ├── ShopView.tsx       # catalog, categories & quick filters
│   │   ├── ProductCard.tsx    # grocery stepper with in-card quantity
│   │   ├── CartDrawer.tsx     # slideout cart, slot booking & checkout
│   │   ├── OrderTrackingView.tsx # live status timeline & 1-click reorder
│   │   ├── DeliveryQueueView.tsx # delivery staff order progression
│   │   ├── AdminPortalView.tsx   # inventory, dispatch & sales reports
│   │   └── AuthModal.tsx      # login, signup & 1-click demo switcher
│   ├── context/
│   │   └── AppContext.tsx     # user, cart, search, favorites state
│   ├── db/
│   │   ├── index.ts           # PostgreSQL pg-pool client
│   │   ├── schema.ts          # users, categories, products, deliverySlots, orders, cartItems
│   │   └── seed.ts            # 28+ grocery items, categories, demo users & slots
│   └── lib/
│       └── auth.ts            # password hashing, JWT verify & role guard
├── README.md
└── package.json
```

---

## Key Backend API Routes

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch active logged-in user profile | Authenticated |
| `GET` | `/api/products` | Browse, search, filter groceries | Public |
| `POST` | `/api/products` | Create new grocery product | Admin |
| `PUT` | `/api/products/:id` | Update product price/stock/details | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |
| `GET` | `/api/categories` | List all grocery categories | Public |
| `POST` | `/api/categories` | Create new grocery category | Admin |
| `GET` | `/api/delivery-slots` | Fetch available delivery slots & remaining capacity | Public |
| `GET` | `/api/cart` | Get current user's basket | Authenticated |
| `POST` | `/api/cart` | Add/update item quantity in basket | Authenticated |
| `DELETE` | `/api/cart` | Clear entire basket | Authenticated |
| `GET` | `/api/orders` | Customer order history, staff queue, or admin overview | Authenticated |
| `POST` | `/api/orders` | Place order with stock-aware validation & slot lock | Customer / Admin |
| `PATCH` | `/api/orders/:id` | Transition order status or assign delivery courier | Staff / Admin |
| `POST` | `/api/orders/:id/reorder` | 1-Click reorder past basket with stock checks | Customer / Admin |
| `GET` | `/api/favorites` | List pinned items | Authenticated |
| `POST` | `/api/favorites` | Toggle favorite state | Authenticated |
| `GET` | `/api/reports` | Total revenue, low-stock alerts, best-sellers | Admin |
| `POST` | `/api/upload` | Upload grocery images (max 5MB, JPG/PNG/WEBP) | Admin |
| `POST` | `/api/seed` | Reset & reseed 28+ grocery items and accounts | Public / Admin |

---

## Key Business Logic

### 1. Stock-Aware Checkout
When a customer clicks checkout, the server executes atomic inventory verification on every requested item. If stock changed between adding to cart and clicking pay, checkout is rejected with an HTTP 409 conflict and clear feedback specifying available quantities. On success, stock is decremented and `inStock` is updated.

### 2. Delivery Slot Capacity Limits
Delivery slots model real grocery logistics with strict capacity constraints (e.g., maximum 20 orders per window). When orders reach maximum capacity, the slot is locked as **Full (Cap reached)**, preventing over-booking.

### 3. One-Click Reorder Logic
Repeated grocery shopping is high-frequency. The 1-click reorder endpoint pulls past order items directly back into the customer's cart, gracefully skipping discontinued items and capping quantities if current store stock is lower than previous order quantities.

### 4. Order Status Progression State Machine
Strict order status timeline:
`Placed` → `Packed` → `Out for Delivery` → `Delivered`
- Cancellations are restricted to `Placed` or `Packed` stages only and automatically restore inventory stock and delivery slot capacity.
- Delivery staff can only transition orders from `Packed` to `Out for Delivery` and `Out for Delivery` to `Delivered`.

---

## Seed Accounts (Pre-configured)

| Role | Email | Password |
|---|---|---|
| **Store Admin** | `admin@freshharvest.com` | `adminpassword123` |
| **Delivery Staff 1** | `david.rider@freshharvest.com` | `staffpassword123` |
| **Delivery Staff 2** | `elena.rider@freshharvest.com` | `staffpassword123` |
| **Customer** | `customer@freshharvest.com` | `customerpassword123` |
| **Customer 2** | `maya.lin@example.com` | `customerpassword123` |

Click **"Reset / Seed Demo"** in the top navigation bar at any time to repopulate all 28+ grocery items across 7 categories.

---

## Setup Instructions

1. **Clone repository and setup environment:**
   ```bash
   cp .env.example .env # Ensure DATABASE_URL is set
   npm install
   ```

2. **Push database schema:**
   ```bash
   npx drizzle-kit push
   ```

3. **Seed sample grocery items:**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

4. **Run build & start:**
   ```bash
   npm run build
   npm run start
   ```

---

## Future Improvements
- Add real-time order tracking via WebSockets / SSE
- Add live delivery GPS tracking for couriers on maps
- Add recurring subscription orders for recurring grocery staples
- Add multi-depot inventory routing based on customer postal codes
