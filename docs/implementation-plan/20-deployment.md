# Deployment

## Purpose and target architecture

Deploy a repeatable Docker-based system to an Oracle Cloud VPS. Nginx terminates/proxies HTTPS traffic to separate Next.js and NestJS containers. PostgreSQL may initially be a Compose service or an external managed service; public media should use object storage.

```text
Internet -> Oracle firewall -> Nginx :80/:443
                              ├-> web:3000 (private network)
                              └-> api:3001 (private network)
API -> postgres:5432 (private Compose network or TLS external)
API -> S3-compatible object storage
```

Only ports 80/443 and tightly controlled SSH are public. Database, web, and API container ports are not exposed publicly.

## Dockerfiles and Compose

Use multi-stage Dockerfiles with pinned Node major and lockfile-enforced `pnpm install --frozen-lockfile`. Build Next.js standalone output and NestJS production output. Runtime images run as non-root, contain no development tools/secrets, have read-only filesystem where feasible, and write only to explicit temporary/storage mounts.

Maintain:

- `compose.dev.yml`: web/API hot reload, PostgreSQL, optional local object storage, named volumes
- `compose.test.yml`: isolated PostgreSQL and application/test services as needed
- `compose.prod.yml`: pinned image tags, restart policy, health checks, private network, resource/log limits

Do not bake `.env` into images. Use server-side protected environment files or a secret manager if available. Pin production images by immutable tag/commit SHA, not `latest`.

## Environment variables

At minimum: environment, public/app/API origins, database URL(s), Better Auth URL/secret/trusted origins, cookie settings, admin bootstrap controls, storage provider/endpoint/region/bucket/credentials/public base URL, upload limits, log level, and optional error-reporting DSN. Provide `.env.example` with descriptions and startup validation but no live values.

## Development workflow

One documented command starts dependencies and apps. Migrations and reference seeds are separate explicit commands. Developers can use local disk storage through the adapter or an S3 emulator; local disk must use a repository-ignored named directory/volume. A fresh clone workflow should include install, environment copy, Compose start, migrate, seed, and test.

## Production database options

### PostgreSQL in Docker on the VPS

Pros: cheapest, simplest billing/networking, complete version control. Cons: the app and database share a failure domain; upgrades, monitoring, disk capacity, backups, restore, and high availability are the developer’s responsibility.

If chosen, use a dedicated persistent block volume, no public port, daily encrypted off-host logical backups, periodic volume snapshots, resource reservations, disk alerts, and restore drills. Compose volume alone is not a backup.

### External managed PostgreSQL

Pros: independent failure domain, managed patching/backups/PITR depending on provider, easier recovery. Cons: cost, latency/egress, regional availability, connection/TLS setup, and provider limits.

Recommendation: use managed PostgreSQL when an affordable nearby provider offers automated backups/PITR. For a low-cost private beta, Compose is acceptable only with off-host backups and tested recovery from day one. Document the chosen recovery point/time objectives.

## Nginx and HTTPS

Nginx redirects HTTP to HTTPS, proxies `/api/v1` and Better Auth paths consistently to API, proxies remaining requests to web, forwards request ID and standard proxy headers, applies request/upload limits, timeouts, security headers, and rate limits where useful. Trust forwarded headers only from Nginx/private networks.

Certbot obtains/renews certificates using the Nginx or webroot flow. Test automated renewal and reload. Keep port 80 available for ACME/redirect. Add HSTS only after HTTPS/domain behavior is proven.

## CI workflow

On pull request: install locked dependencies, lint, typecheck, unit/component tests, start PostgreSQL, apply migrations, integration/API tests, build images/apps, and run critical Playwright where practical. Scan dependencies/images and optionally generate an SBOM.

On main/release: build images once, tag with commit SHA, push to registry, deploy the same digests to staging then production after checks. Never rebuild differently on the VPS.

## Deployment workflow

1. Confirm current backup and disk capacity.
2. Pull immutable images and configuration.
3. Run backward-compatible migrations as a one-off job with migration credentials.
4. Start/update API and web; wait for readiness.
5. Run smoke tests through public HTTPS.
6. Record deployed SHA, migration, operator, and time.
7. Remove old images only after rollback window.

For a single VPS, brief rolling-container downtime may be acceptable initially; state the target. A two-color Compose setup can reduce downtime but adds proxy/orchestration complexity.

## Rollback

Application rollback redeploys the previous immutable image if schema remains backward compatible. Database rollback is not an automatic reverse migration; use forward fixes, or restore a verified backup only for severe data loss with an explicit incident procedure. Expand/contract migrations keep at least the prior app compatible during the release window.

## Health checks and smoke tests

`/api/v1/health/live` checks process liveness; `/ready` checks database and critical initialization with tight timeouts. Web has a simple health route. Compose health checks do not call external object storage on every probe. Deployment smoke covers public exercise list, auth page, an authenticated minimal API call, and storage presentation if enabled.

## Image storage

Production uses S3-compatible object storage with least-privilege credentials, lifecycle/orphan rules, CORS if direct uploads later, and separate staging/production buckets or prefixes. Local VPS filesystem is not recommended for durable public assets.

## Definition of done

A new VPS can be provisioned from documented steps; images are immutable/non-root; secrets stay outside images/repo; migrations/seeds are repeatable; HTTPS renews; only intended ports are open; health/smoke checks pass; backup restore is demonstrated; and application rollback is rehearsed.

## Open questions

Choose domain/DNS, container registry, CI provider, staging topology, database provider, storage provider, acceptable downtime, and RPO/RTO. Recommended starting targets for a private MVP: RPO 24 hours, RTO 4 hours, tightened when active user value grows.

