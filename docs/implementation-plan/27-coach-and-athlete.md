# Coach and athlete features

## Purpose and status

Allow an athlete to delegate limited access to a coach without weakening ownership or turning coaches into system administrators. This is exploratory and should begin only after personal plans, sessions, privacy controls, and audit logs are stable.

## User problem and proposed scope

An athlete may want a coach to view history, create/assign plans, comment, or adjust future prescriptions. The first slice should support one explicit coach–athlete grant with a small permission set, invitation/acceptance, revocation, and audited reads/writes. Organizations, teams, billing, discovery, messaging, and public profiles remain later.

## Modeling recommendation

Do not change `ownerId` and do not give coaches `ADMIN`. Introduce:

```text
CoachingRelationship(
  id, coachUserId, athleteUserId, status,
  permissions, invitedAt, acceptedAt?, revokedAt?, createdAt, updatedAt
)
```

Prefer normalized permission rows or a stable bitset/array only after exact actions are known. Likely permissions are view sessions/analytics, view recovery, manage plans/routines, and comment. Athlete-owned resources keep `ownerId=athleteId`; authorization checks either ownership or an active grant for that action.

If multi-coach companies, rosters, staff roles, or shared templates become requirements, introduce `Organization`, `Membership`, and athlete consent as a true tenancy design rather than stretching a pair relationship.

## Domain rules

- The athlete explicitly accepts and may revoke access immediately.
- Grants are least privilege, resource/action specific, and time-limited optionally.
- Coaches cannot view recovery/notes unless separately granted.
- Revocation blocks new access while preserving audit/history of prior authorized changes.
- Coach changes to plans/prescriptions identify the actor and never rewrite completed sessions.
- Account deletion/suspension terminates active grants.
- A system administrator role is for catalog/operations, not routine coaching access.

## API and frontend

Use invitation/accept/revoke commands rather than generic status patches. Resource APIs reuse the athlete resource path only with an explicit acting context resolved server-side; do not accept a spoofable `X-Athlete-Id`. UI must always show which athlete context is active, what the coach can do, and who last changed a plan.

Athletes need an access-management page listing coaches, permissions, recent access, and revoke. Coaches need a roster only after accepted grants exist. Email invitations require expiry, single use, safe redirects, and non-enumerating errors.

## Authorization and testing

Create a permission matrix for owner, granted coach, ungranted coach, revoked coach, administrator, and anonymous principal across each resource/action. Test invitation token expiry/replay, permission escalation attempts, revocation during a session, cross-athlete tenant leakage, audit records, sensitive recovery opt-in, and actor attribution. Multi-user API E2E is mandatory.

## Dependencies and implementation sequence

Requires mature owner-scoped services, sessions/plans, audit logging, notification/email capability, privacy/export/deletion policies, and user validation. Conduct user research, define actions/consent, threat-model tenancy, implement grants/audit, then enable one resource at a time.

## Definition of done

Athletes knowingly grant and instantly revoke narrowly defined access; owner IDs remain unchanged; every delegated action is policy-checked and audited; tenant-isolation tests pass; sensitive data requires explicit scope; and system admin privileges are not reused.

## Open questions and future extensions

Coach verification, liability, child/minor accounts, organizations, team roles, template ownership, comment moderation, notifications, regional privacy/data processing, billing, and data portability all require product/legal validation. These uncertainties keep the feature outside the committed roadmap.

