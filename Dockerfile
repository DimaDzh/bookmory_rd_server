# ---------- shared deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm i --no-frozen-lockfile

# ---------- dev stage ----------
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 3030
CMD ["pnpm", "start:dev"]

# ---------- prod stage ----------
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm dlx prisma generate
RUN pnpm build

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache netcat-openbsd
RUN npm i -g pnpm
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
# Generate Prisma client in production stage
RUN pnpm dlx prisma generate
EXPOSE 3030
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
