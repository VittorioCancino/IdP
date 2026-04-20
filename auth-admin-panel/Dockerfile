FROM oven/bun:1.3.10 AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

RUN bun run postinstall
RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]
