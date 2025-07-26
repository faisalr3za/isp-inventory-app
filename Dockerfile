# Use Node.js 18 LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install system dependencies for canvas and image processing
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    gcc \
    g++ \
    make \
    python3

# Copy package files
COPY backend/package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy app source
COPY backend/ .

# Create upload directories
RUN mkdir -p uploads/barcodes uploads/qrcodes uploads/stickers

# Set proper permissions
RUN chmod -R 755 uploads/

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
