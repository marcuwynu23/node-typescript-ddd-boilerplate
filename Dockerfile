# Base Stage
FROM node:22-alpine AS base
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init
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
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
RUN chown -R node:node /app
USER node
EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]


# Production Stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    chown -R node:node /app && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=builder --chown=node:node /app/dist ./dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
