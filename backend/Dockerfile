# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
