# Observability and backups

## Purpose

A single developer needs enough signal to detect broken deployments, diagnose requests, and recover data without operating a large observability platform. The closed-beta baseline starts with API request logs, health checks, Vercel deployment visibility, bounded VPS logs, and Neon backups/PITR. Alerts, portable off-provider backups, and restore rehearsal remain post-launch hardening.

## Logging

NestJS emits structured request JSON to stdout/stderr. The Oracle Nginx proxy emits structured access logs for API traffic, while Vercel provides frontend deployment and runtime logs. Nginx supplies a request ID and the API validates or generates one, returns it in the response, and includes it in API request logs. End-to-end correlation through Vercel and future audit records remains follow-up work.

Recommended API log fields: timestamp, level, service, environment, version/commit, requestId, method, route template, status, durationMs, authenticated actor ID only when needed, and safe error code. Do not log query strings containing search if privacy policy treats them as sensitive, raw request/response bodies, cookies, authorization headers, database URLs, storage keys where sensitive, passwords, tokens, notes, or upload bytes.

Use size/time rotation at the host log driver or ship to a managed service. Set retention explicitly (for example 14–30 days for app logs in MVP) and cap disk use so logs cannot fill the VPS.

## Health and readiness

- API `/api/health/live`: process/event loop alive; no dependency calls.
- API `/api/health/ready`: database connectivity and completed critical startup state with short timeout.
- Web `/health`: the deployed Next.js application can respond.
- The API container uses liveness/readiness probes; Vercel owns frontend runtime health and replacement.

Object storage should be monitored through a periodic synthetic check, not every readiness probe, so provider degradation does not restart a healthy API repeatedly. Health responses expose a status and request ID, not credentials, SQL, hostnames, or detailed dependency versions.

## Metrics and alerting

MVP may start with provider/host monitoring plus lightweight application metrics. Track:

- HTTP request rate, 4xx/5xx rate, latency percentiles
- API/web/container restarts and health failures
- database connection saturation, query latency, storage size
- VPS CPU, memory, disk space/inodes, load, network
- upload/transform failures and orphan cleanup backlog
- auth failure/rate-limit spikes
- backup age, size, duration, and success
- certificate expiry and renewal failure

Alerts must be actionable and reach the developer outside the failed VPS. Initial examples: readiness down for 5 minutes, elevated 5xx, disk above 80/90%, no successful backup within 30 hours, certificate under 14 days, database/storage connection failures.

## Error tracking

An external error tracker is recommended if its cost and data region are acceptable. Scrub request bodies, cookies, user notes, and file content; send release SHA and request ID. If deferred, ensure centralized logs and alerts can identify new 5xx errors. Frontend errors should include route/release metadata but no form contents by default.

## Backup strategy

### PostgreSQL

- Neon automated backups/PITR are the first-beta recovery baseline and must be verified against the selected production plan.
- A portable encrypted logical backup outside Neon and the VPS is post-launch hardening.
- When introduced, back up Better Auth and application schemas consistently in the same snapshot and document retention and key custody.

### Media

Enable object versioning or provider replication/lifecycle according to cost. Back up the metadata database and objects such that keys remain consistent. Local development files need no production backup; production must not rely only on the VPS filesystem.

### Configuration

Back up encrypted operational configuration, Nginx/Compose definitions (also in git), and a credential inventory. Secrets themselves require a secure recovery method outside the server.

## Restore procedure

At least quarterly, restore the latest backup into an isolated database, apply no destructive “fixups,” run integrity counts/foreign-key checks, boot a staging API, confirm auth/reference/routine sample reads, and record duration and gaps. Test media object availability separately. A backup is not considered successful until a restore drill has passed.

Define RPO/RTO. Private MVP recommendation: 24-hour RPO and 4-hour RTO. Tighten before meaningful performance histories make a day of loss unacceptable.

## Operational runbooks

Create concise runbooks for deploy failure, database unavailable, full disk, expired certificate, object storage outage, backup failure, secret rotation, compromised account, and restore. Each identifies detection, immediate containment, safe diagnosis, recovery, verification, and escalation/provider links.

## Testing and current acceptance

Automated tests cover health behavior, dependency timeout, and API request-ID propagation. The remaining operational acceptance is to verify Neon recovery settings, certificate renewal, log retention, off-host alerting, and an isolated restore. The stronger standard remains that failures are detected off-host, logs correlate without exposing secrets, retention prevents disk exhaustion, and measured restore meets the approved targets.

## Future extensions and open questions

OpenTelemetry traces, Prometheus/Grafana, centralized log search, and SLO/error-budget practices can follow usage. Choose monitoring/error providers, retention, alert channel, backup bucket/region, encryption key custody, and drill frequency during post-launch hardening.
