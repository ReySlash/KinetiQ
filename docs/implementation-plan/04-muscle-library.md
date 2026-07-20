# Muscle library

## Purpose and user problem

Provide a small, consistent anatomical reference that users can browse and administrators can assign to exercises. Free-text muscle names create duplicates, inconsistent granularity, and unreliable filters; muscles are therefore controlled data.

## Scope

The MVP includes seeded records, broad regions/groups, an optional self-referencing hierarchy, one optional thumbnail, public list/detail endpoints, and list/detail pages. Seed broad groups first and add selected children only where exercise curation benefits.

## Out of scope

A complete anatomy ontology, attachment points, innervation, medical content, user-created muscles, regular admin CRUD screens, multi-level anatomical visualization, and muscle-specific analytics are excluded.

## User stories

- As a visitor, I can search/browse muscles and see a plain-language description and parent/children.
- As an exercise editor, I can select only active seeded muscles.
- As a maintainer, I can update reviewed seed data idempotently without duplicating records.
- As an administrator, I cannot accidentally delete a muscle already assigned to an exercise.

## Suggested model

```prisma
model Muscle {
  id                  String   @id @db.Uuid
  name                String
  slug                String   @unique
  description         String
  bodyRegion           BodyRegion
  muscleGroupId       String?  @db.Uuid
  parentId             String?  @db.Uuid
  thumbnailUrl         String?
  thumbnailStorageKey  String?
  imageAltText         String?
  isActive             Boolean  @default(true)
  sortOrder            Int      @default(0)
  createdAt            DateTime @default(now()) @db.Timestamptz(3)
  updatedAt            DateTime @updatedAt @db.Timestamptz(3)
  parent               Muscle?  @relation("MuscleHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children             Muscle[] @relation("MuscleHierarchy")
  muscleGroup          MuscleGroup? @relation(fields: [muscleGroupId], references: [id], onDelete: Restrict)

  @@index([bodyRegion, isActive])
  @@index([muscleGroupId, isActive])
  @@index([parentId])
}
```

`MuscleGroup` is recommended as a seeded reference table with `id`, `name`, `slug`, `description?`, and `sortOrder`. It avoids conflating hierarchy (“Quadriceps contains Rectus Femoris”) with an analytical grouping. If the initial catalog proves extremely small, `muscleGroup` can be an enum, but the table is preferred because labels and filter order will evolve.

## Domain and validation rules

- `name`: trimmed, 2–100 characters; uniqueness is case-insensitive at the business layer.
- `slug`: lowercase ASCII kebab case, 2–120 characters, unique and stable after publication unless a redirect strategy exists.
- `description`: 1–2,000 characters and educational, not medical advice.
- `parentId` cannot equal `id`; seed validation must detect longer cycles.
- A child should normally share a compatible body region with its parent; treat mismatches as seed validation errors.
- Thumbnail metadata follows [exercise media](10-exercise-media.md); alt text is required when an image exists.
- Inactive muscles stay resolvable for existing relations but do not appear in new-assignment selectors.
- Seed identifiers or slugs must be deterministic. Do not use `createMany(skipDuplicates)` alone because it cannot reconcile reviewed updates.

PostgreSQL should use a case-insensitive unique index on `lower(name)` if exact global name uniqueness is desired. Slug uniqueness is the durable invariant. Recursive SQL or application validation prevents cycles; Prisma cannot express this as a simple schema constraint.

## API endpoints

- `GET /api/v1/muscles?q=&bodyRegion=&muscleGroup=&parentId=&includeChildren=&page=&pageSize=`
- `GET /api/v1/muscles/:idOrSlug`

Default responses include active records only. Exercise admin forms may use `GET /api/v1/muscles?view=selector&pageSize=100`; avoid creating a second endpoint until payload size justifies it. Seed maintenance runs through CLI/deployment, not public CRUD. A future internal admin module may expose protected mutations.

List items contain ID, name, slug, body region, group, parent summary, and thumbnail presentation URL. Detail adds description and immediate children; do not return an unbounded recursive tree.

## Frontend pages and components

- `/muscles`: searchable/filterable cards or compact list with loading, empty, and error states
- `/muscles/[slug]`: description, region/group, parent breadcrumb, immediate children, image/placeholder
- `MuscleCombobox`: admin exercise-form selector with selected values excluded
- `MuscleThumbnail`, `BodyRegionBadge`, `MuscleHierarchyBreadcrumb`

Search/filter state belongs in URL query parameters. Public pages should provide indexable metadata; a nonexistent or inactive slug returns a real 404 unless referenced through authorized maintenance tooling.

## Authorization

Public users can read active muscles. Only an administrator or internal seed process can mutate records. The API role guard and service policy must both reject normal-user writes if internal endpoints are later added. Never infer admin access from an email domain in application code.

## Testing requirements

- Unit: slug normalization, hierarchy/cycle validator, image-alt rule
- Prisma integration: unique slug, restricted parent delete, filters, deterministic seed rerun
- API: public list/detail, pagination, invalid filters, inactive 404 behavior
- Authorization: mutation route absent or rejects anonymous/normal users
- Frontend: search/filter URL behavior, hierarchy rendering, image fallback, keyboard navigation and accessible names
- Seed contract: snapshots or explicit assertions for required initial slugs and parent links

## Edge cases

Handle duplicate seed names, a removed parent, deep or cyclic hierarchies, missing media objects, reassignment of a parent, and a muscle referenced by exercises. In production, deactivate rather than delete referenced records.

## Dependencies and implementation sequence

1. Define body-region enum and `MuscleGroup` seed taxonomy.
2. Add schema, indexes, and first migration.
3. Write seed manifest/upsert and hierarchy validation.
4. Add read service/controller and OpenAPI contracts.
5. Add list/detail pages and selector component.
6. Add media only after the shared storage slice; use placeholders before then.

Depends on foundation/database. Exercise–muscle work depends on stable muscle IDs.

## Definition of done

A clean database can migrate and seed twice with identical results; public users can browse active muscles; filters and hierarchy work; unauthorized mutation is impossible; required constraints/tests pass; and seed changes are documented and reviewable.

## Future extensions and open questions

Possible extensions include synonyms for search, localization, richer anatomy, multi-region classifications, and an internal maintenance UI. Decide the initial catalog and whether group records themselves also appear as muscles before seeding; recommendation: allow “Quadriceps” as a selectable broad muscle record with children, while documenting that analytics must avoid double-counting a parent and child assigned to the same exercise.

