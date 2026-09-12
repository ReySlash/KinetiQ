# Closed-Beta Deployment Checklist

This checklist tracks the work required to prepare KinetiQ for a closed-beta
deployment with the following target configuration:

- Public application: `https://kinetiq.reyslash.com`
- Hosting: Oracle Cloud VPS
- Database: Neon PostgreSQL
- Public entry point: Nginx
- Browser API access: same-origin requests through `/api`
- Signup: open, with email verification required
- Recovery objectives: RPO 24 hours and RTO 4 hours
- Operational alerts: email
- Initial release process: manually controlled and pinned to a reviewed Git SHA

## First-beta scope

The first beta ships separate, right-sized API and web images; same-origin
HTTPS through Nginx; production configuration validation; migrations and safe
reference-data initialization; liveness/readiness checks; request IDs and
bounded structured logs; CI tests/builds/image validation; Neon automated
backups/PITR; and a reviewed application rollback procedure.

External provisioning remains operator-owned: Oracle VPS, DNS, Neon, Resend,
certificates, firewall rules, and branch protection. The operational items
listed under **Post-launch deferred work** are deliberately not launch
blockers.

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

## Domain, VPS, reverse proxy, and HTTPS

- [ ] Create a DNS record for `kinetiq.reyslash.com`.
- [ ] Provision the Oracle Cloud VPS.
- [ ] Restrict SSH access to approved operator addresses.
- [ ] Expose only ports 80, 443, and restricted SSH.
- [ ] Keep API and web container ports inaccessible from the public internet.
- [ ] Install and configure Nginx.
- [ ] Redirect HTTP traffic to HTTPS.
- [x] Add the host-Nginx configuration for application traffic to Next.js.
- [x] Add proxy rules for `/api` and `/api/auth` to NestJS.
- [x] Configure host, client IP, forwarding, protocol, and request-ID headers.
- [x] Configure upload-size limits and proxy timeouts.
- [x] Configure appropriate security headers.
- [x] Configure basic request limiting.
- [ ] Issue the TLS certificate with Certbot.
- [ ] Test certificate renewal with `certbot renew --dry-run`.
- [ ] Test Nginx configuration validation and reload.

## Production environment and secrets

- [ ] Set `NODE_ENV=production`.
- [ ] Set the API `PORT`.
- [ ] Set `WEB_ORIGIN=https://kinetiq.reyslash.com`.
- [ ] Set the production Neon `DATABASE_URL`.
- [ ] Set `BETTER_AUTH_URL=https://kinetiq.reyslash.com`.
- [ ] Generate a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters.
- [ ] Set `RESEND_API_KEY`.
- [ ] Set a verified `RESEND_FROM_EMAIL`.
- [ ] Set `NEXT_PUBLIC_API_URL=https://kinetiq.reyslash.com`.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://kinetiq.reyslash.com`.
- [ ] Store production secrets outside Git.
- [ ] Keep production, test, and local credentials completely separate.
- [ ] Verify that secrets are absent from images, logs, Swagger, and CI artifacts.
- [x] Make production startup fail closed when required configuration is missing
      or insecure.

## Authentication and signup

- [ ] Verify the Resend sender domain or address.
- [ ] Keep signup enabled.
- [ ] Require email verification.
- [ ] Require verified email before sensitive mutations.
- [ ] Test signup through HTTPS.
- [ ] Test verification-email delivery and verification links.
- [ ] Test sign-in and sign-out.
- [ ] Test session expiry.
- [ ] Test password reset.
- [ ] Verify that cookies are secure, HTTP-only, same-site, and correctly scoped.
- [ ] Restrict trusted origins to the intended public origin.
- [ ] Verify that invalid credentials do not reveal whether an account exists.
- [ ] Verify that redirects cannot target arbitrary external URLs.
- [ ] Bootstrap the first administrator through a controlled operation.
- [ ] Document session revocation.
- [ ] Document auth-secret rotation.
- [ ] Prepare the beta privacy notice and terms.
- [ ] Decide and document account-deletion behavior.
- [ ] Decide and document the data-retention policy.

## API exposure and application security

- [ ] Keep NestJS inaccessible from the public internet except through Nginx.
- [x] Restrict CORS to the configured public origin (`https://kinetiq.reyslash.com` in production).
- [ ] Enforce trusted-origin checks for state-changing browser requests.
- [ ] Confirm that direct API requests still require authentication and
      authorization; do not treat CORS as authentication.
- [ ] Confirm that all protected resources remain owner-scoped.
- [ ] Confirm that administrative mutations require the `ADMIN` role.
- [ ] Verify that test-only authentication bypasses cannot activate in
      production.
- [ ] Verify DTO whitelisting and unknown-field rejection.
- [ ] Verify request-size limits.
- [ ] Verify rate limits for authentication, search, writes, and workout
      mutations.
- [ ] Test guessed identifiers and concealed private resources.
- [ ] Confirm that global reference reads are public only where intended.
- [ ] Review Content Security Policy compatibility with Next.js, Better Auth,
      Resend flows, and static assets.
- [ ] Run dependency and secret scans.
- [ ] Review VPS patching, SSH configuration, Docker permissions, and disk
      limits.
- [ ] Confirm that logs exclude passwords, tokens, cookies, reset URLs, notes,
      and full workout-performance payloads.

## Database initialization and migration

- [ ] Provision a dedicated Neon production database or branch.
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
- [ ] Record the deployed commit SHA.
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
- [x] Build the web application into the production web image.
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
- [x] Emit structured API logs containing timestamp, service,
      environment, commit SHA, route, status, duration, safe error code, and
      request ID.
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

## First-beta backups and rollback

- [ ] Enable Neon automated backups or point-in-time recovery.
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
- [ ] Rehearse rollback to the previous SHA-tagged application images.
- [ ] Confirm migration backward compatibility during the rollback window.
- [ ] Prefer forward fixes over automatic destructive database rollback.

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

## Definition of ready

KinetiQ is ready for the closed beta only when:

- [x] Production images and Compose configuration are verified locally.
- [ ] DNS and HTTPS are verified.
- [ ] Production secrets are configured outside Git.
- [ ] Neon migrations and seed behavior are verified.
- [x] Public image assets are included in the production artifact.
- [ ] Same-origin proxying and authorization tests pass.
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
