# Frontend architecture

## Purpose and recommendation

Build a responsive Next.js App Router application with clear public, authenticated, and admin surfaces. Use server rendering for public discovery where it improves first load/metadata, and TanStack Query client state for interactive filters, forms, authenticated resources, and mutations.

## Route structure

```text
app/
  (public)/
    exercises/page.tsx
    exercises/[slug]/page.tsx
    muscles/page.tsx
    muscles/[slug]/page.tsx
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
  (app)/
    app/layout.tsx
    app/page.tsx
    app/routines/...
  (admin)/
    admin/layout.tsx
    admin/exercises/...
```

Route-group names are illustrative; final URLs remain `/exercises`, `/muscles`, `/app/routines`, and `/admin/exercises`. Layout guards are UX only. API authorization remains decisive.

## Data ownership and state

- URL search parameters own public list filters, search, sort, and page so results are linkable/back-button safe.
- TanStack Query owns remote client cache. Query keys are centralized factories such as `exerciseKeys.list(filters)` and `routineKeys.detail(id)`.
- React Hook Form owns in-progress form state; Zod gives immediate presentation validation.
- Local component state owns ephemeral UI (dialog open, active form section).
- Do not add Redux/global state without a demonstrated cross-cutting client-state problem.

Backend DTO validation is authoritative. Client Zod schemas may mirror user-facing constraints but should not be imported from Nest/Prisma. Generate response/request types from OpenAPI where practical and map API problems to form field paths.

## Page and component plan

### Public library

- `ExerciseLibraryPage`, `ExerciseFilters`, cards/list, pagination, empty/error/loading states
- `ExerciseDetailPage`, instructions, muscle groups, capability/demand scales and caveats
- `MuscleLibraryPage`, region/group filters, hierarchy cards
- `MuscleDetailPage`, parent/child navigation and image fallback

### Admin exercise management

- list with active/archive filters
- create/edit form with sections: Basic information, Media, Classification, Muscle involvement, Capabilities, Demand and fatigue
- `MuscleInvolvementEditor`, score controls/legend, equipment multi-select, image upload, error summary, unsaved-change dialog
- Athletic qualities section is not rendered in MVP.

### Authenticated routines

- dashboard and routine library
- new/edit/detail pages
- exercise picker, ordered routine exercise cards, prescription fields, duplication/delete dialogs

## Server versus client fetching

Public details and initial lists can fetch from the API in server components with explicit revalidation. Interactive filters hydrate or fetch through query hooks. Avoid fetching the same resource independently on server and client without dehydrating or accepting the duplicate request. Authenticated routine pages can be client fetched initially because cookie forwarding and user-specific caching are clearer; add server prefetch only when UX warrants it.

Use the API origin server-side and same-origin `/api/v1` browser-side. Never expose internal container hostnames in client bundles.

## Forms

Use one form schema/default-value mapper per aggregate. For the exercise form, section navigation shows error counts but does not unmount fields. Muscle assignments use `useFieldArray` with stable IDs. Normalize empty strings to null only for optional fields, preserve zeros, and never use truthiness for score/RIR values.

Submit buttons disable duplicate submission while preserving keyboard focus. On a 422 problem, map field errors; on a non-field error, show an alert. On success, update/invalidate precise cache keys and navigate with a status announcement. Confirm destructive archive/delete actions with resource name.

## Responsive and accessible behavior

- Mobile-first Tailwind layouts and shadcn/ui primitives, customized without breaking semantics.
- Every input has a persistent label, help/error association, and keyboard route.
- Drag-and-drop reorder includes move up/down buttons and announcements.
- Rating color is supplementary to number and label.
- Dialog focus is trapped/restored; error summaries link/focus fields.
- Images have meaningful alt text; decorative placeholders use empty alt where appropriate.
- Tables adapt to cards or horizontal scrolling without hiding actions.
- Target WCAG 2.2 AA for MVP flows.

## Error and auth UX

Create one API client/problem parser. Handle offline/network errors separately from validation. A 401 on an authenticated mutation prompts re-authentication and preserves safe unsaved form state; 403 displays forbidden; concealed 404 shows not found. Error boundaries cover route failures, and component-level query errors have retry.

## Testing

Vitest/RTL covers components, form validation, query/mutation states, cache invalidation, keyboard interactions, and accessibility. MSW supplies contract-shaped responses. Playwright covers public discovery, admin exercise lifecycle, auth, routine lifecycle, responsive critical pages, and two-user isolation. Validate at narrow mobile and desktop viewports.

## Performance

Use `next/image` or a controlled image component with known dimensions, route-level code splitting, debounced search plus explicit URL update, and list projections. Measure bundle size and Core Web Vitals before adding virtualized lists. Avoid importing full icon/chart libraries into common layouts.

## Dependencies, sequence, and definition of done

Create shell/design tokens/API client/query provider first; implement each UI only alongside its API slice. Done means responsive success/loading/empty/error states, keyboard access, typed contract, server-error mapping, tests, and no unauthorized data assumptions.

## Future extensions and open questions

PWA/offline sessions, localization, dark mode, advanced charts, component visual regression, and a dedicated design system package are later. Decide whether public pages use server prefetch/dehydration and which OpenAPI client generator to use during the foundation spike.

