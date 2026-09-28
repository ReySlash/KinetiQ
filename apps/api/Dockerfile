# syntax=docker/dockerfile:1
# Node.js 24, matching the repository's reviewed base image.
ARG NODE_IMAGE=node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553

FROM ${NODE_IMAGE} AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends --yes ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma apps/api/prisma

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

ARG COMMIT_SHA=unknown
ARG SENTRY_ORG
ARG SENTRY_PROJECT=kinetiq-api
ARG UPLOAD_SENTRY_SOURCEMAPS=false

COPY apps/api apps/api

# Always generate Prisma from the source/schema inside Docker.
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build
RUN --mount=type=secret,id=sentry_auth_token \
  if [ "${UPLOAD_SENTRY_SOURCEMAPS}" = "true" ]; then \
    test -n "${SENTRY_ORG}"; \
    test -n "${SENTRY_PROJECT}"; \
    test "${COMMIT_SHA}" != "unknown"; \
    test -s /run/secrets/sentry_auth_token; \
    export SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)"; \
    export SENTRY_ORG="${SENTRY_ORG}"; \
    export SENTRY_PROJECT="${SENTRY_PROJECT}"; \
    export COMMIT_SHA="${COMMIT_SHA}"; \
    pnpm --filter api sentry:sourcemaps; \
  fi; \
  find apps/api/dist -type f -name '*.map' -delete

FROM base AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma apps/api/prisma

RUN pnpm install \
  --frozen-lockfile \
  --prod \
  --filter api... \
  --ignore-scripts

FROM base AS runtime

ARG COMMIT_SHA=unknown

ENV NODE_ENV=production
ENV PORT=3000
ENV COMMIT_SHA=${COMMIT_SHA}

WORKDIR /app

COPY --from=production-dependencies --chown=node:node \
  /app/package.json ./package.json

COPY --from=production-dependencies --chown=node:node \
  /app/node_modules ./node_modules

COPY --from=production-dependencies --chown=node:node \
  /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=build --chown=node:node \
  /app/apps/api/dist ./apps/api/dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/api/dist/src/main.js"]
