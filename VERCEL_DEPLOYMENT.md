# 🚀 How to Host Flowdesk on Vercel

This guide walks you through deploying **Flowdesk** to Vercel with a production PostgreSQL database (Neon, Supabase, or Railway).

---

## Step 1: Create a PostgreSQL Database (Free)

Flowdesk uses PostgreSQL in production.

1. Go to [Neon.tech](https://neon.tech) (recommended serverless Postgres for Vercel) or [Supabase.com](https://supabase.com).
2. Sign up and click **Create Project**.
3. Name your project `flowdesk`.
4. Copy the **Connection String** (it will look like this):
   ```text
   postgresql://alex:abc123xyz@ep-cool-pool-123456.us-east-2.aws.neon.tech/flowdesk?sslmode=require
   ```

---

## Step 2: Push Code to GitHub

1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial Flowdesk commit"
   ```
2. Create a repository on [GitHub](https://github.com/new) named `flowdesk`.
3. Push your code:
   ```bash
   git remote add origin https://github.com/your-username/flowdesk.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New > Project**.
2. Select your `flowdesk` GitHub repository.
3. Framework Preset: **Next.js**.

---

## Step 4: Configure Environment Variables in Vercel

Under **Environment Variables** in the Vercel deployment screen, add the following 4 variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your Neon / PostgreSQL connection string from Step 1 |
| `AUTH_SECRET` | `a-random-32-character-secret-key` | Random secret key for session encryption |
| `AUTH_URL` | `https://your-project.vercel.app` | Your Vercel domain |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Your Vercel domain |

---

## Step 5: Configure Build Command & Deploy

In Vercel **Build & Development Settings**:

- **Build Command**: 
  ```bash
  npx prisma db push && next build
  ```
  *(This automatically creates all database tables in Neon when Vercel builds the app!)*

- Click **Deploy**.

---

## Step 6: Seed Production Data (Optional)

To seed demo users and sample projects into your live database, run:

```bash
DATABASE_URL="your-neon-postgres-url" npx tsx prisma/seed.ts
```

Your live Flowdesk app is now deployed and ready at `https://your-project.vercel.app`! 🎉
