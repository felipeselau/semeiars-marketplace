# SemeiaRS — Claude Code Context

## What this is

C2C e-commerce marketplace for family farmers in Rio Grande do Sul, Brazil. Buyers discover and purchase agricultural products directly from rural sellers. Built as a TCC (university capstone) project.

## Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL via [Neon](https://neon.tech) cloud + Prisma 7 ORM
- **Auth**: NextAuth v5 (beta) with Credentials provider (email + bcrypt)
- **Styling**: Tailwind CSS 4 + custom design system (Poppins/Inter fonts)
- **Payments**: AbacatePay (PIX charges) + PagSeguro (seller payouts)
- **Deployment**: Vercel

## Commands

```bash
npm run dev           # Start dev server on :3000
npm run build         # Production build
npm run type-check    # TypeScript check (no emit)
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)

npm run db:seed       # Seed database with test data
npm run db:reset      # Reset DB (drops and re-migrates)
npm run db:reset:seed # Reset DB + seed
```

## Architecture

```
src/
  actions/    # Next.js Server Actions (auth, cart, checkout, order, payment, product)
  app/        # App Router pages + API routes
    api/      # Webhooks (abacatepay, pagseguro) + auth + seller APIs
  components/ # Navbar + shadcn-style UI primitives (src/components/ui/)
  lib/        # Prisma client, auth config, payment clients, encryption, i18n
  types/      # TypeScript type extensions (NextAuth session, DB types)
prisma/
  schema.prisma   # 10 models: User, Product, Order, Cart, Payment, Payout, etc.
  seed.ts         # 4 test sellers, 1 buyer, 16 products, sample orders
```

## Key patterns

- Server Actions for all data mutations (not tRPC/REST)
- Role-based access: `BUYER` vs `SELLER` (users can become sellers)
- Mock payment mode via `MOCK_PAYMENTS=true` (bypasses real payment APIs)
- Portuguese UI via `src/lib/messages.ts` key-value store
- Path alias: `@/*` → `src/*`

## Environment variables

See `.env.example` for the full list. Key ones:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `MOCK_PAYMENTS=true` / `NEXT_PUBLIC_MOCK_PAYMENTS=true` — enable for dev/staging
- `ABACATEPAY_ENV=sandbox` / `PAGSEGURO_ENV=sandbox` — use sandbox in non-prod

## Test accounts (after seeding)

| Role   | Email               | Password |
| ------ | ------------------- | -------- |
| Buyer  | comprador@email.com | senha123 |
| Seller | joao@agricola.com   | senha123 |
| Seller | maria@organicos.com | senha123 |

## Staging setup

See `STAGING_PLAN.md` for the full Neon + Vercel staging environment guide. The amber banner in the header appears automatically when `NEXT_PUBLIC_MOCK_PAYMENTS=true`.
