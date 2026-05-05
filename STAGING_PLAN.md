# Staging Environment Plan — SemeiaRS

## Overview

| Component      | Production                 | Staging                              |
| -------------- | -------------------------- | ------------------------------------ |
| **Git branch** | `main`                     | `staging`                            |
| **Vercel URL** | `semeiars.com.br`          | `staging.semeiars.com.br`            |
| **Database**   | Neon production branch     | Neon `staging` branch (copy of prod) |
| **Auth**       | Separate `NEXTAUTH_SECRET` | Separate `NEXTAUTH_SECRET`           |

---

## Step 1: Create Neon Staging Branch

Use the Neon CLI or dashboard to create a branch from your production database:

```bash
# Install Neon CLI if not already
npm install -g neonctl

# Authenticate
neonctl auth

# List your projects to get the project ID
neonctl projects list

# Create a staging branch (instant, copies schema + data from production)
neonctl branches create --project-id <YOUR_PROJECT_ID> --name staging

# Get the connection string for the staging branch
neonctl connection-string --project-id <YOUR_PROJECT_ID> --branch staging
```

This gives you a new `DATABASE_URL` for staging. The branch starts as an exact copy of production data and schema. You can reset it anytime from the Neon dashboard (Branch → Reset → from parent).

---

## Step 2: Create `.env.example`

Create a `.env.example` file (safe to commit) so the env vars are documented:

```
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# AbacatePay
ABACATEPAY_API_KEY=""
ABACATEPAY_WEBHOOK_SECRET=""
ABACATEPAY_ENV="sandbox"

# PagSeguro
PAGSEGURO_EMAIL=""
PAGSEGURO_TOKEN=""
PAGSEGURO_WEBHOOK_SECRET=""
PAGSEGURO_ENV="sandbox"

# Encryption
PIX_ENCRYPTION_KEY=""
MOCK_PAYMENTS="true"
NEXT_PUBLIC_MOCK_PAYMENTS="true"
```

---

## Step 3: Configure Vercel Branch Deployment

In the Vercel dashboard for your project:

1. **Add custom domain**: Go to Settings → Domains → Add `staging.semeiars.com.br`
2. **Configure DNS**: Add a CNAME record for `staging` pointing to `cname.vercel-dns.com` at your DNS provider
3. **Set branch-specific env vars**: Go to Settings → Environment Variables, and for each variable, set a **staging branch** override:

| Variable                    | Value (staging)                           |
| --------------------------- | ----------------------------------------- |
| `DATABASE_URL`              | Neon staging branch connection string     |
| `NEXTAUTH_SECRET`           | A new random secret (different from prod) |
| `NEXTAUTH_URL`              | `https://staging.semeiars.com.br`         |
| `ABACATEPAY_ENV`            | `sandbox`                                 |
| `MOCK_PAYMENTS`             | `true`                                    |
| `NEXT_PUBLIC_MOCK_PAYMENTS` | `true`                                    |

4. **Link branch to domain**: In Settings → Git, ensure the `staging` branch deploys to the `staging.semeiars.com.br` domain.

---

## Step 4: Create `staging` Git Branch

```bash
git checkout -b staging
git push -u origin staging
```

Vercel will automatically trigger a deployment of the `staging` branch to `staging.semeiars.com.br`.

---

## Step 5: Add Staging Visual Indicator

Add a small non-intrusive banner to `src/app/layout.tsx` when `NEXT_PUBLIC_MOCK_PAYMENTS=true` (only true in staging/dev):

```tsx
{
  process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true' && (
    <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
      ⚠ Ambiente de Staging — Dados de teste
    </div>
  )
}
```

This makes it immediately obvious when you're on staging vs production.

---

## Step 6: Add Database Reset Scripts

Add convenience scripts to `package.json`:

```json
"scripts": {
  "db:reset": "npx prisma migrate reset --force --skip-generate",
  "db:reset:seed": "npx prisma migrate reset --force --skip-generate && npm run db:seed"
}
```

Usage: run locally with `DATABASE_URL` pointing to the staging Neon branch, or trigger from Neon dashboard (Reset branch from parent).

---

## Workflow Summary

**Day-to-day usage:**

1. Make changes on `staging` branch (or feature branches merged into staging)
2. Push to remote → Vercel auto-deploys to staging.semeiars.com.br
3. Test with real-ish data on the staging DB
4. Mess with data freely (it's a Neon branch, reset anytime)
5. When satisfied, merge staging → main for production deploy

**Reset staging data to match production:**

- Neon Dashboard → Branches → `staging` → Reset → "Reset from parent"
- Or locally: `DATABASE_URL=<staging-url> npm run db:reset:seed`

---

## Files to Create/Modify

| File                 | Action | Purpose                                    |
| -------------------- | ------ | ------------------------------------------ |
| `.env.example`       | Create | Document required env vars                 |
| `package.json`       | Modify | Add `db:reset` and `db:reset:seed` scripts |
| `src/app/layout.tsx` | Modify | Add staging banner indicator               |

## External Steps (Manual)

1. Create Neon staging branch via CLI or dashboard
2. Configure Vercel environment variables for the `staging` branch
3. Add `staging.semeiars.com.br` domain in Vercel
4. Add CNAME DNS record for `staging` subdomain
5. Push `staging` branch to trigger first deploy

---

Estimated time: ~30 minutes. The Neon branch is instant. Vercel deployment takes 1-2 minutes. DNS propagation can take up to 48 hours but usually works within minutes.
