# Hourly Tourism 🛵 🚗 🚐

> **Discover More. One Hour at a Time.**

Hourly Tourism is a full-stack tourism marketplace platform where customers discover, book, and enjoy tourism services by the hour. Tourists can hire bikes, cars, vans, certified local guides, sightseeing tours, and unique cultural experiences with transparent hourly pricing and zero full-day lock-ins.

---

## 🎯 Business Concept & Platform Rules

- **Flexible Hourly Rentals**: Customers can book predefined hourly packages (e.g. 2 hrs, 4 hrs, 8 hrs) or create custom bookings with exact hourly durations (1 to 12 hours).
- **Strict Transport Category Policy**: Transport categories are restricted strictly to **Bikes, Cars, and Vans only**. No other vehicle categories (buses, trucks, boats, etc.) are allowed in the database, API, or UI.
- **Real-Time Overlap Prevention**: Concurrency-safe availability validation checks ensure no double bookings or overlapping reservations occur.
- **Multi-Role Ecosystem**: Full support for Customers, Independent Providers, Fleet Tourism Companies, and Platform Administrators.

---

## 🏗️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing throughout)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with responsive mobile-first design
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
- **Authentication**: Supabase Auth with Row Level Security (RLS) policies
- **Payments**: [Razorpay](https://razorpay.com/) (India-based, with built-in development test mode)
- **Maps**: Google Maps / Mapbox embed API support
- **State & Utilities**: Zustand, Lucide React, Date-fns, React Hot Toast

---

## 🏛️ Application Architecture

```
src/
├── app/
│   ├── (public pages)
│   │   ├── page.tsx                     # Homepage (Hero, Categories, Featured Listings, How It Works)
│   │   ├── explore/page.tsx             # Hourly search & filtering engine
│   │   ├── vehicles/page.tsx            # Vehicles marketplace (Bikes, Cars, Vans only)
│   │   ├── guides/page.tsx              # Certified local tour guides by the hour
│   │   ├── tours/page.tsx               # Curated sightseeing & cultural experiences
│   │   ├── services/[id]/page.tsx       # Service details & interactive hourly booking engine
│   │   ├── become-provider/page.tsx     # Host onboarding application
│   │   ├── login/page.tsx               # Sign in with role routing
│   │   ├── signup/page.tsx              # Account creation with role selector
│   │   ├── terms/page.tsx               # Terms of service
│   │   ├── privacy/page.tsx             # Privacy policy
│   │   ├── cancellation-policy/page.tsx # Transparent cancellation rules
│   │   ├── faqs/page.tsx                # Frequently asked questions
│   │   └── contact/page.tsx             # 24/7 support desk
│   ├── dashboard/                       # Customer Dashboard (Bookings, Receipts, Reviews, Profile)
│   ├── provider/                        # Independent Host Dashboard (Listings, Requests, Availability, Earnings)
│   ├── company/                         # Company Operator Dashboard (Multi-vehicle Fleet, Bookings, Revenue)
│   ├── admin/                           # Platform Admin Dashboard (Telemetry, Approvals, Payments, Settings)
│   └── api/                             # Backend REST APIs (Bookings, Conflicts, Payments, Services, Reviews)
├── components/
│   ├── ui/                              # 18 reusable design system primitives (Button, Modal, Input, Badge, etc.)
│   ├── layout/                          # Header, Footer, SearchBar, DashboardLayout
│   ├── listings/                        # ServiceCard, ListingGrid, FilterSidebar
│   ├── booking/                         # BookingForm, PriceBreakdown, BookingStatusBadge
│   ├── reviews/                         # ReviewCard, ReviewForm
│   └── maps/                            # MapDisplay (Google Maps embed or styled fallback)
├── hooks/                               # useAuth, useNotifications
├── lib/                                 # supabase client/server/middleware, utils, constants, auth helpers
└── types/                               # TypeScript models, enums, database interfaces
supabase/
└── schema.sql                           # 19 PostgreSQL tables, enums, RLS policies, triggers, seed data
```

---

## 🗄️ Database Architecture (`supabase/schema.sql`)

The database schema contains **19 tables** with primary keys, foreign keys, unique constraints, and Row Level Security:

1. `profiles`: User account details and assigned roles (`customer`, `provider`, `company`, `admin`).
2. `provider_profiles`: Host profile, business information, license numbers, and verification status.
3. `company_profiles`: Commercial fleet operators with company registration and fleet sizes.
4. `service_listings`: Core listings with destination, base hourly rate, buffer times, and rating averages.
5. `vehicle_details`: Strictly enforces `vehicle_type` as `'bike'`, `'car'`, or `'van'` via PostgreSQL ENUM.
6. `guide_details`: Spoken languages, years of experience, certifications, and group sizes.
7. `hourly_packages`: Predefined packages (e.g. 2 hrs, 4 hrs, 8 hrs) with custom bundle pricing.
8. `provider_availability`: Weekly working schedules (days 0-6 with start and end times).
9. `availability_exceptions`: Blocked dates and maintenance blackouts.
10. `bookings`: Complete hourly financial records with auto-generated booking numbers (`HT-YYYY-NNNNNN`).
11. `booking_status_history`: Audit trail tracking every lifecycle transition.
12. `payments`: Razorpay transaction IDs, signatures, and payment statuses.
13. `refunds`: Refund tracking with reason and processing timestamps.
14. `provider_earnings`: Net earnings calculations after the 10% platform commission deduction.
15. `reviews`: Rating (1-5) and reviews constrained to 1 per completed booking.
16. `notifications`: In-app notification feed for bookings, status changes, and payments.
17. `support_tickets`: Helpdesk tickets with resolution tracking.
18. `promotional_codes`: Percentage or fixed discounts with maximum use limits.
19. `platform_settings`: Global commission rates, tax rates, and hourly constraints.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 18.x or 20.x or 22.x
- npm or pnpm or yarn
- Supabase account (free tier available at https://supabase.com)
- Razorpay account (optional, test mode available at https://razorpay.com)

### 2. Installation
```bash
git clone <repo-url>
cd hourly-tourism

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
# Supabase (find in Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (find in Dashboard -> Settings -> API Keys)
RAZORPAY_KEY_ID=rzp_test_your_id
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_id

# Google Maps (optional)
NEXT_PUBLIC_MAPS_API_KEY=your_google_maps_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of `supabase/schema.sql` and run it.
4. All tables, ENUM types, triggers, auto-number generators, and RLS policies will be created immediately.

### 5. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Payment Gateway & Development Mode

Hourly Tourism features a **production-ready Razorpay integration**:
- **With credentials configured**: The server creates real Razorpay orders and verifies payment signatures using HMAC-SHA256 (`crypto`).
- **In Development Mode (no credentials)**: The app detects missing keys, alerts the user, and enables instant development test verification so end-to-end booking, payment confirmation, and receipt download flows can be thoroughly tested locally.

---

## 🔒 Security & Access Control

- **Protected Routes**: Middleware guards `/dashboard`, `/provider`, `/company`, and `/admin`.
- **Role-Based Authorization**: Customers cannot access provider or admin tools; providers only manage their own listings.
- **Row Level Security (RLS)**: Enforced at the PostgreSQL level so users can only read and mutate their own bookings and listings.
- **No Secret Leakage**: `RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-side and never exposed to the client.

---

## 🚢 Deployment to Vercel

1. Push your code to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Import Project** and select the repository.
3. In **Environment Variables**, paste the keys from your `.env.local`.
4. Click **Deploy**. Next.js will build all 47 routes and optimize static and dynamic assets automatically.
