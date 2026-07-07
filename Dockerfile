# Multi-stage build: compila frontend + backend separadamente
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npx vite build

FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=frontend-builder /app/frontend/dist ./dist
COPY --from=backend-builder /app/backend/dist-server ./dist-server

EXPOSE 3000

CMD ["node", "dist-server/index.js"]
