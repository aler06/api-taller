# Etapa de construcción
FROM node:22.17.1-alpine AS builder

LABEL maintainer="QuizifyAPI"
LABEL version="0.9.1-dev"
LABEL description="Quizify API - NestJS Application with Universal CORS"

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

# Etapa de producción
FROM node:22.17.1-alpine AS production

RUN apk add --no-cache dumb-init curl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
RUN mkdir -p logs && \
    chown -R nestjs:nodejs logs

ENV NODE_ENV=production

USER nestjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3010/api/v1/docs || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]