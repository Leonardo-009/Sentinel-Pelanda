# Dockerfile de produção simplificado e robusto para backend Express.js
FROM node:18-alpine AS base

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copiar código fonte e compilar TypeScript
COPY . .
RUN npm run build

# Imagem final enxuta
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

# Copiar apenas o build e dependências
COPY --from=base --chown=nodejs:nodejs /app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3001

CMD ["node", "dist/server.js"] 