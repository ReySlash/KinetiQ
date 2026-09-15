# Closed-Beta Deployment Checklist

This checklist tracks the deployed closed-beta baseline and the operator-side
verification and hardening that still remain:

- Web application: `https://kinetiq.reyslash.com`, hosted on Vercel
- API: `https://api.kinetiq.reyslash.com`, hosted in Docker on Oracle Cloud
- Database: Neon PostgreSQL
- API entry point: Nginx on the Oracle VPS
- Browser API access: same-origin `/api` requests rewritten by Next.js/Vercel
  to the API hostname
- Signup: open, with email verification required
- Recovery objectives: RPO 24 hours and RTO 4 hours
- Operational alerts: email
- Initial release process: manually controlled and pinned to a reviewed Git SHA

## First-beta scope

The closed-beta baseline uses Vercel for the production web runtime and a
separate, right-sized API image on Oracle. The repository retains the web image
and Compose service for production-build validation and possible future
self-hosting; they do not describe the current Vercel runtime. Browser calls
stay same-origin through the Vercel rewrite, while Nginx terminates HTTPS for
the API hostname.

External provisioning remains operator-owned: Vercel, Oracle VPS, DNS, Neon,
Resend, certificates, firewall rules, and branch protection. The unchecked
items below represent verification or post-launch hardening; they must not be
read as evidence that the already-running beta has completed every operational
acceptance gate.

## Production packaging

- [x] Add a production Dockerfile for the API.
- [x] Add a production Dockerfile for the web application.
- [x] Enable the Next.js standalone production output.
- [x] Install dependencies with `pnpm install --frozen-lockfile`.
- [x] Run both containers as non-root users.
- [x] Exclude secrets and `.env` files from container images.
- [x] Tag production images with an immutable Git SHA.
- [x] Add a production Compose configuration.
- [x] Place application containers on a private network.
- [x] Configure container restart policies.
- [x] Configure CPU and memory limits.
- [x] Configure bounded container log retention and rotation.
- [x] Add container health checks.
- [x] Do not expose a database container or database port publicly.
- [x] Verify that the API starts with `NODE_ENV=production`.

## Domains, Vercel, VPS, reverse proxy, and HTTPS

- [x] Configure `kinetiq.reyslash.com` for the Vercel web deployment.
- [x] Configure `api.kinetiq.reyslash.com` for the Oracle API deployment.
- [x] Provision the Oracle Cloud VPS for the API.
- [x] Deploy the production web application on Vercel.
- [ ] Restrict SSH access to approved operator addresses.
- [ ] Expose only ports 80, 443, and restricted SSH.
- [ ] Keep the API container port inaccessible from the public internet.
- [x] Install and configure Nginx for the API hostname.
- [x] Redirect API HTTP traffic to HTTPS.
- [x] Add the Vercel/Next.js rewrite from same-origin `/api` to the API host.
- [ ] Synchronize the checked-in Nginx template with the working production
      API-host configuration; the repository file still describes the earlier
      single-host web/API layout.
- [x] Configure host, client IP, forwarding, protocol, and request-ID headers.
- [x] Configure upload-size limits and proxy timeouts.
- [x] Configure appropriate security headers.
- [x] Configure basic request limiting.
- [x] Issue TLS certificates for the deployed web and API origins.
- [ ] Test certificate renewal with `certbot renew --dry-run`.
- [ ] Test Nginx configuration validation and reload.

## Production environment and secrets

- [x] Set `NODE_ENV=production` for the deployed API.
- [x] Set the API `PORT`.
- [x] Set `WEB_ORIGIN=https://kinetiq.reyslash.com`.
- [x] Set the production Neon `DATABASE_URL`.
- [x] Set `BETTER_AUTH_URL=https://kinetiq.reyslash.com` so generated auth
      links and browser auth requests use the public same-origin route.
- [ ] Generate a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters.
- [ ] Set `RESEND_API_KEY`.
- [ ] Set a verified `RESEND_FROM_EMAIL`.
- [x] Set `NEXT_PUBLIC_API_URL=https://kinetiq.reyslash.com`.
- [x] Set `NEXT_PUBLIC_SITE_URL=https://kinetiq.reyslash.com`.
- [x] Set server-only `API_PROXY_URL=https://api.kinetiq.reyslash.com` on Vercel.
- [ ] Store production secrets outside Git.
- [ ] Keep production, test, and local credentials completely separate.
- [ ] Verify that secrets are absent from images, logs, Swagger, and CI artifacts.
- [x] Make production startup fail closed when required configuration is missing
      or insecure.

## Authentication and signup

- [ ] Verify the Resend sender domain or address.
- [x] Keep signup enabled in the Better Auth configuration.
- [x] Require email verification outside tests.
- [ ] Require verified email before sensitive mutations.
- [ ] Test signup through HTTPS.
- [ ] Test verification-email delivery and verification links.
- [ ] Test sign-in and sign-out.
- [ ] Test session expiry.
- [ ] Test password reset.
- [ ] Verify that cookies are secure, HTTP-only, same-site, and correctly scoped.
- [x] Restrict Better Auth trusted origins to the configured API and web origins.
- [ ] Verify that invalid credentials do not reveal whether an account exists.
- [ ] Verify that redirects cannot target arbitrary external URLs.
- [ ] Bootstrap the first administrator through a controlled operation.
- [ ] Document session revocation.
- [ ] Document auth-secret rotation.
- [ ] Prepare the beta privacy notice and terms.
- [ ] Decide and document account-deletion behavior.
- [ ] Decide and document the data-retention policy.

## API exposure and application security

- [x] Expose the API hostname through Nginx; keep the NestJS container port
      private. Public reference endpoints are intentionally reachable.
- [x] Restrict CORS to the configured public origin (`https://kinetiq.reyslash.com` in production).
- [x] Enforce configured-origin checks for state-changing browser requests.
- [x] Confirm in API tests that direct protected API requests still require authentication and
      authorization; do not treat CORS as authentication.
- [x] Confirm in API tests that protected resources remain owner-scoped.
- [x] Confirm in API tests that administrative mutations require the `ADMIN` role.
- [x] Verify that test-only authentication bypasses cannot activate in
      production.
- [x] Verify DTO whitelisting and unknown-field rejection.
- [ ] Verify request-size limits.
- [x] Apply an environment-aware global API rate limit and tighter
      authentication rate limits.
- [ ] Tune and verify endpoint-specific abuse limits against beta traffic.
- [ ] Test guessed identifiers and concealed private resources.
- [x] Confirm that global reference reads are public only where intended.
- [ ] Review Content Security Policy compatibility with Next.js, Better Auth,
      Resend flows, and static assets.
- [ ] Run dependency and secret scans.
- [ ] Review VPS patching, SSH configuration, Docker permissions, and disk
      limits.
- [ ] Confirm that logs exclude passwords, tokens, cookies, reset URLs, notes,
      and full workout-performance payloads.

## Database initialization and migration

- [x] Provision a dedicated Neon production database or branch.
- [ ] Require TLS for the database connection.
- [ ] Use a least-privileged production database role.
- [ ] Review Neon connection pooling and connection limits.
- [ ] Test `prisma migrate deploy` against a production-like database.
- [ ] Do not use `migrate dev`, reset commands, or destructive seed behavior in
      production.
- [ ] Verify that the production reference seed is idempotent and safe.
- [ ] Verify global exercises, muscles, routines, and training programs after
      initialization.
- [ ] Verify migration compatibility with the previous application version.
- [x] Deploy from and record a reviewed commit SHA.
- [ ] Record the production migration state.

## Public image assets

- [x] Include optimized exercise images in a clean production artifact.
- [x] Include muscle and muscle-group images.
- [x] Include routine-cover images.
- [x] Include fallback images.
- [x] Include hero and marketing images.
- [x] Resolve assets previously stored under ignored
      `apps/web/public/temp/` by moving them into a tracked public directory or
      adding a verified asset-build step.
- [x] Verify the standalone web image in CI; production web hosting is Vercel.
- [ ] Verify all important image URLs over the public HTTPS deployment.

## Health and readiness

- [x] Add `/api/health/live` as a process-only liveness endpoint.
- [x] Add `/api/health/ready` as a database-backed readiness endpoint with a
      short timeout.
- [x] Add a web health endpoint for the Next.js server.
- [x] Ensure health responses expose no secrets, SQL, versions, or internal
      topology.
- [x] Configure container health checks to use readiness appropriately.
- [ ] Verify automatic recovery after a container restart on the VPS.
- [x] Verify controlled readiness failure during a database outage locally.
- [x] Bound readiness checks with a short timeout.

## Basic observability and operations

- [x] Propagate request IDs through Nginx, API, logs, and error responses.
- [x] Emit structured API logs containing timestamp, service, environment,
      commit SHA, method, route, status, duration, and request ID.
- [x] Configure bounded Docker and Nginx log retention settings.
- [ ] Configure email alerts for API and web readiness failures.
- [ ] Configure an alert for elevated HTTP 5xx rates.
- [ ] Configure an alert for container restart loops.
- [ ] Configure disk-usage alerts at 80% and 90%.
- [ ] Configure alerts for Neon connection or storage failures.
- [ ] Configure an alert when the latest backup is more than 30 hours old.
- [ ] Configure an alert when the certificate expires within 14 days.
- [ ] Maintain an inventory of VPS, domain, Neon, Resend, GitHub, and DNS
      credentials.
- [ ] Create a runbook for failed deployments.
- [ ] Create a runbook for database outages.
- [ ] Create a runbook for a full disk.
- [ ] Create a runbook for expired certificates.
- [ ] Create a runbook for failed email delivery.
- [ ] Create a runbook for secret rotation.
- [ ] Create a runbook for compromised accounts.
- [ ] Create a runbook for backup failures.
- [ ] Create a runbook for restore operations.
- [x] Create a concise runbook for application rollback.

## Recovery and rollback follow-up

- [ ] Enable Neon automated backups or point-in-time recovery.
- [ ] Verify a rollback to the previous reviewed API SHA and a previous Vercel
      deployment.
- [ ] Confirm migration backward compatibility during the rollback window.
- [ ] Prefer forward fixes over automatic destructive database rollback.

The remaining items in this section are post-launch hardening:

- [ ] Schedule a portable encrypted logical backup at least daily.
- [ ] Store backups outside both the VPS and Neon failure domains.
- [ ] Document backup ownership, schedule, and retention.
- [ ] Restore the latest backup into an isolated environment.
- [ ] Run integrity checks against the restored data.
- [ ] Apply required migrations to the restored database.
- [ ] Boot a staging API against the restored database.
- [ ] Verify authentication, reference reads, routines, workout history, and
      analytics after restoration.
- [ ] Confirm that the latest recoverable backup is no more than 24 hours old.
- [ ] Measure and confirm a restore time under four hours.

## Post-launch deferred work

These are intentionally deferred and are not first-beta blockers:

- External encrypted logical backups in independent object storage.
- Monitoring and email alert infrastructure.
- Restore rehearsal and isolated restore verification.
- Detailed RPO/RTO measurement (the target remains RPO 24 hours and RTO 4
  hours for planning).
- Exhaustive incident runbooks and advanced operational dashboards.
- Automated deployment orchestration.

## CI and release gates

- [x] Run CI on every push to `dev` and `main`.
- [x] Run CI for pull requests.
- [x] Configure image-optimization tests.
- [x] Configure API lint and typecheck.
- [x] Configure web lint and typecheck.
- [x] Configure API unit tests.
- [x] Configure database-backed API E2E tests.
- [x] Configure web unit and coverage tests.
- [x] Configure mocked browser tests.
- [x] Configure accessibility tests.
- [x] Configure API and web production builds.
- [x] Configure production Docker-image builds.
- [x] Keep real-API smoke tests conditional on configured credentials.
- [x] Validate migrations against a clean database in CI.
- [ ] Enable branch protection for `dev`.
- [ ] Enable branch protection for `main`.
- [ ] Require the relevant CI checks on both branches.
- [ ] Require pull-request review before merging into `main`.
- [ ] Disable force-pushes.
- [ ] Restrict deployment credentials to protected GitHub environments.
- [ ] Allow production deployment only from a reviewed `main` commit.

## Final production-like acceptance journey

- [ ] Open the marketing page.
- [ ] Create a beta account.
- [ ] Verify the account email.
- [ ] Sign in and sign out.
- [ ] Verify session-expiry behavior.
- [ ] Browse exercises, muscles, routines, and training programs.
- [ ] Adopt a global training program.
- [ ] Start the next program occurrence.
- [ ] Record and edit completed sets.
- [ ] Complete the workout.
- [ ] Verify occurrence and parent-program progress.
- [ ] Cancel a workout and verify retry and history behavior.
- [ ] Review analytics and verify owner scoping.
- [ ] Verify the dashboard and all important images.
- [ ] Test mobile and desktop layouts.
- [ ] Confirm that error states degrade safely.
- [ ] Confirm that no sensitive information appears in the browser, API
      responses, CI output, or server logs.

## Closed-beta baseline and remaining acceptance

KinetiQ is already serving a closed beta. This list distinguishes the deployed
baseline from the acceptance work that remains:

- [x] Production images and Compose configuration are verified locally.
- [x] Web and API DNS and HTTPS are serving the closed beta.
- [ ] Production secrets are configured outside Git.
- [ ] Neon migrations and seed behavior are verified.
- [x] Public image assets are included in the production artifact.
- [x] The deployed browser uses the same-origin Vercel `/api` rewrite.
- [ ] Complete the public authorization acceptance matrix.
- [ ] Email verification works through the public HTTPS origin.
- [ ] Administrator bootstrap is controlled.
- [x] Liveness and readiness probes work locally.
- [x] Basic request-ID logs and application rollback documentation are
      implemented; Neon backups/PITR remain operator verification.
- [ ] CI gates are required on `dev` and `main`.
- [ ] The complete HTTPS acceptance journey passes.

Advanced analytics, progression recommendations, recovery tracking, calendar
scheduling, coach workflows, image uploads, and automated deployment
orchestration remain deferred until after the beta validates the core product.
