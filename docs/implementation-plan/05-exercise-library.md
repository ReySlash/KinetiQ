# Exercise library

## Purpose and user problem

Create a curated, searchable source of exercise identity and stable characteristics. Users need to understand and compare movements without prescription-specific or athlete-specific data being embedded in the exercise record.

## Scope

The MVP includes global admin-managed exercises, identity text, instructions, common mistakes, stable classifications, equipment and movement patterns, one thumbnail, composed muscle/capability/demand editing, public list/detail pages, pagination, search, filters, and archive-safe deletion behavior.

## Out of scope

User-created exercises, exercise videos/multiple media, sport-specific transfer, exercise relationships, version history, public comments, performance statistics, prescriptions, and session results.

## User stories

- A visitor can search and filter the exercise catalog and open a detailed record.
- An administrator can create or edit all MVP sections and receive field-level validation.
- An administrator can preview muscle and rating data before saving.
- The system saves the exercise aggregate atomically; a failed child write leaves no partial exercise.
- Archived exercises remain usable for historical references but cannot be newly prescribed by default.

## Suggested core model

```prisma
model Exercise {
  id                    String   @id @db.Uuid
  name                  String
  slug                  String   @unique
  description           String
  instructions          String
  commonMistakes        String?
  movementPatternId     String?  @db.Uuid
  forceType             ForceType
  kineticChain          KineticChain
  isCompound            Boolean
  laterality            Laterality
  contractionMode       ContractionMode
  bodyPosition          BodyPosition
  skillLevel            SkillLevel
  thumbnailUrl          String?
  thumbnailStorageKey   String?
  imageAltText           String?
  isActive               Boolean  @default(true)
  archivedAt             DateTime? @db.Timestamptz(3)
  createdAt              DateTime @default(now()) @db.Timestamptz(3)
  updatedAt              DateTime @updatedAt @db.Timestamptz(3)

  @@index([isActive, name])
  @@index([movementPatternId, isActive])
  @@index([skillLevel, isActive])
}
```

Only the thumbnail fields are migrated for the MVP. When a full image is introduced, use the parallel names `imageUrl`, `imageStorageKey`, and its own alt/presentation metadata, or migrate both assets into `ExerciseMedia` if multiple media has arrived. Do not add empty future columns merely to reserve them.

Use joins `ExerciseEquipment(exerciseId, equipmentId)` and, when introduced, `ExercisePlane(exerciseId, plane)` because exercises can require multiple equipment items and can be multiplanar. Unique compound keys prevent duplicate assignments.

## Classification choices

- `Equipment`: seeded reference table and explicit join. Equipment needs icons, aliases, availability filters, and multiple values.
- `MovementPattern`: seeded reference table. Taxonomy is editorial and may evolve.
- `ForceType`, `KineticChain`, `Laterality`, `ContractionMode`, `BodyPosition`, `SkillLevel`: Prisma enums because application behavior and validation rely on a small controlled vocabulary.
- `PlaneOfMotion`: stable enum, but defer the join/filter until catalog use validates it.

Avoid ordinary CRUD modules for these values. Maintain reference-table seeds in source control and add an internal editor only after non-developer maintenance becomes frequent.

## Important rules and validation

- Name: trimmed 2–150 characters; case-insensitive duplicate warning/error according to catalog policy.
- Slug: unique kebab case, 2–180 characters; generate from name but allow admin override before first publish.
- Description: 20–3,000 characters. Instructions: 20–10,000. Common mistakes: at most 5,000.
- Accept structured instruction steps in the DTO as `string[]` if the UI needs ordered steps; store as JSON only if querying individual steps is unnecessary. Recommendation: store Markdown/plain text initially to keep editing simple and sanitize rendering.
- At least one movement pattern and equipment may be optional for bodyweight/isometric movements only if the taxonomy includes `BODYWEIGHT`/`NONE` explicitly. Prefer explicit equipment rather than null ambiguity.
- All enum values must be allowlisted by DTO validation; never accept arbitrary strings.
- An active/published exercise requires complete MVP profiles, at least one primary muscle, and valid thumbnail alt text if a thumbnail exists. Draft status can be added if editorial workflow needs partial saves; MVP recommendation is admin form draft state in the browser, not a database publishing system.

## Relationships and transaction boundary

Exercise identity composes equipment, muscle assignments, capability profile, and demand profile. Create/update accepts a single aggregate DTO and writes it in a Prisma interactive transaction. For child collections, diff/upsert/delete only rows belonging to the exercise. A transaction failure rolls back identity and all relationships.

Routine prescriptions reference an exercise but do not change it. Later session snapshots preserve the name and relevant classification at performance time.

## API design

- `GET /api/v1/exercises?q=&equipment=&movementPattern=&muscle=&skillLevel=&capability=&minScore=&sort=&page=&pageSize=`
- `GET /api/v1/exercises/:idOrSlug`
- `POST /api/v1/admin/exercises`
- `PATCH /api/v1/admin/exercises/:id`
- `DELETE /api/v1/admin/exercises/:id` (archive by default once referenced)
- Optional `POST /api/v1/admin/exercises/:id/restore`

Use `POST` for complete creation and `PATCH` for an aggregate edit with documented replacement semantics for included child arrays. Do not expose separate public profile mutation endpoints in MVP; they complicate partial consistency. Lists return summaries and profile highlights; details return the composed record. Default sort is name ascending; supported sorts are allowlisted.

Search begins with PostgreSQL normalized `ILIKE`/trigram across name and selected aliases, not external search. Add a GIN trigram index only after enabling `pg_trgm` through migration and checking query plans.

## Frontend pages and components

- `/exercises`: URL-driven search/filter panel, result count, pagination, exercise cards/table
- `/exercises/[slug]`: identity, instructions, muscles, capabilities, demands, rating legend
- `/admin/exercises`: table with active/archive filters and create action
- `/admin/exercises/new` and `/admin/exercises/[id]/edit`
- Sectioned `ExerciseForm`: Basic information, Media, Classification, Muscle involvement, Capabilities, Demand and fatigue; Athletic qualities stays hidden until its phase
- `ExerciseFilters`, `ExerciseSummaryCard`, `RatingScale`, `InstructionList`, destructive-action confirmation

Large forms use one React Hook Form instance and section-level error summaries. Preserve unsaved changes warnings and focus the first invalid field after submit.

## Authorization

Reads of active exercises are public. Admin role is required for create, update, archive, restore, and upload intents. Authorization is enforced in Nest guards/policies and service entry points; hiding admin routes in Next.js is not security. Later custom exercises require explicit ownership rules and must not silently reuse global admin endpoints.

## Testing requirements

- Unit/validation: slug, enum allowlists, score ranges through composed DTO, publish completeness
- Service: aggregate create/update in a transaction, child diffing, archive behavior
- Prisma integration: unique slug/name policy, joins, filters, indexes/query plans for representative data
- API E2E: list/search/filter/sort/paginate, detail 404, admin CRUD, malformed DTO, conflict response
- Authorization: anonymous and normal user mutations denied; administrator allowed
- Frontend: each form section, server error mapping, loading/error/empty states, URL filters, accessible score descriptions
- Playwright: admin creates a complete exercise; public user finds it; invalid/duplicate relationships do not persist partial data

## Edge cases

Duplicate or renamed exercises, slug changes and stale links, no-equipment movements, mixed classifications, archived exercise in an existing routine, missing image object, concurrent admin edits, and deletion when references exist. MVP may use last-write-wins with `updatedAt` returned; add optimistic concurrency (`If-Match` or version) if simultaneous editing becomes real.

## Dependencies and implementation sequence

1. Seed equipment and movement patterns; add core exercise schema.
2. Build identity CRUD, list/search/detail API, and basic UI.
3. Add muscle assignments, capability/demand profiles, and aggregate transactions.
4. Add media workflow.
5. Protect writes with Better Auth admin authorization before production.
6. Add final filters, accessibility, and E2E acceptance flow.

## Definition of done

Admin users can atomically manage a valid exercise aggregate; public users can find and understand it; constraints prevent invalid classifications and duplicate joins; archive behavior preserves references; all negative authorization and form failure paths are tested; and OpenAPI documents the composed contract.

## Future extensions and open questions

Add aliases, localization, multi-media, relationships, owner-scoped custom exercises, revision history, and sport mappings only in later phases. Decide whether slugs are mutable and whether admin drafts are needed before catalog entry begins; recommendation: immutable after first publication and no persistent draft status for the small initial admin team.
