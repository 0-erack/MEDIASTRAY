# backend/Dockerfile

FROM ghcr.io/pnpm/pnpm:latest
RUN pnpm runtime set node 22 -g

WORKDIR /usr/src/app


COPY . .
RUN pnpm install --frozen-lockfile


WORKDIR /usr/src/app
COPY frontend/dist ./frontend/dist

EXPOSE 443

RUN pnpm run build

CMD pnpm exec drizzle-kit push && node dist/server.js