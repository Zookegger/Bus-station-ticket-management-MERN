# Multi-stage build for React app
FROM node:22-alpine AS build_stage

# Set working directory
WORKDIR /app

# Copy client package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy client source code
COPY . .

# Build React app for production
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production_stage

# Install curl for health check
RUN apk add --no-cache curl

# Copy built React files to Nginx
COPY --from=build_stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S easyride_user
RUN adduser -S easyride_user -u 1001

# Expose port 3000 (or 80 for standard HTTP)
EXPOSE 3000

# Health check for Nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]