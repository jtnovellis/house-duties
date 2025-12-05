# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.19.0

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and configuration
COPY . .

# Generate Prisma Client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@10.19.0

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies (including prisma for runtime migrations)
RUN pnpm install --prod --frozen-lockfile && pnpm add prisma --save-dev

# Generate Prisma Client (needs to be done after install due to pnpm structure)
# Use a dummy DATABASE_URL as it's not needed for generation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm exec prisma generate

# Change ownership to non-root user
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port (if needed in future for web interface)
# EXPOSE 3000

# Health check (optional - checks if node is running)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]

# Default command (can be overridden)
CMD ["--help"]
