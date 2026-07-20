# Exercise media and storage

## Purpose and user problem

Exercise and muscle thumbnails make the library easier to scan, but binary files do not belong in PostgreSQL and storage choice should not leak into domain services. The MVP needs a reliable one-thumbnail workflow with accessible metadata and cleanup on failure.

## MVP scope

- One optional thumbnail per exercise; optional seeded muscle thumbnails
- Database metadata: public/presentation URL where appropriate, opaque storage key, alt text
- Placeholder when no image or an object is unavailable
- Local filesystem adapter for development and S3-compatible object storage in production
- MIME, size, and image-dimension validation
- Optimized output variant and safe replacement/deletion lifecycle
- Admin-only exercise uploads; muscle assets may be loaded by maintenance scripts

Multiple images, video, user uploads, crop UI, CDN transformation, and signed direct browser upload are deferred.

## Inline fields versus `ExerciseMedia`

**Inline metadata** is simpler for exactly one thumbnail, enforces the one-image rule naturally, and avoids joins. **A media table** supports multiple types, variants, ordering, processing states, and reuse but adds lifecycle complexity before it is needed.

Recommendation: use inline exercise/muscle thumbnail metadata for MVP, behind media service DTOs. Add `ExerciseMedia` when the second media type is implemented. Migration is straightforward: copy inline rows into the new table while keeping a `kind=THUMBNAIL`, then switch reads. Domain code already depends on a media presentation object rather than physical paths.

## Storage abstraction

```text
StorageService
  createUploadIntent(policy)       # later signed upload path
  putValidatedObject(stream, meta) # MVP admin upload
  getPresentationUrl(storageKey)
  deleteObject(storageKey)
  objectExists(storageKey)
```

Implement `LocalStorageAdapter` and `S3CompatibleStorageAdapter`. Services store an opaque key such as `exercises/<uuid>/thumbnail/<asset-uuid>.webp`; clients never submit or receive a server filesystem path. Production URLs may be public CDN/object URLs for public catalog assets. Signed upload URLs are recommended later for scalability, not necessary for small admin uploads through NestJS.

## File policy

- Accept JPEG, PNG, and WebP by verified magic bytes; do not trust file extension or `Content-Type` alone.
- Reject SVG initially because active content/sanitization complicates safe serving.
- Maximum original size: 5 MiB; configurable downward, never upward without resource review.
- Minimum dimensions: 400×400. Maximum decoded dimensions: 6,000×6,000 to limit decompression abuse.
- Preferred input aspect: 1:1 or 4:3. Generate a center/curator crop thumbnail at 640×640 WebP/AVIF where library cards are square; preserve object-fit behavior for legacy images.
- Strip metadata, including EXIF/GPS, and normalize orientation.
- Require meaningful alt text (5–180 characters) when a media key exists. Avoid “image of.”
- Limit upload concurrency and processing time/memory.

## Database metadata

Keep `thumbnailStorageKey`, optional cached `thumbnailUrl`, `imageAltText`, and later `thumbnailWidth`, `thumbnailHeight`, `thumbnailMimeType`, `thumbnailBytes`, `thumbnailChecksum`. The storage key is authoritative; a URL may expire or change domains. Prefer calculating presentation URLs at response mapping time. When a distinct full image ships, its inline equivalents are `imageStorageKey` and `imageUrl`; if that release also needs galleries/video, introduce `ExerciseMedia` instead of multiplying inline columns.

## Upload workflow and consistency

Because object storage and PostgreSQL cannot share a transaction:

1. Validate authorization and multipart metadata.
2. Stream to a bounded temporary/quarantine location; verify bytes and dimensions.
3. Transform and write a new unique storage object.
4. In a database transaction, attach the new key/alt text to the exercise.
5. After commit, best-effort delete the old object.
6. A scheduled maintenance task removes unreferenced objects older than a safety window and reports failures.

If step 3 fails, no database record is created. If step 4 fails, mark/delete the new orphan. Never replace an object in place because caches and concurrent reads can show inconsistent content.

## API endpoints

For MVP, either accept multipart at `POST /api/v1/admin/exercises/:id/thumbnail` or use `POST /admin/media/uploads` then attach. Recommendation: the exercise-specific endpoint is smaller and enforces ownership/context. `DELETE /api/v1/admin/exercises/:id/thumbnail` removes metadata and schedules object deletion. Exercise create can occur first with a placeholder, then upload; the record is complete because thumbnail is optional.

Later add signed flow endpoints: create intent, upload directly, finalize with checksum/object metadata, and expire abandoned intents.

## Frontend components

`ImageUploadField` provides preview, file-policy text, alt input, progress, replace/remove, retry, and clear errors. It must revoke browser object URLs and not claim success until server finalization. `ExerciseThumbnail`/`MuscleThumbnail` use fixed dimensions to prevent layout shift and a consistent placeholder.

## Authorization and security

Public catalog assets may be readable. Only admins obtain upload/delete rights. Generate server-side keys; block path traversal; do not proxy arbitrary URLs; rate-limit uploads; serve with correct content type, `nosniff`, and immutable caching for content-addressed/unique keys.

## Testing requirements

- Unit: MIME sniffing, dimensions, size, key generation, alt validation, adapter contract
- Integration: local/S3-compatible test adapter put/get/delete and missing object behavior
- Service: database failure after upload cleans/records orphan; replacement deletes only after commit
- API: bad bytes, oversized/dimension-bomb inputs, non-admin denial, successful upload/remove
- Frontend: preview, validation, retry, progress/error state, keyboard operation, placeholder and alt text
- E2E: upload failure does not create an incomplete exercise or overwrite the prior working thumbnail

## Dependencies, sequence, and definition of done

After exercise identity exists, define the adapter contract, implement local storage, validation/transformation, exercise endpoint, UI, object cleanup, then production S3 adapter and operational checks. Done means invalid files never persist; URLs hide internal paths; failures preserve prior data; placeholders and alt text work; both adapters pass the same contract tests; and orphan cleanup is observable.

## Production provider recommendation and open questions

Use an S3-compatible managed service such as Cloudflare R2, Backblaze B2, or Oracle Object Storage through its compatible API where available. Choose based on region latency, egress, lifecycle rules, backups, and credentials—not code shape. Do not mount the VPS filesystem as the durable production image store unless accepting single-host loss and backup burden. Provider, image aspect ratio, and whether transformations run in API or a later worker remain open decisions.
