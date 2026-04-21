# Stage 1: Build stage
FROM node:22-alpine AS builder

# Upgrade all OS packages to patch known CVEs
RUN apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source and build script
COPY . .

# Build the project
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runner

# Upgrade all OS packages to patch known CVEs
# Fixes: libcrypto3/libssl3 (CVE-2025-15467, CVE-2025-69421, etc.),
#         musl/musl-utils (CVE-2026-40200), zlib (CVE-2026-22184),
#         busybox/ssl_client (CVE-2024-58251, CVE-2025-46394)
RUN apk upgrade --no-cache

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the bundled application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (defaulting to 3000 as per src/index.ts)
EXPOSE 3000

# Start the application using the production command
CMD ["npm", "start"]
