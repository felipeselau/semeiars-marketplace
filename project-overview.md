# Project Overview — C2C E-commerce Platform (MVP / POC 1)

1. Introduction

This project proposes the development of a Consumer-to-Consumer (C2C) E-commerce platform aimed at validating the complete digital buying and selling experience between users using a modern web technology stack.

In future iterations, the platform will be extended with specific business rules to support family farmers in the state of Rio Grande do Sul (Brazil), promoting digital inclusion, direct commerce, and the appreciation of local production.

The first Proof of Concept (POC 1) focuses on building a fully functional generic e-commerce system, without applying agricultural, fiscal, or regulatory rules at this stage.

⸻

2. Objective of the MVP (POC 1)

The main objective of this MVP is to technically validate the following features:
• User authentication and authorization
• Product management
• Shopping cart and checkout flow
• Order management
• Image upload and storage
• Responsive and accessible user interface
• Data persistence
• Role-based access control

The MVP does not focus on branding, payment processing, or fiscal compliance.

⸻

3. Technology Stack

3.1 Frontend & Backend (Fullstack Framework)
• Next.js (App Router) — fullstack React framework
• TypeScript — static typing and code reliability
• Server Actions / API Routes — backend logic and endpoints
• React Server Components (RSC) — performance optimization

⸻

3.2 Database & ORM
• PostgreSQL — relational database
• Prisma ORM — database modeling and access layer

⸻

3.3 Authentication & Security
• NextAuth/Auth.js — authentication system
• JWT / Session-based authentication
• Password hashing (bcrypt)
• CSRF protection
• Input validation (Zod)

⸻

3.4 Styling & UI
• Tailwind CSS — utility-first styling
• shadcn/ui — component library
• Radix UI — accessibility primitives
• Responsive design (mobile-first)

⸻

3.5 Image Storage
• Firebase Storage or Amazon S3
• Image URL persistence in database

⸻

3.6 State & Data Fetching
• Server Components + Server Actions
• Optional: TanStack Query for client-side caching

⸻

4. Scope of the MVP (Features)

4.1 User Management
• User registration
• Login and logout
• Profile management
• User roles:
• Buyer
• Seller (any authenticated user can become a seller)

Initial user fields:
• Name
• Email
• Password
• Phone (optional)
• Address (basic information)
• Role

⸻

4.2 Product Management
• Full CRUD operations (Create, Read, Update, Delete)
• Product attributes:
• Name
• Description
• Base price
• Current price
• Available quantity
• Category
• Product image URL
• Seller (User)

⸻

4.3 Product Catalog
• Product listing page
• Search by product name
• Filter by category
• Product details page

⸻

4.4 Shopping Cart
• Add product to cart
• Remove product from cart
• Update product quantity
• Persistent cart (database or session)
• View cart contents

⸻

4.5 Orders (Checkout)
• Order creation
• Purchase summary
• Order status:
• Pending
• Confirmed
• Cancelled

Note: No real payment gateway integration is included in the MVP.

⸻

4.6 Image Upload
• Product image upload to cloud storage (Firebase or S3)
• Secure public access URL saved in the database

⸻

5. Non-Functional Requirements
   • Responsive and accessible user interface
   • Organized and scalable codebase
   • Feature-based project structure
   • MVC-inspired architecture adapted to Next.js
   • Basic security measures:
   • Encrypted passwords
   • Protected routes
   • Server-side validation
   • Basic logging and error handling
   • Acceptable response time (under 2 seconds in local environment)

⸻

6. System Architecture

6.1 Application Architecture
• Frontend: Next.js (React Server Components + Client Components)
• Backend: Next.js Server Actions and API Routes
• Database: PostgreSQL with Prisma ORM
• Storage: Cloud image storage
• Authentication: Auth.js (NextAuth)

Architecture style:
• Monorepo fullstack
• Feature-based modularization
• Separation between UI, domain logic, and data access layers

⸻

6.2 Core Entities (Data Model)
• User
• Product
• Category
• Order
• OrderItem
• Cart
• Image

Relationships:
• User hasMany Products
• User hasMany Orders
• Order hasMany OrderItems
• Product belongsTo User
• Product belongsTo Category

⸻

7. User Flow (MVP)
   1. User registers in the system
   2. User logs in
   3. User creates a product for sale
   4. Another user accesses the product catalog
   5. User adds a product to the shopping cart
   6. User completes the order
   7. The order is stored in the database

⸻

8. MVP Limitations

The MVP does not include:
• Fiscal or tax rules
• Branding and visual identity
• Reputation or rating system
• Real payment gateway integration
• Logistics or delivery system

⸻

9. Evolution Roadmap

Version 1 — MVP (POC 1)
• Fully functional generic C2C e-commerce platform

Version 2 — Family Farming Business Rules
• Farmer validation system
• Seller dashboard (CRM)
• Production control
• Sales and performance reports
Version 3 — Branding and UX
• Visual identity
• UX adapted for rural and low-connectivity users

Version 4 — Fiscal and Legal Compliance
• Invoice generation
• Tax rules
• Fiscal reports

⸻

10. Academic Context

This project is developed as part of a Final Graduation Project (TCC) with the purpose of applying modern software engineering concepts such as:
• Fullstack architecture with Next.js
• Database modeling with Prisma
• Secure authentication systems
• Modular project organization
• Web performance optimization
• Clean code and scalability
• Incremental software evolution

The MVP serves as a technical foundation for future domain-specific extensions targeting the agricultural sector.

⸻
