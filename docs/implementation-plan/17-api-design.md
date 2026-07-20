# API design

## Purpose and conventions

Expose a predictable REST API from NestJS with validated DTOs, ownership-aware services, and generated Swagger/OpenAPI documentation. The API is the business-data boundary for the web client and future clients.

## Base paths and versioning

Use `/api/v1` externally. Nginx proxies that prefix to NestJS without changing observable links. Version only breaking contract changes; add optional fields/endpoints within v1. Do not put implementation module names in routes.

Recommended early routes:

```text
GET    /api/v1/muscles
GET    /api/v1/muscles/:idOrSlug
GET    /api/v1/exercises
GET    /api/v1/exercises/:idOrSlug
POST   /api/v1/admin/exercises
PATCH  /api/v1/admin/exercises/:id
DELETE /api/v1/admin/exercises/:id
POST   /api/v1/admin/exercises/:id/thumbnail
DELETE /api/v1/admin/exercises/:id/thumbnail
POST   /api/v1/routines
GET    /api/v1/routines
GET    /api/v1/routines/:id
PATCH  /api/v1/routines/:id
DELETE /api/v1/routines/:id
POST   /api/v1/routines/:id/duplicate
```

The `/admin` prefix makes curation intent and documentation clear, but role guards remain mandatory. Public reads and admin writes can share application services. Routine routes need no `/users/:userId` because identity comes from the session.

## DTO and validation strategy

Use explicit request and response DTO classes; do not expose Prisma types/entities. Configure global validation to whitelist fields, forbid non-whitelisted input, transform only intentionally, and produce field paths for nested errors. Do not silently coerce ambiguous score strings into numbers.

Create and update DTO semantics:

- `POST` requires all fields needed for a complete aggregate.
- `PATCH` distinguishes omitted (“unchanged”) from explicit null/empty (“clear/replace”).
- Child arrays in exercise/routine aggregate patches use documented replacement semantics when present.
- Responses use stable camelCase JSON and ISO-8601 timestamps.
- IDs are validated UUIDs; public reference detail may accept a UUID or slug but the matching rule is explicit.

## Pagination, filtering, sorting, and search

For MVP, use page-based pagination: `page` defaults 1, `pageSize` defaults 20, maximum 100. Return:

```json
{
  "data": [],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 0, "totalPages": 0 }
}
```

Offset pagination is simple and sufficient for the curated catalog and routine list. Move high-churn history to cursor pagination later.

Use `q` for trimmed search with a maximum of 100 characters. Filters use documented names and repeat/comma semantics; recommendation: repeat query parameters for multi-values. Sorting is an allowlisted `sort=field:asc|desc`, never raw SQL/Prisma field pass-through. Apply stable ID/name tie-breakers.

## Error response

Adopt an RFC 9457-style problem object:

```json
{
  "type": "https://docs.example.com/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/admin/exercises",
  "requestId": "...",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "muscles[1].muscleId", "message": "Duplicate muscle." }]
}
```

Use 400 for malformed syntax/query, 401 unauthenticated, 403 known permission denial, 404 missing or concealed private resource, 409 uniqueness/state conflict, 413 upload too large, 415 unsupported media, 422 valid JSON that violates domain validation, 429 rate limit, and 500 unexpected error. Production details never expose stack traces, SQL, storage keys, or secrets.

## Authentication and authorization behavior

Cookie sessions are recommended for the first-party web app. Swagger can document cookie auth and role requirements. State-changing requests validate CSRF/origin according to Better Auth integration. Controllers derive the principal server-side. Another owner’s private resource returns 404; public resource role denial returns 403 when existence is public.

## Idempotency and concurrency

GET/DELETE are idempotent by HTTP semantics. Duplicate commands and later session launch should accept an `Idempotency-Key` when retry risk matters; this is optional for MVP routine duplication but required before offline session workflows. Return `ETag`/version later for concurrent routine editing; MVP returns `updatedAt` and can adopt last-write-wins with documented limitation.

## Swagger/OpenAPI

Generate docs from controllers/DTO decorators, including examples, enums, rating descriptions, authentication, error responses, filters, and all status codes. Serve Swagger only to authenticated admins in production or publish a static sanitized spec; recommendation: protect interactive docs while committing/generating the JSON spec for client generation. CI validates that generation succeeds.

## Performance and caching

Public reference GETs may return `ETag`/`Cache-Control` with short revalidation; authenticated routine responses are private/no-store unless carefully varied. Enforce pagination, input limits, query timeouts, and bounded relation includes. Avoid N+1 by selecting list projections and batching relations.

## Testing and definition of done

Each endpoint has happy, validation, auth, not-found, conflict, and dependency-failure tests as applicable. OpenAPI examples match real response DTOs. Filters and sorting have explicit tests. A route is done when status codes, error fields, auth, pagination, and mutation transaction semantics are documented and verified.

## Future extensions and open questions

Cursor pagination, conditional requests, idempotency storage, public API tokens, and webhooks are later. Decide the production docs URL/domain and generated client tool during foundation. Recommendation: generate TypeScript types/client from OpenAPI into `packages/api-client`, avoiding manually shared server types.

