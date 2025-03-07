FROM nginx:1.20-alpine

# Add a non-root user to run nginx
RUN addgroup -g 101 -S nginx \
    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions for config files
RUN chown -R nginx:nginx /etc/nginx \
    && chmod -R 644 /etc/nginx/nginx.conf \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Remove default configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Update packages and minimize attack surface
RUN apk update \
    && apk upgrade \
    && apk add --no-cache curl \
    && rm -rf /var/cache/apk/*

# Expose port 8080
EXPOSE 8080

# Set up health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

