FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY nest-cli.json ./
RUN npm install
COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
