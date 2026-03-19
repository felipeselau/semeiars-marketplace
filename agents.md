# SemeiaRS - Agent Documentation

## 1. Project Identity

**Name**: SemeiaRS  
**Type**: C2C E-commerce Marketplace (MVP)  
**Purpose**: Consumer-to-consumer marketplace that will evolve to support family farmers in Rio Grande do Sul, Brazil  
**Version**: 0.1.0

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js) |
| Styling | Tailwind CSS |
| Validation | Zod |
| UI Components | shadcn/ui + Radix UI |

---

## 3. Current Features (MVP)

- User authentication (register, login, logout)
- Product catalog with search and category filters
- Full CRUD for products (sellers)
- Shopping cart (persisted in database)
- Order management for buyers and sellers
- Order status timeline (7 status states)
- Responsive design system
- Full Portuguese Brazilian localization

---

## 4. Planned Features

- Image upload (Firebase Storage or S3)
- Payment integration (AbacatePay + PagSeguro Payout)
- Seller payment settings (PIX configuration)
- Payout/split automation

---

## 5. Database Schema (Core Entities)

```
User → Products (hasMany)
User → Orders (hasMany)
Order → OrderItems (hasMany)
Product → Category (belongsTo)
Product → User (belongsTo)
```

### Core Models
- **User**: id, name, email, password, phone, address, role (BUYER/SELLER)
- **Product**: id, name, description, basePrice, currentPrice, quantity, imageUrl, sellerId, categoryId
- **Category**: id, name
- **Order**: id, buyerId, total, status, createdAt
- **OrderItem**: id, orderId, productId, quantity, price
- **Cart**: id, userId, productId, quantity

---

## 6. Design System

### Colors (Tailwind Tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | #4a7c6f | Main actions, links (Forest Green) |
| `--primary-foreground` | #f7f5f2 | Text on primary |
| `--secondary` | #ece8e0 | Cards, sections (Warm Beige) |
| `--secondary-foreground` | #4a4540 | Text on secondary |
| `--accent` | #d98c4d | CTAs, highlights (Terracotta) |
| `--accent-foreground` | #f7f5f2 | Text on accent |
| `--earth` | #6b5c4d | Dark accents |
| `--warm-yellow` | #e8c06a | Highlights |
| `--background` | #f7f5f2 | Page background |
| `--foreground` | #3d3632 | Primary text |
| `--border` | #ddd8cf | Borders |
| `--muted` | #ece8e0 | Muted backgrounds |
| `--muted-foreground` | #8a817a | Secondary text |
| `--destructive` | #dc2626 | Error states |

### Typography

| Element | Font Family |
|---------|-------------|
| Headings (h1-h6) | Poppins |
| Body text | Inter |

### Component Patterns

- Border radius: `0.75rem` (12px)
- Container max-width: `1400px`
- Section padding: `py-16 md:py-24 px-4 md:px-8`

---

## 7. Payment Architecture

### Flow

1. **Buyer pays** via AbacatePay (PIX)
2. **Payment confirmed** via webhook or polling
3. **Backend calculates split** (10% commission)
4. **Payout** via PagSeguro Payout API

### Fees

| Item | Value |
|------|-------|
| AbacatePay fee | R$ 0.80/transaction |
| Platform fee | R$ 0.20/transaction |
| Commission | 10% of seller amount |
| **Total** | **R$ 1.00 per sale** |

### Planned Payment Models

```prisma
model SellerPayment {
  id          String  @id
  sellerId    String  @unique
  cpfCnpj     String
  pixKey      String  // encrypted
  pixKeyType  String  // CPF, CNPJ, EMAIL, TELEFONE
  isVerified  Boolean
}

model Payment {
  id            String
  orderId       String  @unique
  amount        Float
  status        String  // PENDING, WAITING, CONFIRMED, FAILED
  splits        PaymentSplit[]
}

model PaymentSplit {
  id          String
  paymentId   String
  sellerId    String
  grossAmount Float
  commission  Float
  netAmount   Float
  payoutStatus String
}

model Payout {
  id            String
  sellerId      String
  amount       Float
  status       String  // PENDING, PROCESSING, SUCCESS, FAILED
  errorMessage  String?
}
```

---

## 8. Development Workflow

### Plan Mode

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes wrong, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy

- Use subagents liberally to keep main context clean
- Offload research, exploration, and parallel analysis to subagents

### Verification

- Never mark a task complete without proving it works
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### Self-Improvement

- After any correction: update lessons learned
- Write rules to prevent same mistakes

---

## 9. Coding Standards

- Follow clean/hexagonal architecture patterns
- Prioritize server-side rendering (RSC)
- Implement caching early
- Test incrementally
- Use Zod for validation
- All new code must pass lint before marking complete

---

## 10. Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
```

### Database

```bash
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npm run db:seed      # Seed database with test data
```

### Code Quality

```bash
npm run lint         # Run ESLint
```

### Test Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Seller | joao.silva@email.com | senha123 |
| Seller | maria.santos@email.com | senha123 |
| Seller | pedro.oliveira@email.com | senha123 |
| Seller | ana.ferreira@email.com | senha123 |
| Buyer | comprador@email.com | senha123 |

---

## 11. Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── seller/       # Seller API
│   ├── cart/             # Shopping cart
│   ├── login/            # Login page
│   ├── orders/           # Buyer orders
│   ├── products/         # Product catalog
│   ├── profile/          # User profile
│   ├── register/         # Registration
│   ├── seller/           # Seller area
│   │   └── orders/       # Seller orders
├── actions/               # Server Actions
├── components/            # React components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── messages.ts       # Localization
│   └── prisma.ts         # Prisma client
└── types/                # TypeScript definitions
```

---

## 12. Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/semeiars"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 13. Roadmap

### v0.1.0 - MVP (Current)
- [x] Authentication
- [x] Product catalog
- [x] Shopping cart
- [x] Order management
- [x] Design system
- [x] Portuguese localization
- [ ] Image upload

### v1.0 - Family Farming
- [ ] Payment integration (AbacatePay + PagSeguro)
- [ ] Split system between sellers
- [ ] Farmer validation
- [ ] Seller dashboard
- [ ] Sales reports

### v2.0 - Expansion
- [ ] Review/rating system
- [ ] Buyer-seller chat
- [ ] Messaging system
- [ ] Invoice generation
