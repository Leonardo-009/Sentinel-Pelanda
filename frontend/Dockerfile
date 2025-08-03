# Dockerfile de produção robusto para frontend Next.js
FROM node:18-alpine AS base

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copiar código fonte e buildar Next.js
COPY . .
RUN npm run build

# Imagem final enxuta
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"] 