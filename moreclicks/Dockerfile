# ---------- BASE ----------
    FROM node:20-slim AS base

    # Required system deps for Prisma
    RUN apt-get update && apt-get install -y \
      openssl \
      ca-certificates \
      && rm -rf /var/lib/apt/lists/*
    
    # ---------- DEPS ----------
    FROM base AS deps
    WORKDIR /app
    
    COPY package.json package-lock.json* ./
    RUN npm ci
    
    # ---------- BUILDER ----------
    FROM base AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # Generate Prisma Client
    RUN npx prisma generate
    
    # Build Next.js
    # Force webpack usage by using --webpack flag (Turbopack causes build errors)
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production
    # Use --webpack flag to explicitly disable Turbopack and use webpack
    RUN npx next build --webpack
    
    # ---------- RUNNER ----------
    FROM base AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN useradd -m nextjs
    
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    
    USER nextjs
    
    EXPOSE 3000
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    CMD ["node", "server.js"]
    