# Security

## Purpose and threat posture

Protect accounts, private routines, administrative reference data, uploads, infrastructure, and future performance information. Fitness history can be sensitive even if local law does not classify every field as medical data.

## Trust boundaries

Untrusted inputs include browser requests, query/filter values, uploads, auth callbacks, forwarded headers, seed/import content, and third-party storage responses. Nginx, Next.js, NestJS, Better Auth, PostgreSQL, object storage, CI, and backups each require least-privilege credentials and documented data flow.

## Authentication and session controls

- Follow Better Auth’s current official configuration for secret length, session storage, cookie attributes, origin/CSRF handling, verification, and provider callbacks.
- Use secure HTTP-only same-site cookies; do not put session tokens in local storage.
- Rate-limit sign-in/signup/reset and log security events without credentials.
- Invalidate sessions on ban, password reset where supported, and important role changes.
- Protect redirect/callback URLs with allowlists.
- Require MFA for administrator accounts when practical; if deferred, use long unique passwords and restricted admin enrollment.

## Authorization controls

NestJS guards provide coarse authentication/roles; services/repositories enforce resource scope. Every routine query includes owner ID. Admin upload endpoints verify the target exercise and role. Return 404 for other owners’ resources. Maintain an authorization matrix and negative tests; frontend route hiding is not a control.

Before coach features, design explicit grants, consent, audit, expiry/revocation, and organization isolation. Do not turn a coach into an admin.

## Input and output controls

- Globally whitelist DTO fields and forbid unknown input.
- Bound pagination, arrays, strings, numeric ranges, and request body sizes.
- Parameterize all database queries through Prisma; raw SQL uses bound parameters and reviewed identifiers.
- Render descriptions/instructions/notes as escaped plain text or sanitized Markdown with a strict allowlist. Never render admin HTML directly.
- Use security headers: CSP tailored to Next.js/auth/storage, `X-Content-Type-Options: nosniff`, referrer policy, permissions policy, frame protection via CSP, and HSTS after validation.
- Configure CORS narrowly or avoid cross-origin browser API calls through same-site proxying.

## Upload security

Verify magic bytes, MIME, size, decoded dimensions, and transformation limits; reject SVG initially; strip metadata; generate keys server-side; prevent traversal; isolate temporary processing; rate-limit endpoints. Serve public objects from a dedicated asset origin/bucket without execution permission. Storage credentials can only operate on the required bucket/prefix and should rotate.

## Secrets and infrastructure

No secrets in git, images, logs, client bundles, Swagger examples, or test artifacts. Use different secrets/credentials per environment. Restrict SSH by keys and source where possible, disable password/root login, patch host/container bases, enable firewall, and expose only 80/443/controlled SSH. Database is private and uses TLS externally.

CI deploy credentials are short-lived or narrowly scoped. Protect main/release environments and review dependency update changes. Generate dependency/container vulnerability reports and remediate exploitable high/critical issues before production.

## Privacy and data lifecycle

Collect only fields required for current features. Publish a privacy policy before public signup and document data processors/regions. Define account export/deletion before session/recovery data launches. Logs and analytics avoid routine notes or performance payloads by default. Backups follow deletion/retention policy with documented delayed erasure.

## Logging and audit

Audit admin exercise/muscle mutations, role changes, and later coach access with actor ID, action, target, timestamp, request ID, and safe change metadata. Do not log auth tokens, password/reset secrets, cookies, raw uploads, or full sensitive notes. Protect audit data against ordinary user mutation.

## Abuse and availability

Apply per-IP/account rate limits to auth, search, writes, and uploads with sensible burst behavior. Enforce request timeouts, database pool limits, body limits, and pagination. Health endpoints disclose no versions/secrets. Consider CDN/DDoS protection when public traffic warrants it.

## Security testing

- Authorization matrix at API/service layers, including guessed IDs and nested resources
- CSRF/origin/cookie tests in production-like HTTPS configuration
- DTO fuzz/boundary and mass-assignment tests
- Upload polyglot/wrong MIME/oversize/dimension/path tests
- Dependency, secret, and container scans in CI
- Manual OWASP-oriented review before MVP: XSS, injection, IDOR, CSRF, SSRF, open redirect, file upload, auth/session, misconfiguration
- Restore/access review for backups and object storage

## Incident response

Document how to revoke sessions/keys, disable admin mutations/uploads, preserve logs, rotate secrets, restore service, contact users, and record a post-incident review. Maintain an inventory of external providers and credential owners.

## Definition of done

Threat boundaries and authorization matrix are reviewed; production cookies/origins/headers are verified; upload and ownership attacks are tested; secrets/ports/roles are least-privilege; vulnerability scans have no unaccepted exploitable critical issues; and incident/revocation steps are executable.

## Open questions

Jurisdiction/privacy obligations, signup policy, email provider, MFA timing, CSP details, log retention, and deletion/export workflow need decisions before public launch or before sensitive session data, as applicable.

