# Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage - menggunakan Alpine yang sangat ringan
FROM node:18-alpine AS production

# Install minimal system dependencies
RUN apk add --no-cache \
    dumb-init \
    && apk del --purge apk-tools \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Copy built application
COPY --from=builder --chown=appuser:appuser /app/dist ./dist

# Copy database files for migrations
COPY --from=builder --chown=appuser:appuser /app/database ./database
COPY --from=builder --chown=appuser:appuser /app/knexfile.ts ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check dengan timeout yang lebih cepat
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
