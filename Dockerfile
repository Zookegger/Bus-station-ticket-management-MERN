FROM node:22-alpine

WORKDIR /app

# Install deps for both
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN cd server && npm ci && cd ../client && npm ci

# Copy sources
COPY server/ ./server/
COPY client/ ./client/

# Build server (TypeScript)
RUN cd server && npm run build

# Build client
RUN cd client && npm run build

RUN mkdir -p server/public
RUN cp -r client/build/* server/public

EXPOSE 3000 5000

CMD [""]