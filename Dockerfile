# Multi-stage build: compila frontend + servidor Node
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
# Compila o servidor TypeScript para dist-server/
RUN npx tsc -p tsconfig.server.json

# Runtime stage
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 3000

CMD ["node", "dist-server/index.js"]
