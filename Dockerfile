# SoundCY production image. Needs Node >= 22.13 (built-in SQLite).
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Database + uploaded photos live here — attach a persistent volume at /app/data
# (Railway: service → Settings → Volumes; mount path /app/data). Runs as root so the
# mounted volume is writable on hosts like Railway.
ENV DATABASE_PATH=/app/data/soundcy.db
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "--no-warnings=ExperimentalWarning", "server.js"]
