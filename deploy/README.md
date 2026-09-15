# Closed-beta deployment runbook

## Current production topology

KinetiQ's closed beta uses:

- `https://kinetiq.reyslash.com`: Next.js frontend hosted by Vercel;
- `https://api.kinetiq.reyslash.com`: Dockerized NestJS API on Oracle Cloud;
- Neon PostgreSQL as the production database;
- Nginx and Certbot on the VPS for the API hostname.

The browser calls same-origin `/api`. Vercel executes the rewrite configured in
`apps/web/next.config.ts` and forwards the request to the server-only
`API_PROXY_URL`. The API hostname is still publicly routable, so protected API
routes must always enforce authentication, roles, and ownership; CORS is not an
authorization boundary.

The repository's `compose.prod.yml` can still build both services for local
production validation or a future self-hosted web deployment. The current beta
deploys only the API container to Oracle; Vercel builds and runs the web app.

The checked-in `deploy/nginx/kinetiq.conf` still represents the earlier
single-host web/API layout and must not be copied over the working VPS
configuration. Synchronizing that template with the API-only production host
is an outstanding repository task.

## Release workflow

1. Merge tested work from `dev` into `main` through review.
2. Confirm GitHub Actions passes on the reviewed `main` commit.
3. Let Vercel deploy the frontend from that commit with:
   - `NEXT_PUBLIC_SITE_URL=https://kinetiq.reyslash.com`
   - `NEXT_PUBLIC_API_URL=https://kinetiq.reyslash.com`
   - `API_PROXY_URL=https://api.kinetiq.reyslash.com`
4. On the VPS, fetch and check out the same reviewed SHA.
5. Apply Prisma migrations to Neon with production credentials.
6. Build and restart the API image with `COMMIT_SHA` set to that SHA.
7. Verify private-container and public HTTPS health endpoints.
8. Run the closed-beta acceptance journey and record the deployed SHA and
   migration state.

Never deploy an arbitrary working tree or edit `main` directly on the VPS.
Production fixes made during an incident must be committed, pushed, reviewed,
and merged back into `dev` so Git remains authoritative.

## API host configuration

Keep the API container bound to loopback and expose only restricted SSH, 80,
and 443 through the Oracle firewall. Nginx terminates HTTPS for
`api.kinetiq.reyslash.com`, forwards request IDs and standard proxy headers,
and applies request-size, timeout, security-header, and rate-limit policy.

Validate changes before reload:

```sh
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

## Production configuration

Keep production values outside Git. The VPS API requires `NODE_ENV`, `PORT`,
`WEB_ORIGIN`, Neon `DATABASE_URL`, `BETTER_AUTH_URL`, a high-entropy
`BETTER_AUTH_SECRET`, Resend configuration, and `COMMIT_SHA`. Vercel owns the
three web variables listed above. Production, CI, and local credentials must
remain separate.

## Database migrations

Use a dedicated Neon production database with TLS and a least-privileged role.
Enable and verify Neon automated backups/PITR. From the reviewed checkout, run:

```sh
pnpm install --frozen-lockfile
pnpm --filter api prisma:migrate:deploy
```

Use only the reviewed, idempotent reference-data initialization procedure.
Never run `prisma migrate dev`, database reset commands, or destructive seeds
against production.

## Verification

On the VPS:

```sh
curl --fail http://127.0.0.1:3000/api/health/live
curl --fail http://127.0.0.1:3000/api/health/ready
```

From outside the VPS:

```sh
curl --fail https://api.kinetiq.reyslash.com/api/health/live
curl --fail https://api.kinetiq.reyslash.com/api/health/ready
curl --fail https://kinetiq.reyslash.com/health
```

Also verify signup, verification email, sign-in/out, public reference reads,
owner-scoped routines/programs/workouts/analytics, important images, responsive
layouts, and safe production errors.

## Rollback

Vercel retains frontend deployments that can be promoted for rollback. For the
API, keep the previous reviewed SHA/image available, check it out on the VPS,
rebuild/restart the API service, and repeat the health and smoke checks.
Database changes must remain compatible with the previous API during the
rollback window. Prefer a forward database fix; never automatically reverse a
production migration.

## Post-launch work

External encrypted logical backups, monitoring/email alerts, restore rehearsal,
detailed RPO/RTO measurement, exhaustive incident runbooks, automated API
deployment orchestration, and operational dashboards remain post-launch work.
