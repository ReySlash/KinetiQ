# Deployment

## Documented closed-beta architecture

The planned closed-beta topology has three independently operated services:

```text
Browser
  └─ https://kinetiq.reyslash.com (Vercel / Next.js)
       └─ /api rewrite
            └─ https://api.kinetiq.reyslash.com (Nginx / Oracle VPS)
                 └─ Dockerized NestJS API
                      └─ Neon PostgreSQL over TLS
```

Vercel is the only web host. Oracle runs the API container, not the production
Next.js frontend. Nginx and Certbot terminate HTTPS for the API hostname. The
API binds to loopback on the VPS; only restricted SSH, 80, and 443 should be
publicly reachable.

The API hostname is intentionally reachable because Vercel must reach it and
public reference endpoints are supported. CORS and origin checks protect
browser behavior but are not authentication. Sessions, roles, owner-scoped
queries, DTO validation, and rate limits remain authoritative for protected
resources.

## Web deployment on Vercel

Vercel builds `apps/web` from a reviewed `main` commit. Production variables:

- `NEXT_PUBLIC_SITE_URL=https://kinetiq.reyslash.com`
- `NEXT_PUBLIC_API_URL=https://kinetiq.reyslash.com`
- `API_PROXY_URL=https://api.kinetiq.reyslash.com`

`API_PROXY_URL` is server-only. Next.js rewrites `/api/:path*` to the Oracle API
without placing the backend origin into application request code. Rewrites do
not replace API authentication or authorization.

Vercel deployment history provides frontend rollback. Preview deployments must
use non-production credentials or be excluded from production trusted origins.

## API packaging and VPS deployment

The API uses the pinned Node 24 multi-stage Dockerfile. The runtime image
contains production API dependencies, compiled output, and generated Prisma
runtime files; it runs as the non-root `node` user and exposes liveness and
readiness health checks.

Build from a reviewed Git SHA and set `COMMIT_SHA` in runtime metadata. Do not
make long-lived edits directly on the VPS. If an emergency change occurs there,
commit it and merge it back through `main` and `dev` immediately so Git remains
authoritative.

The production Compose file remains useful for API deployment, local image
validation, and a possible future self-hosted frontend. The current Vercel beta
does not run its web service on Oracle.

## Database and migrations

Neon is the production PostgreSQL provider. Use TLS, a least-privileged runtime
role, and appropriate connection pooling. The current free-tier prototype uses
one manually created Neon snapshot before risky changes; recurring provider
backups/PITR and external logical backups are deferred until paid-user
infrastructure is introduced. Apply existing migrations from the reviewed
checkout with `prisma migrate deploy` before starting an API version that
depends on them.

Never use `migrate dev`, reset commands, or destructive seed behavior in
production. Reference-data initialization must be reviewed and idempotent.
Record the deployed SHA and migration state for every release.

## HTTPS and proxy behavior

Nginx redirects HTTP to HTTPS for `api.kinetiq.reyslash.com`, forwards host,
client IP, protocol, and request-ID headers, and applies body-size, timeout,
security-header, and rate-limit policy. Validate Nginx before reload and test
Certbot renewal periodically. Trust forwarded headers only from the local
proxy path.

The checked-in `deploy/nginx/kinetiq.conf` is a reference configuration for a
single-host web/API deployment and is not automatically the active VPS file.
The current beta topology remains Vercel web plus API-only VPS; reconcile the
template with the installed host configuration during the deployment rehearsal
before replacing any live Nginx file.

## CI and release flow

CI runs on pushes to `dev` and `main` and on pull requests. It validates image
optimization, lint, type checking, API unit/E2E tests, web unit/coverage tests,
mocked browser and accessibility journeys, application builds, production
Docker builds, and clean-database migration deployment. Real-API smoke tests
remain conditional on configured credentials.

Release flow:

1. Validate work on `dev`.
2. Merge through review into `main` after required checks pass.
3. Let Vercel deploy the reviewed `main` commit.
4. Check out the same SHA on the VPS, migrate Neon, and rebuild/restart the API.
5. Verify private and public health endpoints.
6. Run the HTTPS acceptance journey and record the release.

Automated API deployment orchestration is deferred until the manual workflow
is stable.

## Health, logs, and rollback

- `/api/health/live` checks the API process.
- `/api/health/ready` checks database readiness with a short timeout.
- `/health` checks the Vercel Next.js application.
- Nginx and the API propagate request IDs; API request logs are structured and
  exclude credentials and request payloads.

Rollback the frontend by promoting a known-good Vercel deployment. Roll back
the API by rebuilding/restarting the previous reviewed SHA, provided migrations
remain backward compatible. Database rollback is not an automatic reverse
migration; prefer a forward fix.

## Readiness gates before beta invitations

Monitoring, email alerts, health checks, bounded logs, and application rollback
remain part of the initial beta baseline. The current prototype has only a few
testers, so automated database backups, isolated restore rehearsal, and formal
RPO/RTO measurement are explicitly deferred. Take a manual Neon snapshot before
Prisma migrations or other risky database changes and record that it is not a
recurring backup guarantee. Revisit full database protection when the product
moves to the planned consolidated Hostinger VPS for paid users. Automated API
deployment and advanced operational dashboards remain deferred.
