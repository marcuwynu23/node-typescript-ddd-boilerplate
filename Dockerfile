# Base Stage
FROM node:22-alpine AS base
RUN apk upgrade --no-cache
WORKDIR /app


# Builder Stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
RUN npm rebuild esbuild
COPY . .
RUN npm run build

# Development Stage
FROM base AS development
# Set development environment
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]


# Production Stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
