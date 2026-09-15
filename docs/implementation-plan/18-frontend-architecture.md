# Frontend architecture

## Purpose and recommendation

Build a responsive Next.js App Router application with clear public, authenticated, and admin surfaces. Use Server Components for page-level reads, Server Actions for form and command workflows, and focused local React state for interactive client-only flows.

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
- Server-rendered data is refreshed through navigation and Server Action revalidation. Client-only requests use explicit local loading, error, retry, and cancellation state without a global remote-data cache.
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
- create/edit form with sections: Basic information, Classification, Muscle involvement, Capabilities, and Demand and fatigue; optional approved local or remote image display is read-only in MVP
- `MuscleInvolvementEditor`, score controls/legend, equipment multi-select, optional image preview, error summary, unsaved-change dialog
- Athletic qualities section is not rendered in MVP.

### Authenticated routines

- dashboard command center composed from existing authenticated reads: the
  server-rendered route concurrently resolves authentication, active workout,
  and active adopted-program state, while a focused client component fetches
  the timezone-dependent one-week analytics overview
- the dashboard uses a metrics-first hierarchy: greeting, one-week metrics,
  one compact training-plan card, then recent completed workouts; the header
  does not duplicate the training-plan actions; metrics align with analytics
  terminology: Workouts, Volume, Sets, and Reps
- dashboard actions live in the training-plan card: continuing a workout and
  opening programs or routine details are navigation-only; starting the next
  program occurrence uses the existing start command and navigates to the
  returned workout-session ID; when neither resource is active, the card links
  to workout creation and program discovery
- dashboard sections degrade independently with retry controls; an unknown
  active-workout state never suggests starting another workout; an empty week
  retains truthful zero-valued metric cards and an empty recent-workouts view
- dashboard components are route-colocated, one component per file, and reuse
  installed shadcn primitives without introducing a formal global Atomic Design
  hierarchy or a dashboard-specific backend endpoint
- new/edit/detail pages
- exercise picker, ordered routine exercise cards, prescription fields, duplication/delete dialogs

## Server versus client fetching

Public details and initial lists can fetch from the API in server components with explicit revalidation. Interactive filters hydrate or fetch through query hooks. Avoid fetching the same resource independently on server and client without dehydrating or accepting the duplicate request. Authenticated routine pages can be client fetched initially because cookie forwarding and user-specific caching are clearer; add server prefetch only when UX warrants it.

Use same-origin `/api` in the browser. In production, Vercel's Next.js rewrite
forwards that path to the server-only `API_PROXY_URL` for the Oracle API. Keep
`NEXT_PUBLIC_API_URL` set to the public web origin and never expose internal
container hostnames or server-only credentials in client bundles.

## Forms

Use one form schema/default-value mapper per aggregate. For the exercise form, section navigation shows error counts but does not unmount fields. Muscle assignments use `useFieldArray` with stable IDs. Normalize empty strings to null only for optional fields, preserve zeros, and never use truthiness for score/RIR values.

When the future training-program duration and ordinal-day limits are
implemented, the training-program form must provide proactive, accessible
feedback that states the equivalent maximums of 52 weeks and 364 days. The
client schema may mirror these limits for immediate feedback, while backend
validation remains authoritative. Server-side boundary errors must map back to
the duration or schedule field instead of appearing only as a generic alert.

Submit buttons disable duplicate submission while preserving keyboard focus. On a 422 problem, map field errors; on a non-field error, show an alert. On success, update/invalidate precise cache keys and navigate with a status announcement. Confirm destructive archive/delete actions with resource name.

## Responsive and accessible behavior

- Mobile-first Tailwind layouts and shadcn/ui primitives, customized without breaking semantics.
- Every input has a persistent label, help/error association, and keyboard route.
- Drag-and-drop reorder includes move up/down buttons and announcements.
- Rating color is supplementary to number and label.
- Dialog focus is trapped/restored; error summaries link/focus fields.
- Approved local or remote images have meaningful alt text; decorative placeholders use empty alt where appropriate. Upload controls are post-MVP.
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
