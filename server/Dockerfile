# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    # Check for known vulnerabilities in dependencies
    npm audit --production && \
    # Remove npm cache to keep image small
    npm cache clean --force

# Stage 2: Runtime
FROM node:18-alpine

# Set up security hardening
RUN apk update && \
    apk upgrade && \
    # Add security patches and cleanup
    apk add --no-cache dumb-init && \
    # Set proper permissions
    addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /bin/sh -D nodejs && \
    # Create app directory and set permissions
    mkdir -p /app && \
    chown -R nodejs:nodejs /app

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Set working directory
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy app source
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose WebSocket port
EXPOSE 3000

# Health check to ensure the application is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "index.js"]

