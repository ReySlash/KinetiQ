# Authentication and authorization

## Purpose and user problem

Better Auth proves identity and manages sessions; NestJS remains responsible for whether that identity may perform a business action. The MVP needs secure sign-in and strict separation of personal routines from global curated data.

## Scope

Better Auth session management, email/password or one selected provider, sign-up/sign-in/sign-out, session cookies, NestJS principal resolution, application user linkage, `USER`/`ADMIN` roles, route/service policies, query-scoped routine ownership, protected Next.js navigation, and authorization tests.

## Out of scope

Coach/athlete delegation, organizations, fine-grained permissions UI, subscription roles, impersonation, SCIM/SSO, public routine sharing, and custom-exercise ownership.

## Integration recommendation

Run Better Auth against the same PostgreSQL database and expose its handler through the NestJS/API origin if the selected adapter supports it cleanly. NestJS middleware/guard validates session cookies using the official server integration and creates a minimal principal `{ userId, role, sessionId }`. Do not accept a user ID/role header from Nginx or the browser.

The current [Better Auth NestJS integration](https://better-auth.com/docs/integrations/nestjs) is community maintained and requires special request-body handling. R0 must include an integration spike that proves Better Auth callbacks and ordinary JSON/multipart Nest routes can coexist; pin the adapter version and test this behavior before building auth UI. If the community adapter is unsuitable, mount Better Auth’s official Node handler deliberately before Nest body parsing and write the principal adapter in KinetiQ rather than forking auth behavior.

Use Better Auth’s [Prisma adapter and schema generation](https://better-auth.com/docs/adapters/prisma), but make Prisma Migrate the sole owner of actual database migrations—the current Better Auth Prisma adapter generates schema but does not run Prisma migrations. Keep generated/auth model changes reviewed in the same Prisma schema, link application resources to the canonical Better Auth user ID, and never let two migration systems alter the same definitions silently.

## Authentication behavior

- Use secure, HTTP-only cookies in production with an appropriate `SameSite` policy and explicit trusted origin.
- Use a high-entropy `BETTER_AUTH_SECRET` and the documented versioned-secret rollover mechanism when rotation must preserve valid sessions; emergency rotation may intentionally invalidate them.
- Enforce verified email before sensitive mutations if email/password signup is public. For a closed beta, invite-only signup can reduce abuse.
- Normalize email per Better Auth behavior; do not build a parallel password/session system.
- Anonymous protected endpoints return `401`; authenticated but disallowed role actions return `403`; another owner’s private resource returns `404`.
- Client route protection improves UX but API authorization is authoritative.

## Role model

Use `USER` and `ADMIN` as an application enum/field. Seed/bootstrap the first administrator through a one-time CLI/environment-controlled process that is disabled after use; do not promote based on an email list on every request. Role changes should invalidate or refresh sessions promptly and be audit logged.

Global muscles/exercises are public read and admin write. Routines are owner read/write. Storage uploads inherit the target resource’s policy. Later coach access requires explicit grants and cannot be represented by changing ownership.

## Query-level ownership

Repository/service functions accept the principal, not an arbitrary owner ID from controller DTOs. Use compound filters on reads and mutation prerequisites:

```text
getOwnedRoutine(routineId, principal.userId)
replaceRoutineChildren(routineId, principal.userId, input)
deleteOwnedRoutine(routineId, principal.userId)
```

Prisma does not provide row-level security automatically. PostgreSQL RLS could add defense in depth, but it complicates connection context/pooling; defer it for MVP and enforce scoped repository methods plus tests. Never expose unscoped `findRoutineById` to controllers.

## Frontend pages and components

- `/sign-in`, `/sign-up` (if open), `/forgot-password` and `/reset-password` only if supported in the first auth method
- Protected `/app/*` shell with session-aware loading and sign-out
- `/forbidden` only for known role denial; private resource misses stay not-found
- `AuthForm`, password visibility toggle, session menu, auth error alert, redirect sanitization

Avoid flashing private content during hydration. Redirect only to allowlisted same-origin paths to prevent open redirects.

## Validation and security rules

Use Better Auth’s documented password policy and rate-limit sign-in/signup/reset. Errors should not reveal whether an email exists. CSRF protection must match the cookie/session integration and same-site deployment; state-changing endpoints reject untrusted origins. Log security events without passwords, tokens, cookies, or full reset URLs.

## Testing strategy

- Unit: principal/policy checks, safe redirect, owner-scoped repository calls
- Integration: session resolution, revoked/expired session, role refresh, user linkage
- API E2E: 401/403/404 contract and admin/user matrix
- Ownership E2E: user B cannot list/read/update/delete/duplicate user A’s routines, including guessed IDs and child endpoints
- Frontend: auth form validation, loading/error, protected navigation, return path
- Playwright: signup/sign-in/sign-out/session expiry and two-user isolation
- Security: CSRF/origin rejection, rate-limit behavior, cookie flags in production-like environment

## Edge cases

Deleted/banned users with live sessions, role demotion, session expiry during a form submit, duplicate emails/provider linking, account deletion with owned resources, clock skew, auth service database migration, and compromised admin account. Define account deletion behavior before enabling it; MVP may omit self-service deletion.

## Dependencies and implementation sequence

Choose auth method and adapter, generate/apply auth schema, integrate server handler, resolve Nest principal, add role bootstrap, protect admin writes, build pages/session UX, then add routine ownership and negative tests. Reference-library public reads do not depend on auth.

## Definition of done

Sessions work across web/API on the production-like origin; cookie and origin controls are verified; admin writes require role authorization; routine queries are owner-scoped; status semantics are consistent; no secret appears in logs; and the complete authorization matrix passes.

## Future extensions and open questions

MFA, OAuth providers, account deletion/export, devices/sessions UI, audit UI, and delegated coach access are later. Decide the initial sign-in method and signup openness before implementation. Recommendation: email/password with verified email for the smallest provider dependency, or one OAuth provider only if email delivery operations would otherwise block the MVP.
