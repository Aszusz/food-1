FROM oven/bun:1.3.11

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contract/package.json packages/contract/package.json
COPY packages/db/package.json packages/db/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
COPY packages/contract packages/contract
COPY packages/db packages/db

EXPOSE 3000
CMD ["bun", "--cwd", "apps/api", "src/index.ts"]
