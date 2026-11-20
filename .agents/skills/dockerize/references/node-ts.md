# Node.js & TypeScript Containerization

Dense adapter for Node.js, Express, and NestJS services.

## Multi-Stage Production Build

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# pnpm: RUN corepack enable && pnpm install --frozen-lockfile
# bun:  RUN bun install --frozen-lockfile
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Critical Traps & Rules

1. **Native Modules (`bcrypt`, `sharp`):** Use `node:22-slim` with build tools, or add `RUN apk add --no-cache python3 make g++` in alpine.
2. **Entrypoint Matching:** Check `tsconfig.json` `outDir`:
   - Express standard: `CMD ["node", "dist/index.js"]` (or `dist/server.js`)
   - NestJS standard: `CMD ["node", "dist/main.js"]`
3. **Module Resolution:** If `"type": "module"` is in `package.json`, ensure `package.json` is copied into the runner stage.
4. **Host Binding:** Ensure Express/NestJS server listens on `0.0.0.0` (e.g. `app.listen(PORT, '0.0.0.0')`), NOT `127.0.0.1` or `localhost`.
5. **Process Signals:** Always use exec-form `CMD ["node", "..."]` so `SIGTERM` forwards correctly to Node for graceful shutdown.
