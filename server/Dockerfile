FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies first (including devDependencies for build)
RUN npm ci

COPY . .

# Build TypeScript and resolve path aliases
RUN npm run build

# Remove devDependencies after build
RUN npm prune --omit=dev

# Install curl for health check
RUN apk add --no-cache curl

RUN addgroup -g 1001 -S easyride_user
RUN adduser -S easyride_user -u 1001
USER easyride_user

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]