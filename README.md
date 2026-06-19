# Horologe Auctions

A production-ready online watch auction platform inspired by Auctionet, built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives, Prisma, PostgreSQL, JWT auth, Socket.IO bidding, and Stripe payment intent wiring.

## Features

- Luxury marketplace home page with hero, search, featured lots, ending soon lots, and category filters.
- Auction listing page with grid layout, sorting, pagination, text search, and category filtering.
- Auction detail page with large gallery, watch specifications, current bid, bid history, countdown, watchlist, and live bidding.
- WebSocket bidding with automatic bid increments, proxy max bids, and anti-sniping extension in the last 2 minutes.
- Email/password authentication using JWT httpOnly cookies.
- User dashboard for bids, auctions, watchlist, and notifications.
- Admin dashboard for auction creation, pending approvals, and user management.
- Prisma models for User, Auction, Bid, Image, Watchlist, and Notification.
- Stripe payment intent and webhook endpoints for winner payment flow.
- Rate limiting, Zod input validation, CSRF double-submit protection, and security headers/CSP.
- Dynamic metadata, Open Graph tags, and generated sitemap.
- Docker and Docker Compose production setup.

## Quick Start

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seed accounts:

- Admin: `admin@horologe.test` / `password123`
- User: `bidder@horologe.test` / `password123`

## Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/watch_auction?schema=public"
JWT_SECRET="change-me-to-a-strong-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_replace_me"
STRIPE_WEBHOOK_SECRET="whsec_replace_me"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_replace_me"
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run prisma:migrate
npm run prisma:seed
```

## Production

```bash
docker compose up --build
```

For production, replace all secrets, use managed PostgreSQL backups, configure Stripe webhook forwarding to `/api/webhooks/stripe`, and run migrations before traffic reaches the app.
